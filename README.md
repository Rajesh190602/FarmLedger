\# FarmLedger



A bilingual (English/Telugu), multi-farmer farm management web application built with React, FastAPI, SQLAlchemy and PostgreSQL/SQLite.



\## Current Features



\### Farmer \& Farm Management

\- Farmer registration and login

\- JWT authentication

\- Per-user ownership and authorization checks

\- Farm create, view, edit and delete

\- Crop master with English and Telugu names

\- Crop-season create, view and edit

\- Crop status, sowing date, expected harvest date and notes



\### Labour Management

\- Registered farm workers

\- Male/female worker wage rates

\- Individual labour entries

\- Group labour entries

\- Named and unnamed workers

\- Labour entry edit/delete

\- Worker soft-delete

\- Wage-rate edit/delete

\- Historical wage snapshots

\- Labour cost and worker summaries



\### Expenses

\- Expense recording

\- Expense categories

\- Expense history

\- Expense totals



\### Crop Sales

\- Crop sales/income recording

\- Quantity, unit and rate

\- Automatic sale total

\- Buyer, market and notes

\- Sales history

\- Season-wise sales



\### Field Operations

\- Irrigation

\- Fertilizer application

\- Pesticide application

\- Herbicide application

\- Land preparation

\- Other field activities

\- Operation cost tracking

\- Edit/delete operations



\### Crop History

\- Field operations

\- Expenses

\- Labour

\- Sales

\- Chronological crop activity history



\### Yield \& ROI

\- Expected yield

\- Actual yield

\- Yield achievement

\- Total investment

\- Net profit

\- ROI

\- Profit per acre



\### Financial Analytics

\- Total sales

\- Other expenses

\- Labour cost

\- Total cost

\- Net profit

\- Profit margin

\- Revenue per acre

\- Profit per acre

\- Crop-wise profitability

\- Farm-wise performance

\- Expense category analysis

\- Monthly financial trends

\- Crop profit comparison

\- Profitability insights



\### Localization

\- English

\- Telugu

\- Responsive desktop and mobile UI



\## Technology Stack



\### Frontend

\- React

\- Vite

\- React Router

\- JavaScript

\- CSS



\### Backend

\- FastAPI

\- SQLAlchemy

\- Pydantic

\- JWT authentication

\- Python



\### Database

\- SQLite for local development

\- PostgreSQL/Neon for production



\### Production Architecture



React frontend:

Vercel



↓



FastAPI backend:

Render



↓



PostgreSQL database:

Neon



\## Local Development



\### Backend



```bash

cd backend

python -m venv .venv

