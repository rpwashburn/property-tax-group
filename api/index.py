from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Property Tax Group Nexus API",
    description="FastAPI backend for Property Tax Group services",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# Add CORS middleware for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/hello")
async def hello_world():
    return {"message": "Hello World from Property Tax Nexus API!"}


@app.get("/")
async def root():
    return {"message": "Property Tax Nexus API is running on Vercel!"}
