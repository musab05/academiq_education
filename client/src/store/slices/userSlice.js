import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  token: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserSession: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
    },
    clearUserSession: state => {
      state.user = null;
      state.token = null;
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
    },
    logout: state => {
      state.user = null;
      state.token = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
  },
});

export const { setUserSession, clearUserSession, updateUser, logout } = userSlice.actions;
export default userSlice.reducer;
