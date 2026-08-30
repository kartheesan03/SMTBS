# Start the Python FastAPI OCR Microservice
Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", "cd backend; if (Test-Path .venv\Scripts\activate.ps1) { .\.venv\Scripts\activate.ps1 } elseif (Test-Path ocr_service\venv\Scripts\activate.ps1) { .\ocr_service\venv\Scripts\activate.ps1 }; python main.py" -WindowStyle Normal

# Start the Node.js Backend
Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", "cd backend; npm run dev" -WindowStyle Normal

# Start the React Frontend
Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev" -WindowStyle Normal

Write-Host "All services have been started in separate windows."
Write-Host "Node.js running on port 5000"
Write-Host "React running on port 3000 or 5173"
Write-Host "FastAPI OCR Microservice running on port 8000"
