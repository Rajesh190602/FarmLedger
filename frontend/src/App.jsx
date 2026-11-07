import { useEffect, useMemo, useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import {
  Sprout,
  LayoutDashboard,
  Tractor,
  Wheat,
  LogOut,
  Languages,
  Plus,
  MapPin,
  CalendarDays,
  Leaf,
  ArrowUpRight,
  Users,
  IndianRupee,
  ReceiptText,
  Edit,
  History,
  ClipboardList,
  Droplets,
  FlaskConical,
  SprayCan,
  Save,
  Trash2
} from 'lucide-react';
import api from './services/api';
import { translations } from './i18n/translations';

function apiErrorMessage(err, fallback = 'Request failed') {
  const detail = err?.response?.data?.detail;

  if (Array.isArray(detail)) {
    return detail
      .map((item) => {
        if (typeof item === 'string') return item;
        if (item && typeof item === 'object') {
          return item.msg || item.message || JSON.stringify(item);
        }
        return String(item);
      })
      .join('; ');
  }

  if (detail && typeof detail === 'object') {
    return detail.msg || detail.message || JSON.stringify(detail);
  }

  return detail || fallback;
}

function App() {
  const [user, setUser] = useState(null);
  const [lang, setLang] = useState(
    localStorage.getItem('farmledger_lang') || 'en'
  );
  const [token, setToken] = useState(
    localStorage.getItem('farmledger_token')
  );
  const [page, setPage] = useState('dashboard');

  const t = { ...translations[lang], __lang: lang };
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      api
        .get('/auth/me')
        .then((r) => setUser(r.data))
        .catch(() => {
          localStorage.removeItem('farmledger_token');
          setToken(null);
          setUser(null);
        });
    }
  }, [token]);

  const changeLang = (value) => {
    setLang(value);
    localStorage.setItem('farmledger_lang', value);
  };

  const onAuth = (data) => {
    localStorage.setItem('farmledger_token', data.access_token);
    setToken(data.access_token);
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem('farmledger_token');
    setToken(null);
    setUser(null);
  };

  if (!token || !user) {
    return (
      <AuthPage
        t={t}
        lang={lang}
        changeLang={changeLang}
        onAuth={onAuth}
      />
    );
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-icon">
            <Sprout size={23} />
          </span>

          <div>
            <b>FarmLedger</b>
            <small>Farm management</small>
          </div>
        </div>

        <div className="nav-label">WORKSPACE</div>

        <button
          className={`nav-item ${
            page === 'dashboard' ? 'selected' : ''
          }`}
          onClick={() => setPage('dashboard')}
        >
          <LayoutDashboard size={18} />
          {t.dashboard}
        </button>

        <button
          className={`nav-item ${
            page === 'farms' ? 'selected' : ''
          }`}
          onClick={() => setPage('farms')}
        >
          <Tractor size={18} />
          {t.farms}
        </button>

        <button
          className={`nav-item ${
            page === 'crops' ? 'selected' : ''
          }`}
          onClick={() => setPage('crops')}
        >
          <Wheat size={18} />
          {t.crops}
        </button>

        <button
          className={`nav-item ${
            page === 'labour' ? 'selected' : ''
          }`}
          onClick={() => setPage('labour')}
        >
          <Users size={18} />
          {t.labour}
        </button>

        <button
          className={`nav-item ${
            page === 'expenses' ? 'selected' : ''
          }`}
          onClick={() => setPage('expenses')}
        >
          <ReceiptText size={18} />
          {t.expenses}
        </button>

        <button
          className={`nav-item ${
            page === 'sales' ? 'selected' : ''
          }`}
          onClick={() => setPage('sales')}
        >
          <IndianRupee size={18} />
          {t.sales}
        </button>

        <button
          className={`nav-item ${
            page === 'operations' ? 'selected' : ''
          }`}
          onClick={() => setPage('operations')}
        >
          <ClipboardList size={18} />
          {t.fieldOperations}
        </button>

        <div className="sidebar-bottom">
          <div className="user-chip">
            <div className="avatar">
              {user.full_name?.[0]?.toUpperCase()}
            </div>

            <div>
              <b>{user.full_name}</b>
              <small>{user.village || user.mobile}</small>
            </div>
          </div>

          <button className="nav-item logout" onClick={logout}>
            <LogOut size={17} />
            {t.signOut}
          </button>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="mobile-brand">
            <Sprout /> FarmLedger
          </div>

          <div className="topbar-right">
            <span className="welcome-user">
              {user.full_name}
            </span>

            <button
              className="lang-button"
              onClick={() =>
                changeLang(lang === 'en' ? 'te' : 'en')
              }
            >
              <Languages size={16} />
              {lang === 'en' ? 'తెలుగు' : 'English'}
            </button>
          </div>
        </header>

        <section className="content">
          <div className="page-heading">
            <div>
              <div className="eyebrow">
                FARM MANAGEMENT / {page.toUpperCase()}
              </div>

              <h1>
                {page === 'dashboard'
                  ? t.welcome
                  : page === 'farms'
                  ? t.farms
                  : page === 'crops'
                  ? t.crops
                  : page === 'labour'
                  ? t.labour
                  : page === 'expenses'
                  ? t.expenses
                  : t.sales}
              </h1>

              <p>
                {t.overview} ·{' '}
                {new Date().toLocaleDateString(
                  lang === 'te' ? 'te-IN' : 'en-IN',
                  {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  }
                )}
              </p>
            </div>
          </div>

          {page === 'farms' ? (
            <FarmsPage t={t} />
          ) : page === 'crops' ? (
            <CropsPage t={t} />
          ) : page === 'labour' ? (
            <LabourPage t={t} />
          ) : page === 'expenses' ? (
            <ExpensesPage t={t} />
          ) : page === 'sales' ? (
            <SalesPage t={t} />
          ) : page === 'operations' ? (
            <FieldOperationsPage t={t} />
          ) : (
            <DashboardPage t={t} onNavigate={setPage} />
          )}
        </section>
      </main>
    </div>
  );
}

function AuthPage({ t, lang, changeLang, onAuth }) {
  const [mode, setMode] = useState('login');

  const [form, setForm] = useState({
    full_name: '',
    mobile: '',
    email: '',
    password: '',
    preferred_language: lang,
    village: '',
    district: ''
  });

  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const update = (e) =>
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);

    try {
      const { data } = await api.post(
        mode === 'login'
          ? '/auth/login'
          : '/auth/register',
        mode === 'login'
          ? {
              mobile: form.mobile,
              password: form.password
            }
          : {
              ...form,
              email: form.email.trim() || null
            }
      );

      onAuth(data);
    } catch (err) {
      setError(
        apiErrorMessage(err, t.error)
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-left">
        <div className="auth-logo">
          <span className="brand-icon">
            <Sprout />
          </span>
          FarmLedger
        </div>

        <div className="auth-copy">
          <span className="pill">
            <Leaf size={14} />
            FARM MANAGEMENT MADE SIMPLE
          </span>

          <h1>
            Every acre.
            <br />
            <em>Every rupee.</em>
            <br />
            Accounted for.
          </h1>

          <p>
            Track your farms, crop seasons and agricultural
            spending in one simple place.
          </p>

          <div className="auth-stats">
            <div>
              <b>01</b>
              <span>Know your costs</span>
            </div>

            <div>
              <b>02</b>
              <span>Track every crop</span>
            </div>

            <div>
              <b>03</b>
              <span>Measure returns</span>
            </div>
          </div>
        </div>

        <div className="auth-footer">
          Built for farmers · తెలుగు & English
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-top">
          <button
            className="lang-button"
            onClick={() => {
              const next =
                lang === 'en' ? 'te' : 'en';

              changeLang(next);

              setForm({
                ...form,
                preferred_language: next
              });
            }}
          >
            <Languages size={16} />
            {lang === 'en' ? 'తెలుగు' : 'English'}
          </button>
        </div>

        <form className="auth-card" onSubmit={submit}>
          <div className="eyebrow">
            WELCOME TO FARMLEDGER
          </div>

          <h2>
            {mode === 'login'
              ? t.login
              : t.register}
          </h2>

          <p className="muted">
            {mode === 'login'
              ? 'Access your farm records securely.'
              : 'Create your personal farmer account.'}
          </p>

          {mode === 'register' && (
            <>
              <label>
                {t.name}

                <input
                  name="full_name"
                  value={form.full_name}
                  onChange={update}
                  required
                  minLength="2"
                  placeholder="Your full name"
                />
              </label>

              <label>
                {t.email}

                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={update}
                  placeholder="name@example.com"
                />
              </label>

              <div className="field-row">
                <label>
                  {t.village}

                  <input
                    name="village"
                    value={form.village}
                    onChange={update}
                  />
                </label>

                <label>
                  {t.district}

                  <input
                    name="district"
                    value={form.district}
                    onChange={update}
                  />
                </label>
              </div>
            </>
          )}

          <label>
            {t.mobile}

            <input
              name="mobile"
              value={form.mobile}
              onChange={update}
              required
              placeholder="10-digit mobile number"
            />
          </label>

          <label>
            {t.password}

            <input
              name="password"
              type="password"
              value={form.password}
              onChange={update}
              required
              minLength="8"
              placeholder="At least 8 characters"
            />
          </label>

          {error && (
            <div className="error-box">
              {error}
            </div>
          )}

          <button
            className="primary-button full"
            disabled={busy}
          >
            {busy
              ? t.loading
              : mode === 'login'
              ? t.login
              : t.register}

            <ArrowUpRight size={17} />
          </button>

          <div className="switch-auth">
            {mode === 'login'
              ? "Don't have an account?"
              : 'Already registered?'}

            <button
              type="button"
              onClick={() => {
                setMode(
                  mode === 'login'
                    ? 'register'
                    : 'login'
                );
                setError('');
              }}
            >
              {mode === 'login'
                ? 'Create account'
                : 'Sign in'}
            </button>
          </div>

          <div className="secure-note">
            Your farm records are private to your account.
          </div>
        </form>
      </div>
    </div>
  );
}

