"""add_user_profile_columns

Revision ID: 4e930da8d68b
Revises: 
Create Date: 2026-10-09 09:05:37.804863

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '4e930da8d68b'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


from sqlalchemy.engine.reflection import Inspector

def upgrade() -> None:
    """Upgrade schema."""
    conn = op.get_bind()
    inspector = Inspector.from_engine(conn)
    existing_columns = [col['name'] for col in inspector.get_columns('users')]
    
    if 'active_accounts_count' not in existing_columns:
        op.add_column('users', sa.Column('active_accounts_count', sa.Integer(), server_default='2', nullable=True))
    if 'digital_usage' not in existing_columns:
        op.add_column('users', sa.Column('digital_usage', sa.String(length=50), server_default='moderate', nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    # Safety Check: In an existing production database where columns may have been 
    # created manually or exist prior to this migration, unconditionally dropping them
    # in a downgrade could cause severe data loss. Alembic does not track whether it 
    # was the actor that created the column. Therefore, downgrades are intentionally 
    # disabled for this backfill migration.
    pass
