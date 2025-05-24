// وظائف مساعدة لتكملة ملف reports.js

// ملء فلاتر السنوات
function populateYearFilters() {
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - 10; // عرض آخر 10 سنوات
    const yearSelects = document.querySelectorAll('select[id$="-year"]'); // استهداف جميع قوائم السنوات

    yearSelects.forEach(select => {
        select.innerHTML = '<option value="0">جميع السنوات</option>'; // خيار افتراضي
        for (let year = currentYear; year >= startYear; year--) {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            select.appendChild(option);
        }
        // تحديد السنة الحالية كافتراضي لبعض الفلاتر
        if (select.id === 'deductions-year' || select.id === 'types-year' || select.id === 'comparison-year') {
            select.value = currentYear;
        }
        if (select.id === 'monthly-year') {
            select.value = currentYear;
        }
    });
}

// ملء فلاتر الأقسام
function populateDepartmentFilters() {
    const departments = getAllDepartments();
    const departmentSelects = document.querySelectorAll('select[id$="-department"]');

    departmentSelects.forEach(select => {
        // الحفاظ على الخيار الافتراضي الموجود
        const defaultOption = select.querySelector('option[value="0"]');
        select.innerHTML = '';
        if (defaultOption) {
            select.appendChild(defaultOption);
        } else {
            const option = document.createElement('option');
            option.value = '0';
            option.textContent = 'جميع الأقسام';
            select.appendChild(option);
        }

        departments.forEach(dept => {
            const option = document.createElement('option');
            option.value = dept.id;
            option.textContent = dept.name;
            select.appendChild(option);
        });
    });
}

// ملء فلاتر المستخدمين
function populateUserFilters() {
    const users = getAllUsers();
    const userSelect = document.getElementById('activities-user');
    if (!userSelect) return;

    userSelect.innerHTML = '<option value="0">جميع المستخدمين</option>';
    users.forEach(user => {
        const option = document.createElement('option');
        option.value = user.id;
        option.textContent = user.username;
        userSelect.appendChild(option);
    });
}

// ملء فلاتر الموظفين
function populateEmployeeFilters() {
    const employees = getAllEmployees();
    const employeeSelects = document.querySelectorAll('#employee1, #employee2');

    employeeSelects.forEach(select => {
        select.innerHTML = '<option value="0">اختر الموظف</option>';
        employees.forEach(emp => {
            const option = document.createElement('option');
            option.value = emp.id;
            option.textContent = emp.name || `موظف #${emp.id}`;
            select.appendChild(option);
        });
    });
}

// ترجمة حالة الإجازة
function translateVacationStatus(status) {
    const statusMap = {
        'approved': 'موافق عليها',
        'rejected': 'مرفوضة',
        'pending': 'معلقة'
    };
    return statusMap[status] || status;
}

// ترجمة نوع التغيير الوظيفي
function translateChangeType(type) {
    const typeMap = {
        'promotion': 'ترقية',
        'transfer': 'نقل',
        'title-change': 'تغيير مسمى'
    };
    return typeMap[type] || type;
}

// تصدير الجدول إلى Excel
function exportTableToExcel(tableId, fileName) {
    const table = document.getElementById(tableId);
    if (!table) {
        alert('لم يتم العثور على الجدول المطلوب!');
        return;
    }

    try {
        // تحويل الجدول إلى ورقة عمل
        const ws = XLSX.utils.table_to_sheet(table, { raw: true });
        
        // إنشاء مصنف جديد وإضافة ورقة العمل
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'تقرير');
        
        // تصدير المصنف
        XLSX.writeFile(wb, fileName);
    } catch (error) {
        console.error('خطأ في تصدير الجدول إلى Excel:', error);
        alert('حدث خطأ أثناء تصدير الجدول إلى Excel.');
    }
}

