import { useEffect, useState } from "react";
import { Button, Form, Offcanvas } from "react-bootstrap";
import { AdminService } from "../services/admin.service";
import toast from "react-hot-toast";

interface IAddUserModal {
    show: any,
    handleClose: any,
    awsData: any,
}

export default function EditAWSKey({ show, handleClose, awsData }: IAddUserModal) {

    const [data, setData] = useState<any>({});

    const handleEditSubmisssion = async (awsId: any) => {
        await AdminService.updateAwsKey(awsId, data).then((res) => {
            if (res.status === 200) {
                handleClose();
                toast.success("AWS Key Updated")
            }
        }).catch(err => {
            toast.error(err.response.data)
        })
    }

    useEffect(() => {
        setData(awsData);
    }, [show])


    return (
        <Offcanvas show={show} onHide={handleClose} backdrop="static" placement="end">
            <Offcanvas.Header closeButton>
                <Offcanvas.Title>Edit AWS Key</Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
                <div style={{ height: "85vh" }}>
                    <Form.Group className="mb-3">
                        <Form.Label style={{ fontWeight: "500" }}>Region</Form.Label>
                        <Form.Control
                            type="text"
                            name="region"
                            defaultValue={data?.region}
                            onChange={(e: any) => setData({ ...data, region: e.target.value })}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label style={{ fontWeight: "500" }}>Access Key Id</Form.Label>
                        <Form.Control
                            type="text"
                            name="accessKeyId"
                            defaultValue={data?.accessKeyId}
                            onChange={(e: any) => setData({ ...data, accessKeyId: e.target.value })}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label style={{ fontWeight: "500" }}>Secret Access Key</Form.Label>
                        <Form.Control
                            type="text"
                            name="secretAccessKey"
                            defaultValue={data?.secretAccessKey}
                            onChange={(e: any) => setData({ ...data, secretAccessKey: e.target.value })}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label style={{ fontWeight: "500" }}>Enviroment</Form.Label>
                        <Form.Control
                            type="text"
                            name="enviroment"
                            defaultValue={data?.enviroment}
                            onChange={(e: any) => setData({ ...data, enviroment: e.target.value })}
                        />
                    </Form.Group>
                </div>
                <Button className="w-100" onClick={() => handleEditSubmisssion(data?._id)}>
                    Edit
                </Button>
            </Offcanvas.Body>
        </Offcanvas>
    )
}