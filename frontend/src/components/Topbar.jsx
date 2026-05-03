import React from 'react';

const Topbar = () => {
    return (
        <header className="fixed top-0 right-0 left-64 flex items-center justify-between px-6 h-16 w-[calc(100%-16rem)] bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none z-30">
            <div className="flex items-center flex-1 max-w-xl">
                <div className="relative w-full group">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                    <input className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm font-manrope focus:ring-2 focus:ring-emerald-500 transition-all" placeholder="Search requests, properties or tenants..." type="text" />
                </div>
            </div>
            <div className="flex items-center gap-4">
                <button className="p-2 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full transition-colors relative">
                    <span className="material-symbols-outlined">notifications</span>
                    <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full"></span>
                </button>
                <button className="p-2 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full transition-colors">
                    <span className="material-symbols-outlined">settings</span>
                </button>
                <button className="p-2 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full transition-colors">
                    <span className="material-symbols-outlined">help_outline</span>
                </button>
                <div className="h-8 w-8 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700 cursor-pointer">
                    <img alt="User profile photo" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBkmQp9joRu-T9gYOCDDg0PqHUWBEXn84ANZvGHdYP9diCLlxTtLNnm4KtTwp7ZCghgf76NlA2ll3D53J31X8-l2JTSMf8o219nXZXqkV7ieD56TlpiM-9ostWzSaJdJvWYrkvYPJv6V5SqD43pBjGVEgD9-WdzvD9ltJKUopXyqpH4TjXNT7G46bbQ_wlHHUyo2WC3kxVWRy4v10q5E0aswcteNDRpsd5V-jntVNL16QdrFP8-5z9IfTcKAzEbpOc5uxEXahr9mmrf" />
                </div>
            </div>
        </header>
    );
};

export default Topbar;
