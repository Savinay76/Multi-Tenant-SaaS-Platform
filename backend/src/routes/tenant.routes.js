const express = require('express');
const router = express.Router();

const tenantController = require('../controllers/tenant.controller');
const auth = require('../middleware/auth');

router.get('/:tenantId', auth, tenantController.getTenantDetails);

module.exports = router;
