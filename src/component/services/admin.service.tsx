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

    static async deleteSshKey(sshId:any) {
        return await makeUploadRequest(url.eksToken.deleteSshKey + "/" + sshId, RequestMethods.DELETE)
    }

    
    
}
