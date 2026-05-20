"""
ASGI config for dietary_estimator project.
"""

import os
from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'dietary_estimator.settings')
application = get_asgi_application()