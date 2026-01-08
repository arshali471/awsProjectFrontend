import { useContext, useEffect, useState } from "react"
import { LoadingContext } from "../../../context/context"
import { AdminService } from "../../../services/admin.service";
import EKSEC2InstancesTable from "../../../Table/EKSEC2Instances.table";
import { FaSearch, FaServer } from "react-icons/fa";
import { MdCloudQueue } from "react-icons/md";
import { Box, Typography, IconButton, CircularProgress, Button, Tabs, Tab, Chip } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import toast from "react-hot-toast";
import "../SharedPage.css";
import { BsStopCircle } from "react-icons/bs";
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import DnsIcon from '@mui/icons-material/Dns';

export default function EKSInstancesIndex() {
    const { loading, setLoading }: any = useContext(LoadingContext);

    const [eksData, setEksData] = useState<any>([]);
    const [filteredData, setFilteredData] = useState<any>([]);
    const [searchText, setSearchText] = useState<string>('');
    const [refreshing, setRefreshing] = useState(false);
    const [stats, setStats] = useState({
        totalCount: 0,
        runningCount: 0,
        stoppedCount: 0,
        clusterCount: 0
    });
    const [exporting, setExporting] = useState(false);
    const [selectedTab, setSelectedTab] = useState<string>('all');
    const [clusterGroups, setClusterGroups] = useState<any>({});

    const getAllEKSData = async (showRefreshing = false) => {
        if (showRefreshing) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }
        try {
            const res = await AdminService.getAllEKSEC2InstancesFromAllRegions();
            if (res.status === 200 && res.data.success) {
                const instances = res.data.data;
                setEksData(instances);
                setFilteredData(instances);
                setStats({
                    totalCount: res.data.statistics.totalCount,
                    runningCount: res.data.statistics.runningCount,
                    stoppedCount: res.data.statistics.stoppedCount,
                    clusterCount: res.data.statistics.clusterCount
                });

                // Group instances by ClusterName
                const groups: any = {};
                instances.forEach((instance: any) => {
                    const key = instance.ClusterName;
                    if (!groups[key]) {
                        groups[key] = {
                            instances: [],
                            totalCount: 0,
                            runningCount: 0,
                            stoppedCount: 0,
                            environment: instance.Environment,
                            region: instance.Region
                        };
                    }
                    groups[key].instances.push(instance);
                    groups[key].totalCount++;
                    if (instance.State === 'running') groups[key].runningCount++;
                    if (instance.State === 'stopped') groups[key].stoppedCount++;
                });
                setClusterGroups(groups);

                toast.success(res.data.message || "EKS EC2 instances fetched successfully");
            }
        } catch (error: any) {
            console.error("Error fetching EKS EC2 data", error);
            toast.error(error?.response?.data?.message || "Failed to fetch EKS EC2 instances");
        }
        if (showRefreshing) {
            setRefreshing(false);
        } else {
            setLoading(false);
        }
    };

    const handleRefresh = () => {
        getAllEKSData(true);
    };

    const handleExportExcel = async () => {
        setExporting(true);
        try {
            await AdminService.exportAllEKSInstancesToExcel();
            toast.success("Export successful! Check your downloads.");
        } catch (error: any) {
            console.error("Error exporting data", error);
            toast.error("Failed to export data");
        }
        setExporting(false);
    };

    // Filter data based on selected tab and search text
    useEffect(() => {
        let dataToFilter = eksData;

        // Filter by tab first
        if (selectedTab !== 'all') {
            dataToFilter = clusterGroups[selectedTab]?.instances || [];
        }

        // Then apply search filter
        if (searchText) {
            const filtered = dataToFilter.filter((instance: any) => {
                const searchStr = `
                    ${instance?.InstanceName || ''}
                    ${instance?.ClusterName || ''}
                    ${instance?.NodeGroupName || ''}
                    ${instance?.InstanceId || ''}
                    ${instance?.InstanceType || ''}
                    ${instance?.State || ''}
                    ${instance?.PrivateIpAddress || ''}
                    ${instance?.PublicIpAddress || ''}
                    ${instance?.Environment || ''}
                    ${instance?.Region || ''}
                `.toLowerCase();
                return searchStr.includes(searchText.toLowerCase());
            });
            setFilteredData(filtered);
        } else {
            setFilteredData(dataToFilter);
        }
    }, [searchText, eksData, selectedTab, clusterGroups]);

    const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
        setSelectedTab(newValue);
        setSearchText(''); // Clear search when switching tabs
    };

    // Calculate stats for current view (tab + search)
    const currentStats = {
        totalCount: filteredData.length,
        runningCount: filteredData.filter((i: any) => i.State === 'running').length,
        stoppedCount: filteredData.filter((i: any) => i.State === 'stopped').length
    };

    useEffect(() => {
        getAllEKSData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="page-wrapper">
            {/* Page Header */}
            <Box sx={{ mb: 3 }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box display="flex" alignItems="center" gap={2}>
                        <Box
                            sx={{
                                width: 56,
                                height: 56,
                                background: 'linear-gradient(135deg, #FF9900 0%, #FF6600 100%)',
                                borderRadius: '16px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                boxShadow: '0 4px 16px rgba(255, 153, 0, 0.3)',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 8px 20px rgba(255, 153, 0, 0.4)',
                                }
                            }}
                        >
                            <DnsIcon sx={{ fontSize: 32 }} />
                        </Box>
                        <Box>
                            <Typography
                                variant="h4"
                                sx={{
                                    fontWeight: 700,
                                    color: '#232f3e',
                                    letterSpacing: '-0.5px',
                                }}
                            >
                                EKS Nodes Inventory
                            </Typography>
                            <Typography
                                variant="body2"
                                sx={{
                                    color: '#6c757d',
                                    mt: 0.5,
                                }}
                            >
                                View and manage EC2 instances running in EKS clusters across all regions
                            </Typography>
                        </Box>
                    </Box>
                    <Box display="flex" gap={1}>
                        <Button
                            variant="contained"
                            onClick={handleExportExcel}
                            disabled={exporting || eksData.length === 0}
                            startIcon={exporting ? <CircularProgress size={20} sx={{ color: 'white' }} /> : <FileDownloadIcon />}
                            sx={{
                                borderRadius: 2,
                                textTransform: 'none',
                                fontWeight: 600,
                                px: 3,
                                background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #218838 0%, #1aa179 100%)',
                                },
                                '&.Mui-disabled': {
                                    background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                                    color: 'white',
                                    opacity: 0.7,
                                }
                            }}
                        >
                            {exporting ? 'Exporting...' : 'Export to Excel'}
                        </Button>
                        <IconButton
                            onClick={handleRefresh}
                            disabled={refreshing}
                            sx={{
                                background: 'linear-gradient(135deg, #FF9900 0%, #FF6600 100%)',
                                color: 'white',
                                width: 48,
                                height: 48,
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #FF6600 0%, #FF3300 100%)',
                                    transform: 'rotate(180deg)',
                                },
                                transition: 'all 0.3s ease',
                                '&.Mui-disabled': {
                                    background: 'linear-gradient(135deg, #FF9900 0%, #FF6600 100%)',
                                    color: 'white',
                                    opacity: 0.7,
                                }
                            }}
                        >
                            {refreshing ? <CircularProgress size={24} sx={{ color: 'white' }} /> : <RefreshIcon />}
                        </IconButton>
                    </Box>
                </Box>
            </Box>

            {/* Tabs for Cluster Selection */}
            <Box sx={{
                borderBottom: 1,
                borderColor: 'divider',
                mb: 3,
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '0 16px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}>
                <Tabs
                    value={selectedTab}
                    onChange={handleTabChange}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{
                        '& .MuiTab-root': {
                            textTransform: 'none',
                            fontWeight: 600,
                            fontSize: '14px',
                            minHeight: '56px',
                        },
                        '& .Mui-selected': {
                            color: '#FF9900',
                        },
                        '& .MuiTabs-indicator': {
                            backgroundColor: '#FF9900',
                            height: '3px',
                        }
                    }}
                >
                    <Tab
                        icon={<AccountTreeIcon />}
                        iconPosition="start"
                        label={
                            <Box display="flex" alignItems="center" gap={1}>
                                All Clusters
                                <Chip
                                    label={stats.totalCount}
                                    size="small"
                                    sx={{
                                        backgroundColor: '#FF9900',
                                        color: 'white',
                                        fontWeight: 'bold',
                                        height: '20px'
                                    }}
                                />
                            </Box>
                        }
                        value="all"
                    />
                    {Object.entries(clusterGroups).map(([key, group]: [string, any]) => (
                        <Tab
                            key={key}
                            icon={<DnsIcon />}
                            iconPosition="start"
                            label={
                                <Box display="flex" alignItems="center" gap={1}>
                                    <Box>
                                        <div style={{ fontSize: '14px', fontWeight: 600 }}>{key}</div>
                                        <div style={{ fontSize: '11px', color: '#6c757d', fontWeight: 400 }}>
                                            {group.environment} - {group.region}
                                        </div>
                                    </Box>
                                    <Chip
                                        label={group.totalCount}
                                        size="small"
                                        color="primary"
                                        sx={{
                                            fontWeight: 'bold',
                                            height: '20px'
                                        }}
                                    />
                                </Box>
                            }
                            value={key}
                        />
                    ))}
                </Tabs>
            </Box>

            {/* Stats Cards - Show stats for current view */}
            <div className="stats-container">
                <div className="stat-card">
                    <div className="stat-card-header">
                        <span className="stat-card-title">
                            {selectedTab === 'all' ? 'Total EKS Instances' : 'Instances in Cluster'}
                        </span>
                        <div className="stat-card-icon">
                            <MdCloudQueue />
                        </div>
                    </div>
                    <h2 className="stat-card-value">{currentStats.totalCount}</h2>
                    {selectedTab === 'all' && (
                        <p style={{ fontSize: '12px', color: '#6c757d', marginTop: '8px' }}>
                            Across {stats.clusterCount} cluster(s)
                        </p>
                    )}
                </div>
                <div className="stat-card">
                    <div className="stat-card-header">
                        <span className="stat-card-title">Running Instances</span>
                        <div className="stat-card-icon" style={{ color: '#28a745' }}>
                            <FaServer />
                        </div>
                    </div>
                    <h2 className="stat-card-value" style={{ color: '#28a745' }}>{currentStats.runningCount}</h2>
                    <p style={{ fontSize: '12px', color: '#6c757d', marginTop: '8px' }}>
                        {currentStats.totalCount > 0 ? `${((currentStats.runningCount / currentStats.totalCount) * 100).toFixed(1)}%` : '0%'} of total
                    </p>
                </div>
                <div className="stat-card">
                    <div className="stat-card-header">
                        <span className="stat-card-title">Stopped Instances</span>
                        <div className="stat-card-icon" style={{ color: '#dc3545' }}>
                            <BsStopCircle />
                        </div>
                    </div>
                    <h2 className="stat-card-value" style={{ color: '#dc3545' }}>{currentStats.stoppedCount}</h2>
                    <p style={{ fontSize: '12px', color: '#6c757d', marginTop: '8px' }}>
                        {currentStats.totalCount > 0 ? `${((currentStats.stoppedCount / currentStats.totalCount) * 100).toFixed(1)}%` : '0%'} of total
                    </p>
                </div>
            </div>

            {/* Search Bar */}
            <div className="action-bar">
                <div className="action-bar-left">
                    <div className="search-box">
                        <FaSearch className="search-icon" />
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Search by cluster, instance name, ID, IP, node group, region..."
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="table-container">
                <EKSEC2InstancesTable tableData={filteredData} loading={loading} />
            </div>
        </div>
    )
}
