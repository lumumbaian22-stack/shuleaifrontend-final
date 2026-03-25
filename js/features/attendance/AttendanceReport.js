// js/features/attendance/AttendanceReport.js
import { apiClient } from '../../api/client.js';
import { ChartRenderer } from '../../dashboard/base/ChartRenderer.js';
import { formatDate } from '../../core/utils.js';

export const attendanceReport = {
    async loadStudentAttendance(studentId) {
        try {
            const response = await apiClient.get(`/api/student/attendance?studentId=${studentId}`);
            return response.data || [];
        } catch (error) {
            console.error('Failed to load attendance:', error);
            return [];
        }
    },
    
    async loadClassAttendance(classId, period = 'month') {
        try {
            const response = await apiClient.get(`/api/attendance/class/${classId}?period=${period}`);
            return response.data || [];
        } catch (error) {
            console.error('Failed to load class attendance:', error);
            return [];
        }
    },
    
    renderAttendanceChart(containerId, attendanceRecords, title = 'Attendance Trends') {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        if (!attendanceRecords || attendanceRecords.length === 0) {
            container.innerHTML = '<p class="text-center text-muted-foreground py-8">No attendance data available</p>';
            return;
        }
        
        // Group by date
        const dateMap = {};
        attendanceRecords.forEach(record => {
            const date = record.date;
            if (!dateMap[date]) {
                dateMap[date] = { present: 0, absent: 0, late: 0, sick: 0, total: 0 };
            }
            dateMap[date][record.status]++;
            dateMap[date].total++;
        });
        
        const dates = Object.keys(dateMap).sort();
        const presentRates = dates.map(d => Math.round((dateMap[d].present / dateMap[d].total) * 100));
        const absentRates = dates.map(d => Math.round((dateMap[d].absent / dateMap[d].total) * 100));
        
        container.innerHTML = '<div class="chart-container h-64" id="attendance-chart-canvas"></div>';
        const chartContainer = document.getElementById('attendance-chart-canvas');
        
        const chartData = {
            labels: dates.map(d => formatDate(d)),
            datasets: [
                {
                    label: 'Present %',
                    data: presentRates,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Absent %',
                    data: absentRates,
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    tension: 0.4,
                    fill: true
                }
            ]
        };
        
        if (this.chart) {
            ChartRenderer.destroy(this.chart);
        }
        
        this.chart = new Chart(chartContainer, {
            type: 'line',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    tooltip: { mode: 'index', intersect: false },
                    legend: { position: 'bottom' }
                },
                scales: {
                    y: { beginAtZero: true, max: 100, title: { display: true, text: 'Percentage' } },
                    x: { title: { display: true, text: 'Date' } }
                }
            }
        });
    },
    
    renderAttendanceTable(containerId, attendanceRecords) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        if (!attendanceRecords || attendanceRecords.length === 0) {
            container.innerHTML = '<p class="text-center text-muted-foreground py-8">No attendance records available</p>';
            return;
        }
        
        const statusColors = {
            present: 'bg-green-100 text-green-700',
            absent: 'bg-red-100 text-red-700',
            late: 'bg-yellow-100 text-yellow-700',
            sick: 'bg-blue-100 text-blue-700',
            holiday: 'bg-gray-100 text-gray-700'
        };
        
        container.innerHTML = `
            <div class="overflow-x-auto">
                <table class="w-full text-sm">
                    <thead class="bg-muted/50">
                        <tr>
                            <th class="px-4 py-3 text-left font-medium">Date</th>
                            <th class="px-4 py-3 text-left font-medium">Status</th>
                            <th class="px-4 py-3 text-left font-medium">Reason</th>
                         </thead>
                        <tbody class="divide-y">
                            ${attendanceRecords.map(record => `
                                <tr class="hover:bg-accent/50 transition-colors">
                                    <td class="px-4 py-3">${formatDate(record.date)}</td>
                                    <td class="px-4 py-3">
                                        <span class="px-2 py-1 ${statusColors[record.status] || 'bg-gray-100 text-gray-700'} text-xs rounded-full">
                                            ${record.status}
                                        </span>
                                    </td>
                                    <td class="px-4 py-3">${record.reason || '-'}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
            
            if (typeof lucide !== 'undefined') lucide.createIcons();
        },
        
        renderStudentReport(containerId, studentId, studentName) {
            const container = document.getElementById(containerId);
            if (!container) return;
            
            this.loadStudentAttendance(studentId).then(attendance => {
                const presentCount = attendance.filter(a => a.status === 'present').length;
                const absentCount = attendance.filter(a => a.status === 'absent').length;
                const lateCount = attendance.filter(a => a.status === 'late').length;
                const sickCount = attendance.filter(a => a.status === 'sick').length;
                const total = attendance.length;
                const rate = total > 0 ? Math.round((presentCount / total) * 100) : 0;
                
                container.innerHTML = `
                    <div class="space-y-6">
                        <div class="grid gap-4 md:grid-cols-4">
                            <div class="rounded-xl border bg-card p-4 text-center">
                                <p class="text-2xl font-bold text-green-600">${rate}%</p>
                                <p class="text-xs text-muted-foreground">Attendance Rate</p>
                            </div>
                            <div class="rounded-xl border bg-card p-4 text-center">
                                <p class="text-2xl font-bold text-green-600">${presentCount}</p>
                                <p class="text-xs text-muted-foreground">Present</p>
                            </div>
                            <div class="rounded-xl border bg-card p-4 text-center">
                                <p class="text-2xl font-bold text-red-600">${absentCount}</p>
                                <p class="text-xs text-muted-foreground">Absent</p>
                            </div>
                            <div class="rounded-xl border bg-card p-4 text-center">
                                <p class="text-2xl font-bold text-yellow-600">${lateCount}</p>
                                <p class="text-xs text-muted-foreground">Late</p>
                            </div>
                        </div>
                        <div id="attendance-chart-container"></div>
                        <div id="attendance-table-container"></div>
                    </div>
                `;
                
                this.renderAttendanceChart('attendance-chart-container', attendance, `${studentName || 'Student'} Attendance`);
                this.renderAttendanceTable('attendance-table-container', attendance);
            });
        }
    };
    
    window.attendanceReport = attendanceReport;