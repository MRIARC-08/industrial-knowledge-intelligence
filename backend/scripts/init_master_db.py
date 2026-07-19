import psycopg2
import sys
import os

# Add root to path for config
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import settings

def init_db():
    try:
        print(f"Connecting to PostgreSQL at {settings.POSTGRES_HOST}:{settings.POSTGRES_PORT}...")
        conn = psycopg2.connect(
            host=settings.POSTGRES_HOST,
            port=settings.POSTGRES_PORT,
            dbname=settings.POSTGRES_DB,
            user=settings.POSTGRES_USER,
            password=settings.POSTGRES_PASSWORD
        )
        conn.autocommit = True
        cur = conn.cursor()

        # Drop all tables safely
        print("Dropping existing tables...")
        cur.execute("DROP SCHEMA public CASCADE;")
        cur.execute("CREATE SCHEMA public;")

        # Independent Tables
        print("Creating personnel table...")
        cur.execute("""
            CREATE TABLE personnel (
                emp_id VARCHAR(50) PRIMARY KEY,
                full_name VARCHAR(255) NOT NULL,
                role VARCHAR(255),
                discipline VARCHAR(255),
                reports_to VARCHAR(50),
                phone VARCHAR(100),
                email VARCHAR(255)
            )
        """)

        print("Creating equipment table...")
        cur.execute("""
            CREATE TABLE equipment (
                tag VARCHAR(50) PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                equipment_type VARCHAR(100),
                status VARCHAR(50),
                properties JSONB,
                max_temp DOUBLE PRECISION,
                max_pressure DOUBLE PRECISION,
                max_flow DOUBLE PRECISION
            )
        """)

        print("Creating spare_parts table...")
        cur.execute("""
            CREATE TABLE spare_parts (
                part_number VARCHAR(100) PRIMARY KEY,
                name VARCHAR(255),
                category VARCHAR(100),
                stock_quantity INT,
                reorder_level INT,
                price NUMERIC,
                supplier VARCHAR(255)
            )
        """)
        
        print("Creating purchase_orders table...")
        cur.execute("""
            CREATE TABLE purchase_orders (
                po_number VARCHAR(100) PRIMARY KEY,
                supplier_name VARCHAR(255),
                order_date TIMESTAMP,
                status VARCHAR(50),
                items JSONB
            )
        """)
        
        print("Creating users table...")
        cur.execute("""
            CREATE TABLE users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(255) UNIQUE NOT NULL,
                hashed_password VARCHAR(255) NOT NULL,
                role VARCHAR(50) NOT NULL
            )
        """)

        print("Creating documents table...")
        cur.execute("""
            CREATE TABLE documents (
                id VARCHAR(100) PRIMARY KEY,
                title VARCHAR(255),
                doc_type VARCHAR(100),
                url VARCHAR(500),
                content TEXT
            )
        """)

        # Dependent Tables (Foreign Keys)
        print("Creating work_orders table...")
        cur.execute("""
            CREATE TABLE work_orders (
                wo_id VARCHAR(100) PRIMARY KEY,
                equipment_tag VARCHAR(50) REFERENCES equipment(tag),
                type VARCHAR(50),
                lead_emp_id VARCHAR(50) REFERENCES personnel(emp_id),
                date_executed TIMESTAMP,
                duration_hours NUMERIC,
                description TEXT
            )
        """)

        print("Creating failures table...")
        cur.execute("""
            CREATE TABLE failures (
                id SERIAL PRIMARY KEY,
                equipment_tag VARCHAR(50) REFERENCES equipment(tag),
                date TIMESTAMP,
                symptoms TEXT,
                root_cause TEXT,
                action TEXT
            )
        """)

        print("Creating compliance_gaps table...")
        cur.execute("""
            CREATE TABLE compliance_gaps (
                id SERIAL PRIMARY KEY,
                equipment_tag VARCHAR(50) REFERENCES equipment(tag),
                severity VARCHAR(50),
                regulation VARCHAR(255),
                description TEXT,
                status VARCHAR(50)
            )
        """)

        print("Creating certificates table...")
        cur.execute("""
            CREATE TABLE certificates (
                id SERIAL PRIMARY KEY,
                equipment_tag VARCHAR(50) REFERENCES equipment(tag),
                name VARCHAR(255),
                standard VARCHAR(255),
                expiry TIMESTAMP,
                status VARCHAR(50)
            )
        """)

        cur.close()
        conn.close()
        print("Database schema successfully recreated!")

    except Exception as e:
        print(f"Failed to initialize database: {e}")

if __name__ == "__main__":
    init_db()
