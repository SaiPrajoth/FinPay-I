import jwt from 'jsonwebtoken';
import dotenv from "dotenv";
dotenv.config({ path: "../.env" });

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(403).json({
        success: false,
        message: "session expired, please try login"
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log(decoded)

    req.userId = decoded['userId'];
    next();
  } catch (error) {
    console.error('JWT verification failed:', error.message);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token, please login again"
    });
  }
};

export { authMiddleware };
