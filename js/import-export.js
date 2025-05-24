// تهيئة المتغيرات العامة
let importFile = null;
let importedData = [];
let exportFields = [];

// دوال التعامل مع LocalStorage
function getFromLocalStorage(key) {
    try {
        return JSON.parse(localStorage.getItem(key));
    } catch {
        return null;
    }
}

function saveToLocalStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

// تهيئة الصفحة عند التحميل
document.addEventListener('DOMContentLoaded', () => {
    // التحقق من وجود المستخدم
    if (!checkSession()) return;
    
    // تهيئة قسم الاستيراد والتصدير
    initializeImportExport();
    
    // إعداد مستمعي الأحداث
    setupEventListeners();
    
    // تحميل الأقسام
    loadDepartments();
    
    // تحميل الحقول المتاحة للتصدير
    loadExportFields();
});

// تهيئة واجهة الاستيراد والتصدير
function initializeImportExport() {
    const container = document.querySelector('.import-export-container');
    if (!container) return;
    
    // إنشاء قسم الاستيراد
    const importSection = createImportSection();
    container.appendChild(importSection);
    
    // إنشاء قسم التصدير
    const exportSection = createExportSection();
    container.appendChild(exportSection);
}

// إنشاء قسم الاستيراد
function createImportSection() {
    const section = document.createElement('div');
    section.className = 'import-export-section';
    
    section.innerHTML = `
        <h2>استيراد بيانات الموظفين</h2>
        
        <div class="import-section">
            <h3>استيراد من ملف Excel</h3>
            <p>قم بتحميل ملف Excel يحتوي على بيانات الموظفين. تأكد من اتباع القالب المرفق.</p>
            
            <div class="import-actions">
                <button id="download-template" class="btn btn-primary">
                    <i class="fas fa-download"></i>
                    تحميل القالب
                </button>
                
                <div class="file-upload">
                    <input type="file" id="import-file" accept=".xlsx, .xls" />
                    <label for="import-file">
                        <i class="fas fa-cloud-upload-alt"></i>
                        <span id="file-name">اختر ملف Excel</span>
                    </label>
                </div>
                
                <button id="import-data" class="btn btn-success" disabled>
                    <i class="fas fa-file-import"></i>
                    استيراد البيانات
                </button>
            </div>
            
            <div id="import-progress" class="progress-container" style="display: none;">
                <div class="progress-bar">
                    <div class="progress-fill"></div>
                </div>
                <div id="progress-percentage">0%</div>
            </div>
            
            <div id="import-results" class="import-results" style="display: none;">
                <h4>نتائج الاستيراد</h4>
                <div class="results-summary">
                    <div class="result-item">
                        <span class="result-label">إجمالي السجلات:</span>
                        <span id="total-records" class="result-value">0</span>
                    </div>
                    <div class="result-item">
                        <span class="result-label">السجلات الناجحة:</span>
                        <span id="successful-records" class="result-value success">0</span>
                    </div>
                    <div class="result-item">
                        <span class="result-label">السجلات الفاشلة:</span>
                        <span id="failed-records" class="result-value error">0</span>
                    </div>
                </div>
                
                <div id="import-errors" class="import-errors" style="display: none;">
                    <h5>الأخطاء</h5>
                    <ul id="error-list"></ul>
                </div>
            </div>
        </div>
    `;
    
    return section;
}

// إنشاء قسم التصدير
function createExportSection() {
    const section = document.createElement('div');
    section.className = 'import-export-section';
    
    section.innerHTML = `
        <h2>تصدير بيانات الموظفين</h2>
        
        <div class="export-section">
            <h3>تصدير إلى ملف Excel</h3>
            <p>حدد الحقول التي ترغب في تضمينها في ملف التصدير.</p>
            
            <div class="export-options">
                <div class="form-group">
                    <label>نوع التصدير</label>
                    <select id="export-type" class="form-control">
                        <option value="all">جميع الموظفين</option>
                        <option value="department">حسب القسم</option>
                        <option value="date">حسب تاريخ التعيين</option>
                    </select>
                </div>
                
                <div id="export-filters" class="form-group" style="display: none;">
                    <!-- سيتم ملؤها ديناميكياً -->
                </div>
                
                <div class="form-group">
                    <label>الحقول المطلوبة</label>
                    <div class="columns-grid">
                        <div class="column-option">
                            <input type="checkbox" id="select-all" checked>
                            <label for="select-all">تحديد الكل</label>
                        </div>
                        <!-- سيتم ملؤها ديناميكياً -->
                    </div>
                </div>
            </div>
            
            <div class="action-buttons">
                <button id="export-data" class="btn btn-primary">
                    <i class="fas fa-file-export"></i>
                    تصدير البيانات
                </button>
            </div>
        </div>
    `;
    
    return section;
}

