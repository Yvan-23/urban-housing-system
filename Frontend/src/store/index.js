import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import repositoryReducer from './repositorySlice';
import simulationReducer from './simulationSlice';
import collaborationReducer from './collaborationSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    repository: repositoryReducer,
    simulation: simulationReducer,
    collaboration: collaborationReducer,
  },
});

export default store;
