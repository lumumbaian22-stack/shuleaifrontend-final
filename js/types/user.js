/**
 * @typedef {Object} User
 * @property {number} id - User ID
 * @property {string} name - Full name
 * @property {string} email - Email address
 * @property {string} role - User role (super_admin, admin, teacher, parent, student)
 * @property {string} phone - Phone number
 * @property {string} schoolCode - School code
 * @property {string} profileImage - Profile image URL
 * @property {boolean} isActive - Whether user is active
 * @property {string} lastLogin - Last login timestamp
 * @property {Object} preferences - User preferences
 * @property {string} createdAt - Account creation timestamp
 * @property {string} updatedAt - Last update timestamp
 */

/**
 * @typedef {Object} UserPreferences
 * @property {Object} notifications - Notification preferences
 * @property {boolean} notifications.email - Email notifications
 * @property {boolean} notifications.sms - SMS notifications
 * @property {boolean} notifications.push - Push notifications
 * @property {string} theme - Theme preference (light/dark)
 */