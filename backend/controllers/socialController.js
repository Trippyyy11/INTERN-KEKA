import SocialActivity from '../models/SocialActivity.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';

// @desc    Get all social activities
// @route   GET /api/social
// @access  Private
export const getActivities = async (req, res) => {
    try {
        const activities = await SocialActivity.find({ isActive: true })
            .populate('author', 'name avatar designation')
            .populate('praiseData.recipient', 'name avatar designation')
            .sort({ createdAt: -1 });
        res.json(activities);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new social activity (Post, Poll, Praise)
// @route   POST /api/social
// @access  Private
export const createActivity = async (req, res) => {
    try {
        const { type, content, pollData, praiseData } = req.body;

        const activity = await SocialActivity.create({
            type,
            author: req.user._id,
            content: content || '',
            pollData: pollData || undefined,
            praiseData: praiseData || undefined
        });

        // Populate immediately for the frontend response
        await activity.populate('author', 'name avatar designation');
        if (activity.praiseData?.recipient) {
            await activity.populate('praiseData.recipient', 'name avatar designation');
        }

        // --- Push Notification Logic ---
        // Notify all users EXCEPT the author for Posts and Polls
        // Notify the recipient (and maybe all users) for Praise
        const allUsers = await User.find({ _id: { $ne: req.user._id } });

        let notifTitle = '';
        let notifMessage = '';
        let notifType = 'general';

        if (type === 'Post') {
            notifType = 'post';
            notifTitle = 'New Post';
            notifMessage = `${req.user.name} shared a new post.`;
        } else if (type === 'Poll') {
            notifType = 'poll';
            notifTitle = 'New Poll';
            notifMessage = `${req.user.name} created a new poll.`;
        } else if (type === 'Praise') {
            notifType = 'praise';
            notifTitle = 'New Recognition';
            const recipientName = activity.praiseData.recipient.name;
            notifMessage = `${req.user.name} just recognized ${recipientName}!`;
        }

        const notifications = allUsers.map(u => ({
            user: u._id,
            type: notifType,
            title: notifTitle,
            message: notifMessage,
            relatedId: activity._id,
            relatedModel: 'SocialActivity'
        }));

        if (notifications.length > 0) {
            await Notification.insertMany(notifications);
        }

        res.status(201).json(activity);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Vote on a poll
// @route   POST /api/social/:id/vote
// @access  Private
export const votePoll = async (req, res) => {
    try {
        const { optionId } = req.body;
        const activity = await SocialActivity.findById(req.params.id);

        if (!activity || activity.type !== 'Poll') {
            return res.status(404).json({ message: 'Poll activity not found.' });
        }

        // Remove user's previous vote from any option (if they are changing their vote)
        let previousOptionIndex = -1;

        activity.pollData.options.forEach((opt, idx) => {
            if (opt.votes.includes(req.user._id)) {
                previousOptionIndex = idx;
                opt.votes = opt.votes.filter(vId => vId.toString() !== req.user._id.toString());
            }
        });

        // Add user's vote to the selected option
        const targetOption = activity.pollData.options.id(optionId);
        if (targetOption) {
            targetOption.votes.push(req.user._id);
        } else {
            return res.status(400).json({ message: 'Invalid Option' });
        }

        await activity.save();

        // Repopulate for frontend
        await activity.populate('author', 'name avatar designation');

        res.json(activity);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a social activity
// @route   DELETE /api/social/:id
// @access  Private
export const deleteActivity = async (req, res) => {
    try {
        const activity = await SocialActivity.findById(req.params.id).populate('author', '_id role');

        if (!activity) {
            return res.status(404).json({ message: 'Activity not found.' });
        }

        // Only the original author, Admin, or Super Admin can delete
        const isAuthor = activity.author._id.toString() === req.user._id.toString();
        const isAdmin = req.user.role === 'Admin' || req.user.role === 'Super Admin';

        if (!isAuthor && !isAdmin) {
            return res.status(403).json({ message: 'Not authorized to delete this activity.' });
        }

        await activity.deleteOne();
        res.status(200).json({ message: 'Activity deleted successfully.' });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
