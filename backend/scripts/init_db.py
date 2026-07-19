import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import psycopg2
from config import settings
from api.security import get_password_hash

def init_db():
    print(f"Connecting to PostgreSQL at {settings.POSTGRES_HOST}:{settings.POSTGRES_PORT}...")
    try:
        conn = psycopg2.connect(
            host=settings.POSTGRES_HOST,
            port=settings.POSTGRES_PORT,
            dbname=settings.POSTGRES_DB,
            user=settings.POSTGRES_USER,
            password=settings.POSTGRES_PASSWORD
        )
        conn.autocommit = True
        
        with conn.cursor() as cur:
            print("Creating users table...")
            cur.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id SERIAL PRIMARY KEY,
                    username VARCHAR(50) UNIQUE NOT NULL,
                    hashed_password VARCHAR(255) NOT NULL,
                    role VARCHAR(20) NOT NULL
                )
            """)
            
            print("Creating equipment table...")
            cur.execute("DROP TABLE IF EXISTS failures")
            cur.execute("DROP TABLE IF EXISTS equipment")
            cur.execute("""
                CREATE TABLE equipment (
                    tag VARCHAR(50) PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    type VARCHAR(100),
                    status VARCHAR(50),
                    properties JSONB
                )
            """)
            
            print("Creating failures table...")
            cur.execute("""
                CREATE TABLE failures (
                    id VARCHAR(50) PRIMARY KEY,
                    equipment_tag VARCHAR(50) REFERENCES equipment(tag),
                    date TIMESTAMP,
                    symptoms TEXT,
                    root_cause TEXT,
                    action TEXT
                )
            """)

            # Create default users
            users_to_create = [
                ("admin", "admin123", "admin"),
                ("engineer", "eng123", "engineer"),
                ("tech", "tech123", "technician"),
                ("viewer", "view123", "viewer")
            ]
            
            for username, plain_pass, role in users_to_create:
                cur.execute("SELECT id FROM users WHERE username = %s", (username,))
                if not cur.fetchone():
                    hashed = get_password_hash(plain_pass)
                    cur.execute(
                        "INSERT INTO users (username, hashed_password, role) VALUES (%s, %s, %s)",
                        (username, hashed, role)
                    )
                    print(f"Created user: {username} ({role})")
                else:
                    print(f"User {username} already exists")
                    
        conn.close()
        print("Database initialization completed successfully.")
    except Exception as e:
        print(f"Failed to initialize database: {e}")

if __name__ == "__main__":
    init_db()
