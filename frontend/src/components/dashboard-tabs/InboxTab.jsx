import React from 'react';
import { Info, Inbox, Check, X, Edit3, Save, ChevronLeft, ChevronRight } from 'lucide-react';
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
            alert("No associated attendance log found for this request.");
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
            showAlert("Failed to update and approve attendance.", "error");
        } finally {
            setIsSavingEdit(false);
        }
    };

    return (
        <div style={{ padding: '0 1.5rem', marginTop: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
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

            <div style={{ ...bentoPanelStyle, padding: '0' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 0.75rem', padding: '0 1rem' }}>
                        <thead>
                            <tr>
                                {['Dates', 'Request Type', 'Status', 'Requested By', 'Action Taken On', 'Leave / WFH Note', 'Action Note', 'Actions'].map((header, idx) => (
                                    <th key={idx} style={{
                                        textAlign: 'left',
                                        padding: '1.25rem',
                                        fontSize: '0.75rem',
                                        fontWeight: '800',
                                        color: 'var(--text-muted)',
                                        textTransform: 'uppercase',
                                        letterSpacing: '1px'
                                    }}>{header}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                             {currentRequests.length > 0 ? currentRequests.map(r => (
                                <tr key={r._id} style={{
                                    background: isLightMode ? '#ffffff' : 'rgba(255,255,255,0.02)',
                                    transition: 'all 0.2s ease',
                                    borderRadius: '16px',
                                    boxShadow: isLightMode ? '0 1px 3px rgba(0,0,0,0.02)' : 'none'
                                }}
                                    onMouseOver={e => {
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                        e.currentTarget.style.boxShadow = isLightMode ? '0 8px 16px rgba(0,0,0,0.04)' : '0 8px 16px rgba(0,0,0,0.2)';
                                        e.currentTarget.style.background = isLightMode ? '#ffffff' : 'rgba(255,255,255,0.05)';
                                    }}
                                    onMouseOut={e => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = isLightMode ? '0 1px 3px rgba(0,0,0,0.02)' : 'none';
                                        e.currentTarget.style.background = isLightMode ? '#ffffff' : 'rgba(255,255,255,0.02)';
                                    }}
                                >
                                    <td style={{ padding: '1.25rem', borderRadius: '16px 0 0 16px', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-main)' }}>
                                        {new Date(r.startDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        {r.startDate !== r.endDate && ` - ${new Date(r.endDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}`}
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px', fontWeight: '500' }}>
                                            {r.type === 'Half Day' ? '0.5' : (Math.ceil((new Date(r.endDate) - new Date(r.startDate)) / (1000 * 60 * 60 * 24)) + 1)} day(s)
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.25rem', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-main)' }}>
                                        {r.type}{r.type === 'Half Day' && r.leaveType ? ` (${r.leaveType})` : ''}
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px', fontWeight: '500' }}>
                                            Requested on {new Date(r.createdAt).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.25rem' }}>
                                        <span style={{
                                            padding: '0.3rem 0.7rem',
                                            borderRadius: '20px',
                                            fontSize: '0.7rem',
                                            fontWeight: '700',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px',
                                            ...getStatusStyle(r.status)
                                        }}>
                                            {r.status}
                                        </span>
                                        {r.status !== 'Pending' && r.actionBy && (
                                            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '6px', fontWeight: '600' }}>by {r.actionBy.name}</div>
                                        )}
                                    </td>
                                    <td style={{ padding: '1.25rem', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-main)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <div style={{
                                                width: '24px', height: '24px', borderRadius: '8px',
                                                background: 'var(--primary)', color: 'white',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: '0.6rem', fontWeight: '800'
                                            }}>{r.user?.name?.substring(0, 1).toUpperCase()}</div>
                                            {r.user?.name}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.25rem', fontSize: '0.85rem', fontWeight: '500', color: 'var(--text-muted)' }}>
                                        {r.status !== 'Pending' && r.actionDate ? new Date(r.actionDate).toLocaleDateString() : '-'}
                                    </td>
                                    <td style={{ padding: '1.25rem', fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: '160px', fontWeight: '500' }}>
                                        <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.message || '-'}</div>
                                        {r.expectedClockIn && r.expectedClockOut && (
                                            <div style={{ marginTop: '0.25rem', fontSize: '0.7rem', color: 'var(--primary)', fontWeight: '700' }}>
                                                Expected: {new Date(r.expectedClockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(r.expectedClockOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        )}
                                    </td>
                                    <td style={{ padding: '1.25rem', fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: '140px', fontWeight: '500' }}>
                                        <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.actionNote || '-'}</div>
                                    </td>
                                    <td style={{ padding: '1.25rem', borderRadius: '0 16px 16px 0' }}>
                                        {r.status === 'Pending' ? (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <input
                                                    type="text"
                                                    placeholder="Optional Note"
                                                    value={localNotes[r._id] || ''}
                                                    onChange={(e) => setLocalNotes({ ...localNotes, [r._id]: e.target.value })}
                                                    style={inputStyle}
                                                />
                                                <div style={{ display: 'flex', gap: '0.3rem' }}>
                                                    {r.type === 'Attendance Regularization' && (
                                                        <button
                                                            onClick={() => handleOpenEdit(r)}
                                                            style={{
                                                                width: '32px', height: '32px', borderRadius: '10px',
                                                                background: 'rgba(59, 130, 246, 0.15)', color: 'var(--primary)', border: 'none',
                                                                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                                                                transition: 'background 0.2s',
                                                            }}
                                                            onMouseOver={e => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.25)'}
                                                            onMouseOut={e => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.15)'}
                                                            title="Edit Attendance & Approve"
                                                        >
                                                            <Edit3 size={16} strokeWidth={2} />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => {
                                                            handleRequestAction(r._id, 'Approved', localNotes[r._id]);
                                                            setLocalNotes({ ...localNotes, [r._id]: '' });
                                                        }}
                                                        style={{
                                                            width: '32px', height: '32px', borderRadius: '10px',
                                                            background: 'rgba(16, 185, 129, 0.15)', color: 'var(--success)', border: 'none',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                                                            transition: 'background 0.2s',
                                                        }}
                                                        onMouseOver={e => e.currentTarget.style.background = 'rgba(16, 185, 129, 0.25)'}
                                                        onMouseOut={e => e.currentTarget.style.background = 'rgba(16, 185, 129, 0.15)'}
                                                        title="Approve"
                                                    >
                                                        <Check size={16} strokeWidth={3} />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            handleRequestAction(r._id, 'Rejected', localNotes[r._id]);
                                                            setLocalNotes({ ...localNotes, [r._id]: '' });
                                                        }}
                                                        style={{
                                                            width: '32px', height: '32px', borderRadius: '10px',
                                                            background: 'rgba(239, 68, 68, 0.15)', color: 'var(--danger)', border: 'none',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                                                            transition: 'background 0.2s',
                                                        }}
                                                        onMouseOver={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.25)'}
                                                        onMouseOut={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)'}
                                                        title="Reject"
                                                    >
                                                        <X size={16} strokeWidth={3} />
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                                                No actions
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="8" style={{ padding: '4rem 0', textAlign: 'center' }}>
                                        <div style={{
                                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                            color: 'var(--text-muted)',
                                        }}>
                                            <Info size={32} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                                            <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: '600' }}>No requests in your inbox.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div style={{
                        padding: '1.25rem 1.5rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderTop: `1px solid ${isLightMode ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)'}`,
                        background: isLightMode ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.1)'
                    }}>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                            Showing {indexOfFirstRow + 1} to {Math.min(indexOfLastRow, inboxRequests.length)} of {inboxRequests.length} requests
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                style={{
                                    padding: '0.5rem',
                                    borderRadius: '10px',
                                    border: 'none',
                                    background: isLightMode ? '#ffffff' : 'rgba(255,255,255,0.05)',
                                    color: 'var(--text-main)',
                                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                                    opacity: currentPage === 1 ? 0.5 : 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    transition: 'all 0.2s',
                                    boxShadow: isLightMode ? '0 1px 3px rgba(0,0,0,0.05)' : 'none'
                                }}
                            >
                                <ChevronLeft size={18} />
                            </button>

                            {[...Array(totalPages)].map((_, i) => {
                                const pageNum = i + 1;
                                // Only show current, first, last, and pages around current
                                if (
                                    pageNum === 1 ||
                                    pageNum === totalPages ||
                                    (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                                ) {
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => setCurrentPage(pageNum)}
                                            style={{
                                                width: '36px',
                                                height: '36px',
                                                borderRadius: '10px',
                                                border: 'none',
                                                background: currentPage === pageNum ? 'var(--primary)' : (isLightMode ? '#ffffff' : 'rgba(255,255,255,0.05)'),
                                                color: currentPage === pageNum ? '#ffffff' : 'var(--text-main)',
                                                fontWeight: '800',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                                boxShadow: (currentPage === pageNum || isLightMode) ? '0 2px 8px rgba(0,0,0,0.05)' : 'none'
                                            }}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                } else if (
                                    pageNum === currentPage - 2 ||
                                    pageNum === currentPage + 2
                                ) {
                                    return <span key={pageNum} style={{ color: 'var(--text-muted)' }}>...</span>;
                                }
                                return null;
                            })}

                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                style={{
                                    padding: '0.5rem',
                                    borderRadius: '10px',
                                    border: 'none',
                                    background: isLightMode ? '#ffffff' : 'rgba(255,255,255,0.05)',
                                    color: 'var(--text-main)',
                                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                                    opacity: currentPage === totalPages ? 0.5 : 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    transition: 'all 0.2s',
                                    boxShadow: isLightMode ? '0 1px 3px rgba(0,0,0,0.05)' : 'none'
                                }}
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Edit Attendance Modal */}
            {showEditModal && editLogData && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)',
                    zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    animation: 'fadeIn 0.3s ease-out', padding: '1.5rem'
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
        </div>
    );
};

export default InboxTab;
