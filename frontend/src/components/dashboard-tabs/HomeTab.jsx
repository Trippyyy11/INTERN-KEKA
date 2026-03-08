import React from 'react';
import { Trash2, FileText, Briefcase, Calendar, Clock, Mail } from 'lucide-react';
import api from '../../api/axios';

export default function HomeTab({
    user,
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
                    <div className="welcome-banner">
                        <h1>Welcome {user?.name}!</h1>
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

                        {/* Main Organization Column */}
                        <div style={{ zIndex: 1 }}>
                            <div style={{ display: 'flex', marginBottom: '1rem', borderBottom: '1px solid var(--border-dark)', paddingBottom: '0.75rem', gap: '1rem' }}>
                                <button
                                    className={`tab-pill primary ${homeTab === 'Organization' ? 'active' : ''}`}
                                    style={{
                                        border: 'none',
                                        background: homeTab === 'Organization' ? 'rgba(0, 255, 136, 0.1)' : 'transparent',
                                        color: homeTab === 'Organization' ? 'var(--primary)' : 'var(--text-muted)',
                                        fontSize: '0.9rem',
                                        padding: '0.5rem 1rem',
                                        borderRadius: '6px',
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => setHomeTab('Organization')}
                                >
                                    Organization
                                </button>
                                <button
                                    className={`tab-pill primary ${homeTab === 'Activities' ? 'active' : ''}`}
                                    style={{
                                        border: 'none',
                                        background: homeTab === 'Activities' ? 'rgba(0, 255, 136, 0.1)' : 'transparent',
                                        color: homeTab === 'Activities' ? 'var(--primary)' : 'var(--text-muted)',
                                        fontSize: '0.9rem',
                                        padding: '0.5rem 1rem',
                                        borderRadius: '6px',
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => setHomeTab('Activities')}
                                >
                                    Activities
                                </button>
                            </div>

                            {homeTab === 'Organization' ? (
                                <>
                                    <div className="panel" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
                                        <div style={{ display: 'flex', gap: '0.75rem', borderBottom: '1px solid var(--border-dark)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                                            <span
                                                className={`tab-pill amber ${orgActionTab === 'Post' ? 'active' : ''}`}
                                                onClick={() => setOrgActionTab('Post')}
                                            >✎ Post</span>
                                            <span
                                                className={`tab-pill cyan ${orgActionTab === 'Poll' ? 'active' : ''}`}
                                                onClick={() => setOrgActionTab('Poll')}
                                            >📊 Poll</span>
                                            <span
                                                className={`tab-pill purple ${orgActionTab === 'Praise' ? 'active' : ''}`}
                                                onClick={() => setOrgActionTab('Praise')}
                                            >🏆 Praise</span>
                                        </div>

                                        {orgActionTab === 'Post' && (
                                            <div style={{ padding: '0.5rem 0' }}>
                                                <textarea
                                                    value={postText}
                                                    onChange={(e) => setPostText(e.target.value)}
                                                    placeholder="Write your post here and mention your peers"
                                                    style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-dark)', color: 'var(--text-main)', resize: 'none', height: '100px', outline: 'none', padding: '1rem', fontSize: '0.9rem', borderRadius: '8px', transition: 'all 0.3s ease' }}
                                                />
                                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                                                    <button
                                                        style={{
                                                            background: postText ? 'linear-gradient(135deg, #ffab00 0%, #f59e0b 100%)' : 'rgba(255,171,0,0.1)',
                                                            color: postText ? '#0a0e17' : 'rgba(255,171,0,0.5)',
                                                            border: postText ? 'none' : '1px solid rgba(255,171,0,0.2)',
                                                            borderRadius: '6px',
                                                            padding: '0.6rem 2rem',
                                                            fontSize: '0.85rem',
                                                            cursor: postText ? 'pointer' : 'default',
                                                            fontWeight: 'bold',
                                                            boxShadow: postText ? '0 4px 12px rgba(245, 158, 11, 0.3)' : 'none'
                                                        }}
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
                                            </div>
                                        )}
                                        {orgActionTab === 'Poll' && (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '0.5rem 0' }}>
                                                <input
                                                    type="text"
                                                    value={poll.question}
                                                    onChange={(e) => setPoll({ ...poll, question: e.target.value })}
                                                    placeholder="Ask something..."
                                                    style={{ ...inputStyle, padding: '0.8rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-dark)', borderRadius: '8px' }}
                                                />
                                                <div style={{ display: 'flex', gap: '1rem' }}>
                                                    <input
                                                        type="text"
                                                        value={poll.option1}
                                                        onChange={(e) => setPoll({ ...poll, option1: e.target.value })}
                                                        placeholder="Option 1"
                                                        style={{ ...inputStyle, padding: '0.8rem', flex: 1, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-dark)', borderRadius: '8px' }}
                                                    />
                                                    <input
                                                        type="text"
                                                        value={poll.option2}
                                                        onChange={(e) => setPoll({ ...poll, option2: e.target.value })}
                                                        placeholder="Option 2"
                                                        style={{ ...inputStyle, padding: '0.8rem', flex: 1, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-dark)', borderRadius: '8px' }}
                                                    />
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                                                    <button
                                                        style={{
                                                            background: 'linear-gradient(135deg, #00d4ff 0%, #0099ff 100%)',
                                                            color: '#0a0e17',
                                                            border: 'none',
                                                            borderRadius: '6px',
                                                            padding: '0.6rem 2rem',
                                                            fontSize: '0.85rem',
                                                            cursor: 'pointer',
                                                            fontWeight: 'bold',
                                                            boxShadow: '0 4px 12px rgba(0, 212, 255, 0.3)'
                                                        }}
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
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '0.5rem 0' }}>
                                                <select
                                                    value={praise.user}
                                                    onChange={(e) => setPraise({ ...praise, user: e.target.value })}
                                                    style={{ ...inputStyle, padding: '0.8rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-dark)', borderRadius: '8px' }}
                                                >
                                                    <option value="">Select a peer to recognize</option>
                                                    {allUsers.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
                                                </select>
                                                <textarea
                                                    value={praise.message}
                                                    onChange={(e) => setPraise({ ...praise, message: e.target.value })}
                                                    placeholder="What did they do great?"
                                                    style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-dark)', color: 'var(--text-main)', resize: 'none', height: '60px', outline: 'none', padding: '0.8rem', fontSize: '0.85rem', borderRadius: '8px' }}
                                                />
                                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                                                    <button
                                                        style={{
                                                            background: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '6px',
                                                            padding: '0.6rem 2rem',
                                                            fontSize: '0.85rem',
                                                            cursor: 'pointer',
                                                            fontWeight: 'bold',
                                                            boxShadow: '0 4px 12px rgba(168, 85, 247, 0.3)'
                                                        }}
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
                                                    style={{ background: '#ffab00', color: '#0a0e17', padding: '0.15rem 0.6rem', borderRadius: '6px', fontWeight: 'bold', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
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
                                                                showAlert(
                                                                    'Are you sure you want to delete this activity?',
                                                                    'confirm',
                                                                    async () => {
                                                                        try {
                                                                            await api.delete(`/social/${activity._id}`);
                                                                            showAlert('Activity deleted successfully.', 'info');
                                                                            fetchPublicData();
                                                                        } catch (err) {
                                                                            showAlert('Failed to delete activity.', 'error');
                                                                        }
                                                                    }
                                                                );
                                                            }}
                                                            style={{ position: 'absolute', top: 0, right: 0, background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.5rem' }}
                                                            title="Delete Activity"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    )}
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.8rem' }}>
                                                        <div className="avatar" style={{ width: '36px', height: '36px', background: activity.type === 'Praise' ? '#ffab00' : '#00ffa2', fontSize: '0.8rem' }}>
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
                                                                                border: hasVoted ? '1px solid #ff00cc' : '1px solid var(--border-dark)',
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
                                                                            <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: `${percent}%`, background: hasVoted ? 'rgba(255, 0, 204, 0.2)' : 'rgba(255, 0, 204, 0.05)', zIndex: 0, transition: 'width 0.4s ease-out' }}></div>
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
                                </>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
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
