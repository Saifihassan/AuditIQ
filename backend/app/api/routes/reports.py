from fastapi import APIRouter



router = APIRouter()


@router.get("/")
def get_report():
    return {"message": "This endpoint will return all the reports"}


@router.get("/{id}")
def get_one_report(id: int):
    return {
        "success":"ok",
        "id":id
    }


@router.get("/{id}/pdf")
def get_pdf_report(id:int):
    return {
        "success":"ok",
        "id":id
    }