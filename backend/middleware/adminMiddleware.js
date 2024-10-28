import createHttpError from 'http-errors';

const adminMiddleware = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        return next();
    }

    return next(createHttpError(403, 'Access denied. Admins only.'));
};

export default adminMiddleware;
