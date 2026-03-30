import { useState, useEffect, useCallback } from 'react';
import { Download, Search, Filter, ChevronLeft, ChevronRight, Mail, Trash2, Shield, Clock, UserCheck, FileText, Settings, AlertTriangle } from 'lucide-react';
import api from '../../api/axios';

const actionIcons = {
    USER_REGISTERED: <UserCheck size={16} />,
    USER_APPROVED: <UserCheck size={16} />,
    USER_DENIED: <AlertTriangle size={16} />,
    USER_DELETED: <Trash2 size={16} />,
    USER_UPDATED: <Settings size={16} />,
    ROLE_CHANGED: <Shield size={16} />,
    ATTENDANCE_EDITED: <Clock size={16} />,
    LEAVE_APPLIED: <FileText size={16} />,
    LEAVE_APPROVED: <UserCheck size={16} />,
    LEAVE_REJECTED: <AlertTriangle size={16} />,
    CONFIG_ADDED: <Settings size={16} />,
    CONFIG_DELETED: <Trash2 size={16} />,
    SETTINGS_UPDATED: <Settings size={16} />,
    REQUEST_APPROVED: <UserCheck size={16} />,
    REQUEST_REJECTED: <AlertTriangle size={16} />,
    ANNOUNCEMENT_POSTED: <FileText size={16} />,
    AVAILABILITY_UPDATED: <Clock size={16} />,
};

const actionColors = {
    USER_REGISTERED: '#3b82f6',
    USER_APPROVED: '#22c55e',
    USER_DENIED: '#ef4444',
    USER_DELETED: '#ef4444',
    USER_UPDATED: '#8b5cf6',
    ROLE_CHANGED: '#f59e0b',
    ATTENDANCE_EDITED: '#06b6d4',
    LEAVE_APPLIED: '#3b82f6',
    LEAVE_APPROVED: '#22c55e',
    LEAVE_REJECTED: '#ef4444',
    CONFIG_ADDED: '#22c55e',
    CONFIG_DELETED: '#ef4444',
    SETTINGS_UPDATED: '#8b5cf6',
    REQUEST_APPROVED: '#22c55e',
    REQUEST_REJECTED: '#ef4444',
    ANNOUNCEMENT_POSTED: '#3b82f6',
    AVAILABILITY_UPDATED: '#06b6d4',
};

