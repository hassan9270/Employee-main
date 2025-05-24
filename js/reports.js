// تهيئة البيانات عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    initializeReportsPage();
    setupEventListeners();
});

// تهيئة صفحة التقارير
function initializeReportsPage() {
    populateYearFilters();
    populateDepartmentFilters();
    populateUserFilters();
    populateEmployeeFilters();
    
    // عرض التقرير الافتراضي (بيانات الموظفين الأساسية)
    loadBasicEmployeeData();
    activateReportSection('hr-reports');
    activateReportTab('hr-reports', 'basic-employee-data');
}

// إعداد مستمعي الأحداث
function setupEventListeners() {
    // التنقل بين أقسام التقارير الرئيسية
    const reportMenuItems = document.querySelectorAll('.reports-menu li');
    reportMenuItems.forEach(item => {
        item.addEventListener('click', () => {
            const reportId = item.getAttribute('data-report');
            activateReportSection(reportId);
            // تفعيل أول تبويب في القسم الجديد
            const firstTabButton = document.querySelector(`#${reportId} .report-tab`);
            if (firstTabButton) {
                const firstTabId = firstTabButton.getAttribute('data-tab');
                activateReportTab(reportId, firstTabId);
                loadReportData(reportId, firstTabId); // تحميل بيانات التبويب الأول
            }
        });
    });

    // التنقل بين تبويبات التقارير داخل كل قسم
    const reportTabButtons = document.querySelectorAll('.report-tab');
    reportTabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const reportSection = button.closest('.report-section');
            const reportId = reportSection.id;
            const tabId = button.getAttribute('data-tab');
            activateReportTab(reportId, tabId);
            loadReportData(reportId, tabId); // تحميل بيانات التبويب المحدد
        });
    });

    // أزرار تطبيق الفلاتر
    setupFilterButtons();

    // أزرار التصدير
    setupExportButtons();
}

// إعداد أزرار تطبيق الفلاتر
function setupFilterButtons() {
    const filterButtons = {
        'apply-basic-filters': () => loadBasicEmployeeData(),
        'apply-appointments-filters': () => loadAppointmentsMovementData(),
        'apply-monthly-filters': () => loadMonthlyAppointmentsData(),
        'apply-performance-filters': () => loadPerformanceEvaluationData(),
        'apply-comparison-filters': () => loadPerformanceComparisonData(),
        'apply-vacation-filters': () => loadVacationBalanceData(),
        'apply-requests-filters': () => loadVacationRequestsData(),
        'apply-types-filters': () => loadVacationTypesData(),
        'apply-deductions-filters': () => loadInsuranceDeductionsData(),
        'apply-activities-filters': () => loadUserActivitiesData(),
        'apply-custom-department-filters': () => loadCustomDepartmentReport(),
        'apply-comparison-report-filters': () => loadCustomComparisonReport(),
        'apply-job-change-filters': () => loadJobChangeReport(),
    };

    for (const [buttonId, handler] of Object.entries(filterButtons)) {
        const button = document.getElementById(buttonId);
        if (button) {
            button.addEventListener('click', handler);
        }
    }
}

// إعداد أزرار التصدير
function setupExportButtons() {
    const exportButtons = {
        'export-basic-employee-excel': () => exportTableToExcel('basic-employee-table', 'بيانات_الموظفين_الأساسية.xlsx'),
        'export-basic-employee-pdf': () => exportTableToPdf('basic-employee-table', 'تقرير بيانات الموظفين الأساسية'),
        'export-department-excel': () => exportTableToExcel('department-statistics-table', 'إحصائيات_الأقسام.xlsx'),
        'export-department-pdf': () => exportTableToPdf('department-statistics-table', 'تقرير إحصائيات الأقسام', true, 'departments-chart'),
        'export-job-title-excel': () => exportTableToExcel('job-title-statistics-table', 'إحصائيات_المسميات_الوظيفية.xlsx'),
        'export-job-title-pdf': () => exportTableToPdf('job-title-statistics-table', 'تقرير إحصائيات المسميات الوظيفية', true, 'job-titles-chart'),
        'export-appointments-excel': () => exportTableToExcel('appointments-table', 'حركة_التعيينات_والاستقالات.xlsx'),
        'export-appointments-pdf': () => exportTableToPdf('appointments-table', 'تقرير حركة التعيينات والاستقالات', true, 'appointments-chart'),
        'export-monthly-excel': () => exportTableToExcel('monthly-appointments-table', 'التعيينات_الشهرية.xlsx'),
        'export-monthly-pdf': () => exportTableToPdf('monthly-appointments-table', 'تقرير التعيينات الشهرية'),
        'export-performance-excel': () => exportTableToExcel('performance-table', 'تقييم_الأداء.xlsx'),
        'export-performance-pdf': () => exportTableToPdf('performance-table', 'تقرير تقييم الأداء', true, 'performance-chart'),
        'export-comparison-excel': () => exportTableToExcel('comparison-table', 'مقارنة_الأداء.xlsx'),
        'export-comparison-pdf': () => exportTableToPdf('comparison-table', 'تقرير مقارنة الأداء', true, 'comparison-chart'),
        'export-vacation-balance-excel': () => exportTableToExcel('vacation-balance-table', 'رصيد_الإجازات.xlsx'),
        'export-vacation-balance-pdf': () => exportTableToPdf('vacation-balance-table', 'تقرير رصيد الإجازات'),
        'export-vacation-requests-excel': () => exportTableToExcel('vacation-requests-table', 'طلبات_الإجازات.xlsx'),
        'export-vacation-requests-pdf': () => exportTableToPdf('vacation-requests-table', 'تقرير طلبات الإجازات', true, 'requests-chart'),
        'export-vacation-types-excel': () => exportTableToExcel('vacation-types-table', 'الإجازات_حسب_النوع.xlsx'),
        'export-vacation-types-pdf': () => exportTableToPdf('vacation-types-table', 'تقرير الإجازات حسب النوع', true, 'types-chart'),
        'export-insurance-excel': () => exportTableToExcel('insurance-subscriptions-table', 'الاشتراكات_التأمينية.xlsx'),
        'export-insurance-pdf': () => exportTableToPdf('insurance-subscriptions-table', 'تقرير الاشتراكات التأمينية'),
        'export-deductions-excel': () => exportTableToExcel('insurance-deductions-table', 'الخصومات_التأمينية.xlsx'),
        'export-deductions-pdf': () => exportTableToPdf('insurance-deductions-table', 'تقرير الخصومات التأمينية'),
        'export-permissions-excel': () => exportTableToExcel('user-permissions-table', 'المستخدمين_وصلاحياتهم.xlsx'),
        'export-permissions-pdf': () => exportTableToPdf('user-permissions-table', 'تقرير المستخدمين وصلاحياتهم'),
        'export-activities-excel': () => exportTableToExcel('user-activities-table', 'أنشطة_المستخدمين.xlsx'),
        'export-activities-pdf': () => exportTableToPdf('user-activities-table', 'تقرير أنشطة المستخدمين'),
        'export-department-report-excel': () => exportTableToExcel('custom-department-table', 'تقرير_حسب_القسم.xlsx'),
        'export-department-report-pdf': () => exportTableToPdf('custom-department-table', 'تقرير حسب القسم', true, 'custom-department-chart'),
        'export-comparison-report-excel': () => exportTableToExcel('comparison-report-table', 'تقرير_مقارنة_الأداء.xlsx'),
        'export-comparison-report-pdf': () => exportTableToPdf('comparison-report-table', 'تقرير مقارنة الأداء', true, 'comparison-report-chart'),
        'export-job-change-excel': () => exportTableToExcel('job-change-table', 'تقرير_التغير_الوظيفي.xlsx'),
        'export-job-change-pdf': () => exportTableToPdf('job-change-table', 'تقرير التغير الوظيفي', true, 'job-change-chart'),
    };

    for (const [buttonId, handler] of Object.entries(exportButtons)) {
        const button = document.getElementById(buttonId);
        if (button) {
            button.addEventListener('click', handler);
        }
    }
}

