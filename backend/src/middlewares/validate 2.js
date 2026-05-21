export const validate = (schema, source = 'body') => (req, res, next) => {
  const result = schema.safeParse(req[source]);
  if (!result.success) {
    return res.status(400).json({ error: result.error.issues[0].message });
  }
  if (source === 'query') {
    Object.assign(req.query, result.data);
  } else {
    req[source] = result.data;
  }
  next();
};
