// تهيئة البيانات عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    // تهيئة قاعدة البيانات
    initializeData();
    
    // تحميل بيانات المستخدم الحالي
    loadCurrentUser();
    
    // تحميل بيانات الإجازات
    loadVacationData();
    
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
    
    // التحقق من صلاحيات المستخدم وإخفاء/إظهار العناصر المناسبة
    if (currentUser.role !== 'admin' && currentUser.role !== 'manager') {
        // إخفاء تبويبات المدير
        document.getElementById('pending-approvals-tab').style.display = 'none';
        document.getElementById('all-vacations-tab').style.display = 'none';
    }
}

// تحميل بيانات الإجازات
function loadVacationData() {
    // تهيئة بيانات الإجازات إذا لم تكن موجودة
    initializeVacationData();
    
    // تحميل بيانات الإجازات الخاصة بالمستخدم الحالي
    loadMyVacations();
    
    // تحميل بيانات طلبات الموافقة (للمدراء فقط)
    if (window.currentUser.role === 'admin' || window.currentUser.role === 'manager') {
        loadPendingApprovals();
        loadAllVacations();
    }
    
    // تحميل بيانات الأقسام للفلاتر
    loadDepartmentsForFilters();
    
    // تحميل بيانات الموظفين للفلاتر
    loadEmployeesForFilters();
    
    // تحديث عداد الطلبات المعلقة
    updatePendingCount();
}

// تهيئة بيانات الإجازات
function initializeVacationData() {
    // التحقق من وجود بيانات الإجازات في localStorage
    const vacations = getFromLocalStorage('vacations');
    
    // إذا لم تكن بيانات الإجازات موجودة، قم بتهيئتها
    if (!vacations) {
        saveToLocalStorage('vacations', []);
    }
    
    // التحقق من وجود بيانات أرصدة الإجازات في localStorage
    const vacationBalances = getFromLocalStorage('vacationBalances');
    
    // إذا لم تكن بيانات أرصدة الإجازات موجودة، قم بتهيئتها
    if (!vacationBalances) {
        // إنشاء أرصدة افتراضية لجميع الموظفين
        const employees = getFromLocalStorage('employees') || [];
        const balances = {};
        
        employees.forEach(emp => {
            balances[emp.id] = {
                annualBalance: 21, // الرصيد السنوي الافتراضي
                usedBalance: 0,    // الرصيد المستخدم
                remainingBalance: 21 // الرصيد المتبقي
            };
        });
        
        saveToLocalStorage('vacationBalances', balances);
    }
}

// تحميل بيانات الإجازات الخاصة بالمستخدم الحالي
function loadMyVacations() {
    // استرجاع بيانات الإجازات من localStorage
    const vacations = getFromLocalStorage('vacations') || [];
    
    // الحصول على معرف الموظف المرتبط بالمستخدم الحالي
    const employeeID = window.currentUser.employeeID;
    
    // تصفية الإجازات الخاصة بالموظف الحالي
    const myVacations = vacations.filter(vacation => vacation.employeeID === employeeID);
    
    // ترتيب الإجازات حسب تاريخ الطلب (من الأحدث للأقدم)
    myVacations.sort((a, b) => new Date(b.requestDate) - new Date(a.requestDate));
    
    // تحديث أرصدة الإجازات
    updateVacationBalances(employeeID);
    
    // الحصول على جدول الإجازات
    const tableBody = document.querySelector('#my-vacations-table tbody');
    tableBody.innerHTML = '';
    
    // إضافة الإجازات إلى الجدول
    if (myVacations.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="8" class="text-center">لا توجد إجازات</td>';
        tableBody.appendChild(row);
    } else {
        myVacations.forEach((vacation, index) => {
            const row = document.createElement('tr');
            
            // تحديد لون الحالة
            const statusClass = getStatusClass(vacation.status);
            
            row.innerHTML = `
                <td>${vacation.id}</td>
                <td>${getVacationTypeText(vacation.vacationType, vacation.otherType)}</td>
                <td>${formatDate(vacation.startDate)}</td>
                <td>${formatDate(vacation.endDate)}</td>
                <td>${vacation.days} يوم</td>
                <td><span class="status-badge ${statusClass}">${getStatusText(vacation.status)}</span></td>
                <td>${formatDate(vacation.requestDate)}</td>
                <td class="actions">
                    <button class="btn-icon view-vacation-btn" data-id="${vacation.id}" title="عرض">
                        <i class="fas fa-eye"></i>
                    </button>
                    ${vacation.status === 'pending' ? `
                    <button class="btn-icon cancel-btn" data-id="${vacation.id}" title="إلغاء">
                        <i class="fas fa-ban"></i>
                    </button>
                    ` : ''}
                </td>
            `;
            
            // إضافة تأثير حركة للصفوف
            row.classList.add('animate-fade-in');
            row.style.animationDelay = `${index * 0.05}s`;
            
            tableBody.appendChild(row);
        });
        
        // إضافة معالجات الأحداث لأزرار الإجراءات
        addVacationActionButtonsHandlers();
    }
}

