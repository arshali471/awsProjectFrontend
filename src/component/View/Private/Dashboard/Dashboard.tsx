import { useContext, useEffect, useMemo, useState } from "react";
import { AdminService } from "../../../services/admin.service";
import { LoadingContext, SelectedRegionContext } from "../../../context/context";
import toast from "react-hot-toast";
import DatePicker from "react-datepicker";
import { Button, Col, Form, Row, Container } from "react-bootstrap";
import InstanceTable from "../../../Table/Instance.table";
import './Dashboard.css';
import moment from "moment";

export default function Dashboard() {
    const { selectedRegion }: any = useContext(SelectedRegionContext);
    const { loading, setLoading }: any = useContext(LoadingContext);

    const [instanceData, setInstanceData] = useState<any[]>([]);
    const [searchText, setSearchText] = useState<string>("");
    const [startDate, setStartDate] = useState(new Date());
    const [showAllStats, setShowAllStats] = useState(false);

    const getAllInstance = async () => {
        if (!selectedRegion?.value) return;
        setLoading(true);
        try {
            const isToday = moment(new Date()).isSame(startDate, "day");
            const source = isToday ? "api" : "db";
            const dateParam = isToday ? undefined : moment(startDate).utc().format();

            const res = await AdminService.getAllInstance(
                selectedRegion.value,
                source,
                dateParam
            );

            if (res.status === 200 && Array.isArray(res.data.data)) {
                setInstanceData(res.data.data);
            } else {
                setInstanceData([]);
            }
        } catch (err: any) {
            toast.error(err.response?.data || "Failed to fetch data");
            setInstanceData([]);
        }
        setLoading(false);
    };


    const getGlobalInstance = async () => {
        setLoading(true);
        try {
            if (!searchText.trim()) {
                toast.error("Please enter IP address to search.");
                setLoading(false);
                return;
            }

            const res = await AdminService.getGlobalInstance(
                searchText.toLowerCase()
            );

            if (res.status === 200 && Array.isArray(res.data.matchedInstances)) {
                setInstanceData(res.data.matchedInstances);
            } else {
                setInstanceData([]);
            }
        } catch (err: any) {
            toast.error(err.response?.data || "Failed to fetch data");
            setInstanceData([]);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (selectedRegion?.value) {
            getAllInstance();
        }
    }, [selectedRegion, startDate]);

    const filteredInstanceData = useMemo(() => {
        const search = searchText.toLowerCase();
        return instanceData.filter((item: any) => {
            const combinedValues = Object.values(item)
                .map(val => {
                    if (typeof val === 'object') {
                        try {
                            return JSON.stringify(val);
                        } catch {
                            return '';
                        }
                    }
                    return String(val);
                })
                .join('')
                .toLowerCase();
            return combinedValues.includes(search);
        });
    }, [instanceData, searchText]);

    const totalCount = instanceData.length;
    const runningCount = instanceData.filter(i => i?.State?.Name === 'running').length;
    const stoppedCount = instanceData.filter(i => i?.State?.Name === 'stopped').length;
    const osCountMap = instanceData.reduce((acc: any, curr: any) => {
        const os = curr?.Tags?.find((tag: any) => tag.Key === 'Operating_System')?.Value || 'Unknown';
        acc[os] = (acc[os] || 0) + 1;
        return acc;
    }, {});

    return (
        <Container>
            <Row className="mt-3 stats-row">
                <Col>
                    <div className="d-flex gap-3 flex-wrap">
                        <div className="stat-box">Total: {totalCount}</div>
                        <div className="stat-box running">Running: {runningCount}</div>
                        <div className="stat-box stopped">Stopped: {stoppedCount}</div>
                        {[...Object.keys(osCountMap).slice(0, 4)].map((os, index) => (
                            <div className="stat-box" key={index}>{os}: {osCountMap[os]}</div>
                        ))}
                        <Button variant="link" onClick={() => setShowAllStats(!showAllStats)}>
                            {showAllStats ? 'Hide' : 'Show All'}
                        </Button>
                    </div>
                    {showAllStats && (
                        <div className="d-flex gap-3 flex-wrap mt-2">
                            {Object.keys(osCountMap).slice(4).map((os, index) => (
                                <div className="stat-box" key={index}>{os}: {osCountMap[os]}</div>
                            ))}
                        </div>
                    )}
                </Col>
            </Row>

            <Row className="mt-3 align-items-end g-2">
                <Col md={3} className="mb-2">
                    <Form.Group>
                        {/* <Form.Label>Search</Form.Label> */}
                        <Form.Control
                            type="text"
                            placeholder="Search"
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                        />
                    </Form.Group>
                </Col>
                <Col md={3} className="mb-2">
                    <Form.Group>
                        <Form.Label>Start Date</Form.Label>
                        <DatePicker
                            selected={startDate}
                            onChange={(date: any) => setStartDate(date)}
                            className="form-control"
                            maxDate={new Date()}
                        />
                    </Form.Group>
                </Col>
                <Col md={2} className="mb-2">
                    <Button style={{ backgroundColor: '#1876d2', borderColor: '#1876d2', width: '100%' }} onClick={getGlobalInstance}>Global Search</Button>
                </Col>
            </Row>

            <Row className="mt-3">
                <Col>
                    <InstanceTable
                        tableData={filteredInstanceData}
                        loading={loading}
                        fetchData={getAllInstance}
                    />
                </Col>
            </Row>
        </Container>
    );
}
