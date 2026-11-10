from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import StreamingResponse

from sqlalchemy import select, func
from sqlalchemy.orm import Session, joinedload, selectinload
from sqlalchemy.exc import IntegrityError

from app.database import get_db
from app.core.rate_limit import limiter
from app.api.deps import get_current_user
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
)

from app.models import (
    User,
    Farm,
    Crop,
    CropSeason,
    LabourActivity,
    Worker,
    WageRate,
    LabourEntry,
    LabourEntryWorker,
    LabourPayment,
    FarmExpense,
    CropSale,
    FieldOperation,
    CropYield,
)

from app.schemas.schemas import (
    RegisterIn,
    LoginIn,
    TokenOut,
    UserOut,
    FarmCreate,
    FarmUpdate,
    FarmOut,
    CropOut,
    CropSeasonCreate,
    CropSeasonUpdate,
    CropSeasonOut,
    DashboardOut,
    WorkerCreate,
    WorkerOut,
    LabourActivityOut,
    WageRateIn,
    WageRateOut,
    LabourEntryCreate,
    LabourEntryUpdate,
    LabourEntryOut,
    LabourSummaryOut,
    LabourPaymentCreate,
    LabourPaymentOut,
    ExpenseCreate,
    ExpenseOut,
    ExpenseSeasonSummaryOut,
    ExpenseSummaryOut,
    SaleCreate,
    SaleOut,
    SaleSeasonSummaryOut,
    SalesSummaryOut,
    ProfitabilitySeasonOut,
    ProfitabilitySummaryOut,
    FieldOperationCreate,
    FieldOperationOut,
    CropYieldUpsert,
    CropYieldOut,
    CropYieldSummaryOut,
)

router = APIRouter()

VALID_GENDERS = {"male", "female", "other"}


# ============================================================
# AUTHENTICATION
# ============================================================

@router.post(
    "/auth/register",
    response_model=TokenOut,
    status_code=201,
)
@limiter.limit("5/10minutes")
def register(
    request: Request,
    payload: RegisterIn,
    db: Session = Depends(get_db),
):
    if payload.preferred_language not in ("en", "te"):
        raise HTTPException(400, "Language must be en or te")

    if db.scalar(
        select(User).where(User.mobile == payload.mobile)
    ):
        raise HTTPException(409, "Mobile number is already registered")

    if payload.email and db.scalar(
        select(User).where(User.email == payload.email)
    ):
        raise HTTPException(409, "Email is already registered")

    user = User(
        **payload.model_dump(exclude={"password"}),
        password_hash=hash_password(payload.password),
    )

    try:
        db.add(user)
        db.commit()
        db.refresh(user)

    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="Mobile number or email is already registered",
        )

    return TokenOut(
        access_token=create_access_token(str(user.id)),
        user=user,
    )


@router.post("/auth/login", response_model=TokenOut)
@limiter.limit("5/minute")
def login(
    request: Request,
    payload: LoginIn,
    db: Session = Depends(get_db),
):
    user = db.scalar(
        select(User).where(User.mobile == payload.mobile)
    )

    if not user or not verify_password(
        payload.password,
        user.password_hash,
    ):
        raise HTTPException(
            status_code=401,
            detail="Incorrect mobile number or password",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=403,
            detail="Account is disabled",
        )

    return TokenOut(
        access_token=create_access_token(str(user.id)),
        user=user,
    )


@router.get("/auth/me", response_model=UserOut)
def me(
    user: User = Depends(get_current_user),
):
    return user


# ============================================================
# FARMS
# ============================================================

