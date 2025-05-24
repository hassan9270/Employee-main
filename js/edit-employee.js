// تهيئة البيانات عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    // تهيئة قاعدة البيانات
    initializeData();
    
    // الحصول على معرف الموظف من عنوان URL
    const urlParams = new URLSearchParams(window.location.search);
    const employeeId = parseInt(urlParams.get('id'));
    
    // التحقق من وجود معرف الموظف
    if (!employeeId) {
        showNotification('لم يتم تحديد الموظف المطلوب تعديله', 'error');
        setTimeout(function() {
            window.location.href = 'employees.html';
        }, 2000);
        return;
    }
    
    // تحميل بيانات الموظف
    loadEmployeeData(employeeId);
    
    // تحميل قوائم الأقسام والمسميات الوظيفية
    loadDepartments();
    loadJobTitles();
    
    // تهيئة معالجات الأحداث
    initializeEventHandlers(employeeId);
    
    // تفعيل زر تبديل القائمة الجانبية
    document.getElementById('sidebar-toggle').addEventListener('click', function() {
        document.querySelector('.sidebar').classList.toggle('active');
    });
});

// تحميل بيانات الموظف
function loadEmployeeData(employeeId) {
    // استرجاع بيانات الموظف
    const employees = getFromLocalStorage('employees') || [];
    const employee = employees.find(emp => emp.id === employeeId);
    
    if (!employee) {
        showNotification('لم يتم العثور على الموظف', 'error');
        setTimeout(function() {
            window.location.href = 'employees.html';
        }, 2000);
        return;
    }
    
    // تعيين معرف الموظف في الحقل المخفي
    document.getElementById('employeeId').value = employee.id;
    
    // ملء حقول النموذج ببيانات الموظف
    document.getElementById('fullName').value = employee.fullName || '';
    document.getElementById('gender').value = employee.gender || 'ذكر';
    document.getElementById('dateOfBirth').value = formatDateForInput(employee.dateOfBirth);
    document.getElementById('nationalID').value = employee.nationalID || '';
    document.getElementById('address').value = employee.address || '';
    document.getElementById('phone').value = employee.phone || '';
    document.getElementById('email').value = employee.email || '';
    document.getElementById('departmentID').value = employee.departmentID || '';
    document.getElementById('jobTitleID').value = employee.jobTitleID || '';
    document.getElementById('hireDate').value = formatDateForInput(employee.hireDate);
    document.getElementById('salary').value = employee.salary || '';
    document.getElementById('isActive').value = employee.isActive.toString();
    document.getElementById('notes').value = employee.notes || '';
    
    // عرض صورة الموظف إذا كانت موجودة
    const photoPreview = document.getElementById('photo-preview');
    if (photoPreview && employee.photo) {
        photoPreview.innerHTML = `<img src="${employee.photo}" alt="صورة الموظف">`;
        photoPreview.classList.add('has-image');
    }
}

// تحميل قائمة الأقسام
function loadDepartments() {
    const departments = getAllDepartments();
    const departmentSelect = document.getElementById('departmentID');
    
    // مسح القائمة الحالية
    departmentSelect.innerHTML = '<option value="">اختر القسم</option>';
    
    // إضافة الأقسام إلى القائمة
    departments.forEach(dept => {
        const option = document.createElement('option');
        option.value = dept.id;
        option.textContent = dept.name;
        departmentSelect.appendChild(option);
    });
}

// تحميل قائمة المسميات الوظيفية
function loadJobTitles() {
    const jobTitles = getAllJobTitles();
    const jobTitleSelect = document.getElementById('jobTitleID');
    
    // مسح القائمة الحالية
    jobTitleSelect.innerHTML = '<option value="">اختر المسمى الوظيفي</option>';
    
    // إضافة المسميات الوظيفية إلى القائمة
    jobTitles.forEach(job => {
        const option = document.createElement('option');
        option.value = job.id;
        option.textContent = job.title;
        jobTitleSelect.appendChild(option);
    });
}

