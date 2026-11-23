import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from './api';

// Async Thunks
export const fetchWorkspaces = createAsyncThunk('collaboration/fetchWorkspaces', async (_, thunkAPI) => {
  try {
    const response = await api.get('/api/collaboration/workspaces');
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data || error.message);
  }
});

export const createWorkspace = createAsyncThunk('collaboration/createWorkspace', async ({ name, description }, thunkAPI) => {
  try {
    const response = await api.post('/api/collaboration/workspaces', { name, description });
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data || error.message);
  }
});

export const fetchComments = createAsyncThunk('collaboration/fetchComments', async (workspaceId, thunkAPI) => {
  try {
    const url = workspaceId ? `/api/collaboration/comments?workspaceId=${workspaceId}` : '/api/collaboration/comments';
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data || error.message);
  }
});

export const addComment = createAsyncThunk('collaboration/addComment', async ({ workspaceId, text }, thunkAPI) => {
  try {
    const response = await api.post('/api/collaboration/comments', { workspaceId, text });
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data || error.message);
  }
});

export const fetchReports = createAsyncThunk('collaboration/fetchReports', async (_, thunkAPI) => {
  try {
    const response = await api.get('/api/reports');
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data || error.message);
  }
});

export const generateReport = createAsyncThunk('collaboration/generateReport', async ({ name, format }, thunkAPI) => {
  try {
    const response = await api.post('/api/reports/generate', { title: name, format });
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data || error.message);
  }
});

const collaborationSlice = createSlice({
  name: 'collaboration',
  initialState: {
    workspaces: [],
    comments: [],
    reports: [],
    activeWorkspaceId: null,
    loading: false,
    error: null
  },
  reducers: {
    setActiveWorkspace: (state, action) => {
      state.activeWorkspaceId = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Workspaces
      .addCase(fetchWorkspaces.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchWorkspaces.fulfilled, (state, action) => {
        state.loading = false;
        state.workspaces = action.payload.map(w => ({
          id: w.id,
          name: w.name,
          description: w.description,
          owner: w.createdBy ? w.createdBy.name : 'System Admin',
          members: 5 // mock value for display
        }));
        if (state.workspaces.length > 0 && !state.activeWorkspaceId) {
          state.activeWorkspaceId = state.workspaces[0].id;
        }
      })
      .addCase(fetchWorkspaces.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createWorkspace.fulfilled, (state, action) => {
        const w = action.payload;
        state.workspaces.push({
          id: w.id,
          name: w.name,
          description: w.description,
          owner: w.createdBy ? w.createdBy.name : 'System Admin',
          members: 1
        });
        state.activeWorkspaceId = w.id;
      })
      // Comments
      .addCase(fetchComments.fulfilled, (state, action) => {
        state.comments = action.payload.map(c => ({
          id: c.id,
          workspaceId: c.workspaceId,
          user: c.user,
          role: c.role,
          text: c.text,
          timestamp: c.timestamp
        }));
      })
      .addCase(addComment.fulfilled, (state, action) => {
        const c = action.payload;
        state.comments.push({
          id: c.id,
          workspaceId: c.workspaceId,
          user: c.user,
          role: c.role,
          text: c.text,
          timestamp: c.timestamp
        });
      })
      // Reports
      .addCase(fetchReports.fulfilled, (state, action) => {
        state.reports = action.payload.map(r => ({
          id: r.id,
          name: r.title,
          type: 'Ad-hoc Summary',
          format: r.format,
          generatedBy: r.generatedBy,
          date: r.createdDate,
          size: '1.2 MB'
        }));
      })
      .addCase(generateReport.fulfilled, (state, action) => {
        const r = action.payload;
        state.reports.unshift({
          id: r.id,
          name: r.title,
          type: 'Ad-hoc Summary',
          format: r.format,
          generatedBy: r.generatedBy,
          date: r.createdDate,
          size: '1.5 MB'
        });
      });
  }
});

export const { setActiveWorkspace } = collaborationSlice.actions;
export default collaborationSlice.reducer;
