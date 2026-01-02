import admin from "../config/firebase.js";
import { User } from "../models/index.js";

const authMiddleware = async (req, res, next) => {
  try {
    // 1. Read Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.debug("Auth middleware: missing or malformed Authorization header", {
        authorization: !!authHeader,
      });
      return res.status(401).json({
        message: "Authorization token missing",
      });
    }

    // 2. Extract token
    const token = authHeader.split(" ")[1];

    // 3. Verify token using Firebase Admin
    const decodedToken = await admin.auth().verifyIdToken(token);

    // Get user record from Firebase to get displayName
    const firebaseUser = await admin.auth().getUser(decodedToken.uid);

    console.log(firebaseUser)
    // 4. Find user in DB
    let user = await User.findOne({
      firebaseUid: decodedToken.uid,
    });

    // 5. Auto-create user if first login, or update name if it changed
    if (!user) {
      user = await User.create({
        firebaseUid: decodedToken.uid,
        email: decodedToken.email,
        name: firebaseUser.displayName || decodedToken.email.split("@")[0],
      });
    } else {
      // Always sync name from Firebase (in case it was updated)
      const firebaseName = firebaseUser.displayName || decodedToken.email.split("@")[0];
      if (user.name !== firebaseName) {
        user.name = firebaseName;
        await user.save();
      }
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
    console.error("Auth error:", error);

    return res.status(401).json({
      message: "Invalid or expired token",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

export default authMiddleware;
