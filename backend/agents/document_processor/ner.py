import re
from typing import List, Set, Dict

try:
    import spacy
except ImportError:
    spacy = None

class IndustrialNER:
    def __init__(self):
        # We will load spaCy model, if available. Otherwise fallback to Regex.
        if spacy is None:
            self.nlp = None
        else:
            try:
                self.nlp = spacy.load("en_core_web_sm")
            except OSError:
                self.nlp = None
            
        # Common equipment tag formats: P-101A, TK-50, V-200, etc.
        self.tag_pattern = re.compile(r'\b[A-Z]{1,3}-\d{1,4}[A-Z]?\b')
        self.parameter_pattern = re.compile(r'(\d+\.?\d*)\s*(PSI|°C|°F|bar|MPa|kg|L|GPM)')
        self.date_patterns = [
            re.compile(r'\b\d{4}-\d{2}-\d{2}\b'),
            re.compile(r'\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b'),
            re.compile(
                r'\b\d{1,2}\s+'
                r'(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|'
                r'Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)'
                r'\s+\d{4}\b',
                re.IGNORECASE,
            ),
            re.compile(
                r'\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|'
                r'Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)'
                r'\s+\d{1,2},?\s+\d{4}\b',
                re.IGNORECASE,
            ),
            re.compile(r'\b(?:Q[1-4]\s+\d{4}|FY\s*\d{4})\b', re.IGNORECASE),
            re.compile(
                r'\b(?:annual|monthly|quarterly|weekly|daily)\s+'
                r'(?:inspection|audit|review|test|training|certification)\b',
                re.IGNORECASE,
            ),
        ]
        self.regulation_patterns = [
            re.compile(r'\b(?:OSHA|29\s*CFR)\s*(?:Part\s*)?\d{4}(?:\.\d+)?(?:\([a-z0-9]+\))*\b', re.IGNORECASE),
            re.compile(r'\b(?:EPA\s*)?40\s*CFR\s*(?:Part\s*)?\d+(?:\.\d+)?\b', re.IGNORECASE),
            re.compile(r'\bOISD(?:[-\s]*(?:STD|RP|GDN|GUIDELINE))?[-\s]*\d{2,4}\b', re.IGNORECASE),
            re.compile(r'\bPESO(?:[-\s]*(?:Rules?|Act|Guidelines?|\d{2,4}))+\b', re.IGNORECASE),
            re.compile(r'\bBIS(?:[-\s]*(?:IS\s*)?\d{2,5})\b', re.IGNORECASE),
            re.compile(r'\b(?:IS|ISO|API|ASME|NFPA|IEC)\s*[-]?\s*[A-Z0-9]{2,}(?:[.\-:]\d+)*(?:\s+[A-ZIVX]+)?\b', re.IGNORECASE),
            re.compile(r'\bFactory\s+Act(?:,?\s*\d{4})?(?:\s+Section\s+\d+[A-Z]?)?\b', re.IGNORECASE),
            re.compile(r'\b(?:Lockout/Tagout|Process Safety Management|Hazard Communication|Confined Spaces?)\b', re.IGNORECASE),
        ]
        self.person_context_pattern = re.compile(
            r'\b(?:prepared|approved|reviewed|inspected|supervisor|manager|engineer|technician|officer|operator)\b',
            re.IGNORECASE,
        )
        self.person_reject_terms = {
            "osha", "niosh", "department", "administration", "safety", "health", "standard",
            "section", "chapter", "appendix", "figure", "table", "page", "revision",
            "hazard", "warning", "caution", "procedure", "manual", "guide", "guidance",
            "lockout", "tagout", "emergency", "training", "inspection", "requirements",
        }
        
    def extract_entities(self, text: str) -> Dict[str, List]:
        """Extract all entity types"""
        return {
            "equipment_tags": self.extract_tags(text),
            "parameters": self.extract_parameters(text),
            "dates": self.extract_dates(text),
            "regulations": self.extract_regulations(text),
            "persons": self.extract_persons(text)
        }
        
    def extract_tags(self, text: str) -> List[str]:
        tags: Set[str] = set()
        
        # 1. Regex Extraction
        regex_matches = self.tag_pattern.findall(text)
        tags.update(regex_matches)
                
        return sorted(list(tags))
        
    def extract_parameters(self, text: str) -> List[Dict[str, str]]:
        """Extract parameters with values and units"""
        matches = self.parameter_pattern.findall(text)
        return [{"value": m[0], "unit": m[1]} for m in matches]
    
    def extract_dates(self, text: str) -> List[str]:
        """Extract explicit dates and recurring procedural date requirements."""
        dates: Set[str] = set()
        for pattern in self.date_patterns:
            dates.update(match.group(0).strip() for match in pattern.finditer(text))
        return sorted(dates, key=lambda value: text.lower().find(value.lower()))
    
    def extract_regulations(self, text: str) -> List[str]:
        """Extract regulation references"""
        regulations: Set[str] = set()
        for pattern in self.regulation_patterns:
            for match in pattern.finditer(text):
                value = re.sub(r'\s+', ' ', match.group(0).strip(" .,:;()[]"))
                if len(value) > 2:
                    regulations.add(value)
        return sorted(regulations, key=lambda value: text.lower().find(value.lower()))
    
    def extract_persons(self, text: str) -> List[str]:
        """Extract person names using spaCy with industrial-document noise filtering."""
        if not self.nlp:
            return []
        
        doc = self.nlp(text)
        persons: Set[str] = set()
        lines = text.splitlines()
        for ent in doc.ents:
            if ent.label_ != "PERSON":
                continue
            name = re.sub(r'\s+', ' ', ent.text.strip(" .,:;()[]"))
            if not self._is_valid_person(name, ent, lines):
                continue
            persons.add(name)
        return sorted(persons, key=lambda value: text.find(value))

    def _is_valid_person(self, name: str, ent, lines: List[str]) -> bool:
        words = name.split()
        lowered = {word.lower().strip(".,:;()[]") for word in words}
        if len(words) > 4 or len(name) < 3:
            return False
        if lowered & self.person_reject_terms:
            return False
        if any(char.isdigit() for char in name):
            return False
        if name.isupper():
            return False

        line = self._line_for_offset(lines, ent.start_char)
        stripped_line = line.strip()
        if stripped_line and stripped_line == stripped_line.upper() and len(stripped_line.split()) > 2:
            return False
        if re.search(r'\b(?:page|section|chapter|appendix|table|figure)\s+\d+\b', stripped_line, re.IGNORECASE):
            return False
        if len(words) == 1 and not self.person_context_pattern.search(stripped_line):
            return False
        return True

    @staticmethod
    def _line_for_offset(lines: List[str], offset: int) -> str:
        cursor = 0
        for line in lines:
            cursor += len(line) + 1
            if offset < cursor:
                return line
        return ""