// تفعيل قسم التقرير المحدد
function activateReportSection(reportId) {
    // إخفاء جميع الأقسام
    document.querySelectorAll('.report-section').forEach(section => {
        section.classList.remove('active');
    });
    // إظهار القسم المحدد
    const activeSection = document.getElementById(reportId);
    if (activeSection) {
        activeSection.classList.add('active');
    }
    // تحديث القائمة الجانبية للتقارير
    document.querySelectorAll('.reports-menu li').forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-report') === reportId) {
            item.classList.add('active');
        }
    });
}

// تفعيل تبويب التقرير المحدد داخل القسم
function activateReportTab(reportId, tabId) {
    const reportSection = document.getElementById(reportId);
    if (!reportSection) return;

    // إخفاء جميع محتويات التبويبات في القسم الحالي
    reportSection.querySelectorAll('.report-tab-content').forEach(content => {
        content.classList.remove('active');
    });
    // إظهار محتوى التبويب المحدد
    const activeTabContent = reportSection.querySelector(`#${tabId}`);
    if (activeTabContent) {
        activeTabContent.classList.add('active');
    }
    // تحديث أزرار التبويبات في القسم الحالي
    reportSection.querySelectorAll('.report-tab').forEach(button => {
        button.classList.remove('active');
        if (button.getAttribute('data-tab') === tabId) {
            button.classList.add('active');
        }
    });
}

// تحميل بيانات التقرير بناءً على القسم والتبويب
function loadReportData(reportId, tabId) {
    switch (`${reportId}-${tabId}`) {
        case 'hr-reports-basic-employee-data': loadBasicEmployeeData(); break;
        case 'hr-reports-department-statistics': loadDepartmentStatistics(); break;
        case 'hr-reports-job-title-statistics': loadJobTitleStatistics(); break;
        case 'appointments-reports-appointments-movement': loadAppointmentsMovementData(); break;
        case 'appointments-reports-monthly-appointments': loadMonthlyAppointmentsData(); break;
        case 'performance-reports-performance-evaluation': loadPerformanceEvaluationData(); break;
        case 'performance-reports-performance-comparison': loadPerformanceComparisonData(); break;
        case 'vacation-reports-vacation-balance': loadVacationBalanceData(); break;
        case 'vacation-reports-vacation-requests': loadVacationRequestsData(); break;
        case 'vacation-reports-vacation-types': loadVacationTypesData(); break;
        case 'insurance-reports-insurance-subscriptions': loadInsuranceSubscriptionsData(); break;
        case 'insurance-reports-insurance-deductions': loadInsuranceDeductionsData(); break;
        case 'user-reports-user-permissions': loadUserPermissionsData(); break;
        case 'user-reports-user-activities': loadUserActivitiesData(); break;
        case 'custom-reports-department-report': loadCustomDepartmentReport(); break;
        case 'custom-reports-performance-comparison-report': loadCustomComparisonReport(); break;
        case 'custom-reports-job-change-report': loadJobChangeReport(); break;
        // أضف حالات أخرى للتقارير المستقبلية
    }
}

// ============================
// وظائف تحميل بيانات التقارير
// ============================

// 1. تقرير بيانات الموظفين الأساسية
function loadBasicEmployeeData() {
    const employees = getAllEmployees();
    const departments = getAllDepartments();
    const jobTitles = getAllJobTitles();
    const tableBody = document.querySelector('#basic-employee-table tbody');
    const departmentFilter = document.getElementById('basic-department-filter').value;
    const statusFilter = document.getElementById('basic-status-filter').value;

    tableBody.innerHTML = ''; // مسح الجدول

    const filteredEmployees = employees.filter(emp => {
        const departmentMatch = departmentFilter === '0' || emp.departmentId == departmentFilter;
        const statusMatch = statusFilter === 'all' || emp.status === statusFilter;
        return departmentMatch && statusMatch;
    });

    filteredEmployees.forEach(emp => {
        const department = departments.find(d => d.id === emp.departmentId);
        const jobTitle = jobTitles.find(j => j.id === emp.jobTitleId);
        const row = tableBody.insertRow();
        row.innerHTML = `
            <td>${emp.id}</td>
            <td>${emp.name || 'غير متوفر'}</td>
            <td>${department ? department.name : 'غير محدد'}</td>
            <td>${jobTitle ? jobTitle.name : 'غير محدد'}</td>
            <td>${emp.hireDate || 'غير متوفر'}</td>
            <td>${emp.status === 'active' ? 'نشط' : 'غير نشط'}</td>
        `;
    });
}

