import { useContext, useEffect, useState } from "react"
import { LoadingContext, SelectedRegionContext, SelectedAccountContext } from "../../../context/context"
import { AdminService } from "../../../services/admin.service";
import RDSTable from "../../../Table/RDS.table";
import RDSDetailModal from "../../../modal/RDSDetailModal";
import { FaDatabase, FaSearch } from "react-icons/fa";
import { MdCloudQueue } from "react-icons/md";
import { Box, Typography, IconButton, CircularProgress } from "@mui/material";
import StorageIcon from "@mui/icons-material/Storage";
import RefreshIcon from "@mui/icons-material/Refresh";
import "../SharedPage.css";

export default function RDSIndex() {
    const { selectedRegion }: any = useContext(SelectedRegionContext);
    const { selectedAccount }: any = useContext(SelectedAccountContext);
    const { loading, setLoading }: any = useContext(LoadingContext);

    const [rdsData, setRdsData] = useState<any>([]);
    const [filteredData, setFilteredData] = useState<any>([]);
    const [searchText, setSearchText] = useState<string>('');
    const [refreshing, setRefreshing] = useState(false);
    const [credentialsId, setCredentialsId] = useState<string | null>(null);
    const [selectedInstance, setSelectedInstance] = useState<any>(null);
    const [modalOpen, setModalOpen] = useState(false);

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
                setCredentialsId(credsRes.data._id);

                // Fetch RDS data using the credentials ID and region
                const res = await AdminService.getAllRDSData(credsRes.data._id, selectedRegion.value);
                if (res.status === 200) {
                    setRdsData(res.data);
                    setFilteredData(res.data);
                }
            }
        } catch (error) {
            console.error("Error fetching RDS data", error);
            setRdsData([]);
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

    const handleRowClick = (instance: any) => {
        setSelectedInstance(instance);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setSelectedInstance(null);
    };

    useEffect(() => {
        if (searchText) {
            const filtered = rdsData.filter((db: any) => {
                const searchStr = `${db?.instanceId || ''} ${db?.status || ''} ${db?.engine || ''} ${db?.engineVersion || ''} ${db?.instanceClass || ''} ${db?.availabilityZone || ''}`.toLowerCase();
                return searchStr.includes(searchText.toLowerCase());
            });
            setFilteredData(filtered);
        } else {
            setFilteredData(rdsData);
        }
    }, [searchText, rdsData]);

    useEffect(() => {
        if (selectedAccount?.value && selectedRegion?.value) {
            setSearchText("");
            fetchCredentialsAndData();
        } else {
            // Clear data if account or region is not selected
            setRdsData([]);
            setFilteredData([]);
            setCredentialsId(null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedAccount?.value, selectedRegion?.value]);

    // Calculate total storage
    const totalStorage = filteredData.reduce((acc: number, db: any) => {
        const storage = parseInt(db?.storage || 0);
        return acc + (isNaN(storage) ? 0 : storage);
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
                                    background: 'linear-gradient(135deg, #0073bb 0%, #1a8cd8 100%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    mb: 0.5
                                }}
                            >
                                RDS Instances
                            </Typography>
                            <Typography
                                variant="body2"
                                sx={{
                                    color: 'text.secondary',
                                    fontSize: '0.9rem'
                                }}
                            >
                                Manage and monitor your Amazon RDS database instances
                            </Typography>
                        </Box>
                    </Box>
                    <IconButton
                        onClick={handleRefresh}
                        disabled={refreshing || !selectedAccount || !selectedRegion}
                        sx={{
                            background: 'linear-gradient(135deg, #0073bb 0%, #1a8cd8 100%)',
                            color: 'white',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #005a94 0%, #0073bb 100%)',
                                transform: 'scale(1.05)',
                            },
                            '&:disabled': {
                                background: '#e0e0e0',
                                color: '#9e9e9e',
                            },
                            width: 48,
                            height: 48,
                            transition: 'all 0.2s ease',
                        }}
                    >
                        {refreshing ? <CircularProgress size={24} sx={{ color: 'white' }} /> : <RefreshIcon />}
                    </IconButton>
                </Box>
            </Box>

            {/* Info Cards */}
            <div className="stats-container">
                <div className="stat-card">
                    <div className="stat-icon">
                        <FaDatabase />
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">TOTAL DATABASES</div>
                        <div className="stat-value">{rdsData.length}</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">
                        <MdCloudQueue />
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">TOTAL STORAGE</div>
                        <div className="stat-value">{totalStorage} GB</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">
                        <FaSearch />
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">FILTERED RESULTS</div>
                        <div className="stat-value">{filteredData.length}</div>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="table-container">
                <RDSTable
                    data={filteredData}
                    searchText={searchText}
                    setSearchText={setSearchText}
                    onRowClick={handleRowClick}
                />
            </div>

            {/* RDS Detail Modal */}
            <RDSDetailModal
                open={modalOpen}
                onClose={handleCloseModal}
                instance={selectedInstance}
            />
        </div>
    )
}
