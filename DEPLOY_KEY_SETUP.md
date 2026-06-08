# Deploy Key Setup Guide

## المفتاح العام (استخدمه على GitHub)

قم بالذهاب إلى: `Settings > Deploy keys > Add deploy key`

أضف المفتاح العام التالي:

```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIEbgeIwBk37xVXNFGYPXga9rUIuvJm+DdkDLNSwtjMqB hesham@DESKTOP-UA52GFH
```

**اجعل Allow write access مفعلة** للسماح بـ push

---

## خطوات الاستخدام:

### 1. نسخ المفتاح الخاص إلى مجلد الـ SSH المحلي:
```powershell
# أنشئ المجلد إذا لم يكن موجوداً
New-Item -ItemType Directory -Path "$env:USERPROFILE\.ssh_local\car_flat_pharm" -Force

# انسخ المفتاح الخاص
Copy-Item ".\.git_deploy_key" "$env:USERPROFILE\.ssh_local\car_flat_pharm\" -Force
Copy-Item ".\.git_deploy_key.pub" "$env:USERPROFILE\.ssh_local\car_flat_pharm\" -Force
```

### 2. تعديل git remote لاستخدام المفتاح:
```powershell
# قم بتعديل الـ remote URL
git remote set-url origin "git@github.com-car_flat_pharm:gaberhassanhesham-tech/car_flat_pharm.git"

# إذا أردت العودة للـ HTTPS
git remote set-url origin "https://github.com/gaberhassanhesham-tech/car_flat_pharm.git"
```

### 3. إعداد SSH Agent (اختياري لكن موصى به):
```powershell
# ابدأ SSH Agent
Start-Service ssh-agent

# أضف المفتاح
ssh-add "$env:USERPROFILE\.ssh_local\car_flat_pharm\.git_deploy_key"
```

### 4. اختبر الاتصال:
```bash
ssh -T git@github.com-car_flat_pharm
```

---

## الملفات المستخدمة:
- `.git_deploy_key` - المفتاح الخاص (آمن - لا تشاركه)
- `.git_deploy_key.pub` - المفتاح العام (أضفه على GitHub)
- `.ssh_config` - تكوين SSH محلي

---

## ملاحظات أمان:
- ✅ المفاتيح محفوظة محلياً في المشروع
- ✅ لا تحتاج لإعدادات Windows العامة
- ✅ يمكنك نسخ المشروع على أي جهاز وسيعمل مباشرة
- ⚠️ تأكد من عدم مشاركة المفتاح الخاص `.git_deploy_key`
- ⚠️ أضفه إلى `.gitignore` إذا أردت (انظر أدناه)

### لإخفاء المفاتيح من git (اختياري):
أضف هذا إلى `.gitignore`:
```
.git_deploy_key
.git_deploy_key.pub
.ssh_config
```