// 2. تقرير إحصائيات الأقسام
let departmentsChartInstance = null;
function loadDepartmentStatistics() {
    const employees = getAllEmployees();
    const departments = getAllDepartments();
    const tableBody = document.querySelector('#department-statistics-table tbody');
    tableBody.innerHTML = '';

    const departmentStats = departments.map(dept => {
        const deptEmployees = employees.filter(emp => emp.departmentId === dept.id && emp.status === 'active');
        const salaries = deptEmployees.map(emp => emp.salary || 0).filter(s => s > 0);
        const employeeCount = deptEmployees.length;
        const totalSalary = salaries.reduce((sum, s) => sum + s, 0);
        const avgSalary = employeeCount > 0 ? (totalSalary / employeeCount).toFixed(2) : 0;
        const maxSalary = salaries.length > 0 ? Math.max(...salaries) : 0;
        const minSalary = salaries.length > 0 ? Math.min(...salaries) : 0;

        return {
            id: dept.id,
            name: dept.name,
            employeeCount: employeeCount,
            avgSalary: avgSalary,
            maxSalary: maxSalary,
            minSalary: minSalary
        };
    });

    departmentStats.forEach(stat => {
        const row = tableBody.insertRow();
        row.innerHTML = `
            <td>${stat.name}</td>
            <td>${stat.employeeCount}</td>
            <td>${stat.avgSalary}</td>
            <td>${stat.maxSalary}</td>
            <td>${stat.minSalary}</td>
        `;
    });

    // تحديث الرسم البياني
    const ctx = document.getElementById('departments-chart').getContext('2d');
    const labels = departmentStats.map(d => d.name);
    const data = departmentStats.map(d => d.employeeCount);

    if (departmentsChartInstance) {
        departmentsChartInstance.destroy();
    }

    departmentsChartInstance = new Chart(ctx, {
        type: 'bar', // أو 'pie', 'doughnut'
        data: {
            labels: labels,
            datasets: [{
                label: 'عدد الموظفين في كل قسم',
                data: data,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.7)',
                    'rgba(54, 162, 235, 0.7)',
                    'rgba(255, 206, 86, 0.7)',
                    'rgba(75, 192, 192, 0.7)',
                    'rgba(153, 102, 255, 0.7)',
                    'rgba(255, 159, 64, 0.7)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// 3. تقرير إحصائيات المسميات الوظيفية
let jobTitlesChartInstance = null;
function loadJobTitleStatistics() {
    const employees = getAllEmployees();
    const jobTitles = getAllJobTitles();
    const tableBody = document.querySelector('#job-title-statistics-table tbody');
    tableBody.innerHTML = '';

    const jobTitleStats = jobTitles.map(job => {
        const jobEmployees = employees.filter(emp => emp.jobTitleId === job.id && emp.status === 'active');
        const salaries = jobEmployees.map(emp => emp.salary || 0).filter(s => s > 0);
        const employeeCount = jobEmployees.length;
        const totalSalary = salaries.reduce((sum, s) => sum + s, 0);
        const avgSalary = employeeCount > 0 ? (totalSalary / employeeCount).toFixed(2) : 0;
        const maxSalary = salaries.length > 0 ? Math.max(...salaries) : 0;
        const minSalary = salaries.length > 0 ? Math.min(...salaries) : 0;

        return {
            id: job.id,
            name: job.name,
            employeeCount: employeeCount,
            avgSalary: avgSalary,
            maxSalary: maxSalary,
            minSalary: minSalary
        };
    });

    jobTitleStats.forEach(stat => {
        const row = tableBody.insertRow();
        row.innerHTML = `
            <td>${stat.name}</td>
            <td>${stat.employeeCount}</td>
            <td>${stat.avgSalary}</td>
            <td>${stat.maxSalary}</td>
            <td>${stat.minSalary}</td>
        `;
    });

    // تحديث الرسم البياني
    const ctx = document.getElementById('job-titles-chart').getContext('2d');
    const labels = jobTitleStats.map(j => j.name);
    const data = jobTitleStats.map(j => j.employeeCount);

    if (jobTitlesChartInstance) {
        jobTitlesChartInstance.destroy();
    }

    jobTitlesChartInstance = new Chart(ctx, {
        type: 'doughnut', // أو 'pie', 'bar'
        data: {
            labels: labels,
            datasets: [{
                label: 'عدد الموظفين لكل مسمى وظيفي',
                data: data,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.7)',
                    'rgba(54, 162, 235, 0.7)',
                    'rgba(255, 206, 86, 0.7)',
                    'rgba(75, 192, 192, 0.7)',
                    'rgba(153, 102, 255, 0.7)',
                    'rgba(255, 159, 64, 0.7)',
                    'rgba(199, 199, 199, 0.7)',
                    'rgba(83, 102, 255, 0.7)',
                    'rgba(40, 159, 64, 0.7)',
                    'rgba(210, 99, 132, 0.7)'
                ],
                borderColor: '#fff',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
        }
    });
}

// 4. تقرير حركة التعيينات والاستقالات
let appointmentsChartInstance = null;
function loadAppointmentsMovementData() {
    const employees = getAllEmployees();
    const appointments = getAllAppointments(); // نفترض وجود دالة لجلب التعيينات/الاستقالات
    const tableBody = document.querySelector('#appointments-table tbody');
    const dateFrom = document.getElementById('appointments-date-from').value;
    const dateTo = document.getElementById('appointments-date-to').value;
    tableBody.innerHTML = '';

    const startDate = dateFrom ? new Date(dateFrom) : null;
    const endDate = dateTo ? new Date(dateTo) : null;

    // تجميع البيانات حسب الشهر
    const monthlyData = {};

    employees.forEach(emp => {
        if (emp.hireDate) {
            const hireDate = new Date(emp.hireDate);
            const monthYear = `${hireDate.getFullYear()}-${String(hireDate.getMonth() + 1).padStart(2, '0')}`;
            if (!monthlyData[monthYear]) {
                monthlyData[monthYear] = { hires: 0, resignations: 0 };
            }
            if ((!startDate || hireDate >= startDate) && (!endDate || hireDate <= endDate)) {
                monthlyData[monthYear].hires++;
            }
        }
        // إضافة منطق الاستقالات هنا إذا كانت البيانات متوفرة
        // مثال:
        // if (emp.resignationDate) {
        //     const resignationDate = new Date(emp.resignationDate);
        //     const monthYear = `${resignationDate.getFullYear()}-${String(resignationDate.getMonth() + 1).padStart(2, '0')}`;
        //     if (!monthlyData[monthYear]) {
        //         monthlyData[monthYear] = { hires: 0, resignations: 0 };
        //     }
        //     if ((!startDate || resignationDate >= startDate) && (!endDate || resignationDate <= endDate)) {
        //         monthlyData[monthYear].resignations++;
        //     }
        // }
    });

    const sortedMonths = Object.keys(monthlyData).sort();
    const chartLabels = [];
    const hiresData = [];
    const resignationsData = [];

    sortedMonths.forEach(monthYear => {
        const data = monthlyData[monthYear];
        const netChange = data.hires - data.resignations;
        const row = tableBody.insertRow();
        row.innerHTML = `
            <td>${monthYear}</td>
            <td>${data.hires}</td>
            <td>${data.resignations}</td>
            <td>${netChange}</td>
        `;
        chartLabels.push(monthYear);
        hiresData.push(data.hires);
        resignationsData.push(data.resignations);
    });

    // تحديث الرسم البياني
    const ctx = document.getElementById('appointments-chart').getContext('2d');
    if (appointmentsChartInstance) {
        appointmentsChartInstance.destroy();
    }
    appointmentsChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: chartLabels,
            datasets: [
                {
                    label: 'التعيينات الجديدة',
                    data: hiresData,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    fill: true,
                    tension: 0.1
                },
                {
                    label: 'الاستقالات',
                    data: resignationsData,
                    borderColor: 'rgba(255, 99, 132, 1)',
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    fill: true,
                    tension: 0.1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// 5. تقرير التعيينات الشهرية
function loadMonthlyAppointmentsData() {
    const employees = getAllEmployees();
    const departments = getAllDepartments();
    const jobTitles = getAllJobTitles();
    const tableBody = document.querySelector('#monthly-appointments-table tbody');
    const yearFilter = document.getElementById('monthly-year').value;
    const monthFilter = document.getElementById('monthly-month').value;
    tableBody.innerHTML = '';

    const filteredEmployees = employees.filter(emp => {
        if (!emp.hireDate) return false;
        const hireDate = new Date(emp.hireDate);
        const yearMatch = yearFilter === '0' || hireDate.getFullYear() == yearFilter;
        const monthMatch = monthFilter === '0' || (hireDate.getMonth() + 1) == monthFilter;
        return yearMatch && monthMatch;
    });

    filteredEmployees.forEach(emp => {
        const department = departments.find(d => d.id === emp.departmentId);
        const jobTitle = jobTitles.find(j => j.id === emp.jobTitleId);
        const row = tableBody.insertRow();
        row.innerHTML = `
            <td>${emp.name || 'غير متوفر'}</td>
            <td>${department ? department.name : 'غير محدد'}</td>
            <td>${jobTitle ? jobTitle.name : 'غير محدد'}</td>
            <td>${emp.hireDate || 'غير متوفر'}</td>
            <td>${emp.salary || 0}</td>
        `;
    });
}

// 6. تقرير تقييم الأداء
let performanceChartInstance = null;
function loadPerformanceEvaluationData() {
    // هذه الدالة تحتاج إلى بيانات تقييم الأداء التي ليست جزءًا من النموذج الحالي
    // سنقوم بإنشاء بيانات وهمية لأغراض العرض
    const employees = getAllEmployees();
    const departments = getAllDepartments();
    const jobTitles = getAllJobTitles();
    const tableBody = document.querySelector('#performance-table tbody');
    const departmentFilter = document.getElementById('performance-department').value;
    // فلتر الفترة يحتاج إلى منطق إضافي لتحديد التواريخ
    tableBody.innerHTML = '';

    const performanceData = employees
        .filter(emp => departmentFilter === '0' || emp.departmentId == departmentFilter)
        .map(emp => {
            const department = departments.find(d => d.id === emp.departmentId);
            const jobTitle = jobTitles.find(j => j.id === emp.jobTitleId);
            // بيانات وهمية للتقييم
            const score = Math.floor(Math.random() * 5) + 1; // درجة من 1 إلى 5
            const evaluationDate = new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            const evaluator = 'المدير المباشر'; // اسم وهمي
            return {
                name: emp.name || 'غير متوفر',
                department: department ? department.name : 'غير محدد',
                jobTitle: jobTitle ? jobTitle.name : 'غير محدد',
                score: score,
                evaluationDate: evaluationDate,
                evaluator: evaluator
            };
        });

    performanceData.forEach(data => {
        const row = tableBody.insertRow();
        row.innerHTML = `
            <td>${data.name}</td>
            <td>${data.department}</td>
            <td>${data.jobTitle}</td>
            <td>${data.score}</td>
            <td>${data.evaluationDate}</td>
            <td>${data.evaluator}</td>
        `;
    });

    // تحديث الرسم البياني (توزيع درجات التقييم)
    const ctx = document.getElementById('performance-chart').getContext('2d');
    const scoreCounts = [0, 0, 0, 0, 0];
    performanceData.forEach(data => {
        if (data.score >= 1 && data.score <= 5) {
            scoreCounts[data.score - 1]++;
        }
    });

    if (performanceChartInstance) {
        performanceChartInstance.destroy();
    }
    performanceChartInstance = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['1 نجمة', '2 نجمة', '3 نجوم', '4 نجوم', '5 نجوم'],
            datasets: [{
                label: 'توزيع درجات التقييم',
                data: scoreCounts,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.7)',
                    'rgba(255, 159, 64, 0.7)',
                    'rgba(255, 206, 86, 0.7)',
                    'rgba(75, 192, 192, 0.7)',
                    'rgba(54, 162, 235, 0.7)'
                ],
                borderColor: '#fff',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
        }
    });
}

// 7. تقرير مقارنة الأداء
let comparisonChartInstance = null;
function loadPerformanceComparisonData() {
    // بيانات وهمية لمقارنة الأداء
    const employees = getAllEmployees();
    const tableBody = document.querySelector('#comparison-table tbody');
    const departmentFilter = document.getElementById('comparison-department').value;
    const yearFilter = document.getElementById('comparison-year').value;
    tableBody.innerHTML = '';

    const comparisonData = employees
        .filter(emp => departmentFilter === '0' || emp.departmentId == departmentFilter)
        .map(emp => {
            // درجات وهمية للأرباع الأربعة
            const q1 = (Math.random() * 4 + 1).toFixed(1);
            const q2 = (Math.random() * 4 + 1).toFixed(1);
            const q3 = (Math.random() * 4 + 1).toFixed(1);
            const q4 = (Math.random() * 4 + 1).toFixed(1);
            const avg = ((parseFloat(q1) + parseFloat(q2) + parseFloat(q3) + parseFloat(q4)) / 4).toFixed(1);
            return {
                name: emp.name || 'غير متوفر',
                q1: q1,
                q2: q2,
                q3: q3,
                q4: q4,
                avg: avg
            };
        });

    comparisonData.forEach(data => {
        const row = tableBody.insertRow();
        row.innerHTML = `
            <td>${data.name}</td>
            <td>${data.q1}</td>
            <td>${data.q2}</td>
            <td>${data.q3}</td>
            <td>${data.q4}</td>
            <td>${data.avg}</td>
        `;
    });

    // تحديث الرسم البياني (متوسط الأداء للموظفين)
    const ctx = document.getElementById('comparison-chart').getContext('2d');
    const labels = comparisonData.map(d => d.name);
    const avgData = comparisonData.map(d => d.avg);

    if (comparisonChartInstance) {
        comparisonChartInstance.destroy();
    }
    comparisonChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: `متوسط الأداء السنوي (${yearFilter})`,
                data: avgData,
                backgroundColor: 'rgba(153, 102, 255, 0.7)',
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 5 // الحد الأقصى للتقييم
                }
            }
        }
    });
}

