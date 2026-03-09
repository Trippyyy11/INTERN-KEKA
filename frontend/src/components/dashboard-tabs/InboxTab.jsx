import React from 'react';
import { Info } from 'lucide-react';

const InboxTab = ({
    inboxRequests,
    requestActionNote,
    setRequestActionNote,
    handleRequestAction,
    getStatusStyle,
    isLightMode
}) => {
    return (
        <div className="page-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Inbox</h2>
            </div>

            <div className="panel" style={{ padding: 0 }}>
                <table className="data-table">
                    <thead>
                        <tr style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                            <th>Dates</th>
                            <th>Request Type</th>
                            <th>Status</th>
                            <th>Requested By</th>
                            <th>Action Taken On</th>
                            <th>Leave / WFH Note</th>
                            <th>Action Note</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {inboxRequests.length > 0 ? inboxRequests.map(r => (
                            <tr key={r._id}>
                                <td style={{ fontSize: '0.8rem' }}>
                                    {new Date(r.startDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    {r.startDate !== r.endDate && ` - ${new Date(r.endDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}`}
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                                        {Math.ceil((new Date(r.endDate) - new Date(r.startDate)) / (1000 * 60 * 60 * 24)) + 1} day(s)
                                    </div>
                                </td>
                                <td style={{ fontSize: '0.85rem' }}>
                                    {r.type}
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Requested on {new Date(r.createdAt).toLocaleDateString()}</div>
                                </td>
                                <td>
                                    <span style={{
                                        padding: '0.2rem 0.6rem',
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
                                        <div style={{ fontSize: '0.65rem', color: isLightMode ? 'rgba(0,0,0,0.6)' : 'var(--text-muted)', marginTop: '4px', fontWeight: '500' }}>by {r.actionBy.name}</div>
                                    )}
                                </td>

                                <td style={{ fontSize: '0.8rem' }}>{r.user?.name}</td>
                                <td style={{ fontSize: '0.8rem' }}>{r.status !== 'Pending' && r.actionDate ? new Date(r.actionDate).toLocaleDateString() : '-'}</td>
                                <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)', maxWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.message || '-'}</td>
                                <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)', maxWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.actionNote || '-'}</td>
                                <td>
                                    {r.status === 'Pending' ? (
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <div style={{ position: 'relative' }}>
                                                <input
                                                    type="text"
                                                    placeholder="Optional Note"
                                                    value={requestActionNote}
                                                    onChange={(e) => setRequestActionNote(e.target.value)}
                                                    style={{ padding: '0.4rem 0.5rem', fontSize: '0.7rem', borderRadius: '4px', border: '1px solid var(--border-dark)', background: 'var(--bg-main)', color: 'var(--text-main)', width: '100px' }}
                                                />
                                            </div>
                                            <button className="btn btn-primary btn-sm" style={{ padding: '0.4rem 0.6rem', fontSize: '0.7rem' }} onClick={() => handleRequestAction(r._id, 'Approved')}>Approve</button>
                                            <button className="btn btn-danger btn-sm" style={{ padding: '0.4rem 0.6rem', fontSize: '0.7rem' }} onClick={() => handleRequestAction(r._id, 'Rejected')}>Deny</button>
                                        </div>
                                    ) : (
                                        <Info size={14} color="var(--primary)" style={{ cursor: 'pointer' }} />
                                    )}
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No requests in your inbox.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default InboxTab;
