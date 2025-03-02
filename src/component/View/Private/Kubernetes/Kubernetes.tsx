import React, { useContext, useEffect, useState } from 'react'
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
    const [filterData, setFilterData] = useState<any>([]);
    const [searchText, setSearchText] = useState<any>();

    const [totalCount, setTotalCount] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [perPage, setPerPage] = useState<number>(10);


    const getEksCluster = async () => {
        setLoading(true)
        await AdminService.getEksCluster(selectedRegion.value).then((res) => {
            if (res.status === 200) {
                const startIndex = (currentPage - 1) * perPage;
                const endIndex = startIndex + perPage;
                const paginatedData = res.data.slice(startIndex, endIndex);
                setTotalCount(paginatedData.length)
                setEksData(paginatedData)
            }
        }).catch(err => {
            console.log(err)
            toast.error(err.response.data)
        })
        setLoading(false)
    }


    const handleSearchData = () => {
        setLoading(true)
        if (searchText !== '') {
            const filterData = eksData && eksData.filter((instance: any) => {
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
            setFilterData(eksData || []);
        }
        setLoading(false)
    };


    useEffect(() => {
        if (searchText) {
            handleSearchData();
        }
    }, [searchText, currentPage, perPage])

    useEffect(() => {
        if (selectedRegion?.value) {
            getEksCluster();
        }
    }, [selectedRegion?.value,currentPage, perPage])




    return (
        <>
            {loading ?
                <div className="d-flex justify-content-center align-items-center">
                    <LoaderSpinner />
                </div>
                :
                <div>
                    <Row className="mt-3">
                        <Col>
                            <div className="mt-3 mb-3 d-flex justify-content-between align-items-center">
                                <div>
                                    <Form.Group>
                                        <Form.Control placeholder="Search..." onChange={(e: any) => setSearchText(e.target.value)} />
                                    </Form.Group>
                                </div>
                            </div>
                        </Col>
                    </Row>
                    <div>
                        <Card>
                            <Card.Body>
                                <EksTable tableData={searchText && searchText.length > 0 ? filterData : eksData} />
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
        </>
    )
}
