// نموذج بيانات الموظفين
const employeeSchema = {
  employees: [
    {
      id: Number,            // معرف فريد للموظف
      firstName: String,     // الاسم الأول
      lastName: String,      // الاسم الأخير
      gender: String,        // الجنس (ذكر/أنثى)
      dateOfBirth: Date,     // تاريخ الميلاد
      age: Number,           // العمر (يحسب تلقائياً)
      nationalID: String,    // رقم الهوية الوطنية
      address: String,       // العنوان
      phone: String,         // رقم الهاتف
      email: String,         // البريد الإلكتروني
      departmentID: Number,  // معرف القسم
      jobTitleID: Number,    // معرف المسمى الوظيفي
      hireDate: Date,        // تاريخ التعيين
      salary: Number,        // الراتب
      isActive: Boolean,     // حالة الموظف (نشط/غير نشط)
      photo: String,         // مسار الصورة أو Base64 للصورة
      notes: String,         // ملاحظات
      createdDate: Date,     // تاريخ الإنشاء
      modifiedDate: Date     // تاريخ التعديل
    }
  ],
  
  // نموذج بيانات الأقسام
  departments: [
    {
      id: Number,            // معرف فريد للقسم
      name: String,          // اسم القسم
      description: String,   // وصف القسم
      createdDate: Date      // تاريخ الإنشاء
    }
  ],
  
  // نموذج بيانات المسميات الوظيفية
  jobTitles: [
    {
      id: Number,            // معرف فريد للمسمى الوظيفي
      title: String,         // المسمى الوظيفي
      description: String,   // وصف المسمى الوظيفي
      createdDate: Date      // تاريخ الإنشاء
    }
  ],
  
  // نموذج بيانات الإجازات
  vacations: [
    {
      id: Number,            // معرف فريد للإجازة
      employeeID: Number,    // معرف الموظف
      startDate: Date,       // تاريخ بداية الإجازة
      endDate: Date,         // تاريخ نهاية الإجازة
      vacationType: String,  // نوع الإجازة
      reason: String,        // سبب الإجازة
      isApproved: Boolean,   // حالة الموافقة
      createdDate: Date      // تاريخ الإنشاء
    }
  ],
  
  // نموذج بيانات الرواتب
  salaries: [
    {
      id: Number,            // معرف فريد للراتب
      employeeID: Number,    // معرف الموظف
      amount: Number,        // المبلغ الأساسي
      bonus: Number,         // العلاوة
      deduction: Number,     // الخصم
      paymentDate: Date,     // تاريخ الدفع
      notes: String,         // ملاحظات
      createdDate: Date      // تاريخ الإنشاء
    }
  ],
  
  // نموذج بيانات الحضور والانصراف
  attendance: [
    {
      id: Number,            // معرف فريد للحضور
      employeeID: Number,    // معرف الموظف
      attendanceDate: Date,  // تاريخ الحضور
      timeIn: String,        // وقت الحضور
      timeOut: String,       // وقت الانصراف
      status: String,        // الحالة (حاضر/غائب/متأخر/إجازة)
      notes: String,         // ملاحظات
      createdDate: Date      // تاريخ الإنشاء
    }
  ],
  
  // نموذج بيانات المستخدمين
  users: [
    {
      id: Number,            // معرف فريد للمستخدم
      username: String,      // اسم المستخدم
      password: String,      // كلمة المرور (يجب تشفيرها)
      employeeID: Number,    // معرف الموظف المرتبط
      userRole: String,      // دور المستخدم (مدير/مشرف/مستخدم)
      isActive: Boolean,     // حالة المستخدم
      lastLogin: Date,       // آخر تسجيل دخول
      createdDate: Date      // تاريخ الإنشاء
    }
  ],
  
  // نموذج بيانات سجل النشاطات
  activityLog: [
    {
      id: Number,            // معرف فريد للنشاط
      userID: Number,        // معرف المستخدم
      activityType: String,  // نوع النشاط
      description: String,   // وصف النشاط
      activityDate: Date     // تاريخ النشاط
    }
  ]
};

