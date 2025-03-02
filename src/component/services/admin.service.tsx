import makeRequest from "../api/makeRequest";
import { RequestMethods } from "../api/requestMethode";
import url from "../api/urls";

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


    static async getAllInstance(keyId: any) {
        return await makeRequest(url.instance.getAllInstance + "/" + keyId, RequestMethods.GET)
    }

    static async getEksCluster(keyId: any) {
        return await makeRequest(url.getEksCluster + "/" + keyId, RequestMethods.GET)
    }


    static async getAllS3Data(keyId: any) {
        return await makeRequest(url.getAllS3Data + "/" + keyId, RequestMethods.GET)
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
}
