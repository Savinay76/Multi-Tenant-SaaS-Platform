const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');
const tenantIsolation = require('../middleware/tenantMiddleware');
const allowRoles = require('../middleware/rbacMiddleware');
const tenantController = require('../controllers/tenantCtrl');

router.use(authMiddleware);
router.use(tenantIsolation);


router.get('/:tenantId', tenantController.getTenant);


router.put(
    '/:tenantId',
    allowRoles('tenant_admin', 'super_admin'),
    tenantController.updateTenant
);


router.get(
    '/',
    allowRoles('super_admin'),
    tenantController.listTenants
);

module.exports = router;
