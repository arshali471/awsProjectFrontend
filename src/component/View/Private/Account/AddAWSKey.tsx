import { useState } from "react";
import { Button, Card, Container, Form } from "react-bootstrap";
import { AdminService } from "../../../services/admin.service";
import toast from "react-hot-toast";

export default function AddAWSKey() {

    const [data, setData] = useState<any>();

    const handleChangeValue = (e: any) => {
        setData({ ...data, [e.target.name]: e.target.value })
    }


    const handleAWSKeySubmission = async () => {
        await AdminService.createAWSKey(data).then((res) => {
            if (res.status === 200) {
                toast.success("User Created")
            }
        }).catch(err => {
            toast.error(err.response.data)
        })
    }




    return (
        <>
            <Container>
                <h4>Add AWS Key</h4>
                <Card>
                    <Card.Body>
                        <Form.Group className="mb-3">
                            <Form.Label style={{ fontWeight: "500" }}>Region</Form.Label>
                            <Form.Control type="text" name="region" onChange={(e: any) => handleChangeValue(e)} />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label style={{ fontWeight: "500" }}>Access Key Id</Form.Label>
                            <Form.Control type="text" name="accessKeyId" onChange={(e: any) => handleChangeValue(e)} />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label style={{ fontWeight: "500" }}>Secret Access Key</Form.Label>
                            <Form.Control type="text" name="secretAccessKey" onChange={(e: any) => handleChangeValue(e)} />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label style={{ fontWeight: "500" }}>Enviroment</Form.Label>
                            <Form.Control type="text" name="enviroment" onChange={(e: any) => handleChangeValue(e)} />
                        </Form.Group>
                        <Button className="mt-3" onClick={handleAWSKeySubmission}>
                            Add Key
                        </Button>
                    </Card.Body>
                </Card>

            </Container>
        </>
    )
}