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
    const [viewSubTab, setViewSubTab] = React.useState('Announcements');

    const bentoPanelStyle = {
        background: isLightMode ? '#ffffff' : 'rgba(255,255,255,0.035)',
        borderRadius: '28px',
        border: isLightMode ? '1px solid #e2e8f0' : '1px solid rgba(255,255,255,0.06)',
        boxShadow: isLightMode ? '0 10px 40px rgba(0,0,0,0.04)' : '0 15px 50px rgba(0,0,0,0.25)',
        position: 'relative',
        overflow: 'hidden',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
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

            {/* Top Navigation Row (Hidden for Interns) */}
            {user?.role !== 'Intern' && (
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
            )}

            {(engageTab === 'Create' && user?.role !== 'Intern') && (
                <div style={{ display: 'grid', gridTemplateColumns: (user?.role === 'Reporting Manager' || user?.role === 'Super Admin') ? '1fr 1fr' : '1fr', gap: '2rem', alignItems: 'start' }}>

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
                    {(user?.role === 'Reporting Manager' || user?.role === 'Super Admin') && (
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

            {(engageTab === 'View' || user?.role === 'Intern') && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', alignItems: 'stretch' }}>
                    
                    {/* Inner Toggle for View Mode */}
                    <div style={{
                        display: 'flex', gap: '0.5rem', borderBottom: `1px solid ${isLightMode ? '#f1f5f9' : 'rgba(255,255,255,0.06)'}`,
                        paddingBottom: '1rem', marginTop: '-1rem'
                    }}>
                        <CustomTabPill icon={Megaphone} label="Announcements" active={viewSubTab === 'Announcements'} onClick={() => setViewSubTab('Announcements')} colorScheme="purple" />
                        <CustomTabPill icon={MessageSquarePlus} label="Social Feed" active={viewSubTab === 'Social Feed'} onClick={() => setViewSubTab('Social Feed')} colorScheme="blue" />
                    </div>

                    {/* Announcements Tab */}
                    {viewSubTab === 'Announcements' && (
                        <div style={{ ...bentoPanelStyle, padding: '2rem', animation: 'fadeIn 0.3s ease-out' }}>
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
                                        position: 'relative', overflow: 'hidden',
                                        background: isLightMode ? '#ffffff' : 'rgba(255,255,255,0.02)',
                                        border: `1px solid ${isLightMode ? '#e2e8f0' : 'rgba(255,255,255,0.08)'}`,
                                        borderLeft: '4px solid #8b5cf6',
                                        borderRadius: '12px', padding: '1.25rem 1.5rem', transition: 'all 0.2s',
                                        boxShadow: isLightMode ? '0 4px 12px rgba(0,0,0,0.02)' : 'none'
                                    }} onMouseOver={e => e.currentTarget.style.transform = 'translateX(4px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateX(0)'}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                            <div style={{ fontWeight: '800', fontSize: '1rem', color: 'var(--text-main)' }}>{a.title}</div>
                                            <div style={{ fontSize: '0.65rem', color: '#8b5cf6', fontWeight: '800', background: 'rgba(139, 92, 246, 0.1)', padding: '0.2rem 0.6rem', borderRadius: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Important</div>
                                        </div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.6', fontWeight: '500' }}>{a.content}</div>
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
                    )}

                    {/* Social Feed Tab */}
                    {viewSubTab === 'Social Feed' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '850px', margin: '0 auto', width: '100%', animation: 'fadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', padding: '0 0.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ width: '42px', height: '42px', borderRadius: '14px', background: 'rgba(var(--primary-rgb), 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(var(--primary-rgb), 0.05)' }}>
                                        <MessageSquarePlus size={20} color="var(--primary)" />
                                    </div>
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '900', color: 'var(--text-main)', letterSpacing: '-0.5px' }}>Social Feed</h3>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '2px' }}>
                                            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)' }}>Latest updates from your team</span>
                                            <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--text-muted)', opacity: 0.3 }}></span>
                                            <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--primary)' }}>{socialFeed.length} Activities</span>
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px #22c55e' }}></div>
                                    <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>LIVE FEED</span>
                                </div>
                            </div>

                            {socialFeed.length > 0 ? socialFeed.map(activity => {
                                const canDelete = user?._id === activity.author?._id || user?.role === 'Reporting Manager' || user?.role === 'Super Admin';
                                const typeColors = {
                                    Post: { accent: '#f59e0b', bg: 'rgba(245, 158, 11, 0.08)' },
                                    Poll: { accent: '#06b6d4', bg: 'rgba(6, 182, 212, 0.08)' },
                                    Praise: { accent: '#6366f1', bg: 'rgba(99, 102, 241, 0.08)' }
                                };
                                const colors = typeColors[activity.type] || typeColors.Post;

                                return (
                                    <div 
                                        key={activity._id} 
                                        style={{ ...bentoPanelStyle, padding: '2.5rem', display: 'flex', gap: '1.75rem' }}
                                        onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = isLightMode ? '0 20px 40px rgba(0,0,0,0.06)' : '0 25px 60px rgba(0,0,0,0.35)'; }}
                                        onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = bentoPanelStyle.boxShadow; }}
                                    >
                                        {/* Type Accent Bar */}
                                        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '5px', background: colors.accent, opacity: 0.8 }}></div>

                                        {canDelete && (
                                            <button
                                                onClick={() => {
                                                    showAlert('Are you sure you want to delete this activity?', 'confirm', async () => {
                                                        try { await api.delete(`/social/${activity._id}`); showAlert('Activity deleted successfully.', 'info'); fetchPublicData(); } 
                                                        catch (err) { showAlert('Failed to delete activity.', 'error'); }
                                                    });
                                                }}
                                                style={{
                                                    position: 'absolute', top: '1.5rem', right: '1.5rem', width: '36px', height: '36px', borderRadius: '12px',
                                                    background: isLightMode ? '#f1f5f9' : 'rgba(255,255,255,0.06)', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', zIndex: 10
                                                }}
                                                onMouseOver={e => { e.currentTarget.style.background = '#f43f5e'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.transform = 'rotate(90deg)'; }}
                                                onMouseOut={e => { e.currentTarget.style.background = isLightMode ? '#f1f5f9' : 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.transform = 'rotate(0deg)'; }}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}

                                        {/* Avatar Column */}
                                        <div style={{ flexShrink: 0 }}>
                                            <div style={{
                                                width: '56px', height: '56px', borderRadius: '18px', overflow: 'hidden',
                                                background: 'linear-gradient(135deg, var(--primary), rgba(var(--primary-rgb), 0.7))',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.2rem', fontWeight: '900',
                                                boxShadow: '0 8px 16px rgba(var(--primary-rgb), 0.2)'
                                            }}>
                                                {activity.author?.avatar ? <img src={activity.author.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : activity.author?.name?.substring(0, 2).toUpperCase()}
                                            </div>
                                        </div>

                                        {/* Content Column */}
                                        <div style={{ flex: 1, paddingRight: '1rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.5rem' }}>
                                                <div>
                                                    <div style={{ fontWeight: '900', fontSize: '1.1rem', color: 'var(--text-main)', letterSpacing: '-0.3px' }}>{activity.author?.name}</div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '2px' }}>
                                                        <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)' }}>{moment(activity.createdAt).fromNow()}</div>
                                                        <span style={{ width: '3px', height: '3px', borderRadius: '50%', background: 'var(--text-muted)', opacity: 0.3 }}></span>
                                                        <div style={{ fontSize: '0.65rem', fontWeight: '900', color: colors.accent, background: colors.bg, padding: '2px 8px', borderRadius: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{activity.type}</div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* POST Content */}
                                            {activity.type === 'Post' && (
                                                <div style={{ fontSize: '1.05rem', color: 'var(--text-main)', lineHeight: '1.7', whiteSpace: 'pre-wrap', fontWeight: '500', letterSpacing: '-0.1px' }}>
                                                    {activity.content}
                                                </div>
                                            )}

                                            {/* PRAISE Content */}
                                            {activity.type === 'Praise' && (
                                                <div style={{
                                                    background: isLightMode ? 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)' : 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(99, 102, 241, 0.03) 100%)', 
                                                    border: `1px solid ${isLightMode ? '#e2e8f0' : 'rgba(99, 102, 241, 0.15)'}`,
                                                    borderRadius: '24px', padding: '2rem', display: 'flex', alignItems: 'center', gap: '1.75rem', marginTop: '0.5rem',
                                                    position: 'relative', overflow: 'hidden'
                                                }}>
                                                    {/* Decorative background icon */}
                                                    <Award size={120} color={colors.accent} style={{ position: 'absolute', right: '-20px', bottom: '-20px', opacity: 0.05, transform: 'rotate(-15deg)' }} />
                                                    
                                                    <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: 'rgba(99, 102, 241, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px rgba(99, 102, 241, 0.15)' }}>
                                                        <Award size={36} color="#6366f1" />
                                                    </div>
                                                    <div style={{ position: 'relative', zIndex: 1 }}>
                                                        <div style={{ fontSize: '1.1rem', color: 'var(--text-main)', fontWeight: '600', marginBottom: '0.6rem' }}>
                                                            Recognized <span style={{ fontWeight: '900', color: '#6366f1', textDecoration: 'underline decoration-thickness-2' }}>{activity.praiseData?.recipient?.name}</span>
                                                        </div>
                                                        <div style={{ fontSize: '1rem', lineHeight: '1.6', fontStyle: 'italic', fontWeight: '500', color: isLightMode ? '#475569' : '#94a3b8' }}>
                                                            "{activity.content}"
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* POLL Content */}
                                            {activity.type === 'Poll' && (
                                                <div style={{ marginTop: '0.5rem' }}>
                                                    <div style={{ fontSize: '1.15rem', fontWeight: '900', color: 'var(--text-main)', marginBottom: '2rem', lineHeight: '1.4', letterSpacing: '-0.4px' }}>
                                                        {activity.pollData?.question}
                                                    </div>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
                                                                        border: hasVoted ? `2px solid #06b6d4` : `1px solid ${isLightMode ? '#e2e8f0' : 'rgba(255,255,255,0.08)'}`,
                                                                        borderRadius: '18px',
                                                                        padding: '1.25rem 1.5rem',
                                                                        cursor: 'pointer',
                                                                        overflow: 'hidden',
                                                                        boxShadow: hasVoted ? '0 8px 24px rgba(6, 182, 212, 0.2)' : 'none',
                                                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                                                                    }}
                                                                    onClick={async () => {
                                                                        try { await api.post(`/social/${activity._id}/vote`, { optionId: opt._id }); fetchPublicData(); } 
                                                                        catch (err) { showAlert('Failed to vote', 'error'); }
                                                                    }}
                                                                    onMouseOver={e => !hasVoted && (e.currentTarget.style.borderColor = '#06b6d4')}
                                                                    onMouseOut={e => !hasVoted && (e.currentTarget.style.borderColor = isLightMode ? '#e2e8f0' : 'rgba(255,255,255,0.08)')}
                                                                >
                                                                    <div style={{ 
                                                                        position: 'absolute', top: 0, left: 0, bottom: 0, 
                                                                        width: `${percent}%`, 
                                                                        background: hasVoted ? 'linear-gradient(90deg, rgba(6, 182, 212, 0.2), rgba(6, 182, 212, 0.1))' : (isLightMode ? 'linear-gradient(90deg, #f1f5f9, #f8fafc)' : 'rgba(255,255,255,0.04)'), 
                                                                        zIndex: 0, transition: 'width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)' 
                                                                    }}></div>

                                                                    <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                                            <span style={{ fontWeight: hasVoted ? '900' : '700', color: hasVoted ? '#06b6d4' : 'var(--text-main)', fontSize: '1rem' }}>{opt.text}</span>
                                                                            {hasVoted && <div style={{ background: '#06b6d4', padding: '2px 8px', borderRadius: '6px', color: '#fff', fontSize: '0.6rem', fontWeight: '900', letterSpacing: '0.5px' }}>VOTED</div>}
                                                                        </div>
                                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                                            <span style={{ fontSize: '1rem', color: hasVoted ? '#06b6d4' : 'var(--text-muted)', fontWeight: '900' }}>{percent}%</span>
                                                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600', opacity: 0.6 }}>{opt.votes.length} votes</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            }) : (
                                <div style={{ ...bentoPanelStyle, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5rem 2rem', textAlign: 'center' }}>
                                    <div style={{
                                        width: '90px', height: '90px', borderRadius: '30px', background: isLightMode ? '#f8fafc' : 'rgba(255,255,255,0.03)',
                                        border: `1px solid ${isLightMode ? '#e2e8f0' : 'rgba(255,255,255,0.06)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        marginBottom: '2rem', boxShadow: '0 15px 35px rgba(0,0,0,0.05)'
                                    }}>
                                        <MessageSquarePlus size={36} style={{ color: 'var(--text-muted)', opacity: 0.4 }} />
                                    </div>
                                    <h3 style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--text-main)', margin: '0 0 0.75rem 0', letterSpacing: '-0.5px' }}>Your Feed is Empty</h3>
                                    <p style={{ fontSize: '1rem', maxWidth: '340px', margin: 0, color: 'var(--text-muted)', lineHeight: '1.6', fontWeight: '500' }}>
                                        Be the first to share an update, start a poll, or recognize a peer's hard work!
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
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