// تحميل الأقسام
function loadDepartments() {
    // هنا يتم جلب الأقسام من الخادم
    // في هذا المثال، سنستخدم بيانات وهمية
    const departments = [
        'تكنولوجيا المعلومات',
        'الموارد البشرية',
        'المالية',
        'المبيعات',
        'التسويق'
    ];
    
    const departmentFilter = document.getElementById('department-filter');
    if (departmentFilter) {
        departments.forEach(dept => {
            const option = document.createElement('option');
            option.value = dept;
            option.textContent = dept;
            departmentFilter.appendChild(option);
        });
    }
}

// تحميل الحقول المتاحة للتصدير
function loadExportFields() {
    const fields = [
        { id: 'code', label: 'الكود' },
        { id: 'name', label: 'الاسم الكامل' },
        { id: 'department', label: 'القسم' },
        { id: 'jobTitle', label: 'المسمى الوظيفي' },
        { id: 'hireDate', label: 'تاريخ التعيين' },
        { id: 'birthDate', label: 'تاريخ الميلاد' },
        { id: 'maritalStatus', label: 'الحالة الاجتماعية' },
        { id: 'childrenCount', label: 'عدد الأبناء' },
        { id: 'phone', label: 'الهاتف' },
        { id: 'address', label: 'العنوان' },
        { id: 'nationalId', label: 'الرقم القومي' },
        { id: 'insuranceNumber', label: 'الرقم التأميني' },
        { id: 'healthCardNumber', label: 'رقم البطاقة الصحية' },
        { id: 'insuranceProvider', label: 'جهة التأمين' },
        { id: 'insuranceDate', label: 'تاريخ التأمين' },
        { id: 'insuranceJob', label: 'مهنة التأمين' },
        { id: 'insuranceSalary', label: 'راتب التأمين' },
        { id: 'salary', label: 'الراتب' }
    ];
    
    const columnsGrid = document.querySelector('.columns-grid');
    if (columnsGrid) {
        fields.forEach(field => {
            const div = document.createElement('div');
            div.className = 'column-option';
            div.innerHTML = `
                <input type="checkbox" id="${field.id}" checked>
                <label for="${field.id}">${field.label}</label>
            `;
            columnsGrid.appendChild(div);
        });
    }
}

// إعداد مستمعي الأحداث
function setupEventListeners() {
    // تحميل القالب
    const downloadTemplateBtn = document.getElementById('download-template');
    if (downloadTemplateBtn) {
        downloadTemplateBtn.addEventListener('click', downloadTemplate);
    }
    
    // اختيار الملف
    const importFileInput = document.getElementById('import-file');
    if (importFileInput) {
        importFileInput.addEventListener('change', handleFileSelect);
    }
    
    // استيراد البيانات
    const importDataBtn = document.getElementById('import-data');
    if (importDataBtn) {
        importDataBtn.addEventListener('click', importData);
    }
    
    // نوع التصدير
    const exportTypeSelect = document.getElementById('export-type');
    if (exportTypeSelect) {
        exportTypeSelect.addEventListener('change', handleExportTypeChange);
    }
    
    // تحديد الكل
    const selectAllCheckbox = document.getElementById('select-all');
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', handleSelectAll);
    }
    
    // تصدير البيانات
    const exportDataBtn = document.getElementById('export-data');
    if (exportDataBtn) {
        exportDataBtn.addEventListener('click', exportData);
    }
}

