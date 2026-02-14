const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');
const authController = require('../controllers/authCtrl');

router.post('/register-tenant', authController.registerTenant);
router.post('/login', authController.login);
router.get('/me', authMiddleware, authController.getMe);
router.post('/logout', authMiddleware, (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
});

module.exports = router;
