import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';

const Maintenance = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    // Tenant Creation Form
    const [issueDescription, setIssueDescription] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        const u = localStorage.getItem('user');
        if (u) {
            setUser(JSON.parse(u));
        }
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        setLoading(true);
        const token = localStorage.getItem('token');
        try {
            const res = await fetch('http://localhost:5000/api/maintenance', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setRequests(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleRaiseRequest = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setSuccessMessage('');
        const token = localStorage.getItem('token');
        try {
            const res = await fetch('http://localhost:5000/api/maintenance', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ issue_description: issueDescription })
            });

            if (res.ok) {
                setSuccessMessage('Ticket raised successfully.');
                setIssueDescription('');
                fetchRequests();
            } else {
                const data = await res.json();
                alert(data.message || 'Error raising ticket');
            }
        } catch (err) {
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdateStatus = async (id, currentStatus) => {
        const token = localStorage.getItem('token');
        let nextStatus = 'OPEN';
        if (currentStatus === 'OPEN') nextStatus = 'IN_PROGRESS';
        else if (currentStatus === 'IN_PROGRESS') nextStatus = 'CLOSED';

        try {
            const res = await fetch(`http://localhost:5000/api/maintenance/${id}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ request_status: nextStatus })
            });

            if (res.ok) {
                fetchRequests();
            } else {
                const data = await res.json();
                alert(data.message || 'Error updating ticket status');
            }
        } catch (err) {
            console.error(err);
        }
    };

    const openCount = requests.filter(r => r.request_status === 'OPEN').length;
    const progressCount = requests.filter(r => r.request_status === 'IN_PROGRESS').length;
    const closedCount = requests.filter(r => r.request_status === 'CLOSED').length;

    return (
        <div className="bg-slate-50 text-slate-800 min-h-screen pb-12">
            <Sidebar />
            <Topbar />
            <main className="ml-64 mt-16 p-8 max-w-7xl mx-auto space-y-8">
                {/* Page Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div className="space-y-1">
                        <h2 className="font-bold text-3xl text-slate-900 tracking-tight">Maintenance Portal</h2>
                        <p className="text-slate-500 text-sm">Raise and monitor maintenance requests for your property.</p>
                    </div>
                </div>

                {/* Dashboard Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center">
                            <span className="material-symbols-outlined text-amber-600">pending_actions</span>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Open</p>
                            <p className="text-2xl font-black text-slate-900">{openCount}</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
                            <span className="material-symbols-outlined text-blue-600">engineering</span>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">In Progress</p>
                            <p className="text-2xl font-black text-slate-900">{progressCount}</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center">
                            <span className="material-symbols-outlined text-green-600">task_alt</span>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Closed</p>
                            <p className="text-2xl font-black text-slate-900">{closedCount}</p>
                        </div>
                    </div>
                </div>

                {/* Tenant: Raise a New Request Form */}
                {user?.role === 'TENANT' && (
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                            <span className="material-symbols-outlined text-amber-600">build_circle</span>
                            Raise a New Maintenance Request
                        </h3>
                        <form onSubmit={handleRaiseRequest} className="mt-4 flex flex-col md:flex-row gap-4 items-end">
                            <div className="flex flex-col gap-1.5 flex-1">
                                <label className="text-xs font-bold text-slate-500 uppercase">Issue Description</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Broken pipe or leaky faucet"
                                    value={issueDescription}
                                    onChange={(e) => setIssueDescription(e.target.value)}
                                    required
                                    className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                />
                            </div>
                            <div>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="bg-amber-600 hover:bg-amber-700 active:scale-98 transition text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-sm"
                                >
                                    {submitting ? 'Raising...' : 'Submit Request'}
                                </button>
                            </div>
                        </form>
                        {successMessage && <p className="text-sm text-emerald-600 mt-3 font-semibold flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">check_circle</span>
                            {successMessage}
                        </p>}
                    </div>
                )}

                {/* Requests Table */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                        <h3 className="font-bold text-xl text-slate-900">Active Maintenance Tickets</h3>
                    </div>

                    {loading ? (
                        <div className="p-12 flex flex-col items-center justify-center gap-2">
                            <div className="w-8 h-8 border-4 border-slate-200 border-t-amber-600 rounded-full animate-spin"></div>
                            <span className="text-slate-500 text-sm font-semibold">Loading your requests...</span>
                        </div>
                    ) : requests.length === 0 ? (
                        <div className="p-12 text-center">
                            <span className="material-symbols-outlined text-5xl text-slate-300">receipt_long</span>
                            <p className="text-slate-500 mt-2 text-sm font-semibold">No maintenance requests found.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50">
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">ID</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Issue</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Property</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Tenant</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date Raised</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                        {(user?.role === 'OWNER' || user?.role === 'ADMIN') && (
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Actions</th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {requests.map((r) => (
                                        <tr key={r.request_id} className="hover:bg-slate-50/60 transition-colors">
                                            <td className="px-6 py-4 text-sm font-medium text-slate-500">
                                                #MT-{r.request_id}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-bold text-slate-900">
                                                {r.issue_description}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-slate-600">
                                                {r.property?.title || 'Unknown Property'}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-slate-600">
                                                {r.tenant?.name || 'Self'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-500">
                                                {new Date(r.request_date).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                {r.request_status === 'OPEN' ? (
                                                    <span className="inline-flex items-center bg-yellow-100 text-yellow-700 px-2.5 py-0.5 rounded-full text-xs font-bold">
                                                        Open
                                                    </span>
                                                ) : r.request_status === 'IN_PROGRESS' ? (
                                                    <span className="inline-flex items-center bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full text-xs font-bold">
                                                        In Progress
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center bg-green-100 text-green-700 px-2.5 py-0.5 rounded-full text-xs font-bold">
                                                        Closed
                                                    </span>
                                                )}
                                            </td>
                                            {(user?.role === 'OWNER' || user?.role === 'ADMIN') && (
                                                <td className="px-6 py-4 text-center">
                                                    {r.request_status !== 'CLOSED' && (
                                                        <button
                                                            onClick={() => handleUpdateStatus(r.request_id, r.request_status)}
                                                            className={`px-3 py-1.5 rounded-lg text-xs font-extrabold shadow-sm active:scale-95 transition-transform ${
                                                                r.request_status === 'OPEN'
                                                                    ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                                                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                                                            }`}
                                                        >
                                                            {r.request_status === 'OPEN' ? 'Mark In Progress' : 'Mark Closed'}
                                                        </button>
                                                    )}
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

export default Maintenance;
