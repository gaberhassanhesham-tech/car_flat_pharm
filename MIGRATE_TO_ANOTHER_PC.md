# 🔄 نقل المشروع إلى جهاز آخر

إذا أردت نسخ هذا المشروع إلى جهاز Windows آخر وتجنب إعادة إعداد Deploy Key، اتبع هذه الخطوات:

---

## 📋 الخطوات:

### الخطوة 1: انسخ المفاتيح من الجهاز الحالي

من الجهاز الحالي:
```powershell
# انسخ المفاتيح
$sourceKeys = "C:\Users\hesham\.ssh_local\car_flat_pharm"

# يمكنك نسخها إلى USB أو مشاركتها بطريقة آمنة
```

### الخطوة 2: على الجهاز الجديد

**2.1. انسخ كل المشروع:**
```powershell
# على الجهاز الجديد، اذهب إلى المسار المطلوب
cd "C:\Users\<USERNAME>\Desktop"

# انسخ المشروع (مثلاً من USB أو shared folder)
```

**2.2. انسخ المفاتيح:**
```powershell
# أنشئ مجلد الـ SSH المحلي
$sshPath = "$env:USERPROFILE\.ssh_local\car_flat_pharm"
New-Item -ItemType Directory -Path $sshPath -Force

# انسخ المفاتيح من USB أو مصدر آخر
Copy-Item "D:\car_flat_pharm_keys\*" $sshPath -Force
```

**2.3. شغّل برنامج الإعداد:**
```powershell
cd "C:\Users\<USERNAME>\Desktop\car_flat_pharm"
.\setup-deploy-key.ps1 -Setup
.\setup-deploy-key.ps1 -Test
```

---

## ⚠️ تنبيهات أمان:

### 🔴 لا تشارك:
- ❌ `.git_deploy_key` (المفتاح الخاص)
- ❌ المجلد كاملاً على GitHub (لأنه يحتوي على مفاتيح)

### 🟢 طريقة آمنة للمشاركة:

**الخيار 1: عبر محرك أقراص USB آمن**
```
USB
├── car_flat_pharm_keys/
│   ├── .git_deploy_key
│   └── .git_deploy_key.pub
```

**الخيار 2: عبر مشاركة الملفات الآمنة فقط**
- شارك المفاتيح من خلال تطبيق موثوق (مثل NextCloud، OneDrive في وضع خاص)

**الخيار 3: إعادة توليد المفاتيح**
```powershell
# إذا لم تستطع نقل المفاتيح بأمان، وليد مفاتيح جديدة على الجهاز الجديد
.\setup-deploy-key.ps1 -Setup

# ثم أضف المفتاح العام الجديد على GitHub
```

---

## 📝 ملاحظات:

1. **كل جهاز = مفاتيح مختلفة (الخيار الأفضل)**
   - أكثر أماناً
   - يمكنك إدارة كل مفتاح بشكل منفصل على GitHub

2. **جميع الأجهزة = نفس المفاتيح (الخيار الحالي)**
   - أسهل في الإعداد
   - أقل أماناً بقليل

---

## 🔧 إذا واجهت مشاكل:

```powershell
# تحقق من وجود المفاتيح
Test-Path "$env:USERPROFILE\.ssh_local\car_flat_pharm"

# تحقق من إعدادات git
git config --local --get core.sshCommand

# أعد تشغيل SSH Agent
Restart-Service ssh-agent -Force
```

---

للمزيد من المعلومات، اقرأ: `DEPLOY_KEY_SETUP.md`

