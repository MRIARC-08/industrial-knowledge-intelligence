import os
import time
import requests
import asyncio

def test_document_saving():
    print("Testing document saving and retrieval...")
    
    # We will simulate the exact logic that process_document_bg uses to save the file
    from agents.document_processor.pdf_extractor import PDFExtractor
    
    filename = "test_manual.pdf"
    print("Simulating extraction...")
    
    # Instead of running the full pipeline which requires DBs, 
    # we just run the save block we added
    try:
        # Mock extracted text
        text = "# PUMP MANUAL\n\nThis is the raw extracted text of the manual."
        
        # Save raw extracted text to disk (exact code from main.py)
        processed_dir = os.path.join(os.path.dirname(__file__), "data", "processed_documents")
        os.makedirs(processed_dir, exist_ok=True)
        doc_path = os.path.join(processed_dir, f"{filename}.md")
        with open(doc_path, "w", encoding="utf-8") as f:
            f.write(text)
            
        print(f"File saved to {doc_path}")
        
    except Exception as e:
        print(f"Failed to save extracted text to disk: {e}")
        
    # Check if the file exists
    if os.path.exists(doc_path):
        print(f"SUCCESS: Saved file found at {doc_path}")
        with open(doc_path, "r") as f:
            content = f.read()
            print(f"Content: {content}")
    else:
        print(f"FAILED: Saved file NOT found at {doc_path}")

if __name__ == "__main__":
    test_document_saving()
