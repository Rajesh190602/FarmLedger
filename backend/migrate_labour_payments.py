"""
Create the labour_payments table for partial-payment history.

Run from the backend project root:
    python migrate_labour_payments.py

Safe to run more than once. Existing labour records and paid_amount
values are preserved. Historical payments are not fabricated.
"""

from sqlalchemy import inspect, text
from app.database import engine


def main() -> None:
    inspector = inspect(engine)

    existing_tables = set(inspector.get_table_names())

    if "labour_entry_workers" not in existing_tables:
        raise RuntimeError(
            "labour_entry_workers table does not exist. "
            "Check that the application is connected to the correct database."
        )

    if "labour_payments" in existing_tables:
        print("labour_payments table already exists. Nothing to change.")
        return

    with engine.begin() as connection:
        connection.execute(
            text(
                """
                CREATE TABLE labour_payments (
                    id INTEGER PRIMARY KEY,
                    labour_entry_worker_id INTEGER NOT NULL,
                    payment_date DATE NOT NULL,
                    amount FLOAT NOT NULL,
                    payment_method VARCHAR(30) NOT NULL DEFAULT 'cash',
                    remarks VARCHAR(500),
                    created_at DATETIME NOT NULL,

                    FOREIGN KEY (labour_entry_worker_id)
                    REFERENCES labour_entry_workers(id)
                    ON DELETE CASCADE
                )
                """
            )
        )

        connection.execute(
            text(
                """
                CREATE INDEX ix_labour_payments_labour_entry_worker_id
                ON labour_payments (labour_entry_worker_id)
                """
            )
        )

        connection.execute(
            text(
                """
                CREATE INDEX ix_labour_payments_payment_date
                ON labour_payments (payment_date)
                """
            )
        )

    print("Successfully created labour_payments table and indexes.")
    print("Existing labour records and paid_amount values were preserved.")


if __name__ == "__main__":
    main()