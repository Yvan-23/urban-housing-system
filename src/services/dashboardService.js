import api from './api';

export const dashboardService = {
  async getMetrics() {
    const response = await api.get('/dashboard/metrics');
    return response.data; // { success, role, user, data: { metrics } }
  },

  async getCharts() {
    const response = await api.get('/dashboard/charts');
    return response.data.data; // { monthlySeries, districtSeries, jobStatusSeries, typeSeries }
  },

  async getTableData() {
    const response = await api.get('/dashboard/table');
    return response.data; // { success, role, data: [ rows ] }
  },

  async getHousingData(params = {}) {
    const response = await api.get('/housing', { params });
    return response.data; // { success, count, data: [ HousingData ] }
  },

  async getETLJobs() {
    const response = await api.get('/etl/jobs');
    return response.data.data; // [ ETLJob ]
  },

  async getScenarios() {
    const response = await api.get('/scenarios');
    return response.data.data; // [ Scenario ]
  },

  async getTasks() {
    const response = await api.get('/collaboration/tasks');
    return response.data.data; // [ Task ]
  }
};
