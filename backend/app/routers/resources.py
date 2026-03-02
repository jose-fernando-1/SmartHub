import logging

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import select, func

from app.db.session import get_db
from app.models.resource import Resource
from app.models.resource_audit_log import ResourceAuditLog
from app.schemas.resource import (
    ResourceCreate,
    ResourceUpdate,
    ResourceOut,
    tags_to_str,
    tags_from_str,
)

log = logging.getLogger(__name__)


def _save_audit_log(
    db: Session,
    action: str,
    resource_id: int | None,
    details: str,
) -> None:
    db.add(
        ResourceAuditLog(
            action=action,
            resource_id=resource_id,
            details=details,
        )
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
        select(Resource)
        .order_by(Resource.id.desc())
        .offset(offset)
        .limit(page_size)
    ).all()

    out_items: list[ResourceOut] = []
    for r in items:
        out_items.append(
            ResourceOut(
                id=r.id,
                title=r.title,
                description=r.description,
                type=r.type,  # type: ignore
                url=r.url,
                tags=tags_from_str(r.tags),
            )
        )

    return {
        "page": page,
        "page_size": page_size,
        "total": total,
        "items": out_items,
    }


# Se acessar post /resources, cria um novo recurso
@router.post(
    "",
    response_model=ResourceOut,
    status_code=status.HTTP_201_CREATED,
)
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

    details = (
        f"Recurso cadastrado: title='{r.title}', type='{r.type}', "
        f"url='{r.url}'"
    )
    _save_audit_log(db, action="create", resource_id=r.id, details=details)
    db.commit()
    log.info("resource.create id=%s title=%s", r.id, r.title)

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
def update_resource(
    resource_id: int,
    payload: ResourceUpdate,
    db: Session = Depends(get_db),
):
    r = db.get(Resource, resource_id)
    if not r:
        raise HTTPException(status_code=404, detail="Resource not found")

    changed_fields: list[str] = []

    if payload.title is not None:
        r.title = payload.title
        changed_fields.append("title")
    if payload.description is not None:
        r.description = payload.description
        changed_fields.append("description")
    if payload.type is not None:
        r.type = payload.type
        changed_fields.append("type")
    if payload.url is not None:
        r.url = payload.url
        changed_fields.append("url")
    if payload.tags is not None:
        r.tags = tags_to_str(payload.tags)
        changed_fields.append("tags")

    db.add(r)
    db.commit()
    db.refresh(r)

    fields_text = ",".join(changed_fields) if changed_fields else "none"
    details = f"Recurso atualizado: id={r.id}, fields={fields_text}"
    _save_audit_log(db, action="update", resource_id=r.id, details=details)
    db.commit()
    log.info("resource.update id=%s fields=%s", r.id, fields_text)

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

    deleted_title = r.title

    db.delete(r)
    db.commit()

    details = f"Recurso removido: id={resource_id}, title='{deleted_title}'"
    _save_audit_log(
        db,
        action="delete",
        resource_id=resource_id,
        details=details,
    )
    db.commit()
    log.info("resource.delete id=%s title=%s", resource_id, deleted_title)

    return None
