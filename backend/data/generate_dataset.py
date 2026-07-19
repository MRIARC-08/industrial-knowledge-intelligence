import json
import os
import random

# Synthetic Data Setup
EQUIPMENT_TAGS = ["P-101A", "P-101B", "V-200", "TK-50", "HX-301", "C-400"]
PARAMETERS = ["120 PSI", "85 °C", "300 GPM", "250 bar", "90 °C", "45 PSI"]
REGULATIONS = ["OISD-116", "PESO-2023", "BIS-144", "Factory Act-1948"]
PEOPLE = ["John Doe", "Alice Smith", "Bob Builder", "Eve Engineer"]

def generate_work_orders():
    orders = []
    for i in range(10):
        tag = random.choice(EQUIPMENT_TAGS)
        order = {
            "work_order_id": f"WO-{1000 + i}",
            "date": f"2023-{random.randint(1,12):02d}-{random.randint(1,28):02d}",
            "equipment_tag": tag,
            "reported_issue": f"Vibration and high temperature near {tag}. Pressure dropped to {random.choice(PARAMETERS)}.",
            "root_cause": "Seal failure due to worn out bearing.",
            "action_taken": f"Replaced seal and recalibrated as per {random.choice(REGULATIONS)}.",
            "technician": random.choice(PEOPLE)
        }
        orders.append(order)
    return orders

def generate_benchmark_questions():
    questions = []
    # RAG Questions
    for i in range(15):
        q = {
            "id": f"Q_{i+1}",
            "category": "Retrieval (RAG)",
            "question": f"What is the maximum operating parameter for {random.choice(EQUIPMENT_TAGS)}?",
            "ground_truth": f"The maximum parameter is {random.choice(PARAMETERS)}."
        }
        questions.append(q)
    
    # RCA Questions
    for i in range(15):
        q = {
            "id": f"Q_{i+16}",
            "category": "Knowledge Graph (RCA)",
            "question": f"How many times did {random.choice(EQUIPMENT_TAGS)} fail last year due to seal leaks?",
            "ground_truth": f"It failed {random.randint(1,5)} times."
        }
        questions.append(q)
        
    # Compliance Questions
    for i in range(10):
        q = {
            "id": f"Q_{i+31}",
            "category": "Compliance",
            "question": f"According to {random.choice(REGULATIONS)}, what is the clearance required?",
            "ground_truth": "A minimum clearance of 3 meters is required."
        }
        questions.append(q)
        
    # Troubleshooting Questions
    for i in range(10):
        q = {
            "id": f"Q_{i+41}",
            "category": "Troubleshooting",
            "question": f"If vibration is high on {random.choice(EQUIPMENT_TAGS)}, what are the first checks?",
            "ground_truth": "Check alignment, inspect bearings, and verify flow rates."
        }
        questions.append(q)
        
    return questions

def generate_sample_documents():
    os.makedirs("data/sample_documents", exist_ok=True)
    
    docs = {
        "OISD_116_Mock.txt": "OISD-116 standard specifies that storage tanks like TK-50 must have a minimum clearance of 3 meters from adjacent equipment. Operating temperature should not exceed 85 °C.",
        "Pump_Manual_P101A.txt": "Centrifugal Pump P-101A Operational Manual. Normal discharge pressure is 120 PSI. If pressure drops below 45 PSI, check for seal leaks or cavitation.",
        "Incident_Report_V200.txt": "Incident Report for Vessel V-200. Date: 2023-11-15. Vessel pressure spiked to 250 bar. Investigation revealed a blocked relief valve. Supervisor John Doe authorized immediate shutdown."
    }
    
    for filename, content in docs.items():
        with open(f"data/sample_documents/{filename}", "w") as f:
            f.write(content)

if __name__ == "__main__":
    os.makedirs("data", exist_ok=True)
    
    with open("data/synthetic_work_orders.json", "w") as f:
        json.dump(generate_work_orders(), f, indent=4)
        
    with open("data/benchmark_questions.json", "w") as f:
        json.dump(generate_benchmark_questions(), f, indent=4)
        
    generate_sample_documents()
    print("Dataset generation complete!")
