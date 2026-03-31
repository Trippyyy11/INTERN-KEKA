"use client";

import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { Button } from "./ui/button";
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from "./ui/input-group";
import { AuthDivider } from "./auth-divider";
import { FloatingPaths } from "./floating-paths";
import {
    ChevronLeftIcon,
    AtSignIcon,
    Loader2,
    CheckCircle2,
    UserCircle2,
    LockIcon,
    CalendarIcon,
    BriefcaseIcon,
    MapPinIcon,
    PhoneIcon,
    ArrowRightIcon
} from "lucide-react";
import api from '../api/axios';

export default function AuthPage({ onLogin }) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    
    const [formData, setFormData] = useState({
        email: '', password: ''
    });
    const colors = ['#b0d4ff', '#a3c1ad', '#e2d1f9', '#ffd8be', '#d1f2eb'];
    const [colorIndex, setColorIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setColorIndex(prev => (prev + 1) % colors.length);
        }, 15000);
        return () => clearInterval(interval);
    }, []);
    const [forgotStep, setForgotStep] = useState(null); // 'email', 'otp', 'reset'
    const [resetData, setResetData] = useState({
        email: '',
        otp: '',
        password: '',
        confirmPassword: ''
    });

    const handleLogin = async (e) => {
        if (e) e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const res = await api.post('/auth/login', { email: formData.email, password: formData.password });
            completeLogin(res.data);
            toast.success('Welcome back!');
        } catch (err) {
            const msg = err.response?.data?.message || 'Login failed';
            setError(msg);
            toast.error(msg);
        } finally { setIsLoading(false); }
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await api.post('/auth/forgot-password', { email: resetData.email });
            setForgotStep('otp');
            toast.success('OTP sent to your email');
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to send OTP';
            setError(msg);
            toast.error(msg);
        } finally { setIsLoading(false); }
    };

    const handleVerifyResetOTP = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await api.post('/auth/verify-reset-otp', { email: resetData.email, otp: resetData.otp });
            setForgotStep('reset');
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid or expired OTP');
        } finally { setIsLoading(false); }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (resetData.password !== resetData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        setError('');
        setIsLoading(true);
        try {
            await api.post('/auth/reset-password', { 
                email: resetData.email, 
                otp: resetData.otp, 
                password: resetData.password 
            });
            setForgotStep(null);
            setResetData({ email: '', otp: '', password: '', confirmPassword: '' });
            setError('');
            setFormData(prev => ({ ...prev, email: resetData.email }));
            toast.success('Password reset successful! Please login.');
        } catch (err) {
            setError(err.response?.data?.message || 'Reset failed');
        } finally { setIsLoading(false); }
    };

    const completeLogin = (data) => {
        localStorage.setItem('user', JSON.stringify(data));
        onLogin(data);
    };

    const renderLoginForm = () => (
        <form onSubmit={handleLogin} className="flex flex-col gap-6">
            <div className="flex flex-col gap-4">
                <InputGroup className="h-12 border-slate-200 overflow-hidden shadow-sm">
                    <InputGroupAddon align="inline-start" className="!pl-6 pr-0">
                        <AtSignIcon size={18} className="text-muted-foreground/70" />
                    </InputGroupAddon>
                    <InputGroupInput
                        required
                        type="email"
                        placeholder="your.email@example.com"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        className="bg-transparent tracking-wider placeholder:text-slate-800 !pl-6 !text-slate-900 dark:text-slate-900"
                        style={{ color: '#0f172a' }}
                    />
                </InputGroup>
                
                <InputGroup className="h-12 border-slate-200 overflow-hidden shadow-sm">
                    <InputGroupAddon align="inline-start" className="!pl-6 pr-0">
                        <LockIcon size={18} className="text-muted-foreground/70" />
                    </InputGroupAddon>
                    <InputGroupInput
                        required
                        type="password"
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                        className="bg-transparent tracking-wider placeholder:text-slate-800 !pl-6 !text-slate-900 dark:text-slate-900"
                        style={{ color: '#0f172a' }}
                    />
                </InputGroup>
            </div>
            <div className="flex justify-end mt-2 mb-4">
                <button 
                    type="button"
                    onClick={() => { setForgotStep('email'); setError(''); }}
                    className="text-sm font-bold !text-blue-600 hover:!text-blue-800 underline underline-offset-4 transition-colors"
                    style={{ color: '#2563eb', opacity: 1, visibility: 'visible', display: 'inline-block' }}
                >
                    Forgot password?
                </button>
            </div>
            <Button 
                type="submit" 
                className="w-full h-12 !bg-slate-900 !text-white hover:!bg-slate-800 rounded-xl text-base font-semibold shadow-lg shadow-slate-200 active:scale-[0.98] transition-all" 
                disabled={isLoading}
            >
                {isLoading ? <Loader2 className="animate-spin" /> : 'Sign In'}
            </Button>
        </form>
    );

    const renderForgotEmailStep = () => (
        <form onSubmit={handleForgotPassword} className="flex flex-col gap-6">
            <div className="flex flex-col gap-4">
                <p className="text-sm text-muted-foreground mb-2">Enter your email address and we'll send you an OTP to reset your password.</p>
                <InputGroup className="h-12 border-slate-200 overflow-hidden shadow-sm">
                    <InputGroupAddon align="inline-start" className="!pl-6 pr-0">
                        <AtSignIcon size={18} className="text-muted-foreground/70" />
                    </InputGroupAddon>
                    <InputGroupInput
                        required
                        type="email"
                        placeholder="your.email@example.com"
                        value={resetData.email}
                        onChange={e => setResetData({ ...resetData, email: e.target.value })}
                        className="bg-transparent tracking-wider placeholder:text-slate-800 !pl-6 !text-slate-900"
                        style={{ color: '#0f172a' }}
                    />
                </InputGroup>
            </div>
            <div className="flex flex-col gap-3">
                <Button 
                    type="submit" 
                    className="w-full h-12 !bg-slate-900 !text-white hover:!bg-slate-800 rounded-xl text-base font-semibold" 
                    disabled={isLoading}
                >
                    {isLoading ? <Loader2 className="animate-spin" /> : 'Send OTP'}
                </Button>
                <Button 
                    type="button" 
                    variant="ghost"
                    onClick={() => { setForgotStep(null); setError(''); }}
                    className="w-full h-12 text-muted-foreground"
                >
                    Back to Login
                </Button>
            </div>
        </form>
    );

    const renderForgotOTPStep = () => (
        <form onSubmit={handleVerifyResetOTP} className="flex flex-col gap-6">
            <div className="flex flex-col gap-4">
                <p className="text-sm text-muted-foreground mb-2">We've sent a 6-digit OTP to <b>{resetData.email}</b>. Please enter it below.</p>
                <InputGroup className="h-12 border-slate-200 overflow-hidden shadow-sm">
                    <InputGroupAddon align="inline-start" className="!pl-6 pr-0">
                        <LockIcon size={18} className="text-muted-foreground/70" />
                    </InputGroupAddon>
                    <InputGroupInput
                        required
                        type="text"
                        maxLength={6}
                        placeholder="Enter 6-digit OTP"
                        value={resetData.otp}
                        onChange={e => setResetData({ ...resetData, otp: e.target.value })}
                        className="bg-transparent tracking-widest placeholder:tracking-normal !pl-6 font-mono text-lg"
                        style={{ color: '#0f172a' }}
                    />
                </InputGroup>
            </div>
            <div className="flex flex-col gap-3">
                <Button 
                    type="submit" 
                    className="w-full h-12 !bg-slate-900 !text-white hover:!bg-slate-800 rounded-xl text-base font-semibold" 
                    disabled={isLoading}
                >
                    {isLoading ? <Loader2 className="animate-spin" /> : 'Verify OTP'}
                </Button>
                <button 
                    type="button"
                    onClick={handleForgotPassword}
                    disabled={isLoading}
                    className="text-sm font-bold !text-blue-600 hover:!text-blue-800 underline underline-offset-4 mt-2 transition-colors"
                    style={{ color: '#2563eb', opacity: 1, visibility: 'visible', display: 'inline-block' }}
                >
                    Resend OTP
                </button>
            </div>
        </form>
    );

    const renderForgotResetStep = () => (
        <form onSubmit={handleResetPassword} className="flex flex-col gap-6">
            <div className="flex flex-col gap-4">
                <p className="text-sm text-muted-foreground mb-2">Set a new secure password for your account.</p>
                <InputGroup className="h-12 border-slate-200 overflow-hidden shadow-sm">
                    <InputGroupAddon align="inline-start" className="!pl-6 pr-0">
                        <LockIcon size={18} className="text-muted-foreground/70" />
                    </InputGroupAddon>
                    <InputGroupInput
                        required
                        type="password"
                        placeholder="New Password"
                        value={resetData.password}
                        onChange={e => setResetData({ ...resetData, password: e.target.value })}
                        className="bg-transparent tracking-wider !pl-6"
                        style={{ color: '#0f172a' }}
                    />
                </InputGroup>
                <InputGroup className="h-12 border-slate-200 overflow-hidden shadow-sm">
                    <InputGroupAddon align="inline-start" className="!pl-6 pr-0">
                        <LockIcon size={18} className="text-muted-foreground/70" />
                    </InputGroupAddon>
                    <InputGroupInput
                        required
                        type="password"
                        placeholder="Confirm New Password"
                        value={resetData.confirmPassword}
                        onChange={e => setResetData({ ...resetData, confirmPassword: e.target.value })}
                        className="bg-transparent tracking-wider !pl-6"
                        style={{ color: '#0f172a' }}
                    />
                </InputGroup>
            </div>
            <Button 
                type="submit" 
                className="w-full h-12 !bg-slate-900 !text-white hover:!bg-slate-800 rounded-xl text-base font-semibold shadow-lg shadow-slate-200" 
                disabled={isLoading}
            >
                {isLoading ? <Loader2 className="animate-spin" /> : 'Reset Password'}
            </Button>
        </form>
    );

    return (
        <main className="relative md:h-screen md:overflow-hidden lg:grid lg:grid-cols-[58%_42%] bg-background">
            <style dangerouslySetInnerHTML={{ __html: `
                input:-webkit-autofill,
                input:-webkit-autofill:hover, 
                input:-webkit-autofill:focus, 
                input:-webkit-autofill:active {
                    -webkit-box-shadow: 0 0 0 50px white inset !important;
                    -webkit-text-fill-color: #0f172a !important; /* slate-900 */
                }
                
                /* EXTREME CONTRAST OVERRIDES */
                ::-webkit-datetime-edit,
                ::-webkit-datetime-edit-fields-wrapper,
                ::-webkit-datetime-edit-text,
                ::-webkit-datetime-edit-month-field,
                ::-webkit-datetime-edit-day-field,
                ::-webkit-datetime-edit-year-field {
                    color: #0f172a !important;
                }
                
                ::placeholder {
                    color: #1e293b !important;
                    opacity: 1 !important;
                }
            ` }} />
            <div 
                className="relative hidden h-full flex-col justify-end border-r lg:flex px-12 py-24 transition-colors duration-[3000ms] ease-in-out"
                style={{ backgroundColor: colors[colorIndex] }}
            >
                {/* Visual Depth Gradients */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.25),transparent)] opacity-60" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(0,0,0,0.1),transparent)]" />
                <div className="absolute inset-0 bg-linear-to-b from-black/5 via-transparent to-black/10" />
                
                <div className="z-10 relative">
                    <div className="flex flex-col gap-3">
                        <div className="flex items-end gap-2">
                            <span className="text-white text-4xl font-light tracking-tight mb-1 drop-shadow-sm">Welcome to</span>
                            <span className="zora-logo text-6xl text-white drop-shadow-md pb-1">Zora</span>
                        </div>
                        <p className="text-white/90 text-xl max-w-sm leading-relaxed font-medium drop-shadow-sm italic">
                            Effortless workforce management and seamless productivity for the modern era.
                        </p>
                    </div>
                    
                    {/* Pagination Dots */}
                    <div className="flex gap-3 mt-12">
                        <div className="w-12 h-1.5 rounded-full bg-white shadow-sm" />
                        <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
                        <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
                        <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
                    </div>
                </div>
                
                <div className="absolute inset-0 overflow-hidden mix-blend-overlay opacity-80">
                    <div className="absolute inset-0 text-white">
                        <FloatingPaths position={1} />
                        <FloatingPaths position={-1} />
                    </div>
                </div>
            </div>

            {/* Right Side - Auth Form Column */}
            <div className="relative flex min-h-screen items-center justify-center px-8 bg-background">
                {/* Top Shades */}
                <div aria-hidden className="absolute inset-0 isolate -z-10 opacity-30 contain-strict pointer-events-none">
                    <div className="absolute top-0 right-0 h-320 w-140 -translate-y-87.5 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,#3b82f615_0,transparent_80%)]" />
                </div>

                <div className="absolute top-7 left-8">
                    <span className="zora-logo text-4xl text-slate-800 drop-shadow-sm cursor-pointer" onClick={() => window.location.href = '/'}>
                        Zora
                    </span>
                </div>

                <div className="w-full max-w-md mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="flex flex-col items-center mb-12">
                        <div className="flex flex-col items-center text-center">
                            <h1 className={`font-bold text-2xl tracking-tight mb-2 ${forgotStep ? 'text-blue-600' : 'text-slate-800 dark:text-white'}`}>
                                {forgotStep === 'email' && 'Forgot Password?'}
                                {forgotStep === 'otp' && 'Verify OTP'}
                                {forgotStep === 'reset' && 'Reset Password'}
                                {!forgotStep && 'Welcome to Zora'}
                            </h1>
                            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-[280px]">
                                {forgotStep === 'email' && 'Step 1: Enter your registered email'}
                                {forgotStep === 'otp' && 'Step 2: Verify your OTP'}
                                {forgotStep === 'reset' && 'Step 3: Set your new password'}
                                {!forgotStep && 'Enter your credentials to access your account.'}
                            </p>
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 text-sm font-medium text-destructive bg-destructive/10 border border-destructive/20 rounded-md text-center mb-4">
                            {error}
                        </div>
                    )}

                    {!forgotStep && renderLoginForm()}
                    {forgotStep === 'email' && renderForgotEmailStep()}
                    {forgotStep === 'otp' && renderForgotOTPStep()}
                    {forgotStep === 'reset' && renderForgotResetStep()}
                </div>
            </div>
        </main>
    );
}

