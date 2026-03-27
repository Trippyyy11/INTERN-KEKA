import { useState, useEffect, useMemo, useRef } from 'react';
import api from '../api/axios';
import {
    Home,
    Bell,
    User,
    Users,
    Mail,
    Briefcase,
    Building2,
    Award,
    Settings,
    MoreVertical,
    Info,
    Moon,
    Sun,
    Clock,
    Calendar,
    ChevronDown,
    FileText,
    Send,
    HelpCircle,
    X,
    Search,
    Plus,
    Trash2,
    Edit,
    Check,
    LogOut,
    Menu,
    MessageSquare
} from 'lucide-react';

import VantaBackground from './layout/VantaBackground';
import Sidebar from './layout/Sidebar';
import HomeTab from './dashboard-tabs/HomeTab';
import AttendanceTab from './dashboard-tabs/AttendanceTab';
import LeaveTab from './dashboard-tabs/LeaveTab';
import RequestTab from './dashboard-tabs/RequestTab';
import ProfileTab from './dashboard-tabs/ProfileTab';
import MyTeamTab from './dashboard-tabs/MyTeamTab';
import FinancesTab from './dashboard-tabs/FinancesTab';
import InboxTab from './dashboard-tabs/InboxTab';
import AdminTab from './dashboard-tabs/AdminTab';
import EngageTab from './dashboard-tabs/EngageTab';
import SlackTab from './dashboard-tabs/SlackTab';
import OrganizationTree from './OrganizationTree';

