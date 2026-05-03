import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import api from '../api';

const AdminDashboard = () => {
    const [stats, setStats] = useState({ users: 0, properties: 0, leases: 0, revenue: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const [usersRes, propsRes, leasesRes, paymentsRes] = await Promise.all([
                api.get('/auth/tenants').catch(() => ({ data: [] })),
                api.get('/properties').catch(() => ({ data: [] })),
                api.get('/leases').catch(() => ({ data: [] })),
                api.get('/payments').catch(() => ({ data: [] })),
            ]);

            const activeLeases = (leasesRes.data || []).filter(l => l.lease_status === 'ACTIVE').length;
            const verifiedRevenue = (paymentsRes.data || [])
                .filter(p => p.status === 'COMPLETED' || p.status === 'PAID')
                .reduce((sum, p) => sum + parseFloat(p.amount), 0);

            setStats({
                users: usersRes.data?.length || 0,
                properties: propsRes.data?.length || 0,
                leases: activeLeases,
                revenue: verifiedRevenue
            });
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-background text-on-background min-h-screen">
            <Sidebar />
            <Topbar />
            <main className="ml-64 mt-16 p-8 max-w-7xl mx-auto space-y-8">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <div className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full mb-2">Admin</div>
                        <h2 className="font-bold text-3xl text-slate-900 tracking-tight">System Overview</h2>
                        <p className="font-body-md text-slate-500 text-sm">Full platform monitoring and control.</p>
                    </div>
                </div>

                {loading ? (
                    <div className="p-12 flex flex-col items-center justify-center gap-2">
                        <div className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
                        <span className="text-slate-500 text-sm font-semibold">Loading system statistics...</span>
                    </div>
                ) : (
                    <div>
                        <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-4">KPI STATS</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center items-center text-center">
                                <span className="text-3xl font-black text-slate-800">{stats.users}</span>
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Tenant accounts</span>
                            </div>
                            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center items-center text-center">
                                <span className="text-3xl font-black text-slate-800">{stats.properties}</span>
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Total properties</span>
                            </div>
                            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center items-center text-center">
                                <span className="text-3xl font-black text-slate-800">{stats.leases}</span>
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Active leases</span>
                            </div>
                            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center items-center text-center">
                                <span className="text-3xl font-black text-emerald-600">₹{stats.revenue.toLocaleString()}</span>
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Approved Revenue</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Dashboard Action Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-50 text-blue-700">
                                <span className="material-symbols-outlined">manage_accounts</span>
                            </div>
                            <h3 className="font-bold text-lg text-slate-800">User Management</h3>
                        </div>
                        <p className="text-slate-600 text-sm font-medium leading-relaxed mb-4">
                            Keep track of verified Tenant and Owner profiles across the system. Ensure all records are actively updated.
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-emerald-50 text-emerald-700">
                                <span className="material-symbols-outlined">real_estate_agent</span>
                            </div>
                            <h3 className="font-bold text-lg text-slate-800">Property Control</h3>
                        </div>
                        <p className="text-slate-600 text-sm font-medium leading-relaxed mb-4">
                            Monitor property listings, custom type labels (House vs. PG), and occupancy statuses.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
