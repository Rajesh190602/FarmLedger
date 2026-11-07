from datetime import datetime, timezone, date

from sqlalchemy import (
    String,
    Integer,
    Float,
    Date,
    DateTime,
    ForeignKey,
    Boolean,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    full_name: Mapped[str] = mapped_column(String(120))
    mobile: Mapped[str] = mapped_column(String(20), unique=True, index=True)
    email: Mapped[str | None] = mapped_column(
        String(255),
        unique=True,
        nullable=True,
        index=True,
    )
    password_hash: Mapped[str] = mapped_column(String(255))
    preferred_language: Mapped[str] = mapped_column(String(5), default="en")
    village: Mapped[str | None] = mapped_column(String(120), nullable=True)
    district: Mapped[str | None] = mapped_column(String(120), nullable=True)
    state: Mapped[str] = mapped_column(String(80), default="Telangana")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )

    farms: Mapped[list["Farm"]] = relationship(
        back_populates="owner",
        cascade="all, delete-orphan",
    )


class Farm(Base):
    __tablename__ = "farms"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    owner_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
    )
    name: Mapped[str] = mapped_column(String(120))
    village: Mapped[str | None] = mapped_column(
        String(120),
        nullable=True,
    )
    district: Mapped[str | None] = mapped_column(
        String(120),
        nullable=True,
    )
    area: Mapped[float] = mapped_column(Float, default=0)
    area_unit: Mapped[str] = mapped_column(String(20), default="acre")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )

    owner: Mapped[User] = relationship(back_populates="farms")

    crop_seasons: Mapped[list["CropSeason"]] = relationship(
        back_populates="farm",
        cascade="all, delete-orphan",
    )


class Crop(Base):
    __tablename__ = "crops"

    id: Mapped[int] = mapped_column(primary_key=True)
    name_en: Mapped[str] = mapped_column(String(80), unique=True)
    name_te: Mapped[str] = mapped_column(String(80))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)


class CropSeason(Base):
    __tablename__ = "crop_seasons"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    owner_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
    )
    farm_id: Mapped[int] = mapped_column(
        ForeignKey("farms.id", ondelete="CASCADE"),
        index=True,
    )
    crop_id: Mapped[int] = mapped_column(
        ForeignKey("crops.id"),
        index=True,
    )
    area: Mapped[float] = mapped_column(Float)
    area_unit: Mapped[str] = mapped_column(String(20), default="acre")
    season: Mapped[str] = mapped_column(String(40), default="Kharif")
    sowing_date: Mapped[date | None] = mapped_column(
        Date,
        nullable=True,
    )
    expected_harvest_date: Mapped[date | None] = mapped_column(
        Date,
        nullable=True,
    )
    status: Mapped[str] = mapped_column(String(20), default="active")
    notes: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )

    farm: Mapped[Farm] = relationship(back_populates="crop_seasons")
    crop: Mapped[Crop] = relationship()


class FarmExpense(Base):
    __tablename__ = "farm_expenses"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    owner_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
    )
    farm_id: Mapped[int] = mapped_column(
        ForeignKey("farms.id", ondelete="CASCADE"),
        index=True,
    )
    crop_season_id: Mapped[int] = mapped_column(
        ForeignKey("crop_seasons.id", ondelete="CASCADE"),
        index=True,
    )
    expense_date: Mapped[date] = mapped_column(Date, index=True)
    category: Mapped[str] = mapped_column(String(40), index=True)
    description: Mapped[str | None] = mapped_column(
        String(200),
        nullable=True,
    )
    quantity: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )
    unit: Mapped[str | None] = mapped_column(
        String(30),
        nullable=True,
    )
    rate: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )
    total_amount: Mapped[float] = mapped_column(Float)
    notes: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )

    farm: Mapped[Farm] = relationship()
    crop_season: Mapped[CropSeason] = relationship()


class CropSale(Base):
    __tablename__ = "crop_sales"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    owner_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
    )
    farm_id: Mapped[int] = mapped_column(
        ForeignKey("farms.id", ondelete="CASCADE"),
        index=True,
    )
    crop_season_id: Mapped[int] = mapped_column(
        ForeignKey("crop_seasons.id", ondelete="CASCADE"),
        index=True,
    )
    sale_date: Mapped[date] = mapped_column(Date, index=True)
    quantity: Mapped[float] = mapped_column(Float)
    unit: Mapped[str] = mapped_column(String(30))
    rate: Mapped[float] = mapped_column(Float)
    total_amount: Mapped[float] = mapped_column(Float)
    buyer: Mapped[str | None] = mapped_column(
        String(150),
        nullable=True,
    )
    market: Mapped[str | None] = mapped_column(
        String(150),
        nullable=True,
    )
    notes: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )

    farm: Mapped[Farm] = relationship()
    crop_season: Mapped[CropSeason] = relationship()


