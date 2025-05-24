// تهيئة البيانات عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    // تهيئة قاعدة البيانات
    initializeData();
    
    // تحميل قائمة الأقسام
    loadDepartments();
    
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

// تحميل قائمة الأقسام
function loadDepartments() {
    // استرجاع بيانات الأقسام من localStorage
    const departments = getAllDepartments();
    const employees = getFromLocalStorage('employees') || [];
    
    // الحصول على نص البحث
    const searchTerm = document.getElementById('search-input').value.trim().toLowerCase();
    
    // تصفية الأقسام حسب نص البحث
    let filteredDepartments = departments;
    if (searchTerm) {
        filteredDepartments = departments.filter(dept => {
            return dept.name.toLowerCase().includes(searchTerm) || 
                  (dept.description && dept.description.toLowerCase().includes(searchTerm));
        });
    }
    
    // ترتيب الأقسام حسب الاسم
    filteredDepartments.sort((a, b) => {
        return a.name.localeCompare(b.name);
    });
    
    // الحصول على جدول الأقسام
    const tableBody = document.querySelector('#departments-table tbody');
    tableBody.innerHTML = '';
    
    // إضافة الأقسام إلى الجدول
    if (filteredDepartments.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="6" class="text-center">لا توجد أقسام مطابقة لمعايير البحث</td>';
        tableBody.appendChild(row);
    } else {
        filteredDepartments.forEach((dept, index) => {
            // حساب عدد الموظفين في القسم
            const employeeCount = employees.filter(emp => emp.departmentID === dept.id && emp.isActive).length;
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${dept.id}</td>
                <td>${dept.name}</td>
                <td>${dept.description || '-'}</td>
                <td>${employeeCount}</td>
                <td>${formatDate(dept.createdDate)}</td>
                <td class="actions">
                    <button class="btn-icon view-btn" data-id="${dept.id}" title="عرض">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-icon edit-btn" data-id="${dept.id}" title="تعديل">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon delete-btn" data-id="${dept.id}" title="حذف">
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
        addActionButtonsHandlers();
    }
}

// تهيئة معالجات الأحداث
function initializeEventHandlers() {
    // معالج حدث البحث
    document.getElementById('search-btn').addEventListener('click', function() {
        loadDepartments();
        // إضافة تأثير نبض للزر
        this.classList.add('animate-pulse');
        setTimeout(() => {
            this.classList.remove('animate-pulse');
        }, 1000);
    });
    
    // معالج حدث الضغط على Enter في حقل البحث
    document.getElementById('search-input').addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            loadDepartments();
            document.getElementById('search-btn').classList.add('animate-pulse');
            setTimeout(() => {
                document.getElementById('search-btn').classList.remove('animate-pulse');
            }, 1000);
        }
    });
    
    // معالج حدث إضافة قسم جديد
    document.getElementById('add-department-btn').addEventListener('click', function() {
        showModal('add-department-modal');
    });
    
    // معالج حدث حفظ قسم جديد
    document.getElementById('save-department-btn').addEventListener('click', function() {
        // التحقق من صحة البيانات
        const nameInput = document.getElementById('department-name');
        const name = nameInput.value.trim();
        const description = document.getElementById('department-description').value.trim();
        
        if (!name) {
            nameInput.classList.add('invalid');
            showNotification('يرجى إدخال اسم القسم', 'error');
            // إضافة تأثير اهتزاز للحقل غير الصالح
            nameInput.classList.add('shake');
            setTimeout(() => {
                nameInput.classList.remove('shake');
            }, 500);
            return;
        }
        
        // إنشاء كائن بيانات القسم
        const departmentData = {
            name,
            description
        };
        
        // إضافة القسم إلى قاعدة البيانات
        const departmentId = addDepartment(departmentData);
        
        // إغلاق النافذة المنبثقة
        hideModal('add-department-modal');
        
        // إعادة تعيين النموذج
        document.getElementById('add-department-form').reset();
        
        // عرض رسالة نجاح
        showNotification('تم إضافة القسم بنجاح', 'success');
        
        // إعادة تحميل قائمة الأقسام
        loadDepartments();
    });
    
    // معالجات أحداث إغلاق النوافذ المنبثقة
    document.querySelectorAll('.modal-close, .modal-close-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            hideModal(modal.id);
        });
    });
    
    // معالج حدث تأكيد حذف قسم
    document.getElementById('confirm-delete-btn').addEventListener('click', function() {
        const departmentId = parseInt(document.getElementById('delete-department-id').value);
        
        // التحقق من وجود موظفين في القسم
        const employees = getFromLocalStorage('employees') || [];
        const hasEmployees = employees.some(emp => emp.departmentID === departmentId && emp.isActive);
        
        if (hasEmployees) {
            showNotification('لا يمكن حذف القسم لأنه يحتوي على موظفين نشطين', 'error');
            hideModal('delete-department-modal');
            return;
        }
        
        // حذف القسم من قاعدة البيانات
        const success = deleteDepartment(departmentId);
        
        // إغلاق النافذة المنبثقة
        hideModal('delete-department-modal');
        
        if (success) {
            // عرض رسالة نجاح
            showNotification('تم حذف القسم بنجاح', 'success');
            
            // إعادة تحميل قائمة الأقسام
            loadDepartments();
        } else {
            // عرض رسالة خطأ
            showNotification('حدث خطأ أثناء حذف القسم', 'error');
        }
    });
    
    // معالج حدث تحديث قسم
    document.getElementById('update-department-btn').addEventListener('click', function() {
        // التحقق من صحة البيانات
        const nameInput = document.getElementById('edit-department-name');
        const name = nameInput.value.trim();
        const description = document.getElementById('edit-department-description').value.trim();
        const departmentId = parseInt(document.getElementById('edit-department-id').value);
        
        if (!name) {
            nameInput.classList.add('invalid');
            showNotification('يرجى إدخال اسم القسم', 'error');
            // إضافة تأثير اهتزاز للحقل غير الصالح
            nameInput.classList.add('shake');
            setTimeout(() => {
                nameInput.classList.remove('shake');
            }, 500);
            return;
        }
        
        // إنشاء كائن بيانات القسم
        const departmentData = {
            name,
            description
        };
        
        // تحديث القسم في قاعدة البيانات
        const success = updateDepartment(departmentId, departmentData);
        
        // إغلاق النافذة المنبثقة
        hideModal('edit-department-modal');
        
        if (success) {
            // عرض رسالة نجاح
            showNotification('تم تحديث القسم بنجاح', 'success');
            
            // إعادة تحميل قائمة الأقسام
            loadDepartments();
        } else {
            // عرض رسالة خطأ
            showNotification('حدث خطأ أثناء تحديث القسم', 'error');
        }
    });
}

