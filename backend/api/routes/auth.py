from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from api.security import verify_password, create_access_token, get_db_connection, get_current_user
import psycopg2
from psycopg2.extras import RealDictCursor

router = APIRouter(prefix="/auth", tags=["auth"])

class LoginRequest(BaseModel):
    username: str
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    role: str

class UserResponse(BaseModel):
    id: int
    username: str
    role: str

@router.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    try:
        conn = get_db_connection()
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("SELECT id, username, hashed_password, role FROM users WHERE username = %s", (request.username,))
            user = cur.fetchone()
            
            if not user or not verify_password(request.password, user['hashed_password']):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Incorrect username or password",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            
            access_token = create_access_token(
                data={"sub": user["username"], "role": user["role"]}
            )
            return {"access_token": access_token, "token_type": "bearer", "role": user["role"]}
    except psycopg2.Error as e:
        raise HTTPException(status_code=500, detail="Database connection error")
    finally:
        if 'conn' in locals():
            conn.close()

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    return {
        "id": current_user["id"],
        "username": current_user["username"],
        "role": current_user["role"]
    }
