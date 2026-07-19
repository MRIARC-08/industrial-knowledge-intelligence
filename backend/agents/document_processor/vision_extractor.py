import os
import base64
from typing import Optional
import fitz  # PyMuPDF
from openai import OpenAI
import logging

logger = logging.getLogger(__name__)

class VisionExtractor:
    """
    Uses an LLM Vision API to extract text and structure from documents 
    where traditional text extraction (like pdfplumber) fails.
    """
    def __init__(self):
        # We initialize the OpenAI client using the env vars
        self.api_key = os.getenv("OPENAI_API_KEY")
        self.base_url = os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1")
        self.model = os.getenv("LLM_MODEL", "gpt-4o") # Use 4o for vision capabilities
        
        # We don't fail immediately on init if key is missing, 
        # so we can gracefully fallback if not configured
        if self.api_key:
            self.client = OpenAI(api_key=self.api_key, base_url=self.base_url)
        else:
            self.client = None

    def extract_text(self, file_path: str) -> str:
        """
        Converts the PDF (or image) into images and sends them to the Vision LLM.
        """
        if not self.client:
            logger.warning("VisionExtractor skipped: OPENAI_API_KEY not found.")
            return ""

        try:
            # 1. Convert PDF pages to base64 images
            base64_images = self._convert_pdf_to_images(file_path)
            
            if not base64_images:
                return ""

            # 2. Extract text from each page via Vision LLM
            extracted_pages = []
            for idx, img_b64 in enumerate(base64_images):
                logger.info(f"Vision processing page {idx+1}/{len(base64_images)}")
                text = self._process_image_with_llm(img_b64)
                if text:
                    extracted_pages.append(text)
            
            return "\n\n".join(extracted_pages)
            
        except Exception as e:
            logger.error(f"Vision extraction failed: {str(e)}")
            return ""

    def _convert_pdf_to_images(self, file_path: str) -> list[str]:
        """Convert each page of a PDF into a base64 encoded PNG string."""
        base64_images = []
        try:
            doc = fitz.open(file_path)
            # Limit to first 10 pages to avoid massive API costs for huge manuals
            # In a production system, we might chunk this or ask the user.
            for page_num in range(min(len(doc), 10)):
                page = doc.load_page(page_num)
                # Zoom in slightly for better OCR resolution (dpi)
                matrix = fitz.Matrix(2.0, 2.0)
                pix = page.get_pixmap(matrix=matrix)
                
                # Get image bytes and encode
                img_bytes = pix.tobytes("png")
                b64_str = base64.b64encode(img_bytes).decode('utf-8')
                base64_images.append(b64_str)
                
            doc.close()
            return base64_images
        except Exception as e:
            logger.error(f"Error converting PDF to images: {str(e)}")
            return []

    def _process_image_with_llm(self, base64_image: str) -> str:
        """Send a single base64 image to the LLM to extract structured text."""
        prompt = (
            "You are an expert industrial document extraction system. "
            "Extract all text, tables, equipment tags, specifications, and parameters from this document page. "
            "Format the output cleanly in Markdown. "
            "Maintain the logical structure (headings, lists, table formats). "
            "Do NOT include any conversational filler (like 'Here is the extracted text'). "
            "If the page is blank or totally illegible, return an empty string."
        )

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": prompt},
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/png;base64,{base64_image}",
                                    "detail": "high"
                                }
                            }
                        ]
                    }
                ],
                max_tokens=2000,
                temperature=0.0
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            logger.error(f"LLM API call failed: {str(e)}")
            return ""
