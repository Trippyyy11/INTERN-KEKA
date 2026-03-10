import React, { useState, useEffect } from 'react';

export default function ClockStand({ clockInTime }) {
    const [elapsed, setElapsed] = useState(0);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        // If no clockInTime is provided, we default to 0 elapsed seconds
        if (!clockInTime) {
            setElapsed(0);
            return;
        }

        const timer = setInterval(() => {
            setElapsed(Math.floor((Date.now() - new Date(clockInTime).getTime()) / 1000));
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, [clockInTime]);

    const formatElapsed = (totalSeconds) => {
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div style={{
            position: 'absolute',
            right: '40px',
            top: '50%',
            transform: 'translateY(-50%) perspective(1000px) rotateY(-10deg) rotateX(2deg)',
            display: 'flex',
            width: '480px',
            height: '190px',
            borderRadius: '16px',
            boxShadow: '25px 30px 50px rgba(0,0,0,0.6), -5px -5px 15px rgba(255,255,255,0.05), inset 1px 1px 2px rgba(255,255,255,0.2)',
            background: '#1a1b1d',
            fontFamily: '"SF Pro Display", "Inter", sans-serif',
            userSelect: 'none',
            zIndex: 10,
            transformStyle: 'preserve-3d'
        }}>
            {/* Stand Base / Wire */}
            <div style={{
                position: 'absolute',
                right: '30px',
                bottom: '-25px',
                width: '60px',
                height: '100px',
                border: '8px solid #949a9f',
                borderTop: 'none',
                borderLeft: 'none',
                borderBottomRightRadius: '16px',
                transform: 'skewX(-25deg) translateZ(-40px)',
                zIndex: -1,
                boxShadow: '10px 10px 20px rgba(0,0,0,0.6), inset 3px 3px 6px rgba(255,255,255,0.5)'
            }}></div>

            {/* Screen Section */}
            <div style={{
                flex: 1,
                background: '#121315',
                borderTopLeftRadius: '16px',
                borderBottomLeftRadius: '16px',
                padding: '15px 20px',
                display: 'flex',
                border: '6px solid #2a2d32',
                borderRight: 'none',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: 'inset 0 0 30px rgba(0,0,0,0.9)'
            }}>
                {/* Side Icons */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', alignItems: 'center', justifyContent: 'center', width: '20px', paddingRight: '15px', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ffab00', boxShadow: '0 0 8px #ffab00' }}></div>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><polyline points="12 6 12 12 16 14"></polyline></svg>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                </div>

                {/* Main Content */}
                <div style={{ marginLeft: '25px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                        <span style={{ color: '#00d4ff', fontSize: '13px', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', textShadow: '0 0 10px rgba(0,212,255,0.5)' }}>Time Clock In</span>
                    </div>
                    <div style={{ color: '#fff', fontSize: '56px', fontWeight: '800', lineHeight: 1, textShadow: '0 4px 20px rgba(255,255,255,0.2), 0 0 5px rgba(255,255,255,0.5)', fontFamily: 'monospace', letterSpacing: '-1px' }}>
                        {formatElapsed(elapsed)}
                    </div>
                    <div style={{ display: 'flex', gap: '20px', marginTop: '12px', color: '#a0a5aa', fontSize: '12px', fontWeight: '600' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="12 6 12 12 16 14"></polyline></svg>
                            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                            {currentTime.toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </span>
                    </div>
                </div>

                {/* Right side data (like weather) */}
                <div style={{ width: '130px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '12px', paddingLeft: '20px', position: 'relative' }}>
                    <div style={{ position: 'absolute', left: 0, top: '20%', bottom: '20%', width: '1px', background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.1), transparent)' }}></div>
                    {[
                        { label: 'DEVICE SYNC', value: 'ONLINE', color: '#00ff88' },
                        { label: 'BATTERY', value: '98%', color: '#00d4ff' },
                        { label: 'WORK TYPE', value: 'OFFICE', color: '#ffab00' }
                    ].map((item, i) => (
                        <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <span style={{ fontSize: '10px', color: '#666', fontWeight: '700', letterSpacing: '1px' }}>{item.label}</span>
                            <span style={{ fontSize: '12px', color: item.color, fontWeight: '700', textShadow: `0 0 8px ${item.color}60` }}>{item.value}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Middle Section (Metallic Control Panel) */}
            <div style={{
                width: '65px',
                background: 'linear-gradient(90deg, #44484c 0%, #767b80 40%, #585c62 100%)',
                borderTop: '6px solid #858b90',
                borderBottom: '6px solid #2a2c30',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                boxShadow: 'inset 5px 0 10px rgba(0,0,0,0.4), inset -5px 0 10px rgba(0,0,0,0.2)'
            }}>
                {/* The Knob */}
                <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #8a9096 0%, #52565c 100%)',
                    boxShadow: '8px 8px 15px rgba(0,0,0,0.6), inset -2px -2px 6px rgba(0,0,0,0.4), inset 2px 2px 6px rgba(255,255,255,0.2)',
                    position: 'relative',
                    cursor: 'pointer',
                    transform: 'translateZ(10px)'
                }}>
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #6c7178 0%, #858b92 100%)',
                        boxShadow: 'inset 2px 2px 5px rgba(255,255,255,0.4), 0 3px 6px rgba(0,0,0,0.5)'
                    }}></div>
                    <div style={{
                        position: 'absolute',
                        top: '6px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '5px',
                        height: '5px',
                        borderRadius: '50%',
                        background: '#222',
                        boxShadow: 'inset 1px 1px 2px rgba(0,0,0,0.8)'
                    }}></div>
                </div>
            </div>

            {/* Right Section (Blue Speaker) */}
            <div style={{
                width: '90px',
                background: 'linear-gradient(135deg, #1d4ed8 0%, #1e3a8a 100%)',
                borderTopRightRadius: '16px',
                borderBottomRightRadius: '16px',
                borderTop: '6px solid #3b82f6',
                borderRight: '6px solid #1e3a8a',
                borderBottom: '6px solid #172554',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: 'inset 8px 0 15px rgba(0,0,0,0.4)'
            }}>
                {/* Speaker Grill Pattern */}
                <div style={{
                    position: 'absolute',
                    top: '0', left: '0', right: '0', bottom: '0',
                    backgroundImage: 'radial-gradient(circle, #0a1530 1.5px, transparent 2px)',
                    backgroundSize: '6px 6px',
                    backgroundPosition: '0 0',
                    opacity: 0.8
                }}></div>
                <div style={{
                    position: 'absolute',
                    top: '3px', left: '3px', right: '-3px', bottom: '-3px',
                    backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1.5px, transparent 2px)',
                    backgroundSize: '6px 6px',
                    backgroundPosition: '0 0',
                    opacity: 0.5
                }}></div>

                {/* Status dot */}
                <div style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: '#00ff88',
                    boxShadow: '0 0 10px #00ff88'
                }}></div>

                {/* Power port cutout */}
                <div style={{
                    position: 'absolute',
                    right: '12px',
                    bottom: '20px',
                    width: '6px',
                    height: '18px',
                    background: '#0a1020',
                    borderRadius: '3px',
                    boxShadow: 'inset 1px 1px 4px rgba(0,0,0,0.8), 1px 1px 1px rgba(255,255,255,0.1)'
                }}></div>
            </div>
        </div>
    );
}
