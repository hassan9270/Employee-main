// ملف جافاسكريبت موحد لقسم التقارير
document.addEventListener('DOMContentLoaded', () => {
    // البحث عن الحاوية الخاصة بالتقارير
    const reportsWrapper = document.querySelector('.reports-page-wrapper');
    if (!reportsWrapper) {
        // إذا لم تكن في صفحة التقارير، لا تقم بتنفيذ الكود الخاص بالتقارير
        return;
    }

    // تهيئة صفحة التقارير
    initializeReportsPage();

    // إعداد مستمعي الأحداث
    setupEventListeners();

    // تحسين تجربة المستخدم على الأجهزة المختلفة
    setupResponsiveBehavior();
});

// تهيئة صفحة التقارير
function initializeReportsPage() {
    // ملء القوائم المنسدلة
    populateFilters();
    
    // عرض التقرير الافتراضي
    loadDefaultReport();
}

// ملء القوائم المنسدلة
function populateFilters() {
    try {
        // ملء قائمة الأقسام
        const departmentFilters = document.querySelectorAll('[id$="-department-filter"]');
        const departments = getAllDepartments();
        
        departmentFilters.forEach(filter => {
            if (!filter) return;
            
            // الاحتفاظ بالخيار الافتراضي
            const defaultOption = filter.querySelector('option');
            filter.innerHTML = '';
            
            if (defaultOption) {
                filter.appendChild(defaultOption);
            }
            
            // إضافة الأقسام
            departments.forEach(dept => {
                const option = document.createElement('option');
                option.value = dept.id;
                option.textContent = dept.name;
                filter.appendChild(option);
            });
        });
        
        // ملء قائمة السنوات
        const yearFilters = document.querySelectorAll('[id$="-year"]');
        const currentYear = new Date().getFullYear();
        
        yearFilters.forEach(filter => {
            if (!filter) return;
            
            filter.innerHTML = '';
            
            // إضافة السنوات (السنة الحالية و4 سنوات سابقة)
            for (let year = currentYear; year >= currentYear - 4; year--) {
                const option = document.createElement('option');
                option.value = year;
                option.textContent = year;
                filter.appendChild(option);
            }
        });
    } catch (error) {
        console.error('خطأ في ملء القوائم المنسدلة:', error);
    }
}

// تحميل التقرير الافتراضي
function loadDefaultReport() {
    try {
        // تفعيل قسم التقارير الافتراضي
        activateReportSection('hr-reports');
        
        // تفعيل التبويب الافتراضي
        activateReportTab('hr-reports', 'basic-employee-data');
        
        // تحميل بيانات التقرير الافتراضي
        loadBasicEmployeeData();
    } catch (error) {
        console.error('خطأ في تحميل التقرير الافتراضي:', error);
    }
}

// إعداد مستمعي الأحداث
function setupEventListeners() {
    try {
        // التنقل بين أقسام التقارير الرئيسية
        const reportMenuItems = document.querySelectorAll('.reports-menu li');
        reportMenuItems.forEach(item => {
            item.addEventListener('click', () => {
                const reportId = item.getAttribute('data-report');
                if (!reportId) return;
                
                activateReportSection(reportId);
                
                // تفعيل أول تبويب في القسم الجديد
                const firstTabButton = document.querySelector(`#${reportId} .report-tab`);
                if (firstTabButton) {
                    const firstTabId = firstTabButton.getAttribute('data-tab');
                    if (firstTabId) {
                        activateReportTab(reportId, firstTabId);
                        loadReportData(reportId, firstTabId);
                    }
                }
            });
        });

        // التنقل بين تبويبات التقارير داخل كل قسم
        const reportTabButtons = document.querySelectorAll('.report-tab');
        reportTabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const reportSection = button.closest('.report-section');
                if (!reportSection) return;
                
                const reportId = reportSection.id;
                const tabId = button.getAttribute('data-tab');
                
                if (reportId && tabId) {
                    activateReportTab(reportId, tabId);
                    loadReportData(reportId, tabId);
                }
            });
        });

        // أزرار تطبيق الفلاتر
        setupFilterButtons();

        // أزرار التصدير
        setupExportButtons();
    } catch (error) {
        console.error('خطأ في إعداد مستمعي الأحداث:', error);
    }
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
    if (!reportId) return;
    
    try {
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
    } catch (error) {
        console.error('خطأ في تفعيل قسم التقرير:', error);
    }
}

