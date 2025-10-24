export const saveUserSession = (token, user) => {
  sessionStorage.setItem('auth_token', token);
  sessionStorage.setItem('user', JSON.stringify(user));
};

export const getUserSession = () => {
  const token = sessionStorage.getItem('auth_token');
  const user = sessionStorage.getItem('user');
  return token && user ? { token, user: JSON.parse(user) } : null;
};

export const clearUserSession = () => {
  sessionStorage.removeItem('auth_token');
  sessionStorage.removeItem('user');
};
