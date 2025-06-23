import { Timestamp, collection, doc, getDocs, query, setDoc, where } from 'firebase/firestore';
import { db } from '../lib/firebase';

// Student Medical Information Interface
export interface StudentProfile {
  // Basic Information
  studentId: string;                    // Mã học sinh (HS001, HS002...)
  fullName: string;                     // Họ và tên
  dateOfBirth: Timestamp;              // Ngày sinh
  gender: 'male' | 'female';           // Giới tính
  grade: string;                       // Lớp (10A1, 11B2...)
  academicYear: string;                // Năm học (2024-2025)
  
  // Contact Information
  address: string;                     // Địa chỉ
  phoneNumber?: string;                // SĐT học sinh (nếu có)
  parentContact: {
    fatherName?: string;               // Tên bố
    fatherPhone?: string;              // SĐT bố
    motherName?: string;               // Tên mẹ  
    motherPhone?: string;              // SĐT mẹ
    guardianName?: string;             // Người giám hộ
    guardianPhone?: string;            // SĐT người giám hộ
    emergencyContact: string;          // Liên hệ khẩn cấp chính
  };

  // Medical Information
  medicalInfo: {
    bloodType: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | 'unknown'; // Nhóm máu
    allergies: string[];               // Dị ứng (thực phẩm, thuốc...)
    chronicDiseases: string[];         // Bệnh mãn tính
    medications: string[];             // Thuốc đang sử dụng
    medicalHistory: string[];          // Tiền sử bệnh
    disabilities?: string[];           // Khuyết tật (nếu có)
    specialNeeds?: string[];           // Nhu cầu đặc biệt
    notes?: string;                    // Ghi chú y tế
  };

  // Health Metrics
  healthMetrics: {
    height: number;                    // Chiều cao (cm)
    weight: number;                    // Cân nặng (kg)
    bmi: number;                       // BMI
    bmiCategory: 'underweight' | 'normal' | 'overweight' | 'obese'; // Phân loại BMI
    bloodPressure?: {                  // Huyết áp
      systolic: number;                // Tâm thu
      diastolic: number;               // Tâm trương
    };
    heartRate?: number;                // Nhịp tim
    temperature?: number;              // Nhiệt độ cơ thể
    lastMeasuredAt: Timestamp;         // Lần đo cuối
  };

  // Vaccination Records
  vaccinations: {
    vaccineName: string;               // Tên vaccine
    dateGiven: Timestamp;              // Ngày tiêm
    doseNumber: number;                // Mũi thứ
    nextDueDate?: Timestamp;           // Ngày hẹn tiêm tiếp
    givenBy: string;                   // Người tiêm
    batchNumber?: string;              // Số lô vaccine
    sideEffects?: string;              // Tác dụng phụ
  }[];

  // Health Checkup History
  healthCheckups: {
    checkupId: string;                 // Mã khám
    date: Timestamp;                   // Ngày khám
    type: 'routine' | 'urgent' | 'followup' | 'screening'; // Loại khám
    symptoms?: string[];               // Triệu chứng
    diagnosis?: string;                // Chẩn đoán
    treatment?: string;                // Điều trị
    medications?: string[];            // Thuốc kê đơn
    followUpDate?: Timestamp;          // Ngày tái khám
    doctorId: string;                  // Mã bác sĩ khám
    status: 'completed' | 'pending' | 'cancelled'; // Trạng thái
    notes?: string;                    // Ghi chú
  }[];

  // Health Status
  currentHealthStatus: {
    status: 'healthy' | 'sick' | 'recovering' | 'chronic' | 'at_risk'; // Tình trạng sức khỏe
    lastCheckupDate: Timestamp;        // Ngày khám gần nhất
    nextCheckupDue: Timestamp;         // Ngày khám tiếp theo
    restrictions?: string[];           // Hạn chế hoạt động
    clearanceForSports: boolean;       // Được phép tham gia thể thao
    clearanceForTrips: boolean;        // Được phép đi du lịch/dã ngoại
  };

  // System Fields
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;                   // UID của người tạo
  lastUpdatedBy: string;               // UID của người cập nhật gần nhất
  isActive: boolean;                   // Còn học tại trường
}

