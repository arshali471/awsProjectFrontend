import React, { useEffect, useState } from 'react'
import { Button, Form, Offcanvas } from 'react-bootstrap'
import { AdminService } from '../services/admin.service'
import toast from 'react-hot-toast'
import Select from 'react-select'

interface IAddEksTokenModal {
    show: boolean;
    handleClose: () => void;
    reload: () => void;
}

export default function AddEksTokenModal({ show, handleClose, reload }: IAddEksTokenModal) {

    const [region, setRegion] = useState<any>();
    const [data, setData] = useState<any>();
    const [clusterName, setClusterName] = useState<any>();
    const [loading, setLoading] = useState<boolean>(false);

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
        }).catch(err => {
            toast.error(err.response?.data || 'Failed to get AWS key');
        })
    }


    const getClusterName = async () => {
        setLoading(true);
        await AdminService.getClusterName(data?.keyId).then((res) => {
            if (res.status === 200) {
                setClusterName(res.data?.map((data:any) => {
                    return {
                        label: data.name,
                        value: data.name
                    }
                }))
            }
        }).catch(err => {
            toast.error(err.response?.data || 'Failed to get cluster name');
        }).finally(() => {
            setLoading(false);
        })
    }



    const handleAWSKeySubmission = async () => {
        await AdminService.addEKSToken(data).then((res) => {
            if (res.status === 200) {
                toast.success('EKS Token added successfully');
                handleClose();
                reload();
            }
        }).catch(err => {
            toast.error(err.response?.data || 'Failed to add EKS token');
        })
    }


    useEffect(() => {
        if (data?.keyId) {
            getClusterName();
        }
    }, [data?.keyId])


    useEffect(() => {
        getAllAwsKey();
    }, [])

    return (
        <Offcanvas
            show={show}
            onHide={handleClose}
            placement="end"
            backdrop="static"
            animation={true}
        >
            <Offcanvas.Header closeButton>
                <Offcanvas.Title>Add EKS Token</Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
                <div style={{ height: "84vh" }}>
                    <Form.Group className="mb-3">
                        <Form.Label style={{ fontWeight: "500" }}>Environment</Form.Label>
                        <Select options={region} onChange={(e: any) => setData({ ...data, keyId: e.value })} />

                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label style={{ fontWeight: "500" }}>Cluster Name</Form.Label>
                        <Select options={clusterName} onChange={(e: any) => setData({ ...data, clusterName: e.value })} isDisabled={!data?.keyId} isLoading={loading} />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label style={{ fontWeight: "500" }}>Dashboard Url</Form.Label>
                        <Form.Control type="text" name="dashboardUrl" onChange={(e: any) => handleChangeValue(e)} />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label style={{ fontWeight: "500" }}>Monitoring Url</Form.Label>
                        <Form.Control type="text" name="monitoringUrl" onChange={(e: any) => handleChangeValue(e)} />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label style={{ fontWeight: "500" }}>Token</Form.Label>
                        <Form.Control as = "textarea" rows={5} type="text" name="token" onChange={(e: any) => handleChangeValue(e)} />
                    </Form.Group>
                </div>
                <Button className="w-100" variant="dark" onClick={handleAWSKeySubmission}>Add Token</Button>
            </Offcanvas.Body>
        </Offcanvas>
    )
}
