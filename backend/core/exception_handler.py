import logging
from django.db import OperationalError
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status

logger = logging.getLogger(__name__)


def custom_exception_handler(exc, context):
    """
    Custom exception handler that catches database connection errors
    and returns appropriate HTTP 503 Service Unavailable responses.
    """
    # Call REST framework's default exception handler first
    response = exception_handler(exc, context)
    
    # If the exception is a database OperationalError, return 503
    if isinstance(exc, OperationalError):
        logger.error(f"Database connection error: {str(exc)}", exc_info=True)
        
        # Check if it's a connection pool exhaustion error
        error_str = str(exc).lower()
        if 'max clients' in error_str or 'pool' in error_str:
            return Response(
                {
                    "error": "Database connection pool exhausted",
                    "detail": "The database service is currently experiencing high load. Please try again in a moment.",
                },
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
        
        # Generic database connection error
        return Response(
            {
                "error": "Database connection error",
                "detail": "Unable to connect to the database. Please try again in a moment.",
            },
            status=status.HTTP_503_SERVICE_UNAVAILABLE
        )
    
    # If response is None, it means DRF didn't handle the exception
    # We can add more custom handling here if needed
    return response

