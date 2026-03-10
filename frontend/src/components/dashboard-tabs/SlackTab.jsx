import { useState, useEffect, useCallback, useRef } from 'react';
import { Search, RefreshCw, Hash, MessageSquare, AlertCircle, Users, Settings, Eye, EyeOff, Check, X, Key, Trash2, Maximize2, Minimize2 } from 'lucide-react';
import api from '../../api/axios';

const SlackTab = ({ user }) => {
    // ---- DATA STATE ----
    const [channels, setChannels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [fetchedAt, setFetchedAt] = useState(null);
    const [configured, setConfigured] = useState(null); // null = checking

    // ---- TOKEN STATE ----
    const [showSettings, setShowSettings] = useState(false);
    const [tokenInput, setTokenInput] = useState('');
    const [tokenPreview, setTokenPreview] = useState(null);
    const [hasToken, setHasToken] = useState(false);
    const [showToken, setShowToken] = useState(false);
    const [savingToken, setSavingToken] = useState(false);
    const [tokenError, setTokenError] = useState('');
    const [tokenSuccess, setTokenSuccess] = useState('');

    // ---- SPLIT VIEW STATE ----
    // Array of up to 4 channel objects representing the active views
    const [activeViews, setActiveViews] = useState([]);
    const [draggedChannel, setDraggedChannel] = useState(null);
    const [isFullScreen, setIsFullScreen] = useState(false);

    // Fetch token status
    const fetchTokenStatus = useCallback(async () => {
        try {
            const res = await api.get('/slack/token-status');
            setHasToken(res.data.hasToken);
            setTokenPreview(res.data.tokenPreview);
        } catch (err) {
            console.error('Failed to fetch token status');
        }
    }, []);

    const fetchUpdates = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.get('/slack/intern-updates');
            const fetchedChannels = res.data.channels || [];
            setChannels(fetchedChannels);
            setFetchedAt(res.data.fetchedAt);
            setConfigured(res.data.configured !== false);
            if (res.data.configured === false && !hasToken) {
                setShowSettings(true);
            }

            // Sync active views with fresh data
            setActiveViews(prevViews =>
                prevViews.map(view => {
                    const freshChannel = fetchedChannels.find(c => c.id === view.id);
                    return freshChannel || view;
                })
            );

        } catch (err) {
            const data = err.response?.data;
            if (data?.configured === false || err.response?.status === 403) {
                setConfigured(false);
                setError(data?.message || 'Slack integration is not fully configured.');
                if (data?.neededScope) {
                    setTokenError(`Missing required scope: ${data.neededScope}`);
                }
                setShowSettings(true);
            } else {
                setError(data?.message || 'Failed to fetch Slack updates');
                setConfigured(true);
            }
        } finally {
            setLoading(false);
        }
    }, [hasToken]);

    useEffect(() => {
        fetchTokenStatus();
        fetchUpdates();
    }, [fetchTokenStatus, fetchUpdates]);

    const handleSaveToken = async () => {
        if (!tokenInput.trim()) {
            setTokenError('Please enter a token');
            return;
        }
        setSavingToken(true);
        setTokenError('');
        setTokenSuccess('');
        try {
            const res = await api.put('/slack/token', { slackBotToken: tokenInput.trim() });
            setTokenSuccess(res.data.message);
            setHasToken(true);
            setTokenInput('');
            setShowToken(false);
            fetchTokenStatus();
            setTimeout(() => {
                fetchUpdates();
                setShowSettings(false);
            }, 500);
        } catch (err) {
            setTokenError(err.response?.data?.message || 'Failed to save token');
        } finally {
            setSavingToken(false);
        }
    };

    const handleRemoveToken = async () => {
        setSavingToken(true);
        setTokenError('');
        setTokenSuccess('');
        try {
            const res = await api.put('/slack/token', { slackBotToken: '' });
            setTokenSuccess(res.data.message);
            setHasToken(false);
            setTokenPreview(null);
            setConfigured(false);
            setChannels([]);
            setActiveViews([]);
            fetchTokenStatus();
        } catch (err) {
            setTokenError(err.response?.data?.message || 'Failed to remove token');
        } finally {
            setSavingToken(false);
        }
    };

    // ---- DRAG AND DROP HANDLERS ----
    const handleDragStart = (e, channel) => {
        setDraggedChannel(channel);
        e.dataTransfer.effectAllowed = 'copy';
        // Add a slight delay to allow the drag image to generate before setting styles
        setTimeout(() => {
            e.target.style.opacity = '0.5';
        }, 0);
    };

    const handleDragEnd = (e) => {
        e.target.style.opacity = '1';
        setDraggedChannel(null);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
    };

    const handleDrop = (e, targetIndex) => {
        e.preventDefault();
        if (!draggedChannel) return;

        // Prevent dropping the same channel twice
        if (activeViews.some(v => v.id === draggedChannel.id)) {
            return;
        }

        const newViews = [...activeViews];
        if (targetIndex !== undefined) {
            // Replace existing view or insert at specific index
            newViews[targetIndex] = draggedChannel;
        } else if (activeViews.length < 4) {
            // Add to end
            newViews.push(draggedChannel);
        } else {
            // Replace the last one if grid is full
            newViews[3] = draggedChannel;
        }
        setActiveViews(newViews);
    };

    const removeView = (indexToRemove) => {
        setActiveViews(activeViews.filter((_, idx) => idx !== indexToRemove));
    };

    const addChannelToViewClick = (channel) => {
        if (activeViews.some(v => v.id === channel.id)) return;
        if (activeViews.length < 4) {
            setActiveViews([...activeViews, channel]);
        } else {
            // Replace the oldest one (first item) with the new one
            setActiveViews([...activeViews.slice(1), channel]);
        }
    };

    // ---- FORMATTING HELPERS ----
    const filteredChannels = channels.filter(ch =>
        ch.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const formatTimestamp = (isoDate) => {
        const d = new Date(isoDate);
        const now = new Date();
        const diffMs = now - d;
        const diffMins = Math.floor(diffMs / 60000);
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m`;
        const diffHrs = Math.floor(diffMins / 60);
        if (diffHrs < 24) return `${diffHrs}h`;
        const diffDays = Math.floor(diffHrs / 24);
        if (diffDays < 7) return `${diffDays}d`;
        return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
    };

    const formatFullDate = (isoDate) => {
        return new Date(isoDate).toLocaleString('en-US', {
            day: 'numeric', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const formatSlackText = (text) => {
        if (!text) return '';
        return text
            .replace(/<@(\w+)\|([^>]+)>/g, '@$2')
            .replace(/<@(\w+)>/g, '@user')
            .replace(/<#(\w+)\|([^>]+)>/g, '#$2')
            .replace(/<(https?:\/\/[^|>]+)\|([^>]+)>/g, '$2')
            .replace(/<(https?:\/\/[^>]+)>/g, '$1')
            .replace(/\*([^*]+)\*/g, '<strong>$1</strong>')
            .replace(/_([^_]+)_/g, '<em>$1</em>')
            .replace(/`([^`]+)`/g, '<code>$1</code>')
            .replace(/```([^`]+)```/g, '<pre>$1</pre>');
    };

    // Calculate grid classes based on number of active views
    const getGridTemplate = () => {
        const count = activeViews.length;
        if (count === 0) return '1fr';
        if (count === 1) return '1fr';
        if (count === 2) return '1fr 1fr';
        if (count === 3) return '1fr 1fr'; // CSS handles 3 items spanning
        if (count === 4) return '1fr 1fr';
        return '1fr 1fr';
    };

    // ──────── SETUP / CONFIGURATION BANNER ────────
    const renderSettingsBanner = () => (
        <div style={{
            position: 'absolute', top: '1.5rem', right: '2rem', zIndex: 100,
            display: 'flex', flexDirection: 'column', alignItems: 'flex-end'
        }}>
            <button
                onClick={() => setShowSettings(!showSettings)}
                style={{
                    background: hasToken ? 'rgba(34, 197, 94, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                    border: `1px solid ${hasToken ? 'rgba(34, 197, 94, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                    borderRadius: '24px', padding: '0.4rem 1rem 0.4rem 0.6rem',
                    color: hasToken ? '#22c55e' : '#f59e0b', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    fontSize: '0.8rem', fontWeight: '500', backdropFilter: 'blur(8px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)', transition: 'all 0.2s ease'
                }}
                title="Slack Configuration"
            >
                <div style={{
                    width: '24px', height: '24px', borderRadius: '50%',
                    background: hasToken ? 'rgba(34, 197, 94, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <Settings size={14} />
                </div>
                {hasToken ? `Connected: ${tokenPreview}` : 'Bot Setup Required'}
            </button>

            {showSettings && (
                <div className="panel" style={{
                    position: 'absolute', top: 'calc(100% + 0.75rem)', right: 0,
                    width: '380px', padding: '1.25rem', borderRadius: '12px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.3)', border: '1px solid var(--border-dark)',
                    animation: 'slideDown 0.2s ease-out'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h4 style={{ margin: 0, color: 'var(--text-main)', fontSize: '0.95rem' }}>Slack Configuration</h4>
                        <button onClick={() => setShowSettings(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                            <X size={16} />
                        </button>
                    </div>

                    {!hasToken && (
                        <div style={{
                            background: 'rgba(97, 218, 251, 0.04)', borderRadius: '8px',
                            padding: '0.85rem', marginBottom: '1rem', fontSize: '0.75rem',
                            color: 'var(--text-muted)', lineHeight: '1.6',
                            border: '1px solid rgba(97, 218, 251, 0.08)'
                        }}>
                            <div style={{ fontWeight: '600', color: 'var(--text-main)', marginBottom: '0.25rem' }}>
                                <Key size={12} style={{ marginRight: '0.35rem', verticalAlign: 'middle', color: '#61dafb' }} />
                                Required Scopes:
                            </div>
                            <code style={{ color: '#61dafb' }}>channels:read</code>, <code>channels:history</code><br />
                            <code style={{ color: '#61dafb' }}>groups:read</code>, <code>groups:history</code>, <code style={{ color: '#61dafb' }}>users:read</code>
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'stretch' }}>
                        <div style={{ position: 'relative', flex: 1 }}>
                            <input
                                type={showToken ? 'text' : 'password'}
                                placeholder="xoxb-your-slack-bot-token..."
                                value={tokenInput}
                                onChange={(e) => { setTokenInput(e.target.value); setTokenError(''); setTokenSuccess(''); }}
                                style={{
                                    width: '100%', boxSizing: 'border-box',
                                    background: 'var(--bg-dashboard)', border: '1px solid var(--border-light)',
                                    borderRadius: '8px', padding: '0.5rem 2.2rem 0.5rem 0.75rem',
                                    color: 'var(--text-main)', fontSize: '0.8rem', outline: 'none',
                                    fontFamily: 'monospace'
                                }}
                            />
                            <button
                                onClick={() => setShowToken(!showToken)}
                                style={{
                                    position: 'absolute', right: '0.4rem', top: '50%', transform: 'translateY(-50%)',
                                    background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
                                    display: 'flex', alignItems: 'center', padding: '0.2rem'
                                }}
                            >
                                {showToken ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                        </div>
                        <button
                            onClick={handleSaveToken}
                            disabled={savingToken || !tokenInput.trim()}
                            style={{
                                background: savingToken ? 'rgba(97, 218, 251, 0.1)' : 'linear-gradient(135deg, #61dafb, #8b5cf6)',
                                border: 'none', borderRadius: '8px', padding: '0.5rem 1rem',
                                color: 'white', cursor: savingToken || !tokenInput.trim() ? 'not-allowed' : 'pointer',
                                fontSize: '0.8rem', fontWeight: '600', opacity: !tokenInput.trim() ? 0.5 : 1, transition: 'opacity 0.2s'
                            }}
                        >
                            {savingToken ? '...' : 'Save'}
                        </button>
                    </div>

                    {hasToken && (
                        <button
                            onClick={handleRemoveToken}
                            disabled={savingToken}
                            style={{
                                width: '100%', marginTop: '0.75rem', padding: '0.55rem',
                                background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)',
                                borderRadius: '8px', color: '#ef4444', fontSize: '0.8rem', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                            }}
                        >
                            <Trash2 size={14} /> Remove Token (Disconnect)
                        </button>
                    )}

                    {tokenError && (
                        <div style={{ marginTop: '0.75rem', color: '#ef4444', fontSize: '0.75rem', display: 'flex', gap: '0.35rem' }}>
                            <AlertCircle size={12} style={{ marginTop: '2px' }} /> <div>{tokenError}</div>
                        </div>
                    )}
                    {tokenSuccess && (
                        <div style={{ marginTop: '0.75rem', color: '#22c55e', fontSize: '0.75rem', display: 'flex', gap: '0.35rem' }}>
                            <Check size={12} style={{ marginTop: '2px' }} /> <div>{tokenSuccess}</div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );

    // ──────── SINGLE CHANNEL MESSAGE LIST ────────
    const renderMessageList = (channel) => (
        <div style={{
            display: 'flex', flexDirection: 'column', gap: '0',
            height: '100%', overflowY: 'auto' // Handle internal scrolling
        }}>
            {channel.messages.length > 0 ? channel.messages.map((msg, idx) => (
                <div key={idx} style={{
                    padding: '1rem',
                    display: 'flex', gap: '0.85rem',
                    borderBottom: idx < channel.messages.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                    transition: 'background 0.15s',
                }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                    {/* Avatar */}
                    {msg.user.avatar ? (
                        <img src={msg.user.avatar} alt={msg.user.displayName}
                            style={{
                                width: '36px', height: '36px', borderRadius: '10px',
                                flexShrink: 0, objectFit: 'cover', border: '1px solid var(--border-dark)'
                            }}
                        />
                    ) : (
                        <div style={{
                            width: '36px', height: '36px', borderRadius: '10px',
                            background: 'linear-gradient(135deg, #8b5cf6, #61dafb)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0, fontSize: '0.85rem', fontWeight: '700', color: 'white'
                        }}>
                            {msg.user.displayName?.[0]?.toUpperCase() || '?'}
                        </div>
                    )}

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.3rem' }}>
                            <span style={{ fontWeight: '600', fontSize: '0.9rem', color: 'var(--text-main)' }}>
                                {msg.user.displayName}
                            </span>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }} title={formatFullDate(msg.date)}>
                                {formatTimestamp(msg.date)}
                            </span>
                        </div>
                        <div
                            style={{
                                fontSize: '0.85rem', color: 'var(--text-main)',
                                lineHeight: '1.6', wordBreak: 'break-word', opacity: 0.9,
                                // Provide basic styling for the converted HTML
                            }}
                            dangerouslySetInnerHTML={{ __html: formatSlackText(msg.text) }}
                        />
                    </div>
                </div>
            )) : (
                <div style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    height: '100%', minHeight: '150px',
                    color: 'var(--text-muted)', fontSize: '0.85rem'
                }}>
                    <MessageSquare size={24} style={{ marginBottom: '0.75rem', opacity: 0.3 }} />
                    No recent updates
                </div>
            )}
        </div>
    );


    return (
        <div className="page-content" style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>

            {/* Corner Settings Banner */}
            {renderSettingsBanner()}

            {/* Header (hidden in full screen) */}
            {!isFullScreen && (
                <div style={{ marginBottom: '1.5rem', paddingRight: '150px' }}>
                    <h2 style={{
                        fontSize: '1.4rem', margin: '0 0 0.25rem', fontWeight: '700',
                        background: 'linear-gradient(135deg, #61dafb, #8b5cf6)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                    }}>
                        Intern Updates Workspace
                    </h2>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Drag channels into the workspace to view updates side-by-side.
                    </p>
                </div>
            )}

            {/* ──────── MAIN SPLIT LAYOUT ──────── */}
            <div style={{
                display: 'flex', gap: '1.5rem', flex: 1, minHeight: 0, // minHeight 0 is crucial for flex children scrolling
            }}>

                {/* LEFT: STICKY CHANNEL LIST */}
                {!isFullScreen && (
                    <div className="panel" style={{
                        width: '280px', flexShrink: 0,
                        display: 'flex', flexDirection: 'column',
                        borderRadius: '16px', border: '1px solid var(--border-dark)',
                        overflow: 'hidden', background: 'var(--bg-panel)'
                    }}>
                        {/* Sidebar Header */}
                        <div style={{
                            padding: '1.25rem', borderBottom: '1px solid var(--border-dark)',
                            background: 'rgba(255,255,255,0.02)'
                        }}>
                            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                <Search size={14} style={{
                                    position: 'absolute', left: '0.75rem',
                                    color: 'var(--text-muted)', pointerEvents: 'none'
                                }} />
                                <input
                                    type="text"
                                    placeholder="Filter channels..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    style={{
                                        background: 'var(--bg-dashboard)', border: '1px solid var(--border-light)',
                                        borderRadius: '8px', padding: '0.5rem 0.5rem 0.5rem 2rem',
                                        color: 'var(--text-main)', fontSize: '0.8rem', outline: 'none',
                                        width: '100%', boxSizing: 'border-box'
                                    }}
                                />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem' }}>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '500' }}>
                                    {channels.length} CHANNELS
                                </span>
                                <button
                                    onClick={fetchUpdates}
                                    disabled={loading}
                                    style={{
                                        background: 'none', border: 'none',
                                        color: '#61dafb', cursor: loading ? 'not-allowed' : 'pointer',
                                        display: 'flex', alignItems: 'center', gap: '0.35rem',
                                        fontSize: '0.75rem', fontWeight: '500', padding: 0
                                    }}
                                >
                                    <RefreshCw size={12} className={loading ? 'spin-animation' : ''} />
                                    Refresh
                                </button>
                            </div>
                        </div>

                        {/* Scrollable Channel List */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem' }}>
                            {loading ? (
                                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                    <RefreshCw size={20} className="spin-animation" style={{ marginBottom: '1rem', opacity: 0.5 }} />
                                    <div style={{ fontSize: '0.8rem' }}>Syncing workspace...</div>
                                </div>
                            ) : filteredChannels.length > 0 ? (
                                filteredChannels.map(channel => {
                                    const isActive = activeViews.some(v => v.id === channel.id);
                                    return (
                                        <div
                                            key={channel.id}
                                            draggable={!isActive && activeViews.length < 4}
                                            onDragStart={(e) => handleDragStart(e, channel)}
                                            onDragEnd={handleDragEnd}
                                            onClick={() => !isActive && addChannelToViewClick(channel)}
                                            style={{
                                                padding: '0.75rem 0.85rem', marginBottom: '0.4rem',
                                                borderRadius: '8px', cursor: (isActive || activeViews.length >= 4) ? 'not-allowed' : 'grab',
                                                background: isActive ? 'rgba(97, 218, 251, 0.05)' : 'transparent',
                                                border: isActive ? '1px solid rgba(97, 218, 251, 0.2)' : '1px solid transparent',
                                                opacity: isActive ? 0.6 : 1,
                                                display: 'flex', alignItems: 'center', gap: '0.75rem',
                                                transition: 'all 0.15s ease'
                                            }}
                                            onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }}
                                            onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
                                            title={isActive ? "Already in view" : "Drag or click to open"}
                                        >
                                            <div style={{
                                                width: '28px', height: '28px', borderRadius: '6px', flexShrink: 0,
                                                background: 'linear-gradient(135deg, #61dafb15, #8b5cf615)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            }}>
                                                <Hash size={14} style={{ color: isActive ? '#61dafb' : 'var(--text-muted)' }} />
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{
                                                    fontSize: '0.85rem', fontWeight: '500', color: isActive ? '#61dafb' : 'var(--text-main)',
                                                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                                                }}>
                                                    {channel.name}
                                                </div>
                                                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                    <span>{channel.messages.length} msgs</span>
                                                    {channel.error && <span style={{ color: '#f59e0b' }}>⚠ err</span>}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                    <Hash size={24} style={{ marginBottom: '0.5rem', opacity: 0.3 }} />
                                    <div style={{ fontSize: '0.8rem' }}>No channels found</div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* RIGHT: DRAG & DROP SPLIT GRID ZONE */}
                <div
                    className="panel"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e)}
                    style={{
                        flex: 1, borderRadius: '16px', border: activeViews.length === 0 ? '2px dashed var(--border-light)' : '1px solid var(--border-dark)',
                        background: activeViews.length === 0 ? 'rgba(255,255,255,0.01)' : 'var(--bg-dashboard)',
                        display: 'flex', flexDirection: 'column', overflow: 'hidden',
                        position: 'relative', transition: 'all 0.2s ease',
                    }}
                >
                    {/* Header Controls for workspace */}
                    {activeViews.length > 0 && (
                        <div style={{
                            padding: '0.75rem 1.25rem', borderBottom: '1px solid var(--border-dark)',
                            display: 'flex', justifyContent: 'flex-end', alignItems: 'center',
                            background: 'var(--bg-panel)'
                        }}>
                            <button
                                onClick={() => setIsFullScreen(!isFullScreen)}
                                style={{
                                    background: 'none', border: 'none', color: 'var(--text-muted)',
                                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem',
                                    fontSize: '0.75rem', fontWeight: '500', padding: '0.3rem 0.6rem', borderRadius: '6px',
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                                {isFullScreen ? <><Minimize2 size={14} /> Exit Full Screen</> : <><Maximize2 size={14} /> Full Screen</>}
                            </button>
                        </div>
                    )}

                    {/* The Grid itself */}
                    {activeViews.length === 0 ? (
                        <div style={{
                            flex: 1, display: 'flex', flexDirection: 'column',
                            alignItems: 'center', justifyContent: 'center', padding: '2rem',
                            color: 'var(--text-muted)', textAlign: 'center'
                        }}>
                            <div style={{
                                width: '80px', height: '80px', borderRadius: '50%',
                                background: 'linear-gradient(135deg, rgba(97, 218, 251, 0.05), rgba(139, 92, 246, 0.05))',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                marginBottom: '1.5rem', border: '1px dashed rgba(97, 218, 251, 0.3)'
                            }}>
                                <Maximize2 size={32} style={{ color: '#61dafb', opacity: 0.7 }} />
                            </div>
                            <h3 style={{ margin: '0 0 0.5rem', color: 'var(--text-main)', fontSize: '1.2rem', fontWeight: '600' }}>
                                Drag Channels Here
                            </h3>
                            <p style={{ margin: 0, fontSize: '0.85rem', maxWidth: '300px', lineHeight: '1.6' }}>
                                Select channels from the left sidebar and drag them here to create your perfect split-view tracking dashboard. Max 4 channels.
                            </p>
                        </div>
                    ) : (
                        <div style={{
                            flex: 1, padding: '1rem',
                            display: 'grid', gridTemplateColumns: getGridTemplate(),
                            gap: '1rem', overflow: 'hidden', // outer container hidden, grids scroll internally
                        }}>
                            {activeViews.map((view, index) => (
                                <div key={view.id} style={{
                                    background: 'var(--bg-panel)', borderRadius: '12px',
                                    border: '1px solid var(--border-dark)', display: 'flex', flexDirection: 'column',
                                    overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                                    // Make 3 items look good by letting the first one span full width
                                    gridColumn: (activeViews.length === 3 && index === 0) ? '1 / -1' : 'auto',
                                    // Height adjustments for row spanning 
                                    height: '100%',
                                    // Ensure it doesn't overflow its grid cell
                                    minHeight: 0
                                }}>
                                    {/* View Header */}
                                    <div style={{
                                        padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-dark)',
                                        background: 'linear-gradient(to right, rgba(97,218,251,0.05), rgba(139,92,246,0.02))',
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
                                            <Hash size={14} style={{ color: '#61dafb', flexShrink: 0 }} />
                                            <strong style={{ fontSize: '0.9rem', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {view.name}
                                            </strong>
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexShrink: 0 }}>
                                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', background: 'var(--bg-dashboard)', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>
                                                {view.messages?.length || 0}
                                            </span>
                                            <button
                                                onClick={() => removeView(index)}
                                                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '0.2rem' }}
                                                title="Close view"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    </div>
                                    {/* View Content (Scrollable) */}
                                    <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
                                        {/* Error handling inside the view */}
                                        {view.error ? (
                                            <div style={{ padding: '2rem', textAlign: 'center', color: '#f59e0b', fontSize: '0.8rem' }}>
                                                ⚠ {view.error}
                                            </div>
                                        ) : (
                                            renderMessageList(view)
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Inline styles for animations */}
            <style>{`
                .spin-animation {
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default SlackTab;
