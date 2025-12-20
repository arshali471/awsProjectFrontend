const url = {
    login: "/user/login",
    getAllAwsKey: "/awsKey/getAllAWSKey",
    getAwsKeyById: "/awsKey/getAWSKeyById",
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
        getBedrockCosts: "/aws/cost/bedrock",
        getBedrockPricing: "/aws/cost/bedrock-pricing",
        getBedrockCostAnalysis: "/aws/cost/bedrock-cost-analysis",
        calculateBedrockCost: "/aws/cost/bedrock-calculate",
        clearBedrockPricingCache: "/aws/cost/bedrock-pricing/clear-cache",
    },

    aiChat: {
        baseUrl: import.meta.env.VITE_AI_CHAT_API_URL || "http://10.35.58.168:8000",
        query: "/query",
        queryStream: "/query/stream",
        serverName: "awslabs.cloudtrail-mcp-server"
    },

    kubeBot: {
        baseUrl: import.meta.env.VITE_KUBEBOT_API_URL || "http://10.35.58.168:8001",
        query: "/query",
        queryStream: "/query/stream",
        serverName: "kubernetes-mcp-server"
    },

    documentation: {
        upload: "/aws/documentation/upload",
        getAll: "/aws/documentation",
        getById: "/aws/documentation",
        update: "/aws/documentation",
        delete: "/aws/documentation",
        categories: "/aws/documentation/categories",
        share: "/aws/documentation/share",
        removeShare: "/aws/documentation/share"
    },

    apiLogs: {
        getLogs: "/api-logs/logs",
        getStats: "/api-logs/stats",
        deleteOldLogs: "/api-logs/old-logs"
    }

};

export default url;
