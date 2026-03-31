import React, { useState } from 'react';
import api from '../../api/axios';
import moment from 'moment';

import {
    ChevronDown,
    FileText,
    Clock,
    Calendar,
    Building2,
    Award,
    Info,
    Wallet,
    CheckCircle2,
    Landmark,
    ShieldCheck,
    Smartphone,
    X
} from 'lucide-react';

const bankLabelStyle = {
    display: 'block',
    fontSize: '0.75rem',
    letterSpacing: '0.8px',
    fontWeight: '700',
    marginBottom: '0.6rem',
    color: 'var(--text-muted)',
    textTransform: 'uppercase'
};

const bankIconStyle = {
    position: 'absolute',
    left: '1rem',
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'var(--text-muted)',
    opacity: 0.6,
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

    const bentoPanelStyle = {
        background: isLightMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(15, 23, 42, 0.5)',
        backdropFilter: 'blur(16px)',
        borderRadius: '24px',
        border: `1px solid ${isLightMode ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)'}`,
        padding: '2rem',
        boxShadow: isLightMode ? '0 4px 24px rgba(0,0,0,0.04)' : '0 4px 24px rgba(0,0,0,0.2)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'hidden',
        position: 'relative'
    };

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
        const filteredPayslip = payslips?.find(p => p.month === selectedMonth && parseInt(p.year) === parseInt(selectedYear));

        const selectContainerStyle = {
            position: 'relative',
            display: 'inline-flex',
            alignItems: 'center',
            background: isLightMode ? '#f8fafc' : 'rgba(0,0,0,0.2)',
            border: `1px solid ${isLightMode ? '#e2e8f0' : 'rgba(255,255,255,0.08)'}`,
            borderRadius: '14px',
            padding: '0 1.25rem',
            transition: 'all 0.2s ease',
            cursor: 'pointer',
        };

        const selectStyle = {
            appearance: 'none',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-main)',
            fontSize: '0.9rem',
            fontWeight: '700',
            padding: '0.75rem 2rem 0.75rem 0.5rem',
            cursor: 'pointer',
            outline: 'none',
            width: '100%'
        };

        return (
            <div style={{ ...bentoPanelStyle, minHeight: 'calc(100vh - 250px)', display: 'flex', flexDirection: 'column' }}>
                {/* Header Controls */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '2.5rem',
                    flexWrap: 'wrap',
                    gap: '1.5rem',
                    padding: '0.5rem 0'
                }}>
                    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{
                                width: '42px', height: '42px', borderRadius: '12px',
                                background: 'linear-gradient(135deg, rgba(var(--primary-rgb), 0.15), rgba(var(--primary-rgb), 0.05))',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: 'var(--primary)', boxShadow: '0 4px 12px rgba(var(--primary-rgb), 0.1)'
                            }}>
                                <Wallet size={20} />
                            </div>
                            <div>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>Monthly Payslip</h2>
                                <p style={{ fontSize: '0.75rem', fontWeight: '500', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>View and download your salary details</p>
                            </div>
                        </div>

                        <div style={selectContainerStyle}>
                            <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} style={selectStyle}>
                                {months.map(m => <option key={m} value={m} style={{ background: isLightMode ? '#ffffff' : '#1e293b' }}>{m}</option>)}
                            </select>
                            <ChevronDown size={16} style={{ position: 'absolute', right: '1rem', color: 'var(--primary)', pointerEvents: 'none' }} />
                        </div>

                        <div style={selectContainerStyle}>
                            <select value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))} style={selectStyle}>
                                {years.map(y => <option key={y} value={y} style={{ background: isLightMode ? '#ffffff' : '#1e293b' }}>{y}</option>)}
                            </select>
                            <ChevronDown size={16} style={{ position: 'absolute', right: '1rem', color: 'var(--primary)', pointerEvents: 'none' }} />
                        </div>
                    </div>
                    {filteredPayslip && (
                        <button className="btn btn-primary" style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            padding: '0.75rem 1.5rem', borderRadius: '14px',
                            fontWeight: '700', fontSize: '0.9rem',
                            boxShadow: '0 4px 15px rgba(var(--primary-rgb), 0.25)',
                            transition: 'all 0.2s'
                        }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                            <FileText size={18} /> Download PDF
                        </button>
                    )}
                </div>

                {filteredPayslip ? (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        {/* Status Bar */}
                        <div style={{
                            marginBottom: '2.5rem', display: 'flex', flexWrap: 'wrap', gap: '2.5rem', padding: '1.5rem 2rem',
                            background: isLightMode ? '#f8fafc' : 'rgba(0,0,0,0.15)', borderRadius: '20px',
                            border: `1px solid ${isLightMode ? '#e2e8f0' : 'rgba(255,255,255,0.04)'}`
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                                <div style={{ width: '46px', height: '46px', borderRadius: '14px', background: 'rgba(var(--primary-rgb), 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                                    <Clock size={22} />
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.5px' }}>Status</div>
                                    <div style={{ fontSize: '1.1rem', fontWeight: '800', color: filteredPayslip.status === 'Paid' ? '#10b981' : '#f59e0b', marginTop: '0.15rem' }}>
                                        {filteredPayslip.status || 'Paid'}
                                    </div>
                                </div>
                            </div>
                            {filteredPayslip.status === 'Paid' && (
                                <>
                                    <div style={{ width: '1px', background: isLightMode ? '#e2e8f0' : 'rgba(255,255,255,0.06)' }}></div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                                        <div style={{ width: '46px', height: '46px', borderRadius: '14px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
                                            <Calendar size={22} />
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.5px' }}>Paid Date</div>
                                            <div style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-main)', marginTop: '0.15rem' }}>{moment(filteredPayslip.paidAt || filteredPayslip.updatedAt).format('DD MMM YYYY')}</div>
                                        </div>
                                    </div>
                                    <div style={{ width: '1px', background: isLightMode ? '#e2e8f0' : 'rgba(255,255,255,0.06)' }}></div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                                        <div style={{ width: '46px', height: '46px', borderRadius: '14px', background: 'rgba(168, 85, 247, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a855f7' }}>
                                            <Building2 size={22} />
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.5px' }}>Method</div>
                                            <div style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-main)', marginTop: '0.15rem' }}>{filteredPayslip.paymentMethod || 'Bank Transfer'}</div>
                                        </div>
                                    </div>
                                    {filteredPayslip.startDate && filteredPayslip.endDate && (
                                        <>
                                            <div style={{ width: '1px', background: isLightMode ? '#e2e8f0' : 'rgba(255,255,255,0.06)' }}></div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                                                <div style={{ width: '46px', height: '46px', borderRadius: '14px', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1' }}>
                                                    <Clock size={22} />
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.5px' }}>Pay Cycle</div>
                                                    <div style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--text-main)', marginTop: '0.15rem' }}>
                                                        {moment(filteredPayslip.startDate).format('DD MMM')} - {moment(filteredPayslip.endDate).format('DD MMM')}
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Breakdown Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '2rem', marginBottom: '3rem', flex: 1 }}>
                            {/* Earnings Card */}
                            <div style={{ background: isLightMode ? '#ffffff' : 'rgba(0,0,0,0.2)', padding: '2rem', borderRadius: '24px', border: `1px solid ${isLightMode ? '#e2e8f0' : 'rgba(255,255,255,0.06)'}`, boxShadow: isLightMode ? '0 4px 12px rgba(0,0,0,0.02)' : 'none' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '2rem' }}>
                                    <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(var(--primary-rgb), 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Award size={18} color="var(--primary)" />
                                    </div>
                                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', color: 'var(--primary)', letterSpacing: '0.5px' }}>EARNINGS</h3>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-muted)' }}>Basic Salary</span>
                                        <span style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-main)' }}>₹{filteredPayslip.earnings.basicSalary.toLocaleString()}</span>
                                    </div>
                                    <div style={{ height: '1px', background: isLightMode ? '#f1f5f9' : 'rgba(255,255,255,0.04)' }}></div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-muted)' }}>HRA</span>
                                        <span style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-main)' }}>₹{filteredPayslip.earnings.hra.toLocaleString()}</span>
                                    </div>
                                    {filteredPayslip.earnings.bonus > 0 && (
                                        <>
                                            <div style={{ height: '1px', background: isLightMode ? '#f1f5f9' : 'rgba(255,255,255,0.04)' }}></div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-muted)' }}>Bonus</span>
                                                <span style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--primary)' }}>₹{filteredPayslip.earnings.bonus.toLocaleString()}</span>
                                            </div>
                                        </>
                                    )}
                                    {filteredPayslip.earnings.specialAllowance > 0 && (
                                        <>
                                            <div style={{ height: '1px', background: isLightMode ? '#f1f5f9' : 'rgba(255,255,255,0.04)' }}></div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-muted)' }}>Special Allowance</span>
                                                <span style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-main)' }}>₹{filteredPayslip.earnings.specialAllowance.toLocaleString()}</span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Deductions Card */}
                            <div style={{ background: isLightMode ? '#ffffff' : 'rgba(0,0,0,0.2)', padding: '2rem', borderRadius: '24px', border: `1px solid ${isLightMode ? '#e2e8f0' : 'rgba(255,255,255,0.06)'}`, boxShadow: isLightMode ? '0 4px 12px rgba(0,0,0,0.02)' : 'none' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '2rem' }}>
                                    <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(244, 63, 94, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Info size={18} color="#f43f5e" />
                                    </div>
                                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', color: '#f43f5e', letterSpacing: '0.5px' }}>DEDUCTIONS</h3>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-muted)' }}>PF (Provident Fund)</span>
                                        <span style={{ fontSize: '1.1rem', fontWeight: '700', color: '#f43f5e' }}>₹{filteredPayslip.deductions.pf.toLocaleString()}</span>
                                    </div>
                                    <div style={{ height: '1px', background: isLightMode ? '#f1f5f9' : 'rgba(255,255,255,0.04)' }}></div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-muted)' }}>Tax (TDS)</span>
                                        <span style={{ fontSize: '1.1rem', fontWeight: '700', color: '#f43f5e' }}>₹{filteredPayslip.deductions.tax.toLocaleString()}</span>
                                    </div>
                                    {filteredPayslip.deductions.professionalTax > 0 && (
                                        <>
                                            <div style={{ height: '1px', background: isLightMode ? '#f1f5f9' : 'rgba(255,255,255,0.04)' }}></div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-muted)' }}>Professional Tax</span>
                                                <span style={{ fontSize: '1.1rem', fontWeight: '700', color: '#f43f5e' }}>₹{filteredPayslip.deductions.professionalTax.toLocaleString()}</span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Calculation Details */}
                        {filteredPayslip.calculationDetails && (
                            <div style={{ 
                                marginBottom: '3rem', padding: '2rem', borderRadius: '24px', 
                                background: isLightMode ? '#f8fafc' : 'rgba(0,0,0,0.1)', 
                                border: `1px dashed ${isLightMode ? '#cbd5e1' : 'rgba(255,255,255,0.1)'}` 
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
                                    <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Clock size={18} color="#6366f1" />
                                    </div>
                                    <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '0.5px' }}>ATTENDANCE & CALCULATION SUMMARY</h3>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '2rem' }}>
                                    <div>
                                        <div style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Present Days</div>
                                        <div style={{ fontSize: '1.2rem', fontWeight: '900', color: '#10b981' }}>{filteredPayslip.calculationDetails.presentDays} / {filteredPayslip.calculationDetails.totalDaysInCycle}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Unpaid Leaves</div>
                                        <div style={{ fontSize: '1.2rem', fontWeight: '900', color: '#ef4444' }}>{filteredPayslip.calculationDetails.unpaidLeaveDays || 0} Full | {filteredPayslip.calculationDetails.halfDayUnpaidDays || 0} Half</div>
                                    </div>
                                    {filteredPayslip.calculationDetails.proRataAdjustment > 0 && (
                                        <div>
                                            <div style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Pro-rata Adjust</div>
                                            <div style={{ fontSize: '1.2rem', fontWeight: '900', color: '#f59e0b' }}>- ₹{filteredPayslip.calculationDetails.proRataAdjustment.toLocaleString()}</div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Net Pay Bottom Bar */}
                        <div style={{
                            marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            background: isLightMode ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.02))' : 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.05))',
                            border: `1px solid rgba(16, 185, 129, 0.2)`, padding: '2.5rem', borderRadius: '24px',
                            boxShadow: '0 8px 32px rgba(16, 185, 129, 0.1)', position: 'relative', overflow: 'hidden'
                        }}>
                            <div style={{ position: 'absolute', right: '-20px', top: '-20px', opacity: 0.05, transform: 'rotate(-15deg)' }}>
                                <CheckCircle2 size={160} color="#10b981" />
                            </div>
                            <div style={{ position: 'relative', zIndex: 1 }}>
                                <div style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '0.5rem' }}>Net Payout (Final Amount)</div>
                                <div style={{ fontSize: '1.1rem', color: 'var(--text-main)', fontWeight: '700', opacity: 0.9 }}>For {selectedMonth} {selectedYear}</div>
                            </div>
                            <div style={{ textAlign: 'right', position: 'relative', zIndex: 1 }}>
                                <div style={{ fontSize: '3.5rem', fontWeight: '900', color: '#10b981', letterSpacing: '-1.5px', lineHeight: '1' }}>
                                    ₹{filteredPayslip.netPay.toLocaleString()}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem', textAlign: 'center' }}>
                        <div style={{
                            width: '100px', height: '100px', borderRadius: '24px', background: isLightMode ? '#f8fafc' : 'rgba(255,255,255,0.03)',
                            border: `1px solid ${isLightMode ? '#e2e8f0' : 'rgba(255,255,255,0.06)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            marginBottom: '2rem', transform: 'rotate(-5deg)', boxShadow: '0 10px 25px rgba(0,0,0,0.05)'
                        }}>
                            <FileText size={40} style={{ color: 'var(--text-muted)', opacity: 0.5 }} />
                        </div>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '1rem' }}>No Payslip Found</h3>
                        <p style={{ fontSize: '0.95rem', maxWidth: '400px', color: 'var(--text-muted)', lineHeight: '1.6', fontWeight: '500' }}>
                            We couldn't locate any payslip records for <strong style={{ color: 'var(--text-main)' }}>{selectedMonth} {selectedYear}</strong>. Payslips are typically processed during the last week of the month.
                        </p>
                        <button onClick={() => { setSelectedMonth(moment().format('MMMM')); setSelectedYear(moment().year()); }}
                            className="btn btn-secondary" style={{ marginTop: '2rem', padding: '0.75rem 2rem', borderRadius: '14px', fontWeight: '700' }}>
                            View Current Month
                        </button>
                    </div>
                )}
            </div>
        );
    };

    const bankInputStyle = {
        width: '100%',
        padding: '0.85rem 1.25rem 0.85rem 2.8rem',
        background: isLightMode ? '#f8fafc' : 'rgba(0,0,0,0.2)',
        border: `1.5px solid ${isLightMode ? '#e2e8f0' : 'rgba(255, 255, 255, 0.06)'}`,
        borderRadius: '16px',
        color: 'var(--text-main)',
        fontSize: '0.95rem',
        fontWeight: '500',
        outline: 'none',
        transition: 'all 0.3s ease',
        boxSizing: 'border-box',
    };

    const handleFocus = (e) => {
        e.target.style.borderColor = 'var(--primary)';
        e.target.style.background = isLightMode ? '#ffffff' : 'rgba(0,0,0,0.4)';
        e.target.style.boxShadow = isLightMode ? '0 0 0 4px rgba(var(--primary-rgb), 0.1)' : '0 0 0 4px rgba(var(--primary-rgb), 0.2)';
    };

    const handleBlur = (e) => {
        e.target.style.borderColor = isLightMode ? '#e2e8f0' : 'rgba(255, 255, 255, 0.06)';
        e.target.style.background = isLightMode ? '#f8fafc' : 'rgba(0,0,0,0.2)';
        e.target.style.boxShadow = 'none';
    };

    const renderBankInfo = () => (
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            {/* Header Banner - Retaining the gradient look but making it rounder */}
            <div style={{
                background: `linear-gradient(135deg, ${isLightMode ? '#6366f1' : 'rgba(99, 102, 241, 0.8)'} 0%, ${isLightMode ? '#8b5cf6' : 'rgba(139, 92, 246, 0.8)'} 100%)`,
                borderRadius: '24px',
                padding: '2.5rem',
                marginBottom: '2rem',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 10px 30px rgba(99, 102, 241, 0.2)'
            }}>
                <div style={{ position: 'absolute', top: '-30px', right: '-20px', width: '150px', height: '150px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
                <div style={{ position: 'absolute', bottom: '-40px', right: '80px', width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', position: 'relative', zIndex: 1 }}>
                    <div style={{
                        width: '56px', height: '56px', borderRadius: '16px',
                        background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <Landmark size={28} color="#ffffff" />
                    </div>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '1.6rem', fontWeight: '800', color: '#ffffff', letterSpacing: '-0.5px' }}>Bank Account Details</h2>
                        <p style={{ margin: '0.4rem 0 0', fontSize: '0.95rem', fontWeight: '500', color: 'rgba(255,255,255,0.85)' }}>
                            Manage your deposit and UPI information securely.
                        </p>
                    </div>
                </div>
            </div>

            {message && (
                <div style={{
                    padding: '1.25rem 1.5rem', borderRadius: '16px', marginBottom: '1.5rem',
                    display: 'flex', alignItems: 'center', gap: '1rem',
                    background: message.type === 'success' ? (isLightMode ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.15)') : (isLightMode ? 'rgba(244, 63, 94, 0.1)' : 'rgba(244, 63, 94, 0.15)'),
                    color: message.type === 'success' ? '#10b981' : '#f43f5e',
                    border: `1px solid ${message.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(244, 63, 94, 0.2)'}`,
                    fontSize: '0.9rem', fontWeight: '700', animation: 'fadeIn 0.3s ease-out'
                }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: message.type === 'success' ? 'rgba(16,185,129,0.2)' : 'rgba(244,63,94,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {message.type === 'success' ? '✓' : '✕'}
                    </div>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleBankSubmit}>
                {/* Bank Transfer Bento */}
                <div style={{ ...bentoPanelStyle, padding: '2rem', marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(var(--primary-rgb), 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <FileText size={20} color="var(--primary)" />
                        </div>
                        <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-main)' }}>Bank Transfer Details</h3>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', rowGap: '2rem', columnGap: '2.5rem' }}>
                        <BankField label="Account Holder Name" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>}>
                            <input type="text" style={bankInputStyle} onFocus={handleFocus} onBlur={handleBlur} placeholder="Enter full name" value={bankData.accountHolderName} onChange={(e) => setBankData({ ...bankData, accountHolderName: e.target.value })} required />
                        </BankField>
                        <BankField label="Bank Name" icon={<Building2 size={18} />}>
                            <input type="text" style={bankInputStyle} onFocus={handleFocus} onBlur={handleBlur} placeholder="e.g., State Bank of India" value={bankData.bankName} onChange={(e) => setBankData({ ...bankData, bankName: e.target.value })} required />
                        </BankField>
                        <BankField label="Account Number" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></svg>}>
                            <input type="text" inputMode="numeric" maxLength="18" style={bankInputStyle} onFocus={handleFocus} onBlur={handleBlur} placeholder="Enter account number" value={bankData.accountNumber} onChange={(e) => setBankData({ ...bankData, accountNumber: e.target.value })} required />
                        </BankField>
                        <BankField label="IFSC Code" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 21V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v16" /><path d="M2 21h20" /><path d="M9 7h6" /><path d="M9 11h6" /><path d="M9 15h6" /></svg>}>
                            <input type="text" style={{ ...bankInputStyle, textTransform: 'uppercase', letterSpacing: '1px', fontFamily: 'monospace' }} onFocus={handleFocus} onBlur={handleBlur} placeholder="e.g., SBIN0001234" value={bankData.ifscCode} onChange={(e) => setBankData({ ...bankData, ifscCode: e.target.value.toUpperCase() })} required />
                        </BankField>
                        <BankField label="Branch Name" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>}>
                            <input type="text" style={bankInputStyle} onFocus={handleFocus} onBlur={handleBlur} placeholder="Enter branch name" value={bankData.branchName} onChange={(e) => setBankData({ ...bankData, branchName: e.target.value })} />
                        </BankField>
                    </div>
                </div>

                {/* UPI Bento */}
                <div style={{ ...bentoPanelStyle, padding: '2rem', marginBottom: '2.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Smartphone size={20} color="#10b981" />
                        </div>
                        <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-main)' }}>UPI Payment</h3>
                        <div style={{ marginLeft: 'auto', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '0.4rem 0.8rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase' }}>
                            Instant
                        </div>
                    </div>

                    <div style={{ maxWidth: '400px' }}>
                        <BankField label="UPI ID" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="4" /><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94" /></svg>}>
                            <input type="text" style={bankInputStyle} onFocus={handleFocus} onBlur={handleBlur} placeholder="yourname@upi" value={bankData.upiId} onChange={(e) => setBankData({ ...bankData, upiId: e.target.value })} required />
                        </BankField>
                    </div>
                </div>

                {/* Submit Action */}
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button type="submit" className="btn btn-primary" disabled={loading} style={{
                        padding: '1rem 2.5rem', borderRadius: '16px', fontSize: '1rem', fontWeight: '700',
                        display: 'flex', alignItems: 'center', gap: '0.6rem', boxShadow: '0 8px 24px rgba(var(--primary-rgb), 0.3)',
                        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                    }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                        {loading ? (
                            <>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}><path d="M21 12a9 9 0 11-6.219-8.56" /></svg>
                                Saving...
                            </>
                        ) : (
                            <>
                                <ShieldCheck size={20} />
                                Save Details
                            </>
                        )}
                    </button>
                </div>
            </form>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-5px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );

    return (
        <>
            <div className="sub-nav">
                <div className={`sub-nav-item ${activeSubTab === 'Payslips' ? 'active' : ''}`} onClick={() => setActiveSubTab('Payslips')}>PAYSLIPS</div>
                <div className={`sub-nav-item ${activeSubTab === 'Bank' ? 'active' : ''}`} onClick={() => setActiveSubTab('Bank')}>BANK INFO</div>
            </div>
            <div className="page-content" style={{ marginTop: '1rem' }}>
                {activeSubTab === 'Payslips' ? renderPayslips() : renderBankInfo()}
            </div>
        </>
    );
};

export default FinancesTab;
