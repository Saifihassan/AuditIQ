from fastapi import APIRouter
from app.schemas import Audit

router = APIRouter()

@router.post("/")
def create_audit(audit: Audit):
    return {"message": audit.url}


@router.get('/{audit_id}')
def get_one_audit(audit_id:int):
    return {"message":"single audit",
            "id":audit_id}
