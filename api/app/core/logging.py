"""
Logging Configuration
Centralized logging setup with structured logging and proper formatting.
"""

import logging
import logging.config
import sys
import os
from typing import Dict, Any
from app.core.config import settings


def setup_logging() -> None:
    """
    Configure application logging based on environment and settings.
    """
    
    # Determine log level
    log_level = getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO)
    
    # Basic logging configuration
    logging_config: Dict[str, Any] = {
        "version": 1,
        "disable_existing_loggers": False,
        "formatters": {
            "standard": {
                "format": settings.LOG_FORMAT,
                "datefmt": "%Y-%m-%d %H:%M:%S",
            },
            "detailed": {
                "format": (
                    "%(asctime)s - %(name)s - %(levelname)s - "
                    "%(funcName)s:%(lineno)d - %(message)s"
                ),
                "datefmt": "%Y-%m-%d %H:%M:%S",
            },
            "json": {
                "()": "pythonjsonlogger.jsonlogger.JsonFormatter",
                "format": (
                    "%(asctime)s %(name)s %(levelname)s "
                    "%(funcName)s %(lineno)d %(message)s"
                ),
            },
        },
        "handlers": {
            "console": {
                "class": "logging.StreamHandler",
                "level": log_level,
                "formatter": "standard",
                "stream": sys.stdout,
            },
        },
        "loggers": {
            "": {  # Root logger
                "level": log_level,
                "handlers": ["console"],
                "propagate": False,
            },
            "uvicorn": {
                "level": log_level,
                "handlers": ["console"],
                "propagate": False,
            },
            "uvicorn.access": {
                "level": log_level,
                "handlers": ["console"],
                "propagate": False,
            },
            "uvicorn.error": {
                "level": log_level,
                "handlers": ["console"],
                "propagate": False,
            },
            "fastapi": {
                "level": log_level,
                "handlers": ["console"],
                "propagate": False,
            },
            "sqlalchemy": {
                "level": "WARNING",  # Reduce SQLAlchemy verbosity
                "handlers": ["console"],
                "propagate": False,
            },
            "sqlalchemy.engine": {
                "level": "WARNING" if settings.is_production() else "INFO",
                "handlers": ["console"],
                "propagate": False,
            },
        },
    }
    
    # Add file logging for production
    if settings.is_production():
        # Ensure logs directory exists
        log_dir = "/var/log/property-tax-nexus"
        if not os.path.exists(log_dir):
            try:
                os.makedirs(log_dir, exist_ok=True)
            except PermissionError:
                # Fallback to local logs directory
                log_dir = "./logs"
                os.makedirs(log_dir, exist_ok=True)
        
        # Add file handlers for production
        logging_config["handlers"].update({
            "file": {
                "class": "logging.handlers.RotatingFileHandler",
                "level": log_level,
                "formatter": "detailed",
                "filename": f"{log_dir}/api.log",
                "maxBytes": 10485760,  # 10MB
                "backupCount": 5,
                "encoding": "utf8",
            },
            "error_file": {
                "class": "logging.handlers.RotatingFileHandler",
                "level": "ERROR",
                "formatter": "detailed",
                "filename": f"{log_dir}/error.log",
                "maxBytes": 10485760,  # 10MB
                "backupCount": 5,
                "encoding": "utf8",
            },
        })
        
        # Update loggers to use file handlers
        for logger_name in logging_config["loggers"]:
            if logger_name in ["", "uvicorn", "fastapi"]:
                logging_config["loggers"][logger_name]["handlers"].extend(["file", "error_file"])
    
    # Use JSON formatter in production for better log aggregation
    if settings.is_production():
        logging_config["handlers"]["console"]["formatter"] = "json"
        if "file" in logging_config["handlers"]:
            logging_config["handlers"]["file"]["formatter"] = "json"
    
    # Apply the logging configuration
    logging.config.dictConfig(logging_config)
    
    # Set up specific loggers for our application
    logger = logging.getLogger(__name__)
    logger.info(f"Logging configured for {settings.ENVIRONMENT} environment")
    logger.info(f"Log level set to {settings.LOG_LEVEL}")


def get_logger(name: str) -> logging.Logger:
    """
    Get a logger instance with the specified name.
    
    Args:
        name: Logger name (typically __name__)
        
    Returns:
        Configured logger instance
    """
    return logging.getLogger(name)


class LoggerMixin:
    """
    Mixin class to add logging capability to any class.
    """
    
    @property
    def logger(self) -> logging.Logger:
        """Get logger for this class"""
        return get_logger(f"{self.__class__.__module__}.{self.__class__.__name__}")


# Context manager for request logging
class RequestLoggingContext:
    """
    Context manager for request-specific logging with correlation IDs.
    """
    
    def __init__(self, request_id: str, method: str, path: str):
        self.request_id = request_id
        self.method = method
        self.path = path
        self.logger = get_logger("request")
        
    def __enter__(self):
        self.logger.info(
            f"Starting request {self.request_id}: {self.method} {self.path}"
        )
        return self
        
    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_type:
            self.logger.error(
                f"Request {self.request_id} failed: {exc_type.__name__}: {exc_val}"
            )
        else:
            self.logger.info(f"Request {self.request_id} completed successfully")


# Performance logging decorator
def log_performance(func):
    """
    Decorator to log function performance.
    """
    import time
    import functools
    
    @functools.wraps(func)
    async def async_wrapper(*args, **kwargs):
        start_time = time.time()
        logger = get_logger(func.__module__)
        
        try:
            result = await func(*args, **kwargs)
            duration = time.time() - start_time
            logger.info(f"{func.__name__} completed in {duration:.3f}s")
            return result
        except Exception as e:
            duration = time.time() - start_time
            logger.error(f"{func.__name__} failed after {duration:.3f}s: {str(e)}")
            raise
    
    @functools.wraps(func)
    def sync_wrapper(*args, **kwargs):
        start_time = time.time()
        logger = get_logger(func.__module__)
        
        try:
            result = func(*args, **kwargs)
            duration = time.time() - start_time
            logger.info(f"{func.__name__} completed in {duration:.3f}s")
            return result
        except Exception as e:
            duration = time.time() - start_time
            logger.error(f"{func.__name__} failed after {duration:.3f}s: {str(e)}")
            raise
    
    # Return appropriate wrapper based on function type
    import asyncio
    if asyncio.iscoroutinefunction(func):
        return async_wrapper
    else:
        return sync_wrapper 