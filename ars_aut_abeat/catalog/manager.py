import streamlit as st
from pathlib import Path
from sqlalchemy import func
from config import UNCANNY_OG_DIR, UNCANNY_20_DIR, UNCANNY_60_DIR, UNCANNY_80_DIR
from data.db import get_session
from data.models import Artwork, Viewing


@st.cache_resource(ttl=300)
def get_catalog_manager():
    return CatalogManager()


def _parse_stem(stem: str) -> tuple[str, str]:
    """'Bronze_portrait_bust_255215' → (slug, 'Bronze portrait bust')."""
    parts = stem.rsplit("_", 1)
    if len(parts) == 2 and parts[1].isdigit():
        title = parts[0].replace("_", " ").strip()
    else:
        title = stem.replace("_", " ").strip()
    return stem, title


class CatalogManager:
    def __init__(self):
        self._artworks: list[dict] = []
        self._load()

    def _load(self):
        if not UNCANNY_OG_DIR.exists():
            return

        db = get_session()
        try:
            found = []
            for og_path in sorted(UNCANNY_OG_DIR.glob("*.jpg")):
                stem = og_path.stem
                p20 = UNCANNY_20_DIR / (stem + ".png")
                p60 = UNCANNY_60_DIR / (stem + ".png")
                p80 = UNCANNY_80_DIR / (stem + ".png")
                if not (p20.exists() and p60.exists() and p80.exists()):
                    continue  # uncanny batch not finished for this image yet

                slug, title = _parse_stem(stem)

                record = db.query(Artwork).filter_by(slug=slug).first()
                if record is None:
                    record = Artwork(
                        slug=slug,
                        title=title,
                        artist="Metropolitan Museum of Art",
                        year="",
                        image_path=str(og_path),
                        description="",
                    )
                    db.add(record)
                    db.flush()

                found.append({
                    "id":            record.id,
                    "slug":          slug,
                    "title":         title,
                    "artist":        "Metropolitan Museum of Art",
                    "year":          "",
                    "image_path":    str(og_path),
                    "image_path_20": str(p20),
                    "image_path_60": str(p60),
                    "image_path_80": str(p80),
                })

            db.commit()
            self._artworks = found
        except Exception:
            db.rollback()
            raise
        finally:
            db.close()

    def pick_next(self) -> dict | None:
        if not self._artworks:
            return None
        db = get_session()
        try:
            rows = (
                db.query(Viewing.artwork_id, func.count(Viewing.id))
                .group_by(Viewing.artwork_id)
                .all()
            )
            counts = {aid: c for aid, c in rows}
        finally:
            db.close()
        return min(self._artworks, key=lambda a: counts.get(a["id"], 0))

    def all(self) -> list[dict]:
        return list(self._artworks)
