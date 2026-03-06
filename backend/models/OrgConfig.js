import mongoose from 'mongoose';

const configSchema = new mongoose.Schema({
    type: { type: String, enum: ['Department', 'Designation', 'Holiday'], required: true },
    name: { type: String, required: true }, // For Dept/Desig
    date: { type: Date }, // For Holiday
    description: { type: String }
}, { timestamps: true });

const OrgConfig = mongoose.model('OrgConfig', configSchema);
export default OrgConfig;