// بيانات أولية للأقسام
const initialDepartments = [
  { id: 1, name: "الإدارة", description: "قسم الإدارة العليا", createdDate: new Date() },
  { id: 2, name: "الموارد البشرية", description: "قسم إدارة الموارد البشرية", createdDate: new Date() },
  { id: 3, name: "المالية", description: "قسم الشؤون المالية والمحاسبة", createdDate: new Date() },
  { id: 4, name: "تكنولوجيا المعلومات", description: "قسم تكنولوجيا المعلومات والدعم الفني", createdDate: new Date() },
  { id: 5, name: "التسويق", description: "قسم التسويق والمبيعات", createdDate: new Date() },
  { id: 6, name: "خدمة العملاء", description: "قسم خدمة العملاء والدعم", createdDate: new Date() }
];

// بيانات أولية للمسميات الوظيفية
const initialJobTitles = [
  { id: 1, title: "مدير عام", description: "مدير عام الشركة", createdDate: new Date() },
  { id: 2, title: "مدير قسم", description: "مدير قسم", createdDate: new Date() },
  { id: 3, title: "محاسب", description: "محاسب في قسم المالية", createdDate: new Date() },
  { id: 4, title: "مطور برمجيات", description: "مطور برمجيات في قسم تكنولوجيا المعلومات", createdDate: new Date() },
  { id: 5, title: "مسؤول موارد بشرية", description: "مسؤول في قسم الموارد البشرية", createdDate: new Date() },
  { id: 6, title: "مسؤول تسويق", description: "مسؤول في قسم التسويق", createdDate: new Date() },
  { id: 7, title: "ممثل خدمة عملاء", description: "ممثل في قسم خدمة العملاء", createdDate: new Date() },
  { id: 8, title: "فني دعم", description: "فني دعم في قسم تكنولوجيا المعلومات", createdDate: new Date() }
];

// بيانات أولية للموظفين
const initialEmployees = [
  {
    id: 1,
    fullName: "أحمد محمد",
    gender: "ذكر",
    dateOfBirth: new Date("1985-05-15"),
    nationalID: "1234567890",
    address: "القاهرة، مصر",
    phone: "01012345678",
    email: "ahmed@example.com",
    departmentID: 1,
    jobTitleID: 1,
    hireDate: new Date("2020-01-01"),
    salary: 10000,
    isActive: true,
    photo: "",
    notes: "مدير عام الشركة",
    createdDate: new Date(),
    modifiedDate: null
  },
  {
    id: 2,
    fullName: "سارة أحمد",
    gender: "أنثى",
    dateOfBirth: new Date("1990-08-20"),
    nationalID: "0987654321",
    address: "الإسكندرية، مصر",
    phone: "01098765432",
    email: "sara@example.com",
    departmentID: 2,
    jobTitleID: 5,
    hireDate: new Date("2021-03-15"),
    salary: 7000,
    isActive: true,
    photo: "",
    notes: "مسؤولة الموارد البشرية",
    createdDate: new Date(),
    modifiedDate: null
  }
];

// وظائف إدارة البيانات

// حفظ البيانات في localStorage
function saveToLocalStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// استرجاع البيانات من localStorage
function getFromLocalStorage(key) {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
}

// دالة لتشفير كلمة المرور
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// دالة للتحقق من كلمة المرور
async function verifyPassword(password, hashedPassword) {
  const hashedInput = await hashPassword(password);
  return hashedInput === hashedPassword;
}

// تعديل دالة تهيئة البيانات
async function initializeData() {
  // التحقق من وجود البيانات في localStorage
  if (!getFromLocalStorage('departments')) {
    saveToLocalStorage('departments', initialDepartments);
  }
  
  if (!getFromLocalStorage('jobTitles')) {
    saveToLocalStorage('jobTitles', initialJobTitles);
  }
  
  if (!getFromLocalStorage('employees')) {
    saveToLocalStorage('employees', initialEmployees);
  }
  
  if (!getFromLocalStorage('vacations')) {
    saveToLocalStorage('vacations', []);
  }
  
  if (!getFromLocalStorage('salaries')) {
    saveToLocalStorage('salaries', []);
  }
  
  if (!getFromLocalStorage('attendance')) {
    saveToLocalStorage('attendance', []);
  }
  
  if (!getFromLocalStorage('users')) {
    // إنشاء مستخدم افتراضي للنظام مع تشفير كلمة المرور
    const hashedPassword = await hashPassword('admin123');
    const defaultUser = {
      id: 1,
      username: "admin",
      password: hashedPassword,
      employeeID: 1,
      userRole: "مدير",
      isActive: true,
      lastLogin: null,
      createdDate: new Date()
    };
    saveToLocalStorage('users', [defaultUser]);
  }
  
  if (!getFromLocalStorage('activityLog')) {
    saveToLocalStorage('activityLog', []);
  }
}

