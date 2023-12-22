const Auth = {
    isAuthenticated: false,
    authenticate() {
        if (sessionStorage.getItem("authKey")) {
            this.isAuthenticated = true;
        }
    },
    signout() {
        this.isAuthenticated = false;
        sessionStorage.removeItem("authKey");
    },
    getAuth() {
        return this.isAuthenticated;
    },
    checkAuth() {
        this.authenticate();
        return this.isAuthenticated;
    }
};

export default Auth;