// js/ui/components/Input.js
export const Input = {
    create(type = 'text', options = {}) {
        const input = document.createElement('input');
        input.type = type;
        input.className = `w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none ${options.className || ''}`;
        
        if (options.id) input.id = options.id;
        if (options.name) input.name = options.name;
        if (options.value) input.value = options.value;
        if (options.placeholder) input.placeholder = options.placeholder;
        if (options.required) input.required = true;
        if (options.disabled) input.disabled = true;
        if (options.readonly) input.readOnly = true;
        if (options.min) input.min = options.min;
        if (options.max) input.max = options.max;
        if (options.step) input.step = options.step;
        
        if (options.onChange) {
            input.addEventListener('change', options.onChange);
        }
        
        if (options.onInput) {
            input.addEventListener('input', options.onInput);
        }
        
        return input;
    }
};

window.Input = Input;