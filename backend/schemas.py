from datetime import date
from pydantic import BaseModel, ConfigDict
from typing import Optional

class FreightRateBase(BaseModel):
    origin_port: str
    destination_port: str
    carrier: str
    container_type: str
    rate: float
    currency: str = "USD"
    valid_date: date


class FreightRateCreate(FreightRateBase):
    pass

class FreightRateUpdate(BaseModel):
    origin_port: Optional[str] = None
    destination_port: Optional[str] = None
    carrier: Optional[str] = None
    container_type: Optional[str] = None
    rate: Optional[float] = None
    currency: Optional[str] = None
    valid_date: Optional[date] = None


class FreightRateOut(FreightRateBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    id: int