// تهيئة معالجات الأحداث
function initializeEventHandlers(employeeId) {
    // معالج حدث تحميل الصورة
    const photoUpload = document.getElementById('photo-upload');
    const photoPreview = document.getElementById('photo-preview');
    const removePhotoBtn = document.getElementById('remove-photo');
    
    photoUpload.addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                photoPreview.innerHTML = `<img src="${e.target.result}" alt="صورة الموظف">`;
                photoPreview.classList.add('has-image');
            };
            reader.readAsDataURL(file);
        }
    });
    
    // معالج حدث حذف الصورة
    removePhotoBtn.addEventListener('click', function() {
        photoUpload.value = '';
        photoPreview.innerHTML = '<i class="fas fa-user"></i>';
        photoPreview.classList.remove('has-image');
    });
    
    // معالج حدث تقديم النموذج
    const form = document.getElementById('edit-employee-form');
    form.addEventListener('submit', function(event) {
        event.preventDefault();
        
        // التحقق من صحة البيانات
        if (!validateForm()) {
            return;
        }
        
        // جمع بيانات النموذج
        const employeeData = collectFormData();
        
        // تحديث بيانات الموظف في قاعدة البيانات
        const success = updateEmployee(employeeId, employeeData);
        
        if (success) {
            // عرض رسالة نجاح
            showNotification('تم تحديث بيانات الموظف بنجاح', 'success');
            
            // إعادة توجيه المستخدم إلى صفحة الموظفين بعد ثانيتين
            setTimeout(function() {
                window.location.href = 'employees.html';
            }, 2000);
        } else {
            // عرض رسالة خطأ
            showNotification('حدث خطأ أثناء تحديث بيانات الموظف', 'error');
        }
    });
}

// التحقق من صحة بيانات النموذج
function validateForm() {
    // الحقول المطلوبة
    const requiredFields = ['fullName', 'departmentID', 'jobTitleID', 'hireDate', 'salary'];
    let isValid = true;
    
    // التحقق من تعبئة الحقول المطلوبة
    requiredFields.forEach(field => {
        const input = document.getElementById(field);
        if (!input.value.trim()) {
            input.classList.add('invalid');
            isValid = false;
        } else {
            input.classList.remove('invalid');
        }
    });
    
    // التحقق من صحة البريد الإلكتروني إذا تم إدخاله
    const emailInput = document.getElementById('email');
    if (emailInput.value.trim() && !isValidEmail(emailInput.value)) {
        emailInput.classList.add('invalid');
        isValid = false;
    }
    
    // عرض رسالة خطأ إذا كانت البيانات غير صحيحة
    if (!isValid) {
        showNotification('يرجى تعبئة جميع الحقول المطلوبة بشكل صحيح', 'error');
    }
    
    return isValid;
}

// التحقق من صحة البريد الإلكتروني
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// جمع بيانات النموذج
function collectFormData() {
    // الحصول على قيم الحقول
    const fullName = document.getElementById('fullName').value.trim();
    const gender = document.getElementById('gender').value;
    const dateOfBirth = document.getElementById('dateOfBirth').value;
    const nationalID = document.getElementById('nationalID').value.trim();
    const address = document.getElementById('address').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const email = document.getElementById('email').value.trim();
    const departmentID = parseInt(document.getElementById('departmentID').value);
    const jobTitleID = parseInt(document.getElementById('jobTitleID').value);
    const hireDate = document.getElementById('hireDate').value;
    const salary = parseFloat(document.getElementById('salary').value);
    const isActive = document.getElementById('isActive').value === 'true';
    const notes = document.getElementById('notes').value.trim();
    
    // الحصول على الصورة
    let photo = '';
    const photoPreview = document.getElementById('photo-preview');
    if (photoPreview && photoPreview.classList.contains('has-image')) {
        const img = photoPreview.querySelector('img');
        if (img) {
            photo = img.src;
        }
    }
    
    // إنشاء كائن بيانات الموظف
    return {
        fullName,
        gender,
        dateOfBirth,
        nationalID,
        address,
        phone,
        email,
        departmentID,
        jobTitleID,
        hireDate,
        salary,
        isActive,
        photo,
        notes
    };
}

// تنسيق التاريخ للإدخال في حقول التاريخ
function formatDateForInput(dateString) {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
}

// عرض رسالة إشعار
function showNotification(message, type) {
    // التحقق من وجود عنصر الإشعارات
    let notificationContainer = document.querySelector('.notification-container');
    
    // إنشاء عنصر الإشعارات إذا لم يكن موجوداً
    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.className = 'notification-container';
        document.body.appendChild(notificationContainer);
    }
    
    // إنشاء عنصر الإشعار
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close"><i class="fas fa-times"></i></button>
    `;
    
    // إضافة الإشعار إلى الحاوية
    notificationContainer.appendChild(notification);
    
    // إضافة معالج حدث لزر الإغلاق
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', function() {
        notification.remove();
    });
    
    // إزالة الإشعار تلقائياً بعد 5 ثوانٍ
    setTimeout(function() {
        notification.classList.add('fade-out');
        setTimeout(function() {
            notification.remove();
        }, 300);
    }, 5000);
}
