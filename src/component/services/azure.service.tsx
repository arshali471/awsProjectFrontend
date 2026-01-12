import { msalInstance, loginRequest } from '../../authConfig';
import { AuthenticationResult } from '@azure/msal-browser';
import makeRequest from '../api/makeRequest';
import { RequestMethods } from '../api/requestMethode';
import url from '../api/urls';

export class AzureService {
    /**
     * Initiate Microsoft SSO login
     */
    static async loginWithMicrosoft(): Promise<AuthenticationResult | null> {
        try {
            const response = await msalInstance.loginPopup(loginRequest);
            return response;
        } catch (error: any) {
            console.error('[Azure] Login failed:', error);
            if (error.errorCode === 'user_cancelled') {
                throw new Error('Login was cancelled');
            } else if (error.errorCode === 'popup_window_error') {
                throw new Error('Popup was blocked. Please allow popups for this site.');
            } else {
                throw new Error(error.errorMessage || 'Microsoft login failed');
            }
        }
    }

    /**
     * Exchange Microsoft token for backend JWT
     */
    static async exchangeTokenWithBackend(accessToken: string) {
        return await makeRequest(
            url.microsoftCallback,
            RequestMethods.POST,
            { accessToken }
        );
    }

    /**
     * Get Azure AD configuration from backend
     */
    static async getAzureConfig() {
        try {
            const response = await makeRequest(url.azureConfig, RequestMethods.GET);
            return response;
        } catch (error: any) {
            return { data: { enabled: false } };
        }
    }

    /**
     * Complete SSO flow: Login → Exchange → Store JWT
     */
    static async completeSSOFlow() {
        try {
            const msalResponse = await this.loginWithMicrosoft();

            if (!msalResponse || !msalResponse.accessToken) {
                return { success: false, error: 'Failed to obtain Microsoft access token' };
            }

            const backendResponse = await this.exchangeTokenWithBackend(msalResponse.accessToken);

            if (backendResponse.status !== 200) {
                return { success: false, error: 'Failed to authenticate with backend' };
            }

            return {
                success: true,
                token: backendResponse.data.token,
                username: backendResponse.data.username,
                email: backendResponse.data.email,
                admin: backendResponse.data.admin,
                addUser: backendResponse.data.addUser,
                addAWSKey: backendResponse.data.addAWSKey,
                addDocument: backendResponse.data.addDocument,
            };
        } catch (error: any) {
            return { success: false, error: error.message || 'SSO authentication failed' };
        }
    }
}
