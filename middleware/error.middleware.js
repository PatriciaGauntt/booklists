export const errorHandler = (err, req, res, next) => {
  console.error(`Error was : ${err} and the stack was : ${err.stack}`);

  if (Array.isArray(err) && err[0].schemaPath) {
    res.status(400).json(err);
    next();
    return;
  }

  res.status(500).send('An error has occurred');
  next();
};
