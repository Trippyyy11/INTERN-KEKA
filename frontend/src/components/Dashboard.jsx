import { useState, useEffect, useMemo } from 'react';
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
    FileText,
    Sun,
    Moon,
    HelpCircle,
    Info,
    Network,
    Trash2
} from 'lucide-react';

import OrganizationTree from './OrganizationTree';

export default function Dashboard({ user, onLogout, setUser }) {
    const [activeSidebar, setActiveSidebar] = useState('Home');
    const [activeSubTab, setActiveSubTab] = useState('Attendance');

    // Check initial theme preference
    const getInitialTheme = () => {
        const saved = localStorage.getItem('theme');
        if (saved) return saved === 'light';
        return window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
    };
    const [isLightMode, setIsLightMode] = useState(getInitialTheme());
    const [showProfileMenu, setShowProfileMenu] = useState(false);

    // Home states
    const [homeTab, setHomeTab] = useState('Organization');
    const [homeSubTab, setHomeSubTab] = useState('Welcome');
    const [postText, setPostText] = useState('');
    const [welcomeResponses, setWelcomeResponses] = useState({
        about: user?.welcomeProfile?.about || '',
        loveJob: user?.welcomeProfile?.loveJob || '',
        interests: user?.welcomeProfile?.interests || ''
    });
    const [editingResponse, setEditingResponse] = useState(null); // 'about', 'loveJob', 'interests' or null

    // Me -> Attendance states
    const [attendanceTab, setAttendanceTab] = useState('Attendance Log');
    const [isClockedIn, setIsClockedIn] = useState(false);
    const [isWFH, setIsWFH] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
    const [attendanceLogs, setAttendanceLogs] = useState([]);
    const [payslips, setPayslips] = useState([]);
    const [showClockInModal, setShowClockInModal] = useState(false);
    const [selectedWorkingMode, setSelectedWorkingMode] = useState('On-site');
    const [activeLog, setActiveLog] = useState(null);
    const [showLogInfo, setShowLogInfo] = useState(null);
    const [isAttendanceFinished, setIsAttendanceFinished] = useState(false);

    // Admin states
    const [allUsers, setAllUsers] = useState([]);
    const [systemSettings, setSystemSettings] = useState({ workingHoursPerDay: 8, defaultLeaveQuota: 12, companyName: 'Teaching Pariksha' });
    const [customAlert, setCustomAlert] = useState(null); // { message: '', type: 'info' | 'confirm', onConfirm: fn }

    // Custom states for RBAC & Org management
    const [todayStatus, setTodayStatus] = useState([]);
    const [birthdays, setBirthdays] = useState([]);
    const [globalPayslips, setGlobalPayslips] = useState([]);
    const [orgConfigs, setOrgConfigs] = useState([]);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [newConfig, setNewConfig] = useState({ name: '', type: 'Department', date: '', description: '' });

    const [dashData, setDashData] = useState({
        birthdays: { today: [], upcoming: [] },
        leaves: [],
        workingRemotely: [],
        newJoinees: [],
        announcements: [],
        holidays: []
    });

    const [orgActionTab, setOrgActionTab] = useState('Post');
    const [orgActivityTab, setOrgActivityTab] = useState('Birthdays');

    const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
    const [newAnnouncement, setNewAnnouncement] = useState({ title: '', content: '', priority: 'Low' });

    const [poll, setPoll] = useState({ question: '', option1: '', option2: '' });
    const [praise, setPraise] = useState({ user: '', message: '' });
    const [wishedUsers, setWishedUsers] = useState([]);
    const [showHolidayModal, setShowHolidayModal] = useState(false);
    const [teammates, setTeammates] = useState([]);
    const [teamStats, setTeamStats] = useState({ avgHours: 0, onTimePercentage: 0 });
    const [teammateIndividualStats, setTeammateIndividualStats] = useState([]);
    const [statsPeriod, setStatsPeriod] = useState('Last Week');
    const [showPublicProfile, setShowPublicProfile] = useState(null); // stores user object
    const [leaveStats, setLeaveStats] = useState({ balances: {}, history: [], monthlyStats: [], weeklyPattern: [] });
    const [socialFeed, setSocialFeed] = useState([]);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date().toLocaleTimeString()), 1000);
        fetchStats();
        fetchSystemSettings();
        if (user?.role === 'Admin' || user?.role === 'Super Admin') {
            fetchAdminData();
            fetchOrgConfigs();
        }
        if (user?.role === 'Super Admin') {
            fetchGlobalFinances();
        }
        fetchPublicData();
        return () => clearInterval(timer);
    }, [user]);

    // Apply light mode class to body based on state
    useEffect(() => {
        if (isLightMode) {
            document.body.classList.add('light-theme');
            localStorage.setItem('theme', 'light');
        } else {
            document.body.classList.remove('light-theme');
            localStorage.setItem('theme', 'dark');
        }
    }, [isLightMode]);

    const fetchLeaveStats = async () => {
        try {
            const res = await api.get('/leaves/stats');
            setLeaveStats(res.data);
        } catch (err) { console.error('Failed to fetch leave stats'); }
    };

    useEffect(() => {
        if (activeSidebar === 'Me' && activeSubTab === 'Leave') {
            fetchLeaveStats();
        }
    }, [activeSidebar, activeSubTab]);

    const [isProfileEditing, setIsProfileEditing] = useState(false);
    const [tempProfile, setTempProfile] = useState({});

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            const res = await api.put('/auth/profile', tempProfile);
            const updatedUser = { ...user, ...res.data };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setIsProfileEditing(false);
            showAlert('Profile updated successfully!', 'info');
        } catch (err) {
            if (err.response?.status === 401) {
                showAlert('Your session has expired. Please log out and log back in to save your changes.', 'info');
            } else {
                showAlert(err.response?.data?.message || 'Update failed', 'error');
            }
        }
    };

    const toggleTheme = () => {
        setIsLightMode(!isLightMode);
    };

    const fetchGlobalFinances = async () => {
        try {
            const res = await api.get('/payslips/all');
            setGlobalPayslips(res.data);
        } catch (err) {
            console.error('Failed to fetch global finances:', err);
        }
    };

    const fetchPublicData = async () => {
        try {
            const statusRes = await api.get('/attendance/status/today');
            const birthdaysRes = await api.get('/attendance/birthdays');
            const socialRes = await api.get('/social');
            setTodayStatus(statusRes.data);
            setBirthdays(birthdaysRes.data);
            setSocialFeed(socialRes.data);
            fetchTeammates();
            fetchTeamStats();
        } catch (err) {
            console.error('Failed to fetch public data:', err);
        }
    };

    const fetchTeammates = async () => {
        try {
            const res = await api.get('/attendance/teammates');
            setTeammates(res.data);
        } catch (err) { console.error('Failed to fetch teammates'); }
    }

    const fetchTeamStats = async (period = statsPeriod) => {
        try {
            const p = period === 'Last Month' ? 'month' : 'week';
            const res = await api.get(`/attendance/team-stats?period=${p}`);
            setTeamStats(res.data);

            const individualRes = await api.get(`/attendance/teammates-stats?period=${p}`);
            setTeammateIndividualStats(individualRes.data);
        } catch (err) { console.error('Failed to fetch team stats'); }
    }

    const fetchAdminData = async () => {
        try {
            const usersRes = await api.get('/admin/users');
            setAllUsers(usersRes.data);
        } catch (err) {
            console.error('Failed to fetch admin users data:', err);
        }
    };

    const fetchSystemSettings = async () => {
        try {
            const settingsRes = await api.get('/admin/settings');
            setSystemSettings(settingsRes.data);
        } catch (error) {
            console.error('Failed to fetch system settings:', error);
        }
    };

    const meStats = useMemo(() => {
        const days = statsPeriod === 'Last Month' ? 30 : 7;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        startDate.setHours(0, 0, 0, 0);

        const periodLogs = attendanceLogs.filter(log => new Date(log.date) >= startDate);
        if (periodLogs.length === 0) return { avgHours: '0h 0m', onTime: '0%' };

        let totalH = 0;
        let onTimeCount = 0;

        periodLogs.forEach(log => {
            totalH += Number(log.totalHours || 0);
            if (log.clockInTime) {
                const clockIn = new Date(log.clockInTime);
                const totalMins = clockIn.getHours() * 60 + clockIn.getMinutes();
                const [sh, sm] = (user?.workingSchedule?.shiftStart || '11:00').split(':').map(Number);
                const shiftStartMins = sh * 60 + sm;
                if (totalMins <= shiftStartMins + 60) onTimeCount++;
            }
        });

        const avg = totalH / periodLogs.length;
        const avgH = Math.floor(avg);
        const avgM = Math.round((avg % 1) * 60);

        return {
            avgHours: `${avgH}h ${avgM}m`,
            onTime: `${Math.round((onTimeCount / periodLogs.length) * 100)}%`
        };
    }, [attendanceLogs, statsPeriod, user]);

    const fetchOrgConfigs = async () => {
        try {
            const res = await api.get('/admin/configs');
            setOrgConfigs(res.data);
        } catch (err) { console.error('Failed to fetch configs'); }
    }

    const handleAttendAction = async (type) => {
        try {
            await api.post('/attendance/mark', { type });
            fetchStats();
            showAlert(`Attendance marked as ${type}`, 'info');
        } catch (err) { showAlert('Action failed', 'info'); }
    };

    const handleSaveResponse = async (key) => {
        try {
            const res = await api.put('/auth/welcome-profile', {
                [key]: welcomeResponses[key]
            });
            // Update local state is already done via onChange
            setEditingResponse(null);
            showAlert('Response saved successfully!', 'info');
        } catch (err) {
            console.error('Failed to save response:', err);
            showAlert('Failed to save response. Please try again.', 'info');
        }
    };

    const handleApproveUser = async (id) => {
        try {
            await api.put(`/admin/users/${id}/approve`);
            fetchAdminData();
            showAlert('User approved!', 'info');
        } catch (err) { showAlert('Approval failed', 'info'); }
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/admin/users/${selectedUser._id}/details`, selectedUser);
            fetchAdminData();
            setShowEditModal(false);
            showAlert('User updated!', 'info');
        } catch (err) { showAlert('Update failed', 'info'); }
    };

    const handleAddConfig = async (e) => {
        e.preventDefault();
        try {
            await api.post('/admin/configs', newConfig);
            fetchOrgConfigs();
            setNewConfig({ name: '', type: 'Department', date: '', description: '' });
        } catch (err) { showAlert('Failed to add config', 'info'); }
    };

    const handleDeleteConfig = async (id) => {
        showAlert('Are you sure you want to delete this config?', 'confirm', async () => {
            try {
                await api.delete(`/admin/configs/${id}`);
                fetchOrgConfigs();
                showAlert('Configuration deleted successfully.', 'info');
            } catch (err) { showAlert('Delete failed', 'info'); }
        });
    };

    const fetchStats = async () => {
        try {
            const logsRes = await api.get('/attendance/logs');
            setAttendanceLogs(logsRes.data);

            // More robust check: find any log that has a clock-in but no clock-out
            const activeSession = logsRes.data.find(log => log.clockInTime && !log.clockOutTime);

            // Check if user has already clocked out today
            const todayStr = new Date().toDateString();
            const finishedToday = logsRes.data.some(log => {
                if (!log.clockOutTime) return false;
                const clockOutDateStr = new Date(log.clockOutTime).toDateString();
                return clockOutDateStr === todayStr;
            });
            setIsAttendanceFinished(finishedToday);

            if (activeSession) {
                setIsClockedIn(true);
                setIsWFH(activeSession.workingMode === 'Remote');
                setActiveLog(activeSession);
            } else {
                setIsClockedIn(false);
                setActiveLog(null);
            }

            const payslipsRes = await api.get('/payslips');
            setPayslips(payslipsRes.data);

            const dashRes = await api.get('/dashboard/stats');
            setDashData(dashRes.data);
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    };

    const handleLogout = () => {
        showAlert('Are you sure you want to log out?', 'confirm', () => {
            onLogout();
        });
        setShowProfileMenu(false);
    };

    const calculateElapsedTime = (startTime) => {
        if (!startTime) return { hrs: 0, mins: 0, text: '0h 0m' };
        const start = new Date(startTime);
        const now = new Date();
        const diffMs = now - start;
        const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        return { hrs: diffHrs, mins: diffMins, text: `${diffHrs}h ${diffMins}m`, totalMins: diffHrs * 60 + diffMins };
    };

    const showAlert = (message, type = 'info', onConfirm = null) => {
        setCustomAlert({ message, type, onConfirm });
    };

    const handleClockToggle = async () => {
        try {
            if (isClockedIn) {
                const timeWorked = calculateElapsedTime(activeLog?.clockInTime);
                const targetMins = (systemSettings.workingHoursPerDay || 8) * 60;
                const completed = timeWorked.totalMins >= targetMins;

                let message = `You have completed ${timeWorked.text}.`;
                if (completed) {
                    message += `\nGreat job! You have completed your working hours. 🌟✅🥳`;
                    showAlert(message, 'confirm', async () => {
                        await api.post('/attendance/clock-out');
                        fetchStats();
                        showAlert('Successfully clocked out! 🎉', 'info');
                    });
                } else {
                    const remainingMins = targetMins - timeWorked.totalMins;
                    const rHrs = Math.floor(remainingMins / 60);
                    const rMins = remainingMins % 60;
                    message += `\nRemaining time: ${rHrs}h ${rMins}m. Are you sure you want to clock out?`;
                    showAlert(message, 'confirm', async () => {
                        await api.post('/attendance/clock-out');
                        fetchStats();
                        showAlert('Successfully clocked out! See you tomorrow.', 'info');
                    });
                }
            } else {
                setShowClockInModal(true);
            }
        } catch (error) {
            showAlert(error.response?.data?.message || 'Error occurred while updating attendance.', 'info');
        }
    };

    const confirmClockIn = async () => {
        try {
            const res = await api.post('/attendance/clock-in', { workingMode: selectedWorkingMode });
            setShowClockInModal(false);

            // Update state immediately
            setIsClockedIn(true);
            setIsWFH(res.data.workingMode === 'Remote');
            setActiveLog(res.data);

            fetchStats();
            showAlert(`Successfully clocked in as ${selectedWorkingMode}! Have a productive day! 🚀`, 'info');
        } catch (error) {
            showAlert(error.response?.data?.message || 'Error occurred while clocking in.', 'info');
        }
    };

    const handleCreateAnnouncement = async (e) => {
        e.preventDefault();
        try {
            await api.post('/dashboard/announcements', newAnnouncement);
            setShowAnnouncementModal(false);
            setNewAnnouncement({ title: '', content: '', priority: 'Low' });
            fetchStats();
            showAlert('Announcement created successfully!', 'info');
        } catch (error) {
            console.error('Failed to create announcement:', error);
            showAlert(error.response?.data?.message || 'Failed to create announcement', 'info');
        }
    };

    // Admin Save Settings
    const handleSaveSettings = async () => {
        try {
            await api.put('/admin/settings', systemSettings);
            showAlert('Settings updated successfully!', 'info');
        } catch (err) {
            showAlert('Error updating settings.', 'info');
        }
    };

    const sidebarItems = [
        { name: 'Home', icon: <Home size={20} /> },
        { name: 'Me', icon: <User size={20} /> },
        { name: 'Inbox', icon: <Mail size={20} /> },
        { name: 'My Team', icon: <Users size={20} /> },
        { name: 'Organization Tree', icon: <Network size={20} /> },
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
                    let bg = 'var(--bg-panel)';
                    let color = 'var(--text-main)';
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
                        <span
                            style={{ color: homeSubTab === 'Dashboard' ? 'var(--text-main)' : 'var(--text-muted)', borderBottom: homeSubTab === 'Dashboard' ? '2px solid var(--primary)' : 'none', paddingBottom: '0.5rem', cursor: 'pointer', marginBottom: '-0.5rem' }}
                            onClick={() => setHomeSubTab('Dashboard')}
                        >
                            DASHBOARD
                        </span>
                        <span
                            style={{ color: homeSubTab === 'Welcome' ? 'var(--text-main)' : 'var(--text-muted)', borderBottom: homeSubTab === 'Welcome' ? '2px solid var(--primary)' : 'none', paddingBottom: '0.5rem', cursor: 'pointer', marginBottom: '-0.5rem' }}
                            onClick={() => setHomeSubTab('Welcome')}
                        >
                            WELCOME <span style={{ color: 'var(--danger)' }}>1</span>
                        </span>
                    </div>

                    {homeSubTab === 'Dashboard' && (
                        <>
                            <div className="welcome-banner">
                                <h1>Welcome {user?.name || 'Tuba Zainab'}!</h1>
                            </div>

                            <div className="grid" style={{ gridTemplateColumns: 'minmax(300px, 350px) 1fr', gap: '2rem', minHeight: '600px', backgroundImage: 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'400\' height=\'600\' viewBox=\'0 0 400 600\'><path d=\'M350,600 C350,500 320,400 400,300 C380,300 360,320 340,350 C340,250 300,150 400,50 C380,100 350,150 340,200 C320,150 300,100 250,50 C280,100 300,150 310,220 C280,200 250,180 200,150 C240,180 280,220 310,260 C250,250 200,240 150,250 C200,270 250,290 320,300 C280,320 250,340 200,400 C300,350 310,400 350,600 Z\' fill=\'rgba(255,255,255,0.03)\'/></svg>")', backgroundPosition: 'right bottom', backgroundRepeat: 'no-repeat' }}>
                                {/* Quick Access Sidebar */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', zIndex: 1 }}>
                                    <div>
                                        <h3 style={{ marginBottom: '1rem', color: 'var(--text-main)', fontSize: '1rem', fontWeight: '500' }}>Quick Access</h3>

                                        {dashData.holidays.length > 0 ? (
                                            <div className="panel holiday-card" style={{ marginBottom: '1rem' }}>
                                                <div className="panel-header" style={{ marginBottom: '0.5rem', borderBottom: 'none' }}>
                                                    <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>Holidays</span>
                                                    <span className="view-details" style={{ color: '#f59e0b', cursor: 'pointer' }} onClick={() => setShowHolidayModal(true)}>View All</span>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0' }}>
                                                    <div style={{ textAlign: 'center', width: '100%' }}>
                                                        <h3 style={{ color: '#f59e0b', fontSize: '1.5rem', marginBottom: '0.25rem', fontFamily: 'serif' }}>{dashData.holidays[0].name}</h3>
                                                        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)' }}>{new Date(dashData.holidays[0].date).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="panel holiday-card" style={{ marginBottom: '1rem' }}>
                                                <div className="panel-header" style={{ marginBottom: '0.5rem', borderBottom: 'none' }}>
                                                    <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>Holidays</span>
                                                </div>
                                                <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', textAlign: 'center', padding: '1rem 0' }}>No upcoming holidays</div>
                                            </div>
                                        )}

                                        {/* On Leave Today */}
                                        <div className="panel" style={{ marginBottom: '1rem' }}>
                                            <div className="panel-header" style={{ marginBottom: '1rem', fontSize: '0.9rem', fontWeight: '500' }}>On Leave Today</div>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem' }}>
                                                {dashData.leaves.length > 0 ? dashData.leaves.map(l => (
                                                    <div key={l._id} style={{ textAlign: 'center' }}>
                                                        <div className="avatar" style={{ border: '2px solid #64748b', background: '#64748b', overflow: 'hidden' }}>
                                                            {l.user?.avatar ? <img src={l.user.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : l.user?.name?.substring(0, 2).toUpperCase()}
                                                        </div>
                                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{l.user?.name?.split(' ')[0]}</div>
                                                    </div>
                                                )) : <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>None today</div>}
                                            </div>
                                        </div>

                                        {/* Working Remotely */}
                                        <div className="panel">
                                            <div className="panel-header" style={{ marginBottom: '1rem', fontSize: '0.9rem', fontWeight: '500' }}>Working Remotely</div>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem' }}>
                                                {dashData.workingRemotely.length > 0 ? dashData.workingRemotely.map(w => (
                                                    <div key={w._id} style={{ textAlign: 'center' }}>
                                                        <div className="avatar" style={{ border: '2px solid #10b981', background: '#10b981', overflow: 'hidden' }}>
                                                            {w.user?.avatar ? <img src={w.user.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : w.user?.name?.substring(0, 2).toUpperCase()}
                                                        </div>
                                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{w.user?.name?.split(' ')[0]}</div>
                                                    </div>
                                                )) : <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>None today</div>}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Main Organization Column */}
                                <div style={{ zIndex: 1 }}>
                                    <div style={{ display: 'flex', marginBottom: '1rem' }}>
                                        <button
                                            className="btn"
                                            style={{
                                                background: 'var(--bg-panel)',
                                                color: 'var(--primary)',
                                                border: '1px solid var(--border-dark)',
                                                borderBottom: 'none',
                                                borderRadius: '4px 4px 0 0',
                                                fontWeight: '500',
                                                padding: '0.5rem 1rem'
                                            }}
                                            onClick={() => setHomeTab('Organization')}
                                        >
                                            Organization
                                        </button>
                                        <div style={{ flex: 1, borderBottom: '1px solid var(--border-dark)' }}></div>
                                    </div>

                                    {homeTab === 'Organization' ? (
                                        <>
                                            <div className="panel" style={{ marginBottom: '1.5rem', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)' }}>
                                                <div style={{ display: 'flex', gap: '1.5rem', borderBottom: '1px solid var(--border-dark)', paddingBottom: '0.8rem', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
                                                    <span
                                                        style={{ color: orgActionTab === 'Post' ? '#f59e0b' : 'var(--text-muted)', borderBottom: orgActionTab === 'Post' ? '2px solid #f59e0b' : 'none', paddingBottom: '0.8rem', marginBottom: '-0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontWeight: orgActionTab === 'Post' ? '600' : 'normal' }}
                                                        onClick={() => setOrgActionTab('Post')}
                                                    >✎ Post</span>
                                                    <span
                                                        style={{ color: orgActionTab === 'Poll' ? '#f59e0b' : 'var(--text-muted)', borderBottom: orgActionTab === 'Poll' ? '2px solid #f59e0b' : 'none', paddingBottom: '0.8rem', marginBottom: '-0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontWeight: orgActionTab === 'Poll' ? '600' : 'normal' }}
                                                        onClick={() => setOrgActionTab('Poll')}
                                                    >📊 Poll</span>
                                                    <span
                                                        style={{ color: orgActionTab === 'Praise' ? '#f59e0b' : 'var(--text-muted)', borderBottom: orgActionTab === 'Praise' ? '2px solid #f59e0b' : 'none', paddingBottom: '0.8rem', marginBottom: '-0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontWeight: orgActionTab === 'Praise' ? '600' : 'normal' }}
                                                        onClick={() => setOrgActionTab('Praise')}
                                                    >🏆 Praise</span>
                                                </div>
                                                {orgActionTab === 'Post' && (
                                                    <>
                                                        <textarea
                                                            value={postText}
                                                            onChange={(e) => setPostText(e.target.value)}
                                                            placeholder="Write your post here and mention your peers"
                                                            style={{ width: '100%', background: 'transparent', border: 'none', color: 'var(--text-main)', resize: 'none', height: '80px', outline: 'none', padding: '0.5rem 0', fontSize: '0.9rem' }}
                                                        />
                                                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                                                            <button
                                                                style={{ background: '#9333ea', color: 'white', border: 'none', borderRadius: '4px', padding: '0.5rem 1.5rem', fontSize: '0.85rem', cursor: 'pointer', opacity: postText ? 1 : 0.6 }}
                                                                onClick={async () => {
                                                                    if (postText) {
                                                                        try {
                                                                            await api.post('/social', { type: 'Post', content: postText });
                                                                            showAlert('Posted successfully!', 'info');
                                                                            setPostText('');
                                                                            fetchPublicData();
                                                                        } catch (err) {
                                                                            showAlert('Failed to post', 'error');
                                                                        }
                                                                    }
                                                                }}
                                                                disabled={!postText}
                                                            >
                                                                Post
                                                            </button>
                                                        </div>
                                                    </>
                                                )}
                                                {orgActionTab === 'Poll' && (
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                                        <input
                                                            type="text"
                                                            value={poll.question}
                                                            onChange={(e) => setPoll({ ...poll, question: e.target.value })}
                                                            placeholder="Ask something..."
                                                            style={{ ...inputStyle, padding: '0.4rem' }}
                                                        />
                                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                            <input
                                                                type="text"
                                                                value={poll.option1}
                                                                onChange={(e) => setPoll({ ...poll, option1: e.target.value })}
                                                                placeholder="Option 1"
                                                                style={{ ...inputStyle, padding: '0.4rem', fontSize: '0.75rem' }}
                                                            />
                                                            <input
                                                                type="text"
                                                                value={poll.option2}
                                                                onChange={(e) => setPoll({ ...poll, option2: e.target.value })}
                                                                placeholder="Option 2"
                                                                style={{ ...inputStyle, padding: '0.4rem', fontSize: '0.75rem' }}
                                                            />
                                                        </div>
                                                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                                                            <button
                                                                style={{ background: '#9333ea', color: 'white', border: 'none', borderRadius: '4px', padding: '0.5rem 1.5rem', fontSize: '0.85rem', cursor: 'pointer' }}
                                                                onClick={async () => {
                                                                    if (poll.question && poll.option1 && poll.option2) {
                                                                        try {
                                                                            await api.post('/social', {
                                                                                type: 'Poll',
                                                                                pollData: {
                                                                                    question: poll.question,
                                                                                    options: [{ text: poll.option1 }, { text: poll.option2 }]
                                                                                }
                                                                            });
                                                                            showAlert('Poll Created!', 'info');
                                                                            setPoll({ question: '', option1: '', option2: '' });
                                                                            fetchPublicData();
                                                                        } catch (err) {
                                                                            showAlert('Failed to create poll', 'error');
                                                                        }
                                                                    } else {
                                                                        showAlert('Please fill all poll fields', 'info');
                                                                    }
                                                                }}
                                                            >
                                                                Create Poll
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                                {orgActionTab === 'Praise' && (
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                                        <select
                                                            value={praise.user}
                                                            onChange={(e) => setPraise({ ...praise, user: e.target.value })}
                                                            style={{ ...inputStyle, padding: '0.4rem', fontSize: '0.75rem' }}
                                                        >
                                                            <option value="">Select a peer to recognize</option>
                                                            {allUsers.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
                                                        </select>
                                                        <textarea
                                                            value={praise.message}
                                                            onChange={(e) => setPraise({ ...praise, message: e.target.value })}
                                                            placeholder="What did they do great?"
                                                            style={{ width: '100%', background: 'transparent', border: '1px solid var(--border-dark)', color: 'var(--text-main)', resize: 'none', height: '40px', outline: 'none', padding: '0.5rem', fontSize: '0.75rem', borderRadius: '4px' }}
                                                        />
                                                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                                                            <button
                                                                style={{ background: '#9333ea', color: 'white', border: 'none', borderRadius: '4px', padding: '0.5rem 1.5rem', fontSize: '0.85rem', cursor: 'pointer' }}
                                                                onClick={async () => {
                                                                    if (praise.user && praise.message) {
                                                                        try {
                                                                            await api.post('/social', {
                                                                                type: 'Praise',
                                                                                content: praise.message,
                                                                                praiseData: { recipient: praise.user }
                                                                            });
                                                                            showAlert(`Praise sent successfully!`, 'info');
                                                                            setPraise({ user: '', message: '' });
                                                                            fetchPublicData();
                                                                        } catch (err) {
                                                                            showAlert('Failed to send praise', 'error');
                                                                        }
                                                                    }
                                                                }}
                                                            >
                                                                Send Praise
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="panel" style={{ marginBottom: '1.5rem', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: dashData.announcements.length > 0 ? '1.5rem' : 0 }}>
                                                    <div style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--text-main)' }}>Announcements</div>
                                                    {(user?.role === 'Admin' || user?.role === 'Super Admin') && (
                                                        <button
                                                            className="btn"
                                                            style={{ background: '#f59e0b', color: 'white', padding: '0.15rem 0.6rem', borderRadius: '6px', fontWeight: 'bold', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                            onClick={() => setShowAnnouncementModal(true)}
                                                        >
                                                            +
                                                        </button>
                                                    )}
                                                </div>
                                                {dashData.announcements.length > 0 ? dashData.announcements.map(a => (
                                                    <div key={a._id} style={{ marginBottom: '0.8rem', padding: '1rem', background: isLightMode ? '#f3f4f6' : 'rgba(255,255,255,0.05)', borderRadius: '6px' }}>
                                                        <div style={{ fontWeight: '600', fontSize: '0.85rem', color: 'var(--text-main)', marginBottom: '0.2rem' }}>{a.title}</div>
                                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{a.content}</div>
                                                    </div>
                                                )) : (
                                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No announcements</div>
                                                )}
                                            </div>

                                            {/* Social Activity Feed */}
                                            <div className="panel" style={{ padding: '1.5rem', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)' }}>
                                                <div style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '1.5rem', color: 'var(--text-main)', borderBottom: '1px solid var(--border-dark)', paddingBottom: '1rem' }}>Team Activity</div>
                                                {socialFeed.length > 0 ? socialFeed.map(activity => {
                                                    const canDelete = user?._id === activity.author?._id || user?.role === 'Admin' || user?.role === 'Super Admin';
                                                    return (
                                                        <div key={activity._id} style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-dark)', position: 'relative' }}>
                                                            {canDelete && (
                                                                <button
                                                                    onClick={() => {
                                                                        setCustomAlert({
                                                                            type: 'confirm',
                                                                            message: 'Are you sure you want to delete this activity?',
                                                                            onConfirm: async () => {
                                                                                try {
                                                                                    await api.delete(`/social/${activity._id}`);
                                                                                    showAlert('Activity deleted successfully.', 'info');
                                                                                    fetchPublicData();
                                                                                } catch (err) {
                                                                                    showAlert('Failed to delete activity.', 'error');
                                                                                }
                                                                            }
                                                                        });
                                                                    }}
                                                                    style={{ position: 'absolute', top: 0, right: 0, background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.5rem' }}
                                                                    title="Delete Activity"
                                                                >
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            )}
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.8rem' }}>
                                                                <div className="avatar" style={{ width: '36px', height: '36px', background: activity.type === 'Praise' ? '#f59e0b' : '#3b82f6', fontSize: '0.8rem' }}>
                                                                    {activity.author?.avatar ? <img src={activity.author.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : activity.author?.name?.substring(0, 2).toUpperCase()}
                                                                </div>
                                                                <div>
                                                                    <div style={{ fontWeight: '500', fontSize: '0.9rem', color: 'var(--text-main)' }}>{activity.author?.name}</div>
                                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(activity.createdAt).toLocaleString()}</div>
                                                                </div>
                                                            </div>

                                                            {activity.type === 'Post' && (
                                                                <div style={{ fontSize: '0.9rem', color: 'var(--text-main)', paddingLeft: '3.2rem', whiteSpace: 'pre-wrap' }}>
                                                                    {activity.content}
                                                                </div>
                                                            )}

                                                            {activity.type === 'Praise' && (
                                                                <div style={{ paddingLeft: '3.2rem' }}>
                                                                    <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid #f59e0b', borderRadius: '8px', padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                                        <div style={{ fontSize: '2rem' }}>🏆</div>
                                                                        <div>
                                                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>Recognized <span style={{ fontWeight: 'bold' }}>{activity.praiseData?.recipient?.name}</span></div>
                                                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.3rem', fontStyle: 'italic' }}>"{activity.content}"</div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {activity.type === 'Poll' && (
                                                                <div style={{ paddingLeft: '3.2rem' }}>
                                                                    <div style={{ fontSize: '0.9rem', fontWeight: '500', color: 'var(--text-main)', marginBottom: '0.8rem' }}>{activity.pollData?.question}</div>
                                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                                        {activity.pollData?.options?.map(opt => {
                                                                            const totalVotes = activity.pollData.options.reduce((sum, o) => sum + o.votes.length, 0);
                                                                            const percent = totalVotes === 0 ? 0 : Math.round((opt.votes.length / totalVotes) * 100);
                                                                            const hasVoted = opt.votes.includes(user?._id);

                                                                            return (
                                                                                <div
                                                                                    key={opt._id}
                                                                                    style={{
                                                                                        position: 'relative',
                                                                                        background: isLightMode ? '#f9fafb' : 'rgba(255,255,255,0.02)',
                                                                                        border: hasVoted ? '1px solid #a855f7' : '1px solid var(--border-dark)',
                                                                                        borderRadius: '6px',
                                                                                        padding: '0.8rem 1rem',
                                                                                        cursor: 'pointer',
                                                                                        overflow: 'hidden',
                                                                                        boxSizing: 'border-box'
                                                                                    }}
                                                                                    onClick={async () => {
                                                                                        try {
                                                                                            await api.post(`/social/${activity._id}/vote`, { optionId: opt._id });
                                                                                            fetchPublicData();
                                                                                        } catch (err) {
                                                                                            showAlert('Failed to vote', 'error');
                                                                                        }
                                                                                    }}
                                                                                >
                                                                                    <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: `${percent}%`, background: hasVoted ? 'rgba(168, 85, 247, 0.2)' : 'rgba(168, 85, 247, 0.05)', zIndex: 0, transition: 'width 0.4s ease-out' }}></div>
                                                                                    <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', color: 'var(--text-main)' }}>
                                                                                        <span style={{ fontWeight: hasVoted ? '600' : 'normal' }}>{opt.text}</span>
                                                                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>{percent}% ({opt.votes.length})</span>
                                                                                    </div>
                                                                                </div>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )
                                                }) : (
                                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>No activity yet. Be the first to post!</div>
                                                )}
                                            </div>

                                            <div className="panel">
                                                <div style={{ display: 'flex', gap: '2rem', borderBottom: '1px solid var(--border-dark)', paddingBottom: '0.5rem', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
                                                    <span
                                                        style={{ color: orgActivityTab === 'Birthdays' ? 'var(--text-main)' : 'var(--text-muted)', borderBottom: orgActivityTab === 'Birthdays' ? '2px solid var(--text-main)' : 'none', paddingBottom: '0.5rem', marginBottom: '-0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}
                                                        onClick={() => setOrgActivityTab('Birthdays')}
                                                    >🎂 {dashData.birthdays.today.length} Birthday{dashData.birthdays.today.length !== 1 ? 's' : ''}</span>
                                                    <span
                                                        style={{ color: orgActivityTab === 'Anniversaries' ? 'var(--text-main)' : 'var(--text-muted)', borderBottom: orgActivityTab === 'Anniversaries' ? '2px solid var(--text-main)' : 'none', paddingBottom: '0.5rem', marginBottom: '-0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}
                                                        onClick={() => setOrgActivityTab('Anniversaries')}
                                                    >🎉 0 Work Anniversaries</span>
                                                    <span
                                                        style={{ color: orgActivityTab === 'NewJoinees' ? 'var(--text-main)' : 'var(--text-muted)', borderBottom: orgActivityTab === 'NewJoinees' ? '2px solid var(--text-main)' : 'none', paddingBottom: '0.5rem', marginBottom: '-0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}
                                                        onClick={() => setOrgActivityTab('NewJoinees')}
                                                    >👥 {dashData.newJoinees.length} New joinee{dashData.newJoinees.length !== 1 ? 's' : ''}</span>
                                                </div>

                                                {orgActivityTab === 'Birthdays' && (
                                                    <>
                                                        <div style={{ marginBottom: '2rem' }}>
                                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', marginBottom: '1rem' }}>Birthdays today</div>
                                                            {dashData.birthdays.today.length > 0 ? (
                                                                <div style={{ display: 'flex', gap: '1rem' }}>
                                                                    {dashData.birthdays.today.map(b => (
                                                                        <div key={b._id} style={{ textAlign: 'center' }}>
                                                                            <div className="avatar" style={{ background: '#10b981', width: '48px', height: '48px', fontSize: '1rem', margin: '0 auto 0.5rem' }}>
                                                                                {b.name?.substring(0, 2).toUpperCase()}
                                                                            </div>
                                                                            <div style={{ fontSize: '0.75rem', fontWeight: '500' }}>{b.name?.split(' ')[0]}</div>
                                                                            <div
                                                                                style={{ fontSize: '0.65rem', color: wishedUsers.includes(b._id) ? 'var(--text-muted)' : '#f59e0b', cursor: wishedUsers.includes(b._id) ? 'default' : 'pointer' }}
                                                                                onClick={() => { if (!wishedUsers.includes(b._id)) setWishedUsers([...wishedUsers, b._id]); }}
                                                                            >
                                                                                {wishedUsers.includes(b._id) ? 'Wished!' : 'Wish'}
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            ) : (
                                                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', padding: '0.5rem 0' }}>None today</div>
                                                            )}
                                                        </div>

                                                        <div>
                                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', marginBottom: '1rem' }}>Upcoming Birthdays</div>
                                                            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                                                                {dashData.birthdays.upcoming.length > 0 ? dashData.birthdays.upcoming.map(b => (
                                                                    <div key={b._id} style={{ textAlign: 'center' }}>
                                                                        <div className="avatar" style={{ background: '#f59e0b', width: '40px', height: '40px', fontSize: '0.9rem', margin: '0 auto 0.5rem' }}>
                                                                            {b.name?.substring(0, 2).toUpperCase()}
                                                                        </div>
                                                                        <div style={{ fontSize: '0.75rem', fontWeight: '500' }}>{b.name?.split(' ')[0]}</div>
                                                                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                                                                            {new Date(b.dob).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                                                                        </div>
                                                                    </div>
                                                                )) : (
                                                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', padding: '0.5rem 0' }}>None in next 30 days</div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </>
                                                )}

                                                {orgActivityTab === 'Anniversaries' && (
                                                    <div style={{ padding: '1rem 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                                        No work anniversaries today.
                                                    </div>
                                                )}

                                                {orgActivityTab === 'NewJoinees' && (
                                                    <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                                                        {dashData.newJoinees.length > 0 ? dashData.newJoinees.map(j => (
                                                            <div key={j._id} style={{ textAlign: 'center' }}>
                                                                <div className="avatar" style={{ border: '2px solid #06b6d4', background: '#06b6d4', width: '40px', height: '40px', fontSize: '0.9rem', margin: '0 auto 0.5rem' }}>
                                                                    {j.name?.substring(0, 2).toUpperCase()}
                                                                </div>
                                                                <div style={{ fontSize: '0.75rem', fontWeight: '500' }}>{j.name?.split(' ')[0]}</div>
                                                                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                                                                    Joined {new Date(j.joiningDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                                                                </div>
                                                            </div>
                                                        )) : (
                                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', padding: '1rem 0' }}>No new joinees in the last 30 days.</div>
                                                        )}
                                                    </div>
                                                )}
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
                        </>
                    )}

                    {homeSubTab === 'Welcome' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', minHeight: '600px' }}>
                            {/* Detailed Profile Banner */}
                            <div style={{
                                background: 'var(--bg-gradient-profile)',
                                borderRadius: 'var(--radius-lg)',
                                padding: '2rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                position: 'relative',
                                overflow: 'hidden'
                            }}>
                                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.1, backgroundImage: 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'100\' height=\'100\' viewBox=\'0 0 100 100\'><path d=\'M0,50 Q25,25 50,50 T100,50\' fill=\'none\' stroke=\'white\' stroke-width=\'2\'/></svg>")', backgroundSize: '100px 100px' }}></div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', zIndex: 1 }}>
                                    <div
                                        className="avatar"
                                        style={{ width: '80px', height: '80px', fontSize: '2rem', background: '#34d399', color: '#064e3b', border: '4px solid rgba(255,255,255,0.2)', cursor: 'pointer' }}
                                        onClick={() => { setActiveSidebar('Me'); setActiveSubTab('Profile'); }}
                                    >
                                        {user?.name?.substring(0, 2).toUpperCase() || 'SM'}
                                    </div>
                                    <div style={{ color: 'var(--text-on-banner)' }}>
                                        <h2 style={{ fontSize: '1.75rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            {user?.name || 'Shruti Mendhe'}
                                            <span
                                                style={{ fontSize: '1rem', color: 'var(--text-on-banner)', opacity: 0.5, cursor: 'pointer' }}
                                                onClick={() => { navigator.clipboard.writeText(window.location.href); showAlert('Profile link copied!', 'info'); }}
                                                title="Copy profile link"
                                            >
                                                🔗
                                            </span>
                                        </h2>
                                        <div style={{ fontSize: '0.9rem', color: 'var(--text-on-banner)', opacity: 0.8, marginTop: '0.25rem' }}>
                                            {user?.designation || 'Specialist'} - {user?.place || 'Nagpur'}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid" style={{ gridTemplateColumns: '3fr 1fr', gap: '2rem' }}>
                                <div>
                                    <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--text-main)', fontWeight: '500' }}>Introduce yourself</h3>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>We would love to know more about yourself</p>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        {[
                                            { label: 'About', key: 'about' },
                                            { label: 'What I love about my job?', key: 'loveJob' },
                                            { label: 'My interests and hobbies', key: 'interests' }
                                        ].map((item) => (
                                            <div key={item.key} style={{ padding: '1.25rem', background: 'var(--bg-panel)', borderBottom: '1px solid var(--border-dark)' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: editingResponse === item.key ? '1rem' : '0' }}>
                                                    <div style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>{item.label}</div>
                                                    {!editingResponse && (
                                                        <div
                                                            style={{ fontSize: '0.85rem', color: 'var(--primary)', cursor: 'pointer', fontWeight: '500' }}
                                                            onClick={() => setEditingResponse(item.key)}
                                                        >
                                                            {welcomeResponses[item.key] ? 'Edit Response' : 'Add Response'}
                                                        </div>
                                                    )}
                                                </div>
                                                {editingResponse === item.key ? (
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                                        <textarea
                                                            style={{ ...inputStyle, minHeight: '80px', width: '100%', padding: '0.75rem' }}
                                                            placeholder={`Share something about ${item.label.toLowerCase()}...`}
                                                            value={welcomeResponses[item.key]}
                                                            onChange={(e) => setWelcomeResponses({ ...welcomeResponses, [item.key]: e.target.value })}
                                                        />
                                                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                                            <button
                                                                className="btn btn-secondary"
                                                                style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}
                                                                onClick={() => setEditingResponse(null)}
                                                            >
                                                                Cancel
                                                            </button>
                                                            <button
                                                                className="btn btn-primary"
                                                                style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}
                                                                onClick={() => handleSaveResponse(item.key)}
                                                            >
                                                                Save
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    welcomeResponses[item.key] && (
                                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                                                            {welcomeResponses[item.key]}
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    <div style={{ marginTop: '3rem' }}>
                                        <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--text-main)', fontWeight: '500' }}>Explore Keka</h3>
                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Explore all things you can do on Keka.</p>

                                        <div className="grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
                                            {[
                                                { title: 'Finance', icon: <Briefcase size={20} color="var(--primary)" />, desc: 'View your salary payslips and tax details all in one place.', nav: 'My Finances' },
                                                { title: 'Leaves', icon: <Calendar size={20} color="var(--primary)" />, desc: 'Check your time off policy balances and apply for time off.', nav: 'Me' },
                                                { title: 'Attendance', icon: <Clock size={20} color="var(--primary)" />, desc: 'Log your attendance, view stats and attendance policy.', nav: 'Me' },
                                                { title: 'Inbox', icon: <Mail size={20} color="var(--primary)" />, desc: 'Take an action on tasks assigned to you.', nav: 'Inbox' },
                                            ].map(item => (
                                                <div key={item.title} className="panel" style={{ padding: '1.5rem', cursor: 'pointer', transition: 'transform 0.2s', borderTop: '2px solid transparent' }} onClick={() => setActiveSidebar(item.nav)}>
                                                    <div style={{ marginBottom: '1rem' }}>{item.icon}</div>
                                                    <div style={{ fontWeight: '500', fontSize: '0.95rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>{item.title}</div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>{item.desc}</div>
                                                </div>
                                            ))}

                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <div className="panel" style={{ background: 'var(--bg-panel)', padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
                                        <div style={{ fontSize: '0.85rem', fontWeight: '500', marginBottom: '1.5rem', color: 'var(--text-main)' }}>Reporting Manager</div>

                                        {user?.reportingManager ? (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <div className="avatar" style={{ width: '40px', height: '40px', fontSize: '0.9rem', background: 'var(--primary)', color: 'white' }}>
                                                    {user.reportingManager.name?.substring(0, 1).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-main)' }}>{user.reportingManager.name}</div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>{user.reportingManager.email}</div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem 0', fontStyle: 'italic' }}>
                                                No reporting manager assigned
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            );
        }

        if (activeSidebar === 'Me') {
            return (
                <>
                    <div className="sub-nav">
                        {['Attendance', 'Leave', 'Profile'].map(tab => (
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
                                <div className="grid" style={{ gridTemplateColumns: 'minmax(300px, 1fr) minmax(300px, 1fr) minmax(300px, 1fr)', gap: '1.25rem', marginBottom: '1.25rem' }}>
                                    {/* Attendance Stats Panel */}
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
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(var(--primary-rgb), 0.2)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>ME</div>
                                                    <span style={{ fontSize: '0.85rem' }}>Me</span>
                                                </div>
                                                <div style={{ textAlign: 'right' }}>
                                                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>AVG HRS / DAY</div>
                                                    <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>{meStats.avgHours}</div>
                                                </div>
                                                <div style={{ textAlign: 'right' }}>
                                                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>ON TIME ARRIVAL</div>
                                                    <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>{meStats.onTime}</div>
                                                </div>
                                            </div>
                                            {teammateIndividualStats.length > 0 && teammateIndividualStats.map(ts => (
                                                <div key={ts._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                        <div className="avatar" style={{ width: '32px', height: '32px', fontSize: '0.7rem', background: 'rgba(var(--primary-rgb), 0.1)', color: 'var(--text-muted)' }}>
                                                            {ts.name.substring(0, 2).toUpperCase()}
                                                        </div>
                                                        <span style={{ fontSize: '0.85rem' }}>{ts.name}</span>
                                                    </div>
                                                    <div style={{ textAlign: 'right' }}>
                                                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>AVG HRS / DAY</div>
                                                        <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>{Math.floor(ts.avgHours)}h {Math.round((ts.avgHours % 1) * 60)}m</div>
                                                    </div>
                                                    <div style={{ textAlign: 'right' }}>
                                                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>ON TIME ARRIVAL</div>
                                                        <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>{ts.onTimePercentage}%</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Work Schedule Panel */}
                                    <div className="panel" style={{ padding: '1.25rem' }}>
                                        <div className="panel-header" style={{ marginBottom: '1rem' }}>Work Schedule</div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                            <div style={{ background: 'rgba(var(--primary-rgb), 0.05)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-dark)' }}>
                                                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '0.5rem' }}>Daily Shift Requirement</div>
                                                <div style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-main)' }}>{user?.workingSchedule?.shiftStart || '11:00'} - {user?.workingSchedule?.shiftEnd || '07:00 PM'}</div>
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


                                    {/* Actions Panel */}
                                    <div className="panel" style={{ padding: '1.25rem' }}>
                                        <div className="panel-header" style={{ marginBottom: '0.75rem' }}>Actions</div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <div>
                                                <div style={{ fontSize: '1.25rem', fontWeight: '400', marginBottom: '0.25rem' }}>{currentTime}</div>
                                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>{new Date().toDateString()}</div>
                                                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.25rem' }}>TOTAL HOURS <HelpCircle size={10} /></div>
                                                <div style={{ fontSize: '0.85rem' }}>
                                                    Effective: <span style={{ fontWeight: '600' }}>{isClockedIn ? calculateElapsedTime(activeLog?.clockInTime).text : '0h 0m'}</span>
                                                </div>
                                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                                    Gross: {isClockedIn ? calculateElapsedTime(activeLog?.clockInTime).text : '0h 0m'}
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                                                {isAttendanceFinished && !isClockedIn ? (
                                                    <div style={{ textAlign: 'right', color: '#27ae60', fontSize: '0.85rem', fontWeight: '500', maxWidth: '180px', lineHeight: '1.4' }}>
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
                                                        <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>
                                                            {isClockedIn ? `${calculateElapsedTime(activeLog?.clockInTime).text} Since Last Login` : 'Currently offline'}
                                                        </div>
                                                    </>
                                                )}
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--primary)', cursor: 'pointer' }}>
                                                    <Home size={12} /> {isClockedIn ? (isWFH ? 'Work From Home' : 'Work On-Site') : (selectedWorkingMode === 'Remote' ? 'Work From Home' : 'Work On-Site')}
                                                </div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                    <FileText size={12} /> Attendance Policy
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="panel" style={{ padding: 0 }}>
                                    <div style={{ padding: '0 1.25rem', borderBottom: '1px solid var(--border-dark)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', gap: '2rem', fontSize: '0.85rem' }}>
                                            {['Attendance Log', 'Calendar', 'Attendance Requests', 'Overtime Requests'].map(tab => (
                                                <span
                                                    key={tab}
                                                    onClick={() => setAttendanceTab(tab)}
                                                    style={{
                                                        padding: '1.25rem 0',
                                                        cursor: 'pointer',
                                                        color: attendanceTab === tab ? 'var(--primary)' : 'var(--text-muted)',
                                                        borderBottom: attendanceTab === tab ? '2px solid var(--primary)' : '2px solid transparent',
                                                        marginBottom: '-1px',
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
                                                    <span style={{ fontSize: '1rem', fontWeight: '500' }}>Last 30 Days</span>
                                                    <div style={{ display: 'flex', borderRadius: '4px', border: '1px solid var(--border-dark)', overflow: 'hidden' }}>
                                                        {['30 DAYS', 'FEB', 'JAN', 'DEC', 'NOV', 'OCT', 'SEP'].map((m, i) => (
                                                            <div key={m} style={{
                                                                padding: '0.4rem 0.75rem', fontSize: '0.7rem', cursor: 'pointer',
                                                                background: i === 0 ? 'var(--primary)' : 'transparent',
                                                                color: i === 0 ? 'white' : 'var(--text-muted)',
                                                                borderRight: i === 6 ? 'none' : '1px solid var(--border-dark)'
                                                            }}>
                                                                {m}
                                                            </div>
                                                        ))}
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
                                                        {attendanceLogs.length > 0 ? attendanceLogs.map(log => (
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
                                                                            return <span style={{ color: '#10b981', fontWeight: '500' }}>Early</span>;
                                                                        } else if (totalMins <= shiftStartMins + 60) {
                                                                            return <span style={{ color: 'var(--primary)', fontWeight: '500' }}>On Time</span>;
                                                                        } else {
                                                                            return <span style={{ color: '#ef4444', fontWeight: '500' }}>Late</span>;
                                                                        }
                                                                    })()}
                                                                </td>
                                                                <td><Info size={14} color="var(--primary)" style={{ cursor: 'pointer' }} onClick={() => setShowLogInfo(log)} /></td>
                                                            </tr>
                                                        )) : (
                                                            <tr style={{ border: 'none' }}><td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No logs found for this period</td></tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </>
                                        )}
                                        {attendanceTab !== 'Attendance Log' && (
                                            <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                                <div style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{attendanceTab} Content</div>
                                                <p style={{ fontSize: '0.85rem' }}>This section is currently being updated with real-time data.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </>
                        )
                        }

                        {
                            activeSubTab === 'Performance' && (
                                <div className="grid" style={{ gridTemplateColumns: '1fr', gap: '1.5rem' }}>
                                    <div className="panel">
                                        <div className="panel-header">Active Objectives (OKRs)</div>
                                        <div style={{ border: '1px solid var(--border-dark)', borderRadius: 'var(--radius-md)', padding: '1.5rem', background: 'rgba(var(--primary-rgb, 155, 89, 182), 0.05)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                                <div style={{ fontWeight: '500', fontSize: '1rem' }}>Improve Backend Response Time by 30%</div>
                                                <span style={{ border: '1px solid #10b981', color: '#10b981', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem' }}>On Track - 65%</span>
                                            </div>
                                            <div style={{ width: '100%', height: '8px', background: 'var(--border-dark)', borderRadius: '4px', marginBottom: '1rem' }}>
                                                <div style={{ width: '65%', height: '100%', background: '#10b981', borderRadius: '4px' }}></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        }

                        {
                            activeSubTab === 'Expenses & Travel' && (
                                <div className="panel" style={{ textAlign: 'center', padding: '4rem' }}>
                                    <Briefcase size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
                                    <h3 style={{ marginBottom: '0.5rem' }}>No Active Expenses</h3>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>You haven't filed any expenses this quarter.</p>
                                    <button className="btn btn-primary">+ Claim New Expense</button>
                                </div>
                            )
                        }

                        {
                            activeSubTab === 'Apps' && (
                                <div className="panel" style={{ textAlign: 'center', padding: '4rem' }}>
                                    <Building2 size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
                                    <h3 style={{ marginBottom: '0.5rem' }}>Connected Applications</h3>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>Manage your third-party integrations like Slack, Zoom, and Jira.</p>
                                    <button className="btn" style={{ border: '1px solid var(--border-dark)' }}>Manage Connectors</button>
                                </div>
                            )
                        }

                        {activeSubTab === 'Leave' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                {/* My Leave Stats */}
                                <div>
                                    <div style={{ fontSize: '0.9rem', fontWeight: '500', marginBottom: '1rem', color: 'var(--text-main)' }}>My Leave Stats</div>
                                    <div className="grid" style={{ gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
                                        {/* Weekly Pattern */}
                                        <div className="panel" style={{ padding: '1.25rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Weekly Pattern</span>
                                                <Info size={14} color="var(--text-muted)" />
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '100px', padding: '0 0.5rem' }}>
                                                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                                                    <div key={day} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
                                                        <div style={{ width: '12px', height: `${(leaveStats.weeklyPattern?.[i] || 0) * 20 + 2}px`, minHeight: '4px', background: 'var(--primary)', borderRadius: '2px', opacity: 0.8 }}></div>
                                                        <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>{day[0]}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        {/* Consumed Leave Types */}
                                        <div className="panel" style={{ padding: '1.25rem', textAlign: 'center' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Consumed Leave Types</span>
                                                <Info size={14} color="var(--text-muted)" />
                                            </div>
                                            <div style={{ position: 'relative', width: '80px', height: '80px', margin: '0 auto' }}>
                                                <svg viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
                                                    <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="var(--border-dark)" strokeWidth="4"></circle>
                                                    {Object.entries(leaveStats.balances || {}).map(([type, data], i, arr) => {
                                                        const totalConsumed = arr.reduce((acc, [_, d]) => acc + d.consumed, 0);
                                                        if (totalConsumed === 0) return null;
                                                        const colors = ['#a855f7', '#10b981', '#f59e0b', '#3b82f6'];
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
                                                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '0.65rem', fontWeight: '600' }}>
                                                    Leave<br />Types
                                                </div>
                                            </div>
                                        </div>
                                        {/* Monthly Stats */}
                                        <div className="panel" style={{ padding: '1.25rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Monthly Stats</span>
                                                <Info size={14} color="var(--text-muted)" />
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '100px', padding: '0 0.5rem', gap: '2px' }}>
                                                {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, i) => (
                                                    <div key={m} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
                                                        <div style={{ width: '100%', height: `${(leaveStats.monthlyStats?.[i] || 0) * 10 + 2}px`, minHeight: '2px', background: 'var(--primary)', borderRadius: '1px', opacity: i < new Date().getMonth() + 1 ? 0.8 : 0.2 }}></div>
                                                        <span style={{ fontSize: '0.55rem', color: 'var(--text-muted)' }}>{m[0]}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Leave Balances */}
                                <div>
                                    <div style={{ fontSize: '0.9rem', fontWeight: '500', marginBottom: '1rem', color: 'var(--text-main)' }}>Leave Balances</div>
                                    <div className="grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
                                        {[
                                            { type: 'Casual Leave', key: 'Casual', color: '#a855f7' },
                                            { type: 'Paid Leave', key: 'Paid', color: '#f87171' },
                                            { type: 'Sick Leave', key: 'Sick', color: '#06b6d4' },
                                            { type: 'Comp Off', key: 'Comp Off', color: '#d1d5db' }
                                        ].map(item => {
                                            const data = leaveStats.balances?.[item.key] || { total: 0, consumed: 0 };
                                            const available = Math.max(0, data.total - data.consumed);
                                            const percentage = data.total > 0 ? (available / data.total) * 100 : 0;
                                            return (
                                                <div key={item.key} className="panel" style={{ padding: '1.5rem' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                                                        <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>{item.type}</span>
                                                        <span style={{ fontSize: '0.7rem', color: 'var(--primary)', cursor: 'pointer' }}>View details</span>
                                                    </div>
                                                    <div style={{ position: 'relative', width: '100px', height: '100px', margin: '0 auto 1.5rem' }}>
                                                        <svg viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
                                                            <circle cx="18" cy="18" r="15.915" fill="transparent" stroke={`${item.color}20`} strokeWidth="3"></circle>
                                                            <circle
                                                                cx="18" cy="18" r="15.915"
                                                                fill="transparent"
                                                                stroke={item.color}
                                                                strokeWidth="3"
                                                                strokeDasharray={`${percentage} ${100 - percentage}`}
                                                                strokeDashoffset="25"
                                                            ></circle>
                                                        </svg>
                                                        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                                                            <div style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{available === Infinity ? '∞' : available} Days</div>
                                                            <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>Available</div>
                                                        </div>
                                                    </div>
                                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', borderTop: '1px solid var(--border-dark)', paddingTop: '1rem', marginTop: 'auto' }}>
                                                        <div>
                                                            <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Available</div>
                                                            <div style={{ fontSize: '0.8rem', fontWeight: '500' }}>{available === Infinity ? '∞' : `${available} days`}</div>
                                                        </div>
                                                        <div style={{ textAlign: 'right' }}>
                                                            <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Consumed</div>
                                                            <div style={{ fontSize: '0.8rem', fontWeight: '500' }}>{data.consumed} days</div>
                                                        </div>
                                                        <div style={{ marginTop: '0.5rem' }}>
                                                            <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Annual Quota</div>
                                                            <div style={{ fontSize: '0.8rem', fontWeight: '500' }}>{data.total === Infinity ? '∞' : `${data.total} days`}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Leave History */}
                                <div>
                                    <div style={{ fontSize: '0.9rem', fontWeight: '500', marginBottom: '1rem', color: 'var(--text-main)' }}>Leave History</div>
                                    <div className="panel" style={{ padding: 0 }}>
                                        <table className="data-table">
                                            <thead>
                                                <tr style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                                                    <th>Leave Dates</th>
                                                    <th>Leave Type</th>
                                                    <th>Status</th>
                                                    <th>Requested By</th>
                                                    <th>Action Taken On</th>
                                                    <th>Leave Note</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {leaveStats.history?.length > 0 ? leaveStats.history.map(h => (
                                                    <tr key={h._id}>
                                                        <td style={{ fontSize: '0.8rem' }}>
                                                            {new Date(h.startDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                            {h.startDate !== h.endDate && ` - ${new Date(h.endDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}`}
                                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                                                                {Math.ceil((new Date(h.endDate) - new Date(h.startDate)) / (1000 * 60 * 60 * 24)) + 1} day(s)
                                                            </div>
                                                        </td>
                                                        <td style={{ fontSize: '0.85rem' }}>
                                                            {h.type}
                                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Requested on {new Date(h.createdAt).toLocaleDateString()}</div>
                                                        </td>
                                                        <td>
                                                            <span style={{
                                                                padding: '0.2rem 0.5rem',
                                                                borderRadius: '4px',
                                                                fontSize: '0.7rem',
                                                                fontWeight: '500',
                                                                background: h.status === 'Approved' ? '#10b98120' : h.status === 'Rejected' ? '#ef444420' : '#8b5cf620',
                                                                color: h.status === 'Approved' ? '#10b981' : h.status === 'Rejected' ? '#ef4444' : '#8b5cf6'
                                                            }}>
                                                                {h.status}
                                                            </span>
                                                            {h.status === 'Approved' && h.approvedBy && (
                                                                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '4px' }}>by {h.approvedBy.name}</div>
                                                            )}
                                                        </td>
                                                        <td style={{ fontSize: '0.8rem' }}>{user.name}</td>
                                                        <td style={{ fontSize: '0.8rem' }}>{h.status !== 'Pending' ? new Date(h.updatedAt).toLocaleDateString() : '-'}</td>
                                                        <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)', maxWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{h.reason || '-'}</td>
                                                        <td><Info size={14} color="var(--primary)" style={{ cursor: 'pointer' }} /></td>
                                                    </tr>
                                                )) : (
                                                    <tr><td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No leave history found.</td></tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeSubTab === 'Profile' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div className="panel" style={{ padding: '2rem', position: 'relative' }}>
                                    <div style={{ position: 'absolute', top: '2rem', right: '2rem' }}>
                                        {!isProfileEditing ? (
                                            <button
                                                className="btn btn-sm"
                                                style={{ background: 'var(--primary)', color: 'white' }}
                                                onClick={() => {
                                                    setTempProfile({
                                                        name: user.name,
                                                        dob: user.dob ? user.dob.split('T')[0] : '',
                                                        joiningDate: user.joiningDate ? user.joiningDate.split('T')[0] : '',
                                                        phoneNumber: user.phoneNumber || '',
                                                        bloodGroup: user.bloodGroup || '',
                                                        gender: user.gender || '',
                                                        place: user.place || '',
                                                        department: user.department || '',
                                                        designation: user.designation || ''
                                                    });
                                                    setIsProfileEditing(true);
                                                }}
                                            >
                                                Edit Profile
                                            </button>
                                        ) : (
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button className="btn btn-sm" onClick={() => setIsProfileEditing(false)}>Cancel</button>
                                                <button className="btn btn-sm btn-primary" onClick={handleUpdateProfile}>Save Changes</button>
                                            </div>
                                        )}
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '2.5rem' }}>
                                        <div className="avatar" style={{ width: '100px', height: '100px', fontSize: '2.5rem', background: 'var(--primary)', color: 'white' }}>{user.name.substring(0, 1).toUpperCase()}</div>
                                        <div>
                                            {isProfileEditing ? (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                    <input type="text" value={tempProfile.name} onChange={e => setTempProfile({ ...tempProfile, name: e.target.value })} style={{ ...inputStyle, fontSize: '1.5rem', fontWeight: 'bold', width: '300px' }} />
                                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                        <input type="text" value={tempProfile.designation} placeholder="Designation" onChange={e => setTempProfile({ ...tempProfile, designation: e.target.value })} style={{ ...inputStyle, width: '145px' }} />
                                                        <input type="text" value={tempProfile.department} placeholder="Department" onChange={e => setTempProfile({ ...tempProfile, department: e.target.value })} style={{ ...inputStyle, width: '145px' }} />
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <h2 style={{ fontSize: '1.75rem', fontWeight: '600', marginBottom: '0.25rem' }}>{user.name}</h2>
                                                    <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>{user.designation} | {user.department}</p>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
                                        <div>
                                            <label style={labelStyle}>Email</label>
                                            <div style={{ fontSize: '0.95rem', fontWeight: '500' }}>{user.email}</div>
                                        </div>
                                        <div>
                                            <label style={labelStyle}>Phone Number</label>
                                            {isProfileEditing ? (
                                                <input type="text" value={tempProfile.phoneNumber} onChange={e => setTempProfile({ ...tempProfile, phoneNumber: e.target.value })} style={inputStyle} />
                                            ) : (
                                                <div style={{ fontSize: '0.95rem', fontWeight: '500' }}>{user.phoneNumber || 'N/A'}</div>
                                            )}
                                        </div>
                                        <div>
                                            <label style={labelStyle}>Employee ID</label>
                                            <div style={{ fontSize: '0.95rem', fontWeight: '500' }}>KEKA-{user._id.substring(user._id.length - 6).toUpperCase()}</div>
                                        </div>

                                        <div>
                                            <label style={labelStyle}>Date of Birth</label>
                                            {isProfileEditing ? (
                                                <input type="date" value={tempProfile.dob} onChange={e => setTempProfile({ ...tempProfile, dob: e.target.value })} style={inputStyle} />
                                            ) : (
                                                <div style={{ fontSize: '0.95rem', fontWeight: '500' }}>{user.dob ? new Date(user.dob).toLocaleDateString() : 'N/A'}</div>
                                            )}
                                        </div>
                                        <div>
                                            <label style={labelStyle}>Date of Joining</label>
                                            {isProfileEditing ? (
                                                <input type="date" value={tempProfile.joiningDate} onChange={e => setTempProfile({ ...tempProfile, joiningDate: e.target.value })} style={inputStyle} />
                                            ) : (
                                                <div style={{ fontSize: '0.95rem', fontWeight: '500' }}>{user.joiningDate ? new Date(user.joiningDate).toLocaleDateString() : 'N/A'}</div>
                                            )}
                                        </div>
                                        <div>
                                            <label style={labelStyle}>Gender</label>
                                            {isProfileEditing ? (
                                                <select value={tempProfile.gender} onChange={e => setTempProfile({ ...tempProfile, gender: e.target.value })} style={inputStyle}>
                                                    <option value="">Select Gender</option>
                                                    <option value="Male">Male</option>
                                                    <option value="Female">Female</option>
                                                    <option value="Other">Other</option>
                                                </select>
                                            ) : (
                                                <div style={{ fontSize: '0.95rem', fontWeight: '500' }}>{user.gender || 'N/A'}</div>
                                            )}
                                        </div>

                                        <div>
                                            <label style={labelStyle}>Blood Group</label>
                                            {isProfileEditing ? (
                                                <input type="text" value={tempProfile.bloodGroup} placeholder="e.g. O+" onChange={e => setTempProfile({ ...tempProfile, bloodGroup: e.target.value })} style={inputStyle} />
                                            ) : (
                                                <div style={{ fontSize: '0.95rem', fontWeight: '500' }}>{user.bloodGroup || 'N/A'}</div>
                                            )}
                                        </div>
                                        <div>
                                            <label style={labelStyle}>Role</label>
                                            <div style={{ fontSize: '0.95rem', fontWeight: '500' }}>{user.role}</div>
                                        </div>
                                        <div>
                                            <label style={labelStyle}>Location (Place)</label>
                                            {isProfileEditing ? (
                                                <input type="text" value={tempProfile.place} onChange={e => setTempProfile({ ...tempProfile, place: e.target.value })} style={inputStyle} />
                                            ) : (
                                                <div style={{ fontSize: '0.95rem', fontWeight: '500' }}>{user.place || 'N/A'}</div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="panel" style={{ padding: '2rem' }}>
                                    <div className="panel-header" style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>Admin Configured Work Details</div>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2rem' }}>
                                        <div>
                                            <label style={labelStyle}>Shift Timings</label>
                                            <div style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--primary)' }}>{user?.workingSchedule?.shiftStart} to {user?.workingSchedule?.shiftEnd}</div>
                                        </div>
                                        <div>
                                            <label style={labelStyle}>Min. Working Hours</label>
                                            <div style={{ fontSize: '0.95rem', fontWeight: '600' }}>{user?.workingSchedule?.minHours} Hours/Day</div>
                                        </div>
                                        <div>
                                            <label style={labelStyle}>Weekly Offs</label>
                                            <div style={{ fontSize: '0.95rem', fontWeight: '600' }}>{user?.workingSchedule?.weekOffs?.join(', ') || 'Sunday'}</div>
                                        </div>
                                        <div>
                                            <label style={labelStyle}>Salary Type</label>
                                            <div style={{ fontSize: '0.95rem', fontWeight: '600', color: '#10b981' }}>{user?.salaryDetails?.type || 'Fixed'}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div >
                </>
            );
        }

        if (activeSidebar === 'My Team') {
            return (
                <>
                    <div className="sub-nav"><div className="sub-nav-item active">TEAM MEMBERS</div></div>
                    <div className="page-content">
                        <div className="grid" style={{ gridTemplateColumns: '1fr 300px', gap: '2rem' }}>
                            <div className="panel">
                                <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span>Team: {user?.department || 'My Department'}</span>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{teammates.length} Members</span>
                                </div>
                                <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                                    {teammates.map(t => (
                                        <div
                                            key={t._id}
                                            className="panel"
                                            style={{
                                                padding: '1.25rem',
                                                cursor: 'pointer',
                                                transition: 'transform 0.2s',
                                                border: '1px solid var(--border-dark)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '1rem'
                                            }}
                                            onClick={() => setShowPublicProfile(t)}
                                        >
                                            <div className="avatar" style={{ width: '48px', height: '48px', background: 'var(--primary)', color: 'white' }}>
                                                {t.name.substring(0, 1).toUpperCase()}
                                            </div>
                                            <div style={{ overflow: 'hidden' }}>
                                                <div style={{ fontWeight: '600', fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.name}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.designation}</div>
                                            </div>
                                        </div>
                                    ))}
                                    {teammates.length === 0 && (
                                        <div style={{ gridColumn: 'span 12', textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                                            No other teammates found in your department.
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div>
                                <div className="panel" style={{ marginBottom: '1rem' }}>
                                    <div className="panel-header">Team Stats ({statsPeriod})</div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1rem 0' }}>
                                        <div>
                                            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>AVG HRS / DAY</div>
                                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{Math.floor(teamStats.avgHours)}h {Math.round((teamStats.avgHours % 1) * 60)}m</div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>ON TIME ARRIVAL</div>
                                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>{teamStats.onTimePercentage}%</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="panel">
                                    <div className="panel-header">Team calendar</div>
                                    <div style={{ transform: 'scale(0.8)', transformOrigin: 'top left' }}>
                                        {renderCalendarGrid()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            );
        }

        if (activeSidebar === 'Organization Tree') {
            if (user?.role === 'Admin' || user?.role === 'Super Admin') {
                return (
                    <div className="page-content" style={{ height: 'calc(100vh - 64px)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
                            <h2 style={{ color: 'var(--text-main)', margin: 0 }}>Organization Hierarchy</h2>
                        </div>
                        <div style={{ flex: 1, height: 'calc(100% - 3rem)' }}>
                            <OrganizationTree />
                        </div>
                    </div>
                );
            } else {
                return (
                    <div className="page-content">
                        <div className="panel" style={{ textAlign: 'center', padding: '3rem' }}>
                            <h3 style={{ color: 'var(--text-main)' }}>Access Denied</h3>
                            <p style={{ color: 'var(--text-muted)' }}>You do not have permission to view the organization tree.</p>
                        </div>
                    </div>
                );
            }
        }

        if (activeSidebar === 'My Finances') {
            const isSuper = user?.role === 'Super Admin';
            return (
                <>
                    <div className="sub-nav">
                        <div className={`sub-nav-item ${activeSubTab === 'Leave' ? 'active' : ''}`} onClick={() => setActiveSubTab('Leave')}>PAYSLIPS</div>
                        <div className="sub-nav-item">TAX DECLARATIONS</div>
                        <div className="sub-nav-item">BANK INFO</div>
                        {isSuper && <div className={`sub-nav-item ${activeSubTab === 'Global' ? 'active' : ''}`} onClick={() => setActiveSubTab('Global')}>GLOBAL VIEW</div>}
                    </div>
                    <div className="page-content">
                        {activeSubTab === 'Global' && isSuper ? (
                            <div className="panel">
                                <div className="panel-header">Global Payroll Management (Super Admin)</div>
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>EMPLOYEE</th>
                                            <th>MONTH/YEAR</th>
                                            <th>NET PAY</th>
                                            <th>STATUS</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {globalPayslips.map(p => (
                                            <tr key={p._id}>
                                                <td>{p.user?.name}</td>
                                                <td>{p.month}/{p.year}</td>
                                                <td style={{ color: 'var(--success)', fontWeight: '600' }}>${p.netPay}</td>
                                                <td>Paid</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="grid" style={{ gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '2rem' }}>
                                <div className="panel">
                                    <div className="panel-header">Recent Payslips</div>
                                    <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        {payslips.map((p, idx) => (
                                            <li key={p._id} style={{ background: idx === 0 ? 'rgba(var(--primary-rgb, 155, 89, 182), 0.1)' : 'transparent', padding: '1rem', borderRadius: '4px', cursor: 'pointer', borderLeft: idx === 0 ? '3px solid var(--primary)' : 'none' }}>
                                                <div style={{ fontWeight: '500' }}>{p.month} {p.year}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Generated on {new Date(p.createdAt).toLocaleDateString()}</div>
                                            </li>
                                        ))}
                                        {payslips.length === 0 && <div style={{ color: 'var(--text-muted)', padding: '1rem' }}>No payslips available.</div>}
                                    </ul>
                                </div>

                                <div className="panel">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                        <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Payslip Detail</h2>
                                        <button className="btn btn-primary">Download PDF</button>
                                    </div>

                                    {payslips.length > 0 ? (
                                        <>
                                            <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '1px solid var(--border-dark)' }}>
                                                <div>
                                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>EARNINGS</div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.9rem' }}><span>Basic Salary</span><span>${payslips[0].earnings.basicSalary}</span></div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.9rem' }}><span>HRA</span><span>${payslips[0].earnings.hra}</span></div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.9rem', color: 'var(--primary)' }}><span>Bonus</span><span>${payslips[0].earnings.bonus}</span></div>
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>DEDUCTIONS</div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.9rem' }}><span>PF</span><span>${payslips[0].deductions.pf}</span></div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.9rem' }}><span>Tax</span><span>${payslips[0].deductions.tax}</span></div>
                                                </div>
                                            </div>

                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
                                                <span style={{ fontSize: '1.1rem', fontWeight: '500' }}>Net Payout (Take Home)</span>
                                                <span style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'var(--success)' }}>
                                                    ${payslips[0].netPay}
                                                </span>
                                            </div>
                                        </>
                                    ) : (
                                        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>Select a payslip to view details.</div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )
        }


        if (activeSidebar === 'Org') {
            const isAdminOrSuper = user?.role === 'Admin' || user?.role === 'Super Admin';
            const isSuper = user?.role === 'Super Admin';
            const pagedUsers = allUsers.filter(u => u.isApproved);
            const pendingUsers = allUsers.filter(u => !u.isApproved);

            return (
                <div className="page-content">
                    {isAdminOrSuper ? (
                        <>
                            <div className="sub-nav" style={{ marginTop: '-1.5rem', marginBottom: '1.5rem' }}>
                                <div className={`sub-nav-item ${activeSubTab === 'Leave' ? 'active' : ''}`} onClick={() => setActiveSubTab('Leave')}>USERS</div>
                                <div className={`sub-nav-item ${activeSubTab === 'Approvals' ? 'active' : ''}`} onClick={() => setActiveSubTab('Approvals')}>APPROVALS ({pendingUsers.length})</div>
                                <div className={`sub-nav-item ${activeSubTab === 'Configs' ? 'active' : ''}`} onClick={() => setActiveSubTab('Configs')}>ORG CONFIGS</div>
                                <div className={`sub-nav-item ${activeSubTab === 'Settings' ? 'active' : ''}`} onClick={() => setActiveSubTab('Settings')}>SYSTEM SETTINGS</div>
                            </div>

                            {activeSubTab === 'Settings' && (
                                <div className="panel" style={{ maxWidth: '600px' }}>
                                    <div className="panel-header">Company Settings</div>
                                    <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Company Name</label>
                                            <input type="text" value={systemSettings.companyName || ''} onChange={e => setSystemSettings({ ...systemSettings, companyName: e.target.value })} style={inputStyle} />
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Working Hours / Day</label>
                                            <input type="number" value={systemSettings.workingHoursPerDay || ''} onChange={e => setSystemSettings({ ...systemSettings, workingHoursPerDay: e.target.value })} style={{ ...inputStyle, width: '100px' }} />
                                        </div>

                                        <div style={{ borderTop: '1px solid var(--border-dark)', marginTop: '0.5rem', paddingTop: '1rem' }}>
                                            <div style={{ fontSize: '0.85rem', fontWeight: '500', marginBottom: '1rem' }}>Default Leave Quotas (Apply to All Users)</div>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                                {[
                                                    { label: 'Paid Leave', key: 'paid' },
                                                    { label: 'Sick Leave', key: 'sick' },
                                                    { label: 'Casual Leave', key: 'casual' },
                                                    { label: 'Comp Off', key: 'compOff' }
                                                ].map(q => (
                                                    <div key={q.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{q.label}</label>
                                                        <input
                                                            type="number"
                                                            value={systemSettings.defaultLeaveQuotas?.[q.key] ?? 0}
                                                            onChange={e => setSystemSettings({
                                                                ...systemSettings,
                                                                defaultLeaveQuotas: { ...systemSettings.defaultLeaveQuotas, [q.key]: parseInt(e.target.value) || 0 }
                                                            })}
                                                            style={{ ...inputStyle, width: '60px' }}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <button className="btn btn-primary" onClick={handleSaveSettings} style={{ marginTop: '1rem' }}>Save Settings</button>
                                    </div>
                                </div>
                            )}

                            {activeSubTab === 'Leave' && (
                                <div className="panel">
                                    <div className="panel-header">Active Employees</div>
                                    <table className="data-table">
                                        <thead>
                                            <tr><th>NAME</th><th>EMAIL</th><th>DESIGNATION</th><th>DEPT</th><th>ROLE</th><th>ACTIONS</th></tr>
                                        </thead>
                                        <tbody>
                                            {pagedUsers.map(u => (
                                                <tr key={u._id}>
                                                    <td>{u.name}</td><td>{u.email}</td><td>{u.designation}</td><td>{u.department}</td>
                                                    <td><span className={`badge ${u.role.replace(' ', '-').toLowerCase()}`}>{u.role}</span></td>
                                                    <td>
                                                        <button className="btn btn-sm" style={{ background: 'var(--bg-main)', border: '1px solid var(--border-dark)' }} onClick={() => { setSelectedUser(u); setShowEditModal(true); }}>Edit</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {activeSubTab === 'Approvals' && (
                                <div className="panel">
                                    <div className="panel-header">Pending Approval Requests</div>
                                    {pendingUsers.length > 0 ? (
                                        <table className="data-table">
                                            <thead>
                                                <tr><th>NAME</th><th>EMAIL</th><th>DESIGNATION</th><th>DEPT</th><th>PHONE</th><th>ACTIONS</th></tr>
                                            </thead>
                                            <tbody>
                                                {pendingUsers.map(u => (
                                                    <tr key={u._id}>
                                                        <td>{u.name}</td><td>{u.email}</td><td>{u.designation}</td><td>{u.department}</td><td>{u.phoneNumber}</td>
                                                        <td>
                                                            <button className="btn btn-sm btn-primary" onClick={() => handleApproveUser(u._id)}>Approve</button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    ) : <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No pending requests.</div>}
                                </div>
                            )}

                            {activeSubTab === 'Configs' && (
                                <div className="grid" style={{ gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
                                    <div className="panel">
                                        <div className="panel-header">Add New Config</div>
                                        <form onSubmit={handleAddConfig} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                            <select value={newConfig.type} onChange={e => setNewConfig({ ...newConfig, type: e.target.value })} style={inputStyle}>
                                                <option value="Department">Department</option>
                                                <option value="Designation">Designation</option>
                                                <option value="Holiday">Holiday</option>
                                            </select>
                                            <input required type="text" placeholder="Name / Title" value={newConfig.name} onChange={e => setNewConfig({ ...newConfig, name: e.target.value })} style={inputStyle} />
                                            {newConfig.type === 'Holiday' && (
                                                <input required type="date" value={newConfig.date} onChange={e => setNewConfig({ ...newConfig, date: e.target.value })} style={inputStyle} />
                                            )}
                                            <button type="submit" className="btn btn-primary">Add Config</button>
                                        </form>
                                    </div>
                                    <div className="panel">
                                        <div className="panel-header">Existing Configurations</div>
                                        <table className="data-table">
                                            <thead><tr><th>TYPE</th><th>NAME</th><th>DATE</th><th>ACTIONS</th></tr></thead>
                                            <tbody>
                                                {orgConfigs.map(c => (
                                                    <tr key={c._id}>
                                                        <td>{c.type}</td><td>{c.name}</td><td>{c.date ? new Date(c.date).toLocaleDateString() : '-'}</td>
                                                        <td><button className="btn btn-sm btn-danger" onClick={() => handleDeleteConfig(c._id)}>Delete</button></td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {showEditModal && selectedUser && (
                                <div style={modalOverlay}>
                                    <div style={modalContent}>
                                        <div className="panel-header" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between' }}>
                                            <span>Edit User: {selectedUser.name}</span>
                                            <span style={{ cursor: 'pointer' }} onClick={() => setShowEditModal(false)}>✕</span>
                                        </div>
                                        <form onSubmit={handleUpdateUser} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                                            <div><label style={labelStyle}>Role</label><select value={selectedUser.role} onChange={e => setSelectedUser({ ...selectedUser, role: e.target.value })} style={inputStyle}><option value="Employee">Employee</option><option value="Admin">Admin</option><option value="Super Admin">Super Admin</option></select></div>
                                            <div><label style={labelStyle}>Status</label><select value={selectedUser.isActive} onChange={e => setSelectedUser({ ...selectedUser, isActive: e.target.value === 'true' })} style={inputStyle}><option value="true">Active</option><option value="false">Inactive</option></select></div>

                                            <div style={{ gridColumn: 'span 2' }}>
                                                <h4 style={{ color: 'var(--primary)', borderBottom: '1px solid var(--border-dark)', paddingBottom: '0.5rem', marginTop: '0.5rem', fontSize: '0.9rem' }}>Work Schedule</h4>
                                            </div>
                                            <div><label style={labelStyle}>Shift Start (HH:mm)</label><input type="text" value={selectedUser.workingSchedule?.shiftStart || '11:00'} onChange={e => setSelectedUser({ ...selectedUser, workingSchedule: { ...selectedUser.workingSchedule, shiftStart: e.target.value } })} style={inputStyle} /></div>
                                            <div><label style={labelStyle}>Shift End (HH:mm)</label><input type="text" value={selectedUser.workingSchedule?.shiftEnd || '18:00'} onChange={e => setSelectedUser({ ...selectedUser, workingSchedule: { ...selectedUser.workingSchedule, shiftEnd: e.target.value } })} style={inputStyle} /></div>
                                            <div><label style={labelStyle}>Min Hours/Day</label><input type="number" value={selectedUser.workingSchedule?.minHours || 7} onChange={e => setSelectedUser({ ...selectedUser, workingSchedule: { ...selectedUser.workingSchedule, minHours: Number(e.target.value) } })} style={inputStyle} /></div>
                                            <div><label style={labelStyle}>Week Offs (Comma sep.)</label><input type="text" value={selectedUser.workingSchedule?.weekOffs?.join(',') || 'Sunday'} onChange={e => setSelectedUser({ ...selectedUser, workingSchedule: { ...selectedUser.workingSchedule, weekOffs: e.target.value.split(',') } })} style={inputStyle} /></div>

                                            <div style={{ gridColumn: 'span 2' }}>
                                                <h4 style={{ color: 'var(--primary)', borderBottom: '1px solid var(--border-dark)', paddingBottom: '0.5rem', marginTop: '0.5rem', fontSize: '0.9rem' }}>Leave Quotas</h4>
                                            </div>
                                            <div><label style={labelStyle}>Paid Leaves</label><input type="number" value={selectedUser.leaveQuotas?.paid || 12} onChange={e => setSelectedUser({ ...selectedUser, leaveQuotas: { ...selectedUser.leaveQuotas, paid: Number(e.target.value) } })} style={inputStyle} /></div>
                                            <div><label style={labelStyle}>Sick Leaves</label><input type="number" value={selectedUser.leaveQuotas?.sick || 6} onChange={e => setSelectedUser({ ...selectedUser, leaveQuotas: { ...selectedUser.leaveQuotas, sick: Number(e.target.value) } })} style={inputStyle} /></div>
                                            <div><label style={labelStyle}>Casual Leaves</label><input type="number" value={selectedUser.leaveQuotas?.casual || 0} onChange={e => setSelectedUser({ ...selectedUser, leaveQuotas: { ...selectedUser.leaveQuotas, casual: Number(e.target.value) } })} style={inputStyle} /></div>
                                            <div><label style={labelStyle}>Comp Offs</label><input type="number" value={selectedUser.leaveQuotas?.compOff || 0} onChange={e => setSelectedUser({ ...selectedUser, leaveQuotas: { ...selectedUser.leaveQuotas, compOff: Number(e.target.value) } })} style={inputStyle} /></div>

                                            <div style={{ gridColumn: 'span 2' }}>
                                                <h4 style={{ color: 'var(--primary)', borderBottom: '1px solid var(--border-dark)', paddingBottom: '0.5rem', marginTop: '0.5rem', fontSize: '0.9rem' }}>Finances & Salary</h4>
                                            </div>
                                            <div><label style={labelStyle}>Salary Type</label><select value={selectedUser.salaryDetails?.type || 'Fixed'} onChange={e => setSelectedUser({ ...selectedUser, salaryDetails: { ...selectedUser.salaryDetails, type: e.target.value } })} style={inputStyle}><option value="Fixed">Fixed</option><option value="Variable">Variable</option></select></div>
                                            <div><label style={labelStyle}>Monthly Amount</label><input type="number" value={selectedUser.salaryDetails?.monthlyAmount || 0} onChange={e => setSelectedUser({ ...selectedUser, salaryDetails: { ...selectedUser.salaryDetails, monthlyAmount: Number(e.target.value) } })} style={inputStyle} /></div>

                                            <div style={{ gridColumn: 'span 2', marginTop: '1rem' }}>
                                                <button className="btn btn-primary" type="submit">Update User Profile</button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            )}

                            {showAnnouncementModal && (
                                <div style={modalOverlay}>
                                    <div style={modalContent}>
                                        <div className="panel-header" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between' }}>
                                            <span>Add New Announcement</span>
                                            <span style={{ cursor: 'pointer' }} onClick={() => setShowAnnouncementModal(false)}>✕</span>
                                        </div>
                                        <form onSubmit={handleCreateAnnouncement} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                            <div><label style={labelStyle}>Title</label><input type="text" value={newAnnouncement.title} onChange={e => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })} style={inputStyle} placeholder="Important Update" required /></div>
                                            <div><label style={labelStyle}>Content</label><textarea value={newAnnouncement.content} onChange={e => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })} style={{ ...inputStyle, height: '100px', resize: 'vertical' }} placeholder="Detail your announcement here..." required /></div>
                                            <div>
                                                <label style={labelStyle}>Priority</label>
                                                <select value={newAnnouncement.priority} onChange={e => setNewAnnouncement({ ...newAnnouncement, priority: e.target.value })} style={inputStyle}>
                                                    <option value="Low">Low</option>
                                                    <option value="Medium">Medium</option>
                                                    <option value="High">High</option>
                                                </select>
                                            </div>
                                            <div style={{ marginTop: '1rem' }}><button className="btn btn-primary" type="submit" style={{ width: '100%' }}>Create Announcement</button></div>
                                        </form>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div style={{ textAlign: 'center', paddingTop: '6rem', color: 'var(--text-muted)' }}>
                            <Building2 size={64} style={{ margin: '0 auto 1.5rem', opacity: 0.2 }} />
                            <h2 style={{ color: 'var(--text-main)' }}>Org Module</h2>
                            <p style={{ marginTop: '0.5rem', maxWidth: '400px', margin: '0.5rem auto' }}>Your organizational info is managed by Admin.</p>
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

    const renderAlertModal = () => {
        if (!customAlert) return null;
        return (
            <div style={modalOverlay}>
                <div style={{ ...modalContent, maxWidth: '450px', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--text-main)' }}>
                        {customAlert.type === 'confirm' ? 'Confirmation' : 'Update'}
                    </div>
                    <div style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '2rem', whiteSpace: 'pre-line' }}>
                        {customAlert.message}
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        {customAlert.type === 'confirm' ? (
                            <>
                                <button className="btn btn-secondary" style={{ padding: '0.6rem 2rem' }} onClick={() => setCustomAlert(null)}>Cancel</button>
                                <button className="btn btn-primary" style={{ padding: '0.6rem 2rem' }} onClick={() => { customAlert.onConfirm(); setCustomAlert(null); }}>Confirm</button>
                            </>
                        ) : (
                            <button className="btn btn-primary" style={{ padding: '0.6rem 2rem' }} onClick={() => setCustomAlert(null)}>Okay</button>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const renderLogInfoModal = () => {
        if (!showLogInfo) return null;
        const formatTime = (dateStr) => {
            if (!dateStr) return 'Not available';
            return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        };
        return (
            <div style={modalOverlay}>
                <div style={{ ...modalContent, maxWidth: '400px' }}>
                    <div className="panel-header" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '1.1rem', fontWeight: '600' }}>Attendance Log Details</span>
                        <span style={{ cursor: 'pointer', fontSize: '1.25rem' }} onClick={() => setShowLogInfo(null)}>✕</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div style={{ padding: '1rem', background: 'var(--bg-main)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-dark)' }}>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Date</div>
                            <div style={{ fontWeight: '600' }}>{new Date(showLogInfo.date).toDateString()}</div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div style={{ padding: '1rem', background: 'var(--bg-main)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-dark)' }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Clock In</div>
                                <div style={{ fontWeight: '600', color: '#27ae60' }}>{formatTime(showLogInfo.clockInTime)}</div>
                            </div>
                            <div style={{ padding: '1rem', background: 'var(--bg-main)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-dark)' }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Clock Out</div>
                                <div style={{ fontWeight: '600', color: '#e74c3c' }}>{showLogInfo.clockOutTime ? formatTime(showLogInfo.clockOutTime) : 'Session Active'}</div>
                            </div>
                        </div>
                        <div style={{ padding: '1rem', background: 'var(--bg-main)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-dark)' }}>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Working Mode / Status</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span className={`badge ${showLogInfo.workingMode?.toLowerCase() === 'remote' ? 'wfh' : 'on-site'}`} style={{ fontSize: '0.7rem' }}>
                                    {showLogInfo.workingMode || 'On-site'}
                                </span>
                                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>•</span>
                                <span style={{ fontSize: '0.85rem' }}>{showLogInfo.status || 'Active'}</span>
                            </div>
                        </div>
                    </div>
                    <div style={{ marginTop: '2rem' }}>
                        <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => setShowLogInfo(null)}>Close</button>
                    </div>
                </div>
            </div>
        );
    };

    const renderHolidayModal = () => {
        return (
            <div style={modalOverlay}>
                <div style={{ ...modalContent, maxWidth: '500px' }}>
                    <div className="panel-header" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '1.25rem' }}>Upcoming Holidays</span>
                        <span style={{ cursor: 'pointer', fontSize: '1.5rem' }} onClick={() => setShowHolidayModal(false)}>✕</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '400px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                        {dashData.holidays.length > 0 ? dashData.holidays.map((h, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--bg-main)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-dark)' }}>
                                <div>
                                    <div style={{ fontWeight: '600', color: 'var(--primary)', fontSize: '1rem' }}>{h.name}</div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                                        {new Date(h.date).toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                    </div>
                                </div>
                                <div style={{ background: 'rgba(155, 89, 182, 0.1)', color: 'var(--primary)', padding: '0.4rem 0.8rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                                    {Math.ceil((new Date(h.date) - new Date()) / (1000 * 60 * 60 * 24))} Days left
                                </div>
                            </div>
                        )) : (
                            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No upcoming holidays</div>
                        )}
                    </div>
                    <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                        <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => setShowHolidayModal(false)}>Close</button>
                    </div>
                </div>
            </div>
        );
    };

    const renderPublicProfileModal = () => {
        if (!showPublicProfile) return null;
        const u = showPublicProfile;
        return (
            <div style={modalOverlay}>
                <div style={{ ...modalContent, maxWidth: '600px' }}>
                    <div className="panel-header" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between' }}>
                        <span>Public Profile</span>
                        <span style={{ cursor: 'pointer' }} onClick={() => setShowPublicProfile(null)}>✕</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
                        <div className="avatar" style={{ width: '80px', height: '80px', fontSize: '2rem', background: 'var(--primary)', color: 'white' }}>{u.name?.substring(0, 1).toUpperCase()}</div>
                        <div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: 'var(--text-main)' }}>{u.name}</h2>
                            <p style={{ color: 'var(--text-muted)' }}>{u.designation} | {u.department}</p>
                        </div>
                    </div>
                    <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div><label style={labelStyle}>Email</label><div style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>{u.email}</div></div>
                        <div><label style={labelStyle}>Department</label><div style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>{u.department}</div></div>
                        <div><label style={labelStyle}>Joining Date</label><div style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>{u.joiningDate ? new Date(u.joiningDate).toLocaleDateString() : 'N/A'}</div></div>
                        <div><label style={labelStyle}>Employee ID</label><div style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>KEKA-{u._id?.substring(u._id.length - 6).toUpperCase() || 'ID'}</div></div>
                    </div>
                    {u.welcomeProfile?.about && (
                        <div style={{ marginTop: '1.5rem' }}>
                            <label style={labelStyle}>About</label>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>{u.welcomeProfile.about}</div>
                        </div>
                    )}
                    <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
                        <button className="btn btn-secondary" onClick={() => setShowPublicProfile(null)}>Close</button>
                    </div>
                </div>
            </div>
        );
    };

    const renderAnnouncementModal = () => {
        if (!showAnnouncementModal) return null;
        return (
            <div style={modalOverlay}>
                <div style={modalContent}>
                    <div className="panel-header" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between' }}>
                        <span>Create Announcement</span>
                        <span style={{ cursor: 'pointer' }} onClick={() => setShowAnnouncementModal(false)}>✕</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <label style={labelStyle}>Title</label>
                            <input
                                type="text"
                                value={newAnnouncement.title}
                                onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                                style={inputStyle}
                                placeholder="E.g., Company Townhall"
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>Content</label>
                            <textarea
                                value={newAnnouncement.content}
                                onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                                style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }}
                                placeholder="Details of the announcement..."
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>Priority</label>
                            <select
                                value={newAnnouncement.priority}
                                onChange={(e) => setNewAnnouncement({ ...newAnnouncement, priority: e.target.value })}
                                style={inputStyle}
                            >
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                            </select>
                        </div>
                    </div>
                    <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                        <button className="btn btn-secondary" onClick={() => setShowAnnouncementModal(false)}>Cancel</button>
                        <button
                            className="btn btn-primary"
                            onClick={async () => {
                                if (!newAnnouncement.title || !newAnnouncement.content) {
                                    showAlert('Please fill all required fields.', 'error');
                                    return;
                                }
                                try {
                                    await api.post('/dashboard/announcements', newAnnouncement);
                                    showAlert('Announcement posted!', 'info');
                                    setShowAnnouncementModal(false);
                                    setNewAnnouncement({ title: '', content: '', priority: 'Low' });
                                    fetchPublicData();
                                } catch (err) {
                                    showAlert('Failed to post announcement.', 'error');
                                }
                            }}
                        >
                            Post Announcement
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="dashboard-layout">
            <aside className="sidebar">
                <div className="sidebar-brand">
                    <span style={{ color: 'var(--primary)' }}>TP</span>&nbsp; Interns
                </div>
                <nav className="sidebar-nav">
                    {sidebarItems.filter(item => item.name !== 'My Team' || teammates.length > 0).map(item => (
                        <div
                            key={item.name}
                            className={`nav-item ${activeSidebar === item.name ? 'active' : ''}`}
                            onClick={() => {
                                setActiveSidebar(item.name);
                                if (item.name === 'Me') setActiveSubTab('Attendance');
                                if (item.name === 'My Team') setActiveSubTab('TEAM MEMBERS');
                            }}
                        >
                            {item.icon}
                            <span className="nav-text">{item.name}</span>
                        </div>
                    ))}
                </nav>
            </aside>

            <main className="main-content">
                <header className="topbar">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: '500', color: 'var(--text-topbar)' }}>{systemSettings?.companyName || 'Teaching Pariksha'}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-topbar)', opacity: 0.8, borderLeft: '1px solid rgba(255, 255, 255, 0.3)', paddingLeft: '1.5rem' }}>
                            {new Date().toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                    </div>
                    <div className="topbar-actions" style={{ position: 'relative' }}>
                        <button
                            onClick={toggleTheme}
                            style={{ background: 'transparent', border: 'none', color: 'var(--text-topbar)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                            title={`Switch to ${isLightMode ? 'Dark' : 'Light'} Mode`}
                        >
                            {isLightMode ? <Moon size={20} /> : <Sun size={20} />}
                        </button>

                        <Bell size={20} style={{ cursor: 'pointer', color: 'var(--text-topbar)' }} />
                        <div
                            className="avatar"
                            style={{ cursor: 'pointer', background: '#10b981' }}
                            onClick={() => setShowProfileMenu(!showProfileMenu)}
                        >
                            {user?.name?.substring(0, 2).toUpperCase() || 'ME'}
                        </div>

                        {showProfileMenu && (
                            <div className="panel" style={{
                                position: 'absolute',
                                top: '100%',
                                right: '0',
                                marginTop: '0.5rem',
                                minWidth: '180px',
                                zIndex: 100,
                                padding: '0.5rem 0',
                                boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
                                border: '1px solid var(--border-dark)'
                            }}>
                                <div
                                    style={{ padding: '0.75rem 1.25rem', borderBottom: '1px solid var(--border-dark)' }}
                                >
                                    <div style={{ fontWeight: '600', color: 'var(--text-main)', fontSize: '0.85rem' }}>{user?.name}</div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{user?.role}</div>
                                </div>
                                <div
                                    className="dropdown-item"
                                    onClick={() => { setActiveSidebar('Me'); setActiveSubTab('Profile'); setShowProfileMenu(false); }}
                                >
                                    My Profile
                                </div>
                                <div
                                    className="dropdown-item danger"
                                    style={{ color: '#ef4444' }}
                                    onClick={handleLogout}
                                >
                                    Log Out
                                </div>
                            </div>
                        )}
                    </div>
                </header>
                <div className="dashboard-content">
                    {renderContent()}
                </div>
            </main>
            {showHolidayModal && renderHolidayModal()}
            {showLogInfo && renderLogInfoModal()}
            {renderAlertModal()}
            {renderPublicProfileModal()}
            {renderAnnouncementModal()}
            {renderAnnouncementModal()}

            {showClockInModal && (
                <div style={modalOverlay}>
                    <div style={{ ...modalContent, maxWidth: '400px' }}>
                        <div className="panel-header" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between' }}>
                            <span>Clock In - Select Mode</span>
                            <span style={{ cursor: 'pointer' }} onClick={() => setShowClockInModal(false)}>✕</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div
                                onClick={() => setSelectedWorkingMode('On-site')}
                                style={{
                                    padding: '1rem',
                                    border: `1px solid ${selectedWorkingMode === 'On-site' ? 'var(--primary)' : 'var(--border-dark)'}`,
                                    borderRadius: 'var(--radius-md)',
                                    cursor: 'pointer',
                                    background: selectedWorkingMode === 'On-site' ? 'rgba(var(--primary-rgb), 0.1)' : 'transparent'
                                }}
                            >
                                <div style={{ fontWeight: '500' }}>Working On-Site</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Working from the office location.</div>
                            </div>
                            <div
                                onClick={() => setSelectedWorkingMode('Remote')}
                                style={{
                                    padding: '1rem',
                                    border: `1px solid ${selectedWorkingMode === 'Remote' ? 'var(--primary)' : 'var(--border-dark)'}`,
                                    borderRadius: 'var(--radius-md)',
                                    cursor: 'pointer',
                                    background: selectedWorkingMode === 'Remote' ? 'rgba(var(--primary-rgb), 0.1)' : 'transparent'
                                }}
                            >
                                <div style={{ fontWeight: '500' }}>Working Remotely</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Working from home or another location.</div>
                            </div>
                            <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={confirmClockIn}>
                                Confirm Clock In
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const inputStyle = { background: 'var(--bg-panel)', color: 'var(--text-main)', border: '1px solid var(--border-dark)', padding: '0.5rem', borderRadius: '4px', outline: 'none', width: '100%', boxSizing: 'border-box' };
const labelStyle = { fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.3rem', display: 'block' };
const modalOverlay = { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' };
const modalContent = { background: 'var(--bg-panel)', padding: '2rem', borderRadius: 'var(--radius-lg)', width: '90%', maxWidth: '700px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', border: '1px solid var(--border-dark)' };
