import React, { useContext, useEffect, useState } from 'react';
import { LoadingContext, SelectedRegionContext } from '../../../context/context';
import { AdminService } from '../../../services/admin.service';
import toast from 'react-hot-toast';
import LoaderSpinner from '../../../Spinner/Spinner';
import { Card, Col, Form, Row } from 'react-bootstrap';
import TablePagination from '../../../Pagination/TablePagination';
import EksTable from '../../../Table/Eks.table';
import { CSVLink } from 'react-csv';
import { Box, Typography } from '@mui/material';
import AccountTreeIcon from '@mui/icons-material/AccountTree';

export default function Kubernetes({ selectedRegion }: any) {


    const { loading, setLoading }: any = useContext(LoadingContext);

    const [eksData, setEksData] = useState<any>([]);
    const [paginatedData, setPaginatedData] = useState<any>([]);
    const [searchText, setSearchText] = useState<string>('');
    const [totalCount, setTotalCount] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [perPage, setPerPage] = useState<number>(10);
    const [downloadFilteredData, setDownlaodFilteredData] = useState<any>([]);

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
            setSearchText("")
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
        setDownlaodFilteredData(filteredData);
    }, [eksData, searchText, currentPage, perPage]);

    return (
        <>
            {loading ? (
                <div className="d-flex justify-content-center align-items-center">
                    <LoaderSpinner />
                </div>
            ) : (
                <div>
                    {/* Page Header - Matching Dashboard Style */}
                    <Box sx={{ mb: 3, mt: 3 }}>
                        <Box display="flex" alignItems="center" gap={2}>
                            <Box
                                sx={{
                                    width: 56,
                                    height: 56,
                                    background: 'linear-gradient(135deg, #0073bb 0%, #1a8cd8 100%)',
                                    borderRadius: '16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    boxShadow: '0 4px 16px rgba(0, 115, 187, 0.3)',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        transform: 'translateY(-2px)',
                                        boxShadow: '0 8px 20px rgba(0, 115, 187, 0.4)',
                                    }
                                }}
                            >
                                <AccountTreeIcon sx={{ fontSize: 32 }} />
                            </Box>
                            <Box>
                                <Typography
                                    variant="h4"
                                    sx={{
                                        fontWeight: 700,
                                        color: '#232f3e',
                                        letterSpacing: '-0.5px',
                                    }}
                                >
                                    EKS Clusters
                                </Typography>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: '#6c757d',
                                        mt: 0.5,
                                    }}
                                >
                                    Manage and monitor your Amazon EKS Kubernetes clusters
                                </Typography>
                            </Box>
                        </Box>
                    </Box>

                    <Row className="mt-3">
                        <Col>
                            <div className="mt-3 mb-3 d-flex justify-content-between align-items-center">
                                <Form.Group>
                                    <Form.Control
                                 style = {{width: 300}}
                                        placeholder="Find by attribute"
                                        onChange={(e) => setSearchText(e.target.value)}
                                    />
                                </Form.Group>
                                <CSVLink
                                    data={downloadFilteredData}
                                    filename={"EKS.csv"}
                                    className="btn btn-primary"
                                    target="_blank"
                                >
                                    Export to CSV
                                </CSVLink>
                            </div>
                        </Col>
                    </Row>
                    <div>
                        <Card>
                            <Card.Body>
                                <EksTable tableData={paginatedData} pageNumber={currentPage} pageSize={perPage} />
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