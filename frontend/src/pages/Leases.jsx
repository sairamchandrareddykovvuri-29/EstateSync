import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import api from '../api';

const Leases = () => {
    const [leases, setLeases] = useState([]);
    const [loading, setLoading] = useState(true);
    const role = localStorage.getItem('userRole');

    useEffect(() => {
        fetchLeases();
    }, []);

    const fetchLeases = async () => {
        try {
            const res = await api.get('/leases');
            setLeases(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleEndLease = async (id) => {
        if (!window.confirm('Are you sure you want to end this lease?')) return;
        try {
            await api.put(`/leases/${id}`, { lease_status: 'ENDED' });
            fetchLeases();
        } catch (err) {
            alert('Failed to end lease');
        }
    };

    return (
        <div className="bg-background text-on-background min-h-screen">
            <Sidebar />
            <Topbar />
            <main className="ml-64 mt-16 p-8 max-w-7xl mx-auto space-y-8">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <h2 className="font-h1 text-h1 text-on-background">Lease Agreements</h2>
                        <p className="font-body-md text-body-md text-slate-500">Manage, renew, and audit all platform leases.</p>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-label-caps text-xs">
                                <th className="p-4 font-semibold uppercase tracking-wider">Property</th>
                                <th className="p-4 font-semibold uppercase tracking-wider">Tenant</th>
                                <th className="p-4 font-semibold uppercase tracking-wider">Start & End Date</th>
                                <th className="p-4 font-semibold uppercase tracking-wider">Rent</th>
                                <th className="p-4 font-semibold uppercase tracking-wider">Status</th>
                                {role === 'OWNER' && <th className="p-4 font-semibold uppercase tracking-wider text-right">Actions</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {leases.map(lease => (
                                <tr key={lease.lease_id} className="hover:bg-slate-50 transition-colors">
                                    <td className="p-4">
                                        <p className="font-bold text-slate-800">{lease.property?.title || `Property ID: ${lease.property_id}`}</p>
                                        <p className="text-xs text-slate-500 font-medium">{lease.property?.address}</p>
                                    </td>
                                    <td className="p-4">
                                        <p className="font-semibold text-slate-800">{lease.tenant?.name || 'N/A'}</p>
                                        <p className="text-xs text-slate-500">{lease.tenant?.email}</p>
                                    </td>
                                    <td className="p-4">
                                        <p className="text-sm font-medium text-slate-600">
                                            {new Date(lease.start_date).toLocaleDateString()} to {new Date(lease.end_date).toLocaleDateString()}
                                        </p>
                                    </td>
                                    <td className="p-4">
                                        <span className="font-bold">₹{lease.monthly_rent}</span>
                                    </td>
                                    <td className="p-4">
                                        <span className={`inline-flex px-2 py-1 text-xs font-bold rounded-full ${lease.lease_status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
                                            {lease.lease_status}
                                        </span>
                                    </td>
                                    {role === 'OWNER' && lease.lease_status === 'ACTIVE' && (
                                        <td className="p-4 text-right">
                                            <button 
                                                onClick={() => handleEndLease(lease.lease_id)}
                                                className="text-red-600 hover:text-red-800 font-bold text-sm bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors"
                                            >
                                                End Lease
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                            {leases.length === 0 && !loading && (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-slate-500">No leases found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
};

export default Leases;
