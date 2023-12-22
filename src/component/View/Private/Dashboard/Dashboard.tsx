import { useContext, useEffect, useState } from "react"
import { AdminService } from "../../../services/admin.service"
import { SelectedRegionContext } from "../../../context/context"
import { Button, Card, Col, Form, InputGroup, Row } from "react-bootstrap";
import InstanceTable from "../../../Table/Instance.table";
import { CSVLink } from "react-csv";
import moment from "moment";

export default function Dashboard() {

    const { selectedRegion }: any = useContext(SelectedRegionContext)

    const [instanceData, setInstanceData] = useState<any>([]);
    const [filterData, setFilterData] = useState<any>([]);
    const [searchText, setSearchText] = useState<any>();


    const getAllInstance = async () => {
        await AdminService.getAllInstance(selectedRegion.value).then((res) => {
            if (res.status === 200) {
                setInstanceData(res.data)
            }
        })
    }


    const handleSearchData = () => {
        if (searchText !== '') {
            const filterData = instanceData && instanceData.filter((instance: any) => {
                const instanceValues = Object.values(instance)
                    .map((value: any) => {
                        if (typeof value === 'object') {
                            return Object.values(value).join('');
                        }
                        return String(value);
                    })
                    .join('');

                return instanceValues && instanceValues?.toLowerCase()?.includes(searchText.toLowerCase());
            });
            setFilterData(filterData || []);
        } else {
            setFilterData(instanceData || []);
        }
    };


    const InstanceCSVDownload = filterData && filterData?.length > 0
        ? filterData?.map((data: any) => {
            return ({
                InstanceId: data?.InstanceId,
                "ImageId": data?.ImageId,
                "InstanceType": data?.InstanceType,
                "KeyName": data?.KeyName,
                "LaunchTime": moment(data?.LaunchTime).format("DD MMM YY"),
                "PrivateIpAddress": data?.PrivateIpAddress,
                "State": data?.State?.Name,
                "SubnetId": data?.SubnetId,
                "VpcId": data?.VpcId,
                "PlatformDetails": data?.PlatformDetails,
                "AvailabilityZone": data?.Placement?.AvailabilityZone
            })
        }) : instanceData?.map((data: any) => {
            return ({
                InstanceId: data?.InstanceId,
                "ImageId": data?.ImageId,
                "InstanceType": data?.InstanceType,
                "KeyName": data?.KeyName,
                "LaunchTime": moment(data?.LaunchTime).format("DD MMM YY"),
                "PrivateIpAddress": data?.PrivateIpAddress,
                "State": data?.State?.Name,
                "SubnetId": data?.SubnetId,
                "VpcId": data?.VpcId,
                "PlatformDetails": data?.PlatformDetails,
                "AvailabilityZone": data?.Placement?.AvailabilityZone
            })
        });

    console.log({ instanceData, filterData, InstanceCSVDownload })



    useEffect(() => {
        if (searchText) {
            handleSearchData();
        }
    }, [searchText])

    useEffect(() => {
        if (selectedRegion?.value) {
            getAllInstance();
        }
    }, [selectedRegion?.value])


    return (
        <>
            <div style={{ width: "100%" }}>
                <Row className="mt-3">
                    <Col>
                        <div className="mt-5 mb-3 d-flex justify-content-between align-items-center">
                            <div>
                                <Form.Group>
                                    <Form.Control placeholder="Find instance by attribute" onChange={(e: any) => setSearchText(e.target.value)} />
                                </Form.Group>
                            </div>
                            <div>
                                <CSVLink
                                    data={InstanceCSVDownload}
                                    filename={"Instance.csv"}
                                    className="btn btn-primary"
                                    target="_blank"
                                >
                                    Export to CSV
                                </CSVLink>
                            </div>
                        </div>
                    </Col>
                </Row>
                <Row className="d-flex justify-content-center align-items-center">
                    <Col>
                        {searchText && searchText.length > 0 ?
                            <Card className="shadow-sm">
                                <Card.Body>
                                    <InstanceTable tableData={filterData} />
                                </Card.Body>
                            </Card>
                            :
                            <Card className="shadow-sm">
                                <Card.Body>
                                    <InstanceTable tableData={instanceData} />
                                </Card.Body>
                            </Card>
                        }
                    </Col>
                </Row>
            </div>
        </>
    )
}