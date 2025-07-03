// import { useContext, useEffect, useMemo, useState } from "react";
// import { AdminService } from "../../../services/admin.service";
// import { LoadingContext, SelectedRegionContext } from "../../../context/context";
// import toast from "react-hot-toast";
// import DatePicker from "react-datepicker";
// import { Button, Col, Form, Row, Container } from "react-bootstrap";
// import InstanceTable from "../../../Table/Instance.table";
// import './Dashboard.css';
// import moment from "moment";

// export default function Dashboard() {
//     const { selectedRegion }: any = useContext(SelectedRegionContext);
//     const { loading, setLoading }: any = useContext(LoadingContext);

//     const [instanceData, setInstanceData] = useState<any[]>([]);
//     const [searchText, setSearchText] = useState<string>("");
//     const [startDate, setStartDate] = useState(new Date());
//     const [showAllStats, setShowAllStats] = useState(false);

//     const getAllInstance = async () => {
//         if (!selectedRegion?.value) return;
//         setLoading(true);
//         try {
//             const isToday = moment(new Date()).isSame(startDate, "day");
//             const source = isToday ? "api" : "db";
//             const dateParam = isToday ? undefined : moment(startDate).utc().format();

//             const res = await AdminService.getAllInstance(
//                 selectedRegion.value,
//                 source,
//                 dateParam
//             );

//             if (res.status === 200 && Array.isArray(res.data.data)) {
//                 setInstanceData(res.data.data);
//             } else {
//                 setInstanceData([]);
//             }
//         } catch (err: any) {
//             toast.error(err.response?.data || "Failed to fetch data");
//             setInstanceData([]);
//         }
//         setLoading(false);
//     };


//     const getGlobalInstance = async () => {
//         setLoading(true);
//         try {
//             if (!searchText.trim()) {
//                 toast.error("Please enter IP address search.");
//                 setLoading(false);
//                 return;
//             }

//             const res = await AdminService.getGlobalInstance(
//                 searchText.toLowerCase()
//             );

//             if (res.status === 200 && Array.isArray(res.data.matchedInstances)) {
//                 setInstanceData(res.data.matchedInstances);
//             } else {
//                 setInstanceData([]);
//             }
//         } catch (err: any) {
//             toast.error(err.response?.data || "Failed to fetch data");
//             setInstanceData([]);
//         }
//         setLoading(false);
//     };

//     useEffect(() => {
//         if (selectedRegion?.value) {
//             getAllInstance();
//         }
//     }, [selectedRegion, startDate]);

//     const filteredInstanceData = useMemo(() => {
//         const search = searchText.toLowerCase();
//         return instanceData.filter((item: any) => {
//             const combinedValues = Object.values(item)
//                 .map(val => {
//                     if (typeof val === 'object') {
//                         try {
//                             return JSON.stringify(val);
//                         } catch {
//                             return '';
//                         }
//                     }
//                     return String(val);
//                 })
//                 .join('')
//                 .toLowerCase();
//             return combinedValues.includes(search);
//         });
//     }, [instanceData, searchText]);

//     const totalCount = instanceData.length;
//     const runningCount = instanceData.filter(i => i?.State?.Name === 'running').length;
//     const stoppedCount = instanceData.filter(i => i?.State?.Name === 'stopped').length;
//     const osCountMap = instanceData.reduce((acc: any, curr: any) => {
//         const os = curr?.Tags?.find((tag: any) => tag.Key === 'Operating_System')?.Value || 'Unknown';
//         acc[os] = (acc[os] || 0) + 1;
//         return acc;
//     }, {});

//     return (
//         <Container>
//             <Row className="mt-3 stats-row">
//                 <Col>
//                     <div className="d-flex gap-3 flex-wrap">
//                         <div className="stat-box">Total: {totalCount}</div>
//                         <div className="stat-box running">Running: {runningCount}</div>
//                         <div className="stat-box stopped">Stopped: {stoppedCount}</div>
//                         {[...Object.keys(osCountMap).slice(0, 4)].map((os, index) => (
//                             <div className="stat-box" key={index}>{os}: {osCountMap[os]}</div>
//                         ))}
//                         <Button variant="link" onClick={() => setShowAllStats(!showAllStats)}>
//                             {showAllStats ? 'Hide' : 'Show All'}
//                         </Button>
//                     </div>
//                     {showAllStats && (
//                         <div className="d-flex gap-3 flex-wrap mt-2">
//                             {Object.keys(osCountMap).slice(4).map((os, index) => (
//                                 <div className="stat-box" key={index}>{os}: {osCountMap[os]}</div>
//                             ))}
//                         </div>
//                     )}
//                 </Col>
//             </Row>

//             <Row className="mt-3 align-items-end g-2">
//                 <Col md={3} className="mb-2">
//                     <Form.Group>
//                         {/* <Form.Label>Search</Form.Label> */}
//                         <Form.Control
//                             type="text"
//                             placeholder="Search"
//                             value={searchText}
//                             onChange={(e) => setSearchText(e.target.value)}
//                         />
//                     </Form.Group>
//                 </Col>
//                 <Col md={3} className="mb-2">
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
//                 <Col md={2} className="mb-2">
//                     <Button style={{ backgroundColor: '#1876d2', borderColor: '#1876d2', width: '100%' }} onClick={getGlobalInstance}>Global Search</Button>
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