function GoogleIcon(props) {
    return (
        <svg
            fill="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            {...props}
        >
            <g>
                <path d="M12.479,14.265v-3.279h11.049c0.108,0.571,0.164,1.247,0.164,1.979c0,2.46-0.672,5.502-2.84,7.669   C18.744,22.829,16.051,24,12.483,24C5.869,24,0.308,18.613,0.308,12S5.869,0,12.483,0c3.659,0,6.265,1.436,8.223,3.307L18.392,5.62   c-1.404-1.317-3.307-2.341-5.913-2.341C7.65,3.279,3.873,7.171,3.873,12s3.777,8.721,8.606,8.721c3.132,0,4.916-1.258,6.059-2.401   c0.927-0.927,1.537-2.251,1.777-4.059L12.479,14.265z" />
            </g>
        </svg>
    );
}

function AppleIcon({
    fill = "currentColor",
    ...props
}) {
    return (
        <svg fill={fill} viewBox="0 0 24 24" {...props}>
            <g id="_Group_2">
                <g id="_Group_3">
                    <path
                        d="M18.546,12.763c0.024-1.87,1.004-3.597,2.597-4.576c-1.009-1.442-2.64-2.323-4.399-2.378    c-1.851-0.194-3.645,1.107-4.588,1.107c-0.961,0-2.413-1.088-3.977-1.056C6.122,5.927,4.25,7.068,3.249,8.867    c-2.131,3.69-0.542,9.114,1.5,12.097c1.022,1.461,2.215,3.092,3.778,3.035c1.529-0.063,2.1-0.975,3.945-0.975    c1.828,0,2.364,0.975,3.958,0.938c1.64-0.027,2.674-1.467,3.66-2.942c0.734-1.041,1.299-2.191,1.673-3.408    C19.815,16.788,18.548,14.879,18.546,12.763z"
                        id="_Path_"
                    />
                    <path
                        d="M15.535,3.847C16.429,2.773,16.87,1.393,16.763,0c-1.366,0.144-2.629,0.797-3.535,1.829    c-0.895,1.019-1.349,2.351-1.261,3.705C13.352,5.548,14.667,4.926,15.535,3.847z"
                        id="_Path_2"
                    />
                </g>
            </g>
        </svg>
    );
}

