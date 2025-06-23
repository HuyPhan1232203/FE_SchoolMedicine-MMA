// Generate Sample Students for Medical School System
// Khởi tạo trực tiếp từ Firebase config
// Run: node scripts/generateStudents.js

import { doc, Timestamp, writeBatch } from 'firebase/firestore';
// Import Firebase services từ project
import { db } from '../constants/firebaseConfig.js';

// Vietnamese Names for Students
const vietnameseNames = {
  lastNames: ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Huỳnh', 'Hoàng', 'Phan', 'Vũ', 'Võ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương'],
  middleNames: ['Văn', 'Thị', 'Minh', 'Hoàng', 'Thanh', 'Thu', 'Kim', 'Hữu', 'Đức', 'Quang', 'Anh', 'Hồng'],
  firstNames: {
    male: ['An', 'Bình', 'Cường', 'Dũng', 'Hùng', 'Khang', 'Long', 'Minh', 'Nam', 'Phúc', 'Quân', 'Sơn', 'Thành', 'Toàn', 'Tuấn', 'Vinh'],
    female: ['Anh', 'Bích', 'Chi', 'Dung', 'Hạnh', 'Hương', 'Lan', 'Linh', 'Mai', 'Nga', 'Phương', 'Quyên', 'Thảo', 'Trang', 'Uyên', 'Yến']
  }
};

// Medical Data Templates
const medicalTemplates = {
  bloodTypes: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
  commonAllergies: [
    'Hải sản', 'Đậu phộng', 'Sữa', 'Trứng', 'Phấn hoa', 'Bụi nhà', 'Thuốc kháng sinh', 
    'Aspirin', 'Tôm cua', 'Cam quýt', 'Chocolate', 'Mật ong'
  ],
  chronicDiseases: [
    'Hen suyễn', 'Tiểu đường type 1', 'Viêm da cơ địa', 'Cận thị', 'Viêm xoang mãn tính',
    'Viêm amidan mãn tính', 'Thiếu máu', 'Rối loạn nhịp tim', 'Thoái hóa cột sống'
  ],
  commonMedications: [
    'Vitamin D3', 'Vitamin C', 'Canxi', 'Sắt', 'Omega-3', 'Probiotics',
    'Ventolin (hen suyễn)', 'Insulin (tiểu đường)', 'Thuốc nhỏ mắt'
  ],
  vaccines: [
    { name: 'BCG', standardAge: [0] },
    { name: 'Viêm gan B', standardAge: [0, 1, 6] },
    { name: 'DPT-VGB-Hib', standardAge: [2, 3, 4, 18] },
    { name: 'Polio', standardAge: [2, 3, 4, 18] },
    { name: 'Sởi-Rubella', standardAge: [9, 18] },
    { name: 'Viêm não Nhật Bản', standardAge: [12, 24] },
    { name: 'HPV', standardAge: [156] }, // 13 tuổi
    { name: 'COVID-19', standardAge: [144, 156] } // 12-13 tuổi
  ]
};

// Utility Functions
function randomChoice(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min, max, decimals = 1) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function generateBirthDate(minAge = 15, maxAge = 18) {
  const today = new Date();
  const age = randomInt(minAge, maxAge);
  const birthYear = today.getFullYear() - age;
  const birthMonth = randomInt(0, 11);
  const birthDay = randomInt(1, 28); // Safe day for all months
  
  return Timestamp.fromDate(new Date(birthYear, birthMonth, birthDay));
}

function generateVietnameseName(gender) {
  const lastName = randomChoice(vietnameseNames.lastNames);
  const middleName = randomChoice(vietnameseNames.middleNames);
  const firstName = randomChoice(vietnameseNames.firstNames[gender]);
  
  return `${lastName} ${middleName} ${firstName}`;
}

function calculateBMI(height, weight) {
  const heightInMeters = height / 100;
  return parseFloat((weight / (heightInMeters * heightInMeters)).toFixed(1));
}

function getBMICategory(bmi) {
  if (bmi < 18.5) return 'underweight';
  if (bmi < 25) return 'normal';
  if (bmi < 30) return 'overweight';
  return 'obese';
}

