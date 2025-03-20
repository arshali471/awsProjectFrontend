import { useContext, useEffect, useState } from "react"
import { LoadingContext, SelectedRegionContext } from "../../../context/context"
import { AdminService } from "../../../services/admin.service";
import { Card, Col, Form, Row } from "react-bootstrap";
import { CSVLink } from "react-csv";
import S3Table from "../../../Table/S3.table";
import moment from "moment";
import LoaderSpinner from "../../../Spinner/Spinner";
import TablePagination from "../../../Pagination/TablePagination";
import { get } from "http";
import VolumesTable from "../../../Table/Volumes.table";

export default function VolumesIndex() {
    const { selectedRegion }: any = useContext(SelectedRegionContext);
    const { loading, setLoading }: any = useContext(LoadingContext);


    const [Volumes, setVolumes] = useState<any>([]);
    const [paginatedData, setPaginatedData] = useState<any>([]);
    const [searchText, setSearchText] = useState<string>('');

    const [totalCount, setTotalCount] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [perPage, setPerPage] = useState<number>(10);
    const [downloadFilteredData, setDownlaodFilteredData] = useState<any>([]);



    const getVolumes = async () => {
        setLoading(true);
        try {
            const res = await AdminService.getAllVolumesData(selectedRegion.value);
            if (res.status === 200) {
                setVolumes(res.data); // Store the full dataset
                setTotalCount(res.data.length);
            }
        } catch (error) {
            console.error("Error fetching Volumes data", error);
        }
        setLoading(false);
    };

    const volumesData = Volumes.map((data, index) => ({
        volumeId: data.volumeId,
        state: data.state,
        size: data.size,
        volumeType: data.volumeType,
        iops: data.iops,
        throughput: data.throughput,
        snapshotId: data.snapshotId,
        availabilityZone: data.availabilityZone,
        encrypted: data.encrypted,
        createdAt: data.createdAt,
        attachedInstances: data.attachedInstances,
        attachedVolumeStatus: data.attachedInstances?.length > 0 ? "Attached" : "UnAttached"
    }));



    useEffect(() => {
        let filteredData = volumesData;

        if (searchText) {
            filteredData = volumesData.filter((instance: any) => {
                const instanceValues = Object.values(instance)
                    .map(value => (typeof value === 'object' ? Object.values(value).join('') : String(value)))
                    .join('');
                return instanceValues.toLowerCase().includes(searchText.toLowerCase());
            });
        }

        const startIndex = (currentPage - 1) * perPage;
        const endIndex = startIndex + perPage;
        setPaginatedData(filteredData.slice(startIndex, endIndex));
        setTotalCount(filteredData.length);
        setDownlaodFilteredData(filteredData);
    }, [Volumes, searchText, currentPage, perPage]);

    useEffect(() => {
        if (selectedRegion?.value) {
            setSearchText("");
            getVolumes();
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
                                    filename={"Volumes.csv"}
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
                                    <VolumesTable tableData={paginatedData} pageNumber={1} pageSize={10} />

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