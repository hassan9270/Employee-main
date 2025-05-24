// تهيئة البيانات عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    // تحميل قائمة الموظفين
    loadEmployees();
    
    // تهيئة معالجات الأحداث
    initializeEventHandlers();
    
    // تفعيل زر تبديل القائمة الجانبية
    document.getElementById('sidebar-toggle')?.addEventListener('click', function() {
        document.querySelector('.sidebar')?.classList.toggle('active');
        document.querySelector('.main-content')?.classList.toggle('sidebar-collapsed');
    });

    // إضافة مؤشر التحميل
    showLoading(false);
});

// تخزين مؤقت للبيانات
let employeesCache = null;
let lastLoadTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 دقائق

// إضافة مؤشر التحميل
function showLoading(show = true) {
    const loader = document.getElementById('loader');
    if (loader) {
        loader.style.display = show ? 'flex' : 'none';
    }
}

// تحسين تحميل قائمة الموظفين
async function loadEmployees() {
    try {
        showLoading(true);
        const now = Date.now();
        
        // إعادة تحميل البيانات من LocalStorage
        const employees = JSON.parse(localStorage.getItem('employees')) || [];
        console.log('تم تحميل الموظفين:', employees); // للتأكد من وجود البيانات

        if (!Array.isArray(employees)) {
            console.error('بيانات الموظفين غير صالحة');
            showNotification('خطأ في تحميل بيانات الموظفين', 'error');
            return [];
        }

        // تحسين أداء البحث
        const searchableEmployees = employees.map(emp => ({
            ...emp,
            searchableText: Object.values(emp).join(' ').toLowerCase()
        }));

        employeesCache = searchableEmployees;
        lastLoadTime = now;
        
        const tableBody = document.getElementById('employeesTableBody');
        if (!tableBody) {
            console.error('عنصر جدول الموظفين غير موجود');
            return;
        }
        
        // تحسين أداء عرض البيانات
        const fragment = document.createDocumentFragment();
        
        if (searchableEmployees.length === 0) {
            // إضافة رسالة عندما لا توجد بيانات
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = `
                <td colspan="12" class="text-center">
                    لا توجد بيانات للموظفين
                </td>
            `;
            fragment.appendChild(emptyRow);
        } else {
            searchableEmployees.forEach(employee => {
                if (!employee || typeof employee !== 'object') return;
                
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${sanitizeInput(employee.employeeCode || '-')}</td>
                    <td>${sanitizeInput(employee.fullName || '-')}</td>
                    <td>${sanitizeInput(employee.department || '-')}</td>
                    <td>${sanitizeInput(employee.jobTitle || '-')}</td>
                    <td>${sanitizeInput(employee.qualification || '-')}</td>
                    <td>${sanitizeInput(employee.phone || '-')}</td>
                    <td>${formatDate(employee.hireDate)}</td>
                    <td>${calculateWorkDuration(employee.hireDate)}</td>
                    <td>${calculateAge(employee.birthDate)}</td>
                    <td>${employee.insuranceType === 'yes' ? 'نعم' : 'لا'}</td>
                    <td>${employee.specialNeeds === 'yes' ? 'نعم' : 'لا'}</td>
                    <td class="actions">
                        <button class="btn-icon view-btn" onclick="viewEmployee(${employee.id})" title="عرض">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-icon edit-btn" onclick="editEmployee(${employee.id})" title="تعديل">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon delete-btn" onclick="deleteEmployee(${employee.id})" title="حذف">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `;
                fragment.appendChild(row);
            });
        }
        
        // مسح الجدول وإضافة البيانات الجديدة
        tableBody.innerHTML = '';
        tableBody.appendChild(fragment);

        // إضافة مؤشر عدد الموظفين
        updateEmployeeCount(searchableEmployees.length);
        
        // تحديث حالة التخزين المؤقت
        employeesCache = searchableEmployees;
        lastLoadTime = now;

        return searchableEmployees;
    } catch (error) {
        console.error('خطأ في تحميل الموظفين:', error);
        showNotification('حدث خطأ أثناء تحميل الموظفين', 'error');
        return [];
    } finally {
        showLoading(false);
    }
}

// تحديث مؤشر عدد الموظفين
function updateEmployeeCount(count) {
    const countElement = document.getElementById('employee-count');
    if (countElement) {
        countElement.textContent = count;
    }
}

// تحسين البحث
function searchEmployees(searchTerm) {
    try {
        const employees = employeesCache || [];
        const searchTerms = searchTerm.toLowerCase().split(' ').filter(term => term.length > 0);
        
        if (searchTerms.length === 0) {
            return employees;
        }

        return employees.filter(employee => 
            searchTerms.every(term => employee.searchableText.includes(term))
        );
    } catch (error) {
        console.error('خطأ في البحث:', error);
        return [];
    }
}

// تحسين معالجة الملفات
async function handleLargeFile(file) {
    try {
        const chunkSize = 1024 * 1024; // 1MB
        let offset = 0;
        const totalChunks = Math.ceil(file.size / chunkSize);
        let processedChunks = 0;
        
        const progressBar = document.getElementById('import-progress');
        if (progressBar) {
            progressBar.style.display = 'block';
        }

        while (offset < file.size) {
            const chunk = file.slice(offset, offset + chunkSize);
            await processChunk(chunk);
            offset += chunkSize;
            processedChunks++;
            
            if (progressBar) {
                const progress = (processedChunks / totalChunks) * 100;
                progressBar.style.width = `${progress}%`;
                progressBar.textContent = `${Math.round(progress)}%`;
            }
        }

        if (progressBar) {
            progressBar.style.display = 'none';
        }
    } catch (error) {
        console.error('خطأ في معالجة الملف:', error);
        showNotification('حدث خطأ أثناء معالجة الملف', 'error');
    }
}

// تحسين معالجة الأخطاء
function handleError(error, operation) {
    console.error(`خطأ في ${operation}:`, error);
    showNotification(`حدث خطأ أثناء ${operation}`, 'error');
    logOperation('error', { operation, error: error.message });
}

// تحسين التحقق من صحة البيانات
function validateEmployeeData(employee) {
    const validations = {
        fullName: (name) => name && name.length >= 3,
        phone: (phone) => /^(05|5)(5|0|3|6|4|9|1|8|7)([0-9]{7})$/.test(phone),
        email: (email) => !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
        nationalID: (id) => /^[0-9]{10}$/.test(id),
        birthDate: (date) => !date || isValidDate(date),
        hireDate: (date) => !date || isValidDate(date)
    };
    
    const errors = [];
    Object.entries(validations).forEach(([field, validator]) => {
        if (!validator(employee[field])) {
            errors.push(`حقل ${field} غير صالح`);
        }
    });
    
    return errors;
}

// تحسين عرض الإشعارات
function showNotification(message, type, duration = 3000) {
    try {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            <span>${sanitizeInput(message)}</span>
            <button class="notification-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        document.body.appendChild(notification);
        
        // إضافة تأثيرات حركية
        notification.style.animation = 'slideIn 0.3s ease-out';
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => notification.remove(), 300);
        }, duration);
    } catch (error) {
        console.error('خطأ في عرض الإشعار:', error);
    }
}

// تحسين تنظيف المدخلات
function sanitizeInput(input) {
    if (typeof input !== 'string') return '';
    return input
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')
        .replace(/\n/g, '<br>')
        .trim();
}

// تحسين تسجيل العمليات
function logOperation(operation, details) {
    try {
        const log = {
            operation,
            details,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href
        };
        
        const logs = JSON.parse(localStorage.getItem('operation_logs') || '[]');
        logs.push(log);
        
        // حفظ آخر 1000 عملية فقط
        const trimmedLogs = logs.slice(-1000);
        localStorage.setItem('operation_logs', JSON.stringify(trimmedLogs));
        
        // إرسال السجل إلى الخادم إذا كان متاحًا
        if (window.sendLogToServer) {
            window.sendLogToServer(log);
        }
    } catch (error) {
        console.error('خطأ في تسجيل العملية:', error);
    }
}

// تحسين تأخير تنفيذ الدالة
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// تحسين معالجة الذاكرة
function cleanupMemory() {
    employeesCache = null;
    lastLoadTime = 0;
    if (window.gc) {
        window.gc();
    }
}

// إضافة نسخ احتياطي تلقائي
function autoBackup() {
    try {
        const employees = localStorage.getItem('employees');
        const backup = {
            data: employees,
            timestamp: new Date().toISOString()
        };
        localStorage.setItem('employees_backup', JSON.stringify(backup));
    } catch (error) {
        console.error('خطأ في النسخ الاحتياطي:', error);
    }
}

// تحسين معالجة التواريخ
function formatDate(dateString) {
    if (!dateString) return '-';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '-';
        
        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            calendar: 'islamic'
        };
        
        return date.toLocaleDateString('ar-SA', options);
    } catch (error) {
        console.error('خطأ في تنسيق التاريخ:', error);
        return '-';
    }
}

// تهيئة معالجات الأحداث
function initializeEventHandlers() {
    try {
        // البحث
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', debounce(function(e) {
                const searchTerm = e.target.value.toLowerCase();
                const rows = document.querySelectorAll('#employeesTableBody tr');
                
                rows.forEach(row => {
                    const text = row.textContent.toLowerCase();
                    row.style.display = text.includes(searchTerm) ? '' : 'none';
                });
            }, 300));
        }
        
        // زر حذف جميع الموظفين
        const deleteAllBtn = document.getElementById('delete-all-btn');
        if (deleteAllBtn) {
            deleteAllBtn.addEventListener('click', function() {
                document.getElementById('delete-all-modal')?.classList.add('show');
            });
        }
        
        // تأكيد حذف جميع الموظفين
        const confirmationText = document.getElementById('confirmation-text');
        if (confirmationText) {
            confirmationText.addEventListener('input', function(e) {
                const confirmBtn = document.getElementById('confirm-delete-all-btn');
                if (confirmBtn) {
                    confirmBtn.disabled = e.target.value !== 'تأكيد';
                }
            });
        }
        
        // أزرار إغلاق النوافذ المنبثقة
        document.querySelectorAll('.modal-close, .modal-close-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                this.closest('.modal')?.classList.remove('show');
            });
        });
        
        // أزرار الاستيراد والتصدير
        const importBtn = document.getElementById('import-employees-btn');
        if (importBtn) {
            importBtn.addEventListener('click', function() {
                document.getElementById('import-modal')?.classList.add('show');
            });
        }
        
        const exportBtn = document.getElementById('export-employees-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', function() {
                document.getElementById('export-modal')?.classList.add('show');
            });
        }
        
        // تحميل قالب الاستيراد
        const downloadTemplateBtn = document.getElementById('download-template-btn');
        if (downloadTemplateBtn) {
            downloadTemplateBtn.addEventListener('click', function() {
                downloadImportTemplate();
            });
        }
        
        // اختيار ملف للاستيراد
        const importFile = document.getElementById('import-file');
        if (importFile) {
            importFile.addEventListener('change', function(event) {
                handleImportFile(event);
            });
        }
        
        // بدء الاستيراد
        const startImportBtn = document.getElementById('start-import-btn');
        if (startImportBtn) {
            startImportBtn.addEventListener('click', function() {
                startImport();
            });
        }
        
        // بدء التصدير
        const startExportBtn = document.getElementById('start-export-btn');
        if (startExportBtn) {
            startExportBtn.addEventListener('click', function() {
                startExport();
            });
        }
    } catch (error) {
        console.error('خطأ في تهيئة معالجات الأحداث:', error);
        showNotification('حدث خطأ أثناء تهيئة النظام', 'error');
    }
}

// حساب مدة العمل
function calculateWorkDuration(hireDate) {
    if (!hireDate) return '-';
    try {
        const startDate = new Date(hireDate);
        if (isNaN(startDate.getTime())) return '-';
        
        const today = new Date();
        
        let years = today.getFullYear() - startDate.getFullYear();
        let months = today.getMonth() - startDate.getMonth();
        
        if (months < 0) {
            years--;
            months += 12;
        }
        
        if (years > 0) {
            return `${years} سنة${months > 0 ? ` و ${months} شهر` : ''}`;
        } else if (months > 0) {
            return `${months} شهر`;
        } else {
            return 'أقل من شهر';
        }
    } catch (error) {
        console.error('خطأ في حساب مدة العمل:', error);
        return '-';
    }
}

// حساب العمر
function calculateAge(birthDate) {
    if (!birthDate) return '-';
    try {
        const birth = new Date(birthDate);
        if (isNaN(birth.getTime())) return '-';
        
        const today = new Date();
        
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        
        return `${age} سنة`;
    } catch (error) {
        console.error('خطأ في حساب العمر:', error);
        return '-';
    }
}

// عرض تفاصيل الموظف
function viewEmployee(id) {
    try {
        const employees = loadEmployees();
        const employee = employees.find(emp => emp.id === id);
        
        if (employee) {
            window.location.href = `view-employee.html?id=${id}`;
        } else {
            showNotification('لم يتم العثور على الموظف', 'error');
        }
    } catch (error) {
        console.error('خطأ في عرض تفاصيل الموظف:', error);
        showNotification('حدث خطأ أثناء عرض تفاصيل الموظف', 'error');
    }
}

// تعديل بيانات الموظف
function editEmployee(id) {
    try {
        const employees = loadEmployees();
        const employee = employees.find(emp => emp.id === id);
        
        if (employee) {
            window.location.href = `edit-employee.html?id=${id}`;
        } else {
            showNotification('لم يتم العثور على الموظف', 'error');
        }
    } catch (error) {
        console.error('خطأ في تعديل بيانات الموظف:', error);
        showNotification('حدث خطأ أثناء تعديل بيانات الموظف', 'error');
    }
}

// حذف موظف
function deleteEmployee(id) {
    try {
        if (confirm('هل أنت متأكد من حذف هذا الموظف؟')) {
            const employees = loadEmployees();
            const updatedEmployees = employees.filter(emp => emp.id !== id);
            
            localStorage.setItem('employees', JSON.stringify(updatedEmployees));
            showNotification('تم حذف الموظف بنجاح', 'success');
            loadEmployees();
            logOperation('delete', { employeeId: id });
        }
    } catch (error) {
        console.error('خطأ في حذف الموظف:', error);
        showNotification('حدث خطأ أثناء حذف الموظف', 'error');
    }
}

// حذف جميع الموظفين
function deleteAllEmployees() {
    try {
        localStorage.removeItem('employees');
        showNotification('تم حذف جميع الموظفين بنجاح', 'success');
        loadEmployees();
        document.getElementById('delete-all-modal')?.classList.remove('show');
        logOperation('deleteAll', {});
    } catch (error) {
        console.error('خطأ في حذف جميع الموظفين:', error);
        showNotification('حدث خطأ أثناء حذف جميع الموظفين', 'error');
    }
}

// تحميل قالب الاستيراد
function downloadImportTemplate() {
    try {
        // إنشاء مصفوفة البيانات
        const data = [
            [
                'كود الموظف *',
                'الاسم الكامل *',
                'الإدارة *',
                'الوظيفة *',
                'المؤهل *',
                'التليفون *',
                'تاريخ الميلاد *',
                'تاريخ التعيين *',
                'الحالة الاجتماعية',
                'عدد الأبناء',
                'العنوان *',
                'البريد الإلكتروني',
                'الرقم القومي *',
                'التأمين التكافلي',
                'الرقم التأميني',
                'جهة التأمين',
                'رقم البطاقة الصحية',
                'تاريخ التأمين',
                'المهنة في التأمينات',
                'ذوي الهمم',
                'ملاحظات'
            ],
            [
                'EMP001',
                'أحمد محمد علي',
                'قسم الموارد البشرية',
                'موظف موارد بشرية',
                'بكالوريوس',
                '0501234567',
                '1990-01-01',
                '2024-01-01',
                'متزوج',
                '2',
                'الرياض - حي النخيل',
                'ahmed@example.com',
                '1234567890',
                'تأمين تكافلي',
                '123456789',
                'شركة التأمين الوطنية',
                '987654321',
                '2024-01-01',
                'موظف',
                'لا',
                'ملاحظات إضافية'
            ]
        ];

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
            { wch: 15 }, // كود الموظف
            { wch: 25 }, // الاسم الكامل
            { wch: 25 }, // الإدارة
            { wch: 25 }, // الوظيفة
            { wch: 20 }, // المؤهل
            { wch: 15 }, // التليفون
            { wch: 15 }, // تاريخ الميلاد
            { wch: 15 }, // تاريخ التعيين
            { wch: 20 }, // الحالة الاجتماعية
            { wch: 15 }, // عدد الأبناء
            { wch: 30 }, // العنوان
            { wch: 25 }, // البريد الإلكتروني
            { wch: 15 }, // الرقم القومي
            { wch: 20 }, // التأمين التكافلي
            { wch: 15 }, // الرقم التأميني
            { wch: 20 }, // جهة التأمين
            { wch: 15 }, // رقم البطاقة الصحية
            { wch: 15 }, // تاريخ التأمين
            { wch: 20 }, // المهنة في التأمينات
            { wch: 15 }, // ذوي الهمم
            { wch: 30 }  // ملاحظات
        ];
        ws['!cols'] = colWidths;

        // إضافة تعليمات الاستخدام
        const instructions = [
            ['تعليمات الاستخدام:'],
            ['1. الحقول المطلوبة مميزة بعلامة *'],
            ['2. يجب ملء جميع الحقول المطلوبة'],
            ['3. يجب أن يكون الرقم القومي 10 أرقام'],
            ['4. يجب أن يكون رقم الهاتف بصيغة صحيحة (مثال: 0501234567)'],
            ['5. يجب أن يكون البريد الإلكتروني بصيغة صحيحة'],
            ['6. يجب أن يكون التاريخ بصيغة YYYY-MM-DD'],
            ['7. ذوي الهمم يجب أن تكون: نعم، لا'],
            ['8. التأمين التكافلي يمكن إدخاله كنص حر']
        ];

        // إضافة التعليمات إلى الملف
        const wsInstructions = XLSX.utils.aoa_to_sheet(instructions);
        wsInstructions['!cols'] = [{ wch: 50 }];

        // إنشاء مصفوفة جديدة
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'قالب استيراد الموظفين');
        XLSX.utils.book_append_sheet(wb, wsInstructions, 'تعليمات الاستخدام');

        // تحميل الملف
        XLSX.writeFile(wb, 'قالب_استيراد_الموظفين.xlsx');
        showNotification('تم تحميل قالب الاستيراد بنجاح', 'success');

    } catch (error) {
        console.error('خطأ في تحميل قالب الاستيراد:', error);
        showNotification('حدث خطأ أثناء تحميل قالب الاستيراد', 'error');
    }
}

// تحسين معالجة ملف الاستيراد
function handleImportFile(event) {
    try {
        const file = event.target.files[0];
        if (!file) {
            showNotification('يرجى اختيار ملف للاستيراد', 'error');
            return;
        }

        // التحقق من نوع الملف
        const validTypes = [
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'text/csv'
        ];
        
        if (!validTypes.includes(file.type)) {
            showNotification('نوع الملف غير مدعوم. يرجى اختيار ملف Excel أو CSV', 'error');
            return;
        }

        const fileName = document.getElementById('selected-file-name');
        if (fileName) {
            fileName.textContent = file.name;
            fileName.classList.add('selected');
        }

        // عرض شريط التقدم
        const progressBar = document.getElementById('import-progress');
        if (progressBar) {
            progressBar.style.display = 'block';
            progressBar.style.width = '0%';
            progressBar.textContent = '0%';
        }

        // تخزين الملف مؤقتاً
        window.tempImportFile = file;
        
        // تفعيل زر الاستيراد
        const startImportBtn = document.getElementById('start-import-btn');
        if (startImportBtn) {
            startImportBtn.disabled = false;
        }

    } catch (error) {
        console.error('خطأ في معالجة الملف:', error);
        showNotification('حدث خطأ أثناء معالجة الملف', 'error');
    }
}

// تحسين دالة بدء الاستيراد
function startImport() {
    try {
        const file = window.tempImportFile;
        if (!file) {
            showNotification('يرجى اختيار ملف للاستيراد', 'error');
            return;
        }

        showLoading(true);

        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                
                // التحقق من وجود أوراق العمل
                if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
                    throw new Error('الملف لا يحتوي على بيانات');
                }

                // قراءة البيانات من الورقة الأولى
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(firstSheet, { 
                    raw: false,
                    defval: '', // القيمة الافتراضية للحقول الفارغة
                    header: 1 // استخدام الصف الأول كعناوين
                });

                console.log('البيانات المستوردة من Excel:', jsonData); // للتأكد من قراءة البيانات

                // التحقق من وجود بيانات
                if (!jsonData || jsonData.length < 2) { // يجب أن يكون هناك عنوان وصف واحد على الأقل
                    throw new Error('الملف لا يحتوي على بيانات كافية');
                }

                // تحويل البيانات إلى التنسيق المطلوب
                const headers = jsonData[0];
                const rows = jsonData.slice(1);
                
                const formattedData = rows.map(row => {
                    const obj = {};
                    headers.forEach((header, index) => {
                        if (header) { // تجاهل العناوين الفارغة
                            obj[header] = row[index] || '';
                        }
                    });
                    return obj;
                });

                console.log('البيانات بعد التنسيق:', formattedData); // للتأكد من تنسيق البيانات

                // معالجة البيانات
                processImportData(formattedData);

                // مسح الملف المؤقت
                window.tempImportFile = null;

            } catch (error) {
                console.error('خطأ في قراءة الملف:', error);
                showNotification(error.message || 'حدث خطأ أثناء قراءة الملف', 'error');
            }
        };

        reader.onerror = function() {
            showNotification('حدث خطأ أثناء قراءة الملف', 'error');
        };

        reader.readAsArrayBuffer(file);

    } catch (error) {
        console.error('خطأ في بدء الاستيراد:', error);
        showNotification('حدث خطأ أثناء بدء الاستيراد', 'error');
    } finally {
        showLoading(false);
    }
}

// تحسين معالجة بيانات الاستيراد
function processImportData(data) {
    try {
        showLoading(true);
        
        // التحقق من وجود بيانات
        if (!data || data.length === 0) {
            throw new Error('لا توجد بيانات للاستيراد');
        }

        console.log('بدء معالجة البيانات:', data); // للتأكد من بدء المعالجة

        // تطبيع البيانات
        const normalizedData = data.map((row, index) => {
            try {
                const mapped = mapRowFlexible(row);
                console.log(`تطبيع الصف ${index + 1}:`, mapped); // للتأكد من تطبيع كل صف
                return mapped;
            } catch (err) {
                console.error(`خطأ في الصف ${index + 2}:`, err);
                return null;
            }
        }).filter(row => row !== null);

        console.log('البيانات بعد التطبيع:', normalizedData); // للتأكد من البيانات المطبيعية

        // التحقق من صحة البيانات
        const validationResult = validateImportData(normalizedData);
        if (!validationResult.isValid) {
            validationResult.errors.forEach(error => {
                showNotification(`خطأ في الصف ${error.row}: ${error.errors.join('، ')}`, 'error');
            });
            return;
        }

        // استيراد البيانات
        importEmployees(normalizedData);

        // إغلاق النافذة المنبثقة
        const importModal = document.getElementById('import-modal');
        if (importModal) {
            importModal.classList.remove('show');
        }

        // إعادة تعيين حقل الملف
        const fileInput = document.getElementById('import-file');
        if (fileInput) {
            fileInput.value = '';
        }

        const fileName = document.getElementById('selected-file-name');
        if (fileName) {
            fileName.textContent = 'لم يتم اختيار ملف';
            fileName.classList.remove('selected');
        }

        // إخفاء شريط التقدم
        const progressBar = document.getElementById('import-progress');
        if (progressBar) {
            progressBar.style.display = 'none';
        }

        // تعطيل زر الاستيراد
        const startImportBtn = document.getElementById('start-import-btn');
        if (startImportBtn) {
            startImportBtn.disabled = true;
        }

        // عرض رسالة نجاح
        showNotification('تم استيراد البيانات بنجاح', 'success');

        // تحديث الجدول
        loadEmployees();
    } catch (error) {
        console.error('خطأ في معالجة البيانات:', error);
        showNotification('حدث خطأ أثناء معالجة البيانات', 'error');
    } finally {
        showLoading(false);
    }
}

// تحسين دالة استيراد الموظفين
function importEmployees(data) {
    try {
        console.log('بدء استيراد الموظفين:', data); // للتأكد من بدء الاستيراد

        const existingEmployees = JSON.parse(localStorage.getItem('employees')) || [];
        
        const newEmployees = data.map(row => {
            // توليد معرف فريد
            const id = generateId();
            
            // توليد كود موظف جديد إذا لم يكن موجودًا
            const employeeCode = row['كود الموظف'] || generateEmployeeCode();
            
            // تحويل التواريخ
            const birthDate = parseArabicDate(row['تاريخ الميلاد']);
            const hireDate = parseArabicDate(row['تاريخ التعيين']);
            const insuranceDate = parseArabicDate(row['تاريخ التأمين']);
            
            // تحويل القيم النصية
            const specialNeeds = row['ذوي الهمم']?.toLowerCase() === 'نعم' ? 'yes' : 'no';
            
            const employee = {
                id,
                employeeCode,
                fullName: row['الاسم الكامل']?.trim(),
                department: row['الإدارة']?.trim(),
                jobTitle: row['الوظيفة']?.trim(),
                qualification: row['المؤهل']?.trim(),
                phone: row['التليفون']?.trim(),
                birthDate,
                hireDate,
                maritalStatus: row['الحالة الاجتماعية']?.trim(),
                childrenCount: parseInt(row['عدد الأبناء']) || 0,
                address: row['العنوان']?.trim(),
                email: row['البريد الإلكتروني']?.trim(),
                nationalID: row['الرقم القومي']?.trim(),
                insuranceType: row['التأمين التكافلي']?.trim(),
                insuranceNumber: row['الرقم التأميني']?.trim(),
                insuranceAuthority: row['جهة التأمين']?.trim(),
                healthCardNumber: row['رقم البطاقة الصحية']?.trim(),
                insuranceDate,
                insuranceJob: row['المهنة في التأمينات']?.trim(),
                specialNeeds,
                notes: row['ملاحظات']?.trim(),
                isActive: true,
                createdAt: new Date().toISOString()
            };

            console.log('تم إنشاء موظف جديد:', employee); // للتأكد من إنشاء كل موظف
            return employee;
        });
        
        console.log('الموظفين الجدد:', newEmployees); // للتأكد من الموظفين الجدد

        // دمج الموظفين الجدد مع القائمة الحالية
        const updatedEmployees = [...existingEmployees, ...newEmployees];
        
        console.log('الموظفين بعد التحديث:', updatedEmployees); // للتأكد من البيانات النهائية

        // حفظ البيانات
        localStorage.setItem('employees', JSON.stringify(updatedEmployees));
        
        // تسجيل العملية
        logOperation('import', {
            count: newEmployees.length,
            timestamp: new Date().toISOString()
        });
        
        // عمل نسخة احتياطية
        autoBackup();

        // إعادة تحميل البيانات مباشرة
        loadEmployees();
    } catch (error) {
        console.error('خطأ في استيراد الموظفين:', error);
        throw error;
    }
}

// تحسين دالة تحويل التاريخ العربي
function parseArabicDate(dateStr) {
    if (!dateStr) return '';
    
    try {
        // إذا كان التاريخ بالفعل بصيغة رقمية
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
            const date = new Date(dateStr);
            if (!isNaN(date.getTime())) {
                return dateStr;
            }
        }
        
        // تحويل الأرقام العربية إلى إنجليزية
        const arabicNums = '٠١٢٣٤٥٦٧٨٩';
        let normalized = dateStr.replace(/[٠-٩]/g, d => arabicNums.indexOf(d).toString());
        
        // تحويل الأشهر العربية إلى رقم
        const months = {
            'يناير': '01', 'فبراير': '02', 'مارس': '03', 'ابريل': '04', 'أبريل': '04',
            'مايو': '05', 'يونيو': '06', 'يوليو': '07', 'اغسطس': '08', 'أغسطس': '08',
            'سبتمبر': '09', 'اكتوبر': '10', 'أكتوبر': '10', 'نوفمبر': '11', 'ديسمبر': '12'
        };
        
        // محاولة تحويل التاريخ
        normalized = normalized.replace(/(\d{1,2})\s*([\u0621-\u064A]+)\s*(\d{4})/, (m, d, mth, y) => {
            const mm = months[mth.trim()] || '01';
            return `${y}-${mm}-${d.padStart(2, '0')}`;
        });
        
        // التحقق من صحة التاريخ المحول
        const date = new Date(normalized);
        if (isNaN(date.getTime())) {
            console.warn('تاريخ غير صالح:', dateStr);
            return '';
        }
        
        return normalized;
    } catch (error) {
        console.error('خطأ في تحويل التاريخ:', error);
        return '';
    }
}

// توليد معرف فريد
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// توليد كود موظف جديد
function generateEmployeeCode() {
    const employees = JSON.parse(localStorage.getItem('employees')) || [];
    const lastEmployee = employees[employees.length - 1];
    let newCode = 'EMP001';
    
    if (lastEmployee && lastEmployee.employeeCode) {
        const lastNumber = parseInt(lastEmployee.employeeCode.replace('EMP', ''));
        newCode = 'EMP' + String(lastNumber + 1).padStart(3, '0');
    }
    
    return newCode;
}

// تحسين دالة التحقق من صحة بيانات الاستيراد لتستخدم التطبيع
function validateImportData(data) {
    const errors = [];
    const requiredFields = [
        'الاسم الكامل',
        'الاداره',
        'الوظيفه',
        'المؤهل',
        'التليفون',
        'تاريخ الميلاد',
        'تاريخ التعيين',
        'العنوان',
        'الرقم القومي'
    ];

    data.forEach((row, index) => {
        const rowErrors = [];
        // أطبع الأعمدة الأصلية وبعد التطبيع
        const originalKeys = Object.keys(row);
        const normalizedKeys = originalKeys.map(normalizeHeader);
        console.log(`صف ${index + 2}: الأعمدة الأصلية:`, originalKeys);
        console.log(`صف ${index + 2}: الأعمدة بعد التطبيع:`, normalizedKeys);
        requiredFields.forEach(field => {
            const foundKey = Object.keys(row).find(key => normalizeHeader(key) === normalizeHeader(field));
            if (!foundKey || row[foundKey] === undefined || row[foundKey].toString().trim() === '') {
                const availableKeys = Object.keys(row).join(', ');
                rowErrors.push(`الحقل ${field} مطلوب (الأعمدة المتوفرة: ${availableKeys})`);
            }
        });
        // التحقق من البريد الإلكتروني
        const emailKey = Object.keys(row).find(key => normalizeHeader(key) === normalizeHeader('البريد الإلكتروني'));
        if (emailKey && row[emailKey] && !isValidEmail(row[emailKey])) {
            rowErrors.push('البريد الإلكتروني غير صالح');
        }
        // التحقق من رقم الهاتف
        const phoneKey = Object.keys(row).find(key => normalizeHeader(key) === normalizeHeader('التليفون'));
        if (phoneKey && row[phoneKey] && !isValidPhone(row[phoneKey])) {
            rowErrors.push('رقم الهاتف غير صالح');
        }
        // التحقق من رقم الهوية
        const idKey = Object.keys(row).find(key => normalizeHeader(key) === normalizeHeader('الرقم القومي'));
        if (idKey && row[idKey] && !isValidNationalID(row[idKey])) {
            rowErrors.push('الرقم القومي غير صالح');
        }
        // التحقق من التواريخ
        const birthKey = Object.keys(row).find(key => normalizeHeader(key) === normalizeHeader('تاريخ الميلاد'));
        if (birthKey && row[birthKey] && !isValidDate(row[birthKey])) {
            rowErrors.push('تاريخ الميلاد غير صالح');
        }
        const hireKey = Object.keys(row).find(key => normalizeHeader(key) === normalizeHeader('تاريخ التعيين'));
        if (hireKey && row[hireKey] && !isValidDate(row[hireKey])) {
            rowErrors.push('تاريخ التعيين غير صالح');
        }
        const insKey = Object.keys(row).find(key => normalizeHeader(key) === normalizeHeader('تاريخ التأمين'));
        if (insKey && row[insKey] && !isValidDate(row[insKey])) {
            rowErrors.push('تاريخ التأمين غير صالح');
        }
        if (rowErrors.length > 0) {
            errors.push({
                row: index + 2,
                errors: rowErrors
            });
        }
    });
    return {
        isValid: errors.length === 0,
        errors: errors
    };
}

// دوال التحقق من صحة البيانات
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidPhone(phone) {
    const phoneRegex = /^(05|5)(5|0|3|6|4|9|1|8|7)([0-9]{7})$/;
    return phoneRegex.test(phone);
}

function isValidNationalID(id) {
    const idRegex = /^[0-9]{10}$/;
    return idRegex.test(id);
}

function isValidDate(date) {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) return false;
    const d = new Date(date);
    return d instanceof Date && !isNaN(d);
}
