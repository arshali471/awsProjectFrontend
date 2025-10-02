import { useContext, useEffect, useState } from "react"
import { LoadingContext, SelectedRegionContext } from "../../../context/context"
import { AdminService } from "../../../services/admin.service";
import VolumesTable from "../../../Table/Volumes.table";
import { FaHdd, FaSearch } from "react-icons/fa";
import { MdCloudQueue } from "react-icons/md";
import "../SharedPage.css";

export default function VolumesIndex() {
    const { selectedRegion }: any = useContext(SelectedRegionContext);
    const { loading, setLoading }: any = useContext(LoadingContext);

    const [volumesData, setVolumesData] = useState<any>([]);
    const [filteredData, setFilteredData] = useState<any>([]);
    const [searchText, setSearchText] = useState<string>('');

    const getVolumes = async () => {
        setLoading(true);
        try {
            const res = await AdminService.getAllVolumesData(selectedRegion.value);
            if (res.status === 200) {
                setVolumesData(res.data);
                setFilteredData(res.data);
            }
        } catch (error) {
            console.error("Error fetching Volumes data", error);
        }
        setLoading(false);
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

    // Calculate total size
    const totalSize = filteredData.reduce((acc: number, volume: any) => {
        const size = parseInt(volume?.size || 0);
        return acc + (isNaN(size) ? 0 : size);
    }, 0);

    return (
        <div className="page-wrapper">
            {/* Page Header */}
            <div className="page-header">
                <h1 className="page-title">
                    <div className="page-title-icon">
                        <FaHdd />
                    </div>
                    EBS Volumes
                </h1>
                <p className="page-subtitle">Manage and monitor your Amazon EBS storage volumes</p>
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
                    <h2 className="stat-card-value">{volumesData.length}</h2>
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
