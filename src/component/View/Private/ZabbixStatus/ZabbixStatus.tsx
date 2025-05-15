import { useContext, useState, useEffect } from 'react';
import { LoadingContext, SelectedRegionContext } from '../../../context/context';
import { AdminService } from '../../../services/admin.service';
import Select from 'react-select';
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  InputGroup,
} from 'react-bootstrap';
import toast from 'react-hot-toast';
import DatePicker from "react-datepicker";
import StatusCheckTable from '../../../Table/statusCheck.table';

export default function ZabbixStatus() {
  const { selectedRegion }: any = useContext(SelectedRegionContext);
  const { loading, setLoading }: any = useContext(LoadingContext);

  const [statusData, setStatusData] = useState<any[]>([]);
  const [searchText, setSearchText] = useState<string>('');
  const [paginatedData, setPaginatedData] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(10);
  const [dateRange, setDateRange] = useState([null, null]);
  const [sshUsername, setSshUsername] = useState<string>('');
  const [operatingSystem, setOperatingSystem] = useState<string>('');
  const [sshKeyPath, setSshKeyPath] = useState<any>(null);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [data, setData] = useState<any[]>([]);

  const [startDate, endDate] = dateRange;

  const getAllSshKey = async () => {
    try {
      const res = await AdminService.getSshKey("", 1, 999);
      if (res.status === 200) {
        setData(
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

  useEffect(() => {
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
        setStatusData(res.data?.results);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Something went wrong");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };


  const filteredStatusData = statusData?.filter((item: any) => {
    const search = searchText.toLowerCase();

    return (
      // For services, we perform strict matching (i.e., exact match)
      (
        item?.instanceName?.toLowerCase().includes(search) ||
        item?.instanceId?.toLowerCase().includes(search) ||
        item?.ip?.toLowerCase().includes(search) ||
        item?.versions?.cloudWatch?.toLowerCase().includes(search) ||
        item?.versions?.crowdStrike?.toLowerCase().includes(search) ||
        item?.versions?.qualys?.toLowerCase().includes(search) ||
        item?.versions?.zabbixAgent?.toLowerCase().includes(search) ||
        item?.platform?.toLowerCase().includes(search) ||
        item?.state?.toLowerCase().includes(search)
      ) ||


      // Strict search for services fields (exact match)
      (
        item?.os?.toLowerCase() === search ||
        item?.services?.cloudWatch?.toLowerCase() === search ||
        item?.services?.crowdStrike?.toLowerCase() === search ||
        item?.services?.qualys?.toLowerCase() === search ||
        item?.services?.zabbixAgent?.toLowerCase() === search
      )
    );
  });


  const statusCSVData = filteredStatusData?.map((item: any, index: number) => ({
    "Sr.No": index + 1,
    "Instance Name": item?.instanceName || "--",
    "Instance ID": item?.instanceId || "--",
    "IP": item?.ip || "--",
    "OS": item?.os || "--",
    "Cloud Watch Status": item?.services?.cloudWatch || "--",
    "Crowd Strike Status": item?.services?.crowdStrike || "--",
    "Qualys Status": item?.services?.qualys || "--",
    "Zabbix agent Status": item?.services?.zabbixAgent || "--",
    "Cloud Watch Version": item?.versions?.cloudWatch || "--",
    "Crowd Strike Version": item?.versions?.crowdStrike || "--",
    "Qualys Version": item?.versions?.qualys || "--",
    "Zabbix agent Version": item?.versions?.zabbixAgent || "--",
    "Platform": item?.platform || "--",
    "State": item?.state || "--"
  }));

  useEffect(() => {
    let filteredData = filteredStatusData;
    setPaginatedData(filteredData);
    setTotalCount(filteredData.length);
  }, [filteredStatusData, currentPage, perPage]);

  return (
    <Container>
      <Row className="mt-3">
        <Col md={3}>
          <Form.Group className="mb-3">
            <Form.Label>Search</Form.Label>
            <Form.Control
              type="text"
              placeholder="Search by name, ID, or IP..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </Form.Group>
        </Col>

        <Col md={3}>
          <Form.Group className="mb-3">
            <Form.Label>SSH Username</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter SSH username"
              value={sshUsername}
              onChange={(e) => setSshUsername(e.target.value)}
            />
          </Form.Group>
        </Col>

        <Col md={3}>
          <Form.Group className="mb-3">
            <Form.Label>Operating System</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter operating system"
              value={operatingSystem}
              onChange={(e) => setOperatingSystem(e.target.value)}
            />
          </Form.Group>
        </Col>

        <Col md={3}>
          <Form.Group className="mb-3">
            <Form.Label>SSH Key</Form.Label>
            <Select
              options={data}
              placeholder="Select SSH Key"
              isClearable
              isSearchable
              value={sshKeyPath}
              onChange={(selectedOption) => setSshKeyPath(selectedOption)}
            />
          </Form.Group>
        </Col>

        <Col md={6}>
          <Form.Group className="mb-3">
            <div className="d-flex align-items-center mb-2">
              <Form.Label className="mb-0">Start Date - End Date</Form.Label>
              <small className="text-danger ms-1" style={{ fontSize: '12px' }}>
                (Note: To fetch live data, clear date filter)
              </small>
            </div>
            <InputGroup>
              <DatePicker
                selectsRange={true}
                startDate={startDate}
                endDate={endDate}
                onChange={(update) => {
                  setDateRange(update);
                }}
                className="w-100 form-control"
                maxDate={new Date()}
                isClearable
                withPortal
              />
            </InputGroup>
          </Form.Group>
        </Col>
      </Row>

      <div className="d-flex justify-content-end mb-3">
        <Button variant="primary" onClick={handleSubmit}>
          Fetch
        </Button>
      </div>
      <StatusCheckTable tableData={paginatedData} loading={loading} />
    </Container>
  );
}
