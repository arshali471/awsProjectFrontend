import React, { useState } from "react";
import { Container, Form, Button, Card } from "react-bootstrap";
import { IoArrowBackCircleSharp } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { AdminService } from "../../../services/admin.service";
import toast from "react-hot-toast";

export default function ChangePassword() {

    const navigate = useNavigate();

    const [formData, setFormData] = useState<any>({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const [errors, setErrors] = useState<any>({});

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const validate = () => {
        let newErrors: any = {};
        if (!formData.currentPassword) newErrors.currentPassword = "Required";
        if (!formData.newPassword) newErrors.newPassword = "Required";
        if (formData.newPassword !== formData.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        const payload = {
            currentPassword: formData?.currentPassword,
            newPassword: formData?.confirmPassword
        }
        if (validate()) {
            await AdminService.changeUserPassword(payload).then((res) => {
                if (res.status === 200) {
                    toast.success("Password Changed")
                }
            }).catch(err => {
                toast.error(err.response.data)
            })
        }
    };

    return (
        <Container className="p-4 mt-5">
            <h4>
                <IoArrowBackCircleSharp className="me-2 mb-1" onClick={() => navigate(-1)} />
                Change Password
            </h4>
            <div>
                <Card>
                    <Card.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>Current Password</Form.Label>
                            <Form.Control
                                type="password"
                                name="currentPassword"
                                value={formData.currentPassword}
                                onChange={handleChange}
                                isInvalid={!!errors.currentPassword}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.currentPassword}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>New Password</Form.Label>
                            <Form.Control
                                type="password"
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleChange}
                                isInvalid={!!errors.newPassword}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.newPassword}
                            </Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Confirm New Password</Form.Label>
                            <Form.Control
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                isInvalid={!!errors.confirmPassword}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.confirmPassword}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Button variant="primary" type="submit" onClick={handleSubmit}>
                            Change Password
                        </Button>
                    </Card.Body>
                </Card>



            </div>
        </Container>
    );
}
