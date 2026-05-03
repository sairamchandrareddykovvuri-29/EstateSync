import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import api from '../api';
import { Link } from 'react-router-dom';

const TenantDashboard = () => {
    const [stats, setStats] = useState({ leases: 0, rent: 0, requests: 0, leaseEnds: 'N/A' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const userId = parseInt(localStorage.getItem('userId'));
            const [leasesRes, maintenanceRes] = await Promise.all([
                api.get('/leases').catch(() => ({ data: [] })),
                api.get('/maintenance').catch(() => ({ data: [] })),
            ]);

            const activeLeases = (leasesRes.data || []).filter(l => 
                l.tenant_id === userId && l.lease_status === 'ACTIVE'
            );
            const activeLease = activeLeases[0];

            setStats({
                leases: activeLeases.length,
                rent: activeLease ? activeLease.monthly_rent : 0,
                requests: (maintenanceRes.data || []).filter(r => r.request_status !== 'CLOSED').length,
                leaseEnds: activeLease ? new Date(activeLease.end_date).toLocaleDateString() : 'No Active Lease'
            });
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const actionCards = [
        { title: 'My Lease', items: ['View active lease details', 'Lease start & end dates', 'Rent obligation breakdown'], icon: 'home', color: 'bg-emerald-50 text-emerald-700', link: '/leases' },
        { title: 'Payments', items: ['Record rent payment', 'View transaction history', 'Verify payment status'], icon: 'credit_card', color: 'bg-violet-50 text-violet-700', link: '/payments' },
        { title: 'Maintenance', items: ['Raise new request', 'Track existing tickets', 'Review ticket history'], icon: 'build', color: 'bg-orange-50 text-orange-700', link: '/maintenance' }
    ];

    return (
        <div className="bg-background text-on-background min-h-screen">
            <Sidebar />
            <Topbar />
            <main className="ml-64 mt-16 p-8 max-w-7xl mx-auto space-y-8">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <div className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full mb-2">Tenant</div>
                        <h2 className="font-bold text-3xl text-slate-900 tracking-tight">Tenant Portal</h2>
                        <p className="font-body-md text-slate-500 text-sm">Review lease, make payments, and raise maintenance tickets.</p>
                    </div>
                </div>

                {loading ? (
                    <div className="p-12 flex flex-col items-center justify-center gap-2">
                        <div className="w-8 h-8 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin"></div>
                        <span className="text-slate-500 text-sm font-semibold">Loading your details...</span>
                    </div>
                ) : (
                    <div>
                        <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-4">MY LEASE STATUS</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center items-center text-center">
                                <span className="text-3xl font-black text-slate-800">{stats.leases}</span>
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Active lease</span>
                            </div>
                            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center items-center text-center">
                                <span className="text-3xl font-black text-slate-800">₹{stats.rent.toLocaleString()}</span>
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Monthly rent</span>
                            </div>
                            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center items-center text-center">
                                <span className="text-3xl font-black text-slate-800">{stats.requests}</span>
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Open requests</span>
                            </div>
                            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center items-center text-center">
                                <span className="text-xl font-bold text-slate-800 mt-2">{stats.leaseEnds}</span>
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-2">Lease ends</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Grid for Capabilities */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {actionCards.map(card => (
                        <div key={card.title} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                            <div>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${card.color}`}>
                                        <span className="material-symbols-outlined">{card.icon}</span>
                                    </div>
                                    <h3 className="font-bold text-lg text-slate-800">{card.title}</h3>
                                </div>
                                <ul className="space-y-3 mb-6">
                                    {card.items.map((item, i) => (
                                        <li key={i} className="flex items-start gap-2 text-slate-600">
                                            <span className="material-symbols-outlined text-sm mt-0.5 text-emerald-500">check_circle</span>
                                            <span className="text-sm font-medium">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <Link to={card.link} className="w-full text-center block py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-sm font-bold rounded-lg border border-slate-200 transition-colors">
                                Go to {card.title}
                            </Link>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
};

export default TenantDashboard;
