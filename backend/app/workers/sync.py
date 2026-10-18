"""Run with python -m app.workers.sync; snapshots accumulate from first sync."""

import asyncio
from datetime import datetime, timezone, timedelta
from sqlalchemy import select
from app.models.database import SessionLocal, User, Snapshot, Notification
from app.services.faceit.players import player


async def sync_once():
    with SessionLocal() as db:
        for user in db.scalars(select(User).where(User.faceit_id.is_not(None))):
            latest = db.scalar(
                select(Snapshot)
                .where(Snapshot.user_id == user.id)
                .order_by(Snapshot.recorded_at.desc())
                .limit(1)
            )
            if latest and latest.recorded_at.replace(
                tzinfo=timezone.utc
            ) > datetime.now(timezone.utc) - timedelta(minutes=55):
                continue
            try:
                data = await player(user.faceit_id)
                elo = data.get("games", {}).get("cs2", {}).get("faceit_elo")
                if not isinstance(elo, int):
                    continue
                snap = Snapshot(user_id=user.id, elo=elo)
                db.add(snap)
                db.flush()
                if user.settings.get("sync_alerts", True):
                    db.add(
                        Notification(
                            user_id=user.id,
                            event_id=f"sync:{snap.id}",
                            title="FACEIT statistics synchronized",
                        )
                    )
                db.commit()
            except Exception:
                db.rollback()
                print(f"Sync failed for internal user {user.id}; retry next interval")


async def main():
    while True:
        await sync_once()
        await asyncio.sleep(3600)


if __name__ == "__main__":
    asyncio.run(main())
