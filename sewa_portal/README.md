# Sewa Portal - Backend (Django)

This directory contains the Django backend for Sewa Portal. The project has been prepared for deployment on Render.com.

What I changed

- Settings now read secret/config from environment variables (SECRET_KEY, DEBUG, ALLOWED_HOSTS, DATABASE_URL).
- Added WhiteNoise middleware and static configuration for serving static files.
- Added `requirements.txt`, `Procfile`, `runtime.txt`, and `render.yaml` for Render deployment.

Required environment variables on Render

- DJANGO_SECRET_KEY: your production secret key
- DJANGO_DEBUG: set to `False` in production
- DATABASE_URL: a Postgres database URL (Render provides this when you add a managed DB)
- EMAIL_HOST_USER, EMAIL_HOST_PASSWORD: for sending email
- CORS_ALLOWED_ORIGINS: optional comma-separated list of allowed origins

Render setup summary

1. Create a new Web Service on Render and connect your repository.
2. Point the service to the `sewa_portal` subfolder as the root.
3. Set the build command to: `pip install -r requirements.txt`
4. Set the start command to: `gunicorn sewa_portal.wsgi:application --bind 0.0.0.0:$PORT`
5. Add environment variables listed above in the Render dashboard.

Local testing

Install dependencies into a virtualenv and run migrations/collectstatic:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r sewa_portal/requirements.txt
cd sewa_portal
python manage.py migrate
python manage.py collectstatic --noinput
python manage.py runserver
```

Notes

- The code uses `dj-database-url` to support `DATABASE_URL`. If you keep using sqlite locally, no changes are required.
- Ensure you do NOT commit production secrets to the repo.
