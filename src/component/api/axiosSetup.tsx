import axios from 'axios';
import Auth from '../Auth/auth';

// Setup axios interceptor for global error handling
export const setupAxiosInterceptors = () => {
    // Response interceptor
    axios.interceptors.response.use(
        (response) => {
            // If the request is successful, just return the response
            return response;
        },
        (error) => {
            // Handle errors globally
            if (error.response) {
                // Check for 401 Unauthorized (token expired or invalid)
                if (error.response.status === 401) {
                    console.log('Unauthorized access - logging out...');
                    Auth.signout();
                    window.location.href = '/login';
                }
                // Check for custom status code 406 (if your API uses this for token expiration)
                else if (error.response.status === 406 || error.response.data?.status === 406) {
                    console.log('Token expired - logging out...');
                    Auth.signout();
                    window.location.href = '/login';
                }
                // Check for 403 Forbidden
                else if (error.response.status === 403) {
                    // Check if it's an AWS IAM permission error (don't logout for these)
                    const errorData = error.response.data;
                    const errorUrl = error.config?.url || '';

                    console.log('403 Error detected:', { url: errorUrl, errorData });

                    // Check if this is from Cost Explorer endpoints
                    const isCostEndpoint = errorUrl.includes('/cost/');

                    // Check if error data indicates AWS permission issue
                    const hasAWSErrorIndicators =
                        (errorData?.errorType && (
                            errorData.errorType.includes('IAM Permission') ||
                            errorData.errorType.includes('Access Denied')
                        )) ||
                        (errorData?.message && (
                            errorData.message.includes('IAM') ||
                            errorData.message.includes('Cost Explorer') ||
                            errorData.message.includes('is not authorized') ||
                            errorData.message.includes('lacks required permissions')
                        )) ||
                        (errorData?.details?.error &&
                            errorData.details.error.includes('is not authorized')
                        ) ||
                        errorData?.success === false; // Backend returns success: false for these errors

                    const isAWSPermissionError = isCostEndpoint || hasAWSErrorIndicators;

                    console.log('403 Error Analysis:', {
                        isCostEndpoint,
                        hasAWSErrorIndicators,
                        isAWSPermissionError,
                        willLogout: !isAWSPermissionError
                    });

                    if (!isAWSPermissionError) {
                        // Only logout for authentication-related 403 errors
                        console.log('Forbidden access - logging out...');
                        Auth.signout();
                        window.location.href = '/login';
                    } else {
                        // Just log the AWS permission error, don't logout
                        console.log('AWS Permission Error - keeping user logged in:', errorData?.message);
                    }
                }
            } else if (error.request) {
                // The request was made but no response was received
                console.error('No response received from server');
            } else {
                // Something happened in setting up the request
                console.error('Error setting up request:', error.message);
            }

            // Always reject the promise so the error can be handled locally if needed
            return Promise.reject(error);
        }
    );

    // Request interceptor (optional - to always add fresh token)
    axios.interceptors.request.use(
        (config) => {
            // Get the latest token from sessionStorage
            const authKey = sessionStorage.getItem('authKey');
            if (authKey) {
                config.headers.Authorization = authKey;
            }
            return config;
        },
        (error) => {
            return Promise.reject(error);
        }
    );
};
