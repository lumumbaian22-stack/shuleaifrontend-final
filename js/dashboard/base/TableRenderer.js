// js/dashboard/base/TableRenderer.js
const TableRenderer = {
    render(container, config) {
        if (!container || !config.columns || !config.data) return null;
        
        const { columns, data, id = `table-${Date.now()}`, responsive = true, emptyMessage = 'No data available' } = config;
        
        const wrapper = document.createElement('div');
        wrapper.className = responsive ? 'overflow-x-auto' : '';
        
        const table = document.createElement('table');
        table.id = id;
        table.className = 'w-full text-sm data-table';
        
        // Create header
        const thead = document.createElement('thead');
        thead.className = 'bg-muted/50';
        const headerRow = document.createElement('tr');
        
        columns.forEach(col => {
            const th = document.createElement('th');
            th.className = `px-4 py-3 text-${col.align || 'left'} font-medium`;
            th.textContent = col.label;
            headerRow.appendChild(th);
        });
        
        thead.appendChild(headerRow);
        table.appendChild(thead);
        
        // Create body
        const tbody = document.createElement('tbody');
        tbody.className = 'divide-y';
        
        if (data.length === 0) {
            const tr = document.createElement('tr');
            const td = document.createElement('td');
            td.colSpan = columns.length;
            td.className = 'px-4 py-8 text-center text-muted-foreground';
            td.textContent = emptyMessage;
            tr.appendChild(td);
            tbody.appendChild(tr);
        } else {
            data.forEach((row, index) => {
                const tr = document.createElement('tr');
                tr.className = 'hover:bg-accent/50 transition-colors';
                tr.dataset.rowId = row.id || index;
                
                columns.forEach(col => {
                    const td = document.createElement('td');
                    td.className = `px-4 py-3 text-${col.align || 'left'}`;
                    
                    if (col.dataLabel) {
                        td.setAttribute('data-label', col.dataLabel);
                    }
                    
                    const value = this.getNestedValue(row, col.key);
                    
                    if (col.render) {
                        td.innerHTML = col.render(value, row);
                    } else {
                        td.textContent = value ?? col.defaultValue ?? '';
                    }
                    
                    tr.appendChild(td);
                });
                
                tbody.appendChild(tr);
            });
        }
        
        table.appendChild(tbody);
        wrapper.appendChild(table);
        
        // Clear and append
        container.innerHTML = '';
        container.appendChild(wrapper);
        
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
        
        return table;
    },

    getNestedValue(obj, path) {
        if (!path) return null;
        return path.split('.').reduce((current, key) => current?.[key], obj);
    },

    updateRow(tableId, rowId, newData, columns) {
        const table = document.getElementById(tableId);
        if (!table) return false;
        
        const row = table.querySelector(`tr[data-row-id="${rowId}"]`);
        if (!row) return false;
        
        const cells = row.querySelectorAll('td');
        columns.forEach((col, index) => {
            if (cells[index]) {
                const value = this.getNestedValue(newData, col.key);
                if (col.render) {
                    cells[index].innerHTML = col.render(value, newData);
                } else {
                    cells[index].textContent = value ?? col.defaultValue ?? '';
                }
            }
        });
        
        return true;
    },

    addRow(tableId, rowData, columns) {
        const table = document.getElementById(tableId);
        if (!table) return null;
        
        const tbody = table.querySelector('tbody');
        if (!tbody) return null;
        
        const rowId = rowData.id || Date.now();
        const tr = document.createElement('tr');
        tr.className = 'hover:bg-accent/50 transition-colors';
        tr.dataset.rowId = rowId;
        
        columns.forEach(col => {
            const td = document.createElement('td');
            td.className = `px-4 py-3 text-${col.align || 'left'}`;
            
            if (col.dataLabel) {
                td.setAttribute('data-label', col.dataLabel);
            }
            
            const value = this.getNestedValue(rowData, col.key);
            
            if (col.render) {
                td.innerHTML = col.render(value, rowData);
            } else {
                td.textContent = value ?? col.defaultValue ?? '';
            }
            
            tr.appendChild(td);
        });
        
        tbody.appendChild(tr);
        
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
        
        return tr;
    },

    removeRow(tableId, rowId) {
        const table = document.getElementById(tableId);
        if (!table) return false;
        
        const row = table.querySelector(`tr[data-row-id="${rowId}"]`);
        if (row) row.remove();
        
        return true;
    },

    clear(tableId) {
        const table = document.getElementById(tableId);
        if (!table) return false;
        
        const tbody = table.querySelector('tbody');
        if (tbody) {
            tbody.innerHTML = '';
        }
        
        return true;
    }
};

window.TableRenderer = TableRenderer;