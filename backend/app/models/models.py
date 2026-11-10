from datetime import datetime, date,timezone

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


# ============================================================
# USER
# ============================================================

class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    full_name: Mapped[str] = mapped_column(String(120), nullable=False)
    mobile: Mapped[str] = mapped_column(String(20), nullable=False)
    email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    preferred_language: Mapped[str] = mapped_column(
        String(5), default="en", nullable=False
    )
    village: Mapped[str | None] = mapped_column(String(120), nullable=True)
    district: Mapped[str | None] = mapped_column(String(120), nullable=True)
    state: Mapped[str] = mapped_column(String(80), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )

    farms = relationship("Farm", back_populates="owner")
    workers = relationship("Worker", back_populates="owner")
    wage_rates = relationship("WageRate", back_populates="owner")
    labour_entries = relationship("LabourEntry", back_populates="owner")
    farm_expenses = relationship("FarmExpense", back_populates="owner")
    crop_sales = relationship("CropSale", back_populates="owner")
    field_operations = relationship("FieldOperation", back_populates="owner")
    crop_yields = relationship("CropYield", back_populates="owner")


# ============================================================
# FARM
# ============================================================

class Farm(Base):
    __tablename__ = "farms"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    owner_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    village: Mapped[str | None] = mapped_column(String(120), nullable=True)
    district: Mapped[str | None] = mapped_column(String(120), nullable=True)
    area: Mapped[float] = mapped_column(Float, nullable=False)
    area_unit: Mapped[str] = mapped_column(String(20), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )

    owner = relationship("User", back_populates="farms")
    crop_seasons = relationship("CropSeason", back_populates="farm")
    farm_expenses = relationship("FarmExpense", back_populates="farm")
    crop_sales = relationship("CropSale", back_populates="farm")
    field_operations = relationship("FieldOperation", back_populates="farm")


# ============================================================
# CROP
# ============================================================

class Crop(Base):
    __tablename__ = "crops"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name_en: Mapped[str] = mapped_column(String(80), nullable=False, unique=True)
    name_te: Mapped[str] = mapped_column(String(80), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    crop_seasons = relationship("CropSeason", back_populates="crop")


# ============================================================
# CROP SEASON
# ============================================================

class CropSeason(Base):
    __tablename__ = "crop_seasons"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    owner_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"), nullable=False
    )
    farm_id: Mapped[int] = mapped_column(
        ForeignKey("farms.id"), nullable=False
    )
    crop_id: Mapped[int] = mapped_column(
        ForeignKey("crops.id"), nullable=False
    )
    area: Mapped[float] = mapped_column(Float, nullable=False)
    area_unit: Mapped[str] = mapped_column(String(20), nullable=False)
    season: Mapped[str] = mapped_column(String(40), nullable=False)
    sowing_date: Mapped[date | None] = mapped_column(
        Date, nullable=True
    )
    expected_harvest_date: Mapped[date | None] = mapped_column(
        Date, nullable=True
    )
    status: Mapped[str] = mapped_column(
        String(20), default="active", nullable=False
    )
    notes: Mapped[str | None] = mapped_column(String(500), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )

    farm = relationship("Farm", back_populates="crop_seasons")
    crop = relationship("Crop", back_populates="crop_seasons")
    labour_entries = relationship("LabourEntry", back_populates="crop_season")
    field_operations = relationship(
        "FieldOperation", back_populates="crop_season"
    )
    crop_yield = relationship(
        "CropYield", back_populates="crop_season", uselist=False
    )
    farm_expenses = relationship("FarmExpense", back_populates="crop_season")
    crop_sales = relationship("CropSale", back_populates="crop_season")


# ============================================================
# FARM EXPENSE
# ============================================================

