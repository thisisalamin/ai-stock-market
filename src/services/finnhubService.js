import axios from 'axios';

const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';
const FINNHUB_API_KEY = import.meta.env.VITE_FINNHUB_API_KEY;

const finnhubClient = axios.create({
  baseURL: FINNHUB_BASE_URL,
  headers: {
    'X-Finnhub-Token': FINNHUB_API_KEY
  }
});

export const getQuote = async (symbol) => {
  try {
    const response = await finnhubClient.get(`/quote`, {
      params: { symbol: symbol.toUpperCase() }
    });
    return response.data;
  } catch (error) {
    console.error('Finnhub API Error:', error);
    return null;
  }
};