// تصدير الجدول إلى PDF
function exportTableToPdf(tableId, title, includeChart = false, chartId = null) {
    const table = document.getElementById(tableId);
    if (!table) {
        alert('لم يتم العثور على الجدول المطلوب!');
        return;
    }

    try {
        // إنشاء مستند PDF جديد
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('l', 'mm', 'a4'); // landscape orientation
        
        // إضافة العنوان
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(18);
        doc.text(title, 150, 20, { align: 'center' });
        
        // إضافة الرسم البياني إذا كان مطلوبًا
        let startY = 30;
        if (includeChart && chartId) {
            const chart = document.getElementById(chartId);
            if (chart) {
                const chartImg = chart.toDataURL('image/png', 1.0);
                doc.addImage(chartImg, 'PNG', 20, startY, 250, 80);
                startY += 90;
            }
        }
        
        // إضافة الجدول
        doc.autoTable({
            html: `#${tableId}`,
            startY: startY,
            styles: { halign: 'right', font: 'helvetica', fontSize: 10 },
            headStyles: { fillColor: [41, 128, 185], textColor: 255 },
            alternateRowStyles: { fillColor: [240, 240, 240] },
            margin: { top: 10 }
        });
        
        // إضافة التاريخ والوقت
        const now = new Date();
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`تاريخ التصدير: ${now.toLocaleDateString('ar-EG')} ${now.toLocaleTimeString('ar-EG')}`, 20, doc.internal.pageSize.height - 10);
        
        // تصدير المستند
        doc.save(`${title.replace(/\s+/g, '_')}.pdf`);
    } catch (error) {
        console.error('خطأ في تصدير الجدول إلى PDF:', error);
        alert('حدث خطأ أثناء تصدير الجدول إلى PDF.');
    }
}

// وظائف الوصول إلى البيانات
function getAllEmployees() {
    const employeesData = localStorage.getItem('employees');
    return employeesData ? JSON.parse(employeesData) : [];
}

function getEmployeeById(id) {
    const employees = getAllEmployees();
    return employees.find(emp => emp.id == id);
}

function getAllDepartments() {
    const departmentsData = localStorage.getItem('departments');
    return departmentsData ? JSON.parse(departmentsData) : [];
}

function getAllJobTitles() {
    const jobTitlesData = localStorage.getItem('jobTitles');
    return jobTitlesData ? JSON.parse(jobTitlesData) : [];
}

function getAllVacations() {
    const vacationsData = localStorage.getItem('vacations');
    return vacationsData ? JSON.parse(vacationsData) : [];
}

function getAllAppointments() {
    const appointmentsData = localStorage.getItem('appointments');
    return appointmentsData ? JSON.parse(appointmentsData) : [];
}

function getAllUsers() {
    const usersData = localStorage.getItem('users');
    return usersData ? JSON.parse(usersData) : [
        { id: 1, username: 'admin', role: 'مدير النظام', status: 'active', lastLogin: new Date().toISOString(), permissions: ['إدارة المستخدمين', 'إدارة النظام', 'عرض التقارير'] },
        { id: 2, username: 'hr_manager', role: 'مدير الموارد البشرية', status: 'active', lastLogin: new Date().toISOString(), permissions: ['إدارة الموظفين', 'إدارة الإجازات', 'عرض التقارير'] },
        { id: 3, username: 'employee', role: 'موظف', status: 'active', lastLogin: new Date().toISOString(), permissions: ['عرض البيانات الشخصية', 'طلب إجازة'] }
    ];
}

function getAllActivities() {
    const activitiesData = localStorage.getItem('activities');
    return activitiesData ? JSON.parse(activitiesData) : [
        { id: 1, userId: 1, activityType: 'تسجيل دخول', description: 'تسجيل دخول ناجح', timestamp: new Date().toISOString() },
        { id: 2, userId: 1, activityType: 'إضافة موظف', description: 'تمت إضافة موظف جديد', timestamp: new Date(Date.now() - 86400000).toISOString() },
        { id: 3, userId: 2, activityType: 'تعديل بيانات', description: 'تم تعديل بيانات موظف', timestamp: new Date(Date.now() - 172800000).toISOString() }
    ];
}

