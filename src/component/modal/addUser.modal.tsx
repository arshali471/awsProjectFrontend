import { useState } from "react";
import { Button, Form, Offcanvas } from "react-bootstrap";
import { AdminService } from "../services/admin.service";
import toast from "react-hot-toast";

interface IAddUserModal {
    show: any,
    handleClose: any
}

export default function AddUserModal({ show, handleClose }: IAddUserModal) {

    const [data, setData] = useState<any>();

    const handleChangeValue = (e: any) => {
        setData({ ...data, [e.target.name]: e.target.value })
    }

    const handleToggleValue = (e: any) => {
        setData({ ...data, [e.target.name]: e.target.checked })
    }

    const handleUserSubmission = async () => {
        await AdminService.createUser(data).then((res) => {
            if (res.status === 200) {
                handleClose();
                toast.success("User Created")
            }
        }).catch(err => {
            toast.error(err.response.data)
        })
    }

    console.log(data)

    return (
        <Offcanvas show={show} onHide={handleClose} backdrop="static" placement="end">
            <Offcanvas.Header closeButton>
                <Offcanvas.Title>Add User</Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
                <div style={{ height: "85vh" }}>
                    <Form.Group className="mb-3">
                        <Form.Label style={{ fontWeight: "500" }}>Username</Form.Label>
                        <Form.Control type="text" name="username" onChange={(e: any) => handleChangeValue(e)} />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label style={{ fontWeight: "500" }}>Password</Form.Label>
                        <Form.Control type="password" name="password" onChange={(e: any) => handleChangeValue(e)} />
                    </Form.Group>
                    <Form.Group className="d-flex mb-3">
                        <Form.Switch name="addAWSKey" onChange={(e: any) => handleToggleValue(e)} />
                        <Form.Label className="ms-3" style={{ fontWeight: "500" }}>Add AWS Key</Form.Label>
                    </Form.Group>
                    <Form.Group className="d-flex mb-3">
                        <Form.Switch name="addUser" onChange={(e: any) => handleToggleValue(e)} />
                        <Form.Label className="ms-3" style={{ fontWeight: "500" }}>Add Users</Form.Label>
                    </Form.Group>
                </div>
                <Button className="w-100" onClick={handleUserSubmission}>
                    Add User
                </Button>
            </Offcanvas.Body>
        </Offcanvas>
    )
}