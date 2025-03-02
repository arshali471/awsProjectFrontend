import { useContext, useEffect, useState } from "react";
import { AdminService } from "../../../services/admin.service";
import { LoadingContext, SelectedRegionContext } from "../../../context/context";
import { Card, Col, Container, Form, Row } from "react-bootstrap";
import InstanceTable from "../../../Table/Instance.table";
import { CSVLink } from "react-csv";
import moment from "moment";
import toast from "react-hot-toast";
import LoaderSpinner from "../../../Spinner/Spinner";
import TablePagination from "../../../Pagination/TablePagination";

export default function Dashboard() {
    const { selectedRegion }: any = useContext(SelectedRegionContext);
    const { loading, setLoading }: any = useContext(LoadingContext);

    const [instanceData, setInstanceData] = useState<any>([]);
    const [paginatedData, setPaginatedData] = useState<any>([]);
    const [searchText, setSearchText] = useState<string>("");
    const [totalCount, setTotalCount] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [perPage, setPerPage] = useState<number>(10);

    const getAllInstance = async () => {
        if (!selectedRegion?.value) return;

        setLoading(true);
        try {
            const res = await AdminService.getAllInstance(selectedRegion.value);
            if (res.status === 200) {
                setInstanceData(res.data);
                updatePagination(res.data);
            }
        } catch (err: any) {
            console.log(err);
            toast.error(err.response?.data || "Failed to fetch data");
        }
        setLoading(false);
    };

    const updatePagination = (data: any[]) => {
        const startIndex = (currentPage - 1) * perPage;
        const endIndex = startIndex + perPage;
        const paginated = data.slice(startIndex, endIndex);
        setPaginatedData(paginated);
        setTotalCount(data.length);
    };

    const handleSearchData = () => {
        if (!searchText.trim()) {
            updatePagination(instanceData);
            return;
        }

        const filteredData = instanceData.filter((instance: any) => {
            const instanceValues = Object.values(instance)
                .map((value: any) => (typeof value === "object" ? Object.values(value).join("") : String(value)))
                .join("");

            const tagValues = (instance.Tags || []).map((tag: any) => tag.Value).join("");

            return (
                instanceValues.toLowerCase().includes(searchText.toLowerCase()) ||
                tagValues.toLowerCase().includes(searchText.toLowerCase())
            );
        });

        updatePagination(filteredData);
    };

    const instanceCSVData = paginatedData.map((data: any) => ({
        InstanceId: data?.InstanceId,
        ImageId: data?.ImageId,
        InstanceType: data?.InstanceType,
        KeyName: data?.KeyName,
        LaunchTime: moment(data?.LaunchTime).format("DD MMM YY"),
        PrivateIpAddress: data?.PrivateIpAddress,
        State: data?.State?.Name,
        SubnetId: data?.SubnetId,
        VpcId: data?.VpcId,
        PlatformDetails: data?.PlatformDetails,
        AvailabilityZone: data?.Placement?.AvailabilityZone,
    }));

    useEffect(() => {
        getAllInstance();
    }, [selectedRegion?.value]);

    useEffect(() => {
        handleSearchData();
    }, [searchText, currentPage, perPage, instanceData]);

    return (
        <Container>
            {loading ? (
                <div className="d-flex justify-content-center align-items-center">
                    <LoaderSpinner />
                </div>
            ) : (
                <div>
                    <Row>
                        <Col>
                            <div className="mt-3 mb-3 d-flex justify-content-between align-items-center">
                                <Form.Group>
                                    <Form.Control
                                        style={{ width: 300 }}
                                        placeholder="Find instance by attribute"
                                        onChange={(e) => setSearchText(e.target.value)}
                                    />
                                </Form.Group>
                                <CSVLink
                                    data={instanceCSVData}
                                    filename="Instance.csv"
                                    className="btn btn-primary"
                                    target="_blank"
                                >
                                    Export to CSV
                                </CSVLink>
                            </div>
                        </Col>
                    </Row>

                    <Card style={{ width: "72rem" }}>
                        <Card.Body>
                            <InstanceTable tableData={paginatedData} />
                        </Card.Body>
                    </Card>

                    <div className="bg-white py-2">
                        <TablePagination
                            total={totalCount}
                            currentPage={currentPage}
                            perPage={perPage}
                            handlePageChange={setCurrentPage}
                            setPerPage={setPerPage}
                        />
                    </div>
                </div>
            )}
        </Container>
    );
}
