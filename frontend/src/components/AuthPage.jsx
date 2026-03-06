import { useState } from 'react';
import { Building2, Loader2 } from 'lucide-react';
import api from '../api/axios';

export default function AuthPage({ onLogin }) {
    const [isSignUp, setIsSignUp] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            let res;
            if (isSignUp) {
                res = await api.post('/auth/register', formData);
            } else {
                res = await api.post('/auth/login', { email: formData.email, password: formData.password });
            }

            const userData = {
                _id: res.data._id,
                name: res.data.name,
                email: res.data.email,
                role: res.data.role
            };

            // Save to localStorage
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(userData));

            onLogin(userData);
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

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

                {error && (
                    <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem', fontSize: '0.85rem', textAlign: 'center' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {isSignUp && (
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Full Name</label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="John Doe"
                                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-dark)', background: 'var(--bg-main)', color: 'white', outline: 'none', boxSizing: 'border-box' }}
                            />
                        </div>
                    )}

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Work Email</label>
                        <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="name@company.com"
                            style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-dark)', background: 'var(--bg-main)', color: 'white', outline: 'none', boxSizing: 'border-box' }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Password</label>
                        <input
                            type="password"
                            required
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            placeholder="••••••••"
                            style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-dark)', background: 'var(--bg-main)', color: 'white', outline: 'none', boxSizing: 'border-box' }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        style={{
                            background: 'var(--primary)',
                            color: 'white',
                            padding: '0.85rem',
                            borderRadius: 'var(--radius-md)',
                            fontWeight: '600',
                            fontSize: '1rem',
                            marginTop: '0.5rem',
                            transition: 'background 0.2s',
                            cursor: isLoading ? 'not-allowed' : 'pointer',
                            border: 'none',
                            width: '100%',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: '0.5rem',
                            opacity: isLoading ? 0.7 : 1
                        }}
                    >
                        {isLoading && <Loader2 size={16} className="animate-spin" />}
                        {isSignUp ? 'Sign Up' : 'Sign In'}
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
                    <span
                        onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
                        style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: '500' }}
                    >
                        {isSignUp ? 'Sign In' : 'Sign Up'}
                    </span>
                </div>
            </div>
        </div>
    );
}
