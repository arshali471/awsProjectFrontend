import axios, { Method } from 'axios';
import axiosHandler from '../helpers/axioHandler';

export interface IParams {
    value: any,
    index: string
}


export default async function makeRequest(url: string, method: Method, inputPayload?: any) {
    let requestConfig = {
        baseURL: `${import.meta.env.VITE_REACT_APP_API_URL}${import.meta.env.VITE_REACT_APP_API_VER}`,
        url: url,
        method: method,
        headers: {
            Authorization: sessionStorage.getItem("authKey") || ""
        },
        data: {}
    };

    if (method !== 'get' && inputPayload) {
        requestConfig.data = inputPayload;
    }

    try {
        let response = await axios.request(requestConfig);
        return response;
    } catch (error: any) {
        axiosHandler(error);
        throw error;
    }

}

export function makeParams(params: IParams[]) {
    let paramString = "?"
    for (const param in params) {
        if (params[param].value) {
            if (Number(param) != 0) paramString = paramString + "&"
            paramString = paramString + params[param].index + "=" + params[param].value
        }
    }
    return paramString;
}