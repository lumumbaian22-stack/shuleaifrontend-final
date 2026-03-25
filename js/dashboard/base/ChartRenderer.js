// js/dashboard/base/ChartRenderer.js
const ChartRenderer = {
    render(container, chartData, type = 'line') {
        if (!container || !chartData) return null;
        
        const canvas = document.createElement('canvas');
        canvas.id = `chart-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        container.appendChild(canvas);
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;
        
        const config = this.getChartConfig(chartData, type);
        const chart = new Chart(ctx, config);
        
        return chart;
    },

    getChartConfig(data, type) {
        const configs = {
            line: {
                type: 'line',
                data: {
                    labels: data.labels || [],
                    datasets: [{
                        label: data.label || 'Data',
                        data: data.values || [],
                        borderColor: '#3b82f6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        tension: 0.4,
                        fill: true,
                        pointBackgroundColor: '#3b82f6',
                        pointBorderColor: '#fff',
                        pointRadius: 4,
                        pointHoverRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false } },
                    scales: {
                        y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } },
                        x: { grid: { display: false } }
                    }
                }
            },
            doughnut: {
                type: 'doughnut',
                data: {
                    labels: data.labels || [],
                    datasets: [{
                        data: data.values || [],
                        backgroundColor: ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec489a', '#6366f1'],
                        borderWidth: 0,
                        hoverOffset: 10
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '65%',
                    plugins: {
                        legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20 } },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const label = context.label || '';
                                    const value = context.raw || 0;
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = Math.round((value / total) * 100);
                                    return `${label}: ${value} (${percentage}%)`;
                                }
                            }
                        }
                    }
                }
            },
            bar: {
                type: 'bar',
                data: {
                    labels: data.labels || [],
                    datasets: [{
                        label: data.label || 'Data',
                        data: data.values || [],
                        backgroundColor: '#3b82f6',
                        borderRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } },
                        x: { grid: { display: false } }
                    }
                }
            },
            radar: {
                type: 'radar',
                data: {
                    labels: data.labels || [],
                    datasets: [{
                        label: data.label || 'Data',
                        data: data.values || [],
                        backgroundColor: 'rgba(59, 130, 246, 0.2)',
                        borderColor: '#3b82f6',
                        pointBackgroundColor: '#3b82f6',
                        pointBorderColor: '#fff',
                        pointRadius: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: { r: { beginAtZero: true, max: 100, ticks: { stepSize: 20 } } }
                }
            }
        };
        
        return configs[type] || configs.line;
    },

    updateTheme(chart, isDark) {
        if (!chart || !chart.options) return;
        
        const gridColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)';
        const textColor = isDark ? '#94a3b8' : '#64748b';
        
        if (chart.options.scales) {
            if (chart.options.scales.y) {
                if (chart.options.scales.y.grid) chart.options.scales.y.grid.color = gridColor;
                if (chart.options.scales.y.ticks) chart.options.scales.y.ticks.color = textColor;
            }
            if (chart.options.scales.x) {
                if (chart.options.scales.x.ticks) chart.options.scales.x.ticks.color = textColor;
            }
        }
        
        if (chart.options.plugins?.legend?.labels) {
            chart.options.plugins.legend.labels.color = textColor;
        }
        
        chart.update();
    },

    destroy(chart) {
        if (chart && chart.destroy) {
            chart.destroy();
        }
    }
};

window.ChartRenderer = ChartRenderer;