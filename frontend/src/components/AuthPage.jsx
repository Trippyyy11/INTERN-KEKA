"use client";

import { useState, useEffect, useRef } from 'react';
import { Logo } from "./logo";
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
    const [isSignUp, setIsSignUp] = useState(false);
    const [step, setStep] = useState(1); // 1: Init, 2: OTP, 3: Profile, 4: Success
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const [formData, setFormData] = useState({
        name: '', email: '', password: '', confirmPassword: '',
        designation: '', department: '', joiningDate: '', dob: '',
        place: '', phoneNumber: '', gender: ''
    });
    const [otp, setOtp] = useState('');
    const [options, setOptions] = useState({ departments: [], designations: [] });

    useEffect(() => {
        if (isSignUp && step === 3) {
            fetchOptions();
        }
    }, [isSignUp, step]);

    const fetchOptions = async () => {
        try {
            const res = await api.get('/auth/options');
            setOptions(res.data);
        } catch (err) { console.error('Failed to fetch org options'); }
    };

    const handleRegisterStep1 = async (e) => {
        if (e) e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await api.post('/auth/register', { name: formData.name, email: formData.email });
            setStep(3); // Skip OTP (Step 2) as per previous logic
            setMessage('Account initialization started. Please complete your profile.');
        } catch (err) { setError(err.response?.data?.message || 'Failed to start registration'); }
        finally { setIsLoading(false); }
    };

    const handleVerifyOTP = async (e) => {
        if (e) e.preventDefault();
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
        if (e) e.preventDefault();
        if (formData.password !== formData.confirmPassword) return setError('Passwords do not match');
        setError('');
        setIsLoading(true);
        try {
            const res = await api.post('/auth/complete-registration', formData);
            if (res.data.requiresApproval) {
                setStep(4);
                setMessage(res.data.message);
            } else {
                completeLogin(res.data);
            }
        } catch (err) { setError(err.response?.data?.message || 'Failed to complete registration'); }
        finally { setIsLoading(false); }
    };

    const handleLogin = async (e) => {
        if (e) e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const res = await api.post('/auth/login', { email: formData.email, password: formData.password });
            completeLogin(res.data);
        } catch (err) {
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

    const renderSuccessStep = () => (
        <div className="flex flex-col items-center text-center gap-6 py-8">
            <CheckCircle2 size={64} className="text-blue-600 animate-in zoom-in duration-500" />
            <div className="flex flex-col gap-2">
                <h3 className="text-2xl font-bold text-foreground">Account Created!</h3>
                <p className="text-muted-foreground leading-relaxed">
                    Your account has been successfully created. We have sent an approval request to the Admins.
                    You will be able to log in once your account is activated.
                </p>
            </div>
            <Button 
                onClick={() => { setIsSignUp(false); setStep(1); }} 
                className="w-full h-12 mt-4 !bg-blue-600 !text-white hover:!bg-blue-700 transition-all rounded-xl font-bold shadow-lg shadow-blue-500/30"
            >
                Back to Login
            </Button>
        </div>
    );

    const renderProfileStep = () => (
        <form onSubmit={handleProfileSubmit} className="flex flex-col gap-8 py-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {message && (
                <div className="flex items-center gap-3 p-4 bg-blue-50/50 border border-blue-100 rounded-xl text-blue-700 text-sm">
                    <CheckCircle2 size={18} className="shrink-0" />
                    <p className="font-medium">{message}</p>
                </div>
            )}

            <div className="flex flex-col gap-6">
                {/* Section: Job Details */}
                <div className="space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60 px-1">Job Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
                        <div className="space-y-2">
                            <label className="text-[0.85rem] font-semibold text-foreground ml-1">Designation</label>
                            <select required value={formData.designation} onChange={e => setFormData({ ...formData, designation: e.target.value })} className="w-full h-11 px-4 bg-slate-50/50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 text-slate-800 transition-all font-medium">
                                <option value="" className="text-slate-500">Select Designation</option>
                                {options.designations.map(o => <option key={o._id} value={o.name} className="text-foreground">{o.name}</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[0.85rem] font-semibold text-foreground ml-1">Department</label>
                            <select required value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })} className="w-full h-11 px-4 bg-slate-50/50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 text-slate-800 transition-all font-medium">
                                <option value="" className="text-slate-500">Select Department</option>
                                {options.departments.map(o => <option key={o._id} value={o.name} className="text-foreground">{o.name}</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[0.85rem] font-semibold text-foreground ml-1">Joining Date</label>
                            <InputGroup className="h-11 border-slate-200 shadow-sm overflow-hidden rounded-xl">
                                <InputGroupAddon align="inline-start" className="!pl-6 pr-0"><CalendarIcon size={16} className="text-muted-foreground/70" /></InputGroupAddon>
                                <InputGroupInput required type="date" value={formData.joiningDate} onChange={e => setFormData({ ...formData, joiningDate: e.target.value })} className="!pl-6 !text-slate-900" />
                            </InputGroup>
                        </div>
                    </div>
                </div>

                {/* Section: Personal Details */}
                <div className="space-y-4 pt-2">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60 px-1">Personal Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
                        <div className="space-y-2">
                            <label className="text-[0.85rem] font-semibold text-foreground ml-1">Date of Birth</label>
                            <InputGroup className="h-11 border-slate-200 shadow-sm overflow-hidden rounded-xl">
                                <InputGroupAddon align="inline-start" className="!pl-6 pr-0"><CalendarIcon size={16} className="text-muted-foreground/70" /></InputGroupAddon>
                                <InputGroupInput required type="date" value={formData.dob} onChange={e => setFormData({ ...formData, dob: e.target.value })} className="!pl-6 !text-slate-900" />
                            </InputGroup>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[0.85rem] font-semibold text-foreground ml-1">Place</label>
                            <InputGroup className="h-11 border-slate-200 shadow-sm overflow-hidden rounded-xl">
                                <InputGroupAddon align="inline-start" className="!pl-6 pr-0"><MapPinIcon size={16} className="text-muted-foreground/70" /></InputGroupAddon>
                                <InputGroupInput required type="text" value={formData.place} onChange={e => setFormData({ ...formData, place: e.target.value })} placeholder="City" className="!pl-6 placeholder:text-slate-800" />
                            </InputGroup>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[0.85rem] font-semibold text-foreground ml-1">Phone Number</label>
                            <InputGroup className="h-11 border-slate-200 shadow-sm overflow-hidden rounded-xl">
                                <InputGroupAddon align="inline-start" className="!pl-6 pr-0"><PhoneIcon size={16} className="text-muted-foreground/70" /></InputGroupAddon>
                                <InputGroupInput required type="tel" value={formData.phoneNumber} onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })} placeholder="Phone" className="!pl-6 placeholder:text-slate-800" />
                            </InputGroup>
                        </div>
                    </div>
                </div>

                {/* Section: Security */}
                <div className="space-y-4 pt-2">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60 px-1">Security</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
                        <div className="space-y-2">
                            <label className="text-[0.85rem] font-semibold text-foreground ml-1">Password</label>
                            <InputGroup className="h-11 border-slate-200 shadow-sm overflow-hidden rounded-xl">
                                <InputGroupAddon align="inline-start" className="!pl-6 pr-0"><LockIcon size={16} className="text-muted-foreground/70" /></InputGroupAddon>
                                <InputGroupInput required type="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} className="!pl-6 !text-slate-900" />
                            </InputGroup>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[0.85rem] font-semibold text-foreground ml-1">Confirm Password</label>
                            <InputGroup className="h-11 border-slate-200 shadow-sm overflow-hidden rounded-xl">
                                <InputGroupAddon align="inline-start" className="!pl-6 pr-0"><LockIcon size={16} className="text-muted-foreground/70" /></InputGroupAddon>
                                <InputGroupInput required type="password" value={formData.confirmPassword} onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })} className="!pl-6 !text-slate-900" />
                            </InputGroup>
                        </div>
                    </div>
                </div>
            </div>

            <Button 
                type="submit" 
                className="w-full h-12 mt-4 text-base font-bold !bg-blue-600 !text-white hover:!bg-blue-700 rounded-xl transition-all shadow-lg shadow-blue-500/30 active:scale-[0.98]" 
                disabled={isLoading}
            >
                {isLoading ? <Loader2 className="animate-spin" /> : 'Complete Signup'}
            </Button>
        </form>
    );

    return (
        <main className="relative md:h-screen md:overflow-hidden lg:grid lg:grid-cols-2 bg-background">
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
            {/* Left Side - Visual Column */}
            <div className="relative hidden h-full flex-col border-r bg-slate-50 p-10 lg:flex">
                <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-background" />
                <div className="z-10 mt-auto">
                    {/* Quote removed as requested */}
                </div>
                <div className="absolute inset-0 opacity-100 text-primary">
                    <FloatingPaths position={1} />
                    <FloatingPaths position={-1} />
                </div>
            </div>

            {/* Right Side - Auth Form Column */}
            <div className="relative flex min-h-screen items-center justify-center px-8 bg-background">
                {/* Top Shades */}
                <div aria-hidden className="absolute inset-0 isolate -z-10 opacity-30 contain-strict pointer-events-none">
                    <div className="absolute top-0 right-0 h-320 w-140 -translate-y-87.5 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,#3b82f615_0,transparent_80%)]" />
                </div>

                <div className="absolute top-7 left-5">
                    <Button
                        variant="ghost"
                        onClick={() => window.location.href = '/'}
                        className="flex items-center gap-2 text-muted-foreground hover:text-primary hover:bg-slate-50"
                    >
                        <ChevronLeftIcon size={16} data-icon="inline-start" />
                        Home
                    </Button>
                </div>

                <div className="w-full max-w-md mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="flex flex-col items-start mb-6">
                        <h1 className="font-bold text-3xl tracking-wide text-foreground mb-1">
                            Sign In or Join Now!
                        </h1>
                        <p className="text-base text-muted-foreground">
                            login or create your Zora account.
                        </p>
                    </div>

                    {error && (
                        <div className="p-3 text-sm font-medium text-destructive bg-destructive/10 border border-destructive/20 rounded-md text-center mb-4">
                            {error}
                        </div>
                    )}

                    {!isSignUp || (isSignUp && step === 1) ? (
                        <>
                            <form onSubmit={isSignUp ? handleRegisterStep1 : handleLogin} className="flex flex-col gap-6">
                                <div className="flex flex-col gap-4">
                                    <p className="text-start text-muted-foreground text-[0.9rem]">
                                        {isSignUp ? 'Create your account to get started' : 'Enter your email address to sign in or create an account'}
                                    </p>
                                    
                                    {isSignUp && (
                                        <InputGroup className="h-12 border-slate-200 overflow-hidden shadow-sm">
                                            <InputGroupAddon align="inline-start" className="!pl-6 pr-0">
                                                <UserCircle2 size={18} className="text-muted-foreground/70" />
                                            </InputGroupAddon>
                                            <InputGroupInput
                                                required
                                                type="text"
                                                placeholder="Full Name"
                                                value={formData.name}
                                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                className="bg-transparent text-foreground tracking-wider placeholder:text-slate-800 !pl-6"
                                            />
                                        </InputGroup>
                                    )}

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
                                            className="bg-transparent text-foreground tracking-wider placeholder:text-slate-800 !pl-6"
                                        />
                                    </InputGroup>
                                    {!isSignUp && (
                                        <InputGroup className="h-12 border-slate-200 overflow-hidden shadow-sm">
                                            <InputGroupAddon align="inline-start" className="!pl-6 pr-0">
                                                <LockIcon size={18} className="text-muted-foreground/70" />
                                            </InputGroupAddon>
                                            <InputGroupInput
                                                required
                                                type="password"
                                                value={formData.password}
                                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                                                className="bg-transparent text-slate-900 tracking-wider !pl-6"
                                            />
                                        </InputGroup>
                                    )}
                                </div>
                                <Button 
                                    type="submit" 
                                    className="w-full h-12 !bg-blue-600 !text-white hover:!bg-blue-700 rounded-xl text-base font-bold shadow-lg shadow-blue-600/30 active:scale-[0.98] transition-all" 
                                    disabled={isLoading}
                                >
                                    {isLoading ? <Loader2 className="animate-spin" /> : (isSignUp ? 'Join Now' : 'Sign In')}
                                </Button>
                            </form>
                        </>
                    ) : (
                        <>
                            {step === 3 && renderProfileStep()}
                            {step === 4 && renderSuccessStep()}
                        </>
                    )}

                    {/* TOS Disclaimer removed as requested */}

                    {(!isSignUp || (isSignUp && step === 1)) && (
                        <div className="text-center pt-6">
                            <p className="text-sm text-muted-foreground">
                                {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
                                <button
                                    onClick={() => { setIsSignUp(!isSignUp); setStep(1); setError(''); setMessage(''); }}
                                    className="font-bold text-primary hover:underline underline-offset-4 focus:outline-none"
                                >
                                    {isSignUp ? 'Sign In' : 'Join Now'}
                                </button>
                            </p>
                        </div>
                    )}
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