class LabourActivity(Base):
    __tablename__ = "labour_activities"

    id: Mapped[int] = mapped_column(primary_key=True)
    name_en: Mapped[str] = mapped_column(String(100), unique=True)
    name_te: Mapped[str] = mapped_column(
        String(100),
        default="",
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
    )


class Worker(Base):
    __tablename__ = "workers"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    owner_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
    )
    name: Mapped[str] = mapped_column(String(120))
    gender: Mapped[str] = mapped_column(String(12))
    mobile: Mapped[str | None] = mapped_column(
        String(20),
        nullable=True,
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )


class WageRate(Base):
    __tablename__ = "wage_rates"

    __table_args__ = (
        UniqueConstraint(
            "owner_id",
            "activity_id",
            "gender",
            name="uq_owner_activity_gender_wage",
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    owner_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
    )
    activity_id: Mapped[int] = mapped_column(
        ForeignKey("labour_activities.id"),
        index=True,
    )
    gender: Mapped[str] = mapped_column(String(12))
    daily_wage: Mapped[float] = mapped_column(Float)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    activity: Mapped[LabourActivity] = relationship()


class LabourEntry(Base):
    __tablename__ = "labour_entries"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    owner_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
    )
    crop_season_id: Mapped[int] = mapped_column(
        ForeignKey("crop_seasons.id", ondelete="CASCADE"),
        index=True,
    )
    activity_id: Mapped[int] = mapped_column(
        ForeignKey("labour_activities.id"),
        index=True,
    )
    worker_id: Mapped[int | None] = mapped_column(
        ForeignKey("workers.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    entry_mode: Mapped[str] = mapped_column(
        String(16),
        default="group",
    )
    work_date: Mapped[date] = mapped_column(
        Date,
        index=True,
    )
    gender: Mapped[str] = mapped_column(String(12))
    workers_count: Mapped[int] = mapped_column(
        Integer,
        default=1,
    )
    days: Mapped[float] = mapped_column(
        Float,
        default=1,
    )
    daily_wage_snapshot: Mapped[float] = mapped_column(Float)
    total_wage: Mapped[float] = mapped_column(Float)
    notes: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )

    activity: Mapped[LabourActivity] = relationship()
    worker: Mapped[Worker | None] = relationship()
    crop_season: Mapped[CropSeason] = relationship()

    worker_assignments: Mapped[list["LabourEntryWorker"]] = relationship(
        cascade="all, delete-orphan",
        order_by="LabourEntryWorker.id",
    )


class LabourEntryWorker(Base):
    __tablename__ = "labour_entry_workers"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    labour_entry_id: Mapped[int] = mapped_column(
        ForeignKey("labour_entries.id", ondelete="CASCADE"),
        index=True,
    )
    worker_id: Mapped[int | None] = mapped_column(
        ForeignKey("workers.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    worker_name_snapshot: Mapped[str] = mapped_column(
        String(120)
    )
    gender: Mapped[str] = mapped_column(String(12))
    days: Mapped[float] = mapped_column(Float)
    daily_wage_snapshot: Mapped[float] = mapped_column(Float)
    total_wage: Mapped[float] = mapped_column(Float)
    is_unnamed: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
    )

    worker: Mapped[Worker | None] = relationship()


# ============================================================
# PHASE 6B — FIELD OPERATIONS
# ============================================================

class FieldOperation(Base):
    __tablename__ = "field_operations"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    owner_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
    )

    farm_id: Mapped[int] = mapped_column(
        ForeignKey("farms.id", ondelete="CASCADE"),
        index=True,
    )

    crop_season_id: Mapped[int] = mapped_column(
        ForeignKey("crop_seasons.id", ondelete="CASCADE"),
        index=True,
    )

    operation_date: Mapped[date] = mapped_column(
        Date,
        index=True,
    )

    operation_type: Mapped[str] = mapped_column(
        String(40),
        index=True,
    )

    description: Mapped[str | None] = mapped_column(
        String(200),
        nullable=True,
    )

    product_name: Mapped[str | None] = mapped_column(
        String(150),
        nullable=True,
    )

    quantity: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )

    unit: Mapped[str | None] = mapped_column(
        String(30),
        nullable=True,
    )

    cost: Mapped[float] = mapped_column(
        Float,
        default=0,
    )

    notes: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )

    farm: Mapped[Farm] = relationship()
    crop_season: Mapped[CropSeason] = relationship()


# ============================================================
# PHASE 6D — CROP YIELD
# ============================================================

class CropYield(Base):
    __tablename__ = "crop_yields"

    __table_args__ = (
        UniqueConstraint(
            "owner_id",
            "crop_season_id",
            name="uq_owner_crop_yield",
        ),
    )

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    owner_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
    )

    crop_season_id: Mapped[int] = mapped_column(
        ForeignKey("crop_seasons.id", ondelete="CASCADE"),
        index=True,
    )

    expected_quantity: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )

    actual_quantity: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )

    unit: Mapped[str] = mapped_column(
        String(30),
        default="quintal",
    )

    notes: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    crop_season: Mapped[CropSeason] = relationship()