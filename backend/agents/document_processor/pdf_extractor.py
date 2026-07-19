import pdfplumber
import re
import logging
from .vision_extractor import VisionExtractor

logger = logging.getLogger(__name__)

class PDFExtractor:
    def __init__(self):
        self.vision_extractor = VisionExtractor()
        
    def extract_text(self, file_path: str) -> str:
        extracted_text = []
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                text = page.extract_text()
                if text:
                    extracted_text.append(text)
        
        full_text = "\n".join(extracted_text)
        cleaned_text = self._clean_text(full_text)
        
        # If the document is essentially empty (e.g., scanned images), 
        # fallback to the VisionExtractor for OCR/Parsing
        if len(cleaned_text.strip()) < 50:
            logger.info(f"Insufficient text found in {file_path} ({len(cleaned_text)} chars). Falling back to VisionExtractor.")
            vision_text = self.vision_extractor.extract_text(file_path)
            if vision_text:
                return vision_text
                
        return cleaned_text
        
    def _clean_text(self, text: str) -> str:
        # Remove multiple newlines and excessive whitespace
        text = re.sub(r'\n{3,}', '\n\n', text)
        text = re.sub(r' {2,}', ' ', text)
        return text.strip()
