const url = {
    login: "/user/login",
    logout: "/user/logout",
    refreshToken: "/user/refresh-token",
    microsoftCallback: '/auth/microsoft/callback',
    azureConfig: '/auth/azure/config',
    getAllAwsKey: "/awsKey/getAllAWSKey",
    getAwsKeyById: "/awsKey/getAWSKeyById",
    getAccountsAndRegions: "/awsKey/getAccountsAndRegions",
    getCredentials: "/awsKey/getCredentials",
    getAllS3Data: "/aws/getS3Bucket",
    getS3Objects: "/aws/getS3Objects",
    getS3ObjectsPaginated: "/aws/getS3ObjectsPaginated",
    getS3BucketConfiguration: "/aws/getS3BucketConfiguration",
    getUserData: "/user/getUserById",
    getAllUsers: "/user/getAllUser",
    getUsersWithSessionStatus: "/sessions/users-with-status",
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
        getVolumeById: "/aws/getVolumeById",
        getSnapshotsByVolumeId: "/aws/getSnapshotsByVolumeId",
        getGlobalInstance: "/aws/getInstanceDetailsByGlobalSearch",
        getInstanceDetails: "/aws/getInstanceDetailsByInstanceId",
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
        getEKSTokenContent: "/aws/getEKSTokenContent/:id",
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
    },

    bedrockUsage: {
        logUsage: "/bedrock-usage/log",
        getMyUsage: "/bedrock-usage/my-usage",
        getUserUsage: "/bedrock-usage/user",
        getUserByUsername: "/bedrock-usage/user/by-username",
        getInferenceProfileUsage: "/bedrock-usage/inference-profile",
        getAllUsersUsage: "/bedrock-usage/all-users",
        getModelStats: "/bedrock-usage/model-stats",
        getAdminAnalytics: "/bedrock-usage/admin/analytics",
        cleanup: "/bedrock-usage/cleanup"
    },

    terminal: {
        upload: "/terminal/upload",
        download: "/terminal/download",
        listUploads: "/terminal/uploads",
        listFiles: "/terminal/list-files",
        transferFile: "/terminal/transfer-file",
        deleteFile: "/terminal/delete-file",
        createFolder: "/terminal/create-folder",
        readFile: "/terminal/read-file",
        writeFile: "/terminal/write-file"
    }

};

export default url;
export const URLS = {
    TERMINAL: {
        UPLOAD: "/terminal/upload",
        DOWNLOAD: "/terminal/download",
        LIST_UPLOADS: "/terminal/uploads",
        LIST_FILES: "/terminal/list-files",
        TRANSFER_FILE: "/terminal/transfer-file",
        DELETE_FILE: "/terminal/delete-file",
        CREATE_FOLDER: "/terminal/create-folder",
        READ_FILE: "/terminal/read-file",
        WRITE_FILE: "/terminal/write-file"
    }
};
