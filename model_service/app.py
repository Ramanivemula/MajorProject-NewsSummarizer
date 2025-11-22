# model_service/app.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
import torch
import hashlib
import redis
import os

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
cache = redis.from_url(REDIS_URL)

MODEL_NAME = os.getenv("MODEL_NAME", "t5-base")  # change to t5-small for lightweight
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

print("Loading tokenizer and model:", MODEL_NAME)
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = AutoModelForSeq2SeqLM.from_pretrained(MODEL_NAME).to(DEVICE)
model.eval()

app = FastAPI(title="T5 Summarizer Service")

class SummarizeRequest(BaseModel):
    text: str
    max_length: int = 60
    min_length: int = 10
    num_beams: int = 4
    use_cache: bool = True

def cache_key(text, max_length, min_length, num_beams):
    h = hashlib.sha256(text.encode("utf-8")).hexdigest()
    return f"summarize:{h}:{max_length}:{min_length}:{num_beams}"

@app.post("/summarize")
async def summarize(req: SummarizeRequest):
    text = req.text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="Empty text")
    # prefix as in your design: "summarize: <article>"
    input_text = f"summarize: {text}"

    key = cache_key(input_text, req.max_length, req.min_length, req.num_beams)
    if req.use_cache:
        cached = cache.get(key)
        if cached:
            return {"summary": cached.decode("utf-8"), "cached": True}

    # tokenize and generate
    inputs = tokenizer([input_text], return_tensors="pt", truncation=True, padding="longest").to(DEVICE)
    # for long docs, we'll rely on chunking at Node.js side or handle here (see later)
    with torch.no_grad():
        outputs = model.generate(
            **inputs,
            max_length=req.max_length,
            min_length=req.min_length,
            num_beams=req.num_beams,
            early_stopping=True,
            no_repeat_ngram_size=3
        )
    summary = tokenizer.decode(outputs[0], skip_special_tokens=True, clean_up_tokenization_spaces=True)

    if req.use_cache:
        cache.set(key, summary, ex=24*3600)  # cache 24h
    return {"summary": summary, "cached": False}
