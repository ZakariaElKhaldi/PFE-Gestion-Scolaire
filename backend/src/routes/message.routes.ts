import express from 'express';
import { messageController } from '../controllers/message.controller';
import { authenticate as requireAuth } from '../middlewares/auth.middleware';

const router = express.Router();

// Apply auth middleware to all routes
router.use(requireAuth);

// GET message routes
router.get('/', messageController.getMessages);
router.get('/inbox', messageController.getInbox);
router.get('/sent', messageController.getSent);
router.get('/unread', messageController.getUnread);
router.get('/partners', messageController.getConversationPartners);
router.get('/recipients', messageController.getPotentialRecipients);
router.get('/counts', messageController.getMessageCounts);
router.get('/conversation/:userId', messageController.getConversation);
router.get('/:id', messageController.getMessage);

// POST/PATCH/DELETE routes
router.post('/', messageController.createMessage);
router.patch('/:id/read', messageController.markAsRead);
router.delete('/:id', messageController.deleteMessage);

// Log all message requests for debugging (development only)
if (process.env.NODE_ENV === 'development') {
  router.use((req, res, next) => {
    const { method, path, body, query, params } = req;
    console.log(`[MESSAGE ROUTES] ${method} ${path}`, {
      body: method === 'POST' || method === 'PUT' ? body : undefined,
      query: Object.keys(query).length ? query : undefined,
      params: Object.keys(params).length ? params : undefined,
      user: req.user?.id
    });
    next();
  });
}

export default router; 