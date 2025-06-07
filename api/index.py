"""
Vercel Entry Point for FastAPI Application
This file exports the FastAPI app instance for Vercel serverless deployment.
"""

from main import app

# Export the app for Vercel
# This is the main entry point that Vercel will use
__all__ = ["app"]
