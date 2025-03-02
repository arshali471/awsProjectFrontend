const url = {
    login: "/user/login",
    getAllAwsKey: "/awsKey/getAllAWSKey",
    getAllS3Data: "/aws/getS3Bucket",
    getUserData: "/user/getUserById",
    getAllUsers: "/user/getAllUser",
    createUser: "/user/createUser",
    createAWSKey: "/awsKey/createAWSKey",
    updateUser: 'user/updateUser',
    deleteUser: "/user/deleteUser",
    deleteAwsKey: "/awsKey/deleteApiKey",
    updateAwsKey: "/awsKey/updateApiKey",
    getAwsRegion: "/awsKey/getAWSRegions",
    getEksCluster:"/aws/getEksCluster",
    instance: {
        getAllInstance: "/aws/getAllInstance"
    }

};

export default url;
