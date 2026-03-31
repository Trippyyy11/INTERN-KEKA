import { useState, useEffect, useCallback } from 'react';
import { Calendar, Download, ChevronLeft, ChevronRight, Edit3, Check, X, Users } from 'lucide-react';
import api from '../../api/axios';

const statusConfig = {
    'Available': { color: '#22c55e', bg: '#22c55e18', label: 'Available', emoji: '✓' },
    'Unavailable': { color: '#ef4444', bg: '#ef444418', label: 'Unavailable', emoji: '✗' },
    'WFH': { color: '#3b82f6', bg: '#3b82f618', label: 'WFH', emoji: '🏠' },
    'Half-Day': { color: '#f59e0b', bg: '#f59e0b18', label: 'Half-Day', emoji: '½' },
};

const FutureAvailabilityTab = ({ user, isLightMode }) => {
    const [availability, setAvailability] = useState([]);
    const [users, setUsers] = useState([]);
    const [dates, setDates] = useState([]);
    const [loading, setLoading] = useState(false);
    const [startDate, setStartDate] = useState(null);
    const [editingCell, setEditingCell] = useState(null); // { userId, date }
    const [departmentFilter, setDepartmentFilter] = useState('');
    const [departments, setDepartments] = useState([]);

    const computeDates = (baseDate) => {
        const d = [];
        const start = new Date(baseDate || new Date());
        start.setHours(0, 0, 0, 0);
        for (let i = 0; i < 5; i++) {
            const dt = new Date(start);
            dt.setDate(start.getDate() + i);
            d.push(dt);
        }
        return d;
    };

    useEffect(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        setStartDate(today);
        setDates(computeDates(today));
    }, []);

    const fetchAvailability = useCallback(async () => {
        if (!dates.length) return;
        setLoading(true);
        try {
            const params = {
                startDate: dates[0].toISOString(),
                endDate: dates[dates.length - 1].toISOString(),
            };
            if (departmentFilter) params.department = departmentFilter;

            const res = await api.get('/availability', { params });
            setAvailability(res.data.availability);
            setUsers(res.data.users);

            // Extract unique departments
            const depts = [...new Set(res.data.users.map(u => u.department).filter(Boolean))];
            setDepartments(depts);
        } catch (err) {
            console.error('Failed to fetch availability:', err);
        }
        setLoading(false);
    }, [dates, departmentFilter]);

    useEffect(() => {
        fetchAvailability();
    }, [fetchAvailability]);

    const getStatus = (userId, date) => {
        const dateStr = new Date(date).toISOString().split('T')[0];
        const entry = availability.find(a =>
            (a.user?._id || a.user) === userId &&
            new Date(a.date).toISOString().split('T')[0] === dateStr
        );
        return entry?.status || null;
    };

    const getNote = (userId, date) => {
        const dateStr = new Date(date).toISOString().split('T')[0];
        const entry = availability.find(a =>
            (a.user?._id || a.user) === userId &&
            new Date(a.date).toISOString().split('T')[0] === dateStr
        );
        return entry?.note || '';
    };

    const canEdit = (targetUserId) => {
        return targetUserId === user?._id; // STRICT: Everyone can only edit their own
    };

    const handleStatusChange = async (userId, date, newStatus) => {
        try {
            await api.put('/availability', {
                entries: [{
                    userId,
                    date: date.toISOString(),
                    status: newStatus,
                    note: ''
                }]
            });
            setEditingCell(null);
            fetchAvailability();
        } catch (err) {
            console.error('Failed to update availability:', err);
        }
    };

    const handleExport = async () => {
        try {
            const params = {
                startDate: dates[0].toISOString(),
                endDate: dates[dates.length - 1].toISOString(),
            };
            if (departmentFilter) params.department = departmentFilter;

            const res = await api.get('/availability/export', {
                params,
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `availability_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Export failed:', err);
        }
    };

    const shiftDates = (direction) => {
        const newStart = new Date(startDate);
        newStart.setDate(newStart.getDate() + (direction * 5));
        setStartDate(newStart);
        setDates(computeDates(newStart));
    };

    const panelStyle = {
        background: isLightMode ? 'rgba(255,255,255,0.85)' : 'rgba(15,23,42,0.6)',
        border: `1px solid ${isLightMode ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)'}`,
        borderRadius: '20px',
        backdropFilter: 'blur(12px)',
    };

    const inputStyle = {
        background: isLightMode ? '#f8fafc' : 'rgba(255,255,255,0.06)',
        border: `1px solid ${isLightMode ? '#e2e8f0' : 'rgba(255,255,255,0.1)'}`,
        borderRadius: '12px',
        padding: '0.6rem 1rem',
        color: 'var(--text-main)',
        fontSize: '0.85rem',
        outline: 'none',
    };

    const isToday = (date) => {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    };

    const formatDay = (date) => {
        return date.toLocaleDateString('en-US', { weekday: 'short' });
    };

    const formatDate = (date) => {
        return date.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
    };

    return (
        <div className="page-content" style={{ padding: '1.5rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                    <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-0.5px' }}>
                        <Calendar size={22} style={{ verticalAlign: 'middle', marginRight: '0.5rem', color: 'var(--primary)' }} />
                        Future Availability
                    </h2>
                    <p style={{ margin: '0.25rem 0 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        {users.length} team member{users.length !== 1 ? 's' : ''} • 5 day view
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    {(user?.role?.toLowerCase().replace(/\s/g, '') === 'superadmin' || user?.role?.toLowerCase().replace(/\s/g, '') === 'reportingmanager') && departments.length > 0 && (
                        <select
                            value={departmentFilter}
                            onChange={e => setDepartmentFilter(e.target.value)}
                            style={inputStyle}
                        >
                            <option value="">All Departments</option>
                            {departments.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    )}
                    <button
                        onClick={handleExport}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            padding: '0.7rem 1.5rem', borderRadius: '14px', border: 'none', cursor: 'pointer',
                            background: 'linear-gradient(135deg,#22c55e,#16a34a)',
                            color: '#fff', fontWeight: '700', fontSize: '0.85rem',
                            boxShadow: '0 4px 15px rgba(34,197,94,0.3)',
                            transition: 'all 0.2s'
                        }}
                    >
                        <Download size={16} /> Export CSV
                    </button>
                </div>
            </div>

            {/* Date Navigation */}
            <div style={{ ...panelStyle, padding: '1rem 1.5rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                    onClick={() => shiftDates(-1)}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '0.25rem',
                        padding: '0.5rem 1rem', borderRadius: '10px', border: 'none', cursor: 'pointer',
                        background: isLightMode ? '#f1f5f9' : 'rgba(255,255,255,0.06)',
                        color: 'var(--text-main)', fontSize: '0.8rem', fontWeight: '600'
                    }}
                >
                    <ChevronLeft size={16} /> Previous 5 Days
                </button>
                <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                    {dates.map(date => (
                        <div key={date.toISOString()} style={{ textAlign: 'center' }}>
                            <div style={{
                                fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase',
                                letterSpacing: '0.5px', color: isToday(date) ? 'var(--primary)' : 'var(--text-muted)',
                                marginBottom: '0.25rem'
                            }}>
                                {formatDay(date)}
                            </div>
                            <div style={{
                                fontSize: '0.95rem', fontWeight: '800',
                                padding: isToday(date) ? '0.2rem 0.75rem' : '0',
                                background: isToday(date) ? 'var(--primary)' : 'transparent',
                                color: isToday(date) ? '#fff' : 'var(--text-main)',
                                borderRadius: '8px'
                            }}>
                                {formatDate(date)}
                            </div>
                        </div>
                    ))}
                </div>
                <button
                    onClick={() => shiftDates(1)}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '0.25rem',
                        padding: '0.5rem 1rem', borderRadius: '10px', border: 'none', cursor: 'pointer',
                        background: isLightMode ? '#f1f5f9' : 'rgba(255,255,255,0.06)',
                        color: 'var(--text-main)', fontSize: '0.8rem', fontWeight: '600'
                    }}
                >
                    Next 5 Days <ChevronRight size={16} />
                </button>
            </div>

            {/* Availability Grid */}
            <div style={{ ...panelStyle, overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
                ) : users.length === 0 ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        <Users size={40} style={{ opacity: 0.3, marginBottom: '0.75rem' }} /><br />
                        No team members found
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: `1px solid ${isLightMode ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)'}` }}>
                                    <th style={{
                                        padding: '1rem 1.25rem', textAlign: 'left',
                                        fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase',
                                        letterSpacing: '0.5px', color: 'var(--text-muted)',
                                        position: 'sticky', left: 0, zIndex: 2,
                                        background: isLightMode ? 'rgba(255,255,255,0.95)' : 'rgba(15,23,42,0.95)',
                                        minWidth: '180px'
                                    }}>Employee</th>
                                    {dates.map(date => (
                                        <th key={date.toISOString()} style={{
                                            padding: '1rem 0.75rem', textAlign: 'center',
                                            fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase',
                                            letterSpacing: '0.5px',
                                            color: isToday(date) ? 'var(--primary)' : 'var(--text-muted)',
                                            minWidth: '120px'
                                        }}>
                                            {formatDay(date)} {formatDate(date)}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u._id}
                                        style={{
                                            borderBottom: `1px solid ${isLightMode ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.03)'}`,
                                        }}
                                    >
                                        <td style={{
                                            padding: '0.85rem 1.25rem',
                                            position: 'sticky', left: 0, zIndex: 1,
                                            background: isLightMode ? 'rgba(255,255,255,0.95)' : 'rgba(15,23,42,0.95)',
                                        }}>
                                            <div style={{ fontWeight: '600', fontSize: '0.85rem', color: 'var(--text-main)' }}>{u.name}</div>
                                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{u.department} • {u.designation}</div>
                                        </td>
                                        {dates.map(date => {
                                            const status = getStatus(u._id, date);
                                            const cellKey = `${u._id}-${date.toISOString().split('T')[0]}`;
                                            const isEditing = editingCell?.userId === u._id && editingCell?.date?.toISOString().split('T')[0] === date.toISOString().split('T')[0];
                                            const editable = canEdit(u._id);

                                            return (
                                                <td key={date.toISOString()} style={{ padding: '0.85rem 0.75rem', textAlign: 'center', position: 'relative' }}>
                                                    {isEditing ? (
                                                        <div style={{ 
                                                            position: 'absolute', 
                                                            top: '50%', 
                                                            left: '50%', 
                                                            transform: 'translate(-50%, -50%)',
                                                            zIndex: 10,
                                                            background: isLightMode ? '#ffffff' : '#1e293b',
                                                            border: `1px solid ${isLightMode ? '#e2e8f0' : 'rgba(255,255,255,0.1)'}`,
                                                            borderRadius: '14px',
                                                            padding: '0.5rem',
                                                            display: 'flex',
                                                            gap: '0.5rem',
                                                            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                                                            width: 'max-content'
                                                        }}>
                                                            {Object.entries(statusConfig).map(([key, cfg]) => (
                                                                <button
                                                                    key={key}
                                                                    onClick={() => handleStatusChange(u._id, date, key)}
                                                                    style={{
                                                                        padding: '0.5rem 0.75rem', borderRadius: '10px',
                                                                        border: status === key ? `2px solid ${cfg.color}` : `1px solid transparent`,
                                                                        background: cfg.bg, color: cfg.color,
                                                                        fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer',
                                                                        transition: 'all 0.2s',
                                                                        whiteSpace: 'nowrap'
                                                                    }}
                                                                >
                                                                    {cfg.emoji} {cfg.label}
                                                                </button>
                                                            ))}
                                                            <button
                                                                onClick={() => setEditingCell(null)}
                                                                style={{
                                                                    padding: '0.5rem 0.75rem', borderRadius: '10px',
                                                                    border: 'none', background: 'rgba(244, 63, 94, 0.1)', color: '#f43f5e',
                                                                    fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer'
                                                                }}
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div
                                                            onClick={(e) => {
                                                                if (editable) {
                                                                    setEditingCell({ userId: u._id, date });
                                                                }
                                                            }}
                                                            style={{
                                                                display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                                                                padding: '0.45rem 0.9rem', borderRadius: '10px',
                                                                background: status ? statusConfig[status]?.bg : (isLightMode ? '#f8fafc' : 'rgba(255,255,255,0.04)'),
                                                                color: status ? statusConfig[status]?.color : 'var(--text-muted)',
                                                                fontSize: '0.8rem', fontWeight: '700',
                                                                cursor: editable ? 'pointer' : 'default',
                                                                transition: 'all 0.2s',
                                                                border: `1px solid ${status ? statusConfig[status]?.color + '30' : 'transparent'}`,
                                                                minWidth: '100px', justifyContent: 'center'
                                                            }}
                                                            onMouseOver={e => editable && (e.currentTarget.style.filter = 'brightness(1.1)')}
                                                            onMouseOut={e => editable && (e.currentTarget.style.filter = 'brightness(1)')}
                                                        >
                                                            {status ? (
                                                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                                                    {statusConfig[status]?.emoji} {statusConfig[status]?.label}
                                                                </span>
                                                            ) : (
                                                                <span style={{ opacity: 0.3 }}>Not set</span>
                                                            )}
                                                            {editable && (
                                                                <Edit3 size={12} style={{ opacity: 0.5, marginLeft: '0.3rem' }} />
                                                            )}
                                                        </div>
                                                    )}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Legend */}
            <div style={{ ...panelStyle, padding: '1rem 1.5rem', marginTop: '1rem', display: 'flex', gap: '2rem', alignItems: 'center', justifyContent: 'center' }}>
                {Object.entries(statusConfig).map(([key, cfg]) => (
                    <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
                        <div style={{
                            width: '12px', height: '12px', borderRadius: '4px',
                            background: cfg.color
                        }} />
                        <span style={{ color: 'var(--text-muted)', fontWeight: '600' }}>{cfg.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FutureAvailabilityTab;
