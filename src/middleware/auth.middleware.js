// middleware/auth.middleware.js
import admin from "../config/firebase.js";
import User from "../models/User.model.js";

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authorization token missing" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = await admin.auth().verifyIdToken(token);
    const firebaseUser = await admin.auth().getUser(decoded.uid);

    let user = await User.findOne({ firebaseUid: decoded.uid });

    if (!user) {
      user = await User.create({
        firebaseUid: decoded.uid,
        email: decoded.email,
        name: firebaseUser.displayName || decoded.email.split("@")[0],
      });
    } else {
      const name = firebaseUser.displayName || user.name;
      if (user.name !== name) {
        user.name = name;
        await user.save();
      }
    }

    req.user = {
      id: user._id,
      email: user.email,
      name: user.name,
    };

    next();
  } catch (err) {
    console.error("Auth error", err);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

export default authMiddleware;
 