from fastapi import APIRouter
from time import sleep

router = APIRouter(tags=["health"])


@router.get("/health")
def health():
    sleep(1)
    return {"status": "Ok"}  # mockado por enquanto
