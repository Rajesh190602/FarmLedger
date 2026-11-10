from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field, EmailStr, field_validator

class RegisterIn(BaseModel):
    full_name: str = Field(min_length=2, max_length=120)
    mobile: str = Field(min_length=10, max_length=20)
    email: EmailStr | None = None
    password: str = Field(min_length=8)

    preferred_language: str = "en"
    village: str | None = None
    district: str | None = None
    state: str = "Telangana"

    @field_validator("password")
    @classmethod
    def validate_password_bytes(cls, value: str) -> str:
        if len(value.encode("utf-8")) > 72:
            raise ValueError("Password cannot exceed 72 UTF-8 bytes")
        return value


class LoginIn(BaseModel):
    mobile: str
    password: str

    @field_validator("password")
    @classmethod
    def validate_password_bytes(cls, value: str) -> str:
        if len(value.encode("utf-8")) > 72:
            raise ValueError("Invalid password length")
        return value



class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    full_name: str
    mobile: str
    email: str | None
    preferred_language: str
    village: str | None
    district: str | None
    state: str


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class FarmCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    village: str | None = None
    district: str | None = None
    area: float = Field(ge=0)
    area_unit: str = "acre"


class FarmUpdate(FarmCreate):
    pass


class FarmOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    village: str | None
    district: str | None
    area: float
    area_unit: str


class CropOut(BaseModel):
    id: int
    name_en: str
    name_te: str


class CropSeasonCreate(BaseModel):
    farm_id: int
    crop_id: int
    area: float = Field(gt=0)
    area_unit: str = "acre"
    season: str = "Kharif"
    sowing_date: date | None = None
    expected_harvest_date: date | None = None
    status: str = "active"
    notes: str | None = None


class CropSeasonUpdate(CropSeasonCreate):
    pass


class CropSeasonOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    farm_id: int
    crop_id: int
    area: float
    area_unit: str
    season: str
    sowing_date: date | None
    expected_harvest_date: date | None
    status: str
    notes: str | None
    crop: CropOut


class DashboardOut(BaseModel):
    farms_count: int
    active_crops_count: int
    cultivated_area: float
    area_unit: str


class WorkerCreate(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    gender: str
    mobile: str | None = None


class WorkerOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    gender: str
    mobile: str | None
    is_active: bool


class LabourActivityOut(BaseModel):
    id: int
    name_en: str
    name_te: str


class WageRateIn(BaseModel):
    activity_id: int
    gender: str
    daily_wage: float = Field(gt=0, le=100000)


class WageRateOut(BaseModel):
    id: int
    activity_id: int
    gender: str
    daily_wage: float
    activity: LabourActivityOut

    model_config = ConfigDict(from_attributes=True)


class LabourEntryCreate(BaseModel):
    crop_season_id: int
    activity_id: int
    entry_mode: str = "group"
    worker_id: int | None = None
    worker_ids: list[int] = Field(default_factory=list)
    unnamed_workers_count: int = Field(
        default=0,
        ge=0,
        le=1000,
    )
    work_date: date
    gender: str
    workers_count: int = Field(
        default=1,
        ge=1,
        le=1000,
    )
    days: float = Field(
        default=1,
        gt=0,
        le=365,
    )
    daily_wage: float | None = Field(
        default=None,
        gt=0,
        le=100000,
    )
    notes: str | None = Field(
        default=None,
        max_length=500,
    )
class LabourPaymentCreate(BaseModel):
    amount: float = Field(gt=0, le=100000000)
    payment_date: date = Field(default_factory=date.today)
    payment_method: str = Field(
        default="cash",
        min_length=1,
        max_length=30,
    )
    remarks: str | None = Field(
        default=None,
        max_length=500,
    )
class LabourPaymentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    labour_entry_worker_id: int
    payment_date: date
    amount: float
    payment_method: str
    remarks: str | None
    created_at: datetime

class LabourEntryUpdate(BaseModel):
    work_date: date
    days: float = Field(gt=0, le=365)
    daily_wage: float | None = Field(
        default=None,
        gt=0,
        le=100000
    )
    notes: str | None = Field(
        default=None,
        max_length=500
    )

class LabourWorkerAssignmentOut(BaseModel):
    id: int
    worker_id: int | None
    worker_name_snapshot: str
    gender: str
    days: float
    daily_wage_snapshot: float
    total_wage: float

    # Retained for compatibility with existing records.
    paid_amount: float = 0

    is_unnamed: bool

    # Individual payment history.
    payments: list[LabourPaymentOut] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)


class LabourEntryOut(BaseModel):
    id: int
    crop_season_id: int
    activity_id: int
    worker_id: int | None
    entry_mode: str
    work_date: date
    gender: str
    workers_count: int
    days: float
    daily_wage_snapshot: float
    total_wage: float
    notes: str | None
    activity: LabourActivityOut
    worker_assignments: list[LabourWorkerAssignmentOut] = Field(
        default_factory=list
    )

    model_config = ConfigDict(from_attributes=True)


