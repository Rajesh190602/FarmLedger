# FarmLedger API

## Local setup
1. Create a virtual environment and activate it.
2. `pip install -r requirements.txt`
3. Copy `.env.example` to `.env` and set a strong `SECRET_KEY`.
4. `uvicorn app.main:app --reload`
5. Open http://localhost:8000/docs

SQLite is the local default. For Neon, set `DATABASE_URL` to the Neon SQLAlchemy connection string, preferably using `postgresql+psycopg://...`.

**Before public deployment:** replace the development secret, configure exact production CORS origins, use HTTPS, configure database backups, add rate limiting and email/mobile verification, and run migrations. Alembic is configured; after installing dependencies, generate and apply the initial migration with `alembic revision --autogenerate -m "initial schema"` and `alembic upgrade head`. The startup `create_all` is retained only as a convenient local bootstrap; disable it and rely on Alembic for production deployments.
