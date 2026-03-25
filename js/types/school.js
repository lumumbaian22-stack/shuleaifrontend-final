/**
 * @typedef {Object} School
 * @property {number} id - School ID
 * @property {string} schoolId - Unique school identifier
 * @property {string} shortCode - Short code for teacher signup
 * @property {string} name - School name
 * @property {string} system - Curriculum system
 * @property {Object} address - School address
 * @property {string} address.street - Street address
 * @property {string} address.city - City
 * @property {string} address.country - Country
 * @property {Object} contact - Contact information
 * @property {string} contact.email - School email
 * @property {string} contact.phone - School phone
 * @property {string} status - School status (pending, active, suspended, rejected)
 * @property {Object} settings - School settings
 * @property {string} settings.curriculum - Curriculum
 * @property {string} settings.schoolLevel - School level (primary, secondary, both)
 * @property {Array} settings.customSubjects - Custom subjects
 * @property {Object} stats - School statistics
 * @property {number} stats.teachers - Number of teachers
 * @property {number} stats.students - Number of students
 * @property {number} stats.parents - Number of parents
 * @property {number} stats.classes - Number of classes
 * @property {string} createdAt - Creation timestamp
 * @property {string} updatedAt - Last update timestamp
 */

/**
 * @typedef {Object} SchoolSettings
 * @property {string} curriculum - Curriculum (cbc, 844, british, american)
 * @property {string} schoolLevel - School level (primary, secondary, both)
 * @property {Array} customSubjects - Custom subjects
 * @property {Object} terms - Academic terms
 * @property {Object} dutyManagement - Duty management settings
 */

/**
 * @typedef {Object} SchoolStats
 * @property {number} teachers - Total teachers
 * @property {number} students - Total students
 * @property {number} parents - Total parents
 * @property {number} classes - Total classes
 * @property {number} pendingApprovals - Pending teacher approvals
 */