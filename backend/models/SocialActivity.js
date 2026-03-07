import mongoose from 'mongoose';

const socialActivitySchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['Post', 'Poll', 'Praise'],
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String
    },
    pollData: {
        question: { type: String },
        options: [{
            text: { type: String },
            votes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
        }]
    },
    praiseData: {
        recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

export default mongoose.model('SocialActivity', socialActivitySchema);