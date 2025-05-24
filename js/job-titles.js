// تهيئة البيانات عند تحميل الصفحة
document.addEventListener("DOMContentLoaded", function() {
    // تهيئة قاعدة البيانات
    initializeData();
    
    // تحميل المسميات الوظيفية
    loadJobTitles();
    
    // تهيئة معالجات الأحداث
    initializeEventHandlers();

    // تفعيل زر تبديل القائمة الجانبية
    document.getElementById("sidebar-toggle").addEventListener("click", function() {
        document.querySelector(".sidebar").classList.toggle("active");
        document.querySelector(".main-content").classList.toggle("sidebar-collapsed");
    });
    
    // إضافة تأثيرات الحركة للعناصر
    addAnimations();
});

// تحميل قائمة المسميات الوظيفية
function loadJobTitles() {
    const jobTitles = getFromLocalStorage('jobTitles') || [];
    const tableBody = document.querySelector("#job-titles-table tbody");
    tableBody.innerHTML = "";

    if (jobTitles.length === 0) {
        const row = document.createElement("tr");
        row.innerHTML = '<td colspan="3" class="text-center">لا توجد مسميات وظيفية معرفة</td>';
        tableBody.appendChild(row);
    } else {
        jobTitles.forEach(job => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${job.id}</td>
                <td>${job.title}</td>
                <td class="actions">
                    <button class="btn-icon edit-btn" data-id="${job.id}" title="تعديل">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon delete-btn" data-id="${job.id}" title="حذف">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        });
        addActionButtonsHandlers();
    }
}

// تهيئة معالجات الأحداث
function initializeEventHandlers() {
    const addJobTitleForm = document.getElementById("add-job-title-form");
    const addJobTitleBtn = document.getElementById("add-job-title-btn");
    const addJobTitleModal = document.getElementById("add-job-title-modal");
    const closeBtns = document.querySelectorAll(".modal-close, .modal-close-btn");

    // فتح نافذة إضافة مسمى وظيفي
    addJobTitleBtn.addEventListener("click", function() {
        addJobTitleForm.reset();
        addJobTitleForm.removeAttribute("data-edit-id");
        document.getElementById("add-job-title-modal-title").textContent = "إضافة مسمى وظيفي جديد";
        showModal(addJobTitleModal);
    });

    // إغلاق النوافذ المنبثقة
    closeBtns.forEach(btn => {
        btn.addEventListener("click", function() {
            hideModal(btn.closest(".modal"));
        });
    });

    // حفظ المسمى الوظيفي (إضافة أو تعديل)
    addJobTitleForm.addEventListener("submit", function(event) {
        event.preventDefault();
        const title = document.getElementById("job-title-name").value.trim();
        const description = document.getElementById("job-title-description").value.trim();
        const editId = addJobTitleForm.getAttribute("data-edit-id");

        if (!title) {
            showNotification("يرجى إدخال اسم المسمى الوظيفي", "error");
            return;
        }

        if (editId) {
            // تعديل مسمى وظيفي موجود
            const success = updateJobTitle(parseInt(editId), { 
                title: title,
                description: description 
            });
            if (success) {
                showNotification("تم تعديل المسمى الوظيفي بنجاح", "success");
            } else {
                showNotification("حدث خطأ أثناء تعديل المسمى الوظيفي", "error");
            }
        } else {
            // إضافة مسمى وظيفي جديد
            const newJobTitle = { 
                title: title,
                description: description,
                createdDate: new Date()
            };
            const newId = addJobTitle(newJobTitle);
            if (newId) {
                showNotification("تم إضافة المسمى الوظيفي بنجاح", "success");
            } else {
                showNotification("حدث خطأ أثناء إضافة المسمى الوظيفي", "error");
            }
        }

        hideModal(addJobTitleModal);
        loadJobTitles();
    });
}

// إضافة معالجات الأحداث لأزرار الإجراءات
function addActionButtonsHandlers() {
    const editBtns = document.querySelectorAll(".edit-btn");
    const deleteBtns = document.querySelectorAll(".delete-btn");
    const addJobTitleForm = document.getElementById("add-job-title-form");
    const addJobTitleModal = document.getElementById("add-job-title-modal");

    // أزرار التعديل
    editBtns.forEach(btn => {
        btn.addEventListener("click", function() {
            const jobId = parseInt(this.getAttribute("data-id"));
            const jobTitles = getFromLocalStorage('jobTitles') || [];
            const jobTitle = jobTitles.find(j => j.id === jobId);
            
            if (jobTitle) {
                document.getElementById("job-title-name").value = jobTitle.title;
                addJobTitleForm.setAttribute("data-edit-id", jobId);
                document.getElementById("add-job-title-modal-title").textContent = "تعديل المسمى الوظيفي";
                showModal(addJobTitleModal);
            }
        });
    });

    // أزرار الحذف
    deleteBtns.forEach(btn => {
        btn.addEventListener("click", function() {
            const jobId = parseInt(this.getAttribute("data-id"));
            confirmDeleteJobTitle(jobId);
        });
    });
}

// تأكيد حذف المسمى الوظيفي
function confirmDeleteJobTitle(jobId) {
    const jobTitles = getFromLocalStorage('jobTitles') || [];
    const jobTitle = jobTitles.find(j => j.id === jobId);
    
    if (!jobTitle) {
        showNotification("لم يتم العثور على المسمى الوظيفي", "error");
        return;
    }

    // التحقق مما إذا كان المسمى الوظيفي مستخدماً
    const employees = getFromLocalStorage('employees') || [];
    const isUsed = employees.some(emp => emp.jobTitleID === jobId);

    if (isUsed) {
        showNotification("لا يمكن حذف هذا المسمى الوظيفي لأنه مستخدم من قبل بعض الموظفين", "error");
        return;
    }

    const modal = createConfirmationModal(
        `هل أنت متأكد من رغبتك في حذف المسمى الوظيفي "${jobTitle.title}"؟`,
        function() {
            const success = deleteJobTitle(jobId);
            if (success) {
                showNotification("تم حذف المسمى الوظيفي بنجاح", "success");
                loadJobTitles();
            } else {
                showNotification("حدث خطأ أثناء حذف المسمى الوظيفي", "error");
            }
        }
    );
    showModal(modal);
}

// إضافة تأثيرات الحركة للعناصر
function addAnimations() {
    // تأثيرات للجدول
    const table = document.querySelector("#job-titles-table");
    if (table) {
        table.classList.add("fade-in");
    }
    
    // تأثيرات للأزرار
    const buttons = document.querySelectorAll(".btn, .btn-icon");
    buttons.forEach((btn, index) => {
        btn.classList.add("fade-in");
        btn.style.animationDelay = `${index * 0.05}s`;
    });
}

// ----- الدوال المساعدة ----- //

// إظهار نافذة منبثقة
function showModal(modalElement) {
    modalElement.style.display = "block";
    setTimeout(() => modalElement.classList.add("show"), 10);
}

// إخفاء نافذة منبثقة
function hideModal(modalElement) {
    modalElement.classList.remove("show");
    setTimeout(() => modalElement.style.display = "none", 300);
}

// إنشاء نافذة تأكيد منبثقة
function createConfirmationModal(message, onConfirm) {
    const modal = document.createElement("div");
    modal.className = "modal confirmation-modal";
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>تأكيد</h3>
                <button class="modal-close"><i class="fas fa-times"></i></button>
            </div>
            <div class="modal-body">
                <p>${message}</p>
            </div>
            <div class="modal-footer">
                <button class="btn btn-danger confirm-btn">
                    <i class="fas fa-check"></i> تأكيد
                </button>
                <button class="btn btn-secondary modal-close-btn">
                    <i class="fas fa-times"></i> إلغاء
                </button>
            </div>
        </div>
    `;

    modal.querySelector(".confirm-btn").addEventListener("click", function() {
        onConfirm();
        hideModal(modal);
        modal.remove(); // إزالة العنصر من DOM بعد الإغلاق
    });

    modal.querySelectorAll(".modal-close, .modal-close-btn").forEach(btn => {
        btn.addEventListener("click", function() {
            hideModal(modal);
            modal.remove(); // إزالة العنصر من DOM بعد الإغلاق
        });
    });

    document.body.appendChild(modal);
    return modal;
}

// عرض رسالة إشعار
function showNotification(message, type) {
    let notificationContainer = document.querySelector(".notification-container");
    if (!notificationContainer) {
        notificationContainer = document.createElement("div");
        notificationContainer.className = "notification-container";
        document.body.appendChild(notificationContainer);
    }

    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${type === "success" ? "fa-check-circle" : "fa-exclamation-circle"}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close"><i class="fas fa-times"></i></button>
    `;

    notificationContainer.appendChild(notification);

    const closeBtn = notification.querySelector(".notification-close");
    closeBtn.addEventListener("click", function() {
        notification.remove();
    });

    setTimeout(function() {
        notification.classList.add("fade-out");
        setTimeout(function() {
            notification.remove();
        }, 300);
    }, 5000);
}
