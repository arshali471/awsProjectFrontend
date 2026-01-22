import moment from "moment";
import makeRequest, { makeParams } from "../api/makeRequest";
import { RequestMethods } from "../api/requestMethode";
import url from "../api/urls";
import makeUploadRequest from "../api/uploadRequest";

export class AdminService {
    static async getAllAwsKey() {
        return await makeRequest(url.getAllAwsKey, RequestMethods.GET)
    }

    static async getAwsKeyById(keyId: string) {
        return await makeRequest(url.getAwsKeyById + "/" + keyId, RequestMethods.GET)
    }

    static async getUserData() {
        return await makeRequest(url.getUserData, RequestMethods.GET)
    }

    static async getAllUsers() {
        return await makeRequest(url.getAllUsers, RequestMethods.GET)
    }

    static async getUsersWithSessionStatus() {
        return await makeRequest(url.getUsersWithSessionStatus, RequestMethods.GET)
    }

    static async getAllInstance(keyId: any, query: any, date: any) {
        const params = makeParams([
            {
                index: "query",
                value: query
            },
            {
                index: "date",
                value: date
            }
        ])
        return await makeRequest(url.instance.getAllInstance + "/" + keyId + params, RequestMethods.GET)
    }

    static async getGlobalInstance(ip: string) {
        return await makeRequest(url.instance.getGlobalInstance + "/" + ip, RequestMethods.GET)
    }

    static async getEksCluster(keyId: any) {
        return await makeRequest(url.getEksCluster + "/" + keyId, RequestMethods.GET)
    }


    static async getAllS3Data(keyId: any) {
        return await makeRequest(url.getAllS3Data + "/" + keyId, RequestMethods.GET)
    }

    static async getAllRDSData(keyId: any) {
        return await makeRequest(url.getAllRDSData + "/" + keyId, RequestMethods.GET)
    }

    static async getAllVolumesData(keyId: any) {
        return await makeRequest(url.instance.getAllVolumesData + "/" + keyId, RequestMethods.GET)
    }

    static async createUser(payload: any) {
        return await makeRequest(url.createUser, RequestMethods.POST, payload)
    }

    static async createAWSKey(payload: any) {
        return await makeRequest(url.createAWSKey, RequestMethods.POST, payload)
    }


    static async updateUser(userId: any, payload: any) {
        return await makeRequest(url.updateUser + "/" + userId, RequestMethods.PUT, payload)
    }

    static async deleteUser(userId: any) {
        return await makeRequest(url.deleteUser + "/" + userId, RequestMethods.DELETE)
    }

    static async updateAwsKey(awsKey: any, payload: any) {
        return await makeRequest(url.updateAwsKey + "/" + awsKey, RequestMethods.PUT, payload)
    }

    static async deleteAwsKey(awsKey: any) {
        return await makeRequest(url.deleteAwsKey + "/" + awsKey, RequestMethods.DELETE)
    }

    static async getAwsRegion() {
        return await makeRequest(url.getAwsRegion, RequestMethods.GET)
    }

    static async changeUserPassword(payload:any) {
        return await makeRequest(url.changeUserPassword, RequestMethods.PUT, payload)
    }

    static async changeUserPasswordByAdmin(userId:any, payload:any) {
        return await makeRequest(url.changePasswordByAdmin + "/" + userId, RequestMethods.PUT, payload)
    }

    static async getAllEksToken(query: any, pageNumber: number, pageSize: number) {
        const params = makeParams([
            {
                index: "search",
                value: query
            },
            {
                index: "pageNumber",
                value: pageNumber
            },
            {
                index: "count",
                value: pageSize
            }
        ])
        return await makeRequest(url.eksToken.getAllEksToken + params, RequestMethods.GET)
    }

    static async getEKSTokenContent(id: string) {
        return await makeRequest(url.eksToken.getEKSTokenContent.replace(':id', id), RequestMethods.GET)
    }


    static async addEKSToken(payload:any) {
        return await makeRequest(url.eksToken.addEKSToken, RequestMethods.POST, payload)
    }

    static async getEKSTokenById(id:any) {
        return await makeRequest(url.eksToken.getEKSTokenById + "/" + id, RequestMethods.GET)
    }


    static async updateEKSToken(id:any, payload:any) {
        return await makeRequest(url.eksToken.updateEksToken + "/" + id, RequestMethods.PUT, payload)
    }

    static async deleteEKSToken(id: any) {
        return await makeRequest(url.eksToken.deleteEksToken + "/" + id, RequestMethods.DELETE)
    }

    static async getClusterName(keyId: any) {
        return await makeRequest(url.eksToken.getClusterName + "/" + keyId, RequestMethods.GET)
    }

