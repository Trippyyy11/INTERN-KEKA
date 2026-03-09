import React from 'react';

const FinancesTab = ({
    user,
    activeSubTab,
    setActiveSubTab,
    globalPayslips,
    payslips,
    isLightMode
}) => {
    const isSuper = user?.role === 'Super Admin';

    return (
        <>
            <div className="sub-nav">
                <div className={`sub-nav-item ${activeSubTab === 'Leave' || activeSubTab === 'Payslips' ? 'active' : ''}`} onClick={() => setActiveSubTab('Payslips')}>PAYSLIPS</div>
                <div className="sub-nav-item">BANK INFO</div>
            </div>
            <div className="page-content">
                {activeSubTab === 'Global' && isSuper ? (
                    <div className="panel">
                        <div className="panel-header">Global Payroll Management (Super Admin)</div>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>EMPLOYEE</th>
                                    <th>MONTH/YEAR</th>
                                    <th>NET PAY</th>
                                    <th>STATUS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {globalPayslips.map(p => (
                                    <tr key={p._id}>
                                        <td>{p.user?.name}</td>
                                        <td>{p.month}/{p.year}</td>
                                        <td style={{ color: 'var(--success)', fontWeight: '600' }}>${p.netPay}</td>
                                        <td>Paid</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="grid" style={{ gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '2rem' }}>
                        <div className="panel">
                            <div className="panel-header">Recent Payslips</div>
                            <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {payslips.map((p, idx) => (
                                    <li key={p._id} style={{ background: idx === 0 ? 'rgba(var(--primary-rgb, 155, 89, 182), 0.1)' : 'transparent', padding: '1rem', borderRadius: '4px', cursor: 'pointer', borderLeft: idx === 0 ? '3px solid var(--primary)' : 'none' }}>
                                        <div style={{ fontWeight: '500' }}>{p.month} {p.year}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Generated on {new Date(p.createdAt).toLocaleDateString()}</div>
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

                            {payslips.length > 0 ? (
                                <>
                                    <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '1px solid var(--border-dark)' }}>
                                        <div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>EARNINGS</div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.9rem' }}><span>Basic Salary</span><span>${payslips[0].earnings.basicSalary}</span></div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.9rem' }}><span>HRA</span><span>${payslips[0].earnings.hra}</span></div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.9rem', color: 'var(--primary)' }}><span>Bonus</span><span>${payslips[0].earnings.bonus}</span></div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>DEDUCTIONS</div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.9rem' }}><span>PF</span><span>${payslips[0].deductions.pf}</span></div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.9rem' }}><span>Tax</span><span>${payslips[0].deductions.tax}</span></div>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(var(--primary-rgb), 0.05)', border: '1px solid rgba(var(--primary-rgb), 0.2)', padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
                                        <span style={{ fontSize: '1.1rem', fontWeight: '500' }}>Net Payout (Take Home)</span>
                                        <span style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'var(--success)' }}>
                                            ${payslips[0].netPay}
                                        </span>
                                    </div>
                                </>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>Select a payslip to view details.</div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default FinancesTab;