// تحديث أرصدة الإجازات
function updateVacationBalances(employeeID) {
    // استرجاع بيانات أرصدة الإجازات من localStorage
    const vacationBalances = getFromLocalStorage('vacationBalances') || {};
    
    // الحصول على رصيد الموظف الحالي
    const employeeBalance = vacationBalances[employeeID] || {
        annualBalance: 21,
        usedBalance: 0,
        remainingBalance: 21
    };
    
    // تحديث الواجهة بأرصدة الإجازات
    document.getElementById('annual-balance').textContent = employeeBalance.annualBalance;
    document.getElementById('used-balance').textContent = employeeBalance.usedBalance;
    document.getElementById('remaining-balance').textContent = employeeBalance.remainingBalance;
}

// تحميل بيانات طلبات الموافقة
function loadPendingApprovals() {
    // استرجاع بيانات الإجازات من localStorage
    const vacations = getFromLocalStorage('vacations') || [];
    
    // الحصول على قيمة فلتر القسم
    const departmentFilter = document.getElementById('filter-department').value;
    
    // الحصول على قيمة فلتر الحالة
    const statusFilter = document.getElementById('filter-status').value;
    
    // تصفية الإجازات حسب الفلاتر
    let filteredVacations = vacations;
    
    // تصفية حسب الحالة
    if (statusFilter === 'pending') {
        filteredVacations = filteredVacations.filter(vacation => vacation.status === 'pending');
    }
    
    // تصفية حسب القسم
    if (departmentFilter) {
        filteredVacations = filteredVacations.filter(vacation => {
            const employee = getEmployeeById(vacation.employeeID);
            return employee && employee.departmentID === parseInt(departmentFilter);
        });
    }
    
    // ترتيب الإجازات حسب تاريخ الطلب (من الأحدث للأقدم)
    filteredVacations.sort((a, b) => new Date(b.requestDate) - new Date(a.requestDate));
    
    // الحصول على جدول طلبات الموافقة
    const tableBody = document.querySelector('#pending-approvals-table tbody');
    tableBody.innerHTML = '';
    
    // إضافة الإجازات إلى الجدول
    if (filteredVacations.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="9" class="text-center">لا توجد طلبات إجازة</td>';
        tableBody.appendChild(row);
    } else {
        filteredVacations.forEach((vacation, index) => {
            const employee = getEmployeeById(vacation.employeeID);
            const department = getDepartmentById(employee ? employee.departmentID : null);
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${vacation.id}</td>
                <td>${employee ? `${employee.firstName} ${employee.lastName}` : 'غير معروف'}</td>
                <td>${department ? department.name : 'غير معروف'}</td>
                <td>${getVacationTypeText(vacation.vacationType, vacation.otherType)}</td>
                <td>${formatDate(vacation.startDate)}</td>
                <td>${formatDate(vacation.endDate)}</td>
                <td>${vacation.days} يوم</td>
                <td>${formatDate(vacation.requestDate)}</td>
                <td class="actions">
                    <button class="btn-icon view-vacation-btn" data-id="${vacation.id}" title="عرض">
                        <i class="fas fa-eye"></i>
                    </button>
                    ${vacation.status === 'pending' ? `
                    <button class="btn-icon approve-btn" data-id="${vacation.id}" title="موافقة">
                        <i class="fas fa-check"></i>
                    </button>
                    <button class="btn-icon reject-btn" data-id="${vacation.id}" title="رفض">
                        <i class="fas fa-times"></i>
                    </button>
                    ` : ''}
                </td>
            `;
            
            // إضافة تأثير حركة للصفوف
            row.classList.add('animate-fade-in');
            row.style.animationDelay = `${index * 0.05}s`;
            
            tableBody.appendChild(row);
        });
        
        // إضافة معالجات الأحداث لأزرار الإجراءات
        addVacationActionButtonsHandlers();
    }
}

// تحميل جميع الإجازات
function loadAllVacations() {
    // استرجاع بيانات الإجازات من localStorage
    const vacations = getFromLocalStorage('vacations') || [];
    
    // الحصول على قيم الفلاتر
    const departmentFilter = document.getElementById('filter-all-department').value;
    const employeeFilter = document.getElementById('filter-all-employee').value;
    const statusFilter = document.getElementById('filter-all-status').value;
    const dateRangeFilter = document.getElementById('filter-date-range').value;
    
    // تصفية الإجازات حسب الفلاتر
    let filteredVacations = vacations;
    
    // تصفية حسب القسم
    if (departmentFilter) {
        filteredVacations = filteredVacations.filter(vacation => {
            const employee = getEmployeeById(vacation.employeeID);
            return employee && employee.departmentID === parseInt(departmentFilter);
        });
    }
    
    // تصفية حسب الموظف
    if (employeeFilter) {
        filteredVacations = filteredVacations.filter(vacation => vacation.employeeID === parseInt(employeeFilter));
    }
    
    // تصفية حسب الحالة
    if (statusFilter) {
        filteredVacations = filteredVacations.filter(vacation => vacation.status === statusFilter);
    }
    
    // تصفية حسب الفترة الزمنية
    if (dateRangeFilter !== 'all') {
        const today = new Date();
        let startDate, endDate;
        
        switch (dateRangeFilter) {
            case 'current-month':
                startDate = new Date(today.getFullYear(), today.getMonth(), 1);
                endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                break;
            case 'last-month':
                startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                endDate = new Date(today.getFullYear(), today.getMonth(), 0);
                break;
            case 'current-year':
                startDate = new Date(today.getFullYear(), 0, 1);
                endDate = new Date(today.getFullYear(), 11, 31);
                break;
            case 'custom':
                const customStartDate = document.getElementById('filter-start-date').value;
                const customEndDate = document.getElementById('filter-end-date').value;
                
                if (customStartDate) {
                    startDate = new Date(customStartDate);
                }
                
                if (customEndDate) {
                    endDate = new Date(customEndDate);
                    // تعيين الوقت إلى نهاية اليوم
                    endDate.setHours(23, 59, 59, 999);
                }
                break;
        }
        
        if (startDate) {
            filteredVacations = filteredVacations.filter(vacation => new Date(vacation.startDate) >= startDate);
        }
        
        if (endDate) {
            filteredVacations = filteredVacations.filter(vacation => new Date(vacation.startDate) <= endDate);
        }
    }
    
    // ترتيب الإجازات حسب تاريخ الطلب (من الأحدث للأقدم)
    filteredVacations.sort((a, b) => new Date(b.requestDate) - new Date(a.requestDate));
    
    // الحصول على جدول جميع الإجازات
    const tableBody = document.querySelector('#all-vacations-table tbody');
    tableBody.innerHTML = '';
    
    // إضافة الإجازات إلى الجدول
    if (filteredVacations.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="10" class="text-center">لا توجد إجازات مطابقة لمعايير البحث</td>';
        tableBody.appendChild(row);
    } else {
        filteredVacations.forEach((vacation, index) => {
            const employee = getEmployeeById(vacation.employeeID);
            const department = getDepartmentById(employee ? employee.departmentID : null);
            
            // تحديد لون الحالة
            const statusClass = getStatusClass(vacation.status);
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${vacation.id}</td>
                <td>${employee ? `${employee.firstName} ${employee.lastName}` : 'غير معروف'}</td>
                <td>${department ? department.name : 'غير معروف'}</td>
                <td>${getVacationTypeText(vacation.vacationType, vacation.otherType)}</td>
                <td>${formatDate(vacation.startDate)}</td>
                <td>${formatDate(vacation.endDate)}</td>
                <td>${vacation.days} يوم</td>
                <td><span class="status-badge ${statusClass}">${getStatusText(vacation.status)}</span></td>
                <td>${formatDate(vacation.requestDate)}</td>
                <td class="actions">
                    <button class="btn-icon view-vacation-btn" data-id="${vacation.id}" title="عرض">
                        <i class="fas fa-eye"></i>
                    </button>
                    ${vacation.status === 'pending' ? `
                    <button class="btn-icon approve-btn" data-id="${vacation.id}" title="موافقة">
                        <i class="fas fa-check"></i>
                    </button>
                    <button class="btn-icon reject-btn" data-id="${vacation.id}" title="رفض">
                        <i class="fas fa-times"></i>
                    </button>
                    ` : ''}
                </td>
            `;
            
            // إضافة تأثير حركة للصفوف
            row.classList.add('animate-fade-in');
            row.style.animationDelay = `${index * 0.05}s`;
            
            tableBody.appendChild(row);
        });
        
        // إضافة معالجات الأحداث لأزرار الإجراءات
        addVacationActionButtonsHandlers();
    }
}

