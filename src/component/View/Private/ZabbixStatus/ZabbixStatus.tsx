import React, { useState } from "react";
import { Card, Col, Container, Row, Button, Form, Table } from "react-bootstrap";
import Select from "react-select";
import { CSVLink } from "react-csv";
import axios from "axios";
import LoaderSpinner from "../common/LoaderSpinner";

const ZabbixStatus = ({ data }: { data: any }) => {
  const [sshKeyPath, setSshKeyPath] = useState<any>(null);
  const [sshUsername, setSshUsername] = useState<string>("");
  const [operatingSystem, setOperatingSystem] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [statusData, setStatusData] = useState<any[]>([]);
  const [searchText, setSearchText] = useState<string>("");

  const handleSubmit = async () => {
    if (!sshUsername || !operatingSystem || !sshKeyPath) return;
    setLoading(true);
    try {
      const response = await axios.post("/api/check-status", {
        sshUsername,
        sshKeyPath: sshKeyPath.value,
        operatingSystem,
      });
      setStatusData(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
    setLoading(false);
  };

  const getStatusStyle = (status: string) => {
    return {
      padding: "2px 8px",
      borderRadius: "4px",
      color: "white",
      backgroundColor:
        status === "active" ? "#28a745" : status === "inactive" ? "#dc3545" : "#6c757d",
    };
  };

  const filteredStatusData = statusData.filter(
    (item) =>
      item?.instanceName?.toLowerCase().includes(searchText.toLowerCase()) ||
      item?.instanceId?.toLowerCase().includes(searchText.toLowerCase()) ||
      item?.ip?.toLowerCase().includes(searchText.toLowerCase())
  );

  const statusCSVData = filteredStatusData.map((item, idx) => ({
    "Sr.No": idx + 1,
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
  }));

  return (
    <Container fluid className="mt-4">
      <Card>
        <Card.Body>
          <Row className="mb-3">
            <Col md={3}>
              <Form.Group>
                <Form.Label>SSH Username</Form.Label>
                <Form.Control
                  type="text"
                  value={sshUsername}
                  onChange={(e) => setSshUsername(e.target.value)}
                  placeholder="Enter SSH Username"
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>OS</Form.Label>
                <Form.Control
                  type="text"
                  value={operatingSystem}
                  onChange={(e) => setOperatingSystem(e.target.value)}
                  placeholder="Enter OS"
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>SSH Key</Form.Label>
                <Select
                  options={data}
                  value={sshKeyPath}
                  onChange={(val) => setSshKeyPath(val)}
                />
              </Form.Group>
            </Col>
            <Col md={3} className="d-flex align-items-end">
              <Button variant="primary" onClick={handleSubmit} disabled={loading}>
                {loading ? <LoaderSpinner /> : 'Get Status'}
              </Button>
            </Col>
          </Row>

          {statusData.length > 0 && (
            <>
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Control
                    type="text"
                    placeholder="Search by Instance Name, ID, or IP"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                  />
                </Col>
                <Col md={6} className="text-end">
                  <CSVLink data={statusCSVData} filename="zabbix-status.csv">
                    <Button variant="success">Export CSV</Button>
                  </CSVLink>
                </Col>
              </Row>

              <div className="table-responsive">
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>Sr.No</th>
                      <th>Instance Name</th>
                      <th>Instance ID</th>
                      <th>IP</th>
                      <th>OS</th>
                      <th>Cloud Watch Status</th>
                      <th>Crowd Strike Status</th>
                      <th>Qualys Status</th>
                      <th>Zabbix agent Status</th>
                      <th>Cloud Watch Version</th>
                      <th>Crowd Strike Version</th>
                      <th>Qualys Version</th>
                      <th>Zabbix agent Version</th>
                      <th>Platform</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStatusData.map((item, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{item?.instanceName || '--'}</td>
                        <td>{item?.instanceId || '--'}</td>
                        <td>{item?.ip || '--'}</td>
                        <td>{item?.os || '--'}</td>
                        <td><span style={getStatusStyle(item?.services?.cloudWatch)}>{item?.services?.cloudWatch || '--'}</span></td>
                        <td><span style={getStatusStyle(item?.services?.crowdStrike)}>{item?.services?.crowdStrike || '--'}</span></td>
                        <td><span style={getStatusStyle(item?.services?.qualys)}>{item?.services?.qualys || '--'}</span></td>
                        <td><span style={getStatusStyle(item?.services?.zabbixAgent)}>{item?.services?.zabbixAgent || '--'}</span></td>
                        <td>{item?.versions?.cloudWatch || '--'}</td>
                        <td>{item?.versions?.crowdStrike || '--'}</td>
                        <td>{item?.versions?.qualys || '--'}</td>
                        <td>{item?.versions?.zabbixAgent || '--'}</td>
                        <td>{item?.platform || '--'}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ZabbixStatus;
