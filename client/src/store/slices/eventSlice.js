import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  events: [],
  currentEvent: null,
  loading: false,
  error: null,
};

const eventSlice = createSlice({
  name: "event",
  initialState,
  reducers: {
    setEvents: (state, action) => {
      state.events = action.payload;
      state.loading = false;
      state.error = null;
    },
    setCurrentEvent: (state, action) => {
      state.currentEvent = action.payload;
    },
    updateEvent: (state, action) => {
      const updatedEvent = action.payload;
      const index = state.events.findIndex(
        (event) => event._id === updatedEvent._id
      );
      if (index !== -1) {
        state.events[index] = updatedEvent;
      }
      if (state.currentEvent && state.currentEvent._id === updatedEvent._id) {
        state.currentEvent = updatedEvent;
      }
    },
    addEvent: (state, action) => {
      state.events.push(action.payload);
    },
    removeEvent: (state, action) => {
      const eventId = action.payload;
      state.events = state.events.filter((event) => event._id !== eventId);
      if (state.currentEvent && state.currentEvent._id === eventId) {
        state.currentEvent = null;
      }
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearCurrentEvent: (state) => {
      state.currentEvent = null;
    },
    clearEvents: (state) => {
      state.events = [];
      state.currentEvent = null;
      state.loading = false;
      state.error = null;
    },
  },
});

export const {
  setEvents,
  setCurrentEvent,
  updateEvent,
  addEvent,
  removeEvent,
  setLoading,
  setError,
  clearCurrentEvent,
  clearEvents,
} = eventSlice.actions;

export default eventSlice.reducer;