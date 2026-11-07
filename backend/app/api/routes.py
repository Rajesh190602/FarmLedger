from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import select, func
from app.database import get_db
from app.core.rate_limit import limiter
from sqlalchemy.exc import IntegrityError
from app.api.deps import get_current_user
from app.models import User, Farm, Crop, CropSeason, LabourActivity, Worker, WageRate, LabourEntry, LabourEntryWorker, FarmExpense, CropSale, FieldOperation, CropYield
from app.schemas.schemas import RegisterIn, LoginIn, TokenOut, UserOut, FarmCreate, FarmUpdate, FarmOut, CropOut, CropSeasonCreate, CropSeasonUpdate, CropSeasonOut, DashboardOut, WorkerCreate, WorkerOut, LabourActivityOut, WageRateIn, WageRateOut, LabourEntryCreate, LabourEntryOut, LabourSummaryOut, ExpenseCreate, ExpenseOut, ExpenseSeasonSummaryOut,LabourEntryUpdate, ExpenseSummaryOut, SaleCreate, SaleOut, SaleSeasonSummaryOut, SalesSummaryOut, ProfitabilitySeasonOut, ProfitabilitySummaryOut, FieldOperationCreate, FieldOperationOut, CropYieldUpsert, CropYieldOut, CropYieldSummaryOut
from app.core.security import hash_password, verify_password, create_access_token

router = APIRouter()
@router.post("/auth/register", response_model=TokenOut, status_code=201)
@limiter.limit("5/10minutes")
def register(
    request: Request,
    payload: RegisterIn,
    db: Session = Depends(get_db),
):
    if payload.preferred_language not in ("en", "te"):
        raise HTTPException(400, "Language must be en or te")

    if db.scalar(select(User).where(User.mobile == payload.mobile)):
        raise HTTPException(409, "Mobile number is already registered")

    if payload.email and db.scalar(select(User).where(User.email == payload.email)):
        raise HTTPException(409, "Email is already registered")

    user = User(
        **payload.model_dump(exclude={"password"}),
        password_hash=hash_password(payload.password)
    )

    try:
        db.add(user)
        db.commit()
        db.refresh(user)

    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="Mobile number or email is already registered"
        )

    except Exception:
        db.rollback()
        raise

    return TokenOut(
        access_token=create_access_token(str(user.id)),
        user=user
    )


    @router.post("/auth/login", response_model=TokenOut)
    @limiter.limit("5/minute")
    def login(
        request: Request,
        payload: LoginIn,
        db: Session = Depends(get_db),
    ):
        user = db.scalar(select(User).where(User.mobile == payload.mobile))
        if not user or not verify_password(payload.password, user.password_hash):
            raise HTTPException(status_code=401, detail="Incorrect mobile number or password")
        if not user.is_active:
            raise HTTPException(status_code=403, detail="Account is disabled")
        return TokenOut(access_token=create_access_token(str(user.id)), user=user)

@router.get("/auth/me", response_model=UserOut)
def me(user: User = Depends(get_current_user)):
    return user