// import React, { useContext, useEffect, useMemo, useState } from "react";
// import { AdminService } from "../../../services/admin.service";
// import { LoadingContext, SelectedRegionContext } from "../../../context/context";
// import toast from "react-hot-toast";
// import { Button, Col, Row, Container } from "react-bootstrap";
// import InstanceTable from "../../../Table/Instance.table";
// import './Dashboard.css';
// import moment from "moment";
// import { TextField, InputAdornment, IconButton, Box } from "@mui/material";
// import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
// import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
// import SearchIcon from "@mui/icons-material/Search";
// import ClearIcon from "@mui/icons-material/Clear";

// export default function Dashboard() {
//     const { selectedRegion }: any = useContext(SelectedRegionContext);
//     const { loading, setLoading }: any = useContext(LoadingContext);

//     const [instanceData, setInstanceData] = useState<any[]>([]);
//     const [searchText, setSearchText] = useState<string>("");
//     const [startDate, setStartDate] = useState<Date | null>(new Date());
//     const [showAllStats, setShowAllStats] = useState(false);

//     const getAllInstance = async () => {
//         if (!selectedRegion?.value) return;
//         setLoading(true);
//         try {
//             const isToday = moment(new Date()).isSame(startDate, "day");
//             const source = isToday ? "api" : "db";
//             const dateParam = isToday ? undefined : moment(startDate).utc().format();

//             const res = await AdminService.getAllInstance(
//                 selectedRegion.value,
//                 source,
//                 dateParam
//             );

//             if (res.status === 200 && Array.isArray(res.data.data)) {
//                 setInstanceData(res.data.data);
//             } else {
//                 setInstanceData([]);
//             }
//         } catch (err: any) {
//             toast.error(err.response?.data || "Failed to fetch data");
//             setInstanceData([]);
//         }
//         setLoading(false);
//     };

//     const getGlobalInstance = async () => {
//         setLoading(true);
//         try {
//             if (!searchText.trim()) {
//                 toast.error("Please enter a value to search.");
//                 setLoading(false);
//                 return;
//             }
//             // Optional: Call backend for search, if needed.
//             setLoading(false);
//         } catch (err: any) {
//             toast.error(err.response?.data || "Failed to fetch data");
//             setInstanceData([]);
//         }
//         setLoading(false);
//     };

//     useEffect(() => {
//         if (selectedRegion?.value) {
//             getAllInstance();
//         }
//     }, [selectedRegion, startDate]);

//     // ---- MULTI-TERM GLOBAL SEARCH (AWS-style) ----
//     const filteredInstanceData = useMemo(() => {
//         if (!searchText.trim()) return instanceData;
//         const terms = searchText.trim().toLowerCase().split(/\s+/); // split by whitespace

//         // Helper to flatten all row values
//         const flatten = (obj: any): string[] =>
//             Object.values(obj).flatMap(val => {
//                 if (val == null) return [];
//                 if (Array.isArray(val)) return val.map(flatten).flat();
//                 if (typeof val === "object") return flatten(val);
//                 return String(val);
//             });

//         return instanceData.filter((item: any) => {
//             const values = flatten(item).join(" ").toLowerCase();
//             // ALL search terms must exist somewhere in this row
//             return terms.every(term => values.includes(term));
//         });
//     }, [instanceData, searchText]);

//     // Stats calculation (same as before)
//     const totalCount = instanceData.length;
//     const runningCount = instanceData.filter(i => i?.State?.Name === 'running').length;
//     const stoppedCount = instanceData.filter(i => i?.State?.Name === 'stopped').length;
//     const osCountMap = instanceData.reduce((acc: any, curr: any) => {
//         const os = curr?.Tags?.find((tag: any) => tag.Key === 'Operating_System')?.Value || 'Unknown';
//         acc[os] = (acc[os] || 0) + 1;
//         return acc;
//     }, {});

//     return (
//         <Container>
//             {/* Stats Bar */}
//             <Row className="mt-3 stats-row">
//                 <Col>
//                     <div className="d-flex gap-3 flex-wrap">
//                         <div className="stat-box">Total: {totalCount}</div>
//                         <div className="stat-box running">Running: {runningCount}</div>
//                         <div className="stat-box stopped">Stopped: {stoppedCount}</div>
//                         {[...Object.keys(osCountMap).slice(0, 4)].map((os, index) => (
//                             <div className="stat-box" key={index}>{os}: {osCountMap[os]}</div>
//                         ))}
//                         <Button variant="link" onClick={() => setShowAllStats(!showAllStats)}>
//                             {showAllStats ? 'Hide' : 'Show All'}
//                         </Button>
//                     </div>
//                     {showAllStats && (
//                         <div className="d-flex gap-3 flex-wrap mt-2">
//                             {Object.keys(osCountMap).slice(4).map((os, index) => (
//                                 <div className="stat-box" key={index}>{os}: {osCountMap[os]}</div>
//                             ))}
//                         </div>
//                     )}
//                 </Col>
//             </Row>

