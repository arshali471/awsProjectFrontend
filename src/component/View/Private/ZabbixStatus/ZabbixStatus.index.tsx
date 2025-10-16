import { useContext, useState, useEffect, useMemo } from 'react';
import { LoadingContext, SelectedRegionContext } from '../../../context/context';
import { AdminService } from '../../../services/admin.service';
import Select from 'react-select';
import { Form, Col, Row, Button } from 'react-bootstrap';
import toast from 'react-hot-toast';
import DatePicker from "react-datepicker";
import StatusCheckTable from '../../../Table/statusCheck.table';
import { FaServer, FaCheckCircle, FaTimesCircle, FaSearch } from "react-icons/fa";
import { MdCloudQueue, MdRefresh } from "react-icons/md";
import "../SharedPage.css";

export default function ZabbixStatusIndex() {
  const { selectedRegion }: any = useContext(SelectedRegionContext);
  const { loading, setLoading }: any = useContext(LoadingContext);

  const [statusData, setStatusData] = useState<any[]>([]);
  const [searchText, setSearchText] = useState<string>('');
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [dateRange, setDateRange] = useState<any>([null, null]);
  const [sshUsername, setSshUsername] = useState<string>('');
  const [operatingSystem, setOperatingSystem] = useState<string>('');
  const [sshKeyPath, setSshKeyPath] = useState<any>(null);
  const [sshKeys, setSshKeys] = useState<any[]>([]);

  const [startDate, endDate] = dateRange;

  useEffect(() => {
    const getAllSshKey = async () => {
      try {
        const res = await AdminService.getSshKey("", 1, 999);
        if (res.status === 200) {
          setSshKeys(
            res.data.data.map((data: any) => ({
              label: data?.sshKeyName,
              value: data?._id,
            }))
          );
        }
      } catch (error) {
        console.error('Error fetching SSH keys:', error);
      }
    };

    getAllSshKey();
  }, []);

  const handleSubmit = async () => {
    if (!selectedRegion?.value) {
      toast.error("Please select a region first.");
      return;
    }

    setLoading(true);
    try {
      const res = await AdminService.getZabbixStatus(
        selectedRegion.value,
        sshUsername,
        sshKeyPath?.value,
        operatingSystem,
        startDate ? new Date(new Date(startDate).setHours(0, 0, 0, 0)).toISOString() : undefined,
        endDate ? new Date(new Date(endDate).setHours(23, 59, 59, 999)).toISOString() : undefined
      );

      if (res.status === 200) {
        setStatusData(res.data?.results || []);
        setFilteredData(res.data?.results || []);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Something went wrong");
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

  // Calculate stats
  const totalInstances = filteredData.length;
  const activeCount = filteredData.filter((item: any) => item?.state?.toLowerCase() === 'running').length;
  const inactiveCount = totalInstances - activeCount;

  return (
    <div className="page-wrapper">
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">
          <div className="page-title-icon">
            <FaServer />
          </div>
          Agent Status Inventory
        </h1>
        <p className="page-subtitle">Check and monitor agent status across EC2 instances</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-container">
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Total Checked</span>
            <div className="stat-card-icon">
              <MdCloudQueue />
            </div>
          </div>
          <h2 className="stat-card-value">{totalInstances}</h2>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Active</span>
            <div className="stat-card-icon" style={{ color: '#28a745' }}>
              <FaCheckCircle />
            </div>
          </div>
          <h2 className="stat-card-value" style={{ color: '#28a745' }}>{activeCount}</h2>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Inactive</span>
            <div className="stat-card-icon" style={{ color: '#dc3545' }}>
              <FaTimesCircle />
            </div>
          </div>
          <h2 className="stat-card-value" style={{ color: '#dc3545' }}>{inactiveCount}</h2>
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

      {/* Filters Section */}
      <div className="action-bar" style={{ flexDirection: 'column', gap: '1rem' }}>
        <Row>
          <Col md={3}>
            <Form.Group>
              <Form.Label style={{ fontWeight: 500, color: 'var(--text-primary)' }}>SSH Username</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter SSH username"
                value={sshUsername}
                onChange={(e) => setSshUsername(e.target.value)}
                style={{ borderRadius: '8px' }}
              />
            </Form.Group>
          </Col>

          <Col md={3}>
            <Form.Group>
              <Form.Label style={{ fontWeight: 500, color: 'var(--text-primary)' }}>Operating System</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g., ubuntu, rhel"
                value={operatingSystem}
                onChange={(e) => setOperatingSystem(e.target.value)}
                style={{ borderRadius: '8px' }}
              />
            </Form.Group>
          </Col>

          <Col md={3}>
            <Form.Group>
              <Form.Label style={{ fontWeight: 500, color: 'var(--text-primary)' }}>SSH Key</Form.Label>
              <Select
                options={sshKeys}
                placeholder="Select SSH Key"
                isClearable
                isSearchable
                value={sshKeyPath}
                onChange={(selectedOption) => setSshKeyPath(selectedOption)}
              />
            </Form.Group>
          </Col>

          <Col md={3}>
            <Form.Group>
              <Form.Label style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                Date Range
                <small style={{ color: '#dc3545', fontSize: '11px', marginLeft: '4px' }}>
                  (Clear for live data)
                </small>
              </Form.Label>
              <DatePicker
                selectsRange
                startDate={startDate}
                endDate={endDate}
                onChange={(update) => setDateRange(update)}
                className="form-control"
                maxDate={new Date()}
                isClearable
                placeholderText="Select date range"
              />
            </Form.Group>
          </Col>
        </Row>
      </div>

      {/* Search Bar */}
      <div className="action-bar" style={{ marginTop: '1rem' }}>
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search by name, ID, IP, status, version..."
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
          fetchData={handleSubmit}
        />
      </div>
    </div>
  );
}
