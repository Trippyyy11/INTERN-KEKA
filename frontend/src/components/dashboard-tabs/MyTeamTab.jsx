import React, { useState, useEffect, useCallback } from 'react';
import {
    Calendar as CalendarIcon,
    ChevronLeft,
    ChevronRight,
    Search,
    Download,
    X
} from 'lucide-react';
import api from '../../api/axios';
import moment from 'moment';

const MyTeamTab = ({
    user,
    teammates,
    dashData,
    setShowPublicProfile,
    isLightMode,
}) => {
    const [showEmployeesPanel, setShowEmployeesPanel] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentMonth, setCurrentMonth] = useState(moment());
    const [calendarData, setCalendarData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [appAlert, setAppAlert] = useState(null);
    const [filterStatus, setFilterStatus] = useState('All');
    const [activeMenu, setActiveMenu] = useState(null);

    const triggerAlert = (msg) => {
        setAppAlert(msg);
        setTimeout(() => setAppAlert(null), 3000);
    };

    const handleDownloadCSV = () => {
        const headers = ['Employee Name', 'ID', 'Department', 'Location', 'Job Title', 'Clock-In Time', 'Status'];
        const filteredEmployees = [user, ...teammates].filter(e => {
            const matchesSearch = e.name.toLowerCase().includes(searchTerm.toLowerCase());
            const att = dashData.teamAttendance?.find(a => a.user.toString() === e._id.toString());
            const isNotIn = dashData.notInYet?.some(m => m._id === e._id);

            if (!matchesSearch) return false;
            if (filterStatus === 'All') return true;
            if (filterStatus === 'Not In') return isNotIn;
            if (filterStatus === 'WFH') return att?.status === 'WFH';

            if (att && att.clockInTime && (e.workingSchedule?.shiftStart || '09:00')) {
                const shiftStart = moment(e.workingSchedule?.shiftStart || '09:00', 'HH:mm');
                const clockIn = moment(att.clockInTime);
                const isLate = clockIn.isAfter(shiftStart.add(15, 'minutes'));
                if (filterStatus === 'Late') return isLate;
                if (filterStatus === 'On Time') return !isLate;
            }
            return false;
        });

        const rows = filteredEmployees.map(e => {
            const att = dashData.teamAttendance?.find(a => a.user.toString() === e._id.toString());
            const isNotIn = dashData.notInYet?.some(m => m._id === e._id);
            let clockInStr = '09:00 AM';
            let statusStr = 'Pending';
            if (att?.clockInTime) {
                clockInStr = moment(att.clockInTime).format('hh:mm A');
                const shiftStart = moment(e.workingSchedule?.shiftStart || '09:00', 'HH:mm');
                statusStr = moment(att.clockInTime).isAfter(shiftStart.add(15, 'minutes')) ? 'Late' : 'On Time';
            } else if (e.workingSchedule?.shiftStart) {
                clockInStr = moment(e.workingSchedule.shiftStart, 'HH:mm').format('hh:mm A');
                statusStr = isNotIn ? 'Not In' : 'Scheduled';
            }
            return [
                `"${e.name}"`,
                `"${e._id}"`,
                `"${e.department}"`,
                `"${e.place || 'Nagpur'}"`,
                `"${e.designation}"`,
                `"${clockInStr}"`,
                `"${statusStr}"`
            ].join(',');
        });

        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `employee_attendance_${moment().format('YYYY-MM-DD')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        triggerAlert('CSV Exported successfully!');
    };

    const fetchCalendarData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get(`/dashboard/team-calendar?month=${currentMonth.month() + 1}&year=${currentMonth.year()}`);
            setCalendarData(res.data);
        } catch (error) {
            console.error('Error fetching calendar data:', error);
        } finally {
            setLoading(false);
        }
    }, [currentMonth]);

    useEffect(() => {
        fetchCalendarData();
    }, [fetchCalendarData]);

    const handlePrevMonth = () => {
        setCurrentMonth(prev => prev.clone().subtract(1, 'month'));
    };

    const handleNextMonth = () => {
        setCurrentMonth(prev => prev.clone().add(1, 'month'));
    };

    const stats = dashData.activityStats || {
        onTimeCount: 0,
        lateCount: 0,
        wfhCount: 0,
        remoteCount: 0
    };

    const renderCalendar = () => {
        if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading calendar...</div>;
        if (!calendarData || calendarData.teamMembers.length === 0) {
            return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No data available for this month</div>;
        }

        const { teamMembers, attendance, leaves, holidays, daysInMonth } = calendarData;
        const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

        // Get day names for the headers
        const dayHeaders = days.map(d => {
            const date = currentMonth.clone().date(d);
            return {
                dayNum: d,
                dayName: date.format('dd'),
                isWeekend: [0, 6].includes(date.day()),
                fullDate: date.format('YYYY-MM-DD')
            };
        });

        return (
            <div className="panel" style={{ padding: '1.5rem', marginTop: '1.5rem' }}>
                <div className="panel-header" style={{ borderBottom: 'none', marginBottom: '1.5rem' }}>Team calendar</div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', background: 'var(--bg-panel)', padding: '2px 8px', borderRadius: '4px', border: '1px solid var(--border-dark)' }}>
                        <button className="btn-icon" style={{ padding: '4px' }} onClick={handlePrevMonth}><ChevronLeft size={14} /></button>
                        <span style={{ fontSize: '0.8rem', fontWeight: '600', minWidth: '80px', textAlign: 'center' }}>
                            {currentMonth.format('MMM YYYY')}
                        </span>
                        <button className="btn-icon" style={{ padding: '4px' }} onClick={handleNextMonth}><ChevronRight size={14} /></button>
                    </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <div style={{ minWidth: `${200 + daysInMonth * 28}px` }}>
                        {/* Day Names Header */}
                        <div style={{ display: 'flex', marginBottom: '0.5rem' }}>
                            <div style={{ width: '200px' }}></div>
                            <div style={{ flex: 1, display: 'flex' }}>
                                {dayHeaders.map((h, i) => {
                                    return (
                                        <div key={i} style={{ flex: 1, textAlign: 'center', minWidth: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                                            <span style={{ fontSize: '0.65rem', color: h.isWeekend ? 'var(--text-muted)' : 'inherit' }}>{h.dayName}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Day Numbers Header */}
                        <div style={{ display: 'flex', marginBottom: '1rem' }}>
                            <div style={{ width: '200px' }}></div>
                            <div style={{ flex: 1, display: 'flex' }}>
                                {dayHeaders.map(h => (
                                    <div key={h.dayNum} style={{ flex: 1, textAlign: 'center', fontSize: '0.7rem', fontWeight: currentMonth.isSame(moment(), 'month') && h.dayNum === moment().date() ? '700' : '400', color: currentMonth.isSame(moment(), 'month') && h.dayNum === moment().date() ? 'var(--primary)' : 'inherit' }}>{h.dayNum}</div>
                                ))}
                            </div>
                        </div>

                        {/* Team Rows */}
                        {teamMembers.map((member) => (
                            <div key={member._id} style={{ display: 'flex', alignItems: 'center', marginBottom: '0.75rem' }}>
                                <div style={{ width: '200px', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div className="avatar" style={{ width: '24px', height: '24px', fontSize: '0.7rem' }}>
                                        {member.avatar ? <img src={member.avatar} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%' }} /> : member.name.substring(0, 2).toUpperCase()}
                                    </div>
                                    <span style={{ fontSize: '0.8rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{member.name}</span>
                                </div>
                                <div style={{ flex: 1, display: 'flex' }}>
                                    {dayHeaders.map(h => {
                                        let dotColor = 'transparent';
                                        const dateStr = h.fullDate;
                                        const dayNameLong = moment(dateStr).format('dddd');
                                        const isPastOrToday = moment(dateStr).isSameOrBefore(moment(), 'day');

                                        // 1. Check Leaves (Always show, past and future)
                                        const leave = leaves.find(l => l.user?._id === member._id && moment(l.startDate).isSameOrBefore(dateStr, 'day') && moment(l.endDate).isSameOrAfter(dateStr, 'day'));
                                        if (leave) {
                                            if (leave.type === 'Paid' || leave.type === 'Casual') dotColor = '#00d1ff'; // Paid Leave (Cyan)
                                            else if (leave.type === 'Sick') dotColor = '#f43f5e'; // Sick/Pink
                                            else dotColor = '#fef3c7'; // Unpaid/Other
                                        }
                                        else {
                                            // 2. Check WFH (Always show, past and future)
                                            const att = attendance.find(a => a.user === member._id && moment(a.date).isSame(dateStr, 'day'));
                                            if (att && (att.status === 'WFH' || att.workingMode === 'Remote')) {
                                                dotColor = '#b24fff'; // WFH (Purple)
                                            }
                                            // 3. Other fields only for past or today
                                            else if (isPastOrToday) {
                                                // Holidays
                                                const holiday = holidays.find(hol => moment(hol.date).isSame(dateStr, 'day'));
                                                if (holiday) {
                                                    dotColor = '#3b82f6'; // Holiday (Blue/Indigo)
                                                }
                                                // Weekly Off (Default to Sunday if not set)
                                                else {
                                                    const userWeekOffs = (member.workingSchedule?.weekOffs && member.workingSchedule.weekOffs.length > 0)
                                                        ? member.workingSchedule.weekOffs
                                                        : ['Sunday'];

                                                    if (userWeekOffs.includes(dayNameLong)) {
                                                        dotColor = '#fbbf24'; // Weekly off (Amber)
                                                    }
                                                    // Attendance (Present)
                                                    else if (att && att.status === 'Present') {
                                                        dotColor = '#22c55e'; // Present (Green)
                                                    }
                                                }
                                            }
                                        }

                                        return (
                                            <div key={h.dayNum} style={{ flex: 1, height: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '24px' }}>
                                                {dotColor !== 'transparent' && (
                                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: dotColor }}></div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Calendar Legend - Refined per feedback */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.2rem', marginTop: '1.5rem', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#b24fff' }}></div> Work from home</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }}></div> Present</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00d1ff' }}></div> Paid Leave</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#fef3c7' }}></div> Unpaid Leave</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f87171' }}></div> Leave due to No Attendance</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#fbbf24' }}></div> Weekly off</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6' }}></div> Holiday</div>
                </div>
            </div>
        );
    };

    return (
        <div className="page-content" style={{ position: 'relative' }}>
            {/* Top Summaries Row */}
            <div className="grid" style={{
                gridTemplateColumns: '1fr 1fr',
                columnGap: '2.5rem',
                rowGap: '2rem', marginBottom: '1.5rem'
            }}>
                <div className="panel" style={{ padding: '1.25rem' }}>
                    <div className="panel-header" style={{ borderBottom: 'none', marginBottom: '1rem', fontSize: '0.9rem' }}>Who is off today</div>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        {dashData.leaves && dashData.leaves.length > 0 ? dashData.leaves.map(l => (
                            <div key={l._id} style={{ textAlign: 'center' }}>
                                <div className="avatar" style={{ border: '2px solid #ff4f8b' }}>
                                    {l.user?.name?.substring(0, 2).toUpperCase()}
                                </div>
                                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>{l.user?.name?.split(' ')[0]}..</div>
                            </div>
                        )) : <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No one is off today</div>}
                    </div>
                </div>
                <div className="panel" style={{ padding: '1.25rem' }}>
                    <div className="panel-header" style={{ borderBottom: 'none', marginBottom: '1rem', fontSize: '0.9rem' }}>Not in yet today</div>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        {dashData.notInYet && dashData.notInYet.length > 0 ? dashData.notInYet.map(m => (
                            <div key={m._id} style={{ textAlign: 'center' }}>
                                <div className="avatar" style={{ border: '2px solid #00d1ff', background: '#00d1ff22' }}>
                                    {m.name.substring(0, 2).toUpperCase()}
                                </div>
                                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>{m.name.split(' ')[0]}..</div>
                            </div>
                        )) : <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Everyone is in!</div>}
                    </div>
                </div>
            </div>

            {/* Stats Cards Row */}
            <div className="grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="panel" style={{ padding: '1.25rem', borderLeft: '3px solid var(--primary)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Employees On Time today</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                        <span style={{ fontSize: '1.5rem', fontWeight: '600' }}>{stats.onTimeCount}</span>
                        <span className="view-details" style={{ color: 'var(--primary)', fontSize: '0.75rem', cursor: 'pointer' }} onClick={() => setShowEmployeesPanel(true)}>View Employees</span>
                    </div>
                </div>
                <div className="panel" style={{ padding: '1.25rem', borderLeft: '3px solid #ff4f8b' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Late Arrivals today</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '600' }}>{stats.lateCount}</div>
                </div>
                <div className="panel" style={{ padding: '1.25rem', borderLeft: '3px solid #00d1ff' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Remote Clock-ins today</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '600' }}>{stats.remoteCount}</div>
                </div>
            </div>

            {/* Team Calendar */}
            {renderCalendar()}

            {/* Peers Section */}
            <div style={{ marginTop: '2.5rem' }}>
                <div style={{ fontSize: '1rem', fontWeight: '500', marginBottom: '1.5rem' }}>Peers ({teammates.length + 1})</div>
                <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                    {[user, ...teammates].map(t => {
                        const isOff = dashData.leaves?.some(l => l.user?._id === t._id);
                        const isNotIn = dashData.notInYet?.some(m => m._id === t._id);

                        return (
                            <div key={t._id} className="panel" style={{ padding: '1.5rem', position: 'relative' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div className="avatar" style={{ width: '48px', height: '48px' }}>
                                        {t.name.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div style={{ flex: 1, overflow: 'hidden' }}>
                                        <div style={{ fontWeight: '600', fontSize: '0.9rem', marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.name}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.designation}</div>
                                    </div>
                                    {isNotIn && <div style={{ fontSize: '0.6rem', padding: '2px 6px', background: '#4a5568', borderRadius: '4px', fontWeight: '600' }}>NOT IN YET</div>}
                                    {isOff && <div style={{ fontSize: '0.6rem', padding: '2px 6px', background: '#b24fff', borderRadius: '4px', fontWeight: '600' }}>LEAVE</div>}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Lateral Panel: View Employees */}
            {showEmployeesPanel && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    right: 0,
                    width: '600px',
                    height: '100vh',
                    background: 'var(--bg-panel)',
                    boxShadow: 'var(--glow-panel)',
                    zIndex: 2000,
                    display: 'flex',
                    flexDirection: 'column',
                    animation: 'slideInRight 0.3s ease-out',
                    color: 'var(--text-main)',
                    borderLeft: '1px solid var(--border-dark)'
                }}>
                    <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-dark)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2 style={{ fontSize: '1.25rem', margin: 0, fontWeight: '600', color: 'var(--text-main)' }}>View Employees</h2>
                        <button className="btn-icon" style={{ color: 'var(--text-muted)' }} onClick={() => setShowEmployeesPanel(false)}><X size={24} /></button>
                    </div>

                    <div style={{ padding: '1.5rem', flex: 1, overflowY: 'auto' }}>
                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{ flex: 1, position: 'relative' }}>
                                <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input
                                    type="text"
                                    placeholder="Search"
                                    style={{
                                        width: '100%',
                                        padding: '0.6rem 1rem 0.6rem 2.5rem',
                                        background: isLightMode ? '#f7fafc' : 'rgba(0,0,0,0.2)',
                                        border: '1px solid var(--border-dark)',
                                        color: 'var(--text-main)',
                                        borderRadius: '8px',
                                        outline: 'none'
                                    }}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <button className="btn-icon" style={{ color: 'var(--text-muted)' }} title="Download" onClick={handleDownloadCSV}><Download size={20} /></button>
                        </div>

                        {/* Status Filters - NEW FEATURE */}
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                            {['All', 'On Time', 'Late', 'WFH', 'Not In'].map(status => (
                                <button
                                    key={status}
                                    onClick={() => setFilterStatus(status)}
                                    style={{
                                        padding: '4px 12px',
                                        borderRadius: '16px',
                                        fontSize: '0.75rem',
                                        fontWeight: '500',
                                        border: '1px solid',
                                        borderColor: filterStatus === status ? 'var(--primary)' : 'var(--border-dark)',
                                        background: filterStatus === status ? 'var(--primary)' : 'transparent',
                                        color: filterStatus === status ? 'white' : 'var(--text-muted)',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>


                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem', textAlign: 'right' }}>Total: {[user, ...teammates].length}</div>

                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                            <thead>
                                <tr style={{ borderBottom: `2px solid ${isLightMode ? '#edf2f7' : '#2d3748'}`, color: 'var(--text-muted)' }}>
                                    <th style={{ textAlign: 'left', padding: '1rem 0.5rem', fontWeight: '600' }}>EMPLOYEE</th>
                                    <th style={{ textAlign: 'left', padding: '1rem 0.5rem', fontWeight: '600' }}>DEPARTMENT</th>
                                    <th style={{ textAlign: 'left', padding: '1rem 0.5rem', fontWeight: '600' }}>LOCATION</th>
                                    <th style={{ textAlign: 'left', padding: '1rem 0.5rem', fontWeight: '600' }}>JOB TITLE</th>
                                    <th style={{ textAlign: 'left', padding: '1rem 0.5rem', fontWeight: '600' }}>CLOCK-IN TIME</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[user, ...teammates]
                                    .filter(e => {
                                        const matchesSearch = e.name.toLowerCase().includes(searchTerm.toLowerCase());
                                        const att = dashData.teamAttendance?.find(a => a.user.toString() === e._id.toString());
                                        const isNotIn = dashData.notInYet?.some(m => m._id === e._id);

                                        if (!matchesSearch) return false;
                                        if (filterStatus === 'All') return true;
                                        if (filterStatus === 'Not In') return isNotIn;
                                        if (filterStatus === 'WFH') return att?.status === 'WFH';

                                        if (att && att.clockInTime && (e.workingSchedule?.shiftStart || '09:00')) {
                                            const shiftStart = moment(e.workingSchedule?.shiftStart || '09:00', 'HH:mm');
                                            const clockIn = moment(att.clockInTime);
                                            const isLate = clockIn.isAfter(shiftStart.add(15, 'minutes'));
                                            if (filterStatus === 'Late') return isLate;
                                            if (filterStatus === 'On Time') return !isLate;
                                        }
                                        return false;
                                    })
                                    .map(e => {
                                        const att = dashData.teamAttendance?.find(a => a.user.toString() === e._id.toString());
                                        const isNotIn = dashData.notInYet?.some(m => m._id === e._id);

                                        // CLOCK IN LOGIC: Use actual if present, otherwise shift timing if not clocked in
                                        let clockInDisplay = '09:00 AM'; // Default fallback
                                        let statusLabel = '';
                                        let statusColor = '#718096';

                                        if (att?.clockInTime) {
                                            clockInDisplay = moment(att.clockInTime).format('hh:mm A');
                                            const shiftStart = moment(e.workingSchedule?.shiftStart || '09:00', 'HH:mm');
                                            if (moment(att.clockInTime).isAfter(shiftStart.add(15, 'minutes'))) {
                                                statusLabel = 'Late';
                                                statusColor = '#f43f5e';
                                            } else {
                                                statusLabel = 'On Time';
                                                statusColor = '#22c55e';
                                            }
                                        } else if (e.workingSchedule?.shiftStart) {
                                            // Show shift timing as expected clock-in
                                            clockInDisplay = moment(e.workingSchedule.shiftStart, 'HH:mm').format('hh:mm A');
                                            if (isNotIn) {
                                                statusLabel = 'Not In yet';
                                                statusColor = '#f59e0b';
                                            }
                                        }

                                        return (
                                            <tr key={e._id} style={{ borderBottom: `1px solid ${isLightMode ? '#edf2f7' : 'rgba(255,255,255,0.05)'}` }}>
                                                <td style={{ padding: '1.25rem 0.5rem' }}>
                                                    <div style={{ fontWeight: '600', color: 'var(--primary)' }}>{e.name}</div>
                                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{e._id.substring(0, 8)}</div>
                                                </td>
                                                <td style={{ padding: '1.25rem 0.5rem', color: 'var(--text-main)' }}>{e.department}</td>
                                                <td style={{ padding: '1.25rem 0.5rem', color: 'var(--text-main)' }}>{e.place || 'Nagpur'}</td>
                                                <td style={{ padding: '1.25rem 0.5rem', color: 'var(--text-main)' }}>{e.designation}</td>
                                                <td style={{ padding: '1.25rem 0.5rem', position: 'relative' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <div>
                                                            <div style={{ color: 'var(--text-main)', fontWeight: '500' }}>{clockInDisplay}</div>
                                                            {statusLabel && <div style={{ fontSize: '0.65rem', color: statusColor, fontWeight: '600' }}>{statusLabel}</div>}
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* In-App Custom Alert */}
            {appAlert && (
                <div style={{
                    position: 'fixed',
                    top: '20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'var(--bg-panel)',
                    color: 'var(--text-main)',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border-dark)',
                    boxShadow: 'var(--glow-panel)',
                    zIndex: 3000,
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    animation: 'fadeInOut 3s ease-in-out'
                }}>
                    <span style={{ fontSize: '1.1rem' }}>ℹ️</span> {appAlert}
                </div>
            )}

            <style>{`
                @keyframes slideInRight {
                    from { transform: translateX(100%); }
                    to { transform: translateX(0); }
                }
                @keyframes fadeInOut {
                    0% { opacity: 0; transform: translate(-50%, -10px); }
                    10% { opacity: 1; transform: translate(-50%, 0); }
                    90% { opacity: 1; transform: translate(-50%, 0); }
                    100% { opacity: 0; transform: translate(-50%, -10px); }
                }
                .menu-item:hover {
                    background: #f7fafc;
                }
            `}</style>
        </div>
    );
};

export default MyTeamTab;
