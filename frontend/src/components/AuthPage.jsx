import { useState, useEffect } from 'react';
import { Building2, Loader2, ArrowLeft, RefreshCw, Send, CheckCircle2, UserCircle2 } from 'lucide-react';
import api from '../api/axios';

export default function AuthPage({ onLogin }) {
    const [isSignUp, setIsSignUp] = useState(false);
    const [step, setStep] = useState(1); // 1: Init, 2: OTP, 3: Profile
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const [formData, setFormData] = useState({
        name: '', email: '', password: '', confirmPassword: '',
        designation: '', department: '', joiningDate: '', dob: '',
        place: '', phoneNumber: ''
    });
    const [otp, setOtp] = useState('');
    const [options, setOptions] = useState({ departments: [], designations: [] });

    useEffect(() => {
        if (isSignUp) {
            fetchOptions();
        }
    }, [isSignUp]);

    const fetchOptions = async () => {
        try {
            const res = await api.get('/auth/options');
            setOptions(res.data);
        } catch (err) { console.error('Failed to fetch org options'); }
    };

    const handleRegisterStep1 = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await api.post('/auth/register', { name: formData.name, email: formData.email });
            setStep(3); // Skip OTP (Step 2) and go to Profile (Step 3)
            setMessage('OTP bypassed. Please complete your profile.');
        } catch (err) { setError(err.response?.data?.message || 'Failed to start registration'); }
        finally { setIsLoading(false); }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await api.post('/auth/verify-otp', { email: formData.email, otp });
            setStep(3);
            setMessage('Email verified! Now complete your profile.');
        } catch (err) { setError(err.response?.data?.message || 'Invalid OTP'); }
        finally { setIsLoading(false); }
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) return setError('Passwords do not match');
        setError('');
        setIsLoading(true);
        try {
            const res = await api.post('/auth/complete-registration', formData);
            if (res.data.requiresApproval) {
                setStep(4); // Success/Waiting Screen
                setMessage(res.data.message);
            } else {
                completeLogin(res.data);
            }
        } catch (err) { setError(err.response?.data?.message || 'Failed to complete registration'); }
        finally { setIsLoading(false); }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const res = await api.post('/auth/login', { email: formData.email, password: formData.password });
            completeLogin(res.data);
        } catch (err) {
            // Unverified catch removed for improvement period
            setError(err.response?.data?.message || 'Login failed');
        } finally { setIsLoading(false); }
    };

    const completeLogin = (data) => {
        if (data.token) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data));
            onLogin(data);
        }
    };

    const renderStep1 = () => (
        <form onSubmit={handleRegisterStep1} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Full Name</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="John Doe" style={inputStyle} />
            </div>
            <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Email</label>
                <input required type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="email@company.com" style={inputStyle} />
            </div>
            <button type="submit" disabled={isLoading} style={btnStyle}>
                {isLoading ? <Loader2 className="animate-spin" /> : <Send size={18} />} Get OTP
            </button>
        </form>
    );

    const renderStep2 = () => (
        <form onSubmit={handleVerifyOTP} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Enter OTP</label>
                <input required maxLength="6" value={otp} onChange={e => setOtp(e.target.value)} placeholder="000000" style={{ ...inputStyle, textAlign: 'center', letterSpacing: '0.5rem', fontSize: '1.25rem' }} />
            </div>
            <button type="submit" disabled={isLoading} style={btnStyle}>
                {isLoading ? <Loader2 className="animate-spin" /> : 'Verify OTP'}
            </button>
            <div onClick={() => setStep(1)} style={{ textAlign: 'center', cursor: 'pointer', fontSize: '0.8rem', color: 'var(--primary)' }}>Back to step 1</div>
        </form>
    );

    const renderStep3 = () => (
        <form onSubmit={handleProfileSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                    <label style={labelStyle}>Designation</label>
                    <select required value={formData.designation} onChange={e => setFormData({ ...formData, designation: e.target.value })} style={inputStyle}>
                        <option value="">Select</option>
                        {options.designations.map(o => <option key={o._id} value={o.name}>{o.name}</option>)}
                    </select>
                </div>
                <div>
                    <label style={labelStyle}>Department</label>
                    <select required value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })} style={inputStyle}>
                        <option value="">Select</option>
                        {options.departments.map(o => <option key={o._id} value={o.name}>{o.name}</option>)}
                    </select>
                </div>
                <div><label style={labelStyle}>Joining Date</label><input required type="date" value={formData.joiningDate} onChange={e => setFormData({ ...formData, joiningDate: e.target.value })} style={inputStyle} /></div>
                <div><label style={labelStyle}>Date of Birth</label><input required type="date" value={formData.dob} onChange={e => setFormData({ ...formData, dob: e.target.value })} style={inputStyle} /></div>
                <div><label style={labelStyle}>Place</label><input required type="text" value={formData.place} onChange={e => setFormData({ ...formData, place: e.target.value })} placeholder="City" style={inputStyle} /></div>
                <div><label style={labelStyle}>Phone Number</label><input required type="tel" value={formData.phoneNumber} onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })} placeholder="Phone" style={inputStyle} /></div>
                <div><label style={labelStyle}>Password</label><input required type="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} style={inputStyle} /></div>
                <div><label style={labelStyle}>Confirm</label><input required type="password" value={formData.confirmPassword} onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })} style={inputStyle} /></div>
            </div>
            <button type="submit" disabled={isLoading} style={btnStyle}>Complete Signup</button>
        </form>
    );

    const renderStep4 = () => (
        <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <CheckCircle2 size={64} color="#10b981" style={{ margin: '0 auto 1.5rem' }} />
            <h3 style={{ color: 'white', marginBottom: '0.75rem' }}>Account Created!</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: '1.5' }}>
                Your account has been successfully created. We have sent an approval request to the Admins.
                You will be able to log in once your account is activated.
            </p>
            <button onClick={() => { setIsSignUp(false); setStep(1); }} style={{ ...btnStyle, marginTop: '2rem' }}>Go to Login</button>
        </div>
    );

    return (
        <div style={containerStyle}>
            <div style={{ ...cardStyle, maxWidth: step === 3 ? '600px' : '400px' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--primary)' }}>
                        <Building2 size={step === 3 ? 32 : 40} />
                        <h1 style={{ fontSize: step === 3 ? '1.5rem' : '2rem', fontWeight: '800' }}>keka*</h1>
                    </div>
                    {step !== 2 && <h2 style={{ fontSize: '1.1rem', color: 'var(--text-main)' }}>
                        {isSignUp ? (step === 4 ? '' : `Registration Step ${step}`) : 'Welcome back'}
                    </h2>}
                </div>

                {error && <div style={errorBanner}>{error}</div>}
                {message && !error && <div style={successBanner}>{message}</div>}

                {isSignUp ? (
                    <>
                        {step === 1 && renderStep1()}
                        {step === 2 && renderStep2()}
                        {step === 3 && renderStep3()}
                        {step === 4 && renderStep4()}
                    </>
                ) : (
                    <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div><label style={labelStyle}>Work Email</label><input required type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} style={inputStyle} /></div>
                        <div><label style={labelStyle}>Password</label><input required type="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} style={inputStyle} /></div>
                        <button type="submit" disabled={isLoading} style={btnStyle}>{isLoading ? <Loader2 className="animate-spin" /> : 'Log In'}</button>
                    </form>
                )}

                {(!isSignUp || (isSignUp && step === 1)) && (
                    <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
                        <span onClick={() => { setIsSignUp(!isSignUp); setStep(1); setError(''); setMessage(''); }} style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: '500' }}>
                            {isSignUp ? 'Sign In' : 'Sign Up'}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}

const containerStyle = { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, var(--bg-main) 0%, var(--bg-panel) 100%)', padding: '2rem' };
const cardStyle = { background: 'var(--bg-panel)', padding: '2.5rem', borderRadius: 'var(--radius-lg)', width: '100%', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', border: '1px solid var(--border-dark)', transition: 'max-width 0.3s' };
const inputStyle = { width: '100%', padding: '0.75rem 0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-dark)', background: 'var(--bg-main)', color: 'white', outline: 'none', boxSizing: 'border-box', fontSize: '0.85rem' };
const labelStyle = { display: 'block', marginBottom: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '500' };
const btnStyle = { background: 'var(--primary)', color: 'white', padding: '0.75rem', borderRadius: 'var(--radius-md)', fontWeight: '600', fontSize: '0.9rem', cursor: 'pointer', border: 'none', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s' };
const errorBanner = { background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem', fontSize: '0.8rem', textAlign: 'center' };
const successBanner = { background: 'rgba(0, 255, 136, 0.1)', color: '#00ff88', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem', fontSize: '0.8rem', textAlign: 'center' };
