from contextlib import asynccontextmanager
import logging

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from sqlalchemy import select

from app.database import  SessionLocal
from app.core.config import settings
from app.models import Crop, LabourActivity
from app.api.routes import router


# =========================
# LOGGING
# =========================

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)

logger = logging.getLogger("farmledger")


# =========================
# SEED DATA
# =========================

SEED_CROPS = [
    ("Cotton", "\u0c2a\u0c24\u0c4d\u0c24\u0c3f"),
    ("Maize", "\u0c2e\u0c4a\u0c15\u0c4d\u0c15\u0c1c\u0c4a\u0c28\u0c4d\u0c28"),
    ("Turmeric", "\u0c2a\u0c38\u0c41\u0c2a\u0c41"),
    ("Paddy", "\u0c35\u0c30\u0c3f"),
    ("Chilli", "\u0c2e\u0c3f\u0c30\u0c2a"),
    ("Green gram", "\u0c2a\u0c46\u0c38\u0c30"),
    ("Red gram", "\u0c15\u0c02\u0c26\u0c41\u0c32\u0c41"),
    ("Groundnut", "\u0c35\u0c47\u0c30\u0c41\u0c36\u0c46\u0c28\u0c17"),
    ("Other", "\u0c07\u0c24\u0c30 \u0c2a\u0c02\u0c1f"),
]


SEED_LABOUR_ACTIVITIES = [
    ("Land preparation", "\u0c2d\u0c42\u0c2e\u0c3f \u0c38\u0c3f\u0c26\u0c4d\u0c27\u0c02"),
    ("Sowing / Planting", "\u0c35\u0c3f\u0c24\u0c4d\u0c24\u0c21\u0c02 / \u0c28\u0c3e\u0c1f\u0c21\u0c02"),
    ("Weeding", "\u0c15\u0c32\u0c41\u0c2a\u0c41 \u0c24\u0c40\u0c2f\u0c21\u0c02"),
    ("Fertilizer application", "\u0c0e\u0c30\u0c41\u0c35\u0c41\u0c32\u0c41 \u0c35\u0c47\u0c2f\u0c21\u0c02"),
    ("Pesticide spraying", "\u0c2e\u0c02\u0c26\u0c41\u0c32\u0c41 \u0c2a\u0c3f\u0c1a\u0c3f\u0c15\u0c3e\u0c30\u0c40"),
    ("Irrigation", "\u0c28\u0c40\u0c30\u0c41 \u0c2a\u0c46\u0c1f\u0c4d\u0c1f\u0c21\u0c02"),
    ("Harvesting", "\u0c15\u0c4b\u0c24 \u0c15\u0c4b\u0c2f\u0c21\u0c02"),
    ("Picking", "\u0c0f\u0c30\u0c21\u0c02"),
    ("Loading / Unloading", "\u0c32\u0c4b\u0c21\u0c3f\u0c02\u0c17\u0c4d / \u0c05\u0c28\u0c4d\u0c32\u0c4b\u0c21\u0c3f\u0c02\u0c17\u0c4d"),
    ("Other", "\u0c07\u0c24\u0c30 \u0c2a\u0c28\u0c3f"),
]


# =========================
# APPLICATION LIFESPAN
# =========================

@asynccontextmanager
async def lifespan(app: FastAPI):

    with SessionLocal() as db:
        for en, te in SEED_CROPS:
            if not db.scalar(select(Crop).where(Crop.name_en == en)):
                db.add(Crop(name_en=en, name_te=te))

        for en, te in SEED_LABOUR_ACTIVITIES:
            if not db.scalar(
                select(LabourActivity).where(
                    LabourActivity.name_en == en
                )
            ):
                db.add(
                    LabourActivity(
                        name_en=en,
                        name_te=te,
                    )
                )

        db.commit()

    logger.info("FarmLedger API startup completed")
    yield
    logger.info("FarmLedger API shutdown completed")


# =========================
# SECURITY HEADERS
# =========================

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        response = await call_next(request)

        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = (
            "strict-origin-when-cross-origin"
        )
        response.headers["Permissions-Policy"] = (
            "camera=(), microphone=(), geolocation=()"
        )

        return response


# =========================
# APPLICATION
# =========================

app = FastAPI(
    title="FarmLedger API",
    version="0.1.0",
    lifespan=lifespan,
)


# =========================
# GLOBAL UNEXPECTED ERROR HANDLER
# =========================

@app.exception_handler(Exception)
async def unhandled_exception_handler(
    request: Request,
    exc: Exception,
):
    logger.exception(
        "Unhandled server error: %s %s",
        request.method,
        request.url.path,
    )

    return JSONResponse(
        status_code=500,
        content={
            "detail": "Internal server error"
        },
    )


app.add_middleware(SecurityHeadersMiddleware)


app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(router, prefix="/api")


# =========================
# SYSTEM ENDPOINTS
# =========================

@app.get("/")
def root():
    return {
        "name": "FarmLedger API",
        "status": "running",
        "docs": "/docs",
    }

@app.get("/health")
def health():
    return {"status": "ok"}