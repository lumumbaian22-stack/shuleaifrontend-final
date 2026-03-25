// js/ui/components/Select.js
export const Select = {
    create(options, selectedValue = null, optionsConfig = {}) {
        const select = document.createElement('select');
        select.className = `w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none ${optionsConfig.className || ''}`;
        
        if (optionsConfig.id) select.id = optionsConfig.id;
        if (optionsConfig.name) select.name = optionsConfig.name;
        if (optionsConfig.disabled) select.disabled = true;
        if (optionsConfig.required) select.required = true;
        
        if (optionsConfig.placeholder) {
            const placeholderOption = document.createElement('option');
            placeholderOption.value = '';
            placeholderOption.textContent = optionsConfig.placeholder;
            placeholderOption.disabled = true;
            placeholderOption.selected = !selectedValue;
            select.appendChild(placeholderOption);
        }
        
        options.forEach(opt => {
            const option = document.createElement('option');
            option.value = opt.value;
            option.textContent = opt.label;
            if (opt.value === selectedValue) option.selected = true;
            if (opt.disabled) option.disabled = true;
            select.appendChild(option);
        });
        
        if (optionsConfig.onChange) {
            select.addEventListener('change', optionsConfig.onChange);
        }
        
        return select;
    }
};

window.Select = Select;