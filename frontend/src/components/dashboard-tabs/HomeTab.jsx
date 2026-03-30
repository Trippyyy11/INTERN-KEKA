import React, { useState } from 'react';
import { Trash2, FileText, Briefcase, Calendar, Clock, Mail, Cake, PartyPopper, Users, Megaphone, Sparkles, LayoutDashboard, X, Phone, Building2, Bell } from 'lucide-react';

// Inline gender-based avatar SVG with profile picture fallback
const GenderAvatar = ({ gender, profilePicture, size = 48, style = {} }) => {
    const isFemale = gender?.toLowerCase() === 'female';
    return (
        <div style={{
            width: size, height: size, borderRadius: '50%',
            background: profilePicture ? 'transparent' : (isFemale ? 'linear-gradient(135deg, #f9a8d4 0%, #ec4899 100%)' : 'linear-gradient(135deg, #93c5fd 0%, #3b82f6 100%)'),
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden', flexShrink: 0, ...style
        }}>
            {profilePicture ? (
                <img src={profilePicture} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
                isFemale ? (
                    <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 15V22M9 22h6M12 15a6 6 0 1 0 0-12 6 6 0 0 0 0 12z" />
                        <path d="M7.5 12H4.5M19.5 12h-3" />
                    </svg>
                ) : (
                    <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="8" r="5" />
                        <path d="M3 21v-2a7 7 0 0 1 14 0v2" />
                    </svg>
                )
            )}
        </div>
    );
};
import api from '../../api/axios';
import ClockStand from './ClockStand';
import HolidaysTab from './HolidaysTab';