function generateHealthMetrics(age, gender) {
  // Age-appropriate height/weight ranges for Vietnamese students
  let heightRange, weightRange;
  
  if (age >= 15 && age <= 16) {
    heightRange = gender === 'male' ? [160, 175] : [150, 165];
    weightRange = gender === 'male' ? [45, 65] : [40, 55];
  } else if (age >= 17 && age <= 18) {
    heightRange = gender === 'male' ? [165, 180] : [155, 168];
    weightRange = gender === 'male' ? [50, 70] : [45, 60];
  } else {
    heightRange = gender === 'male' ? [170, 185] : [158, 170];
    weightRange = gender === 'male' ? [55, 75] : [48, 65];
  }
  
  const height = randomInt(heightRange[0], heightRange[1]);
  const weight = randomInt(weightRange[0], weightRange[1]);
  const bmi = calculateBMI(height, weight);
  
  return {
    height,
    weight,
    bmi,
    bmiCategory: getBMICategory(bmi),
    bloodPressure: {
      systolic: randomInt(100, 130),
      diastolic: randomInt(60, 85)
    },
    heartRate: randomInt(60, 100),
    temperature: randomFloat(36.0, 37.0, 1),
    lastMeasuredAt: Timestamp.now()
  };
}

function generateMedicalInfo() {
  const hasAllergies = Math.random() < 0.3; // 30% có dị ứng
  const hasChronicDisease = Math.random() < 0.15; // 15% có bệnh mãn tính
  const takesMedication = Math.random() < 0.2; // 20% đang dùng thuốc
  
  return {
    bloodType: randomChoice(medicalTemplates.bloodTypes),
    allergies: hasAllergies ? [randomChoice(medicalTemplates.commonAllergies)] : [],
    chronicDiseases: hasChronicDisease ? [randomChoice(medicalTemplates.chronicDiseases)] : [],
    medications: takesMedication ? [randomChoice(medicalTemplates.commonMedications)] : [],
    medicalHistory: [],
    disabilities: [],
    specialNeeds: [],
    notes: ''
  };
}

function generateVaccinations(birthDate) {
  const vaccinations = [];
  const birthYear = birthDate.toDate().getFullYear();
  
  medicalTemplates.vaccines.forEach(vaccine => {
    vaccine.standardAge.forEach(ageInMonths => {
      const vaccinationDate = new Date(birthYear, 0, 1);
      vaccinationDate.setMonth(vaccinationDate.getMonth() + ageInMonths);
      
      // Only include if vaccination date is in the past
      if (vaccinationDate < new Date()) {
        vaccinations.push({
          vaccineName: vaccine.name,
          dateGiven: Timestamp.fromDate(vaccinationDate),
          doseNumber: vaccine.standardAge.indexOf(ageInMonths) + 1,
          givenBy: randomChoice(['BS. Nguyễn Văn A', 'BS. Trần Thị B', 'Y tá Lê Văn C']),
          batchNumber: `LOT${randomInt(100000, 999999)}`,
          sideEffects: Math.random() < 0.1 ? 'Sưng nhẹ tại chỗ tiêm' : ''
        });
      }
    });
  });
  
  return vaccinations;
}

function generateHealthCheckups(studentId) {
  const checkups = [];
  const now = new Date();
  
  // Routine checkup trong 6 tháng qua
  const routineDate = new Date(now.getTime() - randomInt(30, 180) * 24 * 60 * 60 * 1000);
  checkups.push({
    checkupId: `CHK_${studentId}_${Date.now()}`,
    date: Timestamp.fromDate(routineDate),
    type: 'routine',
    symptoms: [],
    diagnosis: 'Bình thường',
    treatment: 'Không cần điều trị',
    medications: [],
    doctorId: 'DOC001',
    status: 'completed',
    notes: 'Khám sức khỏe định kỳ'
  });
  
  // Thêm checkup khẩn cấp nếu có (10% probability)
  if (Math.random() < 0.1) {
    const urgentDate = new Date(now.getTime() - randomInt(7, 60) * 24 * 60 * 60 * 1000);
    checkups.push({
      checkupId: `CHK_${studentId}_${Date.now() + 1}`,
      date: Timestamp.fromDate(urgentDate),
      type: 'urgent',
      symptoms: [randomChoice(['Đau đầu', 'Sốt', 'Đau bụng', 'Buồn nôn', 'Chóng mặt'])],
      diagnosis: randomChoice(['Cảm lạnh', 'Rối loạn tiêu hóa', 'Stress học tập', 'Mệt mỏi']),
      treatment: 'Nghỉ ngơi, uống đủ nước',
      medications: ['Paracetamol'],
      doctorId: 'DOC002',
      status: 'completed',
      notes: 'Đã khỏi hoàn toàn'
    });
  }
  
  return checkups;
}

