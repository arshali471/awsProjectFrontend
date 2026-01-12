import makeRequest from "../api/makeRequest";
import { RequestMethods } from "../api/requestMethode";
import url from "../api/urls";

export class AuthService {
    static async login(payload: any) {
        return await makeRequest(url.login, RequestMethods.POST, payload)
    }

    static async logout() {
        return await makeRequest(url.logout, RequestMethods.POST, {})
    }
}