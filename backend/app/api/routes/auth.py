from fastapi.security import HTTPAuthorizationCredentials,HTTPBearer
from fastapi.security import OAuth2PasswordBearer
from app.schemas import Token
from app.core.security import create_token
from app.core.security import verify_password
from app.core.security import hashpassword
from app.schemas import UserResponse
from sqlalchemy import select, or_
from app.core.security import SECRET_KEY,algorithm
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import oauth2
from sqlalchemy.ext.asyncio import AsyncSession
import jwt
from app.core.database import get_db
from app.core.models import User
from app.schemas import UserLogin, UserSignup

router = APIRouter()

security_scheme = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    token = credentials.credentials
    print(f"\n--- DEBUG AUTH ---")
    print(f"Token received: {token[:15]}...")

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[algorithm])
        user_id: str = payload.get("sub")
        print(f"Payload decoded: {payload}")
        if user_id is None:
            print("FAILED: 'sub' claim missing from token payload")
            raise HTTPException(status_code=401, detail="Invalid token payload")
    except Exception as e:
        print(f"FAILED during jwt.decode: {type(e).__name__} - {e}")
        raise HTTPException(status_code=401, detail=f"JWT Error: {str(e)}")

    result = await db.execute(select(User).where(User.id == int(user_id)))
    user = result.scalar_one_or_none()

    if user is None:
        print(f"FAILED: No user found in database with ID: {user_id}")
        raise HTTPException(status_code=401, detail="User not found in DB")

    print(f"SUCCESS: User authenticated as {user.email}\n")
    return user
        

@router.post("/signup",response_model=UserResponse,status_code=status.HTTP_201_CREATED)
async def signup(details: UserSignup,db: AsyncSession= Depends(get_db), ):
    existing = await db.execute(
        select(User).where(
            or_(User.email == details.email, User.username == details.name)
        )
    )
    existing_user = existing.scalar_one_or_none()
    if existing_user is not None:
        if existing_user.email == details.email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already exists",
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already exists",
        )
    newuser = User(
        username=details.name,
        email=details.email,
        password_hash=hashpassword(details.password)
    )

    db.add(newuser)
    await db.commit()
    await db.refresh(newuser)

    return newuser


# @router.post("/login", response_model=UserResponse,status_code=status.HTTP_200_OK)
@router.post("/login", response_model=Token, status_code=status.HTTP_200_OK)
async def login(login_details: UserLogin, db: AsyncSession = Depends(get_db)):
    
    stmt = select(User).where(User.email == login_details.email)
    res = await db.execute(stmt)
    user = res.scalar_one_or_none()

    
    if user is None or not verify_password(login_details.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = create_token(data={"sub": str(user.id)})
    return Token(
        access_token=token,
        token_type="bearer",
    )


@router.post("/logout")
async def logout():
    return {
        "message": "logout success!",
    }

@router.get("/me", response_model=UserResponse,status_code=status.HTTP_200_OK)
async def me(current_user:User = Depends(get_current_user)):

    return current_user
