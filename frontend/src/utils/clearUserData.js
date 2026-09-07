// This script clears all user session data from localStorage and sessionStorage
// Run this before deploying to clear any logged-in user sessions

export const clearAllUserData = () => {
  try {
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('email');
    localStorage.removeItem('userId');
    
    // Clear sessionStorage
    sessionStorage.clear();
    
    // Clear all localStorage
    localStorage.clear();
    
    console.log('✅ All user data cleared from browser storage');
    
    // Redirect to login page
    window.location.href = '/login';
  } catch (error) {
    console.error('Error clearing user data:', error);
  }
};

// Optional: Add this to index.html or App.jsx if you want auto-cleanup on page load
// clearAllUserData();