// دالة لتنظيف وتصحيح المدخلات
function sanitizeInput(input) {
  if (typeof input === 'string') {
    // إزالة الأحرف الخاصة والرموز الخطرة
    return input.replace(/[<>]/g, '');
  }
  return input;
}

// دالة للتحقق من صحة بيانات الموظف
function validateEmployee(employee) {
  const errors = [];
  if (!employee.fullName || employee.fullName.trim().length < 3) {
    errors.push('الاسم الكامل يجب أن يكون 3 أحرف على الأقل');
  }
  if (!employee.nationalID || !/^\d{10}$/.test(employee.nationalID)) {
    errors.push('رقم الهوية الوطنية يجب أن يكون 10 أرقام');
  }
  if (!employee.phone || !/^01[0125][0-9]{8}$/.test(employee.phone)) {
    errors.push('رقم الهاتف غير صحيح');
  }
  if (!employee.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(employee.email)) {
    errors.push('البريد الإلكتروني غير صحيح');
  }
  if (!employee.departmentID) {
    errors.push('يجب اختيار القسم');
  }
  if (!employee.jobTitleID) {
    errors.push('يجب اختيار المسمى الوظيفي');
  }
  if (!employee.salary || employee.salary <= 0) {
    errors.push('الراتب يجب أن يكون أكبر من صفر');
  }
  return {
    isValid: errors.length === 0,
    errors
  };
}

// تعديل دالة إضافة موظف
function addEmployee(employee) {
  try {
    // تنظيف المدخلات
    const sanitizedEmployee = Object.fromEntries(
      Object.entries(employee).map(([key, value]) => [key, sanitizeInput(value)])
    );
    
    // التحقق من صحة البيانات
    const validation = validateEmployee(sanitizedEmployee);
    if (!validation.isValid) {
      throw new Error(validation.errors.join('\n'));
    }
    
    const employees = getFromLocalStorage('employees') || [];
    
    // التحقق من عدم تكرار رقم الهوية الوطنية
    if (employees.some(e => e.nationalID === sanitizedEmployee.nationalID)) {
      throw new Error('رقم الهوية الوطنية مستخدم مسبقاً');
    }
    
    // إنشاء معرف فريد جديد
    const newId = employees.length > 0 ? Math.max(...employees.map(e => e.id)) + 1 : 1;
    
    // إضافة المعرف وتواريخ الإنشاء
    const newEmployee = {
      ...sanitizedEmployee,
      id: newId,
      createdDate: new Date(),
      modifiedDate: null
    };
    
    employees.push(newEmployee);
    saveToLocalStorage('employees', employees);
    
    // تسجيل النشاط
    logActivity(getCurrentUserId(), 'إضافة موظف', `تم إضافة موظف جديد: ${newEmployee.fullName}`);
    
    return newEmployee;
  } catch (error) {
    console.error('خطأ في إضافة الموظف:', error);
    throw error;
  }
}

// تحديث بيانات موظف
function updateEmployee(employeeId, updatedData) {
  const employees = getFromLocalStorage('employees') || [];
  const index = employees.findIndex(e => e.id === employeeId);
  
  if (index !== -1) {
    employees[index] = {
      ...employees[index],
      ...updatedData,
      modifiedDate: new Date()
    };
    
    saveToLocalStorage('employees', employees);
    return true;
  }
  
  return false;
}

// حذف موظف (تحديث حالته إلى غير نشط)
function deleteEmployee(employeeId) {
  return updateEmployee(employeeId, { isActive: false });
}

