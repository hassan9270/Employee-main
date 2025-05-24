// تحسينات إضافية لملف جافاسكريبت التقارير
document.addEventListener('DOMContentLoaded', () => {
    // تحسين تجربة المستخدم عند التنقل بين التقارير
    enhanceReportsNavigation();
    
    // إضافة تأثيرات حركية للعناصر
    addAnimationsToReportElements();
    
    // تحسين عرض الجداول والرسوم البيانية
    enhanceTablesAndCharts();
    
    // تحسين الاستجابة للشاشات المختلفة
    setupResponsiveBehavior();
});

// تحسين تجربة التنقل بين التقارير
function enhanceReportsNavigation() {
    // تحسين التنقل بين أنواع التقارير الرئيسية
    const reportMenuItems = document.querySelectorAll('.reports-menu li');
    reportMenuItems.forEach(item => {
        item.addEventListener('click', () => {
            // إضافة تأثير النقر
            addClickEffect(item);
            
            const reportId = item.getAttribute('data-report');
            activateReportSection(reportId);
            
            // تفعيل أول تبويب في القسم الجديد مع تأثير حركي
            const firstTabButton = document.querySelector(`#${reportId} .report-tab`);
            if (firstTabButton) {
                setTimeout(() => {
                    addClickEffect(firstTabButton);
                    const firstTabId = firstTabButton.getAttribute('data-tab');
                    activateReportTab(reportId, firstTabId);
                    loadReportData(reportId, firstTabId);
                }, 100);
            }
        });
    });

    // تحسين التنقل بين تبويبات التقارير
    const reportTabButtons = document.querySelectorAll('.report-tab');
    reportTabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // إضافة تأثير النقر
            addClickEffect(button);
            
            const reportSection = button.closest('.report-section');
            const reportId = reportSection.id;
            const tabId = button.getAttribute('data-tab');
            activateReportTab(reportId, tabId);
            loadReportData(reportId, tabId);
        });
    });
}

// إضافة تأثير النقر للعناصر
function addClickEffect(element) {
    element.classList.add('click-effect');
    setTimeout(() => {
        element.classList.remove('click-effect');
    }, 300);
}

// إضافة تأثيرات حركية للعناصر
function addAnimationsToReportElements() {
    // تأثيرات للبطاقات الإحصائية
    const statsCards = document.querySelectorAll('.stats-card');
    statsCards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
        card.classList.add('fade-in');
    });
    
    // تأثيرات للجداول
    const tables = document.querySelectorAll('.data-table');
    tables.forEach(table => {
        const rows = table.querySelectorAll('tbody tr');
        rows.forEach((row, index) => {
            row.style.animationDelay = `${index * 0.05}s`;
            row.classList.add('fade-in-up');
        });
    });
    
    // تأثيرات للرسوم البيانية
    const chartContainers = document.querySelectorAll('.chart-container');
    chartContainers.forEach(container => {
        container.classList.add('fade-in');
    });
}

// تحسين عرض الجداول والرسوم البيانية
function enhanceTablesAndCharts() {
    // تحسين الجداول
    const tables = document.querySelectorAll('.data-table');
    tables.forEach(table => {
        // إضافة خاصية الفرز للجداول
        makeTableSortable(table);
        
        // إضافة خاصية البحث في الجدول
        addTableSearch(table);
        
        // تحسين عرض الحالات في الجداول
        enhanceStatusCells(table);
    });
    
    // تحسين الرسوم البيانية
    enhanceCharts();
}