// 8. تقرير رصيد الإجازات
function loadVacationBalanceData() {
    const employees = getAllEmployees();
    const departments = getAllDepartments();
    const vacations = getAllVacations(); // نفترض وجود دالة لجلب بيانات الإجازات
    const tableBody = document.querySelector('#vacation-balance-table tbody');
    const departmentFilter = document.getElementById('vacation-department').value;
    tableBody.innerHTML = '';

    const balanceData = employees
        .filter(emp => departmentFilter === '0' || emp.departmentId == departmentFilter)
        .map(emp => {
            const department = departments.find(d => d.id === emp.departmentId);
            // حسابات وهمية لرصيد الإجازات
            const entitled = 21; // رصيد سنوي افتراضي
            const consumed = vacations.filter(v => v.employeeId === emp.id && v.status === 'approved').reduce((sum, v) => sum + v.duration, 0);
            const remaining = entitled - consumed;
            return {
                name: emp.name || 'غير متوفر',
                department: department ? department.name : 'غير محدد',
                entitled: entitled,
                consumed: consumed,
                remaining: remaining
            };
        });

    balanceData.forEach(data => {
        const row = tableBody.insertRow();
        row.innerHTML = `
            <td>${data.name}</td>
            <td>${data.department}</td>
            <td>${data.entitled}</td>
            <td>${data.consumed}</td>
            <td>${data.remaining}</td>
        `;
    });
}

