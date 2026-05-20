"""
WSGI config for dietary_estimator project.
"""

import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'dietary_estimator.settings')
application = get_wsgi_application()