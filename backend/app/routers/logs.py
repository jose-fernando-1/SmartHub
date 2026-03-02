from typing import Literal

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, func
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.resource_audit_log import ResourceAuditLog
from app.models.ai_interaction_log import AIInteractionLog


router = APIRouter(prefix="/logs", tags=["logs"])


@router.get("/resources", response_model=dict)
def list_resource_logs(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    action: Literal["create", "update", "delete"] | None = None,
    resource_id: int | None = Query(None, ge=1),
):
    filters = []
    if action is not None:
        filters.append(ResourceAuditLog.action == action)
    if resource_id is not None:
        filters.append(ResourceAuditLog.resource_id == resource_id)

    total_stmt = select(func.count()).select_from(ResourceAuditLog)
    if filters:
        total_stmt = total_stmt.where(*filters)

    total = db.scalar(total_stmt) or 0
    offset = (page - 1) * page_size

    items_stmt = (
        select(ResourceAuditLog)
        .order_by(ResourceAuditLog.id.desc())
        .offset(offset)
        .limit(page_size)
    )
    if filters:
        items_stmt = items_stmt.where(*filters)

    items = db.scalars(items_stmt).all()

    return {
        "page": page,
        "page_size": page_size,
        "total": total,
        "items": [
            {
                "id": row.id,
                "action": row.action,
                "resource_id": row.resource_id,
                "details": row.details,
                "created_at": row.created_at,
            }
            for row in items
        ],
    }


@router.get("/ai", response_model=dict)
def list_ai_logs(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: Literal["success", "fallback", "error"] | None = None,
    is_mock: bool | None = None,
):
    filters = []
    if status is not None:
        filters.append(AIInteractionLog.status == status)
    if is_mock is not None:
        filters.append(AIInteractionLog.is_mock == is_mock)

    total_stmt = select(func.count()).select_from(AIInteractionLog)
    if filters:
        total_stmt = total_stmt.where(*filters)

    total = db.scalar(total_stmt) or 0
    offset = (page - 1) * page_size

    items_stmt = (
        select(AIInteractionLog)
        .order_by(AIInteractionLog.id.desc())
        .offset(offset)
        .limit(page_size)
    )
    if filters:
        items_stmt = items_stmt.where(*filters)

    items = db.scalars(items_stmt).all()

    return {
        "page": page,
        "page_size": page_size,
        "total": total,
        "items": [
            {
                "id": row.id,
                "provider": row.provider,
                "model_name": row.model_name,
                "title": row.title,
                "resource_type": row.resource_type,
                "is_mock": row.is_mock,
                "status": row.status,
                "latency_ms": row.latency_ms,
                "input_tokens_estimation": row.input_tokens_estimation,
                "input_tokens_accounted": row.input_tokens_accounted,
                "output_tokens": row.output_tokens,
                "total_tokens_used": row.total_tokens_used,
                "error_message": row.error_message,
                "created_at": row.created_at,
            }
            for row in items
        ],
    }
