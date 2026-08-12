import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from services.ocr_parser import detect_table, group_into_lines

# Simulate two "Date Range" headers as they would be OCR'd
test_elements = [
    {'text': 'Report Category', 'x0': 10, 'x1': 120, 'y0': 50, 'y1': 65, 'confidence': 0.99, 'page': 1},
    {'text': 'Configured', 'x0': 125, 'x1': 200, 'y0': 50, 'y1': 65, 'confidence': 0.99, 'page': 1},
    {'text': 'Format', 'x0': 205, 'x1': 260, 'y0': 50, 'y1': 65, 'confidence': 0.99, 'page': 1},
    {'text': 'Date Range', 'x0': 265, 'x1': 330, 'y0': 50, 'y1': 65, 'confidence': 0.99, 'page': 1},
    {'text': 'Date Range', 'x0': 335, 'x1': 400, 'y0': 50, 'y1': 65, 'confidence': 0.99, 'page': 1},
    {'text': 'Generated At', 'x0': 405, 'x1': 490, 'y0': 50, 'y1': 65, 'confidence': 0.99, 'page': 1},
    {'text': 'Auditor', 'x0': 495, 'x1': 550, 'y0': 50, 'y1': 65, 'confidence': 0.99, 'page': 1},
]

lines = group_into_lines(test_elements)
print("Lines detected:", len(lines))
for i, line in enumerate(lines):
    print(f"  Line {i}: {[el['text'] for el in line]}")

title, columns, start_idx, end_idx = detect_table(lines)
print("Start idx:", start_idx)
print("Column keys:", [c['key'] for c in columns])
