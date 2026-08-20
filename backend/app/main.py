from fastapi import FastAPI
from app.api.routes import audits,reports,auth

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