// تهيئة البيانات عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    // تهيئة قاعدة البيانات
    initializeData();
    
    // تحميل إعدادات النظام
    loadSettings();
    
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

// تحميل إعدادات النظام
function loadSettings() {
    // استرجاع الإعدادات من localStorage
    const settings = getFromLocalStorage('settings') || getDefaultSettings();
    
    // تطبيق الإعدادات العامة
    document.getElementById('language').value = settings.general.language;
    document.getElementById('date-format').value = settings.general.dateFormat;
    document.getElementById('theme').value = settings.general.theme;
    document.getElementById('items-per-page').value = settings.general.itemsPerPage;
    
    // تطبيق إعدادات الشركة
    document.getElementById('company-name').value = settings.company.name || '';
    document.getElementById('company-email').value = settings.company.email || '';
    document.getElementById('company-phone').value = settings.company.phone || '';
    document.getElementById('company-website').value = settings.company.website || '';
    document.getElementById('company-address').value = settings.company.address || '';
    
    // تحميل شعار الشركة إذا كان موجوداً
    if (settings.company.logo) {
        document.getElementById('logo-preview-img').src = settings.company.logo;
        document.getElementById('logo-preview-img').style.display = 'block';
        document.getElementById('no-logo').style.display = 'none';
    } else {
        document.getElementById('logo-preview-img').style.display = 'none';
        document.getElementById('no-logo').style.display = 'flex';
    }
    
    // تحميل قائمة المستخدمين
    loadUsers();
    
    // تطبيق المظهر
    applyTheme(settings.general.theme);
}

// تحميل قائمة المستخدمين
function loadUsers() {
    // استرجاع بيانات المستخدمين من localStorage
    const users = getFromLocalStorage('users') || [];
    
    // الحصول على جدول المستخدمين
    const tableBody = document.querySelector('#users-table tbody');
    tableBody.innerHTML = '';
    
    // إضافة المستخدمين إلى الجدول
    if (users.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="7" class="text-center">لا يوجد مستخدمين</td>';
        tableBody.appendChild(row);
    } else {
        users.forEach((user, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.id}</td>
                <td>${user.username}</td>
                <td>${getUserFullName(user.employeeID)}</td>
                <td>${getUserRoleText(user.userRole)}</td>
                <td><span class="status-badge ${user.isActive ? 'active' : 'inactive'}">${user.isActive ? 'نشط' : 'غير نشط'}</span></td>
                <td>${formatDate(user.lastLogin) || 'لم يسجل الدخول بعد'}</td>
                <td class="actions">
                    <button class="btn-icon edit-user-btn" data-id="${user.id}" title="تعديل">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon delete-user-btn" data-id="${user.id}" title="حذف">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            
            // إضافة تأثير حركة للصفوف
            row.classList.add('animate-fade-in');
            row.style.animationDelay = `${index * 0.05}s`;
            
            tableBody.appendChild(row);
        });
        
        // إضافة معالجات الأحداث لأزرار الإجراءات
        addUserActionButtonsHandlers();
    }
}

// الحصول على الاسم الكامل للموظف
function getUserFullName(employeeID) {
    if (!employeeID) return 'غير مرتبط بموظف';
    
    const employees = getFromLocalStorage('employees') || [];
    const employee = employees.find(emp => emp.id === employeeID);
    
    return employee ? `${employee.firstName} ${employee.lastName}` : 'غير موجود';
}

// الحصول على نص الصلاحية
function getUserRoleText(userRole) {
    const roles = {
        'admin': 'مدير',
        'manager': 'مشرف',
        'user': 'مستخدم'
    };
    
    return roles[userRole] || userRole;
}

