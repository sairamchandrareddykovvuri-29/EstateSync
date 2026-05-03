import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Sidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const role = localStorage.getItem('userRole');

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const links = [
        { name: 'Dashboard', icon: 'dashboard', path: role === 'ADMIN' ? '/admin' : role === 'OWNER' ? '/owner' : '/tenant' },
        { name: 'Properties', icon: 'domain', path: '/properties' },
        { name: 'Leases', icon: 'description', path: '/leases' },
        { name: 'Payments', icon: 'payments', path: '/payments' },
        { name: 'Maintenance', icon: 'build', path: '/maintenance' },
        { name: 'Profile', icon: 'person', path: '/profile' }
    ];

    return (
        <aside className="fixed left-0 top-0 flex flex-col p-4 gap-2 h-screen w-64 border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 z-40">
            <div className="mb-8 px-4 py-2">
                <h1 className="text-lg font-black text-emerald-600 dark:text-emerald-500">ProManage</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">{role === 'ADMIN' ? 'Admin View' : role === 'OWNER' ? 'Owner Portal' : 'Tenant Portal'}</p>
            </div>
            <nav className="flex flex-col gap-1">
                {links.map(link => {
                    const isActive = location.pathname.includes(link.path);
                    return (
                        <Link key={link.name} to={link.path} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all cursor-pointer active:scale-95 ${isActive ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'}`}>
                            <span className="material-symbols-outlined">{link.icon}</span>
                            <span className="font-manrope text-sm font-semibold">{link.name}</span>
                        </Link>
                    )
                })}
            </nav>
            <div className="mt-auto flex flex-col gap-2 p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                {(role === 'ADMIN' || role === 'OWNER') && (
                    <button className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-lg text-sm font-bold transition-all">
                        <span className="material-symbols-outlined text-sm">add</span>
                        New Property
                    </button>
                )}
                <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-700 py-2.5 rounded-lg text-sm font-bold transition-all">
                    <span className="material-symbols-outlined text-sm">logout</span>
                    Logout
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
