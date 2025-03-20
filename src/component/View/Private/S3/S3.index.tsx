import { useContext, useEffect, useState } from "react"
import { LoadingContext, SelectedRegionContext } from "../../../context/context"
import { AdminService } from "../../../services/admin.service";
import { Card, Col, Form, Row } from "react-bootstrap";
import { CSVLink } from "react-csv";
import S3Table from "../../../Table/S3.table";
import moment from "moment";
import LoaderSpinner from "../../../Spinner/Spinner";
import TablePagination from "../../../Pagination/TablePagination";

export default function S3Index() {
    const { selectedRegion }: any = useContext(SelectedRegionContext);
    const { loading, setLoading }: any = useContext(LoadingContext);


    const [s3Data, setS3Data] = useState<any>([]);
    const [paginatedData, setPaginatedData] = useState<any>([]);
    const [searchText, setSearchText] = useState<string>('');

    const [totalCount, setTotalCount] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [perPage, setPerPage] = useState<number>(10);
    const [downloadFilteredData, setDownlaodFilteredData] = useState<any>([]);



    const getAllS3Data = async () => {
        setLoading(true);
        try {
            const res = await AdminService.getAllS3Data(selectedRegion.value);
            if (res.status === 200) {
                setS3Data(res.data); // Store the full dataset
                setTotalCount(res.data.length);
            }
        } catch (error) {
            console.error("Error fetching S3 data", error);
        }
        setLoading(false);
    };


    const S3CSVDownload = s3Data && s3Data?.length > 0
        ? s3Data?.map((data: any) => {
            return ({
                "Bucket Name": data?.bucketName,
                "Creation Date": moment(data?.creationDate).format("DD MMM YYYY"),
                "Location": data?.location,
                "Size": data?.size,
            })
        }) : s3Data?.map((data: any) => {
            return ({
                "Bucket Name": data?.bucketName,
                "Creation Date": moment(data?.creationDate).format("DD MMM YYYY"),
                "Location": data?.location,
                "Size": data?.size,
            })
        });



    useEffect(() => {
        let filteredData = s3Data;

        if (searchText) {
            filteredData = s3Data.filter((instance: any) => {
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
    }, [s3Data, searchText, currentPage, perPage]);

    useEffect(() => {
        if (selectedRegion?.value) {
            setSearchText("")
            getAllS3Data();
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
                                    filename={"S3.csv"}
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
                                    <S3Table tableData={paginatedData} pageNumber= {currentPage} pageSize= { perPage} />
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