// تهيئة معالجات الأحداث
function initializeEventHandlers() {
    // معالجات أحداث التبويبات
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            // إزالة الفئة النشطة من جميع الأزرار
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            
            // إضافة الفئة النشطة للزر المضغوط
            this.classList.add('active');
            
            // إخفاء جميع محتويات التبويبات
            document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
            
            // إظهار محتوى التبويب المطلوب
            const tabId = this.getAttribute('data-tab');
            document.getElementById(`${tabId}-tab`).classList.add('active');
        });
    });
    
    // معالج حدث حفظ الإعدادات العامة
    document.getElementById('save-general-settings').addEventListener('click', function() {
        saveGeneralSettings();
    });
    
    // معالج حدث إعادة تعيين الإعدادات العامة
    document.getElementById('reset-general-settings').addEventListener('click', function() {
        resetGeneralSettings();
    });
    
    // معالج حدث حفظ بيانات الشركة
    document.getElementById('save-company-settings').addEventListener('click', function() {
        saveCompanySettings();
    });
    
    // معالج حدث إعادة تعيين بيانات الشركة
    document.getElementById('reset-company-settings').addEventListener('click', function() {
        resetCompanySettings();
    });
    
    // معالج حدث تحميل شعار الشركة
    document.getElementById('company-logo').addEventListener('change', function(event) {
        handleLogoUpload(event);
    });
    
    // معالج حدث زر تحميل الشعار
    document.querySelector('.file-upload-btn').addEventListener('click', function() {
        document.getElementById('company-logo').click();
    });
    
    // معالج حدث إضافة مستخدم جديد
    document.getElementById('add-user-btn').addEventListener('click', function() {
        prepareAddUserModal();
        showModal('add-user-modal');
    });
    
    // معالج حدث حفظ مستخدم جديد
    document.getElementById('save-user-btn').addEventListener('click', function() {
        saveUser();
    });
    
    // معالج حدث تصدير البيانات
    document.getElementById('export-data-btn').addEventListener('click', function() {
        exportData();
    });
    
    // معالج حدث استيراد البيانات
    document.getElementById('import-data-btn').addEventListener('click', function() {
        document.getElementById('import-data-file').click();
    });
    
    // معالج حدث تغيير ملف الاستيراد
    document.getElementById('import-data-file').addEventListener('change', function(event) {
        importData(event);
    });
    
    // معالج حدث إعادة تعيين البيانات
    document.getElementById('reset-data-btn').addEventListener('click', function() {
        showModal('confirm-reset-modal');
    });
    
    // معالج حدث تأكيد إعادة التعيين
    document.getElementById('confirm-reset-text').addEventListener('input', function() {
        const confirmBtn = document.getElementById('confirm-reset-btn');
        confirmBtn.disabled = this.value !== 'تأكيد';
    });
    
    // معالج حدث تأكيد إعادة تعيين البيانات
    document.getElementById('confirm-reset-btn').addEventListener('click', function() {
        resetAllData();
    });
    
    // معالج حدث تأكيد حذف المستخدم
    document.getElementById('confirm-delete-user-btn').addEventListener('click', function() {
        deleteUser();
    });
    
    // معالج حدث تحديث المستخدم
    document.getElementById('update-user-btn').addEventListener('click', function() {
        updateUser();
    });
    
    // معالجات أحداث إغلاق النوافذ المنبثقة
    document.querySelectorAll('.modal-close, .modal-close-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            hideModal(modal.id);
        });
    });
}

// حفظ الإعدادات العامة
function saveGeneralSettings() {
    // استرجاع الإعدادات الحالية
    const settings = getFromLocalStorage('settings') || getDefaultSettings();
    
    // تحديث الإعدادات العامة
    settings.general = {
        language: document.getElementById('language').value,
        dateFormat: document.getElementById('date-format').value,
        theme: document.getElementById('theme').value,
        itemsPerPage: document.getElementById('items-per-page').value
    };
    
    // حفظ الإعدادات في localStorage
    saveToLocalStorage('settings', settings);
    
    // تطبيق المظهر
    applyTheme(settings.general.theme);
    
    // عرض رسالة نجاح
    showNotification('تم حفظ الإعدادات العامة بنجاح', 'success');
}

// إعادة تعيين الإعدادات العامة
function resetGeneralSettings() {
    // استرجاع الإعدادات الافتراضية
    const defaultSettings = getDefaultSettings();
    
    // تطبيق الإعدادات العامة الافتراضية
    document.getElementById('language').value = defaultSettings.general.language;
    document.getElementById('date-format').value = defaultSettings.general.dateFormat;
    document.getElementById('theme').value = defaultSettings.general.theme;
    document.getElementById('items-per-page').value = defaultSettings.general.itemsPerPage;
    
    // عرض رسالة نجاح
    showNotification('تم إعادة تعيين الإعدادات العامة', 'success');
}

