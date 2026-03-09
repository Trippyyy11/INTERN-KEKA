import React from 'react';

const MyTeamTab = ({
    user,
    teammates,
    setShowPublicProfile,
    statsPeriod,
    teamStats
}) => {
    const renderCalendarGrid = () => {
        const days = Array.from({ length: 31 }, (_, i) => i + 1);
        return (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem', width: '100%' }}>
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => <div key={d} style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{d}</div>)}
                <div style={{ gridColumn: 'span 2' }}></div> {/* Offset for March 2026 */}
                {days.map(d => {
                    let bg = 'var(--bg-panel)';
                    let color = 'var(--text-main)';
                    if (d === 4) bg = '#ccff00'; // Holiday (Lime)
                    if (d === 5) bg = '#00ffa2'; // Leave (Aquamarine)
                    if (d === 7 || d === 8 || d === 14 || d === 15 || d === 21 || d === 22 || d === 28 || d === 29) {
                        bg = '#ffab00'; color = '#0a0e17'; // Weekend (Amber)
                    }
                    if (d === 6) bg = '#00ff88'; // Today (Green)

                    return (
                        <div key={d} style={{ background: bg, color: color, padding: '0.5rem', borderRadius: '4px', textAlign: 'center', fontSize: '0.8rem' }}>
                            {d}
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="grid" style={{ gridTemplateColumns: '1fr 300px', gap: '2rem' }}>
            <div className="panel">
                <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Team: {user?.department || 'My Department'}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{teammates.length} Members</span>
                </div>
                <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                    {teammates.map(t => (
                        <div
                            key={t._id}
                            className="panel"
                            style={{
                                padding: '1.25rem',
                                cursor: 'pointer',
                                transition: 'transform 0.2s',
                                border: '1px solid var(--border-dark)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem'
                            }}
                            onClick={() => setShowPublicProfile(t)}
                        >
                            <div className="avatar" style={{ width: '48px', height: '48px', background: 'var(--primary)', color: 'white' }}>
                                {t.name.substring(0, 1).toUpperCase()}
                            </div>
                            <div style={{ overflow: 'hidden' }}>
                                <div style={{ fontWeight: '600', fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.name}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.designation}</div>
                            </div>
                        </div>
                    ))}
                    {teammates.length === 0 && (
                        <div style={{ gridColumn: 'span 12', textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                            No other teammates found in your department.
                        </div>
                    )}
                </div>
            </div>
            <div>
                <div className="panel" style={{ marginBottom: '1rem' }}>
                    <div className="panel-header">Team Stats ({statsPeriod})</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1rem 0' }}>
                        <div>
                            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>AVG HRS / DAY</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{Math.floor(teamStats.avgHours)}h {Math.round((teamStats.avgHours % 1) * 60)}m</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>ON TIME ARRIVAL</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>{teamStats.onTimePercentage}%</div>
                        </div>
                    </div>
                </div>
                <div className="panel">
                    <div className="panel-header">Team calendar</div>
                    <div style={{ transform: 'scale(0.8)', transformOrigin: 'top left' }}>
                        {renderCalendarGrid()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MyTeamTab;
