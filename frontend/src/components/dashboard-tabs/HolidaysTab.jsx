import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar as CalendarIcon, MapPin, CheckCircle } from 'lucide-react';
import api from '../../api/axios';

export default function HolidaysTab({ onBack, isLightMode }) {
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
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
                <button
                    onClick={onBack}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-main)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        fontWeight: '500',
                        padding: '0.5rem 0',
                        marginRight: '1rem',
                        transition: 'color 0.2s ease',
                    }}
                    onMouseOver={(e) => e.target.style.color = 'var(--primary)'}
                    onMouseOut={(e) => e.target.style.color = 'var(--text-main)'}
                >
                    <ArrowLeft size={18} />
                    Back
                </button>
                <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-main)', margin: 0 }}>Company Holidays</h1>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                    <div className="spinner" style={{ margin: '0 auto 1rem', width: '30px', height: '30px', border: '3px solid rgba(var(--primary-rgb, 59, 130, 246), 0.3)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                    Loading holidays...
                </div>
            ) : holidays.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '5rem', background: 'var(--bg-panel)', borderRadius: '16px', border: '1px solid var(--border-dark)' }}>
                    <CalendarIcon size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                    <h3 style={{ fontSize: '1.2rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>No Holidays Configured</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>There are currently no holidays set up in the system.</p>
                </div>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '1.5rem'
                }}>
                    {holidays.map((holiday, idx) => {
                        const past = isPast(holiday.date);
                        return (
                            <div
                                key={holiday._id || idx}
                                style={{
                                    background: past ? (isLightMode ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.02)') : 'var(--bg-panel)',
                                    border: '1px solid',
                                    borderColor: past ? 'transparent' : 'var(--border-dark)',
                                    borderRadius: '16px',
                                    padding: '1.5rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1.25rem',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    boxShadow: past ? 'none' : '0 4px 20px rgba(0,0,0,0.05)',
                                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                                    cursor: 'default',
                                    opacity: past ? 0.6 : 1
                                }}
                                onMouseOver={(e) => {
                                    if (!past) {
                                        e.currentTarget.style.transform = 'translateY(-4px)';
                                        e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';
                                    }
                                }}
                                onMouseOut={(e) => {
                                    if (!past) {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.05)';
                                    }
                                }}
                            >
                                {/* Active subtle glow effect */}
                                {!past && (
                                    <div style={{
                                        position: 'absolute',
                                        top: 0, right: 0,
                                        width: '100px', height: '100px',
                                        background: 'radial-gradient(circle, rgba(var(--primary-rgb, 59, 130, 246), 0.15) 0%, transparent 70%)',
                                        transform: 'translate(30%, -30%)'
                                    }} />
                                )}

                                {/* Date Box */}
                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '64px',
                                    height: '64px',
                                    borderRadius: '12px',
                                    background: past ? (isLightMode ? '#e5e7eb' : '#374151') : (isLightMode ? '#eff6ff' : 'rgba(59, 130, 246, 0.15)'),
                                    color: past ? 'var(--text-muted)' : 'var(--primary)',
                                    border: past ? 'none' : `1px solid ${isLightMode ? '#bfdbfe' : 'rgba(59, 130, 246, 0.3)'}`,
                                    flexShrink: 0,
                                    boxShadow: past ? 'none' : 'inset 0 2px 4px rgba(255,255,255,0.1)'
                                }}>
                                    <span style={{ fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.9 }}>{getMonth(holiday.date)}</span>
                                    <span style={{ fontSize: '1.4rem', fontWeight: '800', lineHeight: '1.1' }}>{getDay(holiday.date)}</span>
                                </div>

                                {/* Details */}
                                <div style={{ flex: 1, minWidth: 0, zIndex: 1 }}>
                                    <h3 style={{
                                        fontSize: '1.1rem',
                                        fontWeight: '700',
                                        color: past ? 'var(--text-muted)' : 'var(--text-main)',
                                        margin: '0 0 0.35rem 0',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis'
                                    }}>
                                        {holiday.name}
                                    </h3>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                            <CalendarIcon size={14} />
                                            <span>{getDayOfWeek(holiday.date)} - {getFullDate(holiday.date)}</span>
                                        </div>
                                    </div>
                                </div>
                                {past && (
                                    <div style={{ position: 'absolute', bottom: '1rem', right: '1rem', color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <CheckCircle size={12} />
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
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
