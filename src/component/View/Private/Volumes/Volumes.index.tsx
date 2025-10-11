import { useContext, useEffect, useState } from "react"
import { LoadingContext, SelectedRegionContext } from "../../../context/context"
import { AdminService } from "../../../services/admin.service";
import VolumesTable from "../../../Table/Volumes.table";
import { FaHdd, FaSearch } from "react-icons/fa";
import { MdCloudQueue, MdCheckCircle, MdCancel } from "react-icons/md";
import { IconButton, CircularProgress } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import "../SharedPage.css";

export default function VolumesIndex() {
    const { selectedRegion }: any = useContext(SelectedRegionContext);
    const { loading, setLoading }: any = useContext(LoadingContext);

    const [volumesData, setVolumesData] = useState<any>([]);
    const [filteredData, setFilteredData] = useState<any>([]);
    const [searchText, setSearchText] = useState<string>('');
    const [refreshing, setRefreshing] = useState(false);

    const getVolumes = async (showRefreshing = false) => {
        if (showRefreshing) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }
        try {
            const res = await AdminService.getAllVolumesData(selectedRegion.value);
            if (res.status === 200) {
                setVolumesData(res.data);
                setFilteredData(res.data);
            }
        } catch (error) {
            console.error("Error fetching Volumes data", error);
        }
        if (showRefreshing) {
            setRefreshing(false);
        } else {
            setLoading(false);
        }
    };

    const handleRefresh = () => {
        getVolumes(true);
    };

    useEffect(() => {
        if (searchText) {
            const filtered = volumesData.filter((volume: any) => {
                const searchStr = `${volume?.volumeId || ''} ${volume?.state || ''} ${volume?.volumeType || ''} ${volume?.availabilityZone || ''} ${volume?.attachedInstances?.join(' ') || ''}`.toLowerCase();
                return searchStr.includes(searchText.toLowerCase());
            });
            setFilteredData(filtered);
        } else {
            setFilteredData(volumesData);
        }
    }, [searchText, volumesData]);

    useEffect(() => {
        if (selectedRegion?.value) {
            setSearchText("");
            getVolumes();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedRegion?.value]);

    // Calculate stats
    const totalVolumes = filteredData.length;
    const attachedCount = filteredData.filter((v: any) => v?.attachedInstances?.length > 0).length;
    const unattachedCount = totalVolumes - attachedCount;
    const totalSize = filteredData.reduce((acc: number, v: any) => acc + (v?.size || 0), 0);

    return (
        <div className="page-wrapper">
            {/* Page Header */}
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 className="page-title">
                        <div className="page-title-icon">
                            <FaHdd />
                        </div>
                        EBS Volumes
                    </h1>
                    <p className="page-subtitle">Manage and monitor your Amazon EBS storage volumes</p>
                </div>
                <IconButton
                    onClick={handleRefresh}
                    disabled={refreshing}
                    sx={{
                        background: 'linear-gradient(135deg, #ff9900 0%, #ffb84d 100%)',
                        color: 'white',
                        width: 48,
                        height: 48,
                        '&:hover': {
                            background: 'linear-gradient(135deg, #e68a00 0%, #ff9900 100%)',
                            transform: 'rotate(180deg)',
                        },
                        transition: 'all 0.3s ease',
                        '&.Mui-disabled': {
                            background: 'linear-gradient(135deg, #ff9900 0%, #ffb84d 100%)',
                            color: 'white',
                            opacity: 0.7,
                        }
                    }}
                >
                    {refreshing ? <CircularProgress size={24} sx={{ color: 'white' }} /> : <RefreshIcon />}
                </IconButton>
            </div>

            {/* Stats Cards */}
            <div className="stats-container">
                <div className="stat-card">
                    <div className="stat-card-header">
                        <span className="stat-card-title">Total Volumes</span>
                        <div className="stat-card-icon">
                            <MdCloudQueue />
                        </div>
                    </div>
                    <h2 className="stat-card-value">{totalVolumes}</h2>
                </div>
                <div className="stat-card">
                    <div className="stat-card-header">
                        <span className="stat-card-title">Attached</span>
                        <div className="stat-card-icon" style={{ color: '#28a745' }}>
                            <MdCheckCircle />
                        </div>
                    </div>
                    <h2 className="stat-card-value" style={{ color: '#28a745' }}>{attachedCount}</h2>
                </div>
                <div className="stat-card">
                    <div className="stat-card-header">
                        <span className="stat-card-title">Unattached</span>
                        <div className="stat-card-icon" style={{ color: '#dc3545' }}>
                            <MdCancel />
                        </div>
                    </div>
                    <h2 className="stat-card-value" style={{ color: '#dc3545' }}>{unattachedCount}</h2>
                </div>
                <div className="stat-card">
                    <div className="stat-card-header">
                        <span className="stat-card-title">Total Size</span>
                        <div className="stat-card-icon">
                            <FaHdd />
                        </div>
                    </div>
                    <h2 className="stat-card-value">{totalSize} GB</h2>
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
                            placeholder="Search volumes by ID, state, type, zone..."
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="table-container">
                <VolumesTable tableData={filteredData} loading={loading} />
            </div>
        </div>
    )
}
