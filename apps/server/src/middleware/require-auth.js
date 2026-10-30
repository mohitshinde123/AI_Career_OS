import { getAuth } from '@clerk/express';
import { findOrCreateUser } from '../modules/users/user.service.js';

export async function requireAuth(req, res, next) {
  try {
    const auth = getAuth(req);
    if (!auth.isAuthenticated || !auth.userId) {
      return res.status(401).json({ error: { code: 'UNAUTHENTICATED', message: 'Sign in to continue.', requestId: req.requestId } });
    }
    const user = await findOrCreateUser(auth.userId);
    if (user.accountStatus !== 'active') {
      return res.status(403).json({ error: { code: 'ACCOUNT_DISABLED', message: 'This account cannot access TalentBridge.', requestId: req.requestId } });
    }
    req.talentBridgeUser = user;
    next();
  } catch (error) {
    next(error);
  }
}