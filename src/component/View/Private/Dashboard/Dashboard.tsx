import { useContext, useEffect, useState } from "react"
import { AdminService } from "../../../services/admin.service"
import { LoadingContext, SelectedRegionContext } from "../../../context/context"
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
    const [filterData, setFilterData] = useState<any>([]);
    const [searchText, setSearchText] = useState<any>();

    const [totalCount, setTotalCount] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [perPage, setPerPage] = useState<number>(10);

    const getAllInstance = async () => {
        setLoading(true)
        await AdminService.getAllInstance(selectedRegion.value).then((res) => {
            if (res.status === 200) {
                const startIndex = (currentPage - 1) * perPage;
                const endIndex = startIndex + perPage;
                const paginatedData = res.data.slice(startIndex, endIndex);
                setTotalCount(paginatedData.length)
                setInstanceData(paginatedData)
            }
        }).catch(err => {
            console.log(err)
            toast.error(err.response.data)
        })
        setLoading(false)
    }


    const handleSearchData = () => {
        setLoading(true);
        if (searchText !== '') {
            const filterData = instanceData && instanceData.filter((instance: any) => {
                const instanceValues = Object.values(instance)
                    .map((value: any) => {
                        if (typeof value === 'object') {
                            return Object.values(value).join('');
                        }
                        return String(value);
                    })
                    .join('');

                const tags = instance.Tags || [];
                const tagValues = tags.map((tag: any) => tag.Value).join('');

                return tagValues.toLowerCase().includes(searchText.toLowerCase()) ||
                    instanceValues.toLowerCase().includes(searchText.toLowerCase());
            });

            const startIndex = (currentPage - 1) * perPage;
            const endIndex = startIndex + perPage;
            const paginatedData = filterData.slice(startIndex, endIndex);
            setTotalCount(paginatedData.length);
            setFilterData(paginatedData);
        } else {
            setFilterData(instanceData || []);
        }
        setLoading(false);
    };


    const InstanceCSVDownload = filterData && filterData?.length > 0
        ? filterData?.map((data: any) => {
            return ({
                InstanceId: data?.InstanceId,
                "ImageId": data?.ImageId,
                "InstanceType": data?.InstanceType,
                "KeyName": data?.KeyName,
                "LaunchTime": moment(data?.LaunchTime).format("DD MMM YY"),
                "PrivateIpAddress": data?.PrivateIpAddress,
                "State": data?.State?.Name,
                "SubnetId": data?.SubnetId,
                "VpcId": data?.VpcId,
                "PlatformDetails": data?.PlatformDetails,
                "AvailabilityZone": data?.Placement?.AvailabilityZone
            })
        }) : instanceData?.map((data: any) => {
            return ({
                InstanceId: data?.InstanceId,
                "ImageId": data?.ImageId,
                "InstanceType": data?.InstanceType,
                "KeyName": data?.KeyName,
                "LaunchTime": moment(data?.LaunchTime).format("DD MMM YY"),
                "PrivateIpAddress": data?.PrivateIpAddress,
                "State": data?.State?.Name,
                "SubnetId": data?.SubnetId,
                "VpcId": data?.VpcId,
                "PlatformDetails": data?.PlatformDetails,
                "AvailabilityZone": data?.Placement?.AvailabilityZone
            })
        });

    useEffect(() => {
        if (searchText) {
            handleSearchData();
        }
    }, [searchText, currentPage, perPage])

    useEffect(() => {
        if (selectedRegion?.value) {
            getAllInstance();
        }
    }, [selectedRegion?.value, currentPage, perPage])


    return (
        <>
            <Container>
                {loading ?
                    <div className="d-flex justify-content-center align-items-center">
                        <LoaderSpinner />
                    </div>
                    :
                    <div>
                        <Row>
                            <Col>
                                <div className="mt-3 mb-3 d-flex justify-content-between align-items-center">
                                    <div>
                                        <Form.Group>
                                            <Form.Control style={{ width: 300 }} placeholder="Find instance by attribute" onChange={(e: any) => setSearchText(e.target.value)} />
                                        </Form.Group>
                                    </div>
                                    <div>
                                        <CSVLink
                                            data={InstanceCSVDownload}
                                            filename={"Instance.csv"}
                                            className="btn btn-primary"
                                            target="_blank"
                                        >
                                            Export to CSV
                                        </CSVLink>
                                    </div>
                                </div>
                            </Col>
                        </Row>

                        <div>
                            <Card style={{ width: "72rem" }}>
                                <Card.Body>
                                    <InstanceTable tableData={searchText && searchText.length > 0 ? filterData : instanceData} />
                                </Card.Body>
                            </Card>
                            <div className="bg-white py-2">
                                <TablePagination
                                    total={totalCount}
                                    currentPage={currentPage}
                                    perPage={perPage}
                                    handlePageChange={(e: number) => {
                                        setCurrentPage(e)
                                    }}
                                    setPerPage={(e: number) => { setPerPage(e) }}
                                />
                            </div>
                        </div>
                    </div>
                }
            </Container>
        </>
    )
}