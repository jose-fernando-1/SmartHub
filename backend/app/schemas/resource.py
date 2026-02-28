from pydantic import BaseModel, Field
from typing import Literal


ResourceType = Literal["Video", "PDF", "Link"]


class ResourceBase(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str | None = None
    type: ResourceType
    url: str = Field(min_length=1, max_length=500)
    tags: list[str] = []


class ResourceCreate(ResourceBase):
    pass


class ResourceUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = None
    type: ResourceType | None = None
    url: str | None = Field(default=None, min_length=1, max_length=500)
    tags: list[str] | None = None


class ResourceOut(ResourceBase):
    id: int

    class Config:
        from_attributes = True


def tags_to_str(tags: list[str]) -> str:
    # normaliza e remove vazios
    cleaned = [t.strip() for t in tags if t and t.strip()]
    return ",".join(cleaned)


def tags_from_str(tags: str | None) -> list[str]:
    if not tags:
        return []
    return [t.strip() for t in tags.split(",") if t.strip()]