// تحميل قالب Excel
function downloadTemplate() {
    const template = {
        SheetNames: ['الموظفين'],
        Sheets: {
            'الموظفين': {
                '!ref': 'A1:R1',
                A1: { v: 'الكود' },
                B1: { v: 'الاسم الكامل' },
                C1: { v: 'القسم' },
                D1: { v: 'المسمى الوظيفي' },
                E1: { v: 'تاريخ التعيين' },
                F1: { v: 'تاريخ الميلاد' },
                G1: { v: 'الحالة الاجتماعية' },
                H1: { v: 'عدد الأبناء' },
                I1: { v: 'الهاتف' },
                J1: { v: 'العنوان' },
                K1: { v: 'الرقم القومي' },
                L1: { v: 'الرقم التأميني' },
                M1: { v: 'رقم البطاقة الصحية' },
                N1: { v: 'جهة التأمين' },
                O1: { v: 'تاريخ التأمين' },
                P1: { v: 'مهنة التأمين' },
                Q1: { v: 'راتب التأمين' },
                R1: { v: 'الراتب' }
            }
        }
    };
    
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, template.Sheets['الموظفين'], 'الموظفين');
    XLSX.writeFile(wb, 'قالب_بيانات_الموظفين.xlsx');
}

// معالجة اختيار الملف
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    importFile = file;
    document.getElementById('file-name').textContent = file.name;
    document.getElementById('import-data').disabled = false;
}

// --- إضافة دالة لمطابقة أسماء الأعمدة بشكل ذكي ---
function normalizeHeader(header) {
    if (!header) return '';
    return header
        .replace(/\s+/g, '') // إزالة جميع الفراغات
        .replace(/[\u200E\u200F]/g, '') // إزالة رموز RTL/LTR الخفية
        .replace(/ي/g, 'ي') // توحيد الياء
        .replace(/ى/g, 'ي') // توحيد الألف المقصورة
        .replace(/ة/g, 'ه') // توحيد التاء المربوطة (اختياري)
        .trim();
}

// خريطة الأعمدة الصحيحة
const correctHeadersMap = {
    'الكود': 'الكود',
    'الاسم_الكامل': 'الاسم الكامل',
    'القسم': 'القسم',
    'المسمى_الوظيفي': 'المسمى الوظيفي',
    'تاريخ_التعيين': 'تاريخ التعيين',
    'تاريخ_الميلاد': 'تاريخ الميلاد',
    'الحالة_الاجتماعية': 'الحالة الاجتماعية',
    'عدد_الابناء': 'عدد الأبناء',
    'الهاتف': 'الهاتف',
    'العنوان': 'العنوان',
    'الرقم_القومي': 'الرقم القومي',
    'الرقم_التأميني': 'الرقم التأميني',
    'رقم_البطاقة_الصحية': 'رقم البطاقة الصحية',
    'جهة_التأمين': 'جهة التأمين',
    'تاريخ_التأمين': 'تاريخ التأمين',
    'مهنة_التأمين': 'مهنة التأمين',
    'راتب_التأمين': 'راتب التأمين',
    'الراتب': 'الراتب'
};

// دالة لتحويل رؤوس الأعمدة في ملف الإكسل إلى الأسماء الصحيحة
function mapHeaders(row) {
    const mapped = {};
    Object.keys(row).forEach(key => {
        const normalized = normalizeHeader(key);
        // ابحث عن أقرب تطابق في correctHeadersMap
        for (const [norm, correct] of Object.entries(correctHeadersMap)) {
            if (normalized === norm) {
                mapped[correct] = row[key];
                return;
            }
        }
        // إذا لم يوجد تطابق، احتفظ بالاسم الأصلي
        mapped[key] = row[key];
    });
    return mapped;
}

// عدل دالة importData لاستخدام mapHeaders
async function importData() {
    if (!importFile) return;
    try {
        const progressContainer = document.getElementById('import-progress');
        const progressFill = progressContainer.querySelector('.progress-fill');
        const progressPercentage = document.getElementById('progress-percentage');
        progressContainer.style.display = 'block';
        // قراءة الملف
        const data = await readExcelFile(importFile);
        // --- تعديل هنا: تطبيع رؤوس الأعمدة ---
        const normalizedData = data.map(mapHeaders);
        importedData = normalizedData;
        // التحقق من صحة البيانات
        const validationResults = validateImportData(normalizedData);
        // --- تحويل بيانات Excel إلى بنية الموظف الصحيحة ---
        if (validationResults.successful > 0) {
            const employees = getFromLocalStorage('employees') || [];
            const departments = getFromLocalStorage('departments') || [];
            const jobTitles = getFromLocalStorage('jobTitles') || [];
            let maxId = employees.length > 0 ? Math.max(...employees.map(e => e.id)) : 0;
            // فقط الصفوف الصحيحة
            const validRows = normalizedData.filter((row, idx) => !validationResults.errors.find(e => e.row === idx + 2));
            const newEmployees = validRows.map(row => {
                const department = departments.find(d => d.name === row['القسم']);
                const jobTitle = jobTitles.find(j => j.title === row['المسمى الوظيفي']);
                return {
                    id: ++maxId,
                    fullName: row['الاسم الكامل'] || '',
                    departmentID: department ? department.id : null,
                    jobTitleID: jobTitle ? jobTitle.id : null,
                    phone: row['الهاتف'] || '',
                    email: row['البريد الإلكتروني'] || '',
                    hireDate: row['تاريخ التعيين'] || '',
                    salary: parseFloat(row['الراتب']) || 0,
                    isActive: true
                };
            });
            const updatedEmployees = [...employees, ...newEmployees];
            saveToLocalStorage('employees', updatedEmployees);
        }
        showImportResults(validationResults);
        if (typeof loadEmployees === 'function') {
            loadEmployees();
        }
        progressContainer.style.display = 'none';
    } catch (error) {
        showNotification('حدث خطأ أثناء استيراد البيانات', 'error');
        console.error('خطأ في استيراد البيانات:', error);
    }
}

