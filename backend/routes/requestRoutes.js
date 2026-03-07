import express from 'express';
import { createRequest, getMyRequests, getInboxRequests, updateRequestStatus, searchUsers } from '../controllers/requestController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/', createRequest);
router.get('/my', getMyRequests);
router.get('/inbox', getInboxRequests);
router.get('/search-users', searchUsers);
router.put('/:id/status', updateRequestStatus);

export default router;
