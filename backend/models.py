from sqlalchemy import Column, Integer, String, Float, Date
from database import Base


class FreightRate(Base):
    __tablename__ = "freight_rates"

    id = Column(Integer, primary_key=True, index=True)
    origin_port = Column(String, nullable=False)
    destination_port = Column(String, nullable=False)
    carrier = Column(String, nullable=False)
    container_type = Column(String, nullable=False)  # e.g. 20GP, 40GP, 40HC
    rate = Column(Float, nullable=False)
    currency = Column(String, default="USD")
    valid_date = Column(Date, nullable=False)
