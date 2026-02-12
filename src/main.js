import { Client, Users, Query } from 'node-appwrite';

export default async ({ req, res, log, error }) => {
    const client = new Client()
        .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
        .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
        .setKey(process.env.APPWRITE_API_KEY);

    const users = new Users(client);
    const { action, password, email } = JSON.parse(req.body || '{}');

    // ---- Action: Check if email exists ----
    if (action === 'check-email') {
        if (!email) {
            return res.json({ ok: false, message: 'Email is required' }, 400);
        }
        try {
            const result = await users.list([Query.equal('email', [email])]);
            return res.json({ ok: true, exists: result.total > 0 });
        } catch (err) {
            error(`Failed to check email: ${err.message}`);
            return res.json({ ok: false, message: err.message }, 500);
        }
    }

    // ---- Action: Reset password ----
    if (action === 'reset-password') {
        const userId = req.headers['x-appwrite-user-id'];
        if (!userId) {
            return res.json({ ok: false, message: 'Not authenticated' }, 401);
        }
        if (!password || password.length < 8) {
            return res.json({ ok: false, message: 'Password must be at least 8 characters' }, 400);
        }
        try {
            await users.updatePassword(userId, password);
            log(`Password updated for user ${userId}`);
            return res.json({ ok: true, message: 'Password updated successfully' });
        } catch (err) {
            error(`Failed to update password: ${err.message}`);
            return res.json({ ok: false, message: err.message }, 500);
        }
    }

    return res.json({ ok: false, message: 'Unknown action' }, 400);
};