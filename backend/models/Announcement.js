import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        content: { type: String, required: true },
        author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
        isActive: { type: Boolean, default: true }
    },
    { timestamps: true }
);

const Announcement = mongoose.model('Announcement', announcementSchema);
export default Announcement;
