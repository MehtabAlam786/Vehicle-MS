import { useEffect, useState } from "react";
import {
  getDashboard,
  createVehicle,
  updateVehicle,
  updateVehicleKm,
  deleteVehicle,
  createFuel,
  deleteFuel,
  createMaintenance,
  deleteMaintenance,
  createDriver,
  updateDriver,
  deleteDriver,
  assignVehicle,
  getReportOverview,
  getReportFuel,
  getReportMaintenance,
  getReminders,
  createReminder,
  updateReminder,
  deleteReminder,
  completeReminder,
  snoozeReminder,
  syncReminders,
  getSettings,
  updateSettings,
  getSystemInfo,
  clearCollection,
  authLogin,
  authAdminLogin,
  authAdminVerify,
  authAdminSetup,
  getUsers,
  updateUser,
  getRoleRequests,
  reviewRoleRequest,
  getAppearance,
  updateAppearance,
  authRegister,
  authGetMe,
  authUpdateMe,
  authForgotPassword,
  authVerifyOTP,
  authResetPassword,
  authChangePassword,
} from "./api";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Filler,
} from "chart.js";
import { Doughnut, Bar, Line } from "react-chartjs-2";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Filler,
);

/* ---- simple inline icons: lightweight, consistent, no emoji UI dependency ---- */
function Icon({ name, size = 18, strokeWidth = 1.9 }) {
  const paths = {
    dashboard: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </>
    ),
    vehicle: (
      <>
        <path d="M5 16h14l-1.3-6H6.3L5 16Z" />
        <path d="M7 10 8.7 6h6.6l1.7 4" />
        <circle cx="8" cy="17.5" r="1.4" />
        <circle cx="16" cy="17.5" r="1.4" />
      </>
    ),
    fuel: (
      <>
        <path d="M7 20V5a2 2 0 0 1 2-2h5v17" />
        <path d="M7 7h7" />
        <path d="M14 7h2l3 3v7a2 2 0 0 1-4 0v-4h2" />
      </>
    ),
    wrench: (
      <>
        <path d="M14.7 6.3a4 4 0 0 0-5.1 5.1L4 17a2.1 2.1 0 1 0 3 3l5.6-5.6a4 4 0 0 0 5.1-5.1l-2.4 2.4-2.1-.6-.6-2.1 2.4-2.4Z" />
      </>
    ),
    users: (
      <>
        <path d="M16 20v-1.8a3.2 3.2 0 0 0-3.2-3.2H7.2A3.2 3.2 0 0 0 4 18.2V20" />
        <circle cx="10" cy="8" r="3" />
        <path d="M17 11a3 3 0 0 0 0-6" />
        <path d="M20 20v-1.6a3.2 3.2 0 0 0-2.3-3.1" />
      </>
    ),
    chart: (
      <>
        <path d="M4 19V5" />
        <path d="M4 19h16" />
        <path d="m7 15 3-4 3 2 5-6" />
      </>
    ),
    bell: (
      <>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
        <path d="M10 21h4" />
      </>
    ),
    settings: (
      <>
        <path d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z" />
        <path
          d="m19.4 15 .1.1a2 2 0 0 1-2.8 2.8l-.1-.1a2 2 0 0 0-3.4 1.4v.2a2 2 0 0 1-4 0v-.2a2 2 0 0 0-3.4-1.4l-.1.1A2 2 0 0 1 3 15.1l.1-.1A2 2 0 0 0 4.5 11H4.3a2 2 0 0 1 0-4h.2a2 2 0 0 0 1.4-3.4l-.1-.1A2 2 0 0 1 8.6.7l.1.1a2 2 0 0 0 3.4-1.4v-.2a2 2 0 0 1 4 0v.2a2 2 0 0 0 3.4 1.4l.1-.1a2 2 0 0 1 2.8 2.8l-.1.1A2 2 0 0 0 21.7 7h.2a2 2 0 0 1 0 4h-.2a2 2 0 0 0-2.3 4Z"
          transform="scale(.85) translate(2.1 2.1)"
        />
      </>
    ),
    palette: (
      <>
        <path d="M12 3a9 9 0 1 0 0 18h1.2a1.8 1.8 0 0 0 0-3.6H12a1.7 1.7 0 0 1 0-3.4h2.5A6.5 6.5 0 0 0 21 7.5 9 9 0 0 0 12 3Z" />
        <circle cx="7.5" cy="9" r="1" />
        <circle cx="10" cy="6.5" r="1" />
        <circle cx="14" cy="6.5" r="1" />
      </>
    ),
    audit: (
      <>
        <path d="M7 3h10v18H7z" />
        <path d="M9.5 7h5M9.5 11h5M9.5 15h3" />
      </>
    ),
    logout: (
      <>
        <path d="M10 5H5v14h5" />
        <path d="m14 8 4 4-4 4" />
        <path d="M18 12H9" />
      </>
    ),
    menu: (
      <>
        <path d="M4 7h16M4 12h16M4 17h16" />
      </>
    ),
    search: (
      <>
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="m16 16 5 5" />
      </>
    ),
    sun: (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </>
    ),
    moon: (
      <path d="M20.5 14.2A8.5 8.5 0 0 1 9.8 3.5 8.5 8.5 0 1 0 20.5 14.2Z" />
    ),
    filter: (
      <>
        <path d="M4 6h16M7 12h10M10 18h4" />
      </>
    ),
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M16 3v4M8 3v4M3 10h18" />
      </>
    ),
    alert: (
      <>
        <path d="m12 3 9 16H3L12 3Z" />
        <path d="M12 9v4M12 17h.01" />
      </>
    ),
    plus: (
      <>
        <path d="M12 5v14M5 12h14" />
      </>
    ),
  };
  return (
    <svg
      className="ui-icon"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name] || paths.dashboard}
    </svg>
  );
}

/* ---- helpers ---- */
const money = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
const dateText = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

function serviceState(v) {
  const rem = (v.nextServiceKm || 0) - (v.currentKm || 0);
  if (rem <= 0)
    return {
      label: `Overdue by ${Math.abs(rem).toLocaleString()} KM`,
      cls: "danger",
      icon: "🔴",
    };
  if (rem <= 500)
    return {
      label: `Due in ${rem.toLocaleString()} KM`,
      cls: "warning",
      icon: "🟡",
    };
  return { label: `Due in ${rem.toLocaleString()} KM`, cls: "ok", icon: "🟢" };
}

function statusClass(status = "") {
  const map = {
    active: "status-active",
    inactive: "status-inactive",
    "in service": "status-in-service",
    completed: "status-completed",
    pending: "status-pending",
    "in progress": "status-in-progress",
  };
  return map[status.toLowerCase()] || "status-active";
}

/* ================================================================
   APP ROOT — Auth gate
   ================================================================ */
export default function App() {
  const [authUser, setAuthUser] = useState(null); // null = not checked, false = logged out
  const [authReady, setAuthReady] = useState(false);

  /* Restore session from localStorage on mount */
  useEffect(() => {
    const token = localStorage.getItem("vms_token");
    const userJson = localStorage.getItem("vms_user");
    if (token && userJson) {
      try {
        setAuthUser(JSON.parse(userJson));
        /* Verify token is still valid with server */
        authGetMe()
          .then((res) => {
            setAuthUser(res.data.user);
            localStorage.setItem("vms_user", JSON.stringify(res.data.user));
          })
          .catch(() => {
            handleLogout();
          })
          .finally(() => setAuthReady(true));
      } catch {
        handleLogout();
        setAuthReady(true);
      }
    } else {
      setAuthReady(true);
    }
  }, []); // eslint-disable-line

  function handleAuthSuccess(user, token) {
    localStorage.setItem("vms_token", token);
    localStorage.setItem("vms_user", JSON.stringify(user));
    setAuthUser(user);
  }

  function handleLogout() {
    localStorage.removeItem("vms_token");
    localStorage.removeItem("vms_user");
    setAuthUser(null);
  }

  if (!authReady) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p>Loading Vehicle Management System…</p>
      </div>
    );
  }

  if (!authUser) {
    if (window.location.pathname === "/admin/setup") return <AdminSetupPage />;
    if (window.location.pathname.startsWith("/admin"))
      return <AdminAuthPage onAuth={handleAuthSuccess} />;
    return <AuthPage onAuth={handleAuthSuccess} />;
  }

  return (
    <AppShell
      authUser={authUser}
      onLogout={handleLogout}
      setAuthUser={setAuthUser}
    />
  );
}

/* ================================================================
   APP SHELL — full dashboard (shown after login)
   ================================================================ */
function AppShell({ authUser, onLogout, setAuthUser }) {
  const [data, setData] = useState(null);
  const [section, setSection] = useState("dashboard");
  const [modal, setModal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState("");
  const [appearance, setAppearance] = useState({
    theme: "light",
    primaryColor: "#3b82f6",
    sidebarColor: "#0f2747",
    compactMode: false,
  });

  async function load() {
    try {
      setLoading(true);
      setError("");
      const [dashRes, settingsRes, appearanceRes] = await Promise.all([
        getDashboard(),
        getSettings(),
        getAppearance(),
      ]);
      setData({
        ...dashRes.data,
        profileName: settingsRes.data.profile_name || "Mehtab Alam",
        profileRole:
          authUser?.role || settingsRes.data.profile_role || "Viewer",
        profileEmail: settingsRes.data.profile_email || "",
        profilePhone: settingsRes.data.profile_phone || "",
        companyName: settingsRes.data.company_name || "VehicleMS",
      });
      setAppearance(appearanceRes.data || {});
    } catch {
      setError(
        "Could not connect to the backend. Make sure MongoDB & the server are running.",
      );
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, []);

  const stats = data?.stats || {};
  const vehicles = data?.vehicles || [];
  const fuel = data?.recentFuel || [];
  const maintenance = data?.recentMaintenance || [];
  const alerts = data?.serviceAlerts || [];
  const drivers = data?.drivers || [];

  /* chart data */
  const statusChart = {
    labels: ["Active", "Inactive", "In Service"],
    datasets: [
      {
        data: [
          stats.activeVehicles || 0,
          stats.inactiveVehicles || 0,
          stats.inServiceVehicles || 0,
        ],
        backgroundColor: ["#22c55e", "#ef4444", "#f59e0b"],
        borderWidth: 0,
      },
    ],
  };
  const costChart = {
    labels: ["Wk 1", "Wk 2", "Wk 3", "Wk 4", "Wk 5"],
    datasets: [
      {
        label: "Fuel",
        data: [18, 20, 21, 19, 22].map(
          (x) => ((stats.totalFuelCost || 0) * x) / 100,
        ),
        backgroundColor: "#4f6ef7",
        borderRadius: 6,
      },
      {
        label: "Maintenance",
        data: [16, 20, 22, 18, 24].map(
          (x) => ((stats.totalMaintenanceCost || 0) * x) / 100,
        ),
        backgroundColor: "#22c55e",
        borderRadius: 6,
      },
    ],
  };

  const role = authUser?.role || "Viewer";
  const canManage = role === "Admin" || role === "Manager";
  const canOperate = canManage || role === "Supervisor" || role === "Driver";
  const isAdmin = role === "Admin";
  const ROLE_ACCESS = {
    Admin: [
      "dashboard",
      "vehicles",
      "fuel",
      "maintenance",
      "drivers",
      "reports",
      "reminders",
      "users",
      "roleRequests",
      "settings",
      "appearance",
      "profile",
      "audit",
    ],
    Manager: [
      "dashboard",
      "vehicles",
      "fuel",
      "maintenance",
      "drivers",
      "reports",
      "reminders",
      "appearance",
      "profile",
    ],
    Supervisor: [
      "dashboard",
      "vehicles",
      "fuel",
      "maintenance",
      "drivers",
      "reports",
      "reminders",
      "appearance",
      "profile",
    ],
    Driver: [
      "dashboard",
      "myVehicle",
      "fuel",
      "maintenance",
      "reports",
      "appearance",
      "profile",
    ],
    Viewer: ["dashboard", "vehicles", "reports", "appearance", "profile"],
  };
  const nav = [
    { id: "dashboard", icon: "dashboard", label: "Dashboard" },
    { id: "vehicles", icon: "vehicle", label: "Vehicles" },
    { id: "myVehicle", icon: "vehicle", label: "My Vehicle" },
    { id: "fuel", icon: "fuel", label: "Fuel" },
    { id: "maintenance", icon: "wrench", label: "Maintenance" },
    { id: "drivers", icon: "users", label: "Drivers" },
    { id: "reports", icon: "chart", label: "Reports" },
    { id: "reminders", icon: "bell", label: "Reminders" },
    { id: "users", icon: "users", label: "Users" },
    { id: "roleRequests", icon: "bell", label: "Role Requests" },
    { id: "settings", icon: "settings", label: "Settings" },
    { id: "appearance", icon: "palette", label: "Appearance" },
    { id: "audit", icon: "audit", label: "Audit Logs" },
    { id: "profile", icon: "users", label: "Profile" },
  ].filter((item) => ROLE_ACCESS[role]?.includes(item.id));

  function navigate(id) {
    setSection(id);
    setSidebarOpen(false);
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p>Loading Vehicle Management System…</p>
      </div>
    );
  }

  const pageTitle =
    section === "profile"
      ? "My Profile"
      : nav.find((n) => n.id === section)?.label || "Dashboard";

  return (
    <div
      className={`app ${appearance.compactMode ? "compact" : ""}`}
      data-theme={appearance.theme === "system" ? "light" : appearance.theme}
      style={{
        "--primary": appearance.primaryColor || "#3b82f6",
        "--primary-hover": appearance.primaryColor || "#2563eb",
        "--sidebar-bg": appearance.sidebarColor || "#0f2747",
      }}
    >
      {/* Overlay for mobile sidebar */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? "show" : ""}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* ---- Sidebar ---- */}
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="brand">
          <div className="brand-icon">
            <Icon name="vehicle" size={19} />
          </div>
          <div className="brand-text">
            <b>VehicleMS</b>
            <span>Management System</span>
          </div>
        </div>

        <nav>
          <div className="nav-label">Main Menu</div>
          {nav.slice(0, 4).map(({ id, icon, label }) => (
            <button
              key={id}
              className={`nav-item ${section === id ? "active" : ""}`}
              onClick={() => navigate(id)}
            >
              <span className="nav-icon">
                <Icon name={icon} size={17} />
              </span>
              {label}
            </button>
          ))}
          <div className="nav-label">More</div>
          {nav.slice(4).map(({ id, icon, label }) => (
            <button
              key={id}
              className={`nav-item ${section === id ? "active" : ""}`}
              onClick={() => navigate(id)}
            >
              <span className="nav-icon">
                <Icon name={icon} size={17} />
              </span>
              {label}
            </button>
          ))}
        </nav>

        <div className="side-bottom">
          <button className="nav-item" onClick={() => navigate("profile")}>
            <span className="nav-icon">
              <Icon name="users" size={17} />
            </span>
            Profile
          </button>
          <button
            className="nav-item"
            onClick={onLogout}
            style={{ color: "#f87171" }}
          >
            <span className="nav-icon">
              <Icon name="logout" size={17} />
            </span>
            Logout
          </button>
        </div>

        <div className="side-card">
          <div className="side-car">Fleet</div>
          <div className="side-card-row">
            <div>
              <small>Total Vehicles</small>
              <strong>{stats.totalVehicles ?? "—"}</strong>
            </div>
            <div>
              <small>Active</small>
              <strong>{stats.activeVehicles ?? "—"}</strong>
            </div>
          </div>
        </div>
      </aside>

      {/* ---- Main ---- */}
      <main className="main">
        {/* Topbar */}
        <header className="topbar">
          <button
            className="hamb"
            onClick={() => setSidebarOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            <Icon name="menu" size={20} />
          </button>
          <div className="global-search">
            <Icon name="search" size={17} />
            <input
              aria-label="Search"
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const q = globalSearch.trim().toLowerCase();
                  const match = nav.find((n) =>
                    n.label.toLowerCase().includes(q),
                  );
                  if (match) {
                    navigate(match.id);
                    setGlobalSearch("");
                  }
                }
              }}
              placeholder="Search vehicles, drivers, fuel, maintenance…"
            />
          </div>
          <h1>{pageTitle}</h1>
          <div className="top-right">
            <button
              className="notif-btn"
              aria-label="Notifications"
              onClick={() => navigate("reminders")}
            >
              <Icon name="bell" size={18} />
              {alerts.length > 0 && (
                <span className="badge">{alerts.length}</span>
              )}
            </button>
            <div
              className="user-chip"
              onClick={() => navigate("profile")}
              style={{ cursor: "pointer" }}
            >
              <div className="avatar">
                {(authUser?.name || data?.profileName || "U")
                  .charAt(0)
                  .toUpperCase()}
              </div>
              <div>
                <div className="user-name">
                  {authUser?.name || data?.profileName || "User"}
                </div>
                <div className="user-role">
                  {authUser?.role || data?.profileRole || "Admin"}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Error Banner */}
        {error && <div className="error">! {error}</div>}

        {/* Sections */}
        {section === "dashboard" && (
          <Dashboard
            stats={stats}
            statusChart={statusChart}
            costChart={costChart}
            alerts={alerts}
            fuel={fuel}
            maintenance={maintenance}
            drivers={drivers}
            setSection={setSection}
          />
        )}
        {section === "vehicles" && role !== "Driver" && (
          <Vehicles
            vehicles={vehicles}
            setModal={setModal}
            reload={load}
            canManage={canManage}
          />
        )}
        {section === "myVehicle" && role === "Driver" && (
          <DriverWorkspace
            vehicles={vehicles}
            fuel={fuel}
            maintenance={maintenance}
            alerts={alerts}
          />
        )}
        {section === "fuel" && (
          <Fuel
            fuel={fuel}
            vehicles={vehicles}
            setModal={setModal}
            reload={load}
            canManage={canManage}
            canAdd={canOperate}
          />
        )}
        {section === "maintenance" && (
          <Maintenance
            maintenance={maintenance}
            vehicles={vehicles}
            setModal={setModal}
            reload={load}
            canManage={canManage}
            canAdd={canOperate}
          />
        )}
        {section === "drivers" && (
          <Drivers
            drivers={drivers}
            vehicles={vehicles}
            setModal={setModal}
            reload={load}
            canManage={canManage}
          />
        )}
        {section === "reports" && <Reports vehicles={vehicles} />}
        {section === "reminders" && (
          <Reminders
            vehicles={vehicles}
            drivers={drivers}
            alerts={alerts}
            canManage={canManage}
          />
        )}
        {section === "users" && isAdmin && <UsersSection />}
        {section === "roleRequests" && isAdmin && <RoleRequestsSection />}
        {section === "settings" && isAdmin && (
          <SettingsSection stats={stats} reload={load} />
        )}
        {section === "appearance" && (
          <AppearanceSection
            appearance={appearance}
            setAppearance={setAppearance}
          />
        )}
        {section === "audit" && isAdmin && <AuditSection />}
        {section === "profile" && (
          <ProfileSection
            data={data}
            stats={stats}
            reload={load}
            navigate={navigate}
            authUser={authUser}
            setAuthUser={setAuthUser}
          />
        )}

        {modal && (
          <Modal
            type={modal.type}
            item={modal.item}
            vehicles={vehicles}
            close={() => setModal(null)}
            reload={load}
          />
        )}
      </main>
    </div>
  );
}

/* ================================================================
   AUTH PAGE  —  Login / Signup / Forgot Password (3 steps)
   ================================================================ */

const AUTH_FEATURES = [
  {
    icon: "VM",
    title: "Fleet Management",
    desc: "Track all vehicles, fuel & maintenance in one place",
  },
  {
    icon: "○",
    title: "Driver Management",
    desc: "Manage driver profiles, licenses and assignments",
  },
  {
    icon: "📊",
    title: "Reports & Analytics",
    desc: "Visual insights on costs, trips and fleet health",
  },
  {
    icon: "🔔",
    title: "Smart Reminders",
    desc: "Auto-alerts for service due, license expiry & more",
  },
];

/* ── Password strength helper ── */
function calcStrength(p) {
  if (!p) return 0;
  let s = 0;
  if (p.length >= 6) s++;
  if (p.length >= 10) s++;
  if (/[A-Z]/.test(p) && /[0-9]/.test(p)) s++;
  if (/[^A-Za-z0-9]/.test(p)) s++;
  return s;
}
const STR_LABEL = ["", "Weak", "Fair", "Good", "Strong"];
const STR_CLS = ["", "weak", "fair", "good", "strong"];

