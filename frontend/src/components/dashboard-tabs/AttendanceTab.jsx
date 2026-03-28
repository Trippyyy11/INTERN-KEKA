import { Calendar, Clock, FileText, HelpCircle, Info, Home } from 'lucide-react';

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
    systemSettings
}) => {

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
                <div style={bentoPanelStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <span style={{ fontSize: '1.05rem', fontWeight: '800', letterSpacing: '-0.3px', color: 'var(--text-main)' }}>Attendance Stats</span>
                        <select
                            value={statsPeriod}
                            onChange={(e) => {
                                setStatsPeriod(e.target.value);
                                fetchTeamStats(e.target.value);
                            }}
                            style={{ 
                                background: isLightMode ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)', 
                                border: 'none', 
                                color: 'var(--text-main)', 
                                fontSize: '0.75rem', 
                                padding: '0.4rem 0.8rem',
                                borderRadius: '12px',
                                outline: 'none', 
                                cursor: 'pointer',
                                fontWeight: '600',
                                transition: 'background 0.2s'
                            }}
                        >
                            <option value="Last Week">Last Week</option>
                            <option value="Last Month">Last Month</option>
                        </select>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {(meStats.hasData || teammateIndividualStats.length > 0) ? (
                            <>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(var(--primary-rgb), 0.08)', padding: '1rem', borderRadius: '16px', border: '1px solid rgba(var(--primary-rgb), 0.15)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 'bold', boxShadow: '0 4px 12px rgba(var(--primary-rgb), 0.4)' }}>ME</div>
                                        <span style={{ fontSize: '0.95rem', fontWeight: '700' }}>Me</span>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.2rem', fontWeight: '600' }}>Avg Hrs/Day</div>
                                        <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-main)' }}>{meStats.avgHours}</div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.2rem', fontWeight: '600' }}>On Time</div>
                                        <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--success)' }}>{meStats.onTime}</div>
                                    </div>
                                </div>
                                {teammateIndividualStats.map(ts => (
                                    <div key={ts._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                            <div className="avatar" style={{ width: '36px', height: '36px', borderRadius: '12px', fontSize: '0.8rem', background: isLightMode ? '#f1f5f9' : 'rgba(255,255,255,0.05)', color: 'var(--text-main)', fontWeight: '700', border: `1px solid ${isLightMode ? '#e2e8f0' : 'rgba(255,255,255,0.1)'}` }}>
                                                {ts.name.substring(0, 2).toUpperCase()}
                                            </div>
                                            <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>{ts.name}</span>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '0.3px', fontWeight: '500' }}>Avg Hrs/Day</div>
                                            <div style={{ fontSize: '0.9rem', fontWeight: '700' }}>{Math.floor(ts.avgHours)}h {Math.round((ts.avgHours % 1) * 60)}m</div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '0.3px', fontWeight: '500' }}>On Time</div>
                                            <div style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-main)' }}>{ts.onTimePercentage}%</div>
                                        </div>
                                    </div>
                                ))}
                            </>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: '500', background: isLightMode ? '#f8fafc' : 'rgba(0,0,0,0.2)', borderRadius: '16px', border: `1px dashed ${isLightMode ? '#cbd5e1' : 'rgba(255,255,255,0.1)'}` }}>
                                No data available for this period.
                            </div>
                        )}
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
                                    className={`btn ${isClockedIn ? 'btn-danger' : 'btn-primary'}`}
                                    onClick={handleClockToggle}
                                    style={{ 
                                        width: '100%', 
                                        padding: '1.25rem', 
                                        fontSize: '1.05rem', 
                                        borderRadius: '16px',
                                        fontWeight: '800',
                                        boxShadow: isClockedIn ? '0 8px 24px rgba(239, 68, 68, 0.4)' : '0 8px 24px rgba(59, 130, 246, 0.4)',
                                        transform: 'translateY(0)',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.5rem'
                                    }}
                                    onMouseOver={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-3px)';
                                        e.currentTarget.style.boxShadow = isClockedIn ? '0 12px 28px rgba(239, 68, 68, 0.5)' : '0 12px 28px rgba(59, 130, 246, 0.5)';
                                    }}
                                    onMouseOut={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = isClockedIn ? '0 8px 24px rgba(239, 68, 68, 0.4)' : '0 8px 24px rgba(59, 130, 246, 0.4)';
                                    }}
                                >
                                    <Clock size={18} /> {isClockedIn ? 'Web Clock-out' : 'Web Clock-in'}
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
                            <div style={{ borderRadius: '20px', border: `1px solid ${isLightMode ? '#e2e8f0' : 'var(--border-dark)'}`, overflow: 'hidden' }}>
                                <table className="data-table" style={{ margin: 0 }}>
                                    <thead>
                                        <tr style={{ 
                                            background: isLightMode ? '#f8fafc' : 'rgba(0,0,0,0.2)',
                                            fontSize: '0.75rem', 
                                            color: 'var(--text-muted)', 
                                            textTransform: 'uppercase', 
                                            letterSpacing: '0.5px' 
                                        }}>
                                            <th style={{ padding: '1.25rem', fontWeight: '800' }}>Date</th>
                                            <th style={{ padding: '1.25rem', fontWeight: '800' }}>Gross Hours</th>
                                            <th style={{ padding: '1.25rem', fontWeight: '800' }}>Arrival</th>
                                            <th style={{ padding: '1.25rem', fontWeight: '800' }}>Status</th>
                                            <th style={{ padding: '1.25rem', fontWeight: '800', textAlign: 'center' }}>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredAttendanceLogs.length > 0 ? filteredAttendanceLogs.map(log => (
                                            <tr key={log._id} style={{ 
                                                borderBottom: `1px solid ${isLightMode ? '#e2e8f0' : 'var(--border-dark)'}`,
                                                transition: 'background 0.2s',
                                                cursor: 'default'
                                            }} onMouseOver={e => e.currentTarget.style.backgroundColor = isLightMode ? '#f8fafc' : 'rgba(255,255,255,0.02)'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                                                <td style={{ fontSize: '0.9rem', fontWeight: '700', padding: '1.25rem', color: 'var(--text-main)' }}>{new Date(log.date).toLocaleDateString('en-US', { weekday: 'short', day: '2-digit', month: 'short' })}</td>
                                                <td style={{ fontSize: '0.9rem', color: 'var(--text-muted)', padding: '1.25rem', fontWeight: '500' }}>{log.totalHours ? `${Math.floor(log.totalHours)}h ${Math.round((log.totalHours % 1) * 60)}m` : (log.clockInTime ? 'Ongoing' : '0h 0m')}</td>
                                                <td style={{ fontSize: '0.85rem', padding: '1.25rem' }}>
                                                    {(() => {
                                                        if (!log.clockInTime) return '-';
                                                        const clockInDate = new Date(log.clockInTime);
                                                        const hours = clockInDate.getHours();
                                                        const mins = clockInDate.getMinutes();
                                                        const totalMins = hours * 60 + mins;

                                                        const [shiftH, shiftM] = (user?.workingSchedule?.shiftStart || '11:00').split(':').map(Number);
                                                        const shiftStartMins = shiftH * 60 + shiftM;

                                                        if (totalMins < shiftStartMins) {
                                                            return <span style={{ padding: '0.4rem 0.8rem', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', borderRadius: '20px', fontWeight: '700', fontSize: '0.75rem', border: '1px solid rgba(16, 185, 129, 0.2)' }}>Early</span>;
                                                        } else if (totalMins <= shiftStartMins + 60) {
                                                            return <span style={{ padding: '0.4rem 0.8rem', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary)', borderRadius: '20px', fontWeight: '700', fontSize: '0.75rem', border: '1px solid rgba(59, 130, 246, 0.2)' }}>On Time</span>;
                                                        } else {
                                                            return <span style={{ padding: '0.4rem 0.8rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', borderRadius: '20px', fontWeight: '700', fontSize: '0.75rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>Late</span>;
                                                        }
                                                    })()}
                                                </td>
                                                <td style={{ fontSize: '0.9rem', padding: '1.25rem', fontWeight: '600' }}>
                                                    {(() => {
                                                        if (!log.totalHours) {
                                                            return <span style={{ color: 'var(--text-muted)' }}>{log.clockInTime ? 'Ongoing' : '-'}</span>;
                                                        }
                                                        const targetHours = user?.workingSchedule?.minHours || 7.0;
                                                        const diff = log.totalHours - targetHours;
                                                        
                                                        if (diff >= 2) {
                                                            return <span style={{ padding: '0.4rem 0.8rem', background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700', border: '1px solid rgba(139, 92, 246, 0.2)' }}>Overtime</span>;
                                                        } else if (diff >= -1) {
                                                            return <span style={{ padding: '0.4rem 0.8rem', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700', border: '1px solid rgba(16, 185, 129, 0.2)' }}>Full day</span>;
                                                        } else if (log.totalHours >= targetHours / 2) {
                                                            return <span style={{ padding: '0.4rem 0.8rem', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700', border: '1px solid rgba(245, 158, 11, 0.2)' }}>Half day</span>;
                                                        } else {
                                                            return <span style={{ padding: '0.4rem 0.8rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700', border: '1px solid rgba(239, 68, 68, 0.2)' }}>Short day</span>;
                                                        }
                                                    })()}
                                                </td>
                                                <td style={{ textAlign: 'center', padding: '1.25rem' }}>
                                                    <div onClick={() => setShowLogInfo(log)} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '50%', background: isLightMode ? '#f1f5f9' : 'rgba(255,255,255,0.05)', color: 'var(--primary)', cursor: 'pointer', transition: 'all 0.2s', ':hover': { background: 'var(--primary)', color: '#fff', transform: 'scale(1.1)' } }}>
                                                        <Info size={16} />
                                                    </div>
                                                </td>
                                            </tr>
                                        )) : (
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
                            <div style={{ fontSize: '1.05rem', fontWeight: '800', letterSpacing: '-0.3px', color: 'var(--text-main)', marginBottom: '1.5rem' }}>Work From Home Requests</div>
                            <div style={{ borderRadius: '20px', border: `1px solid ${isLightMode ? '#e2e8f0' : 'var(--border-dark)'}`, overflow: 'hidden' }}>
                                <table className="data-table" style={{ margin: 0 }}>
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
                                        {myRequests.filter(r => r.type === 'Work From Home').length > 0 ? myRequests.filter(r => r.type === 'Work From Home').map(r => (
                                            <tr key={r._id} style={{ borderBottom: `1px solid ${isLightMode ? '#e2e8f0' : 'var(--border-dark)'}` }}>
                                                <td style={{ fontSize: '0.85rem', fontWeight: '600', padding: '1.25rem' }}>
                                                    {new Date(r.startDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                    {r.startDate !== r.endDate && ` - ${new Date(r.endDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}`}
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', fontWeight: '600' }}>
                                                        {Math.ceil((new Date(r.endDate) - new Date(r.startDate)) / (1000 * 60 * 60 * 24)) + 1} day(s)
                                                    </div>
                                                </td>
                                                <td style={{ fontSize: '0.85rem', fontWeight: '700', padding: '1.25rem' }}>
                                                    {r.type}
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
