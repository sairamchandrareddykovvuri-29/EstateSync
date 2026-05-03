import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';

const Login = () => {
    const navigate = useNavigate();
    const [isRegistering, setIsRegistering] = useState(false);
    const [selectedRole, setSelectedRole] = useState('TENANT');
    
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            let response;
            if (isRegistering) {
                response = await api.post('/auth/register', { name, email, password, role: selectedRole });
            } else {
                response = await api.post('/auth/login', { email, password });
            }
            
            const { token, role, name: userName, user_id } = response.data;
            
            // Optional: enforce they selected the correct role when logging in
            if (!isRegistering && role !== selectedRole) {
                setError(`This account is registered as ${role}. Please select the correct role to sign in.`);
                setLoading(false);
                return;
            }

            localStorage.setItem('token', token);
            localStorage.setItem('userRole', role);
            localStorage.setItem('userName', userName || name);
            localStorage.setItem('userId', user_id);

            if (role === 'ADMIN') navigate('/admin');
            else if (role === 'OWNER') navigate('/owner');
            else navigate('/tenant');
        } catch (err) {
            setError(err.response?.data?.message || 'Authentication failed. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="bg-background min-h-screen flex items-center justify-center p-6">
            <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-12 bg-surface-container-lowest shadow-[0_4px_20px_rgba(15,23,42,0.05)] rounded-xl overflow-hidden border border-outline-variant">
                {/* Left Side */}
                <div className="hidden md:flex md:col-span-5 lg:col-span-4 relative flex-col justify-between p-8 bg-on-primary-container text-on-primary">
                    <div className="z-10">
                        <div className="flex items-center gap-2 mb-6">
                            <span className="material-symbols-outlined text-3xl text-primary-fixed">domain</span>
                            <h1 className="text-xl font-extrabold tracking-tight text-white">EstateSync</h1>
                        </div>
                        <div className="space-y-4 mt-12">
                            <h2 className="font-h2 text-h2 text-white leading-tight">Elevating property management excellence.</h2>
                            <p className="font-body-md text-body-md text-primary-fixed/80 max-w-xs">Experience operational control with our enterprise-grade portfolio management dashboard.</p>
                        </div>
                    </div>
                    <div className="relative z-10">
                        <div className="flex flex-col gap-2 p-4 bg-white/5 backdrop-blur-md rounded-lg border border-white/10 mt-12">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary-fixed-dim/20 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-primary-fixed">verified_user</span>
                                </div>
                                <div>
                                    <p className="font-label-caps text-label-caps text-primary-fixed">TRUSTED BY</p>
                                    <p className="font-body-md text-body-md font-bold">5,000+ Asset Managers</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Decorative */}
                    <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none">
                        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-primary-container rounded-full blur-3xl"></div>
                        <img alt="Modern Office" className="absolute inset-0 w-full h-full object-cover mix-blend-overlay" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA9a91VyO9JRafSf38PPN5Wnbnoor3sHhWoPOYjtxvMliFgUuHuCiQga69FRokJZQszig7YJrZ_2k4ywsasm5iFlEVGeXgu0jpU1lhq2Mhz3eo71FhJAvzMLbf1UAjVpeO61MfW5Hq45N3iFNxWzPUkP2UekrSOZNvmBdSRtuB1-xSUkW-I1XDJdrJV2UCnfe7T0iu0jJAK53GOnRZuAkMAV8tI7hheeozRHbYlrF1g1WJwwi7AEXySPx-0vM56RNkTfz5eQAomLDku" />
                    </div>
                </div>
                {/* Right Side */}
                <div className="col-span-1 md:col-span-7 lg:col-span-8 bg-surface p-8 flex flex-col justify-center max-w-2xl mx-auto w-full">
                    <div className="mb-6">
                        <h3 className="font-h1 text-h1 text-on-surface mb-2">
                            {isRegistering ? 'Create an Account' : 'Welcome Back'}
                        </h3>
                        <p className="font-body-md text-body-md text-on-surface-variant">
                            {isRegistering ? 'Join PropManage to manage your real estate ecosystem.' : 'Access your PropManage account to oversee your properties.'}
                        </p>
                    </div>
                    {/* Role Selector */}
                    <div className="mb-6">
                        <p className="font-label-caps text-label-caps text-on-surface-variant mb-3 uppercase">SELECT YOUR ROLE</p>
                        <div className="grid grid-cols-3 gap-3">
                            <button onClick={() => setSelectedRole('TENANT')} className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all cursor-pointer ${selectedRole === 'TENANT' ? 'border-primary bg-emerald-50 text-primary' : 'border-outline-variant bg-white text-on-surface-variant hover:bg-surface-container-low'}`}>
                                <span className="material-symbols-outlined">person</span>
                                <span className="font-body-md font-semibold">Tenant</span>
                            </button>
                            <button onClick={() => setSelectedRole('OWNER')} className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all cursor-pointer ${selectedRole === 'OWNER' ? 'border-primary bg-emerald-50 text-primary' : 'border-outline-variant bg-white text-on-surface-variant hover:bg-surface-container-low'}`}>
                                <span className="material-symbols-outlined">domain</span>
                                <span className="font-body-md font-semibold">Owner</span>
                            </button>
                            <button onClick={() => setSelectedRole('ADMIN')} className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all cursor-pointer ${selectedRole === 'ADMIN' ? 'border-primary bg-emerald-50 text-primary' : 'border-outline-variant bg-white text-on-surface-variant hover:bg-surface-container-low'}`}>
                                <span className="material-symbols-outlined">admin_panel_settings</span>
                                <span className="font-body-md font-semibold">Admin</span>
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm font-semibold">
                            {error}
                        </div>
                    )}
                    {/* Form */}
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        {isRegistering && (
                            <div className="space-y-2">
                                <label className="font-label-caps text-label-caps text-on-surface-variant" htmlFor="name">FULL NAME</label>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">badge</span>
                                    <input required value={name} onChange={(e) => setName(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-white border border-outline-variant rounded-lg font-body-md focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none" id="name" placeholder="John Doe" type="text" />
                                </div>
                            </div>
                        )}
                        <div className="space-y-2">
                            <label className="font-label-caps text-label-caps text-on-surface-variant" htmlFor="email">EMAIL ADDRESS</label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">mail</span>
                                <input required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-white border border-outline-variant rounded-lg font-body-md focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none" id="email" placeholder="manager@estatesync.com" type="email" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="font-label-caps text-label-caps text-on-surface-variant" htmlFor="password">PASSWORD</label>
                                {!isRegistering && <a className="font-body-md text-secondary text-sm font-semibold hover:underline" href="#">Forgot?</a>}
                            </div>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">lock</span>
                                <input required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-white border border-outline-variant rounded-lg font-body-md focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none" id="password" placeholder="••••••••" type="password" />
                            </div>
                        </div>
                        <button disabled={loading} className="w-full bg-primary text-on-primary py-4 rounded-lg font-h3 text-h3 flex items-center justify-center gap-2 hover:bg-on-primary-container transition-colors shadow-md active:scale-[0.98]" type="submit">
                            {loading ? 'Processing...' : (isRegistering ? 'Create Account' : 'Sign In')}
                            <span className="material-symbols-outlined">arrow_forward</span>
                        </button>
                    </form>
                    <div className="mt-6">
                        <p className="text-center font-body-md text-on-surface-variant">
                            {isRegistering ? 'Already have an account? ' : 'New to the platform? '}
                            <button type="button" onClick={() => { setIsRegistering(!isRegistering); setError(''); }} className="text-secondary font-bold hover:underline">
                                {isRegistering ? 'Sign in here' : 'Create an account'}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
            <div className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-50 rounded-full blur-[120px] opacity-60"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-secondary-container/5 rounded-full blur-[120px] opacity-40"></div>
            </div>
        </div>
    );
};

export default Login;
