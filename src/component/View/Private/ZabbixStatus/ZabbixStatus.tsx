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
  Table,
  Badge,
} from 'react-bootstrap';
import { CSVLink } from "react-csv";
import toast from 'react-hot-toast';

const statusStyles = {
  inactive: {
    backgroundColor: ' #dc3545',
    color: 'white',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 'bold',
  },
  active: {
    backgroundColor: ' #28a745',
    color: 'white',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 'bold',
  },
  unknown: {
    backgroundColor: ' #6c757d',
    color: 'white',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 'bold',
  }
};

export default function ZabbixStatus() {
  const { selectedRegion }: any = useContext(SelectedRegionContext);

  const [searchText, setSearchText] = useState<string>('');
  const [data, setData] = useState<any>([]);

  const [sshUsername, setSshUsername] = useState<string>('');
  const [operatingSystem, setOperatingSystem] = useState<string>('');
  const [sshKeyPath, setSshKeyPath] = useState<any>(null);

  const [statusData, setStatusData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

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
        toast.error(err.response.data.message);
        console.log(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const getStatusStyle = (status: string) => {
    if (!status || status === '--') return statusStyles.unknown;

    const lowerStatus = status.toLowerCase();
    if (lowerStatus.includes('active') || lowerStatus.includes('running') || lowerStatus === 'ok') {
      return statusStyles.active;
    } else if (lowerStatus.includes('inactive') || lowerStatus.includes('stopped') || lowerStatus === 'failed') {
      return statusStyles.inactive;
    } else {
      return statusStyles.unknown;
    }
  };

  const filteredStatusData = statusData?.filter((item: any) => {
    const search = searchText.toLowerCase();
    return (
      item?.instanceName?.toLowerCase().includes(search) ||
      item?.instanceId?.toLowerCase().includes(search) ||
      item?.ip?.toLowerCase().includes(search)
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
              value={operatingSystem}
              onChange={(e) => setOperatingSystem(e.target.value)}
            />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group className="mb-3">
            <Form.Label>Select SSH Key</Form.Label>
            <Select
              options={data}
              value={sshKeyPath}
              onChange={setSshKeyPath}
              placeholder="Choose Key"
            />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Button variant="primary" className="mt-4" onClick={handleSubmit}>
            {loading ? 'Checking...' : 'Check Status'}
          </Button>
        </Col>
        <Col md={3} className="mt-4">
          {filteredStatusData?.length > 0 && (
            <CSVLink
              data={statusCSVData}
              filename={"zabbix_status_report.csv"}
              className="btn btn-success"
            >
              Download CSV
            </CSVLink>
          )}
        </Col>
      </Row>

      {loading ? (
        <div className="d-flex justify-content-center mt-4">
          <LoaderSpinner />
        </div>
      ) : (
        filteredStatusData?.length > 0 && (
          <Card className="mt-4">
            <Card.Body>
              <Table striped bordered hover responsive size="sm">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Instance Name</th>
                    <th>Instance ID</th>
                    <th>IP</th>
                    <th>OS</th>
                    <th>Cloud Watch</th>
                    <th>Crowd Strike</th>
                    <th>Qualys</th>
                    <th>Zabbix Agent</th>
                    <th>Cloud Watch Version</th>
                    <th>Crowd Strike Version</th>
                    <th>Qualys Version</th>
                    <th>Zabbix Version</th>
                    <th>Platform</th>
                    <th>State</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStatusData?.map((item: any, index: number) => (
                    <tr key={item?.instanceId || index}>
                      <td>{index + 1}</td>
                      <td>{item?.instanceName || '--'}</td>
                      <td>{item?.instanceId || '--'}</td>
                      <td>{item?.ip || '--'}</td>
                      <td>{item?.os || '--'}</td>
                      <td><Badge style={getStatusStyle(item?.services?.cloudWatch)}>{item?.services?.cloudWatch || '--'}</Badge></td>
                      <td><Badge style={getStatusStyle(item?.services?.crowdStrike)}>{item?.services?.crowdStrike || '--'}</Badge></td>
                      <td><Badge style={getStatusStyle(item?.services?.qualys)}>{item?.services?.qualys || '--'}</Badge></td>
                      <td><Badge style={getStatusStyle(item?.services?.zabbixAgent)}>{item?.services?.zabbixAgent || '--'}</Badge></td>
                      <td>{item?.versions?.cloudWatch || '--'}</td>
                      <td>{item?.versions?.crowdStrike || '--'}</td>
                      <td>{item?.versions?.qualys || '--'}</td>
                      <td>{item?.versions?.zabbixAgent || '--'}</td>
                      <td>{item?.platform || '--'}</td>
                      <td>{item?.state || '--'}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        )
      )}
    </Container>
  );
}
