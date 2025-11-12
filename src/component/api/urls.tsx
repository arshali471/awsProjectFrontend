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
    getEksCluster: "/aws/getEksCluster",
    getAllRDSData: "/aws/getRdsInstance",
    changeUserPassword: "/user/changePassword",
    changePasswordByAdmin: "/user/changePasswordByAdmin",
    instance: {
        getAllInstance: "/aws/getAllInstance",
        getAllVolumesData: "/aws/getVolumes",
        getGlobalInstance: "/aws/getInstanceDetailsByGlobalSearch",
        getAllInstancesFromAllRegions: "/aws/getAllInstancesFromAllRegions",
        exportAllInstancesToExcel: "/aws/exportAllInstancesToExcel",
        getAllEKSEC2InstancesFromAllRegions: "/aws/getAllEKSEC2InstancesFromAllRegions",
        exportAllEKSInstancesToExcel: "/aws/exportAllEKSInstancesToExcel",
    },

    eksToken: {
        getAllEksToken: "/aws/getAllEKSToken",
        updateEksToken: "/aws/updateEksToken",
        deleteEksToken: "/aws/deleteEksToken",
        addEKSToken: "/aws/addEKSToken",
        getEKSTokenById: "/aws/getEKSTokenById",
        addSshKey: "/aws/addSshKey",
        getSshKey: "/aws/getSshKey",
        deleteSshKey: "/aws/deleteSshKey",
        getAgentStatusDashboard: "/aws/getAgentStatusDashboard",
        getZabbixStatus:"/aws/getZabbixStatus",
        getClusterName: "/aws/getEksClusterName",
    },

    cost: {
        getCostDashboard: "/aws/cost/dashboard",
        getCostByService: "/aws/cost/by-service",
        getCostByResource: "/aws/cost/by-resource",
        getEC2InstanceCosts: "/aws/cost/ec2-instances",
        getCostForecast: "/aws/cost/forecast",
        compareCosts: "/aws/cost/compare",
        getTopServices: "/aws/cost/top-services",
    }

};

export default url;
