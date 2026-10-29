// // import tls from "node:tls";

// // function readResponse(socket) {
// //   return new Promise((resolve, reject) => {
// //     let buffer = "";
// //     const onData = (chunk) => {
// //       buffer += chunk.toString();
// //       const lines = buffer.split(/\r?\n/).filter(Boolean);
// //       if (!lines.length) return;
// //       const last = lines[lines.length - 1];
// //       if (/^\d{3} /.test(last)) {
// //         socket.off("data", onData);
// //         resolve(lines.join("\n"));
// //       }
// //     };
// //     socket.on("data", onData);
// //     socket.once("error", reject);
// //   });
// // }

// // async function smtpCommand(socket, command, expected = /^2|^3/) {
// //   socket.write(`${command}\r\n`);
// //   const response = await readResponse(socket);
// //   const code = Number(response.slice(0, 3));
// //   if (!expected.test(String(code))) throw new Error(`SMTP ${code}`);
// //   return response;
// // }

// // async function sendSMTP({ host, port, user, pass, from, to, subject, text, html }) {
// //   const socket = tls.connect({ host, port: Number(port), servername: host, rejectUnauthorized: true });
// //   await new Promise((resolve, reject) => { socket.once("secureConnect", resolve); socket.once("error", reject); });
// //   await readResponse(socket);
// //   await smtpCommand(socket, `EHLO vehiclems.local`, /^2/);
// //   await smtpCommand(socket, "AUTH LOGIN", /^3/);
// //   await smtpCommand(socket, Buffer.from(user).toString("base64"), /^3/);
// //   await smtpCommand(socket, Buffer.from(pass).toString("base64"), /^2/);
// //   const envelopeFrom = (from.match(/<([^>]+)>/) || [null, from])[1];
// //   await smtpCommand(socket, `MAIL FROM:<${envelopeFrom}>`, /^2/);
// //   await smtpCommand(socket, `RCPT TO:<${to}>`, /^2/);
// //   await smtpCommand(socket, "DATA", /^3/);
// //   const boundary = `VehicleMS_${Date.now()}`;
// //   const message = [
// //     `From: ${from}`,
// //     `To: ${to}`,
// //     `Subject: ${subject}`,
// //     "MIME-Version: 1.0",
// //     `Content-Type: multipart/alternative; boundary="${boundary}"`,
// //     "",
// //     `--${boundary}`,
// //     "Content-Type: text/plain; charset=UTF-8",
// //     "",
// //     text,
// //     `--${boundary}`,
// //     "Content-Type: text/html; charset=UTF-8",
// //     "",
// //     html,
// //     `--${boundary}--`,
// //     ".",
// //   ].join("\r\n");
// //   socket.write(`${message}\r\n`);
// //   await readResponse(socket);
// //   await smtpCommand(socket, "QUIT", /^2/);
// //   socket.end();
// // }

// // export async function sendOTPEmail({ to, name, otp, purpose = "admin-login" }) {
// //   const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
// //   if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
// //     if (process.env.NODE_ENV !== "production") {
// //       console.warn(`[DEV] ${purpose} OTP for ${to}: ${otp}`);
// //       return { delivered: false, development: true };
// //     }
// //     throw new Error("Email service is not configured");
// //   }
// //   const subject = purpose === "admin-login" ? "VehicleMS Admin verification code" : "VehicleMS password reset code";
// //   const action = purpose === "admin-login" ? "complete your administrator sign in" : "reset your VehicleMS password";
// //   const from = process.env.MAIL_FROM || SMTP_USER;
// //   await sendSMTP({ host: SMTP_HOST, port: SMTP_PORT, user: SMTP_USER, pass: SMTP_PASS, from, to, subject,
// //     text: `Hi ${name || "there"}, your VehicleMS verification code is ${otp}. It expires in 10 minutes. Use this code to ${action}. If you did not request this, ignore this email.`,
// //     html: `<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:28px;color:#243044"><h2>VehicleMS</h2><p>Hi ${name || "there"},</p><p>Your verification code:</p><div style="font-size:32px;font-weight:700;letter-spacing:8px;padding:18px;background:#f4f7fb;border-radius:12px;text-align:center">${otp}</div><p>This code expires in 10 minutes.</p><p style="color:#6b7280;font-size:13px">If you did not request this, ignore this email.</p></div>`
// //   });
// //   return { delivered: true };
// // }

