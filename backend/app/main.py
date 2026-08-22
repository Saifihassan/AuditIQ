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

