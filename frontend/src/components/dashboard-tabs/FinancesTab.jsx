import React, { useState } from 'react';
import api from '../../api/axios';
import moment from 'moment';

import { ChevronDown, FileText, Clock, Calendar, Building2, Award, Info } from 'lucide-react';

const bankLabelStyle = {
    display: 'block',
    fontSize: '0.75rem',
    letterSpacing: '0.6px',
    fontWeight: '600',
    marginBottom: '0.6rem',
    color: 'var(--text-muted)',
    textTransform: 'uppercase'
};

const bankIconStyle = {
    position: 'absolute',
    left: '0.85rem',
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'var(--text-muted)',
    opacity: 0.5,
    pointerEvents: 'none'
};

const BankField = ({ label, icon, children }) => (
    <div>
        <label style={bankLabelStyle}>{label}</label>
        <div style={{ position: 'relative' }}>
            <span style={bankIconStyle}>{icon}</span>
            {children}
        </div>
    </div>
);

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

    const bankInputStyle = {
        width: '100%',
        padding: '0.85rem 1.25rem 0.85rem 3rem',
        background: isLightMode ? '#f8fafc' : '#0a0a0a',
        border: `1.5px solid ${isLightMode ? '#e2e8f0' : 'rgba(255, 255, 255, 0.03)'}`,
        borderRadius: '16px',
        color: isLightMode ? '#1e293b' : '#f8f9fa',
        fontSize: '0.95rem',
        outline: 'none',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        boxSizing: 'border-box',
        letterSpacing: '0.3px',
        fontFamily: 'inherit',
        WebkitBoxShadow: `0 0 0px 1000px ${isLightMode ? '#f8fafc' : '#0a0a0a'} inset`,
        WebkitTextFillColor: isLightMode ? '#1e293b' : '#f8f9fa'
    };

    const bankInputFocusStyle = {
        borderColor: 'var(--primary)',
        background: isLightMode ? '#ffffff' : '#050505',
        boxShadow: isLightMode
            ? '0 0 0 4px rgba(59, 130, 246, 0.08), 0 4px 12px rgba(0, 0, 0, 0.02)'
            : '0 0 0 4px rgba(59, 130, 246, 0.12), 0 8px 24px rgba(0, 0, 0, 0.4)',
        transform: 'translateY(-2px)'
    };

    const renderBankInfo = () => (
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            {/* Header Card */}
            <div style={{
                background: `linear-gradient(135deg, ${isLightMode ? '#6366f1' : '#4f46e5'} 0%, ${isLightMode ? '#8b5cf6' : '#7c3aed'} 100%)`,
                borderRadius: '20px',
                padding: '2rem 2.5rem',
                marginBottom: '1.5rem',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{
                    position: 'absolute', top: '-30px', right: '-20px', width: '120px', height: '120px',
                    borderRadius: '50%', background: 'rgba(255,255,255,0.08)'
                }} />
                <div style={{
                    position: 'absolute', bottom: '-40px', right: '60px', width: '80px', height: '80px',
                    borderRadius: '50%', background: 'rgba(255,255,255,0.05)'
                }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', position: 'relative', zIndex: 1 }}>
                    <div style={{
                        width: '48px', height: '48px', borderRadius: '14px',
                        background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <Building2 size={24} color="#fff" />
                    </div>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: '700', color: '#fff' }}>Bank Account Details</h2>
                        <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: 'rgba(255,255,255,0.75)' }}>
                            Manage your banking & payment information
                        </p>
                    </div>
                </div>
            </div>

            {message && (
                <div style={{
                    padding: '1rem 1.25rem',
                    borderRadius: '12px',
                    marginBottom: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    background: message.type === 'success'
                        ? (isLightMode ? 'rgba(34, 197, 94, 0.08)' : 'rgba(34, 197, 94, 0.12)')
                        : (isLightMode ? 'rgba(244, 63, 94, 0.08)' : 'rgba(244, 63, 94, 0.12)'),
                    color: message.type === 'success' ? '#22c55e' : '#f43f5e',
                    border: `1px solid ${message.type === 'success' ? 'rgba(34,197,94,0.2)' : 'rgba(244,63,94,0.2)'}`,
                    fontSize: '0.85rem', fontWeight: '500'
                }}>
                    <span style={{ fontSize: '1.1rem' }}>{message.type === 'success' ? '✓' : '✕'}</span>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleBankSubmit}>
                {/* Bank Transfer Section */}
                <div className="panel" style={{
                    borderRadius: '16px',
                    border: `1px solid ${isLightMode ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)'}`,
                    overflow: 'hidden',
                    marginBottom: '1.5rem'
                }}>
                    <div style={{
                        padding: '1.25rem 1.75rem',
                        borderBottom: `1px solid ${isLightMode ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)'}`,
                        display: 'flex', alignItems: 'center', gap: '0.75rem'
                    }}>
                        <div style={{
                            width: '32px', height: '32px', borderRadius: '8px',
                            background: isLightMode ? 'rgba(99,102,241,0.1)' : 'rgba(99,102,241,0.15)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <FileText size={16} color="var(--primary)" />
                        </div>
                        <span style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-main)' }}>Bank Transfer Details</span>
                    </div>
                    <div style={{ padding: '1.75rem' }}>
                        <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', rowGap: '1.75rem', columnGap: '2rem' }}>
                            <BankField label="Account Holder Name" icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>}>
                                <input
                                    type="text"
                                    style={bankInputStyle}
                                    onFocus={(e) => Object.assign(e.target.style, bankInputFocusStyle)}
                                    onBlur={(e) => Object.assign(e.target.style, {
                                        borderColor: isLightMode ? '#e2e8f0' : 'rgba(255, 255, 255, 0.03)',
                                        boxShadow: 'none',
                                        background: isLightMode ? '#f8fafc' : '#0a0a0a',
                                        transform: 'none',
                                        WebkitBoxShadow: `0 0 0px 1000px ${isLightMode ? '#f8fafc' : '#0a0a0a'} inset`
                                    })}
                                    placeholder="Enter full name"
                                    value={bankData.accountHolderName}
                                    onChange={(e) => setBankData({ ...bankData, accountHolderName: e.target.value })}
                                    required
                                />
                            </BankField>
                            <BankField label="Bank Name" icon={<Building2 size={16} />}>
                                <input
                                    type="text"
                                    style={bankInputStyle}
                                    onFocus={(e) => Object.assign(e.target.style, bankInputFocusStyle)}
                                    onBlur={(e) => Object.assign(e.target.style, {
                                        borderColor: isLightMode ? '#e2e8f0' : 'rgba(255, 255, 255, 0.03)',
                                        boxShadow: 'none',
                                        background: isLightMode ? '#f8fafc' : '#0a0a0a',
                                        transform: 'none',
                                        WebkitBoxShadow: `0 0 0px 1000px ${isLightMode ? '#f8fafc' : '#0a0a0a'} inset`
                                    })}
                                    placeholder="e.g., State Bank of India"
                                    value={bankData.bankName}
                                    onChange={(e) => setBankData({ ...bankData, bankName: e.target.value })}
                                    required
                                />
                            </BankField>
                            <BankField label="Account Number" icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></svg>}>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    maxLength="18"
                                    style={bankInputStyle}
                                    onFocus={(e) => Object.assign(e.target.style, bankInputFocusStyle)}
                                    onBlur={(e) => Object.assign(e.target.style, {
                                        borderColor: isLightMode ? '#e2e8f0' : 'rgba(255, 255, 255, 0.03)',
                                        boxShadow: 'none',
                                        background: isLightMode ? '#f8fafc' : '#0a0a0a',
                                        transform: 'none',
                                        WebkitBoxShadow: `0 0 0px 1000px ${isLightMode ? '#f8fafc' : '#0a0a0a'} inset`
                                    })}
                                    placeholder="Enter account number"
                                    value={bankData.accountNumber}
                                    onChange={(e) => setBankData({ ...bankData, accountNumber: e.target.value })}
                                    required
                                />
                            </BankField>
                            <BankField label="IFSC Code" icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 21V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v16" /><path d="M2 21h20" /><path d="M9 7h6" /><path d="M9 11h6" /><path d="M9 15h6" /></svg>}>
                                <input
                                    type="text"
                                    style={{ ...bankInputStyle, textTransform: 'uppercase', letterSpacing: '1px', fontFamily: 'monospace' }}
                                    onFocus={(e) => Object.assign(e.target.style, bankInputFocusStyle)}
                                    onBlur={(e) => Object.assign(e.target.style, {
                                        borderColor: isLightMode ? '#e2e8f0' : 'rgba(255, 255, 255, 0.03)',
                                        boxShadow: 'none',
                                        background: isLightMode ? '#f8fafc' : '#0a0a0a',
                                        transform: 'none',
                                        WebkitBoxShadow: `0 0 0px 1000px ${isLightMode ? '#f8fafc' : '#0a0a0a'} inset`
                                    })}
                                    placeholder="e.g., SBIN0001234"
                                    value={bankData.ifscCode}
                                    onChange={(e) => setBankData({ ...bankData, ifscCode: e.target.value.toUpperCase() })}
                                    required
                                />
                            </BankField>
                            <BankField label="Branch Name" icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>}>
                                <input
                                    type="text"
                                    style={bankInputStyle}
                                    onFocus={(e) => Object.assign(e.target.style, bankInputFocusStyle)}
                                    onBlur={(e) => Object.assign(e.target.style, {
                                        borderColor: isLightMode ? '#e2e8f0' : 'rgba(255, 255, 255, 0.03)',
                                        boxShadow: 'none',
                                        background: isLightMode ? '#f8fafc' : '#0a0a0a',
                                        transform: 'none',
                                        WebkitBoxShadow: `0 0 0px 1000px ${isLightMode ? '#f8fafc' : '#0a0a0a'} inset`
                                    })}
                                    placeholder="Enter branch name"
                                    value={bankData.branchName}
                                    onChange={(e) => setBankData({ ...bankData, branchName: e.target.value })}
                                />
                            </BankField>
                        </div>
                    </div>
                </div>

                {/* UPI Section */}
                <div className="panel" style={{
                    borderRadius: '16px',
                    border: `1px solid ${isLightMode ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)'}`,
                    overflow: 'hidden',
                    marginBottom: '2rem'
                }}>
                    <div style={{
                        padding: '1.25rem 1.75rem',
                        borderBottom: `1px solid ${isLightMode ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)'}`,
                        display: 'flex', alignItems: 'center', gap: '0.75rem'
                    }}>
                        <div style={{
                            width: '32px', height: '32px', borderRadius: '8px',
                            background: isLightMode ? 'rgba(16,185,129,0.1)' : 'rgba(16,185,129,0.15)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                        </div>
                        <span style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-main)' }}>UPI Payment</span>
                        <span style={{
                            fontSize: '0.65rem', fontWeight: '600', padding: '0.2rem 0.6rem',
                            borderRadius: '20px', background: 'rgba(16,185,129,0.12)', color: '#10b981',
                            textTransform: 'uppercase', letterSpacing: '0.5px', marginLeft: 'auto'
                        }}>Instant</span>
                    </div>
                    <div style={{ padding: '1.75rem' }}>
                        <BankField label="UPI ID" icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="4" /><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94" /></svg>}>
                            <input
                                type="text"
                                style={{ ...bankInputStyle, maxWidth: '420px' }}
                                onFocus={(e) => Object.assign(e.target.style, bankInputFocusStyle)}
                                onBlur={(e) => Object.assign(e.target.style, {
                                    borderColor: isLightMode ? '#e2e8f0' : 'rgba(255, 255, 255, 0.03)',
                                    boxShadow: 'none',
                                    background: isLightMode ? '#f8fafc' : '#0a0a0a',
                                    transform: 'none',
                                    WebkitBoxShadow: `0 0 0px 1000px ${isLightMode ? '#f8fafc' : '#0a0a0a'} inset`
                                })}
                                placeholder="yourname@upi"
                                value={bankData.upiId}
                                onChange={(e) => setBankData({ ...bankData, upiId: e.target.value })}
                                required
                            />
                        </BankField>
                    </div>
                </div>

                {/* Submit */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                    <button type="submit" className="btn btn-primary" disabled={loading} style={{
                        padding: '0.75rem 2rem',
                        borderRadius: '12px',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        boxShadow: '0 4px 15px rgba(var(--primary-rgb, 99, 102, 241), 0.3)',
                        transition: 'all 0.3s ease'
                    }}>
                        {loading ? (
                            <>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}><path d="M21 12a9 9 0 11-6.219-8.56" /></svg>
                                Saving...
                            </>
                        ) : (
                            <>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>
                                Save Bank Details
                            </>
                        )}
                    </button>
                </div>
            </form>
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
