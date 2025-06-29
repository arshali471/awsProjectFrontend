// import { useContext, useEffect, useState } from "react";
// import { AdminService } from "../../../services/admin.service";
// import { LoadingContext, SelectedRegionContext } from "../../../context/context";
// import { Card, Col, Container, Form, Row } from "react-bootstrap";
// import InstanceTable from "../../../Table/Instance.table";
// import { CSVLink } from "react-csv";
// import moment from "moment";
// import toast from "react-hot-toast";
// import LoaderSpinner from "../../../Spinner/Spinner";
// import TablePagination from "../../../Pagination/TablePagination";
// import Select from "react-select";
// import DatePicker from "react-datepicker";



// export default function Dashboard() {
//     const { selectedRegion }: any = useContext(SelectedRegionContext);
//     const { loading, setLoading }: any = useContext(LoadingContext);

//     const [instanceData, setInstanceData] = useState<any[]>([]);
//     const [paginatedData, setPaginatedData] = useState<any[]>([]);
//     const [searchText, setSearchText] = useState<string>("");
//     const [totalCount, setTotalCount] = useState<number>(0);
//     const [currentPage, setCurrentPage] = useState<number>(1);
//     const [perPage, setPerPage] = useState<number>(10);
//     const [downloadFilteredData, setDownloadFilteredData] = useState<any[]>([]);

//     const [startDate, setStartDate] = useState(new Date());

//     const data = [
//         {
//             label: "Fetch Live Data",
//             value: "api"
//         },
//         {
//             label: "Fetch From Database",
//             value: "db"
//         },
//         {
//             label: "Cloud to Database",
//             value: "api-save-db"
//         },
//     ]


//     const getAllInstance = async () => {
//         if (!selectedRegion?.value) return;
//         setLoading(true);
//         try {
//             const res = await AdminService.getAllInstance(
//                 selectedRegion.value,
//                 moment(new Date()).isSame(startDate, "day") ? "api" : "db",
//                 !moment(new Date()).isSame(startDate, "day") ? moment(startDate).utc().format() : undefined
//             );
//             if (res.status === 200 && Array.isArray(res.data.data)) {
//                 setInstanceData(res.data.data);
//                 // convertToCSV(res.data.data);
//                 setTotalCount(res.data.data.length);
//             } else {
//                 setInstanceData([]);
//                 setTotalCount(0);
//             }
//         } catch (err: any) {
//             toast.error(err.response?.data || "Failed to fetch data");
//             setInstanceData([]);
//             setTotalCount(0);
//         }
//         setLoading(false);
//     };

//     const instanceCSVData = instanceData.map((data: any) => ({
//         InstanceName: data?.Tags?.find((tag: any) => tag.Key === "Name")?.Value || "N/A",
//         InstanceId: data?.InstanceId,
//         InstanceType: data?.InstanceType,
//         State: data?.State?.Name,
//         ImageId: data?.ImageId,
//         KeyName: data?.KeyName,
//         LaunchTime: moment(data?.LaunchTime).format("DD MMM YY"),
//         PrivateIpAddress: data?.PrivateIpAddress,
//         PlatformDetails: data?.PlatformDetails,
//         SubnetId: data?.SubnetId,
//         VpcId: data?.VpcId,
//         AvailabilityZone: data?.Placement?.AvailabilityZone,

//         // Newly added fields
//         Architecture: data?.Architecture,
//         RootDeviceType: data?.RootDeviceType,
//         RootDeviceName: data?.RootDeviceName,
//         SecurityGroups: data?.SecurityGroups?.map((group: any) => group?.GroupName).join(", "),
//         EbsOptimized: data?.EbsOptimized,
//         CpuCoreCount: data?.CpuOptions?.CoreCount,
//         ThreadsPerCore: data?.CpuOptions?.ThreadsPerCore,

//         // Extracting Volume ID
//         VolumeId: data?.BlockDeviceMappings?.map((block: any) => block?.Ebs?.VolumeId).join(", "),

