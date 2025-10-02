import { useEffect, useState } from "react";
import { Button, Card, Container, Form, Modal, OverlayTrigger, Spinner, Table, Tooltip } from "react-bootstrap";
import { AdminService } from "../../../services/admin.service";
import toast from "react-hot-toast";
import Select from "react-select";
import { TbError404Off } from "react-icons/tb";
import { IoArrowBackCircleSharp } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import AddEksTokenModal from "../../../modal/AddEksToken.modal";
import { FaEdit, FaTrash } from "react-icons/fa";
import { MdOutlineContentCopy } from "react-icons/md";
import EditEksTokenModal from "../../../modal/EditEksToken.modal";
import TablePagination from "../../../Pagination/TablePagination";
import copy from 'copy-to-clipboard';

export default function AddEKSToken() {
    const navigate = useNavigate();

    const [isAllowed, setIsAllowed] = useState<boolean>(false);
    const [isUserLoading, setIsUserLoading] = useState<boolean>(true);
    const [showAddEksTokenModal, setShowAddEksTokenModal] = useState<boolean>(false);
    const [data, setData] = useState<any>([]);
    const [eksIndex, setEksIndex] = useState<number>(-1);
    const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
    const [selectedEksToken, setSelectedEksToken] = useState<any>(null);
    const [keyId, setKeyId] = useState<any>(null);
    const [keyIdData, setKeyIdData] = useState<any>(null);
    const [search, setSearch] = useState<any>(null);
    const [totalCount, setTotalCount] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [perPage, setPerPage] = useState<number>(10);
    const [loading, setLoading] = useState<boolean>(false);

    const getAllAwsKey = async () => {
        try {
            const res = await AdminService.getAllAwsKey();
            if (res.status === 200) {
                setKeyId(
                    Object.values(res.data).map((data: any) => ({
                        label: `${data.enviroment} (${data.region})`,
                        value: data._id,
                    }))
                );
            }
        } catch (err) {
            toast.error(err.response?.data || "Failed to get AWS key");
        }
    };

    const getAllEksToken = async () => {
        setLoading(true);
        try {
            const res = await AdminService.getAllEksToken(search, currentPage, perPage, keyIdData);
            if (res.status === 200) {
                setData(res.data.data);
                setTotalCount(res.data.count);
            }
        } catch (err: any) {
            toast.error(err.response?.data || "Failed to get EKS token");
        } finally {
            setLoading(false);
        }
    };

    const getUserData = async () => {
        try {
            const res = await AdminService.getUserData();
            if (res.status === 200 && res.data.admin) {
                setIsAllowed(true);
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
        } finally {
            setIsUserLoading(false);
        }
    };

    // const copyToClipboard = (text: string) => {
    //     navigator.clipboard
    //         .writeText(text)
    //         .then(() => toast.success("Copied to clipboard!"))
    //         .catch(() => toast.error("Failed to copy"));
    // };

    const copyToClipboard = (text: string) => {
        const success = copy(text);
        if (success) {
            toast.success("Copied to clipboard!");
        } else {
            toast.error("Failed to copy");
        }
    };

    const truncateText = (text: string, maxLength: number = 15) => {
        if (!text) return "--";
        return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
    };

    useEffect(() => {
        getAllEksToken();
    }, [search, perPage, currentPage, keyIdData]);

    useEffect(() => {
        getUserData();
        getAllAwsKey();
    }, []);

    const handleDelete = async () => {
        try {
            const res = await AdminService.deleteEKSToken(selectedEksToken._id);
            if (res.status === 200) {
                toast.success("EKS Token deleted successfully");
                setShowDeleteModal(false);
                setSelectedEksToken(null);
                getAllEksToken();
            }
        } catch (err: any) {
            toast.error(err.response?.data || "Failed to delete EKS token");
        }
    };

    const openDeleteModal = (eksToken: any) => {
        setSelectedEksToken(eksToken);
        setShowDeleteModal(true);
    };

    if (isUserLoading) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100">
                <Spinner animation="border" />
            </div>
        );
    }

    if (!isAllowed) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100">
                <div className="d-flex flex-column justify-content-center align-items-center">
                    <TbError404Off size={100} className="text-secondary" />
                    <p className="text-muted">You're not allowed. Please contact the admin.</p>
                </div>
            </div>
        );
    }

    return (
        <Container className="p-4 mt-5">
            <div>
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h4>
                        <IoArrowBackCircleSharp className="me-2 mb-1" onClick={() => navigate(-1)} />
                        EKS Token
                    </h4>
                </div>
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <Form.Control
                        type="text"
                        placeholder="Search..."
                        style={{ width: 400 }}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <div className="d-flex gap-3">
                        <Select options={keyId} placeholder="Select Environment" onChange={(e: any) => setKeyIdData(e?.value)} />
                        <Button variant="dark" onClick={() => setShowAddEksTokenModal(true)}>
                            Add EKS Token
                        </Button>
                    </div>
                </div>
                <Card className="mb-3">
                    <Card.Body>
                        <Table striped hover responsive>
                            <thead>
                                <tr>
                                    <th>Sr.No</th>
                                    <th>Cluster Name</th>
                                    <th>Environment</th>
                                    <th>Dashboard URL</th>
                                    <th>Monitoring URL</th>
                                    <th>Token</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <Spinner size="sm" animation="border" />
                                ) : data.length > 0 ? (
                                    data.map((item: any, index: number) => (
                                        <tr key={item._id}>
                                            <td>{index + 1}</td>
                                            <td>{item.clusterName || "--"}</td>
                                            <td>{item.awsKeyId?.enviroment || "--"}</td>
                                            <td>
                                                <div className="d-flex align-items-center">
                                                    {item.dashboardUrl ? (
                                                        <OverlayTrigger
                                                            placement="top"
                                                            overlay={<Tooltip>{item.dashboardUrl}</Tooltip>}
                                                        >
                                                            <span style={{ cursor: 'pointer' }}>
                                                                {truncateText(item.dashboardUrl)}
                                                            </span>
                                                        </OverlayTrigger>
                                                    ) : (
                                                        "--"
                                                    )}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="d-flex align-items-center">
                                                    {item.monitoringUrl ? (
                                                        <OverlayTrigger
                                                            placement="top"
                                                            overlay={<Tooltip>{item.monitoringUrl}</Tooltip>}
                                                        >
                                                            <span style={{ cursor: 'pointer' }}>
                                                                {truncateText(item.monitoringUrl)}
                                                            </span>
                                                        </OverlayTrigger>
                                                    ) : (
                                                        "--"
                                                    )}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="d-flex align-items-center">
                                                    {/* {item.token ? (
                                                        <OverlayTrigger
                                                            placement="top"
                                                            overlay={<Tooltip>{item.token}</Tooltip>}
                                                        >
                                                            <span style={{ cursor: 'pointer' }}>
                                                                {truncateText(item.token)}
                                                            </span>
                                                        </OverlayTrigger>
                                                    ) : (
                                                        "--"
                                                    )} */}
                                                    {item.token && (
                                                        <MdOutlineContentCopy
                                                            className="ms-2 text-success"
                                                            style={{ cursor: "pointer" }}
                                                            onClick={() => copyToClipboard(item.token)}
                                                        />
                                                    )}
                                                </div>
                                            </td>
                                            <td>
                                                <FaEdit className="me-2 text-primary" onClick={() => setEksIndex(index)} />
                                                <FaTrash className="ms-2 text-danger" onClick={() => openDeleteModal(item)} />
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7}>No data found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    </Card.Body>
                </Card>
                <TablePagination total={totalCount} currentPage={currentPage} perPage={perPage} handlePageChange={setCurrentPage} setPerPage={setPerPage} />
            </div>
            <AddEksTokenModal show={showAddEksTokenModal} handleClose={() => setShowAddEksTokenModal(false)} reload={getAllEksToken} />
            <EditEksTokenModal show={eksIndex !== -1} handleClose={() => setEksIndex(-1)} reload={getAllEksToken} eksData={data[eksIndex]} />


            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Deletion</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to delete the EKS token for cluster{" "}
                    <strong>{selectedEksToken?.clusterName}</strong>?
                    <br />
                    <small className="text-danger">This action cannot be undone.</small>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={handleDelete}>
                        Delete
                    </Button>
                </Modal.Footer>
            </Modal>

        </Container>
    );
}
