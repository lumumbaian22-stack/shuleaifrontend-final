/**
 * @typedef {Object} Student
 * @property {number} id - Student ID
 * @property {number} userId - Associated user ID
 * @property {User} User - User details
 * @property {string} elimuid - ELIMUID identifier
 * @property {string} grade - Grade/class
 * @property {string} dateOfBirth - Date of birth
 * @property {string} gender - Gender (male, female, other)
 * @property {string} enrollmentDate - Enrollment date
 * @property {string} status - Student status (active, inactive, suspended, graduated)
 * @property {string} subscriptionPlan - Subscription plan (basic, premium, ultimate)
 * @property {string} subscriptionStatus - Subscription status
 * @property {string} subscriptionExpiry - Subscription expiry date
 * @property {Array} parents - Parent associations
 * @property {number} average - Average score
 * @property {number} attendance - Attendance rate
 * @property {string} createdAt - Creation timestamp
 * @property {string} updatedAt - Last update timestamp
 */

/**
 * @typedef {Object} StudentGrade
 * @property {number} id - Grade record ID
 * @property {number} studentId - Student ID
 * @property {string} subject - Subject name
 * @property {string} assessmentType - Assessment type (test, exam, assignment, project, quiz)
 * @property {string} assessmentName - Assessment name
 * @property {number} score - Score (0-100)
 * @property {string} grade - Letter grade
 * @property {string} date - Assessment date
 * @property {string} term - Term (Term 1, Term 2, Term 3)
 * @property {number} year - Academic year
 */

/**
 * @typedef {Object} StudentAttendance
 * @property {number} id - Attendance record ID
 * @property {number} studentId - Student ID
 * @property {string} date - Attendance date
 * @property {string} status - Status (present, absent, late, sick, holiday)
 * @property {string} reason - Reason for absence
 * @property {string} createdAt - Creation timestamp
 */