// تحميل بيانات الأقسام للفلاتر
function loadDepartmentsForFilters() {
    // استرجاع بيانات الأقسام من localStorage
    const departments = getFromLocalStorage('departments') || [];
    
    // الحصول على قوائم الأقسام
    const filterDepartment = document.getElementById('filter-department');
    const filterAllDepartment = document.getElementById('filter-all-department');
    
    // إضافة الأقسام إلى القوائم
    departments.forEach(dept => {
        // إضافة القسم إلى قائمة فلتر طلبات الموافقة
        const option1 = document.createElement('option');
        option1.value = dept.id;
        option1.textContent = dept.name;
        filterDepartment.appendChild(option1);
        
        // إضافة القسم إلى قائمة فلتر جميع الإجازات
        const option2 = document.createElement('option');
        option2.value = dept.id;
        option2.textContent = dept.name;
        filterAllDepartment.appendChild(option2);
    });
}

// تحميل بيانات الموظفين للفلاتر
function loadEmployeesForFilters() {
    // استرجاع بيانات الموظفين من localStorage
    const employees = getFromLocalStorage('employees') || [];
    
    // الحصول على قائمة الموظفين
    const filterAllEmployee = document.getElementById('filter-all-employee');
    
    // إضافة الموظفين النشطين فقط إلى القائمة
    const activeEmployees = employees.filter(emp => emp.isActive);
    
    activeEmployees.forEach(emp => {
        const option = document.createElement('option');
        option.value = emp.id;
        option.textContent = `${emp.firstName} ${emp.lastName}`;
        filterAllEmployee.appendChild(option);
    });
}