//         // Extracting useful tags
//         OperatingSystem: data?.Tags?.find((tag: any) => tag.Key === "Operating_System")?.Value || "N/A",
//         Environment: data?.Tags?.find((tag: any) => tag.Key === "Environment")?.Value || "N/A",
//         Application: data?.Tags?.find((tag: any) => tag.Key === "Application")?.Value || "N/A",
//         ITLTOwner: data?.Tags?.find((tag: any) => tag.Key === "ITLT_Owner")?.Value || "N/A",
//         BusinessOwner: data?.Tags?.find((tag: any) => tag.Key === "Business_Owner")?.Value || "N/A",
//         CostCenter: data?.Tags?.find((tag: any) => tag.Key === "Cost_Center")?.Value || "N/A",
//         RetentionDays: data?.Tags?.find((tag: any) => tag.Key === "Retention")?.Value || "N/A",
//         ShutDownSchedule: data?.Tags?.find((tag: any) => tag.Key === "Shut_Down")?.Value || "N/A",
//         StartUpSchedule: data?.Tags?.find((tag: any) => tag.Key === "Start_Up")?.Value || "N/A",
//     }));


//     useEffect(() => {
//         let filteredData = instanceData;

//         if (searchText) {
//             filteredData = instanceData.filter((instance: any) => {
//                 const instanceValues = Object.values(instance)
//                     .map(value => (typeof value === "object" ? JSON.stringify(value) : String(value)))
//                     .join("");
//                 return instanceValues.toLowerCase().includes(searchText.toLowerCase());
//             });
//         }

//         console.log(filteredData)

//         const startIndex = (currentPage - 1) * perPage;
//         setPaginatedData(filteredData.slice(startIndex, startIndex + perPage));
//         setTotalCount(filteredData.length);
//     }, [instanceData, searchText, currentPage, perPage]);

//     useEffect(() => {
//         if (selectedRegion?.value) {
//             setSearchText("");
//             getAllInstance();
//         }
//     }, [selectedRegion?.value, startDate]);


//     return (
//         <>
//             {loading ? (
//                 <div className="d-flex justify-content-center align-items-center">
//                     <LoaderSpinner />
//                 </div>
//             ) : (
//                 <Container>
//                     <Row className="mt-3">
//                         <Col>
//                             <div className="mt-3 mb-3 d-flex justify-content-between align-items-center">
//                                 <Form.Group>
//                                     <Form.Control
//                                         // className="w-100"
//                                         style={{ width: 300 }}
//                                         placeholder="Find by attribute..."
//                                         value={searchText}
//                                         onChange={(e) => setSearchText(e.target.value)}
//                                     />
//                                 </Form.Group>
//                                 <div className="d-flex gap-2">
//                                     {/* <div style={{ width: 200 }}>
//                                         <Select
//                                             options={data}
//                                             value={selectedType}
//                                             onChange={(e) => setSelectedType(e)}
//                                             className="w-100"
//                                             isSearchable={true}
//                                         />
//                                     </div> */}

//                                     <DatePicker
//                                         selected={startDate}
//                                         onChange={(date: any) => setStartDate(date)}
//                                         className="w-100 form-control"
//                                         showTimeSelect
//                                         dateFormat="MMMM d, yyyy h:mm aa"
//                                     />

//                                     {instanceCSVData.length > 0 ? (
//                                         <CSVLink
//                                             data={instanceCSVData}
//                                             headers={Object.keys(instanceCSVData[0] || {})} // Ensure headers are valid
//                                             filename={"Instances.csv"}
//                                             className="btn btn-primary"
//                                         >
//                                             Export to CSV
//                                         </CSVLink>
//                                     ) : (
//                                         <button className="btn btn-secondary" disabled>
//                                             No Data to Export
//                                         </button>
//                                     )}
//                                 </div>


