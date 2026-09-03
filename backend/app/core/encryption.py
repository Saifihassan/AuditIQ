from cryptography.fernet import Fernet
import os
from dotenv import load_dotenv

load_dotenv()

# Generate once via Fernet.generate_key() and store in .env
ENCRYPTION_KEY = os.getenv("ENCRYPTION_KEY")
if not ENCRYPTION_KEY:
    raise ValueError("ENCRYPTION_KEY is not set in the environment.")

fernet = Fernet(ENCRYPTION_KEY.encode() if isinstance(ENCRYPTION_KEY, str) else ENCRYPTION_KEY)

def encrypt_key(plain: str) -> str:
    return fernet.encrypt(plain.encode()).decode()

def decrypt_key(encrypted: str) -> str:
    return fernet.decrypt(encrypted.encode()).decode()
