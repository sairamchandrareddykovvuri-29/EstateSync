import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import api from '../api';

const Properties = () => {
    const [properties, setProperties] = useState([]);
    const [editingProp, setEditingProp] = useState(null);
    const [rentInput, setRentInput] = useState('');
    const [statusInput, setStatusInput] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [selectedTenant, setSelectedTenant] = useState(null);
    const [selectedPropertyTenants, setSelectedPropertyTenants] = useState(null);

    // Add Lease State
    const [isAddingLease, setIsAddingLease] = useState(null); // holds property object
    const [tenants, setTenants] = useState([]);
    const [tenantId, setTenantId] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [monthlyRent, setMonthlyRent] = useState('');

    const role = localStorage.getItem('userRole');

    useEffect(() => {
        fetchProperties();
        if (role === 'OWNER' || role === 'ADMIN') {
            fetchTenants();
        }
    }, []);

    const fetchProperties = async () => {
        try {
            const res = await api.get('/properties');
            const userId = parseInt(localStorage.getItem('userId'));
            let filtered = res.data;
            
            if (role === 'OWNER') {
                filtered = res.data.filter(p => p.owner_id === userId);
            } else if (role === 'TENANT') {
                filtered = res.data.filter(p => 
                    p.leases?.some(l => l.tenant_id === userId && l.lease_status === 'ACTIVE')
                );
            }
            
            setProperties(filtered);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchTenants = async () => {
        try {
            const res = await api.get('/auth/tenants');
            setTenants(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/properties/${editingProp.property_id}`, {
                rent_amount: rentInput,
                status: statusInput
            });
            setEditingProp(null);
            fetchProperties();
        } catch (err) {
            alert('Failed to update property');
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        try {
            await api.post('/properties', {
                title: formData.get('title'),
                address: formData.get('address'),
                city: formData.get('city'),
                rent_amount: formData.get('rent_amount'),
                property_type: formData.get('property_type') || 'HOUSE'
            });
            setIsAdding(false);
            fetchProperties();
        } catch (err) {
            alert('Failed to add property');
        }
    };

    const handleCreateLease = async (e) => {
        e.preventDefault();
        try {
            await api.post('/leases', {
                property_id: isAddingLease.property_id,
                tenant_id: tenantId,
                start_date: startDate,
                end_date: endDate,
                monthly_rent: monthlyRent
            });
            setIsAddingLease(null);
            setTenantId('');
            setStartDate('');
            setEndDate('');
            setMonthlyRent('');
            fetchProperties();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to create lease');
        }
    };

    return (
        <div className="bg-background text-on-background min-h-screen">
            <Sidebar />
            <Topbar />
            <main className="ml-64 mt-16 p-8 max-w-7xl mx-auto space-y-8">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <h2 className="font-h1 text-h1 text-on-background">Properties & Tenants</h2>
                        <p className="font-body-md text-body-md text-slate-500">Manage your real estate portfolio and view tenant details.</p>
                    </div>
                    {role === 'OWNER' && (
                        <button onClick={() => setIsAdding(true)} className="flex items-center gap-2 bg-primary hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg text-sm font-bold transition-all shadow-sm active:scale-95">
                            <span className="material-symbols-outlined text-sm">add</span>
                            New Property
                        </button>
                    )}
                </div>

                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-label-caps text-xs">
                                <th className="p-4 font-semibold uppercase tracking-wider">Property Name</th>
                                <th className="p-4 font-semibold uppercase tracking-wider">Location</th>
                                <th className="p-4 font-semibold uppercase tracking-wider">Tenant Info</th>
                                <th className="p-4 font-semibold uppercase tracking-wider">Rent</th>
                                <th className="p-4 font-semibold uppercase tracking-wider">Status</th>
                                {role === 'OWNER' && <th className="p-4 font-semibold uppercase tracking-wider text-right">Actions</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {properties.map(prop => {
                                const activeLeases = prop.leases?.filter(l => l.lease_status === 'ACTIVE') || [];
                                const tenantsOnProp = activeLeases.map(l => l.tenant).filter(Boolean);

                                return (
                                    <tr key={prop.property_id} className="hover:bg-slate-50 transition-colors">
                                        <td className="p-4">
                                            <div className="flex flex-col">
                                                <button onClick={() => setSelectedPropertyTenants({ title: prop.title, tenants: tenantsOnProp })} className="text-left font-bold text-slate-800 hover:text-primary hover:underline underline-offset-2">
                                                    {prop.title}
                                                </button>
                                                <span className={`inline-flex px-2 py-0.5 mt-1 text-[10px] font-black tracking-wider uppercase w-max rounded-md ${prop.property_type === 'PG' ? 'bg-violet-100 text-violet-800' : 'bg-blue-100 text-blue-800'}`}>
                                                    {prop.property_type === 'PG' ? 'Paying Guest (PG)' : 'Individual House'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <p className="text-sm text-slate-600">{prop.address}, {prop.city}</p>
                                        </td>
                                        <td className="p-4">
                                            {tenantsOnProp.length > 0 ? (
                                                <div className="flex flex-col gap-2">
                                                    {tenantsOnProp.map(tenant => (
                                                        <div key={tenant.email} className="flex flex-col items-start bg-slate-50 border border-slate-100 p-2 rounded-lg">
                                                            <span className="font-semibold text-emerald-700">{tenant.name}</span>
                                                            <button onClick={() => setSelectedTenant(tenant)} className="text-xs font-bold text-blue-600 hover:text-blue-800 underline underline-offset-2">
                                                                View Details
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="text-sm text-slate-400 italic">No Active Tenant</span>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <span className="font-semibold">₹{prop.rent_amount}</span>
                                        </td>
                                        <td className="p-4">
                                            <span className={`inline-flex px-2 py-1 text-xs font-bold rounded-full ${prop.status === 'AVAILABLE' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                                                {prop.status}
                                            </span>
                                        </td>
                                        {role === 'OWNER' && (
                                            <td className="p-4 text-right flex items-center justify-end gap-2">
                                                <button 
                                                    onClick={() => {
                                                        setEditingProp(prop);
                                                        setRentInput(prop.rent_amount);
                                                        setStatusInput(prop.status);
                                                    }}
                                                    className="text-primary hover:text-emerald-800 font-bold text-xs bg-emerald-50 px-3 py-1.5 rounded-lg transition-colors"
                                                >
                                                    Edit
                                                </button>
                                                {(prop.status === 'AVAILABLE' || prop.property_type === 'PG') && (
                                                    <button 
                                                        onClick={() => {
                                                            setIsAddingLease(prop);
                                                            setMonthlyRent(prop.rent_amount);
                                                        }}
                                                        className="text-white hover:bg-blue-700 font-bold text-xs bg-blue-600 px-3 py-1.5 rounded-lg transition-colors shadow-sm"
                                                    >
                                                        Add Lease
                                                    </button>
                                                )}
                                            </td>
                                        )}
                                    </tr>
                                );
                            })}
                            {properties.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-slate-500">No properties found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Edit Property Modal */}
                {editingProp && (
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                                <div>
                                    <h3 className="font-h3 text-slate-800">Update Property</h3>
                                    <p className="text-sm text-slate-500">{editingProp.title}</p>
                                </div>
                                <button onClick={() => setEditingProp(null)} className="text-slate-400 hover:text-slate-700">
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>
                            <form onSubmit={handleUpdate} className="p-6 space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Rent Amount (₹)</label>
                                    <input 
                                        type="number" 
                                        value={rentInput} 
                                        onChange={e => setRentInput(e.target.value)}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none transition-shadow"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Status</label>
                                    <select 
                                        value={statusInput} 
                                        onChange={e => setStatusInput(e.target.value)}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none transition-shadow"
                                    >
                                        <option value="AVAILABLE">AVAILABLE</option>
                                        <option value="LEASED">LEASED</option>
                                    </select>
                                </div>
                                <div className="pt-4 flex gap-3">
                                    <button type="button" onClick={() => setEditingProp(null)} className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition-colors">
                                        Cancel
                                    </button>
                                    <button type="submit" className="flex-1 py-2 bg-primary hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors shadow-sm">
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Add Property Modal */}
                {isAdding && (
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                                <div>
                                    <h3 className="font-h3 text-slate-800">Add New Property</h3>
                                </div>
                                <button onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-slate-700">
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>
                            <form onSubmit={handleAdd} className="p-6 space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Property Title</label>
                                    <input type="text" name="title" required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Address</label>
                                    <input type="text" name="address" required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">City</label>
                                    <input type="text" name="city" required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Rent Amount (₹)</label>
                                    <input type="number" name="rent_amount" required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Property Type</label>
                                    <select name="property_type" required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none">
                                        <option value="HOUSE">Individual House</option>
                                        <option value="PG">Paying Guest (PG)</option>
                                    </select>
                                </div>
                                <div className="pt-4 flex gap-3">
                                    <button type="button" onClick={() => setIsAdding(false)} className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition-colors">
                                        Cancel
                                    </button>
                                    <button type="submit" className="flex-1 py-2 bg-primary hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors shadow-sm">
                                        Create Property
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Add Lease Modal */}
                {isAddingLease && (
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                                <div>
                                    <h3 className="font-h3 text-slate-800">Add Lease Agreement</h3>
                                    <p className="text-sm text-slate-500">{isAddingLease.title}</p>
                                </div>
                                <button onClick={() => setIsAddingLease(null)} className="text-slate-400 hover:text-slate-700">
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>
                            <form onSubmit={handleCreateLease} className="p-6 space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Select Tenant</label>
                                    <select 
                                        value={tenantId}
                                        onChange={e => setTenantId(e.target.value)}
                                        required
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                                    >
                                        <option value="">Choose Tenant</option>
                                        {tenants.map(t => (
                                            <option key={t.user_id} value={t.user_id}>{t.name} ({t.email})</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Start Date</label>
                                    <input 
                                        type="date" 
                                        value={startDate} 
                                        onChange={e => setStartDate(e.target.value)} 
                                        required 
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">End Date</label>
                                    <input 
                                        type="date" 
                                        value={endDate} 
                                        onChange={e => setEndDate(e.target.value)} 
                                        required 
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Monthly Rent (₹)</label>
                                    <input 
                                        type="number" 
                                        value={monthlyRent} 
                                        onChange={e => setMonthlyRent(e.target.value)} 
                                        required 
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none" 
                                    />
                                </div>
                                <div className="pt-4 flex gap-3">
                                    <button type="button" onClick={() => setIsAddingLease(null)} className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition-colors">
                                        Cancel
                                    </button>
                                    <button type="submit" className="flex-1 py-2 bg-primary hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors shadow-sm">
                                        Save Lease
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Tenant Details Modal */}
                {selectedTenant && (
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-xl w-full max-w-sm shadow-2xl overflow-hidden">
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                                <div>
                                    <h3 className="font-h3 text-slate-800">Tenant Details</h3>
                                </div>
                                <button onClick={() => setSelectedTenant(null)} className="text-slate-400 hover:text-slate-700">
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>
                            <div className="p-6 space-y-5">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-2xl font-bold">
                                        {selectedTenant.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-bold text-lg text-slate-800">{selectedTenant.name}</p>
                                        <span className="inline-flex px-2 py-0.5 mt-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full">ACTIVE TENANT</span>
                                    </div>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-lg space-y-3 border border-slate-100">
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</p>
                                        <p className="text-slate-700 font-medium">{selectedTenant.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Phone Number</p>
                                        <p className="text-slate-700 font-medium">{selectedTenant.phone || 'N/A'}</p>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedTenant(null)} className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition-colors">
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Property Tenant List Modal */}
                {selectedPropertyTenants && (
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl overflow-hidden">
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                                <div>
                                    <h3 className="font-h3 text-slate-800">All Tenants in Property</h3>
                                    <p className="text-sm text-slate-500 font-medium">{selectedPropertyTenants.title}</p>
                                </div>
                                <button onClick={() => setSelectedPropertyTenants(null)} className="text-slate-400 hover:text-slate-700">
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>
                            <div className="p-6 max-h-[400px] overflow-y-auto space-y-4">
                                {selectedPropertyTenants.tenants.length > 0 ? (
                                    selectedPropertyTenants.tenants.map((t, idx) => (
                                        <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                                            <div className="w-12 h-12 bg-primary/10 text-primary flex items-center justify-center rounded-full font-black text-lg">
                                                {t.name?.charAt(0)}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-bold text-slate-800 text-base">{t.name}</p>
                                                <p className="text-sm text-slate-500">{t.email}</p>
                                                <p className="text-sm text-slate-500 mt-0.5">{t.phone || 'No phone provided'}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-4 text-center text-slate-500 italic">
                                        No tenants currently renting this property.
                                    </div>
                                )}
                            </div>
                            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                                <button onClick={() => setSelectedPropertyTenants(null)} className="px-5 py-2 bg-slate-200 hover:bg-slate-300 font-bold text-slate-700 rounded-lg text-sm transition-colors">
                                    Done
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Properties;