// 9. تقرير طلبات الإجازات
let requestsChartInstance = null;
function loadVacationRequestsData() {
    const employees = getAllEmployees();
    const vacations = getAllVacations();
    const tableBody = document.querySelector('#vacation-requests-table tbody');
    const dateFrom = document.getElementById('requests-date-from').value;
    const dateTo = document.getElementById('requests-date-to').value;
    const statusFilter = document.getElementById('requests-status').value;
    tableBody.innerHTML = '';

    const startDate = dateFrom ? new Date(dateFrom) : null;
    const endDate = dateTo ? new Date(dateTo) : null;

    const filteredVacations = vacations.filter(vac => {
        const requestDate = new Date(vac.requestDate); // نفترض وجود تاريخ الطلب
        const dateMatch = (!startDate || requestDate >= startDate) && (!endDate || requestDate <= endDate);
        const statusMatch = statusFilter === 'all' || vac.status === statusFilter;
        return dateMatch && statusMatch;
    });

    const statusCounts = { approved: 0, rejected: 0, pending: 0 };

    filteredVacations.forEach(vac => {
        const employee = employees.find(e => e.id === vac.employeeId);
        const row = tableBody.insertRow();
        row.innerHTML = `
            <td>${employee ? employee.name : 'غير معروف'}</td>
            <td>${vac.type || 'غير محدد'}</td>
            <td>${vac.startDate || 'غير متوفر'}</td>
            <td>${vac.endDate || 'غير متوفر'}</td>
            <td>${vac.duration || 0}</td>
            <td>${translateVacationStatus(vac.status)}</td>
        `;
        if (statusCounts[vac.status] !== undefined) {
            statusCounts[vac.status]++;
        }
    });

    // تحديث الرسم البياني (توزيع حالات الطلبات)
    const ctx = document.getElementById('requests-chart').getContext('2d');
    if (requestsChartInstance) {
        requestsChartInstance.destroy();
    }
    requestsChartInstance = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['موافق عليها', 'مرفوضة', 'معلقة'],
            datasets: [{
                label: 'حالات طلبات الإجازات',
                data: [statusCounts.approved, statusCounts.rejected, statusCounts.pending],
                backgroundColor: [
                    'rgba(75, 192, 192, 0.7)',
                    'rgba(255, 99, 132, 0.7)',
                    'rgba(255, 206, 86, 0.7)'
                ],
                borderColor: '#fff',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
        }
    });
}

