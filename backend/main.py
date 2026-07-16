from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List

import models
import schemas
from database import engine, get_db

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Freight Rate Tracker API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", # For local development
        "https://your-app-name.vercel.app" # <-- REPLACE with your actual Vercel URL
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"status": "ok", "service": "freight-rate-tracker"}


@app.get("/rates", response_model=List[schemas.FreightRateOut])
def list_rates(db: Session = Depends(get_db)):
    return db.query(models.FreightRate).order_by(desc(models.FreightRate.valid_date)).all()


@app.post("/rates", response_model=schemas.FreightRateOut, status_code=201)
def create_rate(rate: schemas.FreightRateCreate, db: Session = Depends(get_db)):
    db_rate = models.FreightRate(**rate.model_dump())
    db.add(db_rate)
    db.commit()
    db.refresh(db_rate)
    return db_rate


@app.get("/rates/{rate_id}", response_model=schemas.FreightRateOut)
def get_rate(rate_id: int, db: Session = Depends(get_db)):
    db_rate = db.query(models.FreightRate).filter(models.FreightRate.id == rate_id).first()
    if not db_rate:
        raise HTTPException(status_code=404, detail="Rate not found")
    return db_rate
