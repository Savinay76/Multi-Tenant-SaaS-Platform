const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');
const tenantIsolation = require('../middleware/tenantMiddleware');
const taskController = require('../controllers/taskCtrl');

router.use(authMiddleware);
router.use(tenantIsolation);

// Create task
router.post(
  '/projects/:projectId/tasks',
  taskController.createTask
);

// List tasks for project
router.get(
  '/projects/:projectId/tasks',
  taskController.listTasks
);

// Update task status only
router.patch(
  '/tasks/:taskId/status',
  taskController.updateTaskStatus
);

// Update task (all fields)
router.put(
  '/tasks/:taskId',
  taskController.updateTask
);

// Delete task
router.delete(
  '/tasks/:taskId',
  taskController.deleteTask
);

module.exports = router;