// تفعيل تبويب التقرير المحدد داخل القسم
function activateReportTab(reportId, tabId) {
    if (!reportId || !tabId) return;
    
    try {
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
    } catch (error) {
        console.error('خطأ في تفعيل تبويب التقرير:', error);
    }
}

// تحميل بيانات التقرير بناءً على القسم والتبويب
function loadReportData(reportId, tabId) {
    if (!reportId || !tabId) return;
    
    try {
        const reportKey = `${reportId}-${tabId}`;
        
        switch (reportKey) {
            case 'hr-reports-basic-employee-data': 
                loadBasicEmployeeData(); 
                break;
            case 'hr-reports-department-statistics': 
                loadDepartmentStatistics(); 
                break;
            case 'hr-reports-job-title-statistics': 
                loadJobTitleStatistics(); 
                break;
            case 'appointments-reports-appointments-movement': 
                loadAppointmentsMovementData(); 
                break;
            case 'appointments-reports-monthly-appointments': 
                loadMonthlyAppointmentsData(); 
                break;
            case 'performance-reports-performance-evaluation': 
                loadPerformanceEvaluationData(); 
                break;
            case 'performance-reports-performance-comparison': 
                loadPerformanceComparisonData(); 
                break;
            case 'vacation-reports-vacation-balance': 
                loadVacationBalanceData(); 
                break;
            case 'vacation-reports-vacation-requests': 
                loadVacationRequestsData(); 
                break;
            case 'vacation-reports-vacation-types': 
                loadVacationTypesData(); 
                break;
            case 'insurance-reports-insurance-subscriptions': 
                loadInsuranceSubscriptionsData(); 
                break;
            case 'insurance-reports-insurance-deductions': 
                loadInsuranceDeductionsData(); 
                break;
            case 'user-reports-user-permissions': 
                loadUserPermissionsData(); 
                break;
            case 'user-reports-user-activities': 
                loadUserActivitiesData(); 
                break;
            case 'custom-reports-department-report': 
                loadCustomDepartmentReport(); 
                break;
            case 'custom-reports-performance-comparison-report': 
                loadCustomComparisonReport(); 
                break;
            case 'custom-reports-job-change-report': 
                loadJobChangeReport(); 
                break;
            default:
                console.warn('تقرير غير معروف:', reportKey);
        }
    } catch (error) {
        console.error('خطأ في تحميل بيانات التقرير:', error);
    }
}

// إعداد السلوك المتجاوب
function setupResponsiveBehavior() {
    try {
        const reportsSidebar = document.querySelector('.reports-sidebar');
        if (!reportsSidebar) return;
        
        // إضافة زر للتبديل بين عرض وإخفاء القائمة الجانبية على الشاشات الصغيرة
        if (window.innerWidth <= 992 && !document.querySelector('.reports-sidebar-toggle')) {
            const toggleButton = document.createElement('button');
            toggleButton.className = 'reports-sidebar-toggle';
            toggleButton.innerHTML = '<i class="fas fa-bars"></i>';
            toggleButton.setAttribute('aria-label', 'تبديل قائمة التقارير');
            
            document.body.appendChild(toggleButton);
            
            toggleButton.addEventListener('click', () => {
                reportsSidebar.classList.toggle('active-mobile');
                toggleButton.querySelector('i').className = reportsSidebar.classList.contains('active-mobile') ? 'fas fa-times' : 'fas fa-bars';
            });
        }
        
        // إعادة تنظيم العناصر عند تغيير حجم النافذة
        window.addEventListener('resize', () => {
            if (window.innerWidth <= 992) {
                if (!document.querySelector('.reports-sidebar-toggle')) {
                    const toggleButton = document.createElement('button');
                    toggleButton.className = 'reports-sidebar-toggle';
                    toggleButton.innerHTML = '<i class="fas fa-bars"></i>';
                    toggleButton.setAttribute('aria-label', 'تبديل قائمة التقارير');
                    
                    document.body.appendChild(toggleButton);
                    
                    toggleButton.addEventListener('click', () => {
                        reportsSidebar.classList.toggle('active-mobile');
                        toggleButton.querySelector('i').className = reportsSidebar.classList.contains('active-mobile') ? 'fas fa-times' : 'fas fa-bars';
                    });
                }
            } else {
                const toggleButton = document.querySelector('.reports-sidebar-toggle');
                if (toggleButton) {
                    toggleButton.remove();
                }
                reportsSidebar.classList.remove('active-mobile');
            }
        });
    } catch (error) {
        console.error('خطأ في إعداد السلوك المتجاوب:', error);
    }
}

