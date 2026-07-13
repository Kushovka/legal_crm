"""add users auth

Revision ID: 20260713_0002
Revises: 20260713_0001
Create Date: 2026-07-13 00:10:00.000000
"""

from typing import Sequence, Union

import sqlalchemy as sa

from alembic import op

revision: str = "20260713_0002"
down_revision: Union[str, Sequence[str], None] = "20260713_0001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("email"),
    )
    op.create_index(op.f("ix_users_email"), "users", ["email"], unique=True)
    op.create_index(op.f("ix_users_id"), "users", ["id"], unique=False)
    op.add_column("clients", sa.Column("user_id", sa.Integer(), nullable=True))
    op.create_index(op.f("ix_clients_user_id"), "clients", ["user_id"], unique=False)
    op.create_foreign_key(op.f("fk_clients_user_id_users"), "clients", "users", ["user_id"], ["id"])


def downgrade() -> None:
    op.drop_constraint(op.f("fk_clients_user_id_users"), "clients", type_="foreignkey")
    op.drop_index(op.f("ix_clients_user_id"), table_name="clients")
    op.drop_column("clients", "user_id")
    op.drop_index(op.f("ix_users_id"), table_name="users")
    op.drop_index(op.f("ix_users_email"), table_name="users")
    op.drop_table("users")