class FarmExpense(Base):
    __tablename__ = "farm_expenses"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    owner_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"), nullable=False
    )
    farm_id: Mapped[int] = mapped_column(
        ForeignKey("farms.id"), nullable=False
    )
    crop_season_id: Mapped[int] = mapped_column(
        ForeignKey("crop_seasons.id"), nullable=False
    )
    expense_date: Mapped[date] = mapped_column(Date, nullable=False)
    category: Mapped[str] = mapped_column(String(40), nullable=False)
    description: Mapped[str | None] = mapped_column(
        String(200), nullable=True
    )
    quantity: Mapped[float | None] = mapped_column(Float, nullable=True)
    unit: Mapped[str | None] = mapped_column(String(30), nullable=True)
    rate: Mapped[float | None] = mapped_column(Float, nullable=True)
    total_amount: Mapped[float] = mapped_column(Float, nullable=False)
    notes: Mapped[str | None] = mapped_column(String(500), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )

    owner = relationship("User", back_populates="farm_expenses")
    farm = relationship("Farm", back_populates="farm_expenses")
    crop_season = relationship("CropSeason", back_populates="farm_expenses")


# ============================================================
# CROP SALE
# ============================================================

class CropSale(Base):
    __tablename__ = "crop_sales"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    owner_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"), nullable=False
    )
    farm_id: Mapped[int] = mapped_column(
        ForeignKey("farms.id"), nullable=False
    )
    crop_season_id: Mapped[int] = mapped_column(
        ForeignKey("crop_seasons.id"), nullable=False
    )
    sale_date: Mapped[date] = mapped_column(Date, nullable=False)
    quantity: Mapped[float] = mapped_column(Float, nullable=False)
    unit: Mapped[str] = mapped_column(String(30), nullable=False)
    rate: Mapped[float] = mapped_column(Float, nullable=False)
    total_amount: Mapped[float] = mapped_column(Float, nullable=False)
    buyer: Mapped[str | None] = mapped_column(String(150), nullable=True)
    market: Mapped[str | None] = mapped_column(String(150), nullable=True)
    notes: Mapped[str | None] = mapped_column(String(500), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )

    owner = relationship("User", back_populates="crop_sales")
    farm = relationship("Farm", back_populates="crop_sales")
    crop_season = relationship("CropSeason", back_populates="crop_sales")


# ============================================================
# LABOUR ACTIVITY
# ============================================================

class LabourActivity(Base):
    __tablename__ = "labour_activities"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name_en: Mapped[str] = mapped_column(
        String(100), nullable=False, unique=True
    )
    name_te: Mapped[str] = mapped_column(String(100), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    wage_rates = relationship("WageRate", back_populates="activity")
    labour_entries = relationship("LabourEntry", back_populates="activity")


# ============================================================
# WORKER
# ============================================================

class Worker(Base):
    __tablename__ = "workers"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    owner_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    gender: Mapped[str] = mapped_column(String(12), nullable=False)
    mobile: Mapped[str | None] = mapped_column(String(20), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )

    owner = relationship("User", back_populates="workers")
    labour_entries = relationship("LabourEntry", back_populates="worker")
    assignments = relationship(
        "LabourEntryWorker", back_populates="worker"
    )


# ============================================================
# WAGE RATE
# ============================================================

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

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    owner_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"), nullable=False
    )
    activity_id: Mapped[int] = mapped_column(
        ForeignKey("labour_activities.id"), nullable=False
    )
    gender: Mapped[str] = mapped_column(String(12), nullable=False)
    daily_wage: Mapped[float] = mapped_column(Float, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )

    owner = relationship("User", back_populates="wage_rates")
    activity = relationship("LabourActivity", back_populates="wage_rates")


# ============================================================
# LABOUR ENTRY
# ============================================================

