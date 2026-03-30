import { getVisibilityQuery } from './utils/userHelper.js';

const testUsers = [
    { name: 'TRUPTI', role: 'Super Admin', department: 'Technical', _id: 'admin_id' },
    { name: 'Md Khalid', role: 'Reporting Manager', department: 'Technical', _id: 'manager_id' },
    { name: 'Intern 1', role: 'Intern', department: 'Content', _id: 'intern_id' }
];

testUsers.forEach(u => {
    console.log(`--- Query for ${u.name} (${u.role}) ---`);
    console.log(JSON.stringify(getVisibilityQuery(u), null, 2));
});