// قراءة ملف Excel
function readExcelFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(firstSheet);
                resolve(jsonData);
            } catch (error) {
                reject(error);
            }
        };
        
        reader.onerror = (error) => reject(error);
        reader.readAsArrayBuffer(file);
    });
}

// التحقق من صحة البيانات
function validateImportData(data) {
    const results = {
        total: data.length,
        successful: 0,
        failed: 0,
        errors: []
    };
    
    data.forEach((row, index) => {
        const rowErrors = [];
        
        // التحقق من الحقول المطلوبة
        if (!row['الكود']) rowErrors.push('الكود مطلوب');
        if (!row['الاسم الكامل']) rowErrors.push('الاسم الكامل مطلوب');
        if (!row['القسم']) rowErrors.push('القسم مطلوب');
        if (!row['المسمى الوظيفي']) rowErrors.push('المسمى الوظيفي مطلوب');
        if (!row['تاريخ التعيين']) rowErrors.push('تاريخ التعيين مطلوب');
        
        // التحقق من صحة التواريخ
        if (row['تاريخ التعيين'] && !isValidDate(row['تاريخ التعيين'])) {
            rowErrors.push('تاريخ التعيين غير صالح');
        }
        if (row['تاريخ الميلاد'] && !isValidDate(row['تاريخ الميلاد'])) {
            rowErrors.push('تاريخ الميلاد غير صالح');
        }
        if (row['تاريخ التأمين'] && !isValidDate(row['تاريخ التأمين'])) {
            rowErrors.push('تاريخ التأمين غير صالح');
        }
        
        // التحقق من صحة الأرقام
        if (row['الراتب'] && isNaN(row['الراتب'])) {
            rowErrors.push('الراتب يجب أن يكون رقماً');
        }
        if (row['راتب التأمين'] && isNaN(row['راتب التأمين'])) {
            rowErrors.push('راتب التأمين يجب أن يكون رقماً');
        }
        if (row['عدد الأبناء'] && isNaN(row['عدد الأبناء'])) {
            rowErrors.push('عدد الأبناء يجب أن يكون رقماً');
        }
        
        if (rowErrors.length > 0) {
            results.failed++;
            results.errors.push({
                row: index + 2,
                errors: rowErrors
            });
        } else {
            results.successful++;
        }
    });
    
    return results;
}

