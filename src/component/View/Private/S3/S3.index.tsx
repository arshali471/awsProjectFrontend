import { useContext, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { LoadingContext, SelectedRegionContext, SelectedAccountContext } from "../../../context/context"
import { AdminService } from "../../../services/admin.service";
import S3Table from "../../../Table/S3.table";
import { FaDatabase, FaSearch } from "react-icons/fa";
import { MdCloudQueue } from "react-icons/md";
import { Box, Typography, IconButton, CircularProgress } from "@mui/material";
import StorageIcon from "@mui/icons-material/Storage";
import RefreshIcon from "@mui/icons-material/Refresh";
import "../SharedPage.css";

export default function S3Index() {
    const navigate = useNavigate();
    const { selectedRegion }: any = useContext(SelectedRegionContext);
    const { selectedAccount }: any = useContext(SelectedAccountContext);
    const { loading, setLoading }: any = useContext(LoadingContext);

    const [s3Data, setS3Data] = useState<any>([]);
    const [filteredData, setFilteredData] = useState<any>([]);
    const [searchText, setSearchText] = useState<string>('');
    const [refreshing, setRefreshing] = useState(false);

    const fetchCredentialsAndData = async (showRefreshing = false) => {
        if (!selectedAccount?.value || !selectedRegion?.value) {
            return;
        }

        if (showRefreshing) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }

        try {
            // Get credentials for selected account and region
            const credsRes = await AdminService.getCredentialsByAccountAndRegion(
                selectedAccount.value,
                selectedRegion.value
            );

            if (credsRes.status === 200 && credsRes.data._id) {
                // Fetch S3 data using the credentials ID and region
                const res = await AdminService.getAllS3Data(credsRes.data._id, selectedRegion.value);
                if (res.status === 200) {
                    setS3Data(res.data);
                    setFilteredData(res.data);
                }
            }
        } catch (error) {
            console.error("Error fetching S3 data", error);
            setS3Data([]);
            setFilteredData([]);
        }

        if (showRefreshing) {
            setRefreshing(false);
        } else {
            setLoading(false);
        }
    };

    const handleRefresh = () => {
        fetchCredentialsAndData(true);
    };

    const handleBucketClick = (bucket: any) => {
        navigate("/platform/s3/objects", { state: { bucket } });
    };

    useEffect(() => {
        if (searchText) {
            const filtered = s3Data.filter((bucket: any) => {
                const searchStr = `${bucket?.Name || bucket?.bucketName || ''} ${bucket?.location || ''} ${bucket?.CreationDate || ''}`.toLowerCase();
                return searchStr.includes(searchText.toLowerCase());
            });
            setFilteredData(filtered);
        } else {
            setFilteredData(s3Data);
        }
    }, [searchText, s3Data]);

    useEffect(() => {
        if (selectedAccount?.value && selectedRegion?.value) {
            setSearchText("");
            fetchCredentialsAndData();
        } else {
            // Clear data if account or region is not selected
            setS3Data([]);
            setFilteredData([]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedAccount?.value, selectedRegion?.value]);

    // Calculate total size
    const totalSize = filteredData.reduce((acc: number, bucket: any) => {
        const size = parseFloat(bucket?.size || 0);
        return acc + (isNaN(size) ? 0 : size);
    }, 0);

    return (
        <div className="page-wrapper">
            {/* Page Header - Matching Dashboard Style */}
            <Box sx={{ mb: 3 }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box display="flex" alignItems="center" gap={2}>
                        <Box
                            sx={{
                                width: 56,
                                height: 56,
                                background: 'linear-gradient(135deg, #0073bb 0%, #1a8cd8 100%)',
                                borderRadius: '16px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                boxShadow: '0 4px 16px rgba(0, 115, 187, 0.3)',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 8px 20px rgba(0, 115, 187, 0.4)',
                                }
                            }}
                        >
                            <StorageIcon sx={{ fontSize: 32 }} />
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
                                S3 Buckets
                            </Typography>
                            <Typography
                                variant="body2"
                                sx={{
                                    color: '#6c757d',
                                    mt: 0.5,
                                }}
                            >
                                Manage and monitor your Amazon S3 storage buckets
                            </Typography>
                        </Box>
                    </Box>
                    <IconButton
                        onClick={handleRefresh}
                        disabled={refreshing || !selectedAccount || !selectedRegion}
                        sx={{
                            background: 'linear-gradient(135deg, #0073bb 0%, #1a8cd8 100%)',
                            color: 'white',
                            width: 48,
                            height: 48,
                            '&:hover': {
                                background: 'linear-gradient(135deg, #005a94 0%, #1570b8 100%)',
                                transform: 'rotate(180deg)',
                            },
                            transition: 'all 0.3s ease',
                            '&.Mui-disabled': {
                                background: 'linear-gradient(135deg, #0073bb 0%, #1a8cd8 100%)',
                                color: 'white',
                                opacity: 0.7,
                            }
                        }}
                    >
                        {refreshing ? <CircularProgress size={24} sx={{ color: 'white' }} /> : <RefreshIcon />}
                    </IconButton>
                </Box>
            </Box>

            {/* Stats Cards */}
            <div className="stats-container">
                <div className="stat-card">
                    <div className="stat-card-header">
                        <span className="stat-card-title">Total Buckets</span>
                        <div className="stat-card-icon">
                            <MdCloudQueue />
                        </div>
                    </div>
                    <h2 className="stat-card-value">{s3Data.length}</h2>
                </div>
                <div className="stat-card">
                    <div className="stat-card-header">
                        <span className="stat-card-title">Total Size</span>
                        <div className="stat-card-icon">
                            <FaDatabase />
                        </div>
                    </div>
                    <h2 className="stat-card-value">{totalSize.toFixed(2)} GB</h2>
                </div>
                <div className="stat-card">
                    <div className="stat-card-header">
                        <span className="stat-card-title">Filtered Results</span>
                        <div className="stat-card-icon">
                            <FaSearch />
                        </div>
                    </div>
                    <h2 className="stat-card-value">{filteredData.length}</h2>
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
                            placeholder="Search buckets by name, region..."
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="table-container">
                <S3Table 
                    tableData={filteredData} 
                    loading={loading}
                    onBucketClick={handleBucketClick}
                />
            </div>
        </div>
    )
}
