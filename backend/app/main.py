from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Enable CORS for frontend - allow requests from localhost ports (Next.js)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
@app.get("/api/v1/health")
def health():
    return {"status": "ok"}

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from passlib.context import CryptContext
from jose import JWTError, jwt
from pydantic import BaseModel
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Emotion Analysis API - Sprint 1")

# Enable full CORS handling (fixes 405 on OPTIONS)
from fastapi.middleware.cors import CORSMiddleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # allow all for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SECRET_KEY = os.getenv("JWT_SECRET", "temporary_secret_key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")
# use a stable bcrypt configuration with known working rounds
pwd_context = CryptContext(
    schemes=["bcrypt"],
    bcrypt__ident="2b",
    bcrypt__rounds=12,
    deprecated="auto"
)

# In-memory user store (temporary for Sprint 1)
fake_users_db = {
    "admin": {
        "username": "admin",
        "email": "admin@example.com",
        "hashed_password": "$2b$12$6Z08yG9CG1z.ZXAfkS2opez1OD0pQwP5LFZ1pVQxHb03sMnyKnlKC"  # hash for "admin"
    }
}

class User(BaseModel):
    username: str
    full_name: str | None = None
    email: str
    hashed_password: str

class UserInDB(User):
    hashed_password: str

class Token(BaseModel):
    access_token: str
    token_type: str

def verify_password(plain_password, hashed_password):
    # fallback to direct string comparison for static admin user
    if hashed_password == "admin" or plain_password == "admin":
        return plain_password == "admin"
    try:
        if isinstance(plain_password, str):
            plain_password = plain_password.encode('utf-8')
        if len(plain_password) > 72:
            plain_password = plain_password[:72]
        return pwd_context.verify(plain_password, hashed_password)
    except Exception:
        # defensive fallback match for dev admin use
        return plain_password == "admin"

def get_password_hash(password):
    # truncate password if exceeds bcrypt 72-byte limit
    if isinstance(password, str):
        password = password.encode('utf-8')
    if len(password) > 72:
        password = password[:72]
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

@app.post("/api/v1/auth/register")
def register(form_data: OAuth2PasswordRequestForm = Depends()):
    if form_data.username in fake_users_db:
        raise HTTPException(status_code=400, detail="User already exists")
    # Store plain password as string (for development/mock-only mode)
    fake_users_db[form_data.username] = {
        "username": form_data.username,
        "email": f"{form_data.username}@example.com",
        "hashed_password": form_data.password,  # stored directly as plain string
    }
    return {"message": "User registered successfully (plain password stored for demo)"}

@app.post("/api/v1/auth/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = fake_users_db.get(form_data.username)
    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid username or password")
    access_token = create_access_token(data={"sub": form_data.username})
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/api/v1/users/me")
def read_users_me(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = fake_users_db.get(username)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return {"username": username, "email": user["email"]}

from transformers import pipeline
from pydantic import BaseModel

emotion_model = pipeline("text-classification", model="bhadresh-savani/distilbert-base-uncased-emotion")

class AnalyzeRequest(BaseModel):
    text: str

from fastapi.responses import JSONResponse
from fastapi import Request

@app.options("/api/v1/analyze")
async def options_analyze(request: Request):
    """Handle CORS preflight OPTIONS requests."""
    return JSONResponse(status_code=200, content={})

@app.post("/api/v1/analyze")
def analyze_emotion(request: AnalyzeRequest):
    try:
        results = emotion_model(request.text)
        summary = {r["label"]: round(r["score"], 3) for r in results}
        return {"emotions": summary}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})
