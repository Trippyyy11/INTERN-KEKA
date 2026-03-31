import React from 'react';
import { toast } from 'sonner';
import { Info, Inbox, Check, X, Edit3, Save, ChevronLeft, ChevronRight, Calendar, Clock, Home } from 'lucide-react';
import api from '../../api/axios.js';

const InboxTab = ({
    inboxRequests,
    handleRequestAction,
    getStatusStyle,
    isLightMode,
    showAlert
}) => {
    const [localNotes, setLocalNotes] = React.useState({});
    const [showEditModal, setShowEditModal] = React.useState(false);
    const [editLogData, setEditLogData] = React.useState(null);
    const [editForm, setEditForm] = React.useState({ clockInTime: '', clockOutTime: '' });
    const [isSavingEdit, setIsSavingEdit] = React.useState(false);
    const [currentPage, setCurrentPage] = React.useState(1);
    const rowsPerPage = 20;

    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    const currentRequests = inboxRequests.slice(indexOfFirstRow, indexOfLastRow);
    const totalPages = Math.ceil(inboxRequests.length / rowsPerPage);
    const bentoPanelStyle = {
        background: isLightMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(15, 23, 42, 0.5)',
        backdropFilter: 'blur(16px)',
        borderRadius: '24px',
        border: `1px solid ${isLightMode ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)'}`,
        padding: '1.5rem',
        boxShadow: isLightMode ? '0 4px 24px rgba(0,0,0,0.04)' : '0 4px 24px rgba(0,0,0,0.2)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'hidden',
    };

    const inputStyle = {
        padding: '0.5rem 0.75rem',
        borderRadius: '12px',
        border: `1px solid ${isLightMode ? '#e2e8f0' : 'rgba(255,255,255,0.08)'}`,
        background: isLightMode ? '#f8fafc' : 'rgba(0,0,0,0.2)',
        color: 'var(--text-main)',
        fontSize: '0.8rem',
        fontWeight: '500',
        outline: 'none',
        transition: 'border-color 0.2s',
        width: '130px',
    };

    const handleOpenEdit = (request) => {
        if (!request.associatedAttendance) {
            toast.error("No associated attendance log found for this request.");
            return;
        }
        setEditLogData(request);
        setEditForm({
            clockInTime: request.expectedClockIn ? new Date(request.expectedClockIn).toISOString().slice(0, 16) : (request.associatedAttendance?.clockInTime ? new Date(request.associatedAttendance.clockInTime).toISOString().slice(0, 16) : ''),
            clockOutTime: request.expectedClockOut ? new Date(request.expectedClockOut).toISOString().slice(0, 16) : (request.associatedAttendance?.clockOutTime ? new Date(request.associatedAttendance.clockOutTime).toISOString().slice(0, 16) : ''),
        });
        setShowEditModal(true);
    };

    const handleSaveEdit = async () => {
        setIsSavingEdit(true);
        try {
            // Updated to use the single-step atomic approval with overrides
            await handleRequestAction(
                editLogData._id, 
                'Approved', 
                'Attendance updated by manager during regularization.',
                editForm.clockInTime || null,
                editForm.clockOutTime || null
            );
            setShowEditModal(false);
        } catch (err) {
            console.error(err);
            showAlert("The system encountered an error while trying to update and approve the attendance record.", "error", "Update Failed");
        } finally {
            setIsSavingEdit(false);
        }
    };

    const tableContainerStyle = {
        background: isLightMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(15, 23, 42, 0.5)',
        backdropFilter: 'blur(16px)',
        borderRadius: '24px',
        border: `1px solid ${isLightMode ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)'}`,
        boxShadow: isLightMode ? '0 4px 24px rgba(0,0,0,0.04)' : '0 4px 24px rgba(0,0,0,0.2)',
        overflow: 'hidden',
        width: '100%'
    };


    const tdStyle = {
        padding: '1.1rem 1.5rem',
        fontSize: '0.85rem',
        borderBottom: `1px solid ${isLightMode ? '#f1f5f9' : 'rgba(255,255,255,0.03)'}`,
        color: 'var(--text-main)',
        verticalAlign: 'middle'
    };

    const stats = {
        total: inboxRequests.filter(r => r.status === 'Pending').length,
        leave: inboxRequests.filter(r => r.type === 'Leave Application' || r.type === 'Leave Cancellation').length,
        attendance: inboxRequests.filter(r => r.type === 'Attendance Regularization').length,
        others: inboxRequests.filter(r => r.type === 'Work From Home' || (r.type !== 'Leave Application' && r.type !== 'Leave Cancellation' && r.type !== 'Attendance Regularization')).length
    };

    const cardStyle = (gradient) => ({
        flex: 1,
        minWidth: '200px',
        background: gradient,
        borderRadius: '24px',
        padding: '1.25rem',
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'default',
        boxShadow: '0 10px 20px -5px rgba(0,0,0,0.15)',
        border: '1px solid rgba(255,255,255,0.1)'
    });

    const StatsCard = ({ title, count, icon: Icon, gradient }) => (
        <div 
            style={cardStyle(gradient)}
            onMouseOver={e => {
                e.currentTarget.style.transform = 'translateY(-5px) scale(1.02)';
                e.currentTarget.style.boxShadow = '0 20px 40px -10px rgba(0,0,0,0.25)';
            }}
            onMouseOut={e => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 10px 20px -5px rgba(0,0,0,0.15)';
            }}
        >
            <div style={{
                position: 'absolute', top: '-10%', right: '-10%', opacity: 0.15, transform: 'rotate(-15deg)'
            }}>
                <Icon size={100} />
            </div>
            <div style={{
                width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(255,255,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '4px'
            }}>
                <Icon size={18} />
            </div>
            <div style={{ fontSize: '0.75rem', fontWeight: '700', opacity: 0.9, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{title}</div>
            <div style={{ fontSize: '1.8rem', fontWeight: '900', lineHeight: 1 }}>{count}</div>
        </div>
    );

    const thStyle = {
        padding: '1.25rem 1.5rem',
        fontSize: '0.72rem',
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: '1px',
        color: isLightMode ? 'var(--primary)' : '#fff',
        borderBottom: `2px solid ${isLightMode ? 'rgba(var(--primary-rgb), 0.2)' : 'rgba(255,255,255,0.1)'}`,
        textAlign: 'left',
        background: isLightMode ? 'rgba(var(--primary-rgb), 0.12)' : 'rgba(var(--primary-rgb), 0.25)',
        backdropFilter: 'blur(12px)',
        position: 'sticky',
        top: 0,
        zIndex: 10
    };

    return (
        <div style={{ padding: '0 1.5rem', marginTop: '1rem', animation: 'fadeInTab 0.4s ease-out' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <div style={{
                    width: '42px', height: '42px', borderRadius: '14px',
                    background: 'linear-gradient(135deg, rgba(var(--primary-rgb), 0.15), rgba(var(--primary-rgb), 0.05))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--primary)',
                    boxShadow: '0 4px 12px rgba(var(--primary-rgb), 0.15)'
                }}>
                    <Inbox size={20} />
                </div>
                <div>
                    <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-0.3px' }}>Inbox</h2>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '500', marginTop: '0.15rem' }}>Review and manage pending requests</p>
                </div>
            </div>

            <div style={{ 
                display: 'flex', 
                gap: '1.25rem', 
                marginBottom: '2.5rem', 
                flexWrap: 'wrap' 
            }}>
                <StatsCard 
                    title="Total Pending" 
                    count={stats.total} 
                    icon={Inbox} 
                    gradient="linear-gradient(135deg, #3b82f6, #2563eb)" 
                />
                <StatsCard 
                    title="Leave Requests" 
                    count={stats.leave} 
                    icon={Calendar} 
                    gradient="linear-gradient(135deg, #10b981, #059669)" 
                />
                <StatsCard 
                    title="Attendance" 
                    count={stats.attendance} 
                    icon={Clock} 
                    gradient="linear-gradient(135deg, #f59e0b, #d97706)" 
                />
                <StatsCard 
                    title="Work From Home" 
                    count={stats.others} 
                    icon={Home} 
                    gradient="linear-gradient(135deg, #8b5cf6, #7c3aed)" 
                />
            </div>

            <div style={tableContainerStyle}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr>
                                <th style={thStyle}>Date</th>
                                <th style={thStyle}>Employee</th>
                                <th style={thStyle}>Request Details</th>
                                <th style={thStyle}>Duration & Dates</th>
                                <th style={thStyle}>Reason</th>
                                <th style={thStyle}>Manager Note</th>
                                <th style={thStyle}>Status</th>
                                <th style={thStyle}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentRequests.length > 0 ? (
                                currentRequests.map((r, idx) => {
                                    const appliedDate = r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A';
                                    const dateRange = new Date(r.startDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }) + 
                                        (r.startDate !== r.endDate ? ` - ${new Date(r.endDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}` : `, ${new Date(r.startDate).getFullYear()}`);
                                    const duration = Math.ceil((new Date(r.endDate) - new Date(r.startDate)) / (1000 * 60 * 60 * 24)) + 1;
                                    
                                    return (
                                        <tr 
                                            key={r._id} 
                                            className="inbox-row"
                                            style={{ 
                                                transition: 'all 0.2s ease', 
                                                borderLeft: r.status === 'Pending' ? '4px solid var(--primary)' : '4px solid transparent',
                                                background: idx % 2 === 0 ? 'transparent' : (isLightMode ? 'rgba(0,0,0,0.01)' : 'rgba(255,255,255,0.01)')
                                            }}
                                        >
                                            <td style={{ ...tdStyle, fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)' }}>
                                                {appliedDate}
                                            </td>

                                            <td style={tdStyle}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                    <div style={{
                                                        width: '36px', height: '36px', borderRadius: '10px',
                                                        background: 'linear-gradient(135deg, var(--primary), #6366f1)', 
                                                        color: 'white',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        fontSize: '0.85rem', fontWeight: '800',
                                                        boxShadow: '0 4px 10px rgba(99, 102, 241, 0.2)'
                                                    }}>{r.user?.name?.substring(0, 1).toUpperCase()}</div>
                                                    <div>
                                                        <div style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-main)' }}>{r.user?.name}</div>
                                                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>ID: {r.user?._id?.substring(18)}</div>
                                                    </div>
                                                </div>
                                            </td>

                                            <td style={tdStyle}>
                                                <div style={{ 
                                                    fontSize: '0.7rem', color: 'var(--primary)', fontWeight: '800', 
                                                    textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' 
                                                }}>{r.type}</div>
                                                {r.expectedClockIn && r.expectedClockOut && (
                                                    <div style={{ display: 'flex', gap: '8px', fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)' }}>
                                                        <span style={{ color: '#10b981' }}>In: {new Date(r.expectedClockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                        <span style={{ opacity: 0.3 }}>|</span>
                                                        <span style={{ color: '#ef4444' }}>Out: {new Date(r.expectedClockOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                    </div>
                                                )}
                                            </td>

                                            <td style={tdStyle}>
                                                <div style={{ fontWeight: '700', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    {duration} <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '600' }}>DAY(S)</span>
                                                </div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>{dateRange}</div>
                                            </td>

                                            <td style={tdStyle}>
                                                <div style={{ 
                                                    maxWidth: '180px', fontSize: '0.8rem', color: 'var(--text-muted)', 
                                                    fontStyle: r.message ? 'italic' : 'normal', overflow: 'hidden', 
                                                    textOverflow: 'ellipsis', whiteSpace: 'nowrap' 
                                                }} title={r.message}>
                                                    {r.message ? `"${r.message}"` : <span style={{ opacity: 0.4 }}>No note</span>}
                                                </div>
                                            </td>

                                            <td style={tdStyle}>
                                                <div style={{ 
                                                    maxWidth: '180px', fontSize: '0.8rem', color: 'var(--text-muted)', 
                                                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' 
                                                }} title={r.actionNote}>
                                                    {r.actionNote ? `"${r.actionNote}"` : <span style={{ opacity: 0.4 }}>-</span>}
                                                </div>
                                            </td>

                                            <td style={tdStyle}>
                                                <span style={{
                                                    padding: '0.3rem 0.6rem',
                                                    borderRadius: '8px',
                                                    fontSize: '0.65rem',
                                                    fontWeight: '800',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.5px',
                                                    ...getStatusStyle(r.status)
                                                }}>
                                                    {r.status}
                                                </span>
                                            </td>

                                            <td style={{ ...tdStyle, paddingLeft: 0 }}>
                                                {r.status === 'Pending' ? (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                        <input
                                                            type="text"
                                                            placeholder="Note..."
                                                            value={localNotes[r._id] || ''}
                                                            onChange={(e) => setLocalNotes({ ...localNotes, [r._id]: e.target.value })}
                                                            style={{
                                                                ...inputStyle,
                                                                width: '100px',
                                                                padding: '0.4rem 0.75rem',
                                                                fontSize: '0.75rem'
                                                            }}
                                                        />
                                                        <div style={{ display: 'flex', gap: '4px' }}>
                                                            {r.type === 'Attendance Regularization' && (
                                                                <button
                                                                    onClick={() => handleOpenEdit(r)}
                                                                    style={{
                                                                        padding: '0.4rem', borderRadius: '8px',
                                                                        background: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary)', border: 'none',
                                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                        cursor: 'pointer', transition: 'all 0.2s'
                                                                    }}
                                                                    title="Adjust & Approve"
                                                                >
                                                                    <Edit3 size={14} />
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => {
                                                                    handleRequestAction(r._id, 'Approved', localNotes[r._id]);
                                                                    setLocalNotes({ ...localNotes, [r._id]: '' });
                                                                }}
                                                                style={{
                                                                    padding: '0.4rem', borderRadius: '8px',
                                                                    background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: 'none',
                                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                    cursor: 'pointer', transition: 'all 0.2s'
                                                                }}
                                                                title="Quick Approve"
                                                            >
                                                                <Check size={14} strokeWidth={3} />
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    handleRequestAction(r._id, 'Rejected', localNotes[r._id]);
                                                                    setLocalNotes({ ...localNotes, [r._id]: '' });
                                                                }}
                                                                style={{
                                                                    padding: '0.4rem', borderRadius: '8px',
                                                                    background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none',
                                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                    cursor: 'pointer', transition: 'all 0.2s'
                                                                }}
                                                                title="Reject"
                                                            >
                                                                <X size={14} strokeWidth={3} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                                                        {r.actionBy?.name ? `By ${r.actionBy.name}` : 'Completed'}
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="6" style={{ padding: '6rem 0', textAlign: 'center' }}>
                                        <div style={{
                                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                            color: 'var(--text-muted)',
                                        }}>
                                            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(var(--primary-rgb), 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                                                <Inbox size={32} style={{ opacity: 0.3 }} />
                                            </div>
                                            <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: '800', color: 'var(--text-main)' }}>Your inbox is empty!</p>
                                            <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>You've cleared all pending requests.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div style={{
                        padding: '1rem 1.5rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: isLightMode ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.1)',
                        borderTop: `1px solid ${isLightMode ? '#f1f5f9' : 'rgba(255,255,255,0.05)'}`
                    }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                            Showing {indexOfFirstRow + 1} to {Math.min(indexOfLastRow, inboxRequests.length)} of {inboxRequests.length}
                        </div>
                        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                style={{
                                    padding: '0.4rem', borderRadius: '8px', border: 'none',
                                    background: isLightMode ? '#fff' : 'rgba(255,255,255,0.05)',
                                    color: 'var(--text-main)', cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                                    opacity: currentPage === 1 ? 0.5 : 1, display: 'flex', alignItems: 'center'
                                }}
                            >
                                <ChevronLeft size={16} />
                            </button>

                            {[...Array(totalPages)].map((_, i) => {
                                const pageNum = i + 1;
                                if (pageNum === 1 || pageNum === totalPages || (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)) {
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => setCurrentPage(pageNum)}
                                            style={{
                                                minWidth: '32px', height: '32px', borderRadius: '8px', border: 'none',
                                                background: currentPage === pageNum ? 'var(--primary)' : (isLightMode ? '#fff' : 'rgba(255,255,255,0.05)'),
                                                color: currentPage === pageNum ? '#fff' : 'var(--text-main)',
                                                fontWeight: '700', cursor: 'pointer', fontSize: '0.8rem'
                                            }}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                                    return <span key={pageNum} style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>...</span>;
                                }
                                return null;
                            })}

                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                style={{
                                    padding: '0.4rem', borderRadius: '8px', border: 'none',
                                    background: isLightMode ? '#fff' : 'rgba(255,255,255,0.05)',
                                    color: 'var(--text-main)', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                                    opacity: currentPage === totalPages ? 0.5 : 1, display: 'flex', alignItems: 'center'
                                }}
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {showEditModal && editLogData && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)',
                    zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    animation: 'fadeInDialog 0.3s ease-out', padding: '1.5rem'
                }}>
                    <div style={{
                        background: isLightMode ? '#ffffff' : '#1e293b',
                        width: '100%', maxWidth: '420px', borderRadius: '24px',
                        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
                        border: `1px solid ${isLightMode ? '#e2e8f0' : 'rgba(255,255,255,0.1)'}`,
                        overflow: 'hidden'
                    }}>
                        <div style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${isLightMode ? '#f1f5f9' : 'rgba(255,255,255,0.05)'}` }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Edit3 size={18} />
                                </div>
                                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-0.3px' }}>Edit Regularization</h3>
                            </div>
                            <button onClick={() => setShowEditModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.5rem', borderRadius: '50%' }}>
                                <X size={20} />
                            </button>
                        </div>

                        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ padding: '1rem', background: isLightMode ? '#f8fafc' : 'rgba(0,0,0,0.2)', borderRadius: '16px', border: `1px dashed ${isLightMode ? '#cbd5e1' : 'rgba(255,255,255,0.1)'}` }}>
                                <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>User Reason</div>
                                <div style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: '500' }}>"{editLogData.message}"</div>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Clock In Time</label>
                                <input
                                    type="datetime-local"
                                    value={editForm.clockInTime}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, clockInTime: e.target.value }))}
                                    style={{ ...inputStyle, width: '100%', padding: '0.8rem' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Clock Out Time</label>
                                <input
                                    type="datetime-local"
                                    value={editForm.clockOutTime}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, clockOutTime: e.target.value }))}
                                    style={{ ...inputStyle, width: '100%', padding: '0.8rem' }}
                                />
                            </div>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <Info size={12} /> Saving will update attendance and approve the request.
                            </p>
                        </div>

                        <div style={{ padding: '1.25rem 1.5rem', background: isLightMode ? '#f8fafc' : 'rgba(0,0,0,0.2)', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: `1px solid ${isLightMode ? '#f1f5f9' : 'rgba(255,255,255,0.05)'}` }}>
                            <button onClick={() => setShowEditModal(false)} style={{ padding: '0.7rem 1.5rem', borderRadius: '12px', background: 'transparent', border: 'none', color: 'var(--text-main)', fontSize: '0.9rem', fontWeight: '700', cursor: 'pointer' }}>Cancel</button>
                            <button
                                onClick={handleSaveEdit}
                                disabled={isSavingEdit}
                                style={{
                                    padding: '0.7rem 1.5rem', borderRadius: '12px', background: 'var(--primary)', color: '#fff',
                                    border: 'none', fontSize: '0.9rem', fontWeight: '800', cursor: isSavingEdit ? 'not-allowed' : 'pointer',
                                    display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: isSavingEdit ? 0.6 : 1,
                                    boxShadow: '0 4px 12px rgba(var(--primary-rgb), 0.3)'
                                }}
                            >
                                {isSavingEdit ? 'Saving...' : <><Save size={16} /> Save & Approve</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .inbox-row:hover {
                    background: ${isLightMode ? 'rgba(var(--primary-rgb), 0.03)' : 'rgba(var(--primary-rgb), 0.05)'} !important;
                    transform: translateX(4px);
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
            `}</style>
        </div>
    );
};

export default InboxTab;
