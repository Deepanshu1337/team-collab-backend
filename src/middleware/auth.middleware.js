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

    let user =
      (await User.findOne({ firebaseUid: decoded.uid })) ||
      (await User.findOne({ email: decoded.email }));

    if (!user) {
      user = await User.create({
        firebaseUid: decoded.uid,
        email: decoded.email,
        name: firebaseUser.displayName || decoded.email.split("@")[0],
        role: "MEMBER",
        teamId: null,
      });
    } else {
      const name = firebaseUser.displayName || user.name;
      if (user.name !== name) {
        user.name = name;
        await user.save();
      }
      if (!user.firebaseUid) {
        user.firebaseUid = decoded.uid;
        await user.save();
      }
    }

    req.user = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      teamId: user.teamId ? user.teamId.toString() : null,
    };

    next();
  } catch (err) {
    console.error("Auth error", err);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

export default authMiddleware;
