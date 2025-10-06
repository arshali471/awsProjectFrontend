import { useContext, useEffect, useState } from "react"
import { LoadingContext, SelectedRegionContext } from "../../../context/context"
import { AdminService } from "../../../services/admin.service";
import S3Table from "../../../Table/S3.table";
import { FaDatabase, FaSearch } from "react-icons/fa";
import { MdCloudQueue } from "react-icons/md";
import { Box, Typography } from "@mui/material";
import StorageIcon from "@mui/icons-material/Storage";
import "../SharedPage.css";

export default function S3Index() {
    const { selectedRegion }: any = useContext(SelectedRegionContext);
    const { loading, setLoading }: any = useContext(LoadingContext);

    const [s3Data, setS3Data] = useState<any>([]);
    const [filteredData, setFilteredData] = useState<any>([]);
    const [searchText, setSearchText] = useState<string>('');

    const getAllS3Data = async () => {
        setLoading(true);
        try {
            const res = await AdminService.getAllS3Data(selectedRegion.value);
            if (res.status === 200) {
                setS3Data(res.data);
                setFilteredData(res.data);
            }
        } catch (error) {
            console.error("Error fetching S3 data", error);
        }
        setLoading(false);
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
        if (selectedRegion?.value) {
            setSearchText("");
            getAllS3Data();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedRegion?.value]);

    // Calculate total size
    const totalSize = filteredData.reduce((acc: number, bucket: any) => {
        const size = parseFloat(bucket?.size || 0);
        return acc + (isNaN(size) ? 0 : size);
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
                <S3Table tableData={filteredData} loading={loading} />
            </div>
        </div>
    )
}