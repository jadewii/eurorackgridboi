// Add click handler to profile avatar to navigate to MY STUDIO
document.addEventListener('DOMContentLoaded', function() {
    // Find profile avatar element
    const profileAvatar = document.querySelector('.profile-avatar-wrapper');
    if (profileAvatar) {
        profileAvatar.style.cursor = 'pointer';
        profileAvatar.onclick = function() {
            window.location.href = 'my-studio.html';
        };
    }
    
    // Also handle the profile avatar itself
    const avatar = document.querySelector('.profile-avatar');
    if (avatar) {
        avatar.style.cursor = 'pointer';
        avatar.onclick = function(e) {
            e.stopPropagation();
            window.location.href = 'my-studio.html';
        };
    }
});