import React, { useState } from 'react';
import { Calendar, Clock, FileText, HelpCircle, Info, Home, LogOut, Zap, LayoutDashboard, MoreVertical, Edit3, X, Send, CheckCircle2, History, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import api from '../../api/axios.js';

const AttendanceTab = ({
    user,
    activeLog,
    isClockedIn,
    currentTime,
    attendanceLogs,
    myLeaves,
    dashData,
    statsPeriod,
    setStatsPeriod,
    meStats,
    teammateIndividualStats,
    fetchTeamStats,
    calculateElapsedTime,
    handleClockToggle,
    isAttendanceFinished,
    isWFH,
    selectedWorkingMode,
    setShowAttendancePolicyModal,
    attendanceTab,
    setAttendanceTab,
    attendancePeriod,
    setAttendancePeriod,
    filteredAttendanceLogs,
    setShowLogInfo,
    currentCalendarMonth,
    setCurrentCalendarMonth,
    currentCalendarYear,
    setCurrentCalendarYear,
    myRequests,
    getStatusStyle,
    isLightMode,
    systemSettings,
    showAlert
}) => {

    const [activeMenu, setActiveMenu] = useState(null);
    const [activeTooltip, setActiveTooltip] = useState(null);
    const [showRegularizeModal, setShowRegularizeModal] = useState(false);
    const [regularizeLog, setRegularizeLog] = useState(null);
    const [regularizeReason, setRegularizeReason] = useState('');
    const [regularizeExpectedClockIn, setRegularizeExpectedClockIn] = useState('');
    const [regularizeExpectedClockOut, setRegularizeExpectedClockOut] = useState('');
    const [isSubmittingRegularize, setIsSubmittingRegularize] = useState(false);

    // Auto-close dropdown when clicking outside
    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.action-menu-container')) {
                setActiveMenu(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const submitRegularization = async () => {
        if (!regularizeReason.trim()) {
            showAlert('Please provide a reason for regularization.', 'error');
            return;
        }
        setIsSubmittingRegularize(true);
        try {
            const payload = {
                type: 'Attendance Regularization',
                startDate: regularizeLog.date,
                endDate: regularizeLog.date,
                message: regularizeReason.trim(),
                expectedClockIn: regularizeExpectedClockIn,
                expectedClockOut: regularizeExpectedClockOut,
                recipients: [user.reportingManager],
                associatedAttendance: regularizeLog._id
            };
            await api.post('/requests', payload);
            showAlert('Regularization request submitted successfully.', 'success');
            setShowRegularizeModal(false);
            setRegularizeReason('');
            setRegularizeExpectedClockIn('');
            setRegularizeExpectedClockOut('');
            setRegularizeLog(null);
        } catch (error) {
            console.error('Error submitting regularization:', error);
            showAlert(error.response?.data?.message || 'Failed to submit regularization request.', 'error');
        } finally {
            setIsSubmittingRegularize(false);
        }
    };

    const getAttendanceProgress = () => {
        if (!isClockedIn || !activeLog?.clockInTime) return 0;
        const elapsed = calculateElapsedTime(activeLog.clockInTime);
        const shiftMins = (systemSettings?.workingHoursPerDay || 8) * 60;
        return Math.min(elapsed.totalMins / shiftMins, 1);
    };

    const renderHourglass = () => {
        const progress = getAttendanceProgress();
        const sandColor = "#fbbf24";

        return (
            <div style={{ position: 'relative', width: '40px', height: '55px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: '25px' }} title={`${Math.round(progress * 100)}% of shift completed`}>
                <svg width="40" height="55" viewBox="0 0 40 55" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}>
                    <path d="M10,5 L30,5 M10,50 L30,50" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round" />
                    <path d="M11,6 C11,22 20,27.5 20,27.5 C20,27.5 29,22 29,6 Z" fill="none" stroke="var(--primary)" strokeWidth="1.5" strokeOpacity="0.5" />
                    <path d="M11,49 C11,33 20,27.5 20,27.5 C20,27.5 29,33 29,49 Z" fill="none" stroke="var(--primary)" strokeWidth="1.5" strokeOpacity="0.5" />
                    <path
                        d={`M20,27.5 L${29 - (progress * 9)},${6 + (progress * 21)} L${11 + (progress * 9)},${6 + (progress * 21)} Z`}
                        fill={sandColor}
                        style={{ transition: 'all 1s ease' }}
                    />
                    <path
                        d={`M${11 + (1 - progress) * 9},49 L${29 - (1 - progress) * 9},49 Q20,${49 - progress * 21} 20,${49 - progress * 21} Z`}
                        fill={sandColor}
                        style={{ transition: 'all 1s ease' }}
                    />
                    {isClockedIn && progress < 1 && (
                        <line x1="20" y1="27" x2="20" y2="48" stroke={sandColor} strokeWidth="1.5" className="timer-pulse" strokeDasharray="2,2" />
                    )}
                </svg>
            </div>
        );
    };

    const renderAttendanceCalendar = () => {
        const daysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
        const firstDayOfMonth = (month, year) => new Date(year, month, 1).getDay();

        const currentMonthData = [];
        const totalDays = daysInMonth(currentCalendarMonth, currentCalendarYear);
        const startOffset = (firstDayOfMonth(currentCalendarMonth, currentCalendarYear) + 6) % 7;

        for (let i = 0; i < startOffset; i++) {
            currentMonthData.push({ day: '', type: 'empty' });
        }

        const today = new Date();
        const todayStr = today.toLocaleDateString('en-CA');

        for (let d = 1; d <= totalDays; d++) {
            const dateObj = new Date(currentCalendarYear, currentCalendarMonth, d);
            const dateStr = dateObj.toLocaleDateString('en-CA');

            let status = null;
            let label = '';
            let color = 'transparent';
            let bgColor = 'transparent';
            let type = 'day';

            const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
            if (user?.workingSchedule?.weekOffs?.includes(dayName)) {
                status = 'week-off';
                label = 'OFF';
                color = '#94a3b8';
                bgColor = 'rgba(148, 163, 184, 0.08)';
            }

            const log = attendanceLogs.find(l => new Date(l.date).toLocaleDateString('en-CA') === dateStr);
            if (log) {
                if (log.workingMode === 'Remote') {
                    status = 'wfh';
                    label = 'HOME';
                    color = '#00ffa2';
                    bgColor = 'rgba(96, 165, 250, 0.15)';
                } else {
                    status = 'present';
                    label = 'OFFICE';
                    color = '#34d399';
                    bgColor = 'rgba(52, 211, 153, 0.15)';
                }
            }

            const leave = myLeaves.find(l => {
                const start = new Date(l.startDate).setHours(0, 0, 0, 0);
                const end = new Date(l.endDate).setHours(0, 0, 0, 0);
                const current = dateObj.setHours(0, 0, 0, 0);
                return current >= start && current <= end && l.status === 'Approved';
            });
            if (leave) {
                const isCancelled = leave.cancelledDates?.some(d => new Date(d).toLocaleDateString('en-CA') === dateStr);
                if (!isCancelled) {
                    status = 'leave';
                    label = leave.type ? `LEAVE: ${leave.type.toUpperCase()}` : 'LEAVE';
                    color = '#00f2fe';
                    bgColor = 'rgba(0, 242, 254, 0.15)';
                }
            }

            const holiday = dashData.holidays?.find(h => new Date(h.date).toLocaleDateString('en-CA') === dateStr);
            if (holiday) {
                status = 'holiday';
                label = holiday.name;
                color = '#f87171';
                bgColor = 'rgba(248, 113, 113, 0.15)';
            }

            currentMonthData.push({ day: d, status, label, date: dateStr, color, bgColor, type, isToday: dateStr === todayStr });
        }

        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

        return (
            <div style={{ maxWidth: '750px', margin: '0 auto', animation: 'fadeIn 0.4s ease-out' }}>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    background: 'var(--bg-panel)',
                    padding: '1.25rem',
                    borderRadius: '20px',
                    border: '1px solid var(--border-dark)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                    backdropFilter: 'blur(10px)',
                    marginBottom: '1.5rem'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: '800', margin: 0, letterSpacing: '-0.5px', color: 'var(--text-main)' }}>{months[currentCalendarMonth]}</h2>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '500' }}>Year {currentCalendarYear}</p>
                        </div>

                        <div style={{ display: 'flex', background: 'var(--bg-main)', borderRadius: '12px', padding: '0.25rem', border: '1px solid var(--border-dark)' }}>
                            <button className="btn-icon" onClick={() => {
                                if (currentCalendarMonth === 0) { setCurrentCalendarMonth(11); setCurrentCalendarYear(currentCalendarYear - 1); }
                                else { setCurrentCalendarMonth(currentCalendarMonth - 1); }
                            }} style={{ padding: '0.4rem 0.8rem', background: 'transparent', border: 'none', color: 'var(--text-main)', cursor: 'pointer', fontSize: '1.1rem' }}>‹</button>

                            <div style={{ display: 'flex', gap: '4px', alignItems: 'center', margin: '0 0.5rem' }}>
                                {['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'].slice(0, new Date().getMonth() + 1).map((m, idx) => (
                                    <button
                                        key={m}
                                        onClick={() => { setCurrentCalendarMonth(idx); setCurrentCalendarYear(new Date().getFullYear()); }}
                                        style={{
                                            padding: '0.35rem 0.65rem',
                                            fontSize: '0.65rem',
                                            fontWeight: '800',
                                            background: (currentCalendarMonth === idx && currentCalendarYear === new Date().getFullYear()) ? 'var(--primary)' : 'transparent',
                                            color: (currentCalendarMonth === idx && currentCalendarYear === new Date().getFullYear()) ? '#ffffff' : 'var(--text-muted)',
                                            border: 'none',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                                        }}
                                    >
                                        {m}
                                    </button>
                                ))}
                            </div>

                            <button className="btn-icon" onClick={() => {
                                if (currentCalendarMonth === 11) { setCurrentCalendarMonth(0); setCurrentCalendarYear(currentCalendarYear + 1); }
                                else { setCurrentCalendarMonth(currentCalendarMonth + 1); }
                            }} style={{ padding: '0.4rem 0.8rem', background: 'transparent', border: 'none', color: 'var(--text-main)', cursor: 'pointer', fontSize: '1.1rem' }}>›</button>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1.25rem', padding: '0.75rem 0', borderTop: '1px solid var(--border-dark)' }}>
                        {[
                            { color: '#00ff88', label: 'Office' },
                            { color: '#00ffa2', label: 'Remote' },
                            { color: '#00f2fe', label: 'Leave' },
                            { color: '#f87171', label: 'Holiday' }
                        ].map(legend => (
                            <div key={legend.label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: legend.color, boxShadow: `0 0 10px ${legend.color}40` }}></div>
                                {legend.label}
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(7, 1fr)',
                    gap: '10px',
                    padding: '1.5rem',
                    background: 'var(--bg-panel)',
                    borderRadius: '24px',
                    border: '1px solid var(--border-dark)',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.05)'
                }}>
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(h => (
                        <div key={h} style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '0.5rem' }}>{h}</div>
                    ))}
                    {currentMonthData.map((item, i) => (
                        <div key={i} className="calendar-cell" style={{
                            minHeight: '70px',
                            background: item.type === 'empty' ? 'transparent' : (item.isToday ? 'rgba(var(--primary-rgb, 155, 89, 182), 0.1)' : 'var(--bg-main)'),
                            borderRadius: '16px',
                            border: item.type === 'empty' ? 'none' : (item.isToday ? '1px solid var(--primary)' : '1px solid var(--border-dark)'),
                            padding: '0.6rem',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            cursor: item.type === 'empty' ? 'default' : 'pointer',
                            overflow: 'hidden',
                            boxShadow: item.isToday ? '0 0 20px rgba(var(--primary-rgb, 155, 89, 182), 0.15)' : 'none'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <span style={{
                                    fontSize: '0.9rem',
                                    fontWeight: '800',
                                    color: item.isToday ? 'var(--primary)' : (item.type === 'empty' ? 'transparent' : 'var(--text-main)'),
                                    opacity: item.type === 'empty' ? 0 : 1
                                }}>{item.day}</span>
                                {item.isToday && <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--primary)', boxShadow: '0 0 8px var(--primary)' }}></div>}
                            </div>

                            {item.status && (
                                <div style={{
                                    fontSize: '0.55rem',
                                    fontWeight: '900',
                                    padding: '4px 6px',
                                    borderRadius: '8px',
                                    textAlign: 'center',
                                    color: item.color,
                                    background: item.bgColor,
                                    border: `1px solid ${item.color}40`,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px'
                                }}>
                                    {item.label}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                <style>{`
                    .calendar-cell:hover {
                        transform: translateY(-4px);
                        filter: brightness(1.05);
                        border-color: var(--primary) !important;
                        box-shadow: 0 10px 20px rgba(0,0,0,0.1) !important;
                    }
                    @keyframes fadeIn {
                        from { opacity: 0; transform: translateY(10px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                `}</style>
            </div>
        );
    };

    const bentoPanelStyle = {
        padding: '1.5rem',
        borderRadius: '24px',
        background: isLightMode
            ? 'linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.8) 100%)'
            : 'linear-gradient(145deg, rgba(30,30,30,0.9) 0%, rgba(20,20,20,0.6) 100%)',
        border: `1px solid ${isLightMode ? 'rgba(226, 232, 240, 0.8)' : 'rgba(255, 255, 255, 0.05)'}`,
        boxShadow: isLightMode
            ? '0 10px 40px -10px rgba(0,0,0,0.05)'
            : '0 10px 40px -10px rgba(0,0,0,0.3)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden'
    };

    return (
        <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            {/* Bento Grid Top */}
            <div className="grid" style={{
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '1.5rem',
                marginBottom: '1.5rem'
            }}>
                {/* Stats Panel */}
                {/* Stats Panel */}
                <div style={bentoPanelStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                        <span style={{ fontSize: '1.05rem', fontWeight: '800', letterSpacing: '-0.3px', color: 'var(--text-main)' }}>Attendance Stats</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', fontWeight: '700', color: 'var(--primary)', background: 'rgba(var(--primary-rgb), 0.1)', padding: '0.4rem 0.8rem', borderRadius: '12px' }}>
                            <Calendar size={14} /> Last 7 Days
                        </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'stretch', background: isLightMode ? '#f8fafc' : 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '20px', border: `1px solid ${isLightMode ? '#e2e8f0' : 'rgba(255,255,255,0.05)'}` }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.2rem', fontWeight: '700' }}>Avg Hrs/Day</div>
                                <div style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--text-main)', display: 'flex', alignItems: 'baseline', gap: '0.1rem' }}>
                                    {(() => {
                                        let totalHours = 0;
                                        for(let i = 0; i < 7; i++){
                                            const d = new Date(); d.setDate(d.getDate() - i); d.setHours(0,0,0,0);
                                            const l = attendanceLogs?.find(lg => new Date(lg.date).setHours(0,0,0,0) === d.getTime());
                                            totalHours += (l?.totalHours || 0);
                                        }
                                        const avg = totalHours / 7;
                                        return (
                                            <>
                                                {Math.floor(avg)}<span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600', marginRight: '4px' }}>h</span>
                                                {Math.round((avg % 1) * 60)}<span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>m</span>
                                            </>
                                        );
                                    })()}
                                </div>
                            </div>
                            <div style={{ width: '1px', background: isLightMode ? '#e2e8f0' : 'rgba(255,255,255,0.1)', margin: '0 1rem' }}></div>
                            <div style={{ flex: 1, textAlign: 'right' }}>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.2rem', fontWeight: '700' }}>On Time Ratio</div>
                                <div style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--success)', display: 'flex', alignItems: 'baseline', gap: '0.1rem', justifyContent: 'flex-end' }}>
                                    {(() => {
                                        let onTimeCount = 0;
                                        let logsCount = 0;
                                        const [sh, sm] = (user?.workingSchedule?.shiftStart || '11:00').split(':').map(Number);
                                        const shiftStartMins = sh * 60 + sm;
                                        for(let i = 0; i < 7; i++){
                                            const d = new Date(); d.setDate(d.getDate() - i); d.setHours(0,0,0,0);
                                            const l = attendanceLogs?.find(lg => new Date(lg.date).setHours(0,0,0,0) === d.getTime());
                                            if (l?.clockInTime) {
                                                logsCount++;
                                                const cin = new Date(l.clockInTime);
                                                const mins = cin.getHours() * 60 + cin.getMinutes();
                                                if(mins <= shiftStartMins + 60) onTimeCount++;
                                            }
                                        }
                                        return logsCount > 0 ? Math.round((onTimeCount / logsCount) * 100) + '%' : '0%';
                                    })()}
                                </div>
                            </div>
                        </div>

                        {/* Chart Area */}
                        <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '6px', position: 'relative', marginTop: 'auto', paddingTop: '1.5rem', minHeight: '120px' }}>
                            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', borderTop: `1px dashed ${isLightMode ? '#e2e8f0' : 'rgba(255,255,255,0.08)'}`, zIndex: 0 }}></div>
                            <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', borderTop: `1px dashed ${isLightMode ? '#e2e8f0' : 'rgba(255,255,255,0.08)'}`, zIndex: 0 }}></div>
                            
                            {(() => {
                                const targetHours = user?.workingSchedule?.minHours || 7.0;
                                const chartData = [];
                                for (let i = 6; i >= 0; i--) {
                                    const d = new Date();
                                    d.setDate(d.getDate() - i);
                                    d.setHours(0,0,0,0);
                                    const log = attendanceLogs?.find(lg => new Date(lg.date).setHours(0,0,0,0) === d.getTime());
                                    const worked = log?.totalHours || 0;
                                    chartData.push({
                                        day: d.toLocaleDateString('en-US', { weekday: 'short' }),
                                        dateLabel: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                                        hours: worked,
                                        isToday: i === 0
                                    });
                                }
                                
                                const maxH = Math.max(10, ...chartData.map(d => d.hours));

                                return chartData.map((d, i) => {
                                    const heightPct = Math.max(4, Math.min((d.hours / maxH) * 100, 100)); // min 4% to show a dot if > 0
                                    const isShort = d.hours > 0 && d.hours < targetHours;
                                    const isZero = d.hours === 0;

                                    return (
                                        <div key={i} title={`${d.dateLabel}: ${Math.floor(d.hours)}h ${Math.round((d.hours%1)*60)}m`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, zIndex: 1, cursor: 'pointer' }}>
                                            <div style={{ 
                                                height: '100px', 
                                                width: '100%', 
                                                position: 'relative', 
                                                display: 'flex', 
                                                alignItems: 'flex-end', 
                                                justifyContent: 'center',
                                                background: isZero ? 'transparent' : (isLightMode ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.02)'),
                                                borderRadius: '6px',
                                                padding: '2px',
                                            }}>
                                                <div 
                                                    style={{
                                                        width: '100%',
                                                        maxWidth: '24px',
                                                        height: isZero ? '4px' : `${heightPct}%`,
                                                        background: isZero 
                                                            ? (isLightMode ? '#e2e8f0' : 'rgba(255,255,255,0.1)') 
                                                            : (d.isToday ? 'linear-gradient(to top, var(--primary), #60a5fa)' : (isShort ? 'linear-gradient(to top, #f59e0b, #fbbf24)' : 'linear-gradient(to top, #10b981, #34d399)')),
                                                        borderRadius: isZero ? '4px' : '6px 6px 4px 4px',
                                                        boxShadow: d.isToday ? '0 4px 12px rgba(var(--primary-rgb), 0.3)' : (isZero ? 'none' : '0 2px 8px rgba(0,0,0,0.05)'),
                                                        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                                                    }}
                                                ></div>
                                            </div>
                                            <span style={{ fontSize: '0.65rem', fontWeight: d.isToday ? '800' : '600', color: d.isToday ? 'var(--primary)' : 'var(--text-muted)', marginTop: '0.4rem', textTransform: 'uppercase' }}>{d.day}</span>
                                        </div>
                                    );
                                });
                            })()}
                        </div>
                    </div>
                </div>

                {/* Work Schedule Panel */}
                <div style={bentoPanelStyle}>
                    <div style={{ fontSize: '1.05rem', fontWeight: '800', letterSpacing: '-0.3px', color: 'var(--text-main)', marginBottom: '1.5rem' }}>Work Schedule</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', flex: 1 }}>
                        <div style={{
                            background: isLightMode ? '#f8fafc' : 'rgba(0,0,0,0.2)',
                            padding: '1.5rem',
                            borderRadius: '20px',
                            border: `1px solid ${isLightMode ? '#e2e8f0' : 'rgba(255,255,255,0.05)'}`,
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem', fontWeight: '700' }}>Daily Shift Requirement</div>
                            <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-0.5px' }}>{user?.workingSchedule?.shiftStart || '11:00'} - {user?.workingSchedule?.shiftEnd || '07:00 PM'}</div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--primary)', marginTop: '0.75rem', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(var(--primary-rgb), 0.1)', padding: '0.4rem 0.8rem', borderRadius: '12px' }}>
                                Target: {user?.workingSchedule?.minHours || 7.0} Effective Hours
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', background: isLightMode ? '#ffffff' : 'rgba(255,255,255,0.02)', padding: '1.25rem', borderRadius: '20px', border: `1px solid ${isLightMode ? '#e2e8f0' : 'rgba(255,255,255,0.05)'}` }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: '600' }}>Status Window</span>
                                <span style={{ color: 'var(--text-main)', fontWeight: '700', fontSize: '0.85rem' }}>{user?.workingSchedule?.shiftStart || '11:00'} to {(() => {
                                    const [h, m] = (user?.workingSchedule?.shiftStart || '11:00').split(':').map(Number);
                                    return `${(h + 1) % 12 || 12}:${m.toString().padStart(2, '0')} ${h + 1 >= 12 ? 'PM' : 'AM'}`;
                                })()}</span>
                            </div>
                            <div style={{ height: '1px', background: isLightMode ? '#e2e8f0' : 'var(--border-dark)', margin: '0.25rem 0' }}></div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: '600' }}>
                                <Calendar size={14} color="var(--primary)" /> Next week-off: <span style={{ color: 'var(--text-muted)' }}>{user?.workingSchedule?.weekOffs?.[0] || 'Sunday'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions Panel */}
                <div style={{
                    ...bentoPanelStyle,
                    background: isLightMode ? 'linear-gradient(145deg, #ffffff 0%, #f0f7ff 100%)' : 'linear-gradient(145deg, rgba(30,30,40,0.9) 0%, rgba(20,20,30,0.7) 100%)',
                    borderColor: 'rgba(var(--primary-rgb), 0.3)'
                }}>
                    <div style={{ fontSize: '1.05rem', fontWeight: '800', letterSpacing: '-0.3px', color: 'var(--text-main)', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        Actions
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--primary)', background: 'rgba(var(--primary-rgb), 0.1)', padding: '0.4rem 0.8rem', borderRadius: '12px', fontWeight: '700' }}>
                            <Home size={12} /> {isClockedIn ? (isWFH ? 'Work From Home' : 'Work On-Site') : (selectedWorkingMode === 'Remote' ? 'Work From Home' : 'Work On-Site')}
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <div style={{ fontSize: '2.5rem', fontWeight: '800', letterSpacing: '-1.5px', color: 'var(--text-main)', lineHeight: '1' }}>
                                    <span className={isClockedIn ? 'action-active' : ''} style={{ display: 'inline-block' }}>{currentTime}</span>
                                </div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem', fontWeight: '600' }}>{new Date().toDateString()}</div>

                                <div style={{ marginTop: '1.5rem', background: isLightMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '16px', border: `1px solid ${isLightMode ? '#e2e8f0' : 'rgba(255,255,255,0.05)'}` }}>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: '700' }}>Total Hours <HelpCircle size={12} /></div>
                                    <div style={{ fontSize: '1.25rem', color: 'var(--text-main)' }}>
                                        Gross: <span style={{ fontWeight: '800' }}>{isClockedIn ? calculateElapsedTime(activeLog?.clockInTime).text : '0h 0m'}</span>
                                    </div>
                                </div>
                            </div>
                            {renderHourglass()}
                        </div>

                        <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {isAttendanceFinished && !isClockedIn ? (
                                <div style={{ padding: '1.25rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '16px', color: 'var(--success)', fontSize: '0.9rem', fontWeight: '700', textAlign: 'center' }}>
                                    Your attendance for today is completed. See you tomorrow!
                                </div>
                            ) : (
                                <button
                                    onClick={handleClockToggle}
                                    style={{
                                        width: '100%',
                                        padding: '1.2rem',
                                        fontSize: '1rem',
                                        borderRadius: '18px',
                                        fontWeight: '900',
                                        letterSpacing: '1px',
                                        textTransform: 'uppercase',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.75rem',
                                        cursor: 'pointer',
                                        border: 'none',
                                        position: 'relative',
                                        overflow: 'hidden',
                                        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                        color: '#fff',
                                        background: isClockedIn
                                            ? 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)'
                                            : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                        boxShadow: isClockedIn
                                            ? '0 8px 25px -5px rgba(225, 29, 72, 0.5), 0 0 15px rgba(225, 29, 72, 0.2)'
                                            : '0 8px 25px -5px rgba(37, 99, 235, 0.5), 0 0 15px rgba(37, 99, 235, 0.2)',
                                    }}
                                    onMouseOver={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
                                        e.currentTarget.style.boxShadow = isClockedIn
                                            ? '0 15px 30px -5px rgba(225, 29, 72, 0.6), 0 0 25px rgba(225, 29, 72, 0.3)'
                                            : '0 15px 30px -5px rgba(37, 99, 235, 0.6), 0 0 25px rgba(37, 99, 235, 0.3)';
                                    }}
                                    onMouseOut={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0) scale(1)';
                                        e.currentTarget.style.boxShadow = isClockedIn
                                            ? '0 8px 25px -5px rgba(225, 29, 72, 0.5), 0 0 15px rgba(225, 29, 72, 0.2)'
                                            : '0 8px 25px -5px rgba(37, 99, 235, 0.5), 0 0 15px rgba(37, 99, 235, 0.2)';
                                    }}
                                    onMouseDown={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-1px) scale(0.98)';
                                    }}
                                >
                                    {/* Frosted Glass Overlay */}
                                    <div style={{
                                        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                                        background: 'rgba(255, 255, 255, 0.1)',
                                        backdropFilter: 'blur(1px)',
                                        pointerEvents: 'none'
                                    }}></div>

                                    {isClockedIn ? <LogOut size={20} style={{ position: 'relative', zIndex: 1 }} /> : <Zap size={20} style={{ position: 'relative', zIndex: 1 }} />}
                                    <span style={{ position: 'relative', zIndex: 1 }}>
                                        {isClockedIn ? 'Web Clock-out' : 'Web Clock-in'}
                                    </span>
                                </button>
                            )}

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', fontWeight: '600' }}>
                                    {isClockedIn ? (
                                        <>
                                            {/* Green dot removed */}
                                        </>
                                    ) : (
                                        <>
                                            <span style={{ background: 'var(--text-muted)', width: '8px', height: '8px', borderRadius: '50%', marginRight: '8px', opacity: 0.5 }}></span>
                                            Currently offline
                                        </>
                                    )}
                                </div>
                                <div
                                    style={{ fontSize: '0.8rem', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '600', transition: 'color 0.2s', ':hover': { color: 'var(--primary)' } }}
                                    onClick={() => setShowAttendancePolicyModal(true)}
                                >
                                    <FileText size={14} /> Policy
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Section - Logs & Calendar */}
            <div style={{
                background: isLightMode ? '#ffffff' : 'var(--bg-panel)',
                borderRadius: '24px',
                border: `1px solid ${isLightMode ? '#e2e8f0' : 'var(--border-dark)'}`,
                boxShadow: isLightMode ? '0 10px 40px -10px rgba(0,0,0,0.05)' : '0 10px 40px -10px rgba(0,0,0,0.3)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <div style={{ padding: '1rem 1.5rem', borderBottom: `1px solid ${isLightMode ? '#f1f5f9' : 'var(--border-dark)'}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: isLightMode ? '#f8fafc' : 'rgba(0,0,0,0.2)' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', background: isLightMode ? '#e2e8f0' : 'rgba(255,255,255,0.05)', padding: '0.4rem', borderRadius: '100px' }}>
                        {['Attendance Log', 'Calendar', 'Attendance Requests'].map(tab => (
                            <span
                                key={tab}
                                onClick={() => setAttendanceTab(tab)}
                                style={{
                                    padding: '0.6rem 1.5rem',
                                    cursor: 'pointer',
                                    color: attendanceTab === tab ? '#ffffff' : (isLightMode ? '#64748b' : 'var(--text-muted)'),
                                    backgroundColor: attendanceTab === tab ? 'var(--primary)' : 'transparent',
                                    borderRadius: '100px',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    fontWeight: '700',
                                    fontSize: '0.85rem',
                                    boxShadow: attendanceTab === tab ? '0 4px 12px rgba(var(--primary-rgb), 0.3)' : 'none'
                                }}
                            >
                                {tab}
                            </span>
                        ))}
                    </div>
                </div>

                <div style={{ padding: '1.5rem' }}>
                    {attendanceTab === 'Attendance Log' && (
                        <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <span style={{ fontSize: '1.1rem', fontWeight: '800', letterSpacing: '-0.3px', color: 'var(--text-main)' }}>Attendance: {attendancePeriod}</span>
                                <div style={{ display: 'flex', borderRadius: '12px', background: isLightMode ? '#f1f5f9' : 'rgba(255,255,255,0.05)', padding: '0.3rem', border: `1px solid ${isLightMode ? '#e2e8f0' : 'rgba(255,255,255,0.05)'}` }}>
                                    {(() => {
                                        const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
                                        const currentMonth = new Date().getMonth();
                                        const displayMonths = ['30 DAYS'];
                                        for (let i = currentMonth; i >= 0; i--) {
                                            displayMonths.push(months[i]);
                                        }
                                        return displayMonths.map((m) => (
                                            <div
                                                key={m}
                                                onClick={() => setAttendancePeriod(m)}
                                                style={{
                                                    padding: '0.4rem 1rem',
                                                    fontSize: '0.75rem',
                                                    fontWeight: '700',
                                                    cursor: 'pointer',
                                                    background: attendancePeriod === m ? (isLightMode ? '#ffffff' : 'var(--primary)') : 'transparent',
                                                    color: attendancePeriod === m ? (isLightMode ? 'var(--primary)' : '#ffffff') : 'var(--text-muted)',
                                                    borderRadius: '8px',
                                                    boxShadow: (attendancePeriod === m && isLightMode) ? '0 2px 8px rgba(0,0,0,0.05)' : 'none',
                                                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                                                }}
                                            >
                                                {m}
                                            </div>
                                        ));
                                    })()}
                                </div>
                            </div>
                            <div style={{ borderRadius: '20px', border: `1px solid ${isLightMode ? '#e2e8f0' : 'var(--border-dark)'}` }}>
                                <table className="data-table" style={{ margin: 0 }}>
                                    <thead>
                                        <tr style={{
                                            background: isLightMode ? '#f8fafc' : 'rgba(0,0,0,0.2)',
                                            fontSize: '0.75rem',
                                            color: 'var(--text-muted)',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px'
                                        }}>
                                            <th style={{ padding: '0.75rem 1rem', fontWeight: '800' }}>Date</th>
                                            <th style={{ padding: '0.75rem 1rem', fontWeight: '800' }}>Gross Hours</th>
<th style={{ padding: '0.75rem 1rem', fontWeight: '800' }}>Arrival</th>
                                            <th style={{ padding: '0.75rem 1rem', fontWeight: '800' }}>Status</th>
                                            <th style={{ padding: '0.75rem 1rem', fontWeight: '800', textAlign: 'center' }}>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredAttendanceLogs.length > 0 ? filteredAttendanceLogs.map((log, index) => {
                                            const isRegularized = !!(log.originalClockInTime || log.originalClockOutTime);
                                            const dayName = new Date(log.date).toLocaleDateString('en-US', { weekday: 'long' });
                                            const isWeekOff = (user?.workingSchedule?.weekOffs || []).includes(dayName);

                                            return (
                                                <tr key={log._id} style={{
                                                    borderBottom: `1px solid ${isLightMode ? '#e2e8f0' : 'var(--border-dark)'}`,
                                                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                                    cursor: 'default',
                                                    background: log.isLeave ? (isLightMode ? 'rgba(139, 92, 246, 0.03)' : 'rgba(139, 92, 246, 0.05)') : 'transparent'
                                                }} onMouseOver={e => e.currentTarget.style.backgroundColor = log.isLeave ? (isLightMode ? 'rgba(139, 92, 246, 0.08)' : 'rgba(139, 92, 246, 0.1)') : (isLightMode ? '#f8fafc' : 'rgba(255,255,255,0.02)')} onMouseOut={e => e.currentTarget.style.backgroundColor = log.isLeave ? (isLightMode ? 'rgba(139, 92, 246, 0.03)' : 'rgba(139, 92, 246, 0.05)') : 'transparent'}>
                                                    <td style={{ fontSize: '0.85rem', fontWeight: '700', padding: '0.75rem 1rem', color: 'var(--text-main)' }}>
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                            {new Date(log.date).toLocaleDateString('en-US', { weekday: 'short', day: '2-digit', month: 'short' })}
                                                            {isWeekOff && !log.isLeave && (
                                                                <span style={{ fontSize: '0.6rem', color: '#8b5cf6', background: 'rgba(139, 92, 246, 0.1)', padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(139, 92, 246, 0.2)', width: 'fit-content', fontWeight: '800' }}>{log.isNoRecord ? 'Scheduled Off' : 'Worked on Week Off'}</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)', padding: '0.75rem 1rem', fontWeight: '500' }}>
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                            {log.isLeave ? (
                                                                <span style={{ fontWeight: '700', color: '#8b5cf6' }}>On Leave</span>
                                                            ) : log.isNoRecord ? (
                                                                <span>{isWeekOff ? 'Week Off' : '-'}</span>
                                                            ) : (
                                                                <>
                                                                    <span>{log.totalHours ? `${Math.floor(log.totalHours)}h ${Math.round((log.totalHours % 1) * 60)}m` : (log.clockInTime ? 'Ongoing' : '0h 0m')}</span>
                                                                    {log.autoClockOut && (
                                                                        <span style={{ fontSize: '0.65rem', color: 'var(--danger)', fontWeight: '700', background: 'rgba(239, 68, 68, 0.1)', padding: '2px 6px', borderRadius: '4px', width: 'fit-content', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                                                                            Forgot to Clock Out
                                                                        </span>
                                                                    )}
                                                                </>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td style={{ fontSize: '0.8rem', padding: '0.75rem 1rem' }}>
                                                        {(() => {
                                                            if (log.isLeave) {
                                                                return (
                                                                    <span style={{ padding: '0.3rem 0.6rem', background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', borderRadius: '12px', fontWeight: '700', fontSize: '0.7rem', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
                                                                        {log.leaveType}
                                                                    </span>
                                                                );
                                                            }
                                                            if (log.isNoRecord) return '-';
                                                            if (!log.clockInTime) return '-';

                                                            const clockInDate = new Date(log.clockInTime);
                                                            const hours = clockInDate.getHours();
                                                            const mins = clockInDate.getMinutes();
                                                            const totalMins = hours * 60 + mins;

                                                            const [shiftH, shiftM] = (user?.workingSchedule?.shiftStart || '11:00').split(':').map(Number);
                                                            const shiftStartMins = shiftH * 60 + shiftM;

                                                            let arrivalLabel = null;
                                                            if (totalMins < shiftStartMins) {
                                                                arrivalLabel = <span style={{ padding: '0.3rem 0.6rem', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', borderRadius: '12px', fontWeight: '700', fontSize: '0.7rem', border: '1px solid rgba(16, 185, 129, 0.2)' }}>Early</span>;
                                                            } else if (totalMins <= shiftStartMins + 60) {
                                                                arrivalLabel = <span style={{ padding: '0.3rem 0.6rem', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary)', borderRadius: '12px', fontWeight: '700', fontSize: '0.7rem', border: '1px solid rgba(59, 130, 246, 0.2)' }}>On Time</span>;
                                                            } else {
                                                                arrivalLabel = <span style={{ padding: '0.3rem 0.6rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', borderRadius: '12px', fontWeight: '700', fontSize: '0.7rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>Late</span>;
                                                            }

                                                            const isFirstRow = index === 0;

                                                            return (
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                    {arrivalLabel}
                                                                    {isRegularized && (
                                                                        <div 
                                                                            style={{ position: 'relative', display: 'flex', alignItems: 'center' }}
                                                                            onMouseEnter={() => setActiveTooltip(log._id)}
                                                                            onMouseLeave={() => setActiveTooltip(null)}
                                                                        >
                                                                            <HelpCircle size={14} style={{ cursor: 'help', color: 'var(--primary)' }} />
                                                                            <AnimatePresence>
                                                                                {activeTooltip === log._id && (
                                                                                    <motion.div
                                                                                        initial={{ opacity: 0, y: isFirstRow ? -10 : 10, scale: 0.95 }}
                                                                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                                                                        exit={{ opacity: 0, y: isFirstRow ? -10 : 10, scale: 0.95 }}
                                                                                        transition={{ duration: 0.2, ease: "easeOut" }}
                                                                                        style={{
                                                                                            position: 'absolute',
                                                                                            top: isFirstRow ? 'calc(100% + 12px)' : 'auto',
                                                                                            bottom: isFirstRow ? 'auto' : 'calc(100% + 12px)',
                                                                                            left: '50%',
                                                                                            transform: 'translateX(-50%)',
                                                                                            width: '260px',
                                                                                            background: isLightMode ? '#1e293b' : 'rgba(15, 23, 42, 0.95)',
                                                                                            backdropFilter: 'blur(12px)',
                                                                                            padding: '1.25rem',
                                                                                            borderRadius: '24px',
                                                                                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                                                                                            color: '#fff',
                                                                                            zIndex: 1000,
                                                                                            border: '1px solid rgba(255,255,255,0.1)',
                                                                                            pointerEvents: 'none'
                                                                                        }}
                                                                                    >
                                                                                        {/* Header */}
                                                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>
                                                                                            <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                                                <Zap size={18} color="#60a5fa" />
                                                                                            </div>
                                                                                            <div>
                                                                                                <div style={{ fontSize: '0.8rem', fontWeight: '800', letterSpacing: '0.5px', color: '#fff' }}>ADJUSTMENT LOG</div>
                                                                                                <div style={{ fontSize: '0.6rem', color: '#94a3b8', fontWeight: '600' }}>Attendance Regularized</div>
                                                                                            </div>
                                                                                        </div>

                                                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                                                            {/* Original */}
                                                                                            <div style={{ padding: '0.85rem', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                                                                                                    <History size={12} color="#94a3b8" />
                                                                                                    <span style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Original State</span>
                                                                                                </div>
                                                                                                <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                                                    {log.originalClockInTime ? new Date(log.originalClockInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'} 
                                                                                                    <ArrowRight size={12} color="#475569" /> 
                                                                                                    {log.originalClockOutTime ? new Date(log.originalClockOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                                                                                                </div>
                                                                                            </div>

                                                                                            {/* Final */}
                                                                                            <div style={{ padding: '0.85rem', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(5, 150, 105, 0.05))', borderRadius: '16px', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
                                                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                                                                                                    <CheckCircle2 size={12} color="#34d399" />
                                                                                                    <span style={{ fontSize: '0.65rem', color: '#34d399', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Revised Logic</span>
                                                                                                </div>
                                                                                                <div style={{ fontSize: '0.95rem', fontWeight: '900', color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                                                    {log.clockInTime ? new Date(log.clockInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'} 
                                                                                                    <ArrowRight size={14} color="#10b981" /> 
                                                                                                    {log.clockOutTime ? new Date(log.clockOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>

                                                                                        {/* Arrow pointing down or up */}
                                                                                        <div style={{
                                                                                            position: 'absolute',
                                                                                            top: isFirstRow ? '-6px' : 'auto',
                                                                                            bottom: isFirstRow ? 'auto' : '-6px',
                                                                                            left: '50%',
                                                                                            transform: 'translateX(-50%) rotate(45deg)',
                                                                                            width: '12px',
                                                                                            height: '12px',
                                                                                            background: isLightMode ? '#1e293b' : 'rgba(15, 23, 42, 0.95)',
                                                                                            borderLeft: isFirstRow ? '1px solid rgba(255,255,255,0.1)' : 'none',
                                                                                            borderTop: isFirstRow ? '1px solid rgba(255,255,255,0.1)' : 'none',
                                                                                            borderRight: !isFirstRow ? '1px solid rgba(255,255,255,0.1)' : 'none',
                                                                                            borderBottom: !isFirstRow ? '1px solid rgba(255,255,255,0.1)' : 'none',
                                                                                        }}></div>
                                                                                    </motion.div>
                                                                                )}
                                                                            </AnimatePresence>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            );
                                                        })()}
                                                    </td>
                                                    <td style={{ fontSize: '0.85rem', padding: '0.75rem 1rem', fontWeight: '600' }}>
                                                        {(() => {
                                                            if (log.isLeave) {
                                                                return (
                                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-main)', fontWeight: '700' }}>Approved Leave</span>
                                                                        {log.leaveReason && (
                                                                            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '500', fontStyle: 'italic', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={log.leaveReason}>
                                                                                "{log.leaveReason}"
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                );
                                                            }
                                                            if (log.isNoRecord) {
                                                                return (
                                                                    <span style={{ padding: '0.3rem 0.6rem', background: isWeekOff ? 'rgba(71, 85, 105, 0.1)' : 'rgba(239, 68, 68, 0.05)', color: isWeekOff ? '#64748b' : '#ef4444', borderRadius: '12px', fontSize: '0.7rem', fontWeight: '700', border: `1px solid ${isWeekOff ? 'rgba(71, 85, 105, 0.2)' : 'rgba(239, 68, 68, 0.1)'}` }}>
                                                                        {isWeekOff ? 'Scheduled Off' : 'No Record'}
                                                                    </span>
                                                                );
                                                            }
                                                            if (!log.totalHours) {
                                                                return <span style={{ color: 'var(--text-muted)' }}>{log.clockInTime ? 'Ongoing' : '-'}</span>;
                                                            }
                                                            const targetHours = user?.workingSchedule?.minHours || 7.0;
                                                            const diff = log.totalHours - targetHours;

                                                            if (diff >= 2) {
                                                                return <span style={{ padding: '0.3rem 0.6rem', background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', borderRadius: '12px', fontSize: '0.7rem', fontWeight: '700', border: '1px solid rgba(139, 92, 246, 0.2)' }}>Overtime</span>;
                                                            } else if (diff >= -1) {
                                                                return <span style={{ padding: '0.3rem 0.6rem', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', borderRadius: '12px', fontSize: '0.7rem', fontWeight: '700', border: '1px solid rgba(16, 185, 129, 0.2)' }}>Full day</span>;
                                                            } else if (log.totalHours >= targetHours / 2) {
                                                                return <span style={{ padding: '0.3rem 0.6rem', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', borderRadius: '12px', fontSize: '0.7rem', fontWeight: '700', border: '1px solid rgba(245, 158, 11, 0.2)' }}>Half day</span>;
                                                            } else {
                                                                return <span style={{ padding: '0.3rem 0.6rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', borderRadius: '12px', fontSize: '0.7rem', fontWeight: '700', border: '1px solid rgba(239, 68, 68, 0.2)' }}>Short day</span>;
                                                            }
                                                        })()}
                                                        {isRegularized && !log.isLeave && (
                                                            <span style={{ marginTop: '6px', padding: '0.25rem 0.6rem', background: 'rgba(var(--primary-rgb), 0.1)', color: 'var(--primary)', borderRadius: '10px', fontSize: '0.65rem', fontWeight: '800', border: '1px solid rgba(var(--primary-rgb), 0.2)', width: 'fit-content', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                                <Edit3 size={10} /> Regularized
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td style={{ textAlign: 'center', padding: '0.75rem 1rem' }} className="action-menu-container">
                                                        {(!log.isLeave && !log.isNoRecord) && (
                                                            <div style={{ position: 'relative', display: 'inline-block' }}>
                                                                <div
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setActiveMenu(activeMenu === log._id ? null : log._id);
                                                                    }}
                                                                    style={{
                                                                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                                                        width: '36px', height: '36px', borderRadius: '50%',
                                                                        background: activeMenu === log._id ? 'var(--primary)' : (isLightMode ? '#f1f5f9' : 'rgba(255,255,255,0.05)'),
                                                                        color: activeMenu === log._id ? '#fff' : 'var(--primary)',
                                                                        cursor: 'pointer', transition: 'all 0.2s',
                                                                    }}
                                                                >
                                                                    <MoreVertical size={18} />
                                                                </div>

                                                            {activeMenu === log._id && (
                                                                <div style={{
                                                                    position: 'absolute',
                                                                    right: '100%',
                                                                    top: '50%',
                                                                    transform: 'translateY(-50%)',
                                                                    marginRight: '12px',
                                                                    width: '180px',
                                                                    background: isLightMode ? '#ffffff' : 'rgba(30, 41, 59, 0.95)',
                                                                    backdropFilter: 'blur(12px)',
                                                                    border: `1px solid ${isLightMode ? '#e2e8f0' : 'rgba(255,255,255,0.1)'}`,
                                                                    borderRadius: '16px',
                                                                    boxShadow: isLightMode ? '0 10px 40px rgba(0,0,0,0.1)' : '0 10px 40px rgba(0,0,0,0.5)',
                                                                    zIndex: 100,
                                                                    padding: '0.5rem',
                                                                    animation: 'fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                                                                    display: 'flex', flexDirection: 'column', gap: '4px'
                                                                }}>
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setShowLogInfo(log);
                                                                            setActiveMenu(null);
                                                                        }}
                                                                        style={{
                                                                            width: '100%', padding: '0.65rem 1rem', background: 'transparent',
                                                                            border: 'none', borderRadius: '12px', cursor: 'pointer', display: 'flex',
                                                                            alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem', fontWeight: '600',
                                                                            color: 'var(--text-main)', transition: 'background 0.2s'
                                                                        }}
                                                                        onMouseOver={e => e.currentTarget.style.backgroundColor = isLightMode ? '#f1f5f9' : 'rgba(255,255,255,0.05)'}
                                                                        onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
                                                                    >
                                                                        <Info size={16} color="var(--primary)" /> View Info
                                                                    </button>

                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setRegularizeLog(log);
                                                                            setRegularizeExpectedClockIn(log.clockInTime ? new Date(log.clockInTime).toISOString().slice(0, 16) : '');
                                                                            setRegularizeExpectedClockOut(log.clockOutTime ? new Date(log.clockOutTime).toISOString().slice(0, 16) : '');
                                                                            setShowRegularizeModal(true);
                                                                            setActiveMenu(null);
                                                                        }}
                                                                        style={{
                                                                            width: '100%', padding: '0.65rem 1rem', background: 'transparent',
                                                                            border: 'none', borderRadius: '12px', cursor: 'pointer', display: 'flex',
                                                                            alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem', fontWeight: '600',
                                                                            color: 'var(--text-main)', transition: 'background 0.2s'
                                                                        }}
                                                                        onMouseOver={e => e.currentTarget.style.backgroundColor = isLightMode ? '#fccfce' : 'rgba(239, 68, 68, 0.15)'}
                                                                        onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
                                                                    >
                                                                        <Edit3 size={16} color="var(--danger)" /> Regularize
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                    </td>
                                                </tr>
                                            );
                                        }) : (
                                            <tr style={{ border: 'none' }}><td colSpan="5" style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: '500' }}>No logs found for {attendancePeriod}</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                    {attendanceTab === 'Calendar' && (
                        <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                            {renderAttendanceCalendar()}
                        </div>
                    )}
                    {attendanceTab === 'Attendance Requests' && (
                        <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                            <div style={{ fontSize: '1.05rem', fontWeight: '800', letterSpacing: '-0.3px', color: 'var(--text-main)', marginBottom: '1.5rem' }}>Attendance & Work From Home Requests</div>
                            <div style={{ borderRadius: '20px', border: `1px solid ${isLightMode ? '#e2e8f0' : 'var(--border-dark)'}`, overflowX: 'auto' }}>
                                <table className="data-table" style={{ margin: 0, minWidth: '900px' }}>
                                    <thead>
                                        <tr style={{
                                            background: isLightMode ? '#f8fafc' : 'rgba(0,0,0,0.2)',
                                            fontSize: '0.75rem',
                                            color: 'var(--text-muted)',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px'
                                        }}>
                                            <th style={{ padding: '1.25rem', fontWeight: '800' }}>Request Dates</th>
                                            <th style={{ padding: '1.25rem', fontWeight: '800' }}>Request Type</th>
                                            <th style={{ padding: '1.25rem', fontWeight: '800' }}>Status</th>
                                            <th style={{ padding: '1.25rem', fontWeight: '800' }}>Requested By</th>
                                            <th style={{ padding: '1.25rem', fontWeight: '800' }}>Action Taken On</th>
                                            <th style={{ padding: '1.25rem', fontWeight: '800' }}>Message</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {myRequests.filter(r => r.type === 'Work From Home' || r.type === 'Attendance Regularization').length > 0 ? myRequests.filter(r => r.type === 'Work From Home' || r.type === 'Attendance Regularization').map(r => (
                                            <tr key={r._id} style={{ borderBottom: `1px solid ${isLightMode ? '#e2e8f0' : 'var(--border-dark)'}` }}>
                                                <td style={{ fontSize: '0.85rem', fontWeight: '600', padding: '1.25rem', whiteSpace: 'nowrap' }}>
                                                    {new Date(r.startDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                    {r.startDate !== r.endDate && ` - ${new Date(r.endDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}`}
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', fontWeight: '600' }}>
                                                        {Math.ceil((new Date(r.endDate) - new Date(r.startDate)) / (1000 * 60 * 60 * 24)) + 1} day(s)
                                                    </div>
                                                </td>
                                                <td style={{ fontSize: '0.85rem', fontWeight: '700', padding: '1.25rem' }}>
                                                    {r.type}
                                                    {r.type === 'Attendance Regularization' && r.expectedClockIn && r.expectedClockOut && (
                                                        <div style={{ fontSize: '0.7rem', color: 'var(--primary)', marginTop: '4px', fontWeight: '700' }}>
                                                            {new Date(r.expectedClockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(r.expectedClockOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </div>
                                                    )}
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', fontWeight: '500' }}>Requested on {new Date(r.createdAt).toLocaleDateString()}</div>
                                                </td>
                                                <td style={{ padding: '1.25rem' }}>
                                                    <span style={{
                                                        padding: '0.4rem 0.8rem',
                                                        borderRadius: '20px',
                                                        fontSize: '0.75rem',
                                                        fontWeight: '800',
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.5px',
                                                        ...getStatusStyle(r.status)
                                                    }}>
                                                        {r.status}
                                                    </span>
                                                    {r.status !== 'Pending' && r.actionBy && (
                                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '6px', fontWeight: '600' }}>by {r.actionBy.name}</div>
                                                    )}
                                                </td>

                                                <td style={{ fontSize: '0.85rem', fontWeight: '600', padding: '1.25rem' }}>{user.name}</td>
                                                <td style={{ fontSize: '0.85rem', padding: '1.25rem' }}>{r.status !== 'Pending' && r.actionDate ? new Date(r.actionDate).toLocaleDateString() : '-'}</td>
                                                <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: '200px', padding: '1.25rem', fontWeight: '500' }}>
                                                    <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.message || '-'}</div>
                                                    {r.actionNote && <div style={{ marginTop: '4px', color: 'var(--warning)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: '600' }}>Note: {r.actionNote}</div>}
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr><td colSpan="6" style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-muted)', fontWeight: '500' }}>No WFH requests found.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Regularization Modal */}
            {showRegularizeModal && regularizeLog && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)',
                    zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    animation: 'fadeIn 0.3s ease-out', padding: '1.5rem'
                }}>
                    <div style={{
                        background: isLightMode ? '#ffffff' : '#1e293b',
                        width: '100%', maxWidth: '520px', borderRadius: '24px',
                        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
                        border: `1px solid ${isLightMode ? '#e2e8f0' : 'rgba(255,255,255,0.1)'}`,
                        overflow: 'hidden'
                    }}>
                        <div style={{ padding: '1.5rem 1.5rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${isLightMode ? '#f1f5f9' : 'rgba(255,255,255,0.05)'}` }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Edit3 size={18} />
                                </div>
                                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-0.3px' }}>Regularize Attendance</h3>
                            </div>
                            <button onClick={() => { setShowRegularizeModal(false); setRegularizeReason(''); setRegularizeExpectedClockIn(''); setRegularizeExpectedClockOut(''); }} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.5rem', borderRadius: '50%' }}>
                                <X size={20} />
                            </button>
                        </div>

                        <div style={{ padding: '1.5rem' }}>
                            <div style={{ marginBottom: '1.5rem', padding: '1rem', background: isLightMode ? '#f8fafc' : 'rgba(0,0,0,0.2)', borderRadius: '16px', border: `1px dashed ${isLightMode ? '#cbd5e1' : 'rgba(255,255,255,0.1)'}` }}>
                                <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.25rem' }}>Selected Log</div>
                                <div style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--text-main)' }}>
                                    {new Date(regularizeLog.date).toLocaleDateString('en-US', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}
                                </div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600', marginTop: '0.25rem' }}>
                                    Logged Hours: {regularizeLog.totalHours ? `${Math.floor(regularizeLog.totalHours)}h ${Math.round((regularizeLog.totalHours % 1) * 60)}m` : '0h'}
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Expected Clock In</label>
                                    <input
                                        type="datetime-local"
                                        value={regularizeExpectedClockIn}
                                        onChange={(e) => setRegularizeExpectedClockIn(e.target.value)}
                                        style={{
                                            width: '100%', padding: '0.8rem', borderRadius: '12px',
                                            border: `1px solid ${isLightMode ? '#e2e8f0' : 'rgba(255,255,255,0.1)'}`,
                                            background: isLightMode ? '#ffffff' : 'rgba(15, 23, 42, 0.5)',
                                            color: 'var(--text-main)', fontSize: '0.9rem', outline: 'none'
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Expected Clock Out</label>
                                    <input
                                        type="datetime-local"
                                        value={regularizeExpectedClockOut}
                                        onChange={(e) => setRegularizeExpectedClockOut(e.target.value)}
                                        style={{
                                            width: '100%', padding: '0.8rem', borderRadius: '12px',
                                            border: `1px solid ${isLightMode ? '#e2e8f0' : 'rgba(255,255,255,0.1)'}`,
                                            background: isLightMode ? '#ffffff' : 'rgba(15, 23, 42, 0.5)',
                                            color: 'var(--text-main)', fontSize: '0.9rem', outline: 'none'
                                        }}
                                    />
                                </div>
                            </div>

                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Reason for Regularization</label>
                            <textarea
                                value={regularizeReason}
                                onChange={(e) => setRegularizeReason(e.target.value)}
                                placeholder="E.g., Forgot to clock out, system issue, etc."
                                rows={4}
                                style={{
                                    width: '100%', padding: '1rem', borderRadius: '16px',
                                    border: `1px solid ${isLightMode ? '#e2e8f0' : 'rgba(255,255,255,0.1)'}`,
                                    background: isLightMode ? '#ffffff' : 'rgba(15, 23, 42, 0.5)',
                                    color: 'var(--text-main)', fontSize: '0.9rem', outline: 'none',
                                    resize: 'none', fontFamily: 'inherit', fontWeight: '500',
                                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
                                }}
                            ></textarea>

                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '500' }}>
                                <Info size={12} /> This request will be sent to your Reporting Manager.
                            </p>
                        </div>

                        <div style={{ padding: '1.25rem 1.5rem', background: isLightMode ? '#f8fafc' : 'rgba(0,0,0,0.2)', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: `1px solid ${isLightMode ? '#f1f5f9' : 'rgba(255,255,255,0.05)'}` }}>
                            <button onClick={() => { setShowRegularizeModal(false); setRegularizeReason(''); setRegularizeExpectedClockIn(''); setRegularizeExpectedClockOut(''); }} style={{ padding: '0.7rem 1.5rem', borderRadius: '12px', background: 'transparent', border: 'none', color: 'var(--text-main)', fontSize: '0.9rem', fontWeight: '700', cursor: 'pointer' }}>Cancel</button>
                            <button
                                onClick={submitRegularization}
                                disabled={isSubmittingRegularize || !regularizeReason.trim()}
                                style={{
                                    padding: '0.7rem 1.5rem', borderRadius: '12px', background: 'var(--primary)', color: '#fff',
                                    border: 'none', fontSize: '0.9rem', fontWeight: '800', cursor: isSubmittingRegularize || !regularizeReason.trim() ? 'not-allowed' : 'pointer',
                                    display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: isSubmittingRegularize || !regularizeReason.trim() ? 0.6 : 1,
                                    boxShadow: '0 4px 12px rgba(var(--primary-rgb), 0.3)'
                                }}
                            >
                                {isSubmittingRegularize ? 'Sending...' : <><Send size={16} /> Submit</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .action-active {
                    animation: colorPulse 3s infinite;
                }
                @keyframes colorPulse {
                    0% { text-shadow: 0 0 0 rgba(var(--primary-rgb), 0); }
                    50% { text-shadow: 0 0 15px rgba(var(--primary-rgb), 0.5); }
                    100% { text-shadow: 0 0 0 rgba(var(--primary-rgb), 0); }
                }
            `}</style>
        </div>
    );
};

export default AttendanceTab;
