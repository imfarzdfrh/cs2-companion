# راهنمای اجرای پروژه

این خروجی «فاندیشن قابل توسعه» است؛ هنوز نسخه آماده انتشار عمومی نیست. اپ موبایل و سایت، دو برنامه جدا هستند.

## اجرا

پیش‌نیاز: Node.js 24، Python 3.12 و بسته venv. از ریشه پروژه:

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

ترمینال دوم، از ریشه پروژه:

```bash
pnpm dev:mobile
```

ترمینال سوم، از ریشه پروژه:

```bash
pnpm dev:website
```

- موبایل: `http://localhost:3000`
- سایت: `http://localhost:3001`
- مستندات API: `http://localhost:8000/docs`

برای دیدن طراحی بدون کلید API، **Explore demo** را بزن. تنظیم تم در Profile است. داده‌های نمونه به‌صورت واضح برچسب دارند.

کلیدهای Steam و FACEIT را فقط در `backend/.env` قرار بده. هیچ کلیدی را داخل فایل‌های Vue یا متغیر `NUXT_PUBLIC_*` نگذار.

ورود Steam در نسخه وب پیاده‌سازی شده ولی با حساب واقعی در این محیط آزمایش نشده. ورود Native اندروید، Push، Accept از موبایل، خریدوفروش اسکین و اتصال موجودی واقعی فعال نیستند. تصاویر اسلحه‌ها طرح مفهومی مستقل‌اند و اسکین واقعی حساب تو نیستند.

برای ساخت اندروید راهنمای `ANDROID.md` را بخوان. فایل APK آماده و تست‌شده در این تحویل وجود ندارد. هیچ تغییری در مخزن قدیمی انجام نشده است.
