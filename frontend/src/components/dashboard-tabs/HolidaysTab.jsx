import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar as CalendarIcon, MapPin, CheckCircle, Settings } from 'lucide-react';
import api from '../../api/axios';

export default function HolidaysTab({ onBack, isLightMode, user, onEdit }) {
    const [holidays, setHolidays] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHolidays = async () => {
            try {
                const { data } = await api.get('/dashboard/holidays');
                setHolidays(data);
            } catch (error) {
                console.error('Failed to fetch holidays:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchHolidays();
    }, []);

    // Helper functions for nice dates
    const getMonth = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
    };

    const getDay = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', { day: '2-digit' });
    };

    const getDayOfWeek = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', { weekday: 'long' });
    };

    const getFullDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const isPast = (dateString) => {
        const holidayDate = new Date(dateString);
        holidayDate.setHours(0, 0, 0, 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return holidayDate < today;
    };

    return (
        <div style={{ padding: '0 0 2rem 0', animation: 'fadeIn 0.4s ease-out' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <button
                        onClick={onBack}
                        style={{
                            background: isLightMode ? '#ffffff' : 'rgba(255,255,255,0.05)',
                            border: isLightMode ? '1px solid #e2e8f0' : '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '12px',
                            color: 'var(--text-main)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '40px',
                            height: '40px',
                            cursor: 'pointer',
                            marginRight: '1rem',
                            transition: 'all 0.2s ease',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                        }}
                        onMouseOver={(e) => { e.currentTarget.style.color = 'var(--primary)'; e.currentTarget.style.transform = 'translateX(-2px)'; }}
                        onMouseOut={(e) => { e.currentTarget.style.color = 'var(--text-main)'; e.currentTarget.style.transform = 'translateX(0)'; }}
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <h1 style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--text-main)', margin: 0, letterSpacing: '-0.3px' }}>Company Holidays</h1>
                        <p style={{ color: 'var(--text-muted)', margin: '0.2rem 0 0 0', fontSize: '0.85rem', fontWeight: '500' }}>Official holiday calendar for the year</p>
                    </div>
                </div>
                {user?.role === 'Super Admin' && (
                    <button
                        onClick={onEdit}
                        style={{
                            background: 'linear-gradient(135deg, var(--primary) 0%, #2563eb 100%)',
                            color: '#ffffff',
                            border: 'none',
                            padding: '0.7rem 1.25rem',
                            borderRadius: '12px',
                            fontWeight: '700',
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)',
                            transition: 'all 0.2s ease',
                        }}
                        onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.5)'; }}
                        onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(59, 130, 246, 0.4)'; }}
                    >
                        <Settings size={16} /> Edit Holidays
                    </button>
                )}
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                    <div className="spinner" style={{ margin: '0 auto 1rem', width: '30px', height: '30px', border: '3px solid rgba(var(--primary-rgb, 59, 130, 246), 0.3)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                    Loading holidays...
                </div>
            ) : holidays.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '5rem', background: 'var(--bg-panel)', borderRadius: '24px', border: isLightMode ? '1px dashed #cbd5e1' : '1px dashed rgba(255,255,255,0.1)' }}>
                    <CalendarIcon size={64} color="var(--primary)" style={{ margin: '0 auto 1.5rem', opacity: 0.5 }} />
                    <h3 style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '0.5rem' }}>No Holidays Configured</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>There are currently no holidays set up in the system.</p>
                </div>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: '1.5rem'
                }}>
                    {holidays.map((holiday, idx) => {
                        const past = isPast(holiday.date);
                        return (
                            <div
                                key={holiday._id || idx}
                                style={{
                                    background: past ? (isLightMode ? 'rgba(248,250,252,0.8)' : 'rgba(15,23,42,0.5)') : (isLightMode ? '#ffffff' : 'var(--bg-panel)'),
                                    border: isLightMode ? (past ? '1px solid #e2e8f0' : '1px solid #e0e7ff') : (past ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(59, 130, 246, 0.1)'),
                                    borderRadius: '20px',
                                    padding: '1.5rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1.25rem',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    boxShadow: past ? 'none' : (isLightMode ? '0 10px 30px rgba(0,0,0,0.03)' : '0 10px 30px rgba(0,0,0,0.2)'),
                                    transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.3s ease',
                                    cursor: 'default',
                                    opacity: past ? 0.6 : 1
                                }}
                                onMouseOver={(e) => {
                                    if (!past) {
                                        e.currentTarget.style.transform = 'translateY(-5px) scale(1.02)';
                                        e.currentTarget.style.boxShadow = isLightMode ? '0 20px 40px rgba(0,0,0,0.06)' : '0 20px 40px rgba(0,0,0,0.4)';
                                    }
                                }}
                                onMouseOut={(e) => {
                                    if (!past) {
                                        e.currentTarget.style.transform = 'translateY(0) scale(1)';
                                        e.currentTarget.style.boxShadow = isLightMode ? '0 10px 30px rgba(0,0,0,0.03)' : '0 10px 30px rgba(0,0,0,0.2)';
                                    }
                                }}
                            >
                                {/* Background Accent Glow */}
                                {!past && (
                                    <div style={{
                                        position: 'absolute',
                                        top: 0, right: 0,
                                        width: '150px', height: '150px',
                                        background: isLightMode ? 'radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, transparent 70%)' : 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)',
                                        transform: 'translate(40%, -40%)',
                                        pointerEvents: 'none'
                                    }} />
                                )}

                                {/* Date Box */}
                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '72px',
                                    height: '72px',
                                    borderRadius: '16px',
                                    background: past ? (isLightMode ? '#e2e8f0' : '#1e293b') : (isLightMode ? 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)' : 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(37, 99, 235, 0.1) 100%)'),
                                    color: past ? 'var(--text-muted)' : 'var(--primary)',
                                    border: past ? 'none' : `1px solid ${isLightMode ? '#bfdbfe' : 'rgba(59, 130, 246, 0.3)'}`,
                                    flexShrink: 0,
                                    boxShadow: past ? 'none' : 'inset 0 2px 4px rgba(255,255,255,0.4)',
                                    zIndex: 1
                                }}>
                                    <span style={{ fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.9 }}>{getMonth(holiday.date)}</span>
                                    <span style={{ fontSize: '1.6rem', fontWeight: '800', lineHeight: '1.1', color: past ? 'var(--text-muted)' : (isLightMode ? '#1e3a8a' : '#ffffff') }}>{getDay(holiday.date)}</span>
                                </div>

                                {/* Details */}
                                <div style={{ flex: 1, minWidth: 0, zIndex: 1 }}>
                                    <h3 style={{
                                        fontSize: '1.15rem',
                                        fontWeight: '800',
                                        color: past ? 'var(--text-muted)' : 'var(--text-main)',
                                        margin: '0 0 0.4rem 0',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        letterSpacing: '-0.2px'
                                    }}>
                                        {holiday.name}
                                    </h3>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: past ? 'var(--text-muted)' : (isLightMode ? '#475569' : '#94a3b8'), fontSize: '0.85rem', fontWeight: '600' }}>
                                            <CalendarIcon size={14} style={{ opacity: 0.7 }} />
                                            <span>{getDayOfWeek(holiday.date)}</span>
                                        </div>
                                    </div>
                                </div>
                                {past && (
                                    <div style={{ position: 'absolute', bottom: '1rem', right: '1.25rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <CheckCircle size={14} />
                                        Past
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
            <style>{`
                @keyframes spin { 100% { transform: rotate(360deg); } }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(15px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