function AuthPage({ onAuth }) {
  /* "login" | "signup" | "forgot-1" | "forgot-2" | "forgot-3" */
  const [mode, setMode] = useState("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [showPwd2, setShowPwd2] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showCnf, setShowCnf] = useState(false);

  /* Login */
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  /* Signup */
  const [signForm, setSignForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
    phone: "",
    requestedRole: "Viewer",
  });
  /* Forgot step-1 */
  const [fgEmail, setFgEmail] = useState("");
  /* Forgot step-2 */
  const [fgOtp, setFgOtp] = useState("");
  const [fgOtpDisplay, setFgOtpDisplay] = useState(""); // shown on screen (dev mode)
  const [fgResetToken, setFgResetToken] = useState("");
  const [fgUserName, setFgUserName] = useState("");
  /* Forgot step-3 */
  const [fgNewPwd, setFgNewPwd] = useState("");
  const [fgCnfPwd, setFgCnfPwd] = useState("");
  /* OTP timer */
  const [otpTimer, setOtpTimer] = useState(0);

  const setL = (k, v) => setLoginForm((f) => ({ ...f, [k]: v }));
  const setS = (k, v) => setSignForm((f) => ({ ...f, [k]: v }));

  const strength = calcStrength(signForm.password);
  const newStrength = calcStrength(fgNewPwd);

  /* countdown for OTP */
  useEffect(() => {
    if (otpTimer <= 0) return;
    const id = setTimeout(() => setOtpTimer((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [otpTimer]);

  function switchMode(m) {
    setMode(m);
    setError("");
  }

  /* ── Login ── */
  async function handleLogin(e) {
    e.preventDefault();
    if (!loginForm.email || !loginForm.password) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await authLogin({
        email: loginForm.email,
        password: loginForm.password,
      });
      onAuth(res.data.user, res.data.token);
    } catch (err) {
      setError(
        err.response?.data?.message || "Login failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  /* ── Signup ── */
  async function handleSignup(e) {
    e.preventDefault();
    if (!signForm.name || !signForm.email || !signForm.password) {
      setError("Name, email and password are required.");
      return;
    }
    if (signForm.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (signForm.password !== signForm.confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await authRegister({
        name: signForm.name,
        email: signForm.email,
        password: signForm.password,
        phone: signForm.phone,
        requestedRole: signForm.requestedRole,
      });
      if (res.data.pendingApproval) {
        setError("__success__" + res.data.message);
        setMode("login");
        return;
      }
      onAuth(res.data.user, res.data.token);
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  /* ── Forgot Step 1: Request OTP ── */
  async function handleForgotRequest(e) {
    e.preventDefault();
    if (!fgEmail.trim()) {
      setError("Please enter your email address.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await authForgotPassword({ email: fgEmail.trim() });
      setFgOtpDisplay(res.data.otp); // display in UI (dev mode — no email server)
      setFgUserName(res.data.name || "");
      setOtpTimer(900); // 15 min countdown
      switchMode("forgot-2");
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to send OTP. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  /* ── Forgot Step 2: Verify OTP ── */
  async function handleVerifyOTP(e) {
    e.preventDefault();
    if (!fgOtp.trim()) {
      setError("Please enter the OTP.");
      return;
    }
    if (fgOtp.trim().length !== 6) {
      setError("OTP must be 6 digits.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await authVerifyOTP({
        email: fgEmail.trim(),
        otp: fgOtp.trim(),
      });
      setFgResetToken(res.data.resetToken);
      switchMode("forgot-3");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  /* ── Forgot Step 3: Reset Password ── */
  async function handleResetPassword(e) {
    e.preventDefault();
    if (!fgNewPwd) {
      setError("Please enter a new password.");
      return;
    }
    if (fgNewPwd.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (fgNewPwd !== fgCnfPwd) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await authResetPassword({
        resetToken: fgResetToken,
        newPassword: fgNewPwd,
      });
      /* Auto-fill login and redirect */
      setLoginForm((f) => ({ ...f, email: fgEmail }));
      setFgEmail("");
      setFgOtp("");
      setFgOtpDisplay("");
      setFgResetToken("");
      setFgNewPwd("");
      setFgCnfPwd("");
      switchMode("login");
      /* Small success flash — keep error as success msg */
      setError(
        "__success__Password reset successfully! Please sign in with your new password.",
      );
    } catch (err) {
      setError(
        err.response?.data?.message || "Reset failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  /* Resend OTP */
  async function handleResendOTP() {
    if (otpTimer > 0) return;
    setLoading(true);
    setError("");
    try {
      const res = await authForgotPassword({ email: fgEmail.trim() });
      setFgOtpDisplay(res.data.otp);
      setFgOtp("");
      setOtpTimer(900);
    } catch (err) {
      setError(err.response?.data?.message || "Resend failed.");
    } finally {
      setLoading(false);
    }
  }

  /* Format timer */
  const timerFmt = `${String(Math.floor(otpTimer / 60)).padStart(2, "0")}:${String(otpTimer % 60).padStart(2, "0")}`;

  /* Success / error parsing */
  const isSuccess = error.startsWith("__success__");
  const errorMsg = isSuccess ? error.replace("__success__", "") : error;

  /* Left panel heading changes per mode */
  const leftHeading =
    {
      login: {
        h: (
          <>
            Manage your entire fleet
            <br />
            <span className="auth-headline-accent">smarter and faster</span>
          </>
        ),
        p: "All-in-one platform to track vehicles, drivers, fuel, maintenance and get powerful analytics.",
      },
      signup: {
        h: (
          <>
            Join thousands of
            <br />
            <span className="auth-headline-accent">fleet managers</span>
          </>
        ),
        p: "Create your account and get full access to the Vehicle Management System in seconds.",
      },
      "forgot-1": {
        h: (
          <>
            Forgot your
            <br />
            <span className="auth-headline-accent">password?</span>
          </>
        ),
        p: "No worries. Enter your registered email and we'll send you a one-time code to reset your password.",
      },
      "forgot-2": {
        h: (
          <>
            Check your
            <br />
            <span className="auth-headline-accent">OTP code</span>
          </>
        ),
        p: "Enter the 6-digit code generated for your account. It expires in 15 minutes.",
      },
      "forgot-3": {
        h: (
          <>
            Create a new
            <br />
            <span className="auth-headline-accent">password</span>
          </>
        ),
        p: "Choose a strong password. Use at least 6 characters with letters, numbers and symbols.",
      },
    }[mode] || {};

  return (
    <div className="auth-root">
      {/* ══ LEFT PANEL ══ */}
      <div className="auth-left">
        <div className="auth-left-inner">
          <div className="auth-brand">
            <div className="auth-brand-icon">▰</div>
            <div>
              <div className="auth-brand-name">VehicleMS</div>
              <div className="auth-brand-sub">Management System</div>
            </div>
          </div>

          <h1 className="auth-headline">{leftHeading.h}</h1>
          <p className="auth-tagline">{leftHeading.p}</p>

          {(mode === "login" || mode === "signup") && (
            <>
              <div className="auth-features">
                {AUTH_FEATURES.map((f) => (
                  <div className="auth-feature" key={f.title}>
                    <div className="auth-feature-icon">{f.icon}</div>
                    <div>
                      <div className="auth-feature-title">{f.title}</div>
                      <div className="auth-feature-desc">{f.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="auth-stats">
                {[
                  ["10K+", "Vehicles Tracked"],
                  ["500+", "Companies"],
                  ["99.9%", "Uptime"],
                  ["24/7", "Support"],
                ].map(([v, l]) => (
                  <div className="auth-stat" key={l}>
                    <div className="auth-stat-val">{v}</div>
                    <div className="auth-stat-lbl">{l}</div>
                  </div>
                ))}
              </div>
            </>
          )}

          {mode.startsWith("forgot") && (
            <div className="auth-fg-steps">
              {[
                {
                  n: 1,
                  label: "Enter Email",
                  done: mode === "forgot-2" || mode === "forgot-3",
                },
                { n: 2, label: "Verify OTP", done: mode === "forgot-3" },
                { n: 3, label: "New Password", done: false },
              ].map((s, i) => (
                <div
                  key={s.n}
                  className={`auth-fg-step ${mode === `forgot-${s.n}` ? "current" : ""} ${s.done ? "done" : ""}`}
                >
                  <div className="auth-fg-step-num">{s.done ? "✓" : s.n}</div>
                  <div className="auth-fg-step-label">{s.label}</div>
                  {i < 2 && <div className="auth-fg-step-line" />}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="auth-orb auth-orb1" />
        <div className="auth-orb auth-orb2" />
      </div>

      {/* ══ RIGHT PANEL ══ */}
      <div className="auth-right">
        <div className="auth-card">
          {/* ── Mode toggle (only for login/signup) ── */}
          {(mode === "login" || mode === "signup") && (
            <div className="auth-toggle">
              <button
                className={`auth-toggle-btn ${mode === "login" ? "active" : ""}`}
                onClick={() => switchMode("login")}
              >
                Sign In
              </button>
              <button
                className={`auth-toggle-btn ${mode === "signup" ? "active" : ""}`}
                onClick={() => switchMode("signup")}
              >
                Create Account
              </button>
            </div>
          )}

          {/* ── Back button (for forgot steps) ── */}
          {mode.startsWith("forgot") && (
            <button
              className="auth-back-btn"
              onClick={() =>
                switchMode(
                  mode === "forgot-1"
                    ? "login"
                    : mode === "forgot-2"
                      ? "forgot-1"
                      : "forgot-2",
                )
              }
            >
              ← Back
            </button>
          )}

          {/* ── Card heading ── */}
          <div className="auth-card-head">
            <h2>
              {mode === "login"
                ? "Welcome back!"
                : mode === "signup"
                  ? "Create your account"
                  : mode === "forgot-1"
                    ? "Reset your password"
                    : mode === "forgot-2"
                      ? "Enter OTP"
                      : "Set new password"}
            </h2>
            <p>
              {mode === "login"
                ? "Sign in to access your fleet dashboard"
                : mode === "signup"
                  ? "Get started with VehicleMS for free"
                  : mode === "forgot-1"
                    ? "We'll send a one-time code to your email"
                    : mode === "forgot-2"
                      ? `Code sent for ${fgEmail}`
                      : "Choose a strong new password"}
            </p>
          </div>

          {/* ── Error / Success banner ── */}
          {error && (
            <div className={isSuccess ? "auth-success" : "auth-error"}>
              <span>{isSuccess ? "✅" : "!"}</span> {errorMsg}
            </div>
          )}

          {/* ════════════════════════
              LOGIN FORM
              ════════════════════════ */}
          {mode === "login" && (
            <form className="auth-form" onSubmit={handleLogin} noValidate>
              <div className="auth-field">
                <label>Email Address</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon">@</span>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={loginForm.email}
                    onChange={(e) => setL("email", e.target.value)}
                    autoComplete="email"
                    autoFocus
                  />
                </div>
              </div>

              <div className="auth-field">
                <div className="auth-field-row">
                  <label>Password</label>
                  <button
                    type="button"
                    className="auth-forgot"
                    onClick={() => {
                      setFgEmail(loginForm.email);
                      switchMode("forgot-1");
                    }}
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon">•</span>
                  <input
                    type={showPwd ? "text" : "password"}
                    placeholder="••••••••"
                    value={loginForm.password}
                    onChange={(e) => setL("password", e.target.value)}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="auth-eye"
                    onClick={() => setShowPwd((p) => !p)}
                  >
                    {showPwd ? (
                      <i class="fa-solid fa-eye-slash"></i>
                    ) : (
                      <i class="fa-regular fa-eye"></i>
                    )}
                  </button>
                </div>
              </div>

              <button type="submit" className="auth-submit" disabled={loading}>
                {loading ? (
                  <>
                    <span className="auth-spinner" />
                    Signing in…
                  </>
                ) : (
                  "Sign In →"
                )}
              </button>

              <div className="auth-demo-hint">
                <span>•</span>
                <span>
                  Need administrator access?{" "}
                  <button
                    type="button"
                    className="auth-inline-link"
                    onClick={() => {
                      window.location.href = "/admin/login";
                    }}
                  >
                    Open Admin Portal
                  </button>
                </span>
              </div>
            </form>
          )}

          {/* ════════════════════════
              SIGNUP FORM
              ════════════════════════ */}
          {mode === "signup" && (
            <form className="auth-form" onSubmit={handleSignup} noValidate>
              <div className="auth-form-grid">
                <div className="auth-field">
                  <label>Full Name</label>
                  <div className="auth-input-wrap">
                    <span className="auth-input-icon">○</span>
                    <input
                      type="text"
                      placeholder="Your full name"
                      value={signForm.name}
                      onChange={(e) => setS("name", e.target.value)}
                      autoFocus
                    />
                  </div>
                </div>
                <div className="auth-field">
                  <label>Phone (optional)</label>
                  <div className="auth-input-wrap">
                    <span className="auth-input-icon">+</span>
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={signForm.phone}
                      onChange={(e) => setS("phone", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="auth-field">
                <label>Email Address</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon">@</span>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={signForm.email}
                    onChange={(e) => setS("email", e.target.value)}
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="auth-form-grid">
                <div className="auth-field">
                  <label>Password</label>
                  <div className="auth-input-wrap">
                    <span className="auth-input-icon">•</span>
                    <input
                      type={showPwd ? "text" : "password"}
                      placeholder="Min. 6 characters"
                      value={signForm.password}
                      onChange={(e) => setS("password", e.target.value)}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className="auth-eye"
                      onClick={() => setShowPwd((p) => !p)}
                    >
                      {showPwd ? (
                        <i class="fa-solid fa-eye-slash"></i>
                      ) : (
                        <i class="fa-regular fa-eye"></i>
                      )}
                    </button>
                  </div>
                  {signForm.password && (
                    <div className="auth-strength">
                      <div className="auth-strength-bar">
                        {[1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            className={`auth-strength-seg ${strength >= i ? STR_CLS[strength] : ""}`}
                          />
                        ))}
                      </div>
                      <span
                        className={`auth-strength-label ${STR_CLS[strength]}`}
                      >
                        {STR_LABEL[strength]}
                      </span>
                    </div>
                  )}
                </div>
                <div className="auth-field">
                  <label>Confirm Password</label>
                  <div className="auth-input-wrap">
                    <span className="auth-input-icon">•</span>
                    <input
                      type={showPwd2 ? "text" : "password"}
                      placeholder="Repeat password"
                      value={signForm.confirm}
                      onChange={(e) => setS("confirm", e.target.value)}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className="auth-eye"
                      onClick={() => setShowPwd2((p) => !p)}
                    >
                      {showPwd2 ? (
                        <i class="fa-solid fa-eye-slash"></i>
                      ) : (
                        <i class="fa-regular fa-eye"></i>
                      )}
                    </button>
                  </div>
                  {signForm.confirm &&
                    signForm.password !== signForm.confirm && (
                      <span className="auth-field-err">
                        Passwords do not match
                      </span>
                    )}
                </div>
              </div>

              <div className="auth-field">
                <label>Access role</label>
                <select
                  value={signForm.requestedRole}
                  onChange={(e) => setS("requestedRole", e.target.value)}
                >
                  <option value="Viewer">Viewer — instant access</option>
                  <option value="Driver">Driver — admin approval</option>
                  <option value="Supervisor">
                    Supervisor — admin approval
                  </option>
                  <option value="Manager">Manager — admin approval</option>
                </select>
                <span className="auth-hint">
                  Admin access is available only through the secure Admin
                  Portal.
                </span>
              </div>

              <button type="submit" className="auth-submit" disabled={loading}>
                {loading ? (
                  <>
                    <span className="auth-spinner" />
                    Creating account…
                  </>
                ) : (
                  "Create Account →"
                )}
              </button>
              <p className="auth-terms">
                By creating an account you agree to our <b>Terms of Service</b>{" "}
                and <b>Privacy Policy</b>.
              </p>
            </form>
          )}

          {/* ════════════════════════
              FORGOT — STEP 1: Email
              ════════════════════════ */}
          {mode === "forgot-1" && (
            <form
              className="auth-form"
              onSubmit={handleForgotRequest}
              noValidate
            >
              <div className="auth-field">
                <label>Registered Email</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon">@</span>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={fgEmail}
                    onChange={(e) => setFgEmail(e.target.value)}
                    autoFocus
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="auth-info-box">
                <span>💡</span>
                <span>
                  A 6-digit OTP will be generated for your account. If email
                  delivery is configured, the OTP will be sent to your
                  registered email.
                </span>
              </div>

              <button type="submit" className="auth-submit" disabled={loading}>
                {loading ? (
                  <>
                    <span className="auth-spinner" />
                    Sending…
                  </>
                ) : (
                  "Send OTP →"
                )}
              </button>
            </form>
          )}

          {/* ════════════════════════
              FORGOT — STEP 2: OTP
              ════════════════════════ */}
          {mode === "forgot-2" && (
            <form className="auth-form" onSubmit={handleVerifyOTP} noValidate>
              {/* OTP display box — dev mode */}
              {false && fgOtpDisplay && (
                <div className="auth-otp-reveal">
                  <div className="auth-otp-reveal-label">
                    <span>🔐</span> Your OTP (dev mode — would be emailed in
                    production)
                  </div>
                  <div className="auth-otp-code">{fgOtpDisplay}</div>
                  <button
                    type="button"
                    className="auth-otp-copy"
                    onClick={() => {
                      navigator.clipboard?.writeText(fgOtpDisplay);
                    }}
                  >
                    📋 Copy
                  </button>
                </div>
              )}

              <div className="auth-field">
                <label>Enter 6-digit OTP</label>
                <div className="auth-otp-boxes">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <input
                      key={i}
                      id={`otp-${i}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      className="auth-otp-box"
                      value={fgOtp[i] || ""}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        const arr = fgOtp.split("");
                        arr[i] = val;
                        const newOtp = arr.join("").slice(0, 6);
                        setFgOtp(newOtp);
                        if (val && i < 5)
                          document.getElementById(`otp-${i + 1}`)?.focus();
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Backspace" && !fgOtp[i] && i > 0) {
                          document.getElementById(`otp-${i - 1}`)?.focus();
                        }
                      }}
                      onPaste={(e) => {
                        e.preventDefault();
                        const pasted = e.clipboardData
                          .getData("text")
                          .replace(/\D/g, "")
                          .slice(0, 6);
                        setFgOtp(pasted);
                        const focusIdx = Math.min(pasted.length, 5);
                        document.getElementById(`otp-${focusIdx}`)?.focus();
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Timer */}
              <div className="auth-otp-timer">
                {otpTimer > 0 ? (
                  <span>
                    ⏱ OTP expires in <b>{timerFmt}</b>
                  </span>
                ) : (
                  <span className="auth-otp-expired">OTP expired.</span>
                )}
                <button
                  type="button"
                  className={`auth-resend ${otpTimer > 0 ? "disabled" : ""}`}
                  onClick={handleResendOTP}
                  disabled={otpTimer > 0 || loading}
                >
                  {loading ? "Sending…" : "Resend OTP"}
                </button>
              </div>

              <button
                type="submit"
                className="auth-submit"
                disabled={loading || fgOtp.length !== 6}
              >
                {loading ? (
                  <>
                    <span className="auth-spinner" />
                    Verifying…
                  </>
                ) : (
                  "Verify OTP →"
                )}
              </button>
            </form>
          )}

          {/* ════════════════════════
              FORGOT — STEP 3: New Password
              ════════════════════════ */}
          {mode === "forgot-3" && (
            <form
              className="auth-form"
              onSubmit={handleResetPassword}
              noValidate
            >
              <div className="auth-field">
                <label>New Password</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon">•</span>
                  <input
                    type={showNew ? "text" : "password"}
                    placeholder="Min. 6 characters"
                    value={fgNewPwd}
                    onChange={(e) => setFgNewPwd(e.target.value)}
                    autoFocus
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="auth-eye"
                    onClick={() => setShowNew((p) => !p)}
                  >
                    {showNew ? "🙈" : "👁️"}
                  </button>
                </div>
                {fgNewPwd && (
                  <div className="auth-strength">
                    <div className="auth-strength-bar">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className={`auth-strength-seg ${newStrength >= i ? STR_CLS[newStrength] : ""}`}
                        />
                      ))}
                    </div>
                    <span
                      className={`auth-strength-label ${STR_CLS[newStrength]}`}
                    >
                      {STR_LABEL[newStrength]}
                    </span>
                  </div>
                )}
              </div>

              <div className="auth-field">
                <label>Confirm New Password</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon">•</span>
                  <input
                    type={showCnf ? "text" : "password"}
                    placeholder="Repeat new password"
                    value={fgCnfPwd}
                    onChange={(e) => setFgCnfPwd(e.target.value)}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="auth-eye"
                    onClick={() => setShowCnf((p) => !p)}
                  >
                    {showCnf ? "🙈" : "👁️"}
                  </button>
                </div>
                {fgCnfPwd && fgNewPwd !== fgCnfPwd && (
                  <span className="auth-field-err">Passwords do not match</span>
                )}
              </div>

              <div className="auth-pwd-rules">
                {[
                  { ok: fgNewPwd.length >= 6, label: "At least 6 characters" },
                  { ok: /[A-Z]/.test(fgNewPwd), label: "One uppercase letter" },
                  { ok: /[0-9]/.test(fgNewPwd), label: "One number" },
                  {
                    ok: /[^A-Za-z0-9]/.test(fgNewPwd),
                    label: "One special character (optional)",
                  },
                ].map((r) => (
                  <div
                    key={r.label}
                    className={`auth-pwd-rule ${r.ok ? "ok" : ""}`}
                  >
                    <span>{r.ok ? "✅" : "○"}</span> {r.label}
                  </div>
                ))}
              </div>

              <button
                type="submit"
                className="auth-submit"
                disabled={
                  loading || fgNewPwd.length < 6 || fgNewPwd !== fgCnfPwd
                }
              >
                {loading ? (
                  <>
                    <span className="auth-spinner" />
                    Resetting…
                  </>
                ) : (
                  "Reset Password ✓"
                )}
              </button>
            </form>
          )}

          {/* ── Footer switch ── */}
          <p className="auth-switch">
            {mode === "login" || mode.startsWith("forgot") ? (
              <>
                Don&apos;t have an account?{" "}
                <button onClick={() => switchMode("signup")}>
                  Sign up free
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button onClick={() => switchMode("login")}>Sign in</button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
/* ================================================================
   DASHBOARD
   ================================================================ */
function Dashboard({
  stats,
  statusChart,
  costChart,
  alerts,
  fuel,
  maintenance,
  drivers,
  setSection,
}) {
  return (
    <div className="content">
      {/* Metric Cards */}
      <div className="metrics">
        <MetricCard
          icon="vehicle"
          cls="blue"
          title="Total Vehicles"
          value={stats.totalVehicles ?? "—"}
          sub="All registered vehicles"
        />
        <MetricCard
          icon="vehicle"
          cls="green"
          title="Active Vehicles"
          value={stats.activeVehicles ?? "—"}
          sub="Currently on road"
        />
        <MetricCard
          icon="users"
          cls="orange"
          title="Total Drivers"
          value={stats.totalDrivers ?? "—"}
          sub={`${stats.activeDrivers ?? 0} active`}
        />
        <MetricCard
          icon="wrench"
          cls="purple"
          title="Maintenance Cost"
          value={money(stats.totalMaintenanceCost)}
          sub="This month"
        />
      </div>

      {/* Charts */}
      <div className="charts-grid">
        <div className="panel">
          <div className="panel-head">
            <h2>Vehicle Status</h2>
          </div>
          <div className="panel-body">
            <div className="chart-box doughnut">
              <Doughnut
                data={statusChart}
                options={{
                  cutout: "70%",
                  plugins: { legend: { position: "right" } },
                }}
              />
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <h2>Fuel vs Maintenance Costs</h2>
          </div>
          <div className="panel-body">
            <div className="chart-box">
              <Bar
                data={costChart}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: { beginAtZero: true, grid: { color: "#f1f5f9" } },
                    x: { grid: { display: false } },
                  },
                  plugins: { legend: { display: true } },
                }}
              />
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <h2>Service Alerts</h2>
          </div>
          <div className="alert-list">
            {alerts.length ? (
              alerts.map((v) => {
                const s = serviceState(v);
                return (
                  <div className="alert-row" key={v._id}>
                    <div>
                      <div className="vehicle-no">{v.vehicleNumber}</div>
                      <div className="vehicle-name">{v.vehicleName}</div>
                    </div>
                    <span className={`alert-chip chip-${s.cls}`}>
                      {s.icon} {s.label}
                    </span>
                  </div>
                );
              })
            ) : (
              <p className="muted" style={{ padding: "18px" }}>
                No urgent alerts 🎉
              </p>
            )}
          </div>
          <button
            className="link-btn"
            onClick={() => setSection("maintenance")}
          >
            View All →
          </button>
        </div>
      </div>

      {/* Data Tables */}
      <div className="tables-grid">
        <div className="panel">
          <div className="panel-head">
            <h2>Recent Fuel Entries</h2>
          </div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Vehicle No.</th>
                  <th>Vehicle Name</th>
                  <th>Date</th>
                  <th>Odometer</th>
                  <th>Liters</th>
                  <th>Cost</th>
                </tr>
              </thead>
              <tbody>
                {fuel.length ? (
                  fuel.map((r) => (
                    <tr key={r._id}>
                      <td>
                        <b>{r.vehicle?.vehicleNumber}</b>
                      </td>
                      <td>{r.vehicle?.vehicleName}</td>
                      <td>{dateText(r.date)}</td>
                      <td>{r.odometer?.toLocaleString()} km</td>
                      <td>{r.fuelLiters} L</td>
                      <td>
                        <b>{money(r.totalCost)}</b>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="empty-cell"
                      style={{
                        textAlign: "center",
                        padding: "24px",
                        color: "#64748b",
                      }}
                    >
                      No fuel entries yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <button className="link-btn" onClick={() => setSection("fuel")}>
            View All →
          </button>
        </div>

        <div className="panel">
          <div className="panel-head">
            <h2>Recent Maintenance</h2>
          </div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Vehicle</th>
                  <th>Service</th>
                  <th>Date</th>
                  <th>Cost</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {maintenance.length ? (
                  maintenance.map((r) => (
                    <tr key={r._id}>
                      <td>
                        <b>{r.vehicle?.vehicleNumber}</b>
                      </td>
                      <td>{r.serviceType}</td>
                      <td>{dateText(r.date)}</td>
                      <td>
                        <b>{money(r.cost)}</b>
                      </td>
                      <td>
                        <span className={`status ${statusClass(r.status)}`}>
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      style={{
                        textAlign: "center",
                        padding: "24px",
                        color: "#64748b",
                      }}
                    >
                      No maintenance records yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <button
            className="link-btn"
            onClick={() => setSection("maintenance")}
          >
            View All →
          </button>
        </div>
      </div>

      {/* Bottom Stats */}
      <div className="bottom-metrics">
        <BottomCard
          icon="⛽"
          label="Total Fuel (Month)"
          value={`${stats.totalFuelLiters || 0} L`}
        />
        <BottomCard
          icon="💰"
          label="Total Fuel Cost"
          value={money(stats.totalFuelCost)}
        />
        <BottomCard
          icon="🔧"
          label="Total Maintenance Cost"
          value={money(stats.totalMaintenanceCost)}
        />
        <BottomCard
          icon="○"
          label="Total Drivers"
          value={stats.totalDrivers || 0}
        />
      </div>

      {/* Recent Drivers */}
      {drivers.length > 0 && (
        <div className="panel" style={{ marginBottom: 22 }}>
          <div className="panel-head">
            <h2>Recent Drivers</h2>
          </div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Driver</th>
                  <th>Employee ID</th>
                  <th>Phone</th>
                  <th>Assigned Vehicle</th>
                  <th>License Expiry</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {drivers.slice(0, 5).map((d) => (
                  <tr key={d._id}>
                    <td>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <DriverAvatar name={d.name} size={28} />
                        <b>{d.name}</b>
                      </div>
                    </td>
                    <td>{d.employeeId}</td>
                    <td>{d.phone}</td>
                    <td>
                      {d.assignedVehicle ? (
                        <span>{d.assignedVehicle.vehicleNumber}</span>
                      ) : (
                        <span className="muted">Unassigned</span>
                      )}
                    </td>
                    <td>{dateText(d.licenseExpiry)}</td>
                    <td>
                      <span className={`status ${statusClass(d.status)}`}>
                        {d.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button className="link-btn" onClick={() => setSection("drivers")}>
            View All Drivers →
          </button>
        </div>
      )}
    </div>
  );
}

function MetricCard({ icon, cls, title, value, sub }) {
  return (
    <div className={`metric ${cls}`}>
      <div className="metric-icon">
        <Icon name={icon} size={20} />
      </div>
      <div className="metric-info">
        <span className="label">{title}</span>
        <div className="value">{value}</div>
        <small className="sub">{sub}</small>
      </div>
    </div>
  );
}

function BottomCard({ icon, label, value }) {
  return (
    <div className="bottom-card">
      <div className="bottom-icon">{icon}</div>
      <div>
        <span className="b-label">{label}</span>
        <div className="b-value">{value}</div>
      </div>
    </div>
  );
}

/* ================================================================
   VEHICLES
   ================================================================ */
function Vehicles({ vehicles, setModal, reload, canManage }) {
  const typeIcon = (t) =>
    ({ Car: "VM", Bike: "🏍️", Truck: "🚛", SUV: "🚙", Bus: "🚌" })[t] || "VM";

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [confirmDel, setConfirmDel] = useState(null); // vehicle obj
  const [deleting, setDeleting] = useState(false);
  const [delError, setDelError] = useState("");

  /* ── Filter ── */
  const filtered = vehicles.filter((v) => {
    const q = search.toLowerCase();
    const matchSearch =
      !search ||
      v.vehicleNumber.toLowerCase().includes(q) ||
      v.vehicleName.toLowerCase().includes(q) ||
      (v.owner || "").toLowerCase().includes(q);
    const matchStatus = statusFilter === "All" || v.status === statusFilter;
    const matchType = typeFilter === "All" || v.type === typeFilter;
    return matchSearch && matchStatus && matchType;
  });

  /* ── Delete ── */
  async function handleDelete() {
    setDeleting(true);
    setDelError("");
    try {
      await deleteVehicle(confirmDel._id);
      setConfirmDel(null);
      await reload();
    } catch (e) {
      setDelError(e.response?.data?.message || "Failed to delete vehicle.");
    } finally {
      setDeleting(false);
    }
  }

  const statuses = [
    "All",
    ...Array.from(new Set(vehicles.map((v) => v.status))),
  ];
  const types = ["All", ...Array.from(new Set(vehicles.map((v) => v.type)))];

  return (
    <div className="content">
      {/* Header */}
      <div className="page-header">
        <div>
          <h2>Vehicles</h2>
          <p>
            {vehicles.length} vehicle{vehicles.length !== 1 ? "s" : ""}{" "}
            registered
            {filtered.length !== vehicles.length &&
              ` · ${filtered.length} shown`}
          </p>
        </div>
        {canManage && (
          <button
            className="btn btn-primary"
            onClick={() => setModal({ type: "vehicle" })}
          >
            + Add Vehicle
          </button>
        )}
      </div>

      {/* Filters */}
      {vehicles.length > 0 && (
        <div className="veh-filters">
          <input
            className="search-input"
            placeholder="Search by number, name or owner…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="filter-tabs">
            {statuses.map((s) => (
              <button
                key={s}
                className={`filter-tab ${statusFilter === s ? "active" : ""}`}
                onClick={() => setStatusFilter(s)}
              >
                {s}
              </button>
            ))}
          </div>
          <div className="filter-tabs">
            {types.map((t) => (
              <button
                key={t}
                className={`filter-tab ${typeFilter === t ? "active" : ""}`}
                onClick={() => setTypeFilter(t)}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {vehicles.length === 0 ? (
        <div className="panel">
          <div className="placeholder-panel">
            <div className="ph-icon">VM</div>
            <h2>No vehicles yet</h2>
            <p>Add your first vehicle to get started.</p>
            {canManage && (
              <button
                className="btn btn-primary"
                onClick={() => setModal({ type: "vehicle" })}
              >
                + Add Vehicle
              </button>
            )}
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="panel">
          <div className="placeholder-panel">
            <div className="ph-icon">🔍</div>
            <h2>No results</h2>
            <p>Try changing your search or filter.</p>
          </div>
        </div>
      ) : (
        <div className="vehicle-grid">
          {filtered.map((v) => {
            const s = serviceState(v);
            return (
              <div className="vehicle-card" key={v._id}>
                {/* Header */}
                <div className="vehicle-card-header">
                  <div>
                    <div className="vehicle-num">{v.vehicleNumber}</div>
                    <div className="vehicle-name-type">
                      {v.vehicleName} · {v.type}
                    </div>
                  </div>
                  <div className="vehicle-card-icon">{typeIcon(v.type)}</div>
                </div>

                {/* Info rows */}
                <div className="v-info-row">
                  <span className="v-label">Owner</span>
                  <span className="v-val">{v.owner || "—"}</span>
                </div>
                <div className="v-info-row">
                  <span className="v-label">Current KM</span>
                  <span className="v-val">
                    {v.currentKm?.toLocaleString()} km
                  </span>
                </div>
                <div className="v-info-row">
                  <span className="v-label">Next Service</span>
                  <span className="v-val">
                    {v.nextServiceKm?.toLocaleString()} km
                  </span>
                </div>

                {/* Footer */}
                <div className="vehicle-footer">
                  <span className={`status ${statusClass(v.status)}`}>
                    {v.status}
                  </span>
                  <span className={`service-badge ${s.cls}`}>
                    {s.icon} {s.label}
                  </span>
                </div>

                {/* Actions */}
                {canManage && (
                  <div className="vehicle-actions">
                    <button
                      className="btn btn-ghost btn-sm veh-action-btn"
                      onClick={() => setModal({ type: "km", item: v })}
                    >
                      Update KM
                    </button>
                    <button
                      className="btn btn-ghost btn-sm veh-action-btn"
                      onClick={() =>
                        setModal({ type: "vehicle-edit", item: v })
                      }
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm veh-delete-btn"
                      onClick={() => {
                        setDelError("");
                        setConfirmDel(v);
                      }}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Delete Confirm Dialog ── */}
      {confirmDel && (
        <div
          className="modal-backdrop"
          onMouseDown={(e) =>
            e.target === e.currentTarget && setConfirmDel(null)
          }
        >
          <div className="modal" style={{ maxWidth: 460 }}>
            <div className="modal-header">
              <h2> Delete Vehicle</h2>
              <button
                className="modal-close"
                onClick={() => setConfirmDel(null)}
              >
                ✕
              </button>
            </div>

            {/* Vehicle summary */}
            <div className="veh-del-card">
              <div className="veh-del-icon">{typeIcon(confirmDel.type)}</div>
              <div>
                <div className="veh-del-num">{confirmDel.vehicleNumber}</div>
                <div className="veh-del-meta">
                  {confirmDel.vehicleName} · {confirmDel.type}
                </div>
                {confirmDel.owner && (
                  <div className="veh-del-meta">Owner: {confirmDel.owner}</div>
                )}
              </div>
            </div>

            <div className="veh-del-warn">
              <span>!</span>
              <div>
                <div style={{ fontWeight: 700, marginBottom: 3 }}>
                  This action cannot be undone.
                </div>
                <div>
                  Deleting this vehicle will also remove all associated fuel and
                  maintenance records.
                </div>
              </div>
            </div>

            {delError && (
              <div className="error" style={{ margin: "0 0 14px" }}>
                ! {delError}
              </div>
            )}

            {/* Type-to-confirm */}
            <VehDeleteConfirm
              key={confirmDel._id}
              expected={confirmDel.vehicleNumber}
              onConfirm={handleDelete}
              onCancel={() => setConfirmDel(null)}
              loading={deleting}
            />
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Type-to-confirm input for vehicle delete ── */
function VehDeleteConfirm({ expected, onConfirm, onCancel, loading }) {
  const [val, setVal] = useState("");
  const match = val.trim().toUpperCase() === expected.trim().toUpperCase();
  return (
    <div>
      <div className="form-group" style={{ marginBottom: 16 }}>
        <label>
          Type{" "}
          <b style={{ color: "#ef4444", fontFamily: "monospace" }}>
            {expected}
          </b>{" "}
          to confirm
        </label>
        <input
          value={val}
          onChange={(e) => setVal(e.target.value)}
          placeholder={expected}
          autoFocus
          style={{
            borderColor: val ? (match ? "#22c55e" : "#ef4444") : undefined,
            boxShadow: val
              ? match
                ? "0 0 0 3px rgba(34,197,94,.12)"
                : "0 0 0 3px rgba(239,68,68,.1)"
              : undefined,
          }}
        />
      </div>
      <div className="form-actions">
        <button className="btn btn-ghost" onClick={onCancel} disabled={loading}>
          Cancel
        </button>
        <button
          className="btn btn-primary"
          style={{
            background: match ? "#ef4444" : "#94a3b8",
            cursor: match ? "pointer" : "not-allowed",
          }}
          disabled={!match || loading}
          onClick={onConfirm}
        >
          {loading ? (
            <>
              <span
                style={{
                  width: 14,
                  height: 14,
                  border: "2px solid rgba(255,255,255,.4)",
                  borderTopColor: "#fff",
                  borderRadius: "50%",
                  display: "inline-block",
                  animation: "spin .7s linear infinite",
                  marginRight: 6,
                }}
              />
              Deleting…
            </>
          ) : (
            "Yes, Delete Vehicle"
          )}
        </button>
      </div>
    </div>
  );
}

/* ================================================================
   FUEL
   ================================================================ */
function Fuel({
  fuel,
  vehicles,
  setModal,
  reload,
  canManage,
  canAdd = canManage,
}) {
  async function remove(record) {
    if (
      !window.confirm(
        `Delete the fuel entry for ${record.vehicle?.vehicleNumber || "this vehicle"}?`,
      )
    )
      return;
    try {
      await deleteFuel(record._id);
      await reload();
    } catch (err) {
      alert(err.response?.data?.message || "Could not delete the fuel entry.");
    }
  }
  return (
    <div className="content">
      <div className="page-header">
        <div>
          <h2>Fuel Management</h2>
          <p>
            {fuel.length} entr{fuel.length !== 1 ? "ies" : "y"} recorded
          </p>
        </div>
        {canAdd && (
          <button
            className="btn btn-primary"
            onClick={() => setModal({ type: "fuel" })}
          >
            + Add Fuel Entry
          </button>
        )}
      </div>
      <div className="panel">
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Vehicle</th>
                <th>Date</th>
                <th>Odometer</th>
                <th>Liters</th>
                <th>Price / L</th>
                <th>Total Cost</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {fuel.length ? (
                fuel.map((r) => (
                  <tr key={r._id}>
                    <td>
                      <b>{r.vehicle?.vehicleNumber}</b>
                      <br />
                      <small style={{ color: "#64748b" }}>
                        {r.vehicle?.vehicleName}
                      </small>
                    </td>
                    <td>{dateText(r.date)}</td>
                    <td>{r.odometer?.toLocaleString()} km</td>
                    <td>{r.fuelLiters} L</td>
                    <td>{money(r.pricePerLiter)}</td>
                    <td>
                      <b>{money(r.totalCost)}</b>
                    </td>
                    <td>
                      {canManage && (
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => remove(r)}
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    style={{
                      textAlign: "center",
                      padding: "32px",
                      color: "#64748b",
                    }}
                  >
                    No fuel entries yet. Add one!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   MAINTENANCE
   ================================================================ */
function Maintenance({
  maintenance,
  vehicles,
  setModal,
  reload,
  canManage,
  canAdd = canManage,
}) {
  async function remove(record) {
    if (!window.confirm(`Delete the ${record.serviceType} record?`)) return;
    try {
      await deleteMaintenance(record._id);
      await reload();
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Could not delete the maintenance record.",
      );
    }
  }
  return (
    <div className="content">
      <div className="page-header">
        <div>
          <h2>Maintenance</h2>
          <p>
            {maintenance.length} record{maintenance.length !== 1 ? "s" : ""}{" "}
            found
          </p>
        </div>
        {canAdd && (
          <button
            className="btn btn-primary"
            onClick={() => setModal({ type: "maintenance" })}
          >
            + Add Maintenance
          </button>
        )}
      </div>
      <div className="panel">
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Vehicle</th>
                <th>Service Type</th>
                <th>Date</th>
                <th>Odometer</th>
                <th>Cost</th>
                <th>Next Service</th>
                <th>Status</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {maintenance.length ? (
                maintenance.map((r) => (
                  <tr key={r._id}>
                    <td>
                      <b>{r.vehicle?.vehicleNumber}</b>
                    </td>
                    <td>{r.serviceType}</td>
                    <td>{dateText(r.date)}</td>
                    <td>{r.odometer?.toLocaleString()} km</td>
                    <td>
                      <b>{money(r.cost)}</b>
                    </td>
                    <td>{r.nextServiceKm?.toLocaleString()} km</td>
                    <td>
                      <span className={`status ${statusClass(r.status)}`}>
                        {r.status}
                      </span>
                    </td>
                    <td>
                      {canManage && (
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => remove(r)}
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={8}
                    style={{
                      textAlign: "center",
                      padding: "32px",
                      color: "#64748b",
                    }}
                  >
                    No maintenance records yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   DRIVER AVATAR HELPER
   ================================================================ */
function DriverAvatar({ name = "", size = 38 }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const colors = [
    "#4f6ef7",
    "#22c55e",
    "#f59e0b",
    "#ef4444",
    "#a855f7",
    "#06b6d4",
    "#f97316",
  ];
  const color = colors[name.charCodeAt(0) % colors.length];
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: color,
        color: "#fff",
        display: "grid",
        placeItems: "center",
        fontWeight: 700,
        fontSize: size * 0.38,
        flexShrink: 0,
      }}
    >
      {initials || "?"}
    </div>
  );
}

/* ================================================================
   DRIVERS MODULE
   ================================================================ */
function Drivers({ drivers, vehicles, setModal, reload, canManage }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const active = drivers.filter((d) => d.status === "Active").length;
  const inactive = drivers.filter((d) => d.status === "Inactive").length;
  const onLeave = drivers.filter((d) => d.status === "On Leave").length;
  const assigned = drivers.filter((d) => d.assignedVehicle).length;

  const filtered = drivers.filter((d) => {
    const matchSearch =
      !search ||
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.employeeId.toLowerCase().includes(search.toLowerCase()) ||
      d.phone.includes(search);
    const matchStatus = statusFilter === "All" || d.status === statusFilter;
    return matchSearch && matchStatus;
  });

  async function handleDelete(id) {
    if (!canManage) return;
    setDeleting(true);
    try {
      await deleteDriver(id);
      setConfirmDelete(null);
      await reload();
    } catch {
      alert("Failed to delete driver.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="content">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h2>Drivers</h2>
          <p>
            {drivers.length} driver{drivers.length !== 1 ? "s" : ""} registered
          </p>
        </div>
        {canManage && (
          <button
            className="btn btn-primary"
            onClick={() => setModal({ type: "driver" })}
          >
            + Add Driver
          </button>
        )}
      </div>

      {/* Stats Row */}
      <div className="driver-stats">
        <div className="dstat-card blue">
          <div className="dstat-icon">👥</div>
          <div className="dstat-val">{drivers.length}</div>
          <div className="dstat-label">Total</div>
        </div>
        <div className="dstat-card green">
          <div className="dstat-icon">✅</div>
          <div className="dstat-val">{active}</div>
          <div className="dstat-label">Active</div>
        </div>
        <div className="dstat-card orange">
          <div className="dstat-icon">🏖️</div>
          <div className="dstat-val">{onLeave}</div>
          <div className="dstat-label">On Leave</div>
        </div>
        <div className="dstat-card red">
          <div className="dstat-icon">⛔</div>
          <div className="dstat-val">{inactive}</div>
          <div className="dstat-label">Inactive</div>
        </div>
        <div className="dstat-card purple">
          <div className="dstat-icon">VM</div>
          <div className="dstat-val">{assigned}</div>
          <div className="dstat-label">Assigned</div>
        </div>
      </div>

      {/* Filters */}
      <div className="driver-filters">
        <input
          className="search-input"
          placeholder="Search by name, ID or phone…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="filter-tabs">
          {["All", "Active", "Inactive", "On Leave"].map((s) => (
            <button
              key={s}
              className={`filter-tab ${statusFilter === s ? "active" : ""}`}
              onClick={() => setStatusFilter(s)}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {drivers.length === 0 ? (
        <div className="panel">
          <div className="placeholder-panel">
            <div className="ph-icon">○</div>
            <h2>No drivers yet</h2>
            <p>Add your first driver to get started.</p>
            {canManage && (
              <button
                className="btn btn-primary"
                onClick={() => setModal({ type: "driver" })}
              >
                + Add Driver
              </button>
            )}
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="panel">
          <div className="placeholder-panel">
            <div className="ph-icon">🔍</div>
            <h2>No results found</h2>
            <p>Try changing your search or filter.</p>
          </div>
        </div>
      ) : (
        /* Driver Cards Grid */
        <div className="driver-grid">
          {filtered.map((d) => {
            const expiry = new Date(d.licenseExpiry);
            const today = new Date();
            const daysLeft = Math.ceil(
              (expiry - today) / (1000 * 60 * 60 * 24),
            );
            const licExpired = daysLeft <= 0;
            const licWarn = !licExpired && daysLeft <= 30;

            return (
              <div className="driver-card" key={d._id}>
                {/* Card Header */}
                <div className="dc-header">
                  <DriverAvatar name={d.name} size={52} />
                  <div className="dc-info">
                    <div className="dc-name">{d.name}</div>
                    <div className="dc-emp">{d.employeeId}</div>
                  </div>
                  <span className={`status ${statusClass(d.status)}`}>
                    {d.status}
                  </span>
                </div>

                {/* Details */}
                <div className="dc-details">
                  <div className="dc-row">
                    <span>+</span>
                    <span>{d.phone}</span>
                  </div>
                  {d.email && (
                    <div className="dc-row">
                      <span>@</span>
                      <span>{d.email}</span>
                    </div>
                  )}
                  <div className="dc-row">
                    <span>🪪</span>
                    <span>
                      {d.licenseNumber}
                      {licExpired ? (
                        <span className="lic-badge lic-expired">
                          {" "}
                          · Expired
                        </span>
                      ) : licWarn ? (
                        <span className="lic-badge lic-warn">
                          {" "}
                          · Expires in {daysLeft}d
                        </span>
                      ) : null}
                    </span>
                  </div>
                  <div className="dc-row">
                    <span>📅</span>
                    <span>Exp: {dateText(d.licenseExpiry)}</span>
                  </div>
                  <div className="dc-row">
                    <span>VM</span>
                    <span>
                      {d.assignedVehicle ? (
                        <>
                          <b>{d.assignedVehicle.vehicleNumber}</b> —{" "}
                          {d.assignedVehicle.vehicleName}
                        </>
                      ) : (
                        <span className="muted">No vehicle assigned</span>
                      )}
                    </span>
                  </div>
                  {d.experience > 0 && (
                    <div className="dc-row">
                      <span>⭐</span>
                      <span>
                        {d.experience} yr{d.experience !== 1 ? "s" : ""}{" "}
                        experience
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                {canManage && (
                  <div className="dc-actions">
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() =>
                        setModal({ type: "assignVehicle", item: d })
                      }
                    >
                      {d.assignedVehicle ? "Reassign" : "Assign Vehicle"}
                    </button>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => setModal({ type: "editDriver", item: d })}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => setConfirmDelete(d)}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirm Dialog */}
      {confirmDelete && (
        <div
          className="modal-backdrop"
          onMouseDown={(e) =>
            e.target === e.currentTarget && setConfirmDelete(null)
          }
        >
          <div className="modal" style={{ maxWidth: 420 }}>
            <div className="modal-header">
              <h2>Delete Driver</h2>
              <button
                className="modal-close"
                onClick={() => setConfirmDelete(null)}
              >
                ✕
              </button>
            </div>
            <p style={{ color: "#64748b", marginBottom: 20 }}>
              Are you sure you want to delete <b>{confirmDelete.name}</b>? This
              action cannot be undone.
            </p>
            <div className="form-actions">
              <button
                className="btn btn-ghost"
                onClick={() => setConfirmDelete(null)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                style={{ background: "#ef4444" }}
                disabled={deleting}
                onClick={() => handleDelete(confirmDelete._id)}
              >
                {deleting ? "Deleting…" : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================================================================
   REPORTS MODULE
   ================================================================ */
const CHART_OPTS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    y: {
      beginAtZero: true,
      grid: { color: "#f1f5f9" },
      ticks: { font: { size: 11 } },
    },
    x: { grid: { display: false }, ticks: { font: { size: 11 } } },
  },
};
const PIE_OPTS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: "right", labels: { font: { size: 12 }, padding: 14 } },
  },
  cutout: "60%",
};
const COLORS = [
  "#4f6ef7",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
  "#a855f7",
  "#06b6d4",
  "#f97316",
  "#84cc16",
];

function Reports({ vehicles }) {
  const [tab, setTab] = useState("overview");
  const [overview, setOverview] = useState(null);
  const [fuelData, setFuelData] = useState(null);
  const [maintData, setMaintData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* filter state */
  const [fuelFilter, setFuelFilter] = useState({
    from: "",
    to: "",
    vehicleId: "",
  });
  const [maintFilter, setMaintFilter] = useState({
    from: "",
    to: "",
    vehicleId: "",
    status: "",
  });

  async function loadOverview() {
    try {
      setLoading(true);
      setError("");
      const res = await getReportOverview();
      setOverview(res.data);
    } catch {
      setError("Failed to load report data.");
    } finally {
      setLoading(false);
    }
  }

  async function loadFuel(params = {}) {
    try {
      setLoading(true);
      setError("");
      const res = await getReportFuel(params);
      setFuelData(res.data);
    } catch {
      setError("Failed to load fuel report.");
    } finally {
      setLoading(false);
    }
  }

  async function loadMaint(params = {}) {
    try {
      setLoading(true);
      setError("");
      const res = await getReportMaintenance(params);
      setMaintData(res.data);
    } catch {
      setError("Failed to load maintenance report.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (tab === "overview") loadOverview();
    if (tab === "fuel") loadFuel(fuelFilter);
    if (tab === "maintenance") loadMaint(maintFilter);
  }, [tab]); // eslint-disable-line

  /* ── Overview tab ── */
  function OverviewTab() {
    if (!overview) return null;
    const {
      summary,
      fleetHealth,
      monthlyFuel,
      monthlyMaintenance,
      vehicleSummary,
      serviceBreakdown,
    } = overview;

    const fuelLineData = {
      labels: monthlyFuel.map((m) => m.month),
      datasets: [
        {
          label: "Fuel Cost (₹)",
          data: monthlyFuel.map((m) => m.cost),
          borderColor: "#4f6ef7",
          backgroundColor: "rgba(79,110,247,.12)",
          fill: true,
          tension: 0.4,
          pointRadius: 5,
          pointBackgroundColor: "#4f6ef7",
        },
      ],
    };
    const maintLineData = {
      labels: monthlyMaintenance.map((m) => m.month),
      datasets: [
        {
          label: "Maintenance Cost (₹)",
          data: monthlyMaintenance.map((m) => m.cost),
          borderColor: "#22c55e",
          backgroundColor: "rgba(34,197,94,.12)",
          fill: true,
          tension: 0.4,
          pointRadius: 5,
          pointBackgroundColor: "#22c55e",
        },
      ],
    };
    const costCompareData = {
      labels: monthlyFuel.map((m) => m.month),
      datasets: [
        {
          label: "Fuel",
          data: monthlyFuel.map((m) => m.cost),
          backgroundColor: "#4f6ef7",
          borderRadius: 6,
        },
        {
          label: "Maintenance",
          data: monthlyMaintenance.map((m) => m.cost),
          backgroundColor: "#22c55e",
          borderRadius: 6,
        },
      ],
    };
    const fleetPieData = {
      labels: ["Healthy", "Due Soon", "Overdue"],
      datasets: [
        {
          data: [fleetHealth.healthy, fleetHealth.dueSoon, fleetHealth.overdue],
          backgroundColor: ["#22c55e", "#f59e0b", "#ef4444"],
          borderWidth: 0,
        },
      ],
    };
    const svcPieData = {
      labels: serviceBreakdown.map((s) => s.type),
      datasets: [
        {
          data: serviceBreakdown.map((s) => s.cost),
          backgroundColor: COLORS,
          borderWidth: 0,
        },
      ],
    };

    return (
      <div className="rpt-overview">
        {/* KPI Cards */}
        <div className="rpt-kpi-grid">
          <RptKpi
            icon="💰"
            label="Total Fleet Cost"
            value={money(summary.totalCost)}
            sub="All time"
            color="blue"
          />
          <RptKpi
            icon="⛽"
            label="Total Fuel Cost"
            value={money(summary.totalFuelCost)}
            sub={`${summary.totalFuelLiters.toFixed(0)} L`}
            color="orange"
          />
          <RptKpi
            icon="🔧"
            label="Total Maintenance"
            value={money(summary.totalMaintCost)}
            sub={`${summary.totalMaintEntries} records`}
            color="purple"
          />
          <RptKpi
            icon="📊"
            label="Avg Cost / Vehicle"
            value={money(summary.avgCostPerVehicle)}
            sub={`${summary.totalVehicles} vehicles`}
            color="green"
          />
          <RptKpi
            icon="⛽"
            label="Fuel Entries"
            value={summary.totalFuelEntries}
            sub="Total fill-ups"
            color="cyan"
          />
          <RptKpi
            icon="🔧"
            label="Maintenance Records"
            value={summary.totalMaintEntries}
            sub="Total services"
            color="pink"
          />
        </div>

        {/* Charts Row 1 */}
        <div className="rpt-charts-row">
          <div className="panel">
            <div className="panel-head">
              <h2>Fuel Cost Trend (6 Months)</h2>
            </div>
            <div className="panel-body">
              <div className="rpt-chart-box">
                <Line
                  data={fuelLineData}
                  options={{
                    ...CHART_OPTS,
                    plugins: { legend: { display: false } },
                  }}
                />
              </div>
            </div>
          </div>
          <div className="panel">
            <div className="panel-head">
              <h2>Maintenance Cost Trend (6 Months)</h2>
            </div>
            <div className="panel-body">
              <div className="rpt-chart-box">
                <Line
                  data={maintLineData}
                  options={{
                    ...CHART_OPTS,
                    plugins: { legend: { display: false } },
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="rpt-charts-row3">
          <div className="panel">
            <div className="panel-head">
              <h2>Fuel vs Maintenance (6 Months)</h2>
            </div>
            <div className="panel-body">
              <div className="rpt-chart-box">
                <Bar
                  data={costCompareData}
                  options={{
                    ...CHART_OPTS,
                    plugins: {
                      legend: { display: true, labels: { font: { size: 12 } } },
                    },
                  }}
                />
              </div>
            </div>
          </div>
          <div className="panel">
            <div className="panel-head">
              <h2>Fleet Health</h2>
            </div>
            <div className="panel-body">
              <div className="rpt-chart-box">
                <Doughnut data={fleetPieData} options={PIE_OPTS} />
              </div>
            </div>
          </div>
          {serviceBreakdown.length > 0 && (
            <div className="panel">
              <div className="panel-head">
                <h2>Service Type Breakdown</h2>
              </div>
              <div className="panel-body">
                <div className="rpt-chart-box">
                  <Doughnut data={svcPieData} options={PIE_OPTS} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Per-Vehicle Summary Table */}
        <div className="panel" style={{ marginTop: 20 }}>
          <div className="panel-head">
            <h2>Per-Vehicle Cost Summary</h2>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => window.print()}
            >
              🖨️ Print
            </button>
          </div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Vehicle</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Current KM</th>
                  <th>Fuel Fills</th>
                  <th>Fuel Cost</th>
                  <th>Fuel (L)</th>
                  <th>Maint. Records</th>
                  <th>Maint. Cost</th>
                  <th>Total Cost</th>
                  <th>Km/L</th>
                </tr>
              </thead>
              <tbody>
                {vehicleSummary.length ? (
                  vehicleSummary.map((v, i) => (
                    <tr key={v._id}>
                      <td>{i + 1}</td>
                      <td>
                        <b>{v.vehicleNumber}</b>
                        <br />
                        <small style={{ color: "#64748b" }}>
                          {v.vehicleName}
                        </small>
                      </td>
                      <td>{v.type}</td>
                      <td>
                        <span className={`status ${statusClass(v.status)}`}>
                          {v.status}
                        </span>
                      </td>
                      <td>{v.currentKm.toLocaleString()} km</td>
                      <td>{v.fuelEntries}</td>
                      <td>
                        <b>{money(v.totalFuelCost)}</b>
                      </td>
                      <td>{v.totalFuelLiters.toFixed(1)} L</td>
                      <td>{v.maintEntries}</td>
                      <td>
                        <b>{money(v.totalMaintCost)}</b>
                      </td>
                      <td className="rpt-total-cell">
                        <b>{money(v.totalCost)}</b>
                      </td>
                      <td>
                        {v.avgFuelEfficiency > 0
                          ? `${v.avgFuelEfficiency} km/L`
                          : "—"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={12}
                      style={{
                        textAlign: "center",
                        padding: 28,
                        color: "#64748b",
                      }}
                    >
                      No vehicle data yet.
                    </td>
                  </tr>
                )}
              </tbody>
              {vehicleSummary.length > 0 && (
                <tfoot>
                  <tr className="rpt-tfoot">
                    <td colSpan={6}>
                      <b>Totals</b>
                    </td>
                    <td>
                      <b>
                        {money(
                          vehicleSummary.reduce(
                            (s, v) => s + v.totalFuelCost,
                            0,
                          ),
                        )}
                      </b>
                    </td>
                    <td>
                      <b>
                        {vehicleSummary
                          .reduce((s, v) => s + v.totalFuelLiters, 0)
                          .toFixed(1)}{" "}
                        L
                      </b>
                    </td>
                    <td></td>
                    <td>
                      <b>
                        {money(
                          vehicleSummary.reduce(
                            (s, v) => s + v.totalMaintCost,
                            0,
                          ),
                        )}
                      </b>
                    </td>
                    <td>
                      <b>
                        {money(
                          vehicleSummary.reduce((s, v) => s + v.totalCost, 0),
                        )}
                      </b>
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      </div>
    );
  }

  /* ── Fuel Report tab ── */
  function FuelTab() {
    return (
      <div>
        {/* Filters */}
        <div className="rpt-filter-bar">
          <div className="rpt-filter-group">
            <label>From Date</label>
            <input
              type="date"
              value={fuelFilter.from}
              onChange={(e) =>
                setFuelFilter((f) => ({ ...f, from: e.target.value }))
              }
            />
          </div>
          <div className="rpt-filter-group">
            <label>To Date</label>
            <input
              type="date"
              value={fuelFilter.to}
              onChange={(e) =>
                setFuelFilter((f) => ({ ...f, to: e.target.value }))
              }
            />
          </div>
          <div className="rpt-filter-group">
            <label>Vehicle</label>
            <select
              value={fuelFilter.vehicleId}
              onChange={(e) =>
                setFuelFilter((f) => ({ ...f, vehicleId: e.target.value }))
              }
            >
              <option value="">All Vehicles</option>
              {vehicles.map((v) => (
                <option key={v._id} value={v._id}>
                  {v.vehicleNumber} — {v.vehicleName}
                </option>
              ))}
            </select>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => loadFuel(fuelFilter)}
          >
            Apply Filter
          </button>
          <button
            className="btn btn-ghost"
            onClick={() => {
              setFuelFilter({ from: "", to: "", vehicleId: "" });
              loadFuel({});
            }}
          >
            Clear
          </button>
        </div>

        {fuelData && (
          <>
            {/* Summary Cards */}
            <div
              className="rpt-kpi-grid rpt-kpi-4"
              style={{ marginBottom: 20 }}
            >
              <RptKpi
                icon="📋"
                label="Total Entries"
                value={fuelData.count}
                sub="Fill-ups"
                color="blue"
              />
              <RptKpi
                icon="⛽"
                label="Total Liters"
                value={`${fuelData.totalLiters.toFixed(1)} L`}
                sub="Fuel consumed"
                color="orange"
              />
              <RptKpi
                icon="💰"
                label="Total Cost"
                value={money(fuelData.totalCost)}
                sub="Fuel expense"
                color="purple"
              />
              <RptKpi
                icon="📈"
                label="Avg Price/Liter"
                value={money(fuelData.avgPrice)}
                sub="Per litre avg"
                color="green"
              />
            </div>

            {/* Table */}
            <div className="panel">
              <div className="panel-head">
                <h2>Fuel Records ({fuelData.count})</h2>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => window.print()}
                >
                  🖨️ Print
                </button>
              </div>
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Vehicle</th>
                      <th>Date</th>
                      <th>Odometer</th>
                      <th>Liters</th>
                      <th>Price/L</th>
                      <th>Total Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fuelData.records.length ? (
                      fuelData.records.map((r, i) => (
                        <tr key={r._id}>
                          <td>{i + 1}</td>
                          <td>
                            <b>{r.vehicle?.vehicleNumber}</b>
                            <br />
                            <small style={{ color: "#64748b" }}>
                              {r.vehicle?.vehicleName}
                            </small>
                          </td>
                          <td>{dateText(r.date)}</td>
                          <td>{r.odometer?.toLocaleString()} km</td>
                          <td>{r.fuelLiters} L</td>
                          <td>{money(r.pricePerLiter)}</td>
                          <td>
                            <b>{money(r.totalCost)}</b>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={7}
                          style={{
                            textAlign: "center",
                            padding: 28,
                            color: "#64748b",
                          }}
                        >
                          No fuel records found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                  {fuelData.records.length > 0 && (
                    <tfoot>
                      <tr className="rpt-tfoot">
                        <td colSpan={4}>
                          <b>Total</b>
                        </td>
                        <td>
                          <b>{fuelData.totalLiters.toFixed(1)} L</b>
                        </td>
                        <td></td>
                        <td>
                          <b>{money(fuelData.totalCost)}</b>
                        </td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  /* ── Maintenance Report tab ── */
  function MaintenanceTab() {
    return (
      <div>
        {/* Filters */}
        <div className="rpt-filter-bar">
          <div className="rpt-filter-group">
            <label>From Date</label>
            <input
              type="date"
              value={maintFilter.from}
              onChange={(e) =>
                setMaintFilter((f) => ({ ...f, from: e.target.value }))
              }
            />
          </div>
          <div className="rpt-filter-group">
            <label>To Date</label>
            <input
              type="date"
              value={maintFilter.to}
              onChange={(e) =>
                setMaintFilter((f) => ({ ...f, to: e.target.value }))
              }
            />
          </div>
          <div className="rpt-filter-group">
            <label>Vehicle</label>
            <select
              value={maintFilter.vehicleId}
              onChange={(e) =>
                setMaintFilter((f) => ({ ...f, vehicleId: e.target.value }))
              }
            >
              <option value="">All Vehicles</option>
              {vehicles.map((v) => (
                <option key={v._id} value={v._id}>
                  {v.vehicleNumber} — {v.vehicleName}
                </option>
              ))}
            </select>
          </div>
          <div className="rpt-filter-group">
            <label>Status</label>
            <select
              value={maintFilter.status}
              onChange={(e) =>
                setMaintFilter((f) => ({ ...f, status: e.target.value }))
              }
            >
              <option value="">All Status</option>
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => loadMaint(maintFilter)}
          >
            Apply Filter
          </button>
          <button
            className="btn btn-ghost"
            onClick={() => {
              setMaintFilter({ from: "", to: "", vehicleId: "", status: "" });
              loadMaint({});
            }}
          >
            Clear
          </button>
        </div>

        {maintData && (
          <>
            {/* Summary Cards */}
            <div
              className="rpt-kpi-grid rpt-kpi-4"
              style={{ marginBottom: 20 }}
            >
              <RptKpi
                icon="📋"
                label="Total Records"
                value={maintData.count}
                sub="Maintenance jobs"
                color="blue"
              />
              <RptKpi
                icon="✅"
                label="Completed"
                value={maintData.completed}
                sub="Done"
                color="green"
              />
              <RptKpi
                icon=""
                label="Pending"
                value={maintData.pending}
                sub="In queue"
                color="orange"
              />
              <RptKpi
                icon="💰"
                label="Total Cost"
                value={money(maintData.totalCost)}
                sub="Maintenance spend"
                color="purple"
              />
            </div>

            {/* Table */}
            <div className="panel">
              <div className="panel-head">
                <h2>Maintenance Records ({maintData.count})</h2>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => window.print()}
                >
                  🖨️ Print
                </button>
              </div>
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Vehicle</th>
                      <th>Service Type</th>
                      <th>Date</th>
                      <th>Odometer</th>
                      <th>Cost</th>
                      <th>Next Service</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {maintData.records.length ? (
                      maintData.records.map((r, i) => (
                        <tr key={r._id}>
                          <td>{i + 1}</td>
                          <td>
                            <b>{r.vehicle?.vehicleNumber}</b>
                            <br />
                            <small style={{ color: "#64748b" }}>
                              {r.vehicle?.vehicleName}
                            </small>
                          </td>
                          <td>{r.serviceType}</td>
                          <td>{dateText(r.date)}</td>
                          <td>{r.odometer?.toLocaleString()} km</td>
                          <td>
                            <b>{money(r.cost)}</b>
                          </td>
                          <td>{r.nextServiceKm?.toLocaleString()} km</td>
                          <td>
                            <span className={`status ${statusClass(r.status)}`}>
                              {r.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={8}
                          style={{
                            textAlign: "center",
                            padding: 28,
                            color: "#64748b",
                          }}
                        >
                          No maintenance records found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                  {maintData.records.length > 0 && (
                    <tfoot>
                      <tr className="rpt-tfoot">
                        <td colSpan={5}>
                          <b>Total</b>
                        </td>
                        <td>
                          <b>{money(maintData.totalCost)}</b>
                        </td>
                        <td colSpan={2}></td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="content">
      {/* Header */}
      <div className="page-header">
        <div>
          <h2>Reports &amp; Analytics</h2>
          <p>Comprehensive insights across your entire fleet</p>
        </div>
        <button className="btn btn-ghost" onClick={() => window.print()}>
          🖨️ Print Report
        </button>
      </div>

      {/* Tab Bar */}
      <div className="rpt-tabs">
        {[
          { id: "overview", icon: "📊", label: "Overview" },
          { id: "fuel", icon: "⛽", label: "Fuel Report" },
          { id: "maintenance", icon: "🔧", label: "Maintenance" },
        ].map((t) => (
          <button
            key={t.id}
            className={`rpt-tab ${tab === t.id ? "active" : ""}`}
            onClick={() => setTab(t.id)}
          >
            <span>{t.icon}</span> {t.label}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="error" style={{ marginBottom: 16 }}>
          ! {error}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
          <div className="spinner" />
        </div>
      ) : (
        <>
          {tab === "overview" && <OverviewTab />}
          {tab === "fuel" && <FuelTab />}
          {tab === "maintenance" && <MaintenanceTab />}
        </>
      )}
    </div>
  );
}

/* small reusable KPI card for reports */
function RptKpi({ icon, label, value, sub, color }) {
  return (
    <div className={`rpt-kpi rpt-kpi-${color}`}>
      <div className="rpt-kpi-icon">{icon}</div>
      <div className="rpt-kpi-body">
        <div className="rpt-kpi-label">{label}</div>
        <div className="rpt-kpi-value">{value}</div>
        <div className="rpt-kpi-sub">{sub}</div>
      </div>
    </div>
  );
}

/* ================================================================
   REMINDERS MODULE
   ================================================================ */

/* ── Category config ── */
const CAT_CONFIG = {
  Service: { icon: "🔧", color: "#4f6ef7" },
  Insurance: { icon: "🛡️", color: "#22c55e" },
  License: { icon: "🪪", color: "#f59e0b" },
  Tax: { icon: "📄", color: "#ef4444" },
  Pollution: { icon: "🌿", color: "#10b981" },
  Fuel: { icon: "⛽", color: "#f97316" },
  Tyre: { icon: "⭕", color: "#8b5cf6" },
  Battery: { icon: "🔋", color: "#06b6d4" },
  Other: { icon: "📌", color: "#64748b" },
};
const PRIORITY_CONFIG = {
  High: { cls: "prio-high", label: "High", dot: "🔴" },
  Medium: { cls: "prio-medium", label: "Medium", dot: "🟡" },
  Low: { cls: "prio-low", label: "Low", dot: "🟢" },
};
const STATUS_CONFIG = {
  Pending: { cls: "rem-pending", icon: "" },
  Overdue: { cls: "rem-overdue", icon: "🚨" },
  Completed: { cls: "rem-completed", icon: "✅" },
  Snoozed: { cls: "rem-snoozed", icon: "😴" },
};

function daysLeftText(dueDate) {
  const days = Math.ceil(
    (new Date(dueDate) - new Date()) / (1000 * 60 * 60 * 24),
  );
  if (days < 0)
    return { text: `${Math.abs(days)}d overdue`, cls: "dl-overdue" };
  if (days === 0) return { text: "Due today", cls: "dl-today" };
  if (days <= 3) return { text: `${days}d left`, cls: "dl-urgent" };
  if (days <= 7) return { text: `${days}d left`, cls: "dl-warn" };
  return { text: `${days}d left`, cls: "dl-ok" };
}

function Reminders({ vehicles, drivers, alerts, canManage }) {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(null); // {type, item}
  const [snoozeId, setSnoozeId] = useState(null);
  const [snoozeDays, setSnoozeDays] = useState(3);
  const [confirmDel, setConfirmDel] = useState(null);
  const [deleting, setDeleting] = useState(false);

  /* filters */
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [view, setView] = useState("cards"); // cards | list

  async function load() {
    try {
      setLoading(true);
      setError("");
      const res = await getReminders();
      setReminders(res.data);
    } catch {
      setError("Failed to load reminders.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSync() {
    if (!canManage) return;
    try {
      setSyncing(true);
      await syncReminders();
      await load();
    } catch {
      setError("Sync failed.");
    } finally {
      setSyncing(false);
    }
  }

  async function handleComplete(id) {
    if (!canManage) return;
    await completeReminder(id);
    await load();
  }

  async function handleSnooze(id) {
    if (!canManage) return;
    await snoozeReminder(id, snoozeDays);
    setSnoozeId(null);
    await load();
  }

  async function handleDelete(id) {
    if (!canManage) return;
    setDeleting(true);
    try {
      await deleteReminder(id);
      setConfirmDel(null);
      await load();
    } catch (e) {
      alert(e.response?.data?.message || "Delete failed.");
    } finally {
      setDeleting(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  /* ── derived stats ── */
  const total = reminders.length;
  const overdue = reminders.filter((r) => r.status === "Overdue").length;
  const pending = reminders.filter((r) => r.status === "Pending").length;
  const completed = reminders.filter((r) => r.status === "Completed").length;
  const snoozed = reminders.filter((r) => r.status === "Snoozed").length;
  const highPrio = reminders.filter(
    (r) => r.priority === "High" && r.status !== "Completed",
  ).length;
  const soonCount = reminders.filter((r) => {
    const d = Math.ceil(
      (new Date(r.dueDate) - new Date()) / (1000 * 60 * 60 * 24),
    );
    return d >= 0 && d <= 7 && r.status !== "Completed";
  }).length;

  /* ── filtered list ── */
  const filtered = reminders.filter((r) => {
    if (statusFilter !== "All" && r.status !== statusFilter) return false;
    if (categoryFilter !== "All" && r.category !== categoryFilter) return false;
    if (priorityFilter !== "All" && r.priority !== priorityFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (
        !r.title.toLowerCase().includes(q) &&
        !r.description?.toLowerCase().includes(q) &&
        !r.vehicle?.vehicleNumber?.toLowerCase().includes(q) &&
        !r.driver?.name?.toLowerCase().includes(q)
      )
        return false;
    }
    return true;
  });

  /* sort: overdue first, then by dueDate */
  const sorted = [...filtered].sort((a, b) => {
    const order = { Overdue: 0, Pending: 1, Snoozed: 2, Completed: 3 };
    if (order[a.status] !== order[b.status])
      return order[a.status] - order[b.status];
    return new Date(a.dueDate) - new Date(b.dueDate);
  });

  return (
    <div className="content">
      {/* Header */}
      <div className="page-header">
        <div>
          <h2>Reminders</h2>
          <p>
            {total} reminder{total !== 1 ? "s" : ""} ·{" "}
            {overdue > 0 ? `${overdue} overdue` : "all on track"}
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {canManage && (
            <button
              className="btn btn-ghost"
              onClick={handleSync}
              disabled={syncing}
            >
              {syncing ? "Syncing…" : "Auto-Sync"}
            </button>
          )}
          {canManage && (
            <button
              className="btn btn-primary"
              onClick={() => setModal({ type: "add" })}
            >
              + Add Reminder
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="error" style={{ marginBottom: 16 }}>
          ! {error}
        </div>
      )}

      {/* Stats Row */}
      <div className="rem-stats">
        <RemStat icon="📋" value={total} label="Total" cls="blue" />
        <RemStat icon="" value={pending} label="Pending" cls="orange" />
        <RemStat icon="🚨" value={overdue} label="Overdue" cls="red" />
        <RemStat icon="😴" value={snoozed} label="Snoozed" cls="purple" />
        <RemStat icon="✅" value={completed} label="Completed" cls="green" />
        <RemStat icon="🔔" value={soonCount} label="Due in 7d" cls="cyan" />
        <RemStat icon="🔴" value={highPrio} label="High Prio" cls="pink" />
      </div>

      {/* Filters */}
      <div className="rem-filters">
        <input
          className="search-input"
          placeholder="Search reminders…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="rem-filter-selects">
          <select
            className="rem-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Status</option>
            {["Pending", "Overdue", "Snoozed", "Completed"].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <select
            className="rem-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="All">All Categories</option>
            {Object.keys(CAT_CONFIG).map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <select
            className="rem-select"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="All">All Priorities</option>
            {["High", "Medium", "Low"].map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </div>
        <div className="rem-view-toggle">
          <button
            className={`view-btn ${view === "cards" ? "active" : ""}`}
            onClick={() => setView("cards")}
            title="Card view"
          >
            ⊞
          </button>
          <button
            className={`view-btn ${view === "list" ? "active" : ""}`}
            onClick={() => setView("list")}
            title="List view"
          >
            ☰
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
          <div className="spinner" />
        </div>
      ) : sorted.length === 0 ? (
        <div className="panel">
          <div className="placeholder-panel">
            <div className="ph-icon">🔔</div>
            <h2>
              {reminders.length === 0 ? "No reminders yet" : "No results found"}
            </h2>
            <p>
              {reminders.length === 0
                ? "Add your first reminder or sync to auto-generate from vehicle services."
                : "Try changing filters or search term."}
            </p>
            {reminders.length === 0 && (
              <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                <button className="btn btn-ghost" onClick={handleSync}>
                  Auto-Sync
                </button>
                {canManage && (
                  <button
                    className="btn btn-primary"
                    onClick={() => setModal({ type: "add" })}
                  >
                    + Add Reminder
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      ) : view === "cards" ? (
        <div className="rem-grid">
          {sorted.map((r) => (
            <ReminderCard
              key={r._id}
              r={r}
              onComplete={handleComplete}
              onSnooze={setSnoozeId}
              onEdit={() => canManage && setModal({ type: "edit", item: r })}
              onDelete={canManage ? setConfirmDel : undefined}
            />
          ))}
        </div>
      ) : (
        /* List view */
        <div className="panel">
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Due Date</th>
                  <th>Vehicle / Driver</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((r) => {
                  const dl = daysLeftText(r.dueDate);
                  const sc = STATUS_CONFIG[r.status] || STATUS_CONFIG.Pending;
                  const cat = CAT_CONFIG[r.category] || CAT_CONFIG.Other;
                  return (
                    <tr key={r._id}>
                      <td>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <span style={{ fontSize: 18 }}>{cat.icon}</span>
                          <div>
                            <div style={{ fontWeight: 600 }}>{r.title}</div>
                            {r.description && (
                              <div
                                style={{
                                  fontSize: 11,
                                  color: "#64748b",
                                  marginTop: 1,
                                }}
                              >
                                {r.description.slice(0, 50)}
                                {r.description.length > 50 ? "…" : ""}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>{r.category}</td>
                      <td>
                        <span
                          className={`prio-chip ${PRIORITY_CONFIG[r.priority]?.cls}`}
                        >
                          {PRIORITY_CONFIG[r.priority]?.dot} {r.priority}
                        </span>
                      </td>
                      <td>
                        <div>{dateText(r.dueDate)}</div>
                        <span className={`dl-chip ${dl.cls}`}>{dl.text}</span>
                      </td>
                      <td>
                        {r.vehicle && (
                          <div style={{ fontSize: 12 }}>
                            VM {r.vehicle.vehicleNumber}
                          </div>
                        )}
                        {r.driver && (
                          <div style={{ fontSize: 12 }}>○ {r.driver.name}</div>
                        )}
                        {!r.vehicle && !r.driver && (
                          <span className="muted">—</span>
                        )}
                      </td>
                      <td>
                        <span className={`rem-status-chip ${sc.cls}`}>
                          {sc.icon} {r.status}
                        </span>
                      </td>
                      <td>
                        <div
                          style={{ display: "flex", gap: 6, flexWrap: "wrap" }}
                        >
                          {canManage && r.status !== "Completed" && (
                            <>
                              <button
                                className="btn btn-ghost btn-sm"
                                onClick={() => handleComplete(r._id)}
                              >
                                Done
                              </button>
                              <button
                                className="btn btn-ghost btn-sm"
                                onClick={() => setSnoozeId(r._id)}
                              >
                                Snooze
                              </button>
                            </>
                          )}
                          {canManage && (
                            <button
                              className="btn btn-ghost btn-sm"
                              onClick={() =>
                                setModal({ type: "edit", item: r })
                              }
                            >
                              Edit
                            </button>
                          )}
                          {canManage && !r.isAuto && (
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => setConfirmDel(r)}
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Snooze Popover */}
      {snoozeId && (
        <div
          className="modal-backdrop"
          onMouseDown={(e) => e.target === e.currentTarget && setSnoozeId(null)}
        >
          <div className="modal" style={{ maxWidth: 380 }}>
            <div className="modal-header">
              <h2>😴 Snooze Reminder</h2>
              <button className="modal-close" onClick={() => setSnoozeId(null)}>
                ✕
              </button>
            </div>
            <p style={{ color: "#64748b", marginBottom: 16 }}>
              Snooze this reminder for how many days?
            </p>
            <div className="snooze-btns">
              {[1, 3, 7, 14, 30].map((d) => (
                <button
                  key={d}
                  className={`snooze-btn ${snoozeDays === d ? "active" : ""}`}
                  onClick={() => setSnoozeDays(d)}
                >
                  {d}d
                </button>
              ))}
            </div>
            <div className="form-group" style={{ marginTop: 14 }}>
              <label>Custom Days</label>
              <input
                type="number"
                min={1}
                max={365}
                value={snoozeDays}
                onChange={(e) => setSnoozeDays(+e.target.value)}
              />
            </div>
            <div className="form-actions">
              <button
                className="btn btn-ghost"
                onClick={() => setSnoozeId(null)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={() => handleSnooze(snoozeId)}
              >
                Snooze
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {confirmDel && (
        <div
          className="modal-backdrop"
          onMouseDown={(e) =>
            e.target === e.currentTarget && setConfirmDel(null)
          }
        >
          <div className="modal" style={{ maxWidth: 420 }}>
            <div className="modal-header">
              <h2>Delete Reminder</h2>
              <button
                className="modal-close"
                onClick={() => setConfirmDel(null)}
              >
                ✕
              </button>
            </div>
            <p style={{ color: "#64748b", marginBottom: 20 }}>
              Delete <b>{confirmDel.title}</b>? This cannot be undone.
            </p>
            <div className="form-actions">
              <button
                className="btn btn-ghost"
                onClick={() => setConfirmDel(null)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                style={{ background: "#ef4444" }}
                disabled={deleting}
                onClick={() => handleDelete(confirmDel._id)}
              >
                {deleting ? "Deleting…" : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {modal && (
        <ReminderModal
          type={modal.type}
          item={modal.item}
          vehicles={vehicles}
          drivers={drivers}
          close={() => setModal(null)}
          reload={load}
        />
      )}
    </div>
  );
}

/* ── Stat chip ── */
function RemStat({ icon, value, label, cls }) {
  return (
    <div className={`rem-stat rem-stat-${cls}`}>
      <div className="rem-stat-icon">{icon}</div>
      <div className="rem-stat-val">{value}</div>
      <div className="rem-stat-label">{label}</div>
    </div>
  );
}

/* ── Reminder Card ── */
function ReminderCard({ r, onComplete, onSnooze, onEdit, onDelete }) {
  const cat = CAT_CONFIG[r.category] || CAT_CONFIG.Other;
  const pr = PRIORITY_CONFIG[r.priority] || PRIORITY_CONFIG.Medium;
  const sc = STATUS_CONFIG[r.status] || STATUS_CONFIG.Pending;
  const dl = daysLeftText(r.dueDate);
  const done = r.status === "Completed";

  return (
    <div
      className={`rem-card ${done ? "rem-card-done" : ""} rem-card-${r.status.toLowerCase()}`}
    >
      {/* Top accent bar */}
      <div className="rem-card-bar" style={{ background: cat.color }} />

      {/* Header */}
      <div className="rem-card-head">
        <div
          className="rem-cat-icon"
          style={{ background: cat.color + "20", color: cat.color }}
        >
          {cat.icon}
        </div>
        <div className="rem-card-title-wrap">
          <div className="rem-card-title">{r.title}</div>
          <div className="rem-card-cat">{r.category}</div>
        </div>
        <div className="rem-card-badges">
          <span className={`prio-chip ${pr.cls}`}>
            {pr.dot} {r.priority}
          </span>
          {r.isAuto && <span className="auto-chip">Auto</span>}
        </div>
      </div>

      {/* Description */}
      {r.description && <p className="rem-card-desc">{r.description}</p>}

      {/* Meta */}
      <div className="rem-card-meta">
        <div className="rem-meta-row">
          <span className="rem-meta-icon">📅</span>
          <span>{dateText(r.dueDate)}</span>
          <span className={`dl-chip ${dl.cls}`}>{dl.text}</span>
        </div>
        {r.vehicle && (
          <div className="rem-meta-row">
            <span className="rem-meta-icon">VM</span>
            <span>
              <b>{r.vehicle.vehicleNumber}</b> — {r.vehicle.vehicleName}
            </span>
          </div>
        )}
        {r.driver && (
          <div className="rem-meta-row">
            <span className="rem-meta-icon">○</span>
            <span>
              {r.driver.name} ({r.driver.employeeId})
            </span>
          </div>
        )}
        {r.repeat !== "None" && (
          <div className="rem-meta-row">
            <span className="rem-meta-icon">🔁</span>
            <span>Repeats {r.repeat}</span>
          </div>
        )}
        {r.status === "Snoozed" && r.snoozeUntil && (
          <div className="rem-meta-row">
            <span className="rem-meta-icon">😴</span>
            <span>Snoozed until {dateText(r.snoozeUntil)}</span>
          </div>
        )}
      </div>

      {/* Status + Actions */}
      <div className="rem-card-footer">
        <span className={`rem-status-chip ${sc.cls}`}>
          {sc.icon} {r.status}
        </span>
        <div className="rem-card-actions">
          {!done && (
            <>
              <button
                className="rem-action-btn"
                title="Mark Complete"
                onClick={() => onComplete(r._id)}
              >
                ✅
              </button>
              <button
                className="rem-action-btn"
                title="Snooze"
                onClick={() => onSnooze(r._id)}
              >
                😴
              </button>
            </>
          )}
          <button
            className="rem-action-btn"
            title="Edit"
            onClick={() => onEdit(r)}
          ></button>
          {!r.isAuto && (
            <button
              className="rem-action-btn rem-del-btn"
              title="Delete"
              onClick={() => onDelete(r)}
            ></button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Add / Edit Reminder Modal ── */
function ReminderModal({ type, item, vehicles, drivers, close, reload }) {
  const today = new Date().toISOString().slice(0, 10);
  const init =
    type === "edit" && item
      ? {
          title: item.title,
          description: item.description || "",
          category: item.category,
          priority: item.priority,
          dueDate: item.dueDate ? item.dueDate.slice(0, 10) : today,
          status: item.status,
          vehicle: item.vehicle?._id || "",
          driver: item.driver?._id || "",
          repeat: item.repeat || "None",
        }
      : {
          title: "",
          description: "",
          category: "Other",
          priority: "Medium",
          dueDate: today,
          status: "Pending",
          vehicle: "",
          driver: "",
          repeat: "None",
        };

  const [form, setForm] = useState(init);
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        vehicle: form.vehicle || null,
        driver: form.driver || null,
      };
      if (type === "edit") await updateReminder(item._id, payload);
      else await createReminder(payload);
      close();
      await reload();
    } catch (err) {
      alert(err.response?.data?.message || "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => e.target === e.currentTarget && close()}
    >
      <form className="modal" onSubmit={submit}>
        <div className="modal-header">
          <h2>{type === "edit" ? "Edit Reminder" : "New Reminder"}</h2>
          <button type="button" className="modal-close" onClick={close}>
            ✕
          </button>
        </div>

        <div className="form-grid">
          <div className="form-group full">
            <label>Title</label>
            <input
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="e.g. Oil change due"
              required
            />
          </div>

          <div className="form-group">
            <label>Category</label>
            <select
              value={form.category}
              onChange={(e) => set("category", e.target.value)}
            >
              {Object.keys(CAT_CONFIG).map((c) => (
                <option key={c} value={c}>
                  {CAT_CONFIG[c].icon} {c}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Priority</label>
            <select
              value={form.priority}
              onChange={(e) => set("priority", e.target.value)}
            >
              <option value="High">🔴 High</option>
              <option value="Medium">🟡 Medium</option>
              <option value="Low">🟢 Low</option>
            </select>
          </div>

          <div className="form-group">
            <label>Due Date</label>
            <input
              type="date"
              value={form.dueDate}
              onChange={(e) => set("dueDate", e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Repeat</label>
            <select
              value={form.repeat}
              onChange={(e) => set("repeat", e.target.value)}
            >
              {["None", "Daily", "Weekly", "Monthly", "Yearly"].map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Vehicle (optional)</label>
            <select
              value={form.vehicle}
              onChange={(e) => set("vehicle", e.target.value)}
            >
              <option value="">— None —</option>
              {vehicles.map((v) => (
                <option key={v._id} value={v._id}>
                  {v.vehicleNumber} — {v.vehicleName}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Driver (optional)</label>
            <select
              value={form.driver}
              onChange={(e) => set("driver", e.target.value)}
            >
              <option value="">— None —</option>
              {drivers.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name} ({d.employeeId})
                </option>
              ))}
            </select>
          </div>

          {type === "edit" && (
            <div className="form-group">
              <label>Status</label>
              <select
                value={form.status}
                onChange={(e) => set("status", e.target.value)}
              >
                {["Pending", "Overdue", "Snoozed", "Completed"].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
          )}

          <div className="form-group full">
            <label>Description (optional)</label>
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Additional notes…"
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-ghost" onClick={close}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "Saving…" : type === "edit" ? "Update" : "Add Reminder"}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ================================================================
   SETTINGS MODULE
   ================================================================ */

const SETTING_TABS = [
  { id: "profile", icon: "users", label: "Profile" },
  { id: "company", icon: "vehicle", label: "Company" },
  { id: "notifications", icon: "bell", label: "Notifications" },
  { id: "preferences", icon: "settings", label: "Preferences" },
  { id: "data", icon: "🗄️", label: "Data" },
  { id: "system", icon: "🖥️", label: "System Info" },
];

const PRESET_COLORS = [
  { label: "Indigo", value: "#4f6ef7" },
  { label: "Blue", value: "#2563eb" },
  { label: "Violet", value: "#7c3aed" },
  { label: "Rose", value: "#e11d48" },
  { label: "Orange", value: "#ea580c" },
  { label: "Teal", value: "#0d9488" },
  { label: "Green", value: "#16a34a" },
  { label: "Slate", value: "#475569" },
];
const SIDEBAR_COLORS = [
  { label: "Dark Navy", value: "#0f172a" },
  { label: "Dark Blue", value: "#1e3a5f" },
  { label: "Dark Green", value: "#14532d" },
  { label: "Dark Purple", value: "#3b0764" },
  { label: "Dark Rose", value: "#4c0519" },
  { label: "Charcoal", value: "#1c1c1e" },
];

function SettingsSection({ stats, reload }) {
  const [tab, setTab] = useState("profile");
  const [settings, setSettings] = useState(null);
  const [sysInfo, setSysInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [clearConf, setClearConf] = useState(null); // collection name to clear
  const [clearing, setClearing] = useState(false);

  /* local editable copy */
  const [form, setForm] = useState({});
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  /* ── color helpers (defined before effects) ── */
  function adjustColor(hex, amount) {
    const clean = hex.replace("#", "").padStart(6, "0");
    const num = parseInt(clean, 16);
    const r = Math.min(255, Math.max(0, ((num >> 16) & 0xff) + amount));
    const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + amount));
    const b = Math.min(255, Math.max(0, (num & 0xff) + amount));
    return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
  }
  function hexToLight(hex) {
    const clean = hex.replace("#", "").padStart(6, "0");
    const num = parseInt(clean, 16);
    const r = (num >> 16) & 0xff;
    const g = (num >> 8) & 0xff;
    const b = num & 0xff;
    return `rgba(${r},${g},${b},0.12)`;
  }

  function applyTheme(f) {
    if (!f) return;
    // Primary color
    if (f.primary_color) {
      document.documentElement.style.setProperty("--primary", f.primary_color);
      document.documentElement.style.setProperty(
        "--primary-dark",
        adjustColor(f.primary_color, -25),
      );
      document.documentElement.style.setProperty(
        "--primary-light",
        hexToLight(f.primary_color),
      );
    }
    // Sidebar color
    if (f.sidebar_color) {
      document.documentElement.style.setProperty(
        "--sidebar-bg",
        f.sidebar_color,
      );
    }
    // Theme (light / dark)
    const theme = f.theme || "light";
    document.documentElement.setAttribute("data-theme", theme);
    // Compact mode
    document.documentElement.classList.toggle("compact", !!f.compact_mode);
  }

  async function load() {
    try {
      setLoading(true);
      setError("");
      const res = await getSettings();
      setSettings(res.data);
      setForm(res.data);
      applyTheme(res.data); // apply persisted settings immediately
    } catch {
      setError("Failed to load settings.");
    } finally {
      setLoading(false);
    }
  }

  async function loadSysInfo() {
    setSysInfo(null); // reset to show spinner while refreshing
    try {
      const res = await getSystemInfo();
      setSysInfo(res.data);
    } catch {
      setSysInfo({ _error: true });
    }
  }

  useEffect(() => {
    load();
  }, []); // eslint-disable-line
  useEffect(() => {
    if (tab === "system") loadSysInfo();
  }, [tab]);

  /* apply CSS variables instantly as user changes appearance */
  useEffect(() => {
    if (form.primary_color) applyTheme(form);
  }, [form.primary_color]); // eslint-disable-line
  useEffect(() => {
    if (form.sidebar_color) applyTheme(form);
  }, [form.sidebar_color]); // eslint-disable-line
  useEffect(() => {
    applyTheme(form);
  }, [form.theme]); // eslint-disable-line
  useEffect(() => {
    applyTheme(form);
  }, [form.compact_mode]); // eslint-disable-line

  async function handleSave(e) {
    e?.preventDefault();
    setSaving(true);
    setSaved(false);
    setError("");
    try {
      const res = await updateSettings(form);
      setSettings(res.data);
      setForm(res.data);
      applyTheme(res.data); // re-apply after save in case server normalized values
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  }

  async function handleClear(collection) {
    setClearing(true);
    try {
      await clearCollection(collection);
      setClearConf(null);
      await reload();
    } catch (e) {
      alert(e.response?.data?.message || "Failed to clear data.");
    } finally {
      setClearing(false);
    }
  }

  if (loading)
    return (
      <div className="content">
        <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
          <div className="spinner" />
        </div>
      </div>
    );

  return (
    <div className="content">
      {/* Page header */}
      <div className="page-header">
        <div>
          <h2>Settings</h2>
          <p>Manage your profile, preferences and system configuration</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? "Saving…" : "Save Save Changes"}
        </button>
      </div>

      {error && (
        <div className="error" style={{ marginBottom: 16 }}>
          ! {error}
        </div>
      )}
      {saved && (
        <div className="stg-toast">✅ Settings saved successfully!</div>
      )}

      <div className="stg-layout">
        {/* Sidebar tabs */}
        <aside className="stg-sidebar">
          {SETTING_TABS.map((t) => (
            <button
              key={t.id}
              className={`stg-tab ${tab === t.id ? "active" : ""}`}
              onClick={() => setTab(t.id)}
            >
              <span className="stg-tab-icon">{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </aside>

        {/* Tab Content */}
        <div className="stg-content">
          {/* ── PROFILE ── */}
          {tab === "profile" && (
            <div className="stg-section">
              <div className="stg-section-head">
                <h3>Profile Settings</h3>
                <p>Your personal account information</p>
              </div>
              {/* Avatar preview */}
              <div className="stg-avatar-row">
                <div className="stg-avatar-big">
                  {(form.profile_name || "M").charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 18 }}>
                    {form.profile_name || "—"}
                  </div>
                  <div style={{ color: "var(--text-muted)", fontSize: 13 }}>
                    {form.profile_role || "Admin"}
                  </div>
                  <div style={{ color: "var(--text-muted)", fontSize: 13 }}>
                    {form.profile_email || "—"}
                  </div>
                </div>
              </div>
              <div className="form-grid">
                <StgField
                  label="Full Name"
                  value={form.profile_name || ""}
                  onChange={(v) => set("profile_name", v)}
                  icon="○"
                />
                <StgField
                  label="Email"
                  value={form.profile_email || ""}
                  onChange={(v) => set("profile_email", v)}
                  type="email"
                  icon="@"
                />
                <StgField
                  label="Phone"
                  value={form.profile_phone || ""}
                  onChange={(v) => set("profile_phone", v)}
                  icon="+"
                />
              </div>
            </div>
          )}

          {/* ── COMPANY ── */}
          {tab === "company" && (
            <div className="stg-section">
              <div className="stg-section-head">
                <h3>Company Information</h3>
                <p>Details used in reports and printed documents</p>
              </div>
              <div className="stg-company-preview">
                <div className="stg-co-logo">{form.company_logo || "VM"}</div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 20 }}>
                    {form.company_name || "Your Company"}
                  </div>
                  <div style={{ color: "var(--text-muted)", fontSize: 13 }}>
                    {form.company_address || "—"}
                  </div>
                  {form.company_gst && (
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                      GST: {form.company_gst}
                    </div>
                  )}
                </div>
              </div>
              <div className="form-grid">
                <StgField
                  label="Company Name"
                  value={form.company_name || ""}
                  onChange={(v) => set("company_name", v)}
                  icon="🏢"
                />
                <StgField
                  label="Company Email"
                  value={form.company_email || ""}
                  onChange={(v) => set("company_email", v)}
                  type="email"
                  icon="@"
                />
                <StgField
                  label="Company Phone"
                  value={form.company_phone || ""}
                  onChange={(v) => set("company_phone", v)}
                  icon="+"
                />
                <StgField
                  label="GST Number"
                  value={form.company_gst || ""}
                  onChange={(v) => set("company_gst", v)}
                  icon="📄"
                />
                <StgField
                  label="Logo Emoji"
                  value={form.company_logo || ""}
                  onChange={(v) => set("company_logo", v)}
                  icon="🖼️"
                  placeholder="e.g. VM"
                />
                <div className="form-group full">
                  <label>Address</label>
                  <textarea
                    value={form.company_address || ""}
                    onChange={(e) => set("company_address", e.target.value)}
                    placeholder="Company address…"
                    style={{ minHeight: 70 }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ── NOTIFICATIONS ── */}
          {tab === "notifications" && (
            <div className="stg-section">
              <div className="stg-section-head">
                <h3>Notification Preferences</h3>
                <p>Control which alerts and reminders are active</p>
              </div>

              <div className="stg-group">
                <div className="stg-group-title">Alert Types</div>
                <StgToggle
                  label="Service Due Alerts"
                  sub="Get alerted when vehicle service is approaching"
                  checked={!!form.notif_service_due}
                  onChange={(v) => set("notif_service_due", v)}
                  icon="🔧"
                />
                <StgToggle
                  label="Fuel Reminders"
                  sub="Remind to fill fuel for active vehicles"
                  checked={!!form.notif_fuel_low}
                  onChange={(v) => set("notif_fuel_low", v)}
                  icon="⛽"
                />
                <StgToggle
                  label="License Expiry Alerts"
                  sub="Alert when driver license is expiring"
                  checked={!!form.notif_license_exp}
                  onChange={(v) => set("notif_license_exp", v)}
                  icon="🪪"
                />
                <StgToggle
                  label="Insurance Reminders"
                  sub="Remind before vehicle insurance expires"
                  checked={!!form.notif_insurance}
                  onChange={(v) => set("notif_insurance", v)}
                  icon="🛡️"
                />
              </div>

              <div className="stg-group">
                <div className="stg-group-title">Delivery</div>
                <StgToggle
                  label="Email Notifications"
                  sub="Send alerts to your registered email"
                  checked={!!form.notif_email}
                  onChange={(v) => set("notif_email", v)}
                  icon="@"
                />
                <StgToggle
                  label="Sound Alerts"
                  sub="Play a sound when alerts trigger"
                  checked={!!form.notif_sound}
                  onChange={(v) => set("notif_sound", v)}
                  icon="🔊"
                />
              </div>

              <div className="stg-group">
                <div className="stg-group-title">Thresholds</div>
                <div className="form-grid">
                  <StgField
                    label="Service Due KM Threshold"
                    type="number"
                    value={form.service_due_km ?? 500}
                    onChange={(v) => set("service_due_km", +v)}
                    icon="📏"
                  />
                  <StgField
                    label="License Expiry Days"
                    type="number"
                    value={form.license_exp_days ?? 30}
                    onChange={(v) => set("license_exp_days", +v)}
                    icon="📅"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ── APPEARANCE ── */}
          {tab === "appearance" && (
            <div className="stg-section">
              <div className="stg-section-head">
                <h3>Appearance</h3>
                <p>Customize the look and feel of the app</p>
              </div>

              <div className="stg-group">
                <div className="stg-group-title">Theme</div>
                <div className="stg-theme-row">
                  {["light", "dark"].map((t) => (
                    <button
                      key={t}
                      className={`stg-theme-btn ${form.theme === t ? "active" : ""}`}
                      onClick={() => set("theme", t)}
                    >
                      <span style={{ fontSize: 28 }}>
                        {t === "light" ? "☀️" : "🌙"}
                      </span>
                      <span
                        style={{
                          fontWeight: 600,
                          marginTop: 4,
                          textTransform: "capitalize",
                        }}
                      >
                        {t}
                      </span>
                      {form.theme === t && <span className="stg-check">✓</span>}
                    </button>
                  ))}
                </div>
              </div>

              <div className="stg-group">
                <div className="stg-group-title">Primary Color</div>
                <div className="stg-color-grid">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c.value}
                      className={`stg-color-btn ${form.primary_color === c.value ? "selected" : ""}`}
                      style={{ background: c.value }}
                      onClick={() => set("primary_color", c.value)}
                      title={c.label}
                    >
                      {form.primary_color === c.value && <span>✓</span>}
                    </button>
                  ))}
                  <div className="stg-custom-color">
                    <label>Custom</label>
                    <input
                      type="color"
                      value={form.primary_color || "#4f6ef7"}
                      onChange={(e) => set("primary_color", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="stg-group">
                <div className="stg-group-title">Sidebar Color</div>
                <div className="stg-color-grid">
                  {SIDEBAR_COLORS.map((c) => (
                    <button
                      key={c.value}
                      className={`stg-color-btn ${form.sidebar_color === c.value ? "selected" : ""}`}
                      style={{ background: c.value }}
                      onClick={() => set("sidebar_color", c.value)}
                      title={c.label}
                    >
                      {form.sidebar_color === c.value && <span>✓</span>}
                    </button>
                  ))}
                  <div className="stg-custom-color">
                    <label>Custom</label>
                    <input
                      type="color"
                      value={form.sidebar_color || "#0f172a"}
                      onChange={(e) => set("sidebar_color", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="stg-group">
                <div className="stg-group-title">Layout</div>
                <StgToggle
                  label="Compact Mode"
                  sub="Reduce spacing for denser information display"
                  checked={!!form.compact_mode}
                  onChange={(v) => set("compact_mode", v)}
                  icon="⊞"
                />
              </div>

              {/* Live preview */}
              <div className="stg-preview">
                <div className="stg-preview-label">Preview</div>
                <div
                  className="stg-preview-bar"
                  style={{ background: form.sidebar_color || "#0f172a" }}
                >
                  <div className="stg-preview-logo">VM VehicleMS</div>
                  <div
                    className="stg-preview-nav"
                    style={{ background: form.primary_color || "#4f6ef7" }}
                  >
                    Active
                  </div>
                  <div className="stg-preview-nav-muted">Inactive</div>
                </div>
                <div className="stg-preview-main">
                  <div
                    className="stg-preview-btn"
                    style={{ background: form.primary_color || "#4f6ef7" }}
                  >
                    Button
                  </div>
                  <div className="stg-preview-card">Card Content</div>
                </div>
              </div>
            </div>
          )}

          {/* ── PREFERENCES ── */}
          {tab === "preferences" && (
            <div className="stg-section">
              <div className="stg-section-head">
                <h3>Regional Preferences</h3>
                <p>Currency, units, date format and timezone</p>
              </div>
              <div className="form-grid">
                <StgSelect
                  label="Currency"
                  value={form.currency || "INR"}
                  onChange={(v) => set("currency", v)}
                  options={[
                    "INR",
                    "USD",
                    "EUR",
                    "GBP",
                    "AED",
                    "SGD",
                    "AUD",
                    "CAD",
                  ]}
                  icon="💱"
                />
                <StgField
                  label="Currency Symbol"
                  value={form.currency_symbol || "₹"}
                  onChange={(v) => set("currency_symbol", v)}
                  icon="💰"
                />
                <StgSelect
                  label="Distance Unit"
                  value={form.distance_unit || "km"}
                  onChange={(v) => set("distance_unit", v)}
                  options={["km", "miles"]}
                  icon="📏"
                />
                <StgSelect
                  label="Fuel Unit"
                  value={form.fuel_unit || "L"}
                  onChange={(v) => set("fuel_unit", v)}
                  options={["L", "Gallon"]}
                  icon="⛽"
                />
                <StgSelect
                  label="Date Format"
                  value={form.date_format || "DD MMM YYYY"}
                  onChange={(v) => set("date_format", v)}
                  options={[
                    "DD MMM YYYY",
                    "DD/MM/YYYY",
                    "MM/DD/YYYY",
                    "YYYY-MM-DD",
                  ]}
                  icon="📅"
                />
                <StgSelect
                  label="Timezone"
                  value={form.timezone || "Asia/Kolkata"}
                  onChange={(v) => set("timezone", v)}
                  options={[
                    "Asia/Kolkata",
                    "UTC",
                    "America/New_York",
                    "America/Los_Angeles",
                    "Europe/London",
                    "Europe/Paris",
                    "Asia/Dubai",
                    "Asia/Singapore",
                    "Australia/Sydney",
                  ]}
                  icon="🌍"
                />
              </div>
            </div>
          )}

          {/* ── DATA MANAGEMENT ── */}
          {tab === "data" && (
            <div className="stg-section">
              <div className="stg-section-head">
                <h3>Data Management</h3>
                <p>Export data or clear records — use with caution</p>
              </div>

              <div className="stg-group">
                <div className="stg-group-title">Export Data</div>
                <div className="stg-export-grid">
                  {[
                    {
                      label: "Export Vehicles",
                      icon: "VM",
                      note: "All vehicle records",
                    },
                    {
                      label: "Export Fuel Logs",
                      icon: "⛽",
                      note: "All fuel entries",
                    },
                    {
                      label: "Export Maintenance",
                      icon: "🔧",
                      note: "Service history",
                    },
                    {
                      label: "Export Drivers",
                      icon: "○",
                      note: "Driver profiles",
                    },
                  ].map((ex) => (
                    <div key={ex.label} className="stg-export-card">
                      <div className="stg-export-icon">{ex.icon}</div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>
                          {ex.label}
                        </div>
                        <div
                          style={{ fontSize: 12, color: "var(--text-muted)" }}
                        >
                          {ex.note}
                        </div>
                      </div>
                      <button
                        className="btn btn-ghost btn-sm"
                        style={{ marginLeft: "auto" }}
                        onClick={() =>
                          alert(
                            "Export feature — connect to a CSV/PDF library in production.",
                          )
                        }
                      >
                        ⬇ Export
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="stg-group stg-danger-group">
                <div className="stg-group-title stg-danger-title">
                  ! Danger Zone
                </div>
                <p
                  style={{
                    fontSize: 13,
                    color: "var(--text-muted)",
                    marginBottom: 16,
                  }}
                >
                  These actions permanently delete data and cannot be undone.
                </p>
                <div className="stg-danger-grid">
                  {[
                    {
                      collection: "fuel",
                      label: "Clear Fuel Records",
                      icon: "⛽",
                      color: "#f59e0b",
                    },
                    {
                      collection: "maintenance",
                      label: "Clear Maintenance Records",
                      icon: "🔧",
                      color: "#f59e0b",
                    },
                    {
                      collection: "reminders",
                      label: "Clear All Reminders",
                      icon: "🔔",
                      color: "#ef4444",
                    },
                    {
                      collection: "drivers",
                      label: "Clear All Drivers",
                      icon: "○",
                      color: "#ef4444",
                    },
                    {
                      collection: "vehicles",
                      label: "Clear All Vehicles",
                      icon: "VM",
                      color: "#dc2626",
                    },
                  ].map((d) => (
                    <div key={d.collection} className="stg-danger-row">
                      <span style={{ fontSize: 18 }}>{d.icon}</span>
                      <span style={{ flex: 1, fontWeight: 500, fontSize: 14 }}>
                        {d.label}
                      </span>
                      <button
                        className="btn btn-danger btn-sm"
                        style={{
                          background: d.color + "20",
                          color: d.color,
                          border: `1px solid ${d.color}40`,
                        }}
                        onClick={() => setClearConf(d)}
                      >
                        Clear
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── SYSTEM INFO ── */}
          {tab === "system" && (
            <div className="stg-section">
              <div className="stg-section-head">
                <h3>System Information</h3>
                <p>Live stats about your database and server</p>
              </div>
              {!sysInfo ? (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    padding: 40,
                  }}
                >
                  <div className="spinner" />
                </div>
              ) : sysInfo._error ? (
                <div className="error">
                  ! Failed to load system info.{" "}
                  <button
                    className="link-btn"
                    style={{ display: "inline", border: 0, padding: 0 }}
                    onClick={loadSysInfo}
                  >
                    Retry
                  </button>
                </div>
              ) : (
                <>
                  {/* Fleet Summary */}
                  <div className="stg-group">
                    <div className="stg-group-title">Fleet Summary</div>
                    <div className="stg-sys-grid">
                      {[
                        {
                          label: "Vehicles",
                          value: sysInfo.records.vehicles,
                          icon: "VM",
                        },
                        {
                          label: "Drivers",
                          value: sysInfo.records.drivers,
                          icon: "○",
                        },
                        {
                          label: "Fuel Records",
                          value: sysInfo.records.fuel,
                          icon: "⛽",
                        },
                        {
                          label: "Maintenance",
                          value: sysInfo.records.maintenance,
                          icon: "🔧",
                        },
                        {
                          label: "Reminders",
                          value: sysInfo.records.reminders,
                          icon: "🔔",
                        },
                        {
                          label: "Total Records",
                          value: Object.values(sysInfo.records).reduce(
                            (a, b) => a + b,
                            0,
                          ),
                          icon: "📊",
                        },
                      ].map((s) => (
                        <div key={s.label} className="stg-sys-card">
                          <div className="stg-sys-icon">{s.icon}</div>
                          <div className="stg-sys-val">{s.value}</div>
                          <div className="stg-sys-label">{s.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Database Info */}
                  <div className="stg-group">
                    <div className="stg-group-title">Database</div>
                    <div className="stg-info-table">
                      {[
                        ["Database Name", sysInfo.db.name],
                        ["Host", sysInfo.db.host],
                        ["Port", sysInfo.db.port],
                        ["Data Size", sysInfo.db.dataSize],
                        ["Collections", sysInfo.db.collections],
                      ].map(([k, v]) => (
                        <div key={k} className="stg-info-row">
                          <span className="stg-info-key">{k}</span>
                          <span className="stg-info-val">{v ?? "—"}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Server Info */}
                  <div className="stg-group">
                    <div className="stg-group-title">Server</div>
                    <div className="stg-info-table">
                      {[
                        ["Node.js Version", sysInfo.server.nodeVersion],
                        ["Platform", sysInfo.server.platform],
                        [
                          "Uptime",
                          `${Math.floor(sysInfo.server.uptime / 60)} min`,
                        ],
                        ["Memory Usage", `${sysInfo.server.memoryMB} MB`],
                      ].map(([k, v]) => (
                        <div key={k} className="stg-info-row">
                          <span className="stg-info-key">{k}</span>
                          <span className="stg-info-val">{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* App Info */}
                  <div className="stg-group">
                    <div className="stg-group-title">Application</div>
                    <div className="stg-info-table">
                      {[
                        ["App Name", "Vehicle Management System"],
                        ["Version", "2.0.0"],
                        ["Frontend", "React + Vite"],
                        ["Backend", "Express.js + MongoDB"],
                        ["UI Library", "Custom CSS + Chart.js"],
                      ].map(([k, v]) => (
                        <div key={k} className="stg-info-row">
                          <span className="stg-info-key">{k}</span>
                          <span className="stg-info-val">{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    className="btn btn-ghost"
                    style={{ marginTop: 8 }}
                    onClick={loadSysInfo}
                  >
                    Refresh Stats
                  </button>
                </>
              )}
            </div>
          )}
        </div>
        {/* end stg-content */}
      </div>
      {/* end stg-layout */}

      {/* Confirm Clear Dialog */}
      {clearConf && (
        <div
          className="modal-backdrop"
          onMouseDown={(e) =>
            e.target === e.currentTarget && setClearConf(null)
          }
        >
          <div className="modal" style={{ maxWidth: 440 }}>
            <div className="modal-header">
              <h2>! Clear {clearConf.label}?</h2>
              <button
                className="modal-close"
                onClick={() => setClearConf(null)}
              >
                ✕
              </button>
            </div>
            <p style={{ color: "#64748b", marginBottom: 8 }}>
              This will permanently delete{" "}
              <b>all {clearConf.collection} records</b>. This action{" "}
              <b>cannot be undone</b>.
            </p>
            <p style={{ color: "#ef4444", fontSize: 13, marginBottom: 20 }}>
              Type the collection name to confirm: <b>{clearConf.collection}</b>
            </p>
            <ConfirmInput
              key={clearConf.collection}
              expected={clearConf.collection}
              onConfirm={() => handleClear(clearConf.collection)}
              onCancel={() => setClearConf(null)}
              loading={clearing}
            />
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Confirm Input (type to confirm delete) ── */
function ConfirmInput({ expected, onConfirm, onCancel, loading }) {
  const [val, setVal] = useState("");
  const match = val === expected;
  return (
    <div>
      <input
        className="form-group input"
        style={{
          width: "100%",
          padding: "10px 12px",
          border: `1.5px solid ${match ? "#22c55e" : "#e2e8f0"}`,
          borderRadius: 8,
          font: "inherit",
          outline: "none",
          marginBottom: 16,
        }}
        value={val}
        onChange={(e) => setVal(e.target.value)}
        placeholder={`Type "${expected}" to confirm`}
        autoFocus
      />
      <div className="form-actions">
        <button className="btn btn-ghost" onClick={onCancel}>
          Cancel
        </button>
        <button
          className="btn btn-primary"
          style={{ background: "#ef4444" }}
          disabled={!match || loading}
          onClick={onConfirm}
        >
          {loading ? "Clearing…" : "Yes, Delete All"}
        </button>
      </div>
    </div>
  );
}

/* ── Settings Field ── */
function StgField({
  label,
  value,
  onChange,
  type = "text",
  icon,
  placeholder,
}) {
  return (
    <div className="form-group">
      <label>
        {icon && <span style={{ marginRight: 5 }}>{icon}</span>}
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || ""}
      />
    </div>
  );
}

/* ── Settings Select ── */
function StgSelect({ label, value, onChange, options, icon }) {
  return (
    <div className="form-group">
      <label>
        {icon && <span style={{ marginRight: 5 }}>{icon}</span>}
        {label}
      </label>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

/* ── Toggle Switch ── */
function StgToggle({ label, sub, checked, onChange, icon }) {
  return (
    <div className="stg-toggle-row">
      <span className="stg-toggle-icon">{icon}</span>
      <div className="stg-toggle-info">
        <div className="stg-toggle-label">{label}</div>
        {sub && <div className="stg-toggle-sub">{sub}</div>}
      </div>
      <button
        type="button"
        className={`stg-toggle ${checked ? "on" : ""}`}
        onClick={() => onChange(!checked)}
        aria-pressed={checked}
      >
        <span className="stg-toggle-knob" />
      </button>
    </div>
  );
}

/* ================================================================
   PROFILE SECTION
   ================================================================ */

const AVATAR_COLORS = [
  ["#4f6ef7", "#818cf8"],
  ["#22c55e", "#4ade80"],
  ["#f59e0b", "#fbbf24"],
  ["#ef4444", "#f87171"],
  ["#a855f7", "#c084fc"],
  ["#06b6d4", "#22d3ee"],
  ["#f97316", "#fb923c"],
  ["#ec4899", "#f472b6"],
];

function pickGradient(name = "") {
  const idx = (name.charCodeAt(0) || 0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

function ProfileSection({
  data,
  stats,
  reload,
  navigate,
  authUser,
  setAuthUser,
}) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  /* profile form state */
  const [form, setForm] = useState({
    profile_name: "",
    profile_email: "",
    profile_phone: "",
    profile_role: "",
    company_name: "",
    company_address: "",
    company_email: "",
    company_phone: "",
    company_gst: "",
    company_logo: "",
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  /* password form */
  const [pwd, setPwd] = useState({ current: "", newPwd: "", confirm: "" });
  const [pwdMsg, setPwdMsg] = useState("");
  const [pwdErr, setPwdErr] = useState("");
  const setP = (k, v) => setPwd((p) => ({ ...p, [k]: v }));

  async function loadProfile() {
    try {
      setLoading(true);
      const res = await getSettings();
      const s = res.data;
      setForm({
        profile_name: authUser?.name || "",
        profile_email: authUser?.email || "",
        profile_phone: authUser?.phone || "",
        profile_role: authUser?.role || "Viewer",
        company_name: s.company_name || "",
        company_address: s.company_address || "",
        company_email: s.company_email || "",
        company_phone: s.company_phone || "",
        company_gst: s.company_gst || "",
        company_logo: s.company_logo || "VM",
      });
    } catch {
      setError("Failed to load profile.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProfile();
  }, []); // eslint-disable-line

  async function handleSave(e) {
    e?.preventDefault();
    setSaving(true);
    setSaved(false);
    setError("");
    try {
      const userRes = await authUpdateMe({
        name: form.profile_name,
        phone: form.profile_phone,
      });
      const user = userRes.data.user;
      setAuthUser(user);
      localStorage.setItem("vms_user", JSON.stringify(user));
      if (user.role === "Admin") {
        await updateSettings({
          company_name: form.company_name,
          company_address: form.company_address,
          company_email: form.company_email,
          company_phone: form.company_phone,
          company_gst: form.company_gst,
          company_logo: form.company_logo,
        });
      }
      await reload();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("Failed to save profile.");
    } finally {
      setSaving(false);
    }
  }

  async function handlePasswordSave(e) {
    e.preventDefault();
    setPwdErr("");
    setPwdMsg("");
    if (!pwd.current) {
      setPwdErr("Enter your current password.");
      return;
    }
    if (pwd.newPwd.length < 6) {
      setPwdErr("New password must be at least 6 characters.");
      return;
    }
    if (pwd.newPwd !== pwd.confirm) {
      setPwdErr("Passwords do not match.");
      return;
    }
    setSaving(true);
    try {
      const res = await authChangePassword({
        currentPassword: pwd.current,
        newPassword: pwd.newPwd,
      });
      setPwdMsg(res.data.message || "Password updated successfully!");
      setPwd({ current: "", newPwd: "", confirm: "" });
      setTimeout(() => setPwdMsg(""), 3000);
    } catch (err) {
      setPwdErr(err.response?.data?.message || "Could not update password.");
    } finally {
      setSaving(false);
    }
  }

  const [g1, g2] = pickGradient(form.profile_name);
  const initials =
    form.profile_name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?";

  const joinedDate = new Date(2023, 0, 1).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const TABS = [
    { id: "overview", icon: "👁️", label: "Overview" },
    { id: "edit", icon: "", label: "Edit Info" },
    { id: "company", icon: "vehicle", label: "Company" },
    { id: "security", icon: "•", label: "Security" },
    { id: "activity", icon: "📋", label: "Activity" },
  ];

  if (loading)
    return (
      <div className="content">
        <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
          <div className="spinner" />
        </div>
      </div>
    );

  return (
    <div className="content">
      {error && (
        <div className="error" style={{ marginBottom: 16 }}>
          ! {error}
        </div>
      )}
      {saved && <div className="stg-toast">✅ Profile saved successfully!</div>}

      {/* ── Hero Card ── */}
      <div className="prf-hero">
        <div
          className="prf-hero-bg"
          style={{ background: `linear-gradient(135deg, ${g1}22, ${g2}11)` }}
        />

        <div className="prf-hero-body">
          {/* Big Avatar */}
          <div className="prf-avatar-wrap">
            <div
              className="prf-avatar"
              style={{ background: `linear-gradient(135deg, ${g1}, ${g2})` }}
            >
              {initials}
            </div>
            <div className="prf-avatar-status" title="Online" />
          </div>

          {/* Identity */}
          <div className="prf-identity">
            <h2 className="prf-name">{form.profile_name || "—"}</h2>
            <div className="prf-meta-row">
              <span
                className="prf-role-badge"
                style={{ background: g1 + "22", color: g1 }}
              >
                {form.profile_role || "Admin"}
              </span>
              <span className="prf-dot">·</span>
              <span className="prf-company">
                {form.company_name || "VehicleMS"}
              </span>
            </div>
            <div className="prf-contact-row">
              {form.profile_email && (
                <span className="prf-contact">
                  <span>@</span>
                  {form.profile_email}
                </span>
              )}
              {form.profile_phone && (
                <span className="prf-contact">
                  <span>+</span>
                  {form.profile_phone}
                </span>
              )}
              <span className="prf-contact">
                <span>📅</span>Joined {joinedDate}
              </span>
            </div>
          </div>

          {/* Quick action */}
          <div className="prf-hero-actions">
            <button
              className="btn btn-primary"
              onClick={() => setActiveTab("edit")}
            >
              Edit Profile
            </button>
            <button
              className="btn btn-ghost"
              onClick={() => navigate("settings")}
            >
              ⚙️ Settings
            </button>
          </div>
        </div>

        {/* Fleet stats strip */}
        <div className="prf-stats-strip">
          <PrfStat
            icon="VM"
            label="Total Vehicles"
            value={stats.totalVehicles ?? 0}
            color={g1}
          />
          <PrfStat
            icon="✅"
            label="Active Vehicles"
            value={stats.activeVehicles ?? 0}
            color="#22c55e"
          />
          <PrfStat
            icon="○"
            label="Total Drivers"
            value={stats.totalDrivers ?? 0}
            color="#f59e0b"
          />
          <PrfStat
            icon="🔧"
            label="Maintenance Jobs"
            value={stats.upcomingServices ?? 0}
            color="#a855f7"
          />
          <PrfStat
            icon="⛽"
            label="Fuel Cost"
            value={`₹${Number(stats.totalFuelCost || 0).toLocaleString("en-IN")}`}
            color="#ef4444"
          />
          <PrfStat
            icon="💰"
            label="Maint. Cost"
            value={`₹${Number(stats.totalMaintenanceCost || 0).toLocaleString("en-IN")}`}
            color="#06b6d4"
          />
        </div>
      </div>

      {/* ── Tab Bar ── */}
      <div className="prf-tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`prf-tab ${activeTab === t.id ? "active" : ""}`}
            onClick={() => setActiveTab(t.id)}
          >
            <span>{t.icon}</span> {t.label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ── */}
      {activeTab === "overview" && (
        <div className="prf-grid">
          {/* Info Card */}
          <div className="panel">
            <div className="panel-head">
              <h2>Personal Information</h2>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setActiveTab("edit")}
              >
                Edit
              </button>
            </div>
            <div className="panel-body">
              <div className="prf-info-list">
                <PrfInfoRow
                  icon="○"
                  label="Full Name"
                  value={form.profile_name || "—"}
                />
                <PrfInfoRow
                  icon="@"
                  label="Email"
                  value={form.profile_email || "—"}
                />
                <PrfInfoRow
                  icon="+"
                  label="Phone"
                  value={form.profile_phone || "—"}
                />
                <PrfInfoRow
                  icon="•"
                  label="Role"
                  value={form.profile_role || "—"}
                />
                <PrfInfoRow
                  icon="🏢"
                  label="Company"
                  value={form.company_name || "—"}
                />
                <PrfInfoRow
                  icon=""
                  label="Address"
                  value={form.company_address || "—"}
                />
              </div>
            </div>
          </div>

          {/* Right column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Account Status */}
            <div className="panel">
              <div className="panel-head">
                <h2>Account Status</h2>
              </div>
              <div className="panel-body">
                <div className="prf-status-grid">
                  <div className="prf-status-item">
                    <div className="prf-status-dot green" />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>
                        Account Active
                      </div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                        Logged in
                      </div>
                    </div>
                  </div>
                  <div className="prf-status-item">
                    <div className="prf-status-dot green" />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>
                        Backend Connected
                      </div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                        MongoDB online
                      </div>
                    </div>
                  </div>
                  <div className="prf-status-item">
                    <div className="prf-status-dot blue" />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>
                        Role: {form.profile_role || "Admin"}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                        Full access
                      </div>
                    </div>
                  </div>
                  <div className="prf-status-item">
                    <div className="prf-status-dot yellow" />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>
                        2FA Disabled
                      </div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                        Enable for security
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Permissions */}
            <div className="panel">
              <div className="panel-head">
                <h2>Permissions</h2>
              </div>
              <div className="panel-body">
                <div className="prf-perm-list">
                  {[
                    { label: "View Dashboard", granted: true },
                    { label: "Manage Vehicles", granted: true },
                    { label: "Manage Drivers", granted: true },
                    { label: "View Reports", granted: true },
                    {
                      label: "Edit Settings",
                      granted: form.profile_role === "Admin",
                    },
                    {
                      label: "Clear Data",
                      granted: form.profile_role === "Admin",
                    },
                    { label: "Export Data", granted: true },
                    { label: "Manage Reminders", granted: true },
                  ].map((p) => (
                    <div key={p.label} className="prf-perm-row">
                      <span
                        className={`prf-perm-icon ${p.granted ? "granted" : "denied"}`}
                      >
                        {p.granted ? "✅" : "🚫"}
                      </span>
                      <span style={{ fontSize: 13 }}>{p.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── EDIT INFO TAB ── */}
      {activeTab === "edit" && (
        <div className="panel">
          <div className="panel-head">
            <h2>Edit Personal Information</h2>
            <button
              className="btn btn-primary"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Saving…" : "Save Save"}
            </button>
          </div>
          <div className="panel-body">
            {/* Live avatar preview */}
            <div className="prf-edit-preview">
              <div
                className="prf-avatar prf-avatar-sm"
                style={{ background: `linear-gradient(135deg,${g1},${g2})` }}
              >
                {initials}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16 }}>
                  {form.profile_name || "Your Name"}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--text-muted)",
                    marginTop: 2,
                  }}
                >
                  {form.profile_role} · {form.company_name}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--text-muted)",
                    marginTop: 1,
                  }}
                >
                  {form.profile_email}
                </div>
              </div>
            </div>

            <form onSubmit={handleSave}>
              <div className="form-grid" style={{ marginTop: 20 }}>
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    value={form.profile_name}
                    onChange={(e) => set("profile_name", e.target.value)}
                    placeholder="Your full name"
                  />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={form.profile_email}
                    onChange={(e) => set("profile_email", e.target.value)}
                    placeholder="email@example.com"
                  />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    value={form.profile_phone}
                    onChange={(e) => set("profile_phone", e.target.value)}
                    placeholder="+91 98765 43210"
                  />
                </div>
                <div className="form-group">
                  <label>Role</label>
                  <select
                    value={form.profile_role}
                    onChange={(e) => set("profile_role", e.target.value)}
                  >
                    {["Admin", "Manager", "Supervisor", "Driver", "Viewer"].map(
                      (r) => (
                        <option key={r}>{r}</option>
                      ),
                    )}
                  </select>
                </div>
              </div>
              <div
                className="form-actions"
                style={{
                  marginTop: 20,
                  paddingTop: 16,
                  borderTop: "1px solid var(--border)",
                }}
              >
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={loadProfile}
                >
                  ↩ Reset
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                >
                  {saving ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── COMPANY TAB ── */}
      {activeTab === "company" && (
        <div className="panel">
          <div className="panel-head">
            <h2>Company Information</h2>
            <button
              className="btn btn-primary"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Saving…" : "Save Save"}
            </button>
          </div>
          <div className="panel-body">
            {/* Company preview */}
            <div className="prf-company-card">
              <div className="prf-co-logo">{form.company_logo || "VM"}</div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 20 }}>
                  {form.company_name || "Your Company"}
                </div>
                {form.company_address && (
                  <div
                    style={{
                      fontSize: 13,
                      color: "var(--text-muted)",
                      marginTop: 3,
                    }}
                  >
                    {form.company_address}
                  </div>
                )}
                {form.company_email && (
                  <div
                    style={{
                      fontSize: 13,
                      color: "var(--text-muted)",
                      marginTop: 2,
                    }}
                  >
                    @ {form.company_email}
                  </div>
                )}
                {form.company_gst && (
                  <div
                    style={{
                      fontSize: 12,
                      color: "var(--text-muted)",
                      marginTop: 2,
                    }}
                  >
                    GST: {form.company_gst}
                  </div>
                )}
              </div>
            </div>

            <form onSubmit={handleSave}>
              <div className="form-grid" style={{ marginTop: 20 }}>
                <div className="form-group">
                  <label>Company Name</label>
                  <input
                    value={form.company_name}
                    onChange={(e) => set("company_name", e.target.value)}
                    placeholder="VehicleMS Pvt. Ltd."
                  />
                </div>
                <div className="form-group">
                  <label>Company Email</label>
                  <input
                    type="email"
                    value={form.company_email}
                    onChange={(e) => set("company_email", e.target.value)}
                    placeholder="info@company.com"
                  />
                </div>
                <div className="form-group">
                  <label>Company Phone</label>
                  <input
                    value={form.company_phone}
                    onChange={(e) => set("company_phone", e.target.value)}
                    placeholder="+91 22 1234 5678"
                  />
                </div>
                <div className="form-group">
                  <label>GST Number</label>
                  <input
                    value={form.company_gst}
                    onChange={(e) => set("company_gst", e.target.value)}
                    placeholder="22AAAAA0000A1Z5"
                  />
                </div>
                <div className="form-group">
                  <label>Logo Emoji</label>
                  <input
                    value={form.company_logo}
                    onChange={(e) => set("company_logo", e.target.value)}
                    placeholder="VM"
                    maxLength={4}
                  />
                </div>
                <div className="form-group full">
                  <label>Address</label>
                  <textarea
                    value={form.company_address}
                    onChange={(e) => set("company_address", e.target.value)}
                    placeholder="Company address…"
                    style={{ minHeight: 70 }}
                  />
                </div>
              </div>
              <div
                className="form-actions"
                style={{
                  marginTop: 20,
                  paddingTop: 16,
                  borderTop: "1px solid var(--border)",
                }}
              >
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={loadProfile}
                >
                  ↩ Reset
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                >
                  {saving ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── SECURITY TAB ── */}
      {activeTab === "security" && (
        <div className="prf-grid">
          {/* Change Password */}
          <div className="panel">
            <div className="panel-head">
              <h2>• Change Password</h2>
            </div>
            <div className="panel-body">
              <p
                style={{
                  fontSize: 13,
                  color: "var(--text-muted)",
                  marginBottom: 18,
                }}
              >
                Use a strong password with at least 8 characters, including
                numbers and symbols.
              </p>
              {pwdErr && (
                <div className="error" style={{ marginBottom: 14 }}>
                  ! {pwdErr}
                </div>
              )}
              {pwdMsg && (
                <div
                  style={{
                    background: "#dcfce7",
                    border: "1px solid #bbf7d0",
                    color: "#16a34a",
                    padding: "10px 14px",
                    borderRadius: 8,
                    marginBottom: 14,
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  ✅ {pwdMsg}
                </div>
              )}
              <form onSubmit={handlePasswordSave}>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 14 }}
                >
                  <div className="form-group">
                    <label>Current Password</label>
                    <input
                      type="password"
                      value={pwd.current}
                      onChange={(e) => setP("current", e.target.value)}
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="form-group">
                    <label>New Password</label>
                    <input
                      type="password"
                      value={pwd.newPwd}
                      onChange={(e) => setP("newPwd", e.target.value)}
                      placeholder="••••••••"
                    />
                    {pwd.newPwd.length > 0 && (
                      <div className="prf-pwd-strength">
                        <div className="prf-pwd-bar">
                          {[1, 2, 3, 4].map((i) => (
                            <div
                              key={i}
                              className={`prf-pwd-seg ${
                                pwd.newPwd.length >= i * 2
                                  ? i <= 1
                                    ? "weak"
                                    : i <= 2
                                      ? "fair"
                                      : i <= 3
                                        ? "good"
                                        : "strong"
                                  : ""
                              }`}
                            />
                          ))}
                        </div>
                        <span className="prf-pwd-label">
                          {pwd.newPwd.length < 4
                            ? "Weak"
                            : pwd.newPwd.length < 6
                              ? "Fair"
                              : pwd.newPwd.length < 8
                                ? "Good"
                                : "Strong"}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Confirm New Password</label>
                    <input
                      type="password"
                      value={pwd.confirm}
                      onChange={(e) => setP("confirm", e.target.value)}
                      placeholder="••••••••"
                    />
                    {pwd.confirm && pwd.newPwd !== pwd.confirm && (
                      <span
                        style={{
                          fontSize: 11,
                          color: "#ef4444",
                          marginTop: 3,
                          display: "block",
                        }}
                      >
                        Passwords do not match
                      </span>
                    )}
                  </div>
                </div>
                <div
                  className="form-actions"
                  style={{
                    marginTop: 20,
                    paddingTop: 16,
                    borderTop: "1px solid var(--border)",
                  }}
                >
                  <button type="submit" className="btn btn-primary">
                    Update Password
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Security Tips */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="panel">
              <div className="panel-head">
                <h2>🛡️ Security Tips</h2>
              </div>
              <div className="panel-body">
                <div className="prf-tip-list">
                  {[
                    {
                      icon: "•",
                      tip: "Use a unique password not used on other sites",
                    },
                    {
                      icon: "📱",
                      tip: "Enable two-factor authentication when available",
                    },
                    { icon: "", tip: "Change your password every 90 days" },
                    { icon: "•", tip: "Always logout from shared computers" },
                    {
                      icon: "👁️",
                      tip: "Never share your credentials with others",
                    },
                  ].map((t) => (
                    <div key={t.tip} className="prf-tip-row">
                      <span style={{ fontSize: 18 }}>{t.icon}</span>
                      <span style={{ fontSize: 13 }}>{t.tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="panel">
              <div className="panel-head">
                <h2>🖥️ Active Sessions</h2>
              </div>
              <div className="panel-body">
                <div className="prf-session">
                  <div className="prf-session-icon">💻</div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>
                      Current Device
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                      Windows · Chrome · Active now
                    </div>
                  </div>
                  <span className="prf-session-badge">Current</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── ACTIVITY TAB ── */}
      {activeTab === "activity" && (
        <div className="panel">
          <div className="panel-head">
            <h2>📋 Recent Activity</h2>
          </div>
          <div className="panel-body">
            <div className="prf-timeline">
              {[
                {
                  icon: "VM",
                  color: "#4f6ef7",
                  title: "Vehicle Management System loaded",
                  time: "Just now",
                  desc: "Dashboard accessed",
                },
                {
                  icon: "⚙️",
                  color: "#64748b",
                  title: "Settings updated",
                  time: "2 min ago",
                  desc: "Profile information saved",
                },
                {
                  icon: "🔔",
                  color: "#f59e0b",
                  title: `${stats.upcomingServices || 0} service reminder(s) active`,
                  time: "Today",
                  desc: "Auto-sync from vehicle data",
                },
                {
                  icon: "📊",
                  color: "#22c55e",
                  title: "Reports section viewed",
                  time: "Today",
                  desc: "Overview report generated",
                },
                {
                  icon: "○",
                  color: "#a855f7",
                  title: `${stats.totalDrivers || 0} driver(s) in system`,
                  time: "Today",
                  desc: "Driver records loaded",
                },
                {
                  icon: "VM",
                  color: "#06b6d4",
                  title: `${stats.totalVehicles || 0} vehicle(s) registered`,
                  time: "Today",
                  desc: "Fleet data loaded",
                },
                {
                  icon: "⛽",
                  color: "#ef4444",
                  title: "Fuel cost tracked",
                  time: "This month",
                  desc: `₹${Number(stats.totalFuelCost || 0).toLocaleString("en-IN")} total`,
                },
                {
                  icon: "🔧",
                  color: "#f97316",
                  title: "Maintenance records present",
                  time: "This month",
                  desc: `₹${Number(stats.totalMaintenanceCost || 0).toLocaleString("en-IN")} total`,
                },
              ].map((a, i) => (
                <div className="prf-timeline-item" key={i}>
                  <div className="prf-tl-line" />
                  <div className="prf-tl-dot" style={{ background: a.color }}>
                    <span style={{ fontSize: 12 }}>{a.icon}</span>
                  </div>
                  <div className="prf-tl-content">
                    <div className="prf-tl-title">{a.title}</div>
                    <div className="prf-tl-desc">{a.desc}</div>
                    <div className="prf-tl-time">{a.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Profile sub-components ── */
function PrfStat({ icon, label, value, color }) {
  return (
    <div className="prf-stat">
      <div className="prf-stat-icon" style={{ color }}>
        {icon}
      </div>
      <div className="prf-stat-val">{value}</div>
      <div className="prf-stat-label">{label}</div>
    </div>
  );
}
function PrfInfoRow({ icon, label, value }) {
  return (
    <div className="prf-info-row">
      <span className="prf-info-icon">{icon}</span>
      <span className="prf-info-label">{label}</span>
      <span className="prf-info-val">{value}</span>
    </div>
  );
}

/* ================================================================
   PLACEHOLDER
   ================================================================ */
function PlaceholderSection({ icon, title }) {
  return (
    <div className="content">
      <div className="panel">
        <div className="placeholder-panel">
          <div className="ph-icon">{icon}</div>
          <h2>{title}</h2>
          <p>This module is coming soon in the next development phase.</p>
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   MODAL
   ================================================================ */
function Modal({ type, item, vehicles, close, reload }) {
  const initForm = () => {
    if (type === "vehicle") return { currentKm: 0, nextServiceKm: 10000 };
    if (type === "vehicle-edit") {
      return {
        vehicleNumber: item.vehicleNumber || "",
        vehicleName: item.vehicleName || "",
        type: item.type || "Car",
        owner: item.owner || "",
        currentKm: item.currentKm ?? 0,
        nextServiceKm: item.nextServiceKm ?? 10000,
        status: item.status || "Active",
      };
    }
    if (type === "km") return { currentKm: item.currentKm };
    if (type === "editDriver")
      return {
        ...item,
        licenseExpiry: item.licenseExpiry?.slice(0, 10),
        joiningDate: item.joiningDate?.slice(0, 10),
        assignedVehicle: item.assignedVehicle?._id || "",
      };
    if (type === "assignVehicle")
      return { vehicleId: item.assignedVehicle?._id || "" };
    return {};
  };
  const [form, setForm] = useState(initForm);
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      if (type === "vehicle")
        await createVehicle({
          ...form,
          currentKm: +form.currentKm || 0,
          nextServiceKm: +form.nextServiceKm || 10000,
        });
      if (type === "vehicle-edit")
        await updateVehicle(item._id, {
          ...form,
          currentKm: +form.currentKm || 0,
          nextServiceKm: +form.nextServiceKm || 10000,
        });
      if (type === "km") await updateVehicleKm(item._id, +form.currentKm);
      if (type === "fuel")
        await createFuel({
          ...form,
          odometer: +form.odometer,
          fuelLiters: +form.fuelLiters,
          pricePerLiter: +form.pricePerLiter,
        });
      if (type === "maintenance")
        await createMaintenance({
          ...form,
          odometer: +form.odometer,
          cost: +form.cost || 0,
          nextServiceKm: +form.nextServiceKm,
        });
      if (type === "driver")
        await createDriver({ ...form, experience: +form.experience || 0 });
      if (type === "editDriver")
        await updateDriver(item._id, {
          ...form,
          experience: +form.experience || 0,
        });
      if (type === "assignVehicle")
        await assignVehicle(item._id, form.vehicleId || null);
      close();
      await reload();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const titles = {
    vehicle: "Add Vehicle",
    "vehicle-edit": "Edit Vehicle",
    km: "Update Odometer",
    fuel: "Add Fuel Entry",
    maintenance: "Add Maintenance Record",
    driver: "Add Driver",
    editDriver: "Edit Driver",
    assignVehicle: "Assign Vehicle",
  };

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => e.target === e.currentTarget && close()}
    >
      <form className="modal" onSubmit={submit}>
        <div className="modal-header">
          <h2>{titles[type]}</h2>
          <button
            type="button"
            className="modal-close"
            onClick={close}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {(type === "vehicle" || type === "vehicle-edit") && (
          <div className="form-grid">
            <Field
              label="Vehicle Number"
              value={form.vehicleNumber || ""}
              onChange={(v) => set("vehicleNumber", v)}
            />
            <Field
              label="Vehicle Name"
              value={form.vehicleName || ""}
              onChange={(v) => set("vehicleName", v)}
            />
            <Select
              label="Type"
              value={form.type || "Car"}
              options={["Car", "Bike", "Truck", "SUV", "Bus", "Other"]}
              onChange={(v) => set("type", v)}
            />
            <Field
              label="Owner"
              value={form.owner || ""}
              onChange={(v) => set("owner", v)}
            />
            <Field
              label="Current KM"
              type="number"
              value={form.currentKm || ""}
              onChange={(v) => set("currentKm", v)}
            />
            <Field
              label="Next Service KM"
              type="number"
              value={form.nextServiceKm ?? 10000}
              onChange={(v) => set("nextServiceKm", v)}
            />
            {type === "vehicle-edit" && (
              <Select
                label="Status"
                value={form.status || "Active"}
                options={["Active", "Inactive", "In Service"]}
                onChange={(v) => set("status", v)}
              />
            )}
          </div>
        )}

        {type === "km" && (
          <Field
            label={`New Odometer KM for ${item.vehicleNumber}`}
            type="number"
            value={form.currentKm}
            onChange={(v) => set("currentKm", v)}
          />
        )}

        {type === "fuel" && (
          <div className="form-grid">
            <Select
              label="Vehicle"
              value={form.vehicle || ""}
              options={vehicles.map((v) => ({
                value: v._id,
                label: `${v.vehicleNumber} — ${v.vehicleName}`,
              }))}
              onChange={(v) => set("vehicle", v)}
            />
            <Field
              label="Date"
              type="date"
              value={form.date || new Date().toISOString().slice(0, 10)}
              onChange={(v) => set("date", v)}
            />
            <Field
              label="Odometer KM"
              type="number"
              value={form.odometer || ""}
              onChange={(v) => set("odometer", v)}
            />
            <Field
              label="Fuel Liters"
              type="number"
              value={form.fuelLiters || ""}
              onChange={(v) => set("fuelLiters", v)}
            />
            <Field
              label="Price / Liter"
              type="number"
              value={form.pricePerLiter || 95}
              onChange={(v) => set("pricePerLiter", v)}
            />
          </div>
        )}

        {type === "maintenance" && (
          <div className="form-grid">
            <Select
              label="Vehicle"
              value={form.vehicle || ""}
              options={vehicles.map((v) => ({
                value: v._id,
                label: `${v.vehicleNumber} — ${v.vehicleName}`,
              }))}
              onChange={(v) => set("vehicle", v)}
            />
            <Field
              label="Service Type"
              value={form.serviceType || "Regular Service"}
              onChange={(v) => set("serviceType", v)}
            />
            <Field
              label="Date"
              type="date"
              value={form.date || new Date().toISOString().slice(0, 10)}
              onChange={(v) => set("date", v)}
            />
            <Field
              label="Odometer KM"
              type="number"
              value={form.odometer || ""}
              onChange={(v) => set("odometer", v)}
            />
            <Field
              label="Cost (₹)"
              type="number"
              value={form.cost || ""}
              onChange={(v) => set("cost", v)}
            />
            <Field
              label="Next Service KM"
              type="number"
              value={form.nextServiceKm || ""}
              onChange={(v) => set("nextServiceKm", v)}
            />
            <div className="form-group full">
              <label>Description</label>
              <textarea
                value={form.description || ""}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Optional notes…"
              />
            </div>
          </div>
        )}

        {(type === "driver" || type === "editDriver") && (
          <div className="form-grid">
            <Field
              label="Full Name"
              value={form.name || ""}
              onChange={(v) => set("name", v)}
            />
            <Field
              label="Employee ID"
              value={form.employeeId || ""}
              onChange={(v) => set("employeeId", v)}
            />
            <Field
              label="Phone Number"
              value={form.phone || ""}
              onChange={(v) => set("phone", v)}
            />
            <Field
              label="Email"
              type="email"
              value={form.email || ""}
              onChange={(v) => set("email", v)}
              required={false}
            />
            <Field
              label="License Number"
              value={form.licenseNumber || ""}
              onChange={(v) => set("licenseNumber", v)}
            />
            <Field
              label="License Expiry"
              type="date"
              value={form.licenseExpiry || ""}
              onChange={(v) => set("licenseExpiry", v)}
            />
            <Field
              label="Experience (Years)"
              type="number"
              value={form.experience ?? ""}
              onChange={(v) => set("experience", v)}
              required={false}
            />
            <Select
              label="Status"
              value={form.status || "Active"}
              options={["Active", "Inactive", "On Leave"]}
              onChange={(v) => set("status", v)}
            />
            <div className="form-group full">
              <label>Address</label>
              <textarea
                value={form.address || ""}
                onChange={(e) => set("address", e.target.value)}
                placeholder="Optional address…"
              />
            </div>
          </div>
        )}

        {type === "assignVehicle" && (
          <div>
            <p style={{ marginBottom: 16, color: "#64748b", fontSize: 14 }}>
              Assigning vehicle to <b>{item.name}</b>. Select a vehicle or leave
              empty to unassign.
            </p>
            <div className="form-group">
              <label>Vehicle</label>
              <select
                value={form.vehicleId || ""}
                onChange={(e) => set("vehicleId", e.target.value)}
              >
                <option value="">— Unassign —</option>
                {vehicles.map((v) => (
                  <option key={v._id} value={v._id}>
                    {v.vehicleNumber} — {v.vehicleName} ({v.status})
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        <div className="form-actions">
          <button type="button" className="btn btn-ghost" onClick={close}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, type = "text", value, onChange, required = true }) {
  return (
    <div className="form-group">
      <label>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
      />
    </div>
  );
}

function Select({ label, value, options, onChange }) {
  return (
    <div className="form-group">
      <label>{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} required>
        <option value="">— Select —</option>
        {options.map((o, i) =>
          typeof o === "string" ? (
            <option key={o} value={o}>
              {o}
            </option>
          ) : (
            <option key={i} value={o.value}>
              {o.label}
            </option>
          ),
        )}
      </select>
    </div>
  );
}

/* ================================================================
   PERSONAL APPEARANCE — stored per user
   ================================================================ */
function AppearanceSection({ appearance, setAppearance }) {
  const [saving, setSaving] = useState(false);
  const update = async (patch) => {
    const next = { ...appearance, ...patch };
    setAppearance(next);
    setSaving(true);
    try {
      await updateAppearance(patch);
    } catch {
      /* keep local preference; server will be retried on next change */
    } finally {
      setSaving(false);
    }
  };
  const colors = [
    "#3b82f6",
    "#6366f1",
    "#0ea5e9",
    "#14b8a6",
    "#22c55e",
    "#f59e0b",
    "#f97316",
    "#ec4899",
  ];
  return (
    <div className="content">
      <div className="page-header">
        <div>
          <h2>Appearance</h2>
          <p>Your preferences are private to your account.</p>
        </div>
        {saving && <span className="save-indicator">Saving…</span>}
      </div>
      <div className="appearance-layout">
        <div className="panel appearance-main">
          <div className="panel-head">
            <div>
              <h2>Theme</h2>
              <p className="muted">Choose how VehicleMS looks for you.</p>
            </div>
          </div>
          <div className="theme-cards">
            {[
              { id: "light", title: "Light", desc: "Clean and bright" },
              { id: "dark", title: "Dark", desc: "Comfortable at night" },
              { id: "system", title: "System", desc: "Follow your device" },
            ].map((t) => (
              <button
                key={t.id}
                className={`theme-card ${appearance.theme === t.id ? "selected" : ""}`}
                onClick={() => update({ theme: t.id })}
              >
                <span className="theme-card-icon">
                  <Icon
                    name={
                      t.id === "light"
                        ? "sun"
                        : t.id === "dark"
                          ? "moon"
                          : "settings"
                    }
                    size={20}
                  />
                </span>
                <span>
                  <b>{t.title}</b>
                  <small>{t.desc}</small>
                </span>
                {appearance.theme === t.id && (
                  <span className="theme-selected">✓</span>
                )}
              </button>
            ))}
          </div>
          <div className="appearance-block">
            <h3>Accent color</h3>
            <p className="muted">
              Used for buttons, active states and highlights.
            </p>
            <div className="color-palette">
              {colors.map((c) => (
                <button
                  aria-label={c}
                  title={c}
                  key={c}
                  style={{ background: c }}
                  className={`color-dot ${appearance.primaryColor === c ? "selected" : ""}`}
                  onClick={() => update({ primaryColor: c })}
                >
                  {appearance.primaryColor === c && "✓"}
                </button>
              ))}
            </div>
          </div>
          <div className="appearance-block">
            <h3>Sidebar color</h3>
            <p className="muted">Keep it calm and readable.</p>
            <div className="color-palette">
              {["#0f2747", "#111827", "#172554", "#1e293b", "#334155"].map(
                (c) => (
                  <button
                    aria-label={c}
                    title={c}
                    key={c}
                    style={{ background: c }}
                    className={`color-dot ${appearance.sidebarColor === c ? "selected" : ""}`}
                    onClick={() => update({ sidebarColor: c })}
                  >
                    {appearance.sidebarColor === c && "✓"}
                  </button>
                ),
              )}
            </div>
          </div>
          <div className="appearance-block">
            <label className="preference-row">
              <span>
                <b>Compact mode</b>
                <small>Fit more rows and cards on smaller screens.</small>
              </span>
              <input
                type="checkbox"
                checked={!!appearance.compactMode}
                onChange={(e) => update({ compactMode: e.target.checked })}
              />
            </label>
          </div>
        </div>
        <div className="panel appearance-preview">
          <div className="panel-head">
            <div>
              <h2>Live preview</h2>
              <p className="muted">Changes apply only to your account.</p>
            </div>
          </div>
          <div className="mini-app">
            <div
              className="mini-sidebar"
              style={{ background: appearance.sidebarColor }}
            >
              <div className="mini-brand">
                <Icon name="vehicle" size={16} /> VehicleMS
              </div>
              <div
                className="mini-nav active"
                style={{ background: appearance.primaryColor }}
              >
                <Icon name="dashboard" size={14} /> Dashboard
              </div>
              <div className="mini-nav">
                <Icon name="vehicle" size={14} /> Vehicles
              </div>
              <div className="mini-nav">
                <Icon name="chart" size={14} /> Reports
              </div>
            </div>
            <div className="mini-content">
              <div className="mini-top"></div>
              <div className="mini-cards">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <div className="mini-chart"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RoleRequestsSection() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [reason, setReason] = useState("");
  async function load() {
    setLoading(true);
    try {
      const r = await getRoleRequests();
      setRequests(r.data || []);
    } catch {
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, []);
  async function review(id, action) {
    setBusy(id);
    try {
      await reviewRoleRequest(id, { action, reason });
      setRequests((xs) => xs.filter((x) => x._id !== id));
      setReason("");
    } catch (e) {
      alert(e.response?.data?.message || "Could not review request");
    } finally {
      setBusy("");
    }
  }
  return (
    <div className="content">
      <div className="page-header">
        <div>
          <h2>Role Requests</h2>
          <p>Approve elevated access only when you trust the requester.</p>
        </div>
        <span className="request-count">{requests.length} pending</span>
      </div>
      <div className="request-list">
        {loading ? (
          <div className="panel empty-state">Loading requests…</div>
        ) : requests.length === 0 ? (
          <div className="panel empty-state">
            <Icon name="bell" size={28} />
            <b>No pending requests</b>
            <span>
              New Manager, Supervisor and Driver registrations will appear here.
            </span>
          </div>
        ) : (
          requests.map((r) => (
            <div className="panel request-card" key={r._id}>
              <div className="request-avatar">
                {(r.user?.name || "U").charAt(0).toUpperCase()}
              </div>
              <div className="request-info">
                <b>{r.user?.name}</b>
                <span>{r.user?.email}</span>
                <span>
                  Requested <strong>{r.requestedRole}</strong> ·{" "}
                  {dateText(r.createdAt)}
                </span>
              </div>
              <div className="request-actions">
                <button
                  className="btn btn-primary"
                  disabled={busy === r._id}
                  onClick={() => review(r._id, "approve")}
                >
                  Approve
                </button>
                <button
                  className="btn btn-ghost danger-text"
                  disabled={busy === r._id}
                  onClick={() => review(r._id, "reject")}
                >
                  Reject
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function AuditSection() {
  return (
    <div className="content">
      <div className="page-header">
        <div>
          <h2>Audit Logs</h2>
          <p>Security and administration activity will be surfaced here.</p>
        </div>
      </div>
      <div className="panel empty-state">
        <Icon name="audit" size={30} />
        <b>Audit logging foundation</b>
        <span>
          Use this area for user, role and destructive-action history as the
          fleet grows.
        </span>
      </div>
    </div>
  );
}

/* ================================================================
   ADMIN PORTAL — separate URL + email OTP
   ================================================================ */
function AdminSetupPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });
  const [key, setKey] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    setMsg("");
    try {
      const r = await authAdminSetup(form, key);
      setMsg(r.data.message + " You can now sign in from the Admin Portal.");
    } catch (e) {
      setErr(e.response?.data?.message || "Setup failed.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="admin-auth-root">
      <div className="admin-auth-card">
        <div className="admin-mark">
          <Icon name="vehicle" size={24} />
        </div>
        <div className="admin-kicker">ONE-TIME ADMIN SETUP</div>
        <h1>Create administrator</h1>
        <p>
          This page is only for the initial administrator. It locks
          automatically after an Admin exists.
        </p>
        {err && <div className="auth-error">! {err}</div>}
        {msg && <div className="auth-success">✓ {msg}</div>}
        <form className="auth-form" onSubmit={submit}>
          <div className="auth-field">
            <label>Setup key</label>
            <input
              className="admin-input"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="ADMIN_SETUP_KEY"
              required
            />
          </div>
          <div className="auth-field">
            <label>Full name</label>
            <input
              className="admin-input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div className="auth-field">
            <label>Administrator email</label>
            <input
              className="admin-input"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div className="auth-field">
            <label>Password</label>
            <input
              className="admin-input"
              type="password"
              minLength={8}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>
          <button className="auth-submit" disabled={busy}>
            {busy ? "Creating…" : "Create Administrator"}
          </button>
        </form>
        <button
          className="admin-public-link"
          onClick={() => (window.location.href = "/admin/login")}
        >
          ← Back to Admin Login
        </button>
      </div>
    </div>
  );
}

function AdminAuthPage({ onAuth }) {
  const [step, setStep] = useState("credentials");
  const [form, setForm] = useState({ email: "", password: "" });
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [forgot, setForgot] = useState(false);
  const [fgStep, setFgStep] = useState(1);
  const [fgEmail, setFgEmail] = useState("");
  const [fgOtp, setFgOtp] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");

  async function login(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const r = await authAdminLogin(form);
      if (r.data.adminOtpRequired === false) {
        onAuth(r.data.user, r.data.token);
      } else {
        setStep("otp");
        setMessage(r.data.message || "Verification code sent to your email.");
      }
    } catch (e) {
      setError(e.response?.data?.message || "Administrator login failed.");
    } finally {
      setLoading(false);
    }
  }

  async function verify(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const r = await authAdminVerify({ email: form.email.trim(), otp });
      onAuth(r.data.user, r.data.token);
    } catch (e) {
      setError(e.response?.data?.message || "Invalid verification code.");
    } finally {
      setLoading(false);
    }
  }

  async function requestReset(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await authForgotPassword({ email: fgEmail.trim() });
      setFgStep(2);
      setMessage(
        "If the account exists, a reset code has been sent to the registered email.",
      );
    } catch (e) {
      setError(e.response?.data?.message || "Could not send reset code.");
    } finally {
      setLoading(false);
    }
  }

  async function verifyReset(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const r = await authVerifyOTP({ email: fgEmail.trim(), otp: fgOtp });
      setResetToken(r.data.resetToken);
      setFgStep(3);
    } catch (e) {
      setError(e.response?.data?.message || "Invalid or expired OTP.");
    } finally {
      setLoading(false);
    }
  }

  async function reset(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await authResetPassword({ resetToken, newPassword });
      setForgot(false);
      setFgStep(1);
      setMessage(
        "Password reset successfully. Sign in with your new password.",
      );
    } catch (e) {
      setError(e.response?.data?.message || "Could not reset password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-root admin-auth-root">
      <div className="auth-left">
        <div className="auth-left-inner">
          <div className="auth-brand">
            <div className="auth-brand-icon">
              <Icon name="vehicle" size={18} />
            </div>
            <div>
              <div className="auth-brand-name">VehicleMS</div>
              <div className="auth-brand-sub">Administrator Portal</div>
            </div>
          </div>
          <h1 className="auth-headline">
            Secure fleet control
            <br />
            <span className="auth-headline-accent">for administrators</span>
          </h1>
          <p className="auth-tagline">
            Manage users, fleet operations, permissions and system settings from
            one secure workspace.
          </p>
        </div>
      </div>
      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-card-head">
            <h2>
              {forgot
                ? fgStep === 1
                  ? "Forgot administrator password"
                  : fgStep === 2
                    ? "Verify reset OTP"
                    : "Create new password"
                : step === "credentials"
                  ? "Administrator sign in"
                  : "Verify your email"}
            </h2>
            <p>
              {forgot
                ? "Recover access using your registered administrator email."
                : step === "credentials"
                  ? "Use your administrator credentials to continue."
                  : `A one-time verification code was sent to ${form.email}.`}
            </p>
          </div>
          {error && (
            <div className="auth-error">
              <span>!</span>
              {error}
            </div>
          )}
          {message && (
            <div className="auth-success">
              <span>✓</span>
              {message}
            </div>
          )}

          {!forgot && step === "credentials" && (
            <form className="auth-form" onSubmit={login}>
              <div className="auth-field">
                <label>Administrator Email</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon">@</span>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    autoFocus
                  />
                </div>
              </div>
              <div className="auth-field">
                <div className="auth-field-row">
                  <label>Password</label>
                  <button
                    type="button"
                    className="auth-forgot"
                    onClick={() => {
                      setFgEmail(form.email);
                      setForgot(true);
                      setMessage("");
                      setError("");
                    }}
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon">•</span>
                  <input
                    type="password"
                    required
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                  />
                </div>
              </div>
              <button className="auth-submit" disabled={loading}>
                {loading ? "Signing in…" : "Sign in as Administrator"}
              </button>
            </form>
          )}

          {!forgot && step === "otp" && (
            <form className="auth-form" onSubmit={verify}>
              <div className="auth-field">
                <label>One-time verification code</label>
                <input
                  className="admin-input admin-otp"
                  inputMode="numeric"
                  maxLength={6}
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  autoFocus
                />
              </div>
              <button
                className="auth-submit"
                disabled={loading || otp.length !== 6}
              >
                {loading ? "Verifying…" : "Verify & sign in"}
              </button>
              <button
                type="button"
                className="auth-back-btn"
                onClick={() => {
                  setStep("credentials");
                  setError("");
                }}
              >
                ← Use different account
              </button>
            </form>
          )}

          {forgot && fgStep === 1 && (
            <form className="auth-form" onSubmit={requestReset}>
              <div className="auth-field">
                <label>Administrator Email</label>
                <input
                  className="admin-input"
                  type="email"
                  required
                  value={fgEmail}
                  onChange={(e) => setFgEmail(e.target.value)}
                  autoFocus
                />
              </div>
              <button className="auth-submit" disabled={loading}>
                {loading ? "Sending…" : "Send reset OTP"}
              </button>
            </form>
          )}
          {forgot && fgStep === 2 && (
            <form className="auth-form" onSubmit={verifyReset}>
              <div className="auth-field">
                <label>6-digit OTP</label>
                <input
                  className="admin-input admin-otp"
                  inputMode="numeric"
                  maxLength={6}
                  required
                  value={fgOtp}
                  onChange={(e) => setFgOtp(e.target.value.replace(/\D/g, ""))}
                  autoFocus
                />
              </div>
              <button
                className="auth-submit"
                disabled={loading || fgOtp.length !== 6}
              >
                {loading ? "Verifying…" : "Verify OTP"}
              </button>
            </form>
          )}
          {forgot && fgStep === 3 && (
            <form className="auth-form" onSubmit={reset}>
              <div className="auth-field">
                <label>New Password</label>
                <input
                  className="admin-input"
                  type="password"
                  minLength={8}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoFocus
                />
              </div>
              <button className="auth-submit" disabled={loading}>
                {loading ? "Saving…" : "Reset Password"}
              </button>
            </form>
          )}

          <div className="admin-links">
            {forgot ? (
              <button
                className="admin-public-link"
                onClick={() => {
                  setForgot(false);
                  setFgStep(1);
                  setError("");
                }}
              >
                ← Back to administrator login
              </button>
            ) : (
              <button
                className="admin-public-link"
                onClick={() => (window.location.href = "/admin/setup")}
              >
                First-time administrator setup
              </button>
            )}
            <button
              className="admin-public-link"
              onClick={() => (window.location.href = "/")}
            >
              ← Back to normal sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DriverWorkspace({ vehicles, fuel, maintenance, alerts }) {
  const vehicle = vehicles?.[0];
  const myFuel = fuel || [];
  const myMaintenance = maintenance || [];

  if (!vehicle) {
    return (
      <div className="content driver-workspace">
        <div className="page-header">
          <div>
            <h2>My Vehicle</h2>
            <p>Your assigned vehicle and daily fleet information.</p>
          </div>
        </div>

        <div className="panel driver-empty-card">
          <div className="driver-empty-icon">🚗</div>
          <h3>No Vehicle Assigned</h3>
          <p>
            You don't have a vehicle assigned yet. Please contact your manager
            or administrator.
          </p>
        </div>
      </div>
    );
  }

  const currentKm = Number(vehicle.currentKm || 0);
  const nextServiceKm = Number(vehicle.nextServiceKm || 0);
  const serviceRemaining = Math.max(0, nextServiceKm - currentKm);
  const serviceDue = nextServiceKm > 0 && currentKm >= nextServiceKm;

  const recentFuel = myFuel.slice(0, 5);
  const recentMaintenance = myMaintenance.slice(0, 5);

  return (
    <div className="content driver-workspace">
      {/* Header */}
      <div className="page-header">
        <div>
          <h2>My Vehicle</h2>
          <p>Your assigned vehicle and daily fleet information.</p>
        </div>

        <span className={`status ${serviceDue ? "danger" : "success"}`}>
          {serviceDue ? "Service Due" : "Vehicle Active"}
        </span>
      </div>

      {/* Vehicle Hero Card */}
      <div className="driver-vehicle-card">
        <div className="driver-vehicle-icon">🚗</div>

        <div className="driver-vehicle-info">
          <span className="driver-label">ASSIGNED VEHICLE</span>

          <h1>{vehicle.vehicleNumber}</h1>

          <p>{vehicle.vehicleName || vehicle.type || "Fleet Vehicle"}</p>

          <div className="driver-tags">
            {vehicle.fuelType && <span>{vehicle.fuelType}</span>}

            {vehicle.status && <span>{vehicle.status}</span>}
          </div>
        </div>

        <div className="driver-vehicle-km">
          <span>Current Odometer</span>
          <strong>{currentKm.toLocaleString()}</strong>
          <small>KM</small>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid driver-stats-grid">
        <div className="stat-card">
          <span>Current KM</span>
          <strong>{currentKm.toLocaleString()}</strong>
          <small>Current odometer</small>
        </div>

        <div className="stat-card">
          <span>Next Service</span>
          <strong>
            {nextServiceKm ? serviceRemaining.toLocaleString() : "—"}
          </strong>

          <small>{serviceDue ? "Service is due" : "KM remaining"}</small>
        </div>

        <div className="stat-card">
          <span>Fuel Records</span>
          <strong>{myFuel.length}</strong>
          <small>Total entries</small>
        </div>

        <div className="stat-card">
          <span>Maintenance</span>
          <strong>{myMaintenance.length}</strong>
          <small>Total records</small>
        </div>
      </div>

      {/* Main Grid */}
      <div className="driver-dashboard-grid">
        {/* Vehicle Details */}
        <div className="panel">
          <div className="panel-head">
            <div>
              <h2>Vehicle Details</h2>
              <p>Information about your assigned vehicle.</p>
            </div>
          </div>

          <div className="vehicle-detail-list">
            <div className="vehicle-detail-row">
              <span>Vehicle Number</span>
              <strong>{vehicle.vehicleNumber || "—"}</strong>
            </div>

            <div className="vehicle-detail-row">
              <span>Vehicle Name</span>
              <strong>{vehicle.vehicleName || "—"}</strong>
            </div>

            <div className="vehicle-detail-row">
              <span>Type</span>
              <strong>{vehicle.type || "—"}</strong>
            </div>

            <div className="vehicle-detail-row">
              <span>Fuel Type</span>
              <strong>{vehicle.fuelType || "—"}</strong>
            </div>

            <div className="vehicle-detail-row">
              <span>Odometer</span>
              <strong>{currentKm.toLocaleString()} KM</strong>
            </div>
          </div>
        </div>

        {/* Service Status */}
        <div className="panel">
          <div className="panel-head">
            <div>
              <h2>Service Status</h2>
              <p>Keep your vehicle service up to date.</p>
            </div>
          </div>

          <div className={`service-status-card ${serviceDue ? "due" : "ok"}`}>
            <div className="service-status-icon">{serviceDue ? "!" : "✓"}</div>

            <div>
              <strong>
                {serviceDue ? "Service Required" : "Service On Track"}
              </strong>

              <p>
                {serviceDue
                  ? "Your vehicle has reached its service interval."
                  : nextServiceKm
                    ? `${serviceRemaining.toLocaleString()} KM remaining until next service.`
                    : "Next service information is not available."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Fuel */}
      <div className="panel">
        <div className="panel-head">
          <div>
            <h2>Recent Fuel Entries</h2>
            <p>Your latest fuel records.</p>
          </div>
        </div>

        {recentFuel.length === 0 ? (
          <div className="empty-state">
            <p>No fuel records yet.</p>
          </div>
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Litres</th>
                  <th>Amount</th>
                  <th>Odometer</th>
                </tr>
              </thead>

              <tbody>
                {recentFuel.map((item) => (
                  <tr key={item._id}>
                    <td>
                      {item.date
                        ? new Date(item.date).toLocaleDateString()
                        : "—"}
                    </td>

                    <td>{item.liters ?? item.quantity ?? "—"}</td>

                    <td>
                      ₹
                      {Number(
                        item.totalCost ?? item.amount ?? 0,
                      ).toLocaleString()}
                    </td>

                    <td>
                      {item.odometer
                        ? `${Number(item.odometer).toLocaleString()} KM`
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Maintenance */}
      <div className="panel">
        <div className="panel-head">
          <div>
            <h2>Recent Maintenance</h2>
            <p>Latest maintenance activity for your vehicle.</p>
          </div>
        </div>

        {recentMaintenance.length === 0 ? (
          <div className="empty-state">
            <p>No maintenance records yet.</p>
          </div>
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Service</th>
                  <th>Cost</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {recentMaintenance.map((item) => (
                  <tr key={item._id}>
                    <td>
                      {item.date
                        ? new Date(item.date).toLocaleDateString()
                        : "—"}
                    </td>

                    <td>{item.serviceType || "—"}</td>

                    <td>₹{Number(item.cost || 0).toLocaleString()}</td>

                    <td>
                      <span className="status">
                        {item.status || "Completed"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function UsersSection() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState("");
  const [loadError, setLoadError] = useState("");
  async function load() {
    setLoading(true);
    setLoadError("");
    try {
      const r = await getUsers();
      setUsers(r.data);
    } catch (e) {
      setLoadError(e.response?.data?.message || "Could not load users.");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, []);
  async function change(id, data) {
    setSaving(id);
    try {
      const r = await updateUser(id, data);
      setUsers((xs) => xs.map((u) => (u._id === id ? r.data.user : u)));
    } catch (e) {
      alert(e.response?.data?.message || "Could not update user");
    } finally {
      setSaving("");
    }
  }
  return (
    <div className="content">
      <div className="page-header">
        <div>
          <h2>Users</h2>
          <p>Control roles and account access from one place.</p>
        </div>
      </div>
      <div className="panel">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Access</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5">Loading users…</td>
                </tr>
              ) : loadError ? (
                <tr>
                  <td colSpan="5" className="table-error">
                    {loadError}{" "}
                    <button className="btn btn-ghost" onClick={load}>
                      Retry
                    </button>
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u._id}>
                    <td>
                      <strong>{u.name}</strong>
                    </td>
                    <td>{u.email}</td>
                    <td>
                      <select
                        className="table-select"
                        value={u.role}
                        disabled={saving === u._id || u.role === "Admin"}
                        onChange={(e) =>
                          change(u._id, { role: e.target.value })
                        }
                      >
                        {["Manager", "Supervisor", "Driver", "Viewer"].map(
                          (r) => (
                            <option key={r}>{r}</option>
                          ),
                        )}
                      </select>
                    </td>
                    <td>{u.isActive ? "Active" : "Inactive"}</td>
                    <td>
                      <button
                        className="btn btn-ghost"
                        disabled={saving === u._id}
                        onClick={() => change(u._id, { isActive: !u.isActive })}
                      >
                        {u.isActive ? "Deactivate" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
