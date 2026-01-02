import admin from "../config/firebase.js";
import { User } from "../models/index.js";

const authMiddleware = async (req, res, next) => {
  try {
    // 1. Read Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Authorization token missing",
      });
    }

    // 2. Extract token
    const token = authHeader.split(" ")[1];

    // 3. Verify token using Firebase Admin
    const decodedToken = await admin.auth().verifyIdToken(token);

    // 4. Find user in DB
    let user = await User.findOne({
      firebaseUid: decodedToken.uid,
    });

    // 5. Auto-create user if first login
    if (!user) {
      user = await User.create({
        firebaseUid: decodedToken.uid,
        email: decodedToken.email,
        name: decodedToken.name || null,
      });
    }

    // 6. Attach DB user to request
    req.user = {
      id: user._id,
      firebaseUid: user.firebaseUid,
      email: user.email,
      name: user.name,
      role: user.role,
      teamId: user.teamId,
    };

    next();
  } catch (error) {
    console.error("Auth error:", error.message);

    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};

export default authMiddleware;
