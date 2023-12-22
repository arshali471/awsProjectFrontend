import axios, { AxiosRequestConfig, Method } from 'axios';
import { RequestMethods } from './requestMethode';


export default async function makeUploadRequest(url: string, method: Method, formData?: any) {
    let requestConfig: AxiosRequestConfig = {
        baseURL: `${process.env.REACT_APP_API_URL}${process.env.REACT_APP_API_VER}`,
        url: url,
        method: method,
        headers: {
            Authorization: sessionStorage.getItem("authKey") || "",
            "Content-Type": "multipart/form-data",
        }
    };

    if (method !== RequestMethods.GET && formData) {
        requestConfig.data = formData;
    }

    return await axios.request(requestConfig);
}
