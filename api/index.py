from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Property Tax Group API",
    description="FastAPI backend for Property Tax Group",
    version="1.0.0",
    docs_url="/api/v1/docs",
    redoc_url="/api/v1/redoc",
    openapi_url="/api/v1/openapi.json"
)

# Add CORS middleware for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/v1/hello")
async def hello_world():
    return {"message": "Hello World from FastAPI!!!!"}


@app.get("/api/v1/")
async def root():
    return {"message": "FastAPI is running on Vercel!"}
