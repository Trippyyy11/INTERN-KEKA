import React from 'react';
import moment from 'moment';
import {
    Trash2,
    PartyPopper,
    AlignEndHorizontal,
    MessageSquarePlus,
    Megaphone,
    Award,
    Clock,
    CheckCircle2,
    User,
    BarChart3,
    Heart,
    Plus
} from 'lucide-react';
import api from '../../api/axios';

const CustomTabPill = ({ icon: Icon, label, active, onClick, colorScheme }) => {
    const colors = {
        amber: { bg: 'rgba(245, 158, 11, 0.15)', text: '#f59e0b', hover: 'rgba(245, 158, 11, 0.25)' },
        cyan: { bg: 'rgba(6, 182, 212, 0.15)', text: '#06b6d4', hover: 'rgba(6, 182, 212, 0.25)' },
        blue: { bg: 'rgba(59, 130, 246, 0.15)', text: '#3b82f6', hover: 'rgba(59, 130, 246, 0.25)' },
        purple: { bg: 'rgba(168, 85, 247, 0.15)', text: '#a855f7', hover: 'rgba(168, 85, 247, 0.25)' }
    }[colorScheme] || { bg: 'rgba(var(--primary-rgb), 0.15)', text: 'var(--primary)', hover: 'rgba(var(--primary-rgb), 0.25)' };

    return (
        <div
            onClick={onClick}
            style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.6rem 1.2rem', borderRadius: '14px', cursor: 'pointer',
                background: active ? colors.bg : 'transparent',
                color: active ? colors.text : 'var(--text-muted)',
                fontWeight: active ? '700' : '600',
                fontSize: '0.9rem',
                transition: 'all 0.2s',
                border: active ? `1px solid ${colors.bg}` : `1px solid transparent`
            }}
            onMouseOver={e => !active && (e.currentTarget.style.color = 'var(--text-main)')}
            onMouseOut={e => !active && (e.currentTarget.style.color = 'var(--text-muted)')}
        >
            {Icon && <Icon size={18} />} {label}
        </div>
    );
};