// تحسين عرض الجداول
function enhanceDataTables() {
    try {
        // تحسين الجداول
        const tables = document.querySelectorAll('.data-table');
        tables.forEach(table => {
            // إضافة خاصية البحث في الجدول
            addTableSearch(table);
            
            // تحسين عرض الحالات في الجداول
            enhanceStatusCells(table);
        });
    } catch (error) {
        console.error('خطأ في تحسين عرض الجداول:', error);
    }
}

// إضافة خاصية البحث في الجدول
function addTableSearch(table) {
    if (!table) return;
    
    try {
        const tableContainer = table.closest('.table-responsive');
        if (!tableContainer) return;
        
        // التحقق من عدم وجود حقل بحث مسبقاً
        if (tableContainer.querySelector('.table-search')) return;
        
        // إنشاء حقل البحث
        const searchContainer = document.createElement('div');
        searchContainer.className = 'table-search';
        searchContainer.innerHTML = `
            <div class="search-input-container">
                <i class="fas fa-search"></i>
                <input type="text" class="table-search-input" placeholder="بحث في الجدول...">
            </div>
        `;
        
        // إضافة حقل البحث قبل الجدول
        tableContainer.insertBefore(searchContainer, table);
        
        // إضافة وظيفة البحث
        const searchInput = searchContainer.querySelector('.table-search-input');
        searchInput.addEventListener('input', () => {
            const searchTerm = searchInput.value.toLowerCase();
            const rows = table.querySelectorAll('tbody tr');
            
            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                if (text.includes(searchTerm)) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        });
    } catch (error) {
        console.error('خطأ في إضافة خاصية البحث في الجدول:', error);
    }
}

// تحسين عرض خلايا الحالة
function enhanceStatusCells(table) {
    if (!table) return;
    
    try {
        const statusCells = table.querySelectorAll('td:nth-child(6)');
        statusCells.forEach(cell => {
            const status = cell.textContent.trim();
            if (status === 'نشط') {
                cell.innerHTML = '<span class="status-badge active">نشط</span>';
            } else if (status === 'غير نشط') {
                cell.innerHTML = '<span class="status-badge inactive">غير نشط</span>';
            } else if (status === 'معلق') {
                cell.innerHTML = '<span class="status-badge pending">معلق</span>';
            }
        });
    } catch (error) {
        console.error('خطأ في تحسين عرض خلايا الحالة:', error);
    }
}

// ============================
// وظائف تحميل بيانات التقارير
// ============================

// 1. تقرير بيانات الموظفين الأساسية
function loadBasicEmployeeData() {
    try {
        const employees = getAllEmployees();
        const departments = getAllDepartments();
        const jobTitles = getAllJobTitles();
        const tableBody = document.querySelector('#basic-employee-table tbody');
        
        if (!tableBody) return;
        
        const departmentFilter = document.getElementById('basic-department-filter');
        const statusFilter = document.getElementById('basic-status-filter');
        
        const departmentValue = departmentFilter ? departmentFilter.value : '0';
        const statusValue = statusFilter ? statusFilter.value : 'all';

        tableBody.innerHTML = ''; // مسح الجدول

        const filteredEmployees = employees.filter(emp => {
            const departmentMatch = departmentValue === '0' || emp.departmentId == departmentValue;
            const statusMatch = statusValue === 'all' || emp.status === statusValue;
            return departmentMatch && statusMatch;
        });

        if (filteredEmployees.length === 0) {
            // عرض رسالة عند عدم وجود بيانات
            const emptyRow = tableBody.insertRow();
            emptyRow.innerHTML = `
                <td colspan="6" class="text-center">
                    <div class="empty-data">
                        <i class="fas fa-info-circle"></i>
                        <p>لا توجد بيانات متطابقة مع معايير البحث</p>
                    </div>
                </td>
            `;
            return;
        }

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
        
        // تحسين عرض الجدول
        enhanceDataTables();
    } catch (error) {
        console.error('خطأ في تحميل بيانات الموظفين الأساسية:', error);
    }
}

