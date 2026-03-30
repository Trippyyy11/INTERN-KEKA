import React, { useState } from 'react';
import { Info, Calendar, TrendingUp, PieChart, X, FileText } from 'lucide-react';

const LeaveTab = ({
    leaveStats,
    myRequests,
    user,
    getStatusStyle,
    isLightMode
}) => {
    const [selectedType, setSelectedType] = React.useState(null);
    const [showDetailModal, setShowDetailModal] = React.useState(false);

    const bentoPanelStyle = {
        background: isLightMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(15, 23, 42, 0.5)',
        backdropFilter: 'blur(16px)',
        borderRadius: '24px',
        border: `1px solid ${isLightMode ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)'}`,
        padding: '1.5rem',
        boxShadow: isLightMode ? '0 4px 24px rgba(0,0,0,0.04)' : '0 4px 24px rgba(0,0,0,0.2)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    };

    const sectionTitleStyle = {
        fontSize: '1.1rem',
        fontWeight: '900',
        letterSpacing: '-0.5px',
        color: 'var(--text-main)',
        marginBottom: '1.25rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem'
    };

    const labelStyle = {
        fontSize: '0.7rem',
        color: 'var(--text-muted)',
        textTransform: 'uppercase',
        letterSpacing: '1px',
        fontWeight: '800',
    };

    const getLeaveColor = (type) => {
        const colors = {
            'Annual': '#6366f1',
            'Casual': '#ff00cc',
            'Paid': '#ffab00',
            'Sick': '#10b981',
            'Comp Off': '#3b82f6',
            'Unpaid': '#94a3b8',
            'Half Day': '#8b5cf6',
            'Leave Application': '#ffab00',
            'Leave Cancellation': '#ef4444'
        };
        return colors[type] || 'var(--primary)';
    };

    // Calculate total consumed for donut
    const consumedData = Object.entries(leaveStats.balances || {})
        .filter(([_, data]) => data.consumed > 0)
        .map(([type, data]) => ({ type, consumed: data.consumed, color: getLeaveColor(type) }));
    
    const totalConsumedAll = consumedData.reduce((acc, curr) => acc + curr.consumed, 0);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', padding: '1.5rem' }}>
            
            {/* ── Dashboard Hero Section ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '1.5rem' }}>
                
                {/* Donut Chart Panel */}
                <div style={{ ...bentoPanelStyle, position: 'relative', overflow: 'hidden' }}>
                    <div style={{ 
                        position: 'absolute', top: '-20%', right: '-10%', width: '200px', height: '200px', 
                        background: 'radial-gradient(circle, rgba(var(--primary-rgb), 0.08) 0%, transparent 70%)',
                        zIndex: 0 
                    }}></div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', position: 'relative', zIndex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(var(--primary-rgb), 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <PieChart size={20} color="var(--primary)" />
                            </div>
                            <div>
                                <span style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--text-main)', display: 'block' }}>Usage Summary</span>
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '600' }}>Overall leave distribution</span>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flex: 1, position: 'relative', zIndex: 1 }}>
                        <div style={{ position: 'relative', width: '160px', height: '160px' }}>
                            <svg viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
                                <circle cx="18" cy="18" r="15.915" fill="transparent" stroke={isLightMode ? '#f1f5f9' : 'rgba(255,255,255,0.05)'} strokeWidth="3.5"></circle>
                                {totalConsumedAll > 0 ? (() => {
                                    let offset = 0;
                                    return consumedData.map((item, i) => {
                                        const dash = (item.consumed / totalConsumedAll) * 100;
                                        const currentOffset = offset;
                                        offset += dash;
                                        return (
                                            <circle
                                                key={item.type}
                                                cx="18" cy="18" r="15.915"
                                                fill="transparent"
                                                stroke={item.color}
                                                strokeWidth="4.5"
                                                strokeDasharray={`${dash} ${100 - dash}`}
                                                strokeDashoffset={100 - currentOffset + 25}
                                                strokeLinecap="round"
                                                style={{ transition: 'all 1s cubic-bezier(0.4, 0, 0.2, 1)' }}
                                            ></circle>
                                        );
                                    });
                                })() : (
                                    <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="var(--text-muted)" strokeWidth="1" strokeDasharray="2,2" opacity="0.3"></circle>
                                )}
                            </svg>
                            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--text-main)', lineHeight: 1 }}>{totalConsumedAll}</div>
                                <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', marginTop: '4px' }}>Days Taken</div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
                            {consumedData.length > 0 ? consumedData.map(item => (
                                <div key={item.type} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.color, boxShadow: `0 0 8px ${item.color}40` }}></div>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-main)', fontWeight: '700' }}>{item.type}</span>
                                    </div>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '800' }}>{item.consumed}d</span>
                                </div>
                            )) : (
                                <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '600', padding: '1rem' }}>
                                    No leaves consumed yet
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                    <div style={bentoPanelStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
                            <TrendingUp size={16} color="var(--primary)" />
                            <span style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-main)' }}>Weekly Trend</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '100px', gap: '6px' }}>
                            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => {
                                const val = leaveStats.weeklyPattern?.[i] || 0;
                                const maxVal = Math.max(...(leaveStats.weeklyPattern || [1]));
                                const height = val > 0 ? (val / maxVal) * 80 + 4 : 4;
                                return (
                                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                                        <div style={{ width: '100%', height: `${height}px`, background: val > 0 ? 'linear-gradient(180deg, var(--primary), rgba(var(--primary-rgb), 0.3))' : (isLightMode ? '#f1f5f9' : 'rgba(255,255,255,0.03)'), borderRadius: '6px', transition: 'height 0.6s cubic-bezier(0.4, 0, 0.2, 1)' }}></div>
                                        <span style={{ fontSize: '0.6rem', fontWeight: '800', color: 'var(--text-muted)' }}>{day}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div style={bentoPanelStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
                            <Calendar size={16} color="var(--primary)" />
                            <span style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-main)' }}>Monthly Insights</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '100px', gap: '3px' }}>
                            {['J','F','M','A','M','J','J','A','S','O','N','D'].map((month, i) => {
                                const val = leaveStats.monthlyStats?.[i] || 0;
                                const maxVal = Math.max(...(leaveStats.monthlyStats || [1]));
                                const height = val > 0 ? (val / maxVal) * 80 + 4 : 4;
                                const isCurrent = i === new Date().getMonth();
                                return (
                                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                                        <div style={{ width: '100%', height: `${height}px`, background: isCurrent ? 'var(--primary)' : (val > 0 ? 'rgba(var(--primary-rgb), 0.4)' : (isLightMode ? '#f1f5f9' : 'rgba(255,255,255,0.03)')), borderRadius: '4px', transition: 'height 0.6s cubic-bezier(0.4, 0, 0.2, 1)' }}></div>
                                        <span style={{ fontSize: '0.55rem', fontWeight: '800', color: isCurrent ? 'var(--primary)' : 'var(--text-muted)' }}>{month}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Leave Balances ── */}
            <div style={sectionTitleStyle}>
                <TrendingUp size={18} />
                Leave Balances
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem' }}>
                {Object.entries(leaveStats.balances || {}).filter(([key]) => key !== 'Annual').map(([key, data]) => {
                    const color = getLeaveColor(key);
                    const isUnpaid = key === 'Unpaid';
                    const available = data.total - data.consumed;
                    const percentage = data.total > 0 ? (available / data.total) * 100 : 0;

                    return (
                        <div key={key} style={{
                            ...bentoPanelStyle, position: 'relative', overflow: 'hidden', display: 'flex',
                            flexDirection: 'column', gap: '1rem', paddingTop: '1.25rem', padding: '1rem'
                        }}>
                            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: color, boxShadow: `0 2px 10px ${color}33` }}></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.85rem', fontWeight: '900', color: 'var(--text-main)', letterSpacing: '-0.3px', whiteSpace: 'nowrap' }}>{key}</span>
                                {!isUnpaid && (
                                    <div onClick={() => { setSelectedType(key); setShowDetailModal(true); }} style={{ padding: '4px', borderRadius: '8px', background: isLightMode ? '#f1f5f9' : 'rgba(255,255,255,0.05)', cursor: 'pointer' }}>
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <Info size={12} color="var(--primary)" />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center' }}>
                                {!isUnpaid ? (
                                    <div style={{ position: 'relative', width: '50px', height: '50px' }}>
                                        <svg viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
                                            <circle cx="18" cy="18" r="15.915" fill="transparent" stroke={isLightMode ? '#f1f5f9' : 'rgba(255,255,255,0.05)'} strokeWidth="4"></circle>
                                            <circle cx="18" cy="18" r="15.915" fill="transparent" stroke={color} strokeWidth="4" strokeDasharray={`${percentage} ${100 - percentage}`} strokeDashoffset="25" strokeLinecap="round" style={{ transition: 'stroke-dasharray 1s ease' }}></circle>
                                        </svg>
                                        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '0.7rem', fontWeight: '900', color: 'var(--text-main)' }}>{available === Infinity ? '∞' : available}</div>
                                    </div>
                                ) : (
                                    <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Info size={24} color={color} opacity={0.5} /></div>
                                )}
                                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                                    {!isUnpaid ? (
                                        <>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span style={{...labelStyle, fontSize: '0.6rem'}}>Annual</span><span style={{ fontSize: '0.75rem', fontWeight: '900', color: 'var(--text-main)' }}>{data.total}d</span></div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span style={{...labelStyle, fontSize: '0.6rem'}}>Used</span><span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)' }}>{data.consumed}d</span></div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1px', paddingTop: '3px', borderTop: `1px solid ${isLightMode ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.04)'}` }}><span style={{ ...labelStyle, fontSize: '0.6rem', color: 'var(--primary)', fontWeight: '900' }}>Avail</span><span style={{ fontSize: '0.75rem', fontWeight: '900', color: 'var(--primary)' }}>{available}d</span></div>
                                        </>
                                    ) : (
                                        <div style={{ textAlign: 'center' }}><div style={{...labelStyle, fontSize: '0.6rem'}}>Consumed</div><div style={{ fontSize: '1.2rem', fontWeight: '900', color: 'var(--text-main)' }}>{data.consumed}d</div></div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* ── Leave History ── */}
            <div style={sectionTitleStyle}><TrendingUp size={18} />Leave History</div>
            <div style={{ ...bentoPanelStyle, padding: 0, overflow: 'hidden' }}>
                <table className="data-table" style={{ margin: 0, width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: isLightMode ? '#f8fafc' : 'rgba(0,0,0,0.2)', fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: `1px solid ${isLightMode ? '#e2e8f0' : 'rgba(255,255,255,0.06)'}` }}>
                            <th style={{ padding: '1.25rem', fontWeight: '800', textAlign: 'left' }}>Duration</th>
                            <th style={{ padding: '1.25rem', fontWeight: '800', textAlign: 'left' }}>Type</th>
                            <th style={{ padding: '1.25rem', fontWeight: '800', textAlign: 'left' }}>Status</th>
                            <th style={{ padding: '1.25rem', fontWeight: '800', textAlign: 'left' }}>Action Taken</th>
                            <th style={{ padding: '1.25rem', fontWeight: '800', textAlign: 'left' }}>Note</th>
                        </tr>
                    </thead>
                    <tbody>
                        {myRequests.filter(r => ['Leave Application', 'Half Day', 'Comp Off', 'Leave Cancellation'].includes(r.type)).length > 0 ? (
                            myRequests.filter(r => ['Leave Application', 'Half Day', 'Comp Off', 'Leave Cancellation'].includes(r.type)).map((h, idx) => (
                                <tr key={h._id} style={{ borderBottom: idx === myRequests.length - 1 ? 'none' : `1px solid ${isLightMode ? '#f1f5f9' : 'rgba(255,255,255,0.03)'}` }}>
                                    <td style={{ padding: '1.25rem' }}>
                                        <div style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '4px' }}>{new Date(h.startDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}{h.startDate !== h.endDate && ` — ${new Date(h.endDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}`}</div>
                                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Requested {new Date(h.createdAt).toLocaleDateString()}</div>
                                    </td>
                                    <td style={{ padding: '1.25rem' }}>
                                        <span style={{ fontSize: '0.8rem', fontWeight: '700', color: getLeaveColor(h.leaveType || h.type), display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '6px', height: '6px', borderRadius: '50%', background: getLeaveColor(h.leaveType || h.type) }}></div>{h.leaveType ? `${h.leaveType} Leave` : h.type}</span>
                                    </td>
                                    <td style={{ padding: '1.25rem' }}><span style={{ padding: '0.4rem 0.8rem', borderRadius: '30px', fontSize: '0.65rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.5px', ...getStatusStyle(h.status) }}>{h.status}</span></td>
                                    <td style={{ padding: '1.25rem' }}>{h.status !== 'Pending' ? <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: '900' }}>{h.actionBy?.name?.charAt(0) || 'A'}</div><div><div style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-main)' }}>{h.actionBy?.name || 'Admin'}</div><div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{new Date(h.actionDate).toLocaleDateString()}</div></div></div> : <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Pending</span>}</td>
                                    <td style={{ padding: '1.25rem' }}><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{h.message || h.actionNote || '—'}</div></td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="5" style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>No records found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* ── Detail Modal ── */}
            {showDetailModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}>
                    <div style={{ ...bentoPanelStyle, maxWidth: '700px', width: '90%', maxHeight: '80vh', padding: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}><div style={{ width: '48px', height: '48px', borderRadius: '16px', background: `${getLeaveColor(selectedType)}15`, color: getLeaveColor(selectedType), display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FileText size={24} /></div><h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '900', color: 'var(--text-main)' }}>{selectedType} Details</h3></div>
                            <div onClick={() => setShowDetailModal(false)} style={{ cursor: 'pointer', opacity: 0.5 }}><X size={24} /></div>
                        </div>
                        <div style={{ overflowY: 'auto', maxHeight: '50vh' }}>
                            {myRequests.filter(r => (r.type === 'Leave Application' && r.leaveType === selectedType) || (r.type === 'Comp Off' && selectedType === 'Comp Off')).length > 0 ? (
                                myRequests.filter(r => (r.type === 'Leave Application' && r.leaveType === selectedType) || (r.type === 'Comp Off' && selectedType === 'Comp Off')).map(req => (
                                    <div key={req._id} style={{ padding: '1.5rem', borderRadius: '24px', background: isLightMode ? '#f8fafc' : 'rgba(255,255,255,0.03)', marginBottom: '1rem', border: `1px solid ${isLightMode ? '#e2e8f0' : 'rgba(255,255,255,0.06)'}` }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}><span style={{ fontSize: '0.95rem', fontWeight: '900', color: 'var(--text-main)' }}>{new Date(req.startDate).toLocaleDateString()} — {new Date(req.endDate).toLocaleDateString()}</span><span style={{ fontSize: '0.7rem', fontWeight: '900', textTransform: 'uppercase', ...getStatusStyle(req.status), padding: '4px 10px', borderRadius: '20px' }}>{req.status}</span></div>
                                        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>{req.message || 'No reason provided.'}</p>
                                        {req.actionNote && <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(var(--primary-rgb), 0.05)', borderRadius: '16px', borderLeft: '4px solid var(--primary)' }}><div style={{ fontSize: '0.65rem', color: 'var(--primary)', fontWeight: '900', textTransform: 'uppercase', marginBottom: '6px' }}>Approver Note</div><p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-main)' }}>{req.actionNote}</p></div>}
                                    </div>
                                ))
                            ) : <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No records found</div>}
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes modalSlideIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                .data-table th, .data-table td { border: none !important; }
            `}</style>
        </div>
    );
};

export default LeaveTab;
