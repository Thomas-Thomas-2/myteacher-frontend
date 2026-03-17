import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  value: [],
};

export const planningSlice = createSlice({
  name: "planning",
  initialState,
  reducers: {
    getEvents: (state, action) => {
      state.value = action.payload;
    },
    addEventToStore: (state, action) => {
      if (!state.value.some((e) => e.id === action.payload.id)) {
        state.value.push(action.payload);
      }
    },
    removeEventFromStore: (state, action) => {
      state.value = state.value.filter((e) => e.id !== action.payload.id);
    },
  },
});

export const { getEvents, addEventToStore, removeEventFromStore } =
  planningSlice.actions;
export default planningSlice.reducer;
