"""
Alembic migration environment for SkillMitra.

DATABASE_URL is read from the environment (via pydantic-settings).
Never hard-code credentials here.
"""

import sys
import os

# Ensure backend/ is on sys.path so app.* imports work
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from logging.config import fileConfig
from alembic import context
from sqlalchemy import engine_from_config, pool, create_engine

from app.core.config import settings

# Import Base + ALL models so their metadata is populated before
# Alembic inspects target_metadata.
import app.models  # noqa: F401 - registers all Phase 2A models
from app.models.base import Base

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Avoid ConfigParser interpolation issues with `%` in passwords:
# We bypass set_main_option and use create_engine directly for online mode
url = settings.DATABASE_URL
# To avoid interpolation error, we can replace % with %% if we must set it:
config.set_main_option("sqlalchemy.url", url.replace("%", "%%"))

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,
        compare_server_default=True,
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    connectable = create_engine(url, poolclass=pool.NullPool)
    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
            compare_server_default=True,
        )
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
