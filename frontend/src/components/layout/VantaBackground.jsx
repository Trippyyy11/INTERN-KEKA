import { useEffect, useRef, useState } from 'react';

const VantaBackground = ({ isLightMode }) => {
    const vantaRef = useRef(null);
    const [vantaEffect, setVantaEffect] = useState(null);

    useEffect(() => {
        if (vantaEffect) vantaEffect.destroy();

        if (window.VANTA && vantaRef.current) {
            setVantaEffect(window.VANTA.DOTS({
                el: vantaRef.current,
                mouseControls: true,
                touchControls: true,
                gyroControls: false,
                minHeight: 200.00,
                minWidth: 200.00,
                scale: 1.00,
                scaleMobile: 1.00,
                color: isLightMode ? 0x2563eb : 0x3b82f6,
                color2: isLightMode ? 0x3b82f6 : 0x1e293b,
                backgroundColor: isLightMode ? 0xf8fafc : 0x121212,
                size: isLightMode ? 1.50 : 1.50,
                spacing: 35.00,
                showLines: false
            }));
        }

        return () => {
            if (vantaEffect) vantaEffect.destroy();
        };
    }, [isLightMode]);

    return (
        <div ref={vantaRef} style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 0,
            opacity: 1,
            pointerEvents: 'none',
            transition: 'opacity 0.5s ease'
        }}></div>
    );
};

export default VantaBackground;
