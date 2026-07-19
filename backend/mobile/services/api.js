import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const API_BASE_URL = 'http://localhost:8000/api/v1';
const API_KEY = process.env.EXPO_PUBLIC_API_KEY || 'hackathon-secret-key-2026';

export const queryKnowledgeBase = async (query) => {
  const cacheKey = `queryCache_${query.toLowerCase().trim()}`;
  
  try {
    const response = await fetch(`${API_BASE_URL}/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY
      },
      body: JSON.stringify({
        query,
        user_id: 'mobile_user',
        user_role: 'engineer'
      }),
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
      throw new Error(error.detail || `HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Save to cache on success
    try {
      await AsyncStorage.setItem(cacheKey, JSON.stringify(data));
    } catch (e) {
      console.warn('Failed to cache query result', e);
    }
    
    return { ...data, isOffline: false };
    
  } catch (error) {
    console.error('Network Query failed, falling back to cache:', error);
    
    // Fallback to cache
    try {
      const cachedResponse = await AsyncStorage.getItem(cacheKey);
      if (cachedResponse !== null) {
        return { ...JSON.parse(cachedResponse), isOffline: true };
      }
    } catch (e) {
      console.error('Failed to retrieve from cache', e);
    }
    
    throw new Error('Network error and no offline cache available.');
  }
};

export const transcribeAudio = async (fileUri) => {
  try {
    const formData = new FormData();
    
    // Convert fileUri to proper format for React Native FormData
    const filename = fileUri.split('/').pop() || 'recording.m4a';
    
    formData.append('file', {
      uri: Platform.OS === 'ios' ? fileUri.replace('file://', '') : fileUri,
      type: 'audio/m4a',
      name: filename,
    });
    
    const response = await fetch(`${API_BASE_URL}/transcribe`, {
      method: 'POST',
      headers: {
        'X-API-Key': API_KEY,
        'Accept': 'application/json',
        // Note: Don't set Content-Type manually when using FormData in React Native
      },
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`Transcribe failed: HTTP ${response.status}`);
    }
    
    const data = await response.json();
    return data.text;
  } catch (error) {
    console.error('Audio transcription failed:', error);
    throw error;
  }
};

export const getEquipmentHistory = async (tag) => {
  const cacheKey = `equipCache_${tag.toLowerCase().trim()}`;
  
  try {
    const response = await fetch(`${API_BASE_URL}/equipment/${tag}/history`, {
      method: 'GET',
      headers: {
        'X-API-Key': API_KEY,
        'Accept': 'application/json',
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    
    // Save to cache on success
    try {
      await AsyncStorage.setItem(cacheKey, JSON.stringify(data));
    } catch (e) {
      console.warn('Failed to cache equipment data', e);
    }
    
    return { ...data, isOffline: false };
    
  } catch (error) {
    console.error('Equipment fetch failed, falling back to cache:', error);
    
    // Fallback to cache
    try {
      const cachedResponse = await AsyncStorage.getItem(cacheKey);
      if (cachedResponse !== null) {
        return { ...JSON.parse(cachedResponse), isOffline: true };
      }
    } catch (e) {
      console.error('Failed to retrieve equipment from cache', e);
    }
    
    throw new Error('Network error and no offline cache available.');
  }
};

