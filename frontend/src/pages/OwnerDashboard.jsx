import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import api from '../api';
import { Link } from 'react-router-dom';

const OwnerDashboard = () => {
    const [stats, setStats] = useState({ properties: 0, leases: 0, available: 0, revenue: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const userId = parseInt(localStorage.getItem('userId'));
            const [propRes, leasesRes, paymentsRes] = await Promise.all([
                api.get('/properties').catch(() => ({ data: [] })),
                api.get('/leases').catch(() => ({ data: [] })),
                api.get('/payments').catch(() => ({ data: [] })),
            ]);

            const ownProps = (propRes.data || []).filter(p => p.owner_id === userId);
            const activeLeases = (leasesRes.data || []).filter(l => 
                l.lease_status === 'ACTIVE' && 
                ownProps.some(op => op.property_id === l.property_id)
            );
            const verifiedRevenue = (paymentsRes.data || [])
                .filter(p => p.status === 'COMPLETED' || p.status === 'PAID')
                .reduce((sum, p) => sum + parseFloat(p.amount), 0);

            setStats({
                properties: ownProps.length,
                leases: activeLeases.length,
                available: ownProps.filter(p => p.status === 'AVAILABLE').length,
                revenue: verifiedRevenue
            });
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const actionCards = [
        { title: 'Property Management', items: ['Add new property', 'Edit / delete own properties', 'Activate / deactivate listing'], icon: 'domain', color: 'bg-amber-50 text-amber-700', link: '/properties' },
        { title: 'Lease Management', items: ['Create lease agreement', 'View all leases (own props)', 'End / renew lease'], icon: 'description', color: 'bg-indigo-50 text-indigo-700', link: '/leases' },
        { title: 'Payments', items: ['Payment history per lease', 'Pending payments alert'], icon: 'payments', color: 'bg-emerald-50 text-emerald-700', link: '/payments' },
        { title: 'Maintenance', items: ['View tenant requests', 'Update status (Open → Closed)'], icon: 'handyman', color: 'bg-rose-50 text-rose-700', link: '/maintenance' }
    ];

    return (
        <div className="bg-background text-on-background min-h-screen">
            <Sidebar />
            <Topbar />
            <main className="ml-64 mt-16 p-8 max-w-7xl mx-auto space-y-8">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <div className="inline-block px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full mb-2">Owner</div>
                        <h2 className="font-bold text-3xl text-slate-900 tracking-tight">Property Portal</h2>
                        <p className="font-body-md text-slate-500 text-sm">Dashboard for your managed portfolio.</p>
                    </div>
                    <Link to="/properties" className="flex items-center gap-2 bg-primary hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg text-sm font-bold transition-all shadow-sm active:scale-95">
                        <span className="material-symbols-outlined text-sm">add</span>
                        New Property
                    </Link>
                </div>

                {loading ? (
                    <div className="p-12 flex flex-col items-center justify-center gap-2">
                        <div className="w-8 h-8 border-4 border-slate-200 border-t-amber-600 rounded-full animate-spin"></div>
                        <span className="text-slate-500 text-sm font-semibold">Loading stats...</span>
                    </div>
                ) : (
                    <div>
                        <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-4">PORTFOLIO OVERVIEW</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center items-center text-center">
                                <span className="text-3xl font-black text-slate-800">{stats.properties}</span>
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">My properties</span>
                            </div>
                            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center items-center text-center">
                                <span className="text-3xl font-black text-slate-800">{stats.leases}</span>
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Active leases</span>
                            </div>
                            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center items-center text-center">
                                <span className="text-3xl font-black text-slate-800">{stats.available}</span>
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Available</span>
                            </div>
                            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center items-center text-center bg-emerald-50/30">
                                <span className="text-3xl font-black text-emerald-600">₹{stats.revenue.toLocaleString()}</span>
                                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider mt-1">Verified Revenue</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Grid for Capabilities */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                                            <span className="material-symbols-outlined text-sm mt-0.5 text-amber-500">chevron_right</span>
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

export default OwnerDashboard;