function GithubIcon(props) {
    return (
        <svg fill="currentColor" viewBox="0 0 1024 1024" {...props}>
            <path
                clipRule="evenodd"
                d="M8 0C3.58 0 0 3.58 0 8C0 11.54 2.29 14.53 5.47 15.59C5.87 15.66 6.02 15.42 6.02 15.21C6.02 15.02 6.01 14.39 6.01 13.72C4 14.09 3.48 13.23 3.32 12.78C3.23 12.55 2.84 11.84 2.5 11.65C2.22 11.5 1.82 11.13 2.49 11.12C3.12 11.11 3.57 11.7 3.72 11.94C4.44 13.15 5.59 12.81 6.05 12.6C6.12 12.08 6.33 11.73 6.56 11.53C4.78 11.33 2.92 10.64 2.92 7.58C2.92 6.71 3.23 5.99 3.74 5.43C3.66 5.23 3.38 4.41 3.82 3.31C3.82 3.31 4.49 3.1 6.02 4.13C6.66 3.95 7.34 3.86 8.02 3.86C8.7 3.86 9.38 3.95 10.02 4.13C11.55 3.09 12.22 3.31 12.22 3.31C12.66 4.41 12.38 5.23 12.3 5.43C12.81 5.99 13.12 6.7 13.12 7.58C13.12 10.65 11.25 11.33 9.47 11.53C9.76 11.78 10.01 12.26 10.01 13.01C10.01 14.08 10 14.94 10 15.21C10 15.42 10.15 15.67 10.55 15.59C13.71 14.53 16 11.53 16 8C16 3.58 12.42 0 8 0Z"
                fill="currentColor"
                fillRule="evenodd"
                transform="scale(64)"
            />
        </svg>
    );
}