    static async uploadSshKey(formData:any) {
        return await makeUploadRequest(url.eksToken.addSshKey, RequestMethods.POST, formData)
    }

    static async getSshKey(query: any, pageNumber: number, pageSize: number) {
        const params = makeParams([
            {
                index: "search",
                value: query
            },
            {
                index: "page",
                value: pageNumber
            },
            {
                index: "limit",
                value: pageSize
            },
        ])
        return await makeRequest(url.eksToken.getSshKey + params, RequestMethods.GET)
    }

    // NEW: Get agent status dashboard with stats (supports optional date range and Windows credentials)
    static async getAgentStatusDashboard(keyId: any, startDate?: any, endDate?: any, windowsUsername?: string, windowsPassword?: string, signal?: AbortSignal) {
        const params = makeParams([
            {
                index: "startDate",
                value: startDate
            },
            {
                index: "endDate",
                value: endDate
            },
        ])

        // Use POST to send Windows credentials in body
        const body: any = {};
        if (windowsUsername) body.windowsUsername = windowsUsername;
        if (windowsPassword) body.windowsPassword = windowsPassword;

        return await makeRequest(url.eksToken.getAgentStatusDashboard + "/" + keyId + params, RequestMethods.POST, body, signal)
    }

    static async getZabbixStatus(keyId: any, sshUsername: any, sshKeyPath: any,operatingSystem: any, startDate:any, endDate: any ) {
        const params = makeParams([
            {
                index: "sshUsername",
                value: sshUsername
            },
            {
                index: "sshKeyPath",
                value: sshKeyPath
            },
            {
                index: "operatingSystem",
                value: operatingSystem
            },
            {
                index: "startDate",
                value: startDate
            },
            {
                index: "endDate",
                value: endDate
            },
        ])
        return await makeRequest(url.eksToken.getZabbixStatus + "/" + keyId + params, RequestMethods.GET)
    }


    static async deleteSshKey(sshId:any) {
        return await makeUploadRequest(url.eksToken.deleteSshKey + "/" + sshId, RequestMethods.DELETE)
    }

    // Cost Dashboard Methods
    static async getCostDashboard(keyId: any, days: number = 30) {
        const params = makeParams([
            {
                index: "days",
                value: days
            }
        ])
        return await makeRequest(url.cost.getCostDashboard + "/" + keyId + params, RequestMethods.GET)
    }

    static async getCostByService(keyId: any, startDate?: string, endDate?: string, granularity: string = 'DAILY') {
        const params = makeParams([
            {
                index: "startDate",
                value: startDate
            },
            {
                index: "endDate",
                value: endDate
            },
            {
                index: "granularity",
                value: granularity
            }
        ])
        return await makeRequest(url.cost.getCostByService + "/" + keyId + params, RequestMethods.GET)
    }

    static async getCostByResource(keyId: any, startDate?: string, endDate?: string) {
        const params = makeParams([
            {
                index: "startDate",
                value: startDate
            },
            {
                index: "endDate",
                value: endDate
            }
        ])
        return await makeRequest(url.cost.getCostByResource + "/" + keyId + params, RequestMethods.GET)
    }

    static async getEC2InstanceCosts(keyId: any) {
        return await makeRequest(url.cost.getEC2InstanceCosts + "/" + keyId, RequestMethods.GET)
    }

    static async getCostForecast(keyId: any) {
        return await makeRequest(url.cost.getCostForecast + "/" + keyId, RequestMethods.GET)
    }

    static async compareCosts(keyId: any, currentStart?: string, currentEnd?: string) {
        const params = makeParams([
            {
                index: "currentStart",
                value: currentStart
            },
            {
                index: "currentEnd",
                value: currentEnd
            }
        ])
        return await makeRequest(url.cost.compareCosts + "/" + keyId + params, RequestMethods.GET)
    }

    static async getTopServices(keyId: any, limit: number = 5, days: number = 30) {
        const params = makeParams([
            {
                index: "limit",
                value: limit
            },
            {
                index: "days",
                value: days
            }
        ])
        return await makeRequest(url.cost.getTopServices + "/" + keyId + params, RequestMethods.GET)
    }

    static async getBedrockCosts(keyId: any, days: number = 30) {
        const params = makeParams([
            {
                index: "days",
                value: days
            }
        ])
        return await makeRequest(url.cost.getBedrockCosts + "/" + keyId + params, RequestMethods.GET)
    }

    static async getBedrockPricing(keyId: any) {
        return await makeRequest(url.cost.getBedrockPricing + "/" + keyId, RequestMethods.GET)
    }