//             {/* GLOBAL SEARCH BAR */}
//             <Row className="mt-3">
//                 <Col>
//                     <Box
//                         display="flex"
//                         alignItems="center"
//                         flexWrap="wrap"
//                         gap={2}
//                         sx={{ p: 2, background: "#fff", borderRadius: 3, boxShadow: "0 1px 3px #e7e7e7" }}
//                     >
//                         <TextField
//                             variant="outlined"
//                             size="small"
//                             placeholder="Search by anything (ID, IP, State, Tag...)"
//                             value={searchText}
//                             onChange={e => setSearchText(e.target.value)}
//                             InputProps={{
//                                 startAdornment: (
//                                     <InputAdornment position="start">
//                                         <SearchIcon sx={{ color: '#767676' }} />
//                                     </InputAdornment>
//                                 ),
//                                 endAdornment: (
//                                     searchText && (
//                                         <InputAdornment position="end">
//                                             <IconButton
//                                                 onClick={() => setSearchText('')}
//                                                 size="small"
//                                                 sx={{ color: '#767676', p: 0.5 }}
//                                             >
//                                                 <ClearIcon fontSize="small" />
//                                             </IconButton>
//                                         </InputAdornment>
//                                     )
//                                 ),
//                             }}
//                             sx={{
//                                 minWidth: 330,
//                                 background: '#fff',
//                                 borderRadius: '22px',
//                                 "& .MuiOutlinedInput-root": {
//                                     borderRadius: '22px',
//                                     fontSize: '1rem',
//                                     color: '#232f3e',
//                                     "& fieldset": {
//                                         borderColor: "#b6bec9",
//                                     },
//                                     "&:hover fieldset": {
//                                         borderColor: "#0073bb",
//                                     },
//                                     "&.Mui-focused fieldset": {
//                                         borderColor: "#0073bb",
//                                         borderWidth: 2,
//                                     },
//                                 },
//                             }}
//                         />

//                         <LocalizationProvider dateAdapter={AdapterDateFns}>
//                             <DatePicker
//                                 label="Start Date"
//                                 value={startDate}
//                                 onChange={setStartDate}
//                                 maxDate={new Date()}
//                                 slotProps={{
//                                     textField: {
//                                         variant: 'outlined',
//                                         size: 'small',
//                                         sx: {
//                                             minWidth: 150,
//                                             background: '#fff',
//                                             borderRadius: 2,
//                                             "& .MuiOutlinedInput-root": {
//                                                 borderRadius: 2,
//                                                 fontSize: '1rem',
//                                                 color: '#232f3e',
//                                                 "& fieldset": { borderColor: "#b6bec9" },
//                                             },
//                                             "& .MuiInputLabel-root": { color: "#767676" },
//                                         }
//                                     }
//                                 }}
//                             />
//                         </LocalizationProvider>

//                         <Button
//                             style={{
//                                 backgroundColor: '#1876d2',
//                                 borderColor: '#1876d2',
//                                 borderRadius: 8,
//                                 fontWeight: 500,
//                                 minWidth: 120
//                             }}
//                             onClick={getGlobalInstance}
//                         >
//                             Global Search
//                         </Button>

//                         {searchText && (
//                             <Button
//                                 variant="outline-secondary"
//                                 onClick={() => setSearchText("")}
//                                 style={{ marginLeft: 8 }}
//                             >
//                                 Clear All
//                             </Button>
//                         )}
//                     </Box>
//                 </Col>
//             </Row>

//             {/* TABLE */}
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




// import React, { useContext, useEffect, useMemo, useState } from "react";
// import { AdminService } from "../../../services/admin.service";
// import { LoadingContext, SelectedRegionContext } from "../../../context/context";
// import toast from "react-hot-toast";
// import { Button, Col, Row, Container } from "react-bootstrap";
// import InstanceTable from "../../../Table/Instance.table";
// import './Dashboard.css';
// import moment from "moment";
// import { TextField, InputAdornment, IconButton, Box } from "@mui/material";
// import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
// import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
// import SearchIcon from "@mui/icons-material/Search";
// import ClearIcon from "@mui/icons-material/Clear";

// export default function Dashboard() {
//     const { selectedRegion }: any = useContext(SelectedRegionContext);
//     const { loading, setLoading }: any = useContext(LoadingContext);

//     const [instanceData, setInstanceData] = useState<any[]>([]);
//     const [displayData, setDisplayData] = useState<any[]>([]); // what we show in table
//     const [searchText, setSearchText] = useState<string>("");
//     const [startDate, setStartDate] = useState<Date | null>(new Date());
//     const [showAllStats, setShowAllStats] = useState(false);
//     const [isGlobal, setIsGlobal] = useState(false);

//     const getAllInstance = async () => {
//         if (!selectedRegion?.value) return;
//         setLoading(true);
//         try {
//             const isToday = moment(new Date()).isSame(startDate, "day");
//             const source = isToday ? "api" : "db";
//             const dateParam = isToday ? undefined : moment(startDate).utc().format();

//             const res = await AdminService.getAllInstance(
//                 selectedRegion.value,
//                 source,
//                 dateParam
//             );