// تحديث عداد الطلبات المعلقة
function updatePendingCount() {
    // استرجاع بيانات الإجازات من localStorage
    const vacations = getFromLocalStorage('vacations') || [];
    
    // حساب عدد الطلبات المعلقة
    const pendingCount = vacations.filter(vacation => vacation.status === 'pending').length;
    
    // تحديث العداد في الواجهة
    document.getElementById('pending-count').textContent = pendingCount;
    
    // إظهار أو إخفاء العداد حسب وجود طلبات معلقة
    document.getElementById('pending-count').style.display = pendingCount > 0 ? 'inline-block' : 'none';
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
    
    // معالج حدث تغيير نوع الإجازة
    document.getElementById('vacation-type').addEventListener('change', function() {
        const otherTypeContainer = document.getElementById('other-type-container');
        
        if (this.value === 'other') {
            otherTypeContainer.style.display = 'block';
        } else {
            otherTypeContainer.style.display = 'none';
        }
    });
    
    // معالج حدث تغيير تاريخ البداية أو النهاية
    document.getElementById('start-date').addEventListener('change', calculateVacationDays);
    document.getElementById('end-date').addEventListener('change', calculateVacationDays);
    
    // معالج حدث إرسال طلب الإجازة
    document.getElementById('submit-vacation-request').addEventListener('click', submitVacationRequest);
    
    // معالج حدث إعادة تعيين نموذج الإجازة
    document.getElementById('reset-vacation-form').addEventListener('click', function() {
        document.getElementById('vacation-request-form').reset();
        document.getElementById('other-type-container').style.display = 'none';
        document.getElementById('vacation-days').value = '';
        document.getElementById('return-date').value = '';
    });
    
    // معالج حدث تغيير ملف المرفق
    document.getElementById('attachment').addEventListener('change', function(event) {
        const fileName = event.target.files.length > 0 ? event.target.files[0].name : 'لم يتم اختيار ملف';
        document.querySelector('.file-name').textContent = fileName;
    });
    
    // معالج حدث زر تحميل الملف
    document.querySelector('.file-upload-btn').addEventListener('click', function() {
        document.getElementById('attachment').click();
    });
    
    // معالج حدث تطبيق فلتر طلبات الموافقة
    document.getElementById('apply-filter').addEventListener('click', function() {
        loadPendingApprovals();
    });
    
    // معالج حدث تطبيق فلتر جميع الإجازات
    document.getElementById('apply-all-filter').addEventListener('click', function() {
        loadAllVacations();
    });
    
    // معالج حدث تغيير نطاق التاريخ
    document.getElementById('filter-date-range').addEventListener('change', function() {
        const dateRangeInputs = document.querySelectorAll('.date-range');
        
        if (this.value === 'custom') {
            dateRangeInputs.forEach(input => {
                input.style.display = 'block';
            });
        } else {
            dateRangeInputs.forEach(input => {
                input.style.display = 'none';
            });
        }
    });
    
    // معالج حدث تصدير الإجازات
    document.getElementById('export-vacations').addEventListener('click', exportVacationsToExcel);
    
    // معالجات أحداث إغلاق النوافذ المنبثقة
    document.querySelectorAll('.modal-close, .modal-close-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            hideModal(modal.id);
        });
    });
    
    // معالج حدث تأكيد رفض الإجازة
    document.getElementById('confirm-reject-btn').addEventListener('click', confirmRejectVacation);
    
    // معالج حدث تأكيد إلغاء الإجازة
    document.getElementById('confirm-cancel-btn').addEventListener('click', confirmCancelVacation);
}

// حساب عدد أيام الإجازة
function calculateVacationDays() {
    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');
    const vacationDaysInput = document.getElementById('vacation-days');
    const returnDateInput = document.getElementById('return-date');
    
    const startDate = startDateInput.value;
    const endDate = endDateInput.value;
    
    if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        // التحقق من صحة التواريخ
        if (end < start) {
            endDateInput.value = startDate;
            showNotification('تاريخ النهاية يجب أن يكون بعد تاريخ البداية', 'error');
            return;
        }
        
        // حساب عدد الأيام
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 لتضمين يوم البداية والنهاية
        
        // تعيين عدد الأيام
        vacationDaysInput.value = diffDays;
        
        // حساب تاريخ العودة (اليوم التالي لتاريخ النهاية)
        const returnDate = new Date(end);
        returnDate.setDate(returnDate.getDate() + 1);
        
        // تنسيق تاريخ العودة
        const returnDateFormatted = returnDate.toISOString().split('T')[0];
        returnDateInput.value = returnDateFormatted;
    }
}