    static async getBedrockCostAnalysis(keyId: any, days: number = 30) {
        return await makeRequest(url.cost.getBedrockCostAnalysis + "/" + keyId + "?days=" + days, RequestMethods.GET)
    }

    static async calculateBedrockCost(keyId: any, payload: any) {
        return await makeRequest(url.cost.calculateBedrockCost + "/" + keyId, RequestMethods.POST, payload)
    }

    static async clearBedrockPricingCache() {
        return await makeRequest(url.cost.clearBedrockPricingCache, RequestMethods.POST)
    }

    // NEW: EC2 All Regions Methods
    static async getAllInstancesFromAllRegions() {
        return await makeRequest(url.instance.getAllInstancesFromAllRegions, RequestMethods.GET)
    }

    static async exportAllInstancesToExcel() {
        const response = await fetch(
            (import.meta.env.VITE_REACT_APP_API_URL || '') +
            (import.meta.env.VITE_REACT_APP_API_VER || '') +
            url.instance.exportAllInstancesToExcel,
            {
                method: 'GET',
                headers: {
                    'Authorization': sessionStorage.getItem('authKey') || '',
                },
            }
        );

        if (!response.ok) {
            throw new Error('Failed to export instances');
        }

        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `EC2_Instances_All_Regions_${moment().format('YYYY-MM-DD_HHmmss')}.xlsx`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(downloadUrl);

        return { success: true, message: 'Export successful' };
    }

    // NEW: EKS EC2 Instances Methods
    static async getAllEKSEC2InstancesFromAllRegions() {
        return await makeRequest(url.instance.getAllEKSEC2InstancesFromAllRegions, RequestMethods.GET)
    }

    static async exportAllEKSInstancesToExcel() {
        const response = await fetch(
            (import.meta.env.VITE_REACT_APP_API_URL || '') +
            (import.meta.env.VITE_REACT_APP_API_VER || '') +
            url.instance.exportAllEKSInstancesToExcel,
            {
                method: 'GET',
                headers: {
                    'Authorization': sessionStorage.getItem('authKey') || '',
                },
            }
        );

        if (!response.ok) {
            throw new Error('Failed to export EKS instances');
        }

        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `EKS_EC2_Instances_${moment().format('YYYY-MM-DD_HHmmss')}.xlsx`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(downloadUrl);

        return { success: true, message: 'Export successful' };
    }

    // Documentation Management
    static async uploadDocument(formData: FormData) {
        return await makeUploadRequest(url.documentation.upload, RequestMethods.POST, formData);
    }

    static async addDocumentLink(data: any) {
        // Use the same upload endpoint but with documentType=link
        const formData = new FormData();
        formData.append('title', data.title);
        formData.append('description', data.description);
        formData.append('category', data.category);
        formData.append('documentType', 'link');
        formData.append('referenceUrl', data.externalUrl);
        return await makeUploadRequest(url.documentation.upload, RequestMethods.POST, formData);
    }

    static async getAllDocuments(category?: string, search?: string) {
        const params = makeParams([
            {
                index: "category",
                value: category
            },
            {
                index: "search",
                value: search
            }
        ]);
        return await makeRequest(url.documentation.getAll + params, RequestMethods.GET);
    }

    static async getDocumentById(id: string) {
        return await makeRequest(url.documentation.getById + "/" + id, RequestMethods.GET);
    }

    static async updateDocument(id: string, data: any) {
        return await makeRequest(url.documentation.update + "/" + id, RequestMethods.PUT, data);
    }

    static async deleteDocument(id: string) {
        return await makeRequest(url.documentation.delete + "/" + id, RequestMethods.DELETE);
    }

    static async downloadDocument(id: string) {
        const response = await fetch(
            (import.meta.env.VITE_REACT_APP_API_URL || '') +
            (import.meta.env.VITE_REACT_APP_API_VER || '') +
            url.documentation.getById + "/" + id,
            {
                method: 'GET',
                headers: {
                    'Authorization': sessionStorage.getItem('authKey') || '',
                },
            }
        );

        if (!response.ok) {
            throw new Error('Failed to download document');
        }

        const data = await response.json();

        // If it's a link, return the URL for opening in new tab
        if (data.data.documentType === 'link') {
            return { data: data.data, status: 200 };
        }

        // For files, fetch the blob from the signed URL
        try {
            const fileResponse = await fetch(data.data.downloadUrl, {
                method: 'GET',
                mode: 'cors'
            });

            if (!fileResponse.ok) {
                throw new Error(`Failed to fetch file: ${fileResponse.status} ${fileResponse.statusText}`);
            }

            const blob = await fileResponse.blob();
            return { data: blob, status: 200 };
        } catch (error) {
            console.error('Error fetching file from S3:', error);
            throw new Error('Failed to download file from storage');
        }
    }

