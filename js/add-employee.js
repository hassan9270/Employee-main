// تهيئة البيانات عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    // تهيئة قاعدة البيانات
    initializeData();
    
    // تحميل بيانات المستخدم الحالي
    loadCurrentUser();
    
    // توليد كود الموظف الجديد
    generateEmployeeCode();
    
    // تهيئة معالجات الأحداث
    initializeEventHandlers();
    
    // تفعيل زر تبديل القائمة الجانبية
    document.getElementById('sidebar-toggle').addEventListener('click', function() {
        document.querySelector('.sidebar').classList.toggle('active');
        document.querySelector('.main-content').classList.toggle('sidebar-collapsed');
    });
    
    // إضافة تأثيرات الحركة للعناصر
    addAnimations();
});

// تحميل بيانات المستخدم الحالي
function loadCurrentUser() {
    // في التطبيق الحقيقي، سيتم استرجاع بيانات المستخدم المسجل دخوله
    // هنا نفترض أن المستخدم الحالي هو المدير للتبسيط
    const currentUser = {
        id: 1,
        username: 'admin',
        fullName: 'المدير',
        role: 'admin',
        employeeID: 1
    };
    
    // تخزين بيانات المستخدم الحالي في متغير عام
    window.currentUser = currentUser;
    
    // عرض اسم المستخدم في الواجهة
    document.getElementById('current-user-name').textContent = currentUser.fullName;
}

// توليد كود الموظف الجديد
function generateEmployeeCode() {
    const employees = JSON.parse(localStorage.getItem('employees')) || [];
    const lastEmployee = employees[employees.length - 1];
    let newCode = 'EMP001';
    
    if (lastEmployee && lastEmployee.employeeCode) {
        const lastNumber = parseInt(lastEmployee.employeeCode.replace('EMP', ''));
        newCode = 'EMP' + String(lastNumber + 1).padStart(3, '0');
    }
    
    document.getElementById('employeeCode').value = newCode;
}

// تهيئة معالجات الأحداث
function initializeEventHandlers() {
    // معالجة تقديم النموذج
    document.getElementById('add-employee-form').addEventListener('submit', handleFormSubmit);
    
    // معالجة تاريخ التعيين
    document.getElementById('hireDate').addEventListener('change', function() {
        calculateWorkDuration();
    });
    
    // معالجة تاريخ الميلاد
    document.getElementById('birthDate').addEventListener('change', function() {
        calculateAge();
    });
    
    // معالجة تحميل الصورة
    document.getElementById('photo').addEventListener('change', handlePhotoUpload);
    
    // معالجة تحميل المستندات
    document.getElementById('documents').addEventListener('change', handleDocumentsUpload);
}

// معالجة تقديم النموذج
function handleFormSubmit(event) {
    event.preventDefault();
    
    // جمع بيانات النموذج
    const formData = {
        id: generateId(),
        employeeCode: document.getElementById('employeeCode').value,
        fullName: document.getElementById('fullName').value,
        department: document.getElementById('department').value,
        jobTitle: document.getElementById('jobTitle').value,
        qualification: document.getElementById('qualification').value,
        phone: document.getElementById('phone').value,
        birthDate: document.getElementById('birthDate').value,
        hireDate: document.getElementById('hireDate').value,
        maritalStatus: document.getElementById('maritalStatus').value,
        childrenCount: parseInt(document.getElementById('childrenCount').value) || 0,
        address: document.getElementById('address').value,
        email: document.getElementById('email').value,
        nationalID: document.getElementById('nationalID').value,
        insuranceType: document.getElementById('insuranceType').value,
        insuranceNumber: document.getElementById('insuranceNumber').value,
        insuranceAuthority: document.getElementById('insuranceAuthority').value,
        healthCardNumber: document.getElementById('healthCardNumber').value,
        insuranceDate: document.getElementById('insuranceDate').value,
        insuranceJob: document.getElementById('insuranceJob').value,
        specialNeeds: document.getElementById('specialNeeds').value,
        notes: document.getElementById('notes').value,
        isActive: true,
        createdAt: new Date().toISOString()
    };
    
    // حفظ البيانات
    addEmployee(formData);
    
    // عرض رسالة نجاح
    showNotification('تم إضافة الموظف بنجاح', 'success');
    
    // إعادة توجيه إلى صفحة الموظفين
    setTimeout(() => {
        window.location.href = 'employees.html';
    }, 1500);
}

