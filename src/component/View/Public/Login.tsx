import { useState } from "react";
import { Button, Card, Container, Form } from "react-bootstrap";
import { AuthService } from "../../services/auth.service";
import Auth from "../../Auth/auth";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import iffLogo from "../../../assets/IFF.png";

export default function Login() {
    const navigate = useNavigate();

    const [data, setData] = useState<any>();

    const handleChange = (e: any) => {
        setData({ ...data, [e.target.name]: e.target.value })
    }

    const handleLoginSubmmission = async () => {

        await AuthService.login(data).then(res => {
            if (res.status === 200) {
                Auth.authenticate();
                sessionStorage.setItem("authKey", res.data.token);
                sessionStorage.setItem("username", res.data.username)
                navigate('/dashboard');
                toast.success("Login Successful")
            }
        }).catch(err => {
            console.log(err)
            toast.error(err.response.data)
        })

    }


    return (
        <div className="d-flex justify-content-center align-items-center flex-column" style={{ height: "100vh" }}>
            <Card className="mt-5" style={{ width: "30rem", margin: "0 auto" }}>
                <h4 className="text-center mt-3 d-flex justify-content-center align-items-center gap-2">
                    <img src={iffLogo} width="35" height="20" alt="IFF Logo" />
                    Login
                </h4>

                <Card.Body>
                    <Form.Group className="mb-3" controlId="formBasicEmail">
                        <Form.Label className="fw-bold">Username</Form.Label>
                        <Form.Control type="email" placeholder="Username" name="username" onChange={(e: any) => handleChange(e)} />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formBasicPassword">
                        <Form.Label className="fw-bold">Password</Form.Label>
                        <Form.Control type="password" placeholder="Password" name="password" onChange={(e: any) => handleChange(e)} />
                    </Form.Group>
                    <Button className=" w-50 d-flex justify-content-center align-items-center" style={{ margin: "0 auto", backgroundColor: "#007ec6" }} variant="primary" type="submit" onClick={handleLoginSubmmission}>
                        Login
                    </Button>
                </Card.Body>
            </Card>
        </div>
    )
}