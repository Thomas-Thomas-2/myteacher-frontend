import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  value: [],
};

export const studentSlice = createSlice({
  name: "students",
  initialState,
  reducers: {
    getStudents: (state, action) => {
      state.value = action.payload;
    },
    addStudentToStore: (state, action) => {
      if (!state.value.some((e) => e.id === action.payload.id)) {
        state.value.push(action.payload);
      }
    },
    updateStudentStatus: (state, action) => {
      // mettre à jour le statut d'un étudiant en le retrouvant grâce à son id
      const index = state.value.findIndex((e) => e.id === action.payload.id);
      if (index !== -1) {
        state.value[index].status = action.payload.status;
      }
    },
  },
});

export const { getStudents, addStudentToStore, updateStudentStatus } =
  studentSlice.actions;
export default studentSlice.reducer;
