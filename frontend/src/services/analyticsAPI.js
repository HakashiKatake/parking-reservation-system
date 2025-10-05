import api from './api';

const analyticsAPI = {
  // Get vendor analytics overview
  getVendorAnalytics: async (timeframe = '30') => {
    try {
      const response = await api.get(`/analytics/overview?timeframe=${timeframe}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching vendor analytics:', error);
      throw error;
    }
  },

  // Get RFM Analysis
  getRFMAnalysis: async () => {
    try {
      const response = await api.get('/analytics/rfm');
      return response.data;
    } catch (error) {
      console.error('Error fetching RFM analysis:', error);
      throw error;
    }
  },

  // Get Customer Lifetime Value analysis
  getCLVAnalysis: async () => {
    try {
      const response = await api.get('/analytics/clv');
      return response.data;
    } catch (error) {
      console.error('Error fetching CLV analysis:', error);
      throw error;
    }
  },

  // Get Net Promoter Score
  getNPSScore: async () => {
    try {
      const response = await api.get('/analytics/nps');
      return response.data;
    } catch (error) {
      console.error('Error fetching NPS score:', error);
      throw error;
    }
  },

  // Get Revenue projections
  getRevenueProjections: async () => {
    try {
      const response = await api.get('/analytics/projections');
      return response.data;
    } catch (error) {
      console.error('Error fetching revenue projections:', error);
      throw error;
    }
  }
};

export default analyticsAPI;