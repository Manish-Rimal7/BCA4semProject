const validator = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);

    if (error) {
      return res.status(400).json({
        msg: "validation error",
      });
    }

    next();
  };
};

export default validator;
