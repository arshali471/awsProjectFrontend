import { useContext, useEffect, useState } from "react"
import { LoadingContext, SelectedRegionContext } from "../../../context/context"
import { AdminService } from "../../../services/admin.service";
import { Card, Col, Form, Row } from "react-bootstrap";
import { CSVLink } from "react-csv";
import LoaderSpinner from "../../../Spinner/Spinner";
import TablePagination from "../../../Pagination/TablePagination";
import RDSTable from "../../../Table/RDS.table";

export default function RDSIndex() {
    const { selectedRegion }: any = useContext(SelectedRegionContext);
    const { loading, setLoading }: any = useContext(LoadingContext);


    const [rdsData, setrdsData] = useState<any>([]);
    const [paginatedData, setPaginatedData] = useState<any>([]);
    const [searchText, setSearchText] = useState<string>('');

    const [totalCount, setTotalCount] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [perPage, setPerPage] = useState<number>(10);
    const [ downloadFilteredData, setDownlaodFilteredData ] = useState<any>([]);



    const getAllRDSData = async () => {
        setLoading(true);
        try {
            const res = await AdminService.getAllRDSData(selectedRegion.value);
            if (res.status === 200) {
                setrdsData(res.data); // Store the full dataset
                setTotalCount(res.data.length);
            }
        } catch (error) {
            console.error("Error fetching S3 data", error);
        }
        setLoading(false);
    };


    const S3CSVDownload = rdsData && rdsData?.length > 0
        ? rdsData?.map((data: any) => {
            return (
                {
                    "instanceId": data?.instanceId,
                    "status": data?.status,
                    "engine": data?.engine,
                    "engineVersion": data?.engineVersion,
                    "storage": data?.storage,
                    "instanceClass": data?.instanceClass,
                    "vpcId": data?.vpcId,
                    "subnetGroup": data?.subnetGroup,
                    "availabilityZone": data?.availabilityZone,
                    "createdAt": data?.createdAt,
                    "endpoint": data?.endpoint,
                    "securityGroups": data?.securityGroups
                }
            )
        }) : rdsData?.map((data: any) => {
            return ({
                "instanceId": data?.instanceId,
                "status": data?.status,
                "engine": data?.engine,
                "engineVersion": data?.engineVersion,
                "storage": data?.storage,
                "instanceClass": data?.instanceClass,
                "vpcId": data?.vpcId,
                "subnetGroup": data?.subnetGroup,
                "availabilityZone": data?.availabilityZone,
                "createdAt": data?.createdAt,
                "endpoint": data?.endpoint,
                "securityGroups": data?.securityGroups
            })
        })


    useEffect(() => {
            let filteredData = rdsData;

            if (searchText) {
                filteredData = rdsData.filter((instance: any) => {
                    const instanceValues = Object.values(instance)
                        .map(value => (typeof value === 'object' ? Object.values(value).join('') : String(value)))
                        .join('');
                    return instanceValues.toLowerCase().includes(searchText.toLowerCase());
                });
            }

            const startIndex = (currentPage - 1) * perPage;
            const endIndex = startIndex + perPage;
            setDownlaodFilteredData(filteredData);
            setPaginatedData(filteredData.slice(startIndex, endIndex));
            setTotalCount(filteredData.length);
        }, [rdsData, searchText, currentPage, perPage]);

    useEffect(() => {
        if (selectedRegion?.value) {
            getAllRDSData();
        }
    }, [selectedRegion?.value]);

    return (
        <>
            {loading ? (
                <div className="d-flex justify-content-center align-items-center">
                    <LoaderSpinner />
                </div>
            ) : (
                <div>
                    <Row className="mt-3">
                        <Col>
                            <div className="mt-3 mb-3 d-flex justify-content-between align-items-center">
                                <Form.Group>
                                    <Form.Control
                                        placeholder="Find by attribute"
                                        onChange={(e) => setSearchText(e.target.value)}
                                    />
                                </Form.Group>
                                <CSVLink
                                    data={downloadFilteredData}
                                    filename={"RDS.csv"}
                                    className="btn btn-primary"
                                    target="_blank"
                                >
                                    Export to CSV
                                </CSVLink>
                            </div>
                        </Col>
                    </Row>
                    <Row className="d-flex justify-content-center align-items-center">
                        <Col>
                            <Card>
                                <Card.Body>
                                    <RDSTable tableData={paginatedData} pageNumber={currentPage} pageSize={perPage} />
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
                        </Col>
                    </Row>
                </div>
            )}
        </>
    )
}