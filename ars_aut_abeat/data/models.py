from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import declarative_base
from datetime import datetime, timezone

Base = declarative_base()


def _utcnow():
    return datetime.now(timezone.utc)


class Artwork(Base):
    __tablename__ = "artworks"

    id = Column(Integer, primary_key=True)
    slug = Column(String, unique=True, nullable=False)
    title = Column(String, nullable=False)
    artist = Column(String)
    year = Column(String)
    image_path = Column(String, nullable=False)
    description = Column(Text)
    added_at = Column(DateTime, default=_utcnow)


class Viewing(Base):
    __tablename__ = "viewings"

    id = Column(Integer, primary_key=True)
    artwork_id = Column(Integer, ForeignKey("artworks.id"))
    session_id = Column(String, nullable=False)
    timestamp = Column(DateTime, default=_utcnow)
    duration_seconds = Column(Float)
    emotion_json = Column(Text)  # JSON blob of averaged probabilities
    dominant_emotion = Column(String)
    verdict = Column(String)  # 'VALLIS' | 'LIMEN' | 'FIRMA'
    num_faces_in_frame = Column(Integer, default=1)
