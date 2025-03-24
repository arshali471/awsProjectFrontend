import { useEffect, useState } from "react";
import { Button, Card, Container, Form } from "react-bootstrap";
import { AdminService } from "../../../services/admin.service";
import toast from "react-hot-toast";
import Select from "react-select"
import { TbError404Off } from "react-icons/tb";
import { IoArrowBackCircleSharp } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

export default function AddEKSToken() {

    const navigate = useNavigate();

    const [data, setData] = useState<any>();
    const [region, setRegion] = useState<any>();
    const [isAllowed, setIsAllowed] = useState<boolean>(false)

    const handleChangeValue = (e: any) => {
        setData({ ...data, [e.target.name]: e.target.value })
    }


    const getAllAwsKey = async () => {
        await AdminService.getAllAwsKey().then((res) => {
            if (res.status === 200) {
                setRegion(Object.values(res.data).map((data: any) => {
                    return {
                        label: `${data.enviroment} (${data.region})`,
                        value: data._id
                    }
                }))
            }
        })
    }

    const getUserData = async () => {
        try {
            const res = await AdminService.getUserData();
            if (res.status === 200) {

                if (res.data.admin) {
                    setIsAllowed(true)
                }
            } else {
                console.error(`Failed to fetch user data. Status: ${res.status}`);
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
        }
    };



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
        getAllAwsKey();
        getUserData();
    }, [])




    return (
        <>
            <Container className="p-4 mt-5">
                {isAllowed ?
                    <div>
                        <h4>
                            <IoArrowBackCircleSharp className="me-2 mb-1" onClick={() => navigate(-1)} />
                            Add EKS Token
                        </h4>
                        <Card>
                            <Card.Body>
                                <Form.Group className="mb-3">
                                    <Form.Label style={{ fontWeight: "500" }}>Environment</Form.Label>
                                    <Select options={region} onChange={(e: any) => setData({ ...data, region: e.value })} />

                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label style={{ fontWeight: "500" }}>Token</Form.Label>
                                    <Form.Control type="text" name="accessKeyId" onChange={(e: any) => handleChangeValue(e)} />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label style={{ fontWeight: "500" }}>Cluster Name</Form.Label>
                                    <Form.Control type="text" name="secretAccessKey" onChange={(e: any) => handleChangeValue(e)} />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label style={{ fontWeight: "500" }}>Dashboard Url</Form.Label>
                                    <Form.Control type="text" name="enviroment" onChange={(e: any) => handleChangeValue(e)} />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label style={{ fontWeight: "500" }}>Monitoring Url</Form.Label>
                                    <Form.Control type="text" name="enviroment" onChange={(e: any) => handleChangeValue(e)} />
                                </Form.Group>
                                <Button className="mt-3" onClick={handleAWSKeySubmission}>
                                    Add Key
                                </Button>
                            </Card.Body>
                        </Card>

                    </div> :
                    <div className="d-flex justify-content-center align-items-center">
                        <div className="d-flex flex-column justify-content-center align-items-center">
                            <TbError404Off size={100} className="text-secondary" />
                            <p className="text-muted">You're not allowed, Please contact to the admin.</p>
                        </div>
                    </div>
                }
            </Container>
        </>
    )
}