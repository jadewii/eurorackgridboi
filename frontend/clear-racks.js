// Script to clear all modules from racks in rack-shop.html
document.addEventListener('DOMContentLoaded', function() {
    // Remove all modules from every slot
    document.querySelectorAll('.module-slot').forEach(slot => {
        // Clear the module data
        slot.removeAttribute('data-module');
        slot.classList.remove('occupied', 'powered', 'user-owned');
        
        // Clear the content but preserve the slot structure
        slot.innerHTML = '';
        
        // Add empty slot styling if needed
        slot.style.background = 'transparent';
    });
    
    // Update all module counts to 0
    document.querySelectorAll('.case-name span').forEach(span => {
        if (span.textContent.includes('modules]')) {
            span.textContent = '[0 modules]';
        }
    });
    
    // Add case customization UI
    addCaseCustomization();
});

function addCaseCustomization() {
    // Add case style selector to each rack
    document.querySelectorAll('.rack-wrapper').forEach(rack => {
        if (!rack.querySelector('.case-style-selector')) {
            const styleSelector = document.createElement('div');
            styleSelector.className = 'case-style-selector';
            styleSelector.style.cssText = `
                position: absolute;
                top: -30px;
                right: 10px;
                display: flex;
                gap: 5px;
                align-items: center;
                font-size: 12px;
            `;
            
            styleSelector.innerHTML = `
                <label>Style:</label>
                <select onchange="changeCaseStyle(this)" style="
                    padding: 2px 5px;
                    border: 1px solid #ccc;
                    border-radius: 3px;
                    font-size: 12px;
                    background: white;
                ">
                    <option value="default">Default</option>
                    <option value="slim">Slim</option>
                    <option value="thick">Thick Border</option>
                    <option value="rounded">Rounded</option>
                    <option value="industrial">Industrial</option>
                </select>
            `;
            
            rack.style.position = 'relative';
            rack.appendChild(styleSelector);
        }
    });
}

// Function to change case style
window.changeCaseStyle = function(select) {
    const rack = select.closest('.rack-wrapper');
    const eurorack = rack.querySelector('.eurorack');
    const style = select.value;
    
    // Remove all style classes
    eurorack.classList.remove('style-slim', 'style-thick', 'style-rounded', 'style-industrial');
    
    // Apply new style
    switch(style) {
        case 'slim':
            eurorack.style.border = '1px solid #000';
            eurorack.style.borderRadius = '0';
            break;
        case 'thick':
            eurorack.style.border = '8px solid #000';
            eurorack.style.borderRadius = '0';
            break;
        case 'rounded':
            eurorack.style.border = '4px solid #000';
            eurorack.style.borderRadius = '15px';
            break;
        case 'industrial':
            eurorack.style.border = '6px solid #444';
            eurorack.style.borderRadius = '0';
            eurorack.style.boxShadow = 'inset 0 0 10px rgba(0,0,0,0.3)';
            break;
        default:
            eurorack.style.border = '4px solid #000';
            eurorack.style.borderRadius = '0';
            eurorack.style.boxShadow = 'none';
    }
}

// Make sure the existing color change function still works
if (!window.changeCaseColor) {
    window.changeCaseColor = function(swatch, color) {
        const caseEl = swatch.closest('.rack-wrapper').querySelector('.eurorack');
        if (caseEl) {
            caseEl.style.backgroundColor = color;
        }
    }
}

console.log('🛒 Rack Shop initialized with empty racks!');