export default function EngageTab({
    user,
    engageTab, setEngageTab,
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
    dashData
}) {

    const bentoPanelStyle = {
        background: isLightMode ? '#ffffff' : 'rgba(255,255,255,0.03)',
        borderRadius: '24px',
        border: isLightMode ? '1px solid #e2e8f0' : '1px solid rgba(255,255,255,0.05)',
        boxShadow: isLightMode ? '0 4px 20px rgba(0,0,0,0.03)' : 'none',
        position: 'relative',
        overflow: 'hidden'
    };

    const inputWrapperStyle = {
        background: isLightMode ? '#f8fafc' : 'rgba(0,0,0,0.2)',
        border: `1px solid ${isLightMode ? '#e2e8f0' : 'rgba(255,255,255,0.08)'}`,
        borderRadius: '16px',
        padding: '1rem',
        transition: 'all 0.3s'
    };

    const inputStyle = {
        width: '100%',
        padding: '1rem 1.25rem',
        background: 'transparent',
        border: 'none',
        color: 'var(--text-main)',
        fontSize: '0.95rem',
        fontWeight: '500',
        outline: 'none',
        fontFamily: 'inherit'
    };

    const handleFocus = (e) => {
        if (e.currentTarget && e.currentTarget.parentElement) {
            e.currentTarget.parentElement.style.borderColor = 'var(--primary)';
            e.currentTarget.parentElement.style.boxShadow = isLightMode ? '0 0 0 3px rgba(59, 130, 246, 0.1)' : '0 0 0 3px rgba(59, 130, 246, 0.2)';
        }
    };

    const handleBlur = (e) => {
        if (e.currentTarget && e.currentTarget.parentElement) {
            e.currentTarget.parentElement.style.borderColor = isLightMode ? '#e2e8f0' : 'rgba(255,255,255,0.08)';
            e.currentTarget.parentElement.style.boxShadow = 'none';
        }
    };

    return (
        <div style={{ padding: '0 1.5rem', marginTop: '1rem', position: 'relative' }}>

            {/* Top Navigation Row */}
            <div style={{
                display: 'inline-flex', alignItems: 'center', background: isLightMode ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.04)',
                padding: '0.35rem', borderRadius: '16px', marginBottom: '2rem'
            }}>
                <button
                    style={{
                        padding: '0.6rem 2rem', borderRadius: '12px', border: 'none',
                        background: engageTab === 'Create' ? (isLightMode ? '#ffffff' : '#1e293b') : 'transparent',
                        color: engageTab === 'Create' ? 'var(--primary)' : 'var(--text-muted)',
                        fontWeight: '800', fontSize: '0.85rem', letterSpacing: '0.5px', cursor: 'pointer',
                        boxShadow: engageTab === 'Create' && isLightMode ? '0 2px 10px rgba(0,0,0,0.05)' : 'none',
                        transition: 'all 0.2s'
                    }}
                    onClick={() => setEngageTab('Create')}
                >
                    CREATE
                </button>
                <button
                    style={{
                        padding: '0.6rem 2rem', borderRadius: '12px', border: 'none',
                        background: engageTab === 'View' ? (isLightMode ? '#ffffff' : '#1e293b') : 'transparent',
                        color: engageTab === 'View' ? 'var(--primary)' : 'var(--text-muted)',
                        fontWeight: '800', fontSize: '0.85rem', letterSpacing: '0.5px', cursor: 'pointer',
                        boxShadow: engageTab === 'View' && isLightMode ? '0 2px 10px rgba(0,0,0,0.05)' : 'none',
                        transition: 'all 0.2s'
                    }}
                    onClick={() => setEngageTab('View')}
                >
                    VIEW
                </button>
            </div>

            {engageTab === 'Create' && (
                <div style={{ display: 'grid', gridTemplateColumns: (user?.role === 'Admin' || user?.role === 'Super Admin') ? '1fr 1fr' : '1fr', gap: '2rem', alignItems: 'start' }}>

                    {/* Creation Bento Panel */}
                    <div style={bentoPanelStyle}>
                        {/* Yellow accent bar */}
                        <div style={{
                            position: 'absolute', top: 0, left: 0, right: 0, height: '4px',
                            background: 'linear-gradient(90deg, #f59e0b, #fbbf24, #fcd34d)',
                            borderRadius: '24px 24px 0 0'
                        }}></div>
                        {/* Internal Tabs */}
                        <div style={{
                            display: 'flex', gap: '0.5rem', borderBottom: `1px solid ${isLightMode ? '#f1f5f9' : 'rgba(255,255,255,0.06)'}`,
                            paddingBottom: '1.25rem', marginBottom: '1.5rem'
                        }}>
                            <CustomTabPill icon={MessageSquarePlus} label="Post" active={orgActionTab === 'Post'} onClick={() => setOrgActionTab('Post')} colorScheme="amber" />
                            <CustomTabPill icon={BarChart3} label="Poll" active={orgActionTab === 'Poll'} onClick={() => setOrgActionTab('Poll')} colorScheme="cyan" />
                            <CustomTabPill icon={Award} label="Praise" active={orgActionTab === 'Praise'} onClick={() => setOrgActionTab('Praise')} colorScheme="blue" />
                        </div>

                        {/* POST Form */}
                        {orgActionTab === 'Post' && (
                            <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                                <div style={inputWrapperStyle}>
                                    <textarea
                                        value={postText}
                                        onChange={(e) => setPostText(e.target.value)}
                                        onFocus={handleFocus}
                                        onBlur={handleBlur}
                                        placeholder="Write your post here and mention your peers..."
                                        style={{ ...inputStyle, resize: 'none', height: '140px', lineHeight: '1.6' }}
                                    />
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                                    <button
                                        style={{
                                            background: postText ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' : (isLightMode ? '#fef3c7' : 'rgba(245, 158, 11, 0.1)'),
                                            color: postText ? '#ffffff' : (isLightMode ? '#d97706' : 'rgba(245, 158, 11, 0.4)'),
                                            border: 'none', borderRadius: '12px', padding: '0.8rem 2.5rem',
                                            fontSize: '0.95rem', fontWeight: '800', cursor: postText ? 'pointer' : 'default',
                                            boxShadow: postText ? '0 4px 15px rgba(245, 158, 11, 0.3)' : 'none',
                                            transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '0.5rem'
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
                                        onMouseOver={e => postText && (e.currentTarget.style.transform = 'translateY(-2px)')}
                                        onMouseOut={e => postText && (e.currentTarget.style.transform = 'translateY(0)')}
                                    >
                                        Share Post
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* POLL Form */}
                        {orgActionTab === 'Poll' && (
                            <div style={{ animation: 'fadeIn 0.3s ease-out', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '0.5rem', paddingLeft: '0.2rem' }}>Question</label>
                                    <div style={inputWrapperStyle}>
                                        <input type="text" value={poll.question} onChange={(e) => setPoll({ ...poll, question: e.target.value })} onFocus={handleFocus} onBlur={handleBlur} placeholder="Ask something..." style={inputStyle} />
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '0.5rem', paddingLeft: '0.2rem' }}>Option 1</label>
                                        <div style={inputWrapperStyle}>
                                            <input type="text" value={poll.option1} onChange={(e) => setPoll({ ...poll, option1: e.target.value })} onFocus={handleFocus} onBlur={handleBlur} placeholder="First option" style={inputStyle} />
                                        </div>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '0.5rem', paddingLeft: '0.2rem' }}>Option 2</label>
                                        <div style={inputWrapperStyle}>
                                            <input type="text" value={poll.option2} onChange={(e) => setPoll({ ...poll, option2: e.target.value })} onFocus={handleFocus} onBlur={handleBlur} placeholder="Second option" style={inputStyle} />
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                                    <button
                                        style={{
                                            background: (poll.question && poll.option1 && poll.option2) ? 'linear-gradient(135deg, #06b6d4 0%, #0284c7 100%)' : (isLightMode ? '#cffafe' : 'rgba(6, 182, 212, 0.1)'),
                                            color: (poll.question && poll.option1 && poll.option2) ? '#ffffff' : (isLightMode ? '#0284c7' : 'rgba(6, 182, 212, 0.4)'),
                                            border: 'none', borderRadius: '12px', padding: '0.8rem 2.5rem',
                                            fontSize: '0.95rem', fontWeight: '800', cursor: (poll.question && poll.option1 && poll.option2) ? 'pointer' : 'default',
                                            boxShadow: (poll.question && poll.option1 && poll.option2) ? '0 4px 15px rgba(6, 182, 212, 0.3)' : 'none',
                                            transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '0.5rem'
                                        }}
                                        onClick={async () => {
                                            if (poll.question && poll.option1 && poll.option2) {
                                                try {
                                                    await api.post('/social', {
                                                        type: 'Poll',
                                                        pollData: { question: poll.question, options: [{ text: poll.option1 }, { text: poll.option2 }] }
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
                                        disabled={!(poll.question && poll.option1 && poll.option2)}
                                    >
                                        Create Poll
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* PRAISE Form */}
                        {orgActionTab === 'Praise' && (
                            <div style={{ animation: 'fadeIn 0.3s ease-out', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '0.5rem', paddingLeft: '0.2rem' }}>Team Member</label>
                                    <div style={{ ...inputWrapperStyle, padding: '0 1rem' }}>
                                        <select
                                            value={praise.user}
                                            onChange={(e) => setPraise({ ...praise, user: e.target.value })}
                                            onFocus={handleFocus} onBlur={handleBlur}
                                            style={{ ...inputStyle, padding: '1rem 0', cursor: 'pointer' }}
                                        >
                                            <option value="" disabled>Select a peer to recognize</option>
                                            {allUsers.map(u => <option key={u._id} value={u._id} style={{ background: isLightMode ? '#fff' : '#1e293b' }}>{u.name}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '0.5rem', paddingLeft: '0.2rem' }}>Message</label>
                                    <div style={inputWrapperStyle}>
                                        <textarea
                                            value={praise.message}
                                            onChange={(e) => setPraise({ ...praise, message: e.target.value })}
                                            onFocus={handleFocus} onBlur={handleBlur}
                                            placeholder="What did they do great?"
                                            style={{ ...inputStyle, resize: 'none', height: '100px', lineHeight: '1.6' }}
                                        />
                                    </div>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                                    <button
                                        style={{
                                            background: (praise.user && praise.message) ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' : (isLightMode ? '#dbeafe' : 'rgba(59, 130, 246, 0.1)'),
                                            color: (praise.user && praise.message) ? '#ffffff' : (isLightMode ? '#1d4ed8' : 'rgba(59, 130, 246, 0.4)'),
                                            border: 'none', borderRadius: '12px', padding: '0.8rem 2.5rem',
                                            fontSize: '0.95rem', fontWeight: '800', cursor: (praise.user && praise.message) ? 'pointer' : 'default',
                                            boxShadow: (praise.user && praise.message) ? '0 4px 15px rgba(59, 130, 246, 0.3)' : 'none',
                                            transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '0.5rem'
                                        }}
                                        onClick={async () => {
                                            if (praise.user && praise.message) {
                                                try {
                                                    await api.post('/social', {
                                                        type: 'Praise', content: praise.message, praiseData: { recipient: praise.user }
                                                    });
                                                    showAlert(`Praise sent successfully!`, 'info');
                                                    setPraise({ user: '', message: '' });
                                                    fetchPublicData();
                                                } catch (err) {
                                                    showAlert('Failed to send praise', 'error');
                                                }
                                            }
                                        }}
                                        disabled={!(praise.user && praise.message)}
                                    >
                                        Send Praise
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Announcement CTA (Admin) - Right Column */}
                    {(user?.role === 'Admin' || user?.role === 'Super Admin') && (
                        <div style={{ ...bentoPanelStyle, position: 'sticky', top: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2.5rem 2rem', textAlign: 'center' }}>
                            {/* Gradient accent bar */}
                            <div style={{
                                position: 'absolute', top: 0, left: 0, right: 0, height: '4px',
                                background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #a78bfa)',
                                borderRadius: '24px 24px 0 0'
                            }}></div>

                            <div style={{
                                width: '60px', height: '60px', borderRadius: '20px',
                                background: 'linear-gradient(135deg, rgba(var(--primary-rgb),0.15), rgba(var(--primary-rgb),0.05))',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem',
                                boxShadow: '0 4px 16px rgba(var(--primary-rgb),0.1)'
                            }}>
                                <Megaphone size={28} color="var(--primary)" />
                            </div>
                            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '900', color: 'var(--text-main)', marginBottom: '0.5rem' }}>Global Announcement</h3>
                            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.88rem', fontWeight: '500', marginBottom: '2rem', lineHeight: '1.6', maxWidth: '280px' }}>
                                Broadcast important updates to the entire organization instantly.
                            </p>
                            <button
                                style={{
                                    padding: '0.85rem 2.5rem', borderRadius: '14px', fontWeight: '800', fontSize: '0.9rem',
                                    background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', border: 'none', cursor: 'pointer',
                                    boxShadow: '0 6px 20px rgba(99,102,241,0.3)',
                                    transition: 'all 0.25s',
                                    display: 'flex', alignItems: 'center', gap: '0.5rem'
                                }}
                                onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(99,102,241,0.4)'; }}
                                onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(99,102,241,0.3)'; }}
                                onClick={() => setShowAnnouncementModal(true)}
                            >
                                <Plus size={18} /> Create Announcement
                            </button>


                        </div>
                    )}
                </div>
            )}

            {engageTab === 'View' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '2rem', alignItems: 'start' }}>

                    {/* Left Column: Announcements */}
                    <div style={{ ...bentoPanelStyle, position: 'sticky', top: '1.5rem', padding: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: `1px solid ${isLightMode ? '#f1f5f9' : 'rgba(255,255,255,0.06)'}`, paddingBottom: '1rem' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'linear-gradient(135deg, rgba(var(--primary-rgb), 0.15), rgba(var(--primary-rgb), 0.05))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Megaphone size={16} color="var(--primary)" />
                            </div>
                            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '0.5px' }}>Announcements</h3>
                        </div>

                        {dashData.announcements.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {dashData.announcements.map(a => (
                                    <div key={a._id} style={{
                                        background: isLightMode ? '#f8fafc' : 'rgba(0,0,0,0.15)', border: `1px solid ${isLightMode ? '#e2e8f0' : 'rgba(255,255,255,0.04)'}`,
                                        borderRadius: '16px', padding: '1.25rem', transition: 'all 0.2s',
                                        boxShadow: isLightMode ? '0 2px 8px rgba(0,0,0,0.02)' : 'none'
                                    }} onMouseOver={e => e.currentTarget.style.borderColor = 'var(--primary)'} onMouseOut={e => e.currentTarget.style.borderColor = isLightMode ? '#e2e8f0' : 'rgba(255,255,255,0.04)'}>
                                        <div style={{ fontWeight: '800', fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: '0.4rem', lineHeight: '1.4' }}>{a.title}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.5', fontWeight: '500' }}>{a.content}</div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ padding: '2rem 1rem', textAlign: 'center' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                                    <Megaphone size={20} color="var(--text-muted)" style={{ opacity: 0.5 }} />
                                </div>
                                <div style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)' }}>No recent announcements</div>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Social Feed */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {socialFeed.length > 0 ? socialFeed.map(activity => {
                            const canDelete = user?._id === activity.author?._id || user?.role === 'Admin' || user?.role === 'Super Admin';

                            return (
                                <div key={activity._id} style={{ ...bentoPanelStyle, padding: '2rem', display: 'flex', gap: '1.5rem' }}>
                                    {canDelete && (
                                        <button
                                            onClick={() => {
                                                showAlert('Are you sure you want to delete this activity?', 'confirm', async () => {
                                                    try {
                                                        await api.delete(`/social/${activity._id}`);
                                                        showAlert('Activity deleted successfully.', 'info');
                                                        fetchPublicData();
                                                    } catch (err) {
                                                        showAlert('Failed to delete activity.', 'error');
                                                    }
                                                });
                                            }}
                                            style={{
                                                position: 'absolute', top: '1.5rem', right: '1.5rem', width: '32px', height: '32px', borderRadius: '10px',
                                                background: isLightMode ? '#f1f5f9' : 'rgba(255,255,255,0.06)', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s'
                                            }}
                                            title="Delete Activity"
                                            onMouseOver={e => { e.currentTarget.style.background = '#f43f5e'; e.currentTarget.style.color = '#fff' }}
                                            onMouseOut={e => { e.currentTarget.style.background = isLightMode ? '#f1f5f9' : 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'var(--text-muted)' }}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}

                                    {/* Avatar Column */}
                                    <div style={{ flexShrink: 0 }}>
                                        <div style={{
                                            width: '48px', height: '48px', borderRadius: '16px', overflow: 'hidden',
                                            background: 'linear-gradient(135deg, var(--primary), rgba(var(--primary-rgb), 0.7))',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.1rem', fontWeight: '800'
                                        }}>
                                            {activity.author?.avatar ? <img src={activity.author.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : activity.author?.name?.substring(0, 2).toUpperCase()}
                                        </div>
                                    </div>

                                    {/* Content Column */}
                                    <div style={{ flex: 1, paddingRight: '2.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
                                            <div style={{ fontWeight: '800', fontSize: '1rem', color: 'var(--text-main)' }}>{activity.author?.name}</div>
                                            <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--text-muted)', opacity: 0.5 }}></div>
                                            <div style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)' }}>{moment(activity.createdAt).fromNow()}</div>
                                            <div style={{
                                                fontSize: '0.65rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px', padding: '0.25rem 0.6rem', borderRadius: '8px',
                                                background: activity.type === 'Post' ? 'rgba(245, 158, 11, 0.1)' : (activity.type === 'Poll' ? 'rgba(6, 182, 212, 0.1)' : 'rgba(59, 130, 246, 0.1)'),
                                                color: activity.type === 'Post' ? '#f59e0b' : (activity.type === 'Poll' ? '#06b6d4' : '#3b82f6')
                                            }}>{activity.type}</div>
                                        </div>

                                        {/* POST Content */}
                                        {activity.type === 'Post' && (
                                            <div style={{ fontSize: '0.95rem', color: 'var(--text-main)', lineHeight: '1.6', whiteSpace: 'pre-wrap', fontWeight: '500' }}>
                                                {activity.content}
                                            </div>
                                        )}

                                        {/* PRAISE Content */}
                                        {activity.type === 'Praise' && (
                                            <div style={{
                                                background: isLightMode ? '#f8fafc' : 'rgba(0,0,0,0.15)', border: `1px solid ${isLightMode ? '#e2e8f0' : 'rgba(255,255,255,0.06)'}`,
                                                borderRadius: '20px', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem', marginTop: '0.5rem'
                                            }}>
                                                <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <Award size={32} color="#3b82f6" />
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: '1rem', color: 'var(--text-main)', fontWeight: '500', marginBottom: '0.4rem' }}>
                                                        Recognized <span style={{ fontWeight: '800', color: '#3b82f6' }}>{activity.praiseData?.recipient?.name}</span>
                                                    </div>
                                                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.5', fontStyle: 'italic', fontWeight: '500' }}>
                                                        "{activity.content}"
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* POLL Content */}
                                        {activity.type === 'Poll' && (
                                            <div style={{ marginTop: '0.5rem' }}>
                                                <div style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '1.5rem', lineHeight: '1.4' }}>
                                                    {activity.pollData?.question}
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                                    {activity.pollData?.options?.map(opt => {
                                                        const totalVotes = activity.pollData.options.reduce((sum, o) => sum + o.votes.length, 0);
                                                        const percent = totalVotes === 0 ? 0 : Math.round((opt.votes.length / totalVotes) * 100);
                                                        const hasVoted = opt.votes.includes(user?._id);

                                                        return (
                                                            <div
                                                                key={opt._id}
                                                                style={{
                                                                    position: 'relative',
                                                                    background: isLightMode ? '#ffffff' : 'rgba(255,255,255,0.02)',
                                                                    border: hasVoted ? `2px solid var(--primary)` : `1px solid ${isLightMode ? '#e2e8f0' : 'rgba(255,255,255,0.08)'}`,
                                                                    borderRadius: '16px',
                                                                    padding: '1rem 1.25rem',
                                                                    cursor: 'pointer',
                                                                    overflow: 'hidden',
                                                                    boxShadow: hasVoted ? '0 4px 12px rgba(var(--primary-rgb), 0.15)' : (isLightMode ? '0 2px 6px rgba(0,0,0,0.02)' : 'none'),
                                                                    transition: 'all 0.2s'
                                                                }}
                                                                onClick={async () => {
                                                                    try {
                                                                        await api.post(`/social/${activity._id}/vote`, { optionId: opt._id });
                                                                        fetchPublicData();
                                                                    } catch (err) {
                                                                        showAlert('Failed to vote', 'error');
                                                                    }
                                                                }}
                                                                onMouseOver={e => !hasVoted && (e.currentTarget.style.borderColor = 'var(--text-muted)')}
                                                                onMouseOut={e => !hasVoted && (e.currentTarget.style.borderColor = isLightMode ? '#e2e8f0' : 'rgba(255,255,255,0.08)')}
                                                            >
                                                                <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: `${percent}%`, background: hasVoted ? 'rgba(var(--primary-rgb), 0.15)' : (isLightMode ? '#f1f5f9' : 'rgba(255,255,255,0.05)'), zIndex: 0, transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)' }}></div>

                                                                <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                    <span style={{ fontWeight: hasVoted ? '800' : '600', color: hasVoted ? 'var(--primary)' : 'var(--text-main)', fontSize: '0.95rem' }}>{opt.text}</span>
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                                        {hasVoted && <CheckCircle2 size={16} color="var(--primary)" />}
                                                                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '700' }}>
                                                                            {percent}% <span style={{ opacity: 0.5 }}>({opt.votes.length})</span>
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                                <div style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)', marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                    <BarChart3 size={14} /> Total Votes: {activity.pollData.options.reduce((sum, o) => sum + o.votes.length, 0)}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        }) : (
                            <div style={{ ...bentoPanelStyle, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem', textAlign: 'center' }}>
                                <div style={{
                                    width: '80px', height: '80px', borderRadius: '24px', background: isLightMode ? '#f8fafc' : 'rgba(255,255,255,0.03)',
                                    border: `1px solid ${isLightMode ? '#e2e8f0' : 'rgba(255,255,255,0.06)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    marginBottom: '1.5rem', boxShadow: '0 10px 25px rgba(0,0,0,0.05)'
                                }}>
                                    <MessageSquarePlus size={32} style={{ color: 'var(--text-muted)', opacity: 0.5 }} />
                                </div>
                                <h3 style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--text-main)', margin: '0 0 0.5rem 0' }}>No activity yet</h3>
                                <p style={{ fontSize: '0.95rem', maxWidth: '300px', margin: 0, color: 'var(--text-muted)', lineHeight: '1.5', fontWeight: '500' }}>
                                    Be the first to post, create a poll, or praise a peer!
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(5px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