    static async shareDocument(id: string, payload: { email: string; permission: string }) {
        return await makeRequest(url.documentation.share + "/" + id, RequestMethods.POST, payload);
    }

    static async removeShareAccess(id: string, email: string) {
        return await makeRequest(url.documentation.removeShare + "/" + id + "/" + encodeURIComponent(email), RequestMethods.DELETE);
    }

    static async getDocumentCategories() {
        return await makeRequest(url.documentation.categories, RequestMethods.GET);
    }

    // API Logs Methods
    static async getApiLogs(filters: any = {}) {
        const params = makeParams([
            { index: "page", value: filters.page },
            { index: "limit", value: filters.limit },
            { index: "method", value: filters.method },
            { index: "statusCode", value: filters.statusCode },
            { index: "endpoint", value: filters.endpoint },
            { index: "username", value: filters.username },
            { index: "startDate", value: filters.startDate },
            { index: "endDate", value: filters.endDate }
        ]);
        return await makeRequest(url.apiLogs.getLogs + params, RequestMethods.GET);
    }

    static async getApiStats(filters: any = {}) {
        const params = makeParams([
            { index: "startDate", value: filters.startDate },
            { index: "endDate", value: filters.endDate }
        ]);
        return await makeRequest(url.apiLogs.getStats + params, RequestMethods.GET);
    }

    static async deleteOldApiLogs(days: number = 30) {
        const params = makeParams([
            { index: "days", value: days }
        ]);
        return await makeRequest(url.apiLogs.deleteOldLogs + params, RequestMethods.DELETE);
    }

    // Bedrock Usage Tracking
    static async logBedrockUsage(usageData: any) {
        return await makeRequest(url.bedrockUsage.logUsage, RequestMethods.POST, usageData);
    }

    static async getMyBedrockUsage(days: number = 30, region?: string) {
        const params = makeParams([
            { index: "days", value: days },
            { index: "region", value: region }
        ]);
        return await makeRequest(url.bedrockUsage.getMyUsage + params, RequestMethods.GET);
    }

    static async getUserBedrockUsage(userId: string, days: number = 30, region?: string) {
        const params = makeParams([
            { index: "days", value: days },
            { index: "region", value: region }
        ]);
        return await makeRequest(url.bedrockUsage.getUserUsage + "/" + userId + params, RequestMethods.GET);
    }

    static async getUserBedrockUsageByUsername(username: string, days: number = 30) {
        const params = makeParams([
            { index: "days", value: days }
        ]);
        return await makeRequest(url.bedrockUsage.getUserByUsername + "/" + username + params, RequestMethods.GET);
    }

    static async getInferenceProfileUsage(profileId: string, days: number = 30) {
        const params = makeParams([
            { index: "days", value: days }
        ]);
        return await makeRequest(url.bedrockUsage.getInferenceProfileUsage + "/" + profileId + params, RequestMethods.GET);
    }

    static async getAllUsersBedrockUsage(days: number = 30, region?: string) {
        const params = makeParams([
            { index: "days", value: days },
            { index: "region", value: region }
        ]);
        return await makeRequest(url.bedrockUsage.getAllUsersUsage + params, RequestMethods.GET);
    }

    static async getBedrockModelStats(days: number = 30, region?: string) {
        const params = makeParams([
            { index: "days", value: days },
            { index: "region", value: region }
        ]);
        return await makeRequest(url.bedrockUsage.getModelStats + params, RequestMethods.GET);
    }

    static async getBedrockAdminAnalytics(days: number = 30, region?: string) {
        const params = makeParams([
            { index: "days", value: days },
            { index: "region", value: region }
        ]);
        return await makeRequest(url.bedrockUsage.getAdminAnalytics + params, RequestMethods.GET);
    }

    static async cleanupBedrockUsage(daysToKeep: number = 90) {
        const params = makeParams([
            { index: "daysToKeep", value: daysToKeep }
        ]);
        return await makeRequest(url.bedrockUsage.cleanup + params, RequestMethods.DELETE);
    }

    // Terminal File Upload Methods
    static async uploadFileToServer(formData: FormData) {
        return await makeUploadRequest(url.terminal.upload, RequestMethods.POST, formData);
    }

    static async downloadFileFromServer(payload: any) {
        return await makeRequest(url.terminal.download, RequestMethods.POST, payload);
    }

    static async listTerminalUploads() {
        return await makeRequest(url.terminal.listUploads, RequestMethods.GET);
    }

}
