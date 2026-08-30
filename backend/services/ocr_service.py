import easyocr
import cv2
import numpy as np
import traceback
import base64

class OCRService:
    def __init__(self):
        # Initialize EasyOCR reader
        self.reader = easyocr.Reader(['en'], gpu=False)

    def determine_document_type(self, text: str) -> str:
        text_lower = text.lower()
        if 'invoice' in text_lower: return 'invoice'
        if 'receipt' in text_lower: return 'receipt'
        if 'bill' in text_lower: return 'bill'
        if 'purchase order' in text_lower or 'po number' in text_lower: return 'purchase order'
        if 'quotation' in text_lower or 'quote' in text_lower: return 'quotation'
        return 'General'

    def extract_fields_and_totals(self, lines: list):
        fields = {}
        totals = {}
        
        for line in lines:
            line_text = " ".join([i['text'] for i in line]).lower()
            original_text = " ".join([i['text'] for i in line])
            
            # Simple heuristic for Invoice / Date
            if 'invoice' in line_text and 'no' in line_text:
                parts = original_text.split(':')
                if len(parts) > 1: fields['invoice_number'] = parts[1].strip()
            if 'date' in line_text and ':' in line_text:
                parts = original_text.split(':')
                if len(parts) > 1: fields['date'] = parts[1].strip()
                
            # Totals
            if 'subtotal' in line_text or 'sub total' in line_text:
                parts = line_text.split(' ')
                totals['subtotal'] = parts[-1].strip()
            if 'tax' in line_text or 'gst' in line_text:
                parts = line_text.split(' ')
                totals['tax'] = parts[-1].strip()
            if 'total' in line_text and 'sub' not in line_text:
                parts = line_text.split(' ')
                totals['total'] = parts[-1].strip()
                
        return fields, totals

    def process_region(self, crop, text, conf, is_small, is_blurry, is_faded):
        """Run multiple OCR passes on difficult regions and pick the best evidence-supported text.
           Only use character brackets [X/Y] if characters genuinely cannot be distinguished.
        """
        candidates = [(text, conf)]
        
        # PASS 2: Upscale & Sharpen (for small/blurry)
        if is_small or is_blurry:
            scale = 2.5 if is_small else 1.5
            upscaled = cv2.resize(crop, None, fx=scale, fy=scale, interpolation=cv2.INTER_CUBIC)
            sharpen_kernel = np.array([[-1,-1,-1], [-1,9,-1], [-1,-1,-1]])
            sharpened = cv2.filter2D(upscaled, -1, sharpen_kernel)
            res_sharp = self.reader.recognize(sharpened, detail=1, decoder='greedy')
            if res_sharp and len(res_sharp) > 0 and len(res_sharp[0]) > 2:
                candidates.append((res_sharp[0][1], res_sharp[0][2]))
                
        # PASS 3: CLAHE (for faded/low contrast)
        if is_faded or is_blurry:
            scale = 1.5
            upscaled = cv2.resize(crop, None, fx=scale, fy=scale, interpolation=cv2.INTER_CUBIC)
            clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
            if len(upscaled.shape) == 3:
                gray_up = cv2.cvtColor(upscaled, cv2.COLOR_BGR2GRAY)
            else:
                gray_up = upscaled
            cl1 = clahe.apply(gray_up)
            _, bin_otsu = cv2.threshold(cl1, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
            res_bin = self.reader.recognize(bin_otsu, detail=1, decoder='greedy')
            if res_bin and len(res_bin) > 0 and len(res_bin[0]) > 2:
                candidates.append((res_bin[0][1], res_bin[0][2]))
                
        # Sort candidates by confidence
        candidates.sort(key=lambda x: x[1], reverse=True)
        best_text, best_conf = candidates[0]
        
        # If the best result is highly confident or there's only one valid result, use it directly
        if best_conf > 0.85 or len(candidates) == 1:
            return best_text, best_conf
            
        # If the top two candidates are very close in confidence but differ in text, mark ambiguity
        second_best_text, second_best_conf = candidates[1]
        
        # Only align if they are same length and confidence gap is extremely small (< 0.05) and overall confidence is somewhat low
        if len(best_text) == len(second_best_text) and best_text != second_best_text and (best_conf - second_best_conf) < 0.05 and best_conf < 0.8:
            final_word = []
            for i in range(len(best_text)):
                if best_text[i] == second_best_text[i]:
                    final_word.append(best_text[i])
                else:
                    final_word.append(f"[{best_text[i]}/{second_best_text[i]}]")
            return "".join(final_word), best_conf
            
        return best_text, best_conf

    def extract_text(self, image_path: str) -> dict:
        try:
            img = cv2.imread(image_path)
            if img is None: raise ValueError("Invalid image")
            
            # 1. Image Quality & Orientation (Deskew)
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            coords = np.column_stack(np.where(gray > 0))
            if len(coords) == 0:
                 return {"text": "", "rows": [], "columns": [], "confidence": 0, "qualityWarning": True}
            
            angle = cv2.minAreaRect(coords)[-1]
            if angle < -45: angle = -(90 + angle)
            else: angle = -angle
            (h, w) = gray.shape[:2]
            center = (w // 2, h // 2)
            M = cv2.getRotationMatrix2D(center, angle, 1.0)
            deskewed = cv2.warpAffine(gray, M, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)
            
            quality_warning = False
            results = []
            
            # 2. Text Region Detection & Baseline Recognition (Batched for Speed)
            raw_results = self.reader.readtext(deskewed)
            
            if not raw_results:
                return {"text": "", "rows": [], "columns": [], "confidence": 0, "qualityWarning": True}

            # 3. Targeted Region Enhancement
            for bbox, text, conf in raw_results:
                tl, tr, br, bl = bbox
                x_min = int(min(tl[0], bl[0]))
                x_max = int(max(tr[0], br[0]))
                y_min = int(min(tl[1], tr[1]))
                y_max = int(max(bl[1], br[1]))
                
                height = y_max - y_min
                is_small = height < 20
                
                # Check if enhancement is needed based on confidence and size
                if conf < 0.85 or is_small:
                    pad_x, pad_y = max(5, int(height*0.2)), max(5, int(height*0.2))
                    cx_min, cy_min = max(0, x_min - pad_x), max(0, y_min - pad_y)
                    cx_max, cy_max = min(w, x_max + pad_x), min(h, y_max + pad_y)
                    crop = deskewed[cy_min:cy_max, cx_min:cx_max]
                    
                    if crop.size > 0:
                        var_lap = cv2.Laplacian(crop, cv2.CV_64F).var()
                        is_blurry = var_lap < 100 or conf < 0.6
                        contrast = crop.std()
                        is_faded = contrast < 40 or conf < 0.6
                        
                        quality_warning = True
                        text, conf = self.process_region(crop, text, conf, is_small, is_blurry, is_faded)
                
                results.append((bbox, text, conf))

            if not results:
                return {"text": "", "rows": [], "columns": [], "confidence": 0, "qualityWarning": True}

            avg_confidence = sum([res[2] for res in results]) / len(results)

            # 4. Spatial Grouping & Dynamic Table Generation
            items = []
            for bbox, text, conf in results:
                tl, tr, br, bl = bbox
                x_min, y_min = min(tl[0], bl[0]), min(tl[1], tr[1])
                x_max, y_max = max(tr[0], br[0]), max(bl[1], br[1])
                items.append({
                    "text": text, "cx": (x_min + x_max) / 2, "cy": (y_min + y_max) / 2,
                    "x_min": x_min, "x_max": x_max, "y_min": y_min, "y_max": y_max,
                    "height": y_max - y_min, "conf": conf
                })

            # Sort items top-to-bottom
            items.sort(key=lambda item: item['cy'])
            lines = []
            current_line = []
            line_y_thresh = 0

            # Group into lines
            for item in items:
                if not current_line:
                    current_line.append(item)
                    line_y_thresh = max(10, item['height'] * 0.4)
                else:
                    avg_cy = sum([i['cy'] for i in current_line]) / len(current_line)
                    if abs(item['cy'] - avg_cy) < line_y_thresh:
                        current_line.append(item)
                    else:
                        current_line.sort(key=lambda i: i['cx'])
                        lines.append(current_line)
                        current_line = [item]
                        line_y_thresh = max(10, item['height'] * 0.4)
            
            if current_line:
                current_line.sort(key=lambda i: i['cx'])
                lines.append(current_line)

            raw_text_full = "\n".join([" ".join([item['text'] for item in line]) for line in lines])
            
            # 5. Table Layout Analysis
            rows = []
            columns = []
            
            # Find the max number of items in any line to see if a multi-column table exists
            max_cols = max([len(line) for line in lines] + [1])
            
            # Use X-coordinate clustering to form columns, regardless of headers
            if max_cols >= 3:
                # We likely have a table, let's create a dynamic grid
                # Collect all x-centers to form column clusters
                all_cx = [item['cx'] for line in lines for item in line]
                all_cx.sort()
                
                # Cluster the cx values (e.g. within 50 pixels of each other)
                clusters = []
                for cx in all_cx:
                    if not clusters:
                        clusters.append([cx])
                    else:
                        if cx - clusters[-1][-1] < 50:
                            clusters[-1].append(cx)
                        else:
                            clusters.append([cx])
                            
                col_centers = [sum(cluster)/len(cluster) for cluster in clusters]
                
                # Generate column headers based on position
                for i, cx in enumerate(col_centers):
                    columns.append(f"Column_{i+1}")
                    
                # Map items to these columns
                for line in lines:
                    if len(line) < 2: continue # skip pure headers/footers
                    row_data = {}
                    for item in line:
                        # Find closest column
                        closest_col_idx = min(range(len(col_centers)), key=lambda i: abs(col_centers[i] - item['cx']))
                        col_name = f"Column_{closest_col_idx+1}"
                        if col_name in row_data:
                            row_data[col_name] += " " + item['text']
                        else:
                            row_data[col_name] = item['text']
                    
                    if row_data:
                        rows.append(row_data)
                        
            else:
                # Key Value fallback if no table-like structure exists
                columns = ["Field", "Value"]
                for line in lines:
                    line_text = " ".join([i['text'] for i in line])
                    if ':' in line_text:
                        parts = line_text.split(':', 1)
                        if len(parts) == 2 and parts[1].strip():
                            rows.append({"Field": parts[0].strip(), "Value": parts[1].strip()})
                        else:
                            rows.append({"Field": line_text.strip(), "Value": ""})
                    else:
                        if len(line) >= 2:
                            rows.append({"Field": line[0]['text'], "Value": " ".join([i['text'] for i in line[1:]])})
                        else:
                            rows.append({"Field": line_text.strip(), "Value": ""})

            doc_type = self.determine_document_type(raw_text_full)
            fields, totals = self.extract_fields_and_totals(lines)

            structured_doc = {
                "document_type": doc_type,
                "confidence": avg_confidence,
                "fields": fields,
                "columns": columns,
                "rows": rows,
                "totals": totals,
                "warnings": ["Low quality regions detected and enhanced"] if quality_warning else []
            }
            
            _, buffer = cv2.imencode('.jpg', deskewed)
            structured_doc["processed_image_base64"] = base64.b64encode(buffer).decode('utf-8')
            
            return structured_doc

        except Exception as e:
            traceback.print_exc()
            raise Exception(f"OCR processing failed: {str(e)}")

ocr_service = OCRService()

def extract_text(image_path: str) -> dict:
    return ocr_service.extract_text(image_path)