// البحث عن موظفين
function searchEmployees(searchTerm = null, departmentID = null, isActive = null) {
  const employees = getFromLocalStorage('employees') || [];
  return employees.filter(employee => {
    if (isActive !== null && employee.isActive !== isActive) {
      return false;
    }
    if (departmentID !== null && employee.departmentID !== departmentID) {
      return false;
    }
    if (searchTerm !== null && searchTerm !== '') {
      const fullName = (employee.fullName || '').toLowerCase();
      const term = searchTerm.toLowerCase();
      return fullName.includes(term) || 
             (employee.email && employee.email.toLowerCase().includes(term)) ||
             (employee.phone && employee.phone.includes(term)) ||
             (employee.nationalID && employee.nationalID.includes(term));
    }
    return true;
  });
}

// الحصول على قائمة الأقسام
function getAllDepartments() {
  return getFromLocalStorage('departments') || [];
}

// الحصول على قائمة المسميات الوظيفية
function getAllJobTitles() {
  return getFromLocalStorage('jobTitles') || [];
}

// الحصول على تقرير الموظفين حسب القسم
function getEmployeesByDepartmentReport(departmentId = null) {
  const employees = getFromLocalStorage('employees') || [];
  const departments = getFromLocalStorage('departments') || [];
  
  // تجميع الموظفين حسب القسم
  const report = departments.map(department => {
    // تصفية الموظفين حسب القسم والحالة النشطة
    const deptEmployees = employees.filter(e => 
      e.isActive && 
      (departmentId === null || e.departmentID === department.id) &&
      e.departmentID === department.id
    );
    
    // حساب إحصائيات الرواتب
    const salaries = deptEmployees.map(e => e.salary);
    const employeeCount = deptEmployees.length;
    const averageSalary = employeeCount > 0 ? salaries.reduce((a, b) => a + b, 0) / employeeCount : 0;
    const minSalary = employeeCount > 0 ? Math.min(...salaries) : 0;
    const maxSalary = employeeCount > 0 ? Math.max(...salaries) : 0;
    
    return {
      departmentName: department.name,
      employeeCount,
      averageSalary,
      minSalary,
      maxSalary
    };
  });
  
  // إذا تم تحديد قسم معين، نعيد فقط بيانات هذا القسم
  return departmentId !== null 
    ? report.filter(r => r.departmentID === departmentId) 
    : report;
}

// الحصول على تقرير الرواتب الشهري
function getMonthlySalaryReport(year, month) {
  const employees = getFromLocalStorage('employees') || [];
  const departments = getFromLocalStorage('departments') || [];
  const jobTitles = getFromLocalStorage('jobTitles') || [];
  const salaries = getFromLocalStorage('salaries') || [];
  
  // تصفية الرواتب حسب السنة والشهر
  const monthlySalaries = salaries.filter(s => {
    const paymentDate = new Date(s.paymentDate);
    return paymentDate.getFullYear() === year && paymentDate.getMonth() + 1 === month;
  });
  
  // إنشاء تقرير مفصل
  return monthlySalaries.map(salary => {
    const employee = employees.find(e => e.id === salary.employeeID);
    const department = departments.find(d => d.id === employee?.departmentID);
    const jobTitle = jobTitles.find(j => j.id === employee?.jobTitleID);
    
    return {
      employeeID: salary.employeeID,
      fullName: employee ? employee.fullName : 'غير معروف',
      departmentName: department?.name || 'غير معروف',
      jobTitle: jobTitle?.title || 'غير معروف',
      baseSalary: salary.amount,
      bonus: salary.bonus,
      deduction: salary.deduction,
      netSalary: salary.amount + salary.bonus - salary.deduction,
      paymentDate: salary.paymentDate,
      notes: salary.notes
    };
  });
}

// تصدير الوظائف
const DatabaseService = {
  initializeData,
  addEmployee,
  updateEmployee,
  deleteEmployee,
  searchEmployees,
  getAllDepartments,
  getAllJobTitles,
  getEmployeesByDepartmentReport,
  getMonthlySalaryReport
};

