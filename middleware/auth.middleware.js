import jwt from "jsonwebtoken";

/**
 * Middleware to authenticate requests using a token.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {void}
 */
const auth = (req, res, next) => {
  try {
    let token = req.headers.authorization
    if(token) {
      token = token.split(" ")[1];
      const user = jwt.verify(token, process.env.JWT_SECRET);
      req.user = user.id;
      
    }
    else {
      res.status(401).json({ message: "Unauthorized" });
    }
    next();
  }
  catch (error) {
    res.status(401).json({ message: "Unauthorized" });
  }
};

export { auth };
