import React, { useEffect, useState } from 'react'
import { Button, Form, Offcanvas } from 'react-bootstrap'
import { AdminService } from '../services/admin.service'
import toast from 'react-hot-toast'
import Select from 'react-select'

interface IEditEksTokenModal {
    show: boolean;
    handleClose: () => void;
    reload: () => void;
    eksData: any
}

export default function EditEksTokenModal({ show, handleClose, reload, eksData }: IEditEksTokenModal) {

    const [region, setRegion] = useState<any>();
    const [data, setData] = useState<any>();
    const [clusterName, setClusterName] = useState<any>();
    
    const [environment, setEnvironment] = useState<any>();
    const [loading, setLoading] = useState<boolean>(false);

    console.log(data, clusterName, "edit")


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
        setLoading(true)
        await AdminService.getClusterName(environment).then((res) => {
            if (res.status === 200) {
                setClusterName(res.data?.map((data: any) => {
                    return {
                        label: data.name,
                        value: data.name
                    }
                }))
            }
        }).catch(err => {
            toast.error(err.response?.data || 'Failed to get cluster name');
        }).finally(() => {
            setLoading(false)
        })
    }



    const handleUpdateEksToken = async () => {
        const payload = {
            clusterName: data?.clusterName,
            dashboardUrl: data?.dashboardUrl,
            monitoringUrl: data?.monitoringUrl,
            token: data?.token,
            keyId: environment
        }
        await AdminService.updateEKSToken(data?._id, payload).then((res) => {
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
        if (eksData) {
            setData(eksData)
            setEnvironment(eksData?.awsKeyId?._id)
        }
    }, [eksData])


    useEffect(() => {
        if (environment) {
            getClusterName();
        }
    }, [environment])


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
                <Offcanvas.Title>Update EKS Token</Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
                <div style={{ height: "84vh" }}>
                    <Form.Group className="mb-3">
                        <Form.Label style={{ fontWeight: "500" }}>Environment</Form.Label>
                        <Select
                            options={region}
                            onChange={(e: any) => setEnvironment(e.value)}
                            value={region ? region.find((item: any) => item.value === data?.awsKeyId?._id) : null}
                        />

                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label style={{ fontWeight: "500" }}>Cluster Name</Form.Label>
                        <Select
                            options={clusterName}
                            onChange={(e: any) => setData({ ...data, clusterName: e.value })}
                            value={clusterName ? clusterName.find((item: any) => item.value === data?.clusterName) : null}
                            isDisabled={!environment}
                            isLoading={loading}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label style={{ fontWeight: "500" }}>Dashboard Url</Form.Label>
                        <Form.Control type="text" name="dashboardUrl" defaultValue={data?.dashboardUrl} onChange={(e: any) => handleChangeValue(e)} />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label style={{ fontWeight: "500" }}>Monitoring Url</Form.Label>
                        <Form.Control type="text" name="monitoringUrl" defaultValue={data?.monitoringUrl} onChange={(e: any) => handleChangeValue(e)} />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label style={{ fontWeight: "500" }}>Token</Form.Label>
                        <Form.Control as="textarea" rows={5} type="text" name="token" defaultValue={data?.token} onChange={(e: any) => handleChangeValue(e)} />
                    </Form.Group>
                </div>
                <Button className="w-100" variant="dark" onClick={handleUpdateEksToken}>Update Token</Button>
            </Offcanvas.Body>
        </Offcanvas>
    )
}
