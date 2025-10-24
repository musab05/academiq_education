// Helper to check if a menu item is active
export const isMenuActive = (itemLink, itemName, currentPath) => {
  // Direct match
  if (currentPath === itemLink) return true;
  
  // Path starts with link (for nested routes)
  if (itemLink && currentPath.startsWith(itemLink) && itemLink !== '/') return true;
  
  // Special cases for parent menus
  if (itemName === 'User Management') {
    return currentPath.startsWith('/users') || currentPath.startsWith('/teams');
  }
  
  if (itemName === 'Course Management') {
    return currentPath.startsWith('/courses') || 
           currentPath.startsWith('/categories') || 
           currentPath === '/create';
  }
  
  if (itemName === 'Institutes') {
    return currentPath.startsWith('/institutes');
  }
  
  return false;
};

// Helper to check if a submenu item is active
export const isSubmenuActive = (subLink, currentPath) => {
  // Exact match
  if (currentPath === subLink) return true;
  
  // Special case for courses and create
  if (subLink === '/courses' && currentPath === '/create') return true;
  
  // Enrollment and report routes
  if (subLink.includes('/enrollments') && currentPath.includes('/enrollments')) return true;
  if (subLink.includes('/reports') && currentPath.includes('/reports')) return true;
  
  return false;
};
