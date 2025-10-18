# 🔐 Render Environment Variables - Quick Reference

## Required Environment Variables (Set in Render Dashboard)

### Django Core
```
DJANGO_SECRET_KEY=<generate-a-long-random-string-here>
DJANGO_DEBUG=False
DJANGO_ALLOWED_HOSTS=<your-app-name>.onrender.com
```

**Generate SECRET_KEY:**
```python
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

### Database
```
DATABASE_URL=<automatically-provided-by-render-postgres>
```
Note: This is automatically set when you link a PostgreSQL database to your web service.

### Dropbox Storage (Required for file uploads)
```
DROPBOX_ACCESS_TOKEN=sl.u.AGAPwfTF8cP4412vk421wn0eMxTsR1512HfaXmqvKLiQlg7vN_V4qTqC7DmQQLrz7thODRdKbhkGQ0wJIw0JhdMfE1DygcwwNl68BdheWWQYhudj4GjqC1WOrGwLxEzmP68t93BJgX5GoMfuMxhtvUCavCHOLPGt7hNog_HOPrHcyw4SccPoNTJavp5z0iM2eIVhNFq8Jt6GA22ipYeGOFJqZc6FtK9NDPyD9PXycF1iL8aC4cfX2refx0wm5e-mN0wRaETtSDgif1CGJ72vfvhmCo3IOWfuw_BOMQphes8Y-Cb6JN3ynYEf6iY11728TWe_R7x-US6uUKs4djJoMpVmaanrx6vroWSPdg8PsTAAfSIwQ5O1tXl7JuOz84aO_8me8rB8Y_UZIom-G6DjomUQGT9GrG_J40gYgu6XyI_3cWSNs7uMGQwhYOaoXZ5Ua2Go2wP31N9ssaNKcUU5sOGGGKhXV9Htm1onIeSdeik8OxC4AX19xpLXShg6dXZK0yL3qY4igOU87RC6gL7G_hu5Wck_5bjiAG9Za862ogCgrzdhx_0HHrZwYg2lDTJ2JA7q4ZCM6Ekx7f8AdPfc1HzMuRV2jjOzBkmO-ok0R3AK1zbFdsXgZeOhbrUTHf4YyzhN96iGSg0PP5bV7Xd8Lwshxs_9vO3JIazRRgtwDZB8cQibgov7NXK0BZlGGB1u8XDKvsd5kh-VeSJ1ON0i5QLnjYGYxA2Yb8Xuw_b2wTV4tlLg5qpmtU7bVn6Kp9vCzP5Df28DdTP1ZJxecgfvAl5dR_BexMgv3qU84EpBT3CtqEKaNNTh5Xr68cW7k7BzyihlaipFgHAZvAu7TXvUdDfFOhSRKQMxa7A87ANclmsU6EJos3XwwQ_6IgaGqVoUYUjhN2OC4aDY6lZX0LvfaTUrQ68DTOaDESrWJFqTp8oRkbJimBVLQGu_Wv1Q-uQ9Jvkviy2vPkhsntXSZYw2o9XYxCup5N1nejILTu1aBQZvofd8uCfTkOi0cU3gsc4ov51yPMEajtYZk00hGpmKwBz_7q_wX-3tH3uA1CktL5MBqC3FQmoNGJNtNH6R5hfEn6ETxYDbOzE78sMEmiGQGW_HTsyyVn8WinEANNWMBhbuIqOup7KMQVxBoGUPG7bE-OjnkBNwLTCd_dGGlvOh9o9hBI4S8Z3M1U0vlcUQeykDvxgJ_u4p_xcb6RGgZOtIu3hZjHBfpGvelkV3vyEP9sMJQyLONPuGaQfptWZDR0kPmSDRVALO7StWCbzDD_cWlu3bk2nKG23RbwH5bx86rBVsZT9HpkTkahclRwgL7K0LFJz4FHCqV7kUrFN0rtSADiHUB3luKC0UDfPrYsm4AklvEnvEQpmlBO9AqwzjxpDtV2tWqDDYc7xq60iFP_1likD50yQRv5zvv90QTq0lh3brUAtcwl1F_nlW_SGR96kRmg

DROPBOX_ROOT_PATH=/sewa_portal
DROPBOX_TIMEOUT=100
```

### CORS (Frontend Access)
```
CORS_ALLOWED_ORIGINS=https://cgjbcsc.netlify.app
```
Note: Add comma-separated URLs if you have multiple frontend domains.

---

## Optional Environment Variables

### Email Configuration (for notifications)
```
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-gmail-app-password
DEFAULT_FROM_EMAIL=Sewa Portal <your-email@gmail.com>
```

---

## How to Set in Render Dashboard

1. Go to your web service in Render
2. Click "Environment" tab
3. Click "Add Environment Variable"
4. Enter Key and Value
5. Click "Save Changes"
6. Render will automatically redeploy

---

## Testing Variables Locally

Create a `.env` file in `sewa_portal/` directory:

```bash
# .env (for local development)
DJANGO_SECRET_KEY=your-local-secret-key
DJANGO_DEBUG=True
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1

# Leave DATABASE_URL empty to use SQLite locally
# DATABASE_URL=

# Dropbox
DROPBOX_ACCESS_TOKEN=your-dropbox-token
DROPBOX_ROOT_PATH=/sewa_portal
DROPBOX_TIMEOUT=100

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# Email (optional)
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-password
```

**Important:** Never commit `.env` to git! It's already in `.gitignore`.

---

## Quick Checklist Before Deploy

- [ ] Generate new DJANGO_SECRET_KEY (don't use development key)
- [ ] Set DJANGO_DEBUG=False
- [ ] Set DJANGO_ALLOWED_HOSTS to your Render domain
- [ ] Create PostgreSQL database in Render
- [ ] Link PostgreSQL to web service (sets DATABASE_URL automatically)
- [ ] Add DROPBOX_ACCESS_TOKEN
- [ ] Add CORS_ALLOWED_ORIGINS with your frontend URL
- [ ] (Optional) Add email settings if using email features

---

## Verify After Deployment

```bash
# Check if environment variables are loaded
curl https://<your-app>.onrender.com/api/

# Should return JSON response, not error
```

If you see errors about missing environment variables, double-check they're set in Render dashboard and redeploy.