//             if (res.status === 200 && Array.isArray(res.data.data)) {
//                 setInstanceData(res.data.data);
//                 setDisplayData(res.data.data);  // show as default
//                 setIsGlobal(false);
//             } else {
//                 setInstanceData([]);
//                 setDisplayData([]);
//             }
//         } catch (err: any) {
//             toast.error(err.response?.data || "Failed to fetch data");
//             setInstanceData([]);
//             setDisplayData([]);
//         }
//         setLoading(false);
//     };

//     // ---- GLOBAL SEARCH (backend API) ----
//     const getGlobalInstance = async () => {
//         setLoading(true);
//         try {
//             if (!searchText.trim()) {
//                 toast.error("Please enter a value to search.");
//                 setLoading(false);
//                 return;
//             }
//             // Combine search terms and date (if needed) for the API
//             // You can modify the params format as per your backend API
//             const params: any = searchText.trim();

//             // Expecting res.data.matchedInstances from backend
//             const res = await AdminService.getGlobalInstance(params);
//             if (res.status === 200 && Array.isArray(res.data.matchedInstances)) {
//                 setDisplayData(res.data.matchedInstances);
//                 setIsGlobal(true);
//             } else {
//                 setDisplayData([]);
//                 setIsGlobal(true);
//             }
//         } catch (err: any) {
//             toast.error(err.response?.data || "Failed to fetch data");
//             setDisplayData([]);
//             setIsGlobal(true);
//         }
//         setLoading(false);
//     };

//     // If region/date change, reset to region data and client search
//     useEffect(() => {
//         getAllInstance();
//         // eslint-disable-next-line
//     }, [selectedRegion, startDate]);

//     // ---- MULTI-TERM GLOBAL SEARCH (AWS-style, client-side if NOT global) ----
//     const filteredInstanceData = useMemo(() => {
//         if (isGlobal) return displayData; // use global API result
//         if (!searchText.trim()) return instanceData;
//         const terms = searchText.trim().toLowerCase().split(/\s+/); // split by whitespace

//         // Helper to flatten all row values
//         const flatten = (obj: any): string[] =>
//             Object.values(obj).flatMap(val => {
//                 if (val == null) return [];
//                 if (Array.isArray(val)) return val.map(flatten).flat();
//                 if (typeof val === "object") return flatten(val);
//                 return String(val);
//             });

//         return instanceData.filter((item: any) => {
//             const values = flatten(item).join(" ").toLowerCase();
//             // ALL search terms must exist somewhere in this row
//             return terms.every(term => values.includes(term));
//         });
//     }, [instanceData, searchText, isGlobal, displayData]);

//     // Stats calculation (same as before, always use displayed data for stats)
//     const totalCount = filteredInstanceData.length;
//     const runningCount = filteredInstanceData.filter(i => i?.State?.Name === 'running').length;
//     const stoppedCount = filteredInstanceData.filter(i => i?.State?.Name === 'stopped').length;
//     const osCountMap = filteredInstanceData.reduce((acc: any, curr: any) => {
//         const os = curr?.Tags?.find((tag: any) => tag.Key === 'Operating_System')?.Value || 'Unknown';
//         acc[os] = (acc[os] || 0) + 1;
//         return acc;
//     }, {});

//     // Clear global results & search text
//     const handleClear = () => {
//         setSearchText("");
//         setIsGlobal(false);
//         setDisplayData(instanceData); // back to region/list
//     };

//     return (
//         <Container>
//             {/* Stats Bar */}
//             <Row className="mt-3 stats-row">
//                 <Col>
//                     <div className="d-flex gap-3 flex-wrap">
//                         <div className="stat-box">Total: {totalCount}</div>
//                         <div className="stat-box running">Running: {runningCount}</div>
//                         <div className="stat-box stopped">Stopped: {stoppedCount}</div>
//                         {[...Object.keys(osCountMap).slice(0, 4)].map((os, index) => (
//                             <div className="stat-box" key={index}>{os}: {osCountMap[os]}</div>
//                         ))}
//                         <Button variant="link" onClick={() => setShowAllStats(!showAllStats)}>
//                             {showAllStats ? 'Hide' : 'Show All'}
//                         </Button>
//                     </div>
//                     {showAllStats && (
//                         <div className="d-flex gap-3 flex-wrap mt-2">
//                             {Object.keys(osCountMap).slice(4).map((os, index) => (
//                                 <div className="stat-box" key={index}>{os}: {osCountMap[os]}</div>
//                             ))}
//                         </div>
//                     )}
//                 </Col>
//             </Row>

