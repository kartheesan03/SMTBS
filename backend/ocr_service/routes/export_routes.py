from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import io
import datetime

try:
    from docx import Document
    from docx.shared import Pt, Inches
    from docx.enum.text import WD_ALIGN_PARAGRAPH
except ImportError:
    pass

router = APIRouter()

class DocumentMeta(BaseModel):
    type: Optional[str]
    module: Optional[str]
    isRelated: Optional[bool]
    isStructured: Optional[bool]
    tableDetected: Optional[bool]
    confidence: Optional[float]

class TableData(BaseModel):
    title: Optional[str]
    columns: Optional[List[str]]
    rows: Optional[List[Dict[str, Any]]]

class OcrExportRequest(BaseModel):
    success: Optional[bool]
    document: Optional[DocumentMeta]
    tables: Optional[List[TableData]]
    rawText: Optional[str]
    vendor: Optional[Dict[str, Any]]
    invoice: Optional[Dict[str, Any]]
    totals: Optional[Dict[str, Any]]

@router.post("/docx")
async def export_docx(data: OcrExportRequest):
    try:
        doc = Document()
    except NameError:
        raise HTTPException(status_code=500, detail="python-docx is not installed")
        
    doc_type = data.document.type if data.document and data.document.type else 'DOCUMENT'
    is_structured = data.document.isStructured if data.document else False
    
    title = doc.add_heading(f"SMTBMS OCR Result - {str(doc_type).upper()}", 0)
    title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    
    if data.document and data.document.module:
        doc.add_paragraph(f"Module: {data.document.module}")
    doc.add_paragraph(f"Generated on: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    doc.add_paragraph("") # Spacing
    
    if not is_structured:
        # General Document (Unstructured)
        doc.add_heading("Extracted Text", level=1)
        if data.rawText:
            pages = data.rawText.split("--- PAGE")
            for page in pages:
                if page.strip():
                    if "---" in page:
                        doc.add_paragraph(f"--- PAGE{page}")
                    else:
                        doc.add_paragraph(page.strip())
    else:
        # Structured Document
        
        # Header Information (if available)
        details_to_print = {}
        if data.document and getattr(data.document, "details", None):
            details_to_print.update(data.document.details)
        if data.vendor and data.vendor.get("name"):
            details_to_print["Vendor / Party"] = data.vendor["name"]
        if data.invoice:
            if data.invoice.get("number"): details_to_print["Document Number"] = data.invoice["number"]
            if data.invoice.get("date"): details_to_print["Date"] = data.invoice["date"]
            if data.invoice.get("po_number"): details_to_print["PO Number"] = data.invoice["po_number"]
            
        if details_to_print:
            doc.add_heading("Document Information", level=1)
            p = doc.add_paragraph()
            for key, val in details_to_print.items():
                p.add_run(f"{key}: {val}\n")
            doc.add_paragraph("")
        
        # Line Items Tables
        if data.tables and len(data.tables) > 0:
            for tbl_idx, table_data in enumerate(data.tables):
                doc.add_heading(table_data.title or f"Table {tbl_idx + 1}", level=1)
                
                cols = ["#"] + (table_data.columns or [])
                items = table_data.rows or []
                
                if len(cols) == 1 and items:
                    keys = set()
                    for it in items:
                        keys.update([k for k in it.keys() if k not in ("row_number", "confidence")])
                    cols = ["#"] + sorted(list(keys))
                    
                table = doc.add_table(rows=1, cols=len(cols))
                table.style = 'Table Grid'
                hdr_cells = table.rows[0].cells
                for i, col_name in enumerate(cols):
                    hdr_cells[i].text = col_name
                    
                for idx, item in enumerate(items):
                    row_cells = table.add_row().cells
                    row_cells[0].text = str(idx + 1)
                    for i, col_name in enumerate(cols[1:], start=1):
                        row_cells[i].text = str(item.get(col_name, ""))
                        
                doc.add_paragraph("")
                
        # Totals Summary (if available)
        if data.totals:
            doc.add_heading("Totals Summary", level=1)
            t = doc.add_paragraph()
            for key, val in data.totals.items():
                if val and val > 0:
                    t.add_run(f"{key.replace('_', ' ').title()}: {val}\n")
                        
    buffer = io.BytesIO()
    doc.save(buffer)
    buffer.seek(0)
    
    filename = f"SMTBMS_OCR_{doc_type}.docx"
    return StreamingResponse(
        buffer,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@router.post("/txt")
async def export_txt(data: OcrExportRequest, filename: Optional[str] = None):
    text_content = data.rawText or "No text extracted."
    buffer = io.BytesIO(text_content.encode("utf-8"))
    
    if not filename:
        filename = f"SMTBMS_OCR_Extraction.txt"
    return StreamingResponse(
        buffer,
        media_type="text/plain",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

try:
    from reportlab.lib import colors
    from reportlab.lib.pagesizes import letter, landscape
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.enums import TA_CENTER
except ImportError:
    pass

@router.post("/pdf")
async def export_pdf(data: OcrExportRequest, filename: Optional[str] = None):
    try:
        styles = getSampleStyleSheet()
    except NameError:
        raise HTTPException(status_code=500, detail="reportlab is not installed")
        
    doc_type = data.document.type if data.document and data.document.type else 'DOCUMENT'
    is_structured = data.document.isStructured if data.document else False
    
    buffer = io.BytesIO()
    
    # Use landscape if we have structured tables, to fit more columns
    pagesize = landscape(letter) if is_structured else letter
    
    doc = SimpleDocTemplate(buffer, pagesize=pagesize, rightMargin=30, leftMargin=30, topMargin=30, bottomMargin=18)
    elements = []
    
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        alignment=TA_CENTER,
        fontSize=18,
        spaceAfter=20
    )
    
    elements.append(Paragraph(f"SMTBMS OCR Result - {str(doc_type).upper()}", title_style))
    
    if data.document and data.document.module:
        elements.append(Paragraph(f"<b>Module:</b> {data.document.module}", styles['Normal']))
    
    elements.append(Paragraph(f"<b>Generated on:</b> {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", styles['Normal']))
    elements.append(Spacer(1, 15))
    
    if not is_structured:
        # General Document
        elements.append(Paragraph("<b>Extracted Text</b>", styles['Heading2']))
        elements.append(Spacer(1, 10))
        if data.rawText:
            pages = data.rawText.split("--- PAGE")
            for page in pages:
                if page.strip():
                    if "---" in page:
                        elements.append(Paragraph(f"--- PAGE{page}", styles['Normal']))
                    else:
                        for line in page.strip().split('\n'):
                            elements.append(Paragraph(line, styles['Normal']))
    else:
        # Structured Document
        
        # Header Information
        details_to_print = {}
        if data.document and getattr(data.document, "details", None):
            details_to_print.update(data.document.details)
        if data.vendor and data.vendor.get("name"):
            details_to_print["Vendor / Party"] = data.vendor["name"]
        if data.invoice:
            if data.invoice.get("number"): details_to_print["Document Number"] = data.invoice["number"]
            if data.invoice.get("date"): details_to_print["Date"] = data.invoice["date"]
            if data.invoice.get("po_number"): details_to_print["PO Number"] = data.invoice["po_number"]
            
        if details_to_print:
            elements.append(Paragraph("<b>Document Information</b>", styles['Heading2']))
            elements.append(Spacer(1, 5))
            for key, val in details_to_print.items():
                elements.append(Paragraph(f"<b>{key}:</b> {val}", styles['Normal']))
            elements.append(Spacer(1, 15))
            
        # Line Items Tables
        if data.tables and len(data.tables) > 0:
            for tbl_idx, table_data in enumerate(data.tables):
                title = table_data.title or f"Table {tbl_idx + 1}"
                elements.append(Paragraph(f"<b>{title}</b>", styles['Heading2']))
                elements.append(Spacer(1, 10))
                
                cols = ["#"] + (table_data.columns or [])
                items = table_data.rows or []
                
                if len(cols) == 1 and items:
                    keys = set()
                    for it in items:
                        keys.update([k for k in it.keys() if k not in ("row_number", "confidence")])
                    cols = ["#"] + sorted(list(keys))
                
                table_data_matrix = [cols]
                
                for idx, item in enumerate(items):
                    row = [str(idx + 1)]
                    for col_name in cols[1:]:
                        row.append(str(item.get(col_name, "")))
                    table_data_matrix.append(row)
                    
                t = Table(table_data_matrix, repeatRows=1)
                t.setStyle(TableStyle([
                    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#f8fafc')),
                    ('TEXTCOLOR', (0, 0), (-1, 0), colors.HexColor('#475569')),
                    ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                    ('FONTSIZE', (0, 0), (-1, 0), 10),
                    ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                    ('BACKGROUND', (0, 1), (-1, -1), colors.white),
                    ('TEXTCOLOR', (0, 1), (-1, -1), colors.HexColor('#0f172a')),
                    ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
                    ('FONTSIZE', (0, 1), (-1, -1), 9),
                    ('ALIGN', (0, 1), (-1, -1), 'LEFT'),
                    ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#e2e8f0')),
                    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                ]))
                
                elements.append(t)
                elements.append(Spacer(1, 20))
                
        # Totals Summary
        if data.totals:
            elements.append(Paragraph("<b>Totals Summary</b>", styles['Heading2']))
            elements.append(Spacer(1, 10))
            for key, val in data.totals.items():
                if val and val > 0:
                    elements.append(Paragraph(f"<b>{key.replace('_', ' ').title()}:</b> {val}", styles['Normal']))
                    
    doc.build(elements)
    buffer.seek(0)
    
    if not filename:
        filename = f"SMTBMS_OCR_{doc_type}.pdf"
        
    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
