import React from 'react';
import { MoreVertical } from 'lucide-react';

const AdminTab = ({
    activeSubTab,
    setActiveSubTab,
    pendingUsers,
    systemSettings,
    setSystemSettings,
    handleSaveSettings,
    allUsers,
    handleApproveUser,
    orgConfigs,
    handleAddConfig,
    handleDeleteConfig,
    inputStyle,
    newConfig,
    setNewConfig,
    activeActionMenu,
    setActiveActionMenu,
    setSelectedUser,
    setShowEditModal,
    setEditMode,
    setModalTab
}) => {
    // Filter out pending users for the active employees list
    const pagedUsers = allUsers.filter(u => u.status !== 'Pending');

    return (
        <>
            <div className="sub-nav" style={{ marginTop: '-1.5rem', marginBottom: '1.5rem' }}>
                <div className={`sub-nav-item ${activeSubTab === 'Leave' ? 'active' : ''}`} onClick={() => setActiveSubTab('Leave')}>USERS</div>
                <div className={`sub-nav-item ${activeSubTab === 'Approvals' ? 'active' : ''}`} onClick={() => setActiveSubTab('Approvals')}>APPROVALS ({pendingUsers.length})</div>
                <div className={`sub-nav-item ${activeSubTab === 'Configs' ? 'active' : ''}`} onClick={() => setActiveSubTab('Configs')}>ORG CONFIGS</div>
                <div className={`sub-nav-item ${activeSubTab === 'Settings' ? 'active' : ''}`} onClick={() => setActiveSubTab('Settings')}>SYSTEM SETTINGS</div>
            </div>

            {activeSubTab === 'Settings' && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '1rem 0' }}>
                    <div className="panel" style={{ maxWidth: '850px', width: '100%', padding: '2.5rem', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }}>
                        <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--text-main)', marginBottom: '2rem', borderBottom: '1px solid var(--border-dark)', paddingBottom: '1rem' }}>Company Settings</div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                                <div style={{ flex: '1 1 300px' }}>
                                    <label style={{ display: 'block', fontSize: '0.95rem', color: 'var(--text-muted)', marginBottom: '0.6rem', fontWeight: '500' }}>Company Name</label>
                                    <input
                                        type="text"
                                        value={systemSettings.companyName || ''}
                                        onChange={e => setSystemSettings({ ...systemSettings, companyName: e.target.value })}
                                        style={{ ...inputStyle, width: '100%', padding: '0.8rem 1rem', background: 'rgba(255,255,255,0.03)', fontSize: '1rem', border: '1px solid var(--border-dark)' }}
                                    />
                                </div>
                                <div style={{ flex: '1 1 200px' }}>
                                    <label style={{ display: 'block', fontSize: '0.95rem', color: 'var(--text-muted)', marginBottom: '0.6rem', fontWeight: '500' }}>Working Hours / Day</label>
                                    <input
                                        type="number"
                                        value={systemSettings.workingHoursPerDay || ''}
                                        onChange={e => setSystemSettings({ ...systemSettings, workingHoursPerDay: e.target.value })}
                                        style={{ ...inputStyle, width: '100%', padding: '0.8rem 1rem', background: 'rgba(255,255,255,0.03)', fontSize: '1rem', border: '1px solid var(--border-dark)' }}
                                    />
                                </div>
                            </div>

                            <div style={{ borderTop: '1px solid var(--border-dark)', margin: '0.5rem 0', paddingTop: '2rem' }}>
                                <div style={{ fontSize: '1.15rem', fontWeight: '600', color: 'var(--text-main)', marginBottom: '1.5rem' }}>Default Leave Quotas <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 'normal', marginLeft: '0.5rem' }}>(Applies to All Users)</span></div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                                    {[
                                        { label: 'Paid Leave', key: 'paid' },
                                        { label: 'Sick Leave', key: 'sick' },
                                        { label: 'Casual Leave', key: 'casual' },
                                        { label: 'Comp Off', key: 'compOff' }
                                    ].map(q => (
                                        <div key={q.key} style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-dark)', borderRadius: '8px', padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.8rem', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }}>
                                            <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '500' }}>{q.label}</label>
                                            <input
                                                type="number"
                                                value={systemSettings.defaultLeaveQuotas?.[q.key] ?? 0}
                                                onChange={e => setSystemSettings({
                                                    ...systemSettings,
                                                    defaultLeaveQuotas: { ...systemSettings.defaultLeaveQuotas, [q.key]: parseInt(e.target.value) || 0 }
                                                })}
                                                style={{ ...inputStyle, width: '100%', padding: '0.6rem 1rem', background: 'rgba(255,255,255,0.05)', fontSize: '1.1rem', fontWeight: '600', border: '1px solid rgba(255,255,255,0.1)' }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                                <button
                                    className="btn btn-primary"
                                    onClick={handleSaveSettings}
                                    style={{
                                        padding: '0.8rem 3rem',
                                        fontSize: '1rem',
                                        fontWeight: 'bold',
                                        borderRadius: '8px',
                                        boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)',
                                        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                        border: 'none',
                                        color: 'white',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease-in-out'
                                    }}
                                    onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                                    onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                                >
                                    Save Settings
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeSubTab === 'Leave' && (
                <div className="panel">
                    <div className="panel-header">Active Employees</div>
                    <table className="data-table">
                        <thead>
                            <tr><th>NAME</th><th>EMAIL</th><th>DESIGNATION</th><th>DEPT</th><th>ROLE</th><th style={{ textAlign: 'center' }}>ACTIONS</th></tr>
                        </thead>
                        <tbody>
                            {pagedUsers.map(u => (
                                <tr key={u._id}>
                                    <td>{u.name}</td><td>{u.email}</td><td>{u.designation}</td><td>{u.department}</td>
                                    <td><span className={`badge ${u.role.replace(' ', '-').toLowerCase()}`}>{u.role}</span></td>
                                    <td style={{ position: 'relative', textAlign: 'center' }}>
                                        <button
                                            className="btn-icon"
                                            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                                            onClick={() => setActiveActionMenu(activeActionMenu === u._id ? null : u._id)}
                                        >
                                            <MoreVertical size={20} />
                                        </button>

                                        {activeActionMenu === u._id && (
                                            <div className="panel" style={{
                                                position: 'absolute',
                                                top: '100%',
                                                right: '0',
                                                zIndex: 10,
                                                minWidth: '120px',
                                                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                                                padding: '0.5rem 0'
                                            }}>
                                                <div
                                                    className="dropdown-item"
                                                    onClick={() => {
                                                        setSelectedUser(u);
                                                        setShowEditModal(true);
                                                        setEditMode(false);
                                                        setModalTab('Personal');
                                                        setActiveActionMenu(null);
                                                    }}
                                                    style={{ padding: '0.5rem 1rem', cursor: 'pointer', fontSize: '0.85rem' }}
                                                >
                                                    View
                                                </div>
                                                <div
                                                    className="dropdown-item"
                                                    onClick={() => {
                                                        setSelectedUser(u);
                                                        setShowEditModal(true);
                                                        setEditMode(true);
                                                        setModalTab('Personal');
                                                        setActiveActionMenu(null);
                                                    }}
                                                    style={{ padding: '0.5rem 1rem', cursor: 'pointer', fontSize: '0.85rem' }}
                                                >
                                                    Edit
                                                </div>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {activeSubTab === 'Approvals' && (
                <div className="panel">
                    <div className="panel-header">Pending Approval Requests</div>
                    {pendingUsers.length > 0 ? (
                        <table className="data-table">
                            <thead>
                                <tr><th>NAME</th><th>EMAIL</th><th>DESIGNATION</th><th>DEPT</th><th>PHONE</th><th>ACTIONS</th></tr>
                            </thead>
                            <tbody>
                                {pendingUsers.map(u => (
                                    <tr key={u._id}>
                                        <td>{u.name}</td><td>{u.email}</td><td>{u.designation}</td><td>{u.department}</td><td>{u.phoneNumber}</td>
                                        <td>
                                            <button className="btn btn-sm btn-primary" onClick={() => handleApproveUser(u._id)}>Approve</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No pending requests.</div>}
                </div>
            )}

            {activeSubTab === 'Configs' && (
                <div className="grid" style={{ gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
                    <div className="panel">
                        <div className="panel-header">Add New Config</div>
                        <form onSubmit={handleAddConfig} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <select value={newConfig.type} onChange={e => setNewConfig({ ...newConfig, type: e.target.value })} style={inputStyle}>
                                <option value="Department">Department</option>
                                <option value="Designation">Designation</option>
                                <option value="Holiday">Holiday</option>
                            </select>
                            <input required type="text" placeholder="Name / Title" value={newConfig.name} onChange={e => setNewConfig({ ...newConfig, name: e.target.value })} style={inputStyle} />
                            {newConfig.type === 'Holiday' && (
                                <input required type="date" value={newConfig.date} onChange={e => setNewConfig({ ...newConfig, date: e.target.value })} style={inputStyle} />
                            )}
                            <button type="submit" className="btn btn-primary">Add Config</button>
                        </form>
                    </div>
                    <div className="panel">
                        <div className="panel-header">Existing Configurations</div>
                        <table className="data-table">
                            <thead><tr><th>TYPE</th><th>NAME</th><th>DATE</th><th>ACTIONS</th></tr></thead>
                            <tbody>
                                {orgConfigs.map(c => (
                                    <tr key={c._id}>
                                        <td>{c.type}</td><td>{c.name}</td><td>{c.date ? new Date(c.date).toLocaleDateString() : '-'}</td>
                                        <td><button className="btn btn-sm btn-danger" onClick={() => handleDeleteConfig(c._id)}>Delete</button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </>
    );
};

export default AdminTab;
