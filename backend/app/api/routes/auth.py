from fastapi import APIRouter
from app.schemas import Signup, Login

router = APIRouter()


@router.post("/signup")
async def signup(details: Signup):
    return {
        "message": "account creation success!",
        "user": {
            "name": details.name,
            "email": details.email,
        }
    }


@router.post("/login")
async def login(login_details: Login):
    return {
        "message": "login success!",
    }

@router.post("/logout")
async def logout():
    return {
        "message": "logout success!",
    }

@router.post("/me")
async def me():
    return {
        "message": "this is me"
    }