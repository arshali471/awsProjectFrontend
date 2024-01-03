import { useContext, useEffect, useState } from "react"
import { LoadingContext, SelectedRegionContext } from "../../../context/context"
import { AdminService } from "../../../services/admin.service";
import { Card, Col, Form, Row } from "react-bootstrap";
import { CSVLink } from "react-csv";
import TablePagination from "../../../Pagination/Table.paginaition";
import S3Table from "../../../Table/S3.table";
import moment from "moment";
import LoaderSpinner from "../../../Spinner/Spinner";

export default function S3Index() {
    const { selectedRegion }: any = useContext(SelectedRegionContext);
    const { loading, setLoading }: any = useContext(LoadingContext);


    const [s3Data, setS3Data] = useState<any>([]);
    const [filterData, setFilterData] = useState<any>([]);
    const [searchText, setSearchText] = useState<any>();

    const [totalCount, setTotalCount] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [perPage, setPerPage] = useState<number>(10);


    const getAllS3Data = async () => {
        setLoading(true)
        await AdminService.getAllS3Data(selectedRegion.value).then((res) => {
            if (res.status === 200) {
                const startIndex = (currentPage - 1) * perPage;
                const endIndex = startIndex + perPage;
                const paginatedData = res.data.slice(startIndex, endIndex);
                setTotalCount(paginatedData.length)
                setS3Data(paginatedData)
            }
        })
        setLoading(false)
    }

    const handleSearchData = () => {
        setLoading(true)
        if (searchText !== '') {
            const filterData = s3Data && s3Data.filter((instance: any) => {
                const instanceValues = Object.values(instance)
                    .map((value: any) => {
                        if (typeof value === 'object') {
                            return Object.values(value).join('');
                        }
                        return String(value);
                    })
                    .join('');

                return instanceValues && instanceValues?.toLowerCase()?.includes(searchText.toLowerCase());
            });
            const startIndex = (currentPage - 1) * perPage;
            const endIndex = startIndex + perPage;
            const paginatedData = filterData.slice(startIndex, endIndex);
            setTotalCount(paginatedData.length)
            setFilterData(paginatedData);
        } else {
            setFilterData(s3Data || []);
        }
        setLoading(false)
    };


    const S3CSVDownload = filterData && filterData?.length > 0
        ? filterData?.map((data: any) => {
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
        if (searchText) {
            handleSearchData();
        }
    }, [searchText, currentPage, perPage])

    useEffect(() => {
        if (selectedRegion?.value) {
            getAllS3Data();
        }
    }, [selectedRegion?.value])


    return (
        <>
            {loading ?
                <div className="d-flex justify-content-center align-items-center">
                    <LoaderSpinner />
                </div>
                :
                <div style={{ width: "100%" }}>
                    <Row className="mt-3">
                        <Col>
                            <div className="mt-5 mb-3 d-flex justify-content-between align-items-center">
                                <div>
                                    <Form.Group>
                                        <Form.Control placeholder="Find instance by attribute" onChange={(e: any) => setSearchText(e.target.value)} />
                                    </Form.Group>
                                </div>
                                <div>
                                    <CSVLink
                                        data={S3CSVDownload}
                                        filename={"S3.csv"}
                                        className="btn btn-primary"
                                        target="_blank"
                                    >
                                        Export to CSV
                                    </CSVLink>
                                </div>
                            </div>
                        </Col>
                    </Row>
                    <Row className="d-flex justify-content-center align-items-center">
                        <Col>
                            {searchText && searchText.length > 0 ?
                                <Card className="shadow-sm">
                                    <Card.Body>
                                        <S3Table tableData={filterData} />
                                    </Card.Body>
                                </Card>
                                :
                                <Card className="shadow-sm">
                                    <Card.Body>
                                        <S3Table tableData={s3Data} />
                                    </Card.Body>
                                </Card>
                            }
                            <div className="bg-white py-2 px-3">
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
                        </Col>
                    </Row>
                </div>
            }
        </>
    )
}