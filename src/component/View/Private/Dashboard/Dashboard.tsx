
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

