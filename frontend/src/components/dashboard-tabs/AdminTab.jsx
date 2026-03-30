import React, { useState, useEffect } from 'react';
import AuditTab from './AuditTab';
import api from '../../api/axios';
import {
    MoreVertical,
    Users,
    CheckCircle2,
    Settings2,
    Building2,
    Landmark,
    Plus,
    Trash2,
    ShieldCheck,
    Calendar,
    Eye,
    Edit3,
    Clock,
    UserCheck,
    UserX,
    Layers,
    Heart,
    Briefcase,
    Sparkles,
    ChevronDown,
    HelpCircle,
    X,
    Lock,
    ToggleLeft,
    ToggleRight,
    UserPlus
} from 'lucide-react';

/* ======= HELPER COMPONENTS (Moved outside to prevent remounting) ======= */
const InputField = ({ label, children, isLightMode }) => (
    <div>
        <label style={{ 
            display: 'block', fontSize: '0.7rem', fontWeight: '800', 
            color: isLightMode ? '#64748b' : 'rgba(148,163,184,0.8)', 
            marginBottom: '0.55rem', textTransform: 'uppercase', letterSpacing: '1px' 
        }}>
            {label}
        </label>
        {children}
    </div>
);

const SectionHeader = ({ icon, title, subtitle, extra }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
                width: '48px', height: '48px', borderRadius: '16px',
                background: 'linear-gradient(135deg, rgba(var(--primary-rgb),0.2), rgba(var(--primary-rgb),0.05))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--primary)', boxShadow: '0 4px 16px rgba(var(--primary-rgb),0.12)'
            }}>
                {icon}
            </div>
            <div>
                <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: '900', color: 'var(--text-main)', letterSpacing: '-0.3px' }}>{title}</h2>
                {subtitle && <p style={{ margin: '3px 0 0', fontSize: '0.82rem', fontWeight: '500', color: 'var(--text-muted)' }}>{subtitle}</p>}
            </div>
        </div>
        {extra}
    </div>
);

const AdminAvatar = ({ name, idx, gradientColors }) => {
    const grad = gradientColors[idx % gradientColors.length];
    const initials = name?.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase() || '??';
    return (
        <div style={{
            width: '38px', height: '38px', borderRadius: '12px', background: grad,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: '0.75rem', fontWeight: '900', letterSpacing: '0.5px',
            flexShrink: 0, boxShadow: '0 2px 10px rgba(0,0,0,0.15)'
        }}>
            {initials}
        </div>
    );
};

