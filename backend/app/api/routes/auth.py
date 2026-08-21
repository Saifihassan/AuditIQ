from app.core.security import SECRET_KEY,algorithm
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import oauth2
from sqlalchemy.ext.asyncio import AsyncSession
import jwt
from app.core.database import get_db
from app.core.models import User
from app.schemas import Login, Signup

router = APIRouter()


oauth2_scheme = oauth2.OAuth2PasswordBearer(tokenUrl="/auth/login")

async def get_current_user(token:str = Depends(oauth2_scheme),db: AsyncSession = Depends(get_db),)->User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload=jwt.decode(token,SECRET_KEY,algorithm=[algorithm])
        user_id = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except jwt.PyJWTError:
        raise credentials_exception
    result = db.execute(select(User).where(User.id==int(user_id)))
    user = result.scalar_one_or_none()

    if user is None:
        raise credentials_exception
    return user
    

        

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
