import axios, { AxiosRequestConfig, Method } from 'axios';
import { RequestMethods } from './requestMethode';
import axiosHandler from '../helpers/axioHandler';


export default async function makeUploadRequest(url: string, method: Method, formData?: any) {
    let requestConfig: AxiosRequestConfig = {
        baseURL: `${import.meta.env.VITE_REACT_APP_API_URL}${import.meta.env.VITE_REACT_APP_API_VER}`,
        url: url,
        method: method,
        headers: {
            Authorization: sessionStorage.getItem("authKey") || "",
            "Content-Type": "multipart/form-data",
        }
    };

    if (method !== 'get' && formData) {
        requestConfig.data = formData;
    }

    try {
        let response = await axios.request(requestConfig);
        return response;
    } catch (error: any) {
        axiosHandler(error);
        throw error;
    }
}
