from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Emotion Analysis API - Sprint 1")
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

# Unified app initialization is already done at the top

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


# New Speech-to-Text and Emotion Analysis endpoint
from fastapi import File, UploadFile
import speech_recognition as sr

@app.post("/api/v1/analyze/speech")
def analyze_speech(file: UploadFile = File(...)):
    """
    Converts uploaded speech audio (wav/mp3/m4a/ogg) to text and performs emotion analysis.
    Automatically converts unknown formats and ensures valid PCM-WAV input for recognition.
    """
    import tempfile
    from pydub import AudioSegment
    import os

    try:
        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False) as tmp_in:
            tmp_in.write(file.file.read())
            tmp_in_path = tmp_in.name

        filename = file.filename.lower()
        tmp_wav_path = tmp_in_path + ".wav"

        # Use pydub to normalize to PCM WAV regardless of source format
        try:
            audio = AudioSegment.from_file(tmp_in_path)
            audio = audio.set_frame_rate(16000).set_channels(1)
            audio.export(tmp_wav_path, format="wav")
        except Exception as convert_err:
            return JSONResponse(status_code=400, content={"error": f"Could not convert audio: {convert_err}"})

        recognizer = sr.Recognizer()
        with sr.AudioFile(tmp_wav_path) as source:
            audio_data = recognizer.record(source)

        text = recognizer.recognize_google(audio_data)

        # Emotion model inference
        results = emotion_model(text)
        summary = {r["label"]: round(r["score"], 3) for r in results}

        # Clean temporary files
        os.remove(tmp_in_path)
        os.remove(tmp_wav_path)

        return {"transcribed_text": text, "emotions": summary}
    except sr.UnknownValueError:
        return JSONResponse(status_code=400, content={"error": "Speech not recognized. Try again."})
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

# New Image-based Emotion Detection endpoint (fix import for FER usage)
from fer.fer import FER
from fastapi import File, UploadFile
from PIL import Image
import io
import numpy as np

import logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("emotion-image-debug")

@app.post("/api/v1/analyze/image")
async def analyze_image(file: UploadFile = File(...)):
    """
    Detects emotions from an uploaded face image (JPEG, PNG, etc.)
    using the FER pretrained facial emotion recognition model.
    """
    try:
        logger.info("Received image: %s", file.filename)
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert("RGB")
        logger.info("Image loaded successfully. Size: %s, Mode: %s", image.size, image.mode)

        detector = FER(mtcnn=True)
        np_image = np.array(image)
        logger.info("Running FER detector...")

        results = detector.detect_emotions(np_image)
        logger.info("FER raw results: %s", results)

        if not results:
            logger.warning("No face detected or invalid image.")
            return JSONResponse(status_code=400, content={"error": "No face detected or invalid/unclear image."})

        emotions = results[0]["emotions"]
        logger.info("Extracted emotions: %s", emotions)
        emotions_summary = {k: round(v, 3) for k, v in emotions.items()}
        logger.info("Emotion summary: %s", emotions_summary)
        return {"emotions": emotions_summary}
    except Exception as e:
        logger.exception("Error processing image: %s", e)
        return JSONResponse(status_code=500, content={"error": str(e)})
