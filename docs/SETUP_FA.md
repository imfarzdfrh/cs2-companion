# راهنمای اجرای پروژه

این مخزن دو برنامه مستقل Nuxt دارد: اپ موبایل با طراحی اختصاصی برای مرورگر گوشی و وب‌سایت دسکتاپ. هر دو از API مشترک FastAPI استفاده می‌کنند. برای توسعه و تست نسخه موبایل نیازی به Android Studio نداریم.

## پیش‌نیاز

- Node.js 24
- Python 3.12 و venv
- pnpm 11.25.0
- برای تست روی گوشی: کامپیوتر و گوشی روی یک شبکه Wi-Fi

## اجرای محلی روی کامپیوتر

از ریشه پروژه:

```bash
npm install -g pnpm@11.25.0
pnpm install --frozen-lockfile
cp .env.example backend/.env
cd backend
python3.12 -m venv .venv
source .venv/bin/activate
pip install -r requirements.lock.txt
alembic upgrade head
uvicorn app.main:app --host 127.0.0.1 --port 8000
```

در ترمینال دوم، از ریشه پروژه:

```bash
pnpm dev:mobile
```

در ترمینال سوم، برای وب‌سایت دسکتاپ:

```bash
pnpm dev:website
```

- اپ موبایل Nuxt: `http://localhost:3000`
- وب‌سایت: `http://localhost:3001`
- مستندات API: `http://localhost:8000/docs`

برای مشاهده امکانات بدون اتصال حساب، گزینه **Explore demo** را بزن. داده‌های نمونه با برچسب DEMO نمایش داده می‌شوند.

## تست روی گوشی واقعی

برای اجرای نسخه موبایل در مرورگر گوشی، راهنمای [تست موبایل با Wi-Fi](MOBILE_TESTING.md) را دنبال کن.

نکته مهم: `localhost` در مرورگر گوشی به خود گوشی اشاره می‌کند، نه کامپیوتر. باید IP شبکه کامپیوتر را برای آدرس API و سایت موبایل استفاده کنی و سرور Nuxt و FastAPI را برای دسترسی شبکه اجرا کنی.

## کلیدها و امنیت

کلیدهای Steam و FACEIT فقط در `backend/.env` قرار می‌گیرند. هیچ کلید محرمانه‌ای را در Vue یا متغیرهای `NUXT_PUBLIC_*` قرار نده.

ورود Steam در نسخه وب پیاده‌سازی شده ولی باید با حساب واقعی و آدرس‌های درست محیط خودت تست شود. اتصال FACEIT از طریق SteamID عمومی است و OAuth مستقل FACEIT محسوب نمی‌شود. Push، تأیید خودکار Match در بازی، خریدوفروش اسکین و موجودی واقعی Steam فعال نیستند.

## بررسی کیفیت

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm exec playwright install chromium
pnpm exec playwright test
```

برای تست بک‌اند:

```bash
cd backend
source .venv/bin/activate
pytest -q
```

این پروژه هنوز نسخه آماده انتشار عمومی نیست؛ محدودیت‌ها و موارد باقی‌مانده در `docs/VERIFICATION.md` ثبت شده‌اند.