class LabourEntry(Base):
    __tablename__ = "labour_entries"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    owner_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"), nullable=False
    )
    crop_season_id: Mapped[int] = mapped_column(
        ForeignKey("crop_seasons.id"), nullable=False
    )
    activity_id: Mapped[int] = mapped_column(
        ForeignKey("labour_activities.id"), nullable=False
    )
    worker_id: Mapped[int | None] = mapped_column(
        ForeignKey("workers.id"), nullable=True
    )
    entry_mode: Mapped[str] = mapped_column(String(16), nullable=False)
    work_date: Mapped[date] = mapped_column(Date, nullable=False)
    gender: Mapped[str] = mapped_column(String(12), nullable=False)
    workers_count: Mapped[int] = mapped_column(Integer, nullable=False)
    days: Mapped[float] = mapped_column(Float, nullable=False)
    daily_wage_snapshot: Mapped[float] = mapped_column(Float, nullable=False)
    total_wage: Mapped[float] = mapped_column(Float, nullable=False)
    notes: Mapped[str | None] = mapped_column(String(500), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )

    owner = relationship("User", back_populates="labour_entries")
    crop_season = relationship("CropSeason", back_populates="labour_entries")
    activity = relationship("LabourActivity", back_populates="labour_entries")
    worker = relationship("Worker", back_populates="labour_entries")
    worker_assignments = relationship(
        "LabourEntryWorker", back_populates="labour_entry"
    )
# ============================================================
# LABOUR ENTRY WORKER
# ============================================================

class LabourEntryWorker(Base):
    __tablename__ = "labour_entry_workers"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    labour_entry_id: Mapped[int] = mapped_column(
        ForeignKey("labour_entries.id"),
        nullable=False,
    )

    worker_id: Mapped[int | None] = mapped_column(
        ForeignKey("workers.id"),
        nullable=True,
    )

    worker_name_snapshot: Mapped[str] = mapped_column(
        String(120),
        nullable=False,
    )

    gender: Mapped[str] = mapped_column(
        String(12),
        nullable=False,
    )

    days: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    daily_wage_snapshot: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    total_wage: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    paid_amount: Mapped[float] = mapped_column(
        Float,
        default=0,
        nullable=False,
    )

    is_unnamed: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )

    labour_entry = relationship(
        "LabourEntry",
        back_populates="worker_assignments",
    )

    worker = relationship(
        "Worker",
        back_populates="assignments",
    )

    payments = relationship(
        "LabourPayment",
        back_populates="labour_entry_worker",
        cascade="all, delete-orphan",
        passive_deletes=True,
        order_by="LabourPayment.payment_date",
    )


# ============================================================
# LABOUR PAYMENT HISTORY
# ============================================================

class LabourPayment(Base):
    __tablename__ = "labour_payments"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    labour_entry_worker_id: Mapped[int] = mapped_column(
        ForeignKey("labour_entry_workers.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    payment_date: Mapped[date] = mapped_column(
        Date,
        nullable=False,
        index=True,
    )

    amount: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    payment_method: Mapped[str] = mapped_column(
        String(30),
        default="cash",
        nullable=False,
    )

    remarks: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    labour_entry_worker = relationship(
        "LabourEntryWorker",
        back_populates="payments",
    )


# ============================================================
# FIELD OPERATION
# ============================================================

class FieldOperation(Base):
    __tablename__ = "field_operations"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    owner_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
    )

    farm_id: Mapped[int] = mapped_column(
        ForeignKey("farms.id"),
        nullable=False,
    )

    crop_season_id: Mapped[int] = mapped_column(
        ForeignKey("crop_seasons.id"),
        nullable=False,
    )

    operation_date: Mapped[date] = mapped_column(
        Date,
        nullable=False,
    )

    operation_type: Mapped[str] = mapped_column(
        String(40),
        nullable=False,
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
        nullable=False,
    )

    notes: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    owner = relationship(
        "User",
        back_populates="field_operations",
    )

    farm = relationship(
        "Farm",
        back_populates="field_operations",
    )

    crop_season = relationship(
        "CropSeason",
        back_populates="field_operations",
    )


# ============================================================
# CROP YIELD
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
        Integer,
        primary_key=True,
        index=True,
    )

    owner_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
    )

    crop_season_id: Mapped[int] = mapped_column(
        ForeignKey("crop_seasons.id"),
        nullable=False,
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
        nullable=False,
    )

    notes: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    owner = relationship(
        "User",
        back_populates="crop_yields",
    )

    crop_season = relationship(
        "CropSeason",
        back_populates="crop_yield",
    )