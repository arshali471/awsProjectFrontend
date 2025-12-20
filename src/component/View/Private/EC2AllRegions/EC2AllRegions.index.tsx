import { useContext, useEffect, useState } from "react"
import { LoadingContext } from "../../../context/context"
import { AdminService } from "../../../services/admin.service";
import EC2AllRegionsTable from "../../../Table/EC2AllRegions.table";
import { FaSearch, FaServer } from "react-icons/fa";
import { MdCloudQueue } from "react-icons/md";
import { Box, Typography, IconButton, CircularProgress, Button, Tabs, Tab, Chip } from "@mui/material";
import CloudIcon from "@mui/icons-material/Cloud";
import RefreshIcon from "@mui/icons-material/Refresh";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import toast from "react-hot-toast";
import "../SharedPage.css";
import { BsStopCircle } from "react-icons/bs";
import PublicIcon from '@mui/icons-material/Public';

export default function EC2AllRegionsIndex() {
    const { loading, setLoading }: any = useContext(LoadingContext);

    const [ec2Data, setEc2Data] = useState<any>([]);
    const [filteredData, setFilteredData] = useState<any>([]);
    const [searchText, setSearchText] = useState<string>('');
    const [refreshing, setRefreshing] = useState(false);
    const [stats, setStats] = useState({
        totalCount: 0,
        runningCount: 0,
        stoppedCount: 0
    });
    const [exporting, setExporting] = useState(false);
    const [selectedTab, setSelectedTab] = useState<string>('all');
    const [accountGroups, setAccountGroups] = useState<any>({});

    const getAllEC2Data = async (showRefreshing = false) => {
        if (showRefreshing) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }
        try {
            const res = await AdminService.getAllInstancesFromAllRegions();
            if (res.status === 200 && res.data.success) {
                const instances = res.data.data;
                setEc2Data(instances);
                setFilteredData(instances);
                setStats({
                    totalCount: res.data.statistics.totalCount,
                    runningCount: res.data.statistics.runningCount,
                    stoppedCount: res.data.statistics.stoppedCount
                });

                // Group instances by Environment (Region)
                const groups: any = {};
                instances.forEach((instance: any) => {
                    const key = `${instance.Environment} (${instance.Region})`;
                    if (!groups[key]) {
                        groups[key] = {
                            instances: [],
                            totalCount: 0,
                            runningCount: 0,
                            stoppedCount: 0
                        };
                    }
                    groups[key].instances.push(instance);
                    groups[key].totalCount++;
                    if (instance.State === 'running') groups[key].runningCount++;
                    if (instance.State === 'stopped') groups[key].stoppedCount++;
                });
                setAccountGroups(groups);

                toast.success(res.data.message || "EC2 instances fetched successfully");
            }
        } catch (error: any) {
            console.error("Error fetching EC2 data", error);
            toast.error(error?.response?.data?.message || "Failed to fetch EC2 instances");
        }
        if (showRefreshing) {
            setRefreshing(false);
        } else {
            setLoading(false);
        }
    };

    const handleRefresh = () => {
        getAllEC2Data(true);
    };

    const handleExportExcel = async () => {
        setExporting(true);
        try {
            await AdminService.exportAllInstancesToExcel();
            toast.success("Export successful! Check your downloads.");
        } catch (error: any) {
            console.error("Error exporting data", error);
            toast.error("Failed to export data");
        }
        setExporting(false);
    };

    // Filter data based on selected tab and search text
    useEffect(() => {
        let dataToFilter = ec2Data;

        // Filter by tab first
        if (selectedTab !== 'all') {
            dataToFilter = accountGroups[selectedTab]?.instances || [];
        }

        // Then apply search filter
        if (searchText) {
            const filtered = dataToFilter.filter((instance: any) => {
                const searchStr = `
                    ${instance?.InstanceName || ''}
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
    }, [searchText, ec2Data, selectedTab, accountGroups]);

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
        getAllEC2Data();
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
                            <CloudIcon sx={{ fontSize: 32 }} />
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
                                Cloud EC2 Inventory
                            </Typography>
                            <Typography
                                variant="body2"
                                sx={{
                                    color: '#6c757d',
                                    mt: 0.5,
                                }}
                            >
                                View and manage all EC2 instances across all AWS regions and environments
                            </Typography>
                        </Box>
                    </Box>
                    <Box display="flex" gap={1}>
                        <Button
                            variant="contained"
                            onClick={handleExportExcel}
                            disabled={exporting || ec2Data.length === 0}
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

            {/* Tabs for Account Selection */}
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
                        icon={<PublicIcon />}
                        iconPosition="start"
                        label={
                            <Box display="flex" alignItems="center" gap={1}>
                                All Accounts
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
                    {Object.entries(accountGroups).map(([key, group]: [string, any]) => (
                        <Tab
                            key={key}
                            icon={<CloudIcon />}
                            iconPosition="start"
                            label={
                                <Box display="flex" alignItems="center" gap={1}>
                                    {key}
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
                            {selectedTab === 'all' ? 'Total Instances' : 'Instances in Account'}
                        </span>
                        <div className="stat-card-icon">
                            <MdCloudQueue />
                        </div>
                    </div>
                    <h2 className="stat-card-value">{currentStats.totalCount}</h2>
                    {selectedTab === 'all' && (
                        <p style={{ fontSize: '12px', color: '#6c757d', marginTop: '8px' }}>
                            Across {Object.keys(accountGroups).length} account(s)
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
                            placeholder="Search by instance name, ID, IP, region, environment..."
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="table-container">
                <EC2AllRegionsTable tableData={filteredData} loading={loading} />
            </div>
        </div>
    )
}
