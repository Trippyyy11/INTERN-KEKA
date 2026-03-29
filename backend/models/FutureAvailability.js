import mongoose from 'mongoose';

const futureAvailabilitySchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        date: { type: Date, required: true },
        status: {
            type: String,
            enum: ['Available', 'Unavailable', 'WFH', 'Half-Day'],
            default: 'Available'
        },
        note: { type: String, default: '' },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    },
    { timestamps: true }
);

// Ensure one entry per user per day
futureAvailabilitySchema.index({ user: 1, date: 1 }, { unique: true });

const FutureAvailability = mongoose.model('FutureAvailability', futureAvailabilitySchema);
export default FutureAvailability;