const FormInput = ({ isLightMode, ...props }) => {
    const { style, onFocus, onBlur, ...rest } = props;
    return (
        <input 
            {...rest} 
            style={{
                width: '100%', padding: '0.9rem 1.2rem', fontSize: '0.95rem', fontWeight: '600',
                background: isLightMode ? '#f8fafc' : 'rgba(0,0,0,0.2)',
                border: `1.5px solid ${isLightMode ? '#e2e8f0' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: '14px', color: 'var(--text-main)', outline: 'none',
                transition: 'all 0.25s', boxSizing: 'border-box', ...(style || {})
            }}
            onFocus={e => { 
                e.target.style.borderColor = 'var(--primary)'; 
                e.target.style.boxShadow = '0 0 0 4px rgba(var(--primary-rgb),0.12)';
                if (onFocus) onFocus(e);
            }}
            onBlur={e => { 
                e.target.style.borderColor = isLightMode ? '#e2e8f0' : 'rgba(255,255,255,0.08)'; 
                e.target.style.boxShadow = 'none';
                if (onBlur) onBlur(e);
            }}
        />
    );
};

const RoleBadge = ({ role, isLightMode }) => {
    const isSA = role === 'Super Admin';
    const isAdmin = role === 'Reporting Manager';
    const bg = isSA ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : isAdmin ? 'linear-gradient(135deg,#3b82f6,#06b6d4)' : (isLightMode ? '#f1f5f9' : 'rgba(255,255,255,0.06)');
    const color = (isSA || isAdmin) ? '#fff' : 'var(--text-muted)';
    return (
        <span style={{
            background: bg, color, padding: '0.3rem 0.75rem', borderRadius: '10px',
            fontSize: '0.65rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.8px',
            whiteSpace: 'nowrap', display: 'inline-block',
            boxShadow: (isSA || isAdmin) ? '0 2px 8px rgba(99,102,241,0.25)' : 'none'
        }}>
            {role}
        </span>
    );
};

const AdminTab = ({
    activeSubTab,
    setActiveSubTab,
    pendingUsers,
    systemSettings,
    setSystemSettings,
    handleSaveSettings,
    allUsers,
    allAttendanceLogs = [],
    setAllAttendanceLogs,
    handleUpdateAttendance,
    handleApproveUser,
    handleDenyUser,
    handleDeleteUser,
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
    setModalTab,
    handleShowAttendance,
    isLightMode,
    globalPayslips = [],
    handleUpdatePayslipStatus,
    user
}) => {
    const [filterType, setFilterType] = useState('All');
    const [payrollMonth, setPayrollMonth] = useState(new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date()));
    const [payrollYear, setPayrollYear] = useState(new Date().getFullYear());
    const pagedUsers = allUsers.filter(u => u.status !== 'Pending');
    const filteredConfigs = filterType === 'All' ? orgConfigs : orgConfigs.filter(c => c.type === filterType);

    // Create User state
    const [showCreateUserModal, setShowCreateUserModal] = useState(false);
    const [createUserForm, setCreateUserForm] = useState({ name: '', email: '', password: '', role: 'Intern', department: '', designation: '', reportingManager: '', phoneNumber: '' });
    const [createUserLoading, setCreateUserLoading] = useState(false);
    const [createUserError, setCreateUserError] = useState('');

    // Permissions state
    const [permissionsUsers, setPermissionsUsers] = useState([]);
    const [permissionsLoading, setPermissionsLoading] = useState(false);

    const normalizedRole = user?.role?.toLowerCase().replace(/\s/g, '');
    const isSuperAdmin = normalizedRole === 'superadmin';
    const canCreateUsersPermission = isSuperAdmin || user?.permissions?.canCreateUsers;

    // Departments and designations from orgConfigs
    const departments = orgConfigs.filter(c => c.type === 'Department').map(c => c.name);
    const designations = orgConfigs.filter(c => c.type === 'Designation').map(c => c.name);
    const managers = allUsers.filter(u => u.role === 'Reporting Manager' || u.role === 'Super Admin');

    // Load permissions users when Permissions tab is active
    useEffect(() => {
        if (activeSubTab === 'Permissions' && isSuperAdmin) {
            setPermissionsLoading(true);
            api.get('/admin/org-users').then(res => {
                setPermissionsUsers(res.data.filter(u => !u.isDeleted));
                setPermissionsLoading(false);
            }).catch(() => setPermissionsLoading(false));
        }
    }, [activeSubTab, isSuperAdmin]);

    const handleCreateUser = async (e) => {
        e.preventDefault();
        setCreateUserLoading(true);
        setCreateUserError('');
        try {
            await api.post('/admin/users', createUserForm);
            setShowCreateUserModal(false);
            setCreateUserForm({ name: '', email: '', password: '', role: 'Intern', department: '', designation: '', reportingManager: '', phoneNumber: '' });
            window.location.reload(); // refresh user list
        } catch (err) {
            setCreateUserError(err.response?.data?.message || 'Failed to create user');
        } finally {
            setCreateUserLoading(false);
        }
    };

    const handleTogglePermission = async (userId, permission, currentValue) => {
        try {
            await api.patch(`/admin/users/${userId}/permissions`, { [permission]: !currentValue });
            setPermissionsUsers(prev => prev.map(u => u._id === userId ? { ...u, permissions: { ...u.permissions, [permission]: !currentValue } } : u));
        } catch (err) {
            console.error('Failed to update permission', err);
        }
    };
    
    /* ======= CLICK OUTSIDE HANDLER ======= */
    useEffect(() => {
        const handleClickAway = (e) => {
            if (activeActionMenu && !e.target.closest('[data-action-menu]')) {
                setActiveActionMenu(null);
            }
        };
        document.addEventListener('mousedown', handleClickAway);
        return () => document.removeEventListener('mousedown', handleClickAway);
    }, [activeActionMenu, setActiveActionMenu]);


    /* ======= UNIFIED DESIGN TOKENS ======= */
    const glass = {
        background: isLightMode ? 'rgba(255,255,255,0.75)' : 'rgba(15,23,42,0.55)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        borderRadius: '28px',
        border: `1px solid ${isLightMode ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.07)'}`,
        boxShadow: isLightMode ? '0 8px 40px rgba(0,0,0,0.06)' : '0 8px 40px rgba(0,0,0,0.35)',
        transition: 'all 0.35s cubic-bezier(0.4,0,0.2,1)',
        position: 'relative',
        overflow: 'hidden'
    };

    const thStyle = {
        padding: '1rem 1.5rem',
        fontSize: '0.7rem',
        letterSpacing: '1.2px',
        fontWeight: '800',
        textTransform: 'uppercase',
        color: isLightMode ? '#64748b' : 'rgba(148,163,184,0.8)',
        background: isLightMode ? 'rgba(248,250,252,0.9)' : 'rgba(0,0,0,0.15)',
        whiteSpace: 'nowrap'
    };

    const tdStyle = {
        padding: '1.1rem 1.5rem',
        fontSize: '0.88rem',
        color: 'var(--text-main)',
        fontWeight: '500'
    };

    const rowBorder = `1px solid ${isLightMode ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.04)'}`;

    const gradientColors = [
        'linear-gradient(135deg,#6366f1,#8b5cf6)',
        'linear-gradient(135deg,#3b82f6,#06b6d4)',
        'linear-gradient(135deg,#10b981,#34d399)',
        'linear-gradient(135deg,#f59e0b,#f97316)',
        'linear-gradient(135deg,#ec4899,#f43f5e)',
        'linear-gradient(135deg,#14b8a6,#06b6d4)',
        'linear-gradient(135deg,#8b5cf6,#d946ef)'
    ];


    return (
        <div style={{ paddingBottom: '2rem' }}>

            {/* ===== SUB NAV ===== */}
            <div style={{
                display: 'inline-flex', gap: '0.3rem', padding: '0.3rem',
                background: isLightMode ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.04)',
                borderRadius: '18px', marginBottom: '2rem'
            }}>
                {[
                    { key: 'Leave', label: 'USERS' },
                    ...(isSuperAdmin || normalizedRole === 'reportingmanager' || normalizedRole === 'reportingofficer' ? [{ key: 'Attendance', label: 'ATTENDANCE' }] : []),
                    ...(isSuperAdmin || normalizedRole === 'reportingmanager' || normalizedRole === 'reportingofficer' ? [{ key: 'Configs', label: 'ORG CONFIGS' }] : []),
                    ...(isSuperAdmin ? [{ key: 'Settings', label: 'SYSTEM SETTINGS' }] : []),
                    ...(isSuperAdmin ? [{ key: 'Bank', label: 'BANK INFO' }] : []),
                    ...(isSuperAdmin ? [{ key: 'Payroll', label: 'PAYROLL' }] : []),
                    ...(isSuperAdmin ? [{ key: 'Permissions', label: 'PERMISSIONS' }] : []),
                    ...(isSuperAdmin ? [{ key: 'Audit', label: 'AUDIT LOGS' }] : [])
                ].map(t => {
                    const active = activeSubTab === t.key;
                    return (
                        <button key={t.key} onClick={() => setActiveSubTab(t.key)} style={{
                            padding: '0.55rem 1.25rem', borderRadius: '14px', border: 'none', cursor: 'pointer',
                            background: active ? (isLightMode ? '#ffffff' : 'rgba(255,255,255,0.1)') : 'transparent',
                            color: active ? 'var(--primary)' : 'var(--text-muted)',
                            fontWeight: '800', fontSize: '0.78rem', letterSpacing: '0.4px',
                            boxShadow: active ? (isLightMode ? '0 2px 12px rgba(0,0,0,0.06)' : '0 2px 12px rgba(0,0,0,0.2)') : 'none',
                            transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '0.5rem'
                        }}>
                            {t.label}
                            {t.count !== undefined && (
                                <span style={{
                                    background: active ? 'var(--primary)' : 'rgba(var(--primary-rgb),0.15)',
                                    color: active ? '#fff' : 'var(--primary)',
                                    padding: '0.1rem 0.5rem', borderRadius: '8px', fontSize: '0.7rem', fontWeight: '900',
                                    minWidth: '20px', textAlign: 'center'
                                }}>{t.count}</span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* ===== USERS ===== */}
            {activeSubTab === 'Leave' && (
                <div style={{ ...glass, padding: '2rem', overflow: activeActionMenu ? 'visible' : 'hidden' }}>
                    <SectionHeader icon={<Users size={24} />} title="Active Employees" subtitle={`${pagedUsers.length} team members in your organization`}
                        extra={canCreateUsersPermission && (
                            <button onClick={() => setShowCreateUserModal(true)} style={{
                                padding: '0.7rem 1.5rem', borderRadius: '14px', border: 'none', cursor: 'pointer',
                                background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff',
                                fontWeight: '800', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
                                boxShadow: '0 4px 16px rgba(99,102,241,0.35)', transition: 'all 0.2s'
                            }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                                <UserPlus size={16} /> Create User
                            </button>
                        )}
                    />

                    <div style={{ overflowX: 'auto', margin: '0 -2rem -2rem', borderBottomLeftRadius: '28px', borderBottomRightRadius: '28px' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                            <thead>
                                <tr>
                                    <th style={{ ...thStyle, paddingLeft: '2rem' }}>EMPLOYEE</th>
                                    <th style={thStyle}>DESIGNATION</th>
                                    <th style={thStyle}>DEPARTMENT</th>
                                    <th style={thStyle}>ROLE</th>
                                    <th style={{ ...thStyle, textAlign: 'center', paddingRight: '2rem' }}>ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pagedUsers.map((u, idx) => (
                                    <tr key={u._id} style={{ borderTop: rowBorder, transition: 'background 0.2s' }}
                                        onMouseOver={e => e.currentTarget.style.background = isLightMode ? 'rgba(99,102,241,0.03)' : 'rgba(255,255,255,0.02)'}
                                        onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                                        <td style={{ ...tdStyle, paddingLeft: '2rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <AdminAvatar name={u.name} idx={idx} gradientColors={gradientColors} />
                                                <div>
                                                    <div style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--text-main)', lineHeight: '1.3' }}>{u.name}</div>
                                                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '400' }}>{u.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={tdStyle}>{u.designation || <span style={{ color: 'var(--text-muted)', opacity: 0.5 }}>—</span>}</td>
                                        <td style={tdStyle}>{u.department || <span style={{ color: 'var(--text-muted)', opacity: 0.5 }}>—</span>}</td>
                                        <td style={tdStyle}><RoleBadge role={u.role} isLightMode={isLightMode} /></td>
                                        <td style={{ ...tdStyle, textAlign: 'center', paddingRight: '2rem', position: 'relative' }}>
                                            <button 
                                                data-action-menu="trigger"
                                                onClick={() => setActiveActionMenu(activeActionMenu === u._id ? null : u._id)} 
                                                style={{
                                                    width: '38px', height: '38px', borderRadius: '12px', border: 'none', cursor: 'pointer',
                                                    background: activeActionMenu === u._id ? (isLightMode ? '#eff6ff' : 'rgba(99,102,241,0.15)') : 'transparent',
                                                    color: activeActionMenu === u._id ? 'var(--primary)' : 'var(--text-muted)',
                                                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s'
                                                }} onMouseOver={e => { if (activeActionMenu !== u._id) { e.currentTarget.style.background = isLightMode ? '#f1f5f9' : 'rgba(255,255,255,0.06)'; } }}
                                                onMouseOut={e => { if (activeActionMenu !== u._id) { e.currentTarget.style.background = 'transparent'; } }}>
                                                <MoreVertical size={18} />
                                            </button>

                                            {activeActionMenu === u._id && (
                                                <div 
                                                    data-action-menu="panel"
                                                    style={{
                                                        position: 'absolute', top: '50%', right: '3.5rem', zIndex: 200, minWidth: '200px',
                                                        background: isLightMode ? '#ffffff' : '#1e293b',
                                                        borderRadius: '18px', padding: '0.6rem',
                                                        boxShadow: '0 20px 60px rgba(0,0,0,0.25), 0 0 0 1px rgba(0,0,0,0.05)',
                                                        animation: 'flyoutIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                                                        transform: 'translateY(-50%)'
                                                    }}>
                                                    {[
                                                        { icon: Eye, label: 'View Profile', action: () => { setSelectedUser(u); setShowEditModal(true); setEditMode(false); setModalTab('Personal'); setActiveActionMenu(null); } },
                                                        { icon: Edit3, label: 'Edit Details', action: () => { setSelectedUser(u); setEditMode(true); setShowEditModal(true); setModalTab('Personal'); setActiveActionMenu(null); } },
                                                        { icon: Clock, label: 'Attendance Log', action: () => { handleShowAttendance(u); setActiveActionMenu(null); } },
                                                        { icon: Trash2, label: 'Delete User', variant: 'danger', action: () => { handleDeleteUser(u._id); setActiveActionMenu(null); } }
                                                    ].map((item, i) => (
                                                        <div key={i} onClick={item.action} style={{
                                                            display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '12px',
                                                            cursor: 'pointer', fontSize: '0.88rem', fontWeight: '600', 
                                                            color: item.variant === 'danger' ? '#ef4444' : 'var(--text-main)', 
                                                            transition: 'all 0.15s'
                                                        }} onMouseOver={e => { 
                                                            e.currentTarget.style.background = item.variant === 'danger' ? 'rgba(239,68,68,0.1)' : (isLightMode ? '#f1f5f9' : 'rgba(255,255,255,0.06)'); 
                                                            if (!item.variant) e.currentTarget.style.color = 'var(--primary)'; 
                                                        }}
                                                           onMouseOut={e => { 
                                                            e.currentTarget.style.background = 'transparent'; 
                                                            e.currentTarget.style.color = item.variant === 'danger' ? '#ef4444' : 'var(--text-main)'; 
                                                        }}>
                                                            <item.icon size={16} /> {item.label}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ===== ATTENDANCE ===== */}
            {activeSubTab === 'Attendance' && (
                <div style={{ ...glass, padding: '2rem' }}>
                    <SectionHeader icon={<Clock size={24} />} title="Global Attendance Logs" subtitle="Recent clock-in/out records across the entire team" />
                    
                    <div style={{ overflowX: 'auto', margin: '0 -2rem -2rem', borderBottomLeftRadius: '28px', borderBottomRightRadius: '28px' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                            <thead>
                                <tr>
                                    <th style={{ ...thStyle, paddingLeft: '2rem' }}>EMPLOYEE</th>
                                    <th style={thStyle}>DATE</th>
                                    <th style={thStyle}>CLOCK IN</th>
                                    <th style={thStyle}>CLOCK OUT</th>
                                    <th style={thStyle}>TOTAL HOURS</th>
                                    <th style={thStyle}>STATUS</th>
                                    <th style={{ ...thStyle, textAlign: 'center', paddingRight: '2rem' }}>ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {allAttendanceLogs && allAttendanceLogs.length > 0 ? (
                                    allAttendanceLogs.map((log, idx) => (
                                        <tr key={log._id} style={{ borderTop: rowBorder, transition: 'background 0.2s' }}
                                            onMouseOver={e => e.currentTarget.style.background = isLightMode ? 'rgba(99,102,241,0.03)' : 'rgba(255,255,255,0.02)'}
                                            onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                                            <td style={{ ...tdStyle, padding: '0.75rem 1rem 0.75rem 2rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                    <AdminAvatar name={log.user?.name || 'User'} idx={idx} gradientColors={gradientColors} />
                                                    <div>
                                                        <div style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                            {log.user?.name || 'Deleted User'}
                                                            {log.user?.isDeleted && (
                                                                <span style={{ fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', border: '1.5px solid #ef4444', color: '#ef4444', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Terminated</span>
                                                            )}
                                                        </div>
                                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{log.user?.department || 'N/A'}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ ...tdStyle, padding: '0.75rem 1rem' }}>{new Date(log.date).toLocaleDateString()}</td>
                                            <td style={{ ...tdStyle, padding: '0.75rem 1rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    {log.clockInTime ? new Date(log.clockInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                                                    {(log.originalClockInTime || log.originalClockOutTime) && (
                                                        <div 
                                                            title={`Original: ${log.originalClockInTime ? new Date(log.originalClockInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'} - ${log.originalClockOutTime ? new Date(log.originalClockOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}\nRegularized to: ${log.clockInTime ? new Date(log.clockInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'} - ${log.clockOutTime ? new Date(log.clockOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}`}
                                                            style={{ cursor: 'help', color: 'var(--primary)', display: 'flex', alignItems: 'center' }}
                                                        >
                                                            <HelpCircle size={14} />
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td style={{ ...tdStyle, padding: '0.75rem 1rem' }}>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                    <span>{log.clockOutTime ? new Date(log.clockOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (log.clockInTime ? <span style={{ color: 'var(--primary)', fontWeight: '700' }}>Ongoing</span> : '-')}</span>
                                                    {log.autoClockOut && (
                                                        <span style={{ fontSize: '0.65rem', color: '#ef4444', fontWeight: '700', background: 'rgba(239, 68, 68, 0.1)', padding: '2px 6px', borderRadius: '4px', width: 'fit-content', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                                                            Auto-Clocked Out
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td style={{ ...tdStyle, padding: '0.75rem 1rem' }}>{log.totalHours ? `${log.totalHours}h` : '-'}</td>
                                            <td style={{ ...tdStyle, padding: '0.75rem 1rem' }}>
                                                <span style={{
                                                    padding: '0.2rem 0.6rem', borderRadius: '8px', fontSize: '0.65rem', fontWeight: '800', 
                                                    textTransform: 'uppercase',
                                                    background: log.status === 'Present' || log.status === 'WFH' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                                                    color: log.status === 'Present' || log.status === 'WFH' ? '#10b981' : '#ef4444'
                                                }}>
                                                    {log.status === 'WFH' ? 'Remote' : log.status}
                                                </span>
                                            </td>
                                            <td style={{ ...tdStyle, textAlign: 'center', padding: '0.75rem 2rem 0.75rem 1rem' }}>
                                                <button 
                                                    onClick={() => handleShowAttendance(log.user)} 
                                                    style={{ 
                                                        padding: '0.4rem 0.8rem', borderRadius: '8px', border: '1px solid var(--primary)', 
                                                        background: 'transparent', color: 'var(--primary)', fontSize: '0.75rem', 
                                                        fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s' 
                                                    }}
                                                    onMouseOver={e => { e.currentTarget.style.background = 'var(--primary)'; e.currentTarget.style.color = '#fff'; }}
                                                    onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--primary)'; }}
                                                >
                                                    Edit Log
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" style={{ padding: '6rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                            <div style={{ marginBottom: '1rem' }}><Clock size={40} opacity={0.2} /></div>
                                            No attendance records found yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ===== PERMISSIONS (Super Admin Only) ===== */}
            {activeSubTab === 'Permissions' && isSuperAdmin && (
                <div style={{ ...glass, padding: '2rem' }}>
                    <SectionHeader icon={<Lock size={24} />} title="User Permissions" subtitle="Grant or revoke granular permissions for individual users" />

                    {permissionsLoading ? (
                        <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading users...</div>
                    ) : (
                        <div style={{ overflowX: 'auto', margin: '0 -2rem -2rem', borderBottomLeftRadius: '28px', borderBottomRightRadius: '28px' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
                                <thead>
                                    <tr>
                                        <th style={{ ...thStyle, paddingLeft: '2rem' }}>EMPLOYEE</th>
                                        <th style={thStyle}>ROLE</th>
                                        <th style={{ ...thStyle, textAlign: 'center' }}>CAN CREATE USERS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {permissionsUsers.map((u, idx) => (
                                        <tr key={u._id} style={{ borderTop: rowBorder, transition: 'background 0.2s' }}
                                            onMouseOver={e => e.currentTarget.style.background = isLightMode ? 'rgba(99,102,241,0.03)' : 'rgba(255,255,255,0.02)'}
                                            onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                                            <td style={{ ...tdStyle, paddingLeft: '2rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                    <AdminAvatar name={u.name} idx={idx} gradientColors={gradientColors} />
                                                    <div>
                                                        <div style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--text-main)' }}>{u.name}</div>
                                                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{u.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={tdStyle}><RoleBadge role={u.role} isLightMode={isLightMode} /></td>
                                            <td style={{ ...tdStyle, textAlign: 'center' }}>
                                                <button onClick={() => handleTogglePermission(u._id, 'canCreateUsers', u.permissions?.canCreateUsers)} style={{
                                                    background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.8rem',
                                                    color: u.permissions?.canCreateUsers ? '#10b981' : (isLightMode ? '#cbd5e1' : 'rgba(255,255,255,0.15)'),
                                                    transition: 'all 0.2s', display: 'inline-flex', alignItems: 'center'
                                                }}>
                                                    {u.permissions?.canCreateUsers ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* ===== ORG CONFIGS ===== */}
            {activeSubTab === 'Configs' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }}>
                    {/* Add Config */}
                    <div style={{ ...glass, padding: '2rem', position: 'sticky', top: '1.5rem' }}>
                        {/* Gradient Header Bar */}
                        <div style={{
                            background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', borderRadius: '20px',
                            padding: '1.75rem', marginBottom: '2rem', position: 'relative', overflow: 'hidden'
                        }}>
                            <div style={{ position: 'absolute', right: '-15px', bottom: '-15px', opacity: 0.15 }}><Layers size={100} /></div>
                            <h3 style={{ margin: 0, color: '#fff', fontWeight: '900', fontSize: '1.2rem', position: 'relative', zIndex: 1 }}>Add New Config</h3>
                            <p style={{ margin: '0.3rem 0 0', color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem', fontWeight: '500', position: 'relative', zIndex: 1 }}>Departments, designations & holidays</p>
                        </div>

                        <form onSubmit={handleAddConfig} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <InputField label="Type" isLightMode={isLightMode}>
                                <div style={{ position: 'relative', width: '100%' }}>
                                    <select value={newConfig.type} onChange={e => setNewConfig({ ...newConfig, type: e.target.value })} style={{
                                        width: '100%', padding: '0.9rem 2.8rem 0.9rem 1.2rem', fontSize: '0.95rem', fontWeight: '600',
                                        background: isLightMode ? '#f8fafc' : 'rgba(0,0,0,0.2)',
                                        border: `1.5px solid ${isLightMode ? '#e2e8f0' : 'rgba(255,255,255,0.08)'}`,
                                        borderRadius: '14px', color: 'var(--text-main)', outline: 'none', cursor: 'pointer',
                                        appearance: 'none', position: 'relative', zIndex: 1
                                    }}
                                    onFocus={e => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 4px rgba(var(--primary-rgb),0.12)'; }}
                                    onBlur={e => { e.target.style.borderColor = isLightMode ? '#e2e8f0' : 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; }}>
                                        <option value="Department" style={{ background: isLightMode ? '#fff' : '#1e293b' }}>Department</option>
                                        <option value="Designation" style={{ background: isLightMode ? '#fff' : '#1e293b' }}>Designation</option>
                                        <option value="Holiday" style={{ background: isLightMode ? '#fff' : '#1e293b' }}>Holiday</option>
                                    </select>
                                    <div style={{
                                        position: 'absolute', right: '1.2rem', top: '50%', transform: 'translateY(-50%)',
                                        color: 'var(--text-muted)', pointerEvents: 'none', zIndex: 2, display: 'flex', alignItems: 'center'
                                    }}>
                                        <ChevronDown size={18} />
                                    </div>
                                </div>
                            </InputField>
                            <InputField label="Name / Title" isLightMode={isLightMode}>
                                <FormInput isLightMode={isLightMode} required={true} type="text" placeholder="e.g., Technical Department" value={newConfig.name} onChange={e => setNewConfig({ ...newConfig, name: e.target.value })} />
                            </InputField>
                            {newConfig.type === 'Holiday' && (
                                <InputField label="Date" isLightMode={isLightMode}>
                                    <FormInput isLightMode={isLightMode} required={true} type="date" value={newConfig.date} onChange={e => setNewConfig({ ...newConfig, date: e.target.value })} style={{ colorScheme: isLightMode ? 'light' : 'dark' }} />
                                </InputField>
                            )}
                            <button type="submit" style={{
                                padding: '1rem', borderRadius: '16px', border: 'none', cursor: 'pointer',
                                background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff',
                                fontWeight: '800', fontSize: '0.95rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                boxShadow: '0 6px 20px rgba(99,102,241,0.35)', transition: 'all 0.2s', marginTop: '0.5rem'
                            }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                                <Plus size={18} /> Add Configuration
                            </button>
                        </form>
                    </div>

                    {/* Config List */}
                    <div style={{ ...glass, padding: '2rem' }}>
                        <SectionHeader icon={<Building2 size={24} />} title="Existing Configurations"
                            extra={
                                <div style={{ display: 'flex', background: isLightMode ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.04)', padding: '0.3rem', borderRadius: '14px', gap: '0.2rem' }}>
                                    {['All', 'Department', 'Designation', 'Holiday'].map(type => (
                                        <button key={type} onClick={() => setFilterType(type)} style={{
                                            padding: '0.45rem 0.8rem', border: 'none', cursor: 'pointer', borderRadius: '10px',
                                            fontSize: '0.72rem', fontWeight: '800', letterSpacing: '0.3px', transition: 'all 0.2s',
                                            background: filterType === type ? 'var(--primary)' : 'transparent',
                                            color: filterType === type ? '#fff' : 'var(--text-muted)',
                                            boxShadow: filterType === type ? '0 2px 8px rgba(var(--primary-rgb),0.3)' : 'none'
                                        }}>
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            }
                        />

                        {filteredConfigs.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {filteredConfigs.map(c => {
                                    const typeColor = c.type === 'Department' ? '#3b82f6' : c.type === 'Designation' ? '#8b5cf6' : '#f59e0b';
                                    return (
                                        <div key={c._id} style={{
                                            display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1rem 1.25rem',
                                            background: isLightMode ? '#f8fafc' : 'rgba(0,0,0,0.12)',
                                            borderRadius: '16px', border: `1px solid ${isLightMode ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.04)'}`,
                                            transition: 'all 0.2s'
                                        }}>
                                            <div style={{
                                                width: '36px', height: '36px', borderRadius: '10px',
                                                background: `${typeColor}18`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                color: typeColor, flexShrink: 0
                                            }}>
                                                {c.type === 'Holiday' ? <Calendar size={16} /> : c.type === 'Department' ? <Building2 size={16} /> : <Briefcase size={16} />}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: '700', fontSize: '0.92rem', color: 'var(--text-main)' }}>{c.name}</div>
                                                <div style={{ fontSize: '0.72rem', color: typeColor, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                    {c.type} {c.date ? `• ${new Date(c.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}` : ''}
                                                </div>
                                            </div>
                                            <button onClick={() => handleDeleteConfig(c._id)} style={{
                                                width: '34px', height: '34px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                                                background: isLightMode ? '#fef2f2' : 'rgba(239,68,68,0.1)', color: '#ef4444',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', flexShrink: 0
                                            }} onMouseOver={e => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#ef4444'; }}
                                               onMouseOut={e => { e.currentTarget.style.background = isLightMode ? '#fef2f2' : 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#ef4444'; }}>
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>No configurations match this filter.</div>
                        )}
                    </div>
                </div>
            )}

            {/* ===== SYSTEM SETTINGS ===== */}
            {activeSubTab === 'Settings' && (
                <div style={{ margin: '0' }}>
                    <div style={{ ...glass, padding: '2.5rem' }}>
                        {/* Big gradient banner */}
                        <div style={{
                            background: 'linear-gradient(135deg,#6366f1 0%,#3b82f6 50%,#06b6d4 100%)',
                            borderRadius: '24px', padding: '2.5rem', marginBottom: '2.5rem',
                            position: 'relative', overflow: 'hidden'
                        }}>
                            <div style={{ position: 'absolute', right: '2rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.12 }}><Settings2 size={160} /></div>
                            <div style={{ position: 'relative', zIndex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                                    <Sparkles size={18} color="#fde68a" />
                                    <span style={{ color: '#fde68a', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Administration</span>
                                </div>
                                <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: '900', color: '#fff', letterSpacing: '-0.5px' }}>System Settings</h2>
                                <p style={{ margin: '0.5rem 0 0', fontSize: '0.95rem', color: 'rgba(255,255,255,0.8)', fontWeight: '500' }}>Configure global organization parameters and leave policies.</p>
                            </div>
                        </div>

                        {/* Company Info */}
                        <div style={{ marginBottom: '3rem' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                <Building2 size={18} color="var(--primary)" /> Organization Info
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
                                <InputField label="Company Name" isLightMode={isLightMode}>
                                    <FormInput isLightMode={isLightMode} type="text" value={systemSettings.companyName || ''} onChange={e => setSystemSettings({ ...systemSettings, companyName: e.target.value })} />
                                </InputField>
                                <InputField label="Working Hours / Day" isLightMode={isLightMode}>
                                    <FormInput isLightMode={isLightMode} type="number" value={systemSettings.workingHoursPerDay || ''} onChange={e => setSystemSettings({ ...systemSettings, workingHoursPerDay: e.target.value })} />
                                </InputField>
                            </div>
                        </div>

                        {/* Leave Quotas */}
                        <div style={{ marginBottom: '2.5rem' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                <Calendar size={18} color="var(--primary)" /> Default Leave Quotas
                            </h3>
                            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>These values are applied to all new employees globally.</p>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem' }}>
                                {[
                                    { label: 'Paid Leave', key: 'paid', icon: ShieldCheck, color: '#6366f1', grad: 'linear-gradient(135deg,#6366f1,#818cf8)' },
                                    { label: 'Sick Leave', key: 'sick', icon: Heart, color: '#ef4444', grad: 'linear-gradient(135deg,#ef4444,#f87171)' },
                                    { label: 'Casual Leave', key: 'casual', icon: Users, color: '#10b981', grad: 'linear-gradient(135deg,#10b981,#34d399)' },
                                    { label: 'Comp Off', key: 'compOff', icon: Clock, color: '#f59e0b', grad: 'linear-gradient(135deg,#f59e0b,#fbbf24)' }
                                ].map(q => (
                                    <div key={q.key} style={{
                                        background: isLightMode ? '#fff' : 'rgba(0,0,0,0.15)',
                                        border: `1.5px solid ${isLightMode ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)'}`,
                                        borderRadius: '22px', padding: '1.5rem', position: 'relative', overflow: 'hidden',
                                        transition: 'all 0.25s', cursor: 'default',
                                        boxShadow: isLightMode ? '0 4px 15px rgba(0,0,0,0.03)' : 'none'
                                    }} onMouseOver={e => e.currentTarget.style.borderColor = q.color + '60'} onMouseOut={e => e.currentTarget.style.borderColor = isLightMode ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)'}>
                                        <div style={{ position: 'absolute', right: '-8px', top: '-8px', width: '60px', height: '60px', borderRadius: '50%', background: q.color + '10' }}></div>
                                        <div style={{
                                            width: '40px', height: '40px', borderRadius: '14px', background: q.grad,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
                                            marginBottom: '1rem', boxShadow: `0 4px 12px ${q.color}40`
                                        }}>
                                            <q.icon size={20} />
                                        </div>
                                        <div style={{ fontSize: '0.72rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '0.5rem' }}>{q.label}</div>
                                        <input
                                            type="number"
                                            value={systemSettings.defaultLeaveQuotas?.[q.key] ?? 0}
                                            onChange={e => setSystemSettings({ ...systemSettings, defaultLeaveQuotas: { ...systemSettings.defaultLeaveQuotas, [q.key]: parseInt(e.target.value) || 0 } })}
                                            style={{
                                                background: 'transparent', border: 'none', color: 'var(--text-main)',
                                                fontSize: '2rem', fontWeight: '900', padding: 0, width: '100%', outline: 'none'
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Save */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button onClick={handleSaveSettings} style={{
                                padding: '1rem 3rem', borderRadius: '16px', border: 'none', cursor: 'pointer',
                                background: 'linear-gradient(135deg,#6366f1,#3b82f6)', color: '#fff',
                                fontWeight: '800', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.6rem',
                                boxShadow: '0 8px 24px rgba(99,102,241,0.35)', transition: 'all 0.2s'
                            }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                                <ShieldCheck size={20} /> Save Settings
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== BANK INFO ===== */}
            {activeSubTab === 'Bank' && (
                <div style={{ ...glass, padding: '2rem' }}>
                    <SectionHeader icon={<Landmark size={24} />} title="Employee Bank Directory" subtitle="Confidential payout information for all employees" />
                    <div style={{ overflowX: 'auto', margin: '0 -2rem -2rem', borderBottomLeftRadius: '28px', borderBottomRightRadius: '28px' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '950px' }}>
                            <thead>
                                <tr>
                                    <th style={{ ...thStyle, paddingLeft: '2rem' }}>EMPLOYEE</th>
                                    <th style={thStyle}>HOLDER</th>
                                    <th style={thStyle}>BANK</th>
                                    <th style={thStyle}>ACCOUNT NO.</th>
                                    <th style={thStyle}>IFSC</th>
                                    <th style={thStyle}>BRANCH</th>
                                    <th style={{ ...thStyle, paddingRight: '2rem' }}>UPI</th>
                                </tr>
                            </thead>
                            <tbody>
                                {allUsers.map((u, idx) => (
                                    <tr key={u._id} style={{ borderTop: rowBorder, transition: 'background 0.2s' }}
                                        onMouseOver={e => e.currentTarget.style.background = isLightMode ? 'rgba(99,102,241,0.03)' : 'rgba(255,255,255,0.02)'}
                                        onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                                        <td style={{ ...tdStyle, paddingLeft: '2rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                                <AdminAvatar name={u.name} idx={idx} gradientColors={gradientColors} />
                                                <div>
                                                    <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>{u.name}</div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ ...tdStyle, fontWeight: '600' }}>{u.bankDetails?.accountHolderName || <span style={{ opacity: 0.3 }}>—</span>}</td>
                                        <td style={tdStyle}>{u.bankDetails?.bankName || <span style={{ opacity: 0.3 }}>—</span>}</td>
                                        <td style={{ ...tdStyle, fontFamily: 'monospace', fontWeight: '700', letterSpacing: '0.5px' }}>{u.bankDetails?.accountNumber || <span style={{ opacity: 0.3 }}>—</span>}</td>
                                        <td style={{ ...tdStyle, fontWeight: '700', color: 'var(--primary)', letterSpacing: '0.5px', fontSize: '0.82rem' }}>{u.bankDetails?.ifscCode || <span style={{ opacity: 0.3, color: 'var(--text-muted)' }}>—</span>}</td>
                                        <td style={tdStyle}>{u.bankDetails?.branchName || <span style={{ opacity: 0.3 }}>—</span>}</td>
                                        <td style={{ ...tdStyle, paddingRight: '2rem', fontWeight: '700', color: '#10b981' }}>{u.bankDetails?.upiId || <span style={{ opacity: 0.3, color: 'var(--text-muted)' }}>—</span>}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ===== PAYROLL ===== */}
            {activeSubTab === 'Payroll' && (
                <div style={{ ...glass, padding: '2rem' }}>
                    <SectionHeader 
                        icon={<Landmark size={24} />} 
                        title="Payroll Management" 
                        subtitle="Review and update payout status for all employees" 
                        extra={
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <select 
                                    value={payrollMonth} 
                                    onChange={(e) => setPayrollMonth(e.target.value)}
                                    style={{
                                        padding: '0.6rem 1rem', borderRadius: '12px',
                                        background: isLightMode ? '#f8fafc' : 'rgba(255,255,255,0.05)',
                                        border: `1px solid ${isLightMode ? '#e2e8f0' : 'rgba(255,255,255,0.1)'}`,
                                        color: 'var(--text-main)', fontWeight: '700', outline: 'none'
                                    }}
                                >
                                    {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                                        <option key={m} value={m} style={{ background: isLightMode ? '#fff' : '#1e293b' }}>{m}</option>
                                    ))}
                                </select>
                                <select 
                                    value={payrollYear} 
                                    onChange={(e) => setPayrollYear(parseInt(e.target.value))}
                                    style={{
                                        padding: '0.6rem 1rem', borderRadius: '12px',
                                        background: isLightMode ? '#f8fafc' : 'rgba(255,255,255,0.05)',
                                        border: `1px solid ${isLightMode ? '#e2e8f0' : 'rgba(255,255,255,0.1)'}`,
                                        color: 'var(--text-main)', fontWeight: '700', outline: 'none'
                                    }}
                                >
                                    {[2024, 2025, 2026].map(y => (
                                        <option key={y} value={y} style={{ background: isLightMode ? '#fff' : '#1e293b' }}>{y}</option>
                                    ))}
                                </select>
                            </div>
                        }
                    />
                    
                    <div style={{ overflowX: 'auto', margin: '0 -2rem -2rem', borderBottomLeftRadius: '28px', borderBottomRightRadius: '28px' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '950px' }}>
                            <thead>
                                <tr>
                                    <th style={{ ...thStyle, paddingLeft: '2rem' }}>EMPLOYEE</th>
                                    <th style={thStyle}>NET PAY</th>
                                    <th style={thStyle}>STATUS</th>
                                    <th style={thStyle}>PAID ON</th>
                                    <th style={thStyle}>BANK / UPI</th>
                                    <th style={{ ...thStyle, textAlign: 'center', paddingRight: '2rem' }}>ACTION</th>
                                </tr>
                            </thead>
                            <tbody>
                                {allUsers.map((u, idx) => {
                                    const payslip = globalPayslips.find(p => p.user?._id === u._id && p.month === payrollMonth && parseInt(p.year) === payrollYear);
                                    return (
                                        <tr key={u._id} style={{ borderTop: rowBorder, transition: 'background 0.2s' }}
                                            onMouseOver={e => e.currentTarget.style.background = isLightMode ? 'rgba(99,102,241,0.03)' : 'rgba(255,255,255,0.02)'}
                                            onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                                            <td style={{ ...tdStyle, paddingLeft: '2rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                                    <AdminAvatar name={u.name} idx={idx} gradientColors={gradientColors} />
                                                    <div>
                                                        <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>{u.name}</div>
                                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.designation}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ ...tdStyle, fontWeight: '800', color: 'var(--primary)' }}>
                                                {payslip ? `₹${payslip.netPay.toLocaleString()}` : <span style={{ opacity: 0.3 }}>Not Generated</span>}
                                            </td>
                                            <td style={tdStyle}>
                                                {payslip ? (
                                                    <span style={{
                                                        padding: '0.3rem 0.75rem', borderRadius: '10px',
                                                        fontSize: '0.65rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.8px',
                                                        background: payslip.status === 'Paid' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                                                        color: payslip.status === 'Paid' ? '#10b981' : '#f59e0b',
                                                        border: `1px solid ${payslip.status === 'Paid' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)'}`
                                                    }}>
                                                        {payslip.status}
                                                    </span>
                                                ) : <span style={{ opacity: 0.3 }}>—</span>}
                                            </td>
                                            <td style={tdStyle}>
                                                {payslip?.paidAt ? new Date(payslip.paidAt).toLocaleDateString() : <span style={{ opacity: 0.3 }}>—</span>}
                                            </td>
                                            <td style={tdStyle}>
                                                <div style={{ fontSize: '0.8rem', fontWeight: '600' }}>{u.bankDetails?.bankName || 'N/A'}</div>
                                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{u.bankDetails?.accountNumber || u.bankDetails?.upiId || ''}</div>
                                            </td>
                                            <td style={{ ...tdStyle, textAlign: 'center', paddingRight: '2rem' }}>
                                                {payslip ? (
                                                    <button 
                                                        onClick={() => handleUpdatePayslipStatus(payslip._id, payslip.status === 'Paid' ? 'Unpaid' : 'Paid')}
                                                        style={{
                                                            padding: '0.5rem 1rem', borderRadius: '10px', border: 'none', cursor: 'pointer',
                                                            background: payslip.status === 'Paid' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                                                            color: payslip.status === 'Paid' ? '#ef4444' : '#10b981',
                                                            fontSize: '0.75rem', fontWeight: '800', transition: 'all 0.2s'
                                                        }}
                                                        onMouseOver={e => { e.currentTarget.style.background = payslip.status === 'Paid' ? '#ef4444' : '#10b981'; e.currentTarget.style.color = '#fff'; }}
                                                        onMouseOut={e => { e.currentTarget.style.background = payslip.status === 'Paid' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)'; e.currentTarget.style.color = payslip.status === 'Paid' ? '#ef4444' : '#10b981'; }}
                                                    >
                                                        {payslip.status === 'Paid' ? 'Mark Unpaid' : 'Mark Paid'}
                                                    </button>
                                                ) : (
                                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Action N/A</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ===== AUDIT LOGS (Super Admin Only) ===== */}
            {activeSubTab === 'Audit' && isSuperAdmin && (
                <AuditTab isLightMode={isLightMode} />
            )}

            {/* ===== CREATE USER MODAL ===== */}
            {showCreateUserModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(4px)' }}
                    onClick={(e) => { if (e.target === e.currentTarget) setShowCreateUserModal(false); }}>
                    <div style={{
                        background: isLightMode ? '#ffffff' : '#0f172a', borderRadius: '28px', padding: '2.5rem',
                        width: '90%', maxWidth: '650px', maxHeight: '85vh', overflowY: 'auto',
                        border: `1px solid ${isLightMode ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)'}`,
                        boxShadow: '0 25px 60px rgba(0,0,0,0.4)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <div>
                                <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '900', color: 'var(--text-main)' }}>Create New User</h2>
                                <p style={{ margin: '0.3rem 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Provision a new employee account</p>
                            </div>
                            <button onClick={() => setShowCreateUserModal(false)} style={{
                                width: '38px', height: '38px', borderRadius: '12px', border: 'none', cursor: 'pointer',
                                background: isLightMode ? '#f1f5f9' : 'rgba(255,255,255,0.06)', color: 'var(--text-muted)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}><X size={18} /></button>
                        </div>

                        {createUserError && (
                            <div style={{ padding: '0.75rem 1rem', borderRadius: '12px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', fontSize: '0.85rem', fontWeight: '700', marginBottom: '1.5rem', border: '1px solid rgba(239,68,68,0.2)' }}>
                                {createUserError}
                            </div>
                        )}

                        <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                                <InputField label="Full Name *" isLightMode={isLightMode}>
                                    <FormInput isLightMode={isLightMode} required type="text" placeholder="John Doe" value={createUserForm.name} onChange={e => setCreateUserForm({ ...createUserForm, name: e.target.value })} />
                                </InputField>
                                <InputField label="Email *" isLightMode={isLightMode}>
                                    <FormInput isLightMode={isLightMode} required type="email" placeholder="john@company.com" value={createUserForm.email} onChange={e => setCreateUserForm({ ...createUserForm, email: e.target.value })} />
                                </InputField>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                                <InputField label="Password *" isLightMode={isLightMode}>
                                    <FormInput isLightMode={isLightMode} required type="password" placeholder="Set initial password" value={createUserForm.password} onChange={e => setCreateUserForm({ ...createUserForm, password: e.target.value })} />
                                </InputField>
                                <InputField label="Phone Number" isLightMode={isLightMode}>
                                    <FormInput isLightMode={isLightMode} type="text" placeholder="+91 1234567890" value={createUserForm.phoneNumber} onChange={e => setCreateUserForm({ ...createUserForm, phoneNumber: e.target.value })} />
                                </InputField>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                                <InputField label="Role *" isLightMode={isLightMode}>
                                    <div style={{ position: 'relative' }}>
                                        <select value={createUserForm.role} onChange={e => setCreateUserForm({ ...createUserForm, role: e.target.value })} style={{
                                            width: '100%', padding: '0.9rem 2.8rem 0.9rem 1.2rem', fontSize: '0.95rem', fontWeight: '600',
                                            background: isLightMode ? '#f8fafc' : 'rgba(0,0,0,0.2)',
                                            border: `1.5px solid ${isLightMode ? '#e2e8f0' : 'rgba(255,255,255,0.08)'}`,
                                            borderRadius: '14px', color: 'var(--text-main)', outline: 'none', cursor: 'pointer', appearance: 'none'
                                        }}>
                                            <option value="Intern">Intern</option>
                                            <option value="Reporting Manager">Reporting Manager</option>
                                            <option value="Super Admin">Super Admin</option>
                                        </select>
                                        <div style={{ position: 'absolute', right: '1.2rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }}><ChevronDown size={18} /></div>
                                    </div>
                                </InputField>
                                <InputField label="Department" isLightMode={isLightMode}>
                                    <div style={{ position: 'relative' }}>
                                        <select value={createUserForm.department} onChange={e => setCreateUserForm({ ...createUserForm, department: e.target.value })} style={{
                                            width: '100%', padding: '0.9rem 2.8rem 0.9rem 1.2rem', fontSize: '0.95rem', fontWeight: '600',
                                            background: isLightMode ? '#f8fafc' : 'rgba(0,0,0,0.2)',
                                            border: `1.5px solid ${isLightMode ? '#e2e8f0' : 'rgba(255,255,255,0.08)'}`,
                                            borderRadius: '14px', color: 'var(--text-main)', outline: 'none', cursor: 'pointer', appearance: 'none'
                                        }}>
                                            <option value="">Select Department</option>
                                            {departments.map(d => <option key={d} value={d}>{d}</option>)}
                                        </select>
                                        <div style={{ position: 'absolute', right: '1.2rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }}><ChevronDown size={18} /></div>
                                    </div>
                                </InputField>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                                <InputField label="Designation" isLightMode={isLightMode}>
                                    <div style={{ position: 'relative' }}>
                                        <select value={createUserForm.designation} onChange={e => setCreateUserForm({ ...createUserForm, designation: e.target.value })} style={{
                                            width: '100%', padding: '0.9rem 2.8rem 0.9rem 1.2rem', fontSize: '0.95rem', fontWeight: '600',
                                            background: isLightMode ? '#f8fafc' : 'rgba(0,0,0,0.2)',
                                            border: `1.5px solid ${isLightMode ? '#e2e8f0' : 'rgba(255,255,255,0.08)'}`,
                                            borderRadius: '14px', color: 'var(--text-main)', outline: 'none', cursor: 'pointer', appearance: 'none'
                                        }}>
                                            <option value="">Select Designation</option>
                                            {designations.map(d => <option key={d} value={d}>{d}</option>)}
                                        </select>
                                        <div style={{ position: 'absolute', right: '1.2rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }}><ChevronDown size={18} /></div>
                                    </div>
                                </InputField>
                                <InputField label="Reporting Manager" isLightMode={isLightMode}>
                                    <div style={{ position: 'relative' }}>
                                        <select value={createUserForm.reportingManager} onChange={e => setCreateUserForm({ ...createUserForm, reportingManager: e.target.value })} style={{
                                            width: '100%', padding: '0.9rem 2.8rem 0.9rem 1.2rem', fontSize: '0.95rem', fontWeight: '600',
                                            background: isLightMode ? '#f8fafc' : 'rgba(0,0,0,0.2)',
                                            border: `1.5px solid ${isLightMode ? '#e2e8f0' : 'rgba(255,255,255,0.08)'}`,
                                            borderRadius: '14px', color: 'var(--text-main)', outline: 'none', cursor: 'pointer', appearance: 'none'
                                        }}>
                                            <option value="">Select Manager</option>
                                            {managers.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
                                        </select>
                                        <div style={{ position: 'absolute', right: '1.2rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }}><ChevronDown size={18} /></div>
                                    </div>
                                </InputField>
                            </div>

                            <button type="submit" disabled={createUserLoading} style={{
                                padding: '1rem', borderRadius: '16px', border: 'none', cursor: createUserLoading ? 'wait' : 'pointer',
                                background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff',
                                fontWeight: '800', fontSize: '0.95rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                boxShadow: '0 6px 20px rgba(99,102,241,0.35)', transition: 'all 0.2s', marginTop: '0.5rem',
                                opacity: createUserLoading ? 0.7 : 1
                            }} onMouseOver={e => !createUserLoading && (e.currentTarget.style.transform = 'translateY(-2px)')} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                                <UserPlus size={18} /> {createUserLoading ? 'Creating...' : 'Create User Account'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes flyoutIn {
                    from { opacity: 0; transform: translateY(-50%) translateX(15px) scale(0.95); }
                    to { opacity: 1; transform: translateY(-50%) translateX(0) scale(1); }
                }
                @keyframes dropdownIn {
                    from { opacity: 0; transform: translateY(-6px) scale(0.97); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
            `}</style>
        </div>
    );
};

export default AdminTab;
