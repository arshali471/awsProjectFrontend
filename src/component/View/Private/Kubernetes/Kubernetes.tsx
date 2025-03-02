import React, { useContext, useEffect, useState } from 'react';
import { LoadingContext, SelectedRegionContext } from '../../../context/context';
import { AdminService } from '../../../services/admin.service';
import toast from 'react-hot-toast';
import LoaderSpinner from '../../../Spinner/Spinner';
import { Card, Col, Form, Row } from 'react-bootstrap';
import TablePagination from '../../../Pagination/TablePagination';
import EksTable from '../../../Table/Eks.table';

export default function Kubernetes() {
    const { selectedRegion }: any = useContext(SelectedRegionContext);
    const { loading, setLoading }: any = useContext(LoadingContext);

    const [eksData, setEksData] = useState<any>([]);
    const [paginatedData, setPaginatedData] = useState<any>([]);
    const [searchText, setSearchText] = useState<string>('');
    const [totalCount, setTotalCount] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [perPage, setPerPage] = useState<number>(10);

    const getEksCluster = async () => {
        setLoading(true);
        try {
            const res = await AdminService.getEksCluster(selectedRegion.value);
            if (res.status === 200) {
                setEksData(res.data);
                setTotalCount(res.data.length);
            }
        } catch (error) {
            console.error("Error fetching EKS data", error);
            toast.error(error.response?.data || "Failed to fetch EKS clusters");
        }
        setLoading(false);
    };

    useEffect(() => {
        if (selectedRegion?.value) {
            getEksCluster();
        }
    }, [selectedRegion?.value]);

    useEffect(() => {
        let filteredData = eksData;
        
        if (searchText) {
            filteredData = eksData.filter((instance: any) => {
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
    }, [eksData, searchText, currentPage, perPage]);

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
                                        placeholder="Search..."
                                        onChange={(e) => setSearchText(e.target.value)}
                                    />
                                </Form.Group>
                            </div>
                        </Col>
                    </Row>
                    <div>
                        <Card>
                            <Card.Body>
                                <EksTable tableData={paginatedData} pageNumber={currentPage} pageSize={perPage}/>
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
                </div>
            )}
        </>
    );
}