// Health Status Enums
export enum HealthStatus {
  HEALTHY = 'healthy',
  SICK = 'sick', 
  RECOVERING = 'recovering',
  CHRONIC = 'chronic',
  AT_RISK = 'at_risk'
}

export enum BMICategory {
  UNDERWEIGHT = 'underweight',
  NORMAL = 'normal',
  OVERWEIGHT = 'overweight',
  OBESE = 'obese'
}

export enum BloodType {
  A_POSITIVE = 'A+',
  A_NEGATIVE = 'A-',
  B_POSITIVE = 'B+',
  B_NEGATIVE = 'B-',
  AB_POSITIVE = 'AB+',
  AB_NEGATIVE = 'AB-',
  O_POSITIVE = 'O+',
  O_NEGATIVE = 'O-',
  UNKNOWN = 'unknown'
}

// Utility Functions
export const calculateBMI = (height: number, weight: number): number => {
  const heightInMeters = height / 100;
  return Math.round((weight / (heightInMeters * heightInMeters)) * 10) / 10;
};

export const getBMICategory = (bmi: number): BMICategory => {
  if (bmi < 18.5) return BMICategory.UNDERWEIGHT;
  if (bmi < 25) return BMICategory.NORMAL;
  if (bmi < 30) return BMICategory.OVERWEIGHT;
  return BMICategory.OBESE;
};

export const getAgeFromDate = (birthDate: Timestamp): number => {
  const today = new Date();
  const birth = birthDate.toDate();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};

// CRUD Operations
export const createStudent = async (studentData: Omit<StudentProfile, 'createdAt' | 'updatedAt'>): Promise<void> => {
  try {
    const studentRef = doc(db, 'students', studentData.studentId);
    
    const newStudent: StudentProfile = {
      ...studentData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    await setDoc(studentRef, newStudent);
    console.log(`✅ Student created: ${studentData.studentId}`);
  } catch (error) {
    console.error('Error creating student:', error);
    throw error;
  }
};

export const getStudentsByGrade = async (grade: string): Promise<StudentProfile[]> => {
  try {
    const studentsRef = collection(db, 'students');
    const q = query(studentsRef, where('grade', '==', grade), where('isActive', '==', true));
    const querySnapshot = await getDocs(q);
    
    const students: StudentProfile[] = [];
    querySnapshot.forEach((doc) => {
      students.push(doc.data() as StudentProfile);
    });
    
    return students;
  } catch (error) {
    console.error('Error getting students by grade:', error);
    throw error;
  }
};

export const getStudentsWithHealthIssues = async (): Promise<StudentProfile[]> => {
  try {
    const studentsRef = collection(db, 'students');
    const q = query(studentsRef, where('isActive', '==', true));
    const querySnapshot = await getDocs(q);
    
    const students: StudentProfile[] = [];
    querySnapshot.forEach((doc) => {
      const student = doc.data() as StudentProfile;
      
      // Filter students with health issues
      const hasHealthIssues = 
        student.medicalInfo.allergies.length > 0 ||
        student.medicalInfo.chronicDiseases.length > 0 ||
        student.medicalInfo.medications.length > 0 ||
        student.currentHealthStatus.status !== 'healthy';
      
      if (hasHealthIssues) {
        students.push(student);
      }
    });
    
    return students;
  } catch (error) {
    console.error('Error getting students with health issues:', error);
    throw error;
  }
};

// Health Status Display
export const getHealthStatusInfo = (status: HealthStatus): {
  name: string;
  color: string;
  icon: string;
} => {
  switch (status) {
    case HealthStatus.HEALTHY:
      return { name: 'Khỏe mạnh', color: '#27AE60', icon: '✅' };
    case HealthStatus.SICK:
      return { name: 'Đang bệnh', color: '#E74C3C', icon: '🤒' };
    case HealthStatus.RECOVERING:
      return { name: 'Đang hồi phục', color: '#F39C12', icon: '🔄' };
    case HealthStatus.CHRONIC:
      return { name: 'Bệnh mãn tính', color: '#8E44AD', icon: '⚕️' };
    case HealthStatus.AT_RISK:
      return { name: 'Có nguy cơ', color: '#E67E22', icon: '⚠️' };
    default:
      return { name: 'Không xác định', color: '#95A5A6', icon: '❓' };
  }
}; 