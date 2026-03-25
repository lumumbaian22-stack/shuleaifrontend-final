/**
 * @typedef {Object} Teacher
 * @property {number} id - Teacher ID
 * @property {number} userId - Associated user ID
 * @property {User} User - User details
 * @property {string} employeeId - Employee ID
 * @property {Array} subjects - Subjects taught
 * @property {string} department - Department (mathematics, science, languages, humanities, technical, sports, general)
 * @property {string} classTeacher - Class teacher assignment
 * @property {string} qualification - Teacher qualification
 * @property {string} dateJoined - Join date
 * @property {string} approvalStatus - Approval status (pending, approved, rejected, suspended)
 * @property {Object} dutyPreferences - Duty preferences
 * @property {Object} statistics - Teacher statistics
 * @property {number} statistics.dutiesCompleted - Completed duties
 * @property {number} statistics.dutiesMissed - Missed duties
 * @property {number} statistics.reliabilityScore - Reliability score
 * @property {number} statistics.monthlyDutyCount - Monthly duty count
 * @property {number} statistics.weeklyDutyCount - Weekly duty count
 * @property {string} createdAt - Creation timestamp
 * @property {string} updatedAt - Last update timestamp
 */

/**
 * @typedef {Object} TeacherDutyPreferences
 * @property {Array} preferredDays - Preferred duty days
 * @property {Array} preferredAreas - Preferred duty areas
 * @property {number} maxDutiesPerWeek - Maximum duties per week
 * @property {Array} blackoutDates - Blackout dates
 */