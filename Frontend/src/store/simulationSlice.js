import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from './api';

// Helper to parse parameters and results safely
const parseJsonOrMapString = (str) => {
  if (!str) return {};
  try {
    return JSON.parse(str);
  } catch (e) {
    try {
      const obj = {};
      const pairs = str.replace(/[{}]/g, '').split(',');
      pairs.forEach(pair => {
        const parts = pair.split(/[=:]/);
        if (parts.length >= 2) {
          const key = parts[0].trim().replace(/['"]/g, '');
          let val = parts[1].trim();
          if (val === 'true') val = true;
          else if (val === 'false') val = false;
          else if (!isNaN(val)) val = Number(val);
          else val = val.replace(/['"]/g, '');
          obj[key] = val;
        }
      });
      return obj;
    } catch (err) {
      console.error("Failed to parse string:", str, err);
      return {};
    }
  }
};

// Async Thunks
export const fetchScenarios = createAsyncThunk('simulation/fetchScenarios', async (_, thunkAPI) => {
  try {
    const response = await api.get('/api/policy/scenarios');
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data || error.message);
  }
});

export const addScenario = createAsyncThunk('simulation/addScenario', async (payload, thunkAPI) => {
  try {
    const response = await api.post('/api/policy/simulate', payload);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data || error.message);
  }
});

export const approveScenario = createAsyncThunk('simulation/approveScenario', async (id, thunkAPI) => {
  try {
    const response = await api.put(`/api/policy/scenarios/${id}/status`, { status: 'Approved' });
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data || error.message);
  }
});

export const deleteScenario = createAsyncThunk('simulation/deleteScenario', async (id, thunkAPI) => {
  try {
    await api.delete(`/api/policy/scenarios/${id}`);
    return id;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data || error.message);
  }
});

const mapScenarioFromBackend = (s) => {
  const params = parseJsonOrMapString(s.parameters);
  const results = parseJsonOrMapString(s.results);
  
  // Translate backend metrics to outcomes expected by frontend
  const supply = results.supply !== undefined ? results.supply : (results.housingDeficitReduction !== undefined ? results.housingDeficitReduction : 15000);
  const demand = results.demand !== undefined ? results.demand : 15000;
  const gap = results.gap !== undefined ? results.gap : (results.housingDeficitReduction !== undefined ? results.housingDeficitReduction - 1000 : -700);
  const cost = results.requiredInfrastructureMUSD !== undefined ? results.requiredInfrastructureMUSD : (params.budget ? params.budget * 0.95 : 45.0);
  const ecoScore = results.sustainabilityIndex !== undefined ? results.sustainabilityIndex : (params.ecoFriendly ? 85 : 50);

  return {
    id: s.id,
    name: s.name,
    description: s.description,
    growthRate: params.growthRate || 2.5,
    budget: params.budget || 40,
    zoning: params.zoning || 'Mixed',
    ecoFriendly: params.ecoFriendly || false,
    outcomes: {
      supply,
      demand,
      gap,
      cost,
      ecoScore
    },
    status: s.status || 'Draft',
    createdDate: s.createdAt ? s.createdAt.substring(0, 10) : new Date().toISOString().split('T')[0]
  };
};

const simulationSlice = createSlice({
  name: 'simulation',
  initialState: {
    scenarios: [],
    recommendations: [],
    activeScenarioIds: [],
    loading: false,
    error: null
  },
  reducers: {
    toggleCompareScenario: (state, action) => {
      const id = action.payload;
      const index = state.activeScenarioIds.indexOf(id);
      if (index === -1) {
        if (state.activeScenarioIds.length < 3) {
          state.activeScenarioIds.push(id);
        } else {
          state.activeScenarioIds[0] = id;
        }
      } else {
        state.activeScenarioIds.splice(index, 1);
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchScenarios.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchScenarios.fulfilled, (state, action) => {
        state.loading = false;
        state.scenarios = action.payload.map(mapScenarioFromBackend);
        
        // Generate recommendations dynamically from the fetched scenarios!
        state.recommendations = state.scenarios.map((sc, index) => {
          let recType = "Zoning Policy";
          let message = "";
          let confidence = 85;

          if (sc.name.toLowerCase().includes("density")) {
            recType = "Zoning Policy";
            message = `Converting commercial/low-density zones to high-density under '${sc.name}' is projected to reduce housing deficit by ${sc.outcomes.supply} units in target sectors.`;
            confidence = Math.min(95, Math.round(85 + sc.growthRate * 2));
          } else if (sc.name.toLowerCase().includes("green") || sc.ecoFriendly) {
            recType = "Environmental Incentive";
            message = `Implementing '${sc.name}' with eco-mandates yields an environmental sustainability rating of ${sc.outcomes.ecoScore}/100.`;
            confidence = Math.min(95, Math.round(75 + sc.outcomes.ecoScore * 0.15));
          } else {
            recType = "Budget Allocation";
            message = `Allocating a budget of $${sc.budget}M under '${sc.name}' targets a projected housing supply of ${sc.outcomes.supply} units against a demand of ${sc.outcomes.demand} units.`;
            confidence = Math.min(95, Math.round(80 + (sc.budget % 15)));
          }

          return {
            id: `REC-${index + 1}`,
            type: recType,
            message,
            confidence
          };
        });

        if (state.recommendations.length === 0) {
          state.recommendations = [
            { id: 'REC-01', type: 'Zoning Policy', message: 'Optimize zoning parameters to reduce the metropolitan housing deficit.', confidence: 80 }
          ];
        }

        if (state.scenarios.length > 0 && state.activeScenarioIds.length === 0) {
          state.activeScenarioIds = state.scenarios.slice(0, 2).map(s => s.id);
        }
      })
      .addCase(fetchScenarios.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addScenario.fulfilled, (state, action) => {
        const scenario = mapScenarioFromBackend(action.payload);
        state.scenarios.push(scenario);
      })
      .addCase(approveScenario.fulfilled, (state, action) => {
        const updated = mapScenarioFromBackend(action.payload);
        const index = state.scenarios.findIndex(s => s.id === updated.id);
        if (index !== -1) {
          state.scenarios[index] = updated;
        }
      })
      .addCase(deleteScenario.fulfilled, (state, action) => {
        const id = action.payload;
        state.scenarios = state.scenarios.filter(s => s.id !== id);
        state.activeScenarioIds = state.activeScenarioIds.filter(activeId => activeId !== id);
      });
  }
});

export const { toggleCompareScenario } = simulationSlice.actions;
export default simulationSlice.reducer;
