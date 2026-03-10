import React, { useState } from 'react';
import api from '../../api/axios';
import moment from 'moment';

import { ChevronDown, FileText, Clock, Calendar, Building2, Award, Info } from 'lucide-react';

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
    const [selectedMonth, setSelectedMonth] = useState(moment().format('MMMM'));
    const [selectedYear, setSelectedYear] = useState(moment().year());

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const years = Array.from({ length: 5 }, (_, i) => moment().year() - i);

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

    const renderPayslips = () => {
        const filteredPayslip = payslips.find(p => p.month === selectedMonth && parseInt(p.year) === parseInt(selectedYear));

        const themeColors = {
            panelBg: isLightMode ? '#ffffff' : 'linear-gradient(145deg, rgba(23, 23, 23, 0.4) 0%, rgba(10, 10, 10, 0.2) 100%)',
            selectBg: isLightMode ? '#f8f9fa' : 'rgba(255, 255, 255, 0.05)',
            selectBorder: isLightMode ? '#e9ecef' : 'rgba(255, 255, 255, 0.1)',
            cardBg: isLightMode ? '#fdfdfd' : 'rgba(255,255,255,0.01)',
            cardBorder: isLightMode ? '#f1f3f5' : 'rgba(255,255,255,0.03)',
            stripeBg: isLightMode ? 'rgba(var(--primary-rgb), 0.05)' : 'linear-gradient(90deg, rgba(var(--primary-rgb), 0.1) 0%, rgba(var(--primary-rgb), 0.05) 100%)',
            stripeBorder: isLightMode ? 'rgba(var(--primary-rgb), 0.15)' : 'rgba(var(--primary-rgb), 0.3)',
            textMain: isLightMode ? '#1a1a1a' : 'var(--text-main)',
            textMuted: isLightMode ? '#6c757d' : 'var(--text-muted)'
        };

        const selectContainerStyle = {
            position: 'relative',
            display: 'inline-flex',
            alignItems: 'center',
            background: themeColors.selectBg,
            border: `1px solid ${themeColors.selectBorder}`,
            borderRadius: '12px',
            padding: '0 1rem',
            transition: 'all 0.3s ease',
            backdropFilter: isLightMode ? 'none' : 'blur(10px)',
            cursor: 'pointer',
            boxShadow: isLightMode ? '0 2px 4px rgba(0,0,0,0.02)' : 'none'
        };

        const selectStyle = {
            appearance: 'none',
            background: 'transparent',
            border: 'none',
            color: themeColors.textMain,
            fontSize: '0.9rem',
            fontWeight: '600',
            padding: '0.75rem 2rem 0.75rem 0.5rem',
            cursor: 'pointer',
            outline: 'none',
            width: '100%'
        };

        const dropdownIconStyle = {
            position: 'absolute',
            right: '1rem',
            pointerEvents: 'none',
            color: 'var(--primary)',
            opacity: 0.8
        };

        return (
            <div className="panel" style={{
                width: '100%',
                minHeight: 'calc(100vh - 250px)',
                margin: '0',
                background: themeColors.panelBg,
                border: isLightMode ? '1px solid #edf2f7' : '1px solid rgba(255, 255, 255, 0.05)',
                display: 'flex',
                flexDirection: 'column',
                color: themeColors.textMain,
                boxShadow: isLightMode ? '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)' : 'none'
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '2.5rem',
                    flexWrap: 'wrap',
                    gap: '1.5rem',
                    padding: '0.5rem'
                }}>
                    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', letterSpacing: '-0.5px' }}>Monthly Payslip</h2>

                        <div style={selectContainerStyle} onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(var(--primary-rgb), 0.5)'} onMouseLeave={(e) => e.currentTarget.style.borderColor = themeColors.selectBorder}>
                            <select
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(e.target.value)}
                                style={selectStyle}
                            >
                                {months.map(m => <option key={m} value={m} style={{ background: isLightMode ? '#ffffff' : '#1a1a1a', color: themeColors.textMain }}>{m}</option>)}
                            </select>
                            <ChevronDown size={16} style={dropdownIconStyle} />
                        </div>

                        <div style={selectContainerStyle} onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(var(--primary-rgb), 0.5)'} onMouseLeave={(e) => e.currentTarget.style.borderColor = themeColors.selectBorder}>
                            <select
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                                style={selectStyle}
                            >
                                {years.map(y => <option key={y} value={y} style={{ background: isLightMode ? '#ffffff' : '#1a1a1a', color: themeColors.textMain }}>{y}</option>)}
                            </select>
                            <ChevronDown size={16} style={dropdownIconStyle} />
                        </div>
                    </div>
                    {filteredPayslip && (
                        <button className="btn btn-primary" style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.75rem 1.5rem',
                            borderRadius: '10px',
                            boxShadow: '0 4px 15px rgba(var(--primary-rgb), 0.3)'
                        }}>
                            <FileText size={18} />
                            Download PDF
                        </button>
                    )}
                </div>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    {filteredPayslip ? (
                        <>
                            <div style={{ marginBottom: '2rem', display: 'flex', gap: '3rem', padding: '1rem', background: isLightMode ? '#f8f9fa' : 'rgba(255,255,255,0.02)', borderRadius: '16px', border: `1px solid ${isLightMode ? '#edf2f7' : 'rgba(255,255,255,0.05)'}` }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(var(--primary-rgb), 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                                        <Clock size={20} />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.75rem', color: themeColors.textMuted, textTransform: 'uppercase', fontWeight: '600' }}>Status</div>
                                        <div style={{
                                            fontSize: '1rem',
                                            fontWeight: '700',
                                            color: filteredPayslip.status === 'Paid' ? 'var(--success)' : 'var(--warning)'
                                        }}>
                                            {filteredPayslip.status || 'Paid'}
                                        </div>
                                    </div>
                                </div>
                                {filteredPayslip.status === 'Paid' && (
                                    <>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(34, 197, 94, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--success)' }}>
                                                <Calendar size={20} />
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '0.75rem', color: themeColors.textMuted, textTransform: 'uppercase', fontWeight: '600' }}>Paid Date</div>
                                                <div style={{ fontSize: '1rem', fontWeight: '600', color: themeColors.textMain }}>{moment(filteredPayslip.paidAt || filteredPayslip.updatedAt).format('DD MMM YYYY')}</div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(155, 81, 224, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9b51e0' }}>
                                                <Building2 size={20} />
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '0.75rem', color: themeColors.textMuted, textTransform: 'uppercase', fontWeight: '600' }}>Method</div>
                                                <div style={{ fontSize: '1rem', fontWeight: '600', color: themeColors.textMain }}>{filteredPayslip.paymentMethod || 'Bank Transfer'}</div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '3rem', marginBottom: '3rem', flex: 1 }}>
                                <div style={{ background: themeColors.cardBg, padding: '2rem', borderRadius: '20px', border: `1px solid ${themeColors.cardBorder}`, boxShadow: isLightMode ? '0 2px 10px rgba(0,0,0,0.02)' : 'none' }}>
                                    <div style={{ fontSize: '1rem', color: 'var(--primary)', fontWeight: '700', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Award size={18} />
                                        EARNINGS
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', color: themeColors.textMain }}><span>Basic Salary</span><span style={{ fontWeight: '600' }}>₹{filteredPayslip.earnings.basicSalary.toLocaleString()}</span></div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', color: themeColors.textMain }}><span>HRA</span><span style={{ fontWeight: '600' }}>₹{filteredPayslip.earnings.hra.toLocaleString()}</span></div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', color: 'var(--primary)' }}><span>Bonus</span><span style={{ fontWeight: '700' }}>₹{(filteredPayslip.earnings.bonus || 0).toLocaleString()}</span></div>
                                        {filteredPayslip.earnings.specialAllowance > 0 && (
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', color: themeColors.textMain }}><span>Special Allowance</span><span style={{ fontWeight: '600' }}>₹{filteredPayslip.earnings.specialAllowance.toLocaleString()}</span></div>
                                        )}
                                    </div>
                                </div>
                                <div style={{ background: themeColors.cardBg, padding: '2rem', borderRadius: '20px', border: `1px solid ${themeColors.cardBorder}`, boxShadow: isLightMode ? '0 2px 10px rgba(0,0,0,0.02)' : 'none' }}>
                                    <div style={{ fontSize: '1rem', color: '#ff4757', fontWeight: '700', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Info size={18} />
                                        DEDUCTIONS
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', color: themeColors.textMain }}><span>PF</span><span style={{ fontWeight: '600', color: '#ff4757' }}>₹{filteredPayslip.deductions.pf.toLocaleString()}</span></div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', color: themeColors.textMain }}><span>Tax (TDS)</span><span style={{ fontWeight: '600', color: '#ff4757' }}>₹{filteredPayslip.deductions.tax.toLocaleString()}</span></div>
                                        {filteredPayslip.deductions.professionalTax > 0 && (
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', color: themeColors.textMain }}><span>Professional Tax</span><span style={{ fontWeight: '600', color: '#ff4757' }}>₹{filteredPayslip.deductions.professionalTax.toLocaleString()}</span></div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div style={{
                                marginTop: 'auto',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                background: themeColors.stripeBg,
                                border: `1px solid ${themeColors.stripeBorder}`,
                                padding: '2rem',
                                borderRadius: '24px',
                                boxShadow: isLightMode ? '0 8px 20px rgba(0,0,0,0.05)' : '0 10px 30px rgba(0,0,0,0.2)'
                            }}>
                                <div>
                                    <div style={{ fontSize: '0.85rem', color: themeColors.textMuted, fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>Net Payout (Final Amount)</div>
                                    <div style={{ fontSize: '1rem', color: themeColors.textMain, marginTop: '0.25rem' }}>{selectedMonth} {selectedYear}</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--success)', letterSpacing: '-1px' }}>
                                        ₹{filteredPayslip.netPay.toLocaleString()}
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div style={{
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '4rem',
                            color: themeColors.textMuted,
                            background: isLightMode ? '#fdfdfd' : 'rgba(255,255,255,0.01)',
                            borderRadius: '24px',
                            border: `1px dashed ${isLightMode ? '#dee2e6' : 'rgba(255,255,255,0.1)'}`,
                            textAlign: 'center'
                        }}>
                            <div style={{
                                width: '120px',
                                height: '120px',
                                borderRadius: '50%',
                                background: isLightMode ? '#ffffff' : 'rgba(255,255,255,0.03)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '2rem',
                                border: `1px solid ${isLightMode ? '#f1f3f5' : 'rgba(255,255,255,0.05)'}`,
                                boxShadow: isLightMode ? '0 10px 25px rgba(0,0,0,0.05)' : '0 20px 40px rgba(0,0,0,0.2)'
                            }}>
                                <FileText size={48} style={{ opacity: 0.3, color: 'var(--primary)' }} />
                            </div>
                            <h3 style={{ fontSize: '1.75rem', fontWeight: '700', color: themeColors.textMain, marginBottom: '1rem' }}>No Data Available</h3>
                            <p style={{ fontSize: '1.1rem', maxWidth: '400px', lineHeight: '1.6', opacity: 0.7 }}>
                                We couldn't find any payslip record for **{selectedMonth} {selectedYear}**.
                                Payslips are typically generated and uploaded during the last week of the month.
                            </p>
                            <button
                                onClick={() => { setSelectedMonth(moment().format('MMMM')); setSelectedYear(moment().year()); }}
                                className="btn btn-secondary"
                                style={{ marginTop: '2.5rem', padding: '0.75rem 2rem', borderRadius: '12px' }}
                            >
                                Back to Current Month
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    };

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