function getAllJobChanges() {
    const jobChangesData = localStorage.getItem('jobChanges');
    return jobChangesData ? JSON.parse(jobChangesData) : [
        { id: 1, employeeId: 1, changeType: 'promotion', fromValue: 'مطور', toValue: 'مطور أول', changeDate: new Date(Date.now() - 30 * 86400000).toISOString(), notes: 'ترقية سنوية' },
        { id: 2, employeeId: 2, changeType: 'transfer', fromValue: 'قسم المبيعات', toValue: 'قسم التسويق', changeDate: new Date(Date.now() - 60 * 86400000).toISOString(), notes: 'نقل بناءً على طلب الموظف' },
        { id: 3, employeeId: 3, changeType: 'title-change', fromValue: 'مساعد إداري', toValue: 'منسق إداري', changeDate: new Date(Date.now() - 90 * 86400000).toISOString(), notes: 'تغيير المسمى الوظيفي' }
    ];
}

// تهيئة بيانات افتراضية إذا لم تكن موجودة
function initializeDefaultData() {
    // التحقق من وجود بيانات الأقسام
    if (!localStorage.getItem('departments')) {
        const defaultDepartments = [
            { id: 1, name: 'الإدارة العليا' },
            { id: 2, name: 'الموارد البشرية' },
            { id: 3, name: 'تكنولوجيا المعلومات' },
            { id: 4, name: 'المالية والمحاسبة' },
            { id: 5, name: 'المبيعات والتسويق' }
        ];
        localStorage.setItem('departments', JSON.stringify(defaultDepartments));
    }

    // التحقق من وجود بيانات المسميات الوظيفية
    if (!localStorage.getItem('jobTitles')) {
        const defaultJobTitles = [
            { id: 1, name: 'مدير تنفيذي' },
            { id: 2, name: 'مدير قسم' },
            { id: 3, name: 'مطور برمجيات' },
            { id: 4, name: 'محاسب' },
            { id: 5, name: 'مسؤول موارد بشرية' },
            { id: 6, name: 'مندوب مبيعات' }
        ];
        localStorage.setItem('jobTitles', JSON.stringify(defaultJobTitles));
    }

    // التحقق من وجود بيانات الموظفين
    if (!localStorage.getItem('employees')) {
        const defaultEmployees = [
            { id: 1, name: 'أحمد محمد', departmentId: 1, jobTitleId: 1, hireDate: '2020-01-15', status: 'active', salary: 15000 },
            { id: 2, name: 'سارة أحمد', departmentId: 2, jobTitleId: 5, hireDate: '2020-03-10', status: 'active', salary: 8000 },
            { id: 3, name: 'محمد علي', departmentId: 3, jobTitleId: 3, hireDate: '2021-05-20', status: 'active', salary: 10000 },
            { id: 4, name: 'فاطمة حسن', departmentId: 4, jobTitleId: 4, hireDate: '2021-07-01', status: 'active', salary: 7500 },
            { id: 5, name: 'خالد عبدالله', departmentId: 5, jobTitleId: 6, hireDate: '2022-02-15', status: 'active', salary: 6000 }
        ];
        localStorage.setItem('employees', JSON.stringify(defaultEmployees));
    }

    // التحقق من وجود بيانات الإجازات
    if (!localStorage.getItem('vacations')) {
        const defaultVacations = [
            { id: 1, employeeId: 1, type: 'سنوية', startDate: '2023-07-10', endDate: '2023-07-20', duration: 10, status: 'approved', requestDate: '2023-06-15' },
            { id: 2, employeeId: 2, type: 'مرضية', startDate: '2023-08-05', endDate: '2023-08-10', duration: 5, status: 'approved', requestDate: '2023-08-04' },
            { id: 3, employeeId: 3, type: 'سنوية', startDate: '2023-09-01', endDate: '2023-09-07', duration: 7, status: 'pending', requestDate: '2023-08-20' },
            { id: 4, employeeId: 4, type: 'عارضة', startDate: '2023-08-15', endDate: '2023-08-16', duration: 2, status: 'rejected', requestDate: '2023-08-14' }
        ];
        localStorage.setItem('vacations', JSON.stringify(defaultVacations));
    }
}

// استدعاء دالة تهيئة البيانات الافتراضية عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    initializeDefaultData();
});
