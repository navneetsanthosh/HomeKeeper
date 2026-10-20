# HomeKeeper

A beginner project using Django REST Framework and React. The component-based web app includes an overview dashboard, inventory, categories, bucket list, and reminder settings, with private per-user products, bill/photo uploads, warranty tracking, and status updates.

## Run locally on Windows

Open two PowerShell terminals in the unzipped `home-inventory` folder. You do not need to activate the virtual environment; call its Python executable directly. This avoids PowerShell execution-policy errors.

### Terminal 1: Django API

```powershell
cd backend
py -3 -m venv .venv
$venvPython = Join-Path (Get-Location) '.venv\Scripts\python.exe'
& $venvPython -m pip install -r requirements.txt
& $venvPython manage.py makemigrations inventory
& $venvPython manage.py migrate
& $venvPython manage.py runserver
```

If the Python launcher is unavailable, create the environment with `python -m venv .venv` instead. Keep the terminal open while using the app.

### Terminal 2: React web app

```powershell
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 and create an account. The React app is responsive and can be used from a mobile browser; the file picker can offer camera capture on supported devices. Bill OCR currently reads images in English in the browser. The first scan may need internet access to download the OCR language data. Scanned fields are suggestions to review; PDFs are attached but not OCR-scanned.


## Warranty email reminders

1. In the signed-in app, open **Reminders**, enter your email, enable reminders, and save. The schedule is fixed at 30 days, 7 days, and 1 day before expiry.
2. Run a daily reminder check manually from `backend`:

```powershell
& ".\.venv\Scripts\python.exe" manage.py send_warranty_reminders
```

By default, Django prints reminder emails to the backend terminal. This lets you inspect the message without sending email. For real delivery, configure your SMTP provider in environment variables before running Django or the scheduled command; do not commit email passwords to the project:

```powershell
$env:EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
$env:EMAIL_HOST = 'your-smtp-host'
$env:EMAIL_PORT = '587'
$env:EMAIL_USE_TLS = 'true'
$env:EMAIL_HOST_USER = 'your-smtp-username'
$env:EMAIL_HOST_PASSWORD = 'your-smtp-password'
$env:DEFAULT_FROM_EMAIL = 'HomeKeeper <you@example.com>'
```

For automatic daily checks on Windows, create a daily task in Task Scheduler. Set **Program** to the full path of `backend\.venv\Scripts\python.exe`, **Arguments** to `manage.py send_warranty_reminders`, and **Start in** to the full `backend` folder path. Make sure the task runs with the SMTP environment variables configured for that Windows user.

## Scope and next steps

Bill image OCR suggests fields for review before saving. Warranty email checks run through a Django management command; Windows Task Scheduler can run it daily. Real email delivery requires SMTP configuration. For deployment, configure a production secret key, HTTPS, secure cookies, allowed hosts, validated uploads, and private media storage. The included local media serving is for development only.

