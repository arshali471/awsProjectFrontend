import { useContext, useState, useEffect } from 'react';
import { LoadingContext, SelectedRegionContext } from '../../../context/context';
import { AdminService } from '../../../services/admin.service';
import toast from 'react-hot-toast';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import StatusCheckTable from '../../../Table/statusCheck.table';
import { FaServer, FaCheckCircle, FaTimesCircle, FaSearch, FaShieldAlt, FaBug, FaCalendarAlt } from "react-icons/fa";
import { MdCloudQueue, MdSecurity } from "react-icons/md";
import "../SharedPage.css";

// Custom styles for date picker
const datePickerStyles = `
  .react-datepicker-popper {
    z-index: 9999 !important;
  }
  .react-datepicker {
    z-index: 9999 !important;
    font-family: inherit !important;
    border: 1px solid var(--border-color) !important;
    border-radius: 12px !important;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15) !important;
  }
  .date-picker-popper {
    z-index: 9999 !important;
  }
  .react-datepicker__header {
    background-color: var(--primary-color) !important;
    border-bottom: none !important;
    border-radius: 12px 12px 0 0 !important;
    padding: 16px 0 !important;
  }
  .react-datepicker__current-month {
    color: white !important;
    font-weight: 600 !important;
    font-size: 1rem !important;
  }
  .react-datepicker__day-name {
    color: white !important;
    font-weight: 500 !important;
  }
  .react-datepicker__day {
    color: var(--text-primary) !important;
    border-radius: 8px !important;
    margin: 2px !important;
  }
  .react-datepicker__day:hover {
    background-color: var(--primary-color) !important;
    color: white !important;
  }
  .react-datepicker__day--selected,
  .react-datepicker__day--in-range,
  .react-datepicker__day--in-selecting-range {
    background-color: var(--primary-color) !important;
    color: white !important;
    font-weight: 600 !important;
  }
  .react-datepicker__day--keyboard-selected {
    background-color: rgba(0, 115, 187, 0.2) !important;
    color: var(--text-primary) !important;
  }
  .react-datepicker__day--disabled {
    color: #ccc !important;
    cursor: not-allowed !important;
  }
  .react-datepicker__navigation {
    top: 16px !important;
  }
  .react-datepicker__navigation-icon::before {
    border-color: white !important;
  }
  .react-datepicker__triangle {
    display: none !important;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleTag = document.createElement('style');
  styleTag.innerHTML = datePickerStyles;
  if (!document.head.querySelector('style[data-datepicker]')) {
    styleTag.setAttribute('data-datepicker', 'true');
    document.head.appendChild(styleTag);
  }
}

export default function ZabbixStatus() {
  const { selectedRegion }: any = useContext(SelectedRegionContext);
  const { loading, setLoading }: any = useContext(LoadingContext);

  const [statusData, setStatusData] = useState<any[]>([]);
  const [searchText, setSearchText] = useState<string>('');
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [dateRange, setDateRange] = useState<any>([null, null]);
  const [startDate, endDate] = dateRange;

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
      const res = await AdminService.getAgentStatusDashboard(
        selectedRegion.value,
        startDate ? new Date(new Date(startDate).setHours(0, 0, 0, 0)).toISOString() : undefined,
        endDate ? new Date(new Date(endDate).setHours(23, 59, 59, 999)).toISOString() : undefined
      );

      if (res.status === 200 && res.data.success) {
        const { stats, records } = res.data.data;
        setDashboardStats(stats);
        setStatusData(records || []);
        setFilteredData(records || []);
        const dateRangeMsg = startDate && endDate
          ? ` from ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}`
          : '';
        toast.success(`Loaded ${records.length} agent status records${dateRangeMsg}`);
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
                <FaBug />
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

      {/* Date Range Filter & Search Bar */}
      <div className="action-bar" style={{ marginTop: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', position: 'relative', zIndex: 10 }}>
        {/* Date Range Picker */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', position: 'relative', zIndex: 100 }}>
          <FaCalendarAlt style={{ color: 'var(--primary-color)' }} />
          <DatePicker
            selectsRange
            startDate={startDate}
            endDate={endDate}
            onChange={(update) => setDateRange(update)}
            className="form-control"
            maxDate={new Date()}
            isClearable
            placeholderText="Select date range (optional)"
            popperClassName="date-picker-popper"
            popperPlacement="bottom-start"
          />
          <small style={{ color: 'var(--text-secondary)', fontSize: '12px', marginLeft: '0.5rem' }}>
            Leave empty for latest data
          </small>
        </div>

        {/* Search Box */}
        <div className="search-box" style={{ flex: 1, minWidth: '300px' }}>
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
