"""
Health check endpoint for Render keep-alive
"""
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_GET
import datetime

@csrf_exempt
@require_GET
def health_check(request):
    """
    Simple health check endpoint
    Used by GitHub Actions to prevent Render from sleeping
    """
    return JsonResponse({
        'status': 'ok',
        'timestamp': datetime.datetime.now().isoformat(),
    })
