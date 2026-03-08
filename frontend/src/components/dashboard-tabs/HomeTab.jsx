import React from 'react';
import { Trash2, FileText, Briefcase, Calendar, Clock, Mail } from 'lucide-react';
import api from '../../api/axios';
import ClockStand from './ClockStand';

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
    handleSaveResponse
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

    return (
        <div className="page-content">
            <div style={{ display: 'flex', gap: '0.75rem', borderBottom: '1px solid var(--border-dark)', paddingBottom: '0.75rem', marginBottom: '1.5rem', alignItems: 'center' }}>
                <span
                    className={`tab-pill primary ${homeSubTab === 'Dashboard' ? 'active' : ''}`}
                    style={{ fontSize: '0.85rem', fontWeight: '800', letterSpacing: '0.5px' }}
                    onClick={() => setHomeSubTab('Dashboard')}
                >
                    DASHBOARD
                </span>
                <span
                    className={`tab-pill primary ${homeSubTab === 'Welcome' ? 'active' : ''}`}
                    style={{ fontSize: '0.85rem', fontWeight: '800', letterSpacing: '0.5px' }}
                    onClick={() => setHomeSubTab('Welcome')}
                >
                    WELCOME <span style={{ color: homeSubTab === 'Welcome' ? 'white' : 'var(--danger)', background: homeSubTab === 'Welcome' ? 'var(--danger)' : 'transparent', padding: '0 6px', borderRadius: '10px', marginLeft: '4px' }}></span>
                </span>
            </div>

            {homeSubTab === 'Dashboard' && (
                <>
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

                        <div style={{ position: 'relative', zIndex: 3 }}>
                            <h1>Welcome {user?.name}!</h1>
                            <p style={{ marginTop: '0.5rem', opacity: 0.8, fontSize: '0.9rem' }}>Have a great day at Teaching Pariksha!</p>
                        </div>
                        <ClockStand clockInTime={activeLog?.clockInTime} />
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
                                            <span className="view-details" style={{ color: '#ffab00', cursor: 'pointer' }} onClick={() => setShowHolidayModal(true)}>View All</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0' }}>
                                            <div style={{ textAlign: 'center', width: '100%' }}>
                                                <h3 style={{ color: '#ffab00', fontSize: '1.5rem', marginBottom: '0.25rem', fontFamily: 'serif' }}>{dashData.holidays[0].name}</h3>
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
                                                <div className="avatar" style={{ border: '2px solid #4a5568', background: '#4a5568', overflow: 'hidden' }}>
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
                                                <div className="avatar" style={{ border: '2px solid #00ff88', background: '#00ff88', overflow: 'hidden' }}>
                                                    {w.user?.avatar ? <img src={w.user.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : w.user?.name?.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{w.user?.name?.split(' ')[0]}</div>
                                            </div>
                                        )) : <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>None today</div>}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Main Activities Column */}
                        <div style={{ zIndex: 1 }}>
                            <div className="panel" style={{ padding: '1.5rem' }}>
                                <div style={{ display: 'flex', gap: '2rem', borderBottom: '1px solid var(--border-dark)', paddingBottom: '0.5rem', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
                                    <span
                                        style={{ color: orgActivityTab === 'Birthdays' ? 'var(--primary)' : 'var(--text-muted)', borderBottom: orgActivityTab === 'Birthdays' ? '2px solid var(--primary)' : 'none', paddingBottom: '0.5rem', marginBottom: '-0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontWeight: '500' }}
                                        onClick={() => setOrgActivityTab('Birthdays')}
                                    >🎂 {dashData.birthdays.today.length} Birthday{dashData.birthdays.today.length !== 1 ? 's' : ''}</span>
                                    <span
                                        style={{ color: orgActivityTab === 'Anniversaries' ? 'var(--primary)' : 'var(--text-muted)', borderBottom: orgActivityTab === 'Anniversaries' ? '2px solid var(--primary)' : 'none', paddingBottom: '0.5rem', marginBottom: '-0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontWeight: '500' }}
                                        onClick={() => setOrgActivityTab('Anniversaries')}
                                    >🎉 0 Work Anniversaries</span>
                                    <span
                                        style={{ color: orgActivityTab === 'NewJoinees' ? 'var(--primary)' : 'var(--text-muted)', borderBottom: orgActivityTab === 'NewJoinees' ? '2px solid var(--primary)' : 'none', paddingBottom: '0.5rem', marginBottom: '-0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontWeight: '500' }}
                                        onClick={() => setOrgActivityTab('NewJoinees')}
                                    >👥 {dashData.newJoinees.length} New joinee{dashData.newJoinees.length !== 1 ? 's' : ''}</span>
                                </div>

                                {orgActivityTab === 'Birthdays' && (
                                    <>
                                        <div style={{ marginBottom: '2rem' }}>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', marginBottom: '1rem' }}>Birthdays today</div>
                                            {dashData.birthdays.today.length > 0 ? (
                                                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                                    {dashData.birthdays.today.map(b => (
                                                        <div key={b._id} style={{ textAlign: 'center' }}>
                                                            <div className="avatar" style={{ background: '#00ff88', width: '48px', height: '48px', fontSize: '1rem', margin: '0 auto 0.5rem', color: '#0a0e17' }}>
                                                                {b.name?.substring(0, 2).toUpperCase()}
                                                            </div>
                                                            <div style={{ fontSize: '0.75rem', fontWeight: '500' }}>{b.name?.split(' ')[0]}</div>
                                                            <div
                                                                style={{ fontSize: '0.65rem', color: wishedUsers.includes(b._id) ? 'var(--text-muted)' : '#ffab00', cursor: wishedUsers.includes(b._id) ? 'default' : 'pointer' }}
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
                                                        <div className="avatar" style={{ background: '#ffab00', width: '40px', height: '40px', fontSize: '0.9rem', margin: '0 auto 0.5rem', color: '#0a0e17' }}>
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
                                                <div className="avatar" style={{ border: '2px solid #00ffa2', background: '#00ffa2', width: '40px', height: '40px', fontSize: '0.9rem', margin: '0 auto 0.5rem', color: '#0a0e17' }}>
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

                            {/* Recent Activities */}
                            <div className="panel" style={{ marginTop: '1.5rem', padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                    <h3 style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-main)', margin: 0 }}>Recent Activities</h3>
                                    <button
                                        onClick={() => setActiveSidebar('Engage')}
                                        style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '500' }}
                                    >
                                        View All
                                    </button>
                                </div>

                                {(() => {
                                    const activities = [
                                        ...(dashData.announcements || []).map(a => ({ ...a, activityType: 'Announcement', date: new Date(a.createdAt || Date.now()) })),
                                        ...(socialFeed || []).map(s => ({ ...s, activityType: 'Social', date: new Date(s.createdAt || Date.now()) }))
                                    ].sort((a, b) => b.date - a.date).slice(0, 5);

                                    if (activities.length === 0) {
                                        return <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>No recent activities</div>;
                                    }

                                    return activities.map((act, idx) => (
                                        <div key={act._id} style={{ marginBottom: idx === activities.length - 1 ? 0 : '1rem', paddingBottom: idx === activities.length - 1 ? 0 : '1rem', borderBottom: idx === activities.length - 1 ? 'none' : '1px solid var(--border-dark)' }}>
                                            {act.activityType === 'Announcement' ? (
                                                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                                                    <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '0.8rem' }}>📢</div>
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ fontWeight: '600', fontSize: '0.85rem', color: 'var(--text-main)' }}>{act.title}</div>
                                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>{act.content}</div>
                                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.3rem', opacity: 0.6 }}>{act.date.toLocaleDateString([], { day: 'numeric', month: 'short' })} at {act.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                                                    <div className="avatar" style={{ width: '32px', height: '32px', background: act.type === 'Praise' ? '#f59e0b' : '#10b981', fontSize: '0.8rem', flexShrink: 0, color: '#0a0e17' }}>
                                                        {act.author?.avatar ? <img src={act.author.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : act.author?.name?.substring(0, 2).toUpperCase()}
                                                    </div>
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>
                                                            <span style={{ fontWeight: '600' }}>{act.author?.name}</span>
                                                            {act.type === 'Praise' && <span> recognized <span style={{ fontWeight: '600' }}>{act.praiseData?.recipient?.name}</span></span>}
                                                            {act.type === 'Post' && <span> shared a post</span>}
                                                            {act.type === 'Poll' && <span> created a poll</span>}
                                                        </div>
                                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                                                            {act.type === 'Poll' ? act.pollData?.question : act.content}
                                                        </div>
                                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.3rem', opacity: 0.6 }}>{act.date.toLocaleDateString([], { day: 'numeric', month: 'short' })} at {act.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ));
                                })()}
                            </div>
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
                                style={{ width: '80px', height: '80px', fontSize: '2rem', background: '#00ff88', color: '#0a0e17', border: '4px solid rgba(0, 255, 136, 0.2)', cursor: 'pointer' }}
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
        </div >
    );
}
