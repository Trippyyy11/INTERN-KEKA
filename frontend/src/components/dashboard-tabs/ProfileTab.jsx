import React from 'react';
import { Edit, Save, X, MapPin, Mail, Phone, Briefcase, Calendar, Heart, Shield, Clock, DollarSign, Camera, Trash2 } from 'lucide-react';

const ProfileTab = ({
    user,
    isProfileEditing,
    setIsProfileEditing,
    tempProfile,
    setTempProfile,
    handleUpdateProfile,
    fileInputRef,
    handleProfilePictureUpload,
    uploadingPic,
    handleRemoveProfilePicture,
    isLightMode
}) => {
    const bentoPanelStyle = {
        background: isLightMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(15, 23, 42, 0.5)',
        backdropFilter: 'blur(16px)',
        borderRadius: '24px',
        border: `1px solid ${isLightMode ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)'}`,
        padding: '2rem',
        boxShadow: isLightMode ? '0 4px 24px rgba(0,0,0,0.04)' : '0 4px 24px rgba(0,0,0,0.2)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    };

    const fieldLabelStyle = {
        fontSize: '0.7rem',
        fontWeight: '700',
        color: 'var(--text-muted)',
        textTransform: 'uppercase',
        letterSpacing: '0.8px',
        marginBottom: '0.4rem',
    };

    const fieldValueStyle = {
        fontSize: '0.95rem',
        fontWeight: '600',
        color: 'var(--text-main)',
    };

    const fieldInputStyle = {
        width: '100%',
        padding: '0.75rem 1rem',
        borderRadius: '14px',
        border: `1px solid ${isLightMode ? '#e2e8f0' : 'rgba(255,255,255,0.08)'}`,
        background: isLightMode ? '#f8fafc' : 'rgba(0,0,0,0.2)',
        color: 'var(--text-main)',
        fontSize: '0.9rem',
        fontWeight: '500',
        outline: 'none',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        fontFamily: 'inherit',
    };

    const fieldCardStyle = {
        background: isLightMode ? '#f8fafc' : 'rgba(0,0,0,0.15)',
        borderRadius: '16px',
        padding: '1rem 1.25rem',
        border: `1px solid ${isLightMode ? '#e2e8f0' : 'rgba(255,255,255,0.04)'}`,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.3rem',
    };

    const workDetailStyle = {
        ...fieldCardStyle,
        background: isLightMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.15)',
        textAlign: 'center',
        alignItems: 'center',
        padding: '1.5rem 1rem',
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1.5rem' }}>
            {/* ── Profile Header Card ── */}
            <div style={{ ...bentoPanelStyle, position: 'relative', overflow: 'hidden' }}>
                {/* Decorative gradient background */}
                <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, height: '120px',
                    background: 'linear-gradient(135deg, rgba(var(--primary-rgb), 0.15), rgba(var(--primary-rgb), 0.03))',
                    borderRadius: '24px 24px 0 0',
                }}></div>

                {/* Edit/Save buttons */}
                <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', zIndex: 2 }}>
                    {!isProfileEditing ? (
                        <button
                            className="btn btn-sm"
                            style={{
                                background: 'var(--primary)', color: 'white',
                                borderRadius: '14px', padding: '0.6rem 1.2rem',
                                fontWeight: '700', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem',
                                boxShadow: '0 4px 12px rgba(var(--primary-rgb), 0.3)',
                                transition: 'all 0.2s',
                            }}
                            onClick={() => {
                                setTempProfile({
                                    name: user.name,
                                    dob: user.dob ? user.dob.split('T')[0] : '',
                                    joiningDate: user.joiningDate ? user.joiningDate.split('T')[0] : '',
                                    phoneNumber: user.phoneNumber || '',
                                    bloodGroup: user.bloodGroup || '',
                                    gender: user.gender || '',
                                    place: user.place || '',
                                    department: user.department || '',
                                    designation: user.designation || ''
                                });
                                setIsProfileEditing(true);
                            }}
                            onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(var(--primary-rgb), 0.4)'; }}
                            onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(var(--primary-rgb), 0.3)'; }}
                        >
                            <Edit size={14} /> Edit Profile
                        </button>
                    ) : (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button className="btn btn-sm" onClick={() => setIsProfileEditing(false)} style={{
                                borderRadius: '14px', padding: '0.6rem 1rem', fontWeight: '700', fontSize: '0.8rem',
                                display: 'flex', alignItems: 'center', gap: '0.3rem',
                                background: isLightMode ? '#f1f5f9' : 'rgba(255,255,255,0.06)',
                                border: `1px solid ${isLightMode ? '#e2e8f0' : 'rgba(255,255,255,0.1)'}`,
                                color: 'var(--text-main)'
                            }}>
                                <X size={14} /> Cancel
                            </button>
                            <button className="btn btn-sm btn-primary" onClick={handleUpdateProfile} style={{
                                borderRadius: '14px', padding: '0.6rem 1rem', fontWeight: '700', fontSize: '0.8rem',
                                display: 'flex', alignItems: 'center', gap: '0.3rem',
                                boxShadow: '0 4px 12px rgba(var(--primary-rgb), 0.3)',
                            }}>
                                <Save size={14} /> Save Changes
                            </button>
                        </div>
                    )}
                </div>

                {/* Avatar + Name */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2.5rem', position: 'relative', zIndex: 1 }}>
                    <div style={{ position: 'relative' }}>
                        <div className="avatar" style={{
                            width: '100px', height: '100px', fontSize: '2.2rem', fontWeight: '800',
                            background: user?.profilePicture ? 'transparent' : 'linear-gradient(135deg, var(--primary), rgba(var(--primary-rgb), 0.7))',
                            color: 'white',
                            borderRadius: '24px',
                            boxShadow: '0 8px 24px rgba(var(--primary-rgb), 0.3)',
                            border: `3px solid ${isLightMode ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.1)'}`,
                            overflow: 'hidden',
                        }}>
                            {user?.profilePicture ? (
                                <img src={user.profilePicture} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : user.name.substring(0, 1).toUpperCase()}
                        </div>
                        {isProfileEditing && (
                            <div style={{ position: 'absolute', bottom: '-4px', right: '-4px', display: 'flex', gap: '0.25rem' }}>
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={uploadingPic}
                                    style={{
                                        width: '30px', height: '30px', borderRadius: '10px',
                                        background: 'var(--primary)', color: 'white', border: 'none',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                                    }}
                                >
                                    <Camera size={14} />
                                </button>
                                {user?.profilePicture && (
                                    <button
                                        onClick={handleRemoveProfilePicture}
                                        style={{
                                            width: '30px', height: '30px', borderRadius: '10px',
                                            background: '#ef4444', color: 'white', border: 'none',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                                        }}
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                )}
                                <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleProfilePictureUpload} />
                            </div>
                        )}
                    </div>
                    <div>
                        {isProfileEditing ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <input type="text" value={tempProfile.name} onChange={e => setTempProfile({ ...tempProfile, name: e.target.value })} style={{ ...fieldInputStyle, fontSize: '1.4rem', fontWeight: '800', width: '300px', letterSpacing: '-0.5px' }} />
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: '500', margin: 0 }}>
                                    {user.designation} <span style={{ opacity: 0.4 }}>|</span> {user.department}
                                </p>
                            </div>
                        ) : (
                            <>
                                <h2 style={{ fontSize: '1.6rem', fontWeight: '800', marginBottom: '0.2rem', color: 'var(--text-main)', letterSpacing: '-0.5px' }}>{user.name}</h2>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: '500', margin: 0 }}>
                                    {user.designation} <span style={{ opacity: 0.4 }}>|</span> {user.department}
                                </p>
                            </>
                        )}
                    </div>
                </div>

                {/* ── Profile Details Grid ── */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', position: 'relative', zIndex: 1 }}>
                    <div style={fieldCardStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <Mail size={12} color="var(--text-muted)" />
                            <span style={fieldLabelStyle}>Email</span>
                        </div>
                        <div style={fieldValueStyle}>{user.email}</div>
                    </div>
                    <div style={fieldCardStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <Phone size={12} color="var(--text-muted)" />
                            <span style={fieldLabelStyle}>Phone Number</span>
                        </div>
                        {isProfileEditing ? (
                            <input type="text" value={tempProfile.phoneNumber} onChange={e => setTempProfile({ ...tempProfile, phoneNumber: e.target.value })} style={fieldInputStyle} />
                        ) : (
                            <div style={fieldValueStyle}>{user.phoneNumber || 'N/A'}</div>
                        )}
                    </div>
                        <div style={fieldCardStyle}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <Briefcase size={12} color="var(--text-muted)" />
                                <span style={fieldLabelStyle}>Intern ID</span>
                            </div>
                            <div style={fieldValueStyle}>{user.internId || 'N/A'}</div>
                        </div>

                    <div style={fieldCardStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <Calendar size={12} color="var(--text-muted)" />
                            <span style={fieldLabelStyle}>Date of Birth</span>
                        </div>
                        {isProfileEditing ? (
                            <input type="date" value={tempProfile.dob} onChange={e => setTempProfile({ ...tempProfile, dob: e.target.value })} style={fieldInputStyle} />
                        ) : (
                            <div style={fieldValueStyle}>{user.dob ? new Date(user.dob).toLocaleDateString() : 'N/A'}</div>
                        )}
                    </div>
                    <div style={fieldCardStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <Calendar size={12} color="var(--text-muted)" />
                            <span style={fieldLabelStyle}>Date of Joining</span>
                        </div>
                        {isProfileEditing ? (
                            <input type="date" value={tempProfile.joiningDate} onChange={e => setTempProfile({ ...tempProfile, joiningDate: e.target.value })} style={fieldInputStyle} />
                        ) : (
                            <div style={fieldValueStyle}>{user.joiningDate ? new Date(user.joiningDate).toLocaleDateString() : 'N/A'}</div>
                        )}
                    </div>
                    <div style={fieldCardStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <Shield size={12} color="var(--text-muted)" />
                            <span style={fieldLabelStyle}>Gender</span>
                        </div>
                        {isProfileEditing ? (
                            <select value={tempProfile.gender} onChange={e => setTempProfile({ ...tempProfile, gender: e.target.value })} style={fieldInputStyle}>
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        ) : (
                            <div style={fieldValueStyle}>{user.gender || 'N/A'}</div>
                        )}
                    </div>

                    <div style={fieldCardStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <Heart size={12} color="var(--text-muted)" />
                            <span style={fieldLabelStyle}>Blood Group</span>
                        </div>
                        {isProfileEditing ? (
                            <input type="text" value={tempProfile.bloodGroup} placeholder="e.g. O+" onChange={e => setTempProfile({ ...tempProfile, bloodGroup: e.target.value })} style={fieldInputStyle} />
                        ) : (
                            <div style={fieldValueStyle}>{user.bloodGroup || 'N/A'}</div>
                        )}
                    </div>
                    <div style={fieldCardStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <Shield size={12} color="var(--text-muted)" />
                            <span style={fieldLabelStyle}>Role</span>
                        </div>
                        <div style={{ ...fieldValueStyle, color: 'var(--primary)' }}>{user.role}</div>
                    </div>
                    <div style={fieldCardStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <MapPin size={12} color="var(--text-muted)" />
                            <span style={fieldLabelStyle}>Location (Place)</span>
                        </div>
                        {isProfileEditing ? (
                            <input type="text" value={tempProfile.place} onChange={e => setTempProfile({ ...tempProfile, place: e.target.value })} style={fieldInputStyle} />
                        ) : (
                            <div style={fieldValueStyle}>{user.place || 'N/A'}</div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Admin Configured Work Details ── */}
            <div style={bentoPanelStyle}>
                <div style={{ fontSize: '1.05rem', fontWeight: '800', letterSpacing: '-0.3px', color: 'var(--text-main)', marginBottom: '1.5rem' }}>
                    Admin Configured Work Details
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                    <div style={workDetailStyle}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '12px', background: 'rgba(var(--primary-rgb), 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.5rem' }}>
                            <Clock size={16} color="var(--primary)" />
                        </div>
                        <div style={fieldLabelStyle}>Shift Timings</div>
                        <div style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--primary)' }}>{user?.workingSchedule?.shiftStart} to {user?.workingSchedule?.shiftEnd}</div>
                    </div>
                    <div style={workDetailStyle}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.5rem' }}>
                            <Briefcase size={16} color="var(--success)" />
                        </div>
                        <div style={fieldLabelStyle}>Min. Working Hours</div>
                        <div style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-main)' }}>{user?.workingSchedule?.minHours} Hours/Day</div>
                    </div>
                    <div style={workDetailStyle}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.5rem' }}>
                            <Calendar size={16} color="#f59e0b" />
                        </div>
                        <div style={fieldLabelStyle}>Weekly Offs</div>
                        <div style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-main)' }}>{user?.workingSchedule?.weekOffs?.join(', ') || 'Sunday'}</div>
                    </div>
                    <div style={workDetailStyle}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.5rem' }}>
                            <DollarSign size={16} color="var(--success)" />
                        </div>
                        <div style={fieldLabelStyle}>Salary Type</div>
                        <div style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--success)' }}>{user?.salaryDetails?.type || 'Fixed'}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileTab;
