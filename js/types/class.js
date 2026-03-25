/**
 * @typedef {Object} Class
 * @property {number} id - Class ID
 * @property {string} name - Class name
 * @property {string} grade - Grade/level
 * @property {string} stream - Stream (A, B, Science, etc.)
 * @property {string} schoolCode - School code
 * @property {number} teacherId - Class teacher ID
 * @property {Teacher} Teacher - Class teacher details
 * @property {string} academicYear - Academic year
 * @property {boolean} isActive - Whether class is active
 * @property {number} studentCount - Number of students
 * @property {string} createdAt - Creation timestamp
 * @property {string} updatedAt - Last update timestamp
 */

/**
 * @typedef {Object} SubjectAssignment
 * @property {number} id - Assignment ID
 * @property {number} classId - Class ID
 * @property {number} teacherId - Teacher ID
 * @property {string} subject - Subject name
 * @property {Teacher} Teacher - Teacher details
 * @property {string} createdAt - Creation timestamp
 */