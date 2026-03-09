import { ChevronDown, X, Send, Info } from 'lucide-react';

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
    getStatusStyle
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

    return (
        <div className="grid" style={{ gridTemplateColumns: '1.2fr 1fr', gap: '2rem' }}>
            {/* New Request Form */}
            <div className="panel" style={{ padding: '2.5rem', borderRadius: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
                    <div style={{ width: '50px', height: '50px', borderRadius: '14px', background: 'rgba(var(--primary-rgb, 155, 89, 182), 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                        <Info size={24} />
                    </div>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-main)' }}>New Request</h3>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>Submit a leave, WFH, or half-day request</p>
                    </div>
                </div>

                {/* Request Type */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Request Type *</label>
                    <div style={{ position: 'relative' }}>
                        <select
                            value={requestType}
                            onChange={e => setRequestType(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.85rem 1rem',
                                borderRadius: '12px',
                                border: '1px solid var(--border-dark)',
                                background: 'var(--bg-main)',
                                color: 'var(--text-main)',
                                fontSize: '0.9rem',
                                fontWeight: '500',
                                appearance: 'none',
                                cursor: 'pointer',
                                outline: 'none',
                                transition: 'border-color 0.2s'
                            }}
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
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Leave Type *</label>
                        <div style={{ position: 'relative' }}>
                            <select
                                value={requestLeaveType}
                                onChange={e => setRequestLeaveType(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '0.85rem 1rem',
                                    borderRadius: '12px',
                                    border: '1px solid var(--border-dark)',
                                    background: 'var(--bg-main)',
                                    color: 'var(--text-main)',
                                    fontSize: '0.9rem',
                                    fontWeight: '500',
                                    appearance: 'none',
                                    cursor: 'pointer',
                                    outline: 'none',
                                    transition: 'border-color 0.2s'
                                }}
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
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Select Approved Leave *</label>
                        <select
                            value={selectedLeaveForCancel?._id || ''}
                            onChange={e => {
                                const leave = myLeaves.find(l => l._id === e.target.value);
                                setSelectedLeaveForCancel(leave);
                                setDatesToCancel([]);
                            }}
                            style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid var(--border-dark)', background: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '0.9rem', marginBottom: '1rem' }}
                        >
                            <option value="">Select leave to cancel...</option>
                            {myLeaves.filter(l => l.status === 'Approved' && new Date(l.endDate) >= new Date()).map(l => (
                                <option key={l._id} value={l._id}>
                                    {l.type} ({new Date(l.startDate).toLocaleDateString()} - {new Date(l.endDate).toLocaleDateString()})
                                </option>
                            ))}
                        </select>

                        {selectedLeaveForCancel && (
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Select dates to cancel:</label>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '0.5rem' }}>
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
                                                <label key={dateStr} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: isAlreadyCancelled ? 'var(--text-muted)' : 'var(--text-main)', cursor: isAlreadyCancelled ? 'not-allowed' : 'pointer' }}>
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
                                                    />
                                                    {date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                    {isAlreadyCancelled && <span style={{ fontSize: '0.7rem', color: 'var(--danger)' }}>(Cancelled)</span>}
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
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Recipients *</label>
                    <div style={{
                        border: '1px solid var(--border-dark)',
                        borderRadius: '12px',
                        padding: '0.5rem',
                        background: 'var(--bg-main)',
                        minHeight: '50px'
                    }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: requestRecipients.length > 0 ? '0.5rem' : 0 }}>
                            {requestRecipients.map(r => (
                                <div key={r._id} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.4rem',
                                    background: 'rgba(var(--primary-rgb, 155, 89, 182), 0.1)',
                                    border: '1px solid rgba(var(--primary-rgb, 155, 89, 182), 0.2)',
                                    padding: '0.35rem 0.6rem 0.35rem 0.75rem',
                                    borderRadius: '20px',
                                    fontSize: '0.8rem',
                                    fontWeight: '600',
                                    color: 'var(--primary)'
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
                                width: '100%',
                                border: 'none',
                                outline: 'none',
                                padding: '0.4rem 0.5rem',
                                background: 'transparent',
                                color: 'var(--text-main)',
                                fontSize: '0.85rem'
                            }}
                        />
                    </div>
                    {recipientSuggestions.length > 0 && (
                        <div style={{
                            border: '1px solid var(--border-dark)',
                            borderRadius: '12px',
                            marginTop: '0.5rem',
                            background: 'var(--bg-panel)',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                            overflow: 'hidden',
                            maxHeight: '200px',
                            overflowY: 'auto',
                            zIndex: 10
                        }}>
                            {recipientSuggestions.map(u => (
                                <div key={u._id} onClick={() => {
                                    setRequestRecipients([...requestRecipients, u]);
                                    setRecipientSearch('');
                                    setRecipientSuggestions([]);
                                }} style={{
                                    padding: '0.75rem 1rem',
                                    cursor: 'pointer',
                                    borderBottom: '1px solid var(--border-dark)',
                                    transition: 'background 0.15s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem'
                                }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(var(--primary-rgb, 155, 89, 182), 0.08)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                >
                                    <div style={{
                                        width: '32px', height: '32px', borderRadius: '50%',
                                        background: 'linear-gradient(135deg, var(--primary), #e74c3c)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: 'white', fontSize: '0.7rem', fontWeight: '700'
                                    }}>{u.name?.charAt(0)?.toUpperCase()}</div>
                                    <div>
                                        <div style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-main)' }}>{u.name}</div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{u.designation || u.email}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Date Range */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>From Date *</label>
                        <input
                            type="date"
                            value={requestStartDate}
                            onChange={e => setRequestStartDate(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.85rem 1rem',
                                borderRadius: '12px',
                                border: '1px solid var(--border-dark)',
                                background: 'var(--bg-main)',
                                color: 'var(--text-main)',
                                fontSize: '0.9rem',
                                outline: 'none'
                            }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>To Date *</label>
                        <input
                            type="date"
                            value={requestEndDate}
                            onChange={e => setRequestEndDate(e.target.value)}
                            min={requestStartDate}
                            style={{
                                width: '100%',
                                padding: '0.85rem 1rem',
                                borderRadius: '12px',
                                border: '1px solid var(--border-dark)',
                                background: 'var(--bg-main)',
                                color: 'var(--text-main)',
                                fontSize: '0.9rem',
                                outline: 'none'
                            }}
                        />
                    </div>
                </div>

                {/* Message */}
                <div style={{ marginBottom: '2rem' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Message</label>
                    <textarea
                        value={requestMessage}
                        onChange={e => setRequestMessage(e.target.value)}
                        placeholder="Add a reason or additional details for your request..."
                        rows={4}
                        style={{
                            width: '100%',
                            padding: '0.85rem 1rem',
                            borderRadius: '12px',
                            border: '1px solid var(--border-dark)',
                            background: 'var(--bg-main)',
                            color: 'var(--text-main)',
                            fontSize: '0.85rem',
                            resize: 'vertical',
                            outline: 'none',
                            fontFamily: 'inherit',
                            lineHeight: '1.5'
                        }}
                    />
                </div>

                {/* Submit */}
                <button
                    className="btn btn-primary"
                    onClick={submitRequest}
                    disabled={requestSubmitting}
                    style={{
                        width: '100%',
                        padding: '0.9rem',
                        borderRadius: '12px',
                        fontSize: '0.9rem',
                        fontWeight: '700',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        opacity: requestSubmitting ? 0.7 : 1,
                        letterSpacing: '0.5px'
                    }}
                >
                    <Send size={16} />
                    {requestSubmitting ? 'Submitting...' : 'Submit Request'}
                </button>
            </div>

            {/* Request History */}
            <div className="panel" style={{ padding: '2rem', borderRadius: '20px', height: 'fit-content' }}>
                <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1rem', fontWeight: '700', color: 'var(--text-main)' }}>My Requests</h3>
                {myRequests.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {myRequests.map(req => {
                            const isExpanded = expandedRequests.includes(req._id);
                            return (
                                <div key={req._id} style={{
                                    padding: '1rem 1.25rem',
                                    borderRadius: '14px',
                                    border: '1px solid var(--border-dark)',
                                    background: 'var(--bg-main)',
                                    transition: 'all 0.2s'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <span style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-main)' }}>{req.type}</span>
                                        </div>
                                        <span style={{
                                            fontSize: '0.7rem',
                                            padding: '0.2rem 0.6rem',
                                            borderRadius: '20px',
                                            fontWeight: '700',
                                            textTransform: 'uppercase',
                                            ...getStatusStyle(req.status)
                                        }}>{req.status}</span>
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
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
                                        style={{ fontSize: '0.75rem', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                                    >
                                        {isExpanded ? 'Show less' : 'View details'}
                                    </div>

                                    {isExpanded && (
                                        <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-dark)', fontSize: '0.8rem' }}>
                                            <div style={{ marginBottom: '0.5rem' }}><span style={{ color: 'var(--text-muted)' }}>Message:</span> {req.message || 'No message'}</div>
                                            {req.actionNote && <div style={{ marginBottom: '0.5rem' }}><span style={{ color: 'var(--text-muted)' }}>Response:</span> {req.actionNote}</div>}
                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Requested on {new Date(req.createdAt).toLocaleString()}</div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
                        <Info size={32} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                        <p style={{ fontSize: '0.85rem' }}>No requests submitted yet</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RequestTab;
