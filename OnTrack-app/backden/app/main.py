import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import PlainTextResponse
from starlette.exceptions import HTTPException

from .db import init_db
from .routers import auth, chores, feed, houses


@asynccontextmanager
async def lifespan(_: FastAPI):
    init_db()
    yield


app = FastAPI(title="OnTrack API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.environ.get("ONTRACK_CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)


# The frontend shows the response body as the error message, so send plain text instead of FastAPI's JSON.
@app.exception_handler(HTTPException)
async def http_error(_, exc: HTTPException):
    return PlainTextResponse(str(exc.detail), status_code=exc.status_code, headers=exc.headers)


@app.exception_handler(RequestValidationError)
async def validation_error(_, exc: RequestValidationError):
    message = "; ".join(f"{e['loc'][-1]}: {e['msg']}" for e in exc.errors())
    return PlainTextResponse(message, status_code=422)


@app.get("/health")
def health():
    return {"ok": True}


for module in (auth, houses, chores, feed):
    app.include_router(module.router)
