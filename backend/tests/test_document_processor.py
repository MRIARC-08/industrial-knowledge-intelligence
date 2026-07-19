import unittest
from unittest.mock import patch, MagicMock
from agents.document_processor.pdf_extractor import PDFExtractor
from agents.document_processor.ner import IndustrialNER
from agents.document_processor.chunker import SemanticChunker

class TestDocumentProcessor(unittest.TestCase):

    def setUp(self):
        self.ner = IndustrialNER()
        self.chunker = SemanticChunker(chunk_size=50, chunk_overlap=10)
        
    def test_ner_extraction(self):
        text = "The pump P-101A was inspected yesterday. Valve V-200 requires maintenance, as well as TK-50."
        tags = self.ner.extract_tags(text)
        self.assertEqual(len(tags), 3)
        self.assertIn("P-101A", tags)
        self.assertIn("V-200", tags)
        self.assertIn("TK-50", tags)

    def test_date_extraction_handles_safety_document_formats(self):
        text = (
            "Annual inspection must be completed before March 15, 2026. "
            "The review was closed on 12 Jul 2026 and retraining is due 2026-08-01. "
            "Quarterly audit records for Q2 2026 are retained."
        )
        dates = self.ner.extract_dates(text)
        self.assertIn("March 15, 2026", dates)
        self.assertIn("12 Jul 2026", dates)
        self.assertIn("2026-08-01", dates)
        self.assertIn("Quarterly audit", dates)
        self.assertIn("Q2 2026", dates)

    def test_regulation_extraction_returns_full_references(self):
        text = (
            "Follow OSHA 1910.147 for lockout/tagout, 29 CFR 1910.119 for PSM, "
            "OISD-STD-116 tank spacing, BIS IS 14489, Factory Act Section 36, "
            "and API 570 inspection rules."
        )
        regulations = self.ner.extract_regulations(text)
        self.assertIn("OSHA 1910.147", regulations)
        self.assertIn("29 CFR 1910.119", regulations)
        self.assertIn("OISD-STD-116", regulations)
        self.assertIn("BIS IS 14489", regulations)
        self.assertIn("Factory Act Section 36", regulations)
        # API 570 may be extracted as "API 570" or "API 570 inspection"
        self.assertTrue(any("API 570" in reg for reg in regulations))

    def test_person_extraction_filters_header_false_positives(self):
        class FakeEntity:
            def __init__(self, text, start_char):
                self.text = text
                self.start_char = start_char
                self.label_ = "PERSON"

        text = (
            "OCCUPATIONAL SAFETY AND HEALTH ADMINISTRATION\n"
            "LOCKOUT TAGOUT PROCEDURE MANUAL\n"
            "Prepared by Priya Sharma, Safety Officer\n"
            "Reviewed by Arjun Mehta\n"
        )
        fake_doc = MagicMock()
        fake_doc.ents = [
            FakeEntity("Occupational Safety", text.index("OCCUPATIONAL")),
            FakeEntity("Lockout Tagout", text.index("LOCKOUT")),
            FakeEntity("Priya Sharma", text.index("Priya")),
            FakeEntity("Arjun Mehta", text.index("Arjun")),
        ]
        self.ner.nlp = MagicMock(return_value=fake_doc)

        persons = self.ner.extract_persons(text)
        self.assertEqual(persons, ["Priya Sharma", "Arjun Mehta"])
        
    def test_chunker(self):
        text = "This is a sentence.\n\nThis is another sentence that is quite long and should be split."
        chunks = self.chunker.chunk_document(text)
        self.assertGreater(len(chunks), 1)
        self.assertTrue(any("This is a sentence" in chunk for chunk in chunks))
        
    @patch('pdfplumber.open')
    def test_pdf_extractor(self, mock_pdf_open):
        # Mock pdfplumber behavior
        mock_pdf = MagicMock()
        mock_page = MagicMock()
        mock_page.extract_text.return_value = "Sample text from P-101A.\n\n  Needs maintenance."
        mock_pdf.pages = [mock_page]
        mock_pdf_open.return_value.__enter__.return_value = mock_pdf
        
        extractor = PDFExtractor()
        text = extractor.extract_text("dummy.pdf")
        
        self.assertIn("Sample text from P-101A.", text)
        self.assertIn("Needs maintenance.", text)
        self.assertNotIn("  ", text) # Check if cleaning worked