// حفظ بيانات الشركة
function saveCompanySettings() {
    // التحقق من صحة البيانات
    const companyName = document.getElementById('company-name').value.trim();
    
    if (!companyName) {
        document.getElementById('company-name').classList.add('invalid');
        showNotification('يرجى إدخال اسم الشركة', 'error');
        return;
    }
    
    // استرجاع الإعدادات الحالية
    const settings = getFromLocalStorage('settings') || getDefaultSettings();
    
    // تحديث بيانات الشركة
    settings.company = {
        name: companyName,
        email: document.getElementById('company-email').value.trim(),
        phone: document.getElementById('company-phone').value.trim(),
        website: document.getElementById('company-website').value.trim(),
        address: document.getElementById('company-address').value.trim(),
        logo: document.getElementById('logo-preview-img').style.display === 'none' ? null : document.getElementById('logo-preview-img').src
    };
    
    // حفظ الإعدادات في localStorage
    saveToLocalStorage('settings', settings);
    
    // عرض رسالة نجاح
    showNotification('تم حفظ بيانات الشركة بنجاح', 'success');
}

// إعادة تعيين بيانات الشركة
function resetCompanySettings() {
    // استرجاع الإعدادات الافتراضية
    const defaultSettings = getDefaultSettings();
    
    // تطبيق بيانات الشركة الافتراضية
    document.getElementById('company-name').value = '';
    document.getElementById('company-email').value = '';
    document.getElementById('company-phone').value = '';
    document.getElementById('company-website').value = '';
    document.getElementById('company-address').value = '';
    
    // إعادة تعيين شعار الشركة
    document.getElementById('logo-preview-img').src = '#';
    document.getElementById('logo-preview-img').style.display = 'none';
    document.getElementById('no-logo').style.display = 'flex';
    document.querySelector('.file-name').textContent = 'لم يتم اختيار ملف';
    
    // عرض رسالة نجاح
    showNotification('تم إعادة تعيين بيانات الشركة', 'success');
}

// معالجة تحميل شعار الشركة
function handleLogoUpload(event) {
    const file = event.target.files[0];
    
    if (file) {
        // التحقق من نوع الملف
        if (!file.type.match('image.*')) {
            showNotification('يرجى اختيار ملف صورة صالح', 'error');
            return;
        }
        
        // عرض اسم الملف
        document.querySelector('.file-name').textContent = file.name;
        
        // قراءة الملف كـ Data URL
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('logo-preview-img').src = e.target.result;
            document.getElementById('logo-preview-img').style.display = 'block';
            document.getElementById('no-logo').style.display = 'none';
        };
        reader.readAsDataURL(file);
    }
}

// تطبيق المظهر
function applyTheme(theme) {
    if (theme === 'dark') {
        document.body.classList.add('dark-theme');
    } else {
        document.body.classList.remove('dark-theme');
    }
}

// تحضير نموذج إضافة مستخدم جديد
function prepareAddUserModal() {
    // إعادة تعيين النموذج
    document.getElementById('add-user-form').reset();
    
    // تحميل قائمة الموظفين
    loadEmployeesList('employee-id');
}

// تحميل قائمة الموظفين
function loadEmployeesList(selectId) {
    const employees = getFromLocalStorage('employees') || [];
    const select = document.getElementById(selectId);
    
    // حذف الخيارات الحالية
    while (select.options.length > 1) {
        select.remove(1);
    }
    
    // إضافة الموظفين النشطين فقط
    const activeEmployees = employees.filter(emp => emp.isActive);
    
    activeEmployees.forEach(emp => {
        const option = document.createElement('option');
        option.value = emp.id;
        option.textContent = `${emp.firstName} ${emp.lastName}`;
        select.appendChild(option);
    });
}

