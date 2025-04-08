import React, { useEffect, useState } from 'react'
import { Button, Card, Container, Form, Modal, OverlayTrigger, Table, Spinner } from 'react-bootstrap'
import { FaEdit, FaTrash } from 'react-icons/fa';
import { IoArrowBackCircleSharp } from 'react-icons/io5'
import { MdOutlineContentCopy } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import TablePagination from '../../../Pagination/TablePagination';
import { AdminService } from '../../../services/admin.service';
import toast from 'react-hot-toast';

export default function SshKey() {

  const navigate = useNavigate()

  const [search, setSearch] = useState<any>(null);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(10);
  const [loading, setLoading] = useState<boolean>(false);
  const [addSshKeyModal, setShowAddSshKeyModal] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [selectedSshKey, setSelectedSshKey] = useState<any>(null);
  const [data, setData] = useState<any>([]);

  const [files, setFiles] = useState<any>();

  const getAllSshKey = async () => {
    setLoading(true);
    try {
      const res = await AdminService.getSshKey(search, currentPage, perPage);
      if (res.status === 200) {
        setData(res.data.data);
        setTotalCount(res.data.total);
      }
    } catch (error) {
      toast.error("Failed to fetch SSH keys");
    } finally {
      setLoading(false);
    }
  }

  const handleUploadSshKey = async () => {
    const formData = new FormData();
    formData.append("upload", files[0])
    await AdminService.uploadSshKey(formData).then((res) => {
      if (res.status === 201) {
        toast.success("SSH key uploaded.")
        setShowAddSshKeyModal(false)
        getAllSshKey();
      }
    }).catch(err => {
      toast.error(err.response.data)
    })
  }

  const handleDeleteSshKey = async () => {
    try {
      const res = await AdminService.deleteSshKey(selectedSshKey._id);
      if (res.status === 200) {
        toast.success("SSH key deleted successfully");
        setShowDeleteModal(false);
        getAllSshKey();
      }
    } catch (error) {
      toast.error("Failed to delete SSH key");
    }
  }

  const openDeleteModal = (sshKey: any) => {
    setSelectedSshKey(sshKey);
    setShowDeleteModal(true);
  }

  useEffect(() => {
    getAllSshKey();
  }, [currentPage, perPage, search])

  return (
    <Container className="p-4 mt-5">
      <div>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4>
            <IoArrowBackCircleSharp className="me-2 mb-1" onClick={() => navigate(-1)} />
            SSH Key
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
            <Button variant="dark" onClick={() => setShowAddSshKeyModal(true)}>
              Add SSH Key
            </Button>
          </div>
        </div>
        <Card className="mb-3">
          <Card.Body>
            <Table striped hover responsive>
              <thead>
                <tr>
                  <th>Sr.No</th>
                  <th>Ssh Key Name</th>
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
                      <td>{item.sshKeyName || "--"}</td>
                      <td>
                        {/* <FaEdit className="me-2 text-primary" /> */}
                        <FaTrash 
                          className="ms-2 text-danger" 
                          style={{ cursor: 'pointer' }}
                          onClick={() => openDeleteModal(item)}
                        />
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

      <Modal show={addSshKeyModal} onHide={() => setShowAddSshKeyModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Upload SSH Key</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Select File</Form.Label>
            <Form.Control type="file" onChange={(e: any) => setFiles(e.target.files)} />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddSshKeyModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleUploadSshKey}>
            Upload
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete the SSH key{" "}
          <strong>{selectedSshKey?.sshKeyName}</strong>?
          <br />
          <small className="text-danger">This action cannot be undone.</small>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteSshKey}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  )
}
