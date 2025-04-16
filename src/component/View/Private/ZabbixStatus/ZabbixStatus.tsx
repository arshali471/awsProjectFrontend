import React, { useContext, useState, useEffect } from 'react';
import { LoadingContext, SelectedRegionContext } from '../../../context/context';
import { AdminService } from '../../../services/admin.service';
import Select from 'react-select';
import LoaderSpinner from '../../../Spinner/Spinner';
import {
  Container,
  Row,
  Col,
  Form,
  Card,
  Button,
  Spinner,
  Table,
} from 'react-bootstrap';
import { CSVLink } from "react-csv";
import toast from 'react-hot-toast';


export default function ZabbixStatus() {
  const { selectedRegion }: any = useContext(SelectedRegionContext);

  const [searchText, setSearchText] = useState<string>('');
  const [data, setData] = useState<any>([]);

  const [sshUsername, setSshUsername] = useState<string>('');
  const [operatingSystem, setOperatingSystem] = useState<string>('');
  const [sshKeyPath, setSshKeyPath] = useState<any>(null);

  const [statusData, setStatusData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const [csvData, setCsvData] = useState<any[]>([])

  const getAllSshKey = async () => {
    // setLoading(true);
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
    } finally {
      // setLoading(false);
    }
  };

  useEffect(() => {
    getAllSshKey();
  }, []);

  const handleSubmit = async () => {
    setLoading(true);
    await AdminService.getZabbixStatus(
      selectedRegion?.value,
      sshUsername,
      sshKeyPath?.value,
      operatingSystem
    )
      .then((res) => {
        if (res.status === 200) {
          setStatusData(res.data?.results);
        }
      })
      .catch((err) => {
        toast.error(err.response.data.message)
        console.log(err);
        setLoading(false);
      })
      .finally(() => {
        setLoading(false);
      });
  };



  


  const filteredStatusData = statusData?.filter((item: any) => {
    const search = searchText.toLowerCase();
    return (
      item?.instanceName?.toLowerCase().includes(search) ||
      item?.instanceId?.toLowerCase().includes(search) ||
      item?.ip?.toLowerCase().includes(search)
    );
  });

  console.log(filteredStatusData, statusData, "filteredStatusData");


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
      </Row>

      <div className="d-flex justify-content-end mb-3">
        <Button variant="primary" onClick={handleSubmit}>
          Fetch
        </Button>
      </div>

      <div className = "d-flex justify-content-end mb-2">
        {statusCSVData?.length > 0 && (
          <CSVLink
            data={statusCSVData}
            headers={Object.keys(statusCSVData[0] || {})} 
            filename={"AgentStatus.csv"}
            className="btn btn-secondary size-sm"
          >
            Export to CSV
          </CSVLink>
        )
      }
      </div>

      <Row className="d-flex justify-content-center align-items-center">
        <Col>
          <Card>
            <Card.Body>
              <Table striped hover responsive>
                <thead>
                  <tr>
                    <th style={{ fontSize: 14 }}>Sr.No</th>
                    <th style={{ fontSize: 14 }}>Instance Name</th>
                    <th style={{ fontSize: 14 }}>Instance ID</th>
                    <th style={{ fontSize: 14 }}>IP</th>
                    <th style={{ fontSize: 14 }}>OS</th>
                    <th style={{ fontSize: 14 }}>Cloud Watch Status</th>
                    <th style={{ fontSize: 14 }}>Crowd Strike Status</th>
                    <th style={{ fontSize: 14 }}>Qualys Status</th>
                    <th style={{ fontSize: 14 }}>Zabbix agent Status</th>
                    <th style={{ fontSize: 14 }}>Cloud Watch Version</th>
                    <th style={{ fontSize: 14 }}>Crowd Strike Version</th>
                    <th style={{ fontSize: 14 }}>Qualys Version</th>
                    <th style={{ fontSize: 14 }}>Zabbix agent Version</th>
                    <th style={{ fontSize: 14 }}>Platform</th>
                    <th style={{ fontSize: 14 }}>State</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={15} className="text-center">
                        <Spinner animation="border" size="sm" /> Loading...
                      </td>
                    </tr>
                  ) : filteredStatusData?.length > 0 ? (
                    filteredStatusData?.map((item: any, index: number) => (
                      <tr key={item._id || index}>
                        <td style={{ fontSize: 12 }}>{index + 1}</td>
                        <td style={{ fontSize: 12 }}>{item?.instanceName || '--'}</td>
                        <td style={{ fontSize: 12 }}>{item?.instanceId || '--'}</td>
                        <td style={{ fontSize: 12 }}>{item?.ip || '--'}</td>
                        <td style={{ fontSize: 12 }}>{item?.os || '--'}</td>
                        <td style={{ fontSize: 12 }}>{item?.services?.cloudWatch || '--'}</td>
                        <td style={{ fontSize: 12 }}>{item?.services && item?.services?.crowdStrike || '--'}</td>
                        <td style={{ fontSize: 12 }}>{item?.services?.qualys || '--'}</td>
                        <td style={{ fontSize: 12 }}>{item?.versions && item?.versions?.zabbixAgent || '--'}</td>
                        <td style={{ fontSize: 12 }}>{item?.versions?.cloudWatch || '--'}</td>
                        <td style={{ fontSize: 12 }}>{item?.versions && item?.versions?.crowdStrike || '--'}</td>
                        <td style={{ fontSize: 12 }}>{item?.versions?.qualys || '--'}</td>
                        <td style={{ fontSize: 12 }}>{item?.versions?.zabbixAgent || '--'}</td>
                        <td style={{ fontSize: 12 }}>{item?.platform || '--'}</td>
                        <td style={{ fontSize: 12 }}>{item?.state || '--'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={15} className="text-center">
                        No data found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
