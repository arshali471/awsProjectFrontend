import { useEffect, useState } from "react";
import { Button, Card, Container, Form } from "react-bootstrap";
import { AdminService } from "../../../services/admin.service";
import toast from "react-hot-toast";
import Select from "react-select"

export default function AddAWSKey() {

    const [data, setData] = useState<any>();
    const [region, setRegion] = useState<any>();

    const handleChangeValue = (e: any) => {
        setData({ ...data, [e.target.name]: e.target.value })
    }


    const getAwsRegion = async () => {
        await AdminService.getAwsRegion().then((res) => {
            if (res.status === 200) {
                setRegion(Object.values(res.data).map((data: any) => {
                    return {
                        label: data,
                        value: data
                    }
                }))
            }
        })
    }


    const handleAWSKeySubmission = async () => {
        await AdminService.createAWSKey(data).then((res) => {
            if (res.status === 200) {
                toast.success("Key Created")
            }
        }).catch(err => {
            toast.error(err.response.data)
        })
    }

    useEffect(() => {
        getAwsRegion();
    }, [])




    return (
        <>
            <Container>
                <h4>Add AWS Key</h4>
                <Card>
                    <Card.Body>
                        <Form.Group className="mb-3">
                            <Form.Label style={{ fontWeight: "500" }}>Region</Form.Label>
                            <Select options={region} onChange={(e: any) => setData({ ...data, region: e.value })} />

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