export default function HomeTab({
    user,
    activeLog,
    homeSubTab, setHomeSubTab,
    dashData,
    setShowHolidayModal,
    homeTab, setHomeTab,
    orgActionTab, setOrgActionTab,
    postText, setPostText,
    poll, setPoll,
    praise, setPraise,
    allUsers,
    setShowAnnouncementModal,
    socialFeed,
    showAlert,
    fetchPublicData,
    isLightMode,
    orgActivityTab, setOrgActivityTab,
    wishedUsers, setWishedUsers,
    setActiveSidebar,
    setActiveSubTab,
    editingResponse, setEditingResponse,
    welcomeResponses, setWelcomeResponses,
    handleSaveResponse,
    pendingInboxCount
}) {
    const inputStyle = {
        width: '100%',
        padding: '0.75rem',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-dark)',
        background: 'var(--bg-panel)',
        color: 'var(--text-main)',
        outline: 'none'
    };

    const [showHolidays, setShowHolidays] = useState(false);
    const [selectedProfile, setSelectedProfile] = useState(null);

    if (showHolidays) {
        return (
            <div className="page-content">
                <HolidaysTab 
                    onBack={() => setShowHolidays(false)} 
                    isLightMode={isLightMode}
                    user={user}
                    onEdit={() => {
                        setShowHolidays(false);
                        if (setActiveSidebar) setActiveSidebar('Admin');
                        if (setActiveSubTab) setActiveSubTab('Configs');
                    }}
                />
            </div>
        );
    }

    return (
        <div className="page-content">

            {/* Profile Inspection Modal */}
            {selectedProfile && (
                <div
                    onClick={() => setSelectedProfile(null)}
                    style={{
                        position: 'fixed', inset: 0, zIndex: 1000,
                        background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                >
                    <div
                        onClick={e => e.stopPropagation()}
                        style={{
                            background: isLightMode ? '#ffffff' : '#1e293b',
                            borderRadius: '24px',
                            padding: '2.5rem',
                            width: '360px',
                            maxWidth: '90vw',
                            boxShadow: '0 25px 50px rgba(0,0,0,0.4)',
                            border: isLightMode ? '1px solid #e2e8f0' : '1px solid rgba(255,255,255,0.08)',
                            position: 'relative'
                        }}
                    >
                        <button
                            onClick={() => setSelectedProfile(null)}
                            style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: isLightMode ? '#f1f5f9' : 'rgba(255,255,255,0.08)', border: 'none', cursor: 'pointer', borderRadius: '10px', padding: '0.5rem', color: 'var(--text-muted)', display: 'flex' }}
                        >
                            <X size={16} />
                        </button>

                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
                            <GenderAvatar gender={selectedProfile.gender} profilePicture={selectedProfile.profilePicture} size={80} style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.2)', marginBottom: '1.25rem' }} />
                            <div style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--text-main)' }}>{selectedProfile.name}</div>
                            {selectedProfile.designation && (
                                <div style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--primary)', marginTop: '0.3rem', background: 'rgba(59,130,246,0.1)', padding: '0.3rem 1rem', borderRadius: '20px' }}>
                                    {selectedProfile.designation}
                                </div>
                            )}
                        </div>

                        {/* About/Bio Section (Scrollable if long) */}
                        {selectedProfile.welcomeProfile?.about && (
                            <div style={{ marginBottom: '1.5rem', background: isLightMode ? '#f8fafc' : 'rgba(255,255,255,0.04)', padding: '1rem', borderRadius: '16px' }}>
                                <div style={{ fontSize: '0.65rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--text-muted)', marginBottom: '6px' }}>About Me</div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: '1.5', maxHeight: '80px', overflowY: 'auto' }}>
                                    {selectedProfile.welcomeProfile.about}
                                </div>
                            </div>
                        )}

                        {/* Details grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
                            {[
                                { icon: <Mail size={14} />, label: 'Email', value: selectedProfile.email, full: true },
                                { icon: <Phone size={14} />, label: 'Phone', value: selectedProfile.phoneNumber || selectedProfile.contactNumber, full: true },
                                { icon: <Building2 size={14} />, label: 'Dept', value: selectedProfile.department },
                                { icon: <Users size={14} />, label: 'Gender', value: selectedProfile.gender },
                                { icon: <Calendar size={14} />, label: 'Place', value: selectedProfile.place },
                                { icon: <Calendar size={14} />, label: 'Blood', value: selectedProfile.bloodGroup },
                                { icon: <Calendar size={14} />, label: 'DOB', value: selectedProfile.dob ? new Date(selectedProfile.dob).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : null },
                                { icon: <Calendar size={14} />, label: 'Joined', value: selectedProfile.joiningDate ? new Date(selectedProfile.joiningDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : (selectedProfile.createdAt ? new Date(selectedProfile.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : null) },
                            ].filter(row => row.value).map((row, i) => (
                                <div key={i} style={{ gridColumn: row.full ? 'span 2' : 'auto', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.8rem', background: isLightMode ? '#f8fafc' : 'rgba(255,255,255,0.04)', borderRadius: '12px' }}>
                                    <div style={{ color: 'var(--primary)', flexShrink: 0 }}>{row.icon}</div>
                                    <div>
                                        <div style={{ fontSize: '0.6rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', marginBottom: '1px' }}>{row.label}</div>
                                        <div style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: row.full ? 'unset' : '100px' }}>{row.value}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Additional Public Info */}
                        {(selectedProfile.welcomeProfile?.loveJob || selectedProfile.welcomeProfile?.interests) && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {selectedProfile.welcomeProfile.loveJob && (
                                    <div style={{ borderTop: isLightMode ? '1px solid #e2e8f0' : '1px solid rgba(255,255,255,0.08)', paddingTop: '1rem' }}>
                                        <div style={{ fontSize: '0.65rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--text-muted)', marginBottom: '4px' }}>Why I love my job</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-main)', fontStyle: 'italic' }}>"{selectedProfile.welcomeProfile.loveJob}"</div>
                                    </div>
                                )}
                                {selectedProfile.welcomeProfile.interests && (
                                    <div style={{ borderTop: isLightMode ? '1px solid #e2e8f0' : '1px solid rgba(255,255,255,0.08)', paddingTop: '1rem' }}>
                                        <div style={{ fontSize: '0.65rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--text-muted)', marginBottom: '4px' }}>Interests</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-main)' }}>{selectedProfile.welcomeProfile.interests}</div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Welcome Banner */}
            <div className="welcome-banner" style={{ position: 'relative', overflow: 'hidden' }}>
                {/* Abstract Background Decoration */}
                <svg style={{ position: 'absolute', top: 0, right: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }} preserveAspectRatio="xMaxYMin slice" viewBox="0 0 1000 300">
                    <defs>
                        <linearGradient id="orgGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor={isLightMode ? "#bfdbfe" : "#1e40af"} stopOpacity={isLightMode ? "0.6" : "0.5"} />
                            <stop offset="100%" stopColor={isLightMode ? "#eff6ff" : "#1e1b4b"} stopOpacity="0" />
                        </linearGradient>
                        <linearGradient id="orgGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor={isLightMode ? "#93c5fd" : "#2563eb"} stopOpacity={isLightMode ? "0.7" : "0.6"} />
                            <stop offset="100%" stopColor={isLightMode ? "#dbeafe" : "#1e3a8a"} stopOpacity="0" />
                        </linearGradient>
                        <linearGradient id="orgGrad3" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor={isLightMode ? "#60a5fa" : "#3b82f6"} stopOpacity={isLightMode ? "0.8" : "0.7"} />
                            <stop offset="100%" stopColor={isLightMode ? "#93c5fd" : "#2563eb"} stopOpacity="0" />
                        </linearGradient>
                    </defs>
                    <path d="M1000,0 L1000,300 C800,250 700,350 500,250 C300,150 350,50 150,0 Z" fill="url(#orgGrad1)" />
                    <path d="M1000,0 L1000,200 C850,220 750,120 600,70 C450,20 420,0 380,0 Z" fill="url(#orgGrad2)" />
                    <path d="M1000,0 L1000,100 C950,120 850,50 780,0 Z" fill="url(#orgGrad3)" />

                    {/* Decorative lines */}
                    <path d="M1000,50 C950,70 850,10 780,-30" stroke={isLightMode ? "rgba(59,130,246,0.3)" : "rgba(255,255,255,0.2)"} strokeWidth="1.5" fill="none" />
                    <path d="M1000,80 C930,120 820,30 740,-30" stroke={isLightMode ? "rgba(59,130,246,0.2)" : "rgba(255,255,255,0.15)"} strokeWidth="1" fill="none" />
                    <path d="M1000,120 C900,160 780,50 690,-30" stroke={isLightMode ? "rgba(59,130,246,0.15)" : "rgba(255,255,255,0.1)"} strokeWidth="1" strokeDasharray="5,5" fill="none" />
                </svg>

                <div style={{ position: 'relative', zIndex: 3, display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <div style={{ background: 'rgba(255,255,255,0.2)', padding: '1rem', borderRadius: '16px', backdropFilter: 'blur(5px)' }}>
                        <LayoutDashboard size={40} color={isLightMode ? "#1e40af" : "#ffffff"} />
                    </div>
                    <div>
                        <h1>Welcome {user?.name}!</h1>
                        <p style={{ marginTop: '0.5rem', opacity: 0.8, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <Sparkles size={14} color="#ffab00" /> Have a great day at Teaching Pariksha!
                        </p>
                    </div>
                </div>
                <ClockStand clockInTime={activeLog?.clockInTime} />
            </div>

            {/* Pending Requests Alert Card for Managers/Admins */}
            {pendingInboxCount > 0 && (
                <div 
                    className="panel animate-in fade-in slide-in-from-top-4 duration-500" 
                    style={{
                        marginBottom: '1.5rem',
                        padding: '1.25rem 1.75rem',
                        background: isLightMode ? 'linear-gradient(135deg, #fffbeb 0%, #fff7ed 100%)' : 'linear-gradient(135deg, #451a03 0%, #2a1103 100%)',
                        border: isLightMode ? '1px solid #fed7aa' : '1px solid #7c2d12',
                        borderRadius: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        boxShadow: '0 10px 30px -10px rgba(0,0,0,0.1)'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                        <div style={{
                            width: '48px', height: '48px', borderRadius: '16px',
                            background: '#f97316', color: 'white',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 4px 12px rgba(249, 115, 22, 0.3)'
                        }}>
                            <Bell size={24} />
                        </div>
                        <div>
                            <div style={{ fontSize: '1.05rem', fontWeight: '800', color: isLightMode ? '#7c2d12' : '#fed7aa', letterSpacing: '-0.3px' }}>
                                Action Required: {pendingInboxCount} Pending Request{pendingInboxCount > 1 ? 's' : ''}
                            </div>
                            <div style={{ fontSize: '0.85rem', color: isLightMode ? '#9a3412' : '#fdba74', fontWeight: '500', marginTop: '2px' }}>
                                You have requests waiting for your approval in the inbox.
                            </div>
                        </div>
                    </div>
                    <button 
                        className="btn btn-primary"
                        onClick={() => setActiveSidebar('Inbox')}
                        style={{
                            padding: '0.75rem 1.5rem',
                            borderRadius: '14px',
                            fontWeight: '700',
                            fontSize: '0.85rem',
                            background: '#f97316',
                            border: 'none',
                            boxShadow: '0 4px 12px rgba(249, 115, 22, 0.2)',
                            cursor: 'pointer'
                        }}
                    >
                        View Inbox
                    </button>
                </div>
            )}

            {/* Dashboard Content - Bento Grid Redesign */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '1.5rem',
                minHeight: '600px',
                marginTop: '0.5rem'
            }}>
                {/* Left Column: Quick Actions & Status */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', zIndex: 1 }}>

                    {/* Quick Actions Row */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div
                            className="panel cursor-pointer hover:shadow-lg transition-all"
                            style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', background: isLightMode ? '#ffffff' : 'rgba(255,255,255,0.03)', border: isLightMode ? '1px solid #e2e8f0' : '1px solid rgba(255,255,255,0.05)', borderRadius: '20px' }}
                            onClick={() => { setActiveSidebar('Me'); setActiveSubTab('Request'); }}
                        >
                            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Calendar size={20} />
                            </div>
                            <div style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-main)' }}>Request Leave</div>
                        </div>
                        <div
                            className="panel cursor-pointer hover:shadow-lg transition-all"
                            style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', background: isLightMode ? '#ffffff' : 'rgba(255,255,255,0.03)', border: isLightMode ? '1px solid #e2e8f0' : '1px solid rgba(255,255,255,0.05)', borderRadius: '20px' }}
                            onClick={() => { setActiveSidebar('Me'); setActiveSubTab('Profile'); }}
                        >
                            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Briefcase size={20} />
                            </div>
                            <div style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-main)' }}>My Profile</div>
                        </div>
                    </div>

                    {/* Reporting Manager (Glassmorphism card) */}
                    {user?.role !== 'Super Admin' && (
                    <div className="panel shadow-sm hover:shadow-md transition-shadow" style={{
                        background: isLightMode ? 'linear-gradient(135deg, #f8faff 0%, #eef2ff 100%)' : 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                        backdropFilter: 'blur(12px)',
                        borderLeft: '5px solid #3b82f6',
                        padding: '1.5rem',
                        borderRadius: '20px',
                        border: isLightMode ? '1px solid #e0e7ff' : '1px solid rgba(59, 130, 246, 0.1)'
                    }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1.25rem', color: 'var(--text-muted)' }}>Reporting Manager</div>
                        {user?.reportingManager ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                                <div className="avatar shadow-lg" style={{ width: '56px', height: '56px', fontSize: '1.25rem', background: isLightMode ? '#e0e7ff' : 'linear-gradient(135deg, var(--primary) 0%, #2563eb 100%)', color: isLightMode ? '#3730a3' : 'white', border: '2px solid rgba(255,255,255,0.1)' }}>
                                    {user.reportingManager.name?.substring(0, 1).toUpperCase()}
                                </div>
                                <div>
                                    <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-main)' }}>{user.reportingManager.name}</div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '500' }}>
                                        <Mail size={14} /> {user.reportingManager.email}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontStyle: 'italic', fontWeight: '500' }}>
                                No reporting manager assigned
                            </div>
                        )}
                    </div>
                    )}

                    {/* Holidays Banner */}
                    <div className="panel holiday-card hover:shadow-xl transition-all cursor-pointer" style={{
                        borderRadius: '20px',
                        padding: '1.75rem',
                        background: isLightMode ? 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)' : 'linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)',
                        border: 'none',
                    }} onClick={() => setShowHolidays(true)}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                            <span style={{ fontSize: '0.85rem', fontWeight: '800', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)', letterSpacing: '1px' }}>Upcoming Holiday</span>
                            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#ffb020', background: 'rgba(255, 176, 32, 0.1)', padding: '0.4rem 1rem', borderRadius: '12px' }}>View Calendar</span>
                        </div>
                        {dashData.holidays.length > 0 ? (
                            <div>
                                <h3 style={{ color: '#ffffff', fontSize: '1.75rem', fontWeight: '800', marginBottom: '0.5rem', letterSpacing: '-0.5px' }}>{dashData.holidays[0].name}</h3>
                                <div style={{ fontSize: '0.9rem', fontWeight: '600', color: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Calendar size={16} /> {new Date(dashData.holidays[0].date).toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                </div>
                            </div>
                        ) : (
                            <div style={{ fontSize: '1rem', fontWeight: '600', color: 'rgba(255,255,255,0.8)' }}>No upcoming holidays</div>
                        )}
                    </div>

                    {/* Team Availability */}
                    <div className="panel" style={{ padding: '1.5rem', borderRadius: '20px', background: isLightMode ? '#ffffff' : 'var(--bg-panel)', boxShadow: isLightMode ? '0 4px 6px -1px rgba(0, 0, 0, 0.05)' : 'none' }}>
                        <div style={{ fontSize: '1.05rem', fontWeight: '800', letterSpacing: '-0.3px', color: 'var(--text-main)', marginBottom: '1.5rem' }}>Team Availability</div>

                        <div style={{ marginBottom: '1.75rem' }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ff4757', boxShadow: '0 0 10px rgba(255, 71, 87, 0.5)' }}></div> On Leave Today ({dashData.leaves.length})
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem' }}>
                                {dashData.leaves.length > 0 ? dashData.leaves.map(l => (
                                    <div key={l._id} onClick={() => setSelectedProfile(l.user)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }} title={`View ${l.user?.name}'s profile`}>
                                        <GenderAvatar gender={l.user?.gender} profilePicture={l.user?.profilePicture} size={48} style={{ border: '2px solid rgba(255, 71, 87, 0.5)', boxShadow: '0 4px 12px rgba(255,71,87,0.2)' }} />
                                        <div style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-main)', marginTop: '0.4rem' }}>{l.user?.name?.split(' ')[0]}</div>
                                    </div>
                                )) : <div style={{ fontSize: '0.85rem', fontWeight: '500', color: 'var(--text-muted)', background: isLightMode ? '#f8fafc' : 'rgba(255,255,255,0.02)', padding: '0.75rem 1rem', borderRadius: '12px', width: '100%' }}>All team members are present.</div>}
                            </div>
                        </div>

                        <div>
                            <div style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00ff88', boxShadow: '0 0 10px rgba(0, 255, 136, 0.5)' }}></div> Working Remotely ({dashData.workingRemotely.length})
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem' }}>
                                {dashData.workingRemotely.length > 0 ? dashData.workingRemotely.map(w => (
                                    <div key={w._id} onClick={() => setSelectedProfile(w.user)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }} title={`View ${w.user?.name}'s profile`}>
                                        <GenderAvatar gender={w.user?.gender} profilePicture={w.user?.profilePicture} size={48} style={{ border: '2px solid rgba(0, 255, 136, 0.5)', boxShadow: '0 4px 12px rgba(0,255,136,0.2)' }} />
                                        <div style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-main)', marginTop: '0.4rem' }}>{w.user?.name?.split(' ')[0]}</div>
                                    </div>
                                )) : <div style={{ fontSize: '0.85rem', fontWeight: '500', color: 'var(--text-muted)' }}>None today.</div>}
                            </div>
                        </div>
                    </div>

                </div>

                {/* Right Column: Activities & Updates */}
                <div style={{ zIndex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    {/* Celebrations Panel */}
                    <div className="panel" style={{ padding: '0', overflow: 'hidden', borderRadius: '20px', background: isLightMode ? '#ffffff' : 'var(--bg-panel)', boxShadow: isLightMode ? '0 4px 6px -1px rgba(0, 0, 0, 0.05)' : 'none' }}>
                        <div style={{ display: 'flex', background: isLightMode ? '#f8fafc' : 'rgba(0,0,0,0.2)', borderBottom: isLightMode ? '1px solid #e2e8f0' : '1px solid rgba(255,255,255,0.05)' }}>
                            <button
                                style={{ flex: 1, padding: '1.25rem 1rem', fontWeight: '700', fontSize: '0.85rem', color: orgActivityTab === 'Birthdays' ? 'var(--primary)' : 'var(--text-muted)', background: orgActivityTab === 'Birthdays' ? (isLightMode ? '#ffffff' : 'rgba(59, 130, 246, 0.05)') : 'transparent', borderBottom: orgActivityTab === 'Birthdays' ? '3px solid var(--primary)' : '3px solid transparent', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                                onClick={() => setOrgActivityTab('Birthdays')}
                            >
                                <Cake size={18} /> Birthdays ({dashData.birthdays.today.length})
                            </button>
                            <button
                                style={{ flex: 1, padding: '1.25rem 1rem', fontWeight: '700', fontSize: '0.85rem', color: orgActivityTab === 'Anniversaries' ? 'var(--primary)' : 'var(--text-muted)', background: orgActivityTab === 'Anniversaries' ? (isLightMode ? '#ffffff' : 'rgba(59, 130, 246, 0.05)') : 'transparent', borderBottom: orgActivityTab === 'Anniversaries' ? '3px solid var(--primary)' : '3px solid transparent', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                                onClick={() => setOrgActivityTab('Anniversaries')}
                            >
                                <PartyPopper size={18} /> Anniversaries (0)
                            </button>
                            <button
                                style={{ flex: 1, padding: '1.25rem 1rem', fontWeight: '700', fontSize: '0.85rem', color: orgActivityTab === 'NewJoinees' ? 'var(--primary)' : 'var(--text-muted)', background: orgActivityTab === 'NewJoinees' ? (isLightMode ? '#ffffff' : 'rgba(59, 130, 246, 0.05)') : 'transparent', borderBottom: orgActivityTab === 'NewJoinees' ? '3px solid var(--primary)' : '3px solid transparent', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                                onClick={() => setOrgActivityTab('NewJoinees')}
                            >
                                <Users size={18} /> New Joinees ({dashData.newJoinees.length})
                            </button>
                        </div>
                        
                        <div style={{ padding: '1.5rem' }}>
                            {orgActivityTab === 'Birthdays' && (
                                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <div style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '1.25rem' }}>Today's Celebrations</div>
                                    {dashData.birthdays.today.length > 0 ? (
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
                                            {dashData.birthdays.today.map(b => (
                                                <div key={b._id} className="hover:shadow-lg transition-all" style={{ textAlign: 'center', background: isLightMode ? '#ffffff' : 'rgba(255,255,255,0.02)', border: isLightMode ? '1px solid #e2e8f0' : '1px solid rgba(255,255,255,0.05)', padding: '1.5rem 1rem', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }} onClick={() => setSelectedProfile(b)}>
                                                    <GenderAvatar gender={b.gender} profilePicture={b.profilePicture} size={64} style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                                    <div style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--text-main)', marginTop: '0.8rem', marginBottom: '0.8rem' }}>{b.name?.split(' ')[0]}</div>
                                                    <button
                                                        className={`btn btn-sm ${wishedUsers.includes(b._id) ? 'btn-secondary' : 'btn-primary'}`}
                                                        style={{ width: '90%', padding: '0.5rem', fontSize: '0.75rem', fontWeight: '700', borderRadius: '10px' }}
                                                        onClick={(e) => { e.stopPropagation(); if (!wishedUsers.includes(b._id)) setWishedUsers([...wishedUsers, b._id]); }}
                                                        disabled={wishedUsers.includes(b._id)}
                                                    >
                                                        {wishedUsers.includes(b._id) ? 'Wished ✓' : 'Wish Happy B-Day'}
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-muted)', background: isLightMode ? '#f8fafc' : 'rgba(0,0,0,0.1)', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem', textAlign: 'center' }}>No birthdays today.</div>
                                    )}

                                    <div style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '1.25rem' }}>Upcoming Birthdays</div>
                                    <div style={{ display: 'flex', gap: '1.25rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                                        {dashData.birthdays.upcoming.length > 0 ? dashData.birthdays.upcoming.map(b => (
                                            <div key={b._id} style={{ flex: '0 0 auto', textAlign: 'center', minWidth: '90px', cursor: 'pointer' }} onClick={() => setSelectedProfile(b)}>
                                                <GenderAvatar gender={b.gender} profilePicture={b.profilePicture} size={48} style={{ margin: '0 auto 0.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }} />
                                                <div style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-main)' }}>{b.name?.split(' ')[0]}</div>
                                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '600', marginTop: '2px' }}>
                                                    {new Date(b.dob).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                                                </div>
                                            </div>
                                        )) : (
                                            <div style={{ fontSize: '0.85rem', fontWeight: '500', color: 'var(--text-muted)' }}>No upcoming birthdays in next 30 days.</div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {orgActivityTab === 'Anniversaries' && (
                                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300" style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                                    <div style={{ marginBottom: '1.5rem', opacity: 0.5, display: 'flex', justifyContent: 'center' }}>
                                        <PartyPopper size={64} strokeWidth={1.5} />
                                    </div>
                                    <div style={{ fontSize: '1rem', fontWeight: '600' }}>No work anniversaries today.</div>
                                </div>
                            )}

                            {orgActivityTab === 'NewJoinees' && (
                                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '1.25rem' }}>
                                    {dashData.newJoinees && dashData.newJoinees.length > 0 ? dashData.newJoinees.map(j => (
                                        <div
                                            key={j._id}
                                            onClick={() => setSelectedProfile(j)}
                                            className="hover:shadow-lg transition-all"
                                            style={{ textAlign: 'center', background: isLightMode ? '#ffffff' : 'rgba(255,255,255,0.02)', border: isLightMode ? '1px solid #e2e8f0' : '1px solid rgba(255,255,255,0.05)', padding: '1.5rem 1rem', borderRadius: '16px', cursor: 'pointer' }}
                                        >
                                            <div style={{ margin: '0 auto 0.8rem', display: 'flex', justifyContent: 'center' }}>
                                                <GenderAvatar gender={j.gender} profilePicture={j.profilePicture} size={60} style={{ border: '3px solid #10b981', boxShadow: '0 4px 12px rgba(16,185,129,0.25)' }} />
                                            </div>
                                            <div style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--text-main)' }}>{j.name?.split(' ')[0]}</div>
                                            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--primary)', marginTop: '0.5rem', background: 'rgba(59, 130, 246, 0.1)', display: 'inline-block', padding: '0.3rem 0.8rem', borderRadius: '12px' }}>
                                                {j.department || 'New Joinee'}
                                            </div>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.6rem', fontWeight: '500' }}>
                                                Joined {new Date(j.joiningDate || j.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                                            </div>
                                        </div>
                                    )) : (
                                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: '500' }}>No new joinees in the last 7 days.</div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Recent Activities Feed */}
                    <div className="panel" style={{ padding: '1.75rem', borderRadius: '20px', background: isLightMode ? '#ffffff' : 'var(--bg-panel)', boxShadow: isLightMode ? '0 4px 6px -1px rgba(0, 0, 0, 0.05)' : 'none' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: isLightMode ? '1px solid #e2e8f0' : '1px solid rgba(255,255,255,0.08)', paddingBottom: '1rem' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-main)', margin: 0, letterSpacing: '-0.3px', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                <Clock size={18} color="var(--primary)" /> Timeline Updates
                            </h3>
                            <button
                                onClick={() => setActiveSidebar('Engage')}
                                className="hover:bg-blue-100 transition-colors"
                                style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary)', border: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '700', padding: '0.5rem 1rem', borderRadius: '12px' }}
                            >
                                View All
                            </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingLeft: '0.5rem' }}>
                            {(() => {
                                const activities = [
                                    ...(dashData.announcements || []).map(a => ({ ...a, activityType: 'Announcement', date: new Date(a.createdAt || Date.now()) })),
                                    ...(socialFeed || []).map(s => ({ ...s, activityType: 'Social', date: new Date(s.createdAt || Date.now()) }))
                                ].sort((a, b) => b.date - a.date).slice(0, 5);

                                if (activities.length === 0) {
                                    return <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: '500', background: isLightMode ? '#f8fafc' : 'rgba(255,255,255,0.02)', borderRadius: '16px', border: isLightMode ? '1px dashed #cbd5e1' : '1px dashed rgba(255,255,255,0.1)' }}>No recent activities to display</div>;
                                }

                                return activities.map((act, idx) => (
                                    <div key={act._id} className="group" style={{ 
                                        position: 'relative', 
                                        paddingLeft: '2.5rem',
                                        paddingBottom: idx === activities.length - 1 ? '0' : '2rem'
                                    }}>
                                        {/* Connecting Line */}
                                        {idx !== activities.length - 1 && (
                                            <div style={{
                                                position: 'absolute',
                                                left: '11px',
                                                top: '32px',
                                                bottom: 0,
                                                width: '2px',
                                                background: isLightMode ? 'linear-gradient(to bottom, #cbd5e1, transparent)' : 'linear-gradient(to bottom, rgba(255,255,255,0.1), transparent)',
                                                borderRadius: '2px'
                                            }} />
                                        )}

                                        {/* Timeline Node Icon */}
                                        <div style={{ 
                                            position: 'absolute', 
                                            left: '0', 
                                            top: '0', 
                                            width: '24px', 
                                            height: '24px', 
                                            borderRadius: '50%', 
                                            background: act.activityType === 'Announcement' ? '#ef4444' : 'var(--primary)',
                                            border: `4px solid ${isLightMode ? '#ffffff' : 'var(--bg-panel)'}`,
                                            boxShadow: '0 0 0 1px rgba(0,0,0,0.05), 0 4px 6px rgba(0,0,0,0.1)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            zIndex: 2,
                                            transition: 'transform 0.2s ease',
                                        }} className="group-hover:scale-110">
                                            {act.activityType === 'Announcement' ? <Megaphone size={10} color="#fff" /> : <Clock size={10} color="#fff" />}
                                        </div>
                                        
                                        {/* Card Content */}
                                        <div style={{ 
                                            background: act.activityType === 'Announcement' ? (isLightMode ? '#fef2f2' : 'rgba(239, 68, 68, 0.05)') : (isLightMode ? '#ffffff' : 'rgba(255,255,255,0.02)'), 
                                            padding: '1.25rem', 
                                            borderRadius: '16px', 
                                            border: act.activityType === 'Announcement' ? (isLightMode ? '1px solid #fecaca' : '1px solid rgba(239, 68, 68, 0.1)') : (isLightMode ? '1px solid #e2e8f0' : '1px solid rgba(255,255,255,0.05)'),
                                            boxShadow: isLightMode ? '0 4px 12px rgba(0,0,0,0.02)' : 'none',
                                            transition: 'all 0.3s ease',
                                            cursor: 'pointer',
                                            marginTop: '-0.5rem'
                                        }} className="hover:-translate-y-1 hover:shadow-lg">
                                            {act.activityType === 'Announcement' ? (
                                                <>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                                                        <div style={{ fontWeight: '800', fontSize: '1rem', color: '#dc2626', display: 'flex', alignItems: 'center', gap: '0.5rem', letterSpacing: '-0.2px' }}>
                                                            {act.title}
                                                        </div>
                                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '700', whiteSpace: 'nowrap', background: isLightMode ? '#ffffff' : 'rgba(0,0,0,0.2)', padding: '0.3rem 0.6rem', borderRadius: '10px', border: isLightMode ? '1px solid #fecaca' : '1px solid rgba(239,68,68,0.2)' }}>
                                                            {act.date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                        </div>
                                                    </div>
                                                    <div style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: '1.6', opacity: 0.9 }}>{act.content}</div>
                                                </>
                                            ) : (
                                                <>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                            <div className="avatar shadow-sm" style={{ width: '32px', height: '32px', background: act.type === 'Praise' ? 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)' : 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)', fontSize: '0.85rem', color: '#ffffff', fontWeight: '800', border: '2px solid rgba(255,255,255,0.5)' }}>
                                                                {act.author?.avatar ? <img src={act.author.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : act.author?.name?.substring(0, 2).toUpperCase()}
                                                            </div>
                                                            <div style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>
                                                                <span style={{ fontWeight: '800' }}>{act.author?.name}</span>
                                                                {act.type === 'Praise' && <span> praised <span style={{ fontWeight: '800', color: '#f59e0b' }}>{act.praiseData?.recipient?.name}</span></span>}
                                                                {act.type === 'Post' && <span style={{ color: 'var(--text-muted)' }}> posted an update</span>}
                                                                {act.type === 'Poll' && <span style={{ color: 'var(--text-muted)' }}> created a poll</span>}
                                                            </div>
                                                        </div>
                                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '700', background: isLightMode ? '#f1f5f9' : 'rgba(255,255,255,0.05)', padding: '0.3rem 0.6rem', borderRadius: '10px' }}>
                                                            {act.date.toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                                        </div>
                                                    </div>
                                                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', paddingLeft: '2.75rem', lineHeight: '1.6' }}>
                                                        {act.type === 'Poll' ? act.pollData?.question : act.content}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ));
                            })()}
                        </div>
                    </div>
                </div>

            </div>

        </div>
    );
}
