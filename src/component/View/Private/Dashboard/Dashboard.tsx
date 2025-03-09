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
    const [downloadFilteredData, setDownlaodFilteredData] = useState<any>([]);

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
        setDownlaodFilteredData(data);
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

    // const instanceCSVData = downloadFilteredData.map((data: any) => ({
    //     InstanceId: data?.InstanceId,
    //     ImageId: data?.ImageId,
    //     InstanceType: data?.InstanceType,
    //     KeyName: data?.KeyName,
    //     LaunchTime: moment(data?.LaunchTime).format("DD MMM YY"),
    //     PrivateIpAddress: data?.PrivateIpAddress,
    //     State: data?.State?.Name,
    //     SubnetId: data?.SubnetId,
    //     VpcId: data?.VpcId,
    //     PlatformDetails: data?.PlatformDetails,
    //     AvailabilityZone: data?.Placement?.AvailabilityZone,
    // }));

    const instanceCSVData = downloadFilteredData.map((data: any) => ({
        InstanceName: data?.Tags?.find((tag: any) => tag.Key === "Name")?.Value || "N/A",
        InstanceId: data?.InstanceId,
        InstanceType: data?.InstanceType,
        State: data?.State?.Name,
        ImageId: data?.ImageId,
        KeyName: data?.KeyName,
        LaunchTime: moment(data?.LaunchTime).format("DD MMM YY"),
        PrivateIpAddress: data?.PrivateIpAddress,
        PlatformDetails: data?.PlatformDetails,
        SubnetId: data?.SubnetId,
        VpcId: data?.VpcId,
        AvailabilityZone: data?.Placement?.AvailabilityZone,

        // Newly added fields
        Architecture: data?.Architecture,
        RootDeviceType: data?.RootDeviceType,
        RootDeviceName: data?.RootDeviceName,
        SecurityGroups: data?.SecurityGroups?.map((group: any) => group?.GroupName).join(", "),
        EbsOptimized: data?.EbsOptimized,
        CpuCoreCount: data?.CpuOptions?.CoreCount,
        ThreadsPerCore: data?.CpuOptions?.ThreadsPerCore,

        // Extracting Volume ID
        VolumeId: data?.BlockDeviceMappings?.map((block: any) => block?.Ebs?.VolumeId).join(", "),

        // Extracting useful tags
        OperatingSystem: data?.Tags?.find((tag: any) => tag.Key === "Operating_System")?.Value || "N/A",
        Environment: data?.Tags?.find((tag: any) => tag.Key === "Environment")?.Value || "N/A",
        Application: data?.Tags?.find((tag: any) => tag.Key === "Application")?.Value || "N/A",
        ITLTOwner: data?.Tags?.find((tag: any) => tag.Key === "ITLT_Owner")?.Value || "N/A",
        BusinessOwner: data?.Tags?.find((tag: any) => tag.Key === "Business_Owner")?.Value || "N/A",
        CostCenter: data?.Tags?.find((tag: any) => tag.Key === "Cost_Center")?.Value || "N/A",
        RetentionDays: data?.Tags?.find((tag: any) => tag.Key === "Retention")?.Value || "N/A",
        ShutDownSchedule: data?.Tags?.find((tag: any) => tag.Key === "Shut_Down")?.Value || "N/A",
        StartUpSchedule: data?.Tags?.find((tag: any) => tag.Key === "Start_Up")?.Value || "N/A",
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
                                        placeholder="Find by attribute"
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
                            <InstanceTable tableData={paginatedData} pageNumber={currentPage} pageSize={perPage} />
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