// حساب العمر الحالي
function calculateAge() {
    const dateOfBirthInput = document.getElementById('dateOfBirth');
    const currentAgeInput = document.getElementById('currentAge');
    
    const dateOfBirth = dateOfBirthInput.value;
    
    if (dateOfBirth) {
        const birthDate = new Date(dateOfBirth);
        const today = new Date();
        
        // حساب العمر
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        // تعديل العمر إذا لم يصل بعد إلى عيد ميلاده هذا العام
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        
        // تعيين العمر في حقل الإدخال
        currentAgeInput.value = `${age} سنة`;
    } else {
        currentAgeInput.value = '';
    }
}

// حساب مدة العمل بالشركة
function calculateWorkDuration() {
    const hireDateInput = document.getElementById('hireDate');
    const workDurationInput = document.getElementById('workDuration');
    
    const hireDate = hireDateInput.value;
    
    if (hireDate) {
        const startDate = new Date(hireDate);
        const today = new Date();
        
        // حساب الفرق بالسنوات
        let years = today.getFullYear() - startDate.getFullYear();
        const monthDiff = today.getMonth() - startDate.getMonth();
        
        // تعديل عدد السنوات إذا لم يصل بعد إلى ذكرى التعيين هذا العام
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < startDate.getDate())) {
            years--;
        }
        
        // حساب عدد الأشهر المتبقية
        let months = today.getMonth() - startDate.getMonth();
        if (months < 0) {
            months += 12;
        }
        
        // تعديل عدد الأشهر إذا لم يصل بعد إلى يوم التعيين هذا الشهر
        if (today.getDate() < startDate.getDate()) {
            months--;
            if (months < 0) {
                months += 12;
            }
        }
        
        // تنسيق النص
        let durationText = '';
        if (years > 0) {
            durationText += `${years} سنة`;
            if (months > 0) {
                durationText += ` و ${months} شهر`;
            }
        } else if (months > 0) {
            durationText = `${months} شهر`;
        } else {
            durationText = 'أقل من شهر';
        }
        
        // تعيين مدة العمل في حقل الإدخال
        workDurationInput.value = durationText;
    } else {
        workDurationInput.value = '';
    }
}

// حساب إجمالي الراتب
function calculateTotalSalary() {
    const basicSalaryInput = document.getElementById('basicSalary');
    const allowancesInput = document.getElementById('allowances');
    const deductionsInput = document.getElementById('deductions');
    const totalSalaryInput = document.getElementById('totalSalary');
    
    const basicSalary = parseFloat(basicSalaryInput.value) || 0;
    const allowances = parseFloat(allowancesInput.value) || 0;
    const deductions = parseFloat(deductionsInput.value) || 0;
    
    // حساب إجمالي الراتب
    const totalSalary = basicSalary + allowances - deductions;
    
    // تعيين إجمالي الراتب في حقل الإدخال
    totalSalaryInput.value = totalSalary;
}