// إرسال طلب الإجازة
function submitVacationRequest() {
    // التحقق من صحة البيانات
    const vacationTypeInput = document.getElementById('vacation-type');
    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');
    
    const vacationType = vacationTypeInput.value;
    const startDate = startDateInput.value;
    const endDate = endDateInput.value;
    
    if (!vacationType) {
        vacationTypeInput.classList.add('invalid');
        showNotification('يرجى اختيار نوع الإجازة', 'error');
        return;
    }
    
    if (!startDate) {
        startDateInput.classList.add('invalid');
        showNotification('يرجى تحديد تاريخ البداية', 'error');
        return;
    }
    
    if (!endDate) {
        endDateInput.classList.add('invalid');
        showNotification('يرجى تحديد تاريخ النهاية', 'error');
        return;
    }
    
    // التحقق من نوع الإجازة "أخرى"
    let otherType = '';
    if (vacationType === 'other') {
        otherType = document.getElementById('other-type').value.trim();
        if (!otherType) {
            document.getElementById('other-type').classList.add('invalid');
            showNotification('يرجى تحديد نوع الإجازة الأخرى', 'error');
            return;
        }
    }
    
    // التحقق من رصيد الإجازة (للإجازات السنوية فقط)
    if (vacationType === 'annual') {
        const days = parseInt(document.getElementById('vacation-days').value);
        const employeeID = window.currentUser.employeeID;
        
        // استرجاع بيانات أرصدة الإجازات
        const vacationBalances = getFromLocalStorage('vacationBalances') || {};
        const employeeBalance = vacationBalances[employeeID] || { remainingBalance: 0 };
        
        if (days > employeeBalance.remainingBalance) {
            showNotification(`رصيد الإجازة غير كافٍ. الرصيد المتبقي: ${employeeBalance.remainingBalance} يوم`, 'error');
            return;
        }
    }
    
    // إنشاء كائن بيانات الإجازة
    const vacationData = {
        employeeID: window.currentUser.employeeID,
        vacationType,
        otherType,
        startDate,
        endDate,
        days: parseInt(document.getElementById('vacation-days').value),
        returnDate: document.getElementById('return-date').value,
        reason: document.getElementById('vacation-reason').value.trim(),
        contactInfo: document.getElementById('contact-info').value.trim(),
        attachment: null, // سيتم معالجة المرفقات في التطبيق الحقيقي
        status: 'pending',
        requestDate: new Date().toISOString(),
        approvalInfo: null,
        rejectionReason: null
    };
    
    // إضافة الإجازة إلى قاعدة البيانات
    const vacationId = addVacation(vacationData);
    
    // إعادة تعيين النموذج
    document.getElementById('vacation-request-form').reset();
    document.getElementById('other-type-container').style.display = 'none';
    document.getElementById('vacation-days').value = '';
    document.getElementById('return-date').value = '';
    document.querySelector('.file-name').textContent = 'لم يتم اختيار ملف';
    
    // عرض رسالة نجاح
    showNotification('تم إرسال طلب الإجازة بنجاح', 'success');
    
    // تحديث قائمة الإجازات
    loadMyVacations();
    
    // تحديث عداد الطلبات المعلقة
    updatePendingCount();
    
    // الانتقال إلى تبويب "إجازاتي"
    document.querySelector('.tab-btn[data-tab="my-vacations"]').click();
}

// إضافة معالجات الأحداث لأزرار إجراءات الإجازات
function addVacationActionButtonsHandlers() {
    // أزرار عرض الإجازة
    document.querySelectorAll('.view-vacation-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const vacationId = parseInt(this.getAttribute('data-id'));
            viewVacation(vacationId);
        });
    });
    
    // أزرار الموافقة على الإجازة
    document.querySelectorAll('.approve-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const vacationId = parseInt(this.getAttribute('data-id'));
            approveVacation(vacationId);
        });
    });
    
    // أزرار رفض الإجازة
    document.querySelectorAll('.reject-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const vacationId = parseInt(this.getAttribute('data-id'));
            rejectVacation(vacationId);
        });
    });
    
    // أزرار إلغاء الإجازة
    document.querySelectorAll('.cancel-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const vacationId = parseInt(this.getAttribute('data-id'));
            cancelVacation(vacationId);
        });
    });
}

