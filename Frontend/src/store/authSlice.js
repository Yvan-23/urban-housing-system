import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from './api';

// Async Thunks
export const login = createAsyncThunk('auth/login', async ({ email, password }, thunkAPI) => {
  try {
    const response = await api.post('/api/auth/login', { email, password });
    const data = response.data;
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify({ email: data.email, name: data.name, role: data.role }));
    return data;
  } catch (error) {
    const message = error.response?.data || error.message || 'Login failed';
    return thunkAPI.rejectWithValue(message);
  }
});

export const registerUser = createAsyncThunk('auth/register', async (userData, thunkAPI) => {
  try {
    const response = await api.post('/api/auth/register', {
      name: userData.name,
      email: userData.email,
      password: userData.password,
      role: userData.role === 'Administrator' ? 'System Administrator' : userData.role,
      department: userData.department || 'Planning',
      organization: userData.organization || 'RHA',
      phone: userData.phone || '0780000000'
    });
    return response.data;
  } catch (error) {
    const message = error.response?.data || error.message || 'Registration failed';
    return thunkAPI.rejectWithValue(message);
  }
});

export const fetchUsers = createAsyncThunk('auth/fetchUsers', async (_, thunkAPI) => {
  try {
    const response = await api.get('/api/users');
    return response.data;
  } catch (error) {
    const message = error.response?.data || error.message || 'Failed to fetch users';
    return thunkAPI.rejectWithValue(message);
  }
});

export const updateUserRole = createAsyncThunk('auth/updateUser', async ({ userId, role }, thunkAPI) => {
  try {
    const state = thunkAPI.getState();
    const existingUser = state.auth.users.find(u => u.id === userId);
    if (!existingUser) throw new Error("User not found in state");
    
    // Normalize role: database expects "System Administrator" for "Administrator"
    let dbRole = role;
    if (role === 'Administrator') {
      dbRole = 'System Administrator';
    }

    const updatedData = { 
      id: userId,
      name: existingUser.name,
      email: existingUser.email,
      role: dbRole,
      isLocked: existingUser.isLocked || false
    };
    const response = await api.put(`/api/users/${userId}`, updatedData);
    
    let frontendRole = response.data.role;
    if (frontendRole === 'System Administrator') {
      frontendRole = 'Administrator';
    }
    
    return { ...response.data, role: frontendRole };
  } catch (error) {
    const message = error.response?.data || error.message || 'Failed to update user';
    return thunkAPI.rejectWithValue(message);
  }
});

export const fetchAuditLogs = createAsyncThunk('auth/fetchAuditLogs', async (_, thunkAPI) => {
  try {
    const response = await api.get('/api/audit-logs');
    return response.data;
  } catch (error) {
    const message = error.response?.data || error.message || 'Failed to fetch audit logs';
    return thunkAPI.rejectWithValue(message);
  }
});

// Helper for local storage initialization
const savedToken = localStorage.getItem('token');
const savedUserRaw = localStorage.getItem('user');
let savedUser = null;
if (savedUserRaw) {
  try {
    savedUser = JSON.parse(savedUserRaw);
    // Normalize role from older sessions
    if (savedUser.role === 'System Administrator') {
      savedUser.role = 'Administrator';
      localStorage.setItem('user', JSON.stringify(savedUser));
    }
  } catch (e) {
    savedUser = null;
  }
}

const initialState = {
  user: savedUser || null,
  users: [],
  pendingRegistrations: [],
  auditLogs: [],
  isAuthenticated: !!savedToken,
  loading: false,
  error: null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      state.user = null;
      state.isAuthenticated = false;
      state.users = [];
      state.auditLogs = [];
    },
    setRole: (state, action) => {
      if (state.user) {
        state.user.role = action.payload;
        localStorage.setItem('user', JSON.stringify(state.user));
      }
    },
    approveRegistration: (state, action) => {
      state.pendingRegistrations = state.pendingRegistrations.filter(r => r.id !== action.payload);
    },
    rejectRegistration: (state, action) => {
      state.pendingRegistrations = state.pendingRegistrations.filter(r => r.id !== action.payload);
    }
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        // Normalize role: backend stores 'System Administrator', frontend uses 'Administrator'
        let role = action.payload.role;
        if (role === 'System Administrator') {
          role = 'Administrator';
        }
        const user = {
          email: action.payload.email,
          name: action.payload.name,
          role: role
        };
        state.user = user;
        // Keep localStorage in sync with normalized role
        localStorage.setItem('user', JSON.stringify(user));
        // Also update the token just in case
        if (action.payload.token) {
          localStorage.setItem('token', action.payload.token);
        }
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Users
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.users = action.payload.map(u => {
          let role = u.role;
          if (role === 'System Administrator') {
            role = 'Administrator';
          }
          return {
            id: u.id,
            email: u.email,
            name: u.name,
            role: role,
            avatar: u.name.split(' ').map(n => n[0]).join('').toUpperCase()
          };
        });
      })
      // Update User
      .addCase(updateUserRole.fulfilled, (state, action) => {
        const index = state.users.findIndex(u => u.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = {
            id: action.payload.id,
            email: action.payload.email,
            name: action.payload.name,
            role: action.payload.role,
            avatar: action.payload.name.split(' ').map(n => n[0]).join('').toUpperCase()
          };
        }
      })
      // Fetch Audit Logs
      .addCase(fetchAuditLogs.fulfilled, (state, action) => {
        state.auditLogs = action.payload.map(log => ({
          id: log.id,
          timestamp: log.timestamp ? log.timestamp.replace('T', ' ').substring(0, 19) : '',
          user: log.user ? `${log.user.name} (${log.user.role})` : 'System',
          action: `${log.action}: ${log.details || ''}`,
          ipAddress: log.ipAddress || '127.0.0.1'
        }));
      });
  }
});

export const { logout, setRole, approveRegistration, rejectRegistration } = authSlice.actions;
export default authSlice.reducer;
