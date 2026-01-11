import axios from 'axios';

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
    // Check if it's an admin route
    const isAdminRoute = config.url?.startsWith('/admin') || 
                         config.url?.startsWith('/orders') || 
                         (config.url?.startsWith('/products') && config.method !== 'get');
    
    // Use appropriate token
    const token = isAdminRoute 
      ? localStorage.getItem('adminAccessToken')
      : localStorage.getItem('accessToken');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else if (isAdminRoute) {
      console.warn('⚠️ Admin route accessed without token - redirecting to login');
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
      originalRequest._retry = true;

      console.log('🔄 Token expired, attempting refresh...');

      try {
        // Check if it's an admin route
        const isAdminRoute = originalRequest.url?.startsWith('/admin') || 
                             originalRequest.url?.startsWith('/orders') || 
                             (originalRequest.url?.startsWith('/products') && originalRequest.method !== 'get');
        
        // Attempt to refresh token
        const refreshToken = isAdminRoute 
          ? localStorage.getItem('adminRefreshToken')
          : localStorage.getItem('refreshToken');
          
        if (!refreshToken) {
          console.warn('⚠️ No refresh token found, clearing tokens');
          // No refresh token - clear any stale access token and return error
          if (isAdminRoute) {
            localStorage.removeItem('adminAccessToken');
          } else {
            localStorage.removeItem('accessToken');
          }
          window.dispatchEvent(new Event('storage'));
          return Promise.reject(error);
        }

        const endpoint = isAdminRoute ? '/admin/refresh-token' : '/users/refresh-token';
        
        console.log(`🔄 Refreshing token via ${endpoint}...`);
        
        try {
          const response = await axios.post(
            `${originalRequest.baseURL}${endpoint}`,
            { refreshToken }
          );

          const { accessToken, refreshToken: newRefreshToken } = response.data.data;
          
          console.log('✅ Token refresh successful');
          
          // Store new tokens (both access and refresh)
          if (isAdminRoute) {
            localStorage.setItem('adminAccessToken', accessToken);
            if (newRefreshToken) {
              localStorage.setItem('adminRefreshToken', newRefreshToken);
            }
          } else {
            localStorage.setItem('accessToken', accessToken);
            if (newRefreshToken) {
              localStorage.setItem('refreshToken', newRefreshToken);
            }
          }

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          console.error('❌ Token refresh failed:', refreshError.message);
          // Refresh token is invalid - clear both tokens
          if (isAdminRoute) {
            localStorage.removeItem('adminAccessToken');
            localStorage.removeItem('adminRefreshToken');
          } else {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
          }
          window.dispatchEvent(new Event('storage'));
          return Promise.reject(error);
        }
      } catch (refreshError) {
        console.error('❌ Token refresh error:', refreshError);
        // Refresh failed - only clear tokens, don't force redirect
        // This allows components to handle the error gracefully
        const isAdminRoute = originalRequest.url?.startsWith('/admin') || 
                             originalRequest.url?.startsWith('/orders') || 
                             (originalRequest.url?.startsWith('/products') && originalRequest.method !== 'get');
        
        if (isAdminRoute) {
          localStorage.removeItem('adminAccessToken');
          localStorage.removeItem('adminRefreshToken');
        } else {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
        window.dispatchEvent(new Event('storage'));
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