export default function Dashboard({ user, onLogout, setUser }) {
    // Persistence helper
    const getSavedState = (key, defaultVal) => {
        const saved = localStorage.getItem(key);
        return saved !== null ? saved : defaultVal;
    };

    const [activeSidebar, setActiveSidebar] = useState(getSavedState('activeSidebar', 'Home'));
    const [activeSubTab, setActiveSubTab] = useState(getSavedState('activeSubTab', 'Attendance'));

    // Check initial theme preference
    const getInitialTheme = () => {
        const saved = localStorage.getItem('theme');
        if (saved) return saved === 'light';
        return window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
    };
    const [isLightMode, setIsLightMode] = useState(getInitialTheme());
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const profileDropdownRef = useRef(null);
    const notificationRef = useRef(null);
    const vantaRef = useRef(null);
    const [vantaEffect, setVantaEffect] = useState(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!document.contains(event.target)) return; // Prevent closing if target was unmounted (e.g. clicking "Clear All")
            
            if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
                setShowProfileMenu(false);
            }
            if (notificationRef.current && !notificationRef.current.contains(event.target) && !event.target.closest('#notification-panel')) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Fetch notifications
    const fetchNotifications = async () => {
        try {
            const res = await api.get('/notifications');
            setNotifications(res.data.notifications);
            setUnreadCount(res.data.unreadCount);
        } catch (err) { console.error('Failed to fetch notifications'); }
    };

    const markAllNotificationsRead = async () => {
        try {
            await api.put('/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (err) { console.error('Failed to mark notifications read'); }
    };

    const deleteNotificationById = async (id) => {
        try {
            await api.delete(`/notifications/${id}`);
            setNotifications(prev => prev.filter(n => n._id !== id));
            setUnreadCount(prev => {
                const wasUnread = notifications.find(n => n._id === id && !n.isRead);
                return wasUnread ? Math.max(0, prev - 1) : prev;
            });
        } catch (err) { console.error('Failed to delete notification'); }
    };

    const deleteAllNotifications = async () => {
        try {
            await api.delete('/notifications/all');
            setNotifications([]);
            setUnreadCount(0);
        } catch (err) { console.error('Failed to delete all notifications'); }
    };

    const markNotificationRead = async (id) => {
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) { console.error('Failed to mark notification read'); }
    };

    // Check clock-in reminder and fetch notifications on load and periodically
    useEffect(() => {
        fetchNotifications();
        api.get('/notifications/check-clockin').catch(() => { });
        const interval = setInterval(() => {
            fetchNotifications();
            api.get('/notifications/check-clockin').catch(() => { });
        }, 60000); // Check every minute
        return () => clearInterval(interval);
    }, []);

    // Home states
    const [homeTab, setHomeTab] = useState(getSavedState('homeTab', 'Activities'));
    const [homeSubTab, setHomeSubTab] = useState(getSavedState('homeSubTab', 'Dashboard'));
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
    const [attendancePeriod, setAttendancePeriod] = useState('30 DAYS');
    const [currentCalendarMonth, setCurrentCalendarMonth] = useState(new Date().getMonth());
    const [currentCalendarYear, setCurrentCalendarYear] = useState(new Date().getFullYear());
    const [myLeaves, setMyLeaves] = useState([]);

    // Request states
    const [requestType, setRequestType] = useState('');
    const [requestLeaveType, setRequestLeaveType] = useState('');
    const [requestStartDate, setRequestStartDate] = useState('');
    const [requestEndDate, setRequestEndDate] = useState('');
    const [requestMessage, setRequestMessage] = useState('');
    const [requestRecipients, setRequestRecipients] = useState([]);
    const [recipientSearch, setRecipientSearch] = useState('');
    const [recipientSuggestions, setRecipientSuggestions] = useState([]);
    const [myRequests, setMyRequests] = useState([]);
    const [inboxRequests, setInboxRequests] = useState([]);
    const [requestActionNote, setRequestActionNote] = useState('');
    const [requestSubmitting, setRequestSubmitting] = useState(false);
    const [selectedLeaveForCancel, setSelectedLeaveForCancel] = useState(null);
    const [datesToCancel, setDatesToCancel] = useState([]);

    const [expandedRequests, setExpandedRequests] = useState([]);

    // Admin states
    const [allUsers, setAllUsers] = useState([]);
    const pendingUsers = useMemo(() => allUsers.filter(u => u.status === 'Pending'), [allUsers]);
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
    const [editMode, setEditMode] = useState(false);
    const [modalTab, setModalTab] = useState('Personal');
    const [activeActionMenu, setActiveActionMenu] = useState(null);

    const [dashData, setDashData] = useState({
        birthdays: { today: [], upcoming: [] },
        leaves: [],
        workingRemotely: [],
        newJoinees: [],
        announcements: [],
        holidays: []
    });

    const [engageTab, setEngageTab] = useState(getSavedState('engageTab', 'Create'));
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
    const [showAttendancePolicyModal, setShowAttendancePolicyModal] = useState(false);
    const [attendancePolicyTab, setAttendancePolicyTab] = useState('Penalisation Policy');
    const [showUserAttendanceModal, setShowUserAttendanceModal] = useState(false);
    const [userAttendanceLogs, setUserAttendanceLogs] = useState([]);

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

    useEffect(() => {
        if (vantaEffect) vantaEffect.destroy();

        if (window.VANTA && vantaRef.current) {
            setVantaEffect(window.VANTA.DOTS({
                el: vantaRef.current,
                mouseControls: true,
                touchControls: true,
                gyroControls: false,
                minHeight: 200.00,
                minWidth: 200.00,
                scale: 1.00,
                scaleMobile: 1.00,
                color: isLightMode ? 0x2563eb : 0x3b82f6, // Deeper blue for better contrast
                color2: isLightMode ? 0x3b82f6 : 0x1e293b,
                backgroundColor: isLightMode ? 0xf8fafc : 0x121212,
                size: isLightMode ? 1.50 : 1.50,
                spacing: 35.00,
                showLines: false
            }));
        }

        return () => {
            if (vantaEffect) vantaEffect.destroy();
        };
    }, [isLightMode]);

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

    // Persist navigation states
    useEffect(() => {
        localStorage.setItem('activeSidebar', activeSidebar);
    }, [activeSidebar]);

    useEffect(() => {
        localStorage.setItem('activeSubTab', activeSubTab);
    }, [activeSubTab]);

    useEffect(() => {
        localStorage.setItem('homeTab', homeTab);
    }, [homeTab]);

    useEffect(() => {
        localStorage.setItem('homeSubTab', homeSubTab);
    }, [homeSubTab]);

    useEffect(() => {
        localStorage.setItem('engageTab', engageTab);
    }, [engageTab]);

    const fetchLeaveStats = async () => {
        try {
            const res = await api.get('/leaves/stats');
            setLeaveStats(res.data);
        } catch (err) { console.error('Failed to fetch leave stats'); }
    };

    const fetchMyLeaves = async () => {
        try {
            const res = await api.get('/leaves');
            setMyLeaves(res.data);
        } catch (err) { console.error('Failed to fetch my leaves'); }
    };

    useEffect(() => {
        if (activeSidebar === 'Me' && (activeSubTab === 'Leave' || activeSubTab === 'Attendance' || activeSubTab === 'Request')) {
            fetchLeaveStats();
            fetchMyLeaves();
            fetchMyRequests();
        }
        if (activeSidebar === 'Inbox') {
            fetchInboxRequests();
        }
    }, [activeSidebar, activeSubTab]);

    const fetchMyRequests = async () => {
        try {
            const res = await api.get('/requests/my');
            setMyRequests(res.data);
        } catch (err) { console.error('Failed to fetch requests'); }
    };

    const fetchInboxRequests = async () => {
        try {
            const res = await api.get('/requests/inbox');
            setInboxRequests(res.data);
        } catch (err) { console.error('Failed to fetch inbox requests'); }
    };

    const handleRequestAction = async (requestId, status) => {
        try {
            await api.put(`/requests/${requestId}/status`, { status, actionNote: requestActionNote });
            showAlert(`Request ${status} successfully!`, 'info');
            setRequestActionNote('');
            fetchInboxRequests();
        } catch (err) {
            showAlert(err.response?.data?.message || 'Action failed', 'info');
        }
    };

    const searchRecipients = async (query) => {
        setRecipientSearch(query);
        if (query.length < 2) {
            setRecipientSuggestions([]);
            return;
        }
        try {
            const res = await api.get(`/requests/search-users?q=${query}`);
            setRecipientSuggestions(res.data.filter(u => !requestRecipients.some(r => r._id === u._id)));
        } catch (err) { console.error('Search failed'); }
    };

    const getStatusStyle = (status) => {
        const isApproved = status === 'Approved';
        const isRejected = status === 'Rejected';

        return {
            background: isApproved ? 'rgba(var(--success-rgb), 0.1)' : isRejected ? 'rgba(var(--danger-rgb), 0.1)' : 'rgba(var(--warning-rgb), 0.1)',
            color: isApproved ? 'var(--success)' : isRejected ? 'var(--danger)' : 'var(--warning)',
            border: `1px solid ${isApproved ? 'rgba(var(--success-rgb), 0.2)' : isRejected ? 'rgba(var(--danger-rgb), 0.2)' : 'rgba(var(--warning-rgb), 0.2)'}`
        };
    };




    const submitRequest = async () => {
        if (!requestType || (requestType === 'Leave Application' && !requestLeaveType) || !requestStartDate || !requestEndDate || requestRecipients.length === 0) {
            setCustomAlert({ message: 'Please fill in all required fields.', type: 'info' });
            return;
        }

        // Rule Validation: Block today and tomorrow for non-cancellation requests. Past dates allowed.
        if (requestType !== 'Leave Cancellation') {
            const start = new Date(requestStartDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            start.setHours(0, 0, 0, 0);

            const diffTime = start.getTime() - today.getTime();
            const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 0 || diffDays === 1) {
                setCustomAlert({
                    message: "Requests cannot be made for today or tomorrow. Please apply at least 2 days in advance, or submit a backdated request for urgent leaves.",
                    type: 'info'
                });
                return;
            }
        }
        setRequestSubmitting(true);
        try {
            await api.post('/requests', {
                type: requestType,
                leaveType: requestType === 'Leave Application' ? requestLeaveType : undefined,
                startDate: requestType === 'Leave Cancellation' && selectedLeaveForCancel ? selectedLeaveForCancel.startDate : requestStartDate,
                endDate: requestType === 'Leave Cancellation' && selectedLeaveForCancel ? selectedLeaveForCancel.endDate : requestEndDate,
                associatedLeave: requestType === 'Leave Cancellation' ? selectedLeaveForCancel?._id : undefined,
                cancelDates: requestType === 'Leave Cancellation' ? datesToCancel : undefined,
                message: requestMessage,
                recipients: requestRecipients.map(r => r._id)
            });
            setCustomAlert({ message: 'Request submitted successfully!', type: 'info' });
            setRequestType('');
            setRequestLeaveType('');
            setRequestStartDate('');
            setRequestEndDate('');
            setRequestMessage('');
            setRequestRecipients([]);
            setSelectedLeaveForCancel(null);
            setDatesToCancel([]);
            fetchMyRequests();
        } catch (err) {
            setCustomAlert({ message: err.response?.data?.message || 'Failed to submit request.', type: 'info' });
        } finally {
            setRequestSubmitting(false);
        }
    };

    const [isProfileEditing, setIsProfileEditing] = useState(false);
    const [tempProfile, setTempProfile] = useState({});
    const fileInputRef = useRef(null);
    const [uploadingPic, setUploadingPic] = useState(false);

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

    const handleProfilePictureUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            showAlert('Image size should be less than 5MB', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64String = reader.result;
            try {
                setUploadingPic(true);
                const res = await api.put('/auth/profile-picture', { profilePicture: base64String });
                const updatedUser = { ...user, profilePicture: res.data.profilePicture };
                setUser(updatedUser);
                localStorage.setItem('user', JSON.stringify(updatedUser));
                showAlert('Profile picture updated successfully!', 'info');
            } catch (err) {
                showAlert(err.response?.data?.message || 'Failed to update profile picture', 'error');
            } finally {
                setUploadingPic(false);
            }
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveProfilePicture = async () => {
        try {
            setUploadingPic(true);
            const res = await api.put('/auth/profile-picture', { profilePicture: '' });
            const updatedUser = { ...user, profilePicture: res.data.profilePicture };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
            showAlert('Profile picture removed!', 'info');
        } catch (err) {
            showAlert(err.response?.data?.message || 'Failed to remove profile picture', 'error');
        } finally {
            setUploadingPic(false);
        }
    };

    const toggleTheme = () => {
        setIsLightMode(!isLightMode);
    };

    const getAttendanceProgress = () => {
        if (!isClockedIn || !activeLog?.clockInTime) return 0;
        const elapsed = calculateElapsedTime(activeLog.clockInTime);
        const shiftMins = (systemSettings?.workingHoursPerDay || 8) * 60;
        return Math.min(elapsed.totalMins / shiftMins, 1);
    };

    const renderHourglass = () => {
        const progress = getAttendanceProgress();
        const sandColor = "#fbbf24"; // Amber/Gold

        return (
            <div style={{ position: 'relative', width: '40px', height: '55px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: '25px' }} title={`${Math.round(progress * 100)}% of shift completed`}>
                <svg width="40" height="55" viewBox="0 0 40 55" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}>
                    {/* Glass Frame Outlines */}
                    <path d="M10,5 L30,5 M10,50 L30,50" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round" />
                    <path d="M11,6 C11,22 20,27.5 20,27.5 C20,27.5 29,22 29,6 Z" fill="none" stroke="var(--primary)" strokeWidth="1.5" strokeOpacity="0.5" />
                    <path d="M11,49 C11,33 20,27.5 20,27.5 C20,27.5 29,33 29,49 Z" fill="none" stroke="var(--primary)" strokeWidth="1.5" strokeOpacity="0.5" />

                    {/* Top Sand (Decreasing) - Using simple rect with clip-path or complex path */}
                    <path
                        d={`M20,27.5 L${29 - (progress * 9)},${6 + (progress * 21)} L${11 + (progress * 9)},${6 + (progress * 21)} Z`}
                        fill={sandColor}
                        style={{ transition: 'all 1s ease' }}
                    />

                    {/* Bottom Sand (Increasing) */}
                    <path
                        d={`M${11 + (1 - progress) * 9},49 L${29 - (1 - progress) * 9},49 Q20,${49 - progress * 21} 20,${49 - progress * 21} Z`}
                        fill={sandColor}
                        style={{ transition: 'all 1s ease' }}
                    />

                    {/* Falling Stream */}
                    {isClockedIn && progress < 1 && (
                        <line x1="20" y1="27" x2="20" y2="48" stroke={sandColor} strokeWidth="1.5" className="timer-pulse" strokeDasharray="2,2" />
                    )}
                </svg>
            </div>
        );
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

    const fetchUserAttendanceLogs = async (userId) => {
        try {
            const res = await api.get(`/attendance/logs/${userId}`);
            setUserAttendanceLogs(res.data);
        } catch (err) {
            console.error('Failed to fetch user attendance logs');
            showAlert('Could not fetch attendance logs for this user.', 'info');
        }
    };

    const handleShowAttendance = (userObj) => {
        setSelectedUser(userObj);
        setUserAttendanceLogs([]);
        fetchUserAttendanceLogs(userObj._id);
        setShowUserAttendanceModal(true);
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
        if (periodLogs.length === 0) return { avgHours: '0h 0m', onTime: '0%', hasData: false };

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
            onTime: `${Math.round((onTimeCount / periodLogs.length) * 100)}%`,
            hasData: true
        };
    }, [attendanceLogs, statsPeriod, user]);

    const filteredAttendanceLogs = useMemo(() => {
        if (attendancePeriod === '30 DAYS') {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            return attendanceLogs.filter(log => new Date(log.date) >= thirtyDaysAgo);
        } else {
            const monthsArr = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
            const monthIndex = monthsArr.indexOf(attendancePeriod);
            const year = new Date().getFullYear();
            return attendanceLogs.filter(log => {
                const d = new Date(log.date);
                return d.getMonth() === monthIndex && d.getFullYear() === year;
            });
        }
    }, [attendanceLogs, attendancePeriod]);

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

    const handleDenyUser = async (id) => {
        showAlert('Are you sure you want to deny this user request?', 'confirm', async () => {
            try {
                await api.put(`/admin/users/${id}/deny`);
                fetchAdminData();
                showAlert('User request denied.', 'info');
            } catch (err) { showAlert('Denial failed', 'info'); }
        });
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
            showAlert('Configuration added successfully!', 'info');
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
        } catch (error) {
            console.error('Failed to fetch attendance logs:', error);
        }

        try {
            const payslipsRes = await api.get('/payslips');
            setPayslips(payslipsRes.data);
        } catch (error) {
            console.error('Failed to fetch payslips in Dashboard:', error);
        }

        try {
            const dashRes = await api.get('/dashboard/stats');
            setDashData(dashRes.data);
        } catch (error) {
            console.error('Failed to fetch dashboard stats error:', error);
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
        { name: 'My Finances', icon: <Briefcase size={20} /> },
        { name: 'Org', icon: <Building2 size={20} /> },
        { name: 'Engage', icon: <Award size={20} /> },
        { name: 'Admin', icon: <Settings size={20} /> },
        { name: 'Slack', icon: <MessageSquare size={20} /> }
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
                    if (d === 4) bg = '#ccff00'; // Holiday (Lime)
                    if (d === 5) bg = '#00ffa2'; // Leave (Aquamarine)
                    if (d === 7 || d === 8 || d === 14 || d === 15 || d === 21 || d === 22 || d === 28 || d === 29) {
                        bg = '#ffab00'; color = '#0a0e17'; // Weekend (Amber)
                    }
                    if (d === 6) bg = '#00ff88'; // Today (Green)

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
                <HomeTab
                    user={user}
                    activeLog={activeLog}
                    homeSubTab={homeSubTab} setHomeSubTab={setHomeSubTab}
                    dashData={dashData}
                    setShowHolidayModal={setShowHolidayModal}
                    homeTab={homeTab} setHomeTab={setHomeTab}
                    orgActivityTab={orgActivityTab} setOrgActivityTab={setOrgActivityTab}
                    wishedUsers={wishedUsers} setWishedUsers={setWishedUsers}
                    setActiveSidebar={setActiveSidebar}
                    setActiveSubTab={setActiveSubTab}
                    editingResponse={editingResponse} setEditingResponse={setEditingResponse}
                    welcomeResponses={welcomeResponses} setWelcomeResponses={setWelcomeResponses}
                    handleSaveResponse={handleSaveResponse}
                    isLightMode={isLightMode}
                    socialFeed={socialFeed}
                    showAlert={showAlert}
                    fetchPublicData={fetchPublicData}
                />
            );
        }

        if (activeSidebar === 'Me') {
            return (
                <>
                    <div className="sub-nav">
                        {['Attendance', 'Leave', 'Request', 'Profile'].map(tab => (
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
                            <AttendanceTab
                                user={user}
                                activeLog={activeLog}
                                isClockedIn={isClockedIn}
                                currentTime={currentTime}
                                attendanceLogs={attendanceLogs}
                                myLeaves={myLeaves}
                                dashData={dashData}
                                statsPeriod={statsPeriod}
                                setStatsPeriod={setStatsPeriod}
                                meStats={meStats}
                                teammateIndividualStats={teammateIndividualStats}
                                fetchTeamStats={fetchTeamStats}
                                calculateElapsedTime={calculateElapsedTime}
                                handleClockToggle={handleClockToggle}
                                isAttendanceFinished={isAttendanceFinished}
                                isWFH={isWFH}
                                selectedWorkingMode={selectedWorkingMode}
                                setShowAttendancePolicyModal={setShowAttendancePolicyModal}
                                attendanceTab={attendanceTab}
                                setAttendanceTab={setAttendanceTab}
                                attendancePeriod={attendancePeriod}
                                setAttendancePeriod={setAttendancePeriod}
                                filteredAttendanceLogs={filteredAttendanceLogs}
                                setShowLogInfo={setShowLogInfo}
                                currentCalendarMonth={currentCalendarMonth}
                                setCurrentCalendarMonth={setCurrentCalendarMonth}
                                currentCalendarYear={currentCalendarYear}
                                setCurrentCalendarYear={setCurrentCalendarYear}
                                myRequests={myRequests}
                                getStatusStyle={getStatusStyle}
                                isLightMode={isLightMode}
                                systemSettings={systemSettings}
                            />
                        )}

                        {
                            activeSubTab === 'Performance' && (
                                <div className="grid" style={{ gridTemplateColumns: '1fr', gap: '1.5rem' }}>
                                    <div className="panel">
                                        <div className="panel-header">Active Objectives (OKRs)</div>
                                        <div style={{ border: '1px solid var(--border-dark)', borderRadius: 'var(--radius-md)', padding: '1.5rem', background: 'rgba(var(--primary-rgb, 155, 89, 182), 0.05)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                                <div style={{ fontWeight: '500', fontSize: '1rem' }}>Improve Backend Response Time by 30%</div>
                                                <span style={{ border: '1px solid #00ff88', color: '#00ff88', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem' }}>On Track - 65%</span>
                                            </div>
                                            <div style={{ width: '100%', height: '8px', background: 'var(--border-dark)', borderRadius: '4px', marginBottom: '1rem' }}>
                                                <div style={{ width: '65%', height: '100%', background: '#00ff88', borderRadius: '4px' }}></div>
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
                            <LeaveTab
                                leaveStats={leaveStats}
                                myRequests={myRequests}
                                user={user}
                                getStatusStyle={getStatusStyle}
                                isLightMode={isLightMode}
                            />
                        )}

                        {activeSubTab === 'Request' && (
                            <RequestTab
                                user={user}
                                allUsers={allUsers}
                                isLightMode={isLightMode}
                                requestType={requestType}
                                setRequestType={setRequestType}
                                requestLeaveType={requestLeaveType}
                                setRequestLeaveType={setRequestLeaveType}
                                myLeaves={myLeaves}
                                selectedLeaveForCancel={selectedLeaveForCancel}
                                setSelectedLeaveForCancel={setSelectedLeaveForCancel}
                                datesToCancel={datesToCancel}
                                setDatesToCancel={setDatesToCancel}
                                requestRecipients={requestRecipients}
                                setRequestRecipients={setRequestRecipients}
                                recipientSearch={recipientSearch}
                                searchRecipients={searchRecipients}
                                recipientSuggestions={recipientSuggestions}
                                setRecipientSuggestions={setRecipientSuggestions}
                                setRecipientSearch={setRecipientSearch}
                                requestStartDate={requestStartDate}
                                setRequestStartDate={setRequestStartDate}
                                requestEndDate={requestEndDate}
                                setRequestEndDate={setRequestEndDate}
                                requestMessage={requestMessage}
                                setRequestMessage={setRequestMessage}
                                submitRequest={submitRequest}
                                requestSubmitting={requestSubmitting}
                                myRequests={myRequests}
                                getStatusStyle={getStatusStyle}
                                expandedRequests={expandedRequests}
                                setExpandedRequests={setExpandedRequests}
                            />
                        )}


                        {activeSubTab === 'Profile' && (
                            <ProfileTab
                                user={user}
                                isLightMode={isLightMode}
                                isProfileEditing={isProfileEditing}
                                setIsProfileEditing={setIsProfileEditing}
                                tempProfile={tempProfile}
                                setTempProfile={setTempProfile}
                                handleUpdateProfile={handleUpdateProfile}
                                fileInputRef={fileInputRef}
                                handleProfilePictureUpload={handleProfilePictureUpload}
                                uploadingPic={uploadingPic}
                                handleRemoveProfilePicture={handleRemoveProfilePicture}
                            />
                        )}

                    </div >
                </>
            );
        }

        if (activeSidebar === 'My Team') {
            return (
                <MyTeamTab
                    user={user}
                    teammates={teammates}
                    dashData={dashData}
                    setShowPublicProfile={setShowPublicProfile}
                    statsPeriod={statsPeriod}
                    isLightMode={isLightMode}
                />
            );
        }



        if (activeSidebar === 'My Finances') {
            return (
                <FinancesTab
                    user={user}
                    setUser={setUser}
                    activeSubTab={activeSubTab}
                    setActiveSubTab={setActiveSubTab}
                    globalPayslips={globalPayslips}
                    payslips={payslips}
                    isLightMode={isLightMode}
                />
            );
        }


        if (activeSidebar === 'Org') {
            return (
                <div className="page-content">
                    <div className="sub-nav" style={{ marginTop: '-1.5rem', marginBottom: '1.5rem' }}>
                        <div className={`sub-nav-item active`}>ORGANIZATION TREE</div>
                    </div>
                    <div style={{ height: 'calc(100vh - 200px)' }}>
                        <OrganizationTree user={user} />
                    </div>
                </div>
            );
        }

        if (activeSidebar === 'Admin') {
            const isAdminOrSuper = user?.role === 'Admin' || user?.role === 'Super Admin';
            if (!isAdminOrSuper) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Access Denied. Admin privileges required.</div>;

            return (
                <div className="page-content">
                    <AdminTab
                        activeSubTab={activeSubTab}
                        setActiveSubTab={setActiveSubTab}
                        pendingUsers={pendingUsers}
                        systemSettings={systemSettings}
                        setSystemSettings={setSystemSettings}
                        handleSaveSettings={handleSaveSettings}
                        allUsers={allUsers}
                        handleApproveUser={handleApproveUser}
                        handleDenyUser={handleDenyUser}
                        orgConfigs={orgConfigs}
                        handleAddConfig={handleAddConfig}
                        handleDeleteConfig={handleDeleteConfig}
                        inputStyle={inputStyle}
                        newConfig={newConfig}
                        setNewConfig={setNewConfig}
                        activeActionMenu={activeActionMenu}
                        setActiveActionMenu={setActiveActionMenu}
                        setSelectedUser={setSelectedUser}
                        setShowEditModal={setShowEditModal}
                        setEditMode={setEditMode}
                        setModalTab={setModalTab}
                        handleShowAttendance={handleShowAttendance}
                    />
                </div>
            );
        }



        if (activeSidebar === 'Inbox') {
            return (
                <div className="page-content">
                    <InboxTab
                        inboxRequests={inboxRequests}
                        requestActionNote={requestActionNote}
                        setRequestActionNote={setRequestActionNote}
                        handleRequestAction={handleRequestAction}
                        getStatusStyle={getStatusStyle}
                        isLightMode={isLightMode}
                    />
                </div>
            );
        }

        if (activeSidebar === 'Engage') {
            return (
                <EngageTab
                    user={user}
                    engageTab={engageTab} setEngageTab={setEngageTab}
                    orgActionTab={orgActionTab} setOrgActionTab={setOrgActionTab}
                    postText={postText} setPostText={setPostText}
                    poll={poll} setPoll={setPoll}
                    praise={praise} setPraise={setPraise}
                    allUsers={allUsers}
                    setShowAnnouncementModal={setShowAnnouncementModal}
                    socialFeed={socialFeed}
                    showAlert={showAlert}
                    fetchPublicData={fetchPublicData}
                    isLightMode={isLightMode}
                    dashData={dashData}
                />
            );
        }

        if (activeSidebar === 'Slack') {
            return <SlackTab user={user} />;
        }

        return null;
    };

    const renderAlertModal = () => {
        if (!customAlert) return null;
        return (
            <div style={alertOverlay}>
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
                                <div style={{ fontWeight: '600', color: '#00ff88' }}>{formatTime(showLogInfo.clockInTime)}</div>
                            </div>
                            <div style={{ padding: '1rem', background: 'var(--bg-main)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-dark)' }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Clock Out</div>
                                <div style={{ fontWeight: '600', color: '#ff4757' }}>{showLogInfo.clockOutTime ? formatTime(showLogInfo.clockOutTime) : 'Session Active'}</div>
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
                    color = '#00ffa2'; // Aquamarine for Remote
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
                    color = '#00f2fe'; // Neon cyan/aquamarine
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
                            { color: '#ffab00', label: 'Leave' },
                            { color: '#ccff00', label: 'Holiday' }
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

    const renderUserAttendanceModal = () => {
        if (!showUserAttendanceModal || !selectedUser) return null;

        return (
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    zIndex: 100,
                    display: 'flex',
                    justifyContent: 'flex-end',
                    background: 'rgba(0,0,0,0.15)',
                    backdropFilter: 'blur(2px)'
                }}
                onClick={() => setShowUserAttendanceModal(false)}
            >
                <div
                    className="panel"
                    style={{
                        width: '750px',
                        height: '100%',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        background: 'var(--bg-panel)',
                        color: 'var(--text-main)',
                        borderLeft: '1px solid var(--border-dark)',
                        boxShadow: 'var(--glow-panel)',
                        animation: 'slideInRight 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                    onClick={e => e.stopPropagation()}
                >
                    <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 2rem', borderBottom: '1px solid var(--border-dark)', background: 'var(--bg-panel)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                            <div className="avatar" style={{ width: '48px', height: '48px', fontSize: '1.1rem', background: 'var(--primary)', color: 'white', fontWeight: 'bold', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)' }}>
                                {selectedUser.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                                <div style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main)', letterSpacing: '-0.5px' }}>{selectedUser.name}'s Attendance</div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '500' }}>{selectedUser.email} • {selectedUser.department}</div>
                            </div>
                        </div>
                        <button className="btn-icon" style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color = 'var(--text-main)'} onMouseOut={e => e.target.style.color = 'var(--text-muted)'} onClick={() => setShowUserAttendanceModal(false)}>
                            <X size={24} />
                        </button>
                    </div>

                    <div style={{ padding: '2rem', overflowY: 'auto', flex: 1, background: 'var(--bg-panel)' }}>
                        {userAttendanceLogs.length > 0 ? (
                            <div style={{ background: 'var(--bg-main)', borderRadius: '12px', border: '1px solid var(--border-dark)', overflow: 'hidden' }}>
                                <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '1px solid var(--border-dark)', background: 'rgba(255,255,255,0.02)' }}>
                                            <th style={{ padding: '1.25rem 1rem', textAlign: 'left' }}>Date</th>
                                            <th style={{ padding: '1.25rem 1rem', textAlign: 'left' }}>Status</th>
                                            <th style={{ padding: '1.25rem 1rem', textAlign: 'left' }}>Clock-In</th>
                                            <th style={{ padding: '1.25rem 1rem', textAlign: 'left' }}>Clock-Out</th>
                                            <th style={{ padding: '1.25rem 1rem', textAlign: 'left' }}>Hours</th>
                                            <th style={{ padding: '1.25rem 1rem', textAlign: 'left' }}>Mode</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {userAttendanceLogs.map(log => (
                                            <tr key={log._id} style={{ borderBottom: '1px solid var(--border-dark)', transition: 'background 0.2s' }} className="hover-row">
                                                <td style={{ padding: '1.25rem 1rem', fontWeight: '600', color: 'var(--text-main)' }}>
                                                    {new Date(log.date).toLocaleDateString('en-US', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}
                                                </td>
                                                <td style={{ padding: '1.25rem 1rem' }}>
                                                    <span style={{
                                                        padding: '0.3rem 0.75rem',
                                                        borderRadius: '20px',
                                                        fontSize: '0.65rem',
                                                        fontWeight: '800',
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.5px',
                                                        background: log.status === 'WFH' ? 'rgba(96, 165, 250, 0.15)' : 'rgba(52, 211, 153, 0.15)',
                                                        color: log.status === 'WFH' ? '#60a5fa' : '#34d399',
                                                        border: `1px solid ${log.status === 'WFH' ? 'rgba(96, 165, 250, 0.2)' : 'rgba(52, 211, 153, 0.2)'}`
                                                    }}>
                                                        {log.status === 'WFH' ? 'Remote' : 'Present'}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '1.25rem 1rem', color: 'var(--text-main)', fontSize: '0.9rem' }}>{log.clockInTime ? new Date(log.clockInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}</td>
                                                <td style={{ padding: '1.25rem 1rem', color: 'var(--text-main)', fontSize: '0.9rem' }}>{log.clockOutTime ? new Date(log.clockOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (log.clockInTime ? <span style={{ color: 'var(--primary)', fontWeight: '600' }}>Ongoing</span> : '-')}</td>
                                                <td style={{ padding: '1.25rem 1rem', fontWeight: '700', color: 'var(--primary)', fontSize: '0.95rem' }}>
                                                    {log.totalHours ? `${Math.floor(log.totalHours)}h ${Math.round((log.totalHours % 1) * 60)}m` : '-'}
                                                </td>
                                                <td style={{ padding: '1.25rem 1rem', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '500' }}>{log.workingMode || 'On-site'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '6rem 2rem', color: 'var(--text-muted)' }}>
                                <div style={{ display: 'inline-flex', padding: '1.5rem', background: 'var(--bg-main)', borderRadius: '50%', marginBottom: '1.5rem' }}>
                                    <Clock size={48} style={{ opacity: 0.3 }} />
                                </div>
                                <div style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-main)', marginBottom: '0.5rem' }}>No Attendance Found</div>
                                <div style={{ fontSize: '0.9rem' }}>This user hasn't recorded any attendance logs yet.</div>
                            </div>
                        )}
                    </div>

                    <div style={{ padding: '1.5rem 2rem', borderTop: '1px solid var(--border-dark)', display: 'flex', justifyContent: 'flex-end', gap: '1rem', background: 'var(--bg-panel)' }}>
                        <button
                            className="btn"
                            style={{
                                background: 'transparent',
                                border: '1px solid var(--border-dark)',
                                color: 'var(--text-main)',
                                padding: '0.75rem 2rem',
                                borderRadius: '10px',
                                cursor: 'pointer',
                                fontWeight: '600',
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={e => e.target.style.background = 'var(--bg-main)'}
                            onMouseOut={e => e.target.style.background = 'transparent'}
                            onClick={() => setShowUserAttendanceModal(false)}
                        >
                            Close
                        </button>
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

    const renderEditModal = () => {
        if (!showEditModal || !selectedUser) return null;
        const u = selectedUser;
        const isAdmin = user?.role === 'Admin' || user?.role === 'Super Admin';

        return (
            <div style={{ ...modalOverlay, left: '260px', top: '60px', width: 'calc(100vw - 260px)', height: 'calc(100vh - 60px)', padding: 0, background: 'transparent' }}>
                <div style={{ ...modalContent, width: '100%', height: '100%', maxWidth: 'none', maxHeight: 'none', borderRadius: 0, padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', borderLeft: '1px solid var(--border-dark)', boxShadow: 'none' }}>
                    {/* Header */}
                    <div style={{ padding: '1.5rem 2rem', background: 'var(--primary)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                            <div className="avatar" style={{ width: '50px', height: '50px', fontSize: '1.25rem', background: 'rgba(255,255,255,0.2)', color: 'white', border: '2px solid rgba(255,255,255,0.4)' }}>
                                {u.name?.substring(0, 1).toUpperCase()}
                            </div>
                            <div>
                                <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700' }}>{u.name}</h2>
                                <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.9 }}>{u.designation} | {u.department}</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            {isAdmin && (
                                <button
                                    className="btn btn-sm"
                                    style={{ background: editMode ? '#ffffff' : 'rgba(255,255,255,0.2)', color: editMode ? 'var(--primary)' : 'white', border: 'none', fontWeight: 'bold' }}
                                    onClick={() => setEditMode(!editMode)}
                                >
                                    {editMode ? 'Viewing Mode' : 'Edit Mode'}
                                </button>
                            )}
                            <span style={{ cursor: 'pointer', fontSize: '1.5rem' }} onClick={() => setShowEditModal(false)}>✕</span>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div style={{ display: 'flex', gap: '2rem', padding: '0 2rem', borderBottom: '1px solid var(--border-dark)', background: 'var(--bg-panel)' }}>
                        {['Personal', 'Work', 'Salary', 'Leaves'].map(t => (
                            <div
                                key={t}
                                onClick={() => setModalTab(t)}
                                style={{
                                    padding: '1rem 0',
                                    fontSize: '0.9rem',
                                    fontWeight: '600',
                                    color: modalTab === t ? 'var(--primary)' : 'var(--text-muted)',
                                    borderBottom: modalTab === t ? '2px solid var(--primary)' : '2px solid transparent',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {t}
                            </div>
                        ))}
                    </div>

                    {/* Content */}
                    <div style={{ padding: '2rem', flex: 1, overflowY: 'auto' }}>
                        {modalTab === 'Personal' && (
                            <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                <div>
                                    <label style={labelStyle}>Full Name</label>
                                    {editMode ? (
                                        <input type="text" value={u.name} onChange={e => setSelectedUser({ ...u, name: e.target.value })} style={inputStyle} />
                                    ) : <div style={{ fontWeight: '500' }}>{u.name}</div>}
                                </div>
                                <div>
                                    <label style={labelStyle}>Email Address</label>
                                    <div style={{ fontWeight: '500' }}>{u.email}</div>
                                </div>
                                <div>
                                    <label style={labelStyle}>Phone Number</label>
                                    {editMode ? (
                                        <input type="text" value={u.phoneNumber || ''} onChange={e => setSelectedUser({ ...u, phoneNumber: e.target.value })} style={inputStyle} />
                                    ) : <div style={{ fontWeight: '500' }}>{u.phoneNumber || 'N/A'}</div>}
                                </div>
                                <div>
                                    <label style={labelStyle}>Gender</label>
                                    {editMode ? (
                                        <select value={u.gender || ''} onChange={e => setSelectedUser({ ...u, gender: e.target.value })} style={inputStyle}>
                                            <option value="">Select Gender</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    ) : <div style={{ fontWeight: '500' }}>{u.gender || 'N/A'}</div>}
                                </div>
                                <div>
                                    <label style={labelStyle}>Date of Birth</label>
                                    {editMode ? (
                                        <input type="date" value={u.dob ? u.dob.split('T')[0] : ''} onChange={e => setSelectedUser({ ...u, dob: e.target.value })} style={inputStyle} />
                                    ) : <div style={{ fontWeight: '500' }}>{u.dob ? new Date(u.dob).toLocaleDateString() : 'N/A'}</div>}
                                </div>
                                <div>
                                    <label style={labelStyle}>Blood Group</label>
                                    {editMode ? (
                                        <input type="text" value={u.bloodGroup || ''} onChange={e => setSelectedUser({ ...u, bloodGroup: e.target.value })} style={inputStyle} />
                                    ) : <div style={{ fontWeight: '500' }}>{u.bloodGroup || 'N/A'}</div>}
                                </div>
                            </div>
                        )}

                        {modalTab === 'Work' && (
                            <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                <div>
                                    <label style={labelStyle}>Department</label>
                                    {editMode ? (
                                        <input type="text" value={u.department || ''} onChange={e => setSelectedUser({ ...u, department: e.target.value })} style={inputStyle} />
                                    ) : <div style={{ fontWeight: '500' }}>{u.department}</div>}
                                </div>
                                <div>
                                    <label style={labelStyle}>Designation</label>
                                    {editMode ? (
                                        <input type="text" value={u.designation || ''} onChange={e => setSelectedUser({ ...u, designation: e.target.value })} style={inputStyle} />
                                    ) : <div style={{ fontWeight: '500' }}>{u.designation}</div>}
                                </div>
                                <div>
                                    <label style={labelStyle}>Joining Date</label>
                                    {editMode ? (
                                        <input type="date" value={u.joiningDate ? u.joiningDate.split('T')[0] : ''} onChange={e => setSelectedUser({ ...u, joiningDate: e.target.value })} style={inputStyle} />
                                    ) : <div style={{ fontWeight: '500' }}>{u.joiningDate ? new Date(u.joiningDate).toLocaleDateString() : 'N/A'}</div>}
                                </div>
                                <div>
                                    <label style={labelStyle}>Shift Timings</label>
                                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                        {editMode ? (
                                            <>
                                                <input type="time" value={u.workingSchedule?.shiftStart || '11:00'} onChange={e => setSelectedUser({ ...u, workingSchedule: { ...u.workingSchedule, shiftStart: e.target.value } })} style={inputStyle} />
                                                <span style={{ color: 'var(--text-muted)' }}>to</span>
                                                <input type="time" value={u.workingSchedule?.shiftEnd || '07:00 PM'} onChange={e => setSelectedUser({ ...u, workingSchedule: { ...u.workingSchedule, shiftEnd: e.target.value } })} style={inputStyle} />
                                            </>
                                        ) : <div style={{ fontWeight: '500' }}>{u.workingSchedule?.shiftStart || '11:00'} to {u.workingSchedule?.shiftEnd || '07:00 PM'}</div>}
                                    </div>
                                </div>
                                <div>
                                    <label style={labelStyle}>Min. Working Hours / Day</label>
                                    {editMode ? (
                                        <input type="number" step="0.5" value={u.workingSchedule?.minHours || 7} onChange={e => setSelectedUser({ ...u, workingSchedule: { ...u.workingSchedule, minHours: parseFloat(e.target.value) } })} style={inputStyle} />
                                    ) : <div style={{ fontWeight: '500' }}>{u.workingSchedule?.minHours || 7} Hours</div>}
                                </div>
                                <div>
                                    <label style={labelStyle}>Weekly Offs</label>
                                    {editMode ? (
                                        <input type="text" value={u.workingSchedule?.weekOffs?.join(', ') || 'Sunday'} onChange={e => setSelectedUser({ ...u, workingSchedule: { ...u.workingSchedule, weekOffs: e.target.value.split(',').map(s => s.trim()) } })} style={inputStyle} placeholder="Sunday, Saturday" />
                                    ) : <div style={{ fontWeight: '500' }}>{u.workingSchedule?.weekOffs?.join(', ') || 'Sunday'}</div>}
                                </div>
                            </div>
                        )}

                        {modalTab === 'Salary' && (
                            <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                <div>
                                    <label style={labelStyle}>Salary Type</label>
                                    {editMode ? (
                                        <select value={u.salaryDetails?.type || 'Fixed'} onChange={e => setSelectedUser({ ...u, salaryDetails: { ...u.salaryDetails, type: e.target.value } })} style={inputStyle}>
                                            <option value="Fixed">Fixed</option>
                                            <option value="Variable">Variable</option>
                                        </select>
                                    ) : <div style={{ fontWeight: '500' }}>{u.salaryDetails?.type || 'Fixed'}</div>}
                                </div>
                                <div>
                                    <label style={labelStyle}>Monthly Amount</label>
                                    {editMode ? (
                                        <input type="number" value={u.salaryDetails?.monthlyAmount || 0} onChange={e => setSelectedUser({ ...u, salaryDetails: { ...u.salaryDetails, monthlyAmount: parseFloat(e.target.value) } })} style={inputStyle} />
                                    ) : <div style={{ fontWeight: '600', color: 'var(--success)' }}>${u.salaryDetails?.monthlyAmount || 0}</div>}
                                </div>
                                <div style={{ gridColumn: 'span 2', borderTop: '1px solid var(--border-dark)', paddingTop: '1.5rem', marginTop: '0.5rem' }}>
                                    <div style={{ fontSize: '0.85rem', fontWeight: '700', marginBottom: '1rem' }}>Salary Breakdown</div>
                                    <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <div>
                                            <label style={labelStyle}>Basic Salary</label>
                                            {editMode ? (
                                                <input type="number" value={u.salary?.basic || 0} onChange={e => setSelectedUser({ ...u, salary: { ...u.salary, basic: parseFloat(e.target.value) } })} style={inputStyle} />
                                            ) : <div style={{ fontWeight: '500' }}>${u.salary?.basic || 0}</div>}
                                        </div>
                                        <div>
                                            <label style={labelStyle}>HRA</label>
                                            {editMode ? (
                                                <input type="number" value={u.salary?.hra || 0} onChange={e => setSelectedUser({ ...u, salary: { ...u.salary, hra: parseFloat(e.target.value) } })} style={inputStyle} />
                                            ) : <div style={{ fontWeight: '500' }}>${u.salary?.hra || 0}</div>}
                                        </div>
                                        <div>
                                            <label style={labelStyle}>Allowances</label>
                                            {editMode ? (
                                                <input type="number" value={u.salary?.allowance || 0} onChange={e => setSelectedUser({ ...u, salary: { ...u.salary, allowance: parseFloat(e.target.value) } })} style={inputStyle} />
                                            ) : <div style={{ fontWeight: '500' }}>${u.salary?.allowance || 0}</div>}
                                        </div>
                                        <div>
                                            <label style={labelStyle}>Deductions</label>
                                            {editMode ? (
                                                <input type="number" value={u.salary?.deductions || 0} onChange={e => setSelectedUser({ ...u, salary: { ...u.salary, deductions: parseFloat(e.target.value) } })} style={inputStyle} />
                                            ) : <div style={{ fontWeight: '500', color: '#ff4757' }}>-${u.salary?.deductions || 0}</div>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {modalTab === 'Leaves' && (
                            <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                <div>
                                    <label style={labelStyle}>Paid Leave Quota</label>
                                    {editMode ? (
                                        <input type="number" value={u.leaveQuotas?.paid || 0} onChange={e => setSelectedUser({ ...u, leaveQuotas: { ...u.leaveQuotas, paid: parseInt(e.target.value) } })} style={inputStyle} />
                                    ) : <div style={{ fontWeight: '500' }}>{u.leaveQuotas?.paid || 0} Days</div>}
                                </div>
                                <div>
                                    <label style={labelStyle}>Sick Leave Quota</label>
                                    {editMode ? (
                                        <input type="number" value={u.leaveQuotas?.sick || 0} onChange={e => setSelectedUser({ ...u, leaveQuotas: { ...u.leaveQuotas, sick: parseInt(e.target.value) } })} style={inputStyle} />
                                    ) : <div style={{ fontWeight: '500' }}>{u.leaveQuotas?.sick || 0} Days</div>}
                                </div>
                                <div>
                                    <label style={labelStyle}>Casual Leave Quota</label>
                                    {editMode ? (
                                        <input type="number" value={u.leaveQuotas?.casual || 0} onChange={e => setSelectedUser({ ...u, leaveQuotas: { ...u.leaveQuotas, casual: parseInt(e.target.value) } })} style={inputStyle} />
                                    ) : <div style={{ fontWeight: '500' }}>{u.leaveQuotas?.casual || 0} Days</div>}
                                </div>
                                <div>
                                    <label style={labelStyle}>Comp Off Quota</label>
                                    {editMode ? (
                                        <input type="number" value={u.leaveQuotas?.compOff || 0} onChange={e => setSelectedUser({ ...u, leaveQuotas: { ...u.leaveQuotas, compOff: parseInt(e.target.value) } })} style={inputStyle} />
                                    ) : <div style={{ fontWeight: '500' }}>{u.leaveQuotas?.compOff || 0} Days</div>}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div style={{ padding: '1.5rem 2rem', borderTop: '1px solid var(--border-dark)', background: 'var(--bg-main)', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                        <button className="btn btn-secondary" onClick={() => setShowEditModal(false)}>Close</button>
                        {editMode && (
                            <button className="btn btn-primary" onClick={handleUpdateUser}>Update Employee</button>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const renderAttendancePolicyModal = () => {
        if (!showAttendancePolicyModal) return null;
        return (
            <div style={modalOverlay}>
                <div style={{ ...modalContent, maxWidth: '850px', maxHeight: '90vh', overflowY: 'auto' }}>
                    <div className="panel-header" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '1.25rem', fontWeight: '600' }}>Attendance Policy</span>
                        <span style={{ cursor: 'pointer', fontSize: '1.5rem' }} onClick={() => setShowAttendancePolicyModal(false)}>✕</span>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-dark)', paddingBottom: '0.5rem' }}>
                        {['Penalisation Policy', 'Time tracking policy'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setAttendancePolicyTab(tab)}
                                style={{
                                    padding: '0.6rem 1.25rem',
                                    background: attendancePolicyTab === tab ? 'var(--primary)' : 'rgba(var(--primary-rgb), 0.1)',
                                    color: attendancePolicyTab === tab ? '#fff' : 'var(--text-main)',
                                    border: '1px solid var(--border-dark)',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontSize: '0.85rem',
                                    fontWeight: '600',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    <div style={{ color: 'var(--text-main)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                        {attendancePolicyTab === 'Penalisation Policy' ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div>
                                    <div style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Below are the details of your Penalisation Policy</div>
                                    <div style={{ fontWeight: '500' }}>Penalisation policy is effective 01 Feb 2025</div>
                                </div>

                                <div>
                                    <h4 style={{ margin: '0 0 0.75rem 0', color: 'var(--text-main)', fontWeight: '700' }}>No Attendance</h4>
                                    <p style={{ margin: '0 0 0.75rem 0' }}>You will be penalized 1 day(s) of Paid Leave for every single missing attendance day</p>
                                    <div style={{ background: 'rgba(var(--primary-rgb), 0.05)', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--primary)', color: 'var(--primary)', marginBottom: '1rem', fontSize: '0.85rem' }}>
                                        You have a buffer period of 2 day(s) to regularize your attendance before the penalization happens.
                                    </div>
                                    <div style={{ fontSize: '0.85rem' }}>
                                        <div style={{ marginBottom: '0.5rem', fontWeight: '500' }}>The order of paid leave for deduction is:</div>
                                        <ul style={{ margin: '0 0 0.5rem 0', paddingLeft: '1.5rem' }}>
                                            <li>Paid Leave</li>
                                        </ul>
                                        <div style={{ color: 'var(--text-muted)' }}>In case no Paid Leave are left, Unpaid leave will be deducted.</div>
                                    </div>
                                </div>

                                <div>
                                    <h4 style={{ margin: '0 0 0.75rem 0', color: 'var(--text-main)', fontWeight: '700' }}>Late Arrival</h4>
                                    <p style={{ margin: 0 }}>You won't be penalized for any late arrival incidents.</p>
                                </div>

                                <div>
                                    <h4 style={{ margin: '0 0 0.75rem 0', color: 'var(--text-main)', fontWeight: '700' }}>Work Hours</h4>
                                    <p style={{ margin: '0 0 0.75rem 0' }}>You will be penalized, in following manner, based on the shortage of effective hours in a day:</p>
                                    <ul style={{ margin: '0 0 1rem 0', paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <li>0.25 day(s) of Paid Leave deduction if average effective hours in a day, is less than 100 % of shift hours.</li>
                                        <li>0.5 day(s) of Paid Leave deduction if average effective hours in a day, is less than 80 % of shift hours.</li>
                                        <li>1 day(s) of Paid Leave deduction if average effective hours in a day, is less than 50 % of shift hours.</li>
                                    </ul>
                                    <p style={{ marginBottom: '1rem', fontStyle: 'italic', color: 'var(--text-muted)' }}>In case you have both Late Arrival and Work Hour penalization for the same day, penalization for only Shortage Of work hours will apply.</p>
                                    <div style={{ background: 'rgba(var(--primary-rgb), 0.05)', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--primary)', color: 'var(--primary)', marginBottom: '1rem', fontSize: '0.85rem' }}>
                                        You have a buffer period of 2 day(s) to regularize your attendance before the penalization happens.
                                    </div>
                                    <div style={{ fontSize: '0.85rem' }}>
                                        <div style={{ marginBottom: '0.5rem', fontWeight: '500' }}>The order of paid leave for deduction is:</div>
                                        <ul style={{ margin: '0 0 0.5rem 0', paddingLeft: '1.5rem' }}>
                                            <li>Paid Leave</li>
                                        </ul>
                                        <div style={{ color: 'var(--text-muted)' }}>In case no Paid Leave are left, Unpaid leave will be deducted.</div>
                                    </div>
                                </div>

                                <div>
                                    <h4 style={{ margin: '0 0 0.75rem 0', color: 'var(--text-main)', fontWeight: '700' }}>Missing Swipes</h4>
                                    <p style={{ margin: '0 0 0.75rem 0' }}>In case of missing swipes exceeding 3 working day(s) in a month, 0.5 day(s) of Paid Leave for every 3 subsequent incident(s) of missing swipe day</p>
                                    <div style={{ background: 'rgba(var(--primary-rgb), 0.05)', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--primary)', color: 'var(--primary)', marginBottom: '1rem', fontSize: '0.85rem' }}>
                                        You have a buffer period of 2 day(s) to regularize your attendance before the penalization happens.
                                    </div>
                                    <div style={{ fontSize: '0.85rem' }}>
                                        <div style={{ marginBottom: '0.5rem', fontWeight: '500' }}>The order of paid leave for deduction is:</div>
                                        <ul style={{ margin: '0 0 0.5rem 0', paddingLeft: '1.5rem' }}>
                                            <li>Paid Leave</li>
                                        </ul>
                                        <div style={{ color: 'var(--text-muted)' }}>In case no Paid Leave are left, Unpaid leave will be deducted.</div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div>
                                    <div style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Below are the details of time tracking policy assigned to you</div>
                                </div>

                                <div>
                                    <h4 style={{ margin: '0 0 0.75rem 0', color: 'var(--text-main)', fontWeight: '700' }}>Bio-Metric & Web Clock-In</h4>
                                    <ul style={{ margin: 0, paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <li>Your attendance is automatically tracked using biometric device(s)</li>
                                        <li>Your attendance is tracked using web clock-in, i.e you have to log in to Keka website and mark your attendance (Browser Only).</li>
                                    </ul>
                                </div>

                                <div>
                                    <h4 style={{ margin: '0 0 0.75rem 0', color: 'var(--text-main)', fontWeight: '700' }}>Work from Home (WFH)</h4>
                                    <ul style={{ margin: 0, paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <li>You can request for only full day WFH</li>
                                        <li>You are required to clock-in/out when doing WFH. In case of late clock-in, no clock-in, or less effective/gross hours clocked, the system will penalise based on penalisation policy assigned to you.</li>
                                        <li>No approval is required if WFH request doesn’t exceed 5 time(s) in a Month.</li>
                                    </ul>
                                </div>

                                <div>
                                    <h4 style={{ margin: '0 0 0.75rem 0', color: 'var(--text-main)', fontWeight: '700' }}>Regularization</h4>
                                    <ul style={{ margin: 0, paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <li>In case of penalisation due to attendance discrepancy, you are allowed to request regularisation .</li>
                                        <li>Approval is required for all Regularization requests.</li>
                                    </ul>
                                </div>
                            </div>
                        )}
                    </div>

                    <div style={{ marginTop: '2rem', textAlign: 'right' }}>
                        <button className="btn btn-secondary" onClick={() => setShowAttendancePolicyModal(false)}>Close</button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="dashboard-layout" style={{ display: 'flex', flexDirection: 'row', height: '100vh', overflow: 'hidden', padding: '1.25rem', gap: '1.25rem', boxSizing: 'border-box' }}>
            <div ref={vantaRef} style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 0,
                opacity: 1, // Always visible
                pointerEvents: 'none',
                transition: 'opacity 0.5s ease'
            }}></div>

            {/* FLOATING SIDEBAR ISLAND */}
            <aside className="sidebar" style={{ width: '260px', borderRadius: '24px', background: isLightMode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', zIndex: 5, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.2)', transition: 'all 0.3s ease' }}>
                <div className="sidebar-brand" style={{ padding: '1.5rem', height: 'auto', background: 'transparent', margin: 0, fontSize: '1.5rem', border: 'none', textAlign: 'center', fontWeight: '700' }}>
                    <span style={{ color: 'var(--primary)' }}>TP</span>&nbsp;<span style={{ color: 'var(--text-main)' }}>Interns</span>
                </div>
                <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '1rem' }}>
                    <nav className="sidebar-nav">
                    {sidebarItems.filter(item => {
                        if (item.name === 'My Team' && teammates.length === 0) return false;
                        if (item.name === 'Admin' && !(user?.role === 'Admin' || user?.role === 'Super Admin')) return false;
                        if (item.name === 'Slack' && !(user?.role === 'Admin' || user?.role === 'Super Admin')) return false;
                        return true;
                    }).map(item => (
                        <div
                            key={item.name}
                            className={`nav-item ${activeSidebar === item.name ? 'active' : ''}`}
                            onClick={() => {
                                setActiveSidebar(item.name);
                                if (item.name === 'Home') setHomeSubTab('Dashboard');
                                if (item.name === 'Me') setActiveSubTab('Attendance');
                                if (item.name === 'My Team') setActiveSubTab('TEAM MEMBERS');
                                if (item.name === 'Org') setActiveSubTab('OrgTree');
                                if (item.name === 'My Finances') setActiveSubTab('Payslips');
                                if (item.name === 'Admin') setActiveSubTab('Leave');
                            }}
                        >
                            {item.icon}
                            <span className="nav-text">{item.name}</span>
                        </div>
                    ))}
                </nav>
                </div>
            </aside>

            {/* RIGHT COLUMN (Topbar + Content) */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem', overflow: 'hidden', zIndex: 5 }}>
                
                {/* FLOATING TOPBAR ISLAND */}
                <header className="topbar" style={{ zIndex: 50, width: '100%', borderRadius: '24px', background: isLightMode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', height: '74px', flexShrink: 0, padding: '0 1.5rem', boxShadow: '0 8px 32px rgba(0,0,0,0.15)', transition: 'all 0.3s ease' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <div style={{ fontSize: '1.15rem', fontWeight: '600', color: 'var(--text-topbar)' }}>
                            {systemSettings?.companyName || 'Teaching Pariksha'}
                        </div>
                        <div className="hidden md:block" style={{ fontSize: '0.9rem', color: 'var(--text-topbar)', opacity: 0.7, borderLeft: '1px solid var(--border-dark)', paddingLeft: '1.5rem' }}>
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

                        <div ref={notificationRef} style={{ position: 'relative' }}>
                            <div
                                style={{ position: 'relative', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                                onClick={() => { setShowNotifications(!showNotifications); if (!showNotifications) fetchNotifications(); }}
                            >
                                <Bell size={20} style={{ color: 'var(--text-topbar)' }} />
                                {unreadCount > 0 && (
                                    <span style={{
                                        position: 'absolute', top: '-6px', right: '-6px',
                                        background: '#ef4444', color: 'white', fontSize: '0.65rem',
                                        width: '16px', height: '16px', borderRadius: '50%',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontWeight: '700'
                                    }}>{unreadCount > 9 ? '9+' : unreadCount}</span>
                                )}
                            </div>

                            
                        </div>
                        <div ref={profileDropdownRef} style={{ position: 'relative' }}>
                            <div
                                className="avatar"
                                style={{ cursor: 'pointer', background: '#00ff88', color: '#0a0e17' }}
                                onClick={() => setShowProfileMenu(!showProfileMenu)}
                            >
                                {user?.profilePicture ? (
                                    <img src={user.profilePicture} alt="Profile" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                                ) : (
                                    user?.name?.substring(0, 2).toUpperCase() || 'ME'
                                )}
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
                                        style={{ color: '#ffab00' }}
                                        onClick={handleLogout}
                                    >
                                        Log Out
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* MAIN CONTENT CANVAS */}
                <main className="main-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-main)', borderRadius: '24px', border: '1px solid var(--border-dark)', overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.3)', position: 'relative' }}>
                    <div className="dashboard-content" style={{ flex: 1, overflowY: 'auto', height: '100%' }}>
                        {renderContent()}
                        {renderUserAttendanceModal()}
                    </div>
                </main>
            </div>
            {showHolidayModal && renderHolidayModal()}
            {showLogInfo && renderLogInfoModal()}
            {renderAlertModal()}
            {renderPublicProfileModal()}
            {renderAnnouncementModal()}
            {renderAttendancePolicyModal()}
            {renderEditModal()}

            {
                showClockInModal && (
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
                )
            }
{showNotifications && (
                                <div id="notification-panel" className="panel" style={{
                                    position: 'fixed', top: 0, right: 0,
                                    width: '25vw', minWidth: '320px', height: '100vh', zIndex: 1000,
                                    boxShadow: '-4px 0 30px rgba(0,0,0,0.4)',
                                    border: 'none', borderLeft: '1px solid var(--border-dark)',
                                    display: 'flex', flexDirection: 'column',
                                    borderRadius: 0,
                                    overflow: 'hidden',
                                    animation: 'slideInRight 0.25s ease'
                                }}>
                                    <div style={{
                                        padding: '1rem 1.25rem',
                                        borderBottom: '1px solid var(--border-dark)',
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                    }}>
                                        <span style={{ fontWeight: '600', fontSize: '0.95rem', color: 'var(--text-main)' }}>Notifications</span>
                                        {unreadCount > 0 && (
                                            <span
                                                style={{ fontSize: '0.75rem', color: 'var(--primary)', cursor: 'pointer', fontWeight: '500' }}
                                                onClick={markAllNotificationsRead}
                                            >
                                                Mark all read
                                            </span>
                                        )}
                                        {notifications.length > 0 && (
                                            <span
                                                style={{ fontSize: '0.75rem', color: '#f43f5e', cursor: 'pointer', fontWeight: '500' }}
                                                onClick={deleteAllNotifications}
                                            >
                                                Clear all
                                            </span>
                                        )}
                                    </div>
                                    <div style={{ overflowY: 'auto', flex: 1 }}>
                                        {notifications.length > 0 ? notifications.map(n => {
                                            const iconMap = {
                                                leave_applied: '📋', leave_approved: '✅', leave_rejected: '❌',
                                                clock_in_reminder: '⏰', request_received: '📩',
                                                request_approved: '✅', request_rejected: '❌',
                                                announcement: '📢', general: '🔔'
                                            };
                                            const timeAgo = (date) => {
                                                const mins = Math.floor((Date.now() - new Date(date)) / 60000);
                                                if (mins < 1) return 'Just now';
                                                if (mins < 60) return `${mins}m ago`;
                                                const hrs = Math.floor(mins / 60);
                                                if (hrs < 24) return `${hrs}h ago`;
                                                const days = Math.floor(hrs / 24);
                                                return `${days}d ago`;
                                            };
                                            return (
                                                <div
                                                    key={n._id}
                                                    onClick={() => { if (!n.isRead) markNotificationRead(n._id); }}
                                                    style={{
                                                        padding: '0.85rem 1.25rem',
                                                        borderBottom: '1px solid var(--border-dark)',
                                                        cursor: 'pointer',
                                                        background: n.isRead ? 'transparent' : 'rgba(59, 130, 246, 0.06)',
                                                        transition: 'background 0.2s',
                                                        position: 'relative'
                                                    }}
                                                >
                                                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                                                        <span style={{ fontSize: '1.2rem', flexShrink: 0, marginTop: '2px' }}>{iconMap[n.type] || '🔔'}</span>
                                                        <div style={{ flex: 1, minWidth: 0 }}>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                                                                <span style={{ fontWeight: n.isRead ? '400' : '600', fontSize: '0.82rem', color: 'var(--text-main)' }}>{n.title}</span>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                                                                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{timeAgo(n.createdAt)}</span>
                                                                    <span
                                                                        onClick={(e) => { e.stopPropagation(); deleteNotificationById(n._id); }}
                                                                        style={{
                                                                            width: '18px', height: '18px', borderRadius: '50%',
                                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                            fontSize: '0.7rem', color: 'var(--text-muted)',
                                                                            cursor: 'pointer', transition: 'all 0.2s',
                                                                            flexShrink: 0
                                                                        }}
                                                                        onMouseEnter={(e) => { e.target.style.background = 'rgba(244,63,94,0.15)'; e.target.style.color = '#f43f5e'; }}
                                                                        onMouseLeave={(e) => { e.target.style.background = 'transparent'; e.target.style.color = 'var(--text-muted)'; }}
                                                                        title="Delete notification"
                                                                    >✕</span>
                                                                </div>
                                                            </div>
                                                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem', lineHeight: 1.35 }}>{n.message}</div>
                                                            {!n.isRead && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary)', marginTop: '0.4rem' }}></div>}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        }) : (
                                            <div style={{ padding: '2.5rem 1.25rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                                <Bell size={32} style={{ marginBottom: '0.75rem', opacity: 0.3 }} />
                                                <div style={{ fontSize: '0.85rem' }}>No notifications yet</div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
        </div >
    );
}

const inputStyle = { background: 'var(--bg-panel)', color: 'var(--text-main)', border: '1px solid var(--border-dark)', padding: '0.5rem', borderRadius: '4px', outline: 'none', width: '100%', boxSizing: 'border-box' };
const labelStyle = { fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.3rem', display: 'block' };
const modalOverlay = { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' };
const alertOverlay = { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center' };
const modalContent = { background: 'var(--bg-panel)', padding: '2rem', borderRadius: 'var(--radius-lg)', width: '90%', maxWidth: '700px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', border: '1px solid var(--border-dark)' };

