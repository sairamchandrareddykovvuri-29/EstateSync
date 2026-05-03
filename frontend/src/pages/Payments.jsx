import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';

const Payments = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [leases, setLeases] = useState([]);

    // Tenant Payment Form
    const [amount, setAmount] = useState('');
    const [paymentMode, setPaymentMode] = useState('UPI');
    const [submitting, setSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        const u = localStorage.getItem('user');
        if (u) {
            const parsedUser = JSON.parse(u);
            setUser(parsedUser);
        }
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        const token = localStorage.getItem('token');
        try {
            const res = await fetch('http://localhost:5000/api/payments', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setPayments(data);
            }

            // Also fetch leases to know if tenant has one
            const lRes = await fetch('http://localhost:5000/api/leases', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (lRes.ok) {
                const lData = await lRes.json();
                setLeases(lData);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleRecordPayment = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setSuccessMessage('');
        const token = localStorage.getItem('token');
        try {
            const res = await fetch('http://localhost:5000/api/payments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    amount: parseFloat(amount),
                    payment_mode: paymentMode
                })
            });

            if (res.ok) {
                setSuccessMessage('Payment submitted successfully as PENDING.');
                setAmount('');
                setPaymentMode('UPI');
                fetchData();
            } else {
                const data = await res.json();
                alert(data.message || 'Error creating payment');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleApprovePayment = async (id, currentStatus) => {
        const token = localStorage.getItem('token');
        const nextStatus = currentStatus === 'PENDING' ? 'COMPLETED' : 'PENDING';
        try {
            const res = await fetch(`http://localhost:5000/api/payments/${id}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: nextStatus })
            });

            if (res.ok) {
                fetchData();
            } else {
                const data = await res.json();
                alert(data.message || 'Error updating status');
            }
        } catch (error) {
            console.error(error);
        }
    };

    const activeLease = leases.find(l => l.tenant_id === user?.id && l.lease_status === 'ACTIVE');

    // Revenue Aggregation (COMPLETED only)
    const paidRevenue = payments
        .filter(p => p.status === 'COMPLETED' || p.status === 'PAID')
        .reduce((sum, p) => sum + parseFloat(p.amount), 0);

    const pendingRevenue = payments
        .filter(p => p.status === 'PENDING')
        .reduce((sum, p) => sum + parseFloat(p.amount), 0);

    return (
        <div className="bg-slate-50 text-slate-800 min-h-screen pb-12">
            <Sidebar />
            <Topbar />
            <main className="ml-64 mt-16 p-8 max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-1">
                        <h2 className="font-bold text-3xl text-slate-900 tracking-tight">Payments & Financials</h2>
                        <p className="text-slate-500 text-sm">Overview of portfolio revenue tracking and transactions.</p>
                    </div>
                </div>

                {/* Bento Grid Analytics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                            <h4 className="text-slate-500 text-xs font-bold uppercase tracking-wider">Total Approved (Paid)</h4>
                            <span className="material-symbols-outlined p-2 bg-emerald-50 text-emerald-600 rounded-lg">payments</span>
                        </div>
                        <div className="mt-4">
                            <h3 className="text-3xl font-black text-slate-900 mt-1">
                                ${paidRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </h3>
                            <p className="text-xs text-emerald-600 font-medium mt-2">Verified revenue collected</p>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                            <h4 className="text-slate-500 text-xs font-bold uppercase tracking-wider">Total Pending</h4>
                            <span className="material-symbols-outlined p-2 bg-amber-50 text-amber-600 rounded-lg">pending</span>
                        </div>
                        <div className="mt-4">
                            <h3 className="text-3xl font-black text-slate-900 mt-1">
                                ${pendingRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </h3>
                            <p className="text-xs text-amber-600 font-medium mt-2">Payments awaiting review</p>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                            <h4 className="text-slate-500 text-xs font-bold uppercase tracking-wider">Total Transactions</h4>
                            <span className="material-symbols-outlined p-2 bg-blue-50 text-blue-600 rounded-lg">receipt_long</span>
                        </div>
                        <div className="mt-4">
                            <h3 className="text-3xl font-black text-slate-900 mt-1">
                                {payments.length}
                            </h3>
                            <p className="text-xs text-blue-600 font-medium mt-2">Recorded transactions</p>
                        </div>
                    </div>
                </div>

                {/* Tenant: Record Payment Form */}
                {user?.role === 'TENANT' && (
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                            <span className="material-symbols-outlined text-emerald-600">add_card</span>
                            Make a Payment
                        </h3>
                        {activeLease ? (
                            <form onSubmit={handleRecordPayment} className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Amount ($)</label>
                                    <input
                                        type="number"
                                        placeholder="e.g. 1500"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        required
                                        className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Payment Mode</label>
                                    <select
                                        value={paymentMode}
                                        onChange={(e) => setPaymentMode(e.target.value)}
                                        className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                    >
                                        <option value="UPI">UPI</option>
                                        <option value="Bank Transfer">Bank Transfer</option>
                                        <option value="Cash">Cash</option>
                                    </select>
                                </div>
                                <div>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-98 transition text-white px-4 py-2.5 rounded-lg text-sm font-bold shadow-sm"
                                    >
                                        {submitting ? 'Recording...' : 'Submit Payment'}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <p className="text-sm text-amber-600 mt-2 font-medium">You do not currently have an active lease to record a payment for.</p>
                        )}
                        {successMessage && <p className="text-sm text-emerald-600 mt-3 font-semibold flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">check_circle</span>
                            {successMessage}
                        </p>}
                    </div>
                )}

                {/* Payments Table */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                        <h3 className="font-bold text-xl text-slate-900">Recorded Transactions</h3>
                    </div>

                    {loading ? (
                        <div className="p-12 flex flex-col items-center justify-center gap-2">
                            <div className="w-8 h-8 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin"></div>
                            <span className="text-slate-500 text-sm font-semibold">Loading your financial data...</span>
                        </div>
                    ) : payments.length === 0 ? (
                        <div className="p-12 text-center">
                            <span className="material-symbols-outlined text-5xl text-slate-300">receipt_long</span>
                            <p className="text-slate-500 mt-2 text-sm font-semibold">No payments recorded yet.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50">
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Property</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Tenant</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Payment Mode</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Amount</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                        {(user?.role === 'OWNER' || user?.role === 'ADMIN') && (
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Actions</th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {payments.map((p) => (
                                        <tr key={p.payment_id} className="hover:bg-slate-50/60 transition-colors">
                                            <td className="px-6 py-4 text-sm font-medium text-slate-600">
                                                {new Date(p.payment_date).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-bold text-slate-900">
                                                {p.lease?.property?.title || 'Unknown Property'}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-slate-700">
                                                {p.lease?.tenant?.name || 'Self'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600">
                                                <div className="flex items-center gap-1.5 font-medium">
                                                    <span className="material-symbols-outlined text-slate-400 text-lg">payments</span>
                                                    {p.payment_mode}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-extrabold text-slate-900 text-right">
                                                ${parseFloat(p.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="px-6 py-4">
                                                {p.status === 'COMPLETED' || p.status === 'PAID' ? (
                                                    <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2.5 py-0.5 rounded-full text-xs font-bold">
                                                        Paid
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 px-2.5 py-0.5 rounded-full text-xs font-bold">
                                                        Pending
                                                    </span>
                                                )}
                                            </td>
                                            {(user?.role === 'OWNER' || user?.role === 'ADMIN') && (
                                                <td className="px-6 py-4 text-center">
                                                    <button
                                                        onClick={() => handleApprovePayment(p.payment_id, p.status)}
                                                        className={`px-3 py-1.5 rounded-lg text-xs font-extrabold shadow-sm active:scale-95 transition-transform ${
                                                            p.status === 'COMPLETED' || p.status === 'PAID'
                                                                ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                                                                : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                                                        }`}
                                                    >
                                                        {p.status === 'COMPLETED' || p.status === 'PAID' ? 'Mark Pending' : 'Approve'}
                                                    </button>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Payments;