// 2. تقرير إحصائيات الأقسام
let departmentsChartInstance = null;
function loadDepartmentStatistics() {
    try {
        const employees = getAllEmployees();
        const departments = getAllDepartments();
        const tableBody = document.querySelector('#department-statistics-table tbody');
        
        if (!tableBody) return;
        
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

        if (departmentStats.length === 0) {
            // عرض رسالة عند عدم وجود بيانات
            const emptyRow = tableBody.insertRow();
            emptyRow.innerHTML = `
                <td colspan="5" class="text-center">
                    <div class="empty-data">
                        <i class="fas fa-info-circle"></i>
                        <p>لا توجد بيانات متاحة</p>
                    </div>
                </td>
            `;
            return;
        }

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
        const chartCanvas = document.getElementById('departments-chart');
        if (!chartCanvas) return;
        
        const ctx = chartCanvas.getContext('2d');
        const labels = departmentStats.map(d => d.name);
        const data = departmentStats.map(d => d.employeeCount);

        if (departmentsChartInstance) {
            departmentsChartInstance.destroy();
        }

        departmentsChartInstance = new Chart(ctx, {
            type: 'bar',
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
        
        // تحسين عرض الجدول
        enhanceDataTables();
    } catch (error) {
        console.error('خطأ في تحميل إحصائيات الأقسام:', error);
    }
}

// 3. تقرير إحصائيات المسميات الوظيفية
let jobTitlesChartInstance = null;
function loadJobTitleStatistics() {
    try {
        const employees = getAllEmployees();
        const jobTitles = getAllJobTitles();
        const tableBody = document.querySelector('#job-title-statistics-table tbody');
        
        if (!tableBody) return;
        
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

        if (jobTitleStats.length === 0) {
            // عرض رسالة عند عدم وجود بيانات
            const emptyRow = tableBody.insertRow();
            emptyRow.innerHTML = `
                <td colspan="5" class="text-center">
                    <div class="empty-data">
                        <i class="fas fa-info-circle"></i>
                        <p>لا توجد بيانات متاحة</p>
                    </div>
                </td>
            `;
            return;
        }

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
        const chartCanvas = document.getElementById('job-titles-chart');
        if (!chartCanvas) return;
        
        const ctx = chartCanvas.getContext('2d');
        const labels = jobTitleStats.map(j => j.name);
        const data = jobTitleStats.map(j => j.employeeCount);

        if (jobTitlesChartInstance) {
            jobTitlesChartInstance.destroy();
        }

        jobTitlesChartInstance = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
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
                maintainAspectRatio: false
            }
        });
        
        // تحسين عرض الجدول
        enhanceDataTables();
    } catch (error) {
        console.error('خطأ في تحميل إحصائيات المسميات الوظيفية:', error);
    }
}

// وظائف مساعدة للتصدير

// تصدير جدول إلى Excel
function exportTableToExcel(tableId, fileName) {
    try {
        const table = document.getElementById(tableId);
        if (!table) {
            console.error('الجدول غير موجود:', tableId);
            return;
        }

        // استخراج البيانات من الجدول
        const rows = table.querySelectorAll('tr');
        const data = [];

        // استخراج العناوين
        const headerRow = rows[0];
        const headers = [];
        headerRow.querySelectorAll('th').forEach(th => {
            headers.push(th.textContent.trim());
        });
        data.push(headers);

        // استخراج البيانات
        for (let i = 1; i < rows.length; i++) {
            const row = [];
            rows[i].querySelectorAll('td').forEach(td => {
                // استخراج النص بدون العناصر HTML
                const text = td.textContent.trim();
                row.push(text);
            });
            data.push(row);
        }

        // إنشاء ورقة عمل
        const worksheet = XLSX.utils.aoa_to_sheet(data);
        
        // تنسيق الورقة
        const range = XLSX.utils.decode_range(worksheet['!ref']);
        for (let C = range.s.c; C <= range.e.c; ++C) {
            const address = XLSX.utils.encode_col(C) + '1';
            if (!worksheet[address]) continue;
            worksheet[address].s = {
                font: { bold: true, color: { rgb: "FFFFFF" } },
                fill: { fgColor: { rgb: "3F51B5" } },
                alignment: { horizontal: "center", vertical: "center" }
            };
        }
        
        // تعديل عرض الأعمدة
        const colWidths = headers.map(h => ({ wch: Math.max(h.length * 1.5, 10) }));
        worksheet['!cols'] = colWidths;
        
        // إنشاء مصنف عمل
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'البيانات');
        
        // تصدير المصنف
        XLSX.writeFile(workbook, fileName);
        
        // عرض رسالة نجاح
        showNotification('تم تصدير البيانات بنجاح', 'success');
    } catch (error) {
        console.error('خطأ في تصدير الجدول إلى Excel:', error);
        showNotification('حدث خطأ أثناء تصدير البيانات: ' + error.message, 'error');
    }
}

