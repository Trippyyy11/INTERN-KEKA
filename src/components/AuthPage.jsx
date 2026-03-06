import { useState } from 'react';
import { Building2 } from 'lucide-react';

export default function AuthPage({ onLogin }) {
    const [isSignUp, setIsSignUp] = useState(false);

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, var(--bg-main) 0%, var(--bg-panel) 100%)',
            padding: '2rem'
        }}>
            <div style={{
                background: 'var(--bg-panel)',
                padding: '3rem',
                borderRadius: 'var(--radius-lg)',
                width: '100%',
                maxWidth: '400px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                border: '1px solid var(--border-dark)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--primary)' }}>
                        <Building2 size={40} />
                        <h1 style={{ fontSize: '2rem', fontWeight: '800', letterSpacing: '-0.05em' }}>keka*</h1>
                    </div>
                    <h2 style={{ fontSize: '1.25rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                        {isSignUp ? 'Create your account' : 'Welcome back'}
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        {isSignUp ? 'Sign up to access your workspace' : 'Please sign in to your dashboard'}
                    </p>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); onLogin(); }} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {isSignUp && (
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Full Name</label>
                            <input
                                type="text"
                                required
                                placeholder="John Doe"
                                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-dark)', background: 'var(--bg-main)', color: 'white', outline: 'none' }}
                            />
                        </div>
                    )}

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Work Email</label>
                        <input
                            type="email"
                            required
                            placeholder="name@company.com"
                            style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-dark)', background: 'var(--bg-main)', color: 'white', outline: 'none' }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Password</label>
                        <input
                            type="password"
                            required
                            placeholder="••••••••"
                            style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-dark)', background: 'var(--bg-main)', color: 'white', outline: 'none' }}
                        />
                    </div>

                    <button
                        type="submit"
                        style={{
                            background: 'var(--primary)',
                            color: 'white',
                            padding: '0.85rem',
                            borderRadius: 'var(--radius-md)',
                            fontWeight: '600',
                            fontSize: '1rem',
                            marginTop: '0.5rem',
                            transition: 'background 0.2s',
                            cursor: 'pointer',
                            border: 'none',
                            width: '100%'
                        }}
                        onMouseOver={(e) => e.target.style.background = 'var(--primary-hover)'}
                        onMouseOut={(e) => e.target.style.background = 'var(--primary)'}
                    >
                        {isSignUp ? 'Sign Up' : 'Sign In'}
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
                    <span
                        onClick={() => setIsSignUp(!isSignUp)}
                        style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: '500' }}
                    >
                        {isSignUp ? 'Sign In' : 'Sign Up'}
                    </span>
                </div>
            </div>
        </div>
    );
}
