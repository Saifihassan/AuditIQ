from datetime import timedelta,datetime,timezone
import jwt
from pwdlib import PasswordHash
import os
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

SECRET_KEY = os.getenv("SECRET_KEY", "supersecretkey_fallback")
algorithm = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))

password_hash = PasswordHash.recommended()
def hashpassword(password:str)->str:
    return password_hash.hash(password)


def verify_password(plain_password:str,hashed_password:str)->bool:
    return password_hash.verify(plain_password,hashed_password)


def create_token(data:dict,expires_delta:timedelta| None=None)->str:
    to_encode = data.copy()
    expires_in = datetime.now(timezone.utc)+(
        expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update(
        exp=expires_in
    )
    encoded_jwt = jwt.encode(to_encode,SECRET_KEY,algorithm=algorithm)
    return encoded_jwt