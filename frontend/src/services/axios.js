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
  timeout: 10000,
  withCredentials: true, // Send cookies with requests
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor - Add token to headers if available
axiosInstance.interceptors.request.use(
  (config) => {
    // Check route type
    const isAdminRoute = config.url?.startsWith('/admin') || 
                         config.url?.startsWith('/orders') || 
                         (config.url?.startsWith('/products') && config.method !== 'get');
    
    const isDeliverymanRoute = config.url?.startsWith('/deliveryman');
    
    // Use appropriate token
    let token;
    if (isAdminRoute) {
      token = localStorage.getItem('adminAccessToken');
    } else if (isDeliverymanRoute) {
      token = localStorage.getItem('deliverymanAccessToken');
    } else {
      token = localStorage.getItem('accessToken');
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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

    // Handle 401 Unauthorized - Token expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Skip token refresh for login and refresh-token endpoints
      if (originalRequest.url?.includes('/login') || originalRequest.url?.includes('/refresh-token')) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      // Check route type
      const isAdminRoute = originalRequest.url?.startsWith('/admin') || 
                           originalRequest.url?.startsWith('/orders') || 
                           (originalRequest.url?.startsWith('/products') && originalRequest.method !== 'get');
      
      const isDeliverymanRoute = originalRequest.url?.startsWith('/deliveryman');
      
      // Get appropriate refresh token
      let refreshToken, endpoint, loginPath;
      if (isAdminRoute) {
        refreshToken = localStorage.getItem('adminRefreshToken');
        endpoint = '/admin/refresh-token';
        loginPath = '/admin/login';
      } else if (isDeliverymanRoute) {
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
        if (isAdminRoute) {
          localStorage.removeItem('adminAccessToken');
          localStorage.removeItem('adminRefreshToken');
        } else if (isDeliverymanRoute) {
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
        
        // Store new tokens based on route type
        if (isAdminRoute) {
          localStorage.setItem('adminAccessToken', accessToken);
          if (newRefreshToken) {
            localStorage.setItem('adminRefreshToken', newRefreshToken);
          }
        } else if (isDeliverymanRoute) {
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
        
        // Clear tokens and redirect to login
        if (isAdminRoute) {
          localStorage.removeItem('adminAccessToken');
          localStorage.removeItem('adminRefreshToken');
          if (window.location.pathname !== '/admin/login') {
            window.location.href = '/admin/login';
          }
        } else if (isDeliverymanRoute) {
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
