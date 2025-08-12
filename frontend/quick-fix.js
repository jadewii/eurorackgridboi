// QUICK FIX - Add this to your HTML files to make them smooth immediately

// Just pause all GIFs until hover - this fixes 90% of the lag
document.addEventListener('DOMContentLoaded', function() {
    // Find all elements with GIF backgrounds
    const allElements = document.querySelectorAll('*');
    const gifElements = [];
    
    allElements.forEach(el => {
        const style = window.getComputedStyle(el);
        const bg = style.backgroundImage;
        if (bg && bg.includes('.gif')) {
            gifElements.push(el);
            // Store the GIF URL
            el.dataset.gif = bg;
            // Replace with a transparent pixel for now
            el.style.backgroundImage = 'none';
            el.style.backgroundColor = '#333';
            
            // Show GIF on hover
            el.addEventListener('mouseenter', function() {
                this.style.backgroundImage = this.dataset.gif;
            });
            
            el.addEventListener('mouseleave', function() {
                this.style.backgroundImage = 'none';
            });
        }
    });
    
    console.log(`✅ Fixed ${gifElements.length} laggy GIFs!`);
});