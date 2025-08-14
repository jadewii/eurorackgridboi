// Power-Up Animations for Racks
document.addEventListener('DOMContentLoaded', function() {
    
    // Add power control buttons to each rack
    function addPowerControls() {
        const racks = document.querySelectorAll('.rack-grid');
        
        racks.forEach(rack => {
            if (rack.querySelector('.power-controls')) return; // Already added
            
            const controls = document.createElement('div');
            controls.className = 'power-controls';
            controls.style.cssText = `
                position: absolute;
                top: -40px;
                right: 0;
                display: flex;
                gap: 10px;
                z-index: 100;
            `;
            
            controls.innerHTML = `
                <button class="power-btn" onclick="powerOneByOne(this)" style="
                    background: #00ff00;
                    color: black;
                    border: none;
                    padding: 5px 10px;
                    border-radius: 5px;
                    cursor: pointer;
                    font-size: 12px;
                    font-weight: bold;
                ">⚡ Power Up</button>
                
                <button class="power-btn" onclick="cascadePower(this)" style="
                    background: linear-gradient(45deg, #00ff00, #00ffff);
                    color: black;
                    border: none;
                    padding: 5px 10px;
                    border-radius: 5px;
                    cursor: pointer;
                    font-size: 12px;
                    font-weight: bold;
                ">🌊 Wave</button>
                
                <button class="power-btn" onclick="randomPower(this)" style="
                    background: linear-gradient(45deg, #ff00ff, #ffff00);
                    color: black;
                    border: none;
                    padding: 5px 10px;
                    border-radius: 5px;
                    cursor: pointer;
                    font-size: 12px;
                    font-weight: bold;
                ">🎲 Random</button>
            `;
            
            rack.parentElement.style.position = 'relative';
            rack.parentElement.insertBefore(controls, rack);
        });
    }
    
    // Power up modules one by one
    window.powerOneByOne = function(button) {
        const rack = button.closest('.rack-with-accessories').querySelector('.rack-grid');
        const modules = rack.querySelectorAll('.module-slot');
        
        modules.forEach((module, index) => {
            setTimeout(() => {
                module.style.transition = 'all 0.3s ease';
                module.style.transform = 'scale(0.95)';
                module.style.opacity = '0';
                
                setTimeout(() => {
                    module.style.transform = 'scale(1)';
                    module.style.opacity = '1';
                    module.style.boxShadow = '0 0 20px rgba(0, 255, 0, 0.8)';
                    
                    // Add power indicator
                    if (!module.querySelector('.power-indicator')) {
                        const indicator = document.createElement('div');
                        indicator.className = 'power-indicator';
                        indicator.innerHTML = '⚡';
                        indicator.style.cssText = `
                            position: absolute;
                            top: 5px;
                            right: 5px;
                            background: rgba(0, 255, 0, 0.9);
                            color: black;
                            width: 20px;
                            height: 20px;
                            border-radius: 50%;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            font-size: 12px;
                            animation: pulse 2s infinite;
                            z-index: 10;
                        `;
                        module.appendChild(indicator);
                    }
                    
                    setTimeout(() => {
                        module.style.boxShadow = '0 0 10px rgba(0, 255, 0, 0.3)';
                    }, 300);
                }, 150);
            }, index * 50);
        });
    };
    
    // Cascade power effect
    window.cascadePower = function(button) {
        const rack = button.closest('.rack-with-accessories').querySelector('.rack-grid');
        const modules = Array.from(rack.querySelectorAll('.module-slot'));
        const cols = parseInt(getComputedStyle(rack).gridTemplateColumns.split(' ').length);
        
        // Group modules by column
        modules.forEach((module, index) => {
            const col = index % cols;
            const delay = col * 100;
            
            setTimeout(() => {
                module.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
                module.style.transform = 'translateY(-5px) scale(1.05)';
                module.style.filter = 'brightness(1.3)';
                module.style.boxShadow = '0 10px 30px rgba(0, 255, 255, 0.6)';
                
                setTimeout(() => {
                    module.style.transform = 'translateY(0) scale(1)';
                    module.style.filter = 'brightness(1)';
                    module.style.boxShadow = '0 0 15px rgba(0, 255, 255, 0.3)';
                }, 500);
            }, delay);
        });
    };
    
    // Random power effect
    window.randomPower = function(button) {
        const rack = button.closest('.rack-with-accessories').querySelector('.rack-grid');
        const modules = Array.from(rack.querySelectorAll('.module-slot'));
        
        // Shuffle array
        const shuffled = modules.sort(() => Math.random() - 0.5);
        
        shuffled.forEach((module, index) => {
            setTimeout(() => {
                const colors = ['#00ff00', '#ff00ff', '#00ffff', '#ffff00', '#ff00ff'];
                const color = colors[Math.floor(Math.random() * colors.length)];
                
                module.style.transition = 'all 0.3s ease';
                module.style.transform = 'rotate(180deg) scale(0)';
                
                setTimeout(() => {
                    module.style.transform = 'rotate(360deg) scale(1)';
                    module.style.boxShadow = `0 0 25px ${color}`;
                    module.style.border = `2px solid ${color}`;
                    
                    setTimeout(() => {
                        module.style.boxShadow = `0 0 10px ${color}`;
                    }, 300);
                }, 200);
            }, index * 30);
        });
    };
    
    // Add pulse animation if not exists
    if (!document.querySelector('#pulse-animation')) {
        const style = document.createElement('style');
        style.id = 'pulse-animation';
        style.textContent = `
            @keyframes pulse {
                0%, 100% { 
                    opacity: 1; 
                    transform: scale(1); 
                }
                50% { 
                    opacity: 0.7; 
                    transform: scale(1.2); 
                }
            }
            
            .module-slot {
                position: relative;
                transition: all 0.3s ease;
            }
            
            .module-slot.powered {
                animation: subtle-glow 3s infinite;
            }
            
            @keyframes subtle-glow {
                0%, 100% { 
                    filter: brightness(1); 
                }
                50% { 
                    filter: brightness(1.1); 
                }
            }
            
            .power-controls button:hover {
                transform: scale(1.1);
                box-shadow: 0 0 20px currentColor;
            }
        `;
        document.head.appendChild(style);
    }
    
    // Initialize power controls
    setTimeout(addPowerControls, 100);
    
    // User inventory tracking mockup
    window.userInventory = {
        modules: [
            'Function Synthesizer',
            'Honduh', 
            'Physical Modeler',
            'Complex Oscillator',
            'Cephalopod'
        ],
        jamnutz: 1337,
        subscription: 'monthly',
        
        owns: function(moduleName) {
            return this.modules.includes(moduleName);
        },
        
        addModule: function(moduleName) {
            if (!this.modules.includes(moduleName)) {
                this.modules.push(moduleName);
                console.log(`✅ Added ${moduleName} to inventory`);
            }
        },
        
        spendJamnutz: function(amount) {
            if (this.jamnutz >= amount) {
                this.jamnutz -= amount;
                console.log(`🥜 Spent ${amount} jamnutz. Balance: ${this.jamnutz}`);
                return true;
            }
            console.log(`❌ Not enough jamnutz! Need ${amount}, have ${this.jamnutz}`);
            return false;
        }
    };
    
    // Check module ownership
    document.querySelectorAll('.module-slot').forEach(module => {
        const moduleName = module.getAttribute('data-module');
        
        if (!window.userInventory.owns(moduleName)) {
            // Add purchase prompt
            module.style.cursor = 'pointer';
            module.onclick = function() {
                if (confirm(`Purchase "${moduleName}" for 500 jamnutz or $5?`)) {
                    if (window.userInventory.spendJamnutz(500)) {
                        window.userInventory.addModule(moduleName);
                        alert(`✅ You now own ${moduleName}!`);
                        module.onclick = null;
                    }
                }
            };
        }
    });
    
    console.log('Power animations loaded! User owns', window.userInventory.modules.length, 'modules');
});