// // export async function sendRoleRequestEmail({ to, adminName, userName, userEmail, requestedRole }) {
// //   const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
// //   if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
// //     if (process.env.NODE_ENV !== "production") {
// //       console.warn(`[DEV] Role request: ${userName} <${userEmail}> requested ${requestedRole}`);
// //       return { delivered: false, development: true };
// //     }
// //     throw new Error("Email service is not configured");
// //   }
// //   const from = process.env.MAIL_FROM || SMTP_USER;
// //   const subject = `VehicleMS: ${requestedRole} access request`;
// //   const text = `Hi ${adminName || "Admin"}, ${userName} (${userEmail}) has requested ${requestedRole} access. Sign in to the VehicleMS Admin Portal to review the request.`;
// //   const html = `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:28px;color:#17213a"><h2>VehicleMS</h2><p>Hi ${adminName || "Admin"},</p><p><b>${userName}</b> (${userEmail}) has requested <b>${requestedRole}</b> access.</p><p>Sign in to the secure VehicleMS Admin Portal to approve or reject this request.</p></div>`;
// //   await sendSMTP({ host: SMTP_HOST, port: SMTP_PORT, user: SMTP_USER, pass: SMTP_PASS, from, to, subject, text, html });
// //   return { delivered: true };
// // }

// import nodemailer from "nodemailer";

// async function sendSMTP({
//   host,
//   port,
//   user,
//   pass,
//   from,
//   to,
//   subject,
//   text,
//   html,
// }) {
//   const smtpPort = Number(port);

//   if (![465, 587].includes(smtpPort)) {
//     throw new Error("SMTP_PORT must be 465 or 587");
//   }

//   const transporter = nodemailer.createTransport({
//     host,
//     port: smtpPort,
//     secure: smtpPort === 465,
//     auth: {
//       user,
//       pass,
//     },
//     connectionTimeout: 15000,
//     greetingTimeout: 15000,
//     socketTimeout: 20000,
//   });

//   try {
//     await transporter.sendMail({
//       from,
//       to,
//       subject,
//       text,
//       html,
//     });
//   } finally {
//     transporter.close();
//   }
// }

// export async function sendOTPEmail({ to, name, otp, purpose = "admin-login" }) {
//   const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

//   if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
//     if (process.env.NODE_ENV !== "production") {
//       console.warn(`[DEV] ${purpose} OTP generated for ${to}`);
//       return { delivered: false, development: true };
//     }

//     throw new Error("Email service is not configured");
//   }

//   const subject =
//     purpose === "admin-login"
//       ? "VehicleMS Admin verification code"
//       : "VehicleMS password reset code";

//   const action =
//     purpose === "admin-login"
//       ? "complete your administrator sign in"
//       : "reset your VehicleMS password";

//   const from = process.env.MAIL_FROM || SMTP_USER;

//   const safeName = escapeHTML(name || "there");
//   const safeOTP = escapeHTML(String(otp));

//   const text = [
//     `Hi ${name || "there"},`,
//     "",
//     `Your VehicleMS verification code is ${otp}.`,
//     "It expires in 10 minutes.",
//     `Use this code to ${action}.`,
//     "If you did not request this, ignore this email.",
//   ].join("\n");

//   const html = `
//     <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:28px;color:#243044">
//       <h2>VehicleMS</h2>
//       <p>Hi ${safeName},</p>
//       <p>Your verification code:</p>
//       <div style="font-size:32px;font-weight:700;letter-spacing:8px;padding:18px;background:#f4f7fb;border-radius:12px;text-align:center">
//         ${safeOTP}
//       </div>
//       <p>This code expires in 10 minutes.</p>
//       <p style="color:#6b7280;font-size:13px">
//         If you did not request this, ignore this email.
//       </p>
//     </div>
//   `;

//   await sendSMTP({
//     host: SMTP_HOST,
//     port: SMTP_PORT,
//     user: SMTP_USER,
//     pass: SMTP_PASS,
//     from,
//     to,
//     subject,
//     text,
//     html,
//   });

//   return { delivered: true };
// }

// export async function sendRoleRequestEmail({
//   to,
//   adminName,
//   userName,
//   userEmail,
//   requestedRole,
// }) {
//   const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

//   if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
//     if (process.env.NODE_ENV !== "production") {
//       console.warn(`[DEV] Role request generated for ${userEmail}`);

//       return { delivered: false, development: true };
//     }

//     throw new Error("Email service is not configured");
//   }

//   const from = process.env.MAIL_FROM || SMTP_USER;

