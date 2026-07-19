import os
import random
from locust import HttpUser, task, between
from dotenv import load_dotenv

load_dotenv()
API_KEY = os.getenv("API_KEY", "hackathon-secret-key-2026")

class IndustrialBrainUser(HttpUser):
    wait_time = between(1, 3)
    
    def get_headers(self):
        return {
            "X-API-Key": API_KEY,
            "X-Forwarded-For": f"10.0.{random.randint(1, 250)}.{random.randint(1, 250)}"
        }

    @task
    def query_equipment(self):
        self.client.post("/api/v1/query", headers=self.get_headers(), json={
            "query": "What is the normal pressure for P-101A?",
            "user_id": f"load_test_user_{random.randint(1, 1000)}",
            "user_role": "engineer"
        })
    
    @task(2)  # 2x weight
    def query_failure(self):
        self.client.post("/api/v1/query", headers=self.get_headers(), json={
            "query": "What causes seal failures in pumps?",
            "user_id": f"load_test_user_{random.randint(1, 1000)}",
            "user_role": "engineer"
        })
