const AppError = require('../utils/AppError');
const roleMiddleware = (requiredRole) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(new AppError('Unauthorized', 401));
        }
        if (req.user.role !== requiredRole) {
            return next(new AppError('Forbidden', 403));
        }   
        next();
    };
};
module.exports = roleMiddleware;    
