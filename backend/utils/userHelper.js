/**
 * Returns a MongoDB query object to filter users based on the requesting user's role.
 * 
 * Rules:
 * - Super Admin: All users of 'Intern' role only.
 * - Reporting Manager: All interns reporting directly to them.
 * - Intern: Interns of the same department only.
 */
export const getVisibilityQuery = (requestingUser) => {
    const normalizedRole = requestingUser?.role?.toLowerCase().replace(/\s/g, '');
    
    // Base rule: We only want to see Interns who are not deleted and are active.
    console.log(`getVisibilityQuery called for User: ${requestingUser?.name}, Role: ${normalizedRole}, Dept: ${requestingUser?.department}`);
    const query = { 
        role: 'Intern', 
        isDeleted: { $ne: true },
        isActive: true
    };

    if (normalizedRole === 'superadmin') {
        console.log('Role is Super Admin, returning Intern-only query');
        return query;
    }

    if (normalizedRole === 'reportingmanager') {
        // Managers see only the interns that report directly to them
        query.reportingManager = requestingUser._id;
        return query;
    }

    // Default (Interns): See interns from the same department (case-insensitive)
    if (requestingUser.department) {
        query.department = { $regex: `^${requestingUser.department.trim()}$`, $options: 'i' };
    } else {
        // Fallback: if user has no department, they effectively see only themselves as an intern
        query._id = requestingUser._id;
    }

    return query;
};
