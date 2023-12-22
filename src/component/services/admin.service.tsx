import makeRequest from "../api/makeRequest";
import { RequestMethods } from "../api/requestMethode";
import url from "../api/urls";

export class AdminService {
    static async getAllAwsKey() {
        return await makeRequest(url.getAllAwsKey, RequestMethods.GET)
    }

    static async getAllInstance(keyId: any) {
        return await makeRequest(url.instance.getAllInstance + "/" + keyId, RequestMethods.GET)
    }
}
