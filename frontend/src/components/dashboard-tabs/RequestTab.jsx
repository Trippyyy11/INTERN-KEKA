import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, X, Send, Info, FileText, Clock, Calendar as CalIcon, Home, Zap, AlertCircle, CircleCheckBig } from 'lucide-react';

const CustomDropdown = ({ label, value, options, onChange, isLightMode, placeholder = "Select...", error = false }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedOption = options.find(opt => opt.value === value);

    return (
        <div style={{ marginBottom: '1.5rem', position: 'relative' }} ref={dropdownRef}>
            {label && (
                <label style={{
                    display: 'block', fontSize: '0.75rem', fontWeight: '800',
                    color: 'var(--text-muted)', marginBottom: '0.6rem',
                    textTransform: 'uppercase', letterSpacing: '0.8px'
                }}>{label}</label>
            )}
            <div
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    width: '100%', padding: '0.9rem 1.1rem', borderRadius: '16px',
                    border: `1.5px solid ${isOpen ? 'var(--primary)' : (error ? '#ef4444' : (isLightMode ? '#e2e8f0' : 'rgba(255,255,255,0.08)'))}`,
                    background: isLightMode ? '#fff' : 'rgba(15, 23, 42, 0.4)',
                    color: selectedOption ? 'var(--text-main)' : 'var(--text-muted)',
                    fontSize: '0.92rem', fontWeight: '600', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: isOpen ? '0 0 0 4px rgba(99, 102, 241, 0.1)' : 'none'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {selectedOption?.icon && <span style={{ fontSize: '1.1rem' }}>{selectedOption.icon}</span>}
                    <span>{selectedOption ? selectedOption.label : placeholder}</span>
                </div>
                <ChevronDown size={18} style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }} />
            </div>

            {isOpen && (
                <div style={{
                    position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0,
                    background: isLightMode ? '#fff' : 'rgba(15, 23, 42, 0.95)',
                    backdropFilter: 'blur(12px)', borderRadius: '18px',
                    border: `1px solid ${isLightMode ? '#e2e8f0' : 'rgba(255,255,255,0.1)'}`,
                    boxShadow: '0 12px 40px rgba(0,0,0,0.2)', zIndex: 100,
                    overflow: 'hidden', animation: 'dropdownFadeIn 0.2s ease-out'
                }}>
                    <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
                        {options.map((opt) => (
                            <div
                                key={opt.value}
                                onClick={() => { onChange(opt.value); setIsOpen(false); }}
                                style={{
                                    padding: '0.9rem 1.25rem', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    background: value === opt.value ? 'rgba(var(--primary-rgb), 0.08)' : 'transparent',
                                    transition: 'all 0.15s'
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = isLightMode ? '#f8fafc' : 'rgba(255,255,255,0.03)'}
                                onMouseLeave={e => e.currentTarget.style.background = value === opt.value ? 'rgba(var(--primary-rgb), 0.08)' : 'transparent'}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    {opt.icon && <span style={{ fontSize: '1.1rem' }}>{opt.icon}</span>}
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span style={{ fontSize: '0.9rem', fontWeight: '700', color: value === opt.value ? 'var(--primary)' : 'var(--text-main)' }}>{opt.label}</span>
                                        {opt.subLabel && <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '500' }}>{opt.subLabel}</span>}
                                    </div>
                                </div>
                                {opt.balance !== undefined && (
                                    <div style={{
                                        padding: '4px 10px', borderRadius: '10px',
                                        background: opt.balance <= 0 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                                        color: opt.balance <= 0 ? '#ef4444' : '#10b981',
                                        fontSize: '0.75rem', fontWeight: '800'
                                    }}>
                                        {opt.balance} Left
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
            <style>{`
                @keyframes dropdownFadeIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

const RequestTab = ({
    user,
    myLeaves,
    leaveStats,
    requestType,
    setRequestType,
    requestLeaveType,
    setRequestLeaveType,
    requestStartDate,
    setRequestStartDate,
    requestEndDate,
    setRequestEndDate,
    requestExpectedClockIn,
    setRequestExpectedClockIn,
    requestExpectedClockOut,
    setRequestExpectedClockOut,
    requestMessage,
    setRequestMessage,
    requestRecipients,
    setRequestRecipients,
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

    const [durationText, setDurationText] = useState('');
    const [balanceError, setBalanceError] = useState('');
    const [notifyManager, setNotifyManager] = useState(true);

    const calculateRequestedDuration = () => {
        if (!requestStartDate || !requestEndDate) return 0;
        const start = new Date(requestStartDate);
        const end = new Date(requestEndDate);
        if (end < start) return 0;
        return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    };

    useEffect(() => {
        const calculatedDuration = calculateRequestedDuration();
        const isHalfDay = requestType === 'Half Day';
        const duration = isHalfDay ? 0.5 : calculatedDuration;

        if (duration > 0) {
            setDurationText(`Requested: ${duration} Day${duration > 1 ? 's' : ''}`);

            // Validate balance
            if (['Leave Application', 'Comp Off', 'Half Day'].includes(requestType)) {
                const targetType = requestType === 'Comp Off' ? 'Comp Off' : (requestLeaveType || 'Paid');
                if (targetType !== 'Unpaid') {
                    const balance = leaveStats?.balances?.[targetType]?.total - leaveStats?.balances?.[targetType]?.consumed || 0;
                    if (duration > balance) {
                        setBalanceError(`Insufficient Balance! You only have ${balance} days left for ${targetType}.`);
                    } else {
                        setBalanceError('');
                    }
                } else {
                    setBalanceError('');
                }
            } else {
                setBalanceError('');
            }
        } else {
            setDurationText('');
            setBalanceError('');
        }
    }, [requestStartDate, requestEndDate, requestType, requestLeaveType, leaveStats]);

    // Handle Notify Manager logic
    useEffect(() => {
        if (notifyManager && user.reportingManager) {
            setRequestRecipients([user.reportingManager]);
        } else {
            setRequestRecipients([]);
        }
    }, [notifyManager, user.reportingManager]);

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
        background: isLightMode ? '#fff' : 'rgba(15, 23, 42, 0.4)',
        color: 'var(--text-main)',
        fontSize: '0.9rem',
        fontWeight: '500',
        outline: 'none',
        transition: 'border-color 0.2s, box-shadow 0.2s',
    };

    const requestTypeOptions = [
        { label: 'Leave Application', value: 'Leave Application', icon: '🏖️' },
        { label: 'Work From Home', value: 'Work From Home', icon: '🏠' },
        { label: 'Half Day', value: 'Half Day', icon: '⏰' },
        { label: 'Comp Off', value: 'Comp Off', icon: '🔄', balance: leaveStats?.balances?.['Comp Off']?.total - leaveStats?.balances?.['Comp Off']?.consumed },
        { label: 'Leave Cancellation', value: 'Leave Cancellation', icon: '🚫' },
        { label: 'Attendance Regularization', value: 'Attendance Regularization', icon: '📝' }
    ];

    const leaveTypeOptions = [
        { label: 'Paid Leave', value: 'Paid', icon: '💰', balance: leaveStats?.balances?.['Paid']?.total - leaveStats?.balances?.['Paid']?.consumed },
        { label: 'Sick Leave', value: 'Sick', icon: '🤒', balance: leaveStats?.balances?.['Sick']?.total - leaveStats?.balances?.['Sick']?.consumed },
        { label: 'Casual Leave', value: 'Casual', icon: '✨', balance: leaveStats?.balances?.['Casual']?.total - leaveStats?.balances?.['Casual']?.consumed },
        { label: 'Unpaid Leave', value: 'Unpaid', icon: '🏳️' }
    ];

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
                <CustomDropdown
                    label="Request Type *"
                    value={requestType}
                    options={requestTypeOptions}
                    onChange={setRequestType}
                    isLightMode={isLightMode}
                />

                {['Leave Application', 'Half Day'].includes(requestType) && (
                    <CustomDropdown
                        label="Leave Type *"
                        value={requestLeaveType}
                        options={leaveTypeOptions}
                        onChange={setRequestLeaveType}
                        isLightMode={isLightMode}
                    />
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
                            style={{ ...inputStyle, marginBottom: '1rem' }}
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

                {/* Simplified Recipient Selection: Reporting Manager Checkbox */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={labelStyle}>Recipients</label>
                    <div style={{
                        background: isLightMode ? '#f8fafc' : 'rgba(0,0,0,0.2)',
                        borderRadius: '20px', padding: '1.25rem',
                        border: `1px solid ${isLightMode ? '#e2e8f0' : 'rgba(255,255,255,0.06)'}`,
                        display: 'flex', flexDirection: 'column', gap: '0.75rem'
                    }}>
                        <label style={{
                            display: 'flex', alignItems: 'center', gap: '0.85rem',
                            cursor: user.reportingManager ? 'pointer' : 'not-allowed',
                            opacity: user.reportingManager ? 1 : 0.6,
                            padding: '0.5rem', borderRadius: '12px',
                            transition: 'all 0.2s'
                        }}
                            onMouseEnter={e => { if (user.reportingManager) e.currentTarget.style.background = isLightMode ? '#fff' : 'rgba(255,255,255,0.03)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                        >
                            <div style={{ position: 'relative', width: '22px', height: '22px' }}>
                                <input
                                    type="checkbox"
                                    checked={notifyManager && !!user.reportingManager}
                                    disabled={!user.reportingManager}
                                    onChange={() => setNotifyManager(!notifyManager)}
                                    style={{
                                        width: '24px', height: '24px',
                                        accentColor: 'var(--primary)', cursor: 'pointer',
                                        appearance: 'none', border: `2.5px solid ${isLightMode ? '#cbd5e1' : 'rgba(4, 4, 4, 0.2)'}`,
                                        borderRadius: '6px', outline: 'none', transition: 'all 0.2s',
                                        backgroundColor: notifyManager && user.reportingManager ? 'var(--primary)' : 'transparent',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}
                                />
                                {notifyManager && user.reportingManager && (
                                    <CircleCheckBig size={14} color="white" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', pointerEvents: 'none' }} />
                                )}
                            </div>
                            <div>
                                <div style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-main)' }}>
                                    Send to Reporting Manager
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '500' }}>
                                    {user.reportingManager ? `Directly notify ${user.reportingManager.name}` : 'No manager assigned to your profile'}
                                </div>
                            </div>
                        </label>

                        <div style={{
                            padding: '0.75rem 1rem', borderRadius: '14px',
                            background: isLightMode ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.03)',
                            border: `1px dashed ${isLightMode ? '#cbd5e1' : 'rgba(255,255,255,0.1)'}`,
                            fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600',
                            display: 'flex', alignItems: 'center', gap: '0.6rem'
                        }}>
                            <Info size={14} />
                            <span>Super Admins will automatically receive this request in their inbox by default.</span>
                        </div>
                    </div>
                </div>

                {/* Date Range & Expected Times */}
                {requestType !== 'Leave Cancellation' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '0.5rem' }}>
                        <div>
                            <label style={labelStyle}>{requestType === 'Attendance Regularization' ? 'Target Date *' : 'From Date *'}</label>
                            <input type="date" value={requestStartDate} onChange={e => {setRequestStartDate(e.target.value); if (requestType === 'Attendance Regularization') setRequestEndDate(e.target.value);}} style={inputStyle} />
                        </div>
                        {requestType !== 'Attendance Regularization' && (
                            <div>
                                <label style={labelStyle}>To Date *</label>
                                <input type="date" value={requestEndDate} onChange={e => setRequestEndDate(e.target.value)} min={requestStartDate} style={inputStyle} />
                            </div>
                        )}
                    </div>
                )}

                {requestType === 'Attendance Regularization' && (
                    <div style={{
                        background: isLightMode ? '#f8fafc' : 'rgba(0,0,0,0.2)',
                        borderRadius: '20px', padding: '1.25rem', marginBottom: '1.5rem',
                        border: `1px solid ${isLightMode ? '#e2e8f0' : 'rgba(255,255,255,0.06)'}`,
                    }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '1rem' }}>EXPECTED CLOCK TIMES</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '0.5rem' }}>
                            <div>
                                <label style={labelStyle}>Expected Clock In *</label>
                                <input type="datetime-local" value={requestExpectedClockIn} onChange={e => setRequestExpectedClockIn(e.target.value)} style={inputStyle} />
                            </div>
                            <div>
                                <label style={labelStyle}>Expected Clock Out *</label>
                                <input type="datetime-local" value={requestExpectedClockOut} onChange={e => setRequestExpectedClockOut(e.target.value)} style={inputStyle} />
                            </div>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', gap: '8px', alignItems: 'center', marginTop: '10px' }}>
                            <Info size={14} /> <span>Your reporting manager or admin can apply these times if approved.</span>
                        </div>
                    </div>
                )}

                {/* Duration/Balance Info */}
                <div style={{ marginBottom: '1.5rem', minHeight: '20px' }}>
                    {durationText && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', fontWeight: '800', color: balanceError ? '#ef4444' : 'var(--primary)' }}>
                            {balanceError ? <AlertCircle size={14} /> : <Zap size={14} />}
                            {balanceError || durationText}
                        </div>
                    )}
                </div>

                {/* Message */}
                <div style={{ marginBottom: '2rem' }}>
                    <label style={labelStyle}>Message</label>
                    <textarea
                        value={requestMessage}
                        onChange={e => setRequestMessage(e.target.value)}
                        placeholder="Add a reason or additional details for your request..."
                        rows={3}
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
                    disabled={requestSubmitting || balanceError !== ''}
                    style={{
                        width: '100%', padding: '1.1rem', borderRadius: '16px',
                        fontSize: '0.95rem', fontWeight: '800', letterSpacing: '0.3px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                        opacity: (requestSubmitting || balanceError !== '') ? 0.7 : 1,
                        cursor: (requestSubmitting || balanceError !== '') ? 'not-allowed' : 'pointer',
                        boxShadow: '0 8px 24px rgba(var(--primary-rgb), 0.35)',
                        transform: 'translateY(0)',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                    onMouseOver={e => { if (!requestSubmitting && !balanceError) { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 28px rgba(var(--primary-rgb), 0.45)'; } }}
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
                                        {req.type === 'Leave Application' && req.leaveType && <span style={{ marginLeft: '0.5rem', color: 'var(--primary)', fontWeight: '700' }}>• {req.leaveType}</span>}
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
                                            fontSize: '0.8rem', animation: 'dropdownFadeIn 0.2s ease-out'
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
