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
import Select from "react-select";
import DatePicker from "react-datepicker";



export default function Dashboard() {
    const { selectedRegion }: any = useContext(SelectedRegionContext);
    const { loading, setLoading }: any = useContext(LoadingContext);

    const [instanceData, setInstanceData] = useState<any[]>([]);
    const [paginatedData, setPaginatedData] = useState<any[]>([]);
    const [searchText, setSearchText] = useState<string>("");
    const [totalCount, setTotalCount] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [perPage, setPerPage] = useState<number>(10);
    const [downloadFilteredData, setDownloadFilteredData] = useState<any[]>([]);

    const [selectedType, setSelectedType] = useState<any>();
    const [startDate, setStartDate] = useState(new Date());

    const data = [
        {
            label: "Fetch Live Data",
            value: "api"
        },
        {
            label: "Fetch From Database",
            value: "db"
        },
        {
            label: "Cloud to Database",
            value: "api-save-db"
        },
    ]

    const getAllInstance = async () => {
        if (!selectedRegion?.value) return;
        setLoading(true);
        try {
            const res = await AdminService.getAllInstance(
                selectedRegion.value,
                selectedType?.value,
                selectedType?.value === "db" ? moment(startDate).utc().format() : undefined
            );
            if (res.status === 200 && Array.isArray(res.data.data)) {
                setInstanceData(res.data.data);
                setTotalCount(res.data.data.length);
            } else {
                setInstanceData([]); // Ensure it's always an array
                setTotalCount(0);
            }
        } catch (err: any) {
            toast.error(err.response?.data || "Failed to fetch data");
            setInstanceData([]);
            setTotalCount(0);
        }
        setLoading(false);
    };

    useEffect(() => {
        let filteredData = instanceData;

        if (searchText) {
            filteredData = instanceData.filter((instance: any) => {
                const instanceValues = Object.values(instance)
                    .map(value => (typeof value === "object" ? JSON.stringify(value) : String(value)))
                    .join("");
                return instanceValues.toLowerCase().includes(searchText.toLowerCase());
            });
        }

        const startIndex = (currentPage - 1) * perPage;
        setPaginatedData(filteredData.slice(startIndex, startIndex + perPage));
        setTotalCount(filteredData.length);
        setDownloadFilteredData(filteredData);
    }, [instanceData, searchText, currentPage, perPage]);

    useEffect(() => {
        if (selectedRegion?.value) {
            setSearchText("");
            getAllInstance();
        }
    }, [selectedRegion?.value, selectedType?.value !== "db" && selectedType?.value, selectedType?.value === 'db' ? startDate : null]);

    useEffect(() => {
        setSelectedType(data[0]);
    }, []);

    return (
        <>
            {loading ? (
                <div className="d-flex justify-content-center align-items-center">
                    <LoaderSpinner />
                </div>
            ) : (
                <Container>
                    <Row className="mt-3">
                        <Col>
                            <div className="mt-3 mb-3 d-flex justify-content-between align-items-center">
                                <Form.Group>
                                    <Form.Control
                                        // className="w-100"
                                        style = {{width: 300}}
                                        placeholder="Find by attribute..."
                                        value={searchText}
                                        onChange={(e) => setSearchText(e.target.value)}
                                    />
                                </Form.Group>
                                <div className="d-flex gap-2">
                                    <div style={{ width: 200 }}>
                                        <Select
                                            options={data}
                                            value={selectedType}
                                            onChange={(e) => setSelectedType(e)}
                                            className="w-100"
                                            isSearchable={true}
                                        />
                                    </div>

                                    {selectedType?.value === "db" && (
                                        <DatePicker
                                            selected={startDate}
                                            onChange={(date: any) => setStartDate(date)}
                                            className="w-100 form-control"
                                            showTimeSelect
                                            dateFormat="MMMM d, yyyy h:mm aa"
                                        />
                                    )}

                                    {downloadFilteredData.length > 0 ? (
                                        <CSVLink
                                            data={downloadFilteredData}
                                            headers={Object.keys(downloadFilteredData[0] || {})} // Ensure headers are valid
                                            filename={"Instances.csv"}
                                            className="btn btn-primary"
                                        >
                                            Export to CSV
                                        </CSVLink>
                                    ) : (
                                        <button className="btn btn-secondary" disabled>
                                            No Data to Export
                                        </button>
                                    )}
                                </div>

                            </div>
                        </Col>
                    </Row>
                    <Row className="d-flex justify-content-center align-items-center">
                        <Col>
                            <Card>
                                <Card.Body>
                                    <InstanceTable tableData={paginatedData} pageNumber={1} pageSize={10} />
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
                </Container>
            )}
        </>
    );
}
