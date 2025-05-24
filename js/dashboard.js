// تهيئة البيانات عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    // تهيئة قاعدة البيانات
    initializeData();
    
    // تحميل البيانات للوحة المعلومات
    loadDashboardData();
    
    // تهيئة الرسم البياني
    initializeChart();
    
    // تفعيل زر تبديل القائمة الجانبية
    document.getElementById('sidebar-toggle').addEventListener('click', function() {
        document.querySelector('.sidebar').classList.toggle('active');
        document.querySelector('.main-content').classList.toggle('sidebar-collapsed');
    });
    
    // إضافة تأثيرات الحركة للعناصر
    addAnimations();
});

// تحميل البيانات للوحة المعلومات
function loadDashboardData() {
    // استرجاع البيانات من localStorage
    const employees = getFromLocalStorage('employees') || [];
    const departments = getFromLocalStorage('departments') || [];
    
    // حساب عدد الموظفين
    const totalEmployees = employees.length;
    const activeEmployees = employees.filter(emp => emp.isActive).length;
    
    // حساب متوسط الرواتب
    let totalSalary = 0;
    let salaryCount = 0;
    
    employees.forEach(emp => {
        if (emp.isActive && emp.salary) {
            totalSalary += emp.salary;
            salaryCount++;
        }
    });
    
    const averageSalary = salaryCount > 0 ? Math.round(totalSalary / salaryCount) : 0;
    
    // تحديث البطاقات الإحصائية
    document.getElementById('total-employees').textContent = totalEmployees;
    document.getElementById('active-employees').textContent = activeEmployees;
    document.getElementById('total-departments').textContent = departments.length;
    document.getElementById('average-salary').textContent = averageSalary.toLocaleString('ar-EG');
    
    // تحميل آخر الموظفين المضافين
    loadRecentEmployees(employees);
}

// تحميل آخر الموظفين المضافين
function loadRecentEmployees(employees) {
    // ترتيب الموظفين حسب تاريخ الإنشاء (من الأحدث للأقدم)
    const sortedEmployees = [...employees].sort((a, b) => {
        return new Date(b.createdDate) - new Date(a.createdDate);
    });
    
    // أخذ آخر 5 موظفين
    const recentEmployees = sortedEmployees.slice(0, 5);
    
    // الحصول على جدول الموظفين
    const tableBody = document.querySelector('#recent-employees-table tbody');
    tableBody.innerHTML = '';
    
    // إضافة الموظفين إلى الجدول
    if (recentEmployees.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="4" class="text-center">لا يوجد موظفين</td>';
        tableBody.appendChild(row);
    } else {
        recentEmployees.forEach((emp, index) => {
            const row = document.createElement('tr');
            
            // الحصول على اسم القسم
            const departmentName = getDepartmentName(emp.departmentID);
            
            // الحصول على المسمى الوظيفي
            const jobTitle = getJobTitleName(emp.jobTitleID);
            
            row.innerHTML = `
                <td>${emp.firstName} ${emp.lastName}</td>
                <td>${departmentName}</td>
                <td>${jobTitle}</td>
                <td>${formatDate(emp.hireDate)}</td>
            `;
            
            // إضافة تأثير حركة للصفوف
            row.classList.add('animate-fade-in');
            row.style.animationDelay = `${index * 0.1}s`;
            
            tableBody.appendChild(row);
        });
    }
}

// تهيئة الرسم البياني
function initializeChart() {
    // استرجاع البيانات من localStorage
    const employees = getFromLocalStorage('employees') || [];
    const departments = getFromLocalStorage('departments') || [];
    
    // حساب عدد الموظفين في كل قسم
    const departmentCounts = {};
    departments.forEach(dept => {
        departmentCounts[dept.id] = 0;
    });
    
    employees.forEach(emp => {
        if (emp.isActive && emp.departmentID && departmentCounts[emp.departmentID] !== undefined) {
            departmentCounts[emp.departmentID]++;
        }
    });
    
    // إعداد بيانات الرسم البياني
    const labels = [];
    const data = [];
    const backgroundColors = [
        'rgba(63, 81, 181, 0.7)',
        'rgba(76, 175, 80, 0.7)',
        'rgba(255, 152, 0, 0.7)',
        'rgba(244, 67, 54, 0.7)',
        'rgba(3, 169, 244, 0.7)',
        'rgba(156, 39, 176, 0.7)',
        'rgba(255, 87, 34, 0.7)',
        'rgba(0, 150, 136, 0.7)'
    ];
    
    let colorIndex = 0;
    departments.forEach(dept => {
        labels.push(dept.name);
        data.push(departmentCounts[dept.id]);
        colorIndex = (colorIndex + 1) % backgroundColors.length;
    });
    
    // إنشاء الرسم البياني
    const ctx = document.getElementById('departments-chart').getContext('2d');
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: backgroundColors.slice(0, departments.length),
                borderWidth: 1,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        font: {
                            family: 'Cairo'
                        }
                    }
                },
                tooltip: {
                    bodyFont: {
                        family: 'Cairo'
                    },
                    titleFont: {
                        family: 'Cairo'
                    }
                }
            },
            animation: {
                animateScale: true,
                animateRotate: true,
                duration: 1000,
                easing: 'easeInOutQuart'
            }
        }
    });
}

// الحصول على اسم القسم
function getDepartmentName(departmentId) {
    const departments = getFromLocalStorage('departments') || [];
    const department = departments.find(dept => dept.id === departmentId);
    return department ? department.name : 'غير محدد';
}

// الحصول على اسم المسمى الوظيفي
function getJobTitleName(jobTitleId) {
    const jobTitles = getFromLocalStorage('jobTitles') || [];
    const jobTitle = jobTitles.find(job => job.id === jobTitleId);
    return jobTitle ? jobTitle.title : 'غير محدد';
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

// إضافة تأثيرات الحركة للعناصر
function addAnimations() {
    // تأثيرات حركة للبطاقات الإحصائية
    const statsCards = document.querySelectorAll('.stats-cards .card');
    statsCards.forEach((card, index) => {
        card.classList.add('animate-fade-in');
        card.style.animationDelay = `${index * 0.1}s`;
    });
    
    // تأثيرات حركة للأقسام
    const sections = document.querySelectorAll('.section');
    sections.forEach((section, index) => {
        section.classList.add('animate-slide-up');
        section.style.animationDelay = `${0.3 + index * 0.2}s`;
    });
    
    // تأثيرات حركة للإجراءات السريعة
    const actionButtons = document.querySelectorAll('.actions-buttons .btn');
    actionButtons.forEach((btn, index) => {
        btn.classList.add('animate-slide-right');
        btn.style.animationDelay = `${0.5 + index * 0.1}s`;
    });
}
