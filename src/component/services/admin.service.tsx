import moment from "moment";
import makeRequest, { makeParams } from "../api/makeRequest";
import { RequestMethods } from "../api/requestMethode";
import url from "../api/urls";
import makeUploadRequest from "../api/uploadRequest";

export class AdminService {
    static async getAllAwsKey() {
        return await makeRequest(url.getAllAwsKey, RequestMethods.GET)
    }

    static async getUserData() {
        return await makeRequest(url.getUserData, RequestMethods.GET)
    }

    static async getAllUsers() {
        return await makeRequest(url.getAllUsers, RequestMethods.GET)
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

    static async getAllEksToken(query: any, pageNumber: number, pageSize: number, filter: any) {
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
                index: "pageSize",
                value: pageSize
            },
            {
                index: "filter",
                value: filter
            }
        ])
        return await makeRequest(url.eksToken.getAllEksToken + params, RequestMethods.GET)
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

    // NEW: Get agent status dashboard with stats (supports optional date range)
    static async getAgentStatusDashboard(keyId: any, startDate?: any, endDate?: any) {
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
        return await makeRequest(url.eksToken.getAgentStatusDashboard + "/" + keyId + params, RequestMethods.GET)
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

}
