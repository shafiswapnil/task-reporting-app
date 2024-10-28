import createHttpError from 'http-errors';

const adminMiddleware = async (req, res, next) => {
    try {
        if (!req.user || !req.user.isAdmin) {
            throw createHttpError(403, 'Forbidden: Admin access required');
        }
        next();
    } catch (error) {
        next(error);
    }
};

export default adminMiddleware;
