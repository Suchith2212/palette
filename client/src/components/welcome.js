const video = document.getElementById('welcome-video');
const splash = document.getElementById('splash-screen');

// When the video ends, fade out the splash screen
video.onended = function() {
    splash.classList.add('hidden');
    
    // Optional: Completely remove from DOM after fade finishes (0.8s)
    setTimeout(() => {
        splash.style.display = 'none';
    }, 800);
};  