let ws = null;
const subscribers = new Set();

export const connectWebSocket = () => {
  if (ws) return;

  ws = new WebSocket(`wss://ws.finnhub.io?token=${import.meta.env.VITE_FINNHUB_API_KEY}`);
  
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === 'trade') {
      subscribers.forEach(callback => callback(data.data[0]));
    }
  };

  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
  };

  return ws;
};

export const subscribeToSymbol = (symbol) => {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: 'subscribe', symbol: symbol }));
  }
};

export const unsubscribeFromSymbol = (symbol) => {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: 'unsubscribe', symbol: symbol }));
  }
};

export const subscribe = (callback) => {
  subscribers.add(callback);
  return () => subscribers.delete(callback);
};

export const closeConnection = () => {
  if (ws) {
    ws.close();
    ws = null;
  }
};
