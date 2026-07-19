// Simple WebSocket client with event subscription and auto-reconnect

const WS_URL = process.env.EXPO_PUBLIC_WS_URL || 'ws://localhost:8000/ws';
const RECONNECT_INTERVAL = 3000; // 3 seconds
const MAX_RECONNECT_ATTEMPTS = 5;

let ws = null;
let reconnectAttempts = 0;
let reconnectTimeout = null;
let eventHandlers = {}; // { eventName: [handler1, handler2, ...] }
let connectionStatus = 'disconnected'; // 'disconnected', 'connecting', 'connected', 'reconnecting'
let statusListeners = [];

export const connect = () => {
  if (ws && (ws.readyState === WebSocket.CONNECTING || ws.readyState === WebSocket.OPEN)) {
    console.log('WebSocket already connected or connecting');
    return;
  }

  setStatus('connecting');
  
  try {
    ws = new WebSocket(WS_URL);

    ws.onopen = () => {
      console.log('WebSocket connected');
      setStatus('connected');
      reconnectAttempts = 0;
      
      // Trigger 'open' event handlers
      triggerEvent('open', { timestamp: Date.now() });
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Trigger event handlers for specific event types
        if (data.event) {
          triggerEvent(data.event, data);
        }
        
        // Also trigger a generic 'message' event
        triggerEvent('message', data);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
        triggerEvent('error', { error: 'Parse error', raw: event.data });
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      triggerEvent('error', { error });
    };

    ws.onclose = (event) => {
      console.log('WebSocket closed', event.code, event.reason);
      setStatus('disconnected');
      triggerEvent('close', { code: event.code, reason: event.reason });
      
      // Auto-reconnect if not intentionally closed
      if (event.code !== 1000 && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        scheduleReconnect();
      }
    };
  } catch (error) {
    console.error('WebSocket connection failed:', error);
    setStatus('disconnected');
    triggerEvent('error', { error });
  }
};

export const disconnect = () => {
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
    reconnectTimeout = null;
  }
  
  reconnectAttempts = MAX_RECONNECT_ATTEMPTS; // Prevent auto-reconnect
  
  if (ws) {
    if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
      ws.close(1000, 'Client disconnect');
    }
    ws = null;
  }
  
  setStatus('disconnected');
};

export const send = (eventName, data = {}) => {
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    console.warn('WebSocket not connected. Cannot send message.');
    return false;
  }
  
  try {
    const message = JSON.stringify({ event: eventName, ...data });
    ws.send(message);
    return true;
  } catch (error) {
    console.error('Failed to send WebSocket message:', error);
    return false;
  }
};

export const subscribe = (eventName, handler) => {
  if (!eventHandlers[eventName]) {
    eventHandlers[eventName] = [];
  }
  
  eventHandlers[eventName].push(handler);
  
  // Return unsubscribe function
  return () => {
    unsubscribe(eventName, handler);
  };
};

export const unsubscribe = (eventName, handler) => {
  if (!eventHandlers[eventName]) {
    return;
  }
  
  eventHandlers[eventName] = eventHandlers[eventName].filter(h => h !== handler);
  
  // Clean up empty arrays
  if (eventHandlers[eventName].length === 0) {
    delete eventHandlers[eventName];
  }
};

export const getStatus = () => {
  return connectionStatus;
};

export const onStatusChange = (listener) => {
  statusListeners.push(listener);
  
  // Return unsubscribe function
  return () => {
    statusListeners = statusListeners.filter(l => l !== listener);
  };
};

// Internal helper functions

const setStatus = (newStatus) => {
  if (connectionStatus !== newStatus) {
    connectionStatus = newStatus;
    statusListeners.forEach(listener => {
      try {
        listener(newStatus);
      } catch (error) {
        console.error('Status listener error:', error);
      }
    });
  }
};

const triggerEvent = (eventName, data) => {
  const handlers = eventHandlers[eventName] || [];
  
  handlers.forEach(handler => {
    try {
      handler(data);
    } catch (error) {
      console.error(`Error in event handler for '${eventName}':`, error);
    }
  });
};

const scheduleReconnect = () => {
  if (reconnectTimeout) {
    return; // Already scheduled
  }
  
  reconnectAttempts++;
  setStatus('reconnecting');
  
  console.log(`Scheduling reconnect attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS}...`);
  
  reconnectTimeout = setTimeout(() => {
    reconnectTimeout = null;
    triggerEvent('reconnecting', { attempt: reconnectAttempts });
    connect();
  }, RECONNECT_INTERVAL);
};
