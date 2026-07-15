from datetime import date
from pydantic import BaseModel, ConfigDict


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


class FreightRateOut(FreightRateBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
