import json
import os
import random

EQUIPMENT = ["P-101A", "P-101B", "V-200", "TK-50", "HX-301", "C-400", "B-500", "F-600", "COMP-1", "GEN-2"]

def generate_documents_and_benchmarks():
    docs_dir = "data/sample_documents"
    os.makedirs(f"{docs_dir}/work_orders", exist_ok=True)
    os.makedirs(f"{docs_dir}/manuals", exist_ok=True)
    os.makedirs(f"{docs_dir}/inspection_reports", exist_ok=True)
    os.makedirs(f"{docs_dir}/compliance_docs", exist_ok=True)
    os.makedirs(f"{docs_dir}/incident_reports", exist_ok=True)

    questions = []

    # 1. Work Orders (30)
    for i in range(1, 31):
        tag = random.choice(EQUIPMENT)
        param_val = random.randint(100, 500)
        content = f"Work Order WO-{i}: Equipment {tag} reported failure on 2024-01-{i:02d}. Maintenance found worn seals. Replaced seals and tested at {param_val} PSI. System returned to normal."
        with open(f"{docs_dir}/work_orders/WO-{i}.txt", "w") as f:
            f.write(content)
        questions.append({
            "id": f"Q_WO_{i}",
            "category": "Maintenance",
            "question": f"What was the test pressure for {tag} in WO-{i}?",
            "ground_truth": f"{param_val} PSI"
        })

    # 2. Manuals (20)
    for i in range(1, 21):
        tag = random.choice(EQUIPMENT)
        clearance = random.randint(2, 10)
        content = f"Operating Manual for {tag}. Ensure a minimum clearance of {clearance} meters around the equipment. Normal operating temperature is 85 °C."
        with open(f"{docs_dir}/manuals/Manual_{tag}_{i}.txt", "w") as f:
            f.write(content)
        questions.append({
            "id": f"Q_MAN_{i}",
            "category": "Operation",
            "question": f"What is the minimum clearance required for {tag} according to its manual?",
            "ground_truth": f"{clearance} meters"
        })

    # 3. Inspection Reports (20)
    for i in range(1, 21):
        tag = random.choice(EQUIPMENT)
        thickness = random.uniform(5.0, 15.0)
        content = f"Inspection Report {i} for {tag}. Wall thickness measured at {thickness:.1f} mm. No severe corrosion detected."
        with open(f"{docs_dir}/inspection_reports/IR_{i}.txt", "w") as f:
            f.write(content)
        questions.append({
            "id": f"Q_IR_{i}",
            "category": "Inspection",
            "question": f"What was the measured wall thickness for {tag} in inspection report {i}?",
            "ground_truth": f"{thickness:.1f} mm"
        })

    # 4. Compliance (15)
    for i in range(1, 16):
        std_num = random.randint(100, 200)
        content = f"OISD-{std_num} Compliance Guideline. Fire extinguishers must be inspected every {i} months. Training mandatory annually."
        with open(f"{docs_dir}/compliance_docs/OISD_{std_num}.txt", "w") as f:
            f.write(content)
        questions.append({
            "id": f"Q_COMP_{i}",
            "category": "Compliance",
            "question": f"According to OISD-{std_num}, how often must fire extinguishers be inspected?",
            "ground_truth": f"every {i} months"
        })

    # 5. Incident Reports (15)
    for i in range(1, 16):
        tag = random.choice(EQUIPMENT)
        content = f"Incident Report IN-{i}: A minor leak occurred on {tag} due to over-pressurization. Operator John Doe shut down the valve immediately."
        with open(f"{docs_dir}/incident_reports/IN_{i}.txt", "w") as f:
            f.write(content)
        questions.append({
            "id": f"Q_IN_{i}",
            "category": "Safety",
            "question": f"Who was the operator involved in incident IN-{i} for {tag}?",
            "ground_truth": "John Doe"
        })

    with open("data/realistic_benchmark_questions.json", "w") as f:
        json.dump(questions, f, indent=4)
        
    print(f"Successfully generated 100 documents and {len(questions)} matching benchmark questions!")

if __name__ == "__main__":
    generate_documents_and_benchmarks()