//             {/* GLOBAL SEARCH BAR */}
//             <Row className="mt-3">
//                 <Col>
//                     <Box
//                         display="flex"
//                         alignItems="center"
//                         flexWrap="wrap"
//                         gap={2}
//                         sx={{ p: 2, background: "#fff", borderRadius: 3, boxShadow: "0 1px 3px #e7e7e7" }}
//                     >
//                         <TextField
//                             variant="outlined"
//                             size="small"
//                             placeholder="Search by anything (ID, IP, State, Tag...)"
//                             value={searchText}
//                             onChange={e => {
//                                 setSearchText(e.target.value);
//                                 if (isGlobal) {
//                                     setIsGlobal(false);
//                                     setDisplayData(instanceData);
//                                 }
//                             }}
//                             InputProps={{
//                                 startAdornment: (
//                                     <InputAdornment position="start">
//                                         <SearchIcon sx={{ color: '#767676' }} />
//                                     </InputAdornment>
//                                 ),
//                                 endAdornment: (
//                                     searchText && (
//                                         <InputAdornment position="end">
//                                             <IconButton
//                                                 onClick={handleClear}
//                                                 size="small"
//                                                 sx={{ color: '#767676', p: 0.5 }}
//                                             >
//                                                 <ClearIcon fontSize="small" />
//                                             </IconButton>
//                                         </InputAdornment>
//                                     )
//                                 ),
//                             }}
//                             sx={{
//                                 minWidth: 330,
//                                 background: '#fff',
//                                 borderRadius: '22px',
//                                 "& .MuiOutlinedInput-root": {
//                                     borderRadius: '22px',
//                                     fontSize: '1rem',
//                                     color: '#232f3e',
//                                     "& fieldset": {
//                                         borderColor: "#b6bec9",
//                                     },
//                                     "&:hover fieldset": {
//                                         borderColor: "#0073bb",
//                                     },
//                                     "&.Mui-focused fieldset": {
//                                         borderColor: "#0073bb",
//                                         borderWidth: 2,
//                                     },
//                                 },
//                             }}
//                         />

//                         <LocalizationProvider dateAdapter={AdapterDateFns}>
//                             <DatePicker
//                                 label="Start Date"
//                                 value={startDate}
//                                 onChange={setStartDate}
//                                 maxDate={new Date()}
//                                 slotProps={{
//                                     textField: {
//                                         variant: 'outlined',
//                                         size: 'small',
//                                         sx: {
//                                             minWidth: 150,
//                                             background: '#fff',
//                                             borderRadius: 2,
//                                             "& .MuiOutlinedInput-root": {
//                                                 borderRadius: 2,
//                                                 fontSize: '1rem',
//                                                 color: '#232f3e',
//                                                 "& fieldset": { borderColor: "#b6bec9" },
//                                             },
//                                             "& .MuiInputLabel-root": { color: "#767676" },
//                                         }
//                                     }
//                                 }}
//                             />
//                         </LocalizationProvider>

//                         <Button
//                             style={{
//                                 backgroundColor: '#1876d2',
//                                 borderColor: '#1876d2',
//                                 borderRadius: 8,
//                                 fontWeight: 500,
//                                 minWidth: 120
//                             }}
//                             onClick={getGlobalInstance}
//                         >
//                             Global Search
//                         </Button>

//                         {searchText && (
//                             <Button
//                                 variant="outline-secondary"
//                                 onClick={handleClear}
//                                 style={{ marginLeft: 8 }}
//                             >
//                                 Clear All
//                             </Button>
//                         )}
//                     </Box>
//                 </Col>
//             </Row>

//             {/* TABLE */}
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


// import React, { useContext, useEffect, useMemo, useState } from "react";
// import { AdminService } from "../../../services/admin.service";
// import { LoadingContext, SelectedRegionContext } from "../../../context/context";
// import toast from "react-hot-toast";
// import { Button, Col, Row, Container } from "react-bootstrap";
// import InstanceTable from "../../../Table/Instance.table";
// import './Dashboard.css';
// import moment from "moment";
// import { TextField, InputAdornment, IconButton, Box } from "@mui/material";
// import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
// import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
// import SearchIcon from "@mui/icons-material/Search";
// import ClearIcon from "@mui/icons-material/Clear";

// // Utility to validate IPv4
// const isIPv4 = (str) =>
//     /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/.test(str);

// export default function Dashboard() {
//     const { selectedRegion }: any = useContext(SelectedRegionContext);
//     const { loading, setLoading }: any = useContext(LoadingContext);

//     const [instanceData, setInstanceData] = useState<any[]>([]);
//     const [displayData, setDisplayData] = useState<any[]>([]);
//     const [searchText, setSearchText] = useState<string>("");
//     const [startDate, setStartDate] = useState<Date | null>(new Date());
//     const [showAllStats, setShowAllStats] = useState(false);
//     const [isGlobal, setIsGlobal] = useState(false);

//     // Fetch region data
//     const getAllInstance = async () => {
//         if (!selectedRegion?.value) return;
//         setLoading(true);
//         try {
//             const isToday = moment(new Date()).isSame(startDate, "day");
//             const source = isToday ? "api" : "db";
//             const dateParam = isToday ? undefined : moment(startDate).utc().format();

//             const res = await AdminService.getAllInstance(
//                 selectedRegion.value,
//                 source,
//                 dateParam
//             );

//             if (res.status === 200 && Array.isArray(res.data.data)) {
//                 setInstanceData(res.data.data);
//                 setDisplayData(res.data.data);
//                 setIsGlobal(false);
//             } else {
//                 setInstanceData([]);
//                 setDisplayData([]);
//             }
//         } catch (err: any) {
//             toast.error(err.response?.data || "Failed to fetch data");
//             setInstanceData([]);
//             setDisplayData([]);
//         }
//         setLoading(false);
//     };

