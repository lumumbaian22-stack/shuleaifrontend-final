// js/core/realtime.js
import { store } from './store.js';
import { eventBus, EVENTS } from './events.js';
import { API_BASE_URL } from '../constants/api.js';

class RealtimeManager {
    constructor() {
        this.socket = null;
        this.listeners = new Map();
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000;
        this.isConnecting = false;
    }

    connect(token, userId, schoolCode) {
        if (this.isConnecting || (this.socket && this.socket.connected)) return;
        
        this.isConnecting = true;
        
        if (this.socket) {
            this.disconnect();
        }

        this.socket = io(API_BASE_URL, {
            auth: { token },
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: this.maxReconnectAttempts,
            reconnectionDelay: this.reconnectDelay,
            timeout: 10000
        });

        this.setupEventHandlers(userId, schoolCode);
    }

    setupEventHandlers(userId, schoolCode) {
        this.socket.on('connect', () => {
            console.log('✅ WebSocket connected');
            this.reconnectAttempts = 0;
            this.isConnecting = false;
            store.dispatch({ type: 'REALTIME_CONNECTED', payload: {} });
            eventBus.emit(EVENTS.WS_CONNECTED);

            if (userId) {
                this.socket.emit('join', userId);
            }
            if (schoolCode) {
                this.socket.emit('join-school', schoolCode);
            }
        });

        this.socket.on('connect_error', (error) => {
            console.error('WebSocket connection error:', error);
            this.isConnecting = false;
            eventBus.emit(EVENTS.WS_ERROR, error);
        });

        this.socket.on('disconnect', (reason) => {
            console.log('WebSocket disconnected:', reason);
            store.dispatch({ type: 'REALTIME_DISCONNECTED', payload: {} });
            eventBus.emit(EVENTS.WS_DISCONNECTED, reason);
            
            if (reason === 'io server disconnect') {
                // Server disconnected, try to reconnect
                setTimeout(() => this.reconnect(), this.reconnectDelay);
            }
        });

        // Student updates
        this.on('student-added', (data) => this.handleStudentUpdate('added', data));
        this.on('student-updated', (data) => this.handleStudentUpdate('updated', data));
        this.on('student-deleted', (data) => this.handleStudentUpdate('deleted', data));
        this.on('student-suspended', (data) => this.handleStudentUpdate('suspended', data));
        this.on('student-reactivated', (data) => this.handleStudentUpdate('reactivated', data));

        // Teacher updates
        this.on('teacher-updated', (data) => this.handleTeacherUpdate(data));
        this.on('teacher-approved', (data) => this.handleTeacherApproval(data));

        // Attendance updates
        this.on('attendance-updated', (data) => this.handleAttendanceUpdate(data));

        // Curriculum updates
        this.on('curriculum-updated', (data) => this.handleCurriculumUpdate(data));

        // Class updates
        this.on('class-assigned', (data) => this.handleClassUpdate(data));

        // Duty updates
        this.on('duty-roster-updated', (data) => this.handleDutyUpdate(data));
        this.on('duty-checkin', (data) => this.handleDutyCheckin(data));
        this.on('duty-checkout', (data) => this.handleDutyCheckout(data));

        // Message updates
        this.on('new-message', (data) => this.handleNewMessage(data));
        this.on('message-read', (data) => this.handleMessageRead(data));

        // Notification updates
        this.on('new-notification', (data) => this.handleNewNotification(data));

        // School updates
        this.on('school-updated', (data) => this.handleSchoolUpdate(data));
        this.on('school-name-changed', (data) => this.handleSchoolNameChange(data));
    }

    on(event, callback) {
        if (!this.socket) return;
        this.socket.on(event, callback);
        this.listeners.set(event, callback);
    }

    off(event) {
        if (!this.socket) return;
        const callback = this.listeners.get(event);
        if (callback) {
            this.socket.off(event, callback);
            this.listeners.delete(event);
        }
    }

    emit(event, data) {
        if (this.socket && this.socket.connected) {
            this.socket.emit(event, data);
            return true;
        }
        console.warn(`Cannot emit ${event}: socket not connected`);
        return false;
    }

    reconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`Reconnecting attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}...`);
            setTimeout(() => {
                if (this.socket) {
                    this.socket.connect();
                } else {
                    this.connect();
                }
            }, this.reconnectDelay * this.reconnectAttempts);
        } else {
            console.error('Max reconnection attempts reached');
            eventBus.emit(EVENTS.WS_ERROR, new Error('Max reconnection attempts reached'));
        }
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
        this.isConnecting = false;
    }

    // ============ Event Handlers ============

    handleStudentUpdate(action, data) {
        const user = store.getState('user');
        
        // Update store
        store.dispatch({
            type: 'DASHBOARD_DATA',
            payload: {
                role: user?.role,
                data: { studentUpdate: { action, ...data } }
            }
        });

        // Emit event for UI updates
        eventBus.emit(EVENTS.STUDENT_UPDATED, { action, ...data });

        // Show toast notification
        if (typeof window.showToast === 'function') {
            window.showToast(`📢 Student ${action}: ${data.name}`, 'info');
        }
    }

    handleTeacherUpdate(data) {
        const user = store.getState('user');
        
        eventBus.emit(EVENTS.TEACHER_UPDATED, data);
        
        if (user?.role === 'admin' && typeof window.refreshTeachersList === 'function') {
            window.refreshTeachersList();
        }
        
        if (typeof window.showToast === 'function') {
            window.showToast(`📢 Teacher ${data.action}: ${data.name}`, 'info');
        }
    }

    handleTeacherApproval(data) {
        eventBus.emit(EVENTS.TEACHER_APPROVED, data);
        
        if (typeof window.showToast === 'function') {
            window.showToast(`✅ Teacher ${data.name} has been ${data.status}`, 'success');
        }
    }

    handleAttendanceUpdate(data) {
        const user = store.getState('user');
        
        eventBus.emit(EVENTS.ATTENDANCE_UPDATED, data);
        
        if (user?.role === 'teacher' && typeof window.refreshMyStudents === 'function') {
            window.refreshMyStudents();
        }
        if (user?.role === 'admin' && typeof window.refreshStudentsList === 'function') {
            window.refreshStudentsList();
        }
        
        if (typeof window.showToast === 'function') {
            window.showToast(`📢 Attendance updated for ${data.date}`, 'info');
        }
    }

    handleCurriculumUpdate(data) {
        // Update store
        store.dispatch({
            type: 'CURRICULUM_UPDATED',
            payload: { curriculum: data.curriculum }
        });

        // Update local storage
        const schoolSettings = JSON.parse(localStorage.getItem('schoolSettings') || '{}');
        schoolSettings.curriculum = data.curriculum;
        localStorage.setItem('schoolSettings', JSON.stringify(schoolSettings));

        // Emit event
        eventBus.emit(EVENTS.CURRICULUM_CHANGED, data);

        // Refresh UI based on role
        const user = store.getState('user');
        if (user?.role === 'teacher' && typeof window.refreshMyStudents === 'function') {
            window.refreshMyStudents();
        } else if (user?.role === 'admin' && typeof window.refreshStudentsList === 'function') {
            window.refreshStudentsList();
        } else if (user?.role === 'parent' && typeof window.refreshParentDashboard === 'function') {
            window.refreshParentDashboard();
        } else if (user?.role === 'student' && typeof window.refreshStudentDashboard === 'function') {
            window.refreshStudentDashboard();
        }

        if (typeof window.showToast === 'function') {
            window.showToast(`📢 Curriculum updated to ${data.curriculumName}`, 'info');
        }
    }

    handleClassUpdate(data) {
        const user = store.getState('user');
        
        eventBus.emit(EVENTS.CLASS_UPDATED, data);
        
        if (user?.role === 'teacher' && data.teacherId == user?.id) {
            if (typeof window.refreshMyStudents === 'function') {
                window.refreshMyStudents();
            }
        }
        
        if (user?.role === 'admin') {
            if (typeof window.refreshClassesList === 'function') {
                window.refreshClassesList();
            }
            if (typeof window.refreshTeachersList === 'function') {
                window.refreshTeachersList();
            }
            if (typeof window.refreshStudentsList === 'function') {
                window.refreshStudentsList();
            }
        }
        
        if (typeof window.showToast === 'function') {
            window.showToast(`📢 Class updated: ${data.className}`, 'info');
        }
    }

    handleDutyUpdate(data) {
        eventBus.emit(EVENTS.DUTY_ROSTER_GENERATED, data);
        
        if (typeof window.showToast === 'function') {
            window.showToast(`📋 Duty roster updated`, 'info');
        }
    }

    handleDutyCheckin(data) {
        eventBus.emit(EVENTS.DUTY_CHECK_IN, data);
        
        if (typeof window.showToast === 'function') {
            window.showToast(`✅ ${data.teacherName} checked in for duty`, 'success');
        }
    }

    handleDutyCheckout(data) {
        eventBus.emit(EVENTS.DUTY_CHECK_OUT, data);
        
        if (typeof window.showToast === 'function') {
            window.showToast(`✅ ${data.teacherName} checked out from duty`, 'success');
        }
    }

    handleNewMessage(data) {
        eventBus.emit(EVENTS.MESSAGE_RECEIVED, data);
        
        if (typeof window.showToast === 'function') {
            window.showToast(`💬 New message from ${data.fromName}`, 'info');
        }
    }

    handleMessageRead(data) {
        eventBus.emit(EVENTS.MESSAGE_READ, data);
    }

    handleNewNotification(data) {
        // Update store
        const notifications = store.getState('notifications') || [];
        store.dispatch({
            type: 'NOTIFICATIONS_UPDATED',
            payload: { notifications: [data, ...notifications] }
        });
        
        eventBus.emit(EVENTS.NOTIFICATION_RECEIVED, data);
        
        // Show toast for important notifications
        if (data.severity === 'critical' || data.severity === 'warning') {
            if (typeof window.showToast === 'function') {
                window.showToast(data.message, data.severity === 'critical' ? 'error' : 'warning', 5000);
            }
        }
    }

    handleSchoolUpdate(data) {
        eventBus.emit(EVENTS.SCHOOL_UPDATED, data);
    }

    handleSchoolNameChange(data) {
        store.dispatch({
            type: 'SCHOOL_NAME_CHANGED',
            payload: { newName: data.newName }
        });
        
        eventBus.emit(EVENTS.SCHOOL_NAME_CHANGED, data);
        
        if (typeof window.showToast === 'function') {
            window.showToast(`🏫 School name changed to "${data.newName}"`, 'success');
        }
    }

    // ============ Emit Functions ============

    emitStudentUpdate(action, studentData) {
        this.emit('student-update', {
            action,
            ...studentData,
            timestamp: new Date().toISOString()
        });
    }

    emitTeacherUpdate(action, teacherData) {
        this.emit('teacher-update', {
            action,
            ...teacherData,
            timestamp: new Date().toISOString()
        });
    }

    emitAttendanceUpdate(data) {
        this.emit('attendance-update', {
            ...data,
            timestamp: new Date().toISOString()
        });
    }

    emitCurriculumUpdate(curriculum) {
        const curriculumNames = {
            'cbc': 'CBC',
            '844': '8-4-4',
            'british': 'British',
            'american': 'American'
        };
        
        this.emit('curriculum-update', {
            curriculum,
            curriculumName: curriculumNames[curriculum] || curriculum,
            timestamp: new Date().toISOString()
        });
    }

    emitDutyCheckin(teacherId, location) {
        this.emit('duty-checkin', {
            teacherId,
            location,
            timestamp: new Date().toISOString()
        });
    }

    emitDutyCheckout(teacherId, location) {
        this.emit('duty-checkout', {
            teacherId,
            location,
            timestamp: new Date().toISOString()
        });
    }

    emitMessage(receiverId, content) {
        this.emit('send-message', {
            receiverId,
            content,
            timestamp: new Date().toISOString()
        });
    }

    isConnected() {
        return this.socket && this.socket.connected;
    }
}

export const realtime = new RealtimeManager();