//                             </div>
//                         </Col>
//                     </Row>
//                     <Row className="d-flex justify-content-center align-items-center">
//                         <Col>
//                             <Card>
//                                 <Card.Body>
//                                     <InstanceTable tableData={paginatedData} pageNumber={1} pageSize={10} />
//                                 </Card.Body>
//                             </Card>
//                             <div className="bg-white py-2">
//                                 <TablePagination
//                                     total={totalCount}
//                                     currentPage={currentPage}
//                                     perPage={perPage}
//                                     handlePageChange={setCurrentPage}
//                                     setPerPage={setPerPage}
//                                 />
//                             </div>
//                         </Col>
//                     </Row>
//                 </Container>
//             )}
//         </>
//     );
// }


// // Updated Dashboard Component (Auto Fetch)
// import { useContext, useEffect, useMemo, useState } from "react";
// import { AdminService } from "../../../services/admin.service";
// import { LoadingContext, SelectedRegionContext } from "../../../context/context";
// import toast from "react-hot-toast";
// import DatePicker from "react-datepicker";
// import { Button, Col, Form, Row, Container } from "react-bootstrap";
// import StatusCheckTable from "../../../Table/statusCheck.table";
// import InstanceTable from "../../../Table/Instance.table";

// export default function Dashboard() {
//     const { selectedRegion }: any = useContext(SelectedRegionContext);
//     const { loading, setLoading }: any = useContext(LoadingContext);

//     const [instanceData, setInstanceData] = useState<any[]>([]);
//     const [searchText, setSearchText] = useState<string>("");
//     const [startDate, setStartDate] = useState(new Date());