class LabourSummaryOut(BaseModel):
    total_amount: float
    entries_count: int
    total_worker_days: float


class ExpenseCreate(BaseModel):
    farm_id: int
    crop_season_id: int
    expense_date: date
    category: str = Field(
        min_length=1,
        max_length=40,
    )
    description: str | None = Field(
        default=None,
        max_length=200,
    )
    quantity: float | None = Field(
        default=None,
        gt=0,
    )
    unit: str | None = Field(
        default=None,
        max_length=30,
    )
    rate: float | None = Field(
        default=None,
        gt=0,
    )
    total_amount: float = Field(
        gt=0,
        le=100000000,
    )
    notes: str | None = Field(
        default=None,
        max_length=500,
    )


class ExpenseOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    farm_id: int
    crop_season_id: int
    expense_date: date
    category: str
    description: str | None
    quantity: float | None
    unit: str | None
    rate: float | None
    total_amount: float
    notes: str | None


class ExpenseSeasonSummaryOut(BaseModel):
    crop_season_id: int
    farm_id: int
    farm_name: str
    crop_id: int
    crop_name_en: str
    crop_name_te: str
    season: str
    area: float
    area_unit: str
    total_expense: float
    expense_entries: int


class ExpenseSummaryOut(BaseModel):
    total_expense: float
    entries_count: int


# =========================
# PHASE 4 — SALES / INCOME
# =========================

class SaleCreate(BaseModel):
    farm_id: int
    crop_season_id: int
    sale_date: date
    quantity: float = Field(gt=0)
    unit: str = Field(
        min_length=1,
        max_length=30,
    )
    rate: float = Field(gt=0)
    total_amount: float = Field(
        gt=0,
        le=100000000,
    )
    buyer: str | None = Field(
        default=None,
        max_length=150,
    )
    market: str | None = Field(
        default=None,
        max_length=150,
    )
    notes: str | None = Field(
        default=None,
        max_length=500,
    )


class SaleOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    farm_id: int
    crop_season_id: int
    sale_date: date
    quantity: float
    unit: str
    rate: float
    total_amount: float
    buyer: str | None
    market: str | None
    notes: str | None


class SaleSeasonSummaryOut(BaseModel):
    crop_season_id: int
    farm_id: int
    farm_name: str
    crop_id: int
    crop_name_en: str
    crop_name_te: str
    season: str
    area: float
    area_unit: str
    total_sales: float
    sale_entries: int


class SalesSummaryOut(BaseModel):
    total_sales: float
    entries_count: int


class ProfitabilitySeasonOut(BaseModel):
    crop_season_id: int
    farm_id: int
    farm_name: str
    crop_id: int
    crop_name_en: str
    crop_name_te: str
    season: str
    area: float
    area_unit: str
    total_sales: float
    other_expenses: float
    labour_cost: float
    field_operation_cost: float
    total_cost: float
    net_profit: float
    margin_percent: float


class ProfitabilitySummaryOut(BaseModel):
    total_sales: float
    other_expenses: float
    labour_cost: float
    field_operation_cost: float
    total_cost: float
    net_profit: float


# ============================================================
# PHASE 6B — FIELD OPERATIONS
# ============================================================

class FieldOperationCreate(BaseModel):
    farm_id: int
    crop_season_id: int
    operation_date: date
    operation_type: str = Field(
        min_length=1,
        max_length=40,
    )
    description: str | None = Field(
        default=None,
        max_length=200,
    )
    product_name: str | None = Field(
        default=None,
        max_length=150,
    )
    quantity: float | None = Field(
        default=None,
        gt=0,
    )
    unit: str | None = Field(
        default=None,
        max_length=30,
    )
    cost: float = Field(
        default=0,
        ge=0,
        le=100000000,
    )
    notes: str | None = Field(
        default=None,
        max_length=500,
    )


class FieldOperationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    farm_id: int
    crop_season_id: int
    operation_date: date
    operation_type: str
    description: str | None
    product_name: str | None
    quantity: float | None
    unit: str | None
    cost: float
    notes: str | None


# ============================================================
# PHASE 6D — CROP YIELD
# ============================================================

class CropYieldUpsert(BaseModel):
    expected_quantity: float | None = Field(
        default=None,
        ge=0,
    )
    actual_quantity: float | None = Field(
        default=None,
        ge=0,
    )
    unit: str = Field(
        min_length=1,
        max_length=30,
    )
    notes: str | None = Field(
        default=None,
        max_length=500,
    )


class CropYieldOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    crop_season_id: int
    expected_quantity: float | None
    actual_quantity: float | None
    unit: str
    notes: str | None
    updated_at: datetime


class CropYieldSummaryOut(BaseModel):
    crop_season_id: int
    farm_id: int
    farm_name: str
    crop_id: int
    crop_name_en: str
    crop_name_te: str
    season: str
    area: float
    area_unit: str

    expected_quantity: float | None
    actual_quantity: float | None
    unit: str | None

    total_sales: float
    total_cost: float
    net_profit: float

    profit_per_acre: float
    roi_percent: float