// تصدير جدول إلى PDF
function exportTableToPdf(tableId, title, includeChart = false, chartId = null) {
    try {
        const table = document.getElementById(tableId);
        if (!table) {
            console.error('الجدول غير موجود:', tableId);
            return;
        }

        // تهيئة jsPDF
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'pt', 'a4');
        
        // إضافة العنوان
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(18);
        doc.text(title, doc.internal.pageSize.getWidth() / 2, 40, { align: 'center' });
        
        // إضافة الرسم البياني إذا كان مطلوباً
        let yOffset = 60;
        if (includeChart && chartId) {
            const chart = document.getElementById(chartId);
            if (chart) {
                const chartImg = chart.toDataURL('image/png');
                const imgWidth = doc.internal.pageSize.getWidth() - 80;
                const imgHeight = 200;
                doc.addImage(chartImg, 'PNG', 40, yOffset, imgWidth, imgHeight);
                yOffset += imgHeight + 20;
            }
        }
        
        // إضافة الجدول
        doc.autoTable({
            html: '#' + tableId,
            startY: yOffset,
            styles: {
                halign: 'right',
                font: 'Helvetica',
                fontSize: 10
            },
            headStyles: {
                fillColor: [63, 81, 181],
                textColor: [255, 255, 255],
                fontStyle: 'bold'
            },
            alternateRowStyles: {
                fillColor: [245, 245, 245]
            },
            margin: { top: 20 }
        });
        
        // إضافة التاريخ والوقت
        const now = new Date();
        const dateStr = now.toLocaleDateString('ar-EG');
        const timeStr = now.toLocaleTimeString('ar-EG');
        doc.setFontSize(10);
        doc.setFont('Helvetica', 'normal');
        doc.text(`تاريخ التصدير: ${dateStr} ${timeStr}`, doc.internal.pageSize.getWidth() - 40, doc.internal.pageSize.getHeight() - 20, { align: 'right' });
        
        // حفظ الملف
        const fileName = title.replace(/\s+/g, '_') + '.pdf';
        doc.save(fileName);
        
        // عرض رسالة نجاح
        showNotification('تم تصدير البيانات بنجاح', 'success');
    } catch (error) {
        console.error('خطأ في تصدير الجدول إلى PDF:', error);
        showNotification('حدث خطأ أثناء تصدير البيانات: ' + error.message, 'error');
    }
}

// عرض إشعار للمستخدم
function showNotification(message, type = 'info') {
    try {
        // التحقق من وجود عنصر الإشعارات
        let notificationsContainer = document.getElementById('notifications-container');
        
        // إنشاء عنصر الإشعارات إذا لم يكن موجوداً
        if (!notificationsContainer) {
            notificationsContainer = document.createElement('div');
            notificationsContainer.id = 'notifications-container';
            document.body.appendChild(notificationsContainer);
        }
        
        // إنشاء عنصر الإشعار
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        // إضافة أيقونة حسب نوع الإشعار
        let icon = '';
        switch (type) {
            case 'success':
                icon = '<i class="fas fa-check-circle"></i>';
                break;
            case 'error':
                icon = '<i class="fas fa-times-circle"></i>';
                break;
            case 'warning':
                icon = '<i class="fas fa-exclamation-triangle"></i>';
                break;
            default:
                icon = '<i class="fas fa-info-circle"></i>';
        }
        
        // إضافة المحتوى للإشعار
        notification.innerHTML = `
            <div class="notification-icon">${icon}</div>
            <div class="notification-message">${message}</div>
            <button class="notification-close"><i class="fas fa-times"></i></button>
        `;
        
        // إضافة الإشعار إلى الحاوية
        notificationsContainer.appendChild(notification);
        
        // إضافة معالج حدث لزر الإغلاق
        notification.querySelector('.notification-close').addEventListener('click', function() {
            notification.classList.add('notification-hide');
            setTimeout(() => {
                notification.remove();
            }, 300);
        });
        
        // إظهار الإشعار بتأثير حركي
        setTimeout(() => {
            notification.classList.add('notification-show');
        }, 10);
        
        // إخفاء الإشعار تلقائياً بعد فترة
        setTimeout(() => {
            if (notification.parentNode) {
                notification.classList.add('notification-hide');
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.remove();
                    }
                }, 300);
            }
        }, 5000);
    } catch (error) {
        console.error('خطأ في عرض الإشعار:', error);
    }
}

