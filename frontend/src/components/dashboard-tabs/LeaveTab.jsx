import React, { useState } from 'react';
import { Info, Calendar, TrendingUp, PieChart, X } from 'lucide-react';

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
        display: 'flex',
        flexDirection: 'column',
    };

    const sectionTitleStyle = {
        fontSize: '1.05rem',
        fontWeight: '800',
        letterSpacing: '-0.3px',
        color: 'var(--text-main)',
        marginBottom: '1.25rem',
    };

    const labelStyle = {
        fontSize: '0.7rem',
        color: 'var(--text-muted)',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        fontWeight: '700',
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1.5rem' }}>
            {/* ── My Leave Stats ── */}
            <div style={sectionTitleStyle}>My Leave Stats</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.25rem' }}>
                {/* Weekly Pattern */}
                <div style={bentoPanelStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(var(--primary-rgb), 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Calendar size={16} color="var(--primary)" />
                            </div>
                            <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-main)' }}>Weekly Pattern</span>
                        </div>
                        <Info size={14} color="var(--text-muted)" style={{ opacity: 0.5 }} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '100px', padding: '0 0.5rem', flex: 1 }}>
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                            <div key={day} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
                                <div style={{
                                    width: '14px',
                                    height: `${(leaveStats.weeklyPattern?.[i] || 0) * 20 + 4}px`,
                                    minHeight: '4px',
                                    background: `linear-gradient(180deg, var(--primary), rgba(var(--primary-rgb), 0.4))`,
                                    borderRadius: '4px',
                                    transition: 'height 0.5s ease',
                                }}></div>
                                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '600' }}>{day[0]}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Consumed Leave Types */}
                <div style={{ ...bentoPanelStyle, alignItems: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(var(--primary-rgb), 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <PieChart size={16} color="var(--primary)" />
                            </div>
                            <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-main)' }}>Consumed Leave Types</span>
                        </div>
                        <Info size={14} color="var(--text-muted)" style={{ opacity: 0.5 }} />
                    </div>
                    <div style={{ position: 'relative', width: '100px', height: '100px', margin: '0.5rem auto' }}>
                        <svg viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
                            <circle cx="18" cy="18" r="15.915" fill="transparent" stroke={isLightMode ? '#e2e8f0' : 'rgba(255,255,255,0.08)'} strokeWidth="4"></circle>
                            {Object.entries(leaveStats.balances || {}).map(([type, data], i, arr) => {
                                const totalConsumed = arr.reduce((acc, [_, d]) => acc + d.consumed, 0);
                                if (totalConsumed === 0) return null;
                                const colors = ['#ff00cc', '#ffab00', '#10b981', '#3b82f6'];
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
                        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-main)', textAlign: 'center' }}>
                            Leave<br />Types
                        </div>
                    </div>
                    {/* Legend */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.75rem', justifyContent: 'center' }}>
                        {[
                            { label: 'Casual', color: '#ff00cc' },
                            { label: 'Paid', color: '#ffab00' },
                            { label: 'Sick', color: '#10b981' },
                            { label: 'Comp Off', color: '#3b82f6' },
                        ].map(l => (
                            <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: l.color }}></div>
                                <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: '600' }}>{l.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Monthly Stats */}
                <div style={bentoPanelStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(var(--primary-rgb), 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <TrendingUp size={16} color="var(--primary)" />
                            </div>
                            <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-main)' }}>Monthly Stats</span>
                        </div>
                        <Info size={14} color="var(--text-muted)" style={{ opacity: 0.5 }} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '100px', padding: '0 0.25rem', gap: '3px', flex: 1 }}>
                        {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, i) => (
                            <div key={m} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
                                <div style={{
                                    width: '100%',
                                    height: `${(leaveStats.monthlyStats?.[i] || 0) * 10 + 2}px`,
                                    minHeight: '2px',
                                    background: i < new Date().getMonth() + 1 ? `linear-gradient(180deg, var(--primary), rgba(var(--primary-rgb), 0.3))` : (isLightMode ? '#e2e8f0' : 'rgba(255,255,255,0.05)'),
                                    borderRadius: '3px',
                                    transition: 'height 0.5s ease',
                                }}></div>
                                <span style={{ fontSize: '0.55rem', color: 'var(--text-muted)', fontWeight: '600' }}>{m[0]}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Leave Balances ── */}
            <div style={sectionTitleStyle}>Leave Balances</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem' }}>
                {[
                    { type: 'Casual Leave', key: 'Casual', color: '#ff00cc', gradient: 'linear-gradient(135deg, rgba(255,0,204,0.08), rgba(255,0,204,0.02))' },
                    { type: 'Paid Leave', key: 'Paid', color: '#ffab00', gradient: 'linear-gradient(135deg, rgba(255,171,0,0.08), rgba(255,171,0,0.02))' },
                    { type: 'Sick Leave', key: 'Sick', color: '#10b981', gradient: 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(16,185,129,0.02))' },
                    { type: 'Comp Off', key: 'Comp Off', color: '#3b82f6', gradient: 'linear-gradient(135deg, rgba(59,130,246,0.08), rgba(59,130,246,0.02))' }
                ].map(item => {
                    const data = leaveStats.balances?.[item.key] || { total: 0, consumed: 0 };
                    const available = Math.max(0, data.total - data.consumed);
                    const percentage = data.total > 0 ? (available / data.total) * 100 : 0;
                    return (
                        <div key={item.key} style={{
                            ...bentoPanelStyle,
                            background: isLightMode ? item.gradient : bentoPanelStyle.background,
                            borderColor: `${item.color}15`,
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                                <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-main)' }}>{item.type}</span>
                                <span 
                                    onClick={() => {
                                        setSelectedType(item.key);
                                        setShowDetailModal(true);
                                    }}
                                    style={{ 
                                        fontSize: '0.7rem', 
                                        color: isLightMode ? (item.key === 'Sick' || item.key === 'Comp Off' ? 'var(--text-main)' : item.color) : item.color, 
                                        cursor: 'pointer', 
                                        fontWeight: '700', 
                                        opacity: 0.9, 
                                        transition: 'all 0.2s',
                                        padding: '4px 8px',
                                        borderRadius: '8px',
                                        background: isLightMode ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.03)'
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.background = isLightMode ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.08)'; e.currentTarget.style.opacity = '1'; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = isLightMode ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.03)'; e.currentTarget.style.opacity = '0.9'; }}
                                >
                                    View details
                                </span>
                            </div>
                            <div style={{ position: 'relative', width: '90px', height: '90px', margin: '0 auto 1.25rem' }}>
                                <svg viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
                                    <circle cx="18" cy="18" r="15.915" fill="transparent" stroke={`${item.color}18`} strokeWidth="3.5"></circle>
                                    <circle
                                        cx="18" cy="18" r="15.915"
                                        fill="transparent"
                                        stroke={item.color}
                                        strokeWidth="3.5"
                                        strokeDasharray={`${percentage} ${100 - percentage}`}
                                        strokeDashoffset="25"
                                        strokeLinecap="round"
                                        style={{ filter: `drop-shadow(0 0 6px ${item.color}40)`, transition: 'stroke-dasharray 0.8s ease' }}
                                    ></circle>
                                </svg>
                                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                                    <div style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-0.5px' }}>{available === Infinity ? '∞' : available} Days</div>
                                    <div style={{ fontSize: '0.55rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Available</div>
                                </div>
                            </div>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '0.75rem',
                                borderTop: `1px solid ${isLightMode ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)'}`,
                                paddingTop: '1rem',
                                marginTop: 'auto',
                            }}>
                                <div>
                                    <div style={labelStyle}>Available</div>
                                    <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-main)', marginTop: '0.2rem' }}>{available === Infinity ? '∞' : `${available} days`}</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={labelStyle}>Consumed</div>
                                    <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-main)', marginTop: '0.2rem' }}>{data.consumed} days</div>
                                </div>
                                <div style={{ gridColumn: 'span 2' }}>
                                    <div style={labelStyle}>Annual Quota</div>
                                    <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-main)', marginTop: '0.2rem' }}>{data.total === Infinity ? '∞' : `${data.total} days`}</div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* ── Leave History ── */}
            <div style={sectionTitleStyle}>Leave History</div>
            <div style={{ borderRadius: '20px', border: `1px solid ${isLightMode ? '#e2e8f0' : 'rgba(255,255,255,0.06)'}`, overflow: 'hidden', background: isLightMode ? 'rgba(255,255,255,0.7)' : 'rgba(15,23,42,0.5)', backdropFilter: 'blur(16px)', boxShadow: isLightMode ? '0 4px 24px rgba(0,0,0,0.04)' : '0 4px 24px rgba(0,0,0,0.2)' }}>
                <table className="data-table" style={{ margin: 0 }}>
                    <thead>
                        <tr style={{
                            background: isLightMode ? '#f8fafc' : 'rgba(0,0,0,0.2)',
                            fontSize: '0.75rem',
                            color: 'var(--text-muted)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                        }}>
                            <th style={{ padding: '1.25rem', fontWeight: '800' }}>Leave Dates</th>
                            <th style={{ padding: '1.25rem', fontWeight: '800' }}>Leave Type</th>
                            <th style={{ padding: '1.25rem', fontWeight: '800' }}>Status</th>
                            <th style={{ padding: '1.25rem', fontWeight: '800' }}>Requested By</th>
                            <th style={{ padding: '1.25rem', fontWeight: '800' }}>Action Taken On</th>
                            <th style={{ padding: '1.25rem', fontWeight: '800' }}>Leave Note</th>
                            <th style={{ padding: '1.25rem', fontWeight: '800' }}>Reject/Cancellation Reason</th>
                        </tr>
                    </thead>
                    <tbody>
                        {myRequests.filter(r => ['Leave Application', 'Half Day', 'Comp Off'].includes(r.type)).length > 0 ? myRequests.filter(r => ['Leave Application', 'Half Day', 'Comp Off'].includes(r.type)).map(h => (
                            <tr key={h._id} style={{
                                borderBottom: `1px solid ${isLightMode ? '#e2e8f0' : 'rgba(255,255,255,0.06)'}`,
                                transition: 'background 0.2s',
                                cursor: 'default',
                            }}
                                onMouseOver={e => e.currentTarget.style.backgroundColor = isLightMode ? '#f8fafc' : 'rgba(255,255,255,0.02)'}
                                onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                                <td style={{ fontSize: '0.85rem', fontWeight: '700', padding: '1.25rem', color: 'var(--text-main)' }}>
                                    {new Date(h.startDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    {h.startDate !== h.endDate && ` - ${new Date(h.endDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}`}
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '3px', fontWeight: '500' }}>
                                        {Math.ceil((new Date(h.endDate) - new Date(h.startDate)) / (1000 * 60 * 60 * 24)) + 1} day(s)
                                    </div>
                                </td>
                                <td style={{ fontSize: '0.85rem', padding: '1.25rem', fontWeight: '600', color: 'var(--text-main)' }}>
                                    {h.type === 'Comp Off' ? 'Comp Off' : (h.leaveType ? `${h.leaveType} Leave` : h.type)}
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '500', marginTop: '3px' }}>Requested on {new Date(h.createdAt).toLocaleDateString()}</div>
                                </td>
                                <td style={{ padding: '1.25rem' }}>
                                    <span style={{
                                        padding: '0.4rem 0.8rem',
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
                                        <div style={{ fontSize: '0.65rem', color: isLightMode ? 'rgba(0,0,0,0.6)' : 'var(--text-muted)', marginTop: '5px', fontWeight: '500' }}>by {h.actionBy.name}</div>
                                    )}
                                </td>
                                <td style={{ fontSize: '0.85rem', padding: '1.25rem', fontWeight: '600' }}>{user.name}</td>
                                <td style={{ fontSize: '0.85rem', padding: '1.25rem', fontWeight: '500', color: 'var(--text-muted)' }}>{h.status !== 'Pending' && h.actionDate ? new Date(h.actionDate).toLocaleDateString() : '-'}</td>
                                <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', padding: '1.25rem', fontWeight: '500' }}>{h.message || '-'}</td>
                                <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', padding: '1.25rem', fontWeight: '500' }}>{h.actionNote || '-'}</td>
                            </tr>
                        )) : (
                            <tr style={{ border: 'none' }}><td colSpan="7" style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: '500' }}>No leave history found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
            {/* ── Leave Detail Modal ── */}
            {showDetailModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '1.5rem', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)'
                }}>
                    <div style={{
                        ...bentoPanelStyle,
                        maxWidth: '800px', width: '100%', maxHeight: '85vh',
                        padding: '2.5rem', position: 'relative', overflow: 'hidden',
                        animation: 'modalSlideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}>
                        <div style={{
                            position: 'absolute', top: 0, left: 0, right: 0, height: '6px',
                            background: `linear-gradient(90deg, ${[
                                { key: 'Casual', color: '#ff00cc' },
                                { key: 'Paid', color: '#ffab00' },
                                { key: 'Sick', color: '#10b981' },
                                { key: 'Comp Off', color: '#3b82f6' }
                            ].find(l => l.key === selectedType)?.color || 'var(--primary)'}, transparent)`
                        }}></div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                            <div>
                                <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: '900', color: 'var(--text-main)', letterSpacing: '-0.8px' }}>
                                    {selectedType} Leave <span style={{ color: 'var(--text-muted)', fontWeight: '500', marginLeft: '0.5rem' }}>Details</span>
                                </h2>
                                <p style={{ margin: '0.5rem 0 0', fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '500' }}>Review your {selectedType?.toLowerCase()} leave usage and history</p>
                            </div>
                            <div 
                                onClick={() => setShowDetailModal(false)}
                                style={{ 
                                    width: '40px', height: '40px', borderRadius: '12px', background: isLightMode ? '#f1f5f9' : 'rgba(255,255,255,0.05)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; e.currentTarget.style.color = '#ef4444'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = isLightMode ? '#f1f5f9' : 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                            >
                                <X size={20} />
                            </div>
                        </div>

                        <div style={{ overflowY: 'auto', flex: 1, paddingRight: '0.5rem' }} className="custom-scrollbar">
                            {myRequests.filter(r => 
                                (r.type === 'Leave Application' && r.leaveType === selectedType) || 
                                (r.type === 'Comp Off' && selectedType === 'Comp Off')
                            ).length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {myRequests.filter(r => 
                                        (r.type === 'Leave Application' && r.leaveType === selectedType) || 
                                        (r.type === 'Comp Off' && selectedType === 'Comp Off')
                                    ).map((req, i) => (
                                        <div key={req._id} style={{
                                            padding: '1.5rem', borderRadius: '20px',
                                            background: isLightMode ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.03)',
                                            border: `1px solid ${isLightMode ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)'}`,
                                            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem'
                                        }}>
                                            <div style={{ gridColumn: 'span 1' }}>
                                                <div style={labelStyle}>Duration</div>
                                                <div style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--text-main)', marginTop: '0.4rem' }}>
                                                    {new Date(req.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                    {req.startDate !== req.endDate && ` — ${new Date(req.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`}
                                                </div>
                                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px', fontWeight: '600' }}>
                                                    {Math.ceil((new Date(req.endDate) - new Date(req.startDate)) / (1000 * 60 * 60 * 24)) + 1} day(s)
                                                </div>
                                            </div>
                                            
                                            <div style={{ gridColumn: 'span 1' }}>
                                                <div style={labelStyle}>Approver</div>
                                                <div style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-main)', marginTop: '0.4rem' }}>
                                                    {req.actionBy?.name || req.recipients?.[0]?.name || '-'}
                                                </div>
                                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px', fontWeight: '500' }}>
                                                    {req.status === 'Pending' ? 'Awaiting Action' : `Action on ${new Date(req.actionDate).toLocaleDateString()}`}
                                                </div>
                                            </div>

                                            <div style={{ gridColumn: 'span 1' }}>
                                                <div style={labelStyle}>Status</div>
                                                <div style={{ marginTop: '0.4rem' }}>
                                                    <span style={{
                                                        padding: '0.4rem 0.8rem', borderRadius: '20px',
                                                        fontSize: '0.7rem', fontWeight: '800',
                                                        textTransform: 'uppercase', letterSpacing: '0.5px',
                                                        ...getStatusStyle(req.status)
                                                    }}>
                                                        {req.status}
                                                    </span>
                                                </div>
                                            </div>

                                            <div style={{ gridColumn: 'span 4', borderTop: `1px solid ${isLightMode ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)'}`, paddingTop: '1rem' }}>
                                                <div style={labelStyle}>Reason</div>
                                                <p style={{ margin: '0.4rem 0 0', fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: '1.6', fontWeight: '500' }}>
                                                    {req.message || 'No reason provided.'}
                                                </p>
                                                {req.actionNote && (
                                                    <div style={{ marginTop: '0.75rem', padding: '0.75rem 1rem', background: isLightMode ? '#fff' : 'rgba(0,0,0,0.2)', borderRadius: '12px', borderLeft: `3px solid var(--primary)` }}>
                                                        <div style={{ fontSize: '0.65rem', color: 'var(--primary)', fontWeight: '800', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Approver Note</div>
                                                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-main)', fontWeight: '500' }}>{req.actionNote}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)' }}>
                                    <TrendingUp size={48} style={{ opacity: 0.1, marginBottom: '1rem' }} />
                                    <p style={{ fontSize: '1rem', fontWeight: '600' }}>No history found for this leave type.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes modalSlideIn {
                    from { opacity: 0; transform: translateY(20px) scale(0.98); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); borderRadius: 10px; }
                ${isLightMode ? '.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); }' : ''}
            `}</style>
        </div>
    );
};


export default LeaveTab;
