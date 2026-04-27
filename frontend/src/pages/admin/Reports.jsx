/**
 * Page component: Reports.
 * 
 * Defines a route/page-level React component.
 */

import React, { useEffect, useMemo, useState } from 'react';
import axios from '../../api/axiosInstance';

const REPORT_TABS = [
    { id: 'finance', label: 'Finance Report' },
    { id: 'attendance', label: 'Attendance Report' },
    { id: 'tournaments', label: 'Tournament Report' },
];

const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];

const expenseCategoryLabels = {
    RENT: 'Rent',
    ELECTRICITY: 'Electricity / Current Bill',
    CLEANING: 'Cleaning Salary',
    CLERK_SALARY: 'Clerk Salary',
    MAINTENANCE: 'Maintenance',
    INTERNET: 'Internet',
    TOURNAMENT_PRIZES: 'Tournament Gifts / Prizes',
};

const chartPalette = ['#1f7a4f', '#f5b700', '#2b6cb0', '#d64545', '#7a8b3f', '#8a5cf6'];

const formatCurrency = (value) => `LKR ${Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const formatNumber = (value) => Number(value || 0).toLocaleString();
const formatPercentage = (value) => `${Number(value || 0).toFixed(1)}%`;

const buildConicGradient = (data) => {
    const total = data.reduce((sum, item) => sum + Number(item.value || 0), 0);
    if (!total) {
        return '#edf4ec';
    }

    let current = 0;
    const stops = data.map((item, index) => {
        const value = Number(item.value || 0);
        const start = current;
        current += (value / total) * 360;
        return `${item.color || chartPalette[index % chartPalette.length]} ${start}deg ${current}deg`;
    });

    return `conic-gradient(${stops.join(', ')})`;
};

const SummaryCard = ({ label, value, subtext, tone = 'default' }) => {
    const toneStyles = {
        default: { background: '#ffffff', valueColor: '#163020' },
        income: { background: 'linear-gradient(135deg, #f4fbf5 0%, #eef8f2 100%)', valueColor: '#1f7a4f' },
        warning: { background: 'linear-gradient(135deg, #fffaf0 0%, #fff4d6 100%)', valueColor: '#cc8a00' },
        danger: { background: 'linear-gradient(135deg, #fff5f5 0%, #ffe7e7 100%)', valueColor: '#c43d3d' },
        info: { background: 'linear-gradient(135deg, #f0f7ff 0%, #e7f0ff 100%)', valueColor: '#2b6cb0' },
    };

    return (
        <div
            className="card border-0 shadow-sm rounded-4 h-100"
            style={{ background: toneStyles[tone].background }}
        >
            <div className="card-body p-4">
                <div className="text-uppercase small fw-semibold text-secondary mb-2">{label}</div>
                <div className="fw-bold display-6 mb-2" style={{ fontSize: '2rem', color: toneStyles[tone].valueColor }}>
                    {value}
                </div>
                <div className="text-muted small">{subtext}</div>
            </div>
        </div>
    );
};

const ReportPanel = ({ title, subtitle, children, action }) => (
    <div className="card border-0 shadow-sm rounded-4 h-100">
        <div className="card-body p-4">
            <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
                <div>
                    <h5 className="fw-bold mb-1" style={{ color: '#163020' }}>{title}</h5>
                    {subtitle ? <p className="text-muted small mb-0">{subtitle}</p> : null}
                </div>
                {action}
            </div>
            {children}
        </div>
    </div>
);

const EmptyChartState = ({ message }) => (
    <div
        className="rounded-4 d-flex align-items-center justify-content-center text-muted small"
        style={{ minHeight: 220, background: '#f7faf7', border: '1px dashed #d7e4d7' }}
    >
        {message}
    </div>
);

const DonutChart = ({ title, data, centerLabel, centerValue }) => {
    const total = data.reduce((sum, item) => sum + Number(item.value || 0), 0);

    return (
        <ReportPanel title={title}>
            {!total ? (
                <EmptyChartState message="No data available for this chart." />
            ) : (
                <div className="row g-4 align-items-center">
                    <div className="col-md-6">
                        <div className="d-flex justify-content-center">
                            <div
                                className="position-relative rounded-circle"
                                style={{
                                    width: 220,
                                    height: 220,
                                    background: buildConicGradient(data),
                                    boxShadow: 'inset 0 0 0 1px rgba(22, 48, 32, 0.04)',
                                }}
                            >
                                <div
                                    className="position-absolute top-50 start-50 translate-middle rounded-circle bg-white d-flex flex-column align-items-center justify-content-center text-center"
                                    style={{ width: 128, height: 128, boxShadow: '0 12px 30px rgba(31, 122, 79, 0.10)' }}
                                >
                                    <div className="small text-muted">{centerLabel}</div>
                                    <div className="fw-bold fs-5" style={{ color: '#163020' }}>{centerValue}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="d-flex flex-column gap-3">
                            {data.map((item, index) => {
                                const value = Number(item.value || 0);
                                const percentage = total ? (value / total) * 100 : 0;
                                return (
                                    <div key={`${item.label}-${index}`} className="d-flex align-items-center justify-content-between gap-3">
                                        <div className="d-flex align-items-center gap-3">
                                            <span
                                                className="rounded-circle d-inline-block"
                                                style={{ width: 12, height: 12, background: item.color || chartPalette[index % chartPalette.length] }}
                                            />
                                            <div>
                                                <div className="fw-semibold" style={{ color: '#163020' }}>{item.label}</div>
                                                <div className="small text-muted">{formatPercentage(percentage)}</div>
                                            </div>
                                        </div>
                                        <div className="fw-semibold text-end" style={{ color: '#1f7a4f' }}>
                                            {item.formatter ? item.formatter(value) : formatNumber(value)}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </ReportPanel>
    );
};

const BarChart = ({ title, subtitle, data, valueFormatter = formatNumber, tone = '#1f7a4f', maxBars = 6 }) => {
    const limited = data.slice(0, maxBars);
    const maxValue = Math.max(...limited.map((item) => Number(item.value || 0)), 0);

    return (
        <ReportPanel title={title} subtitle={subtitle}>
            {!limited.length || !maxValue ? (
                <EmptyChartState message="No data available for this chart." />
            ) : (
                <div className="d-flex align-items-end gap-3" style={{ minHeight: 260 }}>
                    {limited.map((item, index) => {
                        const value = Number(item.value || 0);
                        const height = Math.max((value / maxValue) * 180, 18);
                        return (
                            <div key={`${item.label}-${index}`} className="d-flex flex-column justify-content-end flex-fill h-100">
                                <div className="small fw-semibold text-center mb-2" style={{ color: '#163020' }}>
                                    {valueFormatter(value)}
                                </div>
                                <div
                                    className="rounded-top-4 mx-auto"
                                    style={{
                                        width: '100%',
                                        maxWidth: 82,
                                        height,
                                        background: `linear-gradient(180deg, ${tone} 0%, ${tone}cc 100%)`,
                                        boxShadow: '0 16px 24px rgba(31, 122, 79, 0.12)',
                                    }}
                                />
                                <div className="small text-muted text-center mt-3 px-1" style={{ minHeight: 44 }}>
                                    {item.label}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </ReportPanel>
    );
};

const TopList = ({ title, subtitle, rows, emptyMessage, accent = '#1f7a4f', valueSuffix = '' }) => (
    <ReportPanel title={title} subtitle={subtitle}>
        {!rows.length ? (
            <EmptyChartState message={emptyMessage} />
        ) : (
            <div className="d-flex flex-column gap-3">
                {rows.map((row, index) => (
                    <div key={`${row.label}-${index}`} className="d-flex justify-content-between align-items-center rounded-4 p-3" style={{ background: '#f8fbf8' }}>
                        <div>
                            <div className="fw-semibold" style={{ color: '#163020' }}>{row.label}</div>
                            {row.description ? <div className="small text-muted">{row.description}</div> : null}
                        </div>
                        <div className="fw-bold fs-5" style={{ color: accent }}>
                            {row.value}{valueSuffix}
                        </div>
                    </div>
                ))}
            </div>
        )}
    </ReportPanel>
);

const Reports = () => {
    const today = new Date();
    const [activeTab, setActiveTab] = useState('finance');
    const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(today.getFullYear());
    const [attendanceRows, setAttendanceRows] = useState([]);
    const [paymentSummary, setPaymentSummary] = useState({});
    const [salarySummary, setSalarySummary] = useState({ rows: [], trend: [] });
    const [tournaments, setTournaments] = useState([]);
    const [financeSummary, setFinanceSummary] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReports = async () => {
            setLoading(true);
            try {
                const [attendanceRes, paymentsRes, salaryRes, tournamentRes, financeRes] = await Promise.all([
                    axios.get(`/analytics/reports/student_attendance/?month=${selectedMonth}&year=${selectedYear}`),
                    axios.get(`/analytics/reports/payments_summary/?month=${selectedMonth}&year=${selectedYear}`),
                    axios.get(`/analytics/reports/coach_salary_summary/?month=${selectedMonth}&year=${selectedYear}`),
                    axios.get(`/analytics/reports/tournament_details/?month=${selectedMonth}&year=${selectedYear}`),
                    axios.get(`/payments/finance_summary/?month=${selectedMonth}&year=${selectedYear}`),
                ]);

                setAttendanceRows(attendanceRes.data || []);
                setPaymentSummary(paymentsRes.data || {});
                setSalarySummary(salaryRes.data || { rows: [], trend: [] });
                setTournaments(tournamentRes.data || []);
                setFinanceSummary(financeRes.data || null);
            } catch (error) {
                console.error('Failed to load reports:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchReports();
    }, [selectedMonth, selectedYear]);

    const attendanceInsights = useMemo(() => {
        const enriched = (attendanceRows || []).map((row) => {
            const totalClasses = Number(row.total_classes || 0);
            const presentClasses = Number(row.present_classes || 0);
            const absentClasses = Math.max(totalClasses - presentClasses, 0);
            const percentage = totalClasses ? (presentClasses / totalClasses) * 100 : 0;
            return {
                ...row,
                totalClasses,
                presentClasses,
                absentClasses,
                percentage,
                studentName: `${row.first_name} ${row.last_name}`,
            };
        });

        const totalClasses = enriched.reduce((sum, row) => sum + row.totalClasses, 0);
        const totalPresent = enriched.reduce((sum, row) => sum + row.presentClasses, 0);
        const totalAbsent = enriched.reduce((sum, row) => sum + row.absentClasses, 0);
        const averageRate = totalClasses ? (totalPresent / totalClasses) * 100 : 0;

        return {
            totalStudents: enriched.length,
            totalClasses,
            totalPresent,
            totalAbsent,
            averageRate,
            topStudents: [...enriched]
                .filter((row) => row.totalClasses > 0)
                .sort((a, b) => b.percentage - a.percentage)
                .slice(0, 6),
            lowStudents: [...enriched]
                .filter((row) => row.totalClasses > 0)
                .sort((a, b) => a.percentage - b.percentage)
                .slice(0, 5),
        };
    }, [attendanceRows]);

    const financeInsights = useMemo(() => {
        const expenseBreakdownEntries = Object.entries(financeSummary?.expense_breakdown || {}).map(([key, value], index) => ({
            label: expenseCategoryLabels[key] || key,
            value: Number(value || 0),
            color: chartPalette[index % chartPalette.length],
            formatter: formatCurrency,
        }));

        return {
            incomeSplit: [
                {
                    label: 'Student Fees',
                    value: Number(financeSummary?.student_fee_income || 0),
                    color: '#1f7a4f',
                    formatter: formatCurrency,
                },
                {
                    label: 'Tournament Fees',
                    value: Number(financeSummary?.tournament_fee_income || 0),
                    color: '#f5b700',
                    formatter: formatCurrency,
                },
            ],
            expenseSplit: [
                {
                    label: 'Coach Salaries',
                    value: Number(financeSummary?.coach_salary_expense || 0),
                    color: '#d64545',
                    formatter: formatCurrency,
                },
                {
                    label: 'Other Expenses',
                    value: Number(financeSummary?.other_expenses_total || 0),
                    color: '#2b6cb0',
                    formatter: formatCurrency,
                },
            ],
            expenseBreakdownEntries,
            salaryTrendData: (salarySummary?.trend || [])
                .map((row) => ({
                    label: row.payment_period,
                    value: Number(row.total_net || 0),
                }))
                .slice(-6),
        };
    }, [financeSummary, salarySummary]);

    const tournamentInsights = useMemo(() => {
        const now = new Date();
        const totalParticipants = tournaments.reduce((sum, item) => sum + Number(item.participant_count || 0), 0);
        const totalAttendance = tournaments.reduce((sum, item) => sum + Number(item.attendance_count || 0), 0);
        const totalFees = tournaments.reduce((sum, item) => sum + Number(item.fees_collected || 0), 0);
        const upcomingCount = tournaments.filter((item) => new Date(item.tournament_date) >= now).length;
        const finishedCount = Math.max(tournaments.length - upcomingCount, 0);

        return {
            totalParticipants,
            totalAttendance,
            totalFees,
            upcomingCount,
            finishedCount,
            attendanceRate: totalParticipants ? (totalAttendance / totalParticipants) * 100 : 0,
            feeChartData: tournaments.map((item, index) => ({
                label: item.tournament_name,
                value: Number(item.fees_collected || 0),
                color: chartPalette[index % chartPalette.length],
            })),
            topResults: tournaments
                .filter((item) => item.top_results?.length)
                .slice(0, 4)
                .map((item) => ({
                    label: item.tournament_name,
                    description: item.top_results[0] ? `${item.top_results[0].student} ranked #${item.top_results[0].rank}` : 'Results pending',
                    value: formatNumber(item.participant_count),
                })),
        };
    }, [tournaments]);

    const renderFinanceTab = () => (
        <>
            <div className="row g-4 mb-4">
                <div className="col-md-6 col-xl-3">
                    <SummaryCard
                        label="Selected Month Revenue"
                        value={formatCurrency(financeSummary?.total_income || 0)}
                        subtext="Student fees and tournament fees collected in the selected month."
                        tone="income"
                    />
                </div>
                <div className="col-md-6 col-xl-3">
                    <SummaryCard
                        label="Coach Salary Expense"
                        value={formatCurrency(financeSummary?.coach_salary_expense || 0)}
                        subtext="Total coach payroll calculated for the selected month."
                        tone="danger"
                    />
                </div>
                <div className="col-md-6 col-xl-3">
                    <SummaryCard
                        label="Other Expenses"
                        value={formatCurrency(financeSummary?.other_expenses_total || 0)}
                        subtext="Rent, bills, cleaning, maintenance, internet, and tournament prizes."
                        tone="warning"
                    />
                </div>
                <div className="col-md-6 col-xl-3">
                    <SummaryCard
                        label="Net Income"
                        value={formatCurrency(financeSummary?.net_income || 0)}
                        subtext="Total income after coach salaries and all monthly expenses."
                        tone={Number(financeSummary?.net_income || 0) >= 0 ? 'info' : 'danger'}
                    />
                </div>
            </div>

            <div className="row g-4">
                <div className="col-xl-6">
                    <DonutChart
                        title="Income Composition"
                        data={financeInsights.incomeSplit}
                        centerLabel="Month Total"
                        centerValue={formatCurrency(financeSummary?.total_income || 0)}
                    />
                </div>
                <div className="col-xl-6">
                    <DonutChart
                        title="Expense Composition"
                        data={financeInsights.expenseSplit}
                        centerLabel="Expenses"
                        centerValue={formatCurrency(
                            Number(financeSummary?.coach_salary_expense || 0) + Number(financeSummary?.other_expenses_total || 0)
                        )}
                    />
                </div>
                <div className="col-xl-7">
                    <BarChart
                        title="Monthly Coach Salary Trend"
                        subtitle="Recent payroll totals help compare salary movement across periods."
                        data={financeInsights.salaryTrendData}
                        valueFormatter={(value) => `LKR ${Number(value).toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                        tone="#1f7a4f"
                    />
                </div>
                <div className="col-xl-5">
                    <TopList
                        title="Expense Breakdown"
                        subtitle="Where the academy spends money during the selected month."
                        rows={financeInsights.expenseBreakdownEntries.map((item) => ({
                            label: item.label,
                            value: formatCurrency(item.value),
                        }))}
                        emptyMessage="No expense data available for this month."
                        accent="#d64545"
                    />
                </div>
            </div>
        </>
    );

    const renderAttendanceTab = () => (
        <>
            <div className="row g-4 mb-4">
                <div className="col-md-6 col-xl-3">
                    <SummaryCard
                        label="Students Tracked"
                        value={formatNumber(attendanceInsights.totalStudents)}
                        subtext="Students included in attendance reporting."
                        tone="info"
                    />
                </div>
                <div className="col-md-6 col-xl-3">
                    <SummaryCard
                        label="Present Marks"
                        value={formatNumber(attendanceInsights.totalPresent)}
                        subtext="All present attendance entries recorded so far."
                        tone="income"
                    />
                </div>
                <div className="col-md-6 col-xl-3">
                    <SummaryCard
                        label="Absent Marks"
                        value={formatNumber(attendanceInsights.totalAbsent)}
                        subtext="Absences captured in the student attendance records."
                        tone="danger"
                    />
                </div>
                <div className="col-md-6 col-xl-3">
                    <SummaryCard
                        label="Average Attendance"
                        value={formatPercentage(attendanceInsights.averageRate)}
                        subtext="Overall attendance quality across all students."
                        tone="warning"
                    />
                </div>
            </div>

            <div className="row g-4">
                <div className="col-xl-6">
                    <DonutChart
                        title="Present vs Absent Ratio"
                        data={[
                            { label: 'Present', value: attendanceInsights.totalPresent, color: '#1f7a4f', formatter: formatNumber },
                            { label: 'Absent', value: attendanceInsights.totalAbsent, color: '#d64545', formatter: formatNumber },
                        ]}
                        centerLabel="Attendance Rate"
                        centerValue={formatPercentage(attendanceInsights.averageRate)}
                    />
                </div>
                <div className="col-xl-6">
                    <BarChart
                        title="Top Student Attendance"
                        subtitle="Students with the strongest attendance performance."
                        data={attendanceInsights.topStudents.map((row) => ({
                            label: row.studentName,
                            value: row.percentage,
                        }))}
                        valueFormatter={(value) => `${Number(value).toFixed(0)}%`}
                        tone="#2b6cb0"
                    />
                </div>
                <div className="col-xl-12">
                    <TopList
                        title="Students Requiring Attention"
                        subtitle="These students have the lowest attendance percentages and may need follow-up."
                        rows={attendanceInsights.lowStudents.map((row) => ({
                            label: row.studentName,
                            description: `${row.presentClasses} present out of ${row.totalClasses} classes`,
                            value: `${row.percentage.toFixed(0)}%`,
                        }))}
                        emptyMessage="No attendance risks are visible right now."
                        accent="#cc8a00"
                    />
                </div>
            </div>
        </>
    );

    const renderTournamentTab = () => (
        <>
            <div className="row g-4 mb-4">
                <div className="col-md-6 col-xl-3">
                    <SummaryCard
                        label="Total Tournaments"
                        value={formatNumber(tournaments.length)}
                        subtext="All tournaments currently tracked in the system."
                        tone="info"
                    />
                </div>
                <div className="col-md-6 col-xl-3">
                    <SummaryCard
                        label="Participants"
                        value={formatNumber(tournamentInsights.totalParticipants)}
                        subtext="Combined registrations across all tournaments."
                        tone="income"
                    />
                </div>
                <div className="col-md-6 col-xl-3">
                    <SummaryCard
                        label="Attendance Rate"
                        value={formatPercentage(tournamentInsights.attendanceRate)}
                        subtext="Participant attendance recorded across tournaments."
                        tone="warning"
                    />
                </div>
                <div className="col-md-6 col-xl-3">
                    <SummaryCard
                        label="Tournament Fees"
                        value={formatCurrency(tournamentInsights.totalFees)}
                        subtext="Total tournament fee collection from paid registrations."
                        tone="income"
                    />
                </div>
            </div>

            <div className="row g-4">
                <div className="col-xl-6">
                    <DonutChart
                        title="Tournament Status Overview"
                        data={[
                            { label: 'Upcoming / Ongoing', value: tournamentInsights.upcomingCount, color: '#1f7a4f', formatter: formatNumber },
                            { label: 'Finished', value: tournamentInsights.finishedCount, color: '#d64545', formatter: formatNumber },
                        ]}
                        centerLabel="Scheduled"
                        centerValue={formatNumber(tournaments.length)}
                    />
                </div>
                <div className="col-xl-6">
                    <DonutChart
                        title="Participant Attendance"
                        data={[
                            { label: 'Present', value: tournamentInsights.totalAttendance, color: '#2b6cb0', formatter: formatNumber },
                            { label: 'Absent', value: Math.max(tournamentInsights.totalParticipants - tournamentInsights.totalAttendance, 0), color: '#f5b700', formatter: formatNumber },
                        ]}
                        centerLabel="Attendance Rate"
                        centerValue={formatPercentage(tournamentInsights.attendanceRate)}
                    />
                </div>
                <div className="col-xl-7">
                    <BarChart
                        title="Tournament Fee Collection"
                        subtitle="Compare fee collection between tournaments."
                        data={tournamentInsights.feeChartData}
                        valueFormatter={(value) => `LKR ${Number(value).toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                        tone="#7a8b3f"
                    />
                </div>
                <div className="col-xl-5">
                    <TopList
                        title="Top Recorded Results"
                        subtitle="A quick view of the leading results already entered."
                        rows={tournamentInsights.topResults}
                        emptyMessage="Tournament results have not been recorded yet."
                        accent="#1f7a4f"
                    />
                </div>
            </div>
        </>
    );

    if (loading) {
        return <div className="p-5 text-center">Loading reports...</div>;
    }

    return (
        <div className="container-fluid p-0">
            <div
                className="rounded-4 p-4 p-lg-5 mb-4"
                style={{
                    background: 'linear-gradient(135deg, #f8fcf8 0%, #edf5ee 45%, #e7f0e8 100%)',
                    border: '1px solid #e1ebe1',
                }}
            >
                <div className="d-flex flex-wrap justify-content-between align-items-start gap-3">
                    <div>
                        <p className="text-uppercase small fw-semibold mb-2" style={{ color: '#1f7a4f', letterSpacing: '0.08em' }}>
                            Academy Reports
                        </p>
                        <h2 className="fw-bold mb-2" style={{ color: '#163020' }}>Visual Reports & Analytics</h2>
                        <p className="text-muted mb-0" style={{ maxWidth: 640 }}>
                            Review finance performance, student attendance patterns, and tournament outcomes through clean visual reports built for presentations and day-to-day decisions.
                        </p>
                    </div>
                    <div className="d-flex flex-wrap align-items-center gap-2">
                        <select
                            className="form-select rounded-3 border-0 shadow-sm"
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(Number(e.target.value))}
                            style={{ minWidth: 150 }}
                        >
                            {MONTHS.map((monthName, index) => (
                                <option key={monthName} value={index + 1}>{monthName}</option>
                            ))}
                        </select>
                        <select
                            className="form-select rounded-3 border-0 shadow-sm"
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(Number(e.target.value))}
                            style={{ minWidth: 120 }}
                        >
                            {[2025, 2026, 2027].map((year) => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="d-flex flex-wrap gap-2 mb-4">
                {REPORT_TABS.map((tab) => (
                    <button
                        key={tab.id}
                        type="button"
                        className="btn rounded-pill px-4 py-2 fw-semibold"
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            border: activeTab === tab.id ? 'none' : '1px solid #d7e4d7',
                            background: activeTab === tab.id ? '#1f7a4f' : '#ffffff',
                            color: activeTab === tab.id ? '#ffffff' : '#4f5d52',
                            boxShadow: activeTab === tab.id ? '0 14px 26px rgba(31, 122, 79, 0.18)' : 'none',
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {activeTab === 'finance' ? renderFinanceTab() : null}
            {activeTab === 'attendance' ? renderAttendanceTab() : null}
            {activeTab === 'tournaments' ? renderTournamentTab() : null}

            <div className="text-muted small mt-4">
                Finance figures reflect the selected month. Attendance and tournament reports summarize the data currently stored in the system.
            </div>
        </div>
    );
};

export default Reports;
