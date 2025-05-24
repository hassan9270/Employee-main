// دالة لعرض رسائل الخطأ
function showError(message) {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-message';
  errorDiv.innerHTML = `
    <i class="fas fa-exclamation-circle"></i>
    <span>${message}</span>
    <button class="close-btn"><i class="fas fa-times"></i></button>
  `;
  
  document.body.appendChild(errorDiv);
  
  // إزالة الرسالة بعد 5 ثواني
  setTimeout(() => {
    errorDiv.remove();
  }, 5000);
  
  // إمكانية إغلاق الرسالة يدوياً
  errorDiv.querySelector('.close-btn').addEventListener('click', () => {
    errorDiv.remove();
  });
}

// دالة لعرض رسائل النجاح
function showSuccess(message) {
  const successDiv = document.createElement('div');
  successDiv.className = 'success-message';
  successDiv.innerHTML = `
    <i class="fas fa-check-circle"></i>
    <span>${message}</span>
    <button class="close-btn"><i class="fas fa-times"></i></button>
  `;
  
  document.body.appendChild(successDiv);
  
  // إزالة الرسالة بعد 3 ثواني
  setTimeout(() => {
    successDiv.remove();
  }, 3000);
  
  // إمكانية إغلاق الرسالة يدوياً
  successDiv.querySelector('.close-btn').addEventListener('click', () => {
    successDiv.remove();
  });
}

// دالة لإظهار حالة التحميل
function showLoading(element) {
  const loadingDiv = document.createElement('div');
  loadingDiv.className = 'loading-spinner';
  loadingDiv.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
  
  element.appendChild(loadingDiv);
  element.classList.add('loading');
  
  return loadingDiv;
}

// دالة لإخفاء حالة التحميل
function hideLoading(element, loadingDiv) {
  if (loadingDiv) {
    loadingDiv.remove();
  }
  element.classList.remove('loading');
}

// دالة للتعامل مع الأخطاء
function handleError(error, customMessage = 'حدث خطأ غير متوقع') {
  console.error(error);
  showError(customMessage);
}

// دالة للتحقق من صحة الجلسة
function checkSession() {
  // تم تعطيل التحقق من الجلسة بناءً على طلب المستخدم
  return true;
}

// دالة للتحقق من الصلاحيات
function checkPermission(requiredRole) {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  if (!currentUser || currentUser.userRole !== requiredRole) {
    showError('ليس لديك الصلاحية للقيام بهذا الإجراء');
    return false;
  }
  return true;
}

// تهيئة القائمة الجانبية
document.addEventListener('DOMContentLoaded', () => {
    initializeSidebar();
    initializeUserMenu();
});

// تهيئة القائمة الجانبية
function initializeSidebar() {
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebar = document.querySelector('.sidebar');
    
    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('active');
        });
    }
}

// تهيئة قائمة المستخدم
function initializeUserMenu() {
    const userMenu = document.querySelector('.user-menu');
    const dropdownMenu = document.querySelector('.dropdown-menu');
    
    if (userMenu && dropdownMenu) {
        // إغلاق القائمة عند النقر خارجها
        document.addEventListener('click', (event) => {
            if (!userMenu.contains(event.target)) {
                dropdownMenu.style.display = 'none';
            }
        });
        
        // فتح/إغلاق القائمة عند النقر على الصورة الشخصية
        const avatar = userMenu.querySelector('.avatar');
        if (avatar) {
            avatar.addEventListener('click', (event) => {
                event.stopPropagation();
                dropdownMenu.style.display = dropdownMenu.style.display === 'block' ? 'none' : 'block';
            });
        }
    }
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

// التحقق من صحة التاريخ
function isValidDate(dateString) {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
}

// تنسيق التاريخ
function formatDate(date) {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('ar-SA');
}

// تنسيق الرقم
function formatNumber(number) {
    if (!number) return '0';
    return number.toLocaleString('ar-SA');
}

// التحقق من صحة البريد الإلكتروني
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// التحقق من صحة رقم الهاتف
function isValidPhone(phone) {
    const re = /^[0-9]{10,11}$/;
    return re.test(phone);
}

// التحقق من صحة الرقم القومي
function isValidNationalId(id) {
    const re = /^[0-9]{14}$/;
    return re.test(id);
}

// التحقق من صحة الرقم التأميني
function isValidInsuranceNumber(number) {
    const re = /^[0-9]{9}$/;
    return re.test(number);
}

// التحقق من صحة الرقم الصحي
function isValidHealthCardNumber(number) {
    const re = /^[0-9]{10}$/;
    return re.test(number);
}

// التحقق من صحة الراتب
function isValidSalary(salary) {
    return !isNaN(salary) && salary > 0;
}

// التحقق من صحة عدد الأبناء
function isValidChildrenCount(count) {
    return !isNaN(count) && count >= 0;
}

// التحقق من صحة الاسم
function isValidName(name) {
    return name && name.trim().length >= 3;
}

// التحقق من صحة العنوان
function isValidAddress(address) {
    return address && address.trim().length >= 5;
}

// التحقق من صحة المسمى الوظيفي
function isValidJobTitle(title) {
    return title && title.trim().length >= 3;
}

// التحقق من صحة القسم
function isValidDepartment(department) {
    return department && department.trim().length >= 3;
}

// التحقق من صحة الكود
function isValidCode(code) {
    return code && code.trim().length >= 3;
}

// التحقق من صحة الحالة الاجتماعية
function isValidMaritalStatus(status) {
    const validStatuses = ['أعزب', 'متزوج', 'مطلق', 'أرمل'];
    return validStatuses.includes(status);
}

// التحقق من صحة جهة التأمين
function isValidInsuranceProvider(provider) {
    return provider && provider.trim().length >= 3;
}

// التحقق من صحة مهنة التأمين
function isValidInsuranceJob(job) {
    return job && job.trim().length >= 3;
}

// تصدير الدوال
// export {
//   showError,
//   showSuccess,
//   showLoading,
//   hideLoading,
//   handleError,
//   checkSession,
//   checkPermission
// }; 