from sqlalchemy import String, Text, Integer
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Resource(Base):
    __tablename__ = "resources"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False, index=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    type: Mapped[str] = mapped_column(String(20), nullable=False)  # "Video" | "PDF" | "Link"
    url: Mapped[str] = mapped_column(String(500), nullable=False)
    tags: Mapped[str | None] = mapped_column(String(500), nullable=True)  # "tag1,tag2,tag3"