//     // API Global Search (by IP)
//     const getGlobalInstance = async (ipSearch?: string) => {
//         setLoading(true);
//         try {
//             const ip = (ipSearch ?? searchText).trim();
//             if (!isIPv4(ip)) {
//                 toast.error("Please enter a valid IP address for global search.");
//                 setLoading(false);
//                 return;
//             }
//             const res = await AdminService.getGlobalInstance(ip);
//             if (res.status === 200 && Array.isArray(res.data.matchedInstances)) {
//                 setDisplayData(res.data.matchedInstances);
//                 setIsGlobal(true);
//             } else {
//                 setDisplayData([]);
//                 setIsGlobal(true);
//             }
//         } catch (err: any) {
//             toast.error(err.response?.data || "Failed to fetch data");
//             setDisplayData([]);
//             setIsGlobal(true);
//         }
//         setLoading(false);
//     };

//     // If region/date change, reset to region data and client search
//     useEffect(() => {
//         getAllInstance();
//         // eslint-disable-next-line
//     }, [selectedRegion, startDate]);

//     // --- Multi-term local filter ---
//     const filteredInstanceData = useMemo(() => {
//         if (isGlobal) return displayData; // use API result
//         if (!searchText.trim()) return instanceData;
//         const terms = searchText.trim().toLowerCase().split(/\s+/);

//         // flatten all row values
//         const flatten = (obj: any): string[] =>
//             Object.values(obj).flatMap(val => {
//                 if (val == null) return [];
//                 if (Array.isArray(val)) return val.map(flatten).flat();
//                 if (typeof val === "object") return flatten(val);
//                 return String(val);
//             });

//         return instanceData.filter((item: any) => {
//             const values = flatten(item).join(" ").toLowerCase();
//             return terms.every(term => values.includes(term));
//         });
//     }, [instanceData, searchText, isGlobal, displayData]);

//     // Stats calculation (always use currently displayed data)
//     const totalCount = filteredInstanceData.length;
//     const runningCount = filteredInstanceData.filter(i => i?.State?.Name === 'running').length;
//     const stoppedCount = filteredInstanceData.filter(i => i?.State?.Name === 'stopped').length;
//     const osCountMap = filteredInstanceData.reduce((acc: any, curr: any) => {
//         const os = curr?.Tags?.find((tag: any) => tag.Key === 'Operating_System')?.Value || 'Unknown';
//         acc[os] = (acc[os] || 0) + 1;
//         return acc;
//     }, {});

//     // Clear search
//     const handleClear = () => {
//         setSearchText("");
//         setIsGlobal(false);
//         setDisplayData(instanceData);
//     };

//     // Search on Enter
//     const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
//         if (e.key === "Enter") {
//             if (isIPv4(searchText.trim())) {
//                 getGlobalInstance(searchText.trim());
//             } // else local filter (just triggers re-render by changing searchText)
//         }
//     };

//     // Global Search button
//     const handleGlobalSearch = () => {
//         if (isIPv4(searchText.trim())) {
//             getGlobalInstance(searchText.trim());
//         } else {
//             toast.error("Only IP address search is supported for Global Search.");
//         }
//     };

//     return (
//         <Container>
//             {/* Stats Bar */}
//             <Row className="mt-3 stats-row">
//                 <Col>
//                     <div className="d-flex gap-3 flex-wrap">
//                         <div className="stat-box">Total: {totalCount}</div>
//                         <div className="stat-box running">Running: {runningCount}</div>
//                         <div className="stat-box stopped">Stopped: {stoppedCount}</div>
//                         {[...Object.keys(osCountMap).slice(0, 4)].map((os, index) => (
//                             <div className="stat-box" key={index}>{os}: {osCountMap[os]}</div>
//                         ))}
//                         <Button variant="link" onClick={() => setShowAllStats(!showAllStats)}>
//                             {showAllStats ? 'Hide' : 'Show All'}
//                         </Button>
//                     </div>
//                     {showAllStats && (
//                         <div className="d-flex gap-3 flex-wrap mt-2">
//                             {Object.keys(osCountMap).slice(4).map((os, index) => (
//                                 <div className="stat-box" key={index}>{os}: {osCountMap[os]}</div>
//                             ))}
//                         </div>
//                     )}
//                 </Col>
//             </Row>

//             {/* SEARCH BAR */}
//             <Row className="mt-3">
//                 <Col>
//                     <Box
//                         display="flex"
//                         alignItems="center"
//                         flexWrap="wrap"
//                         gap={2}
//                         sx={{ p: 2, background: "#fff", borderRadius: 3, boxShadow: "0 1px 3px #e7e7e7" }}
//                     >
//                         <TextField
//                             variant="outlined"
//                             size="small"
//                             placeholder="Find Instance by attribute or tag (case-sensitive)"
//                             value={searchText}
//                             onChange={e => {
//                                 setSearchText(e.target.value);
//                                 if (isGlobal) {
//                                     setIsGlobal(false);
//                                     setDisplayData(instanceData);
//                                 }
//                             }}
//                             onKeyDown={handleSearchKeyDown}
//                             InputProps={{
//                                 startAdornment: (
//                                     <InputAdornment position="start">
//                                         <SearchIcon sx={{ color: '#0073bb', mr: 1 }} />
//                                     </InputAdornment>
//                                 ),
//                                 endAdornment: (
//                                     searchText && (
//                                         <InputAdornment position="end">
//                                             <IconButton
//                                                 onClick={handleClear}
//                                                 size="small"
//                                                 sx={{ color: '#767676', p: 0.5 }}
//                                             >
//                                                 <ClearIcon fontSize="small" />
//                                             </IconButton>
//                                         </InputAdornment>
//                                     )
//                                 ),
//                                 sx: {
//                                     borderRadius: 3,
//                                     background: "#fff",
//                                     color: "#232f3e",
//                                     fontSize: "1.08em"
//                                 }
//                             }}
//                             sx={{
//                                 minWidth: 400,
//                                 width: "100%",
//                                 background: "#fff",
//                                 borderRadius: 3,
//                             }}
//                         />