// عرض تفاصيل الإجازة
function viewVacation(vacationId) {
    // استرجاع بيانات الإجازة
    const vacations = getFromLocalStorage('vacations') || [];
    const vacation = vacations.find(v => v.id === vacationId);
    
    if (!vacation) {
        showNotification('لم يتم العثور على الإجازة', 'error');
        return;
    }
    
    // استرجاع بيانات الموظف
    const employee = getEmployeeById(vacation.employeeID);
    
    // استرجاع بيانات القسم
    const department = getDepartmentById(employee ? employee.departmentID : null);
    
    // تحديد لون الحالة
    const statusClass = getStatusClass(vacation.status);
    
    // ملء نموذج عرض الإجازة ببيانات الإجازة
    document.getElementById('vacation-status-badge').className = `status-badge ${statusClass}`;
    document.getElementById('vacation-status-badge').textContent = getStatusText(vacation.status);
    document.getElementById('vacation-employee-name').textContent = employee ? `${employee.firstName} ${employee.lastName}` : 'غير معروف';
    document.getElementById('vacation-id').textContent = vacation.id;
    document.getElementById('vacation-department').textContent = department ? department.name : 'غير معروف';
    document.getElementById('vacation-type-display').textContent = getVacationTypeText(vacation.vacationType, vacation.otherType);
    document.getElementById('vacation-start-date').textContent = formatDate(vacation.startDate);
    document.getElementById('vacation-end-date').textContent = formatDate(vacation.endDate);
    document.getElementById('vacation-duration').textContent = `${vacation.days} يوم`;
    document.getElementById('vacation-return-date').textContent = formatDate(vacation.returnDate);
    document.getElementById('vacation-request-date').textContent = formatDate(vacation.requestDate);
    document.getElementById('vacation-reason-display').textContent = vacation.reason || 'لا يوجد';
    document.getElementById('vacation-contact').textContent = vacation.contactInfo || 'لا يوجد';
    
    // إظهار أو إخفاء معلومات الموافقة
    const approvalInfo = document.getElementById('approval-info');
    if (vacation.status === 'approved' && vacation.approvalInfo) {
        approvalInfo.style.display = 'block';
        document.getElementById('vacation-approval-info').textContent = vacation.approvalInfo;
    } else {
        approvalInfo.style.display = 'none';
    }
    
    // إظهار أو إخفاء سبب الرفض
    const rejectionInfo = document.getElementById('rejection-info');
    if (vacation.status === 'rejected' && vacation.rejectionReason) {
        rejectionInfo.style.display = 'block';
        document.getElementById('vacation-rejection-reason').textContent = vacation.rejectionReason;
    } else {
        rejectionInfo.style.display = 'none';
    }
    
    // إظهار أو إخفاء المرفقات
    const attachmentInfo = document.getElementById('attachment-info');
    if (vacation.attachment) {
        attachmentInfo.style.display = 'block';
        document.querySelector('.attachment-link').href = vacation.attachment;
    } else {
        attachmentInfo.style.display = 'none';
    }
    
    // إظهار أو إخفاء أزرار الإجراءات
    const vacationActions = document.getElementById('vacation-actions');
    const approveBtn = document.getElementById('approve-vacation-btn');
    const rejectBtn = document.getElementById('reject-vacation-btn');
    const cancelBtn = document.getElementById('cancel-vacation-btn');
    
    // إخفاء جميع الأزرار أولاً
    approveBtn.style.display = 'none';
    rejectBtn.style.display = 'none';
    cancelBtn.style.display = 'none';
    
    // إظهار الأزرار المناسبة حسب حالة الإجازة ودور المستخدم
    if (vacation.status === 'pending') {
        // إذا كان المستخدم هو صاحب الإجازة
        if (vacation.employeeID === window.currentUser.employeeID) {
            cancelBtn.style.display = 'inline-block';
        }
        
        // إذا كان المستخدم مدير أو مشرف
        if (window.currentUser.role === 'admin' || window.currentUser.role === 'manager') {
            approveBtn.style.display = 'inline-block';
            rejectBtn.style.display = 'inline-block';
        }
    }
    
    // إضافة معالجات الأحداث لأزرار الإجراءات
    approveBtn.onclick = function() {
        hideModal('view-vacation-modal');
        approveVacation(vacationId);
    };
    
    rejectBtn.onclick = function() {
        hideModal('view-vacation-modal');
        rejectVacation(vacationId);
    };
    
    cancelBtn.onclick = function() {
        hideModal('view-vacation-modal');
        cancelVacation(vacationId);
    };
    
    // عرض النافذة المنبثقة
    showModal('view-vacation-modal');
}

// الموافقة على الإجازة
function approveVacation(vacationId) {
    // استرجاع بيانات الإجازة
    const vacations = getFromLocalStorage('vacations') || [];
    const vacationIndex = vacations.findIndex(v => v.id === vacationId);
    
    if (vacationIndex === -1) {
        showNotification('لم يتم العثور على الإجازة', 'error');
        return;
    }
    
    // التحقق من حالة الإجازة
    if (vacations[vacationIndex].status !== 'pending') {
        showNotification('لا يمكن الموافقة على إجازة غير معلقة', 'error');
        return;
    }
    
    // تحديث حالة الإجازة
    vacations[vacationIndex].status = 'approved';
    vacations[vacationIndex].approvalInfo = `تمت الموافقة بواسطة ${window.currentUser.fullName} بتاريخ ${formatDate(new Date().toISOString())}`;
    
    // تحديث رصيد الإجازة (للإجازات السنوية فقط)
    if (vacations[vacationIndex].vacationType === 'annual') {
        updateEmployeeVacationBalance(vacations[vacationIndex].employeeID, vacations[vacationIndex].days);
    }
    
    // حفظ البيانات المحدثة
    saveToLocalStorage('vacations', vacations);
    
    // عرض رسالة نجاح
    showNotification('تمت الموافقة على الإجازة بنجاح', 'success');
    
    // تحديث قوائم الإجازات
    loadPendingApprovals();
    loadAllVacations();
    
    // تحديث عداد الطلبات المعلقة
    updatePendingCount();
}

