import React, { useEffect, useMemo, useState } from 'react';
import axios from '../../api/axiosInstance';
import { Modal, Button, Form, Table, Tab, Tabs, Badge } from 'react-bootstrap';
import { useAppUI } from '../../contexts/AppUIContext';

const monthNames = [
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

const Payments = () => {
    const { confirm, notifySuccess, notifyError } = useAppUI();
    const today = new Date();
    const [payments, setPayments] = useState([]);
    const [salaries, setSalaries] = useState([]);
    const [dues, setDues] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [financeSummary, setFinanceSummary] = useState(null);
    const [showRecordModal, setShowRecordModal] = useState(false);
    const [showExpenseModal, setShowExpenseModal] = useState(false);
    const [editingExpenseId, setEditingExpenseId] = useState(null);
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState('');
    const [calculatedFee, setCalculatedFee] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('CASH');
    const [paymentType, setPaymentType] = useState('MONTHLY');
    const [selectedFinanceMonth, setSelectedFinanceMonth] = useState(today.getMonth() + 1);
    const [selectedFinanceYear, setSelectedFinanceYear] = useState(today.getFullYear());
    const [selectedSalaryPeriod, setSelectedSalaryPeriod] = useState('');
    const [expenseForm, setExpenseForm] = useState({
        title: '',
        category: 'RENT',
        amount: '',
        expense_date: today.toISOString().split('T')[0],
        notes: '',
    });

    useEffect(() => {
        fetchPayments();
        fetchStudents();
        fetchDues();
    }, []);

    useEffect(() => {
        fetchSalaries();
        fetchExpenses();
        fetchFinanceSummary();
    }, [selectedFinanceMonth, selectedFinanceYear]);

    const fetchPayments = async () => {
        try {
            const response = await axios.get('/payments/');
            setPayments(response.data);
        } catch (error) {
            console.error('Error fetching payments:', error);
        }
    };

    const fetchSalaries = async () => {
        try {
            const response = await axios.get('/salaries/');
            setSalaries(response.data);
        } catch (error) {
            console.error('Error fetching salaries:', error);
        }
    };

    const fetchExpenses = async () => {
        try {
            const response = await axios.get(`/expenses/?month=${selectedFinanceMonth}&year=${selectedFinanceYear}`);
            setExpenses(response.data);
        } catch (error) {
            console.error('Error fetching expenses:', error);
        }
    };

    const fetchFinanceSummary = async () => {
        try {
            const response = await axios.get(`/payments/finance_summary/?month=${selectedFinanceMonth}&year=${selectedFinanceYear}`);
            setFinanceSummary(response.data);
        } catch (error) {
            console.error('Error fetching finance summary:', error);
            notifyError('Unable to load monthly finance summary.');
        }
    };

    const fetchDues = async () => {
        try {
            const response = await axios.get('/payments/dues/');
            setDues(response.data);
        } catch (error) {
            console.error('Error fetching dues:', error);
        }
    };

    const fetchStudents = async () => {
        try {
            const response = await axios.get('/students/?status=ACTIVE');
            setStudents(response.data);
        } catch (error) {
            console.error('Error fetching students:', error);
        }
    };

    const handleStudentChange = async (studentId) => {
        setSelectedStudent(studentId);
        if (!studentId) {
            setCalculatedFee(null);
            return;
        }
        try {
            const response = await axios.get(
                `/payments/calculate_fee/?student_id=${studentId}&month=${selectedFinanceMonth}&year=${selectedFinanceYear}`
            );
            setCalculatedFee(response.data);
        } catch (error) {
            console.error('Error calculating fee:', error);
        }
    };

    const handleRecordPayment = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/payments/', {
                student: selectedStudent,
                amount: calculatedFee.calculated_fee,
                payment_date: `${selectedFinanceYear}-${String(selectedFinanceMonth).padStart(2, '0')}-01`,
                payment_method: paymentMethod,
                payment_type: paymentType,
            });
            notifySuccess('Payment recorded successfully.');
            setShowRecordModal(false);
            fetchPayments();
            fetchDues();
            fetchFinanceSummary();
        } catch (error) {
            console.error('Error recording payment:', error);
            notifyError('Failed to record payment.');
        }
    };

    const resetExpenseForm = () => {
        setExpenseForm({
            title: '',
            category: 'RENT',
            amount: '',
            expense_date: `${selectedFinanceYear}-${String(selectedFinanceMonth).padStart(2, '0')}-01`,
            notes: '',
        });
        setEditingExpenseId(null);
    };

    const handleCreateExpense = async (e) => {
        e.preventDefault();
        try {
            if (editingExpenseId) {
                await axios.patch(`/expenses/${editingExpenseId}/`, expenseForm);
                notifySuccess('Expense updated successfully.');
            } else {
                await axios.post('/expenses/', expenseForm);
                notifySuccess('Expense recorded successfully.');
            }
            setShowExpenseModal(false);
            resetExpenseForm();
            fetchExpenses();
            fetchFinanceSummary();
        } catch (error) {
            console.error('Error saving expense:', error);
            notifyError('Failed to save expense.');
        }
    };

    const handleEditExpense = (expense) => {
        setEditingExpenseId(expense.id);
        setExpenseForm({
            title: expense.title,
            category: expense.category,
            amount: expense.amount,
            expense_date: expense.expense_date,
            notes: expense.notes || '',
        });
        setShowExpenseModal(true);
    };

    const handleDeleteExpense = async (expenseId) => {
        const shouldDelete = await confirm({
            title: 'Delete Expense',
            message: 'Remove this expense record from the selected month?',
            confirmLabel: 'Delete',
            variant: 'danger',
        });
        if (!shouldDelete) return;

        try {
            await axios.delete(`/expenses/${expenseId}/`);
            notifySuccess('Expense deleted.');
            fetchExpenses();
            fetchFinanceSummary();
        } catch (error) {
            console.error('Error deleting expense:', error);
            notifyError('Failed to delete expense.');
        }
    };

    const paymentPeriodLabel = `${monthNames[selectedFinanceMonth - 1]} ${selectedFinanceYear}`;

    const visibleSalaries = useMemo(
        () => salaries.filter((salary) => salary.payment_period === selectedSalaryPeriod),
        [salaries, selectedSalaryPeriod]
    );

    useEffect(() => {
        setSelectedSalaryPeriod(paymentPeriodLabel);
    }, [paymentPeriodLabel]);

    const handleProcessSalary = async (salaryId) => {
        const selectedSalary = salaries.find((salary) => salary.id === salaryId);
        const periodLabel = selectedSalary?.payment_period || paymentPeriodLabel;
        const shouldProcess = await confirm({
            title: 'Mark Monthly Salary as Paid',
            message: `Mark ${periodLabel} salary as paid for ${selectedSalary?.coach_name || 'this coach'}?`,
            confirmLabel: `Mark ${periodLabel} Paid`,
            variant: 'success',
        });
        if (!shouldProcess) return;

        try {
            await axios.patch(`/salaries/${salaryId}/`, {
                status: 'PAID',
                payment_date: new Date().toISOString().split('T')[0],
            });
            notifySuccess('Salary processed successfully.');
            fetchSalaries();
            fetchFinanceSummary();
        } catch (error) {
            console.error('Error processing salary:', error);
            notifyError('Failed to process salary.');
        }
    };

    const recentPayments = useMemo(
        () => payments.filter((payment) => {
            const paymentDate = new Date(payment.payment_date);
            return paymentDate.getMonth() + 1 === selectedFinanceMonth
                && paymentDate.getFullYear() === selectedFinanceYear;
        }).slice(0, 10),
        [payments, selectedFinanceMonth, selectedFinanceYear]
    );

    return (
        <div className="container-fluid p-0">
            <div className="d-flex flex-column flex-xl-row justify-content-between align-items-xl-center gap-3 mb-4">
                <div>
                    <h3 className="fw-bold m-0 text-success" style={{ color: '#6c9343' }}>Payment & Finance</h3>
                    <div className="text-muted small mt-1">
                        Finance figures below are calculated for the selected month.
                    </div>
                </div>
                <div className="d-flex flex-wrap align-items-center gap-2">
                    <Form.Select
                        value={selectedFinanceMonth}
                        onChange={(e) => setSelectedFinanceMonth(Number(e.target.value))}
                        style={{ minWidth: '160px' }}
                    >
                        {monthNames.map((month, index) => (
                            <option key={month} value={index + 1}>{month}</option>
                        ))}
                    </Form.Select>
                    <Form.Control
                        type="number"
                        value={selectedFinanceYear}
                        onChange={(e) => setSelectedFinanceYear(Number(e.target.value))}
                        style={{ width: '110px' }}
                    />
                    <button
                        className="btn text-white fw-bold px-4 py-2"
                        style={{ backgroundColor: '#6c9343' }}
                        onClick={() => setShowRecordModal(true)}
                    >
                        <i className="bi bi-plus-lg me-2"></i> Record Payment
                    </button>
                    <button
                        className="btn btn-outline-success fw-bold px-4 py-2"
                        onClick={() => {
                            resetExpenseForm();
                            setExpenseForm((prev) => ({
                                ...prev,
                                expense_date: `${selectedFinanceYear}-${String(selectedFinanceMonth).padStart(2, '0')}-01`,
                            }));
                            setShowExpenseModal(true);
                        }}
                    >
                        <i className="bi bi-receipt me-2"></i> Add Expense
                    </button>
                </div>
            </div>

            <div className="alert alert-light border d-flex flex-column flex-lg-row justify-content-between gap-2 mb-4">
                <div><strong>Selected month:</strong> {paymentPeriodLabel}</div>
                <div className="text-muted">Net income = total income - coach salary expense - other expenses</div>
            </div>

            <div className="row g-4 mb-4">
                <div className="col-md-6 col-xl-2">
                    <div className="p-4 rounded-4 bg-light h-100 border-0 shadow-sm">
                        <small className="fw-bold text-secondary d-block mb-2">Student Income</small>
                        <h4 className="fw-bold m-0 text-success">LKR {financeSummary?.student_fee_income || '0.00'}</h4>
                    </div>
                </div>
                <div className="col-md-6 col-xl-2">
                    <div className="p-4 rounded-4 bg-light h-100 border-0 shadow-sm">
                        <small className="fw-bold text-secondary d-block mb-2">Tournament Income</small>
                        <h4 className="fw-bold m-0 text-success">LKR {financeSummary?.tournament_fee_income || '0.00'}</h4>
                    </div>
                </div>
                <div className="col-md-6 col-xl-2">
                    <div className="p-4 rounded-4 bg-light h-100 border-0 shadow-sm">
                        <small className="fw-bold text-secondary d-block mb-2">Total Income</small>
                        <h4 className="fw-bold m-0 text-primary">LKR {financeSummary?.total_income || '0.00'}</h4>
                    </div>
                </div>
                <div className="col-md-6 col-xl-2">
                    <div className="p-4 rounded-4 bg-light h-100 border-0 shadow-sm">
                        <small className="fw-bold text-secondary d-block mb-2">Coach Salary Expense</small>
                        <h4 className="fw-bold m-0 text-danger">LKR {financeSummary?.coach_salary_expense || '0.00'}</h4>
                    </div>
                </div>
                <div className="col-md-6 col-xl-2">
                    <div className="p-4 rounded-4 bg-light h-100 border-0 shadow-sm">
                        <small className="fw-bold text-secondary d-block mb-2">Other Expenses</small>
                        <h4 className="fw-bold m-0 text-danger">LKR {financeSummary?.other_expenses_total || '0.00'}</h4>
                    </div>
                </div>
                <div className="col-md-6 col-xl-2">
                    <div className="p-4 rounded-4 bg-light h-100 border-0 shadow-sm">
                        <small className="fw-bold text-secondary d-block mb-2">Net Income</small>
                        <h4 className={`fw-bold m-0 ${Number(financeSummary?.net_income || 0) >= 0 ? 'text-primary' : 'text-danger'}`}>
                            LKR {financeSummary?.net_income || '0.00'}
                        </h4>
                    </div>
                </div>
            </div>

            <Tabs defaultActiveKey="fees" className="mb-3">
                <Tab eventKey="fees" title="Student Fees">
                    <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
                        <div className="p-3 text-white" style={{ backgroundColor: '#6c9343' }}>
                            <h6 className="fw-bold m-0">Recent Payments for {paymentPeriodLabel}</h6>
                        </div>
                        <div className="table-responsive p-3">
                            <table className="table table-hover align-middle mb-0">
                                <thead>
                                    <tr>
                                        <th className="ps-4">Student</th>
                                        <th>Type</th>
                                        <th>Method</th>
                                        <th>Amount</th>
                                        <th>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentPayments.length === 0 ? (
                                        <tr><td colSpan="5" className="text-center py-4 text-muted">No payments recorded for this month yet.</td></tr>
                                    ) : recentPayments.map((row) => (
                                        <tr key={row.id}>
                                            <td className="ps-4 fw-bold">{row.student_name}</td>
                                            <td>{row.payment_type}</td>
                                            <td>{row.payment_method}</td>
                                            <td className="fw-bold text-success">LKR {row.amount}</td>
                                            <td>{new Date(row.payment_date).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                        <div className="p-3 text-white" style={{ backgroundColor: '#6c9343' }}>
                            <h6 className="fw-bold m-0">Incomplete Monthly Payments</h6>
                        </div>
                        <div className="table-responsive p-3">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="bg-light text-secondary small fw-bold">
                                    <tr>
                                        <th className="py-3 ps-4 border-0">Student</th>
                                        <th className="py-3 border-0">Parent</th>
                                        <th className="py-3 border-0">Phone</th>
                                        <th className="py-3 pe-4 text-end border-0">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {dues.length === 0 ? (
                                        <tr><td colSpan="4" className="text-center py-4">All students have paid for this month.</td></tr>
                                    ) : dues.map((row) => (
                                        <tr key={row.id}>
                                            <td className="ps-4 fw-bold">{row.name}</td>
                                            <td>{row.parent}</td>
                                            <td>{row.parent_phone}</td>
                                            <td className="text-end pe-4">
                                                <button
                                                    className="btn btn-sm btn-outline-success"
                                                    onClick={() => {
                                                        setSelectedStudent(row.id);
                                                        handleStudentChange(row.id);
                                                        setShowRecordModal(true);
                                                    }}
                                                >
                                                    Record Payment
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </Tab>

                <Tab eventKey="salaries" title="Coach Salaries">
                    <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                        <div className="p-3 text-white" style={{ backgroundColor: '#6c9343' }}>
                            <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3">
                                <div>
                                    <h6 className="fw-bold m-0">Monthly Coach Salary Processing</h6>
                                    <small className="text-white-50">
                                        Marking paid settles the coach salary for {paymentPeriodLabel}.
                                    </small>
                                </div>
                                <div className="small fw-semibold">Payroll Month: {paymentPeriodLabel}</div>
                            </div>
                        </div>
                        <div className="px-3 pt-3">
                            <div className="alert alert-light border d-flex flex-column flex-lg-row justify-content-between gap-2 mb-3">
                                <div><strong>Selected payroll month:</strong> {paymentPeriodLabel}</div>
                                <div><strong>Already paid in this month:</strong> LKR {financeSummary?.coach_salaries_paid || '0.00'}</div>
                            </div>
                        </div>
                        <Table hover responsive className="m-0 align-middle">
                            <thead className="bg-light">
                                <tr>
                                    <th>Coach</th>
                                    <th>Period</th>
                                    <th>Hours</th>
                                    <th>Hourly Rate</th>
                                    <th>Net Amount</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {visibleSalaries.map((salary) => (
                                    <tr key={salary.id}>
                                        <td className="fw-bold">{salary.coach_name}</td>
                                        <td>{salary.payment_period}</td>
                                        <td>{salary.total_hours} hrs</td>
                                        <td>LKR {salary.hourly_rate}</td>
                                        <td className="fw-bold">LKR {salary.net_amount}</td>
                                        <td>
                                            <Badge bg={salary.status === 'PAID' ? 'success' : salary.status === 'PENDING' ? 'warning' : 'secondary'}>
                                                {salary.status}
                                            </Badge>
                                        </td>
                                        <td>
                                            {salary.status === 'PENDING' && (
                                                <Button variant="outline-success" size="sm" onClick={() => handleProcessSalary(salary.id)}>
                                                    Mark Month Paid
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {visibleSalaries.length === 0 && (
                                    <tr><td colSpan="7" className="text-center p-4 text-muted">No salary records found for this month.</td></tr>
                                )}
                            </tbody>
                        </Table>
                        <div className="p-3 text-muted small">
                            Coach salary expense is counted into net income for this payroll month.
                        </div>
                    </div>
                </Tab>

                <Tab eventKey="expenses" title="Other Expenses">
                    <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                        <div className="p-3 text-white" style={{ backgroundColor: '#6c9343' }}>
                            <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3">
                                <div>
                                    <h6 className="fw-bold m-0">Other Monthly Expenses</h6>
                                    <small className="text-white-50">Rent, electricity/current bill, cleaning salary, maintenance, and internet.</small>
                                </div>
                                <div className="small fw-semibold">Expense Month: {paymentPeriodLabel}</div>
                            </div>
                        </div>
                        <div className="px-3 pt-3">
                            <div className="row g-3 mb-3">
                                {Object.entries(expenseCategoryLabels).map(([key, label]) => (
                                    <div key={key} className="col-md-6 col-xl-4">
                                        <div className="alert alert-light border mb-0">
                                            <strong>{label}:</strong> LKR {financeSummary?.expense_breakdown?.[key] || '0.00'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <Table hover responsive className="m-0 align-middle">
                            <thead className="bg-light">
                                <tr>
                                    <th>Title</th>
                                    <th>Category</th>
                                    <th>Date</th>
                                    <th>Amount</th>
                                    <th>Notes</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {expenses.map((expense) => (
                                    <tr key={expense.id}>
                                        <td className="fw-bold">{expense.title}</td>
                                        <td>{expenseCategoryLabels[expense.category] || expense.category}</td>
                                        <td>{new Date(expense.expense_date).toLocaleDateString()}</td>
                                        <td className="fw-bold text-danger">LKR {expense.amount}</td>
                                        <td>{expense.notes || 'N/A'}</td>
                                        <td>
                                            <div className="d-flex gap-2">
                                                <Button variant="outline-success" size="sm" onClick={() => handleEditExpense(expense)}>
                                                    Edit
                                                </Button>
                                                <Button variant="outline-danger" size="sm" onClick={() => handleDeleteExpense(expense.id)}>
                                                    Delete
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {expenses.length === 0 && (
                                    <tr><td colSpan="6" className="text-center p-4 text-muted">No extra expenses recorded for this month.</td></tr>
                                )}
                            </tbody>
                        </Table>
                    </div>
                </Tab>
            </Tabs>

            <Modal show={showRecordModal} onHide={() => setShowRecordModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title className="fw-bold" style={{ color: '#6c9343' }}>Record Payment</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4">
                    <Form onSubmit={handleRecordPayment}>
                        <Form.Group className="mb-3">
                            <Form.Label>Student</Form.Label>
                            <Form.Select required value={selectedStudent} onChange={(e) => handleStudentChange(e.target.value)}>
                                <option value="">Select Student...</option>
                                {students.map((student) => (
                                    <option key={student.id} value={student.id}>{student.first_name} {student.last_name}</option>
                                ))}
                            </Form.Select>
                        </Form.Group>

                        {calculatedFee && (
                            <div className="alert alert-info py-2 small mb-3">
                                <strong>Fee Calculation for {paymentPeriodLabel}:</strong><br />
                                Base: LKR {calculatedFee.base_fee}<br />
                                Calculated: LKR {calculatedFee.calculated_fee}<br />
                                <span className="text-muted">
                                    (Includes {calculatedFee.sibling_count >= 2 ? 'sibling discount' : 'no sibling discount'} and {calculatedFee.attendance_count <= 4 ? 'partial attendance discount' : 'full attendance fee'})
                                </span>
                            </div>
                        )}

                        <Form.Group className="mb-3">
                            <Form.Label>Payment Type</Form.Label>
                            <Form.Select value={paymentType} onChange={(e) => setPaymentType(e.target.value)}>
                                <option value="MONTHLY">Monthly Fee</option>
                                <option value="TOURNAMENT">Tournament Fee</option>
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Payment Method</Form.Label>
                            <Form.Select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                                <option value="CASH">Cash</option>
                                <option value="CARD">Card</option>
                            </Form.Select>
                        </Form.Group>

                        <div className="d-flex justify-content-end gap-2 mt-4">
                            <Button variant="light" onClick={() => setShowRecordModal(false)}>Cancel</Button>
                            <Button type="submit" disabled={!calculatedFee} className="text-white" style={{ backgroundColor: '#6c9343', border: 'none' }}>
                                Record Payment
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>

            <Modal show={showExpenseModal} onHide={() => setShowExpenseModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title className="fw-bold" style={{ color: '#6c9343' }}>
                        {editingExpenseId ? 'Edit Monthly Expense' : 'Record Monthly Expense'}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4">
                    <Form onSubmit={handleCreateExpense}>
                        <Form.Group className="mb-3">
                            <Form.Label>Title</Form.Label>
                            <Form.Control
                                value={expenseForm.title}
                                onChange={(e) => setExpenseForm((prev) => ({ ...prev, title: e.target.value }))}
                                placeholder="e.g. April Rent"
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Category</Form.Label>
                            <Form.Select
                                value={expenseForm.category}
                                onChange={(e) => setExpenseForm((prev) => ({ ...prev, category: e.target.value }))}
                            >
                                {Object.entries(expenseCategoryLabels).map(([value, label]) => (
                                    <option key={value} value={value}>{label}</option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Amount</Form.Label>
                            <Form.Control
                                type="number"
                                min="0"
                                step="0.01"
                                value={expenseForm.amount}
                                onChange={(e) => setExpenseForm((prev) => ({ ...prev, amount: e.target.value }))}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Date</Form.Label>
                            <Form.Control
                                type="date"
                                value={expenseForm.expense_date}
                                onChange={(e) => setExpenseForm((prev) => ({ ...prev, expense_date: e.target.value }))}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Notes</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={expenseForm.notes}
                                onChange={(e) => setExpenseForm((prev) => ({ ...prev, notes: e.target.value }))}
                                placeholder="Optional details"
                            />
                        </Form.Group>

                        <div className="d-flex justify-content-end gap-2 mt-4">
                            <Button variant="light" onClick={() => {
                                setShowExpenseModal(false);
                                resetExpenseForm();
                            }}>Cancel</Button>
                            <Button type="submit" className="text-white" style={{ backgroundColor: '#6c9343', border: 'none' }}>
                                {editingExpenseId ? 'Update Expense' : 'Save Expense'}
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default Payments;
