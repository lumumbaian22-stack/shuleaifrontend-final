// js/ui/components/Form.js
export const Form = {
    create(fields, onSubmit, options = {}) {
        const form = document.createElement('form');
        form.className = `space-y-4 ${options.className || ''}`;
        
        fields.forEach(field => {
            const fieldGroup = document.createElement('div');
            
            if (field.label) {
                const label = document.createElement('label');
                label.className = 'block text-sm font-medium mb-1';
                label.textContent = field.label;
                if (field.required) {
                    const required = document.createElement('span');
                    required.className = 'text-red-500 ml-1';
                    required.textContent = '*';
                    label.appendChild(required);
                }
                fieldGroup.appendChild(label);
            }
            
            let input;
            if (field.type === 'select') {
                input = document.createElement('select');
                input.className = 'w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none';
                field.options.forEach(opt => {
                    const option = document.createElement('option');
                    option.value = opt.value;
                    option.textContent = opt.label;
                    if (opt.value === field.value) option.selected = true;
                    input.appendChild(option);
                });
            } else if (field.type === 'textarea') {
                input = document.createElement('textarea');
                input.className = 'w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none';
                input.rows = field.rows || 3;
                input.value = field.value || '';
            } else {
                input = document.createElement('input');
                input.type = field.type || 'text';
                input.className = 'w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none';
                input.value = field.value || '';
                if (field.placeholder) input.placeholder = field.placeholder;
            }
            
            input.id = field.id || `field-${Math.random().toString(36).substr(2, 9)}`;
            input.name = field.name || field.id;
            if (field.required) input.required = true;
            
            fieldGroup.appendChild(input);
            
            if (field.help) {
                const help = document.createElement('p');
                help.className = 'text-xs text-muted-foreground mt-1';
                help.textContent = field.help;
                fieldGroup.appendChild(help);
            }
            
            form.appendChild(fieldGroup);
        });
        
        const buttonGroup = document.createElement('div');
        buttonGroup.className = 'flex justify-end gap-2 pt-4 border-t';
        
        if (options.cancelText) {
            const cancelBtn = document.createElement('button');
            cancelBtn.type = 'button';
            cancelBtn.className = 'px-4 py-2 text-sm border rounded-lg hover:bg-accent transition-colors';
            cancelBtn.textContent = options.cancelText;
            cancelBtn.addEventListener('click', options.onCancel);
            buttonGroup.appendChild(cancelBtn);
        }
        
        const submitBtn = document.createElement('button');
        submitBtn.type = 'submit';
        submitBtn.className = 'px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors';
        submitBtn.textContent = options.submitText || 'Submit';
        buttonGroup.appendChild(submitBtn);
        
        form.appendChild(buttonGroup);
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            const data = {};
            fields.forEach(field => {
                const name = field.name || field.id;
                if (name) {
                    data[name] = formData.get(name);
                }
            });
            await onSubmit(data, form);
        });
        
        return form;
    }
};

window.Form = Form;