// رفض الإجازة
function rejectVacation(vacationId) {
    // استرجاع بيانات الإجازة
    const vacations = getFromLocalStorage('vacations') || [];
    const vacation = vacations.find(v => v.id === vacationId);
    
    if (!vacation) {
        showNotification('لم يتم العثور على الإجازة', 'error');
        return;
    }
    
    // التحقق من حالة الإجازة
    if (vacation.status !== 'pending') {
        showNotification('لا يمكن رفض إجازة غير معلقة', 'error');
        return;
    }
    
    // استرجاع بيانات الموظف
    const employee = getEmployeeById(vacation.employeeID);
    
    // ملء نموذج رفض الإجازة ببيانات الإجازة
    document.getElementById('reject-vacation-id').value = vacation.id;
    document.getElementById('reject-employee-name').textContent = employee ? `${employee.firstName} ${employee.lastName}` : 'غير معروف';
    
    // عرض النافذة المنبثقة
    showModal('reject-vacation-modal');
}

// تأكيد رفض الإجازة
function confirmRejectVacation() {
    // استرجاع بيانات النموذج
    const vacationId = parseInt(document.getElementById('reject-vacation-id').value);
    const rejectionReason = document.getElementById('rejection-reason').value.trim();
    
    // التحقق من صحة البيانات
    if (!rejectionReason) {
        document.getElementById('rejection-reason').classList.add('invalid');
        showNotification('يرجى ذكر سبب الرفض', 'error');
        return;
    }
    
    // استرجاع بيانات الإجازة
    const vacations = getFromLocalStorage('vacations') || [];
    const vacationIndex = vacations.findIndex(v => v.id === vacationId);
    
    if (vacationIndex === -1) {
        showNotification('لم يتم العثور على الإجازة', 'error');
        hideModal('reject-vacation-modal');
        return;
    }
    
    // تحديث حالة الإجازة
    vacations[vacationIndex].status = 'rejected';
    vacations[vacationIndex].rejectionReason = rejectionReason;
    
    // حفظ البيانات المحدثة
    saveToLocalStorage('vacations', vacations);
    
    // إغلاق النافذة المنبثقة
    hideModal('reject-vacation-modal');
    
    // عرض رسالة نجاح
    showNotification('تم رفض الإجازة بنجاح', 'success');
    
    // تحديث قوائم الإجازات
    loadPendingApprovals();
    loadAllVacations();
    
    // تحديث عداد الطلبات المعلقة
    updatePendingCount();
}

// إلغاء الإجازة
function cancelVacation(vacationId) {
    // استرجاع بيانات الإجازة
    const vacations = getFromLocalStorage('vacations') || [];
    const vacation = vacations.find(v => v.id === vacationId);
    
    if (!vacation) {
        showNotification('لم يتم العثور على الإجازة', 'error');
        return;
    }
    
    // التحقق من حالة الإجازة
    if (vacation.status !== 'pending') {
        showNotification('لا يمكن إلغاء إجازة غير معلقة', 'error');
        return;
    }
    
    // ملء نموذج إلغاء الإجازة ببيانات الإجازة
    document.getElementById('cancel-vacation-id').value = vacation.id;
    
    // عرض النافذة المنبثقة
    showModal('cancel-vacation-modal');
}

// تأكيد إلغاء الإجازة
function confirmCancelVacation() {
    // استرجاع بيانات النموذج
    const vacationId = parseInt(document.getElementById('cancel-vacation-id').value);
    
    // استرجاع بيانات الإجازة
    const vacations = getFromLocalStorage('vacations') || [];
    const vacationIndex = vacations.findIndex(v => v.id === vacationId);
    
    if (vacationIndex === -1) {
        showNotification('لم يتم العثور على الإجازة', 'error');
        hideModal('cancel-vacation-modal');
        return;
    }
    
    // تحديث حالة الإجازة
    vacations[vacationIndex].status = 'cancelled';
    
    // حفظ البيانات المحدثة
    saveToLocalStorage('vacations', vacations);
    
    // إغلاق النافذة المنبثقة
    hideModal('cancel-vacation-modal');
    
    // عرض رسالة نجاح
    showNotification('تم إلغاء الإجازة بنجاح', 'success');
    
    // تحديث قوائم الإجازات
    loadMyVacations();
    loadPendingApprovals();
    loadAllVacations();
    
    // تحديث عداد الطلبات المعلقة
    updatePendingCount();
}

