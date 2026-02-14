const { verifyToken } = require("../utils/jwt");

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            sucess: false,
            message: "Authorization",
        });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = verifyToken(token);
        req.user = decoded;
        next();
    } catch (e) {
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token',
        });
    }
}

module.exports = authMiddleware;