const AuditTab = ({ isLightMode }) => {
    const [logs, setLogs] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [actionFilter, setActionFilter] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [showExportModal, setShowExportModal] = useState(false);
    const [additionalEmail, setAdditionalEmail] = useState('');
    const [exporting, setExporting] = useState(false);
    const [exportMessage, setExportMessage] = useState('');

    const fetchLogs = useCallback(async () => {
        setLoading(true);
        try {
            const params = { page, limit: 25 };
            if (actionFilter) params.action = actionFilter;
            if (startDate) params.startDate = startDate;
            if (endDate) params.endDate = endDate;

            const res = await api.get('/audit', { params });
            setLogs(res.data.logs);
            setTotal(res.data.total);
            setTotalPages(res.data.totalPages);
        } catch (err) {
            console.error('Failed to fetch audit logs:', err);
        }
        setLoading(false);
    }, [page, actionFilter, startDate, endDate]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    const handleExport = async () => {
        setExporting(true);
        setExportMessage('');
        try {
            const res = await api.post('/audit/export', { additionalEmail });
            setExportMessage(res.data.message);
            setShowExportModal(false);
            setAdditionalEmail('');
            // Refresh — logs should be cleared after export
            setTimeout(() => fetchLogs(), 500);
        } catch (err) {
            setExportMessage(err.response?.data?.message || 'Export failed. Please try again.');
        }
        setExporting(false);
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
        transition: 'border-color 0.2s',
    };

    const allActions = [
        'USER_REGISTERED', 'USER_APPROVED', 'USER_DENIED', 'USER_DELETED', 'USER_UPDATED', 'ROLE_CHANGED',
        'ATTENDANCE_EDITED', 'LEAVE_APPLIED', 'LEAVE_APPROVED', 'LEAVE_REJECTED',
        'REQUEST_APPROVED', 'REQUEST_REJECTED',
        'CONFIG_ADDED', 'CONFIG_DELETED', 'SETTINGS_UPDATED', 'ANNOUNCEMENT_POSTED', 'AVAILABILITY_UPDATED'
    ];

    return (
        <div style={{ padding: '1.5rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                    <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-0.5px' }}>
                        <Shield size={22} style={{ verticalAlign: 'middle', marginRight: '0.5rem', color: 'var(--primary)' }} />
                        Audit Logs
                    </h2>
                    <p style={{ margin: '0.25rem 0 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        {total} total log entries • Auto-exported on the 1st of every month
                    </p>
                </div>
                <button
                    onClick={() => setShowExportModal(true)}
                    disabled={total === 0}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.7rem 1.5rem', borderRadius: '14px', border: 'none', cursor: total > 0 ? 'pointer' : 'not-allowed',
                        background: total > 0 ? 'linear-gradient(135deg,#3b82f6,#06b6d4)' : (isLightMode ? '#e2e8f0' : '#334155'),
                        color: '#fff', fontWeight: '700', fontSize: '0.85rem',
                        boxShadow: total > 0 ? '0 4px 15px rgba(59,130,246,0.3)' : 'none',
                        transition: 'all 0.2s'
                    }}
                >
                    <Mail size={16} /> Export & Email
                </button>
            </div>

            {/* Export Status */}
            {exportMessage && (
                <div style={{
                    ...panelStyle, padding: '1rem 1.25rem', marginBottom: '1rem',
                    background: exportMessage.includes('failed') ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)',
                    borderColor: exportMessage.includes('failed') ? 'rgba(239,68,68,0.2)' : 'rgba(34,197,94,0.2)',
                    color: exportMessage.includes('failed') ? '#ef4444' : '#22c55e',
                    fontSize: '0.85rem', fontWeight: '600'
                }}>
                    {exportMessage}
                </div>
            )}

            {/* Filters */}
            <div style={{ ...panelStyle, padding: '1rem 1.5rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <Filter size={18} style={{ color: 'var(--text-muted)' }} />
                <select
                    value={actionFilter}
                    onChange={e => { setActionFilter(e.target.value); setPage(1); }}
                    style={{ ...inputStyle, minWidth: '200px' }}
                >
                    <option value="">All Actions</option>
                    {allActions.map(a => (
                        <option key={a} value={a}>{a.replace(/_/g, ' ')}</option>
                    ))}
                </select>
                <input
                    type="date"
                    value={startDate}
                    onChange={e => { setStartDate(e.target.value); setPage(1); }}
                    style={inputStyle}
                    placeholder="Start Date"
                />
                <input
                    type="date"
                    value={endDate}
                    onChange={e => { setEndDate(e.target.value); setPage(1); }}
                    style={inputStyle}
                    placeholder="End Date"
                />
                {(actionFilter || startDate || endDate) && (
                    <button
                        onClick={() => { setActionFilter(''); setStartDate(''); setEndDate(''); setPage(1); }}
                        style={{
                            background: 'transparent', border: 'none', cursor: 'pointer',
                            color: 'var(--primary)', fontWeight: '600', fontSize: '0.8rem'
                        }}
                    >
                        Clear Filters
                    </button>
                )}
            </div>

            {/* Table */}
            <div style={{ ...panelStyle, overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: `1px solid ${isLightMode ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)'}` }}>
                                {['', 'Action', 'Performed By', 'Details', 'Target', 'Timestamp'].map(h => (
                                    <th key={h} style={{
                                        padding: '1rem 1.25rem', textAlign: 'left',
                                        fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase',
                                        letterSpacing: '0.5px', color: 'var(--text-muted)'
                                    }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</td></tr>
                            ) : logs.length === 0 ? (
                                <tr><td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                    <Shield size={40} style={{ opacity: 0.3, marginBottom: '0.5rem' }} /><br />
                                    No audit logs found
                                </td></tr>
                            ) : logs.map(log => (
                                <tr key={log._id}
                                    style={{
                                        borderBottom: `1px solid ${isLightMode ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.03)'}`,
                                        transition: 'background 0.2s'
                                    }}
                                    onMouseOver={e => e.currentTarget.style.background = isLightMode ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.02)'}
                                    onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                                >
                                    <td style={{ padding: '0.85rem 1.25rem', width: '40px' }}>
                                        <div style={{
                                            width: '32px', height: '32px', borderRadius: '10px',
                                            background: `${actionColors[log.action] || '#6366f1'}15`,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: actionColors[log.action] || '#6366f1'
                                        }}>
                                            {actionIcons[log.action] || <FileText size={16} />}
                                        </div>
                                    </td>
                                    <td style={{ padding: '0.85rem 0.5rem' }}>
                                        <span style={{
                                            display: 'inline-block', padding: '0.25rem 0.75rem',
                                            borderRadius: '8px', fontSize: '0.72rem', fontWeight: '700',
                                            background: `${actionColors[log.action] || '#6366f1'}18`,
                                            color: actionColors[log.action] || '#6366f1',
                                            letterSpacing: '0.3px'
                                        }}>
                                            {log.action.replace(/_/g, ' ')}
                                        </span>
                                    </td>
                                    <td style={{ padding: '0.85rem 0.5rem', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-main)' }}>
                                        {log.userName || log.user?.name || 'System'}
                                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '400' }}>{log.user?.email || (log.userName ? 'Action Logged' : 'N/A')}</div>
                                    </td>
                                    <td style={{ padding: '0.85rem 0.5rem', fontSize: '0.82rem', color: 'var(--text-muted)', maxWidth: '300px' }}>
                                        {log.details}
                                    </td>
                                    <td style={{ padding: '0.85rem 0.5rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                                        {log.targetModel || '—'}
                                    </td>
                                    <td style={{ padding: '0.85rem 1.25rem', fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                                        {new Date(log.createdAt).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        <div style={{ fontSize: '0.72rem', opacity: 0.7 }}>
                                            {new Date(log.createdAt).toLocaleTimeString()}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div style={{
                        padding: '1rem 1.25rem',
                        borderTop: `1px solid ${isLightMode ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)'}`,
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                    }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            Page {page} of {totalPages} • {total} entries
                        </span>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                                disabled={page <= 1}
                                onClick={() => setPage(p => p - 1)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '0.25rem',
                                    padding: '0.5rem 1rem', borderRadius: '10px', border: 'none', cursor: page > 1 ? 'pointer' : 'not-allowed',
                                    background: isLightMode ? '#f1f5f9' : 'rgba(255,255,255,0.06)',
                                    color: 'var(--text-main)', fontSize: '0.8rem', fontWeight: '600'
                                }}
                            >
                                <ChevronLeft size={14} /> Prev
                            </button>
                            <button
                                disabled={page >= totalPages}
                                onClick={() => setPage(p => p + 1)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '0.25rem',
                                    padding: '0.5rem 1rem', borderRadius: '10px', border: 'none', cursor: page < totalPages ? 'pointer' : 'not-allowed',
                                    background: isLightMode ? '#f1f5f9' : 'rgba(255,255,255,0.06)',
                                    color: 'var(--text-main)', fontSize: '0.8rem', fontWeight: '600'
                                }}
                            >
                                Next <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Export Modal */}
            {showExportModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                    background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100
                }}>
                    <div style={{
                        ...panelStyle, padding: '2rem', width: '100%', maxWidth: '460px',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.4)'
                    }}>
                        <h3 style={{ margin: '0 0 0.5rem', color: 'var(--text-main)', fontSize: '1.2rem', fontWeight: '800' }}>
                            <Mail size={20} style={{ verticalAlign: 'middle', marginRight: '0.5rem', color: 'var(--primary)' }} />
                            Export Audit Logs
                        </h3>
                        <p style={{ margin: '0 0 1.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                            CSV will be emailed to your account. Optionally add another recipient. Logs will be deleted from the database after successful delivery.
                        </p>

                        <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'block' }}>
                            Additional Email (optional)
                        </label>
                        <input
                            type="email"
                            value={additionalEmail}
                            onChange={e => setAdditionalEmail(e.target.value)}
                            placeholder="e.g. manager@company.com"
                            style={{ ...inputStyle, width: '100%', marginBottom: '1.5rem' }}
                        />

                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => { setShowExportModal(false); setAdditionalEmail(''); }}
                                style={{
                                    padding: '0.7rem 1.5rem', borderRadius: '12px', border: 'none', cursor: 'pointer',
                                    background: isLightMode ? '#f1f5f9' : 'rgba(255,255,255,0.06)',
                                    color: 'var(--text-main)', fontWeight: '700', fontSize: '0.85rem'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleExport}
                                disabled={exporting}
                                style={{
                                    padding: '0.7rem 1.5rem', borderRadius: '12px', border: 'none', cursor: exporting ? 'not-allowed' : 'pointer',
                                    background: 'linear-gradient(135deg,#3b82f6,#06b6d4)',
                                    color: '#fff', fontWeight: '700', fontSize: '0.85rem',
                                    boxShadow: '0 4px 15px rgba(59,130,246,0.3)',
                                    opacity: exporting ? 0.7 : 1
                                }}
                            >
                                {exporting ? 'Sending...' : 'Export & Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AuditTab;