// وظائف الوصول إلى البيانات
function getAllEmployees() {
    try {
        // محاولة استرجاع البيانات من التخزين المحلي
        const employeesData = localStorage.getItem('employees');
        return employeesData ? JSON.parse(employeesData) : [];
    } catch (error) {
        console.error('خطأ في استرجاع بيانات الموظفين:', error);
        return [];
    }
}

function getAllDepartments() {
    try {
        // محاولة استرجاع البيانات من التخزين المحلي
        const departmentsData = localStorage.getItem('departments');
        return departmentsData ? JSON.parse(departmentsData) : [];
    } catch (error) {
        console.error('خطأ في استرجاع بيانات الأقسام:', error);
        return [];
    }
}

function getAllJobTitles() {
    try {
        // محاولة استرجاع البيانات من التخزين المحلي
        const jobTitlesData = localStorage.getItem('jobTitles');
        return jobTitlesData ? JSON.parse(jobTitlesData) : [];
    } catch (error) {
        console.error('خطأ في استرجاع بيانات المسميات الوظيفية:', error);
        return [];
    }
}

// وظائف التقارير الأخرى (مستقبلية)
function loadAppointmentsMovementData() {
    // سيتم تنفيذها لاحقاً
    showNotification('جاري تطوير هذا التقرير', 'info');
}

function loadMonthlyAppointmentsData() {
    // سيتم تنفيذها لاحقاً
    showNotification('جاري تطوير هذا التقرير', 'info');
}

function loadPerformanceEvaluationData() {
    // سيتم تنفيذها لاحقاً
    showNotification('جاري تطوير هذا التقرير', 'info');
}

function loadPerformanceComparisonData() {
    // سيتم تنفيذها لاحقاً
    showNotification('جاري تطوير هذا التقرير', 'info');
}

function loadVacationBalanceData() {
    // سيتم تنفيذها لاحقاً
    showNotification('جاري تطوير هذا التقرير', 'info');
}

function loadVacationRequestsData() {
    // سيتم تنفيذها لاحقاً
    showNotification('جاري تطوير هذا التقرير', 'info');
}

function loadVacationTypesData() {
    // سيتم تنفيذها لاحقاً
    showNotification('جاري تطوير هذا التقرير', 'info');
}

function loadInsuranceSubscriptionsData() {
    // سيتم تنفيذها لاحقاً
    showNotification('جاري تطوير هذا التقرير', 'info');
}

function loadInsuranceDeductionsData() {
    // سيتم تنفيذها لاحقاً
    showNotification('جاري تطوير هذا التقرير', 'info');
}

function loadUserPermissionsData() {
    // سيتم تنفيذها لاحقاً
    showNotification('جاري تطوير هذا التقرير', 'info');
}

function loadUserActivitiesData() {
    // سيتم تنفيذها لاحقاً
    showNotification('جاري تطوير هذا التقرير', 'info');
}

function loadCustomDepartmentReport() {
    // سيتم تنفيذها لاحقاً
    showNotification('جاري تطوير هذا التقرير', 'info');
}

function loadCustomComparisonReport() {
    // سيتم تنفيذها لاحقاً
    showNotification('جاري تطوير هذا التقرير', 'info');
}

function loadJobChangeReport() {
    // سيتم تنفيذها لاحقاً
    showNotification('جاري تطوير هذا التقرير', 'info');
}
