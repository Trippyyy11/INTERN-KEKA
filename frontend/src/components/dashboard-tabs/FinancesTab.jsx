import React, { useState } from 'react';
import api from '../../api/axios';
import moment from 'moment';

const FinancesTab = ({
    user,
    setUser,
    activeSubTab,
    setActiveSubTab,
    globalPayslips,
    payslips,
    isLightMode
}) => {
    const isSuper = user?.role === 'Super Admin';
    const [bankData, setBankData] = useState({
        accountHolderName: user?.bankDetails?.accountHolderName || '',
        accountNumber: user?.bankDetails?.accountNumber || '',
        ifscCode: user?.bankDetails?.ifscCode || '',
        bankName: user?.bankDetails?.bankName || '',
        branchName: user?.bankDetails?.branchName || '',
        upiId: user?.bankDetails?.upiId || ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [selectedPayslip, setSelectedPayslip] = useState(payslips[0] || null);

    const handleBankSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);
        try {
            const res = await api.put('/auth/bank-details', bankData);
            if (setUser) {
                setUser({ ...user, bankDetails: res.data });
            }
            setMessage({ type: 'success', text: 'Bank details updated successfully!' });
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update bank details' });
        } finally {
            setLoading(false);
        }
    };

    const renderPayslips = () => (
        <div className="grid" style={{ gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '2rem' }}>
            <div className="panel">
                <div className="panel-header">Recent Payslips</div>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {payslips.map((p) => (
                        <li
                            key={p._id}
                            onClick={() => setSelectedPayslip(p)}
                            style={{
                                background: selectedPayslip?._id === p._id ? 'rgba(var(--primary-rgb, 155, 89, 182), 0.1)' : 'transparent',
                                padding: '1rem',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                borderLeft: selectedPayslip?._id === p._id ? '3px solid var(--primary)' : 'none'
                            }}
                        >
                            <div style={{ fontWeight: '500' }}>{p.month} {p.year}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Generated on {moment(p.createdAt).format('DD MMM YYYY')}</div>
                        </li>
                    ))}
                    {payslips.length === 0 && <div style={{ color: 'var(--text-muted)', padding: '1rem' }}>No payslips available.</div>}
                </ul>
            </div>

            <div className="panel">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Payslip Detail</h2>
                    <button className="btn btn-primary">Download PDF</button>
                </div>

                {selectedPayslip ? (
                    <>
                        <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '2rem' }}>
                            <div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Status</div>
                                <div style={{
                                    fontSize: '0.9rem',
                                    fontWeight: '600',
                                    color: selectedPayslip.status === 'Paid' ? 'var(--success)' : 'var(--warning)'
                                }}>
                                    {selectedPayslip.status || 'Paid'}
                                </div>
                            </div>
                            {selectedPayslip.status === 'Paid' && (
                                <>
                                    <div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Paid Date</div>
                                        <div style={{ fontSize: '0.9rem' }}>{moment(selectedPayslip.paidAt || selectedPayslip.updatedAt).format('DD MMM YYYY, hh:mm A')}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Method</div>
                                        <div style={{ fontSize: '0.9rem' }}>{selectedPayslip.paymentMethod || 'Bank Transfer'}</div>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '1px solid var(--border-dark)' }}>
                            <div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>EARNINGS</div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.9rem' }}><span>Basic Salary</span><span>₹{selectedPayslip.earnings.basicSalary}</span></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.9rem' }}><span>HRA</span><span>₹{selectedPayslip.earnings.hra}</span></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.9rem', color: 'var(--primary)' }}><span>Bonus</span><span>₹{selectedPayslip.earnings.bonus || 0}</span></div>
                                {selectedPayslip.earnings.specialAllowance > 0 && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.9rem' }}><span>Special Allowance</span><span>₹{selectedPayslip.earnings.specialAllowance}</span></div>
                                )}
                            </div>
                            <div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>DEDUCTIONS</div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.9rem' }}><span>PF</span><span>₹{selectedPayslip.deductions.pf}</span></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.9rem' }}><span>Tax (TDS)</span><span>₹{selectedPayslip.deductions.tax}</span></div>
                                {selectedPayslip.deductions.professionalTax > 0 && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.9rem' }}><span>Professional Tax</span><span>₹{selectedPayslip.deductions.professionalTax}</span></div>
                                )}
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(var(--primary-rgb), 0.05)', border: '1px solid rgba(var(--primary-rgb), 0.2)', padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
                            <span style={{ fontSize: '1.1rem', fontWeight: '500' }}>Net Payout (Final Amount)</span>
                            <span style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'var(--success)' }}>
                                ₹{selectedPayslip.netPay}
                            </span>
                        </div>
                    </>
                ) : (
                    <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>Select a payslip to view details.</div>
                )}
            </div>
        </div>
    );

    const renderBankInfo = () => (
        <div className="panel" style={{ maxWidth: '930px', margin: '0 auto' }}>
            <div className="panel-header">Bank Account Details</div>
            <div style={{ padding: '2rem' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '2rem' }}>
                    Please provide your accurate bank details to ensure timely salary payments. These details will be used for both Bank Transfers and UPI payouts.
                </p>

                {message && (
                    <div style={{
                        padding: '1rem',
                        borderRadius: '4px',
                        marginBottom: '1.5rem',
                        background: message.type === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(244, 63, 94, 0.1)',
                        color: message.type === 'success' ? '#166534' : '#991b1b',
                        border: '1px solid',
                        borderColor: message.type === 'success' ? '#bbf7d0' : '#fecaca'
                    }}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleBankSubmit}>
                    <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', rowGap: '2rem', columnGap: '2.5rem' }}>
                        <div className="form-group">
                            <label style={{
                                display: 'block', fontSize: '0.85rem',
                                letterSpacing: '0.3px', fontWeight: '500', marginBottom: '0.5rem'
                            }}>Account Holder Name</label>
                            <input
                                type="text"
                                className="input"
                                value={bankData.accountHolderName}
                                onChange={(e) => setBankData({ ...bankData, accountHolderName: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label style={{
                                display: 'block', fontSize: '0.85rem',
                                letterSpacing: '0.3px', fontWeight: '500', marginBottom: '0.5rem'
                            }}>Bank Name</label>
                            <input
                                type="text"
                                className="input"
                                value={bankData.bankName}
                                onChange={(e) => setBankData({ ...bankData, bankName: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label style={{
                                display: 'block', fontSize: '0.85rem',
                                letterSpacing: '0.3px', fontWeight: '500', marginBottom: '0.5rem'
                            }}>Account Number</label>
                            <input
                                type="text"
                                inputMode='numeric'
                                maxLength="11"
                                className="input"
                                value={bankData.accountNumber}
                                onChange={(e) => setBankData({ ...bankData, accountNumber: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label style={{
                                display: 'block', fontSize: '0.85rem',
                                letterSpacing: '0.3px', fontWeight: '500', marginBottom: '0.5rem'
                            }}>IFSC Code</label>
                            <input
                                type="text"
                                className="input"
                                placeholder='eg.SBIN01234567'
                                value={bankData.ifscCode}
                                onChange={(e) => setBankData({ ...bankData, ifscCode: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label style={{
                                display: 'block', fontSize: '0.85rem',
                                letterSpacing: '0.3px', fontWeight: '500', marginBottom: '0.5rem'
                            }}>Branch Name</label>
                            <input
                                type="text"
                                className="input"
                                value={bankData.branchName}
                                onChange={(e) => setBankData({ ...bankData, branchName: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label style={{
                                display: 'block', fontSize: '0.85rem',
                                letterSpacing: '0.3px', fontWeight: '500', marginBottom: '0.5rem'
                            }}>UPI ID </label>
                            <input
                                type="text"
                                required
                                className="input"
                                placeholder="example@upi"
                                value={bankData.upiId}
                                onChange={(e) => setBankData({ ...bankData, upiId: e.target.value })}
                            />
                        </div>
                    </div>
                    <div style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Saving...' : 'Save Bank Details'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

    return (
        <>
            <div className="sub-nav">
                <div className={`sub-nav-item ${activeSubTab === 'Payslips' ? 'active' : ''}`} onClick={() => setActiveSubTab('Payslips')}>PAYSLIPS</div>
                <div className={`sub-nav-item ${activeSubTab === 'Bank' ? 'active' : ''}`} onClick={() => setActiveSubTab('Bank')}>BANK INFO</div>
            </div>
            <div className="page-content">
                {activeSubTab === 'Payslips' ? renderPayslips() : renderBankInfo()}
            </div>
        </>
    );
};

export default FinancesTab;
