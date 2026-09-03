from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from pydantic import BaseModel
from typing import List

from app.core.database import get_db
from app.api.routes.auth import get_current_user
from app.core.models import User, UserApiKey
from app.core.encryption import encrypt_key, decrypt_key
import httpx
from app.agents.providers import PROVIDER_REGISTRY

router = APIRouter()

class ApiKeyCreate(BaseModel):
    provider: str
    api_key: str

class ApiKeyResponse(BaseModel):
    provider: str
    
@router.get("/providers")
async def get_providers(current_user: User = Depends(get_current_user)):
    """Return the registry of available providers and their models."""
    return PROVIDER_REGISTRY

@router.get("/{provider}/models")
async def get_provider_models(
    provider: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Dynamically fetch the available models for a provider using the user's saved API key."""
    if provider not in PROVIDER_REGISTRY:
        raise HTTPException(status_code=400, detail="Unsupported provider.")
        
    result = await db.execute(
        select(UserApiKey)
        .where(UserApiKey.user_id == current_user.id)
        .where(UserApiKey.provider == provider)
    )
    existing_key = result.scalar_one_or_none()
    
    if not existing_key:
        raise HTTPException(status_code=404, detail="API key for this provider not found. Please save it first.")
        
    api_key = decrypt_key(existing_key.encrypted_key)
    base_url = PROVIDER_REGISTRY[provider]["base_url"]
    
    # Make request to provider's /models endpoint
    url = f"{base_url.rstrip('/')}/models"
    headers = {"Authorization": f"Bearer {api_key}"}
    
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(url, headers=headers)
            response.raise_for_status()
            data = response.json()
            models = [{"id": m.get("id"), "label": m.get("id")} for m in data.get("data", [])]
            # Optionally filter out models if needed, but we'll return them all
            return models
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail=f"Provider API error: {e.response.text}")
    except httpx.RequestError as e:
        raise HTTPException(status_code=503, detail=f"Failed to reach provider API: {str(e)}")


@router.get("/", response_model=List[ApiKeyResponse])
async def get_saved_keys(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    """Return a list of providers the user has saved keys for (without exposing raw keys)."""
    result = await db.execute(select(UserApiKey).where(UserApiKey.user_id == current_user.id))
    keys = result.scalars().all()
    return [{"provider": key.provider} for key in keys]

@router.post("/")
async def save_api_key(
    payload: ApiKeyCreate, 
    current_user: User = Depends(get_current_user), 
    db: AsyncSession = Depends(get_db)
):
    """Encrypt and save an API key for a specific provider. Overwrites if exists."""
    if payload.provider not in PROVIDER_REGISTRY:
        raise HTTPException(status_code=400, detail="Unsupported provider.")
        
    result = await db.execute(
        select(UserApiKey)
        .where(UserApiKey.user_id == current_user.id)
        .where(UserApiKey.provider == payload.provider)
    )
    existing_key = result.scalar_one_or_none()
    
    encrypted = encrypt_key(payload.api_key)
    
    if existing_key:
        existing_key.encrypted_key = encrypted
    else:
        new_key = UserApiKey(
            user_id=current_user.id,
            provider=payload.provider,
            encrypted_key=encrypted
        )
        db.add(new_key)
        
    await db.commit()
    return {"message": f"API Key for {payload.provider} saved successfully."}

@router.delete("/{provider}")
async def delete_api_key(
    provider: str, 
    current_user: User = Depends(get_current_user), 
    db: AsyncSession = Depends(get_db)
):
    """Delete a saved API key."""
    result = await db.execute(
        select(UserApiKey)
        .where(UserApiKey.user_id == current_user.id)
        .where(UserApiKey.provider == provider)
    )
    existing_key = result.scalar_one_or_none()
    
    if not existing_key:
        raise HTTPException(status_code=404, detail="Key not found.")
        
    await db.delete(existing_key)
    await db.commit()
    return {"message": f"API Key for {provider} deleted successfully."}
