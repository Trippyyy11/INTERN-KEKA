import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';

const CustomNode = ({ data }) => {
    const { isLightMode, role } = data;

    // Define Role-Based Style Tokens
    const getRoleStyles = (role) => {
        switch (role) {
            case 'Super Admin':
                return {
                    color: '#8b5cf6', // Indigo
                    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%)',
                    glow: 'rgba(139, 92, 246, 0.3)',
                    softBg: 'rgba(139, 92, 246, 0.1)'
                };
            case 'Reporting Manager':
                return {
                    color: '#0ea5e9', // Sky Blue
                    gradient: 'linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)',
                    glow: 'rgba(14, 165, 233, 0.3)',
                    softBg: 'rgba(14, 165, 233, 0.1)'
                };
            case 'Intern':
            default:
                return {
                    color: '#10b981', // Emerald
                    gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    glow: 'rgba(16, 185, 129, 0.3)',
                    softBg: 'rgba(16, 185, 129, 0.08)'
                };
        }
    };

    const styles = getRoleStyles(role);

    return (
        <div style={{
            padding: '12px 16px',
            borderRadius: '16px',
            background: isLightMode 
                ? (isLightMode ? `rgba(${styles.color === '#8b5cf6' ? '139, 92, 246' : styles.color === '#0ea5e9' ? '14, 165, 233' : '16, 185, 129'}, 0.12)` : styles.softBg)
                : styles.softBg,
            backdropFilter: 'blur(16px)',
            border: `1.5px solid ${styles.color}`,
            boxShadow: isLightMode 
                ? `0 4px 20px rgba(0,0,0,0.06)` 
                : `0 8px 32px rgba(0, 0, 0, 0.25), inset 0 0 0 1px rgba(255, 255, 255, 0.05)`,
            color: 'var(--text-main)',
            width: '220px',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            overflow: 'hidden'
        }} className="custom-node-glow">
            {/* Background Role Gradient Pattern */}
            <div style={{
                position: 'absolute',
                top: '-50%',
                left: '-50%',
                width: '200%',
                height: '200%',
                background: `radial-gradient(circle, ${styles.glow.replace('0.3', '0.08')} 0%, transparent 70%)`,
                pointerEvents: 'none'
            }} />

            <Handle type="target" position={Position.Top} style={{ background: styles.color, border: 'none', width: '8px', height: '8px', boxShadow: `0 0 10px ${styles.glow}` }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', position: 'relative' }}>
                <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '14px',
                    background: styles.gradient,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '800',
                    fontSize: '1.1rem',
                    color: '#fff',
                    boxShadow: `0 4px 12px ${styles.glow}`,
                    textShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}>
                    {data.name?.substring(0, 1).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                        fontWeight: '700',
                        fontSize: '0.92rem',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        marginBottom: '2px',
                        color: 'var(--text-main)'
                    }}>
                        {data.name}
                    </div>
                    <div style={{
                        fontSize: '0.68rem',
                        color: styles.color,
                        fontWeight: '800',
                        textTransform: 'uppercase',
                        letterSpacing: '0.8px'
                    }}>
                        {data.role}
                    </div>
                </div>
            </div>

            {data.department && (
                <div style={{
                    marginTop: '12px',
                    paddingTop: '10px',
                    borderTop: `1px solid ${isLightMode ? 'rgba(0,0,0,0.06)' : 'rgba(255, 255, 255, 0.08)'}`,
                    fontSize: '0.65rem',
                    color: 'var(--text-muted)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <span style={{ fontWeight: '600' }}>{data.department}</span>
                    <span style={{
                        padding: '2px 6px',
                        borderRadius: '6px',
                        background: isLightMode ? '#f1f5f9' : 'rgba(255, 255, 255, 0.05)',
                        fontSize: '0.6rem',
                        fontWeight: '700'
                    }}>ID: {data._id?.substring(data._id.length - 4).toUpperCase()}</span>
                </div>
            )}

            <Handle type="source" position={Position.Bottom} style={{ background: styles.color, border: 'none', width: '8px', height: '8px', boxShadow: `0 0 10px ${styles.glow}` }} />

            <style>{`
                .custom-node-glow:hover {
                    transform: translateY(-6px) scale(1.03);
                    box-shadow: 0 15px 45px rgba(0, 0, 0, 0.3), 0 0 25px ${styles.glow.replace('0.3', '0.2')};
                    border-color: #ffffff;
                }
            `}</style>
        </div>
    );
};

export default memo(CustomNode);
