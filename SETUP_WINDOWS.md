# Vehicle MS — Windows Local Setup

## 1. Server environment

Open PowerShell in the `server` folder:

```powershell
Copy-Item .env.example .env
notepad .env
```

At minimum, set:

```env
MONGO_URI=your-mongodb-connection-string
JWT_SECRET=your-32-plus-character-secret
CLIENT_ORIGIN=http://localhost:5173
```

Generate a strong JWT secret:

```powershell
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Paste the generated value after `JWT_SECRET=`.

## 2. Gmail OTP (Admin)

For Gmail, enable 2-Step Verification on the mailbox and create a Google App Password. Put that 16-character App Password in `SMTP_PASS`.

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your-gmail@gmail.com
SMTP_PASS=your-16-character-google-app-password
MAIL_FROM=VehicleMS <your-gmail@gmail.com>
```

Do not put your normal Gmail password in `.env`.

## 3. Install and run server

```powershell
npm install
npm run dev
```

A successful startup should print the API address.

## 4. Run frontend

Open a second PowerShell window:

```powershell
cd ..\client
npm install
npm run dev
```

Then open the Vite URL shown in the terminal (normally `http://localhost:5173`).

## 5. If you see a missing environment error

Make sure this file exists:

```text
server/.env
```

Do not name it `.env.txt`. In File Explorer, enable **View → Show → File name extensions** if needed.

Never commit `.env` to GitHub.