// 10. تقرير الإجازات حسب النوع
let typesChartInstance = null;
function loadVacationTypesData() {
    const vacations = getAllVacations();
    const tableBody = document.querySelector('#vacation-types-table tbody');
    const yearFilter = document.getElementById('types-year').value;
    tableBody.innerHTML = '';

    const typeStats = {};
    let totalRequests = 0;
    let totalDays = 0;

    vacations.forEach(vac => {
        if (vac.startDate) {
            const startYear = new Date(vac.startDate).getFullYear();
            if (yearFilter === '0' || startYear == yearFilter) {
                if (!typeStats[vac.type]) {
                    typeStats[vac.type] = { count: 0, days: 0 };
                }
                typeStats[vac.type].count++;
                typeStats[vac.type].days += vac.duration || 0;
                totalRequests++;
                totalDays += vac.duration || 0;
            }
        }
    });

    const chartLabels = [];
    const chartData = [];

    for (const type in typeStats) {
        const stats = typeStats[type];
        const percentage = totalRequests > 0 ? ((stats.count / totalRequests) * 100).toFixed(1) : 0;
        const row = tableBody.insertRow();
        row.innerHTML = `
            <td>${type}</td>
            <td>${stats.count}</td>
            <td>${stats.days}</td>
            <td>${percentage}%</td>
        `;
        chartLabels.push(type);
        chartData.push(stats.count);
    }

    // تحديث الرسم البياني
    const ctx = document.getElementById('types-chart').getContext('2d');
    if (typesChartInstance) {
        typesChartInstance.destroy();
    }
    typesChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: chartLabels,
            datasets: [{
                label: 'توزيع الإجازات حسب النوع',
                data: chartData,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.7)',
                    'rgba(54, 162, 235, 0.7)',
                    'rgba(255, 206, 86, 0.7)',
                    'rgba(75, 192, 192, 0.7)',
                    'rgba(153, 102, 255, 0.7)',
                    'rgba(255, 159, 64, 0.7)'
                ],
                borderColor: '#fff',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
        }
    });
}

// 11. تقرير الاشتراكات التأمينية
function loadInsuranceSubscriptionsData() {
    const employees = getAllEmployees();
    const tableBody = document.querySelector('#insurance-subscriptions-table tbody');
    tableBody.innerHTML = '';

    employees.forEach(emp => {
        const row = tableBody.insertRow();
        row.innerHTML = `
            <td>${emp.name || 'غير متوفر'}</td>
            <td>${emp.insuranceNumber || 'غير متوفر'}</td>
            <td>${emp.insuranceProvider || 'غير متوفر'}</td>
            <td>${emp.insuranceStartDate || 'غير متوفر'}</td>
            <td>${emp.insuranceJobTitle || 'غير متوفر'}</td>
            <td>${emp.insuranceSalary || 0}</td>
        `;
    });
}

// 12. تقرير الخصومات التأمينية
function loadInsuranceDeductionsData() {
    // يحتاج إلى بيانات الرواتب والخصومات الشهرية
    const employees = getAllEmployees();
    const tableBody = document.querySelector('#insurance-deductions-table tbody');
    const monthFilter = document.getElementById('deductions-month').value;
    const yearFilter = document.getElementById('deductions-year').value;
    tableBody.innerHTML = '';

    // بيانات وهمية للخصومات
    employees.forEach(emp => {
        const insuranceSalary = emp.insuranceSalary || 0;
        const employeeContributionRate = 0.1; // نسبة وهمية
        const companyContributionRate = 0.15; // نسبة وهمية
        const employeeDeduction = (insuranceSalary * employeeContributionRate).toFixed(2);
        const companyContribution = (insuranceSalary * companyContributionRate).toFixed(2);
        const total = (parseFloat(employeeDeduction) + parseFloat(companyContribution)).toFixed(2);

        const row = tableBody.insertRow();
        row.innerHTML = `
            <td>${emp.name || 'غير متوفر'}</td>
            <td>${insuranceSalary}</td>
            <td>${(employeeContributionRate * 100).toFixed(1)}%</td>
            <td>${employeeDeduction}</td>
            <td>${companyContribution}</td>
            <td>${total}</td>
        `;
    });
}

// 13. تقرير المستخدمين وصلاحياتهم
function loadUserPermissionsData() {
    const users = getAllUsers(); // نفترض وجود دالة لجلب المستخدمين
    const employees = getAllEmployees();
    const tableBody = document.querySelector('#user-permissions-table tbody');
    tableBody.innerHTML = '';

    users.forEach(user => {
        const employee = employees.find(e => e.id === user.employeeId);
        const row = tableBody.insertRow();
        row.innerHTML = `
            <td>${user.username}</td>
            <td>${employee ? employee.name : 'لا يوجد'}</td>
            <td>${user.role || 'غير محدد'}</td>
            <td>${user.status === 'active' ? 'نشط' : 'غير نشط'}</td>
            <td>${user.lastLogin || 'لم يسجل دخول'}</td>
            <td>${user.permissions ? user.permissions.join(', ') : 'لا يوجد'}</td>
        `;
    });
}

// 14. تقرير العمليات التي قام بها المستخدمون (Audit Log)
function loadUserActivitiesData() {
    const activities = getAllActivities(); // نفترض وجود دالة لجلب سجل الأنشطة
    const users = getAllUsers();
    const tableBody = document.querySelector('#user-activities-table tbody');
    const userFilter = document.getElementById('activities-user').value;
    const dateFrom = document.getElementById('activities-date-from').value;
    const dateTo = document.getElementById('activities-date-to').value;
    tableBody.innerHTML = '';

    const startDate = dateFrom ? new Date(dateFrom) : null;
    const endDate = dateTo ? new Date(dateTo) : null;

    const filteredActivities = activities.filter(act => {
        const activityDate = new Date(act.timestamp);
        const userMatch = userFilter === '0' || act.userId == userFilter;
        const dateMatch = (!startDate || activityDate >= startDate) && (!endDate || activityDate <= endDate);
        return userMatch && dateMatch;
    });

    filteredActivities.forEach(act => {
        const user = users.find(u => u.id === act.userId);
        const row = tableBody.insertRow();
        row.innerHTML = `
            <td>${user ? user.username : 'غير معروف'}</td>
            <td>${act.activityType || 'غير محدد'}</td>
            <td>${act.description || 'لا يوجد وصف'}</td>
            <td>${new Date(act.timestamp).toLocaleString('ar-EG')}</td>
        `;
    });
}

