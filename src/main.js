import { Client, Users } from 'node-appwrite';

export default async ({ req, res, log, error }) => {
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

  const users = new Users(client);

  // Get the authenticated user's ID from the request headers
  const userId = req.headers['x-appwrite-user-id'];
  if (!userId) {
    return res.json({ ok: false, message: 'Not authenticated' }, 401);
  }

  // Parse request body
  const { password } = JSON.parse(req.body || '{}');
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
};