// معالجة تحميل صورة الموظف
function handlePhotoUpload(event) {
    const file = event.target.files[0];
    
    if (file) {
        // التحقق من نوع الملف
        if (!file.type.match('image.*')) {
            showNotification('يرجى اختيار ملف صورة صالح', 'error');
            return;
        }
        
        // قراءة الملف كـ Data URL
        const reader = new FileReader();
        reader.onload = function(e) {
            const photoPreview = document.getElementById('photo-preview');
            
            // إزالة الأيقونة الافتراضية
            photoPreview.innerHTML = '';
            
            // إنشاء عنصر صورة
            const img = document.createElement('img');
            img.src = e.target.result;
            img.alt = 'صورة الموظف';
            
            // إضافة الصورة إلى العنصر
            photoPreview.appendChild(img);
            
            // تخزين الصورة في متغير عام
            window.employeePhoto = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

// حذف صورة الموظف
function removePhoto() {
    const photoPreview = document.getElementById('photo-preview');
    
    // إعادة تعيين العنصر إلى الحالة الافتراضية
    photoPreview.innerHTML = '<i class="fas fa-user"></i>';
    
    // إعادة تعيين حقل الملف
    document.getElementById('photo-upload').value = '';
    
    // حذف الصورة من المتغير العام
    window.employeePhoto = null;
}

// إعادة تعيين النموذج
function resetForm() {
    // إعادة تعيين النموذج
    document.getElementById('add-employee-form').reset();
    
    // إعادة توليد كود الموظف
    generateEmployeeCode();
    
    // إعادة تعيين الحقول المحسوبة
    document.getElementById('currentAge').value = '';
    document.getElementById('workDuration').value = '';
    document.getElementById('totalSalary').value = '';
    
    // إعادة تعيين صورة الموظف
    removePhoto();
    
    // عرض رسالة نجاح
    showNotification('تم إعادة تعيين النموذج', 'success');
}

// إضافة موظف جديد
function addEmployee() {
    try {
        // الحصول على قيم النموذج
        const fullName = document.getElementById('fullName').value.trim();
        const nationalID = document.getElementById('nationalID').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const email = document.getElementById('email').value.trim();
        const address = document.getElementById('address').value.trim();
        const departmentID = parseInt(document.getElementById('departmentID').value);
        const jobTitleID = parseInt(document.getElementById('jobTitleID').value);
        const hireDate = document.getElementById('hireDate').value;
        const salary = parseFloat(document.getElementById('totalSalary').value);
        const insuranceNumber = document.getElementById('insuranceNumber').value.trim();
        const bankAccount = document.getElementById('bankAccount').value.trim();
        
        // التحقق من صحة البيانات
        if (!fullName || !nationalID || !departmentID || !jobTitleID || !hireDate || !salary) {
            showError('يرجى ملء جميع الحقول المطلوبة');
            return;
        }
        
        // التحقق من عدم تكرار رقم الهوية
        const employees = getFromLocalStorage('employees') || [];
        if (employees.some(emp => emp.nationalID === nationalID)) {
            showError('رقم الهوية مستخدم مسبقاً');
            return;
        }
        
        // إنشاء كائن الموظف الجديد
        const newEmployee = {
            id: generateId(),
            fullName,
            nationalID,
            phone,
            email,
            address,
            departmentID,
            jobTitleID,
            hireDate,
            salary,
            insuranceNumber,
            bankAccount,
            isActive: true,
            createdAt: new Date().toISOString()
        };
        
        // إضافة الموظف إلى المصفوفة
        employees.push(newEmployee);
        
        // حفظ البيانات في localStorage
        saveToLocalStorage('employees', employees);
        
        // تسجيل النشاط
        logActivity('إضافة موظف', `تم إضافة الموظف ${fullName}`);
        
        // عرض رسالة نجاح
        showSuccess('تم إضافة الموظف بنجاح');
        
        // إعادة توجيه إلى صفحة الموظفين
        setTimeout(() => {
            window.location.href = 'employees.html';
        }, 1500);
        
    } catch (error) {
        console.error('خطأ في إضافة الموظف:', error);
        showError('حدث خطأ أثناء إضافة الموظف');
    }
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
        notification.classList.add('fade-out');
        setTimeout(function() {
            notification.remove();
        }, 300);
    });
    
    // إزالة الإشعار تلقائياً بعد 5 ثوانٍ
    setTimeout(function() {
        notification.classList.add('fade-out');
        setTimeout(function() {
            notification.remove();
        }, 300);
    }, 5000);
}

// إضافة تأثيرات الحركة للعناصر
function addAnimations() {
    // تأثيرات حركة لعنوان الصفحة
    const pageTitle = document.querySelector('.header-left h2');
    if (pageTitle) {
        pageTitle.classList.add('animate-fade-in');
    }
    
    // تأثيرات حركة لأقسام النموذج
    const formSections = document.querySelectorAll('.form-section');
    formSections.forEach((section, index) => {
        section.classList.add('animate-slide-up');
        section.style.animationDelay = `${index * 0.1}s`;
    });
    
    // تأثيرات حركة لأزرار الإجراءات
    const formActions = document.querySelector('.form-actions');
    if (formActions) {
        formActions.classList.add('animate-fade-in');
        formActions.style.animationDelay = `${formSections.length * 0.1}s`;
    }
    
    // إضافة تأثير CSS للأزرار عند التحويم
    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-3px)';
            this.style.boxShadow = '0 6px 12px rgba(0, 0, 0, 0.15)';
        });
        
        btn.addEventListener('mouseleave', function() {
            this.style.transform = '';
            this.style.boxShadow = '';
        });
    });
}

