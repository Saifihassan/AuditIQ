from pydantic import BaseModel, HttpUrl


# ── Audit schemas ─────────────────────────────────────────────────────────────

class Audit(BaseModel):
    url: HttpUrl


# ── Auth schemas ──────────────────────────────────────────────────────────────

class Signup(BaseModel):
    name: str
    email: str
    password: str


class Login(BaseModel):
    email: str
    password: str