//     const getAllInstance = async () => {
//         if (!selectedRegion?.value) return;
//         setLoading(true);
//         try {
//             const res = await AdminService.getAllInstance(
//                 selectedRegion.value,
//                 "api",
//                 startDate ? new Date(startDate).toISOString() : undefined
//             );
//             if (res.status === 200) {
//                 setInstanceData(res.data?.data || []);
//             } else {
//                 setInstanceData([]);
//             }
//         } catch (err: any) {
//             toast.error(err?.response?.data?.message || "Something went wrong");
//             setInstanceData([]);
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => {
//         if (selectedRegion?.value) {
//             getAllInstance();
//         }
//     }, [selectedRegion, startDate]);

//     const filteredInstanceData = useMemo(() => {
//     const search = searchText.toLowerCase();
//     return instanceData.filter((item: any) => {
//         const combinedValues = Object.values(item)
//             .map(val => {
//                 if (typeof val === 'object') {
//                     try {
//                         return JSON.stringify(val);
//                     } catch {
//                         return '';
//                     }
//                 }
//                 return String(val);
//             })
//             .join('')
//             .toLowerCase();
//         return combinedValues.includes(search);
//     });
// }, [instanceData, searchText]);

//     return (
//         <Container>
//             <Row className="mt-3">
//                 <Col md={3}>
//                     <Form.Group>
//                         <Form.Label>Search</Form.Label>
//                         <Form.Control
//                             type="text"
//                             placeholder="Search by Name, ID, or IP"
//                             value={searchText}
//                             onChange={(e) => setSearchText(e.target.value)}
//                         />
//                     </Form.Group>
//                 </Col>
//                 <Col md={3}>
//                     <Form.Group>
//                         <Form.Label>Start Date</Form.Label>
//                         <DatePicker
//                             selected={startDate}
//                             onChange={(date: any) => setStartDate(date)}
//                             className="form-control"
//                             maxDate={new Date()}
//                         />
//                     </Form.Group>
//                 </Col>
//             </Row>

//             <Row className="mt-3">
//                 <Col>
//                     <InstanceTable
//                         tableData={filteredInstanceData}
//                         loading={loading}
//                         fetchData={getAllInstance}
//                     />
//                 </Col>
//             </Row>
//         </Container>
//     );
// }




import { useContext, useEffect, useMemo, useState } from "react";
import { AdminService } from "../../../services/admin.service";
import { LoadingContext, SelectedRegionContext } from "../../../context/context";
import toast from "react-hot-toast";
import DatePicker from "react-datepicker";
import { Button, Col, Form, Row, Container } from "react-bootstrap";
import InstanceTable from "../../../Table/Instance.table";
import './Dashboard.css';
import moment from "moment";

export default function Dashboard() {
    const { selectedRegion }: any = useContext(SelectedRegionContext);
    const { loading, setLoading }: any = useContext(LoadingContext);

    const [instanceData, setInstanceData] = useState<any[]>([]);
    const [searchText, setSearchText] = useState<string>("");
    const [startDate, setStartDate] = useState(new Date());
    const [showAllStats, setShowAllStats] = useState(false);

    const getAllInstance = async () => {
    if (!selectedRegion?.value) return;
    setLoading(true);
    try {
        const isToday = moment(new Date()).isSame(startDate, "day");
        const source = isToday ? "api" : "db";
        const dateParam = isToday ? undefined : moment(startDate).utc().format();

        const res = await AdminService.getAllInstance(
            selectedRegion.value,
            source,
            dateParam
        );

        if (res.status === 200 && Array.isArray(res.data.data)) {
            setInstanceData(res.data.data);
        } else {
            setInstanceData([]);
        }
    } catch (err: any) {
        toast.error(err.response?.data || "Failed to fetch data");
        setInstanceData([]);
    }
    setLoading(false);
};

    useEffect(() => {
        if (selectedRegion?.value) {
            getAllInstance();
        }
    }, [selectedRegion, startDate]);

    const filteredInstanceData = useMemo(() => {
        const search = searchText.toLowerCase();
        return instanceData.filter((item: any) => {
            const combinedValues = Object.values(item)
                .map(val => {
                    if (typeof val === 'object') {
                        try {
                            return JSON.stringify(val);
                        } catch {
                            return '';
                        }
                    }
                    return String(val);
                })
                .join('')
                .toLowerCase();
            return combinedValues.includes(search);
        });
    }, [instanceData, searchText]);

    const totalCount = instanceData.length;
    const runningCount = instanceData.filter(i => i?.State?.Name === 'running').length;
    const stoppedCount = instanceData.filter(i => i?.State?.Name === 'stopped').length;
    const osCountMap = instanceData.reduce((acc: any, curr: any) => {
        const os = curr?.Tags?.find((tag: any) => tag.Key === 'Operating_System')?.Value || 'Unknown';
        acc[os] = (acc[os] || 0) + 1;
        return acc;
    }, {});

    return (
        <Container>
            <Row className="mt-3 stats-row">
                <Col>
                    <div className="d-flex gap-3 flex-wrap">
                        <div className="stat-box">Total: {totalCount}</div>
                        <div className="stat-box running">Running: {runningCount}</div>
                        <div className="stat-box stopped">Stopped: {stoppedCount}</div>
                        {[...Object.keys(osCountMap).slice(0, 4)].map((os, index) => (
                            <div className="stat-box" key={index}>{os}: {osCountMap[os]}</div>
                        ))}
                        <Button variant="link" onClick={() => setShowAllStats(!showAllStats)}>
                            {showAllStats ? 'Hide' : 'Show All'}
                        </Button>
                    </div>
                    {showAllStats && (
                        <div className="d-flex gap-3 flex-wrap mt-2">
                            {Object.keys(osCountMap).slice(4).map((os, index) => (
                                <div className="stat-box" key={index}>{os}: {osCountMap[os]}</div>
                            ))}
                        </div>
                    )}
                </Col>
            </Row>
            <Row className="mt-3">
                <Col md={3}>
                    <Form.Group>
                        <Form.Label>Search</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Search"
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                        />
                    </Form.Group>
                </Col>
                <Col md={3}>
                    <Form.Group>
                        <Form.Label>Start Date</Form.Label>
                        <DatePicker
                            selected={startDate}
                            onChange={(date: any) => setStartDate(date)}
                            className="form-control"
                            maxDate={new Date()}
                        />
                    </Form.Group>
                </Col>
            </Row>

            <Row className="mt-3">
                <Col>
                    <InstanceTable
                        tableData={filteredInstanceData}
                        loading={loading}
                        fetchData={getAllInstance}
                    />
                </Col>
            </Row>
        </Container>
    );
}
