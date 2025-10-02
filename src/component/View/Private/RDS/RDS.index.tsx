import { useContext, useEffect, useState } from "react"
import { LoadingContext, SelectedRegionContext } from "../../../context/context"
import { AdminService } from "../../../services/admin.service";
import RDSTable from "../../../Table/RDS.table";
import { FaDatabase, FaSearch } from "react-icons/fa";
import { MdCloudQueue } from "react-icons/md";
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
            {/* Page Header */}
            <div className="page-header">
                <h1 className="page-title">
                    <div className="page-title-icon">
                        <FaDatabase />
                    </div>
                    RDS Databases
                </h1>
                <p className="page-subtitle">Manage and monitor your Amazon RDS database instances</p>
            </div>

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
