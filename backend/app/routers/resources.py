from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import select, func

from app.db.session import get_db
from app.models.resource import Resource
from app.schemas.resource import (
    ResourceCreate, ResourceUpdate, ResourceOut,
    tags_to_str, tags_from_str
)

# Rota de resources começa com /resources
router = APIRouter(prefix="/resources", tags=["resources"])


# Se somente acessar get /resources, lista recursos com paginação
@router.get("", response_model=dict)
def list_resources(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=50),
):
    total = db.scalar(select(func.count()).select_from(Resource)) or 0
    offset = (page - 1) * page_size

    items = db.scalars(
        select(Resource).order_by(Resource.id.desc()).offset(offset).limit(page_size)
    ).all()

    out_items: list[ResourceOut] = []
    for r in items:
        out_items.append(ResourceOut(
            id=r.id,
            title=r.title,
            description=r.description,
            type=r.type,  # type: ignore
            url=r.url,
            tags=tags_from_str(r.tags),
        ))

    return {
        "page": page,
        "page_size": page_size,
        "total": total,
        "items": out_items,
    }

# Se acessar post /resources, cria um novo recurso
@router.post("", response_model=ResourceOut, status_code=status.HTTP_201_CREATED)
def create_resource(payload: ResourceCreate, db: Session = Depends(get_db)):
    r = Resource(
        title=payload.title,
        description=payload.description,
        type=payload.type,
        url=payload.url,
        tags=tags_to_str(payload.tags),
    )
    db.add(r)
    db.commit()
    db.refresh(r)

    return ResourceOut(
        id=r.id,
        title=r.title,
        description=r.description,
        type=r.type,  # type: ignore
        url=r.url,
        tags=tags_from_str(r.tags),
    )


@router.get("/{resource_id}", response_model=ResourceOut)
def get_resource(resource_id: int, db: Session = Depends(get_db)):
    r = db.get(Resource, resource_id)
    if not r:
        raise HTTPException(status_code=404, detail="Resource not found")

    return ResourceOut(
        id=r.id,
        title=r.title,
        description=r.description,
        type=r.type,  # type: ignore
        url=r.url,
        tags=tags_from_str(r.tags),
    )


@router.put("/{resource_id}", response_model=ResourceOut)
def update_resource(resource_id: int, payload: ResourceUpdate, db: Session = Depends(get_db)):
    r = db.get(Resource, resource_id)
    if not r:
        raise HTTPException(status_code=404, detail="Resource not found")

    if payload.title is not None:
        r.title = payload.title
    if payload.description is not None:
        r.description = payload.description
    if payload.type is not None:
        r.type = payload.type
    if payload.url is not None:
        r.url = payload.url
    if payload.tags is not None:
        r.tags = tags_to_str(payload.tags)

    db.add(r)
    db.commit()
    db.refresh(r)

    return ResourceOut(
        id=r.id,
        title=r.title,
        description=r.description,
        type=r.type,  # type: ignore
        url=r.url,
        tags=tags_from_str(r.tags),
    )


@router.delete("/{resource_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_resource(resource_id: int, db: Session = Depends(get_db)):
    r = db.get(Resource, resource_id)
    if not r:
        raise HTTPException(status_code=404, detail="Resource not found")

    db.delete(r)
    db.commit()
    return None