@router.post("/farms", response_model=FarmOut, status_code=201)
def create_farm(payload: FarmCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    farm = Farm(owner_id=user.id, **payload.model_dump()); db.add(farm); db.commit(); db.refresh(farm); return farm

@router.get("/farms", response_model=list[FarmOut])
def list_farms(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return db.scalars(select(Farm).where(Farm.owner_id == user.id).order_by(Farm.id.desc())).all()

@router.put("/farms/{farm_id}", response_model=FarmOut)
def update_farm(farm_id: int, payload: FarmUpdate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    farm = db.scalar(select(Farm).where(Farm.id == farm_id, Farm.owner_id == user.id))
    if not farm: raise HTTPException(404, "Farm not found")
    for key, value in payload.model_dump().items(): setattr(farm, key, value)
    db.commit(); db.refresh(farm); return farm

@router.delete("/farms/{farm_id}", status_code=204)
def delete_farm(farm_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    farm = db.scalar(select(Farm).where(Farm.id == farm_id, Farm.owner_id == user.id))
    if not farm: raise HTTPException(404, "Farm not found")
    db.delete(farm); db.commit()

@router.get("/crops/master", response_model=list[CropOut])
def crop_master(db: Session = Depends(get_db)):
    return db.scalars(select(Crop).where(Crop.is_active.is_(True)).order_by(Crop.name_en)).all()

@router.post("/crops", response_model=CropSeasonOut, status_code=201)
def create_crop(payload: CropSeasonCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    farm = db.scalar(select(Farm).where(Farm.id == payload.farm_id, Farm.owner_id == user.id))
    if not farm: raise HTTPException(404, "Farm not found")
    crop = db.get(Crop, payload.crop_id)
    if not crop or not crop.is_active: raise HTTPException(404, "Crop not found")
    crop_area_acres = payload.area * 2.47105 if payload.area_unit == "hectare" else payload.area
    farm_area_acres = farm.area * 2.47105 if farm.area_unit == "hectare" else farm.area
    if crop_area_acres > farm_area_acres + 1e-6: raise HTTPException(400, "Crop area cannot exceed the farm's total area")
    season = CropSeason(owner_id=user.id, **payload.model_dump())
    db.add(season); db.commit()
    return db.scalar(select(CropSeason).options(joinedload(CropSeason.crop)).where(CropSeason.id == season.id))

@router.get("/crops", response_model=list[CropSeasonOut])
def list_crops(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return db.scalars(select(CropSeason).options(joinedload(CropSeason.crop)).where(CropSeason.owner_id == user.id).order_by(CropSeason.id.desc())).unique().all()

@router.put("/crops/{season_id}", response_model=CropSeasonOut)
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
@router.get("/dashboard", response_model=DashboardOut)
def dashboard(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    farms_count = db.scalar(select(func.count(Farm.id)).where(Farm.owner_id == user.id)) or 0
    active_count = db.scalar(select(func.count(CropSeason.id)).where(CropSeason.owner_id == user.id, CropSeason.status == "active")) or 0
    active_seasons = db.scalars(select(CropSeason).where(CropSeason.owner_id == user.id, CropSeason.status == "active")).all()
    area = sum(item.area * 2.47105 if item.area_unit == "hectare" else item.area for item in active_seasons)
    return DashboardOut(farms_count=farms_count, active_crops_count=active_count, cultivated_area=round(area, 2), area_unit="acre")


VALID_GENDERS = {"male", "female", "other"}

@router.get("/labour/activities", response_model=list[LabourActivityOut])
def labour_activities(db: Session = Depends(get_db)):
    return db.scalars(select(LabourActivity).where(LabourActivity.is_active.is_(True)).order_by(LabourActivity.name_en)).all()

@router.get("/labour/workers", response_model=list[WorkerOut])
def list_workers(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return db.scalars(select(Worker).where(Worker.owner_id == user.id, Worker.is_active.is_(True)).order_by(Worker.name)).all()

@router.post("/labour/workers", response_model=WorkerOut, status_code=201)
def create_worker(payload: WorkerCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    if payload.gender not in VALID_GENDERS: raise HTTPException(400, "Gender must be male, female or other")
    worker = Worker(owner_id=user.id, **payload.model_dump())
    db.add(worker); db.commit(); db.refresh(worker); return worker

@router.get("/labour/wage-rates", response_model=list[WageRateOut])
def list_wage_rates(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return db.scalars(select(WageRate).options(joinedload(WageRate.activity)).where(WageRate.owner_id == user.id).order_by(WageRate.activity_id, WageRate.gender)).unique().all()

@router.put("/labour/wage-rates", response_model=WageRateOut)
def save_wage_rate(payload: WageRateIn, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    if payload.gender not in VALID_GENDERS: raise HTTPException(400, "Gender must be male, female or other")
    activity = db.get(LabourActivity, payload.activity_id)
    if not activity or not activity.is_active: raise HTTPException(404, "Labour activity not found")
    rate = db.scalar(select(WageRate).where(WageRate.owner_id == user.id, WageRate.activity_id == payload.activity_id, WageRate.gender == payload.gender))
    if rate: rate.daily_wage = payload.daily_wage
    else: rate = WageRate(owner_id=user.id, **payload.model_dump()); db.add(rate)
    db.commit(); db.refresh(rate)
    return db.scalar(select(WageRate).options(joinedload(WageRate.activity)).where(WageRate.id == rate.id))

@router.post("/labour/entries", response_model=LabourEntryOut, status_code=201)
def create_labour_entry(payload: LabourEntryCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    if payload.entry_mode not in {"group", "individual"}: raise HTTPException(400, "Entry mode must be group or individual")
    crop = db.scalar(select(CropSeason).where(CropSeason.id == payload.crop_season_id, CropSeason.owner_id == user.id))
    if not crop: raise HTTPException(404, "Crop season not found")
    activity = db.get(LabourActivity, payload.activity_id)
    if not activity or not activity.is_active: raise HTTPException(404, "Labour activity not found")
    assignments = []
    if payload.entry_mode == "individual":
        if not payload.worker_id: raise HTTPException(400, "Select a worker for individual entry")
        selected = db.scalar(select(Worker).where(Worker.id == payload.worker_id, Worker.owner_id == user.id, Worker.is_active.is_(True)))
        if not selected: raise HTTPException(404, "Worker not found")
        selected_workers = [selected]
        unnamed_count = 0
    else:
        if payload.worker_id: raise HTTPException(400, "Use worker_ids for named group workers")
        if len(set(payload.worker_ids)) != len(payload.worker_ids): raise HTTPException(400, "A worker can only be selected once")
        selected_workers = db.scalars(select(Worker).where(Worker.id.in_(payload.worker_ids), Worker.owner_id == user.id, Worker.is_active.is_(True))).all() if payload.worker_ids else []
        if len(selected_workers) != len(payload.worker_ids): raise HTTPException(404, "One or more selected workers were not found")
        unnamed_count = payload.unnamed_workers_count
        if not selected_workers and unnamed_count < 1: raise HTTPException(400, "Select named workers or enter an unnamed worker count")
    total = 0.0
    genders = set()
    for worker in selected_workers:
        saved = db.scalar(select(WageRate).where(WageRate.owner_id == user.id, WageRate.activity_id == payload.activity_id, WageRate.gender == worker.gender))
        rate = payload.daily_wage if payload.daily_wage is not None else (saved.daily_wage if saved else None)
        if rate is None: raise HTTPException(400, f"Set a {worker.gender} wage rate for this activity or enter a daily wage")
        amount = round(payload.days * rate, 2); total += amount; genders.add(worker.gender)
        assignments.append(dict(worker_id=worker.id, worker_name_snapshot=worker.name, gender=worker.gender, days=payload.days, daily_wage_snapshot=rate, total_wage=amount, is_unnamed=False))
    if unnamed_count:
        if payload.gender not in VALID_GENDERS: raise HTTPException(400, "Choose a valid gender for unnamed workers")
        saved = db.scalar(select(WageRate).where(WageRate.owner_id == user.id, WageRate.activity_id == payload.activity_id, WageRate.gender == payload.gender))
        rate = payload.daily_wage if payload.daily_wage is not None else (saved.daily_wage if saved else None)
        if rate is None: raise HTTPException(400, "Set a wage rate first or enter a daily wage")
        amount = round(unnamed_count * payload.days * rate, 2); total += amount; genders.add(payload.gender)
        assignments.append(dict(worker_id=None, worker_name_snapshot=f"Unnamed {payload.gender} workers", gender=payload.gender, days=payload.days, daily_wage_snapshot=rate, total_wage=amount, is_unnamed=True))
    count = len(selected_workers) + unnamed_count
    weighted_rate = round(total / (count * payload.days), 2) if count and payload.days else 0
    entry = LabourEntry(owner_id=user.id, crop_season_id=payload.crop_season_id, activity_id=payload.activity_id, worker_id=payload.worker_id if payload.entry_mode == "individual" else None, entry_mode=payload.entry_mode, work_date=payload.work_date, gender=next(iter(genders)) if len(genders)==1 else "mixed", workers_count=count, days=payload.days, daily_wage_snapshot=weighted_rate, total_wage=round(total,2), notes=payload.notes)
    db.add(entry); db.flush()
    for item in assignments: db.add(LabourEntryWorker(labour_entry_id=entry.id, **item))
    db.commit()
    return db.scalar(select(LabourEntry).options(joinedload(LabourEntry.activity), joinedload(LabourEntry.worker_assignments)).where(LabourEntry.id == entry.id))

@router.get("/labour/entries", response_model=list[LabourEntryOut])
def list_labour_entries(crop_season_id: int | None = None, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    query = select(LabourEntry).options(joinedload(LabourEntry.activity), joinedload(LabourEntry.worker_assignments)).where(LabourEntry.owner_id == user.id)
    if crop_season_id is not None: query = query.where(LabourEntry.crop_season_id == crop_season_id)
    return db.scalars(query.order_by(LabourEntry.work_date.desc(), LabourEntry.id.desc())).unique().all()
@router.put(
    "/labour/entries/{entry_id}",
    response_model=LabourEntryOut
)
def update_labour_entry(
    entry_id: int,
    payload: LabourEntryUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    entry = db.scalar(
        select(LabourEntry)
        .options(
            joinedload(LabourEntry.activity),
            joinedload(LabourEntry.worker_assignments)
        )
        .where(
            LabourEntry.id == entry_id,
            LabourEntry.owner_id == user.id
        )
    )

    if not entry:
        raise HTTPException(404, "Labour entry not found")

    if not entry.worker_assignments:
        raise HTTPException(
            400,
            "Labour entry has no worker assignments"
        )

    try:
        total = 0.0
        named_workers = sum(
            1 for a in entry.worker_assignments
            if not a.is_unnamed
        )

        unnamed_count = entry.workers_count - named_workers

        if unnamed_count < 0:
            raise HTTPException(
                400,
                "Invalid worker assignment data"
            )

        for assignment in entry.worker_assignments:
            quantity = (
                unnamed_count
                if assignment.is_unnamed
                else 1
            )

            if payload.daily_wage is not None:
                rate = payload.daily_wage
            else:
                rate = assignment.daily_wage_snapshot

            amount = round(
                quantity * payload.days * rate,
                2
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
                2
            )

        db.commit()

        return db.scalar(
            select(LabourEntry)
            .options(
                joinedload(LabourEntry.activity),
                joinedload(LabourEntry.worker_assignments)
            )
            .where(
                LabourEntry.id == entry.id,
                LabourEntry.owner_id == user.id
            )
        )

    except Exception:
        db.rollback()
        raise
@router.delete("/labour/workers/{worker_id}", status_code=204)
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
        raise HTTPException(404, "Worker not found")

    worker.is_active = False
    db.commit()
@router.delete("/labour/wage-rates/{rate_id}", status_code=204)
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
        raise HTTPException(404, "Wage rate not found")

    db.delete(rate)
    db.commit()
@router.delete("/labour/entries/{entry_id}", status_code=204)
def delete_labour_entry(
    entry_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    entry = db.scalar(
        select(LabourEntry).where(
            LabourEntry.id == entry_id,
            LabourEntry.owner_id == user.id,
        )
    )

    if not entry:
        raise HTTPException(404, "Labour entry not found")

    db.delete(entry)
    db.commit()
@router.get("/labour/summary", response_model=LabourSummaryOut)
def labour_summary(crop_season_id: int | None = None, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    query = select(LabourEntry).where(LabourEntry.owner_id == user.id)
    if crop_season_id is not None: query = query.where(LabourEntry.crop_season_id == crop_season_id)
    entries = db.scalars(query).all()
    return LabourSummaryOut(total_amount=round(sum(x.total_wage for x in entries), 2), entries_count=len(entries), total_worker_days=round(sum(x.workers_count*x.days for x in entries), 2))


# =========================
# EXPENSES
# =========================

VALID_EXPENSE_CATEGORIES = {
    "seeds", "fertilizers", "pesticides", "herbicides", "labour",
    "irrigation", "electricity", "machinery", "fuel", "transport",
    "land_preparation", "other"
}

@router.post("/expenses", response_model=ExpenseOut, status_code=201)
def create_expense(payload: ExpenseCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    farm = db.scalar(select(Farm).where(Farm.id == payload.farm_id, Farm.owner_id == user.id))
    if not farm:
        raise HTTPException(404, "Farm not found")
    season = db.scalar(select(CropSeason).where(CropSeason.id == payload.crop_season_id, CropSeason.owner_id == user.id, CropSeason.farm_id == payload.farm_id))
    if not season:
        raise HTTPException(404, "Crop season not found for this farm")
    category = payload.category.strip().lower()
    if category not in VALID_EXPENSE_CATEGORIES:
        raise HTTPException(400, "Invalid expense category")
    if payload.quantity is not None and payload.rate is not None:
        calculated = round(payload.quantity * payload.rate, 2)
        if abs(calculated - payload.total_amount) > 0.01:
            raise HTTPException(400, "Total amount must match quantity × rate")
    expense = FarmExpense(owner_id=user.id, category=category, **payload.model_dump(exclude={"category"}))
    db.add(expense)
    db.commit()
    db.refresh(expense)
    return expense

@router.get("/expenses", response_model=list[ExpenseOut])
def list_expenses(crop_season_id: int | None = None, category: str | None = None, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    query = select(FarmExpense).where(FarmExpense.owner_id == user.id)
    if crop_season_id is not None:
        query = query.where(FarmExpense.crop_season_id == crop_season_id)
    if category:
        query = query.where(FarmExpense.category == category.strip().lower())
    return db.scalars(query.order_by(FarmExpense.expense_date.desc(), FarmExpense.id.desc())).all()

@router.get("/expenses/summary", response_model=ExpenseSummaryOut)
def expense_summary(crop_season_id: int | None = None, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    query = select(FarmExpense).where(FarmExpense.owner_id == user.id)
    if crop_season_id is not None:
        query = query.where(FarmExpense.crop_season_id == crop_season_id)
    expenses = db.scalars(query).all()
    return ExpenseSummaryOut(total_expense=round(sum(x.total_amount for x in expenses), 2), entries_count=len(expenses))

@router.get("/expenses/season-summary", response_model=list[ExpenseSeasonSummaryOut])
def expense_season_summary(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    rows = db.execute(
        select(FarmExpense, CropSeason, Crop, Farm)
        .join(CropSeason, FarmExpense.crop_season_id == CropSeason.id)
        .join(Crop, CropSeason.crop_id == Crop.id)
        .join(Farm, CropSeason.farm_id == Farm.id)
        .where(
            FarmExpense.owner_id == user.id,
            CropSeason.owner_id == user.id,
            Farm.owner_id == user.id,
        )
        .order_by(CropSeason.season, CropSeason.id)
    ).all()
    grouped = {}
    for expense, season, crop, farm in rows:
        item = grouped.setdefault(season.id, {
            "crop_season_id": season.id, "farm_id": farm.id, "farm_name": farm.name,
            "crop_id": crop.id, "crop_name_en": crop.name_en, "crop_name_te": crop.name_te,
            "season": season.season, "area": season.area, "area_unit": season.area_unit,
            "total_expense": 0.0, "expense_entries": 0
        })
        item["total_expense"] += expense.total_amount
        item["expense_entries"] += 1
    return [ExpenseSeasonSummaryOut(**{**item, "total_expense": round(item["total_expense"], 2)}) for item in grouped.values()]

@router.get("/expenses/export.csv")
def export_expenses_csv(crop_season_id: int | None = None, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    import csv
    import io
    query = select(FarmExpense, CropSeason, Crop, Farm).join(CropSeason, FarmExpense.crop_season_id == CropSeason.id).join(Crop, CropSeason.crop_id == Crop.id).join(Farm, CropSeason.farm_id == Farm.id).where(FarmExpense.owner_id == user.id)
    if crop_season_id is not None:
        query = query.where(FarmExpense.crop_season_id == crop_season_id)
    rows = db.execute(query.order_by(FarmExpense.expense_date.desc(), FarmExpense.id.desc())).all()
    output = io.StringIO(newline="")
    writer = csv.writer(output)
    writer.writerow(["Date", "Farm", "Crop", "Season", "Area", "Category", "Description", "Quantity", "Unit", "Rate", "Total Amount", "Notes"])
    for expense, season, crop, farm in rows:
        writer.writerow([expense.expense_date.isoformat(), farm.name, crop.name_en, season.season, f"{season.area} {season.area_unit}", expense.category, expense.description or "", expense.quantity or "", expense.unit or "", expense.rate or "", expense.total_amount, expense.notes or ""])
    output.seek(0)
    filename = "farmledger-expenses.csv" if crop_season_id is None else f"farmledger-expenses-season-{crop_season_id}.csv"
    return StreamingResponse(iter([output.getvalue()]), media_type="text/csv", headers={"Content-Disposition": f'attachment; filename="{filename}"'})


# ============================================================
# PHASE 6B — FIELD OPERATIONS
# ============================================================

VALID_FIELD_OPERATION_TYPES = {
    "irrigation",
    "fertilizer",
    "pesticide",
    "herbicide",
    "land_preparation",
    "other",
}


def _validate_crop_season_ownership(
    db: Session,
    user: User,
    farm_id: int,
    crop_season_id: int,
):
    farm = db.scalar(
        select(Farm).where(
            Farm.id == farm_id,
            Farm.owner_id == user.id,
        )
    )
    if not farm:
        raise HTTPException(404, "Farm not found")

    season = db.scalar(
        select(CropSeason).where(
            CropSeason.id == crop_season_id,
            CropSeason.owner_id == user.id,
            CropSeason.farm_id == farm_id,
        )
    )
    if not season:
        raise HTTPException(404, "Crop season not found for this farm")

    return farm, season


@router.post(
    "/field-operations",
    response_model=FieldOperationOut,
    status_code=201,
)
def create_field_operation(
    payload: FieldOperationCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    _validate_crop_season_ownership(
        db,
        user,
        payload.farm_id,
        payload.crop_season_id,
    )

    operation_type = payload.operation_type.strip().lower()
    if operation_type not in VALID_FIELD_OPERATION_TYPES:
        raise HTTPException(400, "Invalid field operation type")

    operation = FieldOperation(
        owner_id=user.id,
        operation_type=operation_type,
        **payload.model_dump(exclude={"operation_type"}),
    )

    db.add(operation)
    db.commit()
    db.refresh(operation)

    return operation


@router.get(
    "/field-operations",
    response_model=list[FieldOperationOut],
)
def list_field_operations(
    crop_season_id: int | None = None,
    farm_id: int | None = None,
    operation_type: str | None = None,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    query = select(FieldOperation).where(
        FieldOperation.owner_id == user.id
    )

    if crop_season_id is not None:
        query = query.where(
            FieldOperation.crop_season_id == crop_season_id
        )

    if farm_id is not None:
        query = query.where(
            FieldOperation.farm_id == farm_id
        )

    if operation_type:
        normalized = operation_type.strip().lower()
        query = query.where(
            FieldOperation.operation_type == normalized
        )

    return db.scalars(
        query.order_by(
            FieldOperation.operation_date.desc(),
            FieldOperation.id.desc(),
        )
    ).all()


@router.put(
    "/field-operations/{operation_id}",
    response_model=FieldOperationOut,
)
def update_field_operation(
    operation_id: int,
    payload: FieldOperationCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    operation = db.scalar(
        select(FieldOperation).where(
            FieldOperation.id == operation_id,
            FieldOperation.owner_id == user.id,
        )
    )

    if not operation:
        raise HTTPException(404, "Field operation not found")

    _validate_crop_season_ownership(
        db,
        user,
        payload.farm_id,
        payload.crop_season_id,
    )

    operation_type = payload.operation_type.strip().lower()
    if operation_type not in VALID_FIELD_OPERATION_TYPES:
        raise HTTPException(400, "Invalid field operation type")

    for key, value in payload.model_dump().items():
        setattr(
            operation,
            key,
            operation_type if key == "operation_type" else value,
        )

    db.commit()
    db.refresh(operation)

    return operation


@router.delete(
    "/field-operations/{operation_id}",
    status_code=204,
)
def delete_field_operation(
    operation_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    operation = db.scalar(
        select(FieldOperation).where(
            FieldOperation.id == operation_id,
            FieldOperation.owner_id == user.id,
        )
    )

    if not operation:
        raise HTTPException(404, "Field operation not found")

    db.delete(operation)
    db.commit()


# ============================================================
# PHASE 6C — CROP ACTIVITY HISTORY
# ============================================================

@router.get(
    "/crops/{season_id}/activity-history",
)
def crop_activity_history(
    season_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    season_row = db.execute(
        select(CropSeason, Crop, Farm)
        .join(Crop, CropSeason.crop_id == Crop.id)
        .join(Farm, CropSeason.farm_id == Farm.id)
        .where(
            CropSeason.id == season_id,
            CropSeason.owner_id == user.id,
        )
    ).first()

    if not season_row:
        raise HTTPException(404, "Crop season not found")

    season, crop, farm = season_row

    operations = db.scalars(
        select(FieldOperation).where(
            FieldOperation.owner_id == user.id,
            FieldOperation.crop_season_id == season_id,
        ).order_by(
            FieldOperation.operation_date.desc(),
            FieldOperation.id.desc(),
        )
    ).all()

    expenses = db.scalars(
        select(FarmExpense).where(
            FarmExpense.owner_id == user.id,
            FarmExpense.crop_season_id == season_id,
        ).order_by(
            FarmExpense.expense_date.desc(),
            FarmExpense.id.desc(),
        )
    ).all()

    labour = db.scalars(
        select(LabourEntry)
        .options(joinedload(LabourEntry.activity))
        .where(
            LabourEntry.owner_id == user.id,
            LabourEntry.crop_season_id == season_id,
        )
        .order_by(
            LabourEntry.work_date.desc(),
            LabourEntry.id.desc(),
        )
    ).all()

    sales = db.scalars(
        select(CropSale).where(
            CropSale.owner_id == user.id,
            CropSale.crop_season_id == season_id,
        ).order_by(
            CropSale.sale_date.desc(),
            CropSale.id.desc(),
        )
    ).all()

    activities = []

    for item in operations:
        activities.append({
            "date": item.operation_date,
            "type": "field_operation",
            "label": item.operation_type,
            "description": item.description or item.product_name or "",
            "amount": round(item.cost, 2),
            "unit": item.unit,
        })

    for item in expenses:
        activities.append({
            "date": item.expense_date,
            "type": "expense",
            "label": item.category,
            "description": item.description or "",
            "amount": round(item.total_amount, 2),
            "unit": item.unit,
        })

    for item in labour:
        activities.append({
            "date": item.work_date,
            "type": "labour",
            "label": item.activity.name_en if item.activity else "Labour",
            "description": item.notes or "",
            "amount": round(item.total_wage, 2),
            "unit": "worker-days",
            "worker_days": round(
                item.workers_count * item.days,
                2,
            ),
        })

    for item in sales:
        activities.append({
            "date": item.sale_date,
            "type": "sale",
            "label": "Sale",
            "description": (
                f"{item.quantity} {item.unit}"
                + (f" · {item.buyer}" if item.buyer else "")
            ),
            "amount": round(item.total_amount, 2),
            "unit": item.unit,
        })

    activities.sort(
        key=lambda item: item["date"],
        reverse=True,
    )

    total_sales = round(
        sum(item.total_amount for item in sales),
        2,
    )

    other_expenses = round(
        sum(
            item.total_amount
            for item in expenses
            if item.category != "labour"
        ),
        2,
    )

    labour_cost = round(
        sum(item.total_wage for item in labour),
        2,
    )

    operation_cost = round(
        sum(item.cost for item in operations),
        2,
    )

    total_investment = round(
        other_expenses + labour_cost + operation_cost,
        2,
    )

    net_profit = round(
        total_sales - total_investment,
        2,
    )

    return {
        "crop_season_id": season.id,
        "farm_id": farm.id,
        "farm_name": farm.name,
        "crop_id": crop.id,
        "crop_name_en": crop.name_en,
        "crop_name_te": crop.name_te,
        "season": season.season,
        "area": season.area,
        "area_unit": season.area_unit,
        "total_sales": total_sales,
        "other_expenses": other_expenses,
        "labour_cost": labour_cost,
        "field_operation_cost": operation_cost,
        "total_investment": total_investment,
        "net_profit": net_profit,
        "activity_count": len(activities),
        "activities": activities,
    }


# ============================================================
# PHASE 6D — YIELD & ROI
# ============================================================

@router.get(
    "/crop-yields",
    response_model=list[CropYieldSummaryOut],
)
def list_crop_yield_summaries(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    seasons = db.execute(
        select(CropSeason, Crop, Farm)
        .join(Crop, CropSeason.crop_id == Crop.id)
        .join(Farm, CropSeason.farm_id == Farm.id)
        .where(CropSeason.owner_id == user.id)
        .order_by(CropSeason.id.desc())
    ).all()

    result = []

    for season, crop, farm in seasons:
        yield_record = db.scalar(
            select(CropYield).where(
                CropYield.owner_id == user.id,
                CropYield.crop_season_id == season.id,
            )
        )

        sales = db.scalars(
            select(CropSale).where(
                CropSale.owner_id == user.id,
                CropSale.crop_season_id == season.id,
            )
        ).all()

        expenses = db.scalars(
            select(FarmExpense).where(
                FarmExpense.owner_id == user.id,
                FarmExpense.crop_season_id == season.id,
                FarmExpense.category != "labour",
            )
        ).all()

        labour = db.scalars(
            select(LabourEntry).where(
                LabourEntry.owner_id == user.id,
                LabourEntry.crop_season_id == season.id,
            )
        ).all()

        operations = db.scalars(
            select(FieldOperation).where(
                FieldOperation.owner_id == user.id,
                FieldOperation.crop_season_id == season.id,
            )
        ).all()

        total_sales = round(
            sum(item.total_amount for item in sales),
            2,
        )

        total_cost = round(
            sum(item.total_amount for item in expenses)
            + sum(item.total_wage for item in labour)
            + sum(item.cost for item in operations),
            2,
        )

        net_profit = round(
            total_sales - total_cost,
            2,
        )

        profit_per_acre = (
            round(
                net_profit / season.area,
                2,
            )
            if season.area
            else 0.0
        )

        roi_percent = (
            round(
                (net_profit / total_cost) * 100,
                2,
            )
            if total_cost
            else 0.0
        )

        result.append(
            CropYieldSummaryOut(
                crop_season_id=season.id,
                farm_id=farm.id,
                farm_name=farm.name,
                crop_id=crop.id,
                crop_name_en=crop.name_en,
                crop_name_te=crop.name_te,
                season=season.season,
                area=season.area,
                area_unit=season.area_unit,
                expected_quantity=(
                    yield_record.expected_quantity
                    if yield_record
                    else None
                ),
                actual_quantity=(
                    yield_record.actual_quantity
                    if yield_record
                    else None
                ),
                unit=yield_record.unit if yield_record else None,
                total_sales=total_sales,
                total_cost=total_cost,
                net_profit=net_profit,
                profit_per_acre=profit_per_acre,
                roi_percent=roi_percent,
            )
        )

    return result


@router.get(
    "/crops/{season_id}/yield",
    response_model=CropYieldOut,
)
def get_crop_yield(
    season_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    season = db.scalar(
        select(CropSeason).where(
            CropSeason.id == season_id,
            CropSeason.owner_id == user.id,
        )
    )

    if not season:
        raise HTTPException(404, "Crop season not found")

    record = db.scalar(
        select(CropYield).where(
            CropYield.owner_id == user.id,
            CropYield.crop_season_id == season_id,
        )
    )

    if not record:
        raise HTTPException(404, "Yield record not found")

    return record


@router.put(
    "/crops/{season_id}/yield",
    response_model=CropYieldOut,
)
def upsert_crop_yield(
    season_id: int,
    payload: CropYieldUpsert,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    season = db.scalar(
        select(CropSeason).where(
            CropSeason.id == season_id,
            CropSeason.owner_id == user.id,
        )
    )

    if not season:
        raise HTTPException(404, "Crop season not found")

    record = db.scalar(
        select(CropYield).where(
            CropYield.owner_id == user.id,
            CropYield.crop_season_id == season_id,
        )
    )

    if record:
        for key, value in payload.model_dump().items():
            setattr(record, key, value)
    else:
        record = CropYield(
            owner_id=user.id,
            crop_season_id=season_id,
            **payload.model_dump(),
        )
        db.add(record)

    db.commit()
    db.refresh(record)

    return record


# =========================
# PHASE 4 — SALES / INCOME
# =========================

@router.post("/sales", response_model=SaleOut, status_code=201)
def create_sale(
    payload: SaleCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    farm = db.scalar(
        select(Farm).where(Farm.id == payload.farm_id, Farm.owner_id == user.id)
    )
    if not farm:
        raise HTTPException(404, "Farm not found")

    season = db.scalar(
        select(CropSeason).where(
            CropSeason.id == payload.crop_season_id,
            CropSeason.owner_id == user.id,
            CropSeason.farm_id == payload.farm_id,
        )
    )
    if not season:
        raise HTTPException(404, "Crop season not found for this farm")

    calculated = round(payload.quantity * payload.rate, 2)
    if abs(calculated - payload.total_amount) > 0.01:
        raise HTTPException(400, "Total amount must match quantity × rate")

    sale = CropSale(owner_id=user.id, **payload.model_dump())
    db.add(sale)
    db.commit()
    db.refresh(sale)
    return sale


@router.get("/sales", response_model=list[SaleOut])
def list_sales(
    crop_season_id: int | None = None,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    query = select(CropSale).where(CropSale.owner_id == user.id)
    if crop_season_id is not None:
        query = query.where(CropSale.crop_season_id == crop_season_id)
    return db.scalars(
        query.order_by(CropSale.sale_date.desc(), CropSale.id.desc())
    ).all()


@router.get("/sales/summary", response_model=SalesSummaryOut)
def sales_summary(
    crop_season_id: int | None = None,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    query = select(CropSale).where(CropSale.owner_id == user.id)
    if crop_season_id is not None:
        query = query.where(CropSale.crop_season_id == crop_season_id)
    sales = db.scalars(query).all()
    return SalesSummaryOut(
        total_sales=round(sum(x.total_amount for x in sales), 2),
        entries_count=len(sales),
    )


@router.get("/sales/season-summary", response_model=list[SaleSeasonSummaryOut])
def sales_season_summary(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    rows = db.execute(
        select(CropSale, CropSeason, Crop, Farm)
        .join(CropSeason, CropSale.crop_season_id == CropSeason.id)
        .join(Crop, CropSeason.crop_id == Crop.id)
        .join(Farm, CropSeason.farm_id == Farm.id)
        .where(CropSale.owner_id == user.id)
        .order_by(CropSeason.season, CropSeason.id)
    ).all()

    grouped = {}
    for sale, season, crop, farm in rows:
        item = grouped.setdefault(
            season.id,
            {
                "crop_season_id": season.id,
                "farm_id": farm.id,
                "farm_name": farm.name,
                "crop_id": crop.id,
                "crop_name_en": crop.name_en,
                "crop_name_te": crop.name_te,
                "season": season.season,
                "area": season.area,
                "area_unit": season.area_unit,
                "total_sales": 0.0,
                "sale_entries": 0,
            },
        )
        item["total_sales"] += sale.total_amount
        item["sale_entries"] += 1

    return [
        SaleSeasonSummaryOut(
            **{**item, "total_sales": round(item["total_sales"], 2)}
        )
        for item in grouped.values()
    ]


@router.get("/sales/export.csv")
def export_sales_csv(
    crop_season_id: int | None = None,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    import csv
    import io

    query = (
        select(CropSale, CropSeason, Crop, Farm)
        .join(CropSeason, CropSale.crop_season_id == CropSeason.id)
        .join(Crop, CropSeason.crop_id == Crop.id)
        .join(Farm, CropSeason.farm_id == Farm.id)
        .where(CropSale.owner_id == user.id)
    )
    if crop_season_id is not None:
        query = query.where(CropSale.crop_season_id == crop_season_id)

    rows = db.execute(
        query.order_by(CropSale.sale_date.desc(), CropSale.id.desc())
    ).all()

    output = io.StringIO(newline="")
    writer = csv.writer(output)
    writer.writerow([
        "Date", "Farm", "Crop", "Season", "Area",
        "Quantity", "Unit", "Rate", "Total Sales",
        "Buyer", "Market", "Notes"
    ])

    for sale, season, crop, farm in rows:
        writer.writerow([
            sale.sale_date.isoformat(),
            farm.name,
            crop.name_en,
            season.season,
            f"{season.area} {season.area_unit}",
            sale.quantity,
            sale.unit,
            sale.rate,
            sale.total_amount,
            sale.buyer or "",
            sale.market or "",
            sale.notes or "",
        ])

    output.seek(0)
    filename = (
        "farmledger-sales.csv"
        if crop_season_id is None
        else f"farmledger-sales-season-{crop_season_id}.csv"
    )
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"'
        },
    )

@router.get(
    "/profitability/season-summary",
    response_model=list[ProfitabilitySeasonOut],
)
def profitability_season_summary(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    seasons = db.execute(
        select(CropSeason, Crop, Farm)
        .join(Crop, CropSeason.crop_id == Crop.id)
        .join(Farm, CropSeason.farm_id == Farm.id)
        .where(CropSeason.owner_id == user.id)
        .order_by(CropSeason.id)
    ).all()

    result = []

    for season, crop, farm in seasons:

        sales = db.scalars(
            select(CropSale).where(
                CropSale.owner_id == user.id,
                CropSale.crop_season_id == season.id,
            )
        ).all()

        # Exclude labour expenses because the Labour module
        # is the source of truth for labour costs.
        expenses = db.scalars(
            select(FarmExpense).where(
                FarmExpense.owner_id == user.id,
                FarmExpense.crop_season_id == season.id,
                FarmExpense.category != "labour",
            )
        ).all()

        labour_entries = db.scalars(
            select(LabourEntry).where(
                LabourEntry.owner_id == user.id,
                LabourEntry.crop_season_id == season.id,
            )
        ).all()

        field_operations = db.scalars(
            select(FieldOperation).where(
                FieldOperation.owner_id == user.id,
                FieldOperation.crop_season_id == season.id,
            )
        ).all()

        total_sales = round(
            sum(item.total_amount for item in sales), 2
        )

        other_expenses = round(
            sum(item.total_amount for item in expenses), 2
        )

        labour_cost = round(
            sum(item.total_wage for item in labour_entries), 2
        )

        field_operation_cost = round(
            sum(item.cost for item in field_operations), 2
        )

        total_cost = round(
            other_expenses
            + labour_cost
            + field_operation_cost,
            2,
        )

        net_profit = round(
            total_sales - total_cost,
            2,
        )

        margin_percent = (
            round((net_profit / total_sales) * 100, 2)
            if total_sales > 0
            else 0.0
        )

        result.append(
            ProfitabilitySeasonOut(
                crop_season_id=season.id,
                farm_id=farm.id,
                farm_name=farm.name,
                crop_id=crop.id,
                crop_name_en=crop.name_en,
                crop_name_te=crop.name_te,
                season=season.season,
                area=season.area,
                area_unit=season.area_unit,
                total_sales=total_sales,
                other_expenses=other_expenses,
                labour_cost=labour_cost,
                field_operation_cost=field_operation_cost,
                total_cost=total_cost,
                net_profit=net_profit,
                margin_percent=margin_percent,
            )
        )

    return result
@router.get(
    "/profitability/summary",
    response_model=ProfitabilitySummaryOut,
)
def profitability_summary(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    rows = profitability_season_summary(
        db=db,
        user=user,
    )

    return ProfitabilitySummaryOut(
        total_sales=round(
            sum(item.total_sales for item in rows), 2
        ),
        other_expenses=round(
            sum(item.other_expenses for item in rows), 2
        ),
        labour_cost=round(
            sum(item.labour_cost for item in rows), 2
        ),
        field_operation_cost=round(
            sum(item.field_operation_cost for item in rows), 2
        ),
        total_cost=round(
            sum(item.total_cost for item in rows), 2
        ),
        net_profit=round(
            sum(item.net_profit for item in rows), 2
        ),
    )