function generateCurrentHealthStatus() {
  const statusOptions = ['healthy', 'sick', 'recovering', 'chronic', 'at_risk'];
  const weights = [0.7, 0.1, 0.1, 0.05, 0.05]; // 70% healthy
  
  let status = 'healthy';
  const random = Math.random();
  let cumulative = 0;
  
  for (let i = 0; i < statusOptions.length; i++) {
    cumulative += weights[i];
    if (random <= cumulative) {
      status = statusOptions[i];
      break;
    }
  }
  
  const now = new Date();
  const lastCheckup = new Date(now.getTime() - randomInt(30, 180) * 24 * 60 * 60 * 1000);
  const nextCheckup = new Date(now.getTime() + randomInt(90, 365) * 24 * 60 * 60 * 1000);
  
  return {
    status,
    lastCheckupDate: Timestamp.fromDate(lastCheckup),
    nextCheckupDue: Timestamp.fromDate(nextCheckup),
    restrictions: status === 'healthy' ? [] : ['Hạn chế vận động mạnh'],
    clearanceForSports: status === 'healthy' || status === 'recovering',
    clearanceForTrips: status !== 'sick'
  };
}

function generateStudent(studentNumber, grade) {
  const studentId = `HS${studentNumber.toString().padStart(3, '0')}`;
  const gender = Math.random() < 0.5 ? 'male' : 'female';
  const birthDate = generateBirthDate();
  const age = new Date().getFullYear() - birthDate.toDate().getFullYear();
  
  const fatherName = generateVietnameseName('male');
  const motherName = generateVietnameseName('female');
  
  return {
    studentId,
    fullName: generateVietnameseName(gender),
    dateOfBirth: birthDate,
    gender,
    grade,
    academicYear: '2024-2025',
    
    address: `${randomInt(1, 999)} ${randomChoice(['Đường Lê Lợi', 'Đường Nguyễn Huệ', 'Đường Trần Hưng Đạo', 'Đường Hai Bà Trưng'])}, ${randomChoice(['Quận 1', 'Quận 3', 'Quận 5', 'Quận 7'])}, TP.HCM`,
    phoneNumber: Math.random() < 0.3 ? `09${randomInt(10000000, 99999999)}` : null,
    
    parentContact: {
      fatherName,
      fatherPhone: `09${randomInt(10000000, 99999999)}`,
      motherName,
      motherPhone: `09${randomInt(10000000, 99999999)}`,
      emergencyContact: `09${randomInt(10000000, 99999999)}`
    },
    
    medicalInfo: generateMedicalInfo(),
    healthMetrics: generateHealthMetrics(age, gender),
    vaccinations: generateVaccinations(birthDate),
    healthCheckups: generateHealthCheckups(studentId),
    currentHealthStatus: generateCurrentHealthStatus(),
    
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    createdBy: 'SYSTEM_GENERATOR',
    lastUpdatedBy: 'SYSTEM_GENERATOR',
    isActive: true
  };
}

