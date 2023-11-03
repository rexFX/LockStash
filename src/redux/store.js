import { configureStore } from '@reduxjs/toolkit';
import filesReducer from './features/files-slice';

export const store = configureStore({
  reducer: {
    filesReducer,
  },
});
