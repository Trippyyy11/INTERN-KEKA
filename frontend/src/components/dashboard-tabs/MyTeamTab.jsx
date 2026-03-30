import React, { useState, useEffect, useCallback } from 'react';
import {
    Calendar as CalendarIcon,
    ChevronLeft,
    ChevronRight,
    Search,
    Download,
    X,
    Users,
    Clock,
    UserX,
    Laptop,
    AlertCircle
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
    // activeMenu is unused but kept to preserve existing state
    const [activeMenu, setActiveMenu] = useState(null);
    const [hoveredTooltip, setHoveredTooltip] = useState(null);

    const triggerAlert = (msg) => {
        setAppAlert(msg);
        setTimeout(() => setAppAlert(null), 3000);
    };

    const handleDownloadCSV = () => {
        const headers = ['Intern Name', 'ID', 'Department', 'Location', 'Job Title', 'Clock-In Time', 'Status'];
        const filteredInterns = [user, ...teammates].filter(e => {
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

        const rows = filteredInterns.map(e => {
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
        link.setAttribute("download", `intern_attendance_${moment().format('YYYY-MM-DD')}.csv`);
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

    const bentoPanelStyle = {
        background: isLightMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(15, 23, 42, 0.5)',
        backdropFilter: 'blur(16px)',
        borderRadius: '24px',
        border: `1px solid ${isLightMode ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)'}`,
        padding: '1.5rem',
        boxShadow: isLightMode ? '0 4px 24px rgba(0,0,0,0.04)' : '0 4px 24px rgba(0,0,0,0.2)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden'
    };

    const inputStyle = {
        width: '100%',
        padding: '0.8rem 1rem 0.8rem 2.8rem',
        borderRadius: '16px',
        border: `1px solid ${isLightMode ? '#e2e8f0' : 'rgba(255,255,255,0.08)'}`,
        background: isLightMode ? '#f8fafc' : 'rgba(0,0,0,0.2)',
        color: 'var(--text-main)',
        fontSize: '0.9rem',
        fontWeight: '500',
        outline: 'none',
        transition: 'border-color 0.2s, box-shadow 0.2s',
    };

    const getGradientStyle = (colorRaw) => {
        return {
            background: `linear-gradient(135deg, rgba(${colorRaw}, 0.15), rgba(${colorRaw}, 0.02))`,
            border: `1px solid rgba(${colorRaw}, 0.2)`,
            color: `rgb(${colorRaw})`
        }
    };

    const renderCalendar = () => {
        if (loading) return <div style={{ ...bentoPanelStyle, padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading calendar...</div>;
        const myDept = user.department || 'No Department';
        if (!calendarData || !calendarData.teamMembers || calendarData.teamMembers.length === 0) {
            return (
                <div style={{ ...bentoPanelStyle, padding: '4rem', textAlign: 'center' }}>
                    <div style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>No team members found for your department: <strong>{myDept}</strong></div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', opacity: 0.7 }}>
                        Check your department settings or ask an admin to assign you to a department.
                    </div>
                    <button 
                        onClick={() => fetchCalendarData()}
                        style={{ marginTop: '1.5rem', padding: '0.6rem 1.25rem', borderRadius: '12px', background: 'var(--primary)', color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer' }}
                    >
                        Retry Load
                    </button>
                </div>
            );
        }

        const { teamMembers, attendance, leaves, holidays, daysInMonth } = calendarData;
        const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

        const dayHeaders = days.map(d => {
            const date = currentMonth.clone().date(d);
            return {
                dayNum: d,
                dayName: date.format('dd'),
                isWeekend: [0, 6].includes(date.day()),
                fullDate: date.format('YYYY-MM-DD')
            };
        });

        const isToday = (dayNum) => currentMonth.isSame(moment(), 'month') && dayNum === moment().date();

        const statusColors = {
            present: '#22c33e',
            leave: '#ef4444',
            wfh: '#ffa5ae',
            holiday: '#ffe030',
            weekOff: '#121212',
            halfDay: '#fb923c', // Amber 400
        };

        const getStatusForCell = (member, dateStr, dayNameLong, isWeekend, isPastOrToday) => {
            const memberId = member._id?.toString();
            const leave = leaves.find(l => {
                const leaveUserId = l.user?._id?.toString() || l.user?.toString();
                const fitsDate = leaveUserId === memberId && moment(l.startDate).isSameOrBefore(dateStr, 'day') && moment(l.endDate).isSameOrAfter(dateStr, 'day');
                if (!fitsDate) return false;

                // Check for cancellations
                const isCancelled = l.cancelledDates && l.cancelledDates.some(d => moment(d).isSame(dateStr, 'day'));
                return !isCancelled;
            });

            if (leave) {
                const isHalfDay = leave.type === 'Half Day';
                return {
                    color: isHalfDay ? statusColors.halfDay : statusColors.leave,
                    label: isHalfDay ? 'H' : 'L',
                    tooltip: isHalfDay ? 'Half Day' : `${leave.type || 'Leave'}`
                };
            }

            const att = attendance.find(a => {
                const attUserId = a.user?._id?.toString() || a.user?.toString();
                return attUserId === memberId && moment(a.date).isSame(dateStr, 'day');
            });
            if (att && (att.status === 'WFH' || att.workingMode === 'Remote')) return { color: statusColors.wfh, label: 'W', tooltip: 'Work From Home' };
            if (isPastOrToday) {
                const holiday = holidays.find(hol => moment(hol.date).isSame(dateStr, 'day'));
                if (holiday) return { color: statusColors.holiday, label: 'H', tooltip: holiday.name };
                const userWeekOffs = (member.workingSchedule?.weekOffs?.length > 0) ? member.workingSchedule.weekOffs : ['Sunday'];
                if (userWeekOffs.includes(dayNameLong)) return { color: statusColors.weekOff, label: '', tooltip: 'Week Off' };
                if (att && att.status === 'Present') return { color: statusColors.present, label: 'P', tooltip: 'Present' };
            }
            return null;
        };

        return (
            <div style={{ ...bentoPanelStyle, padding: '2rem' }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                            width: '42px', height: '42px', borderRadius: '14px',
                            background: 'linear-gradient(135deg, rgba(var(--primary-rgb), 0.15), rgba(var(--primary-rgb), 0.05))',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'var(--primary)'
                        }}>
                            <CalendarIcon size={20} />
                        </div>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-0.3px' }}>Team Calendar</h2>
                            <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '500', marginTop: '2px' }}>Monthly availability · {currentMonth.format('MMMM YYYY')}</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: isLightMode ? '#f8fafc' : 'rgba(0,0,0,0.2)', padding: '0.35rem', borderRadius: '12px', border: `1px solid ${isLightMode ? '#e2e8f0' : 'rgba(255,255,255,0.06)'}` }}>
                        <button style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px', borderRadius: '6px' }} onClick={handlePrevMonth}><ChevronLeft size={16} /></button>
                        <span style={{ fontSize: '0.85rem', fontWeight: '700', minWidth: '110px', textAlign: 'center', color: 'var(--text-main)' }}>{currentMonth.format('MMMM YYYY')}</span>
                        <button style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px', borderRadius: '6px' }} onClick={handleNextMonth}><ChevronRight size={16} /></button>
                    </div>
                </div>

                {/* Grid */}
                <div style={{ overflowX: 'auto', marginBottom: '1.5rem' }}>
                    <div style={{ minWidth: `${180 + daysInMonth * 30}px` }}>
                        {/* Day Headers */}
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.75rem' }}>
                            <div style={{ width: '180px', flexShrink: 0 }}></div>
                            <div style={{ flex: 1, display: 'flex' }}>
                                {dayHeaders.map((h, i) => (
                                    <div key={i} style={{ flex: 1, textAlign: 'center', minWidth: '30px' }}>
                                        <div style={{ fontSize: '0.6rem', fontWeight: '600', color: 'var(--text-muted)', opacity: h.isWeekend ? 0.4 : 0.7 }}>{h.dayName}</div>
                                        <div style={{
                                            fontSize: '0.75rem', fontWeight: isToday(h.dayNum) ? '800' : '600',
                                            color: isToday(h.dayNum) ? 'white' : (h.isWeekend ? 'var(--text-muted)' : 'var(--text-main)'),
                                            width: '22px', height: '22px', borderRadius: '50%', margin: '2px auto 0',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            background: isToday(h.dayNum) ? 'var(--primary)' : 'transparent'
                                        }}>{h.dayNum}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Rows */}
                        {teamMembers.map((member) => (
                            <div key={member._id} style={{
                                display: 'flex', alignItems: 'center', padding: '0.6rem 0',
                                borderTop: `1px solid ${isLightMode ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.04)'}`
                            }}>
                                <div style={{ width: '180px', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '0.65rem', paddingLeft: '0.25rem' }}>
                                    <div style={{
                                        width: '30px', height: '30px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: '800',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', overflow: 'hidden', flexShrink: 0,
                                        background: member.avatar ? 'transparent' : 'linear-gradient(135deg, var(--primary), rgba(var(--primary-rgb), 0.6))',
                                    }}>
                                        {member.avatar ? <img src={member.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : member.name.substring(0, 2).toUpperCase()}
                                    </div>
                                    <span style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{member.name}</span>
                                </div>
                                <div style={{ flex: 1, display: 'flex' }}>
                                    {dayHeaders.map(h => {
                                        const dateStr = h.fullDate;
                                        const dayNameLong = moment(dateStr).format('dddd');
                                        const isPastOrToday = moment(dateStr).isSameOrBefore(moment(), 'day');
                                        const status = getStatusForCell(member, dateStr, dayNameLong, h.isWeekend, isPastOrToday);

                                        return (
                                            <div key={h.dayNum} style={{
                                                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '30px', height: '30px'
                                            }}
                                                onMouseEnter={(e) => {
                                                    if (status?.tooltip) {
                                                        const rect = e.currentTarget.getBoundingClientRect();
                                                        setHoveredTooltip({
                                                            content: status.tooltip,
                                                            x: rect.left + rect.width / 2,
                                                            y: rect.top - 10,
                                                            color: status.color
                                                        });
                                                    }
                                                }}
                                                onMouseLeave={() => setHoveredTooltip(null)}
                                            >
                                                {status && (
                                                    <div style={{
                                                        width: '10px', height: '10px', borderRadius: '50%',
                                                        background: status.color,
                                                        boxShadow: `0 0 6px ${status.color}50`,
                                                        transition: 'transform 0.15s',
                                                    }}
                                                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.4)'}
                                                        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                                                    ></div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Legend */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', paddingTop: '1rem', borderTop: `1px solid ${isLightMode ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)'}` }}>
                    {[
                        { label: 'Present', color: statusColors.present },
                        { label: 'Leave', color: statusColors.leave },
                        { label: 'Half Day', color: statusColors.halfDay },
                        { label: 'WFH', color: statusColors.wfh },
                        { label: 'Holiday', color: statusColors.holiday },
                        { label: 'Week Off', color: statusColors.weekOff },
                    ].map(l => (
                        <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.72rem', fontWeight: '600', color: 'var(--text-muted)' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: l.color }}></div>
                            {l.label}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div style={{ padding: '0 1.5rem', marginTop: '1rem', position: 'relative' }}>
            {/* ── Top Summaries Row ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.2fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div style={{ ...bentoPanelStyle, padding: '1.5rem 1.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(244, 63, 94, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <UserX size={16} color="#f43f5e" />
                        </div>
                        <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-main)' }}>Who is off today</h3>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                        {dashData.leaves && dashData.leaves.length > 0 ? dashData.leaves.map(l => (
                            <div key={l._id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', background: isLightMode ? '#f8fafc' : 'rgba(0,0,0,0.15)', padding: '0.75rem', borderRadius: '16px', border: `1px solid ${isLightMode ? '#e2e8f0' : 'rgba(255,255,255,0.04)'}` }}>
                                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(244, 63, 94, 0.1)', color: '#f43f5e', fontSize: '1rem', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {l.user?.name?.substring(0, 2).toUpperCase()}
                                </div>
                                <div style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-main)', maxWidth: '60px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{l.user?.name?.split(' ')[0]}</div>
                            </div>
                        )) : <div style={{ fontSize: '0.85rem', fontWeight: '500', color: 'var(--text-muted)' }}>No one is off today</div>}
                    </div>
                </div>

                <div style={{ ...bentoPanelStyle, padding: '1.5rem 1.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <AlertCircle size={16} color="#f59e0b" />
                        </div>
                        <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-main)' }}>Not in yet today</h3>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                        {dashData.notInYet && dashData.notInYet.length > 0 ? dashData.notInYet.map(m => (
                            <div key={m._id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', background: isLightMode ? '#f8fafc' : 'rgba(0,0,0,0.15)', padding: '0.75rem', borderRadius: '16px', border: `1px solid ${isLightMode ? '#e2e8f0' : 'rgba(255,255,255,0.04)'}` }}>
                                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', fontSize: '1rem', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {m.name.substring(0, 2).toUpperCase()}
                                </div>
                                <div style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-main)', maxWidth: '60px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.name.split(' ')[0]}</div>
                            </div>
                        )) : <div style={{ fontSize: '0.85rem', fontWeight: '500', color: 'var(--text-muted)' }}>Everyone is in!</div>}
                    </div>
                </div>
            </div>

            {/* ── Stats Cards Row ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ ...bentoPanelStyle, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.75rem' }}>
                    <div>
                        <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '0.5rem' }}>On Time Today</div>
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.75rem' }}>
                            <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-main)', lineHeight: '1' }}>{stats.onTimeCount}</div>
                            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--primary)', cursor: 'pointer', paddingBottom: '0.2rem' }} onClick={() => setShowEmployeesPanel(true)}>View All</span>
                        </div>
                    </div>
                    <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(34, 197, 94, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Clock size={28} color="#22c55e" />
                    </div>
                </div>

                <div style={{ ...bentoPanelStyle, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.75rem' }}>
                    <div>
                        <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '0.5rem' }}>Late Arrivals</div>
                        <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-main)', lineHeight: '1' }}>{stats.lateCount}</div>
                    </div>
                    <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Clock size={28} color="#ef4444" />
                    </div>
                </div>

                <div style={{ ...bentoPanelStyle, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.75rem' }}>
                    <div>
                        <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '0.5rem' }}>Remote Clock-ins</div>
                        <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-main)', lineHeight: '1' }}>{stats.remoteCount}</div>
                    </div>
                    <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(168, 85, 247, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Laptop size={28} color="#a855f7" />
                    </div>
                </div>
            </div>

            {/* ── Team Calendar ── */}
            {renderCalendar()}

            {/* ── Peers Section ── */}
            <div style={{ marginTop: '2.5rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '12px', background: 'rgba(var(--primary-rgb), 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Users size={16} color="var(--primary)" />
                    </div>
                    <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-main)' }}>Your Peers</h3>
                    <div style={{ fontSize: '0.75rem', fontWeight: '700', background: 'rgba(var(--primary-rgb), 0.1)', color: 'var(--primary)', padding: '0.2rem 0.6rem', borderRadius: '20px' }}>
                        {teammates.length + 1}
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
                    {[user, ...teammates].map(t => {
                        const isOff = dashData.leaves?.some(l => l.user?._id === t._id);
                        const isNotIn = dashData.notInYet?.some(m => m._id === t._id);

                        return (
                            <div key={t._id} style={{ ...bentoPanelStyle, padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'default' }} onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = isLightMode ? '0 8px 24px rgba(0,0,0,0.06)' : '0 8px 24px rgba(0,0,0,0.2)'; e.currentTarget.style.borderColor = isLightMode ? '#cbd5e1' : 'rgba(255,255,255,0.1)' }} onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = isLightMode ? '0 4px 24px rgba(0,0,0,0.04)' : '0 4px 24px rgba(0,0,0,0.2)'; e.currentTarget.style.borderColor = isLightMode ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)' }}>
                                <div style={{
                                    width: '46px', height: '46px', borderRadius: '14px', fontSize: '1rem', fontWeight: '800', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
                                    background: t.profilePicture ? 'transparent' : 'linear-gradient(135deg, var(--primary), rgba(var(--primary-rgb), 0.7))',
                                }}>
                                    {t.profilePicture ? <img src={t.profilePicture} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : t.name.substring(0, 2).toUpperCase()}
                                </div>
                                <div style={{ flex: 1, overflow: 'hidden' }}>
                                    <div style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--text-main)', marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.name}</div>
                                    <div style={{ fontSize: '0.75rem', fontWeight: '500', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.designation}</div>
                                </div>
                                {isNotIn && <div style={{ fontSize: '0.65rem', padding: '0.3rem 0.6rem', background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', borderRadius: '8px', fontWeight: '700' }}>NOT IN</div>}
                                {isOff && <div style={{ fontSize: '0.65rem', padding: '0.3rem 0.6rem', background: 'rgba(244, 63, 94, 0.15)', color: '#f43f5e', borderRadius: '8px', fontWeight: '700' }}>OFF</div>}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ── Lateral Panel: View Employees ── */}
            {showEmployeesPanel && (
                <>
                    {/* Backdrop */}
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', zIndex: 1999, animation: 'fadeIn 0.2s ease-out' }} onClick={() => setShowEmployeesPanel(false)}></div>

                    {/* Drawer */}
                    <div style={{
                        position: 'fixed', top: 0, right: 0, width: '100%', maxWidth: '650px', height: '100vh',
                        background: isLightMode ? '#ffffff' : 'var(--bg-panel)', boxShadow: '-10px 0 40px rgba(0,0,0,0.1)',
                        zIndex: 2000, display: 'flex', flexDirection: 'column', animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                        borderLeft: `1px solid ${isLightMode ? '#e2e8f0' : 'rgba(255,255,255,0.08)'}`
                    }}>
                        {/* Header */}
                        <div style={{ padding: '2rem', borderBottom: `1px solid ${isLightMode ? '#f1f5f9' : 'rgba(255,255,255,0.06)'}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(var(--primary-rgb), 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Users size={18} color="var(--primary)" />
                                </div>
                                <div>
                                    <h2 style={{ fontSize: '1.25rem', margin: 0, fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-0.3px' }}>View Interns</h2>
                                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '500', marginTop: '0.2rem' }}>Detailed list and status filtering</p>
                                </div>
                            </div>
                            <button style={{ width: '36px', height: '36px', borderRadius: '10px', background: isLightMode ? '#f1f5f9' : 'rgba(255,255,255,0.06)', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }} onClick={() => setShowEmployeesPanel(false)} onMouseOver={e => e.currentTarget.style.background = isLightMode ? '#e2e8f0' : 'rgba(255,255,255,0.1)'} onMouseOut={e => e.currentTarget.style.background = isLightMode ? '#f1f5f9' : 'rgba(255,255,255,0.06)'}>
                                <X size={18} />
                            </button>
                        </div>

                        {/* Content */}
                        <div style={{ padding: '2rem', flex: 1, overflowY: 'auto' }}>
                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                                <div style={{ flex: 1, position: 'relative' }}>
                                    <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                    <input
                                        type="text"
                                        placeholder="Search by name..."
                                        style={inputStyle}
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <button style={{
                                    height: '100%', padding: '0 1.25rem', borderRadius: '16px', border: `1px solid ${isLightMode ? '#e2e8f0' : 'rgba(255,255,255,0.08)'}`,
                                    background: isLightMode ? '#ffffff' : 'var(--bg-panel)', color: 'var(--text-main)', fontWeight: '700', fontSize: '0.85rem',
                                    display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
                                }} onClick={handleDownloadCSV} onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)'; }} onMouseOut={e => { e.currentTarget.style.borderColor = isLightMode ? '#e2e8f0' : 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'var(--text-main)'; }}>
                                    <Download size={16} /> Export CSV
                                </button>
                            </div>

                            {/* Status Filters */}
                            <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                                {['All', 'On Time', 'Late', 'WFH', 'Not In'].map(status => (
                                    <button
                                        key={status}
                                        onClick={() => setFilterStatus(status)}
                                        style={{
                                            padding: '0.5rem 1rem',
                                            borderRadius: '20px',
                                            fontSize: '0.8rem',
                                            fontWeight: '700',
                                            border: filterStatus === status ? 'none' : `1px solid ${isLightMode ? '#e2e8f0' : 'rgba(255,255,255,0.08)'}`,
                                            background: filterStatus === status ? 'var(--primary)' : 'transparent',
                                            color: filterStatus === status ? 'white' : 'var(--text-muted)',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            boxShadow: filterStatus === status ? '0 4px 12px rgba(var(--primary-rgb), 0.3)' : 'none',
                                        }}
                                        onMouseOver={e => { if (filterStatus !== status) { e.currentTarget.style.borderColor = 'var(--text-muted)'; e.currentTarget.style.color = 'var(--text-main)'; } }}
                                        onMouseOut={e => { if (filterStatus !== status) { e.currentTarget.style.borderColor = isLightMode ? '#e2e8f0' : 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'var(--text-muted)'; } }}
                                    >
                                        {status}
                                    </button>
                                ))}
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', padding: '0 0.5rem' }}>
                                <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-main)' }}>Results</div>
                                <div style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)', background: isLightMode ? '#f1f5f9' : 'rgba(255,255,255,0.06)', padding: '0.2rem 0.6rem', borderRadius: '12px' }}>
                                    Total: {[user, ...teammates].filter(e => {
                                        const matchesSearch = e.name.toLowerCase().includes(searchTerm.toLowerCase());
                                        const att = dashData.teamAttendance?.find(a => a.user.toString() === e._id.toString());
                                        const isNotIn = dashData.notInYet?.some(m => m._id === e._id);
                                        if (!matchesSearch) return false;
                                        if (filterStatus === 'All') return true;
                                        if (filterStatus === 'Not In') return isNotIn;
                                        if (filterStatus === 'WFH') return att?.status === 'WFH';
                                        if (att && att.clockInTime && (e.workingSchedule?.shiftStart || '09:00')) {
                                            const shiftStart = moment(e.workingSchedule?.shiftStart || '09:00', 'HH:mm');
                                            const isLate = moment(att.clockInTime).isAfter(shiftStart.add(15, 'minutes'));
                                            if (filterStatus === 'Late') return isLate;
                                            if (filterStatus === 'On Time') return !isLate;
                                        }
                                        return false;
                                    }).length}
                                </div>
                            </div>

                            {/* Data List */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
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
                                            const isLate = moment(att.clockInTime).isAfter(shiftStart.add(15, 'minutes'));
                                            if (filterStatus === 'Late') return isLate;
                                            if (filterStatus === 'On Time') return !isLate;
                                        }
                                        return false;
                                    })
                                    .map(e => {
                                        const att = dashData.teamAttendance?.find(a => a.user.toString() === e._id.toString());
                                        const isNotIn = dashData.notInYet?.some(m => m._id === e._id);

                                        let clockInDisplay = '09:00 AM';
                                        let statusLabel = '';
                                        let statusColor = '#94a3b8';

                                        if (att?.clockInTime) {
                                            clockInDisplay = moment(att.clockInTime).format('hh:mm A');
                                            const shiftStart = moment(e.workingSchedule?.shiftStart || '09:00', 'HH:mm');
                                            if (moment(att.clockInTime).isAfter(shiftStart.add(15, 'minutes'))) {
                                                statusLabel = 'Late';
                                                statusColor = '#ef4444';
                                            } else {
                                                statusLabel = 'On Time';
                                                statusColor = '#22c55e';
                                            }
                                        } else if (e.workingSchedule?.shiftStart) {
                                            clockInDisplay = moment(e.workingSchedule.shiftStart, 'HH:mm').format('hh:mm A');
                                            if (isNotIn) {
                                                statusLabel = 'Not In yet';
                                                statusColor = '#f59e0b';
                                            } else {
                                                statusLabel = 'Scheduled';
                                            }
                                        }

                                        return (
                                            <div key={e._id} style={{
                                                background: isLightMode ? '#f8fafc' : 'rgba(0,0,0,0.15)',
                                                border: `1px solid ${isLightMode ? '#e2e8f0' : 'rgba(255,255,255,0.04)'}`,
                                                borderRadius: '16px', padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                transition: 'all 0.2s',
                                            }} onMouseOver={e => { e.currentTarget.style.borderColor = isLightMode ? '#cbd5e1' : 'rgba(255,255,255,0.1)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.04)' }} onMouseOut={e => { e.currentTarget.style.borderColor = isLightMode ? '#e2e8f0' : 'rgba(255,255,255,0.04)'; e.currentTarget.style.boxShadow = 'none' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                    <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: '800' }}>
                                                        {e.name.substring(0, 2).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '2px' }}>{e.name}</div>
                                                        <div style={{ fontSize: '0.75rem', fontWeight: '500', color: 'var(--text-muted)' }}>{e.designation} <span style={{ opacity: 0.5 }}>•</span> {e.department} <span style={{ opacity: 0.5 }}>•</span> {e.place || 'Nagpur'}</div>
                                                    </div>
                                                </div>
                                                <div style={{ textAlign: 'right' }}>
                                                    <div style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '4px' }}>{clockInDisplay}</div>
                                                    <div style={{ fontSize: '0.65rem', fontWeight: '800', background: `${statusColor}22`, color: statusColor, padding: '0.2rem 0.6rem', borderRadius: '8px', display: 'inline-block' }}>{statusLabel.toUpperCase()}</div>
                                                </div>
                                            </div>
                                        );
                                    })}
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* In-App Custom Alert */}
            {appAlert && (
                <div style={{
                    position: 'fixed', bottom: '2rem', right: '2rem',
                    background: 'var(--primary)', color: 'white', padding: '1rem 1.5rem',
                    borderRadius: '16px', boxShadow: '0 8px 32px rgba(var(--primary-rgb), 0.3)',
                    zIndex: 3000, fontSize: '0.85rem', fontWeight: '700',
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✓</div>
                    {appAlert}
                </div>
            )}

            {/* ── Custom Smooth Tooltip ── */}
            {hoveredTooltip && (
                <div style={{
                    position: 'fixed',
                    left: hoveredTooltip.x,
                    top: hoveredTooltip.y,
                    transform: 'translate(-50%, -100%)',
                    background: isLightMode ? 'rgba(255, 255, 255, 0.95)' : 'rgba(30, 41, 59, 0.95)',
                    backdropFilter: 'blur(12px)',
                    padding: '0.6rem 1.1rem',
                    borderRadius: '12px',
                    boxShadow: isLightMode ? '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)' : '0 10px 25px -5px rgba(0,0,0,0.4), 0 8px 10px -6px rgba(0,0,0,0.4)',
                    border: `1px solid ${isLightMode ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.08)'}`,
                    zIndex: 9999,
                    pointerEvents: 'none',
                    animation: 'tooltipFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    whiteSpace: 'nowrap'
                }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: hoveredTooltip.color }}></div>
                    <span style={{ 
                        fontSize: '0.88rem', 
                        fontWeight: '700', 
                        color: 'var(--text-main)', 
                        letterSpacing: '-0.2px' 
                    }}>
                        {hoveredTooltip.content}
                    </span>
                    <div style={{
                        position: 'absolute',
                        bottom: '-5px',
                        left: '50%',
                        transform: 'translateX(-50%) rotate(45deg)',
                        width: '10px',
                        height: '10px',
                        background: isLightMode ? 'rgba(255, 255, 255, 0.95)' : 'rgba(30, 41, 59, 0.95)',
                        borderRight: `1px solid ${isLightMode ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.08)'}`,
                        borderBottom: `1px solid ${isLightMode ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.08)'}`
                    }}></div>
                </div>
            )}

            <style>{`
                @keyframes tooltipFadeIn {
                    from { opacity: 0; transform: translate(-50%, -90%) scale(0.95); }
                    to { opacity: 1; transform: translate(-50%, -100%) scale(1); }
                }
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideUp {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
            `}</style>
        </div>
    );
};

export default MyTeamTab;
