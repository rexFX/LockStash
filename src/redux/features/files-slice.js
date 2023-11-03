import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  myFiles: [],
};

export const uploadedFiles = createSlice({
  name: 'uploadedFiles',
  initialState,
  reducers: {
    clear: (state) => {
      state = initialState;
    },
    add: (state, action) => {
      state.myFiles.push(action.payload);
    },
    initialize: (state, action) => {
      state.myFiles = action.payload;
      console.log(state.myFiles);
    },
  },
});

export const { clear, add, initialize } = uploadedFiles.actions;
export default uploadedFiles.reducer;
