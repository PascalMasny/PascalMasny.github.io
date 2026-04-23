from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from .models import Base, Artwork
from config import DB_PATH, CATALOG_PATH
import json

_engine = None
SessionLocal = None


def init_db():
    global _engine, SessionLocal
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    _engine = create_engine(f"sqlite:///{DB_PATH}", connect_args={"check_same_thread": False})
    Base.metadata.create_all(_engine)
    SessionLocal = sessionmaker(bind=_engine)
    _seed_artworks()


def get_session():
    if SessionLocal is None:
        init_db()
    return SessionLocal()


def _seed_artworks():
    if not CATALOG_PATH.exists():
        return
    session = SessionLocal()
    try:
        with open(CATALOG_PATH) as f:
            artworks = json.load(f)
        for a in artworks:
            existing = session.query(Artwork).filter_by(slug=a["slug"]).first()
            if not existing:
                session.add(Artwork(**a))
        session.commit()
    finally:
        session.close()
