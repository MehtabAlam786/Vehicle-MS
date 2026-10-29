import tls from "node:tls";

function readResponse(socket) {
  return new Promise((resolve, reject) => {
    let buffer = "";
    const onData = (chunk) => {
      buffer += chunk.toString();
      const lines = buffer.split(/\r?\n/).filter(Boolean);
      if (!lines.length) return;
      const last = lines[lines.length - 1];
      if (/^\d{3} /.test(last)) {
        socket.off("data", onData);
        resolve(lines.join("\n"));
      }
    };
    socket.on("data", onData);
    socket.once("error", reject);
  });
}

async function smtpCommand(socket, command, expected = /^2|^3/) {
  socket.write(`${command}\r\n`);
  const response = await readResponse(socket);
  const code = Number(response.slice(0, 3));
  if (!expected.test(String(code))) throw new Error(`SMTP ${code}`);
  return response;
}

async function sendSMTP({ host, port, user, pass, from, to, subject, text, html }) {
  const socket = tls.connect({ host, port: Number(port), servername: host, rejectUnauthorized: true });
  await new Promise((resolve, reject) => { socket.once("secureConnect", resolve); socket.once("error", reject); });
  await readResponse(socket);
  await smtpCommand(socket, `EHLO vehiclems.local`, /^2/);
  await smtpCommand(socket, "AUTH LOGIN", /^3/);
  await smtpCommand(socket, Buffer.from(user).toString("base64"), /^3/);
  await smtpCommand(socket, Buffer.from(pass).toString("base64"), /^2/);
  const envelopeFrom = (from.match(/<([^>]+)>/) || [null, from])[1];
  await smtpCommand(socket, `MAIL FROM:<${envelopeFrom}>`, /^2/);
  await smtpCommand(socket, `RCPT TO:<${to}>`, /^2/);
  await smtpCommand(socket, "DATA", /^3/);
  const boundary = `VehicleMS_${Date.now()}`;
  const message = [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    "MIME-Version: 1.0",
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    "",
    `--${boundary}`,
    "Content-Type: text/plain; charset=UTF-8",
    "",
    text,
    `--${boundary}`,
    "Content-Type: text/html; charset=UTF-8",
    "",
    html,
    `--${boundary}--`,
    ".",
  ].join("\r\n");
  socket.write(`${message}\r\n`);
  await readResponse(socket);
  await smtpCommand(socket, "QUIT", /^2/);
  socket.end();
}

export async function sendOTPEmail({ to, name, otp, purpose = "admin-login" }) {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(`[DEV] ${purpose} OTP for ${to}: ${otp}`);
      return { delivered: false, development: true };
    }
    throw new Error("Email service is not configured");
  }
  const subject = purpose === "admin-login" ? "VehicleMS Admin verification code" : "VehicleMS password reset code";
  const action = purpose === "admin-login" ? "complete your administrator sign in" : "reset your VehicleMS password";
  const from = process.env.MAIL_FROM || SMTP_USER;
  await sendSMTP({ host: SMTP_HOST, port: SMTP_PORT, user: SMTP_USER, pass: SMTP_PASS, from, to, subject,
    text: `Hi ${name || "there"}, your VehicleMS verification code is ${otp}. It expires in 10 minutes. Use this code to ${action}. If you did not request this, ignore this email.`,
    html: `<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:28px;color:#243044"><h2>VehicleMS</h2><p>Hi ${name || "there"},</p><p>Your verification code:</p><div style="font-size:32px;font-weight:700;letter-spacing:8px;padding:18px;background:#f4f7fb;border-radius:12px;text-align:center">${otp}</div><p>This code expires in 10 minutes.</p><p style="color:#6b7280;font-size:13px">If you did not request this, ignore this email.</p></div>`
  });
  return { delivered: true };
}


export async function sendRoleRequestEmail({ to, adminName, userName, userEmail, requestedRole }) {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(`[DEV] Role request: ${userName} <${userEmail}> requested ${requestedRole}`);
      return { delivered: false, development: true };
    }
    throw new Error("Email service is not configured");
  }
  const from = process.env.MAIL_FROM || SMTP_USER;
  const subject = `VehicleMS: ${requestedRole} access request`;
  const text = `Hi ${adminName || "Admin"}, ${userName} (${userEmail}) has requested ${requestedRole} access. Sign in to the VehicleMS Admin Portal to review the request.`;
  const html = `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:28px;color:#17213a"><h2>VehicleMS</h2><p>Hi ${adminName || "Admin"},</p><p><b>${userName}</b> (${userEmail}) has requested <b>${requestedRole}</b> access.</p><p>Sign in to the secure VehicleMS Admin Portal to approve or reject this request.</p></div>`;
  await sendSMTP({ host: SMTP_HOST, port: SMTP_PORT, user: SMTP_USER, pass: SMTP_PASS, from, to, subject, text, html });
  return { delivered: true };
}
