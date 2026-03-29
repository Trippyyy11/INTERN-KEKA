import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';

const CustomNode = ({ data }) => {
    const { isLightMode } = data;
    const isManager = data.role === 'Reporting Officer' || data.role === 'Super Admin';

    return (
        <div style={{
            padding: '12px 16px',
            borderRadius: '16px',
            background: isLightMode 
                ? (isManager ? 'rgba(255, 171, 0, 0.15)' : 'rgba(0, 255, 162, 0.1)') 
                : (isManager ? 'rgba(255, 171, 0, 0.1)' : 'rgba(0, 255, 162, 0.05)'),
            backdropFilter: 'blur(12px)',
            border: `1.5px solid ${isManager ? '#ffab00' : '#00ffa2'}`,
            boxShadow: isLightMode 
                ? `0 4px 20px rgba(0,0,0,0.05)` 
                : `0 8px 32px rgba(0, 0, 0, 0.2), inset 0 0 0 1px rgba(255, 255, 255, 0.05)`,
            color: 'var(--text-main)',
            width: '220px',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            overflow: 'hidden'
        }} className="custom-node-glow">
            {/* Background Gradient Pulse */}
            <div style={{
                position: 'absolute',
                top: '-50%',
                left: '-50%',
                width: '200%',
                height: '200%',
                background: `radial-gradient(circle, ${isManager ? 'rgba(255, 171, 0, 0.05)' : 'rgba(0, 255, 162, 0.03)'} 0%, transparent 70%)`,
                pointerEvents: 'none'
            }} />

            <Handle type="target" position={Position.Top} style={{ background: isManager ? '#ffab00' : '#00ffa2', border: 'none', width: '8px', height: '8px' }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', position: 'relative' }}>
                <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '12px',
                    background: isManager ? 'linear-gradient(135deg, #ffab00 0%, #ff8800 100%)' : 'linear-gradient(135deg, #00ffa2 0%, #00d1ff 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '800',
                    fontSize: '1rem',
                    color: '#0a0e17',
                    boxShadow: `0 4px 12px ${isManager ? 'rgba(255, 171, 0, 0.3)' : 'rgba(0, 255, 162, 0.3)'}`
                }}>
                    {data.name?.substring(0, 1).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                        fontWeight: '700',
                        fontSize: '0.9rem',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        marginBottom: '2px'
                    }}>
                        {data.name}
                    </div>
                    <div style={{
                        fontSize: '0.7rem',
                        color: 'var(--text-muted)',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                    }}>
                        {data.designation || data.role}
                    </div>
                </div>
            </div>

            {data.department && (
                <div style={{
                    marginTop: '10px',
                    paddingTop: '8px',
                    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                    fontSize: '0.65rem',
                    color: 'var(--text-muted)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <span>{data.department}</span>
                    <span style={{
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        fontSize: '0.6rem'
                    }}>ID: {data._id?.substring(data._id.length - 4).toUpperCase()}</span>
                </div>
            )}

            <Handle type="source" position={Position.Bottom} style={{ background: isManager ? '#ffab00' : '#00ffa2', border: 'none', width: '8px', height: '8px' }} />

            <style>{`
                .custom-node-glow:hover {
                    transform: translateY(-5px) scale(1.02);
                    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3), 0 0 20px ${isManager ? 'rgba(255, 171, 0, 0.2)' : 'rgba(0, 255, 162, 0.15)'};
                    border-color: #ffffff;
                }
            `}</style>
        </div>
    );
};

export default memo(CustomNode);
