import { useState } from "react";
import { Button, Card, Container, Form } from "react-bootstrap";
import { AuthService } from "../../services/auth.service";
import Auth from "../../Auth/auth";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

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
                navigate('/platform/ec2');
                toast.success("Login Successful")
            }
        }).catch(err => {
            console.log(err)
            toast.error(err.response.data)
        })

    }


    return (
        <Container>
            <Card className="mt-5" style={{ width: "30rem", margin: "0 auto" }}>
                <h4 className="text-center mt-3">Login</h4>
                <Card.Body>
                    <Form.Group className="mb-3" controlId="formBasicEmail">
                        <Form.Label>Username</Form.Label>
                        <Form.Control type="email" placeholder="Username" name="username" onChange={(e: any) => handleChange(e)} />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formBasicPassword">
                        <Form.Label>Password</Form.Label>
                        <Form.Control type="password" placeholder="Password" name="password" onChange={(e: any) => handleChange(e)} />
                    </Form.Group>
                    <Button className=" w-50 d-flex justify-content-center align-items-center" style={{ margin: "0 auto" }} variant="primary" type="submit" onClick={handleLoginSubmmission}>
                        Login
                    </Button>
                </Card.Body>
            </Card>
        </Container>
    )
}