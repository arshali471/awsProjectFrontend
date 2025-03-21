import { useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import { AdminService } from "../services/admin.service";
import toast from "react-hot-toast";

interface IChangePaswordModal {
    show: any,
    handleClose: () => void
}

export default function ChangePaswordModal(props: IChangePaswordModal) {

    const [password, setPassword] = useState<any>();

    const handleChangePassword = async() => {
        await AdminService.changeUserPasswordByAdmin(props.show, {newPassword:password}).then((res) => {
            if(res.status === 200) {
                toast.success("Password Changed")
                props.handleClose();
            }
        }).catch(err => {
            toast.error(err.response.data)
        })
    }

    return (
        <Modal
            show={props.show ? true : false}
            onHide={props.handleClose} s
            centered
            animation={true}
            backdrop="static"
        >
            <Modal.Header closeButton>
                <Modal.Title>Change Password</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form.Group>
                    <Form.Label>Enter Password</Form.Label>
                    <Form.Control type = "text" onChange={(e:any) => setPassword(e.target.value)} />
                </Form.Group>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" className="rounded-xl" onClick={props.handleClose}>
                    Close
                </Button>
                <Button variant="danger" onClick={handleChangePassword}>
                    Save
                </Button>
            </Modal.Footer>
        </Modal>
    )
}