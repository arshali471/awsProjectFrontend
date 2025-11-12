import { useContext, useState, useEffect } from 'react';
import { LoadingContext, SelectedRegionContext } from '../../../context/context';
import { AdminService } from '../../../services/admin.service';
import toast from 'react-hot-toast';
import StatusCheckTable from '../../../Table/statusCheck.table';
import { FaServer, FaCheckCircle, FaTimesCircle, FaSearch, FaShieldAlt } from "react-icons/fa";
import { MdCloudQueue, MdSecurity } from "react-icons/md";
import { SiCrowdstrike } from "react-icons/si";
import "../SharedPage.css";

export default function ZabbixStatusIndex() {
  const { selectedRegion }: any = useContext(SelectedRegionContext);
  const { loading, setLoading }: any = useContext(LoadingContext);

  const [statusData, setStatusData] = useState<any[]>([]);
  const [searchText, setSearchText] = useState<string>('');
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [dashboardStats, setDashboardStats] = useState<any>(null);

  // Auto-fetch data when region changes
  useEffect(() => {
    if (selectedRegion?.value) {
      fetchAgentStatusDashboard();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRegion?.value]);

  const fetchAgentStatusDashboard = async () => {
    if (!selectedRegion?.value) {
      toast.error("Please select a region first.");
      return;
    }

    setLoading(true);
    try {
      const res = await AdminService.getAgentStatusDashboard(selectedRegion.value);

      if (res.status === 200 && res.data.success) {
        const { stats, records } = res.data.data;
        setDashboardStats(stats);
        setStatusData(records || []);
        setFilteredData(records || []);
        toast.success(`Loaded ${records.length} agent status records`);
      } else {
        toast.error(res.data.message || "Failed to fetch agent status");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Error fetching agent status");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Multi-field search
  useEffect(() => {
    if (!searchText.trim()) {
      setFilteredData(statusData);
      return;
    }

    const search = searchText.toLowerCase();
    const filtered = statusData.filter((item: any) => (
      item?.instanceName?.toLowerCase().includes(search) ||
      item?.instanceId?.toLowerCase().includes(search) ||
      item?.ip?.toLowerCase().includes(search) ||
      item?.versions?.cloudWatch?.toLowerCase().includes(search) ||
      item?.versions?.crowdStrike?.toLowerCase().includes(search) ||
      item?.versions?.qualys?.toLowerCase().includes(search) ||
      item?.versions?.zabbixAgent?.toLowerCase().includes(search) ||
      item?.platform?.toLowerCase().includes(search) ||
      item?.state?.toLowerCase().includes(search) ||
      item?.os?.toLowerCase().includes(search) ||
      item?.services?.cloudWatch?.toLowerCase().includes(search) ||
      item?.services?.crowdStrike?.toLowerCase().includes(search) ||
      item?.services?.qualys?.toLowerCase().includes(search) ||
      item?.services?.zabbixAgent?.toLowerCase().includes(search)
    ));

    setFilteredData(filtered);
  }, [searchText, statusData]);

  return (
    <div className="page-wrapper">
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">
          <div className="page-title-icon">
            <FaServer />
          </div>
          Agent Status Dashboard
        </h1>
        <p className="page-subtitle">Live monitoring of security agents across all EC2 instances</p>
      </div>

      {/* Main Stats Cards - Total Servers */}
      <div className="stats-container">
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Total Servers</span>
            <div className="stat-card-icon">
              <FaServer />
            </div>
          </div>
          <h2 className="stat-card-value">{dashboardStats?.totalServers || 0}</h2>
          <p className="stat-card-subtitle">Monitored instances</p>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Running Instances</span>
            <div className="stat-card-icon" style={{ color: '#28a745' }}>
              <FaCheckCircle />
            </div>
          </div>
          <h2 className="stat-card-value" style={{ color: '#28a745' }}>
            {dashboardStats?.byState?.running || 0}
          </h2>
          <p className="stat-card-subtitle">Active EC2 instances</p>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Stopped Instances</span>
            <div className="stat-card-icon" style={{ color: '#dc3545' }}>
              <FaTimesCircle />
            </div>
          </div>
          <h2 className="stat-card-value" style={{ color: '#dc3545' }}>
            {dashboardStats?.byState?.stopped || 0}
          </h2>
          <p className="stat-card-subtitle">Inactive instances</p>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Filtered Results</span>
            <div className="stat-card-icon">
              <FaSearch />
            </div>
          </div>
          <h2 className="stat-card-value">{filteredData.length}</h2>
          <p className="stat-card-subtitle">Current view</p>
        </div>
      </div>

      {/* Agent Stats Cards */}
      <div style={{ marginTop: '2rem' }}>
        <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem', fontSize: '1.25rem', fontWeight: 600 }}>
          Security Agents Status
        </h3>
        <div className="stats-container">
          {/* Zabbix Agent */}
          <div className="stat-card">
            <div className="stat-card-header">
              <span className="stat-card-title">Zabbix Agent</span>
              <div className="stat-card-icon" style={{ color: '#d32f2f' }}>
                <MdCloudQueue />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div>
                <h3 style={{ color: '#28a745', fontSize: '1.5rem', margin: 0 }}>
                  {dashboardStats?.zabbixAgent?.active || 0}
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>Active</p>
              </div>
              <div style={{ width: '1px', height: '40px', background: 'var(--border-color)' }} />
              <div>
                <h3 style={{ color: '#dc3545', fontSize: '1.5rem', margin: 0 }}>
                  {dashboardStats?.zabbixAgent?.inactive || 0}
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>Inactive</p>
              </div>
            </div>
          </div>

          {/* CrowdStrike */}
          <div className="stat-card">
            <div className="stat-card-header">
              <span className="stat-card-title">CrowdStrike</span>
              <div className="stat-card-icon" style={{ color: '#e84545' }}>
                <SiCrowdstrike />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div>
                <h3 style={{ color: '#28a745', fontSize: '1.5rem', margin: 0 }}>
                  {dashboardStats?.crowdStrike?.active || 0}
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>Active</p>
              </div>
              <div style={{ width: '1px', height: '40px', background: 'var(--border-color)' }} />
              <div>
                <h3 style={{ color: '#dc3545', fontSize: '1.5rem', margin: 0 }}>
                  {dashboardStats?.crowdStrike?.inactive || 0}
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>Inactive</p>
              </div>
            </div>
          </div>

          {/* Qualys */}
          <div className="stat-card">
            <div className="stat-card-header">
              <span className="stat-card-title">Qualys</span>
              <div className="stat-card-icon" style={{ color: '#ff6b35' }}>
                <FaShieldAlt />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div>
                <h3 style={{ color: '#28a745', fontSize: '1.5rem', margin: 0 }}>
                  {dashboardStats?.qualys?.active || 0}
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>Active</p>
              </div>
              <div style={{ width: '1px', height: '40px', background: 'var(--border-color)' }} />
              <div>
                <h3 style={{ color: '#dc3545', fontSize: '1.5rem', margin: 0 }}>
                  {dashboardStats?.qualys?.inactive || 0}
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>Inactive</p>
              </div>
            </div>
          </div>

          {/* CloudWatch */}
          <div className="stat-card">
            <div className="stat-card-header">
              <span className="stat-card-title">CloudWatch</span>
              <div className="stat-card-icon" style={{ color: '#ff9900' }}>
                <MdSecurity />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div>
                <h3 style={{ color: '#28a745', fontSize: '1.5rem', margin: 0 }}>
                  {dashboardStats?.cloudWatch?.active || 0}
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>Active</p>
              </div>
              <div style={{ width: '1px', height: '40px', background: 'var(--border-color)' }} />
              <div>
                <h3 style={{ color: '#dc3545', fontSize: '1.5rem', margin: 0 }}>
                  {dashboardStats?.cloudWatch?.inactive || 0}
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>Inactive</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="action-bar" style={{ marginTop: '2rem' }}>
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search by name, ID, IP, status, version, OS..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <StatusCheckTable
          tableData={filteredData}
          loading={loading}
          fetchData={fetchAgentStatusDashboard}
        />
      </div>
    </div>
  );
}