//                         <LocalizationProvider dateAdapter={AdapterDateFns}>
//                             <DatePicker
//                                 label="Start Date"
//                                 value={startDate}
//                                 onChange={setStartDate}
//                                 maxDate={new Date()}
//                                 slotProps={{
//                                     textField: {
//                                         variant: 'outlined',
//                                         size: 'small',
//                                         sx: {
//                                             minWidth: 150,
//                                             background: '#fff',
//                                             borderRadius: 2,
//                                             "& .MuiOutlinedInput-root": {
//                                                 borderRadius: 2,
//                                                 fontSize: '1rem',
//                                                 color: '#232f3e',
//                                                 "& fieldset": { borderColor: "#b6bec9" },
//                                             },
//                                             "& .MuiInputLabel-root": { color: "#767676" },
//                                         }
//                                     }
//                                 }}
//                             />
//                         </LocalizationProvider>

//                         <Button
//                             style={{
//                                 backgroundColor: '#1876d2',
//                                 borderColor: '#1876d2',
//                                 borderRadius: 8,
//                                 fontWeight: 500,
//                                 minWidth: 120
//                             }}
//                             onClick={handleGlobalSearch}
//                         >
//                             Global Search
//                         </Button>

//                         {searchText && (
//                             <Button
//                                 variant="outline-secondary"
//                                 onClick={handleClear}
//                                 style={{ marginLeft: 8 }}
//                             >
//                                 Clear All
//                             </Button>
//                         )}
//                     </Box>
//                 </Col>
//             </Row>

//             {/* TABLE */}
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



import React, { useContext, useEffect, useMemo, useState } from "react";
import { AdminService } from "../../../services/admin.service";
import { LoadingContext, SelectedRegionContext } from "../../../context/context";
import toast from "react-hot-toast";
import { Button, Col, Row, Container } from "react-bootstrap";
import InstanceTable from "../../../Table/Instance.table";
import './Dashboard.css';
import moment from "moment";
import { TextField, InputAdornment, IconButton, Box, Chip, Stack } from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";

const isIPv4 = (str) =>
    /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/.test(str);

