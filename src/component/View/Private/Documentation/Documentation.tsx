import { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { LoadingContext } from "../../../context/context";
import { AdminService } from "../../../services/admin.service";
import { FaSearch, FaFileAlt, FaFilter, FaPlus, FaTh, FaList, FaFilePdf, FaFileImage, FaFileWord, FaFileExcel, FaShareAlt, FaInfoCircle, FaLock, FaArrowLeft } from "react-icons/fa";
import { Box, Typography, IconButton, CircularProgress, Button, Modal, Tab, Tabs, TextField, MenuItem, Select, FormControl, InputLabel, SelectChangeEvent, Chip, Divider, Checkbox, FormControlLabel } from "@mui/material";
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import DescriptionIcon from "@mui/icons-material/Description";
import RefreshIcon from "@mui/icons-material/Refresh";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import LinkIcon from "@mui/icons-material/Link";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import ViewListIcon from "@mui/icons-material/ViewList";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import InfoIcon from "@mui/icons-material/Info";
import ShareIcon from "@mui/icons-material/Share";
import DownloadIcon from "@mui/icons-material/Download";
import moment from 'moment';
import toast from 'react-hot-toast';
import "../SharedPage.css";
import "./Documentation.css";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

interface DocumentData {
    _id: string;
    title: string;
    description: string;
    category: string;
    documentType: 'file' | 'link';
    fileUrl?: string;
    fileName?: string;
    fileSize?: number;
    fileType?: string;
    externalUrl?: string;
    uploadedBy?: string;
    uploadedAt: string;
    updatedAt?: string;
    sharedWith?: string[];
}

interface UploadFormData {
    title: string;
    description: string;
    category: string;
    file: File | null;
    externalUrl: string;
    visibility: 'public' | 'private';
    selectedUsers: string[];
}

type ViewMode = 'grid' | 'list' | 'detail';

export default function Documentation() {
    const { loading, setLoading }: any = useContext(LoadingContext);
    const { id } = useParams();
    const navigate = useNavigate();

    const [documents, setDocuments] = useState<DocumentData[]>([]);
    const [filteredData, setFilteredData] = useState<DocumentData[]>([]);
    const [searchText, setSearchText] = useState<string>('');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [refreshing, setRefreshing] = useState(false);
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [isAdmin, setIsAdmin] = useState<boolean>(false);

    // Modal states
    const [uploadModalOpen, setUploadModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);
    const [shareModalOpen, setShareModalOpen] = useState(false);
    const [accessControlModalOpen, setAccessControlModalOpen] = useState(false);

    // Form states
    const [uploadTabValue, setUploadTabValue] = useState(0);
    const [uploadFormData, setUploadFormData] = useState<UploadFormData>({
        title: '',
        description: '',
        category: 'General',
        file: null,
        externalUrl: '',
        visibility: 'public',
        selectedUsers: []
    });
    const [selectedDocument, setSelectedDocument] = useState<DocumentData | null>(null);
    const [editFormData, setEditFormData] = useState<Partial<DocumentData>>({});
    const [shareEmail, setShareEmail] = useState<string>('');
    const [sharePermission, setSharePermission] = useState<string>('view');
    const [allUsers, setAllUsers] = useState<any[]>([]);
    const [accessControlData, setAccessControlData] = useState<{
        visibility: 'public' | 'private';
        selectedUsers: string[];
    }>({
        visibility: 'public',
        selectedUsers: []
    });

    const categories = ['General', 'Technical', 'User Guide', 'API Documentation', 'Tutorial', 'Policy', 'Other'];

    useEffect(() => {
        fetchDocuments();
        fetchUsers();
        const adminStatus = sessionStorage.getItem('admin') === 'true';
        setIsAdmin(adminStatus);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        filterDocuments();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchText, categoryFilter, documents]);

    // Handle URL parameter for direct document access
    useEffect(() => {
        if (id && documents.length > 0) {
            const document = documents.find(doc => doc._id === id);
            if (document) {
                setSelectedDocument(document);
                setDetailsModalOpen(true);
                // Clear the ID from URL without navigation
                window.history.replaceState({}, '', '/documentation');
            } else {
                toast.error("Document not found");
                navigate('/documentation');
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, documents]);

    const fetchDocuments = async (showRefreshing = false) => {
        if (showRefreshing) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }
        try {
            const res = await AdminService.getAllDocuments();
            if (res.status === 200 && res.data.success) {
                const docs = res.data.data || [];
                setDocuments(docs);
                setFilteredData(docs);
            }
        } catch (error) {
            console.error("Error fetching documents", error);
            toast.error("Failed to fetch documents");
        }
        if (showRefreshing) {
            setRefreshing(false);
        } else {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await AdminService.getAllUsers();
            if (res.status === 200 && res.data) {
                setAllUsers(res.data);
            }
        } catch (error) {
            console.error("Error fetching users", error);
        }
    };

    const filterDocuments = () => {
        let filtered = documents;

        if (categoryFilter !== 'all') {
            filtered = filtered.filter(doc => doc.category === categoryFilter);
        }

        if (searchText) {
            filtered = filtered.filter(doc => {
                const searchStr = `${doc.title} ${doc.description} ${doc.category} ${doc.fileName || ''} ${doc.externalUrl || ''}`.toLowerCase();
                return searchStr.includes(searchText.toLowerCase());
            });
        }

        setFilteredData(filtered);
    };

    const handleRefresh = () => {
        fetchDocuments(true);
    };

    const formatFileSize = (bytes?: number): string => {
        if (!bytes || bytes === 0) return '-';
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
    };

    const handleCardClick = (doc: DocumentData) => {
        if (doc.documentType === 'link') {
            window.open(doc.externalUrl, '_blank', 'noopener,noreferrer');
            toast.success("Opening link in new tab");
        } else {
            handleDownload(doc);
        }
    };

    const handleDownload = async (doc: DocumentData) => {
        try {
            if (doc.documentType === 'link' && doc.externalUrl) {
                window.open(doc.externalUrl, '_blank', 'noopener,noreferrer');
                toast.success("Opening link in new tab");
            } else if (doc.documentType === 'file' && doc.fileUrl) {
                const link = document.createElement('a');
                link.href = doc.fileUrl;
                link.download = doc.fileName || 'document';
                link.target = '_blank';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                toast.success("Download started");
            }
        } catch (error) {
            console.error("Error downloading document", error);
            toast.error("Failed to download document");
        }
    };

    const handleUploadModalOpen = () => {
        setUploadModalOpen(true);
        setUploadFormData({
            title: '',
            description: '',
            category: 'General',
            file: null,
            externalUrl: '',
            visibility: 'public',
            selectedUsers: []
        });
        setUploadTabValue(0);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const fileName = file.name.toLowerCase();
            const allowedExtensions = ['.pdf', '.doc', '.docx'];
            const isAllowed = allowedExtensions.some(ext => fileName.endsWith(ext));

            if (!isAllowed) {
                toast.error("Only PDF and DOC/DOCX files are allowed");
                e.target.value = ''; // Clear the file input
                return;
            }

            setUploadFormData({ ...uploadFormData, file: file });
        }
    };

    const handleUploadSubmit = async () => {
        try {
            setLoading(true);

            // Prepare sharedWith data
            const sharedWith = uploadFormData.visibility === 'private'
                ? uploadFormData.selectedUsers.map(email => ({
                    email,
                    permission: 'view',
                    sharedAt: new Date()
                }))
                : [];

            if (uploadTabValue === 0) {
                if (!uploadFormData.file) {
                    toast.error("Please select a file");
                    setLoading(false);
                    return;
                }

                const formData = new FormData();
                formData.append('title', uploadFormData.title);
                formData.append('description', uploadFormData.description);
                formData.append('category', uploadFormData.category);
                formData.append('file', uploadFormData.file);
                formData.append('documentType', 'file');
                formData.append('visibility', uploadFormData.visibility);
                formData.append('sharedWith', JSON.stringify(sharedWith));

                const res = await AdminService.uploadDocument(formData);
                if (res.status === 200 || res.status === 201) {
                    toast.success("Document uploaded successfully");
                    setUploadModalOpen(false);
                    setUploadFormData({
                        title: '',
                        description: '',
                        category: 'General',
                        file: null,
                        externalUrl: '',
                        visibility: 'public',
                        selectedUsers: []
                    });
                    fetchDocuments();
                }
            } else {
                if (!uploadFormData.externalUrl) {
                    toast.error("Please enter a URL");
                    setLoading(false);
                    return;
                }

                // Validate SharePoint URL
                if (!uploadFormData.externalUrl.startsWith('https://iff.sharepoint.com')) {
                    toast.error("Only SharePoint URLs (https://iff.sharepoint.com) are allowed");
                    setLoading(false);
                    return;
                }

                const payload = {
                    title: uploadFormData.title,
                    description: uploadFormData.description,
                    category: uploadFormData.category,
                    referenceUrl: uploadFormData.externalUrl,
                    documentType: 'link',
                    visibility: uploadFormData.visibility,
                    sharedWith: JSON.stringify(sharedWith)
                };

                const res = await AdminService.addDocumentLink(payload);
                if (res.status === 200 || res.status === 201) {
                    toast.success("Link added successfully");
                    setUploadModalOpen(false);
                    setUploadFormData({
                        title: '',
                        description: '',
                        category: 'General',
                        file: null,
                        externalUrl: '',
                        visibility: 'public',
                        selectedUsers: []
                    });
                    fetchDocuments();
                }
            }
        } catch (error) {
            console.error("Error uploading document", error);
            toast.error("Failed to upload document");
        }
        setLoading(false);
    };

    const handleEdit = (doc: DocumentData, e?: React.MouseEvent) => {
        e?.stopPropagation();
        setSelectedDocument(doc);
        setEditFormData({
            title: doc.title,
            description: doc.description,
            category: doc.category,
            externalUrl: doc.externalUrl
        });
        setEditModalOpen(true);
    };

    const handleEditSubmit = async () => {
        if (!selectedDocument) return;

        try {
            setLoading(true);
            const res = await AdminService.updateDocument(selectedDocument._id, editFormData);
            if (res.status === 200) {
                toast.success("Document updated successfully");
                setEditModalOpen(false);
                fetchDocuments();
            }
        } catch (error) {
            console.error("Error updating document", error);
            toast.error("Failed to update document");
        }
        setLoading(false);
    };

    const handleDeleteConfirm = (doc: DocumentData, e?: React.MouseEvent) => {
        e?.stopPropagation();
        setSelectedDocument(doc);
        setDeleteConfirmOpen(true);
    };

    const handleDelete = async () => {
        if (!selectedDocument) return;

        try {
            setLoading(true);
            const res = await AdminService.deleteDocument(selectedDocument._id);
            if (res.status === 200) {
                toast.success("Document deleted successfully");
                setDeleteConfirmOpen(false);
                fetchDocuments();
            }
        } catch (error) {
            console.error("Error deleting document", error);
            toast.error("Failed to delete document");
        }
        setLoading(false);
    };

    const handleShowDetails = (doc: DocumentData, e?: React.MouseEvent) => {
        e?.stopPropagation();
        setSelectedDocument(doc);
        setDetailsModalOpen(true);
    };

    const handleShare = (doc: DocumentData, e?: React.MouseEvent) => {
        e?.stopPropagation();
        setSelectedDocument(doc);
        setShareModalOpen(true);
        setShareEmail('');
        setSharePermission('view');
    };

    const handleShareSubmit = async () => {
        if (!selectedDocument || !shareEmail) {
            toast.error("Please select a user");
            return;
        }

        try {
            setLoading(true);
            const res = await AdminService.shareDocument(selectedDocument._id, {
                email: shareEmail,
                permission: sharePermission
            });
            if (res.status === 200) {
                toast.success("Document shared successfully");
                setShareEmail('');
                fetchDocuments();
            }
        } catch (error) {
            console.error("Error sharing document", error);
            toast.error("Failed to share document");
        }
        setLoading(false);
    };

    const handleRemoveShare = async (email: string) => {
        if (!selectedDocument) return;

        try {
            setLoading(true);
            const res = await AdminService.removeShareAccess(selectedDocument._id, email);
            if (res.status === 200) {
                toast.success("Share access removed successfully");
                fetchDocuments();
            }
        } catch (error) {
            console.error("Error removing share access", error);
            toast.error("Failed to remove share access");
        }
        setLoading(false);
    };

    const handleAccessControl = (doc: DocumentData, e?: React.MouseEvent) => {
        e?.stopPropagation();
        setSelectedDocument(doc);

        // Get current shared user emails
        const currentSharedEmails = (doc.sharedWith || []).map((share: any) => share.email);

        setAccessControlData({
            visibility: (doc as any).visibility || 'public',
            selectedUsers: currentSharedEmails
        });
        setAccessControlModalOpen(true);
    };

    const handleAccessControlSubmit = async () => {
        if (!selectedDocument) return;

        try {
            setLoading(true);

            // Prepare sharedWith data
            const sharedWith = accessControlData.visibility === 'private'
                ? accessControlData.selectedUsers.map(email => ({
                    email,
                    permission: 'view',
                    sharedAt: new Date()
                }))
                : [];

            const payload = {
                visibility: accessControlData.visibility,
                sharedWith: JSON.stringify(sharedWith)
            };

            const res = await AdminService.updateDocument(selectedDocument._id, payload);
            if (res.status === 200) {
                toast.success("Access settings updated successfully");
                setAccessControlModalOpen(false);
                fetchDocuments();
            }
        } catch (error) {
            console.error("Error updating access control", error);
            toast.error("Failed to update access settings");
        }
        setLoading(false);
    };

    const getFileIconComponent = (doc: DocumentData) => {
        if (doc.documentType === 'link') {
            return <LinkIcon style={{ color: '#0073bb', fontSize: '3.5rem' }} />;
        }

        const fileType = doc.fileType?.toLowerCase() || '';
        if (fileType.includes('pdf')) return <FaFilePdf style={{ color: '#dc3545', fontSize: '3.5rem' }} />;
        if (fileType.includes('image')) return <FaFileImage style={{ color: '#28a745', fontSize: '3.5rem' }} />;
        if (fileType.includes('excel') || fileType.includes('spreadsheet')) return <FaFileExcel style={{ color: '#10b981', fontSize: '3.5rem' }} />;
        if (fileType.includes('word') || fileType.includes('document')) return <FaFileWord style={{ color: '#0073bb', fontSize: '3.5rem' }} />;
        return <FaFileAlt style={{ color: '#6c757d', fontSize: '3.5rem' }} />;
    };

    const getFileIconSmall = (doc: DocumentData) => {
        if (doc.documentType === 'link') {
            return <LinkIcon style={{ color: '#0073bb', fontSize: '1.5rem' }} />;
        }

        const fileType = doc.fileType?.toLowerCase() || '';
        if (fileType.includes('pdf')) return <FaFilePdf style={{ color: '#dc3545', fontSize: '1.5rem' }} />;
        if (fileType.includes('image')) return <FaFileImage style={{ color: '#28a745', fontSize: '1.5rem' }} />;
        if (fileType.includes('excel') || fileType.includes('spreadsheet')) return <FaFileExcel style={{ color: '#10b981', fontSize: '1.5rem' }} />;
        if (fileType.includes('word') || fileType.includes('document')) return <FaFileWord style={{ color: '#0073bb', fontSize: '1.5rem' }} />;
        return <FaFileAlt style={{ color: '#6c757d', fontSize: '1.5rem' }} />;
    };

    // Grid View
    const renderGridView = () => {
        if (filteredData.length === 0) {
            return (
                <div className="empty-documents">
                    <DescriptionIcon style={{ fontSize: '4rem', color: '#adb5bd', marginBottom: '1rem' }} />
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#495057', marginBottom: '0.5rem' }}>No documents found</h3>
                    <p style={{ fontSize: '1rem', color: '#6c757d', marginBottom: '2rem' }}>Upload your first document or add a link to get started</p>
                </div>
            );
        }

        return (
            <div className="documents-grid">
                {filteredData.map((doc) => (
                    <div
                        key={doc._id}
                        className="document-card"
                        onClick={() => handleCardClick(doc)}
                    >
                        <div className={`card-preview ${doc.documentType === 'link' ? 'link-preview' : ''}`}>
                            {doc.documentType === 'link' && (
                                <div className="link-badge">
                                    <OpenInNewIcon style={{ fontSize: '0.875rem' }} />
                                    Link
                                </div>
                            )}
                            <div className="card-preview-icon">
                                {getFileIconComponent(doc)}
                            </div>

                            <div className="card-actions-overlay">
                                <button
                                    className="card-action-button"
                                    onClick={(e) => handleShowDetails(doc, e)}
                                    title="Details"
                                >
                                    <InfoIcon style={{ fontSize: '1rem' }} />
                                </button>
                                <button
                                    className="card-action-button"
                                    onClick={(e) => handleShare(doc, e)}
                                    title="Share"
                                >
                                    <ShareIcon style={{ fontSize: '1rem' }} />
                                </button>
                                {isAdmin && (
                                    <button
                                        className="card-action-button"
                                        onClick={(e) => handleAccessControl(doc, e)}
                                        title="Access Control"
                                    >
                                        <FaLock style={{ fontSize: '1rem' }} />
                                    </button>
                                )}
                                <button
                                    className="card-action-button"
                                    onClick={(e) => handleEdit(doc, e)}
                                    title="Edit"
                                >
                                    <EditIcon style={{ fontSize: '1rem' }} />
                                </button>
                                <button
                                    className="card-action-button delete-button"
                                    onClick={(e) => handleDeleteConfirm(doc, e)}
                                    title="Delete"
                                >
                                    <DeleteIcon style={{ fontSize: '1rem' }} />
                                </button>
                            </div>
                        </div>

                        <div className="card-content">
                            <div className="card-title" title={doc.title}>
                                {doc.title}
                            </div>
                            <div className="card-description" title={doc.description}>
                                {doc.description || "No description"}
                            </div>
                            <div className="card-meta">
                                <span className="card-category">{doc.category}</span>
                                <span>{formatFileSize(doc.fileSize)}</span>
                            </div>
                            <div className="card-footer">
                                <span style={{ fontSize: '0.7rem', color: '#adb5bd' }}>
                                    {moment(doc.uploadedAt).format("MMM DD, YYYY")}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    // List View (Table)
    const renderListView = () => {
        const columns: GridColDef[] = [
            {
                field: 'icon',
                headerName: '',
                width: 60,
                sortable: false,
                renderCell: (params) => (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {getFileIconSmall(params.row)}
                    </div>
                ),
            },
            {
                field: 'title',
                headerName: 'Name',
                flex: 1,
                minWidth: 200,
                renderCell: (params) => (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>{params.value}</span>
                        {params.row.documentType === 'link' && (
                            <Chip label="Link" size="small" color="primary" style={{ height: '20px', fontSize: '0.7rem' }} />
                        )}
                    </div>
                ),
            },
            {
                field: 'category',
                headerName: 'Category',
                width: 150,
            },
            {
                field: 'fileSize',
                headerName: 'Size',
                width: 120,
                renderCell: (params) => formatFileSize(params.value),
            },
            {
                field: 'uploadedBy',
                headerName: 'Owner',
                width: 150,
            },
            {
                field: 'uploadedAt',
                headerName: 'Modified',
                width: 150,
                renderCell: (params) => moment(params.value).format("MMM DD, YYYY"),
            },
            {
                field: 'actions',
                headerName: 'Actions',
                width: 200,
                sortable: false,
                renderCell: (params) => (
                    <Box display="flex" gap={0.5}>
                        <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleShowDetails(params.row, e); }} title="Details">
                            <InfoIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleShare(params.row, e); }} title="Share">
                            <ShareIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleDownload(params.row); }} title="Download">
                            <DownloadIcon fontSize="small" />
                        </IconButton>
                        {isAdmin && (
                            <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleAccessControl(params.row, e); }} title="Access Control">
                                <FaLock fontSize="small" />
                            </IconButton>
                        )}
                        <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleEdit(params.row, e); }} title="Edit">
                            <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); handleDeleteConfirm(params.row, e); }} title="Delete">
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </Box>
                ),
            },
        ];

        return (
            <div style={{ height: 600, width: '100%' }}>
                <DataGrid
                    rows={filteredData}
                    columns={columns}
                    getRowId={(row) => row._id}
                    initialState={{
                        pagination: {
                            paginationModel: { page: 0, pageSize: 10 },
                        },
                    }}
                    pageSizeOptions={[5, 10, 25, 50]}
                    onRowClick={(params) => handleCardClick(params.row)}
                    sx={{
                        '& .MuiDataGrid-row': {
                            cursor: 'pointer',
                        },
                        '& .MuiDataGrid-row:hover': {
                            backgroundColor: 'rgba(0, 115, 187, 0.05)',
                        },
                    }}
                />
            </div>
        );
    };

    // Detail View
    const renderDetailView = () => {
        if (filteredData.length === 0) {
            return (
                <div className="empty-documents">
                    <DescriptionIcon style={{ fontSize: '4rem', color: '#adb5bd', marginBottom: '1rem' }} />
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#495057', marginBottom: '0.5rem' }}>No documents found</h3>
                    <p style={{ fontSize: '1rem', color: '#6c757d', marginBottom: '2rem' }}>Upload your first document or add a link to get started</p>
                </div>
            );
        }

        return (
            <div className="documents-detail-list">
                {filteredData.map((doc) => (
                    <div key={doc._id} className="detail-card">
                        <div className="detail-card-left" onClick={() => handleCardClick(doc)}>
                            <div className="detail-icon">
                                {getFileIconSmall(doc)}
                            </div>
                            <div className="detail-info">
                                <div className="detail-title">
                                    {doc.title}
                                    {doc.documentType === 'link' && (
                                        <Chip label="Link" size="small" color="primary" style={{ marginLeft: '8px', height: '20px', fontSize: '0.7rem' }} />
                                    )}
                                </div>
                                <div className="detail-meta">
                                    <span>{doc.category}</span>
                                    <span>•</span>
                                    <span>{formatFileSize(doc.fileSize)}</span>
                                    <span>•</span>
                                    <span>{moment(doc.uploadedAt).format("MMM DD, YYYY")}</span>
                                    <span>•</span>
                                    <span>Owner: {doc.uploadedBy}</span>
                                </div>
                                <div className="detail-description">{doc.description || "No description"}</div>
                            </div>
                        </div>
                        <div className="detail-card-actions">
                            <IconButton size="small" onClick={(e) => handleShowDetails(doc, e)} title="Details">
                                <InfoIcon />
                            </IconButton>
                            <IconButton size="small" onClick={(e) => handleShare(doc, e)} title="Share">
                                <ShareIcon />
                            </IconButton>
                            <IconButton size="small" onClick={() => handleDownload(doc)} title="Download">
                                <DownloadIcon />
                            </IconButton>
                            {isAdmin && (
                                <IconButton size="small" onClick={(e) => handleAccessControl(doc, e)} title="Access Control">
                                    <FaLock />
                                </IconButton>
                            )}
                            <IconButton size="small" onClick={(e) => handleEdit(doc, e)} title="Edit">
                                <EditIcon />
                            </IconButton>
                            <IconButton size="small" color="error" onClick={(e) => handleDeleteConfirm(doc, e)} title="Delete">
                                <DeleteIcon />
                            </IconButton>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="page-wrapper">
            <Box sx={{ mb: 3 }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box display="flex" alignItems="center" gap={2}>
                        <IconButton
                        onClick={() => navigate(-1)}
                        sx={{
                            background: 'linear-gradient(135deg, #0073bb 0%, #1a8cd8 100%)',
                            color: 'white',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #0073bb 0%, #1a8cd8 100%)',
                                transform: 'translateY(-2px)',
                            },
                            transition: 'all 0.3s ease',
                        }}
                    >
                        <ArrowBackIcon />
                    </IconButton>
                        <Box sx={{ width: 56, height: 56, background: 'linear-gradient(135deg, #0073bb 0%, #1a8cd8 100%)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 4px 16px rgba(0, 115, 187, 0.3)' }}>
                            <DescriptionIcon sx={{ fontSize: 32 }} />
                        </Box>
                        <Box>
                            <Typography variant="h4" sx={{ fontWeight: 700, color: '#232f3e' }}>Documentation</Typography>
                            <Typography variant="body2" sx={{ color: '#6c757d' }}>{filteredData.length} documents</Typography>
                        </Box>
                    </Box>

                    <IconButton onClick={handleRefresh} disabled={refreshing} sx={{ background: 'linear-gradient(135deg, #0073bb 0%, #1a8cd8 100%)', color: 'white', width: 48, height: 48 }}>
                        {refreshing ? <CircularProgress size={24} sx={{ color: 'white' }} /> : <RefreshIcon />}
                    </IconButton>
                </Box>
            </Box>

            <div className="stats-container">
                <div className="stat-card">
                    <div className="stat-card-header">
                        <span className="stat-card-title">Total Documents</span>
                        <div className="stat-card-icon"><FaFileAlt /></div>
                    </div>
                    <h2 className="stat-card-value">{documents.length}</h2>
                </div>
                <div className="stat-card">
                    <div className="stat-card-header">
                        <span className="stat-card-title">Categories</span>
                        <div className="stat-card-icon"><FaFilter /></div>
                    </div>
                    <h2 className="stat-card-value">{categories.length}</h2>
                </div>
                <div className="stat-card">
                    <div className="stat-card-header">
                        <span className="stat-card-title">Filtered Results</span>
                        <div className="stat-card-icon"><FaSearch /></div>
                    </div>
                    <h2 className="stat-card-value">{filteredData.length}</h2>
                </div>
            </div>

            <div className="action-bar">
                <div className="action-bar-left">
                    <div className="search-box">
                        <FaSearch className="search-icon" />
                        <input type="text" className="search-input" placeholder="Search documents..." value={searchText} onChange={(e) => setSearchText(e.target.value)} />
                    </div>
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel>Category</InputLabel>
                        <Select value={categoryFilter} label="Category" onChange={(e: SelectChangeEvent) => setCategoryFilter(e.target.value)} sx={{ borderRadius: '10px' }}>
                            <MenuItem value="all">All Categories</MenuItem>
                            {categories.map(cat => (<MenuItem key={cat} value={cat}>{cat}</MenuItem>))}
                        </Select>
                    </FormControl>
                </div>
                <div className="action-bar-right">
                    <div className="view-toggle">
                        <IconButton
                            onClick={() => setViewMode('grid')}
                            className={viewMode === 'grid' ? 'active' : ''}
                            title="Grid View"
                            sx={{
                                backgroundColor: viewMode === 'grid' ? '#0073bb' : 'transparent',
                                color: viewMode === 'grid' ? 'white' : '#6c757d',
                                '&:hover': { backgroundColor: viewMode === 'grid' ? '#005a8f' : 'rgba(0, 115, 187, 0.1)' }
                            }}
                        >
                            <ViewModuleIcon />
                        </IconButton>
                        <IconButton
                            onClick={() => setViewMode('list')}
                            className={viewMode === 'list' ? 'active' : ''}
                            title="List View"
                            sx={{
                                backgroundColor: viewMode === 'list' ? '#0073bb' : 'transparent',
                                color: viewMode === 'list' ? 'white' : '#6c757d',
                                '&:hover': { backgroundColor: viewMode === 'list' ? '#005a8f' : 'rgba(0, 115, 187, 0.1)' }
                            }}
                        >
                            <ViewListIcon />
                        </IconButton>
                        <IconButton
                            onClick={() => setViewMode('detail')}
                            className={viewMode === 'detail' ? 'active' : ''}
                            title="Detail View"
                            sx={{
                                backgroundColor: viewMode === 'detail' ? '#0073bb' : 'transparent',
                                color: viewMode === 'detail' ? 'white' : '#6c757d',
                                '&:hover': { backgroundColor: viewMode === 'detail' ? '#005a8f' : 'rgba(0, 115, 187, 0.1)' }
                            }}
                        >
                            <FaInfoCircle />
                        </IconButton>
                    </div>
                    {isAdmin && (
                        <Button variant="contained" startIcon={<FaPlus />} onClick={handleUploadModalOpen} sx={{ background: 'linear-gradient(135deg, #0073bb 0%, #1a8cd8 100%)', color: 'white', padding: '8px 20px', borderRadius: '10px', fontWeight: 500, textTransform: 'none' }}>
                            Add Document
                        </Button>
                    )}
                </div>
            </div>

            {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
                    <CircularProgress />
                </div>
            ) : (
                <>
                    {viewMode === 'grid' && renderGridView()}
                    {viewMode === 'list' && renderListView()}
                    {viewMode === 'detail' && renderDetailView()}
                </>
            )}

            {/* Upload Modal */}
            <Modal open={uploadModalOpen} onClose={() => setUploadModalOpen(false)}>
                <Box className="modal-container">
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                        <Typography variant="h5" fontWeight={700}>Add Documentation</Typography>
                        <IconButton onClick={() => setUploadModalOpen(false)}><CloseIcon /></IconButton>
                    </Box>
                    <Tabs value={uploadTabValue} onChange={(e, v) => setUploadTabValue(v)} sx={{ mb: 3 }}>
                        <Tab icon={<CloudUploadIcon />} label="Upload File" iconPosition="start" />
                        <Tab icon={<LinkIcon />} label="Add Link" iconPosition="start" />
                    </Tabs>
                    <Box className="modal-form">
                        <TextField fullWidth label="Title" value={uploadFormData.title} onChange={(e) => setUploadFormData({ ...uploadFormData, title: e.target.value })} margin="normal" required />
                        <TextField fullWidth label="Description" value={uploadFormData.description} onChange={(e) => setUploadFormData({ ...uploadFormData, description: e.target.value })} margin="normal" multiline rows={3} />
                        <FormControl fullWidth margin="normal">
                            <InputLabel>Category</InputLabel>
                            <Select value={uploadFormData.category} label="Category" onChange={(e: SelectChangeEvent) => setUploadFormData({ ...uploadFormData, category: e.target.value })}>
                                {categories.map(cat => (<MenuItem key={cat} value={cat}>{cat}</MenuItem>))}
                            </Select>
                        </FormControl>
                        {uploadTabValue === 0 ? (
                            <Box mt={2}>
                                <Button variant="outlined" component="label" fullWidth startIcon={<CloudUploadIcon />} sx={{ py: 2 }}>
                                    {uploadFormData.file ? uploadFormData.file.name : 'Choose File (PDF or DOC/DOCX only)'}
                                    <input type="file" hidden onChange={handleFileChange} accept=".pdf,.doc,.docx" />
                                </Button>
                                {uploadFormData.file ? (
                                    <Typography variant="caption" display="block" mt={1} color="text.secondary">
                                        Size: {formatFileSize(uploadFormData.file.size)}
                                    </Typography>
                                ) : (
                                    <Typography variant="caption" display="block" mt={1} color="text.secondary">
                                        Allowed file types: PDF, DOC, DOCX
                                    </Typography>
                                )}
                            </Box>
                        ) : (
                            <TextField
                                fullWidth
                                label="SharePoint URL"
                                value={uploadFormData.externalUrl}
                                onChange={(e) => setUploadFormData({ ...uploadFormData, externalUrl: e.target.value })}
                                margin="normal"
                                placeholder="https://iff.sharepoint.com/..."
                                required
                                helperText="Only SharePoint URLs (https://iff.sharepoint.com) are allowed"
                            />
                        )}

                        {/* Visibility & Access Control */}
                        <Divider sx={{ my: 3 }}>
                            <Chip label="Access Control" size="small" />
                        </Divider>

                        <FormControl fullWidth margin="normal">
                            <InputLabel>Who can view this?</InputLabel>
                            <Select
                                value={uploadFormData.visibility}
                                label="Who can view this?"
                                onChange={(e: SelectChangeEvent) => setUploadFormData({ ...uploadFormData, visibility: e.target.value as 'public' | 'private', selectedUsers: [] })}
                            >
                                <MenuItem value="public">Public (All users can view)</MenuItem>
                                <MenuItem value="private">Private (Only selected users)</MenuItem>
                            </Select>
                        </FormControl>

                        {uploadFormData.visibility === 'private' && (
                            <FormControl fullWidth margin="normal">
                                <InputLabel>Select Users</InputLabel>
                                <Select
                                    multiple
                                    value={uploadFormData.selectedUsers}
                                    label="Select Users"
                                    onChange={(e: SelectChangeEvent<string[]>) => {
                                        const value = e.target.value;
                                        setUploadFormData({
                                            ...uploadFormData,
                                            selectedUsers: typeof value === 'string' ? value.split(',') : value
                                        });
                                    }}
                                    renderValue={(selected) => (
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                            {(selected as string[]).map((email) => {
                                                const user = allUsers.find(u => u.email === email);
                                                return <Chip key={email} label={user?.username || email} size="small" />;
                                            })}
                                        </Box>
                                    )}
                                    MenuProps={{
                                        PaperProps: {
                                            style: {
                                                maxHeight: 300,
                                            },
                                        },
                                    }}
                                >
                                    {allUsers.map((user: any) => (
                                        <MenuItem key={user._id} value={user.email || user.username}>
                                            <Checkbox
                                                checked={uploadFormData.selectedUsers.includes(user.email || user.username)}
                                            />
                                            <span>{user.username} {user.email ? `(${user.email})` : ''}</span>
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        )}

                        <Box display="flex" gap={2} mt={3}>
                            <Button fullWidth variant="contained" onClick={handleUploadSubmit} disabled={loading} sx={{ background: 'linear-gradient(135deg, #0073bb 0%, #1a8cd8 100%)', py: 1.5 }}>
                                {loading ? <CircularProgress size={24} /> : (uploadTabValue === 0 ? 'Upload' : 'Add Link')}
                            </Button>
                            <Button fullWidth variant="outlined" onClick={() => setUploadModalOpen(false)} sx={{ py: 1.5 }}>Cancel</Button>
                        </Box>
                    </Box>
                </Box>
            </Modal>

            {/* Edit Modal */}
            <Modal open={editModalOpen} onClose={() => setEditModalOpen(false)}>
                <Box className="modal-container">
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                        <Typography variant="h5" fontWeight={700}>Edit Document</Typography>
                        <IconButton onClick={() => setEditModalOpen(false)}><CloseIcon /></IconButton>
                    </Box>
                    <Box className="modal-form">
                        <TextField fullWidth label="Title" value={editFormData.title || ''} onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })} margin="normal" />
                        <TextField fullWidth label="Description" value={editFormData.description || ''} onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })} margin="normal" multiline rows={3} />
                        <FormControl fullWidth margin="normal">
                            <InputLabel>Category</InputLabel>
                            <Select value={editFormData.category || 'General'} label="Category" onChange={(e: SelectChangeEvent) => setEditFormData({ ...editFormData, category: e.target.value })}>
                                {categories.map(cat => (<MenuItem key={cat} value={cat}>{cat}</MenuItem>))}
                            </Select>
                        </FormControl>
                        {selectedDocument?.documentType === 'link' && (
                            <TextField fullWidth label="External URL" value={editFormData.externalUrl || ''} onChange={(e) => setEditFormData({ ...editFormData, externalUrl: e.target.value })} margin="normal" />
                        )}
                        <Box display="flex" gap={2} mt={3}>
                            <Button fullWidth variant="contained" onClick={handleEditSubmit} disabled={loading} sx={{ background: 'linear-gradient(135deg, #0073bb 0%, #1a8cd8 100%)', py: 1.5 }}>
                                {loading ? <CircularProgress size={24} /> : 'Update'}
                            </Button>
                            <Button fullWidth variant="outlined" onClick={() => setEditModalOpen(false)} sx={{ py: 1.5 }}>Cancel</Button>
                        </Box>
                    </Box>
                </Box>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
                <Box className="modal-container modal-small">
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                        <Typography variant="h5" fontWeight={700} color="error">Delete Document</Typography>
                        <IconButton onClick={() => setDeleteConfirmOpen(false)}><CloseIcon /></IconButton>
                    </Box>
                    <Typography variant="body1" mb={3}>Are you sure you want to delete "{selectedDocument?.title}"? This action cannot be undone.</Typography>
                    <Box display="flex" gap={2}>
                        <Button fullWidth variant="contained" color="error" onClick={handleDelete} disabled={loading} sx={{ py: 1.5 }}>
                            {loading ? <CircularProgress size={24} /> : 'Delete'}
                        </Button>
                        <Button fullWidth variant="outlined" onClick={() => setDeleteConfirmOpen(false)} sx={{ py: 1.5 }}>Cancel</Button>
                    </Box>
                </Box>
            </Modal>

            {/* Details Modal */}
            <Modal open={detailsModalOpen} onClose={() => setDetailsModalOpen(false)}>
                <Box className="modal-container">
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                        <Typography variant="h5" fontWeight={700}>Document Details</Typography>
                        <IconButton onClick={() => setDetailsModalOpen(false)}><CloseIcon /></IconButton>
                    </Box>
                    {selectedDocument && (
                        <Box>
                            <Box display="flex" alignItems="center" gap={2} mb={3}>
                                <Box sx={{ fontSize: '3rem', display: 'flex', alignItems: 'center' }}>
                                    {getFileIconComponent(selectedDocument)}
                                </Box>
                                <Box flex={1}>
                                    <Typography variant="h6" fontWeight={600}>{selectedDocument.title}</Typography>
                                    <Typography variant="body2" color="text.secondary">{selectedDocument.documentType === 'link' ? 'External Link' : selectedDocument.fileName}</Typography>
                                </Box>
                            </Box>
                            <Divider sx={{ my: 2 }} />
                            <Box className="detail-info-grid">
                                <Box className="detail-info-row">
                                    <Typography variant="body2" fontWeight={600} color="text.secondary">Type:</Typography>
                                    <Typography variant="body2">{selectedDocument.documentType === 'link' ? 'Link' : 'File'}</Typography>
                                </Box>
                                <Box className="detail-info-row">
                                    <Typography variant="body2" fontWeight={600} color="text.secondary">Size:</Typography>
                                    <Typography variant="body2">{formatFileSize(selectedDocument.fileSize)}</Typography>
                                </Box>
                                <Box className="detail-info-row">
                                    <Typography variant="body2" fontWeight={600} color="text.secondary">Category:</Typography>
                                    <Typography variant="body2">{selectedDocument.category}</Typography>
                                </Box>
                                <Box className="detail-info-row">
                                    <Typography variant="body2" fontWeight={600} color="text.secondary">Owner:</Typography>
                                    <Typography variant="body2">{selectedDocument.uploadedBy}</Typography>
                                </Box>
                                <Box className="detail-info-row">
                                    <Typography variant="body2" fontWeight={600} color="text.secondary">Created:</Typography>
                                    <Typography variant="body2">{moment(selectedDocument.uploadedAt).format("MMMM DD, YYYY [at] h:mm A")}</Typography>
                                </Box>
                                <Box className="detail-info-row">
                                    <Typography variant="body2" fontWeight={600} color="text.secondary">Modified:</Typography>
                                    <Typography variant="body2">{moment(selectedDocument.updatedAt || selectedDocument.uploadedAt).format("MMMM DD, YYYY [at] h:mm A")}</Typography>
                                </Box>
                                {selectedDocument.documentType === 'file' && selectedDocument.fileType && (
                                    <Box className="detail-info-row">
                                        <Typography variant="body2" fontWeight={600} color="text.secondary">File Type:</Typography>
                                        <Typography variant="body2">{selectedDocument.fileType}</Typography>
                                    </Box>
                                )}
                                {selectedDocument.documentType === 'link' && selectedDocument.externalUrl && (
                                    <Box className="detail-info-row">
                                        <Typography variant="body2" fontWeight={600} color="text.secondary">URL:</Typography>
                                        <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>{selectedDocument.externalUrl}</Typography>
                                    </Box>
                                )}
                            </Box>
                            <Divider sx={{ my: 2 }} />
                            <Box>
                                <Typography variant="body2" fontWeight={600} color="text.secondary" mb={1}>Description:</Typography>
                                <Typography variant="body2">{selectedDocument.description || "No description provided"}</Typography>
                            </Box>
                            {selectedDocument.sharedWith && selectedDocument.sharedWith.length > 0 && (
                                <>
                                    <Divider sx={{ my: 2 }} />
                                    <Box>
                                        <Typography variant="body2" fontWeight={600} color="text.secondary" mb={1}>Shared with:</Typography>
                                        {selectedDocument.sharedWith.map((share: any, idx: number) => (
                                            <Chip key={idx} label={`${share.email} (${share.permission})`} size="small" sx={{ mr: 1, mb: 1 }} />
                                        ))}
                                    </Box>
                                </>
                            )}
                            <Box display="flex" gap={2} mt={3}>
                                <Button fullWidth variant="contained" onClick={() => handleDownload(selectedDocument)} startIcon={<DownloadIcon />} sx={{ background: 'linear-gradient(135deg, #0073bb 0%, #1a8cd8 100%)' }}>
                                    {selectedDocument.documentType === 'link' ? 'Open Link' : 'Download'}
                                </Button>
                                <Button fullWidth variant="outlined" onClick={() => setDetailsModalOpen(false)}>Close</Button>
                            </Box>
                        </Box>
                    )}
                </Box>
            </Modal>

            {/* Share Modal */}
            <Modal open={shareModalOpen} onClose={() => setShareModalOpen(false)}>
                <Box className="modal-container">
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                        <Typography variant="h5" fontWeight={700}>Share Document</Typography>
                        <IconButton onClick={() => setShareModalOpen(false)}><CloseIcon /></IconButton>
                    </Box>
                    <Box>
                        <Typography variant="body2" mb={2}>Share "{selectedDocument?.title}" with other users</Typography>

                        {/* Copy Link Section */}
                        <Box sx={{
                            background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                            borderRadius: '12px',
                            padding: '1.5rem',
                            mb: 3,
                            border: '1px solid #e0e0e0'
                        }}>
                            <Typography variant="body2" fontWeight={600} mb={2}>
                                <LinkIcon style={{ fontSize: '1.2rem', verticalAlign: 'middle', marginRight: '8px' }} />
                                Get Link
                            </Typography>
                            <Box display="flex" gap={1}>
                                <TextField
                                    fullWidth
                                    value={selectedDocument?.documentType === 'link'
                                        ? selectedDocument.externalUrl
                                        : `${window.location.origin}/documentation/${selectedDocument?._id}`}
                                    InputProps={{
                                        readOnly: true,
                                        style: {
                                            fontSize: '0.875rem',
                                            background: 'white'
                                        }
                                    }}
                                    size="small"
                                />
                                <Button
                                    variant="contained"
                                    onClick={() => {
                                        const link = selectedDocument?.documentType === 'link'
                                            ? selectedDocument.externalUrl
                                            : `${window.location.origin}/documentation/${selectedDocument?._id}`;
                                        navigator.clipboard.writeText(link || '');
                                        toast.success("Link copied to clipboard!");
                                    }}
                                    sx={{
                                        background: 'linear-gradient(135deg, #0073bb 0%, #1a8cd8 100%)',
                                        minWidth: '120px',
                                        whiteSpace: 'nowrap'
                                    }}
                                >
                                    Copy Link
                                </Button>
                            </Box>
                            <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                                Anyone with this link can view this document
                            </Typography>
                        </Box>

                        <Divider sx={{ my: 3 }}>
                            <Chip label="OR" size="small" />
                        </Divider>

                        {/* Share with Specific Users Section */}
                        <Box>
                            <Typography variant="body2" fontWeight={600} mb={2}>
                                <ShareIcon style={{ fontSize: '1.2rem', verticalAlign: 'middle', marginRight: '8px' }} />
                                Share with Specific Users
                            </Typography>
                            <FormControl fullWidth margin="normal" size="small">
                                <InputLabel>Select User</InputLabel>
                                <Select
                                    value={shareEmail}
                                    label="Select User"
                                    onChange={(e: SelectChangeEvent) => setShareEmail(e.target.value)}
                                >
                                    <MenuItem value="">
                                        <em>Select a user</em>
                                    </MenuItem>
                                    {allUsers
                                        .filter(user => !selectedDocument?.sharedWith?.some((share: any) => share.email === user.email))
                                        .map((user: any) => (
                                            <MenuItem key={user._id} value={user.email}>
                                                {user.username} ({user.email})
                                            </MenuItem>
                                        ))
                                    }
                                </Select>
                            </FormControl>
                            <FormControl fullWidth margin="normal" size="small">
                                <InputLabel>Permission</InputLabel>
                                <Select value={sharePermission} label="Permission" onChange={(e: SelectChangeEvent) => setSharePermission(e.target.value)}>
                                    <MenuItem value="view">Can View</MenuItem>
                                    <MenuItem value="edit">Can Edit</MenuItem>
                                </Select>
                            </FormControl>
                            {selectedDocument?.sharedWith && selectedDocument.sharedWith.length > 0 && (
                                <Box mt={2}>
                                    <Typography variant="body2" fontWeight={600} mb={1}>Currently shared with:</Typography>
                                    <Box display="flex" flexWrap="wrap" gap={1}>
                                        {selectedDocument.sharedWith.map((share: any, idx: number) => (
                                            <Chip
                                                key={idx}
                                                label={`${share.email} (${share.permission})`}
                                                size="small"
                                                onDelete={() => handleRemoveShare(share.email)}
                                                deleteIcon={<CloseIcon />}
                                                sx={{
                                                    background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                                                    border: '1px solid #dee2e6'
                                                }}
                                            />
                                        ))}
                                    </Box>
                                </Box>
                            )}
                            <Box display="flex" gap={2} mt={3}>
                                <Button fullWidth variant="contained" onClick={handleShareSubmit} disabled={loading} startIcon={<ShareIcon />} sx={{ background: 'linear-gradient(135deg, #0073bb 0%, #1a8cd8 100%)', py: 1.5 }}>
                                    {loading ? <CircularProgress size={24} /> : 'Share'}
                                </Button>
                                <Button fullWidth variant="outlined" onClick={() => setShareModalOpen(false)} sx={{ py: 1.5 }}>Cancel</Button>
                            </Box>
                        </Box>
                    </Box>
                </Box>
            </Modal>

            {/* Access Control Modal */}
            <Modal open={accessControlModalOpen} onClose={() => setAccessControlModalOpen(false)}>
                <Box className="modal-container">
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                        <Typography variant="h5" fontWeight={700}>
                            <FaLock style={{ fontSize: '1.5rem', verticalAlign: 'middle', marginRight: '8px' }} />
                            Access Control
                        </Typography>
                        <IconButton onClick={() => setAccessControlModalOpen(false)}><CloseIcon /></IconButton>
                    </Box>
                    <Box>
                        <Typography variant="body2" mb={3} color="text.secondary">
                            Manage who can view "{selectedDocument?.title}"
                        </Typography>

                        <FormControl fullWidth margin="normal">
                            <InputLabel>Who can view this?</InputLabel>
                            <Select
                                value={accessControlData.visibility}
                                label="Who can view this?"
                                onChange={(e: SelectChangeEvent) => setAccessControlData({
                                    ...accessControlData,
                                    visibility: e.target.value as 'public' | 'private',
                                    selectedUsers: e.target.value === 'public' ? [] : accessControlData.selectedUsers
                                })}
                            >
                                <MenuItem value="public">
                                    <Box display="flex" alignItems="center" gap={1}>
                                        <FaFileAlt />
                                        <Box>
                                            <Typography variant="body2" fontWeight={600}>Public</Typography>
                                            <Typography variant="caption" color="text.secondary">All users can view</Typography>
                                        </Box>
                                    </Box>
                                </MenuItem>
                                <MenuItem value="private">
                                    <Box display="flex" alignItems="center" gap={1}>
                                        <FaLock />
                                        <Box>
                                            <Typography variant="body2" fontWeight={600}>Private</Typography>
                                            <Typography variant="caption" color="text.secondary">Only selected users</Typography>
                                        </Box>
                                    </Box>
                                </MenuItem>
                            </Select>
                        </FormControl>

                        {accessControlData.visibility === 'private' && (
                            <FormControl fullWidth margin="normal">
                                <InputLabel>Select Users</InputLabel>
                                <Select
                                    multiple
                                    value={accessControlData.selectedUsers}
                                    label="Select Users"
                                    onChange={(e: SelectChangeEvent<string[]>) => {
                                        const value = e.target.value;
                                        setAccessControlData({
                                            ...accessControlData,
                                            selectedUsers: typeof value === 'string' ? value.split(',') : value
                                        });
                                    }}
                                    renderValue={(selected) => (
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                            {(selected as string[]).map((email) => {
                                                const user = allUsers.find(u => u.email === email);
                                                return <Chip key={email} label={user?.username || email} size="small" />;
                                            })}
                                        </Box>
                                    )}
                                    MenuProps={{
                                        PaperProps: {
                                            style: {
                                                maxHeight: 300,
                                            },
                                        },
                                    }}
                                >
                                    {allUsers.map((user: any) => (
                                        <MenuItem key={user._id} value={user.email || user.username}>
                                            <Checkbox
                                                checked={accessControlData.selectedUsers.includes(user.email || user.username)}
                                            />
                                            <span>{user.username} {user.email ? `(${user.email})` : ''}</span>
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        )}

                        {accessControlData.visibility === 'private' && accessControlData.selectedUsers.length === 0 && (
                            <Typography variant="caption" color="warning.main" display="block" mt={2}>
                                ⚠️ Warning: No users selected. This document will only be visible to you.
                            </Typography>
                        )}

                        <Box display="flex" gap={2} mt={4}>
                            <Button
                                fullWidth
                                variant="contained"
                                onClick={handleAccessControlSubmit}
                                disabled={loading}
                                startIcon={<FaLock />}
                                sx={{ background: 'linear-gradient(135deg, #0073bb 0%, #1a8cd8 100%)', py: 1.5 }}
                            >
                                {loading ? <CircularProgress size={24} /> : 'Update Access'}
                            </Button>
                            <Button fullWidth variant="outlined" onClick={() => setAccessControlModalOpen(false)} sx={{ py: 1.5 }}>
                                Cancel
                            </Button>
                        </Box>
                    </Box>
                </Box>
            </Modal>
        </div>
    );
}