async function generateStudentsData() {
  console.log('🏥 Generating Medical School Students Data...\n');
  console.log('📡 Connecting to Firebase...');
  
  const grades = ['10A1', '10A2', '10B1', '10B2', '11A1', '11A2', '11B1', '11B2', '12A1', '12A2', '12B1', '12B2'];
  const studentsPerGrade = 25; // 25 học sinh mỗi lớp
  const totalStudents = grades.length * studentsPerGrade;
  
  console.log(`📊 Tạo ${totalStudents} học sinh cho ${grades.length} lớp`);
  console.log(`📝 Mỗi lớp: ${studentsPerGrade} học sinh\n`);
  
  let studentNumber = 1;
  let createdCount = 0;
  
  // Create students in batches (Firestore limit)
  const batchSize = 450;
  
  for (let i = 0; i < totalStudents; i += batchSize) {
    const batch = writeBatch(db);
    const batchEnd = Math.min(i + batchSize, totalStudents);
    
    console.log(`📦 Processing batch ${Math.floor(i / batchSize) + 1}: Students ${i + 1}-${batchEnd}`);
    
    for (let j = i; j < batchEnd; j++) {
      const gradeIndex = Math.floor(j / studentsPerGrade);
      const grade = grades[gradeIndex];
      
      const student = generateStudent(studentNumber, grade);
      const studentRef = doc(db, 'students', student.studentId);
      
      batch.set(studentRef, student);
      
      if (j % 50 === 0) {
        console.log(`   ✅ Generated: ${student.studentId} - ${student.fullName} (${student.grade})`);
      }
      
      studentNumber++;
      createdCount++;
    }
    
    try {
      await batch.commit();
      console.log(`   💾 Batch committed: ${batchEnd - i} students saved to Firebase\n`);
    } catch (error) {
      console.error(`   ❌ Error committing batch:`, error);
      throw error;
    }
  }
  
  console.log('🎉 Student generation completed!');
  console.log(`📊 Total students created: ${createdCount}`);
  console.log(`🔥 All data saved to Firebase Firestore\n`);
  
  console.log('📋 Summary by grade:');
  grades.forEach((grade, index) => {
    const startId = (index * studentsPerGrade) + 1;
    const endId = (index + 1) * studentsPerGrade;
    console.log(`   ${grade}: HS${startId.toString().padStart(3, '0')} - HS${endId.toString().padStart(3, '0')} (${studentsPerGrade} students)`);
  });
  
  console.log('\n🏥 Medical Data Summary:');
  console.log(`   - Blood types: Random distribution across all types`);
  console.log(`   - Allergies: ~30% of students have allergies`);
  console.log(`   - Chronic diseases: ~15% of students`);
  console.log(`   - Current medications: ~20% of students`);
  console.log(`   - Health status: ~70% healthy, ~30% various conditions`);
  console.log(`   - Vaccination records: Complete age-appropriate schedules`);
  console.log(`   - Health checkups: Recent routine + some urgent cases`);
  
  console.log('\n🔍 Verification Steps:');
  console.log('1. Firebase Console → Firestore → students collection');
  console.log('2. Check student documents có đầy đủ medical data');
  console.log('3. Test queries: by grade, by health status, by medical conditions');
  console.log('4. Verify app có thể load và display student data');
}

// Preview thông tin trước khi chạy
console.log(`
🏥 VIETNAMESE MEDICAL SCHOOL SYSTEM - STUDENT DATA GENERATOR

🎯 Sử dụng Firebase config từ constants/firebaseConfig.js
📡 Kết nối trực tiếp đến Firestore database: mma-297bc

📊 Will create realistic student medical records with:

🔹 Basic Info: Vietnamese names, DOB, Grade, Parent contacts
🔹 Medical Info: Blood type, allergies, chronic diseases, medications
🔹 Health Metrics: Height, weight, BMI, vitals (age-appropriate)
🔹 Vaccinations: Complete immunization schedules (BCG, DPT, HPV, COVID-19...)
🔹 Health History: Routine checkups, urgent visits, treatments
🔹 Current Status: Health clearances, activity restrictions

📈 Generation Plan:
   - 300 students total (12 grades × 25 students each)
   - Student IDs: HS001 - HS300
   - Realistic medical conditions for Vietnamese school students
   - Complete health records ready for medical management

⚠️  Ready to generate? Uncomment the last line to start!
`);

// Uncomment để chạy generation
// generateStudentsData(); 