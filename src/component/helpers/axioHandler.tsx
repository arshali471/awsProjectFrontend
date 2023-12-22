import Auth from "../Auth/auth";


export default function axiosHandler(error: any) {
    if (error.response) {
        if (error.response.status === 401) {
            Auth.signout();
            window.location.href = "/login"
        }
        if (error.response.data.status === 406) {
            Auth.signout();
            window.location.href = "/login"
        }
        // else{
        //     toast.error(error.response.data.message || error.response.data || 'Something Went Wrong');
        // }
    }
    return;
}