import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from './api';

// Async Thunks
export const fetchRecords = createAsyncThunk('repository/fetchRecords', async (district, thunkAPI) => {
  try {
    const url = district && district !== 'All' ? `/api/housing?district=${district}` : '/api/housing';
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    const message = error.response?.data || error.message || 'Failed to fetch records';
    return thunkAPI.rejectWithValue(message);
  }
});

export const uploadDataset = createAsyncThunk('repository/uploadDataset', async ({ file, uploadedBy }, thunkAPI) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    if (uploadedBy) {
      formData.append('uploadedBy', uploadedBy);
    }
    const response = await api.post('/api/housing/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return {
      filename: file.name,
      size: (file.size / 1024).toFixed(1) + ' KB',
      uploadedBy: uploadedBy || 'Unknown',
      records: response.data
    };
  } catch (error) {
    const message = error.response?.data || error.message || 'Failed to upload dataset';
    return thunkAPI.rejectWithValue(message);
  }
});

export const clearRecords = createAsyncThunk('repository/clearRecords', async (_, thunkAPI) => {
  try {
    await api.delete('/api/housing/clear');
    return [];
  } catch (error) {
    const message = error.response?.data || error.message || 'Failed to clear records';
    return thunkAPI.rejectWithValue(message);
  }
});

export const addRecord = createAsyncThunk('repository/addRecord', async (record, thunkAPI) => {
  try {
    const response = await api.post('/api/housing', record);
    return response.data;
  } catch (error) {
    const message = error.response?.data || error.message || 'Failed to add record';
    return thunkAPI.rejectWithValue(message);
  }
});

const repositorySlice = createSlice({
  name: 'repository',
  initialState: {
    records: [],
    datasets: [],
    filters: {
      search: '',
      district: 'All',
      type: 'All',
      status: 'All'
    },
    loading: false,
    error: null
  },
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = {
        search: '',
        district: 'All',
        type: 'All',
        status: 'All'
      };
    },
    deleteDataset: (state, action) => {
      state.datasets = state.datasets.filter(d => d.id !== action.payload);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRecords.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchRecords.fulfilled, (state, action) => {
        state.loading = false;
        state.records = action.payload;
        
        // Dynamically compute datasets from fetched records
        const versions = {};
        action.payload.forEach(r => {
          const version = r.datasetVersion || 1;
          if (!versions[version]) {
            versions[version] = {
              count: 0,
              date: r.createdAt ? r.createdAt.substring(0, 10) : '2026-05-15',
              uploader: r.source || 'User'
            };
          }
          versions[version].count++;
        });

        state.datasets = Object.keys(versions).map(v => ({
          id: `DS-2026-0${v}`,
          filename: v === '1' ? 'Housing_Dataset_V1.csv' : `Uploaded_Dataset_V${v}.csv`,
          size: v === '1' ? '1.2 MB' : '850 KB',
          uploadedBy: versions[v].uploader || 'User',
          uploadDate: versions[v].date,
          recordsCount: versions[v].count,
          status: 'Ingested'
        }));
      })
      .addCase(fetchRecords.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(uploadDataset.fulfilled, (state, action) => {
        const { filename, size, uploadedBy, records } = action.payload;
        const newDataset = {
          id: `DS-${Date.now().toString().slice(-6)}`,
          filename,
          size,
          uploadedBy,
          uploadDate: new Date().toISOString().split('T')[0],
          recordsCount: records.length,
          status: 'Ingested'
        };
        state.datasets.unshift(newDataset);
        state.records = [...records, ...state.records];
      })
      .addCase(clearRecords.fulfilled, (state) => {
        state.records = [];
        state.datasets = [];
      })
      .addCase(addRecord.fulfilled, (state, action) => {
        // Prepend new record to the list so it appears at the top
        state.records = [action.payload, ...state.records];
      });
  }
});

export const { setFilters, resetFilters, deleteDataset } = repositorySlice.actions;
export default repositorySlice.reducer;

