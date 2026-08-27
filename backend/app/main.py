from contextlib import asynccontextmanager
from fastapi import FastAPI
from app.api.routes import audits,reports,auth
from app.core.database import engine,Base
from app.core.models import Audit

@asynccontextmanager
async def lifespan(app:FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    await engine.dispose()
app = FastAPI(title="AuditIQ")

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For dev purposes
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(
    audits.router,
    prefix="/api/audits",
    tags=["Audtis"]
)

app.include_router(
    reports.router,
    prefix="/api/reports",
    tags=["Reports"]
)





app.include_router(
    auth.router,
    prefix="/api/auth",
    tags=["Auth"]
)