// حفظ مستخدم جديد
function saveUser() {
    // التحقق من صحة البيانات
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const userRoleInput = document.getElementById('user-role');
    
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();
    const userRole = userRoleInput.value;
    
    if (!username) {
        usernameInput.classList.add('invalid');
        showNotification('يرجى إدخال اسم المستخدم', 'error');
        return;
    }
    
    if (!password) {
        passwordInput.classList.add('invalid');
        showNotification('يرجى إدخال كلمة المرور', 'error');
        return;
    }
    
    // التحقق من عدم تكرار اسم المستخدم
    const users = getFromLocalStorage('users') || [];
    if (users.some(user => user.username === username)) {
        usernameInput.classList.add('invalid');
        showNotification('اسم المستخدم موجود بالفعل', 'error');
        return;
    }
    
    // إنشاء كائن بيانات المستخدم
    const userData = {
        username,
        password: hashPassword(password), // تشفير كلمة المرور
        employeeID: document.getElementById('employee-id').value || null,
        userRole,
        isActive: document.getElementById('user-status').value === 'true',
        createdDate: new Date().toISOString(),
        lastLogin: null
    };
    
    // إضافة المستخدم إلى قاعدة البيانات
    const userId = addUser(userData);
    
    // إغلاق النافذة المنبثقة
    hideModal('add-user-modal');
    
    // عرض رسالة نجاح
    showNotification('تم إضافة المستخدم بنجاح', 'success');
    
    // إعادة تحميل قائمة المستخدمين
    loadUsers();
}

// تشفير كلمة المرور (تنفيذ بسيط)
function hashPassword(password) {
    // في التطبيق الحقيقي، يجب استخدام خوارزمية تشفير قوية
    // هذا مجرد تنفيذ بسيط للتوضيح
    return btoa(password); // تشفير Base64
}

// إضافة معالجات الأحداث لأزرار إجراءات المستخدمين
function addUserActionButtonsHandlers() {
    // أزرار التعديل
    document.querySelectorAll('.edit-user-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const userId = parseInt(this.getAttribute('data-id'));
            editUser(userId);
        });
    });
    
    // أزرار الحذف
    document.querySelectorAll('.delete-user-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const userId = parseInt(this.getAttribute('data-id'));
            confirmDeleteUser(userId);
        });
    });
}

// تعديل بيانات المستخدم
function editUser(userId) {
    // استرجاع بيانات المستخدم
    const users = getFromLocalStorage('users') || [];
    const user = users.find(u => u.id === userId);
    
    if (!user) {
        showNotification('لم يتم العثور على المستخدم', 'error');
        return;
    }
    
    // تحميل قائمة الموظفين
    loadEmployeesList('edit-employee-id');
    
    // ملء نموذج التعديل ببيانات المستخدم
    document.getElementById('edit-user-id').value = user.id;
    document.getElementById('edit-username').value = user.username;
    document.getElementById('edit-password').value = ''; // لا نعرض كلمة المرور المشفرة
    document.getElementById('edit-employee-id').value = user.employeeID || '';
    document.getElementById('edit-user-role').value = user.userRole;
    document.getElementById('edit-user-status').value = user.isActive.toString();
    
    // عرض النافذة المنبثقة
    showModal('edit-user-modal');
}

// تحديث بيانات المستخدم
function updateUser() {
    // التحقق من صحة البيانات
    const usernameInput = document.getElementById('edit-username');
    const username = usernameInput.value.trim();
    const userId = parseInt(document.getElementById('edit-user-id').value);
    
    if (!username) {
        usernameInput.classList.add('invalid');
        showNotification('يرجى إدخال اسم المستخدم', 'error');
        return;
    }
    
    // التحقق من عدم تكرار اسم المستخدم
    const users = getFromLocalStorage('users') || [];
    if (users.some(user => user.username === username && user.id !== userId)) {
        usernameInput.classList.add('invalid');
        showNotification('اسم المستخدم موجود بالفعل', 'error');
        return;
    }
    
    // إنشاء كائن بيانات المستخدم
    const userData = {
        username,
        employeeID: document.getElementById('edit-employee-id').value || null,
        userRole: document.getElementById('edit-user-role').value,
        isActive: document.getElementById('edit-user-status').value === 'true'
    };
    
    // إضافة كلمة المرور إذا تم تغييرها
    const password = document.getElementById('edit-password').value.trim();
    if (password) {
        userData.password = hashPassword(password);
    }
    
    // تحديث المستخدم في قاعدة البيانات
    const success = updateUserData(userId, userData);
    
    // إغلاق النافذة المنبثقة
    hideModal('edit-user-modal');
    
    if (success) {
        // عرض رسالة نجاح
        showNotification('تم تحديث بيانات المستخدم بنجاح', 'success');
        
        // إعادة تحميل قائمة المستخدمين
        loadUsers();
    } else {
        // عرض رسالة خطأ
        showNotification('حدث خطأ أثناء تحديث بيانات المستخدم', 'error');
    }
}