function AnalyticsBarChart({ rows, currency, valueLabel, emptyText }) {
  const max = Math.max(...rows.map((r) => Number(r.value || 0)), 0);

  if (!rows.length) {
    return <div className="analytics-chart-empty">{emptyText}</div>;
  }

  return (
    <div className="analytics-bar-chart" role="img" aria-label={valueLabel}>
      {rows.slice(0, 8).map((row) => (
        <div className="analytics-bar-row" key={row.key}>
          <div className="analytics-bar-meta">
            <span title={row.label}>{row.label}</span>
            <b>{currency(row.value)}</b>
          </div>
          <div className="analytics-bar-track">
            <div
              className={`analytics-bar-fill ${Number(row.value) < 0 ? 'negative' : ''}`}
              style={{ width: `${max ? Math.min(Math.abs(Number(row.value)) / max * 100, 100) : 0}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function AnalyticsTrendChart({ rows, currency, salesLabel, expensesLabel, resultLabel, emptyText }) {
  if (!rows.length) {
    return <div className="analytics-chart-empty">{emptyText}</div>;
  }

  const width = 760;
  const height = 250;
  const padX = 42;
  const padY = 28;
  const plotW = width - padX * 2;
  const plotH = height - padY * 2;
  const values = rows.flatMap((r) => [Number(r.sales || 0), Number(r.expenses || 0), Number(r.result || 0)]);
  const min = Math.min(0, ...values);
  const max = Math.max(1, ...values);
  const range = max - min || 1;
  const x = (i) => padX + (rows.length === 1 ? plotW / 2 : (i / (rows.length - 1)) * plotW);
  const y = (v) => padY + ((max - v) / range) * plotH;
  const points = (key) => rows.map((r, i) => `${x(i)},${y(Number(r[key] || 0))}`).join(' ');

  return (
    <div className="analytics-trend-wrap">
      <svg className="analytics-trend-chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`${salesLabel}, ${expensesLabel}, ${resultLabel}`}>
        <line x1={padX} y1={y(0)} x2={width - padX} y2={y(0)} className="chart-zero-line" />
        <polyline points={points('sales')} className="chart-line sales-line" fill="none" />
        <polyline points={points('expenses')} className="chart-line expense-line" fill="none" />
        <polyline points={points('result')} className="chart-line result-line" fill="none" />
        {rows.map((r, i) => (
          <text key={r.key} x={x(i)} y={height - 7} textAnchor="middle" className="chart-axis-label">
            {r.label}
          </text>
        ))}
      </svg>
      <div className="chart-legend">
        <span><i className="legend-dot sales-dot" />{salesLabel}</span>
        <span><i className="legend-dot expense-dot" />{expensesLabel}</span>
        <span><i className="legend-dot result-dot" />{resultLabel}</span>
      </div>
      <div className="chart-value-strip">
        {rows.map((r) => (
          <div key={r.key}>
            <b>{r.label}</b>
            <span>{currency(r.result)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DashboardPage({ t, onNavigate }) {
  const [data, setData] = useState(null);
  const [crops, setCrops] = useState([]);
  const [financial, setFinancial] = useState({ sales: [], salesEntries: [], profitability: [], expenses: [], yields: [] });

  useEffect(() => {
    Promise.all([
      api.get('/dashboard'),
      api.get('/crops'),
      api.get('/sales/season-summary'),
      api.get('/sales'),
      api.get('/profitability/season-summary'),
      api.get('/expenses'),
      api.get('/crop-yields')
    ])
      .then(([d, c, s, se, p, e, y]) => {
        setData(d.data);
        setCrops(c.data);
        setFinancial({
          sales: s.data || [],
          salesEntries: se.data || [],
          profitability: p.data || [],
          expenses: e.data || [],
          yields: y.data || []
        });
      })
      .catch(() => {});
  }, []);

  const currency = (n) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(Number(n || 0));

  const analytics = useMemo(() => {
    const sales = financial.sales;
    const profitability = financial.profitability;
    const expenses = financial.expenses;

    const totalSales = sales.reduce((sum, row) => sum + Number(row.total_sales || 0), 0);
    const totalOtherExpenses = profitability.reduce((sum, row) => sum + Number(row.other_expenses || 0), 0);
    const totalLabour = profitability.reduce((sum, row) => sum + Number(row.labour_cost || 0), 0);
    const totalCost = profitability.reduce((sum, row) => sum + Number(row.total_cost || 0), 0);
    const netProfit = profitability.reduce((sum, row) => sum + Number(row.net_profit || 0), 0);
    const margin = totalSales ? (netProfit / totalSales) * 100 : 0;

    const categoryTotals = expenses.reduce((acc, row) => {
      const key = row.category || 'other';
      acc[key] = (acc[key] || 0) + Number(row.total_amount || 0);
      return acc;
    }, {});

    const cropRows = profitability.map((row) => ({
      ...row,
      profitPerAcre: Number(row.area || 0) ? Number(row.net_profit || 0) / Number(row.area) : 0,
      revenuePerAcre: Number(row.area || 0) ? Number(row.total_sales || 0) / Number(row.area) : 0
    }));

    const highestProfit = cropRows.reduce((best, row) =>
      !best || Number(row.net_profit || 0) > Number(best.net_profit || 0) ? row : best, null);

    const highestCostCategory = Object.entries(categoryTotals)
      .sort((a, b) => b[1] - a[1])[0] || null;

    const maxCategory = Math.max(...Object.values(categoryTotals), 0);

    const farmMap = profitability.reduce((acc, row) => {
      const key = row.farm_id;
      if (!key) return acc;

      if (!acc[key]) {
        acc[key] = {
          farm_id: key,
          farm_name: row.farm_name || '—',
          area: 0,
          total_sales: 0,
          total_cost: 0,
          net_profit: 0
        };
      }

      acc[key].area += Number(row.area || 0);
      acc[key].total_sales += Number(row.total_sales || 0);
      acc[key].total_cost += Number(row.total_cost || 0);
      acc[key].net_profit += Number(row.net_profit || 0);
      return acc;
    }, {});

    const farmRows = Object.values(farmMap).map((row) => ({
      ...row,
      revenuePerAcre: Number(row.area) ? row.total_sales / Number(row.area) : 0,
      profitPerAcre: Number(row.area) ? row.net_profit / Number(row.area) : 0,
      marginPercent: Number(row.total_sales)
        ? (row.net_profit / Number(row.total_sales)) * 100
        : 0
    })).sort((a, b) => b.net_profit - a.net_profit);

    const highestCostCrop = cropRows.reduce((best, row) =>
      !best || Number(row.total_cost || 0) > Number(best.total_cost || 0)
        ? row
        : best, null);

    // Monthly trend: use raw dated sales and expenses.
    // This is intentionally labelled as recorded sales/expenses rather than
    // profitability because labour cost is calculated separately by the backend.
    const monthMap = {};
    const ensureMonth = (dateValue) => {
      if (!dateValue) return null;
      const d = new Date(dateValue);
      if (Number.isNaN(d.getTime())) return null;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!monthMap[key]) {
        monthMap[key] = {
          key,
          label: d.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }),
          sales: 0,
          expenses: 0,
          result: 0
        };
      }
      return monthMap[key];
    };

    (financial.salesEntries || []).forEach((row) => {
      const m = ensureMonth(row.sale_date);
      if (m) m.sales += Number(row.total_amount || 0);
    });

    expenses.forEach((row) => {
      const m = ensureMonth(row.expense_date);
      if (m) m.expenses += Number(row.total_amount || 0);
    });

    const monthlyTrend = Object.values(monthMap)
      .sort((a, b) => a.key.localeCompare(b.key))
      .map((row) => ({
        ...row,
        result: row.sales - row.expenses
      }));

    const expenseChartRows = Object.entries(categoryTotals)
      .sort((a, b) => b[1] - a[1])
      .map(([key, value]) => ({
        key,
        label: t[key] || key.replaceAll('_', ' '),
        value
      }));

    const cropProfitChartRows = [...cropRows]
      .sort((a, b) => Number(b.net_profit || 0) - Number(a.net_profit || 0))
      .map((row) => ({
        key: row.crop_season_id,
        label: langCropName(row, t),
        value: Number(row.net_profit || 0)
      }));

    const seasonProfitRows = [...profitability]
      .sort((a, b) => String(a.crop_name_en || '').localeCompare(String(b.crop_name_en || '')))
      .map((row) => ({
        key: row.crop_season_id,
        label: `${langCropName(row, t)} — ${row.season || ''}`.trim(),
        sales: Number(row.total_sales || 0),
        cost: Number(row.total_cost || 0),
        profit: Number(row.net_profit || 0)
      }));

    const yieldRows = (financial.yields || []).map((row) => ({
      ...row,
      expectedAchievement: Number(row.expected_quantity || 0)
        ? (Number(row.actual_quantity || 0) / Number(row.expected_quantity)) * 100
        : 0
    }));

    return {
      totalSales,
      totalOtherExpenses,
      totalLabour,
      totalCost,
      netProfit,
      margin,
      categoryTotals,
      cropRows,
      highestProfit,
      highestCostCategory,
      maxCategory,
      farmRows,
      highestCostCrop,
      monthlyTrend,
      expenseChartRows,
      cropProfitChartRows,
      seasonProfitRows,
      yieldRows
    };
  }, [financial]);

  return (
    <>
      <div className="stats-grid">
        <Stat
          icon={<Tractor />}
          label={t.farmsCount}
          value={data?.farms_count ?? '—'}
          tone="green"
          t={t}
        />

        <Stat
          icon={<Wheat />}
          label={t.activeCrops}
          value={data?.active_crops_count ?? '—'}
          tone="gold"
          t={t}
        />

        <Stat
          icon={<Leaf />}
          label={t.cultivatedArea}
          value={data ? `${data.cultivated_area} ac` : '—'}
          tone="blue"
          t={t}
        />
      </div>

      <div className="section-card dashboard-financial-card">
        <div className="card-heading">
          <div>
            <h3>{t.financialOverview}</h3>
            <p>{t.financialOverviewHelp}</p>
          </div>
          <button className="outline-button" onClick={() => onNavigate('sales')}>
            {t.sales}
            <ArrowUpRight size={16} />
          </button>
        </div>

        <div className="financial-kpi-grid">
          <div className="financial-kpi">
            <span>{t.totalSales}</span>
            <strong>{currency(analytics.totalSales)}</strong>
          </div>
          <div className="financial-kpi">
            <span>{t.otherExpenses}</span>
            <strong>{currency(analytics.totalOtherExpenses)}</strong>
          </div>
          <div className="financial-kpi">
            <span>{t.labourCost}</span>
            <strong>{currency(analytics.totalLabour)}</strong>
          </div>
          <div className={`financial-kpi ${analytics.netProfit >= 0 ? 'profit-positive' : 'profit-negative'}`}>
            <span>{t.netProfit}</span>
            <strong>{currency(analytics.netProfit)}</strong>
          </div>
        </div>

        <div className="financial-secondary-row">
          <div>
            <span>{t.totalCost}</span>
            <b>{currency(analytics.totalCost)}</b>
          </div>
          <div>
            <span>{t.profitMargin}</span>
            <b>{analytics.margin.toFixed(1)}%</b>
          </div>
          <div>
            <span>{t.revenuePerAcre}</span>
            <b>{currency(analytics.cropRows.reduce((sum, row) => sum + Number(row.total_sales || 0), 0) / Math.max(Number(data?.cultivated_area || 0), 1))}</b>
          </div>
          <div>
            <span>{t.profitPerAcre}</span>
            <b>{currency(analytics.netProfit / Math.max(Number(data?.cultivated_area || 0), 1))}</b>
          </div>
        </div>
      </div>

      <div className="dashboard-analytics-grid">
        <div className="section-card">
          <div className="card-heading">
            <div>
              <h3>{t.cropProfitability}</h3>
              <p>{t.cropProfitabilityHelp}</p>
            </div>
          </div>

          {analytics.cropRows.length === 0 ? (
            <div className="empty-state compact-empty">
              <p>{t.noFinancialData}</p>
            </div>
          ) : (
            <div className="analytics-table-wrap">
              <table className="data-table analytics-table">
                <thead>
                  <tr>
                    <th>{t.crop}</th>
                    <th>{t.season}</th>
                    <th>{t.totalSales}</th>
                    <th>{t.totalCost}</th>
                    <th>{t.netProfit}</th>
                    <th>{t.margin}</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.cropRows.map((row) => (
                    <tr key={row.crop_season_id}>
                      <td>{langCropName(row, t)}</td>
                      <td>{row.season}</td>
                      <td>{currency(row.total_sales)}</td>
                      <td>{currency(row.total_cost)}</td>
                      <td className={Number(row.net_profit) >= 0 ? 'profit-cell' : 'loss-cell'}>
                        {currency(row.net_profit)}
                      </td>
                      <td>{Number(row.total_sales) ? `${Number(row.margin_percent || 0).toFixed(1)}%` : '0.0%'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="section-card">
          <div className="card-heading">
            <div>
              <h3>{t.costBreakdown}</h3>
              <p>{t.costBreakdownHelp}</p>
            </div>
          </div>

          {Object.keys(analytics.categoryTotals).length === 0 ? (
            <div className="empty-state compact-empty">
              <p>{t.noFinancialData}</p>
            </div>
          ) : (
            <div className="cost-breakdown-list">
              {Object.entries(analytics.categoryTotals)
                .sort((a, b) => b[1] - a[1])
                .map(([key, value]) => (
                  <div className="cost-breakdown-row" key={key}>
                    <div className="cost-breakdown-label">
                      <span>{t[key] || key.replaceAll('_', ' ')}</span>
                      <b>{currency(value)}</b>
                    </div>
                    <div className="cost-bar-track">
                      <div
                        className="cost-bar-fill"
                        style={{ width: `${analytics.maxCategory ? (value / analytics.maxCategory) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          )}

          {analytics.highestProfit && (
            <div className="insight-box">
              <b>{t.highestProfitCrop}</b>
              <span>
                {langCropName(analytics.highestProfit, t)} — {currency(analytics.highestProfit.net_profit)}
              </span>
            </div>
          )}

          {analytics.highestCostCategory && (
            <div className="insight-box">
              <b>{t.highestCostCategory}</b>
              <span>
                {t[analytics.highestCostCategory[0]] || analytics.highestCostCategory[0].replaceAll('_', ' ')} — {currency(analytics.highestCostCategory[1])}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="section-card farm-performance-card">
        <div className="card-heading">
          <div>
            <h3>{t.farmPerformance}</h3>
            <p>{t.farmPerformanceHelp}</p>
          </div>
        </div>

        {analytics.farmRows.length === 0 ? (
          <div className="empty-state compact-empty">
            <p>{t.noFinancialData}</p>
          </div>
        ) : (
          <div className="analytics-table-wrap">
            <table className="data-table analytics-table farm-performance-table">
              <thead>
                <tr>
                  <th>{t.farm}</th>
                  <th>{t.area}</th>
                  <th>{t.totalSales}</th>
                  <th>{t.totalCost}</th>
                  <th>{t.netProfit}</th>
                  <th>{t.margin}</th>
                  <th>{t.profitPerAcre}</th>
                </tr>
              </thead>
              <tbody>
                {analytics.farmRows.map((row) => (
                  <tr key={row.farm_id}>
                    <td>{row.farm_name}</td>
                    <td>{row.area.toFixed(2)} {t.acres}</td>
                    <td>{currency(row.total_sales)}</td>
                    <td>{currency(row.total_cost)}</td>
                    <td className={Number(row.net_profit) >= 0 ? 'profit-cell' : 'loss-cell'}>
                      {currency(row.net_profit)}
                    </td>
                    <td>{row.marginPercent.toFixed(1)}%</td>
                    <td>{currency(row.profitPerAcre)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {analytics.farmRows[0] && (
          <div className="insight-box">
            <b>{t.bestFarm}</b>
            <span>
              {analytics.farmRows[0].farm_name} — {currency(analytics.farmRows[0].net_profit)}
            </span>
          </div>
        )}

        {analytics.highestCostCrop && (
          <div className="insight-box">
            <b>{t.highestCostCrop}</b>
            <span>
              {langCropName(analytics.highestCostCrop, t)} — {currency(analytics.highestCostCrop.total_cost)}
            </span>
          </div>
        )}
      </div>

      <div className="dashboard-analytics-grid phase5c-chart-grid">
        <div className="section-card">
          <div className="card-heading">
            <div>
              <h3>{t.monthlyTrend}</h3>
              <p>{t.monthlyTrendHelp}</p>
            </div>
          </div>
          <AnalyticsTrendChart
            rows={analytics.monthlyTrend}
            currency={currency}
            salesLabel={t.sales}
            expensesLabel={t.expenses}
            resultLabel={t.recordedResult}
            emptyText={t.noTrendData}
          />
        </div>

        <div className="section-card">
          <div className="card-heading">
            <div>
              <h3>{t.expenseChart}</h3>
              <p>{t.expenseChartHelp}</p>
            </div>
          </div>
          <AnalyticsBarChart
            rows={analytics.expenseChartRows}
            currency={currency}
            valueLabel={t.expenseChart}
            emptyText={t.noFinancialData}
          />
        </div>
      </div>

      <div className="dashboard-analytics-grid phase5c-chart-grid">
        <div className="section-card">
          <div className="card-heading">
            <div>
              <h3>{t.cropProfitChart}</h3>
              <p>{t.cropProfitChartHelp}</p>
            </div>
          </div>
          <AnalyticsBarChart
            rows={analytics.cropProfitChartRows}
            currency={currency}
            valueLabel={t.netProfit}
            emptyText={t.noFinancialData}
          />
        </div>

        <div className="section-card">
          <div className="card-heading">
            <div>
              <h3>{t.profitInsights}</h3>
              <p>{t.profitInsightsHelp}</p>
            </div>
          </div>
          <div className="insight-stack">
            {analytics.highestProfit && (
              <div className="insight-box">
                <b>{t.highestProfitCrop}</b>
                <span>{langCropName(analytics.highestProfit, t)} — {currency(analytics.highestProfit.net_profit)}</span>
              </div>
            )}
            {analytics.highestCostCrop && (
              <div className="insight-box">
                <b>{t.highestCostCrop}</b>
                <span>{langCropName(analytics.highestCostCrop, t)} — {currency(analytics.highestCostCrop.total_cost)}</span>
              </div>
            )}
            {analytics.highestCostCategory && (
              <div className="insight-box">
                <b>{t.highestCostCategory}</b>
                <span>{t[analytics.highestCostCategory[0]] || analytics.highestCostCategory[0].replaceAll('_', ' ')} — {currency(analytics.highestCostCategory[1])}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="section-card phase6-yield-card">
        <div className="card-heading">
          <div>
            <h3>{t.yieldRoiAnalytics}</h3>
            <p>{t.yieldRoiAnalyticsHelp}</p>
          </div>
          <button className="outline-button" onClick={() => onNavigate('crops')}>
            {t.manageCrops}
            <ArrowUpRight size={15} />
          </button>
        </div>

        {analytics.yieldRows.length === 0 ? (
          <div className="empty-state compact-empty">
            <p>{t.noYieldData}</p>
          </div>
        ) : (
          <div className="analytics-table-wrap">
            <table className="data-table analytics-table yield-roi-table">
              <thead>
                <tr>
                  <th>{t.crop}</th>
                  <th>{t.expectedYield}</th>
                  <th>{t.actualYield}</th>
                  <th>{t.totalInvestment}</th>
                  <th>{t.netProfit}</th>
                  <th>{t.roi}</th>
                  <th>{t.profitPerAcre}</th>
                </tr>
              </thead>
              <tbody>
                {analytics.yieldRows.map((row) => (
                  <tr key={row.crop_season_id}>
                    <td>
                      {langCropName(row, t)} · {row.season}
                    </td>
                    <td>
                      {row.expected_quantity ?? '—'} {row.yield_unit || row.unit || ''}
                    </td>
                    <td>
                      {row.actual_quantity ?? '—'} {row.yield_unit || row.unit || ''}
                    </td>
                    <td>{currency(row.total_cost)}</td>
                    <td className={Number(row.net_profit) >= 0 ? 'profit-cell' : 'loss-cell'}>
                      {currency(row.net_profit)}
                    </td>
                    <td>{Number(row.roi_percent || 0).toFixed(1)}%</td>
                    <td>{currency(row.profit_per_acre)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="section-card">
        <div className="card-heading">
          <div>
            <h3>{t.recentCrops}</h3>
            <p>{t.cropSeasonsAcrossFarms}</p>
          </div>
          <button className="outline-button" onClick={() => onNavigate('crops')}>
            {t.addCrop}
            <Plus size={16} />
          </button>
        </div>

        {crops.length === 0 ? (
          <EmptyState
            text={t.noCrops}
            action={t.addCrop}
            onClick={() => onNavigate('crops')}
          />
        ) : (
          <CropList crops={crops} />
        )}
      </div>

      <div className="quick-grid">
        <button className="quick-card" onClick={() => onNavigate('farms')}>
          <span className="quick-icon"><Tractor /></span>
          <b>{t.addFarm}</b>
          <small>{t.manageFarmDetails}</small>
          <ArrowUpRight />
        </button>

        <button className="quick-card" onClick={() => onNavigate('crops')}>
          <span className="quick-icon gold"><Wheat /></span>
          <b>{t.addCrop}</b>
          <small>{t.recordCropSeason}</small>
          <ArrowUpRight />
        </button>
      </div>
    </>
  );
}

function langCropName(row, t) {
  return row.crop_name_te && t?.__lang === 'te'
    ? row.crop_name_te
    : row.crop_name_en || row.crop_name_te || '—';
}

function Stat({ icon, label, value, tone, t }) {
  return (
    <div className="stat-card">
      <span className={`stat-icon ${tone}`}>
        {icon}
      </span>

      <span className="stat-label">
        {label}
      </span>

      <strong>{value}</strong>

      <small>
        {t?.updatedFromRecords || 'Updated from your records'}
      </small>
    </div>
  );
}

function EmptyState({
  text,
  action,
  onClick
}) {
  return (
    <div className="empty-state">
      <div className="empty-icon">
        <Sprout size={26} />
      </div>

      <p>{text}</p>

      <button
        className="text-button"
        onClick={onClick}
      >
        {action}
        <ArrowUpRight size={15} />
      </button>
    </div>
  );
}

function FarmsPage({ t }) {
  const [farms, setFarms] = useState([]);
  const [show, setShow] = useState(false);
  const [editingEntryId, setEditingEntryId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '',
    village: '',
    district: '',
    area: '',
    area_unit: 'acre'
  });

  const load = () =>
    api
      .get('/farms')
      .then((r) => setFarms(r.data))
      .catch(() => setError(t.error));

  const openCreate = () => {
    setEditingId(null);
    setForm({
      name: '',
      village: '',
      district: '',
      area: '',
      area_unit: 'acre'
    });
    setError('');
    setShow(true);
  };

  const openEdit = (farm) => {
    setEditingId(farm.id);
    setForm({
      name: farm.name || '',
      village: farm.village || '',
      district: farm.district || '',
      area: farm.area ?? '',
      area_unit: farm.area_unit || 'acre'
    });
    setError('');
    setShow(true);
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const payload = {
        ...form,
        area: Number(form.area)
      };

      if (editingId) {
        await api.put(`/farms/${editingId}`, payload);
      } else {
        await api.post('/farms', payload);
      }

      setForm({
        name: '',
        village: '',
        district: '',
        area: '',
        area_unit: 'acre'
      });
      setEditingId(null);
      setShow(false);
      load();
    } catch (err) {
      setError(
        apiErrorMessage(err, t.error)
      );
    }
  };

  return (
    <>
      <div className="section-card">
        <div className="card-heading">
          <div>
            <h3>{t.farms}</h3>
            <p>Keep your land details organized</p>
          </div>

          <button
            className="primary-button"
            onClick={() => (show ? setShow(false) : openCreate())}
          >
            <Plus size={16} />
            {t.addFarm}
          </button>
        </div>

        {show && (
          <form
            className="inline-form"
            onSubmit={submit}
          >
            <label>
              {t.farmName}

              <input
                required
                value={form.name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    name: e.target.value
                  })
                }
              />
            </label>

            <div className="field-row">
              <label>
                {t.village}

                <input
                  value={form.village}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      village: e.target.value
                    })
                  }
                />
              </label>

              <label>
                {t.district}

                <input
                  value={form.district}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      district: e.target.value
                    })
                  }
                />
              </label>
            </div>

            <div className="field-row">
              <label>
                {t.area}

                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  required
                  value={form.area}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      area: e.target.value
                    })
                  }
                />
              </label>

              <label>
                {t.unit}

                <select
                  value={form.area_unit}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      area_unit: e.target.value
                    })
                  }
                >
                  <option value="acre">
                    {t.acres}
                  </option>

                  <option value="hectare">
                    {t.hectares}
                  </option>
                </select>
              </label>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="outline-button"
                onClick={() => setShow(false)}
              >
                {t.cancel}
              </button>

              <button className="primary-button">
                <Save size={15} />
                {editingId ? t.update : t.save}
              </button>
            </div>
          </form>
        )}

        {error && (
          <div className="error-box">
            {error}
          </div>
        )}

        {farms.length === 0 ? (
          <EmptyState
            text={t.noFarms}
            action={t.addFarm}
            onClick={() => setShow(true)}
          />
        ) : (
          <div className="farm-list">
            {farms.map((f) => (
              <div className="farm-row" key={f.id}>
                <div className="farm-icon">
                  <Tractor />
                </div>

                <div className="farm-info">
                  <b>{f.name}</b>
                  <small>
                    {f.village}, {f.district}
                  </small>
                </div>

                <div className="farm-area">
                  <b>
                    {f.area} {f.area_unit}
                  </b>
                </div>

                <button
                  className="icon-button"
                  title={t.edit}
                  onClick={() => openEdit(f)}
                >
                  <Edit size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function CropsPage({ t }) {
  const [farms, setFarms] = useState([]);
  const [master, setMaster] = useState([]);
  const [crops, setCrops] = useState([]);
  const [show, setShow] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [historyCrop, setHistoryCrop] = useState(null);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    farm_id: '',
    crop_id: '',
    season: 'Kharif',
    area: '',
    area_unit: 'acre',
    sowing_date: '',
    expected_harvest_date: '',
    status: 'active',
    notes: ''
  });

  const load = async () => {
    try {
      const [f, m, c] = await Promise.all([
        api.get('/farms'),
        api.get('/crops/master'),
        api.get('/crops')
      ]);

      setFarms(f.data);
      setMaster(m.data);
      setCrops(c.data);

      if (f.data.length && !form.farm_id) {
        setForm((x) => ({
          ...x,
          farm_id: String(f.data[0].id)
        }));
      }
    } catch (err) {
      setError(
        apiErrorMessage(err, t.error)
      );
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setHistoryCrop(null);
    setForm((x) => ({
      ...x,
      farm_id: x.farm_id || (farms[0] ? String(farms[0].id) : ''),
      crop_id: '',
      season: 'Kharif',
      area: '',
      area_unit: 'acre',
      sowing_date: '',
      expected_harvest_date: '',
      status: 'active',
      notes: ''
    }));
    setShow(true);
  };

  const openEdit = (crop) => {
    setEditingId(crop.id);
    setHistoryCrop(null);
    setForm({
      farm_id: String(crop.farm_id),
      crop_id: String(crop.crop_id),
      season: crop.season || 'Kharif',
      area: crop.area ?? '',
      area_unit: crop.area_unit || 'acre',
      sowing_date: crop.sowing_date || '',
      expected_harvest_date: crop.expected_harvest_date || '',
      status: crop.status || 'active',
      notes: crop.notes || ''
    });
    setShow(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const payload = {
        ...form,
        farm_id: Number(form.farm_id),
        crop_id: Number(form.crop_id),
        area: Number(form.area)
      };

      if (editingId) {
        await api.put(`/crops/${editingId}`, payload);
      } else {
        await api.post('/crops', payload);
      }

      setShow(false);
      setEditingId(null);

      setForm({
        farm_id: form.farm_id,
        crop_id: '',
        season: 'Kharif',
        area: '',
        area_unit: 'acre',
        sowing_date: '',
        expected_harvest_date: '',
        status: 'active'
      });

      load();
    } catch (err) {
      setError(
        apiErrorMessage(err, t.error)
      );
    }
  };

  if (historyCrop) {
    return (
      <CropHistoryPage
        t={t}
        crop={historyCrop}
        onBack={() => setHistoryCrop(null)}
      />
    );
  }

  return (
    <div className="section-card">
      <div className="card-heading">
        <div>
          <h3>{t.crops}</h3>
          <p>Manage crop seasons and cultivation details</p>
        </div>

        <button
          className="primary-button"
          onClick={() => (show ? setShow(false) : openCreate())}
        >
          <Plus size={16} />
          {t.addCrop}
        </button>
      </div>

      {show && (
        <form
          className="inline-form"
          onSubmit={submit}
        >
          <label>
            {t.farmName}

            <select
              required
              value={form.farm_id}
              onChange={(e) =>
                setForm({
                  ...form,
                  farm_id: e.target.value
                })
              }
            >
              {farms.map((f) => (
                <option
                  key={f.id}
                  value={f.id}
                >
                  {f.name}
                </option>
              ))}
            </select>
          </label>

          <div className="field-row">
            <label>
              {t.crop}

              <select
                required
                value={form.crop_id}
                onChange={(e) =>
                  setForm({
                    ...form,
                    crop_id: e.target.value
                  })
                }
              >
                <option value="">
                  Select crop
                </option>

                {master.map((c) => (
                  <option
                    key={c.id}
                    value={c.id}
                  >
                    {c.name_en} · {c.name_te}
                  </option>
                ))}
              </select>
            </label>

            <label>
              {t.season}

              <select
                value={form.season}
                onChange={(e) =>
                  setForm({
                    ...form,
                    season: e.target.value
                  })
                }
              >
                <option>Kharif</option>
                <option>Rabi</option>
                <option>Summer</option>
              </select>
            </label>
          </div>

          <div className="field-row">
            <label>
              {t.area}

              <input
                type="number"
                min="0.01"
                step="0.01"
                required
                value={form.area}
                onChange={(e) =>
                  setForm({
                    ...form,
                    area: e.target.value
                  })
                }
              />
            </label>

            <label>
              {t.unit}

              <select
                value={form.area_unit}
                onChange={(e) =>
                  setForm({
                    ...form,
                    area_unit: e.target.value
                  })
                }
              >
                <option value="acre">
                  {t.acres}
                </option>

                <option value="hectare">
                  {t.hectares}
                </option>
              </select>
            </label>
          </div>

          <div className="field-row">
            <label>
              {t.sowingDate}

              <input
                type="date"
                value={form.sowing_date}
                onChange={(e) =>
                  setForm({
                    ...form,
                    sowing_date: e.target.value
                  })
                }
              />
            </label>

            <label>
              {t.expectedHarvest}

              <input
                type="date"
                value={form.expected_harvest_date}
                onChange={(e) =>
                  setForm({
                    ...form,
                    expected_harvest_date:
                      e.target.value
                  })
                }
              />
            </label>
          </div>

          <label>
            {t.status}

            <select
              value={form.status}
              onChange={(e) =>
                setForm({
                  ...form,
                  status: e.target.value
                })
              }
            >
              <option value="active">
                {t.active}
              </option>

              <option value="planned">
                {t.planned}
              </option>

              <option value="completed">
                {t.completed}
              </option>
            </select>
          </label>

          <label>
            {t.notes}

            <textarea
              rows="3"
              value={form.notes}
              onChange={(e) =>
                setForm({ ...form, notes: e.target.value })
              }
            />
          </label>

          <div className="form-actions">
            <button
              type="button"
              className="outline-button"
              onClick={() => setShow(false)}
            >
              {t.cancel}
            </button>

            <button className="primary-button">
              {t.save}
            </button>
          </div>
        </form>
      )}

      {error && (
        <div className="error-box">
          {error}
        </div>
      )}

      {crops.length === 0 ? (
        <EmptyState
          text={t.noCrops}
          action={t.addCrop}
          onClick={() => setShow(true)}
        />
      ) : (
        <div className="crop-management-list">
          {crops.map((c) => (
            <div className="crop-management-row" key={c.id}>
              <div className="crop-thumb">
                <Wheat />
              </div>

              <div className="crop-info">
                <b>{c.crop.name_en} · {c.crop.name_te}</b>
                <small>
                  {c.farm_id} · {c.season} · {c.area} {c.area_unit} · {c.status}
                </small>
              </div>

              <div className="crop-actions">
                <button
                  className="icon-button"
                  title={t.edit}
                  onClick={() => openEdit(c)}
                >
                  <Edit size={15} />
                </button>

                <button
                  className="outline-button small-button"
                  onClick={() => setHistoryCrop(c)}
                >
                  <History size={14} />
                  {t.viewHistory}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function currencyInline(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(Number(value || 0));
}

function CropHistoryPage({ t, crop, onBack }) {
  const [data, setData] = useState({
    operations: [],
    expenses: [],
    sales: [],
    labour: [],
    yield: null
  });
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      api.get('/field-operations', { params: { crop_season_id: crop.id } }),
      api.get('/expenses', { params: { crop_season_id: crop.id } }),
      api.get('/sales', { params: { crop_season_id: crop.id } }),
      api.get('/labour/entries', { params: { crop_season_id: crop.id } }),
      api.get(`/crops/${crop.id}/yield`)
    ])
      .then(([o, e, s, l, y]) =>
        setData({
          operations: o.data || [],
          expenses: e.data || [],
          sales: s.data || [],
          labour: l.data || [],
          yield: y.data || null
        })
      )
      .catch((err) =>
        setError(apiErrorMessage(err, t.error))
      );
  }, [crop.id]);

  const currency = (n) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(Number(n || 0));

  const labourCost = data.labour.reduce(
    (sum, x) => sum + Number(x.total_wage || 0),
    0
  );
  const otherCost = data.expenses
    .filter((x) => x.category !== 'labour')
    .reduce((sum, x) => sum + Number(x.total_amount || 0), 0);
  const operationCost = data.operations.reduce(
    (sum, x) => sum + Number(x.cost || 0),
    0
  );
  const sales = data.sales.reduce(
    (sum, x) => sum + Number(x.total_amount || 0),
    0
  );
  const totalCost = labourCost + otherCost + operationCost;
  const profit = sales - totalCost;
  const roi = totalCost ? (profit / totalCost) * 100 : 0;
  const areaAcres =
    crop.area_unit === 'hectare'
      ? Number(crop.area) * 2.47105
      : Number(crop.area);
  const profitPerAcre = areaAcres ? profit / areaAcres : 0;

  const timeline = [
    ...data.operations.map((x) => ({
      date: x.operation_date,
      type: t.fieldOperationLabel,
      detail: t[x.operation_type] || x.operation_type,
      cost: x.cost
    })),
    ...data.expenses.map((x) => ({
      date: x.expense_date,
      type: t.expenseRecords,
      detail: t[x.category] || x.category,
      cost: x.total_amount
    })),
    ...data.sales.map((x) => ({
      date: x.sale_date,
      type: t.sales,
      detail: `${x.quantity} ${x.unit} @ ${x.rate}`,
      cost: -x.total_amount
    })),
    ...data.labour.map((x) => ({
      date: x.work_date,
      type: t.labour,
      detail: x.activity?.name_en || t.work,
      cost: x.total_wage
    }))
  ].sort((a, b) => String(b.date).localeCompare(String(a.date)));

  const saveYield = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/crops/${crop.id}/yield`, {
        expected_quantity:
          Number(e.target.expected_quantity.value) || null,
        actual_quantity:
          Number(e.target.actual_quantity.value) || null,
        unit: e.target.unit.value,
        notes: e.target.notes.value || null
      });

      const y = await api.get(`/crops/${crop.id}/yield`);
      setData((x) => ({ ...x, yield: y.data }));
    } catch (err) {
      setError(apiErrorMessage(err, t.error));
    }
  };

  return (
    <div className="section-card crop-history-page">
      <div className="card-heading">
        <div>
          <h3>
            {t.cropHistory}: {crop.crop.name_en} · {crop.crop.name_te}
          </h3>
          <p>
            {crop.season} · {crop.area} {crop.area_unit}
          </p>
        </div>
        <button className="outline-button" onClick={onBack}>
          <History size={15} />
          {t.backToCrops}
        </button>
      </div>

      {error && <div className="error-box">{error}</div>}

      <div className="history-kpi-grid">
        <div><span>{t.totalSales}</span><b>{currency(sales)}</b></div>
        <div><span>{t.totalInvestment}</span><b>{currency(totalCost)}</b></div>
        <div><span>{t.netProfit}</span><b className={profit >= 0 ? 'profit-cell' : 'loss-cell'}>{currency(profit)}</b></div>
        <div><span>{t.roi}</span><b>{roi.toFixed(1)}%</b></div>
        <div><span>{t.profitPerAcre}</span><b>{currency(profitPerAcre)}</b></div>
      </div>

      <div className="section-card nested-card">
        <div className="card-heading">
          <div>
            <h3>{t.yieldTracking}</h3>
            <p>{t.yieldTrackingHelp}</p>
          </div>
        </div>
        <form className="inline-form" onSubmit={saveYield}>
          <div className="field-row">
            <label>
              {t.expectedYield}
              <input
                name="expected_quantity"
                type="number"
                min="0"
                step="0.01"
                defaultValue={data.yield?.expected_quantity ?? ''}
              />
            </label>
            <label>
              {t.actualYield}
              <input
                name="actual_quantity"
                type="number"
                min="0"
                step="0.01"
                defaultValue={data.yield?.actual_quantity ?? ''}
              />
            </label>
          </div>
          <div className="field-row">
            <label>
              {t.unit}
              <select name="unit" defaultValue={data.yield?.unit || 'quintal'}>
                <option value="quintal">{t.quintal}</option>
                <option value="kg">{t.kg}</option>
                <option value="ton">{t.ton}</option>
              </select>
            </label>
            <label>
              {t.notes}
              <input name="notes" defaultValue={data.yield?.notes || ''} />
            </label>
          </div>
          <div className="form-actions">
            <button className="primary-button">
              <Save size={15} />
              {t.save}
            </button>
          </div>
        </form>

        {data.yield?.expected_quantity && data.yield?.actual_quantity ? (
          <div className="insight-box">
            <b>{t.yieldAchievement}</b>
            <span>
              {((Number(data.yield.actual_quantity) / Number(data.yield.expected_quantity)) * 100).toFixed(1)}%
            </span>
          </div>
        ) : null}
      </div>

      <div className="section-card nested-card">
        <div className="card-heading">
          <div>
            <h3>{t.activityHistory}</h3>
            <p>{t.activityHistoryHelp}</p>
          </div>
        </div>

        {timeline.length === 0 ? (
          <div className="empty-state">
            <p>{t.noActivityHistory}</p>
          </div>
        ) : (
          <div className="activity-timeline">
            {timeline.map((x, i) => (
              <div className="activity-timeline-row" key={`${x.date}-${i}`}>
                <div className="timeline-date">{x.date}</div>
                <div className="timeline-main">
                  <b>{x.type}</b>
                  <span>{x.detail}</span>
                </div>
                <strong className={x.cost < 0 ? 'profit-cell' : ''}>
                  {x.cost < 0
                    ? `-${currency(Math.abs(x.cost))}`
                    : currency(x.cost)}
                </strong>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function FieldOperationsPage({ t }) {
  const [farms, setFarms] = useState([]);
  const [crops, setCrops] = useState([]);
  const [operations, setOperations] = useState([]);
  const [show, setShow] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    farm_id: '',
    crop_season_id: '',
    operation_date: new Date().toISOString().slice(0, 10),
    operation_type: 'irrigation',
    description: '',
    product_name: '',
    quantity: '',
    unit: '',
    cost: '0',
    notes: ''
  });

  const load = async () => {
    try {
      const [f, c, o] = await Promise.all([
        api.get('/farms'),
        api.get('/crops'),
        api.get('/field-operations')
      ]);
      setFarms(f.data);
      setCrops(c.data);
      setOperations(o.data);

      if (f.data.length && !form.farm_id) {
        setForm((x) => ({ ...x, farm_id: String(f.data[0].id) }));
      }
    } catch (err) {
      setError(apiErrorMessage(err, t.error));
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm({
      ...form,
      farm_id: farms[0]?.id ? String(farms[0].id) : '',
      crop_season_id: crops[0]?.id ? String(crops[0].id) : '',
      operation_date: new Date().toISOString().slice(0, 10),
      operation_type: 'irrigation',
      description: '',
      product_name: '',
      quantity: '',
      unit: '',
      cost: '0',
      notes: ''
    });
    setShow(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const payload = {
        ...form,
        farm_id: Number(form.farm_id),
        crop_season_id: Number(form.crop_season_id),
        quantity: form.quantity ? Number(form.quantity) : null,
        cost: Number(form.cost || 0)
      };

      if (editingId) {
        await api.put(`/field-operations/${editingId}`, payload);
      } else {
        await api.post('/field-operations', payload);
      }

      setShow(false);
      setEditingId(null);
      await load();
    } catch (err) {
      setError(apiErrorMessage(err, t.error));
    }
  };

  const remove = async (id) => {
    if (!window.confirm(t.deleteConfirm)) return;
    try {
      await api.delete(`/field-operations/${id}`);
      await load();
    } catch (err) {
      setError(apiErrorMessage(err, t.error));
    }
  };

  const typeIcon = (type) => {
    if (type === 'irrigation') return <Droplets size={16} />;
    if (type === 'fertilizer') return <FlaskConical size={16} />;
    if (type === 'pesticide' || type === 'herbicide') return <SprayCan size={16} />;
    return <ClipboardList size={16} />;
  };

  return (
    <div className="section-card operations-page">
      <div className="card-heading">
        <div>
          <h3>{t.fieldOperations}</h3>
          <p>{t.fieldOperationsHelp}</p>
        </div>
        <button className="primary-button" onClick={openCreate} disabled={!crops.length}>
          <Plus size={16} />
          {t.addOperation}
        </button>
      </div>

      {!crops.length && <div className="notice">{t.addCropFirst}</div>}

      {show && (
        <form className="inline-form" onSubmit={submit}>
          <div className="field-row">
            <label>
              {t.farmName}
              <select
                required
                value={form.farm_id}
                onChange={(e) => {
                  const farmId = e.target.value;
                  const first = crops.find((c) => c.farm_id === Number(farmId));
                  setForm({
                    ...form,
                    farm_id: farmId,
                    crop_season_id: first ? String(first.id) : ''
                  });
                }}
              >
                {farms.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              {t.cropSeason}
              <select
                required
                value={form.crop_season_id}
                onChange={(e) =>
                  setForm({ ...form, crop_season_id: e.target.value })
                }
              >
                {crops
                  .filter((c) => !form.farm_id || c.farm_id === Number(form.farm_id))
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.crop.name_en} · {c.season}
                    </option>
                  ))}
              </select>
            </label>
          </div>

          <div className="field-row">
            <label>
              {t.operationType}
              <select
                value={form.operation_type}
                onChange={(e) =>
                  setForm({ ...form, operation_type: e.target.value })
                }
              >
                <option value="irrigation">{t.irrigation}</option>
                <option value="fertilizer">{t.fertilizer}</option>
                <option value="pesticide">{t.pesticide}</option>
                <option value="herbicide">{t.herbicide}</option>
                <option value="land_preparation">{t.landPreparation}</option>
                <option value="other">{t.other}</option>
              </select>
            </label>

            <label>
              {t.operationDate}
              <input
                type="date"
                required
                value={form.operation_date}
                onChange={(e) =>
                  setForm({ ...form, operation_date: e.target.value })
                }
              />
            </label>
          </div>

          <div className="field-row">
            <label>
              {t.productName}
              <input
                value={form.product_name}
                onChange={(e) =>
                  setForm({ ...form, product_name: e.target.value })
                }
              />
            </label>

            <label>
              {t.description}
              <input
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </label>
          </div>

          <div className="field-row">
            <label>
              {t.quantity}
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.quantity}
                onChange={(e) =>
                  setForm({ ...form, quantity: e.target.value })
                }
              />
            </label>

            <label>
              {t.unit}
              <input
                value={form.unit}
                onChange={(e) =>
                  setForm({ ...form, unit: e.target.value })
                }
              />
            </label>
          </div>

          <div className="field-row">
            <label>
              {t.cost}
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.cost}
                onChange={(e) =>
                  setForm({ ...form, cost: e.target.value })
                }
              />
            </label>

            <label>
              {t.notes}
              <input
                value={form.notes}
                onChange={(e) =>
                  setForm({ ...form, notes: e.target.value })
                }
              />
            </label>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="outline-button"
              onClick={() => setShow(false)}
            >
              {t.cancel}
            </button>
            <button className="primary-button">
              <Save size={15} />
              {editingId ? t.update : t.save}
            </button>
          </div>
        </form>
      )}

      {error && <div className="error-box">{error}</div>}

      {operations.length === 0 ? (
        <EmptyState
          text={t.noOperations}
          action={t.addOperation}
          onClick={openCreate}
        />
      ) : (
        <div className="operation-list">
          {operations.map((o) => (
            <div className="operation-row" key={o.id}>
              <div className="operation-icon">
                {typeIcon(o.operation_type)}
              </div>
              <div className="operation-main">
                <b>{t[o.operation_type] || o.operation_type}</b>
                <small>
                  {o.operation_date} · {o.product_name || o.description || t.other}
                  {o.quantity ? ` · ${o.quantity} ${o.unit || ''}` : ''}
                </small>
              </div>
              <strong>{currencyInline(o.cost)}</strong>
              <div className="operation-actions">
                <button
                  className="icon-button"
                  title={t.edit}
                  onClick={() => {
                    setEditingId(o.id);
                    setForm({
                      ...o,
                      farm_id: String(o.farm_id),
                      crop_season_id: String(o.crop_season_id),
                      quantity: o.quantity ?? '',
                      cost: o.cost ?? 0
                    });
                    setShow(true);
                  }}
                >
                  <Edit size={15} />
                </button>
                <button
                  className="icon-button danger"
                  title={t.delete}
                  onClick={() => remove(o.id)}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CropList({ crops }) {
  return (
    <div className="crop-list">
      {crops.map((c) => (
        <div
          className="crop-row"
          key={c.id}
        >
          <div className="crop-thumb">
            <Wheat />
          </div>

          <div className="crop-info">
            <b>{c.crop.name_en}</b>

            <small>
              {c.crop.name_te} · {c.season}
            </small>
          </div>

          <div className="crop-area">
            <b>
              {c.area} {c.area_unit}
            </b>

            <small>{c.status}</small>
          </div>

          <span
            className={`status-dot ${c.status}`}
          />
        </div>
      ))}
    </div>
  );
}

function LabourPage({ t }) {
  const [farms, setFarms] = useState([]);
  const [crops, setCrops] = useState([]);
  const [activities, setActivities] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [entries, setEntries] = useState([]);
  const [rates, setRates] = useState([]);

  const [summary, setSummary] = useState({
    total_amount: 0,
    entries_count: 0,
    total_worker_days: 0
  });

  const [mode, setMode] = useState('group');
  const [show, setShow] = useState(false);
  const [showWorker, setShowWorker] = useState(false);
  const [editingEntryId, setEditingEntryId] = useState(null);
  const [editingRateId, setEditingRateId] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const [selectedWorkerId, setSelectedWorkerId] =
    useState(null);

  const [form, setForm] = useState({
    crop_season_id: '',
    activity_id: '',
    entry_mode: 'group',
    worker_id: '',
    work_date: new Date(
      Date.now() -
        new Date().getTimezoneOffset() * 60000
    )
      .toISOString()
      .slice(0, 10),
    gender: 'female',
    workers_count: '0',
    days: '1',
    daily_wage: '',
    notes: ''
  });

  const [workerForm, setWorkerForm] = useState({
    name: '',
    gender: 'female',
    mobile: ''
  });

  const [selectedWorkerIds, setSelectedWorkerIds] =
    useState([]);

  const [rateForm, setRateForm] = useState({
    activity_id: '',
    gender: 'female',
    daily_wage: ''
  });

  const load = async () => {
    try {
      const [
        f,
        c,
        a,
        w,
        e,
        r,
        s
      ] = await Promise.all([
        api.get('/farms'),
        api.get('/crops'),
        api.get('/labour/activities'),
        api.get('/labour/workers'),
        api.get('/labour/entries'),
        api.get('/labour/wage-rates'),
        api.get('/labour/summary')
      ]);

      setFarms(f.data);
      setCrops(c.data);
      setActivities(a.data);
      setWorkers(w.data);
      setEntries(e.data);
      setRates(r.data);
      setSummary(s.data);

      if (
        c.data.length &&
        !form.crop_season_id
      ) {
        setForm((x) => ({
          ...x,
          crop_season_id: String(
            c.data[0].id
          )
        }));
      }

      if (
        a.data.length &&
        !form.activity_id
      ) {
        setForm((x) => ({
          ...x,
          activity_id: String(
            a.data[0].id
          )
        }));
      }

      if (
        a.data.length &&
        !rateForm.activity_id
      ) {
        setRateForm((x) => ({
          ...x,
          activity_id: String(
            a.data[0].id
          )
        }));
      }
    } catch (err) {
      setError(
        apiErrorMessage(err, t.error)
      );
    }
  };

  useEffect(() => {
    load();
  }, []);
  const editLabourEntry = (entry) => {
    const namedWorkers = (entry.worker_assignments || [])
        .filter((a) => !a.is_unnamed);

    const unnamedWorkersCount = Math.max(
        0,
        entry.workers_count - namedWorkers.length
    );

    setEditingEntryId(entry.id);

    setMode(entry.entry_mode || 'group');

    setSelectedWorkerIds(
        namedWorkers
            .filter((a) => a.worker_id != null)
            .map((a) => a.worker_id)
    );

    setForm({
        crop_season_id: String(entry.crop_season_id),
        activity_id: String(entry.activity_id),
        entry_mode: entry.entry_mode || 'group',
        worker_id: entry.worker_id ? String(entry.worker_id) : '',
        work_date: entry.work_date,
        gender: entry.gender,
        workers_count: String(unnamedWorkersCount),
        days: String(entry.days),
        daily_wage: '',
        notes: entry.notes || ''
      });

      setError('');
      setNotice('');
      setShow(true);
  };

  const saveEntry = async (e) => {
    e.preventDefault();
    setError('');
    setNotice('');

    try {
      const payload = {
        ...form,
        entry_mode: mode,
        crop_season_id: Number(
          form.crop_season_id
        ),
        activity_id: Number(
          form.activity_id
        ),
        worker_id:
          mode === 'individual'
            ? Number(form.worker_id)
            : null,
        worker_ids:
          mode === 'group'
            ? selectedWorkerIds
            : [],
        unnamed_workers_count:
          mode === 'group'
            ? Number(
                form.workers_count || 0
              )
            : 0,
        workers_count:
          mode === 'group'
            ? selectedWorkerIds.length +
              Number(
                form.workers_count || 0
              )
            : 1,
        days: Number(form.days),
        daily_wage: form.daily_wage
          ? Number(form.daily_wage)
          : null
      };
      if (editingEntryId) {
        await api.put(`/labour/entries/${editingEntryId}`, payload);
      } else {
        await api.post('/labour/entries', payload);
      }

      setNotice(
        editingEntryId
          ? 'Labour entry updated successfully.'
          : t.labourSaved
      );
      setEditingEntryId(null);
      setShow(false);

      setForm((x) => ({
        ...x,
        workers_count: '0',
        days: '1',
        daily_wage: '',
        notes: '',
        worker_id: ''
      }));

      setSelectedWorkerIds([]);

      await load();
    } catch (err) {
      setError(
        apiErrorMessage(err, t.error)
      );
    }
  };

  const saveWorker = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await api.post(
        '/labour/workers',
        workerForm
      );

      setWorkerForm({
        name: '',
        gender: 'female',
        mobile: ''
      });

      setShowWorker(false);
      setNotice(t.workerSaved);

      await load();
    } catch (err) {
      setError(
        apiErrorMessage(err, t.error)
      );
    }
  };

  const deleteWorker = async (worker) => {
    if (!window.confirm(t.deleteWorkerConfirm)) return;

    setError('');
    setNotice('');

    try {
      await api.delete(`/labour/workers/${worker.id}`);

      if (selectedWorkerId === worker.id) {
        setSelectedWorkerId(null);
      }

      setNotice(t.workerDeleted);
      await load();
    } catch (err) {
      setError(apiErrorMessage(err, t.error));
    }
  };

  const editWageRate = (rate) => {
    setEditingRateId(rate.id);
    setRateForm({
      activity_id: String(rate.activity_id),
      gender: rate.gender,
      daily_wage: String(rate.daily_wage)
    });
    setError('');
    setNotice('');
  };

  const deleteWageRate = async (rate) => {
    if (!window.confirm(t.deleteRateConfirm)) return;

    setError('');
    setNotice('');

    try {
      await api.delete(`/labour/wage-rates/${rate.id}`);

      if (editingRateId === rate.id) {
        setEditingRateId(null);
        setRateForm((x) => ({ ...x, daily_wage: '' }));
      }

      setNotice(t.rateDeleted);
      await load();
    } catch (err) {
      setError(apiErrorMessage(err, t.error));
    }
  };

  const saveRate = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await api.put('/labour/wage-rates', {
        ...rateForm,
        activity_id: Number(
          rateForm.activity_id
        ),
        daily_wage: Number(
          rateForm.daily_wage
        )
      });

      setRateForm((x) => ({
        ...x,
        daily_wage: ''
      }));
      setEditingRateId(null);

      setNotice(t.rateSaved);

      await load();
    } catch (err) {
      setError(
        apiErrorMessage(err, t.error)
      );
    }
  };

  const currency = (n) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(n || 0);

  const selectedWorker =
    workers.find(
      (w) => w.id === selectedWorkerId
    ) || null;

  const workerHistory = selectedWorker
    ? entries.flatMap((entry) =>
        (entry.worker_assignments || [])
          .filter(
            (a) =>
              a.worker_id ===
              selectedWorker.id
          )
          .map((a) => ({
            entry,
            a
          }))
      )
    : [];

  const workerHistoryTotal =
    workerHistory.reduce(
      (sum, item) =>
        sum +
        Number(
          item.a.total_wage || 0
        ),
      0
    );

  const workerHistoryDays =
    workerHistory.reduce(
      (sum, item) =>
        sum +
        Number(item.a.days || 0),
      0
    );

  return (
    <div className="labour-page">
      <div className="stats-grid">
        <Stat
          icon={<IndianRupee  t={t}/>}
          label={t.labourCost}
          value={currency(
            summary.total_amount
          )}
          tone="green"
        />

        <Stat
          icon={<Users  t={t}/>}
          label={t.workerDays}
          value={
            summary.total_worker_days
          }
          tone="gold"
        />

        <Stat
          icon={<CalendarDays  t={t}/>}
          label={t.entries}
          value={summary.entries_count}
          tone="blue"
        />
      </div>

      <div className="section-card">
        <div className="card-heading">
          <div>
            <h3>{t.labourRecords}</h3>
            <p>{t.labourHelp}</p>
          </div>

          <button
            className="primary-button"
            onClick={() => setShow(!show)}
            disabled={!crops.length}
          >
            <Plus size={16} />
            {t.addLabour}
          </button>
        </div>

        {!crops.length && (
          <div className="notice">
            {t.addCropFirst}
          </div>
        )}

        {show && (
          <form
            className="inline-form"
            onSubmit={saveEntry}
          >
            <div className="field-row">
              <label>
                {t.cropSeason}

                <select
                  required
                  value={
                    form.crop_season_id
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      crop_season_id:
                        e.target.value
                    })
                  }
                >
                  {crops.map((c) => (
                    <option
                      key={c.id}
                      value={c.id}
                    >
                      {c.crop.name_en} ·{' '}
                      {c.season} · {c.area}{' '}
                      {c.area_unit}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                {t.activity}

                <select
                  required
                  value={
                    form.activity_id
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      activity_id:
                        e.target.value
                    })
                  }
                >
                  {activities.map((a) => (
                    <option
                      key={a.id}
                      value={a.id}
                    >
                      {a.name_en} ·{' '}
                      {a.name_te}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="field-row">
              <label>
                {t.entryMode}

                <select
                  value={mode}
                  onChange={(e) => {
                    setMode(
                      e.target.value
                    );

                    setForm((x) => ({
                      ...x,
                      entry_mode:
                        e.target.value,
                      worker_id: ''
                    }));
                  }}
                >
                  <option value="group">
                    {t.groupEntry}
                  </option>

                  <option value="individual">
                    {t.individualEntry}
                  </option>
                </select>
              </label>

              <label>
                {t.workDate}

                <input
                  type="date"
                  required
                  value={
                    form.work_date
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      work_date:
                        e.target.value
                    })
                  }
                />
              </label>
            </div>

            {mode === 'individual' ? (
              <label>
                {t.worker}

                <select
                  required
                  value={form.worker_id}
                  onChange={(e) => {
                    const w =
                      workers.find(
                        (x) =>
                          x.id ===
                          Number(
                            e.target.value
                          )
                      );

                    setForm({
                      ...form,
                      worker_id:
                        e.target.value,
                      gender:
                        w?.gender ||
                        form.gender
                    });
                  }}
                >
                  <option value="">
                    {t.selectWorker}
                  </option>

                  {workers.map((w) => (
                    <option
                      key={w.id}
                      value={w.id}
                    >
                      {w.name} ({w.gender})
                    </option>
                  ))}
                </select>
              </label>
            ) : (
              <>
                <div className="notice">
                  Select registered workers.
                  You can also add unnamed
                  workers below.
                </div>

                <div className="worker-checkbox-list">
                  {workers.length === 0 ? (
                    <p>
                      No registered workers
                      yet. Use Add Worker
                      below.
                    </p>
                  ) : (
                    workers.map((w) => (
                      <label
                        className="worker-checkbox"
                        key={w.id}
                      >
                        <input
                          type="checkbox"
                          checked={selectedWorkerIds.includes(
                            w.id
                          )}
                          onChange={(e) =>
                            setSelectedWorkerIds(
                              (ids) =>
                                e.target
                                  .checked
                                  ? [
                                      ...ids,
                                      w.id
                                    ]
                                  : ids.filter(
                                      (id) =>
                                        id !==
                                        w.id
                                    )
                            )
                          }
                        />

                        <span>
                          {w.name}
                        </span>

                        <small>
                          {w.gender}
                        </small>
                      </label>
                    ))
                  )}
                </div>

                <div className="field-row">
                  <label>
                    Unnamed workers –
                    count

                    <input
                      type="number"
                      min="0"
                      max="1000"
                      value={
                        form.workers_count
                      }
                      onChange={(e) =>
                        setForm({
                          ...form,
                          workers_count:
                            e.target.value
                        })
                      }
                    />
                  </label>

                  <label>
                    Gender of unnamed
                    workers

                    <select
                      value={form.gender}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          gender:
                            e.target.value
                        })
                      }
                    >
                      <option value="female">
                        {t.female}
                      </option>

                      <option value="male">
                        {t.male}
                      </option>

                      <option value="other">
                        {t.other}
                      </option>
                    </select>
                  </label>
                </div>

                <p className="muted">
                  Named workers selected:{' '}
                  {selectedWorkerIds.length}.
                  {' '}
                  Unnamed workers:{' '}
                  {Number(
                    form.workers_count || 0
                  )}
                  .
                </p>
              </>
            )}

            <div className="field-row">
              <label>
                {t.days}

                <input
                  type="number"
                  min="0.25"
                  max="365"
                  step="0.25"
                  required
                  value={form.days}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      days: e.target.value
                    })
                  }
                />
              </label>

              <label>
                {t.dailyWageOptional}

                <input
                  type="number"
                  min="1"
                  step="0.01"
                  value={
                    form.daily_wage
                  }
                  placeholder={
                    t.useSavedRate
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      daily_wage:
                        e.target.value
                    })
                  }
                />
              </label>
            </div>

            <label>
              {t.notes}

              <input
                value={form.notes}
                onChange={(e) =>
                  setForm({
                    ...form,
                    notes: e.target.value
                  })
                }
              />
            </label>

            <div className="form-actions">
              <button
                type="button"
                className="outline-button"
                onClick={() => {
                  setShow(false);
                  setEditingEntryId(null);
                }}
              >
                {t.cancel}
              </button>

              <button className="primary-button">
                {editingEntryId ? t.update : t.saveLabour}
              </button>
            </div>
          </form>
        )}

        {error && (
          <div className="error-box">
            {String(error)}
          </div>
        )}

        {notice && (
          <div className="notice">
            {notice}
          </div>
        )}

        <div className="section-card worker-history-section">
          <div className="card-heading">
            <div>
              <h3>{t.workers}</h3>
              <p>
                {t.selectWorkerToView}
              </p>
            </div>

            <button
              className="outline-button"
              onClick={() =>
                setShowWorker(
                  !showWorker
                )
              }
            >
              <Plus size={15} />
              {t.addWorker}
            </button>
          </div>

          {showWorker && (
            <form
              className="inline-form"
              onSubmit={saveWorker}
            >
              <div className="field-row">
                <label>
                  {t.workerName}

                  <input
                    required
                    minLength="2"
                    value={
                      workerForm.name
                    }
                    onChange={(e) =>
                      setWorkerForm({
                        ...workerForm,
                        name: e.target.value
                      })
                    }
                  />
                </label>

                <label>
                  {t.gender}

                  <select
                    value={
                      workerForm.gender
                    }
                    onChange={(e) =>
                      setWorkerForm({
                        ...workerForm,
                        gender:
                          e.target.value
                      })
                    }
                  >
                    <option value="female">
                      {t.female}
                    </option>

                    <option value="male">
                      {t.male}
                    </option>

                    <option value="other">
                      {t.other}
                    </option>
                  </select>
                </label>
              </div>

              <label>
                {t.mobileOptional}

                <input
                  value={
                    workerForm.mobile
                  }
                  onChange={(e) =>
                    setWorkerForm({
                      ...workerForm,
                      mobile:
                        e.target.value
                    })
                  }
                />
              </label>

              <div className="form-actions">
                <button
                  type="button"
                  className="outline-button"
                  onClick={() =>
                    setShowWorker(false)
                  }
                >
                  {t.cancel}
                </button>

                <button className="primary-button">
                  {t.addWorker}
                </button>
              </div>
            </form>
          )}

          {workers.length === 0 ? (
            <div className="notice">
              {t.noWorkers}
            </div>
          ) : (
            <div className="worker-history-grid">
              {workers.map((w) => {
                const total =
                  entries.reduce(
                    (sum, e) =>
                      sum +
                      (
                        e.worker_assignments ||
                        []
                      )
                        .filter(
                          (a) =>
                            a.worker_id ===
                            w.id
                        )
                        .reduce(
                          (x, a) =>
                            x +
                            Number(
                              a.total_wage ||
                                0
                            ),
                          0
                        ),
                    0
                  );

                const days =
                  entries.reduce(
                    (sum, e) =>
                      sum +
                      (
                        e.worker_assignments ||
                        []
                      )
                        .filter(
                          (a) =>
                            a.worker_id ===
                            w.id
                        )
                        .reduce(
                          (x, a) =>
                            x +
                            Number(
                              a.days || 0
                            ),
                          0
                        ),
                    0
                  );

                return (
                  <div
                    className="worker-history-card-shell"
                    key={w.id}
                  >
                    <button
                      type="button"
                      className={`worker-history-card ${
                        selectedWorkerId ===
                        w.id
                          ? 'selected'
                          : ''
                      }`}
                      onClick={() =>
                        setSelectedWorkerId(
                          w.id
                        )
                      }
                    >
                      <span className="worker-avatar">
                        {w.name?.[0]?.toUpperCase()}
                      </span>

                      <span className="worker-main">
                        <b>{w.name}</b>

                        <small>
                          {w.gender}
                          {w.mobile
                            ? ` · ${w.mobile}`
                            : ''}
                        </small>
                      </span>

                      <span className="worker-earned">
                        <b>
                          {currency(total)}
                        </b>

                        <small>
                          {days} {t.days}
                        </small>
                      </span>
                    </button>

                    <button
                      type="button"
                      className="icon-button worker-delete-button"
                      title={t.delete}
                      aria-label={`${t.delete} ${w.name}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteWorker(w);
                      }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {selectedWorker && (
            <div className="worker-history-panel">
              <div className="worker-history-summary">
                <div>
                  <span>
                    {selectedWorker.name}
                  </span>
                  <small>
                    {selectedWorker.gender}
                  </small>
                </div>

                <div>
                  <b>
                    {currency(
                      workerHistoryTotal
                    )}
                  </b>

                  <small>
                    {t.totalEarned}
                  </small>
                </div>

                <div>
                  <b>
                    {workerHistoryDays}
                  </b>

                  <small>
                    {t.totalDays}
                  </small>
                </div>

                <div>
                  <b>
                    {workerHistory.length}
                  </b>

                  <small>
                    {t.workEntries}
                  </small>
                </div>
              </div>

              {workerHistory.length === 0 ? (
                <div className="notice">
                  {t.noWorkerHistory}
                </div>
              ) : (
                <div className="table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>{t.date}</th>
                        <th>{t.crop}</th>
                        <th>{t.activity}</th>
                        <th>{t.days}</th>
                        <th>
                          {t.dailyWage}
                        </th>
                        <th>{t.total}</th>
                      </tr>
                    </thead>

                    <tbody>
                      {workerHistory.map(
                        ({ entry, a }) => (
                          <tr
                            key={`${entry.id}-${a.worker_id}`}
                          >
                            <td>
                              {
                                entry.work_date
                              }
                            </td>

                            <td>
                              {crops.find(
                                (c) =>
                                  c.id ===
                                  entry.crop_season_id
                              )?.crop
                                .name_en ||
                                '—'}
                            </td>

                            <td>
                              {entry
                                .activity
                                ?.name_en ||
                                '—'}
                            </td>

                            <td>
                              {a.days}
                            </td>

                            <td>
                              {currency(
                                a.daily_wage_snapshot
                              )}
                            </td>

                            <td>
                              <b>
                                {currency(
                                  a.total_wage
                                )}
                              </b>
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="card-heading labour-subhead">
          <div>
            <h3>{t.recentLabour}</h3>
          </div>
        </div>

        {entries.length === 0 ? (
          <EmptyState
            text={t.noLabour}
            action={t.addLabour}
            onClick={() => setShow(true)}
          />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>{t.date}</th>
                  <th>{t.crop}</th>
                  <th>{t.activity}</th>
                  <th>
                    {t.workerGender}
                  </th>
                  <th>{t.quantity}</th>
                  <th>{t.rate}</th>
                  <th>{t.total}</th>
                  <th>{t.edit}</th>
                </tr>
              </thead>

              <tbody>
                {entries.map((x) => (
                  <tr key={x.id}>
                    <td>
                      {x.work_date}
                    </td>

                    <td>
                      {crops.find(
                        (c) =>
                          c.id ===
                          x.crop_season_id
                      )?.crop
                        .name_en || '—'}
                    </td>

                    <td>
                      {x.activity.name_en}
                    </td>

                    <td>
                      {x.worker_assignments
                        ?.map(
                          (a) =>
                            a.worker_name_snapshot
                        )
                        .join(', ') ||
                        (x.entry_mode ===
                        'individual'
                          ? workers.find(
                              (w) =>
                                w.id ===
                                x.worker_id
                            )?.name ||
                            t.individual
                          : x.gender)}
                    </td>

                    <td>
                      {x.workers_count} ×{' '}
                      {x.days}
                    </td>

                    <td>
                      {currency(
                        x.daily_wage_snapshot
                      )}
                    </td>

                    <td>
                      <b>
                        {currency(
                          x.total_wage
                        )}
                      </b>
                    </td>

                    <td>
                      <button
                        type="button"
                        className="icon-button"
                        title={t.edit}
                        onClick={() => editLabourEntry(x)}
                      >
                        <Edit size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="section-card">
        <div className="card-heading">
          <div>
            <h3>{t.wageRates}</h3>
            <p>{t.wageRateHelp}</p>
          </div>
        </div>

        <form
          className="inline-form"
          onSubmit={saveRate}
        >
          <div className="field-row">
            <label>
              {t.activity}

              <select
                value={
                  rateForm.activity_id
                }
                onChange={(e) =>
                  setRateForm({
                    ...rateForm,
                    activity_id:
                      e.target.value
                  })
                }
              >
                {activities.map((a) => (
                  <option
                    key={a.id}
                    value={a.id}
                  >
                    {a.name_en}
                  </option>
                ))}
              </select>
            </label>

            <label>
              {t.gender}

              <select
                value={rateForm.gender}
                onChange={(e) =>
                  setRateForm({
                    ...rateForm,
                    gender:
                      e.target.value
                  })
                }
              >
                <option value="female">
                  {t.female}
                </option>

                <option value="male">
                  {t.male}
                </option>

                <option value="other">
                  {t.other}
                </option>
              </select>
            </label>
          </div>

          <label>
            {t.dailyWage} (₹)

            <input
              type="number"
              min="1"
              step="0.01"
              required
              value={
                rateForm.daily_wage
              }
              onChange={(e) =>
                setRateForm({
                  ...rateForm,
                  daily_wage:
                    e.target.value
                })
              }
            />
          </label>

          <div className="form-actions">
            {editingRateId && (
              <button
                type="button"
                className="outline-button"
                onClick={() => {
                  setEditingRateId(null);
                  setRateForm((x) => ({ ...x, daily_wage: '' }));
                }}
              >
                {t.cancel}
              </button>
            )}
            <button className="primary-button">
              {editingRateId ? t.update : t.saveRate}
            </button>
          </div>
        </form>

        {rates.length > 0 && (
          <div className="rate-list">
            {rates.map((r) => (
              <div
                className="rate-row"
                key={r.id}
              >
                <span>
                  {r.activity.name_en} ·{' '}
                  {r.gender}
                </span>

                <b>
                  {currency(
                    r.daily_wage
                  )}
                  /{t.day}
                </b>
                <button
                  type="button"
                  className="icon-button"
                  title={t.edit}
                  onClick={() => editWageRate(r)}
                >
                  <Edit size={15} />
                </button>
                <button
                  type="button"
                  className="icon-button"
                  title={t.delete}
                  aria-label={`${t.delete} ${r.activity.name_en} ${r.gender}`}
                  onClick={() => deleteWageRate(r)}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ExpensesPage({ t }) {
  const [farms, setFarms] = useState([]);
  const [crops, setCrops] = useState([]);
  const [expenses, setExpenses] =
    useState([]);
  const [seasonSummary, setSeasonSummary] =
    useState([]);

  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const [form, setForm] = useState({
    farm_id: '',
    crop_season_id: '',
    expense_date: new Date(
      Date.now() -
        new Date().getTimezoneOffset() *
          60000
    )
      .toISOString()
      .slice(0, 10),
    category: 'seeds',
    description: '',
    quantity: '',
    unit: '',
    rate: '',
    total_amount: '',
    notes: ''
  });

  const categories = [
    ['seeds', t.seeds],
    ['fertilizers', t.fertilizers],
    ['pesticides', t.pesticides],
    ['herbicides', t.herbicides],
    ['labour', t.labourExpense],
    ['irrigation', t.irrigation],
    ['electricity', t.electricity],
    ['machinery', t.machinery],
    ['fuel', t.fuel],
    ['transport', t.transport],
    [
      'land_preparation',
      t.landPreparationExpense
    ],
    ['other', t.otherExpense]
  ];

  const load = async () => {
    try {
      const [
        f,
        c,
        e,
        s
      ] = await Promise.all([
        api.get('/farms'),
        api.get('/crops'),
        api.get('/expenses'),
        api.get(
          '/expenses/season-summary'
        )
      ]);

      setFarms(f.data);
      setCrops(c.data);
      setExpenses(e.data);
      setSeasonSummary(s.data);

      if (
        f.data.length &&
        !form.farm_id
      ) {
        setForm((x) => ({
          ...x,
          farm_id: String(
            f.data[0].id
          )
        }));
      }

      if (
        c.data.length &&
        !form.crop_season_id
      ) {
        setForm((x) => ({
          ...x,
          crop_season_id:
            String(c.data[0].id)
        }));
      }
    } catch (err) {
      setError(
        apiErrorMessage(err, t.error)
      );
    }
  };

  useEffect(() => {
    load();
  }, []);

  const selectedCrop = crops.find(
    (c) =>
      c.id ===
      Number(form.crop_season_id)
  );

  const totalPreview =
    form.quantity && form.rate
      ? (
          Number(form.quantity) *
          Number(form.rate)
        ).toFixed(2)
      : form.total_amount;

  const saveExpense = async (e) => {
    e.preventDefault();
    setError('');
    setNotice('');

    try {
      const total = Number(
        totalPreview || 0
      );

      await api.post('/expenses', {
        farm_id: Number(
          form.farm_id
        ),
        crop_season_id: Number(
          form.crop_season_id
        ),
        expense_date:
          form.expense_date,
        category:
          form.category,
        description:
          form.description ||
          null,
        quantity:
          form.quantity
            ? Number(
                form.quantity
              )
            : null,
        unit:
          form.unit || null,
        rate:
          form.rate
            ? Number(form.rate)
            : null,
        total_amount: total,
        notes:
          form.notes || null
      });

      setNotice(
        t.expenseSaved
      );

      setShow(false);

      setForm((x) => ({
        ...x,
        description: '',
        quantity: '',
        unit: '',
        rate: '',
        total_amount: '',
        notes: ''
      }));

      await load();
    } catch (err) {
      setError(
        apiErrorMessage(err, t.error)
      );
    }
  };

  const currency = (n) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(n || 0);

  const downloadCsv = async (
    seasonId
  ) => {
    try {
      const response =
        await api.get(
          '/expenses/export.csv',
          seasonId
            ? {
                params: {
                  crop_season_id:
                    seasonId
                },
                responseType:
                  'blob'
              }
            : {
                responseType:
                  'blob'
              }
        );

      const url =
        URL.createObjectURL(
          response.data
        );

      const a =
        document.createElement(
          'a'
        );

      a.href = url;

      a.download = seasonId
        ? `farmledger-expenses-season-${seasonId}.csv`
        : 'farmledger-expenses.csv';

      document.body.appendChild(a);
      a.click();
      a.remove();

      URL.revokeObjectURL(url);
    } catch (err) {
      setError(
        apiErrorMessage(err, t.error)
      );
    }
  };

  const totalExpense =
    expenses.reduce(
      (s, e) =>
        s +
        Number(
          e.total_amount || 0
        ),
      0
    );

  return (
    <div className="expenses-page">
      <div className="stats-grid">
        <Stat
          icon={<IndianRupee  t={t}/>}
          label={t.totalExpenses}
          value={currency(
            totalExpense
          )}
          tone="green"
        />

        <Stat
          icon={<ReceiptText  t={t}/>}
          label={t.expenseEntries}
          value={expenses.length}
          tone="gold"
        />

        <Stat
          icon={<Wheat  t={t}/>}
          label={
            t.seasonsWithExpenses
          }
          value={
            seasonSummary.length
          }
          tone="blue"
        />
      </div>

      <div className="section-card">
        <div className="card-heading">
          <div>
            <h3>
              {t.expenseRecords}
            </h3>

            <p>
              {t.expenseHelp}
            </p>
          </div>

          <div className="button-row">
            <button
              className="outline-button"
              onClick={() =>
                downloadCsv()
              }
            >
              <ReceiptText
                size={15}
              />
              {t.downloadCsv}
            </button>

            <button
              className="primary-button"
              onClick={() =>
                setShow(!show)
              }
              disabled={
                !crops.length
              }
            >
              <Plus size={16} />
              {t.addExpense}
            </button>
          </div>
        </div>

        {!crops.length && (
          <div className="notice">
            {t.addCropFirst}
          </div>
        )}

        {show && (
          <form
            className="inline-form"
            onSubmit={
              saveExpense
            }
          >
            <div className="field-row">
              <label>
                {t.farmName}

                <select
                  required
                  value={
                    form.farm_id
                  }
                  onChange={(e) => {
                    const farmId =
                      e.target
                        .value;

                    const first =
                      crops.find(
                        (c) =>
                          c.farm_id ===
                          Number(
                            farmId
                          )
                      );

                    setForm((x) => ({
                      ...x,
                      farm_id:
                        farmId,
                      crop_season_id:
                        first
                          ? String(
                              first.id
                            )
                          : ''
                    }));
                  }}
                >
                  {farms.map(
                    (f) => (
                      <option
                        key={f.id}
                        value={f.id}
                      >
                        {f.name}
                      </option>
                    )
                  )}
                </select>
              </label>

              <label>
                {t.cropSeason}

                <select
                  required
                  value={
                    form.crop_season_id
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      crop_season_id:
                        e.target.value
                    })
                  }
                >
                  <option value="">
                    {
                      t.selectCropSeason
                    }
                  </option>

                  {crops
                    .filter(
                      (c) =>
                        !form.farm_id ||
                        c.farm_id ===
                          Number(
                            form.farm_id
                          )
                    )
                    .map((c) => (
                      <option
                        key={c.id}
                        value={c.id}
                      >
                        {
                          c.crop
                            .name_en
                        }{' '}
                        · {c.season} ·{' '}
                        {c.area}{' '}
                        {c.area_unit}
                      </option>
                    ))}
                </select>
              </label>
            </div>

            <div className="field-row">
              <label>
                {t.expenseDate}

                <input
                  type="date"
                  required
                  value={
                    form.expense_date
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      expense_date:
                        e.target.value
                    })
                  }
                />
              </label>

              <label>
                {t.category}

                <select
                  required
                  value={
                    form.category
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      category:
                        e.target.value
                    })
                  }
                >
                  {categories.map(
                    ([v, l]) => (
                      <option
                        key={v}
                        value={v}
                      >
                        {l}
                      </option>
                    )
                  )}
                </select>
              </label>
            </div>

            <label>
              {t.description}

              <input
                value={
                  form.description
                }
                onChange={(e) =>
                  setForm({
                    ...form,
                    description:
                      e.target.value
                  })
                }
                placeholder={
                  t.descriptionPlaceholder
                }
              />
            </label>

            <div className="field-row">
              <label>
                {t.quantity}

                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={
                    form.quantity
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      quantity:
                        e.target.value
                    })
                  }
                />
              </label>

              <label>
                {t.unit}

                <input
                  value={form.unit}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      unit: e.target.value
                    })
                  }
                  placeholder="kg / bags / litres / hours"
                />
              </label>

              <label>
                {t.rate}

                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={
                    form.rate
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      rate: e.target.value
                    })
                  }
                />
              </label>
            </div>

            <label>
              {t.totalAmount}

              <input
                type="number"
                min="0.01"
                step="0.01"
                required
                value={
                  totalPreview
                }
                onChange={(e) =>
                  setForm({
                    ...form,
                    total_amount:
                      e.target.value
                  })
                }
                readOnly={
                  Boolean(
                    form.quantity &&
                      form.rate
                  )
                }
              />
            </label>

            {selectedCrop && (
              <p className="muted">
                {
                  selectedCrop
                    .crop
                    .name_en
                }{' '}
                ·{' '}
                {
                  selectedCrop
                    .season
                }{' '}
                ·{' '}
                {
                  selectedCrop
                    .area
                }{' '}
                {
                  selectedCrop
                    .area_unit
                }
              </p>
            )}

            <label>
              {t.notes}

              <input
                value={
                  form.notes
                }
                onChange={(e) =>
                  setForm({
                    ...form,
                    notes:
                      e.target.value
                  })
                }
              />
            </label>

            <div className="form-actions">
              <button
                type="button"
                className="outline-button"
                onClick={() =>
                  setShow(false)
                }
              >
                {t.cancel}
              </button>

              <button className="primary-button">
                {t.saveExpense}
              </button>
            </div>
          </form>
        )}

        {error && (
          <div className="error-box">
            {String(error)}
          </div>
        )}

        {notice && (
          <div className="notice">
            {notice}
          </div>
        )}

        {expenses.length === 0 ? (
          <EmptyState
            text={t.noExpenses}
            action={t.addExpense}
            onClick={() =>
              setShow(true)
            }
          />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>{t.date}</th>
                  <th>{t.crop}</th>
                  <th>
                    {t.category}
                  </th>
                  <th>
                    {t.description}
                  </th>
                  <th>
                    {t.quantity}
                  </th>
                  <th>{t.rate}</th>
                  <th>{t.total}</th>
                </tr>
              </thead>

              <tbody>
                {expenses.map((e) => {
                  const c =
                    crops.find(
                      (x) =>
                        x.id ===
                        e.crop_season_id
                    );

                  return (
                    <tr
                      key={e.id}
                    >
                      <td>
                        {
                          e.expense_date
                        }
                      </td>

                      <td>
                        {c
                          ? `${c.crop.name_en} · ${c.season}`
                          : '—'}
                      </td>

                      <td>
                        {categories.find(
                          (x) =>
                            x[0] ===
                            e.category
                        )?.[1] ||
                          e.category}
                      </td>

                      <td>
                        {e.description ||
                          '—'}
                      </td>

                      <td>
                        {e.quantity
                          ? `${e.quantity}${
                              e.unit
                                ? ` ${e.unit}`
                                : ''
                            }`
                          : '—'}
                      </td>

                      <td>
                        {e.rate
                          ? currency(
                              e.rate
                            )
                          : '—'}
                      </td>

                      <td>
                        <b>
                          {currency(
                            e.total_amount
                          )}
                        </b>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="section-card">
        <div className="card-heading">
          <div>
            <h3>
              {t.seasonWiseExpenses}
            </h3>

            <p>
              {
                t.seasonWiseExpenseHelp
              }
            </p>
          </div>
        </div>

        {seasonSummary.length ===
        0 ? (
          <div className="notice">
            {t.noSeasonExpenses}
          </div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>
                    {t.farmName}
                  </th>

                  <th>
                    {t.crop}
                  </th>

                  <th>
                    {t.season}
                  </th>

                  <th>
                    {t.area}
                  </th>

                  <th>
                    {t.expenseEntries}
                  </th>

                  <th>
                    {t.totalExpenses}
                  </th>

                  <th>
                    {t.actions}
                  </th>
                </tr>
              </thead>

              <tbody>
                {seasonSummary.map(
                  (s) => (
                    <tr
                      key={
                        s.crop_season_id
                      }
                    >
                      <td>
                        {s.farm_name}
                      </td>

                      <td>
                        {
                          s.crop_name_en
                        }{' '}
                        ·{' '}
                        {
                          s.crop_name_te
                        }
                      </td>

                      <td>
                        {s.season}
                      </td>

                      <td>
                        {s.area}{' '}
                        {
                          s.area_unit
                        }
                      </td>

                      <td>
                        {
                          s.expense_entries
                        }
                      </td>

                      <td>
                        <b>
                          {currency(
                            s.total_expense
                          )}
                        </b>
                      </td>

                      <td>
                        <button
                          className="text-button"
                          onClick={() =>
                            downloadCsv(
                              s.crop_season_id
                            )
                          }
                        >
                          {
                            t.downloadCsv
                          }
                        </button>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function SalesPage({ t }) {
  const [farms, setFarms] =
    useState([]);
  const [crops, setCrops] =
    useState([]);
  const [sales, setSales] =
    useState([]);
  const [seasonSummary, setSeasonSummary] =
    useState([]);
  const [profitability, setProfitability] =
    useState([]);

  const [show, setShow] =
    useState(false);

  const [error, setError] =
    useState('');

  const [notice, setNotice] =
    useState('');

  const [form, setForm] =
    useState({
      farm_id: '',
      crop_season_id: '',
      sale_date:
        new Date(
          Date.now() -
            new Date().getTimezoneOffset() *
              60000
        )
          .toISOString()
          .slice(0, 10),
      quantity: '',
      unit: 'quintal',
      rate: '',
      total_amount: '',
      buyer: '',
      market: '',
      notes: ''
    });

  const load = async () => {
    try {
      const [
        f,
        c,
        s,
        ss,
        p
      ] = await Promise.all([
        api.get('/farms'),
        api.get('/crops'),
        api.get('/sales'),
        api.get(
          '/sales/season-summary'
        ),
        api.get(
          '/profitability/season-summary'
        )
      ]);

      setFarms(f.data);
      setCrops(c.data);
      setSales(s.data);
      setSeasonSummary(ss.data);
      setProfitability(p.data);

      if (
        f.data.length &&
        !form.farm_id
      ) {
        setForm((x) => ({
          ...x,
          farm_id: String(
            f.data[0].id
          )
        }));
      }

      if (
        c.data.length &&
        !form.crop_season_id
      ) {
        setForm((x) => ({
          ...x,
          crop_season_id:
            String(
              c.data[0].id
            )
        }));
      }
    } catch (err) {
      setError(
        apiErrorMessage(err, t.error)
      );
    }
  };

  useEffect(() => {
    load();
  }, []);

  const selectedCrop =
    crops.find(
      (c) =>
        c.id ===
        Number(
          form.crop_season_id
        )
    );

  const totalPreview =
    form.quantity &&
    form.rate
      ? (
          Number(
            form.quantity
          ) *
          Number(form.rate)
        ).toFixed(2)
      : form.total_amount;

  const saveSale = async (e) => {
    e.preventDefault();
    setError('');
    setNotice('');

    try {
      const total = Number(
        totalPreview || 0
      );

      await api.post('/sales', {
        farm_id: Number(
          form.farm_id
        ),
        crop_season_id:
          Number(
            form.crop_season_id
          ),
        sale_date:
          form.sale_date,
        quantity: Number(
          form.quantity
        ),
        unit:
          form.unit.trim(),
        rate: Number(
          form.rate
        ),
        total_amount:
          total,
        buyer:
          form.buyer.trim() ||
          null,
        market:
          form.market.trim() ||
          null,
        notes:
          form.notes.trim() ||
          null
      });

      setNotice(
        t.saleSaved
      );

      setShow(false);

      setForm((x) => ({
        ...x,
        quantity: '',
        rate: '',
        total_amount:
          '',
        buyer: '',
        market: '',
        notes: ''
      }));

      await load();
    } catch (err) {
      setError(
        apiErrorMessage(err, t.error)
      );
    }
  };

  const currency = (n) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(n || 0);

  const totalSales =
    sales.reduce(
      (sum, x) =>
        sum +
        Number(
          x.total_amount || 0
        ),
      0
    );

  const totalProfit =
    profitability.reduce(
      (sum, x) =>
        sum +
        Number(
          x.net_profit || 0
        ),
      0
    );

  const downloadCsv = async (
    seasonId
  ) => {
    try {
      const response =
        await api.get(
          '/sales/export.csv',
          seasonId
            ? {
                params: {
                  crop_season_id:
                    seasonId
                },
                responseType:
                  'blob'
              }
            : {
                responseType:
                  'blob'
              }
        );

      const url =
        URL.createObjectURL(
          response.data
        );

      const a =
        document.createElement(
          'a'
        );

      a.href = url;

      a.download =
        seasonId
          ? `farmledger-sales-season-${seasonId}.csv`
          : 'farmledger-sales.csv';

      document.body.appendChild(
        a
      );

      a.click();
      a.remove();

      URL.revokeObjectURL(
        url
      );
    } catch (err) {
      setError(
        apiErrorMessage(err, t.error)
      );
    }
  };

  return (
    <div className="sales-page">
      <div className="stats-grid">
        <Stat
          icon={<IndianRupee  t={t}/>}
          label={t.totalSales}
          value={currency(
            totalSales
          )}
          tone="green"
        />

        <Stat
          icon={<ReceiptText  t={t}/>}
          label={t.saleEntries}
          value={sales.length}
          tone="gold"
        />

        <Stat
          icon={<ArrowUpRight  t={t}/>}
          label={t.netProfit}
          value={currency(
            totalProfit
          )}
          tone="blue"
        />
      </div>

      <div className="section-card">
        <div className="card-heading">
          <div>
            <h3>
              {t.salesRecords}
            </h3>

            <p>
              {t.salesHelp}
            </p>
          </div>

          <div className="button-row">
            <button
              className="outline-button"
              onClick={() =>
                downloadCsv()
              }
            >
              <ReceiptText
                size={15}
              />
              {t.downloadCsv}
            </button>

            <button
              className="primary-button"
              onClick={() =>
                setShow(!show)
              }
              disabled={
                !crops.length
              }
            >
              <Plus size={16} />
              {t.addSale}
            </button>
          </div>
        </div>

        {!crops.length && (
          <div className="notice">
            {t.addCropFirst}
          </div>
        )}

        {show && (
          <form
            className="inline-form"
            onSubmit={saveSale}
          >
            <div className="field-row">
              <label>
                {t.farmName}

                <select
                  required
                  value={
                    form.farm_id
                  }
                  onChange={(e) => {
                    const farmId =
                      e.target
                        .value;

                    const first =
                      crops.find(
                        (c) =>
                          c.farm_id ===
                          Number(
                            farmId
                          )
                      );

                    setForm((x) => ({
                      ...x,
                      farm_id:
                        farmId,
                      crop_season_id:
                        first
                          ? String(
                              first.id
                            )
                          : ''
                    }));
                  }}
                >
                  {farms.map(
                    (f) => (
                      <option
                        key={f.id}
                        value={f.id}
                      >
                        {f.name}
                      </option>
                    )
                  )}
                </select>
              </label>

              <label>
                {t.cropSeason}

                <select
                  required
                  value={
                    form.crop_season_id
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      crop_season_id:
                        e.target.value
                    })
                  }
                >
                  {crops
                    .filter(
                      (c) =>
                        !form.farm_id ||
                        c.farm_id ===
                          Number(
                            form.farm_id
                          )
                    )
                    .map((c) => (
                      <option
                        key={c.id}
                        value={c.id}
                      >
                        {
                          c.crop
                            .name_en
                        }{' '}
                        · {c.season}
                      </option>
                    ))}
                </select>
              </label>
            </div>

            <div className="field-row">
              <label>
                {t.saleDate}

                <input
                  type="date"
                  required
                  value={
                    form.sale_date
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      sale_date:
                        e.target.value
                    })
                  }
                />
              </label>

              <label>
                {t.quantity}

                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  required
                  value={
                    form.quantity
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      quantity:
                        e.target.value
                    })
                  }
                />
              </label>
            </div>

            <div className="field-row">
              <label>
                {t.unit}

                <select
                  value={
                    form.unit
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      unit:
                        e.target.value
                    })
                  }
                >
                  <option value="quintal">
                    {t.quintal}
                  </option>

                  <option value="kg">
                    {t.kg}
                  </option>

                  <option value="ton">
                    {t.ton}
                  </option>

                  <option value="bag">
                    {t.bag}
                  </option>

                  <option value="other">
                    {t.other}
                  </option>
                </select>
              </label>

              <label>
                {t.rate} (₹)

                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  required
                  value={
                    form.rate
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      rate:
                        e.target.value
                    })
                  }
                />
              </label>
            </div>

            <label>
              {t.totalSalesAmount} (₹)

              <input
                type="number"
                min="0.01"
                step="0.01"
                required
                value={
                  totalPreview
                }
                onChange={(e) =>
                  setForm({
                    ...form,
                    total_amount:
                      e.target.value
                  })
                }
                readOnly={
                  Boolean(
                    form.quantity &&
                      form.rate
                  )
                }
              />
            </label>

            <div className="field-row">
              <label>
                {t.buyer}

                <input
                  value={
                    form.buyer
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      buyer:
                        e.target.value
                    })
                  }
                  placeholder={
                    t.buyerPlaceholder
                  }
                />
              </label>

              <label>
                {t.market}

                <input
                  value={
                    form.market
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      market:
                        e.target.value
                    })
                  }
                  placeholder={
                    t.marketPlaceholder
                  }
                />
              </label>
            </div>

            {selectedCrop && (
              <p className="muted">
                {
                  selectedCrop
                    .crop
                    .name_en
                }{' '}
                ·{' '}
                {
                  selectedCrop
                    .season
                }{' '}
                ·{' '}
                {
                  selectedCrop
                    .area
                }{' '}
                {
                  selectedCrop
                    .area_unit
                }
              </p>
            )}

            <label>
              {t.notes}

              <input
                value={
                  form.notes
                }
                onChange={(e) =>
                  setForm({
                    ...form,
                    notes:
                      e.target.value
                  })
                }
              />
            </label>

            <div className="form-actions">
              <button
                type="button"
                className="outline-button"
                onClick={() =>
                  setShow(false)
                }
              >
                {t.cancel}
              </button>

              <button className="primary-button">
                {t.saveSale}
              </button>
            </div>
          </form>
        )}

        {error && (
          <div className="error-box">
            {String(error)}
          </div>
        )}

        {notice && (
          <div className="notice">
            {notice}
          </div>
        )}

        {sales.length === 0 ? (
          <EmptyState
            text={t.noSales}
            action={t.addSale}
            onClick={() =>
              setShow(true)
            }
          />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>{t.date}</th>
                  <th>{t.crop}</th>
                  <th>
                    {t.quantity}
                  </th>
                  <th>{t.rate}</th>
                  <th>{t.buyer}</th>
                  <th>{t.market}</th>
                  <th>{t.total}</th>
                </tr>
              </thead>

              <tbody>
                {sales.map((s) => {
                  const c =
                    crops.find(
                      (x) =>
                        x.id ===
                        s.crop_season_id
                    );

                  return (
                    <tr
                      key={s.id}
                    >
                      <td>
                        {s.sale_date}
                      </td>

                      <td>
                        {c
                          ? `${c.crop.name_en} · ${c.season}`
                          : '—'}
                      </td>

                      <td>
                        {s.quantity}{' '}
                        {s.unit}
                      </td>

                      <td>
                        {currency(
                          s.rate
                        )}
                      </td>

                      <td>
                        {s.buyer ||
                          '—'}
                      </td>

                      <td>
                        {s.market ||
                          '—'}
                      </td>

                      <td>
                        <b>
                          {currency(
                            s.total_amount
                          )}
                        </b>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="section-card">
        <div className="card-heading">
          <div>
            <h3>
              {t.seasonWiseSales}
            </h3>

            <p>
              {
                t.seasonWiseSalesHelp
              }
            </p>
          </div>
        </div>

        {seasonSummary.length ===
        0 ? (
          <div className="notice">
            {t.noSeasonSales}
          </div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>
                    {t.farmName}
                  </th>

                  <th>
                    {t.crop}
                  </th>

                  <th>
                    {t.season}
                  </th>

                  <th>
                    {t.area}
                  </th>

                  <th>
                    {t.saleEntries}
                  </th>

                  <th>
                    {t.totalSales}
                  </th>

                  <th>
                    {t.actions}
                  </th>
                </tr>
              </thead>

              <tbody>
                {seasonSummary.map(
                  (s) => (
                    <tr
                      key={
                        s.crop_season_id
                      }
                    >
                      <td>
                        {
                          s.farm_name
                        }
                      </td>

                      <td>
                        {
                          s.crop_name_en
                        }{' '}
                        ·{' '}
                        {
                          s.crop_name_te
                        }
                      </td>

                      <td>
                        {s.season}
                      </td>

                      <td>
                        {s.area}{' '}
                        {
                          s.area_unit
                        }
                      </td>

                      <td>
                        {
                          s.sale_entries
                        }
                      </td>

                      <td>
                        <b>
                          {currency(
                            s.total_sales
                          )}
                        </b>
                      </td>

                      <td>
                        <button
                          className="text-button"
                          onClick={() =>
                            downloadCsv(
                              s.crop_season_id
                            )
                          }
                        >
                          {
                            t.downloadCsv
                          }
                        </button>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="section-card">
        <div className="card-heading">
          <div>
            <h3>
              {t.profitability}
            </h3>

            <p>
              {
                t.profitabilityHelp
              }
            </p>
          </div>
        </div>

        {profitability.length ===
        0 ? (
          <div className="notice">
            {t.noProfitability}
          </div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>{t.crop}</th>
                  <th>{t.season}</th>
                  <th>
                    {t.totalSales}
                  </th>
                  <th>
                    {t.otherExpenses}
                  </th>
                  <th>
                    {t.labourCost}
                  </th>
                  <th>
                    {t.totalCost}
                  </th>
                  <th>
                    {t.netProfit}
                  </th>
                  <th>
                    {t.margin}
                  </th>
                </tr>
              </thead>

              <tbody>
                {profitability.map(
                  (p) => (
                    <tr
                      key={
                        p.crop_season_id
                      }
                    >
                      <td>
                        {
                          p.crop_name_en
                        }{' '}
                        ·{' '}
                        {
                          p.crop_name_te
                        }
                      </td>

                      <td>
                        {p.season}
                      </td>

                      <td>
                        {currency(
                          p.total_sales
                        )}
                      </td>

                      <td>
                        {currency(
                          p.other_expenses
                        )}
                      </td>

                      <td>
                        {currency(
                          p.labour_cost
                        )}
                      </td>

                      <td>
                        {currency(
                          p.total_cost
                        )}
                      </td>

                      <td>
                        <b>
                          {currency(
                            p.net_profit
                          )}
                        </b>
                      </td>

                      <td>
                        {p.margin_percent.toFixed(
                          2
                        )}
                        %
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}

        <p className="field-help">
          {t.labourDoubleCountHelp}
        </p>
      </div>
    </div>
  );
}

export default App;