// 15. تقرير مخصص حسب القسم
let customDepartmentChartInstance = null;
function loadCustomDepartmentReport() {
    const departmentId = document.getElementById('custom-department').value;
    const reportType = document.getElementById('custom-report-type').value;
    const table = document.getElementById('custom-department-table');
    const tableHead = table.querySelector('thead');
    const tableBody = table.querySelector('tbody');
    const chartContainer = document.getElementById('custom-department-chart-container');
    const chartCanvas = document.getElementById('custom-department-chart');
    tableHead.innerHTML = '';
    tableBody.innerHTML = '';
    chartContainer.style.display = 'none'; // إخفاء الرسم البياني مبدئياً

    if (departmentId === '0') {
        tableBody.innerHTML = '<tr><td colspan="5">يرجى اختيار القسم أولاً.</td></tr>';
        return;
    }

    const employees = getAllEmployees().filter(emp => emp.departmentId == departmentId);
    const jobTitles = getAllJobTitles();
    const vacations = getAllVacations();

    let headers = [];
    let dataRows = [];
    let chartLabels = [];
    let chartData = [];
    let chartTitle = '';

    switch (reportType) {
        case 'employees':
            headers = ['الاسم', 'المسمى الوظيفي', 'تاريخ التعيين', 'الحالة', 'الراتب'];
            dataRows = employees.map(emp => {
                const jobTitle = jobTitles.find(j => j.id === emp.jobTitleId);
                return [
                    emp.name || 'غير متوفر',
                    jobTitle ? jobTitle.name : 'غير محدد',
                    emp.hireDate || 'غير متوفر',
                    emp.status === 'active' ? 'نشط' : 'غير نشط',
                    emp.salary || 0
                ];
            });
            // رسم بياني لتوزيع الرواتب
            chartTitle = 'توزيع الرواتب في القسم';
            chartLabels = dataRows.map(r => r[0]); // أسماء الموظفين
            chartData = dataRows.map(r => r[4]); // الرواتب
            chartContainer.style.display = 'block';
            break;
        case 'salaries':
            headers = ['الاسم', 'المسمى الوظيفي', 'الراتب الأساسي', 'البدلات', 'الإجمالي'];
            dataRows = employees.map(emp => {
                const jobTitle = jobTitles.find(j => j.id === emp.jobTitleId);
                const baseSalary = emp.salary || 0;
                const allowances = (baseSalary * 0.1).toFixed(0); // بدل وهمي 10%
                const totalSalary = baseSalary + parseFloat(allowances);
                return [
                    emp.name || 'غير متوفر',
                    jobTitle ? jobTitle.name : 'غير محدد',
                    baseSalary,
                    allowances,
                    totalSalary
                ];
            });
            chartTitle = 'مقارنة إجمالي الرواتب في القسم';
            chartLabels = dataRows.map(r => r[0]);
            chartData = dataRows.map(r => r[4]);
            chartContainer.style.display = 'block';
            break;
        case 'vacations':
            headers = ['الاسم', 'الرصيد المستحق', 'الرصيد المستهلك', 'الرصيد المتبقي'];
            dataRows = employees.map(emp => {
                const entitled = 21;
                const consumed = vacations.filter(v => v.employeeId === emp.id && v.status === 'approved').reduce((sum, v) => sum + v.duration, 0);
                const remaining = entitled - consumed;
                return [
                    emp.name || 'غير متوفر',
                    entitled,
                    consumed,
                    remaining
                ];
            });
            chartTitle = 'مقارنة رصيد الإجازات المتبقي في القسم';
            chartLabels = dataRows.map(r => r[0]);
            chartData = dataRows.map(r => r[3]);
            chartContainer.style.display = 'block';
            break;
        case 'performance':
            headers = ['الاسم', 'المسمى الوظيفي', 'درجة التقييم', 'تاريخ التقييم'];
            dataRows = employees.map(emp => {
                const jobTitle = jobTitles.find(j => j.id === emp.jobTitleId);
                const score = Math.floor(Math.random() * 5) + 1;
                const evaluationDate = new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                return [
                    emp.name || 'غير متوفر',
                    jobTitle ? jobTitle.name : 'غير محدد',
                    score,
                    evaluationDate
                ];
            });
            chartTitle = 'مقارنة درجات التقييم في القسم';
            chartLabels = dataRows.map(r => r[0]);
            chartData = dataRows.map(r => r[2]);
            chartContainer.style.display = 'block';
            break;
    }

    // ملء الجدول
    const headerRow = tableHead.insertRow();
    headers.forEach(headerText => {
        const th = document.createElement('th');
        th.textContent = headerText;
        headerRow.appendChild(th);
    });

    dataRows.forEach(rowData => {
        const row = tableBody.insertRow();
        rowData.forEach(cellData => {
            const cell = row.insertCell();
            cell.textContent = cellData;
        });
    });

    // تحديث الرسم البياني
    if (chartContainer.style.display === 'block') {
        const ctx = chartCanvas.getContext('2d');
        if (customDepartmentChartInstance) {
            customDepartmentChartInstance.destroy();
        }
        customDepartmentChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: chartLabels,
                datasets: [{
                    label: chartTitle,
                    data: chartData,
                    backgroundColor: 'rgba(54, 162, 235, 0.7)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
}

// 16. تقرير مقارنة الأداء بين موظفين
let comparisonReportChartInstance = null;
function loadCustomComparisonReport() {
    const employeeId1 = document.getElementById('employee1').value;
    const employeeId2 = document.getElementById('employee2').value;
    const comparisonType = document.getElementById('comparison-type').value;
    const table = document.getElementById('comparison-report-table');
    const tableHead = table.querySelector('thead');
    const tableBody = table.querySelector('tbody');
    const chartContainer = document.querySelector('#performance-comparison-report .chart-container');
    const chartCanvas = document.getElementById('comparison-report-chart');
    tableHead.innerHTML = '';
    tableBody.innerHTML = '';
    chartContainer.style.display = 'none';

    if (employeeId1 === '0' || employeeId2 === '0' || employeeId1 === employeeId2) {
        tableBody.innerHTML = '<tr><td colspan="3">يرجى اختيار موظفين مختلفين للمقارنة.</td></tr>';
        return;
    }

    const employee1 = getEmployeeById(employeeId1);
    const employee2 = getEmployeeById(employeeId2);

    if (!employee1 || !employee2) {
        tableBody.innerHTML = '<tr><td colspan="3">لم يتم العثور على أحد الموظفين.</td></tr>';
        return;
    }

    let headers = ['المعيار', employee1.name, employee2.name];
    let dataRows = [];
    let chartLabels = [];
    let chartData1 = [];
    let chartData2 = [];
    let chartTitle = `مقارنة ${comparisonType === 'performance' ? 'الأداء' : comparisonType === 'attendance' ? 'الحضور' : 'الإجازات'} بين ${employee1.name} و ${employee2.name}`;

    switch (comparisonType) {
        case 'performance':
            // بيانات أداء وهمية
            const perf1 = {
                q1: (Math.random() * 4 + 1).toFixed(1),
                q2: (Math.random() * 4 + 1).toFixed(1),
                q3: (Math.random() * 4 + 1).toFixed(1),
                q4: (Math.random() * 4 + 1).toFixed(1),
            };
            perf1.avg = ((parseFloat(perf1.q1) + parseFloat(perf1.q2) + parseFloat(perf1.q3) + parseFloat(perf1.q4)) / 4).toFixed(1);
            const perf2 = {
                q1: (Math.random() * 4 + 1).toFixed(1),
                q2: (Math.random() * 4 + 1).toFixed(1),
                q3: (Math.random() * 4 + 1).toFixed(1),
                q4: (Math.random() * 4 + 1).toFixed(1),
            };
            perf2.avg = ((parseFloat(perf2.q1) + parseFloat(perf2.q2) + parseFloat(perf2.q3) + parseFloat(perf2.q4)) / 4).toFixed(1);
            dataRows = [
                ['الربع الأول', perf1.q1, perf2.q1],
                ['الربع الثاني', perf1.q2, perf2.q2],
                ['الربع الثالث', perf1.q3, perf2.q3],
                ['الربع الرابع', perf1.q4, perf2.q4],
                ['المتوسط السنوي', perf1.avg, perf2.avg]
            ];
            chartLabels = ['الربع الأول', 'الربع الثاني', 'الربع الثالث', 'الربع الرابع'];
            chartData1 = [perf1.q1, perf1.q2, perf1.q3, perf1.q4];
            chartData2 = [perf2.q1, perf2.q2, perf2.q3, perf2.q4];
            chartContainer.style.display = 'block';
            break;
        case 'attendance':
            // بيانات حضور وهمية
            const att1 = { present: Math.floor(Math.random() * 20) + 200, absent: Math.floor(Math.random() * 5) };
            const att2 = { present: Math.floor(Math.random() * 20) + 200, absent: Math.floor(Math.random() * 5) };
            dataRows = [
                ['أيام الحضور', att1.present, att2.present],
                ['أيام الغياب', att1.absent, att2.absent]
            ];
            // لا يوجد رسم بياني مناسب هنا بشكل مباشر
            break;
        case 'vacations':
            const vac1 = getAllVacations().filter(v => v.employeeId === employee1.id && v.status === 'approved').reduce((sum, v) => sum + v.duration, 0);
            const vac2 = getAllVacations().filter(v => v.employeeId === employee2.id && v.status === 'approved').reduce((sum, v) => sum + v.duration, 0);
            dataRows = [
                ['إجمالي أيام الإجازات', vac1, vac2]
            ];
            // لا يوجد رسم بياني مناسب هنا بشكل مباشر
            break;
    }

    // ملء الجدول
    const headerRow = tableHead.insertRow();
    headers.forEach(headerText => {
        const th = document.createElement('th');
        th.textContent = headerText;
        headerRow.appendChild(th);
    });

    dataRows.forEach(rowData => {
        const row = tableBody.insertRow();
        rowData.forEach(cellData => {
            const cell = row.insertCell();
            cell.textContent = cellData;
        });
    });

    // تحديث الرسم البياني (إذا كان متاحًا)
    if (chartContainer.style.display === 'block') {
        const ctx = chartCanvas.getContext('2d');
        if (comparisonReportChartInstance) {
            comparisonReportChartInstance.destroy();
        }
        comparisonReportChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: chartLabels,
                datasets: [
                    {
                        label: employee1.name,
                        data: chartData1,
                        backgroundColor: 'rgba(75, 192, 192, 0.7)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1
                    },
                    {
                        label: employee2.name,
                        data: chartData2,
                        backgroundColor: 'rgba(255, 159, 64, 0.7)',
                        borderColor: 'rgba(255, 159, 64, 1)',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
}

// 17. تقرير التغير الوظيفي
let jobChangeChartInstance = null;
function loadJobChangeReport() {
    const jobChanges = getAllJobChanges(); // نفترض وجود دالة لجلب سجل التغيرات الوظيفية
    const employees = getAllEmployees();
    const tableBody = document.querySelector('#job-change-table tbody');
    const dateFrom = document.getElementById('change-date-from').value;
    const dateTo = document.getElementById('change-date-to').value;
    const typeFilter = document.getElementById('change-type').value;
    tableBody.innerHTML = '';

    const startDate = dateFrom ? new Date(dateFrom) : null;
    const endDate = dateTo ? new Date(dateTo) : null;

    const filteredChanges = jobChanges.filter(change => {
        const changeDate = new Date(change.changeDate);
        const dateMatch = (!startDate || changeDate >= startDate) && (!endDate || changeDate <= endDate);
        const typeMatch = typeFilter === 'all' || change.changeType === typeFilter;
        return dateMatch && typeMatch;
    });

    const changeTypeCounts = { promotion: 0, transfer: 0, 'title-change': 0 };

    filteredChanges.forEach(change => {
        const employee = employees.find(e => e.id === change.employeeId);
        const row = tableBody.insertRow();
        row.innerHTML = `
            <td>${employee ? employee.name : 'غير معروف'}</td>
            <td>${translateChangeType(change.changeType)}</td>
            <td>${change.fromValue || '-'}</td>
            <td>${change.toValue || '-'}</td>
            <td>${change.changeDate || 'غير متوفر'}</td>
            <td>${change.notes || '-'}</td>
        `;
        if (changeTypeCounts[change.changeType] !== undefined) {
            changeTypeCounts[change.changeType]++;
        }
    });

    // تحديث الرسم البياني (توزيع أنواع التغييرات)
    const ctx = document.getElementById('job-change-chart').getContext('2d');
    if (jobChangeChartInstance) {
        jobChangeChartInstance.destroy();
    }
    jobChangeChartInstance = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['ترقيات', 'نقل', 'تغيير مسمى'],
            datasets: [{
                label: 'أنواع التغيرات الوظيفية',
                data: [changeTypeCounts.promotion, changeTypeCounts.transfer, changeTypeCounts['title-change']],
                backgroundColor: [
                    'rgba(54, 162, 235, 0.7)',
                    'rgba(255, 206, 86, 0.7)',
                    'rgba(153, 102, 255, 0.7)'
                ],
                borderColor: '#fff',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
        }
    });
}

// ============================
// وظائف مساعدة
// ============================

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
             // إزالة خيار 
