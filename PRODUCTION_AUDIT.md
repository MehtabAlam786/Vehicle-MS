# Vehicle-MS Production Hardening

## Completed

- Security headers and API/authentication rate limiting.
- Proxy-aware IP handling configuration.
- Sensitive authentication error details removed from responses.
- Strong JWT secret startup validation.
- User role default changed to Viewer.
- Cryptographically secure password-reset OTP generation.
- Password-reset OTP no longer returned to clients.
- Password-reset session token hashed at rest.
- Driver update mass-assignment protection.
- Driver-to-vehicle tenant authorization.
- Reminder mass-assignment protection and related-record authorization.
- Tenant-scoped reminder synchronization/statistics and generated reminders.
- Tenant-scoped report/system data operations.
- Generic settings can no longer overwrite authenticated user identity.
- Common tenant/status/date database indexes.
- Sensible core model bounds.
- Corrected fuel-efficiency reporting to use odometer distance between fuel entries.
- Database-aware `/api/health` endpoint.
- Graceful SIGTERM/SIGINT shutdown.

## Before public launch

- Connect password-reset delivery to a real email/SMS provider.
- Run dependency installation and the production client build in CI/CD.
- Add automated unit/API/end-to-end tests.
- Prefer secure HttpOnly SameSite cookies for browser authentication where appropriate.
- Add centralized structured logging and external error monitoring.
- Configure MongoDB backups and restore drills.
- Use Redis-backed rate limiting for multi-instance deployments.
- Add pagination/aggregation to high-volume reporting endpoints as the dataset grows.

## Fixes applied — this pass

- **Supervisor role couldn't actually log fuel/maintenance entries.** Routes
  explicitly allow `Supervisor` to create fuel and maintenance records, but
  `ownedQuery()` scoped every lookup to `createdBy === current user`, and only
  Admin/Manager can create vehicles. So a Supervisor's vehicle lookup always
  came back empty and every attempt failed with "Vehicle not found." Same
  issue silently emptied the `Viewer` role's entire dashboard/vehicle list.
  Fixed by making `ownedQuery()` a shared-fleet query (this is a single-company
  deployment — only one Admin can ever exist) and letting `requireRole()` be
  the sole authorization boundary for writes, as it already was intended to
  be. `createdBy` is still stamped on every record for audit purposes.
  **If you actually want separate Managers to each have their own private,
  isolated fleet, tell your developer — that needs a real "team/organization"
  field on `User`, not the old `createdBy` filter, since a Supervisor/Viewer
  had no way to be linked to "their" Manager's data anyway.**
- **Report endpoints were broken for the Driver role.** `getOverview`,
  `getFuelReport`, `getMaintenanceReport`, and `getVehicleReport` never
  special-cased `Driver` the way the dashboard/vehicle/fuel/maintenance
  controllers already did, so a Driver's reports came back empty instead of
  showing their assigned vehicle's data. Fixed with a shared `scopedQueries()`
  helper, with care taken so a `?vehicleId=` query param or `:id` route param
  can never be used to make a Driver see another vehicle's report.
- **Mass-assignment gap in `createMaintenance`.** It spread `...req.body`
  directly into `Maintenance.create()` instead of allow-listing fields like
  every other controller does. Fixed with a `pickMaintenanceFields()` helper.
- **Client: `UsersSection` had no error handling.** A failed `/api/users`
  request left "Loading users…" stuck forever with a silent console error.
  Added proper error state, a message, and a retry button.
- Minor cleanup: `.index()` calls in the Mongoose models were declared after
  `mongoose.model(...)` (harmless, but confusing); moved above the export and
  dropped the now-unused `createdBy`-leading compound indexes in favor of the
  fields these queries actually filter on.

