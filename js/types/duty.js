/**
 * @typedef {Object} DutyRoster
 * @property {number} id - Roster ID
 * @property {string} schoolId - School ID
 * @property {string} date - Roster date
 * @property {Array} duties - List of duty assignments
 * @property {number} createdBy - Creator user ID
 * @property {string} createdAt - Creation timestamp
 * @property {string} updatedAt - Last update timestamp
 */

/**
 * @typedef {Object} DutyAssignment
 * @property {number} teacherId - Teacher ID
 * @property {string} teacherName - Teacher name
 * @property {string} type - Duty type (morning, lunch, afternoon, whole_day)
 * @property {string} area - Duty area
 * @property {Object} timeSlot - Time slot
 * @property {string} timeSlot.start - Start time
 * @property {string} timeSlot.end - End time
 * @property {string} status - Duty status (scheduled, completed, missed, cancelled)
 * @property {Object} checkedIn - Check-in details
 * @property {Object} checkedOut - Check-out details
 * @property {string} notes - Notes
 */

/**
 * @typedef {Object} DutyFairnessReport
 * @property {Object} summary - Report summary
 * @property {number} summary.fairnessScore - Fairness score (0-100)
 * @property {number} summary.totalDuties - Total duties
 * @property {Array} summary.understaffedDays - Understaffed days
 * @property {Array} teacherStats - Teacher statistics
 * @property {Array} recommendations - Recommendations
 */

/**
 * @typedef {Object} TeacherWorkload
 * @property {number} teacherId - Teacher ID
 * @property {string} teacherName - Teacher name
 * @property {string} department - Department
 * @property {number} monthlyDutyCount - Monthly duty count
 * @property {number} weeklyDutyCount - Weekly duty count
 * @property {number} reliabilityScore - Reliability score
 * @property {string} status - Workload status (overworked, balanced, underworked)
 */