import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  template: null,
  loading: false,
  error: null,
};

const certificateSlice = createSlice({
  name: 'certificate',
  initialState,
  reducers: {
    setTemplate: (state, action) => {
      state.template = action.payload;
      state.error = null;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearTemplate: (state) => {
      state.template = null;
      state.error = null;
    },
  },
});

export const { setTemplate, setLoading, setError, clearTemplate } = certificateSlice.actions;
export default certificateSlice.reducer;
