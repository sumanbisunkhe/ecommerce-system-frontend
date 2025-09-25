export function logout() {
  // Clear authentication cookies
  document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  document.cookie = 'user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  
  // Redirect to login page
  window.location.href = '/login';
}

export function getAuthUser() {
  // Get user from cookies
  const userCookie = document.cookie
    .split('; ')
    .find(row => row.startsWith('user='))
    ?.split('=')[1];
  
  if (userCookie) {
    try {
      return JSON.parse(decodeURIComponent(userCookie));
    } catch {
      return null;
    }
  }
  
  return null;
}

export function getAuthToken() {
  // Get token from cookies
  const tokenCookie = document.cookie
    .split('; ')
    .find(row => row.startsWith('token='))
    ?.split('=')[1];
  
  return tokenCookie || null;
}