import User from "../models/User.js";

const allowedThemes = ["light", "dark", "system"];
const hex = /^#[0-9a-fA-F]{6}$/;

export async function getAppearance(req, res) {
  const user = await User.findById(req.user._id).select("theme primaryColor sidebarColor compactMode");
  res.json({
    theme: user?.theme || "light",
    primaryColor: user?.primaryColor || "#3b82f6",
    sidebarColor: user?.sidebarColor || "#0f2747",
    compactMode: Boolean(user?.compactMode),
  });
}

export async function updateAppearance(req, res) {
  const { theme, primaryColor, sidebarColor, compactMode } = req.body;
  if (theme !== undefined && !allowedThemes.includes(theme)) return res.status(400).json({ message: "Invalid theme." });
  if (primaryColor !== undefined && !hex.test(primaryColor)) return res.status(400).json({ message: "Primary color must be a valid hex color." });
  if (sidebarColor !== undefined && !hex.test(sidebarColor)) return res.status(400).json({ message: "Sidebar color must be a valid hex color." });

  const user = await User.findById(req.user._id);
  if (!user) return res.status(404).json({ message: "User not found." });
  if (theme !== undefined) user.theme = theme;
  if (primaryColor !== undefined) user.primaryColor = primaryColor;
  if (sidebarColor !== undefined) user.sidebarColor = sidebarColor;
  if (compactMode !== undefined) user.compactMode = Boolean(compactMode);
  await user.save();
  res.json({
    theme: user.theme, primaryColor: user.primaryColor, sidebarColor: user.sidebarColor, compactMode: user.compactMode,
  });
}
