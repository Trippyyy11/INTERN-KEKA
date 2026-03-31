import React, { useState, useEffect } from 'react';
import AuditTab from './AuditTab';
import api from '../../api/axios';
import moment from 'moment';
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
    const r = role?.toLowerCase().replace(/\s/g, '');
    const isSA = r === 'superadmin';
    const isAdmin = r === 'reportingmanager';
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
    const [potentialManagers, setPotentialManagers] = useState([]);
    
    // Manage Granular Permissions Modal
    const [showPermissionsModal, setShowPermissionsModal] = useState(false);
    const [selectedPermissionsUser, setSelectedPermissionsUser] = useState(null);

    const PERMISSION_KEYS = [
        { key: 'canCreateUsers', label: 'Create Users' },
        { key: 'canViewUsersTab', label: 'View Users Tab' },
        { key: 'canViewAttendanceTab', label: 'View Attendance Tab' },
        { key: 'canViewConfigsTab', label: 'View Org Configs Tab' },
        { key: 'canViewSettingsTab', label: 'View System Settings Tab' },
        { key: 'canViewBankTab', label: 'View Bank Info Tab' },
        { key: 'canViewPayrollTab', label: 'View Payroll Tab' },
        { key: 'canViewPermissionsTab', label: 'Manage Permissions Tab' },
        { key: 'canViewAuditTab', label: 'View Audit Logs Tab' }
    ];

    const normalizedRole = user?.role?.toLowerCase().replace(/\s/g, '');
    const isSuperAdmin = normalizedRole === 'superadmin';
    const canCreateUsersPermission = isSuperAdmin || user?.permissions?.canCreateUsers;

    // Departments and designations from orgConfigs
    const departments = orgConfigs.filter(c => c.type === 'Department').map(c => c.name);
    const designations = orgConfigs.filter(c => c.type === 'Designation').map(c => c.name);
    
    // Potential managers for the dropdown
    useEffect(() => {
        if (canCreateUsersPermission) {
            api.get('/admin/potential-managers').then(res => {
                setPotentialManagers(res.data);
            }).catch(err => console.error('Failed to fetch potential managers', err));
        }
    }, [canCreateUsersPermission]);

    const managers = potentialManagers;

    // Load permissions users when Permissions tab is active
    useEffect(() => {
        if (activeSubTab === 'Permissions' && (isSuperAdmin || user?.permissions?.canViewPermissionsTab)) {
            setPermissionsLoading(true);
            api.get('/admin/org-users').then(res => {
                setPermissionsUsers(res.data.filter(u => !u.isDeleted));
                setPermissionsLoading(false);
            }).catch(() => setPermissionsLoading(false));
        }
    }, [activeSubTab, isSuperAdmin, user?.permissions?.canViewPermissionsTab]);

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
            await api.patch(`/admin/users/${userId}/permissions`, { permissions: { [permission]: !currentValue } });
            setPermissionsUsers(prev => prev.map(u => u._id === userId ? { ...u, permissions: { ...u.permissions, [permission]: !currentValue } } : u));
        } catch (err) {
            console.error('Failed to update permission', err);
        }
    };
    
    const handleSaveMultiPermissions = async () => {
        try {
            await api.patch(`/admin/users/${selectedPermissionsUser._id}/permissions`, { 
                permissions: selectedPermissionsUser.permissions 
            });
            setPermissionsUsers(prev => prev.map(u => u._id === selectedPermissionsUser._id ? selectedPermissionsUser : u));
            setShowPermissionsModal(false);
        } catch (err) {
            console.error('Failed to update permissions', err);
        }
    };
    
    /* ======= GLOBAL PAYROLL WIZARD STATE ======= */
    const [showGlobalPayrollModal, setShowGlobalPayrollModal] = useState(false);
    const [payrollStep, setPayrollStep] = useState(1);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [payrollPreviews, setPayrollPreviews] = useState([]);
    const [selectedPayrollUsers, setSelectedPayrollUsers] = useState([]);
    const [globalPaymentMethod, setGlobalPaymentMethod] = useState('Bank Transfer');
    const [expandedCalculations, setExpandedCalculations] = useState({});
    const [bonusAmounts, setBonusAmounts] = useState({});
    const [payrollStartDate, setPayrollStartDate] = useState('');
    const [payrollEndDate, setPayrollEndDate] = useState('');
    const [showSingleCalcModal, setShowSingleCalcModal] = useState(false);
    const [selectedPayslipForCalc, setSelectedPayslipForCalc] = useState(null);

    // Auto-update dates when month/year changes
    useEffect(() => {
        const cycle = calculatePayrollCycle(payrollMonth, payrollYear, systemSettings.paymentDate || 1);
        setPayrollStartDate(moment(cycle.startDate).format('YYYY-MM-DD'));
        setPayrollEndDate(moment(cycle.endDate).format('YYYY-MM-DD'));
    }, [payrollMonth, payrollYear, systemSettings.paymentDate]);

    const fetchPayrollPreview = async () => {
        setPreviewLoading(true);
        try {
            const res = await api.post('/payslips/preview', {
                month: payrollMonth,
                year: payrollYear,
                paymentDay: systemSettings.paymentDate || 1,
                customStartDate: payrollStartDate,
                customEndDate: payrollEndDate
            });
            setPayrollPreviews(res.data);
            // Default select those who don't have payslips yet
            setSelectedPayrollUsers(res.data.filter(p => !p.hasPayslip).map(p => p.user._id));
            setPayrollStep(2);
        } catch (err) {
            console.error('Failed to fetch payroll preview', err);
            alert('Failed to load payroll data. Please try again.');
        } finally {
            setPreviewLoading(false);
        }
    };

    const handleBulkGenerate = async () => {
        setGeneratingPayslip(true);
        try {
            const selectedData = payrollPreviews.filter(p => selectedPayrollUsers.includes(p.user._id));
            const payslipsToCreate = selectedData.map(p => ({
                user: p.user._id,
                month: payrollMonth,
                year: payrollYear,
                startDate: p.startDate,
                endDate: p.endDate,
                netPay: p.netPay + (bonusAmounts[p.user._id] || 0),
                earnings: {
                    basicSalary: p.stipend,
                    bonus: bonusAmounts[p.user._id] || 0
                },
                paymentMethod: globalPaymentMethod,
                status: 'Paid',
                paidAt: new Date(),
                calculationDetails: {
                    totalDaysInCycle: p.totalDaysInCycle,
                    presentDays: p.presentDays,
                    unpaidLeaveDays: p.leaveCounts.unpaid,
                    halfDayUnpaidDays: p.leaveCounts.halfDay,
                    proRataAdjustment: p.proRataAdjustment,
                    leaveBreakdown: p.leaveCounts
                }
            }));

            await api.post('/payslips/bulk', { payslips: payslipsToCreate });
            setShowGlobalPayrollModal(false);
            window.location.reload();
        } catch (err) {
            console.error('Failed to generate payroll', err);
            alert('Failed to generate payroll. Please check logs.');
        } finally {
            setGeneratingPayslip(false);
        }
    };
    
    /* ======= PAYROLL CALCULATION HELPERS ======= */
    const calculatePayrollCycle = (monthName, year, paymentDay = 1) => {
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        const monthIndex = months.indexOf(monthName);
        
        // End Date: paymentDay - 1 of the selected month
        // Start Date: paymentDay of the previous month
        let endDate = new Date(year, monthIndex, paymentDay - 1, 23, 59, 59);
        let startDate = new Date(year, monthIndex - 1, paymentDay, 0, 0, 0);

        // If paymentDay is 1, cycle is just the full month
        if (paymentDay === 1) {
            startDate = new Date(year, monthIndex, 1, 0, 0, 0);
            endDate = new Date(year, monthIndex + 1, 0, 23, 59, 59);
        }

        const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
        return { startDate, endDate, totalDays };
    };

    const calculateProRataPay = (u, cycle) => {
        const monthlyAmount = u.salaryDetails?.monthlyAmount || 0;
        if (!u.joiningDate) return monthlyAmount;

        const joinDate = new Date(u.joiningDate);
        
        // Joined after this cycle
        if (joinDate > cycle.endDate) return 0;
        
        // Joined before or at the start of this cycle
        if (joinDate <= cycle.startDate) return monthlyAmount;

        // Joined during this cycle - Pro-rata
        const daysInCycle = cycle.totalDays;
        const workedMs = cycle.endDate - joinDate;
        const workedDays = Math.max(0, Math.ceil(workedMs / (1000 * 60 * 60 * 24)));
        
        return Math.round((monthlyAmount / daysInCycle) * workedDays);
    };

    const [generatingPayslip, setGeneratingPayslip] = useState(false);
    const [showGenerateModal, setShowGenerateModal] = useState(false);
    const [selectedUserForPayroll, setSelectedUserForPayroll] = useState(null);
    const [pendingPayrollData, setPendingPayrollData] = useState(null);

    const handleOpenGenerateModal = (u) => {
        const cycle = calculatePayrollCycle(payrollMonth, payrollYear, systemSettings.paymentDate || 1);
        const netPay = calculateProRataPay(u, cycle);
        
        setSelectedUserForPayroll(u);
        setPendingPayrollData({
            netPay,
            cycle,
            month: payrollMonth,
            year: payrollYear
        });
        setShowGenerateModal(true);
    };

    const handleConfirmGenerate = async () => {
        setGeneratingPayslip(true);
        try {
            await api.post('/payslips', {
                user: selectedUserForPayroll._id,
                month: pendingPayrollData.month,
                year: pendingPayrollData.year.toString(),
                netPay: pendingPayrollData.netPay,
                status: 'Unpaid'
            });
            setShowGenerateModal(false);
            window.location.reload(); // Refresh to show the new payslip
        } catch (err) {
            console.error('Failed to generate payslip', err);
            alert('Failed to generate payslip. Please try again.');
        } finally {
            setGeneratingPayslip(false);
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
                    ...(isSuperAdmin || normalizedRole === 'reportingmanager' || user?.permissions?.canViewUsersTab ? [{ key: 'Leave', label: 'USERS' }] : []),
                    ...(isSuperAdmin || normalizedRole === 'reportingmanager' || user?.permissions?.canViewAttendanceTab ? [{ key: 'Attendance', label: 'ATTENDANCE' }] : []),
                    ...(isSuperAdmin || normalizedRole === 'reportingmanager' || user?.permissions?.canViewConfigsTab ? [{ key: 'Configs', label: 'ORG CONFIGS' }] : []),
                    ...(isSuperAdmin || user?.permissions?.canViewSettingsTab ? [{ key: 'Settings', label: 'SYSTEM SETTINGS' }] : []),
                    ...(isSuperAdmin || user?.permissions?.canViewBankTab ? [{ key: 'Bank', label: 'BANK INFO' }] : []),
                    ...(isSuperAdmin || user?.permissions?.canViewPayrollTab ? [{ key: 'Payroll', label: 'PAYROLL' }] : []),
                    ...(isSuperAdmin || user?.permissions?.canViewPermissionsTab ? [{ key: 'Permissions', label: 'PERMISSIONS' }] : []),
                    ...(isSuperAdmin || user?.permissions?.canViewAuditTab ? [{ key: 'Audit', label: 'AUDIT LOGS' }] : [])
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
                    <SectionHeader icon={<Users size={24} />} title="Active Interns" subtitle={`${pagedUsers.length} team members in your organization`}
                        extra={canCreateUsersPermission && (
                            <button onClick={() => setShowCreateUserModal(true)} style={{
                                padding: '0.7rem 1.5rem', borderRadius: '14px', border: 'none', cursor: 'pointer',
                                background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff',
                                fontWeight: '800', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
                                boxShadow: '0 4px 16px rgba(99,102,241,0.35)', transition: 'all 0.2s'
                            }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                                <UserPlus size={16} /> Create Intern
                            </button>
                        )}
                    />

                    <div style={{ overflowX: 'auto', margin: '0 -2rem -2rem', borderBottomLeftRadius: '28px', borderBottomRightRadius: '28px' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                            <thead>
                                <tr>
                                    <th style={{ ...thStyle, paddingLeft: '2rem' }}>INTERN</th>
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
                                                        { icon: Trash2, label: 'Delete Intern', variant: 'danger', action: () => { handleDeleteUser(u._id); setActiveActionMenu(null); } }
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
                                    <th style={{ ...thStyle, paddingLeft: '2rem' }}>INTERN</th>
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

            {/* ===== PERMISSIONS ===== */}
            {activeSubTab === 'Permissions' && (isSuperAdmin || user?.permissions?.canViewPermissionsTab) && (
                <div style={{ ...glass, padding: '2rem' }}>
                    <SectionHeader icon={<Lock size={24} />} title="User Permissions" subtitle="Grant or revoke granular permissions for individual users" />

                    {permissionsLoading ? (
                        <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading users...</div>
                    ) : (
                        <div style={{ overflowX: 'auto', margin: '0 -2rem -2rem', borderBottomLeftRadius: '28px', borderBottomRightRadius: '28px' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
                                <thead>
                                    <tr>
                                        <th style={{ ...thStyle, paddingLeft: '2rem' }}>INTERN</th>
                                        <th style={thStyle}>ROLE</th>
                                        <th style={{ ...thStyle, textAlign: 'center' }}>ACCESS LEVEL</th>
                                        <th style={{ ...thStyle, textAlign: 'center' }}>ACTION</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {permissionsUsers
                                        .filter(u => u.role?.toLowerCase().replace(/\s/g, '') === 'reportingmanager')
                                        .map((u, idx) => {
                                            const accessCount = PERMISSION_KEYS.filter(p => u.permissions?.[p.key]).length;
                                            return (
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
                                                        <span style={{
                                                            background: accessCount > 0 ? 'rgba(16,185,129,0.1)' : 'rgba(148,163,184,0.1)',
                                                            color: accessCount > 0 ? '#10b981' : 'var(--text-muted)',
                                                            padding: '0.4rem 0.8rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '800'
                                                        }}>
                                                            {accessCount} / {PERMISSION_KEYS.length} Granted
                                                        </span>
                                                    </td>
                                                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                                                        <button onClick={() => {
                                                            setSelectedPermissionsUser({ ...u, permissions: u.permissions || {} });
                                                            setShowPermissionsModal(true);
                                                        }} style={{
                                                            padding: '0.5rem 1rem', borderRadius: '10px', border: '1px solid var(--primary)',
                                                            background: 'transparent', color: 'var(--primary)', fontSize: '0.75rem',
                                                            fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s'
                                                        }} onMouseOver={e => { e.currentTarget.style.background = 'var(--primary)'; e.currentTarget.style.color = '#fff'; }}
                                                           onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--primary)'; }}>
                                                            Manage Permissions
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
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
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                                <InputField label="Company Name" isLightMode={isLightMode}>
                                    <FormInput isLightMode={isLightMode} type="text" value={systemSettings.companyName || ''} onChange={e => setSystemSettings({ ...systemSettings, companyName: e.target.value })} />
                                </InputField>
                                <InputField label="Working Hours / Day" isLightMode={isLightMode}>
                                    <FormInput isLightMode={isLightMode} type="number" value={systemSettings.workingHoursPerDay || ''} onChange={e => setSystemSettings({ ...systemSettings, workingHoursPerDay: e.target.value })} />
                                </InputField>
                                <InputField label="Payment Date (1-31)" isLightMode={isLightMode}>
                                    <FormInput isLightMode={isLightMode} type="number" min="1" max="31" value={systemSettings.paymentDate || 1} onChange={e => setSystemSettings({ ...systemSettings, paymentDate: e.target.value })} />
                                </InputField>
                            </div>
                        </div>

                        {/* Leave Quotas */}
                        <div style={{ marginBottom: '2.5rem' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                <Calendar size={18} color="var(--primary)" /> Default Leave Quotas
                            </h3>
                            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>These values are applied to all new interns globally.</p>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem' }}>
                                {[
                                    { label: 'Paid Leave', key: 'paid', icon: ShieldCheck, color: '#f59e0b', grad: 'linear-gradient(135deg,#f59e0b,#fbbf24)' },
                                    { label: 'Sick Leave', key: 'sick', icon: Heart, color: '#ef4444', grad: 'linear-gradient(135deg,#ef4444,#f87171)' },
                                    { label: 'Casual Leave', key: 'casual', icon: Users, color: '#10b981', grad: 'linear-gradient(135deg,#10b981,#34d399)' },
                                    { label: 'Comp Off', key: 'compOff', icon: Clock, color: '#6366f1', grad: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }
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
                    <SectionHeader icon={<Landmark size={24} />} title="Intern Bank Directory" subtitle="Confidential payout information for all interns" />
                    <div style={{ overflowX: 'auto', margin: '0 -2rem -2rem', borderBottomLeftRadius: '28px', borderBottomRightRadius: '28px' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '950px' }}>
                            <thead>
                                <tr>
                                    <th style={{ ...thStyle, paddingLeft: '2rem' }}>INTERN</th>
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
                        subtitle="Review and update payout status for all interns" 
                        extra={
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button
                                    onClick={() => {
                                        setPayrollStep(1);
                                        setShowGlobalPayrollModal(true);
                                    }}
                                    style={{
                                        padding: '0.6rem 1.25rem', borderRadius: '12px',
                                        background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                                        color: '#fff', fontWeight: '800', fontSize: '0.75rem',
                                        border: 'none', cursor: 'pointer',
                                        boxShadow: '0 4px 12px rgba(99,102,241,0.25)',
                                        display: 'flex', alignItems: 'center', gap: '0.5rem'
                                    }}
                                >
                                    <Sparkles size={14} /> Global Generate
                                </button>
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
                                    <th style={{ ...thStyle, paddingLeft: '2rem' }}>INTERN</th>
                                    <th style={thStyle}>NET PAY</th>
                                    <th style={thStyle}>STATUS</th>
                                    <th style={thStyle}>PAID ON</th>
                                    <th style={thStyle}>CALCULATION</th>
                                    <th style={thStyle}>BANK / UPI</th>
                                    <th style={{ ...thStyle, textAlign: 'center', paddingRight: '2rem' }}>ACTION</th>
                                </tr>
                            </thead>
                            <tbody>
                                {allUsers.map((u, idx) => {
                                    const payslip = globalPayslips.find(p => p.user?._id === u._id && p.month === payrollMonth && parseInt(p.year) === payrollYear);
                                    
                                    // Calculate Draft Data if no payslip
                                    const cycle = calculatePayrollCycle(payrollMonth, payrollYear, systemSettings.paymentDate || 1);
                                    const projectedPay = calculateProRataPay(u, cycle);

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
                                                {payslip ? (
                                                    `₹${payslip.netPay.toLocaleString()}`
                                                ) : (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        ₹{projectedPay.toLocaleString()}
                                                        <span style={{ 
                                                            fontSize: '0.6rem', color: '#f59e0b', background: 'rgba(245, 158, 11, 0.1)', 
                                                            padding: '2px 6px', borderRadius: '6px', fontWeight: '900' 
                                                        }}>DRAFT</span>
                                                    </div>
                                                )}
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
                                                ) : <span style={{ opacity: 0.3 }}>N/A</span>}
                                            </td>
                                            <td style={tdStyle}>
                                                {payslip?.paidAt ? new Date(payslip.paidAt).toLocaleDateString() : <span style={{ opacity: 0.3 }}>—</span>}
                                            </td>
                                            <td style={tdStyle}>
                                                {payslip ? (
                                                    <button 
                                                        onClick={() => {
                                                            setSelectedPayslipForCalc(payslip);
                                                            setShowSingleCalcModal(true);
                                                        }}
                                                        style={{
                                                            padding: '0.45rem 0.8rem', borderRadius: '10px', border: rowBorder, cursor: 'pointer',
                                                            background: isLightMode ? '#fff' : 'rgba(255,255,255,0.05)',
                                                            color: 'var(--primary)', fontSize: '0.65rem', fontWeight: '800', transition: 'all 0.2s',
                                                            display: 'flex', alignItems: 'center', gap: '0.4rem'
                                                        }}
                                                    >
                                                        <Eye size={12} /> View Details
                                                    </button>
                                                ) : <span style={{ opacity: 0.3, fontSize: '0.65rem' }}>DRAFT ONLY</span>}
                                            </td>
                                            <td style={tdStyle}>
                                                <div style={{ fontSize: '0.8rem', fontWeight: '600' }}>{u.bankDetails?.bankName || <span style={{ opacity: 0.3 }}>N/A</span>}</div>
                                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{u.bankDetails?.accountNumber || u.bankDetails?.upiId || ''}</div>
                                            </td>
                                            <td style={{ ...tdStyle, textAlign: 'center', paddingRight: '2rem' }}>
                                                {payslip ? (
                                                    <button 
                                                        onClick={() => handleUpdatePayslipStatus(payslip._id, payslip.status === 'Paid' ? 'Unpaid' : 'Paid')}
                                                        style={{
                                                            padding: '0.5rem 0.8rem', borderRadius: '10px', border: 'none', cursor: 'pointer',
                                                            background: payslip.status === 'Paid' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                                                            color: payslip.status === 'Paid' ? '#ef4444' : '#10b981',
                                                            fontSize: '0.7rem', fontWeight: '800', transition: 'all 0.2s'
                                                        }}
                                                        onMouseOver={e => { e.currentTarget.style.background = payslip.status === 'Paid' ? '#ef4444' : '#10b981'; e.currentTarget.style.color = '#fff'; }}
                                                        onMouseOut={e => { e.currentTarget.style.background = payslip.status === 'Paid' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)'; e.currentTarget.style.color = payslip.status === 'Paid' ? '#ef4444' : '#10b981'; }}
                                                    >
                                                        {payslip.status === 'Paid' ? 'Mark Unpaid' : 'Mark Paid'}
                                                    </button>
                                                ) : (
                                                    <button 
                                                        onClick={() => handleOpenGenerateModal(u)}
                                                        disabled={projectedPay <= 0}
                                                        style={{
                                                            padding: '0.5rem 1.2rem', borderRadius: '10px', border: 'none', cursor: projectedPay <= 0 ? 'not-allowed' : 'pointer',
                                                            background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                                                            color: '#fff',
                                                            fontSize: '0.75rem', fontWeight: '800', transition: 'all 0.2s',
                                                            boxShadow: '0 4px 12px rgba(99,102,241,0.2)',
                                                            opacity: projectedPay <= 0 ? 0.5 : 1
                                                        }}
                                                    >
                                                        Generate
                                                    </button>
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

            {/* ===== GENERATE PAYSLIP MODAL ===== */}
            {showGenerateModal && selectedUserForPayroll && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(4px)' }}
                    onClick={(e) => { if (e.target === e.currentTarget) setShowGenerateModal(false); }}>
                    <div style={{
                        background: isLightMode ? '#ffffff' : '#0f172a', borderRadius: '28px', padding: '2rem',
                        width: '90%', maxWidth: '450px',
                        border: `1px solid ${isLightMode ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)'}`,
                        boxShadow: '0 25px 60px rgba(0,0,0,0.4)',
                        animation: 'fadeIn 0.3s ease-out'
                    }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: '900', marginBottom: '1.5rem', color: 'var(--text-main)' }}>Generate Payslip</h2>
                        
                        <div style={{ marginBottom: '1.5rem', padding: '1.25rem', background: isLightMode ? '#f8fafc' : 'rgba(255,255,255,0.03)', borderRadius: '20px', border: rowBorder }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Intern</span>
                                <span style={{ fontWeight: '700' }}>{selectedUserForPayroll.name}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Monthly Base</span>
                                <span style={{ fontWeight: '600' }}>₹{selectedUserForPayroll.salaryDetails?.monthlyAmount?.toLocaleString()}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Cycle Period</span>
                                <span style={{ fontWeight: '600', fontSize: '0.8rem' }}>
                                    {pendingPayrollData.cycle.startDate.toLocaleDateString([], { day: '2-digit', month: 'short' })} - {pendingPayrollData.cycle.endDate.toLocaleDateString([], { day: '2-digit', month: 'short' })}
                                </span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '1rem', borderTop: `1px dashed ${isLightMode ? '#e2e8f0' : 'rgba(255,255,255,0.1)'}` }}>
                                <span style={{ fontWeight: '800', color: 'var(--text-main)' }}>Net Pay</span>
                                <span style={{ fontWeight: '900', color: 'var(--primary)', fontSize: '1.1rem' }}>₹{pendingPayrollData.netPay.toLocaleString()}</span>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button onClick={() => setShowGenerateModal(false)} style={{
                                flex: 1, padding: '0.8rem', borderRadius: '14px', border: rowBorder, background: 'transparent',
                                color: 'var(--text-muted)', fontWeight: '700', cursor: 'pointer'
                            }}>Cancel</button>
                            <button onClick={handleConfirmGenerate} disabled={generatingPayslip} style={{
                                flex: 1, padding: '0.8rem', borderRadius: '14px', border: 'none', 
                                background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', 
                                fontWeight: '800', cursor: generatingPayslip ? 'wait' : 'pointer',
                                boxShadow: '0 4px 12px rgba(99,102,241,0.3)',
                                opacity: generatingPayslip ? 0.7 : 1
                            }}>
                                {generatingPayslip ? 'Generating...' : 'Confirm'}
                            </button>
                        </div>
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
                                <p style={{ margin: '0.3rem 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Provision a new intern account</p>
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

            {/* ===== PERMISSIONS MODAL ===== */}
            {showPermissionsModal && selectedPermissionsUser && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', justifyContent: 'flex-end', alignItems: 'stretch', backdropFilter: 'blur(4px)' }}
                    onClick={(e) => { if (e.target === e.currentTarget) setShowPermissionsModal(false); }}>
                    <div style={{
                        background: isLightMode ? '#ffffff' : '#0f172a', padding: '2.5rem',
                        width: '100%', maxWidth: '450px', height: '100vh', overflowY: 'auto',
                        borderLeft: `1px solid ${isLightMode ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)'}`,
                        borderRadius: '28px 0 0 28px',
                        boxShadow: '-10px 0 40px rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column',
                        animation: 'slideInRightSheet 0.35s cubic-bezier(0.16, 1, 0.3, 1)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <div>
                                <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: '900', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                    <ShieldCheck size={22} color="var(--primary)" /> Manage Permissions
                                </h2>
                                <p style={{ margin: '0.3rem 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Configure access levels for {selectedPermissionsUser.name}</p>
                            </div>
                            <button onClick={() => setShowPermissionsModal(false)} style={{
                                width: '38px', height: '38px', borderRadius: '12px', border: 'none', cursor: 'pointer',
                                background: isLightMode ? '#f1f5f9' : 'rgba(255,255,255,0.06)', color: 'var(--text-muted)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}><X size={18} /></button>
                        </div>
                        
                        <div style={{ 
                            background: isLightMode ? '#f8fafc' : 'rgba(0,0,0,0.15)', borderRadius: '20px', padding: '1.5rem',
                            display: 'flex', flexDirection: 'column', gap: '1rem', border: `1px solid ${isLightMode ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.04)'}`
                        }}>
                            {PERMISSION_KEYS.map((perm) => (
                                <div key={perm.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                                    paddingBottom: '1rem', borderBottom: `1px dashed ${isLightMode ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)'}` 
                                }}>
                                    <div style={{ fontWeight: '600', fontSize: '0.9rem', color: 'var(--text-main)' }}>{perm.label}</div>
                                    <button onClick={() => {
                                        setSelectedPermissionsUser(prev => ({
                                            ...prev,
                                            permissions: { ...prev.permissions, [perm.key]: !prev.permissions?.[perm.key] }
                                        }));
                                    }} style={{
                                        background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.8rem',
                                        color: selectedPermissionsUser.permissions?.[perm.key] ? '#10b981' : (isLightMode ? '#cbd5e1' : 'rgba(255,255,255,0.15)'),
                                        transition: 'all 0.2s', display: 'flex', alignItems: 'center', padding: 0
                                    }}>
                                        {selectedPermissionsUser.permissions?.[perm.key] ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                                    </button>
                                </div>
                            ))}
                        </div>
                        
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
                            <button onClick={handleSaveMultiPermissions} style={{
                                padding: '1rem 2rem', borderRadius: '16px', border: 'none', cursor: 'pointer',
                                background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff',
                                fontWeight: '800', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
                                boxShadow: '0 6px 20px rgba(99,102,241,0.35)', transition: 'all 0.2s'
                            }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                                Save Permissions
                            </button>
                        </div>
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
                @keyframes slideInRightSheet {
                    from { transform: translateX(100%); opacity: 0.8; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `}</style>
            {/* ===== GLOBAL PAYROLL WIZARD MODAL ===== */}
            {showGlobalPayrollModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(10px)' }}
                    onClick={(e) => { if (e.target === e.currentTarget) setShowGlobalPayrollModal(false); }}>
                    <div style={{
                        background: isLightMode ? '#ffffff' : '#0f172a', borderRadius: '32px',
                        width: '95%', maxWidth: '900px', maxHeight: '90vh', overflow: 'hidden',
                        display: 'flex', flexDirection: 'column',
                        border: `1px solid ${isLightMode ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)'}`,
                        boxShadow: '0 25px 80px rgba(0,0,0,0.5)',
                        animation: 'fadeInUp 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}>
                        {/* Header */}
                        <div style={{ padding: '2rem 2.5rem', borderBottom: rowBorder, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '900', color: 'var(--text-main)' }}>Global Payroll Generation</h2>
                                <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Step {payrollStep} of 4: {['Select Period', 'Select Interns', 'Review Calculations', 'Finalize'][payrollStep-1]}</p>
                            </div>
                            <button onClick={() => setShowGlobalPayrollModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={24} /></button>
                        </div>

                        {/* Content */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '2.5rem' }}>
                            {/* Step 1: Period Selection */}
                            {payrollStep === 1 && (
                                <div style={{ textAlign: 'center', maxWidth: '400px', margin: '0 auto' }}>
                                    <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', margin: '0 auto 2rem' }}>
                                        <Calendar size={40} />
                                    </div>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '1rem' }}>Select Payout Period</h3>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2.5rem' }}>The pay cycle dates will be automatically calculated based on your global settings.</p>
                                    
                                    <div style={{ display: 'grid', gap: '1.25rem', marginBottom: '2rem' }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                            <InputField label="Month" isLightMode={isLightMode}>
                                                <select value={payrollMonth} onChange={e => setPayrollMonth(e.target.value)} style={{ width: '100%', padding: '0.8rem', borderRadius: '14px', background: isLightMode ? '#f8fafc' : 'rgba(0,0,0,0.2)', border: rowBorder, color: 'var(--text-main)', fontSize: '0.9rem', fontWeight: '700' }}>
                                                    {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                                                        <option key={m} value={m}>{m}</option>
                                                    ))}
                                                </select>
                                            </InputField>
                                            <InputField label="Year" isLightMode={isLightMode}>
                                                <select value={payrollYear} onChange={e => setPayrollYear(parseInt(e.target.value))} style={{ width: '100%', padding: '0.8rem', borderRadius: '14px', background: isLightMode ? '#f8fafc' : 'rgba(0,0,0,0.2)', border: rowBorder, color: 'var(--text-main)', fontSize: '0.9rem', fontWeight: '700' }}>
                                                    {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                                                </select>
                                            </InputField>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                            <InputField label="Cycle Start" isLightMode={isLightMode}>
                                                <input type="date" value={payrollStartDate} onChange={e => setPayrollStartDate(e.target.value)} style={{ width: '100%', padding: '0.8rem', borderRadius: '14px', background: isLightMode ? '#f8fafc' : 'rgba(0,0,0,0.2)', border: rowBorder, color: 'var(--text-main)', fontSize: '0.9rem', fontWeight: '600' }} />
                                            </InputField>
                                            <InputField label="Cycle End" isLightMode={isLightMode}>
                                                <input type="date" value={payrollEndDate} onChange={e => setPayrollEndDate(e.target.value)} style={{ width: '100%', padding: '0.8rem', borderRadius: '14px', background: isLightMode ? '#f8fafc' : 'rgba(0,0,0,0.2)', border: rowBorder, color: 'var(--text-main)', fontSize: '0.9rem', fontWeight: '600' }} />
                                            </InputField>
                                        </div>
                                    </div>

                                    {globalPayslips.some(ps => ps.month === payrollMonth && ps.year === payrollYear) && (
                                        <div style={{ 
                                            padding: '1.5rem', borderRadius: '24px', background: 'rgba(239, 68, 68, 0.05)', 
                                            border: '1.5px solid rgba(239, 68, 68, 0.12)', color: '#ef4444',
                                            fontSize: '0.9rem', fontWeight: '700', marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '1rem',
                                            animation: 'shake 0.5s ease-in-out'
                                        }}>
                                            <Lock size={20} />
                                            <div>
                                                <div style={{ fontWeight: '900', marginBottom: '2px' }}>PAYSIPS ALREADY EXIST</div>
                                                <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>Generating new payslips for {payrollMonth} {payrollYear} will create duplicate records for interns already marked as paid.</div>
                                            </div>
                                        </div>
                                    )}

                                    <button onClick={fetchPayrollPreview} disabled={previewLoading} style={{
                                        width: '100%', padding: '1.1rem', borderRadius: '18px', border: 'none',
                                        background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff',
                                        fontSize: '1rem', fontWeight: '800', cursor: previewLoading ? 'wait' : 'pointer',
                                        boxShadow: '0 8px 30px rgba(99,102,241,0.3)', transition: 'all 0.3s'
                                    }}>
                                        {previewLoading ? 'Crunching Numbers...' : 'Continue to Interm Selection'}
                                    </button>
                                </div>
                            )}

                            {/* Step 2: User Selection */}
                            {payrollStep === 2 && (
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                        <h3 style={{ fontSize: '1.2rem', fontWeight: '800', margin: 0 }}>Select Interns to Pay</h3>
                                        <button onClick={() => setSelectedPayrollUsers(selectedPayrollUsers.length === payrollPreviews.length ? [] : payrollPreviews.map(p => p.user._id))} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer' }}>
                                            {selectedPayrollUsers.length === payrollPreviews.length ? 'Deselect All' : 'Select All'}
                                        </button>
                                    </div>
                                    
                                    <div style={{ display: 'grid', gap: '1rem' }}>
                                        {payrollPreviews.map(p => (
                                            <div key={p.user._id} onClick={() => {
                                                if (selectedPayrollUsers.includes(p.user._id)) {
                                                    setSelectedPayrollUsers(selectedPayrollUsers.filter(id => id !== p.user._id));
                                                } else {
                                                    setSelectedPayrollUsers([...selectedPayrollUsers, p.user._id]);
                                                }
                                            }} style={{
                                                padding: '1.25rem', borderRadius: '22px', border: `2px solid ${selectedPayrollUsers.includes(p.user._id) ? 'var(--primary)' : (isLightMode ? '#f1f5f9' : 'rgba(255,255,255,0.04)')}`,
                                                background: selectedPayrollUsers.includes(p.user._id) ? (isLightMode ? 'rgba(99,102,241,0.05)' : 'rgba(99,102,241,0.1)') : 'transparent',
                                                display: 'flex', alignItems: 'center', gap: '1.25rem', cursor: 'pointer', transition: 'all 0.2s'
                                            }}>
                                                <div style={{ width: '24px', height: '24px', borderRadius: '8px', border: `2px solid ${selectedPayrollUsers.includes(p.user._id) ? 'var(--primary)' : 'var(--text-muted)'}`, background: selectedPayrollUsers.includes(p.user._id) ? 'var(--primary)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                                                    {selectedPayrollUsers.includes(p.user._id) && <CheckCircle2 size={16} />}
                                                </div>
                                                <AdminAvatar name={p.user.name} idx={0} gradientColors={gradientColors} />
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>{p.user.name}</div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.user.designation}</div>
                                                </div>
                                                {p.hasPayslip && <span style={{ fontSize: '0.65rem', padding: '4px 8px', borderRadius: '6px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', fontWeight: '900' }}>PAYSIP EXISTS</span>}
                                            </div>
                                        ))}
                                    </div>
                                    
                                    <div style={{ marginTop: '3rem', display: 'flex', gap: '1rem' }}>
                                        <button onClick={() => setPayrollStep(1)} style={{ flex: 1, padding: '1rem', borderRadius: '18px', border: rowBorder, background: 'transparent', color: 'var(--text-muted)', fontWeight: '800' }}>Back</button>
                                        <button onClick={() => setPayrollStep(3)} disabled={selectedPayrollUsers.length === 0} style={{ flex: 2, padding: '1rem', borderRadius: '18px', border: 'none', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', fontWeight: '800', cursor: 'pointer', opacity: selectedPayrollUsers.length === 0 ? 0.5 : 1 }}>Preview Calculations ({selectedPayrollUsers.length})</button>
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Calculation Review */}
                            {payrollStep === 3 && (
                                <div>
                                    <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '2rem' }}>Review & Adjust Calculations</h3>
                                    <div style={{ display: 'grid', gap: '1.5rem' }}>
                                        {payrollPreviews.filter(p => selectedPayrollUsers.includes(p.user._id)).map(p => (
                                            <div key={p.user._id} style={{ ...glass, background: isLightMode ? '#fff' : 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '24px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                        <AdminAvatar name={p.user.name} idx={1} gradientColors={gradientColors} />
                                                        <div>
                                                            <div style={{ fontWeight: '800', fontSize: '1rem' }}>{p.user.name}</div>
                                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Net Pay: <span style={{ color: 'var(--primary)', fontWeight: '900' }}>₹{(p.netPay + (bonusAmounts[p.user._id] || 0)).toLocaleString()}</span></div>
                                                        </div>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.4rem' }}>
                                                            <label style={{ fontSize: '0.65rem', fontWeight: '900', color: 'var(--text-muted)' }}>SET BONUS</label>
                                                            <div style={{ position: 'relative', width: '100px' }}>
                                                                <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', fontWeight: '800', color: 'var(--text-muted)' }}>₹</span>
                                                                <input type="number" 
                                                                    value={bonusAmounts[p.user._id] || ''} 
                                                                    onChange={e => setBonusAmounts({...bonusAmounts, [p.user._id]: parseInt(e.target.value) || 0})}
                                                                    placeholder="0"
                                                                    style={{ width: '100%', padding: '0.4rem 0.6rem 0.4rem 1.6rem', borderRadius: '10px', border: rowBorder, background: isLightMode ? '#f8fafc' : 'rgba(0,0,0,0.1)', color: 'var(--text-main)', fontWeight: '800', fontSize: '0.85rem', outline: 'none' }} 
                                                                />
                                                            </div>
                                                        </div>
                                                        <button 
                                                            onClick={() => setExpandedCalculations({...expandedCalculations, [p.user._id]: !expandedCalculations[p.user._id]})}
                                                            style={{ padding: '0.6rem 1rem', borderRadius: '12px', border: `1.5px solid ${expandedCalculations[p.user._id] ? 'var(--primary)' : 'rgba(0,0,0,0.08)'}`, background: 'transparent', color: expandedCalculations[p.user._id] ? 'var(--primary)' : 'var(--text-muted)', fontSize: '0.7rem', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                                                        >
                                                            {expandedCalculations[p.user._id] ? 'Hide Calculation' : 'Show Calculation'} 
                                                            <ChevronDown size={14} style={{ transform: expandedCalculations[p.user._id] ? 'rotate(180deg)' : 'none', transition: '0.3s' }} />
                                                        </button>
                                                    </div>
                                                </div>

                                                {expandedCalculations[p.user._id] && (
                                                    <div style={{ marginTop: '1.5rem', padding: '1.5rem', borderRadius: '20px', background: isLightMode ? '#f8fafc' : 'rgba(255,255,255,0.03)', border: `1px dashed ${isLightMode ? '#e2e8f0' : 'rgba(255,255,255,0.1)'}`, animation: 'slideDown 0.3s ease-out' }}>
                                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '1.5rem' }}>
                                                            <div>
                                                                <div style={{ fontSize: '0.65rem', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>CYCLE START</div>
                                                                <div style={{ fontWeight: '700', fontSize: '0.85rem' }}>{new Date(p.startDate).toLocaleDateString([], { day: '2-digit', month: 'short' })}</div>
                                                            </div>
                                                            <div>
                                                                <div style={{ fontSize: '0.65rem', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>CYCLE END</div>
                                                                <div style={{ fontWeight: '700', fontSize: '0.85rem' }}>{new Date(p.endDate).toLocaleDateString([], { day: '2-digit', month: 'short' })}</div>
                                                            </div>
                                                            <div>
                                                                <div style={{ fontSize: '0.65rem', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>PRESENT DAYS</div>
                                                                <div style={{ fontWeight: '900', fontSize: '0.85rem', color: '#10b981' }}>{p.presentDays}</div>
                                                            </div>
                                                            <div>
                                                                <div style={{ fontSize: '0.65rem', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>STIPEND BASE</div>
                                                                <div style={{ fontWeight: '900', fontSize: '0.85rem' }}>₹{p.stipend.toLocaleString()}</div>
                                                            </div>
                                                        </div>
                                                        <div style={{ height: '1px', background: isLightMode ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)', margin: '1rem 0' }}></div>
                                                        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                                                            {Object.entries(p.leaveCounts).map(([type, count]) => (
                                                                <div key={type} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: type === 'unpaid' || type === 'halfDay' ? '#ef4444' : '#6366f1' }}></div>
                                                                    <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'capitalize' }}>{type}: {count}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <div style={{ marginTop: '1.25rem', padding: '1rem', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.05)', color: '#ef4444', fontSize: '0.8rem', fontWeight: '800', display: 'flex', justifyContent: 'space-between' }}>
                                                            <span>Leave Deductions (Unpaid + HalfDays)</span>
                                                            <span>- ₹{p.unpaidDeduction.toLocaleString()}</span>
                                                        </div>
                                                        {p.proRataAdjustment > 0 && (
                                                            <div style={{ marginTop: '0.5rem', padding: '1rem', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.05)', color: '#f59e0b', fontSize: '0.8rem', fontWeight: '800', display: 'flex', justifyContent: 'space-between' }}>
                                                                <span>Joining Date Pro-rata Adjustment</span>
                                                                <span>- ₹{p.proRataAdjustment.toLocaleString()}</span>
                                                            </div>
                                                        )}
                                                        {bonusAmounts[p.user._id] > 0 && (
                                                            <div style={{ marginTop: '0.5rem', padding: '1rem', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.05)', color: '#10b981', fontSize: '0.8rem', fontWeight: '800', display: 'flex', justifyContent: 'space-between' }}>
                                                                <span>Performance Bonus</span>
                                                                <span>+ ₹{bonusAmounts[p.user._id].toLocaleString()}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    <div style={{ marginTop: '3rem', display: 'flex', gap: '1rem' }}>
                                        <button onClick={() => setPayrollStep(2)} style={{ flex: 1, padding: '1rem', borderRadius: '18px', border: rowBorder, background: 'transparent', color: 'var(--text-muted)', fontWeight: '800' }}>Back</button>
                                        <button onClick={() => setPayrollStep(4)} style={{ flex: 2, padding: '1rem', borderRadius: '18px', border: 'none', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', fontWeight: '800' }}>Finalize Payout Mode</button>
                                    </div>
                                </div>
                            )}

                            {/* Step 4: Finalize */}
                            {payrollStep === 4 && (
                                <div style={{ textAlign: 'center', maxWidth: '450px', margin: '0 auto' }}>
                                    <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981', margin: '0 auto 2rem' }}>
                                        <Landmark size={40} />
                                    </div>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '1rem' }}>Processing Payment</h3>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2.5rem' }}>Select the medium through which you have initiated these payments.</p>
                                    
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '3rem' }}>
                                        <button onClick={() => setGlobalPaymentMethod('Bank Transfer')} style={{ padding: '1.5rem', borderRadius: '24px', border: `2px solid ${globalPaymentMethod === 'Bank Transfer' ? 'var(--primary)' : (isLightMode ? '#f1f5f9' : 'rgba(255,255,255,0.04)')}`, background: globalPaymentMethod === 'Bank Transfer' ? 'rgba(99,102,241,0.05)' : 'transparent', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', transition: '0.2s' }}>
                                            <Landmark size={24} color={globalPaymentMethod === 'Bank Transfer' ? 'var(--primary)' : 'var(--text-muted)'} />
                                            <span style={{ fontWeight: '800', fontSize: '0.9rem', color: globalPaymentMethod === 'Bank Transfer' ? 'var(--primary)' : 'var(--text-main)' }}>Bank Transfer</span>
                                        </button>
                                        <button onClick={() => setGlobalPaymentMethod('UPI')} style={{ padding: '1.5rem', borderRadius: '24px', border: `2px solid ${globalPaymentMethod === 'UPI' ? 'var(--primary)' : (isLightMode ? '#f1f5f9' : 'rgba(255,255,255,0.04)')}`, background: globalPaymentMethod === 'UPI' ? 'rgba(99,102,241,0.05)' : 'transparent', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', transition: '0.2s' }}>
                                            <Sparkles size={24} color={globalPaymentMethod === 'UPI' ? 'var(--primary)' : 'var(--text-muted)'} />
                                            <span style={{ fontWeight: '800', fontSize: '0.9rem', color: globalPaymentMethod === 'UPI' ? 'var(--primary)' : 'var(--text-main)' }}>UPI Payout</span>
                                        </button>
                                    </div>

                                    <div style={{ padding: '1.5rem', borderRadius: '24px', background: isLightMode ? '#f1f5f9' : 'rgba(0,0,0,0.2)', marginBottom: '3rem', border: '1px solid rgba(0,0,0,0.05)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                                            <span style={{ fontWeight: '700', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Total Interns</span>
                                            <span style={{ fontWeight: '900' }}>{selectedPayrollUsers.length}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.8rem', borderTop: `1px solid ${isLightMode ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)'}` }}>
                                            <span style={{ fontWeight: '800' }}>Total Payout Amount</span>
                                            <span style={{ fontWeight: '900', color: '#10b981', fontSize: '1.1rem' }}>
                                                ₹{payrollPreviews.filter(p => selectedPayrollUsers.includes(p.user._id)).reduce((acc, curr) => acc + curr.netPay + (bonusAmounts[curr.user._id] || 0), 0).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>

                                    <button onClick={handleBulkGenerate} disabled={generatingPayslip} style={{
                                        width: '100%', padding: '1.1rem', borderRadius: '18px', border: 'none',
                                        background: 'linear-gradient(135deg,#10b981,#34d399)', color: '#fff',
                                        fontSize: '1rem', fontWeight: '900', cursor: generatingPayslip ? 'wait' : 'pointer',
                                        boxShadow: '0 8px 30px rgba(16,185,129,0.35)', transition: 'all 0.3s'
                                    }}>
                                        {generatingPayslip ? 'Processing Bulk Payout...' : 'Finalize & Mark as Paid'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
            {/* ===== SINGLE CALCULATION DETAIL MODAL (Read Only) ===== */}
            {showSingleCalcModal && selectedPayslipForCalc && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(8px)' }}
                    onClick={(e) => { if (e.target === e.currentTarget) setShowSingleCalcModal(false); }}>
                    <div style={{
                        background: isLightMode ? '#ffffff' : '#0f172a', borderRadius: '32px',
                        width: '95%', maxWidth: '600px', padding: '2.5rem',
                        border: `1px solid ${isLightMode ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)'}`,
                        boxShadow: '0 25px 80px rgba(0,0,0,0.5)',
                        animation: 'fadeInUp 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <AdminAvatar name={selectedPayslipForCalc.user?.name} idx={0} gradientColors={gradientColors} />
                                <div>
                                    <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '900', color: 'var(--text-main)' }}>Payout Breakdown</h2>
                                    <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{selectedPayslipForCalc.month} {selectedPayslipForCalc.year} • {selectedPayslipForCalc.status}</p>
                                </div>
                            </div>
                            <button onClick={() => setShowSingleCalcModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={24} /></button>
                        </div>

                        <div style={{ display: 'grid', gap: '2rem' }}>
                            {/* Summary Cards */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                                <div style={{ padding: '1rem', borderRadius: '18px', background: isLightMode ? '#f8fafc' : 'rgba(255,255,255,0.03)', border: rowBorder }}>
                                    <div style={{ fontSize: '0.65rem', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Cycle Days</div>
                                    <div style={{ fontWeight: '800', fontSize: '1rem' }}>{selectedPayslipForCalc.calculationDetails?.totalDaysInCycle || 30}</div>
                                </div>
                                <div style={{ padding: '1rem', borderRadius: '18px', background: isLightMode ? '#f8fafc' : 'rgba(255,255,255,0.03)', border: rowBorder }}>
                                    <div style={{ fontSize: '0.65rem', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Present</div>
                                    <div style={{ fontWeight: '800', fontSize: '1rem', color: '#10b981' }}>{selectedPayslipForCalc.calculationDetails?.presentDays || 0}</div>
                                </div>
                                <div style={{ padding: '1rem', borderRadius: '18px', background: isLightMode ? '#f8fafc' : 'rgba(255,255,255,0.03)', border: rowBorder }}>
                                    <div style={{ fontSize: '0.65rem', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Unpaid Lvs</div>
                                    <div style={{ fontWeight: '800', fontSize: '1rem', color: '#ef4444' }}>{selectedPayslipForCalc.calculationDetails?.unpaidLeaveDays || 0}</div>
                                </div>
                            </div>

                            {/* Details List */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderRadius: '16px', background: isLightMode ? '#fff' : 'rgba(0,0,0,0.2)', border: rowBorder }}>
                                    <span style={{ fontWeight: '700', color: 'var(--text-muted)' }}>Basic Stipend</span>
                                    <span style={{ fontWeight: '800' }}>₹{selectedPayslipForCalc.earnings?.basicSalary?.toLocaleString()}</span>
                                </div>
                                {selectedPayslipForCalc.earnings?.bonus > 0 && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderRadius: '16px', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                                        <span style={{ fontWeight: '700' }}>Performance Bonus</span>
                                        <span style={{ fontWeight: '900' }}>+ ₹{selectedPayslipForCalc.earnings.bonus.toLocaleString()}</span>
                                    </div>
                                )}
                                {selectedPayslipForCalc.calculationDetails?.proRataAdjustment > 0 && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderRadius: '16px', background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
                                        <span style={{ fontWeight: '700' }}>Pro-rata Adjust (Joining Date)</span>
                                        <span style={{ fontWeight: '900' }}>- ₹{selectedPayslipForCalc.calculationDetails.proRataAdjustment.toLocaleString()}</span>
                                    </div>
                                )}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderRadius: '16px', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
                                    <span style={{ fontWeight: '700' }}>Leave Deductions</span>
                                    <span style={{ fontWeight: '900' }}>- ₹{(selectedPayslipForCalc.calculationDetails?.unpaidDeduction || 0).toLocaleString()}</span>
                                </div>
                            </div>

                            {/* Net Total */}
                            <div style={{ 
                                marginTop: '1rem', padding: '1.5rem', borderRadius: '24px', 
                                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', 
                                color: '#fff', textAlign: 'center', boxShadow: '0 8px 30px rgba(99,102,241,0.3)' 
                            }}>
                                <div style={{ fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', opacity: 0.8, marginBottom: '0.5rem', letterSpacing: '1px' }}>Net Paid Amount</div>
                                <div style={{ fontSize: '2.5rem', fontWeight: '900' }}>₹{selectedPayslipForCalc.netPay?.toLocaleString()}</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminTab;
