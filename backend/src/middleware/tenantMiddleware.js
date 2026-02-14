const tenantIsolation = (req, res, next) => {
  const { tenantId, role } = req.user;

 
  if (role === 'super_admin') {
    req.tenant = {
      tenantId: null,
      isSuperAdmin: true,
    };
    return next();
  }

 
  if (!tenantId) {
    return res.status(403).json({
      success: false,
      message: 'Tenant context missing',
    });
  }

  req.tenant = {
    tenantId,
    isSuperAdmin: false,
  };

  next();
};

module.exports = tenantIsolation;