// إضافة معالجات الأحداث لأزرار الإجراءات
function addActionButtonsHandlers() {
    // أزرار العرض
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const departmentId = parseInt(this.getAttribute('data-id'));
            viewDepartment(departmentId);
        });
    });
    
    // أزرار التعديل
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const departmentId = parseInt(this.getAttribute('data-id'));
            editDepartment(departmentId);
        });
    });
    
    // أزرار الحذف
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const departmentId = parseInt(this.getAttribute('data-id'));
            confirmDeleteDepartment(departmentId);
        });
    });
}

// عرض بيانات القسم
function viewDepartment(departmentId) {
    // استرجاع بيانات القسم
    const departments = getFromLocalStorage('departments') || [];
    const department = departments.find(dept => dept.id === departmentId);
    
    if (!department) {
        showNotification('لم يتم العثور على القسم', 'error');
        return;
    }
    
    // استرجاع بيانات الموظفين في القسم
    const employees = getFromLocalStorage('employees') || [];
    const departmentEmployees = employees.filter(emp => emp.departmentID === departmentId && emp.isActive);
    
    // إنشاء نافذة منبثقة لعرض بيانات القسم
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'view-department-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>بيانات القسم</h3>
                <button class="modal-close"><i class="fas fa-times"></i></button>
            </div>
            <div class="modal-body">
                <div class="department-details">
                    <h2 class="animate-fade-in">${department.name}</h2>
                    <div class="info-grid">
                        <div class="info-item animate-slide-right delay-100">
                            <span class="info-label">رقم القسم:</span>
                            <span class="info-value">${department.id}</span>
                        </div>
                        <div class="info-item animate-slide-right delay-200">
                            <span class="info-label">تاريخ الإنشاء:</span>
                            <span class="info-value">${formatDate(department.createdDate)}</span>
                        </div>
                        <div class="info-item full-width animate-slide-right delay-300">
                            <span class="info-label">الوصف:</span>
                            <span class="info-value">${department.description || 'لا يوجد وصف'}</span>
                        </div>
                    </div>
                    
                    <h3 class="animate-fade-in delay-400">الموظفين في القسم (${departmentEmployees.length})</h3>
                    ${departmentEmployees.length > 0 ? `
                    <table class="data-table animate-fade-in delay-500">
                        <thead>
                            <tr>
                                <th>الاسم</th>
                                <th>المسمى الوظيفي</th>
                                <th>تاريخ التعيين</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${departmentEmployees.map((emp, index) => `
                            <tr class="animate-fade-in" style="animation-delay: ${0.5 + index * 0.1}s">
                                <td>${emp.firstName} ${emp.lastName}</td>
                                <td>${getJobTitleName(emp.jobTitleID)}</td>
                                <td>${formatDate(emp.hireDate)}</td>
                            </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    ` : '<p class="animate-fade-in delay-500">لا يوجد موظفين في هذا القسم</p>'}
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-primary edit-btn animate-fade-in delay-600" data-id="${department.id}">
                    <i class="fas fa-edit"></i> تعديل
                </button>
                <button class="btn btn-secondary modal-close-btn animate-fade-in delay-600">
                    <i class="fas fa-times"></i> إغلاق
                </button>
            </div>
        </div>
    `;
    
    // إضافة النافذة المنبثقة إلى الصفحة
    document.body.appendChild(modal);
    
    // إضافة معالجات الأحداث للنافذة المنبثقة
    modal.querySelector('.modal-close').addEventListener('click', function() {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.remove();
        }, 300);
    });
    
    modal.querySelector('.modal-close-btn').addEventListener('click', function() {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.remove();
        }, 300);
    });
    
    modal.querySelector('.edit-btn').addEventListener('click', function() {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.remove();
            editDepartment(departmentId);
        }, 300);
    });
    
    // إظهار النافذة المنبثقة
    setTimeout(function() {
        modal.classList.add('show');
    }, 10);
}

