// js/features/classes/index.js

// Export main class manager
export { classManager } from './ClassManager.js';

// Export teacher assignment manager
export { teacherAssignment } from './TeacherAssignment.js';

// Export student enrollment manager
export { studentEnrollment } from './StudentEnrollment.js';

// Export subject assignment manager (if you create a separate file)
// export { subjectAssignment } from './SubjectAssignment.js';

// Also export the class manager as default for convenience
export default { classManager, teacherAssignment, studentEnrollment };