// معالجة ملف الاستيراد
function handleImportFile(event) {
    const file = event.target.files[0];
    if (file) {
        const fileName = document.getElementById('selected-file-name');
        fileName.textContent = file.name;
        fileName.classList.add('selected');
    }
}

// بدء عملية الاستيراد
function startImport() {
    const fileInput = document.getElementById('import-file');
    const file = fileInput.files[0];

    if (!file) {
        showError('يرجى اختيار ملف للاستيراد');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(firstSheet);

            // التحقق من صحة البيانات
            const validationResult = validateImportData(jsonData);

            if (!validationResult.isValid) {
                validationResult.errors.forEach(error => showError(error.errors.join('\n')));
                return;
            }

            // استيراد البيانات
            importEmployees(jsonData);

            // إغلاق النافذة المنبثقة
            document.getElementById('import-modal').classList.remove('show');

            // إعادة تعيين حقل الملف
            fileInput.value = '';
            document.getElementById('selected-file-name').textContent = 'لم يتم اختيار ملف';
            document.getElementById('selected-file-name').classList.remove('selected');

            // عرض رسالة نجاح
            showSuccess('تم استيراد البيانات بنجاح');

            // إعادة توجيه إلى صفحة الموظفين
            setTimeout(() => {
                window.location.href = 'employees.html';
            }, 1500);

        } catch (error) {
            console.error('خطأ في قراءة الملف:', error);
            showError('حدث خطأ أثناء قراءة الملف');
        }
    };
    reader.readAsArrayBuffer(file);
}

// التحقق من صحة بيانات الاستيراد
function validateImportData(data) {
    const errors = [];
    const requiredFields = [
        'الاسم الكامل',
        'رقم الهوية',
        'رقم القسم',
        'رقم المسمى الوظيفي',
        'تاريخ التعيين',
        'الراتب الأساسي'
    ];

    // دوال مساعدة للتحقق
    const isValidEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const isValidDate = (date) => {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(date)) return false;
        const d = new Date(date);
        return d instanceof Date && !isNaN(d);
    };

    const isValidPhone = (phone) => {
        const phoneRegex = /^(05|5)(5|0|3|6|4|9|1|8|7)([0-9]{7})$/;
        return phoneRegex.test(phone);
    };

    const isValidNationalID = (id) => {
        const idRegex = /^[0-9]{10}$/;
        return idRegex.test(id);
    };

    // التحقق من البيانات
    data.forEach((row, index) => {
        const rowErrors = [];

        // التحقق من الحقول المطلوبة
        requiredFields.forEach(field => {
            if (!row[field] || row[field].toString().trim() === '') {
                rowErrors.push(`الحقل ${field} مطلوب`);
            }
        });

        // التحقق من البريد الإلكتروني
        if (row['البريد الإلكتروني'] && !isValidEmail(row['البريد الإلكتروني'])) {
            rowErrors.push('البريد الإلكتروني غير صالح');
        }

        // التحقق من رقم الهاتف
        if (row['رقم الهاتف'] && !isValidPhone(row['رقم الهاتف'])) {
            rowErrors.push('رقم الهاتف غير صالح');
        }

        // التحقق من رقم الهوية
        if (row['رقم الهوية'] && !isValidNationalID(row['رقم الهوية'])) {
            rowErrors.push('رقم الهوية غير صالح');
        }

        // التحقق من تاريخ التعيين
        if (row['تاريخ التعيين'] && !isValidDate(row['تاريخ التعيين'])) {
            rowErrors.push('تاريخ التعيين غير صالح');
        }

        // التحقق من تاريخ التأمين
        if (row['تاريخ التأمين'] && !isValidDate(row['تاريخ التأمين'])) {
            rowErrors.push('تاريخ التأمين غير صالح');
        }

        // التحقق من عدم تكرار رقم الهوية
        const existingEmployees = JSON.parse(localStorage.getItem('employees') || '[]');
        const isDuplicate = existingEmployees.some(emp => emp.nationalID === row['رقم الهوية']);
        if (isDuplicate) {
            rowErrors.push('رقم الهوية مستخدم مسبقاً');
        }

        // التحقق من وجود القسم والمسمى الوظيفي
        const departments = JSON.parse(localStorage.getItem('departments') || '[]');
        const jobTitles = JSON.parse(localStorage.getItem('jobTitles') || '[]');
        
        if (!departments.some(dept => dept.id === parseInt(row['رقم القسم']))) {
            rowErrors.push('رقم القسم غير موجود');
        }
        
        if (!jobTitles.some(job => job.id === parseInt(row['رقم المسمى الوظيفي']))) {
            rowErrors.push('رقم المسمى الوظيفي غير موجود');
        }

        // التحقق من القيم المالية
        const financialFields = ['الراتب الأساسي', 'البدلات', 'الاستقطاعات', 'راتب التأمينات'];
        financialFields.forEach(field => {
            if (row[field] && (isNaN(row[field]) || parseFloat(row[field]) < 0)) {
                rowErrors.push(`قيمة ${field} غير صالحة`);
            }
        });

        if (rowErrors.length > 0) {
            errors.push({
                row: index + 2, // +2 لأن الصف الأول هو العناوين والثاني هو المثال
                errors: rowErrors
            });
        }
    });

    return {
        isValid: errors.length === 0,
        errors: errors
    };
}

