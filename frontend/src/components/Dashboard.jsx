import { useState, useEffect } from 'react';
import api from '../api/axios';
import {
    Home,
    User,
    Mail,
    Users,
    Briefcase,
    Building2,
    Award,
    TrendingUp,
    Search,
    Bell,
    Clock,
    Calendar,
    MoreHorizontal,
    ThumbsUp,
    MessageSquare,
    FileText
} from 'lucide-react';

export default function Dashboard({ user, onLogout }) {
    const [activeSidebar, setActiveSidebar] = useState('Home');
    const [activeSubTab, setActiveSubTab] = useState('Leave');

    // Home states
    const [homeTab, setHomeTab] = useState('Organization');

    // Me -> Attendance states
    const [attendanceTab, setAttendanceTab] = useState('Attendance Log');
    const [isClockedIn, setIsClockedIn] = useState(false);
    const [isWFH, setIsWFH] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
    const [attendanceLogs, setAttendanceLogs] = useState([]);
    const [payslips, setPayslips] = useState([]);

    // Admin states
    const [allUsers, setAllUsers] = useState([]);
    const [systemSettings, setSystemSettings] = useState({ workingHoursPerDay: 8, defaultLeaveQuota: 12, companyName: 'Teaching Pariksha' });

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date().toLocaleTimeString()), 1000);
        fetchStats();
        if (user?.role === 'Admin') {
            fetchAdminData();
        }
        return () => clearInterval(timer);
    }, [user]);

    const fetchAdminData = async () => {
        try {
            const usersRes = await api.get('/admin/users');
            const settingsRes = await api.get('/admin/settings');
            setAllUsers(usersRes.data);
            setSystemSettings(settingsRes.data);
        } catch (err) {
            console.error('Failed to fetch admin data:', err);
        }
    };

    const fetchStats = async () => {
        try {
            const logsRes = await api.get('/attendance/logs');
            setAttendanceLogs(logsRes.data);

            // Check if clocked in today
            const today = new Date().toISOString().split('T')[0];
            const todayLog = logsRes.data.find(log => log.date.startsWith(today));
            if (todayLog && !todayLog.clockOutTime && todayLog.clockInTime) {
                setIsClockedIn(true);
            } else {
                setIsClockedIn(false);
            }

            const payslipsRes = await api.get('/payslips');
            setPayslips(payslipsRes.data);
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    };

    const handleClockToggle = async () => {
        try {
            if (isClockedIn) {
                await api.post('/attendance/clock-out');
            } else {
                await api.post('/attendance/clock-in');
            }
            fetchStats();
        } catch (error) {
            alert(error.response?.data?.message || 'Error occurred while updating attendance.');
        }
    };

    // Admin Save Settings
    const handleSaveSettings = async () => {
        try {
            await api.put('/admin/settings', systemSettings);
            alert('Settings updated successfully!');
        } catch (err) {
            alert('Error updating settings.');
        }
    };

    const sidebarItems = [
        { name: 'Home', icon: <Home size={20} /> },
        { name: 'Me', icon: <User size={20} /> },
        { name: 'Inbox', icon: <Mail size={20} /> },
        { name: 'My Team', icon: <Users size={20} /> },
        { name: 'My Finances', icon: <Briefcase size={20} /> },
        { name: 'Org', icon: <Building2 size={20} /> },
        { name: 'Engage', icon: <Award size={20} /> },
        { name: 'Performance', icon: <TrendingUp size={20} /> }
    ];

    /* ---------------- MOCK DATA HELPERS ---------------- */
    const CircularProgress = ({ val, max, color, label1, label2 }) => {
        const radius = 16;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference - (val / (max || 1)) * circumference;

        return (
            <div style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto' }}>
                <svg viewBox="0 0 36 36" className="circular-chart">
                    <path className="circle-bg"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path className="circle"
                        strokeDasharray={`${circumference} ${circumference}`}
                        strokeDashoffset={offset}
                        stroke={color}
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                </svg>
                <div className="circular-content">
                    <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{label1}</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{label2}</div>
                </div>
            </div>
        );
    };

    const renderCalendarGrid = () => {
        const days = Array.from({ length: 31 }, (_, i) => i + 1);
        return (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem', width: '100%' }}>
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => <div key={d} style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{d}</div>)}
                <div style={{ gridColumn: 'span 2' }}></div> {/* Offset for March 2026 */}
                {days.map(d => {
                    let bg = 'rgba(255,255,255,0.05)';
                    let color = 'white';
                    if (d === 4) bg = '#84cc16'; // Holiday
                    if (d === 5) bg = '#06b6d4'; // Leave
                    if (d === 7 || d === 8 || d === 14 || d === 15 || d === 21 || d === 22 || d === 28 || d === 29) {
                        bg = '#fcd34d'; color = 'black'; // Weekend
                    }
                    if (d === 6) bg = '#3b82f6'; // Today

                    return (
                        <div key={d} style={{ background: bg, color: color, padding: '0.5rem', borderRadius: '4px', textAlign: 'center', fontSize: '0.8rem' }}>
                            {d}
                        </div>
                    );
                })}
            </div>
        );
    };

    /* ---------------- RENDER CONTENT ---------------- */
    const renderContent = () => {
        if (activeSidebar === 'Home') {
            return (
                <div className="page-content">
                    <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-dark)', paddingBottom: '0.5rem', marginBottom: '1.5rem', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 'bold' }}>
                        <span style={{ color: 'var(--text-main)', borderBottom: '2px solid var(--primary)', paddingBottom: '0.5rem' }}>DASHBOARD</span>
                        <span>WELCOME <span style={{ color: 'var(--danger)' }}>1</span></span>
                    </div>

                    <div style={{ background: 'linear-gradient(90deg, #b45309, #d97706)', borderRadius: 'var(--radius-lg)', padding: '2rem', marginBottom: '2rem', color: 'white' }}>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: '600' }}>Welcome {user?.name || 'Tuba Zainab'}!</h1>
                    </div>

                    <div className="grid" style={{ gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '2rem' }}>
                        {/* Quick Access Sidebar */}
                        <div>
                            <h3 style={{ marginBottom: '1rem', color: 'var(--text-main)' }}>Quick Access</h3>
                            <div className="panel" style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <div style={{ width: '48px', height: '48px', background: '#374151', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><Mail size={24} color="#9ca3af" /></div>
                                <div><div style={{ fontWeight: '500' }}>Good job!</div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>You have no pending actions</div></div>
                            </div>
                            <div className="panel" style={{ marginBottom: '1rem', borderLeft: '4px solid var(--primary)' }}>
                                <div className="panel-header" style={{ marginBottom: '0.5rem' }}><span style={{ fontSize: '0.85rem' }}>Holidays</span><span className="view-details">View All</span></div>
                                <h3 style={{ color: 'var(--primary)', fontSize: '1.25rem', marginBottom: '0.25rem' }}>Idul Fitr</h3>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Sat, 21 March, 2026</div>
                            </div>
                        </div>

                        {/* Main Organization Column */}
                        <div>
                            <div style={{ display: 'flex', marginBottom: '1rem' }}>
                                <button
                                    className="btn"
                                    onClick={() => setHomeTab('Organization')}
                                    style={{ background: homeTab === 'Organization' ? 'var(--bg-panel)' : 'var(--bg-main)', color: homeTab === 'Organization' ? 'var(--primary)' : 'var(--text-muted)', border: '1px solid var(--primary)', borderRadius: '4px 0 0 4px' }}>
                                    Organization
                                </button>
                                <button
                                    className="btn"
                                    onClick={() => setHomeTab('Content')}
                                    style={{ background: homeTab === 'Content' ? 'var(--bg-panel)' : 'var(--bg-main)', color: homeTab === 'Content' ? 'var(--primary)' : 'var(--text-muted)', border: '1px solid var(--primary)', borderRadius: '0 4px 4px 0' }}>
                                    Content
                                </button>
                            </div>

                            {homeTab === 'Organization' ? (
                                <>
                                    <div className="panel" style={{ marginBottom: '1rem' }}>
                                        <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-dark)', paddingBottom: '1rem', marginBottom: '1rem', fontSize: '0.85rem' }}>
                                            <span style={{ color: 'var(--primary)', borderBottom: '2px solid var(--primary)', paddingBottom: '1rem', marginBottom: '-1rem' }}>✎ Post</span>
                                            <span style={{ color: 'var(--text-muted)' }}>📊 Poll</span>
                                            <span style={{ color: 'var(--text-muted)' }}>🏆 Praise</span>
                                        </div>
                                        <textarea placeholder="Write your post here and mention your peers" style={{ width: '100%', background: 'transparent', border: 'none', color: 'white', resize: 'none', height: '60px', outline: 'none' }} />
                                    </div>

                                    <div className="panel" style={{ marginBottom: '1rem' }}>
                                        <div className="panel-header" style={{ marginBottom: '1rem' }}>Recent Posts</div>
                                        <div style={{ display: 'flex', gap: '1rem' }}>
                                            <div className="avatar" style={{ background: '#3b82f6' }}>SK</div>
                                            <div>
                                                <div style={{ fontWeight: '500', fontSize: '0.9rem' }}>Sandeep Kumar</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Engineering Team • 2 hrs ago</div>
                                                <p style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>Just pushed the latest updates for compiling our new application flow! Great work everyone on the release yesterday. 🎉</p>
                                                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                    <span style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem' }}><ThumbsUp size={14} /> 12</span>
                                                    <span style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem' }}><MessageSquare size={14} /> 4 Comments</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="panel" style={{ marginBottom: '1rem' }}>
                                    <div className="panel-header" style={{ marginBottom: '1rem' }}>Knowledge Base & Content</div>
                                    <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <div style={{ padding: '1rem', border: '1px solid var(--border-dark)', borderRadius: 'var(--radius-md)', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                            <FileText size={24} color="var(--primary)" />
                                            <div>
                                                <div style={{ fontWeight: '500' }}>Company Handbook 2026</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Updated 2 days ago</div>
                                            </div>
                                        </div>
                                        <div style={{ padding: '1rem', border: '1px solid var(--border-dark)', borderRadius: 'var(--radius-md)', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                            <FileText size={24} color="#f59e0b" />
                                            <div>
                                                <div style={{ fontWeight: '500' }}>Travel & Expenses Policy</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Updated 1 month ago</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            );
        }

        if (activeSidebar === 'Me') {
            return (
                <>
                    <div className="sub-nav">
                        {['Attendance', 'Leave', 'Performance', 'Expenses & Travel', 'Apps'].map(tab => (
                            <div
                                key={tab}
                                className={`sub-nav-item ${activeSubTab === tab ? 'active' : ''}`}
                                onClick={() => setActiveSubTab(tab)}
                                style={{ cursor: 'pointer' }}
                            >
                                {tab}
                            </div>
                        ))}
                    </div>
                    <div className="page-content">

                        {activeSubTab === 'Attendance' && (
                            <>
                                <div className="grid" style={{ gridTemplateColumns: '1fr 2fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                                    {/* ... Keep Attendance Stats & Timings Panels ... */}
                                    <div className="panel">
                                        <div className="panel-header">Attendance Stats</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Last Week</div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><div className="avatar" style={{ background: '#f59e0b', width: '24px', height: '24px', fontSize: '10px' }}>Me</div><span style={{ fontSize: '0.85rem' }}>Me</span></div>
                                            <div style={{ textAlign: 'right' }}><div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>AVG HRS / DAY</div><div style={{ fontWeight: 'bold' }}>9h 5m</div></div>
                                        </div>
                                    </div>
                                    <div className="panel">
                                        <div className="panel-header">Timings</div>
                                        <div style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>Today (Flexible Timings)</div>
                                        <div style={{ width: '100%', height: '8px', background: '#083344', borderRadius: '4px', position: 'relative' }}>
                                            <div style={{ width: isClockedIn ? '60%' : '100%', height: '100%', background: '#06b6d4', borderRadius: '4px', transition: 'width 0.5s' }}></div>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                                            <span>Duration: 23h 59m</span>
                                            <span>0 min</span>
                                        </div>
                                    </div>

                                    <div className="panel">
                                        <div className="panel-header">Actions</div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <div>
                                                <div style={{ fontSize: '1.5rem', fontWeight: '300' }}>{currentTime}</div>
                                                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Fri, 06 Mar 2026</div>
                                                <div style={{ fontSize: '0.75rem' }}>Effective: {isClockedIn ? '4h 42m' : '8h 00m'}</div>
                                            </div>
                                            <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                                <button
                                                    className={`btn ${isClockedIn ? 'btn-danger' : 'btn-primary'}`}
                                                    onClick={handleClockToggle}
                                                    style={{ marginBottom: '0.5rem', width: '120px' }}
                                                >
                                                    {isClockedIn ? 'Web Clock-out' : 'Web Clock-in'}
                                                </button>
                                                <div style={{ fontSize: '0.65rem', color: isClockedIn ? 'var(--primary)' : 'var(--text-muted)' }}>
                                                    {isClockedIn ? '4h:42m Since Last Login' : 'Currently offline'}
                                                </div>
                                                <div
                                                    onClick={() => setIsWFH(!isWFH)}
                                                    style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', marginTop: '0.5rem', color: isWFH ? 'var(--primary)' : 'var(--text-muted)', cursor: 'pointer' }}>
                                                    <Home size={12} /> {isWFH ? 'Work From Home' : 'Work On-Site'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="panel" style={{ padding: 0 }}>
                                    <div style={{ padding: '0 1.25rem', borderBottom: '1px solid var(--border-dark)', display: 'flex', gap: '2rem', fontSize: '0.85rem' }}>
                                        {['Attendance Log', 'Calendar', 'Attendance Requests', 'Overtime Requests'].map(tab => (
                                            <span
                                                key={tab}
                                                onClick={() => setAttendanceTab(tab)}
                                                style={{
                                                    padding: '1rem 0',
                                                    cursor: 'pointer',
                                                    color: attendanceTab === tab ? 'var(--primary)' : 'var(--text-muted)',
                                                    borderBottom: attendanceTab === tab ? '2px solid var(--primary)' : '2px solid transparent',
                                                    marginBottom: '-1px',
                                                    fontWeight: attendanceTab === tab ? '600' : 'normal'
                                                }}
                                            >
                                                {tab}
                                            </span>
                                        ))}
                                    </div>

                                    <div style={{ padding: '1.25rem' }}>
                                        {attendanceTab === 'Attendance Log' && (
                                            <table className="data-table">
                                                <thead>
                                                    <tr><th>DATE</th><th>ATTENDANCE VISUAL</th><th>GROSS HOURS</th><th>STATUS</th></tr>
                                                </thead>
                                                <tbody>
                                                    {attendanceLogs.length > 0 ? attendanceLogs.map(log => (
                                                        <tr key={log._id}>
                                                            <td style={{ fontWeight: 'bold' }}>{new Date(log.date).toDateString()}</td>
                                                            <td>
                                                                <div style={{ width: '80%', height: '8px', background: '#083344', borderRadius: '4px' }}>
                                                                    <div style={{ width: log.clockOutTime ? '100%' : '50%', height: '100%', background: '#06b6d4', borderRadius: '4px' }}></div>
                                                                </div>
                                                            </td>
                                                            <td>{log.totalHours ? `${log.totalHours} hrs` : (log.clockInTime ? 'Ongoing' : '0 hrs')}</td>
                                                            <td>{log.status}</td>
                                                        </tr>
                                                    )) : (
                                                        <tr><td colSpan="4" style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-muted)' }}>No logs found</td></tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        )}

                                        {attendanceTab === 'Calendar' && (
                                            <div style={{ padding: '1rem 0' }}>{renderCalendarGrid()}</div>
                                        )}

                                        {attendanceTab === 'Attendance Requests' && (
                                            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                                <FileText size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                                                <div>No pending attendance adjustment requests.</div>
                                            </div>
                                        )}

                                        {attendanceTab === 'Overtime Requests' && (
                                            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                                <Clock size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                                                <div>No pending overtime requests for this month.</div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}

                        {activeSubTab === 'Performance' && (
                            <div className="grid" style={{ gridTemplateColumns: '1fr', gap: '1.5rem' }}>
                                <div className="panel">
                                    <div className="panel-header">Active Objectives (OKRs)</div>
                                    <div style={{ border: '1px solid var(--border-dark)', borderRadius: 'var(--radius-md)', padding: '1.5rem', background: 'rgba(0,0,0,0.2)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                            <div style={{ fontWeight: '500', fontSize: '1rem' }}>Improve Backend Response Time by 30%</div>
                                            <span style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem' }}>On Track - 65%</span>
                                        </div>
                                        <div style={{ width: '100%', height: '8px', background: 'var(--border-dark)', borderRadius: '4px', marginBottom: '1rem' }}>
                                            <div style={{ width: '65%', height: '100%', background: '#10b981', borderRadius: '4px' }}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeSubTab === 'Expenses & Travel' && (
                            <div className="panel" style={{ textAlign: 'center', padding: '4rem' }}>
                                <Briefcase size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
                                <h3 style={{ marginBottom: '0.5rem' }}>No Active Expenses</h3>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>You haven't filed any expenses this quarter.</p>
                                <button className="btn btn-primary">+ Claim New Expense</button>
                            </div>
                        )}

                        {activeSubTab === 'Apps' && (
                            <div className="panel" style={{ textAlign: 'center', padding: '4rem' }}>
                                <Building2 size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
                                <h3 style={{ marginBottom: '0.5rem' }}>Connected Applications</h3>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>Manage your third-party integrations like Slack, Zoom, and Jira.</p>
                                <button className="btn" style={{ border: '1px solid var(--border-dark)' }}>Manage Connectors</button>
                            </div>
                        )}

                        {/* If 'Leave' keep existing placeholder logic or simplified version */}
                        {activeSubTab === 'Leave' && (
                            <div className="panel" style={{ padding: '2rem', textAlign: 'center' }}>
                                <h3>Leave Management</h3>
                                <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Leave analytics and balances are visible here.</p>
                            </div>
                        )}
                    </div>
                </>
            );
        }

        if (activeSidebar === 'My Team') {
            return (
                <>
                    <div className="sub-nav"><div className="sub-nav-item active">SUMMARY</div></div>
                    <div className="page-content">
                        <div className="panel" style={{ marginBottom: '2rem' }}>
                            <div className="panel-header">Team calendar (March 2026)</div>
                            {renderCalendarGrid()}
                        </div>
                    </div>
                </>
            );
        }

        if (activeSidebar === 'My Finances') {
            return (
                <>
                    <div className="sub-nav">
                        <div className="sub-nav-item active">PAYSLIPS</div>
                        <div className="sub-nav-item">TAX DECLARATIONS</div>
                        <div className="sub-nav-item">BANK INFO</div>
                    </div>
                    <div className="page-content">
                        <div className="grid" style={{ gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '2rem' }}>
                            <div className="panel">
                                <div className="panel-header">Recent Payslips</div>
                                <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <li style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '4px', cursor: 'pointer', borderLeft: '3px solid var(--primary)' }}>
                                        <div style={{ fontWeight: '500' }}>August 2026</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Generated on 31 Aug, 2026</div>
                                    </li>
                                    <li style={{ padding: '1rem', cursor: 'pointer', borderBottom: '1px solid var(--border-dark)' }}>
                                        <div style={{ fontWeight: '500' }}>July 2026</div>
                                    </li>
                                    <li style={{ padding: '1rem', cursor: 'pointer' }}>
                                        <div style={{ fontWeight: '500' }}>June 2026</div>
                                    </li>
                                </ul>
                            </div>

                            <div className="panel">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                    <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Payslip for August 2026</h2>
                                    <button className="btn btn-primary">Download PDF</button>
                                </div>

                                <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '1px solid var(--border-dark)' }}>
                                    <div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>EARNINGS</div>
                                        {payslips.length > 0 ? (
                                            <>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.9rem' }}><span>Basic Salary</span><span>${payslips[0].earnings.basicSalary}</span></div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.9rem' }}><span>HRA</span><span>${payslips[0].earnings.hra}</span></div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.9rem', color: 'var(--primary)' }}><span>Bonus</span><span>${payslips[0].earnings.bonus}</span></div>
                                            </>
                                        ) : (
                                            <div>No earnings data available.</div>
                                        )}
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>DEDUCTIONS</div>
                                        {payslips.length > 0 ? (
                                            <>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.9rem' }}><span>PF</span><span>${payslips[0].deductions.pf}</span></div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.9rem' }}><span>Tax</span><span>${payslips[0].deductions.tax}</span></div>
                                            </>
                                        ) : (
                                            <div>No deduction data available.</div>
                                        )}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(16, 185, 129, 0.1)', padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
                                    <span style={{ fontSize: '1.1rem', fontWeight: '500' }}>Net Payout (Take Home)</span>
                                    <span style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#10b981' }}>
                                        ${payslips.length > 0 ? payslips[0].netPay : '0.00'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )
        }

        if (activeSidebar === 'Org') {
            return (
                <div className="page-content">
                    {user?.role === 'Admin' ? (
                        <>
                            <div className="panel" style={{ marginBottom: '2rem' }}>
                                <div className="panel-header">System Settings (Admin)</div>
                                <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column', maxWidth: '400px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Company Name</label>
                                        <input type="text" value={systemSettings.companyName || ''} onChange={e => setSystemSettings({ ...systemSettings, companyName: e.target.value })} style={{ background: 'var(--bg-main)', color: 'white', border: '1px solid var(--border-dark)', padding: '0.5rem', borderRadius: '4px' }} />
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Working Hours / Day</label>
                                        <input type="number" value={systemSettings.workingHoursPerDay || ''} onChange={e => setSystemSettings({ ...systemSettings, workingHoursPerDay: e.target.value })} style={{ background: 'var(--bg-main)', color: 'white', border: '1px solid var(--border-dark)', padding: '0.5rem', borderRadius: '4px', width: '100px' }} />
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Default Leave Quota</label>
                                        <input type="number" value={systemSettings.defaultLeaveQuota || ''} onChange={e => setSystemSettings({ ...systemSettings, defaultLeaveQuota: e.target.value })} style={{ background: 'var(--bg-main)', color: 'white', border: '1px solid var(--border-dark)', padding: '0.5rem', borderRadius: '4px', width: '100px' }} />
                                    </div>
                                    <button className="btn btn-primary" onClick={handleSaveSettings} style={{ marginTop: '1rem' }}>Save Settings</button>
                                </div>
                            </div>

                            <div className="panel">
                                <div className="panel-header">Organization Tree (Assign Managers)</div>
                                <table className="data-table">
                                    <thead><tr><th>NAME</th><th>EMAIL</th><th>ROLE</th><th>REPORTING MANAGER</th></tr></thead>
                                    <tbody>
                                        {allUsers.map(u => (
                                            <tr key={u._id}>
                                                <td>{u.name}</td><td>{u.email}</td><td>{u.role}</td>
                                                <td>
                                                    <select value={u.reportingManager?._id || ''} onChange={async (e) => {
                                                        try {
                                                            await api.put(`/admin/users/${u._id}/manager`, { managerId: e.target.value || null });
                                                            fetchAdminData();
                                                        } catch (err) { alert('Error assigning manager'); }
                                                    }} style={{ background: 'var(--bg-main)', color: 'white', border: '1px solid var(--border-dark)', padding: '0.25rem 0.5rem', borderRadius: '4px', outline: 'none' }}>
                                                        <option value="">None</option>
                                                        {allUsers.filter(m => m._id !== u._id).map(m => (
                                                            <option key={m._id} value={m._id}>{m.name} ({m.role})</option>
                                                        ))}
                                                    </select>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    ) : (
                        <div style={{ textAlign: 'center', paddingTop: '6rem', color: 'var(--text-muted)' }}>
                            <Building2 size={64} style={{ margin: '0 auto 1.5rem', opacity: 0.2 }} />
                            <h2 style={{ color: 'var(--text-main)' }}>Org Module</h2>
                            <p style={{ marginTop: '0.5rem', maxWidth: '400px', margin: '0.5rem auto' }}>Your organization tree is maintained by Admins. Department details will appear here soon.</p>
                        </div>
                    )}
                </div>
            );
        }

        if (['Inbox', 'Engage', 'Performance'].includes(activeSidebar)) {
            return (
                <div className="page-content" style={{ textAlign: 'center', paddingTop: '6rem', color: 'var(--text-muted)' }}>
                    <Building2 size={64} style={{ margin: '0 auto 1.5rem', opacity: 0.2 }} />
                    <h2 style={{ color: 'var(--text-main)' }}>{activeSidebar} Module</h2>
                    <p style={{ marginTop: '0.5rem', maxWidth: '400px', margin: '0.5rem auto' }}>
                        This organizational system module is currently isolated in this dashboard view. More features can be configured here.
                    </p>
                </div>
            );
        }

        return null;
    };

    return (
        <div className="dashboard-layout">
            {/* Sidebar Navigation */}
            <aside className="sidebar">
                <div className="sidebar-brand">keka<span style={{ color: 'white', fontSize: '1rem', marginLeft: '0.1rem', marginTop: '-0.5rem' }}>*</span></div>
                <nav className="sidebar-nav">
                    {sidebarItems.map(item => (
                        <div
                            key={item.name}
                            className={`nav-item ${activeSidebar === item.name ? 'active' : ''}`}
                            onClick={() => { setActiveSidebar(item.name); setActiveSubTab('Leave'); }}
                        >
                            {item.icon}
                            <span className="nav-text" style={{ display: 'block', fontSize: '0.65rem', marginTop: '0.2rem' }}>{item.name}</span>
                        </div>
                    ))}
                </nav>
            </aside>

            {/* Main Content Component */}
            <main className="main-content">
                <header className="topbar">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ fontSize: '1rem', fontWeight: '500' }}>{systemSettings?.companyName || 'Teaching Pariksha'}</div>
                    </div>
                    <div className="topbar-actions">
                        <button className="btn btn-danger" onClick={onLogout} style={{ padding: '0.25rem 0.75rem' }}>Log Out</button>
                        <Bell size={20} style={{ cursor: 'pointer' }} />
                        <div className="avatar" style={{ cursor: 'pointer', background: '#10b981' }}>{user?.name?.substring(0, 2).toUpperCase() || 'ME'}</div>
                    </div>
                </header>
                <div className="dashboard-content">
                    {renderContent()}
                </div>
            </main>
        </div>
    );
}
