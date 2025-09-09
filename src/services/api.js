import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const domainAPI = {
  getPublicDomains: () => api.get('/domains/public'),
};

export const ticketAPI = {
  createTicket: (ticketData) => api.post('/tickets', ticketData),
  getTicketsByCustomerAndDomains: (data) => api.post('/tickets/customer-domains', data),
};

export default api;