//   const safeAdminName = escapeHTML(adminName || "Admin");
//   const safeUserName = escapeHTML(userName || "User");
//   const safeUserEmail = escapeHTML(userEmail || "");
//   const safeRole = escapeHTML(requestedRole || "unknown");

//   const subject = `VehicleMS: ${requestedRole} access request`;

//   const text = [
//     `Hi ${adminName || "Admin"},`,
//     "",
//     `${userName} (${userEmail}) has requested ${requestedRole} access.`,
//     "Sign in to the VehicleMS Admin Portal to review the request.",
//   ].join("\n");

//   const html = `
//     <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:28px;color:#17213a">
//       <h2>VehicleMS</h2>
//       <p>Hi ${safeAdminName},</p>
//       <p>
//         <b>${safeUserName}</b> (${safeUserEmail})
//         has requested <b>${safeRole}</b> access.
//       </p>
//       <p>
//         Sign in to the secure VehicleMS Admin Portal
//         to approve or reject this request.
//       </p>
//     </div>
//   `;

//   await sendSMTP({
//     host: SMTP_HOST,
//     port: SMTP_PORT,
//     user: SMTP_USER,
//     pass: SMTP_PASS,
//     from,
//     to,
//     subject,
//     text,
//     html,
//   });

//   return { delivered: true };
// }

// function escapeHTML(value) {
//   return String(value).replace(/[&<>"']/g, (character) => {
//     const entities = {
//       "&": "&amp;",
//       "<": "&lt;",
//       ">": "&gt;",
//       '"': "&quot;",
//       "'": "&#39;",
//     };

//     return entities[character];
//   });
// }

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[character];
  });
}

async function sendEmail({ to, subject, text, html }) {
  console.log("sendEmail called for:", to);
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  const from = process.env.MAIL_FROM || "VehicleMS <onboarding@resend.dev>";

  const { data, error } = await resend.emails.send({
    from,
    to: [to],
    subject,
    text,
    html,
  });

  if (error) {
    console.error("Resend email error:", error);
    throw new Error(error.message || "Failed to send email");
  }

  console.log("Email sent successfully:", data?.id);
  return { delivered: true, id: data?.id };
}

export async function sendOTPEmail({ to, name, otp, purpose = "admin-login" }) {
  const safeName = escapeHTML(name || "there");
  const safeOTP = escapeHTML(String(otp));

  const isAdminLogin = purpose === "admin-login";

  const subject = isAdminLogin
    ? "VehicleMS Admin verification code"
    : "VehicleMS password reset code";

  const action = isAdminLogin
    ? "complete your administrator sign in"
    : "reset your VehicleMS password";

  const text = [
    `Hi ${name || "there"},`,
    "",
    `Your VehicleMS verification code is ${otp}.`,
    "It expires in 10 minutes.",
    `Use this code to ${action}.`,
    "If you did not request this, ignore this email.",
  ].join("\n");

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:28px;color:#243044">
      <h2>VehicleMS</h2>
      <p>Hi ${safeName},</p>
      <p>Your verification code:</p>
      <div style="font-size:32px;font-weight:700;letter-spacing:8px;padding:18px;background:#f4f7fb;border-radius:12px;text-align:center">
        ${safeOTP}
      </div>
      <p>This code expires in 10 minutes.</p>
      <p style="color:#6b7280;font-size:13px">
        If you did not request this, ignore this email.
      </p>
    </div>
  `;

  return sendEmail({ to, subject, text, html });
}

export async function sendRoleRequestEmail({
  to,
  adminName,
  userName,
  userEmail,
  requestedRole,
}) {
  const safeAdminName = escapeHTML(adminName || "Admin");
  const safeUserName = escapeHTML(userName || "User");
  const safeUserEmail = escapeHTML(userEmail || "");
  const safeRole = escapeHTML(requestedRole || "unknown");

  const subject = `VehicleMS: ${requestedRole} access request`;

  const text = [
    `Hi ${adminName || "Admin"},`,
    "",
    `${userName} (${userEmail}) has requested ${requestedRole} access.`,
    "Sign in to the VehicleMS Admin Portal to review the request.",
  ].join("\n");

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:28px;color:#17213a">
      <h2>VehicleMS</h2>
      <p>Hi ${safeAdminName},</p>
      <p>
        <b>${safeUserName}</b> (${safeUserEmail})
        has requested <b>${safeRole}</b> access.
      </p>
      <p>Sign in to the secure VehicleMS Admin Portal to approve or reject the request.</p>
    </div>
  `;

  return sendEmail({ to, subject, text, html });
}
