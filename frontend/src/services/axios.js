import axios from 'axios';

// Track if we're currently refreshing to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

// Create axios instance with base configuration
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
  timeout: 30000, // Increased timeout to 30 seconds
  withCredentials: true, // Send cookies with requests
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor - Add token to headers if available
axiosInstance.interceptors.request.use(
  (config) => {
    // Determine token type based on current page URL, not API endpoint
    const currentPath = window.location.pathname;
    const isAdminPage = currentPath.startsWith('/admin');
    const isDeliverymanPage = currentPath.startsWith('/deliveryman');
    
    // Skip token check for login, register, and public endpoints
    const isPublicEndpoint = config.url?.includes('/login') || 
                 config.url?.includes('/register') || 
                 config.url?.includes('/refresh-token') ||
                 config.url?.includes('/chat') ||
                 (config.url?.includes('/products') && config.method === 'get');
    
    // Use appropriate token based on current page context
    let token, loginPath;
    if (isAdminPage) {
      token = localStorage.getItem('adminAccessToken');
      loginPath = '/admin/login';
    } else if (isDeliverymanPage) {
      token = localStorage.getItem('deliverymanAccessToken');
      loginPath = '/deliveryman/login';
    } else {
      token = localStorage.getItem('accessToken');
      loginPath = '/login';
    }
    
    // If no token exists for protected routes and not on login page, redirect to login
    if (!token && !isPublicEndpoint && currentPath !== loginPath) {
      window.location.href = loginPath;
      return Promise.reject(new Error('No authentication token found'));
    }
    
    if (token && !isPublicEndpoint) {
      config.headers.Authorization = `Bearer ${token}`;
    } else if (config.headers?.Authorization) {
      delete config.headers.Authorization;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized - Token expired or invalid
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Skip token refresh for login and refresh-token endpoints
      if (originalRequest.url?.includes('/login') || originalRequest.url?.includes('/refresh-token')) {
        return Promise.reject(error);
      }

      // Check if error is about invalid/expired refresh token - clear everything immediately
      const errorMessage = error.response?.data?.message || '';
      if (errorMessage.includes('Invalid or expired refresh token') || errorMessage.includes('Invalid refresh token')) {
        console.warn('⚠️ Invalid refresh token detected, clearing all tokens');
        const currentPath = window.location.pathname;
        const isAdminPage = currentPath.startsWith('/admin');
        const isDeliverymanPage = currentPath.startsWith('/deliveryman');
        
        // Clear appropriate tokens
        if (isAdminPage) {
          localStorage.removeItem('adminAccessToken');
          localStorage.removeItem('adminRefreshToken');
          if (window.location.pathname !== '/admin/login') {
            window.location.href = '/admin/login';
          }
        } else if (isDeliverymanPage) {
          localStorage.removeItem('deliverymanAccessToken');
          localStorage.removeItem('deliverymanRefreshToken');
          if (window.location.pathname !== '/deliveryman/login') {
            window.location.href = '/deliveryman/login';
          }
        } else {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      // Determine user type based on current page URL, not API endpoint
      const currentPath = window.location.pathname;
      const isAdminPage = currentPath.startsWith('/admin');
      const isDeliverymanPage = currentPath.startsWith('/deliveryman');
      
      // Get appropriate refresh token based on current page context
      let refreshToken, endpoint, loginPath;
      if (isAdminPage) {
        refreshToken = localStorage.getItem('adminRefreshToken');
        endpoint = '/admin/refresh-token';
        loginPath = '/admin/login';
      } else if (isDeliverymanPage) {
        refreshToken = localStorage.getItem('deliverymanRefreshToken');
        endpoint = '/deliveryman/refresh-token';
        loginPath = '/deliveryman/login';
      } else {
        refreshToken = localStorage.getItem('refreshToken');
        endpoint = '/users/refresh-token';
        loginPath = '/login';
      }
        
      if (!refreshToken) {
        console.warn('⚠️ No refresh token found, clearing tokens');
        // No refresh token - clear any stale access token
        if (isAdminPage) {
          localStorage.removeItem('adminAccessToken');
          localStorage.removeItem('adminRefreshToken');
        } else if (isDeliverymanPage) {
          localStorage.removeItem('deliverymanAccessToken');
          localStorage.removeItem('deliverymanRefreshToken');
        } else {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
        // Only redirect if not already on login page
        if (window.location.pathname !== loginPath) {
          window.location.href = loginPath;
        }
        return Promise.reject(error);
      }

      // If already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return axiosInstance(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      isRefreshing = true;
      console.log('🔄 Token expired, attempting refresh...');
      
      try {
        console.log(`🔄 Refreshing token via ${endpoint}...`);
        
        const response = await axios.post(
          `${originalRequest.baseURL}${endpoint}`,
          { refreshToken },
          { withCredentials: true }
        );

        const { accessToken, refreshToken: newRefreshToken } = response.data.data;
        
        console.log('✅ Token refresh successful');
        
        // Store new tokens based on current page context
        if (isAdminPage) {
          localStorage.setItem('adminAccessToken', accessToken);
          if (newRefreshToken) {
            localStorage.setItem('adminRefreshToken', newRefreshToken);
          }
        } else if (isDeliverymanPage) {
          localStorage.setItem('deliverymanAccessToken', accessToken);
          if (newRefreshToken) {
            localStorage.setItem('deliverymanRefreshToken', newRefreshToken);
          }
        } else {
          localStorage.setItem('accessToken', accessToken);
          if (newRefreshToken) {
            localStorage.setItem('refreshToken', newRefreshToken);
          }
        }

        // Process queued requests
        processQueue(null, accessToken);
        isRefreshing = false;

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        console.error('❌ Token refresh failed:', refreshError.response?.data?.message || refreshError.message);
        
        // Process queued requests with error
        processQueue(refreshError, null);
        isRefreshing = false;
        
        // Clear tokens and redirect to login based on current page context
        if (isAdminPage) {
          localStorage.removeItem('adminAccessToken');
          localStorage.removeItem('adminRefreshToken');
          if (window.location.pathname !== '/admin/login') {
            window.location.href = '/admin/login';
          }
        } else if (isDeliverymanPage) {
          localStorage.removeItem('deliverymanAccessToken');
          localStorage.removeItem('deliverymanRefreshToken');
          if (window.location.pathname !== '/deliveryman/login') {
            window.location.href = '/deliveryman/login';
          }
        } else {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }
        
        return Promise.reject(refreshError);
      }
    }

    // Handle other errors
    const message = error.response?.data?.message || error.message || 'An error occurred';
    console.error('API Error:', message);
    
    return Promise.reject(error);
  }
);

export default axiosInstance;
