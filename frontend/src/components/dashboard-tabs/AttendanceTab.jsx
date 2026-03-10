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

    return (
        <>
            <div className="grid" style={{ gridTemplateColumns: 'minmax(300px, 1fr) minmax(300px, 1fr) minmax(300px, 1fr)', gap: '1.25rem', marginBottom: '1.25rem' }}>
                <div className="panel" style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>Attendance Stats</span>
                        <select
                            value={statsPeriod}
                            onChange={(e) => {
                                setStatsPeriod(e.target.value);
                                fetchTeamStats(e.target.value);
                            }}
                            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '0.75rem', outline: 'none', cursor: 'pointer' }}
                        >
                            <option value="Last Week">Last Week</option>
                            <option value="Last Month">Last Month</option>
                        </select>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        {(meStats.hasData || teammateIndividualStats.length > 0) ? (
                            <>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(var(--primary-rgb), 0.2)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>ME</div>
                                        <span style={{ fontSize: '0.85rem' }}>Me</span>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', letterSpacing: '0.3px' }}>Avg Hrs / Day</div>
                                        <div style={{ fontSize: '0.9rem', fontWeight: '500' }}>{meStats.avgHours}</div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', letterSpacing: '0.3px' }}>On Time Arrival</div>
                                        <div style={{ fontSize: '0.9rem', fontWeight: '500' }}>{meStats.onTime}</div>
                                    </div>
                                </div>
                                {teammateIndividualStats.map(ts => (
                                    <div key={ts._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div className="avatar" style={{ width: '32px', height: '32px', fontSize: '0.7rem', background: 'rgba(var(--primary-rgb), 0.1)', color: 'var(--text-muted)' }}>
                                                {ts.name.substring(0, 2).toUpperCase()}
                                            </div>
                                            <span style={{ fontSize: '0.85rem' }}>{ts.name}</span>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', letterSpacing: '0.3px' }}>Avg Hrs / Day</div>
                                            <div style={{ fontSize: '0.9rem', fontWeight: '500' }}>{Math.floor(ts.avgHours)}h {Math.round((ts.avgHours % 1) * 60)}m</div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', letterSpacing: '0.3px' }}>On Time Arrival</div>
                                            <div style={{ fontSize: '0.9rem', fontWeight: '500' }}>{ts.onTimePercentage}%</div>
                                        </div>
                                    </div>
                                ))}
                            </>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                No data available to show for this period.
                            </div>
                        )}
                    </div>
                </div>

                <div className="panel" style={{ padding: '1.25rem' }}>
                    <div className="panel-header" style={{ marginBottom: '1rem' }}>Work Schedule</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div style={{ background: 'rgba(var(--primary-rgb), 0.05)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-dark)' }}>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'capitalize', letterSpacing: '0.3px', marginBottom: '0.5rem' }}>Daily Shift Requirement</div>
                            <div style={{ fontSize: '0.95rem', fontWeight: '500', color: 'var(--text-main)' }}>{user?.workingSchedule?.shiftStart || '11:00'} - {user?.workingSchedule?.shiftEnd || '07:00 PM'}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--primary)', marginTop: '0.25rem', fontWeight: '500' }}>Target: {user?.workingSchedule?.minHours || 7.0} Effective Hours</div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', padding: '0.2rem 0' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Status Window:</span>
                                <span style={{ color: 'var(--text-main)', fontWeight: '500' }}>{user?.workingSchedule?.shiftStart || '11:00'} to {(() => {
                                    const [h, m] = (user?.workingSchedule?.shiftStart || '11:00').split(':').map(Number);
                                    return `${(h + 1) % 12 || 12}:${m.toString().padStart(2, '0')} ${h + 1 >= 12 ? 'PM' : 'AM'}`;
                                })()}</span>
                            </div>
                            <div style={{ height: '1px', background: 'var(--border-dark)' }}></div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                <Calendar size={12} /> Next week-off: {user?.workingSchedule?.weekOffs?.[0] || 'Sunday'}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="panel panel-actions" style={{ padding: '1.25rem' }}>
                    <div className="panel-header" style={{ marginBottom: '0.75rem' }}>Actions</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontSize: '1.25rem', fontWeight: '400', marginBottom: '0.25rem' }}>
                                    <span className={isClockedIn ? 'timer-pulse' : ''} style={{ display: 'inline-block' }}>{currentTime}</span>
                                </div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>{new Date().toDateString()}</div>
                                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'capitalize', letterSpacing: '0.3px', marginBottom: '0.25rem' }}>Total Hours <HelpCircle size={10} /></div>
                                <div style={{ fontSize: '0.85rem' }}>
                                    Effective: <span style={{ fontWeight: '500' }}>{isClockedIn ? calculateElapsedTime(activeLog?.clockInTime).text : '0h 0m'}</span>
                                </div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                    Gross: {isClockedIn ? calculateElapsedTime(activeLog?.clockInTime).text : '0h 0m'}
                                </div>
                            </div>
                            {isClockedIn && renderHourglass()}
                        </div>
                        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                            {isAttendanceFinished && !isClockedIn ? (
                                <div style={{ textAlign: 'right', color: '#00ff88', fontSize: '0.85rem', fontWeight: '500', maxWidth: '180px', lineHeight: '1.4' }}>
                                    Your attendance for today is completed. See you tomorrow!
                                </div>
                            ) : (
                                <>
                                    <button
                                        className={`btn ${isClockedIn ? 'btn-danger' : 'btn-primary'}`}
                                        onClick={handleClockToggle}
                                        style={{ width: '120px', fontSize: '0.8rem', padding: '0.5rem 0' }}
                                    >
                                        {isClockedIn ? 'Web Clock-out' : 'Web Clock-in'}
                                    </button>
                                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                                        {isClockedIn ? (
                                            <>
                                                <span className="action-timer-dot timer-pulse"></span>
                                                <Clock size={10} className="timer-pulse" style={{ marginRight: '4px' }} />
                                                {calculateElapsedTime(activeLog?.clockInTime).text} Since Last Login
                                            </>
                                        ) : 'Currently offline'}
                                    </div>
                                </>
                            )}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--primary)', cursor: 'pointer' }}>
                                <Home size={12} /> {isClockedIn ? (isWFH ? 'Work From Home' : 'Work On-Site') : (selectedWorkingMode === 'Remote' ? 'Work From Home' : 'Work On-Site')}
                            </div>
                            <div
                                style={{ fontSize: '0.75rem', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                                onClick={() => setShowAttendancePolicyModal(true)}
                            >
                                <FileText size={12} /> Attendance Policy
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="panel" style={{ padding: 0 }}>
                <div style={{ padding: '0 1.25rem', borderBottom: '1px solid var(--border-dark)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.9rem', padding: '0.75rem 0' }}>
                        {['Attendance Log', 'Calendar', 'Attendance Requests'].map(tab => (
                            <span
                                key={tab}
                                onClick={() => setAttendanceTab(tab)}
                                style={{
                                    padding: '0.4rem 1rem',
                                    cursor: 'pointer',
                                    color: attendanceTab === tab ? '#ffffff' : 'var(--text-muted)',
                                    backgroundColor: attendanceTab === tab ? 'var(--primary)' : 'transparent',
                                    borderRadius: '6px',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    fontWeight: '500'
                                }}
                            >
                                {tab}
                            </span>
                        ))}
                    </div>
                </div>

                <div style={{ padding: '1.25rem' }}>
                    {attendanceTab === 'Attendance Log' && (
                        <>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                                <span style={{ fontSize: '1rem', fontWeight: '500' }}>Attendance: {attendancePeriod}</span>
                                <div style={{ display: 'flex', borderRadius: '4px', border: '1px solid var(--border-dark)', overflow: 'hidden' }}>
                                    {(() => {
                                        const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
                                        const currentMonth = new Date().getMonth();
                                        const displayMonths = ['30 DAYS'];
                                        for (let i = currentMonth; i >= 0; i--) {
                                            displayMonths.push(months[i]);
                                        }
                                        return displayMonths.map((m, i) => (
                                            <div
                                                key={m}
                                                onClick={() => setAttendancePeriod(m)}
                                                style={{
                                                    padding: '0.4rem 0.75rem', fontSize: '0.7rem', cursor: 'pointer',
                                                    background: attendancePeriod === m ? 'var(--primary)' : 'transparent',
                                                    color: attendancePeriod === m ? 'white' : 'var(--text-muted)',
                                                    borderRight: i === displayMonths.length - 1 ? 'none' : '1px solid var(--border-dark)'
                                                }}
                                            >
                                                {m}
                                            </div>
                                        ));
                                    })()}
                                </div>
                            </div>
                            <table className="data-table">
                                <thead>
                                    <tr style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                                        <th>Date</th>
                                        <th>Attendance Visual</th>
                                        <th>Effective Hours</th>
                                        <th>Gross Hours</th>
                                        <th>Arrival</th>
                                        <th>Log</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredAttendanceLogs.length > 0 ? filteredAttendanceLogs.map(log => (
                                        <tr key={log._id}>
                                            <td style={{ fontSize: '0.8rem' }}>{new Date(log.date).toLocaleDateString('en-US', { weekday: 'short', day: '2-digit', month: 'short' })}</td>
                                            <td>
                                                <div style={{ width: '120px', height: '6px', background: 'var(--border-dark)', borderRadius: '3px' }}>
                                                    <div style={{ width: log.clockOutTime ? '100%' : '50%', height: '100%', background: 'var(--primary)', borderRadius: '3px' }}></div>
                                                </div>
                                            </td>
                                            <td style={{ fontSize: '0.85rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', border: '2px solid var(--primary)' }}></div>
                                                    {log.totalHours ? `${Math.floor(log.totalHours)}h ${Math.round((log.totalHours % 1) * 60)}m` : (log.clockInTime ? 'Ongoing' : '0h 0m')}
                                                </div>
                                            </td>
                                            <td style={{ fontSize: '0.85rem' }}>{log.totalHours ? `${Math.floor(log.totalHours)}h ${Math.round((log.totalHours % 1) * 60)}m` : (log.clockInTime ? 'Ongoing' : '0h 0m')}</td>
                                            <td style={{ fontSize: '0.8rem' }}>
                                                {(() => {
                                                    if (!log.clockInTime) return '-';
                                                    const clockInDate = new Date(log.clockInTime);
                                                    const hours = clockInDate.getHours();
                                                    const mins = clockInDate.getMinutes();
                                                    const totalMins = hours * 60 + mins;

                                                    const [shiftH, shiftM] = (user?.workingSchedule?.shiftStart || '11:00').split(':').map(Number);
                                                    const shiftStartMins = shiftH * 60 + shiftM;

                                                    if (totalMins < shiftStartMins) {
                                                        return <span style={{ color: 'var(--success)', fontWeight: '500' }}>Early</span>;
                                                    } else if (totalMins <= shiftStartMins + 60) {
                                                        return <span style={{ color: 'var(--primary)', fontWeight: '500' }}>On Time</span>;
                                                    } else {
                                                        return <span style={{ color: 'var(--danger)', fontWeight: '500' }}>Late</span>;
                                                    }
                                                })()}
                                            </td>
                                            <td><Info size={14} color="var(--primary)" style={{ cursor: 'pointer' }} onClick={() => setShowLogInfo(log)} /></td>
                                        </tr>
                                    )) : (
                                        <tr style={{ border: 'none' }}><td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No logs found for {attendancePeriod}</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </>
                    )}
                    {attendanceTab === 'Calendar' && (
                        <div style={{ padding: '1.25rem' }}>
                            {renderAttendanceCalendar()}
                        </div>
                    )}
                    {attendanceTab === 'Attendance Requests' && (
                        <div>
                            <div style={{ fontSize: '0.9rem', fontWeight: '500', marginBottom: '1rem', color: 'var(--text-main)' }}>Work From Home Requests</div>
                            <div className="panel" style={{ padding: 0 }}>
                                <table className="data-table">
                                    <thead>
                                        <tr style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                                            <th>Request Dates</th>
                                            <th>Request Type</th>
                                            <th>Status</th>
                                            <th>Requested By</th>
                                            <th>Action Taken On</th>
                                            <th>Message</th>
                                            <th>Reject/Cancel Reason</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {myRequests.filter(r => r.type === 'Work From Home').length > 0 ? myRequests.filter(r => r.type === 'Work From Home').map(r => (
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

                                                <td style={{ fontSize: '0.8rem' }}>{user.name}</td>
                                                <td style={{ fontSize: '0.8rem' }}>{r.status !== 'Pending' && r.actionDate ? new Date(r.actionDate).toLocaleDateString() : '-'}</td>
                                                <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)', maxWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.message || '-'}</td>
                                                <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)', maxWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.actionNote || '-'}</td>
                                            </tr>
                                        )) : (
                                            <tr><td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No WFH requests found.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default AttendanceTab;
