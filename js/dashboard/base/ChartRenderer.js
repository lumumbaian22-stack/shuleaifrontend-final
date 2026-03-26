// js/dashboard/base/ChartRenderer.js
export const ChartRenderer = {
    render(container, data, type = 'line') {
        if (!container || !data) return null;
        
        const canvas = document.createElement('canvas');
        container.appendChild(canvas);
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;
        
        const chart = new Chart(ctx, {
            type: type,
            data: {
                labels: data.labels || [],
                datasets: [{
                    label: data.label || 'Data',
                    data: data.values || [],
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });
        
        return chart;
    },
    
    destroy(chart) {
        if (chart && chart.destroy) chart.destroy();
    }
};
