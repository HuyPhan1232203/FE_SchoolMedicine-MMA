import {
    Timestamp,
    collection,
    doc,
    getDocs,
    query,
    where,
    writeBatch
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { UserProfile, UserRole, UserStatus } from './userService';

// Import result interface
export interface ImportResult {
  success: number;
  failed: number;
  errors: ImportError[];
  duplicates: number;
}

export interface ImportError {
  row: number;
  email: string;
  error: string;
}

// User data for import
export interface ImportUserData {
  email: string;
  fullName: string;
  phoneNumber: string;
  role: UserRole;
  studentId?: string;       // For parents
  department?: string;      // For medical staff
  permissions?: string[];   // For administrators
  autoApprove?: boolean;    // Auto approve user
}

// Validate email format
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate phone number
const isValidPhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^[0-9]{10,11}$/;
  return phoneRegex.test(phone.replace(/[^0-9]/g, ''));
};

// Validate user data
const validateUserData = (userData: ImportUserData, rowIndex: number): string | null => {
  // Check required fields
  if (!userData.email || !userData.fullName || !userData.phoneNumber || !userData.role) {
    return `Thiếu thông tin bắt buộc (email, họ tên, số điện thoại, vai trò)`;
  }

  // Validate email
  if (!isValidEmail(userData.email)) {
    return `Email không hợp lệ: ${userData.email}`;
  }

  // Validate phone
  if (!isValidPhoneNumber(userData.phoneNumber)) {
    return `Số điện thoại không hợp lệ: ${userData.phoneNumber}`;
  }

  // Validate full name length
  if (userData.fullName.length < 2 || userData.fullName.length > 50) {
    return `Họ tên phải từ 2-50 ký tự`;
  }

  // Validate role
  if (!Object.values(UserRole).includes(userData.role)) {
    return `Vai trò không hợp lệ: ${userData.role}`;
  }

  // Validate role-specific fields
  if (userData.role === UserRole.PARENT && userData.studentId) {
    if (userData.studentId.length < 6 || userData.studentId.length > 20) {
      return `Mã học sinh phải từ 6-20 ký tự`;
    }
  }

  if (userData.role === UserRole.MEDICAL_STAFF && userData.department) {
    if (userData.department.length < 2 || userData.department.length > 100) {
      return `Tên khoa phải từ 2-100 ký tự`;
    }
  }

  return null; // No errors
};

// Check for existing users
const checkExistingUsers = async (emails: string[]): Promise<string[]> => {
  try {
    const existingEmails: string[] = [];
    
    // Firestore has limit of 10 items per "in" query, so we batch them
    const chunks = [];
    for (let i = 0; i < emails.length; i += 10) {
      chunks.push(emails.slice(i, i + 10));
    }

    for (const chunk of chunks) {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', 'in', chunk));
      const querySnapshot = await getDocs(q);
      
      querySnapshot.forEach((doc) => {
        const userData = doc.data() as UserProfile;
        existingEmails.push(userData.email);
      });
    }

    return existingEmails;
  } catch (error) {
    console.error('Error checking existing users:', error);
    throw error;
  }
};

// Generate UID for new user (temporary until Firebase Auth user is created)
const generateTempUID = (): string => {
  return 'temp_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
};