// إضافة قسم جديد
function addDepartment(department) {
  const departments = getFromLocalStorage('departments') || [];
  
  // إنشاء معرف فريد جديد
  const newId = departments.length > 0 ? Math.max(...departments.map(d => d.id)) + 1 : 1;
  
  // إضافة المعرف وتاريخ الإنشاء
  const newDepartment = {
    ...department,
    id: newId,
    createdDate: new Date()
  };
  
  departments.push(newDepartment);
  saveToLocalStorage('departments', departments);
  
  return newId;
}

// تحديث بيانات قسم
function updateDepartment(departmentId, updatedData) {
  const departments = getFromLocalStorage('departments') || [];
  const index = departments.findIndex(d => d.id === departmentId);
  
  if (index !== -1) {
    departments[index] = {
      ...departments[index],
      ...updatedData
    };
    
    saveToLocalStorage('departments', departments);
    return true;
  }
  
  return false;
}

// حذف قسم
function deleteDepartment(departmentId) {
  const departments = getFromLocalStorage('departments') || [];
  const index = departments.findIndex(d => d.id === departmentId);
  
  if (index !== -1) {
    departments.splice(index, 1);
    saveToLocalStorage('departments', departments);
    return true;
  }
  
  return false;
}

// إضافة مسمى وظيفي جديد
function addJobTitle(jobTitle) {
  const jobTitles = getFromLocalStorage('jobTitles') || [];
  
  // إنشاء معرف فريد جديد
  const newId = jobTitles.length > 0 ? Math.max(...jobTitles.map(j => j.id)) + 1 : 1;
  
  // إضافة المعرف وتاريخ الإنشاء
  const newJobTitle = {
    ...jobTitle,
    id: newId,
    createdDate: new Date()
  };
  
  jobTitles.push(newJobTitle);
  saveToLocalStorage('jobTitles', jobTitles);
  
  return newId;
}

// تحديث بيانات مسمى وظيفي
function updateJobTitle(jobTitleId, updatedData) {
  const jobTitles = getFromLocalStorage('jobTitles') || [];
  const index = jobTitles.findIndex(j => j.id === jobTitleId);
  
  if (index !== -1) {
    jobTitles[index] = {
      ...jobTitles[index],
      ...updatedData
    };
    
    saveToLocalStorage('jobTitles', jobTitles);
    return true;
  }
  
  return false;
}

// حذف مسمى وظيفي
function deleteJobTitle(jobTitleId) {
  const jobTitles = getFromLocalStorage('jobTitles') || [];
  const index = jobTitles.findIndex(j => j.id === jobTitleId);
  
  if (index !== -1) {
    jobTitles.splice(index, 1);
    saveToLocalStorage('jobTitles', jobTitles);
    return true;
  }
  
  return false;
}

// دالة تسجيل الدخول
async function login(username, password) {
  try {
    const users = getFromLocalStorage('users') || [];
    const user = users.find(u => u.username === username);
    
    if (!user) {
      throw new Error('اسم المستخدم غير موجود');
    }
    
    const isValidPassword = await verifyPassword(password, user.password);
    if (!isValidPassword) {
      throw new Error('كلمة المرور غير صحيحة');
    }
    
    // تحديث آخر تسجيل دخول
    user.lastLogin = new Date();
    saveToLocalStorage('users', users);
    
    // تسجيل النشاط
    logActivity(user.id, 'تسجيل دخول', 'تم تسجيل الدخول بنجاح');
    
    return user;
  } catch (error) {
    console.error('خطأ في تسجيل الدخول:', error);
    throw error;
  }
}

// دالة تسجيل النشاطات
function logActivity(userId, activityType, description) {
  try {
    const activityLog = getFromLocalStorage('activityLog') || [];
    const newActivity = {
      id: activityLog.length + 1,
      userID: userId,
      activityType,
      description,
      activityDate: new Date()
    };
    activityLog.push(newActivity);
    saveToLocalStorage('activityLog', activityLog);
  } catch (error) {
    console.error('خطأ في تسجيل النشاط:', error);
  }
}

// دالة للحصول على معرف المستخدم الحالي
function getCurrentUserId() {
  const currentUser = getFromLocalStorage('currentUser');
  return currentUser ? currentUser.id : null;
}
