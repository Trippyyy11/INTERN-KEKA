import { ChevronDown, X, Send, Info, FileText, Clock } from 'lucide-react';

const RequestTab = ({
    user,
    allUsers,
    myLeaves,
    requestType,
    setRequestType,
    requestLeaveType,
    setRequestLeaveType,
    requestStartDate,
    setRequestStartDate,
    requestEndDate,
    setRequestEndDate,
    requestMessage,
    setRequestMessage,
    requestRecipients,
    setRequestRecipients,
    recipientSearch,
    setRecipientSearch,
    recipientSuggestions,
    setRecipientSuggestions,
    submitRequest,
    requestSubmitting,
    selectedLeaveForCancel,
    setSelectedLeaveForCancel,
    datesToCancel,
    setDatesToCancel,
    myRequests,
    expandedRequests,
    setExpandedRequests,
    getStatusStyle,
    isLightMode
}) => {

    const searchRecipients = (q) => {
        setRecipientSearch(q);
        if (!q.trim()) {
            setRecipientSuggestions([]);
            return;
        }
        const filtered = allUsers.filter(u =>
            (u.name?.toLowerCase().includes(q.toLowerCase()) ||
                u.email?.toLowerCase().includes(q.toLowerCase())) &&
            u._id !== user._id &&
            !requestRecipients.some(r => r._id === u._id)
        );
        setRecipientSuggestions(filtered);
    };

    const bentoPanelStyle = {
        background: isLightMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(15, 23, 42, 0.5)',
        backdropFilter: 'blur(16px)',
        borderRadius: '24px',
        border: `1px solid ${isLightMode ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)'}`,
        padding: '2rem',
        boxShadow: isLightMode ? '0 4px 24px rgba(0,0,0,0.04)' : '0 4px 24px rgba(0,0,0,0.2)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    };

    const labelStyle = {
        display: 'block',
        fontSize: '0.75rem',
        fontWeight: '700',
        color: 'var(--text-muted)',
        marginBottom: '0.6rem',
        textTransform: 'uppercase',
        letterSpacing: '0.8px',
    };

    const inputStyle = {
        width: '100%',
        padding: '0.9rem 1rem',
        borderRadius: '16px',
        border: `1px solid ${isLightMode ? '#e2e8f0' : 'rgba(255,255,255,0.08)'}`,
        background: isLightMode ? '#f8fafc' : 'rgba(0,0,0,0.2)',
        color: 'var(--text-main)',
        fontSize: '0.9rem',
        fontWeight: '500',
        outline: 'none',
        transition: 'border-color 0.2s, box-shadow 0.2s',
    };

    const selectStyle = {
        ...inputStyle,
        appearance: 'none',
        cursor: 'pointer',
    };

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem', padding: '1.5rem' }}>
            {/* ── New Request Form ── */}
            <div style={bentoPanelStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                    <div style={{
                        width: '48px', height: '48px', borderRadius: '16px',
                        background: 'linear-gradient(135deg, rgba(var(--primary-rgb), 0.15), rgba(var(--primary-rgb), 0.05))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'var(--primary)',
                        boxShadow: '0 4px 12px rgba(var(--primary-rgb), 0.15)'
                    }}>
                        <FileText size={22} />
                    </div>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-0.3px' }}>New Request</h3>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '500', marginTop: '0.15rem' }}>Submit a leave, WFH, or half-day request</p>
                    </div>
                </div>

                {/* Request Type */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={labelStyle}>Request Type *</label>
                    <div style={{ position: 'relative' }}>
                        <select
                            value={requestType}
                            onChange={e => setRequestType(e.target.value)}
                            style={selectStyle}
                        >
                            <option value="">Select request type...</option>
                            <option value="Leave Application">🏖️ Leave Application</option>
                            <option value="Work From Home">🏠 Work From Home</option>
                            <option value="Half Day">⏰ Half Day</option>
                            <option value="Comp Off">🔄 Comp Off</option>
                            <option value="Leave Cancellation">🚫 Leave Cancellation</option>
                        </select>
                        <ChevronDown size={16} color="var(--text-muted)" style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                    </div>
                </div>

                {requestType === 'Leave Application' && (
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={labelStyle}>Leave Type *</label>
                        <div style={{ position: 'relative' }}>
                            <select
                                value={requestLeaveType}
                                onChange={e => setRequestLeaveType(e.target.value)}
                                style={selectStyle}
                            >
                                <option value="">Select leave type...</option>
                                <option value="Paid">Paid</option>
                                <option value="Sick">Sick</option>
                                <option value="Casual">Casual</option>
                                <option value="Unpaid">Unpaid</option>
                            </select>
                            <ChevronDown size={16} color="var(--text-muted)" style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                        </div>
                    </div>
                )}

                {requestType === 'Leave Cancellation' && (
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={labelStyle}>Select Approved Leave *</label>
                        <select
                            value={selectedLeaveForCancel?._id || ''}
                            onChange={e => {
                                const leave = myLeaves.find(l => l._id === e.target.value);
                                setSelectedLeaveForCancel(leave);
                                setDatesToCancel([]);
                            }}
                            style={{ ...selectStyle, marginBottom: '1rem' }}
                        >
                            <option value="">Select leave to cancel...</option>
                            {myLeaves.filter(l => l.status === 'Approved' && new Date(l.endDate) >= new Date()).map(l => (
                                <option key={l._id} value={l._id}>
                                    {l.type} ({new Date(l.startDate).toLocaleDateString()} - {new Date(l.endDate).toLocaleDateString()})
                                </option>
                            ))}
                        </select>

                        {selectedLeaveForCancel && (
                            <div style={{ background: isLightMode ? '#f8fafc' : 'rgba(0,0,0,0.2)', borderRadius: '16px', padding: '1rem', border: `1px solid ${isLightMode ? '#e2e8f0' : 'rgba(255,255,255,0.06)'}` }}>
                                <label style={{ ...labelStyle, marginBottom: '0.75rem' }}>Select dates to cancel:</label>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.6rem' }}>
                                    {(() => {
                                        const dates = [];
                                        let curr = new Date(selectedLeaveForCancel.startDate);
                                        const end = new Date(selectedLeaveForCancel.endDate);
                                        while (curr <= end) {
                                            dates.push(new Date(curr));
                                            curr.setDate(curr.getDate() + 1);
                                        }
                                        return dates.map(date => {
                                            const dateStr = date.toISOString().split('T')[0];
                                            const isAlreadyCancelled = selectedLeaveForCancel.cancelledDates?.some(d => new Date(d).toISOString().split('T')[0] === dateStr);
                                            return (
                                                <label key={dateStr} style={{
                                                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                                                    fontSize: '0.85rem', fontWeight: '600',
                                                    color: isAlreadyCancelled ? 'var(--text-muted)' : 'var(--text-main)',
                                                    cursor: isAlreadyCancelled ? 'not-allowed' : 'pointer',
                                                    padding: '0.4rem 0.6rem',
                                                    borderRadius: '10px',
                                                    background: datesToCancel.includes(dateStr) ? 'rgba(var(--primary-rgb), 0.08)' : 'transparent',
                                                    transition: 'background 0.2s',
                                                }}>
                                                    <input
                                                        type="checkbox"
                                                        disabled={isAlreadyCancelled}
                                                        checked={datesToCancel.includes(dateStr) || isAlreadyCancelled}
                                                        onChange={() => {
                                                            if (datesToCancel.includes(dateStr)) {
                                                                setDatesToCancel(datesToCancel.filter(d => d !== dateStr));
                                                            } else {
                                                                setDatesToCancel([...datesToCancel, dateStr]);
                                                            }
                                                        }}
                                                        style={{ accentColor: 'var(--primary)' }}
                                                    />
                                                    {date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                    {isAlreadyCancelled && <span style={{ fontSize: '0.65rem', color: 'var(--danger)', fontWeight: '700' }}>(Cancelled)</span>}
                                                </label>
                                            );
                                        });
                                    })()}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Recipients */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={labelStyle}>Recipients *</label>
                    <div style={{
                        border: `1px solid ${isLightMode ? '#e2e8f0' : 'rgba(255,255,255,0.08)'}`,
                        borderRadius: '16px',
                        padding: '0.6rem',
                        background: isLightMode ? '#f8fafc' : 'rgba(0,0,0,0.2)',
                        minHeight: '52px',
                        transition: 'border-color 0.2s',
                    }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: requestRecipients.length > 0 ? '0.5rem' : 0 }}>
                            {requestRecipients.map(r => (
                                <div key={r._id} style={{
                                    display: 'flex', alignItems: 'center', gap: '0.4rem',
                                    background: 'rgba(var(--primary-rgb), 0.1)',
                                    border: '1px solid rgba(var(--primary-rgb), 0.2)',
                                    padding: '0.35rem 0.6rem 0.35rem 0.75rem',
                                    borderRadius: '20px',
                                    fontSize: '0.8rem', fontWeight: '700', color: 'var(--primary)'
                                }}>
                                    <span>{r.name}</span>
                                    <X size={14} style={{ cursor: 'pointer', opacity: 0.7 }} onClick={() => setRequestRecipients(requestRecipients.filter(x => x._id !== r._id))} />
                                </div>
                            ))}
                        </div>
                        <input
                            type="text"
                            placeholder="Search for a person..."
                            value={recipientSearch}
                            onChange={e => searchRecipients(e.target.value)}
                            style={{
                                width: '100%', border: 'none', outline: 'none',
                                padding: '0.4rem 0.5rem', background: 'transparent',
                                color: 'var(--text-main)', fontSize: '0.85rem', fontWeight: '500'
                            }}
                        />
                    </div>
                    {recipientSuggestions.length > 0 && (
                        <div style={{
                            border: `1px solid ${isLightMode ? '#e2e8f0' : 'rgba(255,255,255,0.08)'}`,
                            borderRadius: '16px', marginTop: '0.5rem',
                            background: isLightMode ? '#ffffff' : 'var(--bg-panel)',
                            boxShadow: '0 12px 32px rgba(0,0,0,0.15)',
                            overflow: 'hidden', maxHeight: '200px', overflowY: 'auto', zIndex: 10
                        }}>
                            {recipientSuggestions.map(u => (
                                <div key={u._id} onClick={() => {
                                    setRequestRecipients([...requestRecipients, u]);
                                    setRecipientSearch('');
                                    setRecipientSuggestions([]);
                                }} style={{
                                    padding: '0.75rem 1rem', cursor: 'pointer',
                                    borderBottom: `1px solid ${isLightMode ? '#f1f5f9' : 'rgba(255,255,255,0.04)'}`,
                                    transition: 'background 0.15s',
                                    display: 'flex', alignItems: 'center', gap: '0.75rem'
                                }}
                                    onMouseEnter={e => e.currentTarget.style.background = isLightMode ? '#f8fafc' : 'rgba(255,255,255,0.03)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                >
                                    <div style={{
                                        width: '34px', height: '34px', borderRadius: '12px',
                                        background: 'linear-gradient(135deg, var(--primary), rgba(var(--primary-rgb), 0.6))',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: 'white', fontSize: '0.75rem', fontWeight: '800'
                                    }}>{u.name?.charAt(0)?.toUpperCase()}</div>
                                    <div>
                                        <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-main)' }}>{u.name}</div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '500' }}>{u.designation || u.email}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Date Range */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div>
                        <label style={labelStyle}>From Date *</label>
                        <input type="date" value={requestStartDate} onChange={e => setRequestStartDate(e.target.value)} style={inputStyle} />
                    </div>
                    <div>
                        <label style={labelStyle}>To Date *</label>
                        <input type="date" value={requestEndDate} onChange={e => setRequestEndDate(e.target.value)} min={requestStartDate} style={inputStyle} />
                    </div>
                </div>

                {/* Message */}
                <div style={{ marginBottom: '2rem' }}>
                    <label style={labelStyle}>Message</label>
                    <textarea
                        value={requestMessage}
                        onChange={e => setRequestMessage(e.target.value)}
                        placeholder="Add a reason or additional details for your request..."
                        rows={4}
                        style={{
                            ...inputStyle,
                            resize: 'vertical',
                            fontFamily: 'inherit',
                            lineHeight: '1.6',
                        }}
                    />
                </div>

                {/* Submit */}
                <button
                    className="btn btn-primary"
                    onClick={submitRequest}
                    disabled={requestSubmitting}
                    style={{
                        width: '100%', padding: '1.1rem', borderRadius: '16px',
                        fontSize: '0.95rem', fontWeight: '800', letterSpacing: '0.3px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                        opacity: requestSubmitting ? 0.7 : 1,
                        boxShadow: '0 8px 24px rgba(var(--primary-rgb), 0.35)',
                        transform: 'translateY(0)',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                    onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 28px rgba(var(--primary-rgb), 0.45)'; }}
                    onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(var(--primary-rgb), 0.35)'; }}
                >
                    <Send size={16} />
                    {requestSubmitting ? 'Submitting...' : 'Submit Request'}
                </button>
            </div>

            {/* ── My Requests ── */}
            <div style={{ ...bentoPanelStyle, height: 'fit-content' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    <div style={{
                        width: '38px', height: '38px', borderRadius: '12px',
                        background: 'rgba(var(--primary-rgb), 0.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <Clock size={18} color="var(--primary)" />
                    </div>
                    <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-0.3px' }}>My Requests</h3>
                    {myRequests.length > 0 && (
                        <span style={{
                            fontSize: '0.7rem', fontWeight: '700',
                            background: 'rgba(var(--primary-rgb), 0.1)', color: 'var(--primary)',
                            padding: '0.25rem 0.6rem', borderRadius: '20px',
                        }}>{myRequests.length}</span>
                    )}
                </div>

                {myRequests.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {myRequests.map(req => {
                            const isExpanded = expandedRequests.includes(req._id);
                            return (
                                <div key={req._id} style={{
                                    padding: '1.1rem 1.25rem',
                                    borderRadius: '18px',
                                    border: `1px solid ${isLightMode ? '#e2e8f0' : 'rgba(255,255,255,0.06)'}`,
                                    background: isLightMode ? '#f8fafc' : 'rgba(0,0,0,0.15)',
                                    transition: 'all 0.2s',
                                    cursor: 'default',
                                }}
                                    onMouseOver={e => { e.currentTarget.style.borderColor = isLightMode ? '#cbd5e1' : 'rgba(255,255,255,0.1)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)'; }}
                                    onMouseOut={e => { e.currentTarget.style.borderColor = isLightMode ? '#e2e8f0' : 'rgba(255,255,255,0.06)'; e.currentTarget.style.boxShadow = 'none'; }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                                        <span style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-main)' }}>{req.type}</span>
                                        <span style={{
                                            fontSize: '0.7rem', padding: '0.3rem 0.7rem',
                                            borderRadius: '20px', fontWeight: '700',
                                            textTransform: 'uppercase', letterSpacing: '0.3px',
                                            ...getStatusStyle(req.status)
                                        }}>{req.status}</span>
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.6rem', fontWeight: '500' }}>
                                        {new Date(req.startDate).toLocaleDateString()}
                                        {req.startDate !== req.endDate && ` - ${new Date(req.endDate).toLocaleDateString()}`}
                                    </div>
                                    <div
                                        onClick={() => {
                                            if (isExpanded) {
                                                setExpandedRequests(expandedRequests.filter(id => id !== req._id));
                                            } else {
                                                setExpandedRequests([...expandedRequests, req._id]);
                                            }
                                        }}
                                        style={{ fontSize: '0.75rem', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: '600' }}
                                    >
                                        {isExpanded ? 'Show less' : 'View details'}
                                        <ChevronDown size={12} style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                                    </div>

                                    {isExpanded && (
                                        <div style={{
                                            marginTop: '1rem', paddingTop: '1rem',
                                            borderTop: `1px solid ${isLightMode ? '#e2e8f0' : 'rgba(255,255,255,0.06)'}`,
                                            fontSize: '0.8rem', animation: 'fadeIn 0.2s ease-out'
                                        }}>
                                            <div style={{ marginBottom: '0.5rem' }}>
                                                <span style={{ color: 'var(--text-muted)', fontWeight: '600' }}>Message:</span>{' '}
                                                <span style={{ color: 'var(--text-main)', fontWeight: '500' }}>{req.message || 'No message'}</span>
                                            </div>
                                            {req.actionNote && (
                                                <div style={{ marginBottom: '0.5rem' }}>
                                                    <span style={{ color: 'var(--text-muted)', fontWeight: '600' }}>Response:</span>{' '}
                                                    <span style={{ color: 'var(--text-main)', fontWeight: '500' }}>{req.actionNote}</span>
                                                </div>
                                            )}
                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '500', marginTop: '0.5rem' }}>
                                                Requested on {new Date(req.createdAt).toLocaleString()}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div style={{
                        textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)',
                        background: isLightMode ? '#f8fafc' : 'rgba(0,0,0,0.15)',
                        borderRadius: '16px',
                        border: `1px dashed ${isLightMode ? '#cbd5e1' : 'rgba(255,255,255,0.1)'}`,
                    }}>
                        <Info size={32} style={{ opacity: 0.15, marginBottom: '0.75rem' }} />
                        <p style={{ fontSize: '0.85rem', fontWeight: '500', margin: 0 }}>No requests submitted yet</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RequestTab;
