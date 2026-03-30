import { supabase } from "../config/supabase";
import { API_URL } from "../constants/api";

export const fetchWithAuth = async (endpoint, options = {}) => {
  const { data: { session } } = await supabase.auth.getSession();
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  };

  if (session?.access_token) {
    defaultHeaders['Authorization'] = `Bearer ${session.access_token}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorMessage = "API request failed";
      try {
        const errorData = await response.json();
        if (errorData.message) errorMessage = errorData.message;
      } catch (e) {
        // Not JSON
      }
      throw new Error(errorMessage);
    }

    // Handle 204 No Content or empty responses
    const text = await response.text();
    return text ? JSON.parse(text) : {};
  } catch (error) {
    if (error.name === 'AbortError') {
      throw { message: "Request timed out", code: "TIMEOUT" };
    }
    throw error;
  }
};
