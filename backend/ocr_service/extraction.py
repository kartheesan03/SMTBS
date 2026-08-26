import os
import json
import base64
import mammoth
from typing import cast
from dotenv import load_dotenv
from anthropic import AsyncAnthropic
from anthropic.types import Message
from schemas import ROLE_SCHEMAS

load_dotenv()  # Load ANTHROPIC_API_KEY from .env file

# Ensure ANTHROPIC_API_KEY is available in the environment
anthropic_client = AsyncAnthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

class ExtractionError(Exception):
    pass

async def extract_document(file_bytes: bytes, mime_type: str, role: str) -> list[list[str]]:
    """
    Extracts structured data from a document based on the specified role.
    """
    if role not in ROLE_SCHEMAS:
        raise ValueError(f"Invalid role: {role}")
    
    expected_fields = ROLE_SCHEMAS[role]
    fields_str = ", ".join(expected_fields)
    
    system_prompt = (
        f"You are a strict data extraction assistant. Your task is to extract rows of data matching these exact fields: [{fields_str}].\n"
        "Return ONLY a JSON array of arrays. Each inner array must represent a row of data, with values ordered exactly as the fields requested.\n"
        "Do not include any prose, markdown formatting (like ```json), or keys/dictionaries. Just the raw array of arrays."
    )

    messages = []
    
    if mime_type == "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        # Extract text from DOCX
        import io
        result = mammoth.extract_raw_text(io.BytesIO(file_bytes))
        text_content = result.value
        messages.append({
            "role": "user",
            "content": text_content
        })
    elif mime_type in ["application/pdf", "image/png", "image/jpeg", "image/jpg", "image/webp", "image/tiff"]:
        # Prepare for Anthropic Vision/Document API
        # Note: Anthropic's Messages API currently supports image types natively and PDFs via beta.
        # We will use the standard image block for images and document block for PDFs.
        base64_data = base64.b64encode(file_bytes).decode('utf-8')
        
        if mime_type == "application/pdf":
            # Claude 3.5 Sonnet supports PDF documents via the beta or standard messages API (with specific format)
            # Using the standard base64 document format:
            content_block = {
                "type": "document",
                "source": {
                    "type": "base64",
                    "media_type": "application/pdf",
                    "data": base64_data
                }
            }
        else:
            # Map MIME type to what Anthropic expects if needed
            # Supported images: image/jpeg, image/png, image/gif, image/webp
            media_type = mime_type
            if mime_type in ["image/jpg", "image/tiff"]:
                media_type = "image/jpeg" # Fallback mapping for unsupported precise types
                
            content_block = {
                "type": "image",
                "source": {
                    "type": "base64",
                    "media_type": media_type,
                    "data": base64_data
                }
            }
            
        messages.append({
            "role": "user",
            "content": [
                content_block,
                {"type": "text", "text": f"Extract the data fields: {fields_str}"}
            ]
        })
    else:
        # Fallback to plain text if it's some other parsable text format
        text_content = file_bytes.decode('utf-8', errors='ignore')
        messages.append({
            "role": "user",
            "content": text_content
        })

    output_text: str = ""  # Declared before try so it's always defined in any except handler

    try:
        # Call Anthropic API
        response = cast(
            Message,
            await anthropic_client.messages.create(
                model="claude-3-5-sonnet-20240620",
                max_tokens=2048,
                system=system_prompt,
                messages=messages,
            ),
        )

        output_text = response.content[0].text.strip()  # type: ignore[union-attr]

        # Defensively strip markdown fences if present
        if output_text.startswith("```"):
            lines = output_text.split('\n')
            if lines[0].startswith("```"):
                lines = lines[1:]
            if lines and lines[-1].startswith("```"):
                lines = lines[:-1]
            output_text = "\n".join(lines).strip()

        parsed_data = json.loads(output_text)

        # Validation
        if not isinstance(parsed_data, list):
            raise ExtractionError("Response is not a JSON array")

        for row in parsed_data:
            if not isinstance(row, list):
                raise ExtractionError("Row is not an array")
            if len(row) != len(expected_fields):
                raise ExtractionError(
                    f"Row column count mismatch. Expected {len(expected_fields)}, got {len(row)}."
                )

        return parsed_data

    except json.JSONDecodeError as e:
        raise ExtractionError(
            f"Failed to parse JSON from AI response: {str(e)}\nRaw output: {output_text}"
        )
    except ExtractionError:
        raise
    except Exception as e:
        raise ExtractionError(f"Extraction failed: {str(e)}")
