import jwt from "jsonwebtoken";
import User from "../models/User.js";

export async function protect(req, res, next) {
    try {
        const auth = req.headers.authorization;
        if (!auth?.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Not authorised — no token" });
        }
        const token = auth.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select("-password");
        if (!user || !user.isActive) {
            return res.status(401).json({ message: "Not authorised — user not found or inactive" });
        }
        req.user = user;
        next();
    } catch (err) {
        return res.status(401).json({ message: "Not authorised — invalid token" });
    }
}

export function requireRole(...roles) {
    return (req, res, next) => {
        if (!roles.includes(req.user?.role)) {
            return res.status(403).json({ message: `Access denied — requires role: ${roles.join(" or ")}` });
        }
        next();
    };
}
