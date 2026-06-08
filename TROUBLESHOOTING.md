# 🧪 اختبار واستكشاف الأخطاء

هذا الملف يساعدك على اختبار واستكشاف مشاكل Deploy Key.

---

## ✅ اختبار سريع:

### 1. تحقق من وجود المفاتيح:
```powershell
# تحقق من المجلد المحلي
Test-Path "C:\Users\hesham\.ssh_local\car_flat_pharm\.git_deploy_key"

# يجب أن تنتج: True
```

### 2. تحقق من git config:
```bash
cd c:\Users\hesham\Desktop\car_flat_pharm
git config --local --get core.sshCommand

# يجب أن تنتج: ssh -i .git_deploy_key
```

### 3. اختبر SSH مباشرة:
```bash
cd c:\Users\hesham\Desktop\car_flat_pharm
ssh -vvv -i .git_deploy_key git@github.com
```

### 4. اختبر الاتصال الآمن:
```bash
ssh -T git@github.com-car_flat_pharm
```

---

## 🔴 مشاكل شائعة وحلولها:

### ❌ المشكلة 1: "Could not open a connection to your authentication agent"

**السبب:** SSH Agent غير مشغّل

**الحل:**
```powershell
# ابدأ SSH Agent
Start-Service ssh-agent -Force

# أضف المفتاح
ssh-add "C:\Users\hesham\.ssh_local\car_flat_pharm\.git_deploy_key"

# تحقق من قائمة المفاتيح
ssh-add -l
```

---

### ❌ المشكلة 2: "Permission denied (publickey)"

**السبب:** المفتاح العام غير موجود على GitHub أو غير مفعّل

**الحل:**
```powershell
# 1. تحقق من المفتاح العام
Get-Content "C:\Users\hesham\.ssh_local\car_flat_pharm\.git_deploy_key.pub"

# 2. اذهب إلى GitHub Settings > Deploy Keys
# 3. تأكد من:
#    - المفتاح موجود
#    - "Allow write access" مفعّل
#    - لم تنته صلاحيته

# 4. إعد المحاولة
ssh -T git@github.com-car_flat_pharm
```

---

### ❌ المشكلة 3: "git@github.com: Permission denied (publickey)"

**السبب:** git لا يستخدم المفتاح الصحيح

**الحل:**
```powershell
# 1. تحقق من remote URL
git remote -v

# يجب أن يكون SSH بدلاً من HTTPS:
# git@github.com-car_flat_pharm:gaberhassanhesham-tech/car_flat_pharm.git

# 2. إذا كان HTTPS، عدّل إلى SSH:
git remote set-url origin "git@github.com-car_flat_pharm:gaberhassanhesham-tech/car_flat_pharm.git"

# 3. اختبر مرة أخرى
git push
```

---

### ❌ المشكلة 4: ".git_deploy_key: Permission denied"

**السبب:** صلاحيات الملف غير صحيحة

**الحل:**
```powershell
# في Windows، قد تحتاج لتعديل الصلاحيات
# استخدم icacls (Windows Access Control List)

# تعديل الصلاحيات
icacls "C:\Users\hesham\.ssh_local\car_flat_pharm\.git_deploy_key" /reset
icacls "C:\Users\hesham\.ssh_local\car_flat_pharm\.git_deploy_key" /grant "%USERNAME%:F" /inheritance:r
```

---

### ❌ المشكلة 5: "No such file or directory"

**السبب:** المفاتيح غير في المكان الصحيح

**الحل:**
```powershell
# تحقق من موقع المفاتيح
$keyPath = "C:\Users\hesham\.ssh_local\car_flat_pharm\.git_deploy_key"
if (Test-Path $keyPath) {
    Write-Host "✅ المفتاح موجود"
} else {
    Write-Host "❌ المفتاح غير موجود"
    
    # أعد نسخ المفاتيح
    $sourceKeys = "c:\Users\hesham\Desktop\car_flat_pharm"
    Copy-Item "$sourceKeys\.git_deploy_key*" "C:\Users\hesham\.ssh_local\car_flat_pharm\" -Force
}
```

---

### ❌ المشكلة 6: SSH لا يجد .ssh_config

**السبب:** ملف التكوين في المشروع وليس في `~\.ssh`

**الحل:**
```powershell
# إذا أردت استخدام SSH Config عام
mkdir "$env:USERPROFILE\.ssh" -ErrorAction SilentlyContinue

# انسخ الملف
Copy-Item "c:\Users\hesham\Desktop\car_flat_pharm\.ssh_config" "$env:USERPROFILE\.ssh\config" -Force

# عدّل المسار في الملف:
# ابدأ: "$env:USERPROFILE\.ssh_local" بـ "~"
```

---

## 🔍 تصحيح شامل:

إذا لم تنجح الحلول البسيطة، جرّب هذا الأمر الشامل:

```powershell
# 1. توقف SSH Agent
Stop-Service ssh-agent -Force

# 2. ابدأ من جديد
Start-Service ssh-agent

# 3. أضف المفتاح
ssh-add "C:\Users\hesham\.ssh_local\car_flat_pharm\.git_deploy_key"

# 4. تحقق
ssh-add -l

# 5. اختبر الاتصال
ssh -T git@github.com-car_flat_pharm

# 6. جرّب الـ Push
cd c:\Users\hesham\Desktop\car_flat_pharm
git push
```

---

## 📊 معلومات التصحيح:

### اختبر SSH مع التفاصيل:
```bash
# عرض تفاصيل الاتصال
ssh -vvv -i "C:\Users\hesham\.ssh_local\car_flat_pharm\.git_deploy_key" git@github.com

# ابحث عن:
# ✅ "Authentication succeeded" أو "Authenticated"
# ✅ "Offering public key"
```

### تحقق من SSH Keys المتوفرة:
```powershell
ssh-add -l

# يجب أن تظهر المفاتيح المضافة
```

### تحقق من git logs:
```bash
GIT_SSH_COMMAND="ssh -vvv" git push
```

---

## 🚀 إذا فشل كل شيء:

**أعد توليد المفاتيح:**
```powershell
cd c:\Users\hesham\Desktop\car_flat_pharm

# احذف المفاتيح القديمة
Remove-Item .git_deploy_key -Force
Remove-Item .git_deploy_key.pub -Force

# وليد جديد
ssh-keygen -t ed25519 -f .git_deploy_key -P '""'

# انسخ إلى المجلد المحلي
Copy-Item .git_deploy_key* "C:\Users\hesham\.ssh_local\car_flat_pharm\" -Force

# ثم أضف المفتاح العام الجديد على GitHub!
```

---

## 📞 الدعم:

إذا استمرت المشاكل:
1. تحقق من [GitHub SSH Documentation](https://docs.github.com/en/authentication/connecting-to-github-with-ssh)
2. قراءة `DEPLOY_KEY_SETUP.md`
3. تشغيل `setup-deploy-key.ps1 -Setup` مرة أخرى