// Import users from data array
export const importUsers = async (usersData: ImportUserData[]): Promise<ImportResult> => {
  const result: ImportResult = {
    success: 0,
    failed: 0,
    errors: [],
    duplicates: 0,
  };

  try {
    // Validate all users first
    const validUsers: ImportUserData[] = [];
    const emails: string[] = [];

    for (let i = 0; i < usersData.length; i++) {
      const userData = usersData[i];
      const validationError = validateUserData(userData, i + 1);

      if (validationError) {
        result.failed++;
        result.errors.push({
          row: i + 1,
          email: userData.email || 'Unknown',
          error: validationError,
        });
        continue;
      }

      validUsers.push(userData);
      emails.push(userData.email.toLowerCase());
    }

    // Check for duplicates in the import data
    const emailCounts = emails.reduce((acc, email) => {
      acc[email] = (acc[email] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const duplicateEmails = Object.keys(emailCounts).filter(email => emailCounts[email] > 1);
    if (duplicateEmails.length > 0) {
      for (const email of duplicateEmails) {
        result.failed += emailCounts[email] - 1; // All but one are duplicates
        result.errors.push({
          row: 0,
          email,
          error: `Email trùng lặp trong file import: ${emailCounts[email]} lần`,
        });
      }
    }

    // Check for existing users in database
    const existingEmails = await checkExistingUsers(emails);
    for (const email of existingEmails) {
      result.duplicates++;
      result.errors.push({
        row: 0,
        email,
        error: 'Email đã tồn tại trong hệ thống',
      });
    }

    // Filter out duplicates and existing users
    const uniqueEmails = new Set<string>();
    const usersToImport = validUsers.filter(user => {
      const email = user.email.toLowerCase();
      if (existingEmails.includes(email) || uniqueEmails.has(email)) {
        return false;
      }
      uniqueEmails.add(email);
      return true;
    });

    // Import users in batches (Firestore batch limit is 500)
    const batchSize = 450; // Leave some room for safety
    
    for (let i = 0; i < usersToImport.length; i += batchSize) {
      const batch = writeBatch(db);
      const batchUsers = usersToImport.slice(i, i + batchSize);

      for (const userData of batchUsers) {
        try {
          const tempUID = generateTempUID();
          const userRef = doc(db, 'users', tempUID);

          const userProfile: Partial<UserProfile> = {
            uid: tempUID,
            email: userData.email.toLowerCase(),
            fullName: userData.fullName,
            phoneNumber: userData.phoneNumber,
            role: userData.role,
            status: userData.autoApprove ? UserStatus.APPROVED : UserStatus.PENDING,
            studentId: userData.studentId,
            department: userData.department,
            permissions: userData.permissions || [],
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
          };

          // Add auto-approval info if applicable
          if (userData.autoApprove) {
            userProfile.approvedBy = 'SYSTEM_IMPORT';
            userProfile.approvedAt = Timestamp.now();
          }

          batch.set(userRef, userProfile);
          result.success++;
        } catch (error) {
          result.failed++;
          result.errors.push({
            row: i + 1,
            email: userData.email,
            error: `Lỗi tạo user: ${error}`,
          });
        }
      }

      // Commit batch
      await batch.commit();
      console.log(`✅ Imported batch ${Math.floor(i / batchSize) + 1}: ${batchUsers.length} users`);
    }

  } catch (error) {
    console.error('Import error:', error);
    throw new Error(`Lỗi import: ${error}`);
  }

  return result;
};

// Parse JSON data
export const parseJSONData = (jsonString: string): ImportUserData[] => {
  try {
    const data = JSON.parse(jsonString);
    
    if (!Array.isArray(data)) {
      throw new Error('Dữ liệu JSON phải là một mảng');
    }

    return data.map((item, index) => ({
      email: item.email || '',
      fullName: item.fullName || item.full_name || '',
      phoneNumber: item.phoneNumber || item.phone_number || item.phone || '',
      role: item.role || UserRole.PARENT,
      studentId: item.studentId || item.student_id || undefined,
      department: item.department || undefined,
      permissions: item.permissions || [],
      autoApprove: item.autoApprove || item.auto_approve || false,
    }));
  } catch (error) {
    throw new Error(`Lỗi phân tích JSON: ${error}`);
  }
};

// Parse CSV data
export const parseCSVData = (csvString: string): ImportUserData[] => {
  try {
    const lines = csvString.trim().split('\n');
    
    if (lines.length < 2) {
      throw new Error('File CSV phải có ít nhất 2 dòng (header + data)');
    }

    // Parse header
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    
    // Expected headers (with alternatives)
    const headerMap: Record<string, string[]> = {
      email: ['email', 'Email', 'EMAIL'],
      fullName: ['fullName', 'full_name', 'Full Name', 'Họ tên', 'Ten'],
      phoneNumber: ['phoneNumber', 'phone_number', 'phone', 'Phone', 'Số điện thoại', 'SDT'],
      role: ['role', 'Role', 'Vai trò', 'Position'],
      studentId: ['studentId', 'student_id', 'Student ID', 'Mã học sinh'],
      department: ['department', 'Department', 'Khoa'],
      permissions: ['permissions', 'Permissions', 'Quyền'],
      autoApprove: ['autoApprove', 'auto_approve', 'Auto Approve'],
    };

    // Find column indices
    const columnMap: Record<string, number> = {};
    for (const [key, alternatives] of Object.entries(headerMap)) {
      const index = headers.findIndex(h => alternatives.includes(h));
      if (index !== -1) {
        columnMap[key] = index;
      }
    }

    // Validate required columns
    if (columnMap.email === undefined || columnMap.fullName === undefined || 
        columnMap.phoneNumber === undefined || columnMap.role === undefined) {
      throw new Error('File CSV phải có các cột: email, fullName, phoneNumber, role');
    }

    // Parse data rows
    const users: ImportUserData[] = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      
      if (values.length < headers.length) {
        console.warn(`Dòng ${i + 1}: Không đủ dữ liệu, bỏ qua`);
        continue;
      }

      const user: ImportUserData = {
        email: values[columnMap.email] || '',
        fullName: values[columnMap.fullName] || '',
        phoneNumber: values[columnMap.phoneNumber] || '',
        role: (values[columnMap.role] as UserRole) || UserRole.PARENT,
        studentId: columnMap.studentId !== undefined ? values[columnMap.studentId] : undefined,
        department: columnMap.department !== undefined ? values[columnMap.department] : undefined,
        permissions: columnMap.permissions !== undefined ? 
          values[columnMap.permissions]?.split(';').filter(p => p.trim()) : [],
        autoApprove: columnMap.autoApprove !== undefined ? 
          values[columnMap.autoApprove]?.toLowerCase() === 'true' : false,
      };

      users.push(user);
    }

    return users;
  } catch (error) {
    throw new Error(`Lỗi phân tích CSV: ${error}`);
  }
};

// Generate sample JSON data
export const generateSampleJSON = (): string => {
  const sampleData: ImportUserData[] = [
    {
      email: 'phuhuynha@gmail.com',
      fullName: 'Nguyễn Văn A',
      phoneNumber: '0123456789',
      role: UserRole.PARENT,
      studentId: 'HS001',
      autoApprove: false,
    },
    {
      email: 'phuhuynhb@gmail.com',
      fullName: 'Trần Thị B',
      phoneNumber: '0987654321',
      role: UserRole.PARENT,
      studentId: 'HS002',
      autoApprove: false,
    },
    {
      email: 'ytea@school.edu.vn',
      fullName: 'BS. Lê Văn C',
      phoneNumber: '0111222333',
      role: UserRole.MEDICAL_STAFF,
      department: 'Khoa Y tế trường học',
      autoApprove: true,
    },
    {
      email: 'admin@school.edu.vn',
      fullName: 'Nguyễn Thị D',
      phoneNumber: '0444555666',
      role: UserRole.ADMINISTRATOR,
      permissions: ['manage_users', 'view_reports', 'system_admin'],
      autoApprove: true,
    },
  ];

  return JSON.stringify(sampleData, null, 2);
};

// Generate sample CSV data
export const generateSampleCSV = (): string => {
  const headers = 'email,fullName,phoneNumber,role,studentId,department,permissions,autoApprove';
  const rows = [
    'phuhuynha@gmail.com,"Nguyễn Văn A",0123456789,parent,HS001,,,"false"',
    'phuhuynhb@gmail.com,"Trần Thị B",0987654321,parent,HS002,,,"false"',
    'ytea@school.edu.vn,"BS. Lê Văn C",0111222333,medical_staff,,"Khoa Y tế trường học",,"true"',
    'admin@school.edu.vn,"Nguyễn Thị D",0444555666,administrator,,,"manage_users;view_reports;system_admin","true"',
  ];

  return [headers, ...rows].join('\n');
}; 