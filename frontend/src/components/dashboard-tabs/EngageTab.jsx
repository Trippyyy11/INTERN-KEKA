import React from 'react';
import { Trash2, PartyPopper, AlignEndHorizontal } from 'lucide-react';
import api from '../../api/axios';

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
                    className={`tab-pill primary ${engageTab === 'Create' ? 'active' : ''}`}
                    style={{ fontSize: '0.85rem', fontWeight: '800', letterSpacing: '0.5px' }}
                    onClick={() => setEngageTab('Create')}
                >
                    CREATE
                </span>
                <span
                    className={`tab-pill primary ${engageTab === 'View' ? 'active' : ''}`}
                    style={{ fontSize: '0.85rem', fontWeight: '800', letterSpacing: '0.5px' }}
                    onClick={() => setEngageTab('View')}
                >
                    VIEW
                </span>
            </div>

            {engageTab === 'Create' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="panel" style={{ padding: '1.5rem' }}>
                        <div style={{ display: 'flex', gap: '0.75rem', borderBottom: '1px solid var(--border-dark)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                            <span
                                className={`tab-pill amber ${orgActionTab === 'Post' ? 'active' : ''}`}
                                onClick={() => setOrgActionTab('Post')}
                            >✎ Post</span>
                            <span
                                className={`tab-pill cyan ${orgActionTab === 'Poll' ? 'active' : ''}`}
                                onClick={() => setOrgActionTab('Poll')}
                            ><AlignEndHorizontal /> Poll</span>
                            <span
                                className={`tab-pill blue ${orgActionTab === 'Praise' ? 'active' : ''}`}
                                onClick={() => setOrgActionTab('Praise')}
                            > <PartyPopper />Praise</span>
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
                                            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '8px',
                                            padding: '0.6rem 2rem',
                                            fontSize: '0.9rem',
                                            cursor: 'pointer',
                                            fontWeight: 'bold',
                                            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
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

                    {(user?.role === 'Admin' || user?.role === 'Super Admin') && (
                        <div className="panel" style={{ padding: '2rem', textAlign: 'center', border: '2px dashed var(--border-dark)', background: 'transparent' }}>
                            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem', color: 'var(--text-main)' }}>Announcement</div>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Post a new announcement for the entire organization.</p>
                            <button
                                className="btn btn-primary"
                                style={{ padding: '0.75rem 2rem', borderRadius: '8px', fontWeight: 'bold' }}
                                onClick={() => setShowAnnouncementModal(true)}
                            >
                                + Create Announcement
                            </button>
                        </div>
                    )}
                </div>
            )}

            {engageTab === 'View' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* Announcements list */}
                    <div className="panel" style={{ padding: '1.5rem', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)' }}>
                        <div style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--text-main)', marginBottom: dashData.announcements.length > 0 ? '1.5rem' : 0 }}>Announcements</div>
                        {dashData.announcements.length > 0 ? dashData.announcements.map(a => (
                            <div key={a._id} style={{ marginBottom: '0.8rem', padding: '1rem', background: isLightMode ? '#f3f4f6' : 'rgba(255,255,255,0.05)', borderRadius: '6px' }}>
                                <div style={{ fontWeight: '600', fontSize: '0.85rem', color: 'var(--text-main)', marginBottom: '0.2rem' }}>{a.title}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{a.content}</div>
                            </div>
                        )) : (
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No announcements</div>
                        )}
                    </div>

                    {/* Team Activity list */}
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
                                                                border: hasVoted ? '1px solid var(--primary)' : '1px solid var(--border-dark)',
                                                                borderRadius: '12px',
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
                                                            <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: `${percent}%`, background: hasVoted ? 'rgba(var(--primary-rgb), 0.2)' : 'rgba(var(--primary-rgb), 0.05)', zIndex: 0, transition: 'width 0.4s ease-out' }}></div>

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
                            );
                        }) : (
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>No activity yet. Be the first to post!</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
