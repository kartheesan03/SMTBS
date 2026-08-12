$bytes = [System.IO.File]::ReadAllBytes('backend/ocr_service/services/ocr_service.py')
$str = [System.Text.Encoding]::Unicode.GetString($bytes)
$utf8NoBom = New-Object System.Text.UTF8Encoding($False)
[System.IO.File]::WriteAllText('backend/ocr_service/services/ocr_service.py', $str, $utf8NoBom)