// استيراد بيانات الموظفين
async function importEmployees(data) {
    try {
        const totalRows = data.length;
        let successCount = 0;
        let errorCount = 0;
        const errors = [];

        // تحديث شريط التقدم
        const progressBar = document.getElementById('import-progress');
        const progressText = document.getElementById('import-progress-text');
        progressBar.style.display = 'block';
        progressBar.value = 0;

        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            try {
                // تحويل البيانات إلى النموذج المطلوب
                const employee = {
                    fullName: row['الاسم الكامل'],
                    nationalID: row['رقم الهوية'],
                    phone: row['رقم الهاتف'] || '',
                    email: row['البريد الإلكتروني'] || '',
                    address: {
                        city: row['العنوان'] || '',
                        details: row['تفاصيل العنوان'] || ''
                    },
                    departmentID: parseInt(row['رقم القسم']),
                    jobTitleID: parseInt(row['رقم المسمى الوظيفي']),
                    hireDate: row['تاريخ التعيين'],
                    insurance: {
                        number: row['الرقم التأميني'] || '',
                        healthCardNumber: row['رقم البطاقة الصحية'] || '',
                        company: row['جهة التأمين'] || '',
                        date: row['تاريخ التأمين'] || '',
                        occupation: row['مهنته في التأمينات'] || '',
                        salary: parseFloat(row['راتب التأمينات']) || 0
                    },
                    salary: {
                        basic: parseFloat(row['الراتب الأساسي']),
                        allowances: parseFloat(row['البدلات']) || 0,
                        deductions: parseFloat(row['الاستقطاعات']) || 0
                    },
                    notes: row['ملاحظات'] || '',
                    status: 'active',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };

                // التحقق من وجود الموظف
                const existingEmployees = JSON.parse(localStorage.getItem('employees') || '[]');
                const isDuplicate = existingEmployees.some(emp => emp.nationalID === employee.nationalID);

                if (isDuplicate) {
                    throw new Error(`رقم الهوية ${employee.nationalID} مستخدم مسبقاً`);
                }

                // إضافة الموظف
                existingEmployees.push(employee);
                localStorage.setItem('employees', JSON.stringify(existingEmployees));
                successCount++;

            } catch (error) {
                errorCount++;
                errors.push({
                    row: i + 2,
                    error: error.message
                });
            }

            // تحديث شريط التقدم
            const progress = ((i + 1) / totalRows) * 100;
            progressBar.value = progress;
            progressText.textContent = `جاري الاستيراد... ${Math.round(progress)}%`;
        }

        // إخفاء شريط التقدم
        progressBar.style.display = 'none';

        // عرض نتائج الاستيراد
        if (errorCount === 0) {
            showSuccessMessage(`تم استيراد ${successCount} موظف بنجاح`);
        } else {
            showErrorMessage(`تم استيراد ${successCount} موظف بنجاح، وفشل استيراد ${errorCount} موظف`);
            console.error('أخطاء الاستيراد:', errors);
        }

        // تحديث قائمة الموظفين
        loadEmployees();

    } catch (error) {
        showErrorMessage('حدث خطأ أثناء استيراد البيانات: ' + error.message);
        console.error('خطأ في استيراد البيانات:', error);
    }
}

