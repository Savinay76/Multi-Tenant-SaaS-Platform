const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');
const tenantIsolation = require('../middleware/tenantMiddleware');
const allowRoles = require('../middleware/rbacMiddleware');
const projectController = require('../controllers/projectCtrl');

router.use(authMiddleware);
router.use(tenantIsolation);

// Create project
router.post(
  '/projects',
  allowRoles('tenant_admin', 'user'),
  projectController.createProject
);

// List projects
router.get(
  '/projects',
  projectController.listProjects
);

// Update project
router.put(
  '/projects/:projectId',
  allowRoles('tenant_admin', 'user'),
  projectController.updateProject
);

// Delete project
router.delete(
  '/projects/:projectId',
  allowRoles('tenant_admin', 'user'),
  projectController.deleteProject
);

module.exports = router;
