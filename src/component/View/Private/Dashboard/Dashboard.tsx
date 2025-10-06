import React, { useContext, useEffect, useMemo, useState } from "react";
import { AdminService } from "../../../services/admin.service";
import { LoadingContext, SelectedRegionContext } from "../../../context/context";
import toast from "react-hot-toast";
import { Container } from "react-bootstrap";
import InstanceTable from "../../../Table/Instance.table";
import './Dashboard.css';
import moment from "moment";
import { TextField, InputAdornment, IconButton, Box, Chip, Stack, Button as MuiButton, Paper, Grid, Card, CardContent, Typography, Collapse } from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import CloudQueueIcon from "@mui/icons-material/CloudQueue";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import StopCircleOutlinedIcon from "@mui/icons-material/StopCircleOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ComputerIcon from "@mui/icons-material/Computer";
import PublicIcon from "@mui/icons-material/Public";

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
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
            setIsGlobal(false);
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [chips, input]);

    return (
        <Container fluid className="ec2-dashboard-container">
            {/* Page Header */}
            <Box className="page-header-elegant" sx={{ mb: 3 }}>
                <Box display="flex" alignItems="center" gap={2}>
                    <Box className="page-icon-elegant">
                        <ComputerIcon sx={{ fontSize: 32 }} />
                    </Box>
                    <Box>
                        <Typography variant="h4" className="page-title-elegant">
                            EC2 Instances
                        </Typography>
                        <Typography variant="body2" className="page-subtitle-elegant">
                            Manage and monitor your Amazon EC2 compute instances
                        </Typography>
                    </Box>
                </Box>
            </Box>

            {/* Stats Cards */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                {/* Total Instances */}
                <Grid item xs={12} sm={6} md={3}>
                    <Card className="stat-card-elegant" elevation={0}>
                        <CardContent sx={{ p: 2.5 }}>
                            <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                                <Box>
                                    <Typography variant="caption" className="stat-label-elegant">
                                        Total Instances
                                    </Typography>
                                    <Typography variant="h4" className="stat-value-elegant">
                                        {totalCount}
                                    </Typography>
                                </Box>
                                <Box className="stat-icon-elegant">
                                    <CloudQueueIcon />
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Running */}
                <Grid item xs={12} sm={6} md={3}>
                    <Card className="stat-card-elegant stat-card-success" elevation={0}>
                        <CardContent sx={{ p: 2.5 }}>
                            <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                                <Box>
                                    <Typography variant="caption" className="stat-label-elegant stat-label-white">
                                        Running
                                    </Typography>
                                    <Typography variant="h4" className="stat-value-elegant stat-value-white">
                                        {runningCount}
                                    </Typography>
                                </Box>
                                <Box className="stat-icon-elegant stat-icon-white">
                                    <PlayCircleOutlineIcon />
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Stopped */}
                <Grid item xs={12} sm={6} md={3}>
                    <Card className="stat-card-elegant stat-card-danger" elevation={0}>
                        <CardContent sx={{ p: 2.5 }}>
                            <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                                <Box>
                                    <Typography variant="caption" className="stat-label-elegant stat-label-white">
                                        Stopped
                                    </Typography>
                                    <Typography variant="h4" className="stat-value-elegant stat-value-white">
                                        {stoppedCount}
                                    </Typography>
                                </Box>
                                <Box className="stat-icon-elegant stat-icon-white">
                                    <StopCircleOutlinedIcon />
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Filtered Results */}
                <Grid item xs={12} sm={6} md={3}>
                    <Card className="stat-card-elegant" elevation={0}>
                        <CardContent sx={{ p: 2.5 }}>
                            <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                                <Box>
                                    <Typography variant="caption" className="stat-label-elegant">
                                        Filtered Results
                                    </Typography>
                                    <Typography variant="h4" className="stat-value-elegant">
                                        {filteredInstanceData.length}
                                    </Typography>
                                </Box>
                                <Box className="stat-icon-elegant">
                                    <SearchIcon />
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Operating System Stats */}
            {Object.keys(osCountMap).length > 0 && (
                <Paper className="os-stats-paper" elevation={0} sx={{ mb: 3, p: 2.5 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="subtitle1" fontWeight={600} color="text.primary">
                            Operating System Distribution
                        </Typography>
                        {Object.keys(osCountMap).length > 4 && (
                            <MuiButton
                                size="small"
                                onClick={() => setShowAllStats(!showAllStats)}
                                endIcon={showAllStats ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                sx={{ textTransform: 'none', color: '#0073bb' }}
                            >
                                {showAllStats ? 'Show Less' : 'Show All'}
                            </MuiButton>
                        )}
                    </Box>
                    <Box display="flex" gap={2} flexWrap="wrap">
                        {Object.keys(osCountMap).slice(0, 4).map((os, index) => (
                            <Chip
                                key={index}
                                label={`${os}: ${osCountMap[os]}`}
                                className="os-chip"
                                sx={{
                                    bgcolor: '#f1f6fb',
                                    color: '#232f3e',
                                    fontWeight: 500,
                                    '&:hover': { bgcolor: '#e3eef7' }
                                }}
                            />
                        ))}
                    </Box>
                    <Collapse in={showAllStats}>
                        <Box display="flex" gap={2} flexWrap="wrap" mt={2}>
                            {Object.keys(osCountMap).slice(4).map((os, index) => (
                                <Chip
                                    key={index}
                                    label={`${os}: ${osCountMap[os]}`}
                                    className="os-chip"
                                    sx={{
                                        bgcolor: '#f1f6fb',
                                        color: '#232f3e',
                                        fontWeight: 500,
                                        '&:hover': { bgcolor: '#e3eef7' }
                                    }}
                                />
                            ))}
                        </Box>
                    </Collapse>
                </Paper>
            )}

            {/* Search & Filters */}
            <Paper className="search-paper-elegant" elevation={0} sx={{ mb: 3, p: 3 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            variant="outlined"
                            size="small"
                            placeholder="Search by instance name, ID, IP, tags... (Press Enter/Space/Comma/Tab to add filter)"
                            value={input}
                            onChange={handleInputChange}
                            onKeyDown={handleInputKeyDown}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon sx={{ color: '#0073bb' }} />
                                    </InputAdornment>
                                ),
                                endAdornment: input && (
                                    <InputAdornment position="end">
                                        <IconButton onClick={() => setInput("")} size="small">
                                            <ClearIcon fontSize="small" />
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '10px',
                                    bgcolor: '#ffffff',
                                    '&:hover fieldset': {
                                        borderColor: '#0073bb',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: '#0073bb',
                                        borderWidth: '2px',
                                    }
                                }
                            }}
                        />
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <DatePicker
                                label="Select Date"
                                value={startDate}
                                onChange={setStartDate}
                                maxDate={new Date()}
                                slotProps={{
                                    textField: {
                                        fullWidth: true,
                                        size: 'small',
                                        sx: {
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: '10px',
                                                bgcolor: '#ffffff',
                                            }
                                        }
                                    }
                                }}
                            />
                        </LocalizationProvider>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <Box display="flex" gap={1}>
                            <MuiButton
                                fullWidth
                                variant="contained"
                                disabled={!globalIP}
                                onClick={handleGlobalSearch}
                                startIcon={<PublicIcon />}
                                sx={{
                                    borderRadius: '10px',
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    py: 0.75,
                                    background: 'linear-gradient(135deg, #0073bb 0%, #1a8cd8 100%)',
                                    boxShadow: '0 2px 8px rgba(0, 115, 187, 0.3)',
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #005a92 0%, #0073bb 100%)',
                                        boxShadow: '0 4px 12px rgba(0, 115, 187, 0.4)',
                                    },
                                    '&:disabled': {
                                        background: '#e0e0e0',
                                    }
                                }}
                            >
                                Global Search
                            </MuiButton>
                            {(input || chips.length > 0) && (
                                <MuiButton
                                    variant="outlined"
                                    onClick={handleClear}
                                    sx={{
                                        borderRadius: '10px',
                                        textTransform: 'none',
                                        borderColor: '#dc3545',
                                        color: '#dc3545',
                                        '&:hover': {
                                            borderColor: '#c82333',
                                            bgcolor: '#fff5f5',
                                        }
                                    }}
                                >
                                    Clear
                                </MuiButton>
                            )}
                        </Box>
                    </Grid>
                </Grid>

                {/* Filter Chips */}
                {chips.length > 0 && (
                    <Box mt={2}>
                        <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                            Active Filters:
                        </Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                            {chips.map(chip => (
                                <Chip
                                    key={chip}
                                    label={chip}
                                    onDelete={() => handleRemoveChip(chip)}
                                    color={isIPv4(chip) ? "primary" : "default"}
                                    sx={{
                                        mb: 1,
                                        borderRadius: '8px',
                                        fontWeight: 500,
                                        ...(isIPv4(chip) && {
                                            background: 'linear-gradient(135deg, #0073bb 0%, #1a8cd8 100%)',
                                        })
                                    }}
                                />
                            ))}
                        </Stack>
                    </Box>
                )}
            </Paper>

            {/* Table */}
            <Box>
                <InstanceTable
                    tableData={filteredInstanceData}
                    loading={loading}
                    fetchData={getAllInstance}
                />
            </Box>
        </Container>
    );
}
