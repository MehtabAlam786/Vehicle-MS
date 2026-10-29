/**
 * This is a single-company deployment (only one Admin can ever exist — see
 * adminSetup) with a shared fleet that Admin/Manager/Supervisor/Viewer staff
 * all work from together; permission to create/edit/delete is enforced by
 * role via requireRole()/canManage() below, not by who happens to have
 * created a given record. `createdBy` is kept on every record purely as an
 * audit trail.
 *
 * IMPORTANT: previously this scoped every query to `createdBy: req.user._id`
 * for any non-Admin role. Since only Admins/Managers are allowed to create
 * vehicles and drivers, that meant Supervisor and Viewer accounts — who are
 * explicitly granted permission elsewhere (see fuelRoutes/maintenanceRoutes)
 * to log fuel and maintenance entries, or to simply view the fleet — could
 * never find a vehicle to attach a record to, or ever see any data at all.
 * Every lookup silently came back empty. ownedQuery() no longer restricts by
 * creator; it now only exists as a hook for future multi-tenant support.
 *
 * The Driver role is handled separately in each controller: a Driver only
 * ever sees the single vehicle assigned to them via the Driver record that
 * matches their email, which is a real (and intentional) narrower scope.
 */
export const isAdmin = (user) => user?.role === "Admin";

export function ownedQuery(req, query = {}) {
  return query;
}

export function canManage(req) {
  return ["Admin", "Manager"].includes(req.user?.role);
}

export function requireManager(req, res, next) {
  if (!canManage(req)) {
    return res.status(403).json({ message: "Only Admins and Managers can change fleet records." });
  }
  next();
}