// عرض نتائج الاستيراد
function showImportResults(results) {
    const resultsContainer = document.getElementById('import-results');
    const errorsContainer = document.getElementById('import-errors');
    const errorList = document.getElementById('error-list');
    
    // تحديث الإحصائيات
    document.getElementById('total-records').textContent = results.total;
    document.getElementById('successful-records').textContent = results.successful;
    document.getElementById('failed-records').textContent = results.failed;
    
    // عرض الأخطاء
    if (results.errors.length > 0) {
        errorList.innerHTML = '';
        results.errors.forEach(error => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span class="error-row">السطر ${error.row}:</span>
                <span class="error-message">${error.errors.join('، ')}</span>
            `;
            errorList.appendChild(li);
        });
        errorsContainer.style.display = 'block';
    } else {
        errorsContainer.style.display = 'none';
    }
    
    resultsContainer.style.display = 'block';
}

// معالجة تغيير نوع التصدير
function handleExportTypeChange(event) {
    const exportType = event.target.value;
    const filtersContainer = document.getElementById('export-filters');
    
    switch (exportType) {
        case 'department':
            filtersContainer.innerHTML = `
                <label>القسم</label>
                <select id="department-filter" class="form-control">
                    <option value="">الكل</option>
                    <!-- سيتم ملؤها ديناميكياً -->
                </select>
            `;
            filtersContainer.style.display = 'block';
            loadDepartments();
            break;
            
        case 'date':
            filtersContainer.innerHTML = `
                <label>الفترة</label>
                <div class="date-range">
                    <input type="date" id="start-date" class="form-control">
                    <span>إلى</span>
                    <input type="date" id="end-date" class="form-control">
                </div>
            `;
            filtersContainer.style.display = 'block';
            break;
            
        default:
            filtersContainer.style.display = 'none';
    }
}

// معالجة تحديد الكل
function handleSelectAll(event) {
    const checkboxes = document.querySelectorAll('.column-option input[type="checkbox"]:not(#select-all)');
    checkboxes.forEach(checkbox => {
        checkbox.checked = event.target.checked;
    });
}

// تصدير البيانات
async function exportData() {
    try {
        // جمع الحقول المحددة
        const selectedFields = getSelectedFields();
        if (selectedFields.length === 0) {
            showNotification('الرجاء تحديد حقل واحد على الأقل', 'warning');
            return;
        }
        
        // جمع معايير التصفية
        const filters = getExportFilters();
        
        // جلب البيانات
        const data = await fetchExportData(filters);
        
        // تصدير إلى Excel
        exportToExcel(data, selectedFields);
        
    } catch (error) {
        showNotification('حدث خطأ أثناء تصدير البيانات', 'error');
        console.error('خطأ في تصدير البيانات:', error);
    }
}

// الحصول على الحقول المحددة
function getSelectedFields() {
    const checkboxes = document.querySelectorAll('.column-option input[type="checkbox"]:not(#select-all)');
    return Array.from(checkboxes)
        .filter(checkbox => checkbox.checked)
        .map(checkbox => ({
            id: checkbox.id,
            label: checkbox.nextElementSibling.textContent
        }));
}

// الحصول على معايير التصفية
function getExportFilters() {
    const exportType = document.getElementById('export-type').value;
    const filters = { type: exportType };
    
    switch (exportType) {
        case 'department':
            filters.department = document.getElementById('department-filter').value;
            break;
            
        case 'date':
            filters.startDate = document.getElementById('start-date').value;
            filters.endDate = document.getElementById('end-date').value;
            break;
    }
    
    return filters;
}

// جلب بيانات التصدير
async function fetchExportData(filters) {
    // هنا يتم جلب البيانات من الخادم
    // في هذا المثال، سنستخدم بيانات وهمية
    return [
        {
            id: 1,
            name: 'أحمد محمد',
            department: 'تكنولوجيا المعلومات',
            jobTitle: 'مطور برمجيات',
            hireDate: '2023-01-01',
            salary: 5000
        },
        {
            id: 2,
            name: 'سارة أحمد',
            department: 'الموارد البشرية',
            jobTitle: 'مدير موارد بشرية',
            hireDate: '2023-02-01',
            salary: 6000
        }
    ];
}

// تصدير إلى Excel
function exportToExcel(data, fields) {
    // تحويل البيانات إلى تنسيق مناسب
    const exportData = data.map(row => {
        const newRow = {};
        fields.forEach(field => {
            newRow[field.label] = row[field.id];
        });
        return newRow;
    });
    
    // إنشاء ورقة عمل
    const ws = XLSX.utils.json_to_sheet(exportData);
    
    // إنشاء مصنف
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'الموظفين');
    
    // تحميل الملف
    XLSX.writeFile(wb, 'بيانات_الموظفين.xlsx');
}

// التحقق من صحة التاريخ
function isValidDate(dateString) {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
}

// عرض إشعار
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    document.body.appendChild(notification);
    
    // إغلاق الإشعار تلقائياً بعد 5 ثوانٍ
    setTimeout(() => {
        notification.remove();
    }, 5000);
    
    // إغلاق الإشعار عند النقر على زر الإغلاق
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.remove();
    });
}

// الحصول على أيقونة الإشعار
function getNotificationIcon(type) {
    switch (type) {
        case 'success':
            return 'fa-check-circle';
        case 'error':
            return 'fa-exclamation-circle';
        case 'warning':
            return 'fa-exclamation-triangle';
        default:
            return 'fa-info-circle';
    }
}
