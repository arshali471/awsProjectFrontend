// @ts-nocheck
import React, { useContext, useEffect, useMemo, useState } from "react";
import { AdminService } from "../../../services/admin.service";
import { LoadingContext, SelectedRegionContext } from "../../../context/context";
import toast from "react-hot-toast";
import { Container } from "react-bootstrap";
import InstanceTable from "../../../Table/Instance.table";
import './Dashboard.css';
import moment from "moment";
import { TextField, InputAdornment, IconButton, Box, Chip, Stack, Button as MuiButton, Paper, Grid, Card, CardContent, Typography, Collapse, Select, MenuItem, FormControl } from "@mui/material";
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
    const [statusFilter, setStatusFilter] = useState<string>("all"); // all, running, stopped

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

    // Local multi-chip filter (all chips must match in row, AND) + status filter
    const filteredInstanceData = useMemo(() => {
        let data = isGlobal ? displayData : instanceData;

        // Apply chip filters
        if (chips.length > 0 && !isGlobal) {
            const flatten = (obj: any): string[] =>
                Object.values(obj).flatMap(val => {
                    if (val == null) return [];
                    if (Array.isArray(val)) return val.map(flatten).flat();
                    if (typeof val === "object") return flatten(val);
                    return String(val);
                });
            data = data.filter((item: any) => {
                const values = flatten(item).join(" ").toLowerCase();
                return chips.every(term => values.includes(term.toLowerCase()));
            });
        }

        // Apply status filter
        if (statusFilter !== "all") {
            data = data.filter((item: any) => item?.State?.Name === statusFilter);
        }

        return data;
    }, [instanceData, chips, isGlobal, displayData, statusFilter]);

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

            {/* Stats Cards - Improved Design */}
            <Grid container spacing={2.5} sx={{ mb: 4 }}>
                {/* Total Instances */}
                <Grid item xs={12} sm={6} md={3}>
                    <Card
                        elevation={0}
                        sx={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            height: '120px',
                            '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: '0 12px 24px rgba(102, 126, 234, 0.3)',
                            },
                            transition: 'all 0.3s ease',
                        }}
                    >
                        <CardContent sx={{ p: 2.5, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <Box display="flex" alignItems="center" gap={1.5}>
                                <Box
                                    sx={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: '8px',
                                        background: 'rgba(255, 255, 255, 0.2)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <CloudQueueIcon sx={{ fontSize: 22, color: '#ffffff' }} />
                                </Box>
                                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '12px', fontWeight: 500 }}>
                                    TOTAL INSTANCES
                                </Typography>
                            </Box>
                            <Box display="flex" justifyContent="center">
                                <Typography variant="h3" sx={{ color: '#ffffff', fontWeight: 700, fontSize: '36px', lineHeight: 1 }}>
                                    {totalCount}
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Running */}
                <Grid item xs={12} sm={6} md={3}>
                    <Card
                        elevation={0}
                        sx={{
                            background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            height: '120px',
                            '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: '0 12px 24px rgba(17, 153, 142, 0.3)',
                            },
                            transition: 'all 0.3s ease',
                        }}
                    >
                        <CardContent sx={{ p: 2.5, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <Box display="flex" alignItems="center" gap={1.5}>
                                <Box
                                    sx={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: '8px',
                                        background: 'rgba(255, 255, 255, 0.2)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <PlayCircleOutlineIcon sx={{ fontSize: 22, color: '#ffffff' }} />
                                </Box>
                                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '12px', fontWeight: 500 }}>
                                    RUNNING
                                </Typography>
                            </Box>
                            <Box display="flex" justifyContent="center">
                                <Typography variant="h3" sx={{ color: '#ffffff', fontWeight: 700, fontSize: '36px', lineHeight: 1 }}>
                                    {runningCount}
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Stopped */}
                <Grid item xs={12} sm={6} md={3}>
                    <Card
                        elevation={0}
                        sx={{
                            background: 'linear-gradient(135deg, #ee0979 0%, #ff6a00 100%)',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            height: '120px',
                            '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: '0 12px 24px rgba(238, 9, 121, 0.3)',
                            },
                            transition: 'all 0.3s ease',
                        }}
                    >
                        <CardContent sx={{ p: 2.5, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <Box display="flex" alignItems="center" gap={1.5}>
                                <Box
                                    sx={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: '8px',
                                        background: 'rgba(255, 255, 255, 0.2)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <StopCircleOutlinedIcon sx={{ fontSize: 22, color: '#ffffff' }} />
                                </Box>
                                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '12px', fontWeight: 500 }}>
                                    STOPPED
                                </Typography>
                            </Box>
                            <Box display="flex" justifyContent="center">
                                <Typography variant="h3" sx={{ color: '#ffffff', fontWeight: 700, fontSize: '36px', lineHeight: 1 }}>
                                    {stoppedCount}
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Filtered Results */}
                <Grid item xs={12} sm={6} md={3}>
                    <Card
                        elevation={0}
                        sx={{
                            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            height: '120px',
                            '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: '0 12px 24px rgba(79, 172, 254, 0.3)',
                            },
                            transition: 'all 0.3s ease',
                        }}
                    >
                        <CardContent sx={{ p: 2.5, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <Box display="flex" alignItems="center" gap={1.5}>
                                <Box
                                    sx={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: '8px',
                                        background: 'rgba(255, 255, 255, 0.2)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <SearchIcon sx={{ fontSize: 22, color: '#ffffff' }} />
                                </Box>
                                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '12px', fontWeight: 500 }}>
                                    FILTERED RESULTS
                                </Typography>
                            </Box>
                            <Box display="flex" justifyContent="center">
                                <Typography variant="h3" sx={{ color: '#ffffff', fontWeight: 700, fontSize: '36px', lineHeight: 1 }}>
                                    {filteredInstanceData.length}
                                </Typography>
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

            {/* Search & Filters - Elegant Design */}
            <Paper
                className="search-paper-elegant"
                elevation={0}
                sx={{
                    mb: 3,
                    p: 3,
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                    border: '1px solid #e9ecef',
                    borderRadius: '16px',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
                }}
            >
                <Grid container spacing={2.5}>
                    {/* Search Bar Row - Wider */}
                    <Grid item xs={12} md={8}>
                        <TextField
                            fullWidth
                            variant="outlined"
                            placeholder="Search by instance name, ID, IP, tags... (Press Enter/Space/Comma/Tab to add filter)"
                            value={input}
                            onChange={handleInputChange}
                            onKeyDown={handleInputKeyDown}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon sx={{ color: '#0073bb', fontSize: '26px' }} />
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
                                    borderRadius: '12px',
                                    bgcolor: '#ffffff',
                                    height: '56px',
                                    fontSize: '15px',
                                    border: '2px solid #e9ecef',
                                    paddingLeft: '16px',
                                    paddingRight: '16px',
                                    '& input': {
                                        color: '#000000',
                                        WebkitTextFillColor: '#000000',
                                        padding: '0',
                                    },
                                    '& .MuiInputAdornment-root': {
                                        marginRight: '8px',
                                    },
                                    '& fieldset': {
                                        border: 'none',
                                    },
                                    '&:hover': {
                                        borderColor: '#0073bb',
                                        boxShadow: '0 0 0 3px rgba(0, 115, 187, 0.1)',
                                    },
                                    '&.Mui-focused': {
                                        borderColor: '#0073bb',
                                        boxShadow: '0 0 0 4px rgba(0, 115, 187, 0.2)',
                                    }
                                }
                            }}
                        />
                    </Grid>

                    {/* Status Dropdown */}
                    <Grid item xs={12} sm={6} md={2}>
                        <Box
                            sx={{
                                width: '100%',
                                borderRadius: '12px',
                                bgcolor: '#ffffff',
                                height: '56px',
                                border: '2px solid #e9ecef',
                                display: 'flex',
                                alignItems: 'center',
                                px: 2,
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    borderColor: '#0073bb',
                                    boxShadow: '0 0 0 3px rgba(0, 115, 187, 0.1)',
                                },
                            }}
                        >
                            <Select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                displayEmpty
                                variant="standard"
                                disableUnderline
                                renderValue={(value) => {
                                    if (value === 'all') {
                                        return (
                                            <Box display="flex" alignItems="center" gap={1.5}>
                                                <ComputerIcon sx={{ fontSize: '20px', color: '#0073bb' }} />
                                                <Typography sx={{ fontSize: '15px', fontWeight: 500, color: '#000000' }}>All Instances</Typography>
                                            </Box>
                                        );
                                    }
                                    if (value === 'running') {
                                        return (
                                            <Box display="flex" alignItems="center" gap={1.5}>
                                                <PlayCircleOutlineIcon sx={{ fontSize: '20px', color: '#28a745' }} />
                                                <Typography sx={{ fontSize: '15px', fontWeight: 500, color: '#000000' }}>Running</Typography>
                                            </Box>
                                        );
                                    }
                                    if (value === 'stopped') {
                                        return (
                                            <Box display="flex" alignItems="center" gap={1.5}>
                                                <StopCircleOutlinedIcon sx={{ fontSize: '20px', color: '#dc3545' }} />
                                                <Typography sx={{ fontSize: '15px', fontWeight: 500, color: '#000000' }}>Stopped</Typography>
                                            </Box>
                                        );
                                    }
                                    return null;
                                }}
                                sx={{
                                    width: '100%',
                                    color: '#000000',
                                    '& .MuiSelect-select': {
                                        padding: 0,
                                        paddingRight: '32px !important',
                                        display: 'flex',
                                        alignItems: 'center',
                                        '&:focus': {
                                            backgroundColor: 'transparent',
                                        }
                                    },
                                    '& .MuiSelect-icon': {
                                        color: '#6c757d',
                                        right: 0,
                                    }
                                }}
                                MenuProps={{
                                    PaperProps: {
                                        sx: {
                                            bgcolor: '#ffffff',
                                            border: '1px solid #e9ecef',
                                            borderRadius: '12px',
                                            mt: 1,
                                            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
                                            '& .MuiList-root': {
                                                padding: '8px',
                                            },
                                            '& .MuiMenuItem-root': {
                                                color: '#000000',
                                                fontSize: '15px',
                                                padding: '12px 16px',
                                                borderRadius: '8px',
                                                '&:hover': {
                                                    bgcolor: 'rgba(0, 115, 187, 0.1)',
                                                },
                                                '&.Mui-selected': {
                                                    bgcolor: 'rgba(0, 115, 187, 0.15)',
                                                    '&:hover': {
                                                        bgcolor: 'rgba(0, 115, 187, 0.2)',
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }}
                            >
                                <MenuItem value="all">
                                    <Box display="flex" alignItems="center" gap={1.5}>
                                        <ComputerIcon sx={{ fontSize: '20px', color: '#0073bb' }} />
                                        <Typography sx={{ fontSize: '15px' }}>All Instances</Typography>
                                    </Box>
                                </MenuItem>
                                <MenuItem value="running">
                                    <Box display="flex" alignItems="center" gap={1.5}>
                                        <PlayCircleOutlineIcon sx={{ fontSize: '20px', color: '#28a745' }} />
                                        <Typography sx={{ fontSize: '15px' }}>Running</Typography>
                                    </Box>
                                </MenuItem>
                                <MenuItem value="stopped">
                                    <Box display="flex" alignItems="center" gap={1.5}>
                                        <StopCircleOutlinedIcon sx={{ fontSize: '20px', color: '#dc3545' }} />
                                        <Typography sx={{ fontSize: '15px' }}>Stopped</Typography>
                                    </Box>
                                </MenuItem>
                            </Select>
                        </Box>
                    </Grid>

                    {/* Date Picker */}
                    <Grid item xs={12} sm={6} md={2}>
                        <input
                            type="date"
                            value={startDate ? moment(startDate).format('YYYY-MM-DD') : ''}
                            onChange={(e) => setStartDate(e.target.value ? new Date(e.target.value) : null)}
                            max={moment(new Date()).format('YYYY-MM-DD')}
                            style={{
                                width: '100%',
                                height: '56px',
                                padding: '14px 16px',
                                borderRadius: '12px',
                                border: '2px solid #e9ecef',
                                background: '#ffffff',
                                color: '#000000',
                                fontSize: '15px',
                                fontFamily: 'inherit',
                                outline: 'none',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = '#0073bb';
                                e.target.style.boxShadow = '0 0 0 4px rgba(0, 115, 187, 0.2)';
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = '#e9ecef';
                                e.target.style.boxShadow = 'none';
                            }}
                            onMouseEnter={(e) => {
                                if (document.activeElement !== e.target) {
                                    e.target.style.borderColor = '#0073bb';
                                    e.target.style.boxShadow = '0 0 0 3px rgba(0, 115, 187, 0.1)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (document.activeElement !== e.target) {
                                    e.target.style.borderColor = '#e9ecef';
                                    e.target.style.boxShadow = 'none';
                                }
                            }}
                        />
                    </Grid>

                    {/* Global Search Button */}
                    <Grid item xs={12}>
                        <Box display="flex" gap={2} alignItems="center">
                            <MuiButton
                                variant="contained"
                                disabled={!globalIP}
                                onClick={handleGlobalSearch}
                                startIcon={<PublicIcon />}
                                sx={{
                                    borderRadius: '12px',
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    px: 3,
                                    py: 1.5,
                                    fontSize: '15px',
                                    background: 'linear-gradient(135deg, #0073bb 0%, #1a8cd8 100%)',
                                    boxShadow: '0 4px 12px rgba(0, 115, 187, 0.3)',
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #005a92 0%, #0073bb 100%)',
                                        boxShadow: '0 6px 16px rgba(0, 115, 187, 0.4)',
                                        transform: 'translateY(-2px)',
                                    },
                                    '&:disabled': {
                                        background: '#e0e0e0',
                                        color: '#adb5bd',
                                    },
                                    transition: 'all 0.3s ease',
                                }}
                            >
                                Global Search by IP
                            </MuiButton>

                            {(input || chips.length > 0 || statusFilter !== "all") && (
                                <MuiButton
                                    variant="outlined"
                                    onClick={() => {
                                        setInput("");
                                        setChips([]);
                                        setStatusFilter("all");
                                        setIsGlobal(false);
                                        setDisplayData(instanceData);
                                    }}
                                    sx={{
                                        borderRadius: '12px',
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        px: 3,
                                        py: 1.5,
                                        fontSize: '15px',
                                        borderColor: '#dc3545',
                                        color: '#dc3545',
                                        borderWidth: '2px',
                                        '&:hover': {
                                            borderColor: '#c82333',
                                            borderWidth: '2px',
                                            bgcolor: '#fff5f5',
                                            transform: 'translateY(-2px)',
                                            boxShadow: '0 4px 12px rgba(220, 53, 69, 0.3)',
                                        },
                                        transition: 'all 0.3s ease',
                                    }}
                                >
                                    Clear All Filters
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
