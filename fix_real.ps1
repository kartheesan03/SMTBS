# Fetch the original file from the commit where it was added
git show c04f1a2e:backend/ocr_service/services/ocr_service.py > temp_ocr_service.bin

# The output from git show might be raw bytes. 
# Read it as bytes
$bytes = [System.IO.File]::ReadAllBytes("temp_ocr_service.bin")

# Check if it has a UTF-16 LE BOM (FF FE) or just null bytes
# We know it has null bytes, so let's decode it as Unicode (UTF-16 LE)
$text = [System.Text.Encoding]::Unicode.GetString($bytes)

# If the first character is not 'i' (for import), it might be UTF-8. 
# But let's assume it's UTF-16 because of the error.
# Write it back as UTF-8 without BOM
$utf8NoBom = New-Object System.Text.UTF8Encoding($False)
[System.IO.File]::WriteAllText("backend/ocr_service/services/ocr_service.py", $text, $utf8NoBom)