export default function Dashboard() {
    const { selectedRegion }: any = useContext(SelectedRegionContext);
    const { loading, setLoading }: any = useContext(LoadingContext);

    const [instanceData, setInstanceData] = useState<any[]>([]);
    const [displayData, setDisplayData] = useState<any[]>([]);
    const [input, setInput] = useState<string>("");
    const [chips, setChips] = useState<string[]>([]);
    const [startDate, setStartDate] = useState<Date | null>(new Date());
    const [showAllStats, setShowAllStats] = useState(false);
    const [isGlobal, setIsGlobal] = useState(false);

    // Fetch region data
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
                setDisplayData(res.data.data);
                setIsGlobal(false);
            } else {
                setInstanceData([]);
                setDisplayData([]);
            }
        } catch (err: any) {
            toast.error(err.response?.data || "Failed to fetch data");
            setInstanceData([]);
            setDisplayData([]);
        }
        setLoading(false);
    };

    // API Global Search (by IP)
    const getGlobalInstance = async (ip: string) => {
        setLoading(true);
        try {
            const res = await AdminService.getGlobalInstance(ip);
            if (res.status === 200 && Array.isArray(res.data.matchedInstances)) {
                setDisplayData(res.data.matchedInstances);
                setIsGlobal(true);
            } else {
                setDisplayData([]);
                setIsGlobal(true);
            }
        } catch (err: any) {
            toast.error(err.response?.data || "Failed to fetch data");
            setDisplayData([]);
            setIsGlobal(true);
        }
        setLoading(false);
    };

    // On region/date change, reset chips and fetch data
    useEffect(() => {
        setChips([]);
        setInput("");
        getAllInstance();
        // eslint-disable-next-line
    }, [selectedRegion, startDate]);

    // Local multi-chip filter (all chips must match in row, AND)
    const filteredInstanceData = useMemo(() => {
        if (isGlobal) return displayData;
        if (!chips.length) return instanceData;
        const flatten = (obj: any): string[] =>
            Object.values(obj).flatMap(val => {
                if (val == null) return [];
                if (Array.isArray(val)) return val.map(flatten).flat();
                if (typeof val === "object") return flatten(val);
                return String(val);
            });
        return instanceData.filter((item: any) => {
            const values = flatten(item).join(" ").toLowerCase();
            return chips.every(term => values.includes(term.toLowerCase()));
        });
    }, [instanceData, chips, isGlobal, displayData]);

    // Stats calculation (on current view)
    const totalCount = filteredInstanceData.length;
    const runningCount = filteredInstanceData.filter(i => i?.State?.Name === 'running').length;
    const stoppedCount = filteredInstanceData.filter(i => i?.State?.Name === 'stopped').length;
    const osCountMap = filteredInstanceData.reduce((acc: any, curr: any) => {
        const os = curr?.Tags?.find((tag: any) => tag.Key === 'Operating_System')?.Value || 'Unknown';
        acc[os] = (acc[os] || 0) + 1;
        return acc;
    }, {});

    // Add chip on Enter, Space, comma, or Tab
    const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (
            ["Enter", "Tab", " "].includes(e.key) ||
            (e.key === "," && input.trim())
        ) {
            e.preventDefault();
            const term = input.trim().replace(/,$/, "");
            if (term && !chips.includes(term)) {
                setChips([...chips, term]);
            }
            setInput("");
            setIsGlobal(false); // switch to local search on any chip add
        }
    };

    // Remove chip
    const handleRemoveChip = (chip: string) => {
        setChips(chips.filter(c => c !== chip));
        setIsGlobal(false);
        setDisplayData(instanceData);
    };

    // Clear all
    const handleClear = () => {
        setInput("");
        setChips([]);
        setIsGlobal(false);
        setDisplayData(instanceData);
    };

    // When typing in input, switch to local
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value);
        setIsGlobal(false);
    };

    // Only allow global search if input is an IP or single IP chip
    const globalIP = input && isIPv4(input.trim())
        ? input.trim()
        : (chips.length === 1 && isIPv4(chips[0]) ? chips[0] : "");

    // Global search button click
    const handleGlobalSearch = () => {
        if (globalIP) {
            getGlobalInstance(globalIP);
        } else {
            toast.error("Enter a valid IP address for global search.");
        }
    };

    // When chips or input changes, always local search
    useEffect(() => {
        if (isGlobal && !globalIP) {
            setIsGlobal(false);
            setDisplayData(instanceData);
        }
        // eslint-disable-next-line
    }, [chips, input]);

    return (
        <Container>
            {/* Stats Bar */}
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

            {/* SEARCH BAR */}
            <Row className="mt-3">
                <Col>
                    <Box
                        display="flex"
                        alignItems="center"
                        flexWrap="wrap"
                        gap={2}
                        sx={{ p: 2, background: "#fff", borderRadius: 3, boxShadow: "0 1px 3px #e7e7e7" }}
                    >
                        <TextField
                            variant="outlined"
                            size="small"
                            placeholder="Find Instance by attribute or tag (Press Enter, Space, Comma, Tab to add)"
                            value={input}
                            onChange={handleInputChange}
                            onKeyDown={handleInputKeyDown}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon sx={{ color: '#0073bb', mr: 1 }} />
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    input && (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => setInput("")}
                                                size="small"
                                                sx={{ color: '#767676', p: 0.5 }}
                                            >
                                                <ClearIcon fontSize="small" />
                                            </IconButton>
                                        </InputAdornment>
                                    )
                                ),
                                sx: {
                                    borderRadius: 3,
                                    background: "#fff",
                                    color: "#232f3e",
                                    fontSize: "1.08em"
                                }
                            }}
                            sx={{
                                minWidth: 400,
                                width: "50%",
                                background: "#fff",
                                borderRadius: 3,
                            }}
                        />

                        <Button
                            variant="contained"
                            color="primary"
                            style={{
                                backgroundColor: '#1876d2',
                                borderColor: '#1876d2',
                                borderRadius: 8,
                                fontWeight: 500,
                                minWidth: 120
                            }}
                            onClick={handleGlobalSearch}
                            disabled={!globalIP}
                        >
                            Global Search
                        </Button>

                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <DatePicker
                                label="Start Date"
                                value={startDate}
                                onChange={setStartDate}
                                maxDate={new Date()}
                                slotProps={{
                                    textField: {
                                        variant: 'outlined',
                                        size: 'small',
                                        sx: {
                                            minWidth: 150,
                                            background: '#fff',
                                            borderRadius: 2,
                                            "& .MuiOutlinedInput-root": {
                                                borderRadius: 2,
                                                fontSize: '1rem',
                                                color: '#232f3e',
                                                "& fieldset": { borderColor: "#b6bec9" },
                                            },
                                            "& .MuiInputLabel-root": { color: "#767676" },
                                        }
                                    }
                                }}
                            />
                        </LocalizationProvider>

                        {(input || chips.length > 0) && (
                            <Button
                                variant="outline-secondary"
                                onClick={handleClear}
                                style={{ marginLeft: 8 }}
                            >
                                Clear All
                            </Button>
                        )}
                    </Box>
                </Col>
            </Row>

            {/* CHIPS BELOW SEARCH */}
            {chips.length > 0 && (
                <Row>
                    <Col>
                        <Stack direction="row" spacing={1} sx={{ mt: 2, mb: 1, flexWrap: "wrap" }}>
                            {chips.map(chip => (
                                <Chip
                                    key={chip}
                                    label={chip}
                                    onDelete={() => handleRemoveChip(chip)}
                                    color={isIPv4(chip) ? "primary" : "default"}
                                    sx={{ mb: 1 }}
                                />
                            ))}
                        </Stack>
                    </Col>
                </Row>
            )}

            {/* TABLE */}
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