// جعل الجدول قابل للفرز
function makeTableSortable(table) {
    const headers = table.querySelectorAll('thead th');
    headers.forEach((header, index) => {
        if (!header.classList.contains('no-sort')) {
            header.classList.add('sortable');
            header.setAttribute('data-sort-direction', 'none');
            header.innerHTML += '<i class="fas fa-sort"></i>';
            
            header.addEventListener('click', () => {
                const direction = header.getAttribute('data-sort-direction');
                const newDirection = direction === 'asc' ? 'desc' : 'asc';
                
                // إعادة تعيين جميع الرؤوس
                headers.forEach(h => {
                    h.setAttribute('data-sort-direction', 'none');
                    h.querySelector('i').className = 'fas fa-sort';
                });
                
                // تعيين الاتجاه الجديد
                header.setAttribute('data-sort-direction', newDirection);
                header.querySelector('i').className = newDirection === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down';
                
                // فرز الجدول
                sortTable(table, index, newDirection);
            });
        }
    });
}

// فرز الجدول
function sortTable(table, columnIndex, direction) {
    const tbody = table.querySelector('tbody');
    const rows = Array.from(tbody.querySelectorAll('tr'));
    
    const sortedRows = rows.sort((a, b) => {
        const aValue = a.cells[columnIndex].textContent.trim();
        const bValue = b.cells[columnIndex].textContent.trim();
        
        if (!isNaN(aValue) && !isNaN(bValue)) {
            return direction === 'asc' ? aValue - bValue : bValue - aValue;
        } else {
            return direction === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        }
    });
    
    // إعادة ترتيب الصفوف
    while (tbody.firstChild) {
        tbody.removeChild(tbody.firstChild);
    }
    
    sortedRows.forEach(row => {
        tbody.appendChild(row);
    });
    
    // إضافة تأثير حركي للصفوف المرتبة
    const newRows = tbody.querySelectorAll('tr');
    newRows.forEach((row, index) => {
        row.style.animationDelay = `${index * 0.05}s`;
        row.classList.add('fade-in-up');
    });
}

// إضافة خاصية البحث في الجدول
function addTableSearch(table) {
    const tableContainer = table.closest('.table-responsive');
    if (!tableContainer) return;
    
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
}

// تحسين عرض خلايا الحالة
function enhanceStatusCells(table) {
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
}

// تحسين الرسوم البيانية
function enhanceCharts() {
    // تعديل خيارات الرسوم البيانية لتكون أكثر جاذبية
    Chart.defaults.font.family = 'Cairo, sans-serif';
    Chart.defaults.font.size = 14;
    Chart.defaults.color = '#616161';
    
    // إضافة تأثيرات حركية للرسوم البيانية
    const originalDoughnutDraw = Chart.controllers.doughnut.prototype.draw;
    Chart.controllers.doughnut.prototype.draw = function(ease) {
        const ctx = this.chart.ctx;
        const easingDecimal = ease || 1;
        const arcs = this.getMeta().data;
        
        for (let i = 0; i < arcs.length; i++) {
            arcs[i].transition(easingDecimal).draw();
            
            // إضافة ظل للرسم البياني
            const vm = arcs[i]._view;
            if (vm) {
                ctx.save();
                ctx.shadowColor = 'rgba(0,0,0,0.2)';
                ctx.shadowBlur = 10;
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 5;
                arcs[i].draw();
                ctx.restore();
            }
        }
        
        originalDoughnutDraw.apply(this, arguments);
    };
}

// إعداد السلوك المتجاوب
function setupResponsiveBehavior() {
    const reportsContainer = document.querySelector('.reports-container');
    const reportsSidebar = document.querySelector('.reports-sidebar');
    
    // إضافة زر للتبديل بين عرض وإخفاء القائمة الجانبية على الشاشات الصغيرة
    if (window.innerWidth <= 992) {
        const toggleButton = document.createElement('button');
        toggleButton.className = 'reports-sidebar-toggle';
        toggleButton.innerHTML = '<i class="fas fa-bars"></i>';
        toggleButton.setAttribute('aria-label', 'تبديل قائمة التقارير');
        
        const contentHeader = document.querySelector('.content-header');
        contentHeader.appendChild(toggleButton);
        
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
                
                const contentHeader = document.querySelector('.content-header');
                contentHeader.appendChild(toggleButton);
                
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
}