// بدء عملية التصدير
function startExport() {
    try {
        const employees = getFromLocalStorage('employees') || [];
        const departments = getFromLocalStorage('departments') || [];
        const jobTitles = getFromLocalStorage('jobTitles') || [];

        // الحصول على خيارات التصدير
        const scope = document.querySelector('input[name="export-scope"]:checked').value;
        const format = document.querySelector('input[name="export-format"]:checked').value;
        const selectedFields = Array.from(document.querySelectorAll('input[name="export-fields"]:checked')).map(cb => cb.value);

        // تصفية الموظفين حسب النطاق
        let filteredEmployees = employees;
        if (scope === 'active') {
            filteredEmployees = employees.filter(emp => emp.isActive);
        } else if (scope === 'inactive') {
            filteredEmployees = employees.filter(emp => !emp.isActive);
        }

        // تحويل البيانات إلى مصفوفة
        const data = filteredEmployees.map(emp => {
            const department = departments.find(d => d.id === emp.departmentID) || { name: 'غير محدد' };
            const jobTitle = jobTitles.find(j => j.id === emp.jobTitleID) || { title: 'غير محدد' };

            const row = {};
            if (selectedFields.includes('basic')) {
                row['الرقم'] = emp.id;
                row['الاسم الكامل'] = emp.fullName;
                row['القسم'] = department.name;
                row['المسمى الوظيفي'] = jobTitle.title;
                row['تاريخ التعيين'] = formatDate(emp.hireDate);
                row['الحالة'] = emp.isActive ? 'نشط' : 'غير نشط';
            }
            if (selectedFields.includes('personal')) {
                row['رقم الهوية'] = emp.nationalID;
                row['رقم الهاتف'] = emp.phone;
                row['البريد الإلكتروني'] = emp.email;
            }
            if (selectedFields.includes('contact')) {
                row['العنوان'] = emp.address;
            }
            if (selectedFields.includes('official')) {
                row['الرقم التأميني'] = emp.insuranceNumber;
                row['رقم الحساب البنكي'] = emp.bankAccount;
            }
            if (selectedFields.includes('salary')) {
                row['الراتب الأساسي'] = emp.salary;
            }
            return row;
        });

        // إنشاء مصفوفة من البيانات
        const ws = XLSX.utils.json_to_sheet(data);

        // إنشاء مصفوفة جديدة
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "موظفين");

        // تحميل الملف
        const fileName = `موظفين_${new Date().toISOString().split('T')[0]}.${format}`;
        XLSX.writeFile(wb, fileName);

        // إغلاق النافذة المنبثقة
        document.getElementById('export-modal').classList.remove('show');

        // عرض رسالة نجاح
        showSuccess('تم تصدير البيانات بنجاح');

    } catch (error) {
        console.error('خطأ في تصدير البيانات:', error);
        showError('حدث خطأ أثناء تصدير البيانات');
    }
}