// تأكيد حذف المستخدم
function confirmDeleteUser(userId) {
    // استرجاع بيانات المستخدم
    const users = getFromLocalStorage('users') || [];
    const user = users.find(u => u.id === userId);
    
    if (!user) {
        showNotification('لم يتم العثور على المستخدم', 'error');
        return;
    }
    
    // ملء نموذج تأكيد الحذف ببيانات المستخدم
    document.getElementById('delete-user-id').value = user.id;
    document.getElementById('delete-username').textContent = user.username;
    
    // عرض النافذة المنبثقة
    showModal('delete-user-modal');
}

// حذف المستخدم
function deleteUser() {
    const userId = parseInt(document.getElementById('delete-user-id').value);
    
    // حذف المستخدم من قاعدة البيانات
    const success = deleteUserData(userId);
    
    // إغلاق النافذة المنبثقة
    hideModal('delete-user-modal');
    
    if (success) {
        // عرض رسالة نجاح
        showNotification('تم حذف المستخدم بنجاح', 'success');
        
        // إعادة تحميل قائمة المستخدمين
        loadUsers();
    } else {
        // عرض رسالة خطأ
        showNotification('حدث خطأ أثناء حذف المستخدم', 'error');
    }
}

// تصدير البيانات
function exportData() {
    // استرجاع جميع البيانات من localStorage
    const data = {
        employees: getFromLocalStorage('employees') || [],
        departments: getFromLocalStorage('departments') || [],
        jobTitles: getFromLocalStorage('jobTitles') || [],
        users: getFromLocalStorage('users') || [],
        settings: getFromLocalStorage('settings') || getDefaultSettings(),
        // يمكن إضافة المزيد من البيانات هنا
    };
    
    // تحويل البيانات إلى سلسلة JSON
    const jsonData = JSON.stringify(data, null, 2);
    
    // إنشاء رابط تنزيل
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // إنشاء عنصر رابط وهمي للتنزيل
    const a = document.createElement('a');
    a.href = url;
    a.download = `employee_management_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    
    // تنظيف
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 0);
    
    // عرض رسالة نجاح
    showNotification('تم تصدير البيانات بنجاح', 'success');
}

// استيراد البيانات
function importData(event) {
    const file = event.target.files[0];
    
    if (file) {
        // التحقق من نوع الملف
        if (file.type !== 'application/json') {
            showNotification('يرجى اختيار ملف JSON صالح', 'error');
            return;
        }
        
        // قراءة الملف
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const data = JSON.parse(e.target.result);
                
                // التحقق من صحة البيانات
                if (!data.employees || !data.departments || !data.jobTitles || !data.settings) {
                    throw new Error('بنية البيانات غير صالحة');
                }
                
                // حفظ البيانات في localStorage
                saveToLocalStorage('employees', data.employees);
                saveToLocalStorage('departments', data.departments);
                saveToLocalStorage('jobTitles', data.jobTitles);
                saveToLocalStorage('users', data.users || []);
                saveToLocalStorage('settings', data.settings);
                
                // إعادة تحميل الصفحة
                showNotification('تم استيراد البيانات بنجاح. سيتم إعادة تحميل الصفحة...', 'success');
                
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            } catch (error) {
                showNotification(`فشل استيراد البيانات: ${error.message}`, 'error');
            }
        };
        reader.readAsText(file);
    }
}

// إعادة تعيين جميع البيانات
function resetAllData() {
    // حذف جميع البيانات من localStorage
    localStorage.removeItem('employees');
    localStorage.removeItem('departments');
    localStorage.removeItem('jobTitles');
    localStorage.removeItem('users');
    
    // إعادة تعيين الإعدادات إلى القيم الافتراضية
    saveToLocalStorage('settings', getDefaultSettings());
    
    // إغلاق النافذة المنبثقة
    hideModal('confirm-reset-modal');
    
    // عرض رسالة نجاح
    showNotification('تم إعادة تعيين جميع البيانات بنجاح. سيتم إعادة تحميل الصفحة...', 'success');
    
    // إعادة تحميل الصفحة
    setTimeout(() => {
        window.location.reload();
    }, 2000);
}

// الحصول على الإعدادات الافتراضية
function getDefaultSettings() {
    return {
        general: {
            language: 'ar',
            dateFormat: 'dd/mm/yyyy',
            theme: 'light',
            itemsPerPage: '20'
        },
        company: {
            name: '',
            email: '',
            phone: '',
            website: '',
            address: '',
            logo: null
        }
    };
}

// عرض النافذة المنبثقة
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        // إضافة تأثيرات حركة للعناصر داخل النافذة المنبثقة
        const modalContent = modal.querySelector('.modal-content');
        modalContent.classList.add('animate-slide-up');
        
        // إظهار النافذة المنبثقة
        modal.classList.add('show');
    }
}

// إخفاء النافذة المنبثقة
function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
    }
}

// تنسيق التاريخ
function formatDate(dateString) {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
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
    
    // تأثيرات حركة للتبويبات
    const tabs = document.querySelectorAll('.settings-tabs .tab-btn');
    tabs.forEach((tab, index) => {
        tab.classList.add('animate-fade-in');
        tab.style.animationDelay = `${index * 0.1}s`;
    });
    
    // تأثيرات حركة للنماذج
    const forms = document.querySelectorAll('.form-section');
    forms.forEach((form, index) => {
        form.classList.add('animate-slide-up');
        form.style.animationDelay = `${0.3 + index * 0.2}s`;
    });
    
    // تأثيرات حركة لبطاقات النسخ الاحتياطي
    const backupCards = document.querySelectorAll('.backup-card');
    backupCards.forEach((card, index) => {
        card.classList.add('animate-fade-in');
        card.style.animationDelay = `${0.3 + index * 0.2}s`;
    });
    
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

// إضافة وظائف إدارة المستخدمين إلى قاعدة البيانات
function addUser(userData) {
    const users = getFromLocalStorage('users') || [];
    
    // إنشاء معرف فريد
    const id = users.length > 0 ? Math.max(...users.map(user => user.id)) + 1 : 1;
    
    // إضافة المعرف إلى بيانات المستخدم
    const newUser = {
        id,
        ...userData
    };
    
    // إضافة المستخدم إلى المصفوفة
    users.push(newUser);
    
    // حفظ المصفوفة المحدثة في localStorage
    saveToLocalStorage('users', users);
    
    return id;
}

// تحديث بيانات المستخدم
function updateUserData(userId, userData) {
    const users = getFromLocalStorage('users') || [];
    
    // البحث عن المستخدم
    const index = users.findIndex(user => user.id === userId);
    
    if (index === -1) {
        return false;
    }
    
    // تحديث بيانات المستخدم
    users[index] = {
        ...users[index],
        ...userData,
        updatedDate: new Date().toISOString()
    };
    
    // حفظ المصفوفة المحدثة في localStorage
    saveToLocalStorage('users', users);
    
    return true;
}

// حذف المستخدم
function deleteUserData(userId) {
    const users = getFromLocalStorage('users') || [];
    
    // البحث عن المستخدم
    const index = users.findIndex(user => user.id === userId);
    
    if (index === -1) {
        return false;
    }
    
    // حذف المستخدم من المصفوفة
    users.splice(index, 1);
    
    // حفظ المصفوفة المحدثة في localStorage
    saveToLocalStorage('users', users);
    
    return true;
}
