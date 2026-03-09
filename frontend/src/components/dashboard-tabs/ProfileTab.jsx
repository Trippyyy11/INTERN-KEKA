import React from 'react';

const ProfileTab = ({
    user,
    isProfileEditing,
    setIsProfileEditing,
    tempProfile,
    setTempProfile,
    handleUpdateProfile,
    inputStyle,
    labelStyle
}) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="panel" style={{ padding: '2rem', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '2rem', right: '2rem' }}>
                    {!isProfileEditing ? (
                        <button
                            className="btn btn-sm"
                            style={{ background: 'var(--primary)', color: 'white' }}
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
                        >
                            Edit Profile
                        </button>
                    ) : (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button className="btn btn-sm" onClick={() => setIsProfileEditing(false)}>Cancel</button>
                            <button className="btn btn-sm btn-primary" onClick={handleUpdateProfile}>Save Changes</button>
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '2.5rem' }}>
                    <div className="avatar" style={{ width: '100px', height: '100px', fontSize: '2.5rem', background: 'var(--primary)', color: 'white' }}>{user.name.substring(0, 1).toUpperCase()}</div>
                    <div>
                        {isProfileEditing ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <input type="text" value={tempProfile.name} onChange={e => setTempProfile({ ...tempProfile, name: e.target.value })} style={{ ...inputStyle, fontSize: '1.5rem', fontWeight: 'bold', width: '300px' }} />
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <input type="text" value={tempProfile.designation} placeholder="Designation" onChange={e => setTempProfile({ ...tempProfile, designation: e.target.value })} style={{ ...inputStyle, width: '145px' }} />
                                    <input type="text" value={tempProfile.department} placeholder="Department" onChange={e => setTempProfile({ ...tempProfile, department: e.target.value })} style={{ ...inputStyle, width: '145px' }} />
                                </div>
                            </div>
                        ) : (
                            <>
                                <h2 style={{ fontSize: '1.75rem', fontWeight: '600', marginBottom: '0.25rem' }}>{user.name}</h2>
                                <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>{user.designation} | {user.department}</p>
                            </>
                        )}
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
                    <div>
                        <label style={labelStyle}>Email</label>
                        <div style={{ fontSize: '0.95rem', fontWeight: '500' }}>{user.email}</div>
                    </div>
                    <div>
                        <label style={labelStyle}>Phone Number</label>
                        {isProfileEditing ? (
                            <input type="text" value={tempProfile.phoneNumber} onChange={e => setTempProfile({ ...tempProfile, phoneNumber: e.target.value })} style={inputStyle} />
                        ) : (
                            <div style={{ fontSize: '0.95rem', fontWeight: '500' }}>{user.phoneNumber || 'N/A'}</div>
                        )}
                    </div>
                    <div>
                        <label style={labelStyle}>Employee ID</label>
                        <div style={{ fontSize: '0.95rem', fontWeight: '500' }}>KEKA-{user._id.substring(user._id.length - 6).toUpperCase()}</div>
                    </div>

                    <div>
                        <label style={labelStyle}>Date of Birth</label>
                        {isProfileEditing ? (
                            <input type="date" value={tempProfile.dob} onChange={e => setTempProfile({ ...tempProfile, dob: e.target.value })} style={inputStyle} />
                        ) : (
                            <div style={{ fontSize: '0.95rem', fontWeight: '500' }}>{user.dob ? new Date(user.dob).toLocaleDateString() : 'N/A'}</div>
                        )}
                    </div>
                    <div>
                        <label style={labelStyle}>Date of Joining</label>
                        {isProfileEditing ? (
                            <input type="date" value={tempProfile.joiningDate} onChange={e => setTempProfile({ ...tempProfile, joiningDate: e.target.value })} style={inputStyle} />
                        ) : (
                            <div style={{ fontSize: '0.95rem', fontWeight: '500' }}>{user.joiningDate ? new Date(user.joiningDate).toLocaleDateString() : 'N/A'}</div>
                        )}
                    </div>
                    <div>
                        <label style={labelStyle}>Gender</label>
                        {isProfileEditing ? (
                            <select value={tempProfile.gender} onChange={e => setTempProfile({ ...tempProfile, gender: e.target.value })} style={inputStyle}>
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        ) : (
                            <div style={{ fontSize: '0.95rem', fontWeight: '500' }}>{user.gender || 'N/A'}</div>
                        )}
                    </div>

                    <div>
                        <label style={labelStyle}>Blood Group</label>
                        {isProfileEditing ? (
                            <input type="text" value={tempProfile.bloodGroup} placeholder="e.g. O+" onChange={e => setTempProfile({ ...tempProfile, bloodGroup: e.target.value })} style={inputStyle} />
                        ) : (
                            <div style={{ fontSize: '0.95rem', fontWeight: '500' }}>{user.bloodGroup || 'N/A'}</div>
                        )}
                    </div>
                    <div>
                        <label style={labelStyle}>Role</label>
                        <div style={{ fontSize: '0.95rem', fontWeight: '500' }}>{user.role}</div>
                    </div>
                    <div>
                        <label style={labelStyle}>Location (Place)</label>
                        {isProfileEditing ? (
                            <input type="text" value={tempProfile.place} onChange={e => setTempProfile({ ...tempProfile, place: e.target.value })} style={inputStyle} />
                        ) : (
                            <div style={{ fontSize: '0.95rem', fontWeight: '500' }}>{user.place || 'N/A'}</div>
                        )}
                    </div>
                </div>
            </div>

            <div className="panel" style={{ padding: '2rem' }}>
                <div className="panel-header" style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>Admin Configured Work Details</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2rem' }}>
                    <div>
                        <label style={labelStyle}>Shift Timings</label>
                        <div style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--primary)' }}>{user?.workingSchedule?.shiftStart} to {user?.workingSchedule?.shiftEnd}</div>
                    </div>
                    <div>
                        <label style={labelStyle}>Min. Working Hours</label>
                        <div style={{ fontSize: '0.95rem', fontWeight: '600' }}>{user?.workingSchedule?.minHours} Hours/Day</div>
                    </div>
                    <div>
                        <label style={labelStyle}>Weekly Offs</label>
                        <div style={{ fontSize: '0.95rem', fontWeight: '600' }}>{user?.workingSchedule?.weekOffs?.join(', ') || 'Sunday'}</div>
                    </div>
                    <div>
                        <label style={labelStyle}>Salary Type</label>
                        <div style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--neon-green)' }}>{user?.salaryDetails?.type || 'Fixed'}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileTab;
