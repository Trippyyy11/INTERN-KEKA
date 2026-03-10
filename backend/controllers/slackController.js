import { WebClient } from '@slack/web-api';
import User from '../models/User.js';

const userCache = new Map(); // Cache user info to avoid rate limits

const resolveUser = async (client, userId) => {
    if (!userId) return null;
    if (userCache.has(userId)) return userCache.get(userId);

    try {
        const result = await client.users.info({ user: userId });
        if (!result.ok || !result.user) {
            throw new Error(result.error || 'User not found');
        }

        const profile = result.user.profile || {};
        const userInfo = {
            id: userId,
            name: result.user.real_name || result.user.name,
            displayName: profile.display_name || result.user.real_name || result.user.name,
            avatar: profile.image_72 || profile.image_48 || profile.image_32 || profile.image_512 || '',
        };
        userCache.set(userId, userInfo);
        return userInfo;
    } catch (err) {
        console.error(`Failed to resolve user ${userId}:`, err.message);
        // Don't cache failures eternally, but return a placeholder
        return {
            id: userId,
            name: 'Unknown User',
            displayName: 'Unknown User',
            avatar: ''
        };
    }
};

/**
 * Replaces Slack user mentions <@U123456> with @DisplayName
 */
const resolveMentions = async (client, text, resolvedUsersMap) => {
    if (!text) return '';

    // Find all user mentions like <@U12345>
    const mentionRegex = /<@(\w+)>/g;
    const matches = [...text.matchAll(mentionRegex)];

    if (matches.length === 0) return text;

    let processedText = text;
    for (const match of matches) {
        const userId = match[1];
        let userInfo = resolvedUsersMap.get(userId);

        if (!userInfo) {
            userInfo = await resolveUser(client, userId);
            resolvedUsersMap.set(userId, userInfo);
        }

        const displayName = userInfo.displayName || userInfo.name || userId;
        processedText = processedText.replace(match[0], `@${displayName}`);
    }

    return processedText;
};

// GET /api/slack/intern-updates
export const getInternUpdates = async (req, res) => {
    try {
        // Read token from the authenticated user's profile
        const dbUser = await User.findById(req.user._id).select('slackBotToken');
        const token = dbUser?.slackBotToken;

        if (!token) {
            return res.status(200).json({
                channels: [],
                configured: false,
                message: 'Slack Bot Token not configured. Please save your token in the Slack settings.',
            });
        }

        const client = new WebClient(token);

        // 1. Discover all channels where the bot is a member
        let allChannels = [];
        let cursor = '';

        do {
            const listResult = await client.conversations.list({
                types: 'public_channel,private_channel',
                limit: 200,
                cursor: cursor || undefined,
            });
            allChannels = allChannels.concat(listResult.channels || []);
            cursor = listResult.response_metadata?.next_cursor || '';
        } while (cursor);

        // Filter only channels where the bot is a member
        const matchedChannels = allChannels.filter(ch => ch.is_member);

        if (matchedChannels.length === 0) {
            return res.json({
                channels: [],
                configured: true,
                message: 'No channels found. Make sure the Slack Bot has been invited to the relevant channels.',
            });
        }

        const resolvedUsersMap = new Map();

        // 2. Fetch recent messages from each matched channel
        const channelData = await Promise.all(
            matchedChannels.map(async (channel) => {
                try {
                    const historyResult = await client.conversations.history({
                        channel: channel.id,
                        limit: 10,
                    });

                    const userMessages = (historyResult.messages || []).filter(
                        msg => msg.type === 'message' && !msg.subtype
                    );

                    // 3. Resolve user info and process mentions for each message
                    const messagesWithUsers = await Promise.all(
                        userMessages.map(async (msg) => {
                            const senderId = msg.user;
                            let senderInfo = resolvedUsersMap.get(senderId);

                            if (!senderInfo && senderId) {
                                senderInfo = await resolveUser(client, senderId);
                                resolvedUsersMap.set(senderId, senderInfo);
                            }

                            // Process the message text to resolve mentions
                            const processedText = await resolveMentions(client, msg.text, resolvedUsersMap);

                            return {
                                text: processedText,
                                rawText: msg.text, // Keep raw if needed
                                user: senderInfo || { name: 'Unknown', displayName: 'Unknown', avatar: '' },
                                timestamp: msg.ts,
                                date: new Date(parseFloat(msg.ts) * 1000).toISOString(),
                            };
                        })
                    );

                    return {
                        id: channel.id,
                        name: channel.name,
                        topic: channel.topic?.value || '',
                        purpose: channel.purpose?.value || '',
                        memberCount: channel.num_members || 0,
                        messages: messagesWithUsers,
                    };
                } catch (err) {
                    console.error(`Failed to fetch history for #${channel.name}:`, err.message);
                    return {
                        id: channel.id,
                        name: channel.name,
                        topic: channel.topic?.value || '',
                        purpose: channel.purpose?.value || '',
                        memberCount: channel.num_members || 0,
                        messages: [],
                        error: 'Could not fetch messages. Make sure the bot is added to this channel.',
                    };
                }
            })
        );

        channelData.sort((a, b) => a.name.localeCompare(b.name));

        res.json({
            channels: channelData,
            configured: true,
            totalChannels: channelData.length,
            fetchedAt: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Slack API Error:', error.message);

        if (error.data?.error === 'missing_scope') {
            return res.status(403).json({
                message: `Slack integration is missing required permission: ${error.data.needed}. Please update your app scopes in api.slack.com/apps.`,
                neededScope: error.data.needed,
                configured: false,
            });
        }

        if (error.data?.error === 'invalid_auth' || error.data?.error === 'token_revoked') {
            return res.status(401).json({
                message: 'Your Slack Bot Token is invalid or revoked. Please update it in settings.',
                configured: false,
            });
        }

        res.status(500).json({
            message: 'Failed to fetch Slack updates. Please try again later.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
};

// PUT /api/slack/token
export const saveSlackToken = async (req, res) => {
    try {
        const { slackBotToken } = req.body;

        if (slackBotToken === undefined) {
            return res.status(400).json({ message: 'slackBotToken is required.' });
        }

        // Validate token format if provided (non-empty)
        if (slackBotToken && !slackBotToken.startsWith('xoxb-')) {
            return res.status(400).json({ message: 'Invalid token format. Slack Bot Tokens start with "xoxb-".' });
        }

        // Quick validation by calling auth.test if token is non-empty
        if (slackBotToken) {
            try {
                const testClient = new WebClient(slackBotToken);
                await testClient.auth.test();
            } catch (err) {
                return res.status(400).json({ message: 'Token validation failed. Please check your Bot Token.' });
            }
        }

        await User.findByIdAndUpdate(req.user._id, { slackBotToken });

        res.json({
            message: slackBotToken ? 'Slack Bot Token saved successfully!' : 'Slack Bot Token removed.',
            hasToken: !!slackBotToken,
        });
    } catch (error) {
        console.error('Save Slack Token Error:', error.message);
        res.status(500).json({ message: 'Failed to save token.' });
    }
};

// GET /api/slack/token-status
export const getTokenStatus = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('slackBotToken');
        res.json({
            hasToken: !!user?.slackBotToken,
            tokenPreview: user?.slackBotToken
                ? `${user.slackBotToken.substring(0, 10)}...${user.slackBotToken.slice(-4)}`
                : null,
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to check token status.' });
    }
};