@router.post(
    "/farms",
    response_model=FarmOut,
    status_code=201,
)
def create_farm(
    payload: FarmCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    farm = Farm(
        owner_id=user.id,
        **payload.model_dump(),
    )

    db.add(farm)
    db.commit()
    db.refresh(farm)

    return farm


@router.get("/farms", response_model=list[FarmOut])
def list_farms(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return db.scalars(
        select(Farm)
        .where(Farm.owner_id == user.id)
        .order_by(Farm.id.desc())
    ).all()


@router.put("/farms/{farm_id}", response_model=FarmOut)
def update_farm(
    farm_id: int,
    payload: FarmUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    farm = db.scalar(
        select(Farm).where(
            Farm.id == farm_id,
            Farm.owner_id == user.id,
        )
    )

    if not farm:
        raise HTTPException(404, "Farm not found")

    for key, value in payload.model_dump().items():
        setattr(farm, key, value)

    db.commit()
    db.refresh(farm)

    return farm


@router.delete("/farms/{farm_id}", status_code=204)
def delete_farm(
    farm_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    farm = db.scalar(
        select(Farm).where(
            Farm.id == farm_id,
            Farm.owner_id == user.id,
        )
    )

    if not farm:
        raise HTTPException(404, "Farm not found")

    db.delete(farm)
    db.commit()


# ============================================================
# CROPS AND CROP SEASONS
# ============================================================

@router.get("/crops/master", response_model=list[CropOut])
def crop_master(
    db: Session = Depends(get_db),
):
    return db.scalars(
        select(Crop)
        .where(Crop.is_active.is_(True))
        .order_by(Crop.name_en)
    ).all()


@router.post(
    "/crops",
    response_model=CropSeasonOut,
    status_code=201,
)
def create_crop(
    payload: CropSeasonCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    farm = db.scalar(
        select(Farm).where(
            Farm.id == payload.farm_id,
            Farm.owner_id == user.id,
        )
    )

    if not farm:
        raise HTTPException(404, "Farm not found")

    crop = db.get(Crop, payload.crop_id)

    if not crop or not crop.is_active:
        raise HTTPException(404, "Crop not found")

    crop_area_acres = (
        payload.area * 2.47105
        if payload.area_unit == "hectare"
        else payload.area
    )

    farm_area_acres = (
        farm.area * 2.47105
        if farm.area_unit == "hectare"
        else farm.area
    )

    if crop_area_acres > farm_area_acres + 1e-6:
        raise HTTPException(
            400,
            "Crop area cannot exceed the farm's total area",
        )

    season = CropSeason(
        owner_id=user.id,
        **payload.model_dump(),
    )

    db.add(season)
    db.commit()

    return db.scalar(
        select(CropSeason)
        .options(joinedload(CropSeason.crop))
        .where(CropSeason.id == season.id)
    )


@router.get("/crops", response_model=list[CropSeasonOut])
def list_crops(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return db.scalars(
        select(CropSeason)
        .options(joinedload(CropSeason.crop))
        .where(CropSeason.owner_id == user.id)
        .order_by(CropSeason.id.desc())
    ).unique().all()


@router.put(
    "/crops/{season_id}",
    response_model=CropSeasonOut,
)
def update_crop(
    season_id: int,
    payload: CropSeasonUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    season = db.scalar(
        select(CropSeason)
        .options(joinedload(CropSeason.crop))
        .where(
            CropSeason.id == season_id,
            CropSeason.owner_id == user.id,
        )
    )

    if not season:
        raise HTTPException(404, "Crop season not found")

    farm = db.scalar(
        select(Farm).where(
            Farm.id == payload.farm_id,
            Farm.owner_id == user.id,
        )
    )

    crop = db.get(Crop, payload.crop_id)

    if not farm:
        raise HTTPException(404, "Farm not found")

    if not crop or not crop.is_active:
        raise HTTPException(404, "Active crop not found")

    crop_area_acres = (
        payload.area * 2.47105
        if payload.area_unit == "hectare"
        else payload.area
    )

    farm_area_acres = (
        farm.area * 2.47105
        if farm.area_unit == "hectare"
        else farm.area
    )

    if crop_area_acres > farm_area_acres + 1e-6:
        raise HTTPException(
            400,
            "Crop area cannot exceed the farm's total area",
        )

    for key, value in payload.model_dump().items():
        setattr(season, key, value)

    db.commit()

    return db.scalar(
        select(CropSeason)
        .options(joinedload(CropSeason.crop))
        .where(CropSeason.id == season_id)
    )


# ============================================================
# DASHBOARD
# ============================================================

@router.get("/dashboard", response_model=DashboardOut)
def dashboard(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    farms_count = db.scalar(
        select(func.count(Farm.id))
        .where(Farm.owner_id == user.id)
    ) or 0

    active_count = db.scalar(
        select(func.count(CropSeason.id)).where(
            CropSeason.owner_id == user.id,
            CropSeason.status == "active",
        )
    ) or 0

    active_seasons = db.scalars(
        select(CropSeason).where(
            CropSeason.owner_id == user.id,
            CropSeason.status == "active",
        )
    ).all()

    area = sum(
        item.area * 2.47105
        if item.area_unit == "hectare"
        else item.area
        for item in active_seasons
    )

    return DashboardOut(
        farms_count=farms_count,
        active_crops_count=active_count,
        cultivated_area=round(area, 2),
        area_unit="acre",
    )


# ============================================================
# LABOUR ACTIVITIES
# ============================================================

@router.get(
    "/labour/activities",
    response_model=list[LabourActivityOut],
)
def labour_activities(
    db: Session = Depends(get_db),
):
    return db.scalars(
        select(LabourActivity)
        .where(LabourActivity.is_active.is_(True))
        .order_by(LabourActivity.name_en)
    ).all()


# ============================================================
# WORKERS
# ============================================================

@router.get(
    "/labour/workers",
    response_model=list[WorkerOut],
)
def list_workers(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return db.scalars(
        select(Worker)
        .where(
            Worker.owner_id == user.id,
            Worker.is_active.is_(True),
        )
        .order_by(Worker.name)
    ).all()


@router.post(
    "/labour/workers",
    response_model=WorkerOut,
    status_code=201,
)
def create_worker(
    payload: WorkerCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    if payload.gender not in VALID_GENDERS:
        raise HTTPException(
            400,
            "Gender must be male, female or other",
        )

    worker = Worker(
        owner_id=user.id,
        **payload.model_dump(),
    )

    db.add(worker)
    db.commit()
    db.refresh(worker)

    return worker


# ============================================================
# WAGE RATES
# ============================================================

@router.get(
    "/labour/wage-rates",
    response_model=list[WageRateOut],
)
def list_wage_rates(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return db.scalars(
        select(WageRate)
        .options(joinedload(WageRate.activity))
        .where(WageRate.owner_id == user.id)
        .order_by(
            WageRate.activity_id,
            WageRate.gender,
        )
    ).unique().all()


@router.put(
    "/labour/wage-rates",
    response_model=WageRateOut,
)
def save_wage_rate(
    payload: WageRateIn,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    if payload.gender not in VALID_GENDERS:
        raise HTTPException(
            400,
            "Gender must be male, female or other",
        )

    activity = db.get(
        LabourActivity,
        payload.activity_id,
    )

    if not activity or not activity.is_active:
        raise HTTPException(
            404,
            "Labour activity not found",
        )

    rate = db.scalar(
        select(WageRate).where(
            WageRate.owner_id == user.id,
            WageRate.activity_id == payload.activity_id,
            WageRate.gender == payload.gender,
        )
    )

    if rate:
        rate.daily_wage = payload.daily_wage
    else:
        rate = WageRate(
            owner_id=user.id,
            **payload.model_dump(),
        )
        db.add(rate)

    db.commit()
    db.refresh(rate)

    return db.scalar(
        select(WageRate)
        .options(joinedload(WageRate.activity))
        .where(WageRate.id == rate.id)
    )
# ============================================================
# LABOUR ENTRY CREATION
# ============================================================

@router.post(
    "/labour/entries",
    response_model=LabourEntryOut,
    status_code=201,
)
def create_labour_entry(
    payload: LabourEntryCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    if payload.entry_mode not in {"group", "individual"}:
        raise HTTPException(
            400,
            "Entry mode must be group or individual",
        )

    if payload.days <= 0:
        raise HTTPException(400, "Days must be greater than zero")

    if payload.daily_wage is not None and payload.daily_wage <= 0:
        raise HTTPException(400, "Daily wage must be greater than zero")

    crop = db.scalar(
        select(CropSeason).where(
            CropSeason.id == payload.crop_season_id,
            CropSeason.owner_id == user.id,
        )
    )

    if not crop:
        raise HTTPException(404, "Crop season not found")

    activity = db.get(
        LabourActivity,
        payload.activity_id,
    )

    if not activity or not activity.is_active:
        raise HTTPException(404, "Labour activity not found")

    assignments = []
    selected_workers = []
    unnamed_count = 0

    # --------------------------------------------------------
    # INDIVIDUAL ENTRY
    # --------------------------------------------------------

    if payload.entry_mode == "individual":

        if not payload.worker_id:
            raise HTTPException(
                400,
                "Select a worker for individual entry",
            )

        if payload.worker_ids or payload.unnamed_workers_count:
            raise HTTPException(
                400,
                "Individual entry cannot contain group workers",
            )

        selected = db.scalar(
            select(Worker).where(
                Worker.id == payload.worker_id,
                Worker.owner_id == user.id,
                Worker.is_active.is_(True),
            )
        )

        if not selected:
            raise HTTPException(404, "Worker not found")

        selected_workers = [selected]

    # --------------------------------------------------------
    # GROUP ENTRY
    # --------------------------------------------------------

    else:

        if payload.worker_id:
            raise HTTPException(
                400,
                "Use worker_ids for named group workers",
            )

        if len(set(payload.worker_ids)) != len(payload.worker_ids):
            raise HTTPException(
                400,
                "A worker can only be selected once",
            )

        selected_workers = (
            db.scalars(
                select(Worker).where(
                    Worker.id.in_(payload.worker_ids),
                    Worker.owner_id == user.id,
                    Worker.is_active.is_(True),
                )
            ).all()
            if payload.worker_ids
            else []
        )

        if len(selected_workers) != len(payload.worker_ids):
            raise HTTPException(
                404,
                "One or more selected workers were not found",
            )

        unnamed_count = payload.unnamed_workers_count

        if unnamed_count < 0:
            raise HTTPException(
                400,
                "Unnamed worker count cannot be negative",
            )

        if not selected_workers and unnamed_count < 1:
            raise HTTPException(
                400,
                "Select named workers or enter an unnamed worker count",
            )

    # --------------------------------------------------------
    # CALCULATE WORKER WAGES
    # --------------------------------------------------------

    total = 0.0
    genders = set()

    for worker in selected_workers:

        saved_rate = db.scalar(
            select(WageRate).where(
                WageRate.owner_id == user.id,
                WageRate.activity_id == payload.activity_id,
                WageRate.gender == worker.gender,
            )
        )

        rate = (
            payload.daily_wage
            if payload.daily_wage is not None
            else (
                saved_rate.daily_wage
                if saved_rate
                else None
            )
        )

        if rate is None:
            raise HTTPException(
                400,
                f"Set a {worker.gender} wage rate for this activity "
                "or enter a daily wage",
            )

        if rate <= 0:
            raise HTTPException(
                400,
                "Daily wage must be greater than zero",
            )

        amount = round(payload.days * rate, 2)

        total += amount
        genders.add(worker.gender)

        assignments.append(
            {
                "worker_id": worker.id,
                "worker_name_snapshot": worker.name,
                "gender": worker.gender,
                "days": payload.days,
                "daily_wage_snapshot": rate,
                "total_wage": amount,
                "paid_amount": 0,
                "is_unnamed": False,
            }
        )

    # --------------------------------------------------------
    # UNNAMED WORKERS
    # --------------------------------------------------------

    if unnamed_count:

        if payload.gender not in VALID_GENDERS:
            raise HTTPException(
                400,
                "Choose a valid gender for unnamed workers",
            )

        saved_rate = db.scalar(
            select(WageRate).where(
                WageRate.owner_id == user.id,
                WageRate.activity_id == payload.activity_id,
                WageRate.gender == payload.gender,
            )
        )

        rate = (
            payload.daily_wage
            if payload.daily_wage is not None
            else (
                saved_rate.daily_wage
                if saved_rate
                else None
            )
        )

        if rate is None:
            raise HTTPException(
                400,
                "Set a wage rate first or enter a daily wage",
            )

        if rate <= 0:
            raise HTTPException(
                400,
                "Daily wage must be greater than zero",
            )

        amount = round(
            unnamed_count * payload.days * rate,
            2,
        )

        total += amount
        genders.add(payload.gender)

        assignments.append(
            {
                "worker_id": None,
                "worker_name_snapshot": (
                    f"Unnamed {payload.gender} workers"
                ),
                "gender": payload.gender,
                "days": payload.days,
                "daily_wage_snapshot": rate,
                "total_wage": amount,
                "paid_amount": 0,
                "is_unnamed": True,
            }
        )

    # --------------------------------------------------------
    # CREATE PARENT LABOUR ENTRY
    # --------------------------------------------------------

    count = len(selected_workers) + unnamed_count

    weighted_rate = (
        round(total / (count * payload.days), 2)
        if count and payload.days
        else 0
    )

    entry_gender = (
        next(iter(genders))
        if len(genders) == 1
        else "mixed"
    )

    entry = LabourEntry(
        owner_id=user.id,
        crop_season_id=payload.crop_season_id,
        activity_id=payload.activity_id,
        worker_id=(
            payload.worker_id
            if payload.entry_mode == "individual"
            else None
        ),
        entry_mode=payload.entry_mode,
        work_date=payload.work_date,
        gender=entry_gender,
        workers_count=count,
        days=payload.days,
        daily_wage_snapshot=weighted_rate,
        total_wage=round(total, 2),
        notes=payload.notes,
    )

    try:
        db.add(entry)
        db.flush()

        for item in assignments:
            db.add(
                LabourEntryWorker(
                    labour_entry_id=entry.id,
                    **item,
                )
            )

        db.commit()

    except Exception:
        db.rollback()
        raise

    return db.scalar(
        select(LabourEntry)
        .options(
            joinedload(LabourEntry.activity),
            selectinload(
                LabourEntry.worker_assignments
            ).selectinload(
                LabourEntryWorker.payments
            ),
        )
        .where(
            LabourEntry.id == entry.id,
            LabourEntry.owner_id == user.id,
        )
    )


# ============================================================
# LIST LABOUR ENTRIES
# ============================================================

@router.get(
    "/labour/entries",
    response_model=list[LabourEntryOut],
)
def list_labour_entries(
    crop_season_id: int | None = None,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    query = (
        select(LabourEntry)
        .options(
            joinedload(LabourEntry.activity),
            selectinload(
                LabourEntry.worker_assignments
            ).selectinload(
                LabourEntryWorker.payments
            ),
        )
        .where(
            LabourEntry.owner_id == user.id
        )
    )

    if crop_season_id is not None:
        query = query.where(
            LabourEntry.crop_season_id == crop_season_id
        )

    return db.scalars(
        query.order_by(
            LabourEntry.work_date.desc(),
            LabourEntry.id.desc(),
        )
    ).unique().all()


# ============================================================
# UPDATE LABOUR ENTRY
# ============================================================

@router.put(
    "/labour/entries/{entry_id}",
    response_model=LabourEntryOut,
)
def update_labour_entry(
    entry_id: int,
    payload: LabourEntryUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    entry = db.scalar(
        select(LabourEntry)
        .options(
            joinedload(LabourEntry.activity),
            selectinload(
                LabourEntry.worker_assignments
            ).selectinload(
                LabourEntryWorker.payments
            ),
        )
        .where(
            LabourEntry.id == entry_id,
            LabourEntry.owner_id == user.id,
        )
    )

    if not entry:
        raise HTTPException(
            404,
            "Labour entry not found",
        )

    if not entry.worker_assignments:
        raise HTTPException(
            400,
            "Labour entry has no worker assignments",
        )

    if payload.days <= 0:
        raise HTTPException(
            400,
            "Days must be greater than zero",
        )

    if payload.daily_wage is not None and payload.daily_wage <= 0:
        raise HTTPException(
            400,
            "Daily wage must be greater than zero",
        )

    try:
        total = 0.0

        named_workers = sum(
            1
            for assignment in entry.worker_assignments
            if not assignment.is_unnamed
        )

        unnamed_assignments = [
            assignment
            for assignment in entry.worker_assignments
            if assignment.is_unnamed
        ]

        # The creation workflow creates at most one unnamed
        # assignment. Reject inconsistent legacy data.
        if len(unnamed_assignments) > 1:
            raise HTTPException(
                400,
                "Multiple unnamed assignments found. "
                "Please review this entry before editing.",
            )

        unnamed_count = entry.workers_count - named_workers

        if unnamed_count < 0:
            raise HTTPException(
                400,
                "Invalid worker assignment data",
            )

        if unnamed_assignments and unnamed_count < 1:
            raise HTTPException(
                400,
                "Invalid unnamed worker count",
            )

        for assignment in entry.worker_assignments:

            quantity = (
                unnamed_count
                if assignment.is_unnamed
                else 1
            )

            rate = (
                payload.daily_wage
                if payload.daily_wage is not None
                else assignment.daily_wage_snapshot
            )

            amount = round(
                quantity * payload.days * rate,
                2,
            )

            paid = round(
                float(assignment.paid_amount or 0),
                2,
            )

            # Prevent editing an earned amount below payments
            # already recorded against this assignment.
            if paid > amount + 0.01:
                raise HTTPException(
                    400,
                    "Updated earned wage cannot be less than "
                    "the amount already paid",
                )

            assignment.days = payload.days
            assignment.daily_wage_snapshot = rate
            assignment.total_wage = amount

            total += amount

        entry.work_date = payload.work_date
        entry.days = payload.days
        entry.notes = payload.notes
        entry.total_wage = round(total, 2)

        if entry.workers_count > 0 and payload.days > 0:
            entry.daily_wage_snapshot = round(
                total / (entry.workers_count * payload.days),
                2,
            )

        db.commit()

    except Exception:
        db.rollback()
        raise

    return db.scalar(
        select(LabourEntry)
        .options(
            joinedload(LabourEntry.activity),
            selectinload(
                LabourEntry.worker_assignments
            ).selectinload(
                LabourEntryWorker.payments
            ),
        )
        .where(
            LabourEntry.id == entry.id,
            LabourEntry.owner_id == user.id,
        )
    )


# ============================================================
# RECORD LABOUR PAYMENT
# ============================================================

@router.post(
    "/labour/assignments/{assignment_id}/payment",
    response_model=LabourEntryOut,
)
def pay_labour_assignment(
    assignment_id: int,
    payload: LabourPaymentCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    # Lock the assignment row where supported by the database.
    # This helps prevent concurrent payments exceeding the balance.
    assignment = db.scalar(
        select(LabourEntryWorker)
        .join(
            LabourEntry,
            LabourEntry.id == LabourEntryWorker.labour_entry_id,
        )
        .where(
            LabourEntryWorker.id == assignment_id,
            LabourEntry.owner_id == user.id,
        )
        .with_for_update()
    )

    if not assignment:
        raise HTTPException(
            404,
            "Labour worker assignment not found",
        )

    amount = round(float(payload.amount), 2)

    if amount <= 0:
        raise HTTPException(
            400,
            "Payment amount must be greater than zero",
        )

    earned = round(
        float(assignment.total_wage or 0),
        2,
    )

    paid = round(
        float(assignment.paid_amount or 0),
        2,
    )

    remaining = round(
        earned - paid,
        2,
    )

    if remaining <= 0:
        raise HTTPException(
            400,
            "This worker assignment is already fully paid",
        )

    if amount > remaining + 0.001:
        raise HTTPException(
            400,
            f"Payment cannot exceed remaining amount "
            f"of ₹{remaining:.2f}",
        )

    try:
        # Create an actual payment-history record.
        payment = LabourPayment(
            labour_entry_worker_id=assignment.id,
            payment_date=payload.payment_date,
            amount=amount,
            payment_method=payload.payment_method.strip().lower(),
            remarks=payload.remarks,
        )

        db.add(payment)

        # Maintain the running paid amount.
        assignment.paid_amount = round(
            paid + amount,
            2,
        )

        db.commit()

    except Exception:
        db.rollback()
        raise

    return db.scalar(
        select(LabourEntry)
        .options(
            joinedload(LabourEntry.activity),
            selectinload(
                LabourEntry.worker_assignments
            ).selectinload(
                LabourEntryWorker.payments
            ),
        )
        .where(
            LabourEntry.id == assignment.labour_entry_id,
            LabourEntry.owner_id == user.id,
        )
    )


# ============================================================
# GET PAYMENT HISTORY FOR ONE ASSIGNMENT
# ============================================================

@router.get(
    "/labour/assignments/{assignment_id}/payments",
    response_model=list[LabourPaymentOut],
)
def list_labour_assignment_payments(
    assignment_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    assignment = db.scalar(
        select(LabourEntryWorker)
        .join(
            LabourEntry,
            LabourEntry.id == LabourEntryWorker.labour_entry_id,
        )
        .where(
            LabourEntryWorker.id == assignment_id,
            LabourEntry.owner_id == user.id,
        )
    )

    if not assignment:
        raise HTTPException(
            404,
            "Labour worker assignment not found",
        )

    return db.scalars(
        select(LabourPayment)
        .where(
            LabourPayment.labour_entry_worker_id == assignment_id
        )
        .order_by(
            LabourPayment.payment_date.desc(),
            LabourPayment.id.desc(),
        )
    ).all()


# ============================================================
# DELETE WORKER
# ============================================================

@router.delete(
    "/labour/workers/{worker_id}",
    status_code=204,
)
def delete_worker(
    worker_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    worker = db.scalar(
        select(Worker).where(
            Worker.id == worker_id,
            Worker.owner_id == user.id,
        )
    )

    if not worker:
        raise HTTPException(
            404,
            "Worker not found",
        )

    # Soft delete preserves historical labour records.
    worker.is_active = False

    db.commit()


# ============================================================
# DELETE WAGE RATE
# ============================================================

@router.delete(
    "/labour/wage-rates/{rate_id}",
    status_code=204,
)
def delete_wage_rate(
    rate_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    rate = db.scalar(
        select(WageRate).where(
            WageRate.id == rate_id,
            WageRate.owner_id == user.id,
        )
    )

    if not rate:
        raise HTTPException(
            404,
            "Wage rate not found",
        )

    db.delete(rate)
    db.commit()


# ============================================================
# DELETE LABOUR ENTRY
# ============================================================

@router.delete(
    "/labour/entries/{entry_id}",
    status_code=204,
)
def delete_labour_entry(
    entry_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    entry = db.scalar(
        select(LabourEntry)
        .options(
            selectinload(
                LabourEntry.worker_assignments
            ).selectinload(
                LabourEntryWorker.payments
            )
        )
        .where(
            LabourEntry.id == entry_id,
            LabourEntry.owner_id == user.id,
        )
    )

    if not entry:
        raise HTTPException(
            404,
            "Labour entry not found",
        )

    # Prevent accidental destruction of financial history.
    has_payments = any(
        assignment.payments
        for assignment in entry.worker_assignments
    )

    if has_payments:
        raise HTTPException(
            400,
            "This labour entry has payment history and cannot "
            "be deleted. Preserve the financial records.",
        )

    try:
        for assignment in list(entry.worker_assignments):
            db.delete(assignment)

        db.flush()

        db.delete(entry)
        db.commit()

    except Exception:
        db.rollback()
        raise


# ============================================================
# LABOUR SUMMARY
# ============================================================

@router.get(
    "/labour/summary",
    response_model=LabourSummaryOut,
)
def labour_summary(
    crop_season_id: int | None = None,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    query = select(LabourEntry).where(
        LabourEntry.owner_id == user.id
    )

    if crop_season_id is not None:
        query = query.where(
            LabourEntry.crop_season_id == crop_season_id
        )

    entries = db.scalars(query).all()

    return LabourSummaryOut(
        total_amount=round(
            sum(item.total_wage for item in entries),
            2,
        ),
        entries_count=len(entries),
        total_worker_days=round(
            sum(
                item.workers_count * item.days
                for item in entries
            ),
            2,
        ),
    )
# ============================================================
# LABOUR PAYMENT HISTORY
# ============================================================

@router.post(
    "/labour/assignments/{assignment_id}/payments",
    response_model=LabourEntryOut,
)
def pay_labour_assignment(
    assignment_id: int,
    payload: LabourPaymentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    assignment = (
        db.query(LabourEntryWorker)
        .join(LabourEntry)
        .filter(
            LabourEntryWorker.id == assignment_id,
            LabourEntry.user_id == current_user.id,
        )
        .with_for_update()
        .first()
    )

    if not assignment:
        raise HTTPException(
            status_code=404,
            detail="Labour assignment not found",
        )

    remaining = round(
        float(assignment.total_wage) - float(assignment.paid_amount or 0),
        2,
    )

    amount = round(float(payload.amount), 2)

    if amount <= 0:
        raise HTTPException(
            status_code=400,
            detail="Payment amount must be greater than zero",
        )

    if amount > remaining + 0.01:
        raise HTTPException(
            status_code=400,
            detail=f"Payment exceeds remaining balance of {remaining:.2f}",
        )

    payment = LabourPayment(
        labour_entry_worker_id=assignment.id,
        payment_date=payload.payment_date,
        amount=amount,
        payment_method=payload.payment_method,
        remarks=payload.remarks,
    )

    assignment.paid_amount = round(
        float(assignment.paid_amount or 0) + amount,
        2,
    )

    db.add(payment)

    try:
        db.commit()
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Unable to save labour payment",
        )

    entry = (
        db.query(LabourEntry)
        .options(
            joinedload(LabourEntry.activity),
            joinedload(LabourEntry.worker),
            selectinload(LabourEntry.worker_assignments).selectinload(
                LabourEntryWorker.payments
            ),
        )
        .filter(LabourEntry.id == assignment.labour_entry_id)
        .first()
    )

    return entry


@router.get(
    "/labour/assignments/{assignment_id}/payments",
    response_model=list[LabourPaymentOut],
)
def get_labour_payment_history(
    assignment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    assignment = (
        db.query(LabourEntryWorker.id)
        .join(LabourEntry)
        .filter(
            LabourEntryWorker.id == assignment_id,
            LabourEntry.user_id == current_user.id,
        )
        .first()
    )

    if not assignment:
        raise HTTPException(
            status_code=404,
            detail="Labour assignment not found",
        )

    payments = (
        db.query(LabourPayment)
        .filter(
            LabourPayment.labour_entry_worker_id == assignment_id
        )
        .order_by(
            LabourPayment.payment_date.desc(),
            LabourPayment.id.desc(),
        )
        .all()
    )

    return payments
# ============================================================
# LABOUR PAYMENT SUMMARY
# ============================================================

@router.get(
    "/labour/assignments/{assignment_id}/balance",
)
def get_labour_assignment_balance(
    assignment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    assignment = (
        db.query(LabourEntryWorker)
        .join(LabourEntry)
        .filter(
            LabourEntryWorker.id == assignment_id,
            LabourEntry.user_id == current_user.id,
        )
        .first()
    )

    if not assignment:
        raise HTTPException(
            status_code=404,
            detail="Labour assignment not found",
        )

    total_wage = round(float(assignment.total_wage or 0), 2)
    paid_amount = round(float(assignment.paid_amount or 0), 2)
    remaining_amount = round(total_wage - paid_amount, 2)

    return {
        "assignment_id": assignment.id,
        "total_wage": total_wage,
        "paid_amount": paid_amount,
        "remaining_amount": max(remaining_amount, 0),
        "payment_status": (
            "paid"
            if remaining_amount <= 0.01
            else "partially_paid"
            if paid_amount > 0
            else "unpaid"
        ),
    }