// تعديل بيانات القسم
function editDepartment(departmentId) {
    // استرجاع بيانات القسم
    const departments = getFromLocalStorage('departments') || [];
    const department = departments.find(dept => dept.id === departmentId);
    
    if (!department) {
        showNotification('لم يتم العثور على القسم', 'error');
        return;
    }
    
    // ملء نموذج التعديل ببيانات القسم
    document.getElementById('edit-department-id').value = department.id;
    document.getElementById('edit-department-name').value = department.name;
    document.getElementById('edit-department-description').value = department.description || '';
    
    // عرض النافذة المنبثقة
    showModal('edit-department-modal');
}

// تأكيد حذف القسم
function confirmDeleteDepartment(departmentId) {
    // استرجاع بيانات القسم
    const departments = getFromLocalStorage('departments') || [];
    const department = departments.find(dept => dept.id === departmentId);
    
    if (!department) {
        showNotification('لم يتم العثور على القسم', 'error');
        return;
    }
    
    // ملء نموذج تأكيد الحذف ببيانات القسم
    document.getElementById('delete-department-id').value = department.id;
    document.getElementById('delete-department-name').textContent = department.name;
    
    // عرض النافذة المنبثقة
    showModal('delete-department-modal');
}

// الحصول على اسم المسمى الوظيفي
function getJobTitleName(jobTitleId) {
    const jobTitles = getFromLocalStorage('jobTitles') || [];
    const jobTitle = jobTitles.find(job => job.id === jobTitleId);
    return jobTitle ? jobTitle.title : 'غير محدد';
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
    
    // تأثيرات حركة لأدوات التحكم
    const controlPanel = document.querySelector('.control-panel');
    if (controlPanel) {
        controlPanel.classList.add('animate-slide-up');
    }
    
    // تأثيرات حركة لعنوان الجدول
    const sectionHeader = document.querySelector('.section-header');
    if (sectionHeader) {
        sectionHeader.classList.add('animate-fade-in', 'delay-100');
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
    
    // إضافة تأثير CSS للأزرار الأيقونية عند التحويم
    document.querySelectorAll('.btn-icon').forEach(btn => {
        btn.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });
        
        btn.addEventListener('mouseleave', function() {
            this.style.transform = '';
        });
    });
}

// إضافة تأثير اهتزاز للعناصر
document.head.insertAdjacentHTML('beforeend', `
    <style>
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
            20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        
        .shake {
            animation: shake 0.5s ease-in-out;
        }
    </style>
`);