// تحديث رصيد الإجازة للموظف
function updateEmployeeVacationBalance(employeeID, days) {
    // استرجاع بيانات أرصدة الإجازات
    const vacationBalances = getFromLocalStorage('vacationBalances') || {};
    
    // التحقق من وجود رصيد للموظف
    if (!vacationBalances[employeeID]) {
        vacationBalances[employeeID] = {
            annualBalance: 21,
            usedBalance: 0,
            remainingBalance: 21
        };
    }
    
    // تحديث الرصيد
    vacationBalances[employeeID].usedBalance += days;
    vacationBalances[employeeID].remainingBalance = vacationBalances[employeeID].annualBalance - vacationBalances[employeeID].usedBalance;
    
    // حفظ البيانات المحدثة
    saveToLocalStorage('vacationBalances', vacationBalances);
}

// تصدير الإجازات إلى ملف إكسل
function exportVacationsToExcel() {
    // استرجاع بيانات الإجازات المعروضة في الجدول
    const table = document.getElementById('all-vacations-table');
    const rows = table.querySelectorAll('tbody tr');
    
    // إنشاء مصفوفة لتخزين البيانات
    const data = [];
    
    // إضافة عناوين الأعمدة
    const headers = [];
    table.querySelectorAll('thead th').forEach(th => {
        headers.push(th.textContent);
    });
    data.push(headers);
    
    // إضافة بيانات الصفوف
    rows.forEach(row => {
        const rowData = [];
        row.querySelectorAll('td').forEach((td, index) => {
            // تجاهل عمود الإجراءات
            if (index < headers.length - 1) {
                // استخراج النص من الخلية
                let cellText = td.textContent.trim();
                
                // معالجة خاصة لخلايا الحالة
                if (td.querySelector('.status-badge')) {
                    cellText = td.querySelector('.status-badge').textContent.trim();
                }
                
                rowData.push(cellText);
            }
        });
        data.push(rowData);
    });
    
    // تحويل البيانات إلى CSV
    let csvContent = '';
    data.forEach(row => {
        csvContent += row.join(',') + '\n';
    });
    
    // إنشاء رابط تنزيل
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    // إنشاء عنصر رابط وهمي للتنزيل
    const a = document.createElement('a');
    a.href = url;
    a.download = `vacations_report_${new Date().toISOString().split('T')[0]}.csv`;
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

// إضافة إجازة جديدة
function addVacation(vacationData) {
    // استرجاع بيانات الإجازات من localStorage
    const vacations = getFromLocalStorage('vacations') || [];
    
    // إنشاء معرف فريد
    const id = vacations.length > 0 ? Math.max(...vacations.map(vacation => vacation.id)) + 1 : 1001;
    
    // إضافة المعرف إلى بيانات الإجازة
    const newVacation = {
        id,
        ...vacationData
    };
    
    // إضافة الإجازة إلى المصفوفة
    vacations.push(newVacation);
    
    // حفظ المصفوفة المحدثة في localStorage
    saveToLocalStorage('vacations', vacations);
    
    return id;
}

// الحصول على الموظف بواسطة المعرف
function getEmployeeById(employeeID) {
    if (!employeeID) return null;
    
    const employees = getFromLocalStorage('employees') || [];
    return employees.find(emp => emp.id === employeeID) || null;
}

// الحصول على القسم بواسطة المعرف
function getDepartmentById(departmentID) {
    if (!departmentID) return null;
    
    const departments = getFromLocalStorage('departments') || [];
    return departments.find(dept => dept.id === departmentID) || null;
}

// الحصول على نص نوع الإجازة
function getVacationTypeText(vacationType, otherType) {
    const types = {
        'annual': 'إجازة سنوية',
        'sick': 'إجازة مرضية',
        'emergency': 'إجازة طارئة',
        'unpaid': 'إجازة بدون راتب',
        'other': otherType || 'أخرى'
    };
    
    return types[vacationType] || vacationType;
}

// الحصول على نص حالة الإجازة
function getStatusText(status) {
    const statuses = {
        'pending': 'قيد الانتظار',
        'approved': 'تمت الموافقة',
        'rejected': 'مرفوض',
        'cancelled': 'ملغي'
    };
    
    return statuses[status] || status;
}

// الحصول على فئة CSS لحالة الإجازة
function getStatusClass(status) {
    const classes = {
        'pending': 'pending',
        'approved': 'active',
        'rejected': 'inactive',
        'cancelled': 'warning'
    };
    
    return classes[status] || '';
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
    const tabs = document.querySelectorAll('.vacations-tabs .tab-btn');
    tabs.forEach((tab, index) => {
        tab.classList.add('animate-fade-in');
        tab.style.animationDelay = `${index * 0.1}s`;
    });
    
    // تأثيرات حركة لبطاقات الإحصائيات
    const statCards = document.querySelectorAll('.stat-card');
    statCards.forEach((card, index) => {
        card.classList.add('animate-slide-up');
        card.style.animationDelay = `${0.3 + index * 0.1}s`;
    });
    
    // تأثيرات حركة للنماذج
    const forms = document.querySelectorAll('.form-container');
    forms.forEach((form, index) => {
        form.classList.add('animate-slide-up');
        form.style.animationDelay = `${0.3}s`;
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
