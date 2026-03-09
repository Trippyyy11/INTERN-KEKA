import { Info } from 'lucide-react';

const LeaveTab = ({
    leaveStats,
    myRequests,
    user,
    getStatusStyle,
    isLightMode
}) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* My Leave Stats */}
            <div>
                <div style={{ fontSize: '0.9rem', fontWeight: '500', marginBottom: '1rem', color: 'var(--text-main)' }}>My Leave Stats</div>
                <div className="grid" style={{ gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
                    {/* Weekly Pattern */}
                    <div className="panel" style={{ padding: '1.25rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Weekly Pattern</span>
                            <Info size={14} color="var(--text-muted)" />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '100px', padding: '0 0.5rem' }}>
                            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                                <div key={day} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
                                    <div style={{ width: '12px', height: `${(leaveStats.weeklyPattern?.[i] || 0) * 20 + 2}px`, minHeight: '4px', background: 'var(--primary)', borderRadius: '2px', opacity: 0.8 }}></div>
                                    <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>{day[0]}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* Consumed Leave Types */}
                    <div className="panel" style={{ padding: '1.25rem', textAlign: 'center' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Consumed Leave Types</span>
                            <Info size={14} color="var(--text-muted)" />
                        </div>
                        <div style={{ position: 'relative', width: '80px', height: '80px', margin: '0 auto' }}>
                            <svg viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
                                <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="var(--border-dark)" strokeWidth="4"></circle>
                                {Object.entries(leaveStats.balances || {}).map(([type, data], i, arr) => {
                                    const totalConsumed = arr.reduce((acc, [_, d]) => acc + d.consumed, 0);
                                    if (totalConsumed === 0) return null;
                                    const colors = ['#ff00cc', '#ccff00', '#ffab00', '#00ffa2'];
                                    let offset = 0;
                                    for (let j = 0; j < i; j++) offset += (arr[j][1].consumed / totalConsumed) * 100;
                                    const dash = (data.consumed / totalConsumed) * 100;
                                    return (
                                        <circle
                                            key={type}
                                            cx="18" cy="18" r="15.915"
                                            fill="transparent"
                                            stroke={colors[i % colors.length]}
                                            strokeWidth="4"
                                            strokeDasharray={`${dash} ${100 - dash}`}
                                            strokeDashoffset={100 - offset + 25}
                                        ></circle>
                                    );
                                })}
                            </svg>
                            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '0.65rem', fontWeight: '600' }}>
                                Leave<br />Types
                            </div>
                        </div>
                    </div>
                    {/* Monthly Stats */}
                    <div className="panel" style={{ padding: '1.25rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Monthly Stats</span>
                            <Info size={14} color="var(--text-muted)" />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '100px', padding: '0 0.5rem', gap: '2px' }}>
                            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, i) => (
                                <div key={m} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
                                    <div style={{ width: '100%', height: `${(leaveStats.monthlyStats?.[i] || 0) * 10 + 2}px`, minHeight: '2px', background: 'var(--primary)', borderRadius: '1px', opacity: i < new Date().getMonth() + 1 ? 0.8 : 0.2 }}></div>
                                    <span style={{ fontSize: '0.55rem', color: 'var(--text-muted)' }}>{m[0]}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Leave Balances */}
            <div>
                <div style={{ fontSize: '0.9rem', fontWeight: '500', marginBottom: '1rem', color: 'var(--text-main)' }}>Leave Balances</div>
                <div className="grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
                    {[
                        { type: 'Casual Leave', key: 'Casual', color: '#ff00cc' },
                        { type: 'Paid Leave', key: 'Paid', color: '#ffab00' },
                        { type: 'Sick Leave', key: 'Sick', color: '#ccff00' },
                        { type: 'Comp Off', key: 'Comp Off', color: '#00ffa2' }
                    ].map(item => {
                        const data = leaveStats.balances?.[item.key] || { total: 0, consumed: 0 };
                        const available = Math.max(0, data.total - data.consumed);
                        const percentage = data.total > 0 ? (available / data.total) * 100 : 0;
                        return (
                            <div key={item.key} className="panel" style={{ padding: '1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                                    <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>{item.type}</span>
                                    <span style={{ fontSize: '0.7rem', color: 'var(--primary)', cursor: 'pointer' }}>View details</span>
                                </div>
                                <div style={{ position: 'relative', width: '100px', height: '100px', margin: '0 auto 1.5rem' }}>
                                    <svg viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
                                        <circle cx="18" cy="18" r="15.915" fill="transparent" stroke={`${item.color}20`} strokeWidth="3"></circle>
                                        <circle
                                            cx="18" cy="18" r="15.915"
                                            fill="transparent"
                                            stroke={item.color}
                                            strokeWidth="3"
                                            strokeDasharray={`${percentage} ${100 - percentage}`}
                                            strokeDashoffset="25"
                                        ></circle>
                                    </svg>
                                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                                        <div style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{available === Infinity ? '∞' : available} Days</div>
                                        <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>Available</div>
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', borderTop: '1px solid var(--border-dark)', paddingTop: '1rem', marginTop: 'auto' }}>
                                    <div>
                                        <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Available</div>
                                        <div style={{ fontSize: '0.8rem', fontWeight: '500' }}>{available === Infinity ? '∞' : `${available} days`}</div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Consumed</div>
                                        <div style={{ fontSize: '0.8rem', fontWeight: '500' }}>{data.consumed} days</div>
                                    </div>
                                    <div style={{ marginTop: '0.5rem' }}>
                                        <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Annual Quota</div>
                                        <div style={{ fontSize: '0.8rem', fontWeight: '500' }}>{data.total === Infinity ? '∞' : `${data.total} days`}</div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Leave History */}
            <div>
                <div style={{ fontSize: '0.9rem', fontWeight: '500', marginBottom: '1rem', color: 'var(--text-main)' }}>Leave History</div>
                <div className="panel" style={{ padding: 0 }}>
                    <table className="data-table">
                        <thead>
                            <tr style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                                <th>Leave Dates</th>
                                <th>Leave Type</th>
                                <th>Status</th>
                                <th>Requested By</th>
                                <th>Action Taken On</th>
                                <th>Leave Note</th>
                                <th>Reject/Cancellation Reason</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {myRequests.filter(r => ['Leave Application', 'Half Day'].includes(r.type)).length > 0 ? myRequests.filter(r => ['Leave Application', 'Half Day'].includes(r.type)).map(h => (
                                <tr key={h._id}>
                                    <td style={{ fontSize: '0.8rem' }}>
                                        {new Date(h.startDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        {h.startDate !== h.endDate && ` - ${new Date(h.endDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}`}
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                                            {Math.ceil((new Date(h.endDate) - new Date(h.startDate)) / (1000 * 60 * 60 * 24)) + 1} day(s)
                                        </div>
                                    </td>
                                    <td style={{ fontSize: '0.85rem' }}>
                                        {h.type}
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Requested on {new Date(h.createdAt).toLocaleDateString()}</div>
                                    </td>
                                    <td>
                                        <span style={{
                                            padding: '0.2rem 0.6rem',
                                            borderRadius: '20px',
                                            fontSize: '0.7rem',
                                            fontWeight: '700',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px',
                                            ...getStatusStyle(h.status)
                                        }}>
                                            {h.status}
                                        </span>
                                        {h.status !== 'Pending' && h.actionBy && (
                                            <div style={{ fontSize: '0.65rem', color: isLightMode ? 'rgba(0,0,0,0.6)' : 'var(--text-muted)', marginTop: '4px', fontWeight: '500' }}>by {h.actionBy.name}</div>
                                        )}
                                    </td>

                                    <td style={{ fontSize: '0.8rem' }}>{user.name}</td>
                                    <td style={{ fontSize: '0.8rem' }}>{h.status !== 'Pending' && h.actionDate ? new Date(h.actionDate).toLocaleDateString() : '-'}</td>
                                    <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)', maxWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{h.message || '-'}</td>
                                    <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)', maxWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{h.actionNote || '-'}</td>
                                    <td><Info size={14} color="var(--primary)" style={{ cursor: 'pointer' }} /></td>
                                </tr>
                            )) : (
                                <tr><td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No leave history found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default LeaveTab;
