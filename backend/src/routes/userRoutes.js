const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');
const tenantIsolation = require('../middleware/tenantMiddleware');
const allowRoles = require('../middleware/rbacMiddleware');
const userController = require('../controllers/userCtrl');

router.use(authMiddleware);
router.use(tenantIsolation);

// Add user (tenant_admin only)
router.post(
  '/tenants/:tenantId/users',
  allowRoles('tenant_admin'),
  userController.addUser
);

// List users (all tenant users)
router.get(
  '/tenants/:tenantId/users',
  userController.listUsers
);

// Update user (self or tenant_admin)
router.put(
  '/users/:userId',
  userController.updateUser
);

// Delete user (tenant_admin only)
router.delete(
  '/users/:userId',
  allowRoles('tenant_admin'),
  userController.deleteUser
);

module.exports = router;