// تحميل قالب الاستيراد
function downloadImportTemplate() {
    try {
        // التحقق من وجود مكتبة XLSX
        if (typeof XLSX === 'undefined') {
            throw new Error('مكتبة XLSX غير متوفرة. يرجى التأكد من تحميل المكتبة بشكل صحيح.');
        }

        // الحصول على بيانات الأقسام والمسميات الوظيفية
        const departments = JSON.parse(localStorage.getItem('departments') || '[]');
        const jobTitles = JSON.parse(localStorage.getItem('jobTitles') || '[]');

        // إنشاء مصفوفة البيانات
        const data = [
            [
                'الاسم الكامل *',
                'رقم الهوية *',
                'رقم الهاتف',
                'البريد الإلكتروني',
                'العنوان',
                'تفاصيل العنوان',
                'رقم القسم *',
                'اسم القسم',
                'رقم المسمى الوظيفي *',
                'المسمى الوظيفي',
                'تاريخ التعيين *',
                'الرقم التأميني',
                'رقم البطاقة الصحية',
                'جهة التأمين',
                'تاريخ التأمين',
                'مهنته في التأمينات',
                'راتب التأمينات',
                'الراتب الأساسي *',
                'البدلات',
                'الاستقطاعات',
                'ملاحظات'
            ],
            [
                'أحمد محمد علي',
                '1234567890',
                '0501234567',
                'ahmed@example.com',
                'الرياض',
                'حي النخيل',
                '1',
                departments[0]?.name || 'قسم الموارد البشرية',
                '1',
                jobTitles[0]?.title || 'موظف',
                '2024-01-01',
                '123456789',
                '987654321',
                'شركة التأمين الوطنية',
                '2024-01-01',
                'موظف',
                '5000',
                '8000',
                '1000',
                '500',
                'ملاحظات إضافية'
            ]
        ];

        // إضافة قائمة الأقسام والمسميات الوظيفية
        const departmentsList = departments.map(dept => `${dept.id} - ${dept.name}`).join('\n');
        const jobTitlesList = jobTitles.map(job => `${job.id} - ${job.title}`).join('\n');

        // إنشاء مصفوفة جديدة
        const ws = XLSX.utils.aoa_to_sheet(data);

        // تنسيق العناوين
        const range = XLSX.utils.decode_range(ws['!ref']);
        for (let C = range.s.c; C <= range.e.c; ++C) {
            const address = XLSX.utils.encode_cell({ r: 0, c: C });
            if (!ws[address]) continue;
            ws[address].s = {
                font: { bold: true, color: { rgb: "FFFFFF" } },
                fill: { fgColor: { rgb: "4F81BD" } },
                alignment: { horizontal: "center", vertical: "center" }
            };
        }

        // تنسيق الصف الثاني (المثال)
        for (let C = range.s.c; C <= range.e.c; ++C) {
            const address = XLSX.utils.encode_cell({ r: 1, c: C });
            if (!ws[address]) continue;
            ws[address].s = {
                font: { color: { rgb: "666666" } },
                alignment: { horizontal: "right" }
            };
        }

        // تعيين عرض الأعمدة
        const colWidths = [
            { wch: 25 }, // الاسم الكامل
            { wch: 15 }, // رقم الهوية
            { wch: 15 }, // رقم الهاتف
            { wch: 25 }, // البريد الإلكتروني
            { wch: 20 }, // العنوان
            { wch: 30 }, // تفاصيل العنوان
            { wch: 12 }, // رقم القسم
            { wch: 20 }, // اسم القسم
            { wch: 15 }, // رقم المسمى الوظيفي
            { wch: 20 }, // المسمى الوظيفي
            { wch: 15 }, // تاريخ التعيين
            { wch: 15 }, // الرقم التأميني
            { wch: 15 }, // رقم البطاقة الصحية
            { wch: 20 }, // جهة التأمين
            { wch: 15 }, // تاريخ التأمين
            { wch: 20 }, // مهنته في التأمينات
            { wch: 15 }, // راتب التأمينات
            { wch: 15 }, // الراتب الأساسي
            { wch: 15 }, // البدلات
            { wch: 15 }, // الاستقطاعات
            { wch: 30 }  // ملاحظات
        ];
        ws['!cols'] = colWidths;

        // إضافة تعليمات الاستخدام
        const instructions = [
            ['تعليمات الاستخدام:'],
            ['1. الحقول المطلوبة مميزة بعلامة *'],
            ['2. يجب ملء جميع الحقول المطلوبة'],
            ['3. يجب أن يكون رقم الهوية 10 أرقام'],
            ['4. يجب أن يكون رقم الهاتف بصيغة صحيحة (مثال: 0501234567)'],
            ['5. يجب أن يكون البريد الإلكتروني بصيغة صحيحة'],
            ['6. يجب أن يكون التاريخ بصيغة YYYY-MM-DD'],
            ['7. يجب أن تكون القيم المالية أرقاماً موجبة'],
            [''],
            ['قائمة الأقسام المتاحة:'],
            [departmentsList],
            [''],
            ['قائمة المسميات الوظيفية المتاحة:'],
            [jobTitlesList]
        ];

        // إضافة التعليمات إلى الملف
        const wsInstructions = XLSX.utils.aoa_to_sheet(instructions);
        wsInstructions['!cols'] = [{ wch: 50 }];

        // إنشاء مصفوفة جديدة
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'قالب استيراد الموظفين');
        XLSX.utils.book_append_sheet(wb, wsInstructions, 'تعليمات الاستخدام');

        // محاولة حفظ الملف
        try {
            XLSX.writeFile(wb, 'قالب_استيراد_الموظفين.xlsx');
            showSuccessMessage('تم تحميل قالب الاستيراد بنجاح');
        } catch (error) {
            throw new Error('فشل في حفظ الملف: ' + error.message);
        }
    } catch (error) {
        showErrorMessage('حدث خطأ أثناء تحميل قالب الاستيراد: ' + error.message);
        console.error('خطأ في تحميل قالب الاستيراد:', error);
    }
}
