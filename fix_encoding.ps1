$text = [System.IO.File]::ReadAllText('backend/ocr_service/services/ocr_service.py', [System.Text.Encoding]::Unicode)
$utf8NoBom = New-Object System.Text.UTF8Encoding($False)
[System.IO.File]::WriteAllText('backend/ocr_service/services/ocr_service.py', $text, $utf8NoBom)
