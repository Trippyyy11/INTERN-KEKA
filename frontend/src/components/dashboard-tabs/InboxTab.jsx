import React from 'react';
import { Info, Inbox, Check, X } from 'lucide-react';

const InboxTab = ({
    inboxRequests,
    requestActionNote,
    setRequestActionNote,
    handleRequestAction,
    getStatusStyle,
    isLightMode
}) => {
    const bentoPanelStyle = {
        background: isLightMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(15, 23, 42, 0.5)',
        backdropFilter: 'blur(16px)',
        borderRadius: '24px',
        border: `1px solid ${isLightMode ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)'}`,
        padding: '1.5rem',
        boxShadow: isLightMode ? '0 4px 24px rgba(0,0,0,0.04)' : '0 4px 24px rgba(0,0,0,0.2)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'hidden',
    };

    const inputStyle = {
        padding: '0.5rem 0.75rem',
        borderRadius: '12px',
        border: `1px solid ${isLightMode ? '#e2e8f0' : 'rgba(255,255,255,0.08)'}`,
        background: isLightMode ? '#f8fafc' : 'rgba(0,0,0,0.2)',
        color: 'var(--text-main)',
        fontSize: '0.8rem',
        fontWeight: '500',
        outline: 'none',
        transition: 'border-color 0.2s',
        width: '130px',
    };

    return (
        <div style={{ padding: '0 1.5rem', marginTop: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
                <div style={{
                    width: '42px', height: '42px', borderRadius: '14px',
                    background: 'linear-gradient(135deg, rgba(var(--primary-rgb), 0.15), rgba(var(--primary-rgb), 0.05))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--primary)',
                    boxShadow: '0 4px 12px rgba(var(--primary-rgb), 0.15)'
                }}>
                    <Inbox size={20} />
                </div>
                <div>
                    <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-0.3px' }}>Inbox</h2>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '500', marginTop: '0.15rem' }}>Review and manage pending requests</p>
                </div>
            </div>

            <div style={bentoPanelStyle}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 0.5rem' }}>
                        <thead>
                            <tr>
                                {['Dates', 'Request Type', 'Status', 'Requested By', 'Action Taken On', 'Leave / WFH Note', 'Action Note', 'Actions'].map((header, idx) => (
                                    <th key={idx} style={{
                                        textAlign: 'left',
                                        padding: '0 1.25rem 1rem 1.25rem',
                                        fontSize: '0.7rem',
                                        fontWeight: '700',
                                        color: 'var(--text-muted)',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.8px',
                                        borderBottom: `1px solid ${isLightMode ? '#e2e8f0' : 'rgba(255,255,255,0.06)'}`
                                    }}>{header}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {inboxRequests.length > 0 ? inboxRequests.map(r => (
                                <tr key={r._id} style={{
                                    background: isLightMode ? '#f8fafc' : 'rgba(0,0,0,0.15)',
                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                }}
                                    onMouseOver={e => {
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                        e.currentTarget.style.boxShadow = isLightMode ? '0 8px 16px rgba(0,0,0,0.04)' : '0 8px 16px rgba(0,0,0,0.2)';
                                        e.currentTarget.style.background = isLightMode ? '#ffffff' : 'rgba(0,0,0,0.25)';
                                    }}
                                    onMouseOut={e => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = 'none';
                                        e.currentTarget.style.background = isLightMode ? '#f8fafc' : 'rgba(0,0,0,0.15)';
                                    }}
                                >
                                    <td style={{ padding: '1.25rem', borderRadius: '16px 0 0 16px', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-main)' }}>
                                        {new Date(r.startDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        {r.startDate !== r.endDate && ` - ${new Date(r.endDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}`}
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px', fontWeight: '500' }}>
                                            {Math.ceil((new Date(r.endDate) - new Date(r.startDate)) / (1000 * 60 * 60 * 24)) + 1} day(s)
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.25rem', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-main)' }}>
                                        {r.type}
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px', fontWeight: '500' }}>
                                            Requested on {new Date(r.createdAt).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.25rem' }}>
                                        <span style={{
                                            padding: '0.3rem 0.7rem',
                                            borderRadius: '20px',
                                            fontSize: '0.7rem',
                                            fontWeight: '700',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px',
                                            ...getStatusStyle(r.status)
                                        }}>
                                            {r.status}
                                        </span>
                                        {r.status !== 'Pending' && r.actionBy && (
                                            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '6px', fontWeight: '600' }}>by {r.actionBy.name}</div>
                                        )}
                                    </td>
                                    <td style={{ padding: '1.25rem', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-main)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <div style={{
                                                width: '24px', height: '24px', borderRadius: '8px',
                                                background: 'var(--primary)', color: 'white',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: '0.6rem', fontWeight: '800'
                                            }}>{r.user?.name?.substring(0, 1).toUpperCase()}</div>
                                            {r.user?.name}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.25rem', fontSize: '0.85rem', fontWeight: '500', color: 'var(--text-muted)' }}>
                                        {r.status !== 'Pending' && r.actionDate ? new Date(r.actionDate).toLocaleDateString() : '-'}
                                    </td>
                                    <td style={{ padding: '1.25rem', fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: '160px', fontWeight: '500' }}>
                                        <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.message || '-'}</div>
                                    </td>
                                    <td style={{ padding: '1.25rem', fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: '140px', fontWeight: '500' }}>
                                        <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.actionNote || '-'}</div>
                                    </td>
                                    <td style={{ padding: '1.25rem', borderRadius: '0 16px 16px 0' }}>
                                        {r.status === 'Pending' ? (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <input
                                                    type="text"
                                                    placeholder="Optional Note"
                                                    value={requestActionNote}
                                                    onChange={(e) => setRequestActionNote(e.target.value)}
                                                    style={inputStyle}
                                                />
                                                <div style={{ display: 'flex', gap: '0.3rem' }}>
                                                    <button
                                                        onClick={() => handleRequestAction(r._id, 'Approved')}
                                                        style={{
                                                            width: '32px', height: '32px', borderRadius: '10px',
                                                            background: 'rgba(16, 185, 129, 0.15)', color: 'var(--success)', border: 'none',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                                                            transition: 'background 0.2s',
                                                        }}
                                                        onMouseOver={e => e.currentTarget.style.background = 'rgba(16, 185, 129, 0.25)'}
                                                        onMouseOut={e => e.currentTarget.style.background = 'rgba(16, 185, 129, 0.15)'}
                                                        title="Approve"
                                                    >
                                                        <Check size={16} strokeWidth={3} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleRequestAction(r._id, 'Rejected')}
                                                        style={{
                                                            width: '32px', height: '32px', borderRadius: '10px',
                                                            background: 'rgba(239, 68, 68, 0.15)', color: 'var(--danger)', border: 'none',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                                                            transition: 'background 0.2s',
                                                        }}
                                                        onMouseOver={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.25)'}
                                                        onMouseOut={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)'}
                                                        title="Reject"
                                                    >
                                                        <X size={16} strokeWidth={3} />
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                                                No actions
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="8" style={{ padding: '4rem 0', textAlign: 'center' }}>
                                        <div style={{
                                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                            color: 'var(--text-muted)',
                                        }}>
                                            <Info size={32} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                                            <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: '600' }}>No requests in your inbox.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default InboxTab;
