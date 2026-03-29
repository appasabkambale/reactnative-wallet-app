export const validateRequest = (schema) => (req, res, next) => {
  try {
    const parsedParams = schema.parse(req.body);
    req.body = parsedParams; 
    next();
  } catch (error) {
    return res.status(400).json({
      message: error.errors?.[0]?.message || "Validation failed",
      errors: error.errors?.map(e => ({ path: e.path.join('.'), message: e.message }))
    });
  }
};
