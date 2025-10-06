import { useContext, useEffect, useState } from "react"
import { LoadingContext, SelectedRegionContext } from "../../../context/context"
import { AdminService } from "../../../services/admin.service";
import RDSTable from "../../../Table/RDS.table";
import { FaDatabase, FaSearch } from "react-icons/fa";
import { MdCloudQueue } from "react-icons/md";
import { Box, Typography } from "@mui/material";
import StorageIcon from "@mui/icons-material/Storage";
import "../SharedPage.css";

export default function RDSIndex() {
    const { selectedRegion }: any = useContext(SelectedRegionContext);
    const { loading, setLoading }: any = useContext(LoadingContext);

    const [rdsData, setRdsData] = useState<any>([]);
    const [filteredData, setFilteredData] = useState<any>([]);
    const [searchText, setSearchText] = useState<string>('');

    const getAllRDSData = async () => {
        setLoading(true);
        try {
            const res = await AdminService.getAllRDSData(selectedRegion.value);
            if (res.status === 200) {
                setRdsData(res.data);
                setFilteredData(res.data);
            }
        } catch (error) {
            console.error("Error fetching RDS data", error);
        }
        setLoading(false);
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
        if (selectedRegion?.value) {
            setSearchText("");
            getAllRDSData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedRegion?.value]);

    // Calculate total storage
    const totalStorage = filteredData.reduce((acc: number, db: any) => {
        const storage = parseInt(db?.storage || 0);
        return acc + (isNaN(storage) ? 0 : storage);
    }, 0);

    return (
        <div className="page-wrapper">
            {/* Page Header - Matching Dashboard Style */}
            <Box sx={{ mb: 3 }}>
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
                            RDS Databases
                        </Typography>
                        <Typography
                            variant="body2"
                            sx={{
                                color: '#6c757d',
                                mt: 0.5,
                            }}
                        >
                            Manage and monitor your Amazon RDS database instances
                        </Typography>
                    </Box>
                </Box>
            </Box>

            {/* Stats Cards */}
            <div className="stats-container">
                <div className="stat-card">
                    <div className="stat-card-header">
                        <span className="stat-card-title">Total Databases</span>
                        <div className="stat-card-icon">
                            <MdCloudQueue />
                        </div>
                    </div>
                    <h2 className="stat-card-value">{rdsData.length}</h2>
                </div>
                <div className="stat-card">
                    <div className="stat-card-header">
                        <span className="stat-card-title">Total Storage</span>
                        <div className="stat-card-icon">
                            <FaDatabase />
                        </div>
                    </div>
                    <h2 className="stat-card-value">{totalStorage} GB</h2>
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
                            placeholder="Search databases by ID, status, engine, zone..."
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="table-container">
                <RDSTable tableData={filteredData} loading={loading} />
            </div>
        </div>
    )
}
