import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Paper,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  CircularProgress,
  Alert,
  Chip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
  Card,
  CardContent,
  alpha,
  IconButton,
  Tooltip
} from '@mui/material';
import Navbar from '../components/Navbar';
import { attendanceAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { onAttendanceUpdate } from '../utils/attendanceEvents';
import {
  CalendarToday,
  AccessTime,
  CheckCircle,
  FlightTakeoff,
  Cancel,
  Today,
  DateRange,
  BarChart,
  Download,
  FilterList
} from '@mui/icons-material';

function Attendance() {
  const [myAttendance, setMyAttendance] = useState([]);
  const [allAttendance, setAllAttendance] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [tabValue, setTabValue] = useState(0);
  const { isAdminOrHR } = useAuth();

  useEffect(() => {
    if (isAdminOrHR && tabValue === 0) {
      fetchDayWiseAttendance();
    } else {
      fetchMyAttendance();
      fetchSummary();
    }
  }, [selectedDate, selectedMonth, selectedYear, tabValue]);

  // Listen for global attendance updates
  useEffect(() => {
    const cleanup = onAttendanceUpdate(() => {
      if (isAdminOrHR && tabValue === 0) {
        fetchDayWiseAttendance();
      } else {
        fetchMyAttendance();
        fetchSummary();
      }
    });
    return cleanup;
  }, [isAdminOrHR, tabValue]);

  const fetchDayWiseAttendance = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await attendanceAPI.getAll({ date: selectedDate });
      setAllAttendance(response.data);
    } catch (err) {
      setError('Failed to load attendance data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchMyAttendance = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await attendanceAPI.getMyAttendance({
        month: selectedMonth,
        year: selectedYear
      });
      setMyAttendance(response.data);
    } catch (err) {
      setError('Failed to load attendance records.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await attendanceAPI.getSummary(null, {
        month: selectedMonth,
        year: selectedYear
      });
      setSummary(response.data);
    } catch (err) {
      console.log('Failed to load summary');
    }
  };

  const formatTime = (dateTime) => {
    if (!dateTime) return '-';
    return new Date(dateTime).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { 
      year: 'numeric',
      month: 'short',
      day: 'numeric' 
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Present': return <CheckCircle sx={{ color: '#ffffff', fontSize: 16 }} />;
      case 'OnLeave': return <FlightTakeoff sx={{ color: '#ffffff', fontSize: 16 }} />;
      case 'Absent': return <Cancel sx={{ color: '#ffffff', fontSize: 16 }} />;
      default: return <AccessTime sx={{ color: '#ffffff', fontSize: 16 }} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Present': return { bg: '#2e7d32', color: '#ffffff' };
      case 'OnLeave': return { bg: '#f57c00', color: '#ffffff' };
      case 'Absent': return { bg: '#d32f2f', color: '#ffffff' };
      default: return { bg: '#616161', color: '#ffffff' };
    }
  };

  const handleExport = () => {
    // Export functionality placeholder
    console.log('Export attendance data');
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8f9fa' }}>
      <Navbar />
      
      <Container maxWidth="xl" sx={{ py: 4, px: { xs: 2, sm: 3 } }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h4" fontWeight="600" color="#2c3e50">
              Attendance Management
            </Typography>
            {isAdminOrHR && tabValue === 0 && (
              <Tooltip title="Export Attendance">
                <IconButton
                  onClick={handleExport}
                  sx={{
                    backgroundColor: '#714B67',
                    color: '#ffffff',
                    '&:hover': {
                      backgroundColor: '#5d3d54'
                    }
                  }}
                >
                  <Download />
                </IconButton>
              </Tooltip>
            )}
          </Box>
          <Typography variant="body1" color="#666666">
            Track and manage attendance records for yourself and your team
          </Typography>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3, 
              borderRadius: '8px',
              border: '1px solid #f5c6cb'
            }}
          >
            {error}
          </Alert>
        )}

        {/* Tabs for Admin/HR */}
        {isAdminOrHR && (
          <Paper 
            sx={{ 
              mb: 3, 
              borderRadius: '12px',
              border: '1px solid #e0e0e0',
              overflow: 'hidden'
            }}
          >
            <Tabs 
              value={tabValue} 
              onChange={(e, v) => setTabValue(v)}
              sx={{
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontSize: '15px',
                  fontWeight: 500,
                  minHeight: '52px',
                  color: '#666666',
                  '&.Mui-selected': {
                    color: '#714B67',
                    fontWeight: 600
                  }
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: '#714B67',
                  height: '3px'
                }
              }}
            >
              <Tab 
                icon={<BarChart sx={{ mr: 1 }} />} 
                iconPosition="start" 
                label="Team Attendance" 
              />
              <Tab 
                icon={<CalendarToday sx={{ mr: 1 }} />} 
                iconPosition="start" 
                label="My Attendance" 
              />
            </Tabs>
          </Paper>
        )}

        {/* Admin/HR Day-wise View */}
        {isAdminOrHR && tabValue === 0 ? (
          <>
            {/* Date Selection */}
            <Paper sx={{ 
              p: 3, 
              mb: 3, 
              borderRadius: '12px',
              border: '1px solid #e0e0e0'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <DateRange sx={{ mr: 1.5, color: '#714B67' }} />
                <Typography variant="h6" fontWeight="600" color="#2c3e50">
                  Select Date
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <TextField
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px',
                      '&.Mui-focused fieldset': {
                        borderColor: '#714B67',
                        borderWidth: '2px'
                      }
                    }
                  }}
                />
                <Chip
                  icon={<Today />}
                  label="Today"
                  onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
                  sx={{
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: alpha('#714B67', 0.1)
                    }
                  }}
                />
              </Box>
            </Paper>

            {/* Attendance Table */}
            <Paper sx={{ 
              p: 3, 
              borderRadius: '12px',
              border: '1px solid #e0e0e0'
            }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CalendarToday sx={{ mr: 1.5, color: '#714B67' }} />
                  <Typography variant="h6" fontWeight="600" color="#2c3e50">
                    Attendance for {formatDate(selectedDate)}
                  </Typography>
                </Box>
                <Chip 
                  label={`${allAttendance.length} Employees`}
                  sx={{ backgroundColor: alpha('#714B67', 0.1), color: '#714B67', fontWeight: 500 }}
                />
              </Box>
              
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
                  <CircularProgress size={50} sx={{ color: '#714B67' }} />
                </Box>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                        <TableCell sx={{ fontWeight: 600, color: '#2c3e50', py: 2 }}>Employee</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#2c3e50', py: 2 }}>Check-In</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#2c3e50', py: 2 }}>Check-Out</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#2c3e50', py: 2 }}>Work Hours</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#2c3e50', py: 2 }}>Extra Hours</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#2c3e50', py: 2 }}>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {allAttendance.map((record) => {
                        const statusColor = getStatusColor(record.status);
                        return (
                          <TableRow 
                            key={record._id} 
                            hover
                            sx={{ 
                              '&:hover': {
                                backgroundColor: alpha('#714B67', 0.02)
                              }
                            }}
                          >
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Box sx={{ 
                                  width: 32, 
                                  height: 32, 
                                  borderRadius: '50%', 
                                  backgroundColor: alpha('#714B67', 0.1),
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  mr: 2,
                                  fontWeight: 600,
                                  color: '#714B67',
                                  fontSize: '14px'
                                }}>
                                  {record.employee?.firstName?.charAt(0)}
                                </Box>
                                <Box>
                                  <Typography variant="body2" fontWeight="500" color="#2c3e50">
                                    {record.employee?.firstName} {record.employee?.lastName}
                                  </Typography>
                                  <Typography variant="caption" color="#666666">
                                    {record.employee?.position || 'Employee'}
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <AccessTime sx={{ fontSize: 16, color: '#666666', mr: 1 }} />
                                {formatTime(record.checkInTime)}
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <AccessTime sx={{ fontSize: 16, color: '#666666', mr: 1 }} />
                                {formatTime(record.checkOutTime)}
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" fontWeight="500" color="#2c3e50">
                                {record.workHours?.toFixed(2) || '0.00'} hrs
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" fontWeight="500" color={record.extraHours > 0 ? '#ff9800' : '#666666'}>
                                {record.extraHours?.toFixed(2) || '0.00'} hrs
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Box
                                sx={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 0.75,
                                  backgroundColor: statusColor.bg,
                                  color: statusColor.color,
                                  fontWeight: 600,
                                  px: 2,
                                  py: 0.75,
                                  borderRadius: '6px',
                                  fontSize: '13px'
                                }}
                              >
                                {getStatusIcon(record.status)}
                                {record.status}
                              </Box>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              {!loading && allAttendance.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <CalendarToday sx={{ fontSize: 48, color: '#e0e0e0', mb: 2 }} />
                  <Typography variant="body1" color="#999999">
                    No attendance records found for this date
                  </Typography>
                  <Typography variant="body2" color="#999999" sx={{ mt: 1 }}>
                    Select a different date to view attendance records
                  </Typography>
                </Box>
              )}
            </Paper>
          </>
        ) : (
          /* Employee Month-wise View */
          <>
            {/* Monthly Summary Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={8}>
                <Paper sx={{ 
                  p: 3, 
                  borderRadius: '12px',
                  border: '1px solid #e0e0e0',
                  height: '100%'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <BarChart sx={{ mr: 1.5, color: '#714B67' }} />
                    <Typography variant="h6" fontWeight="600" color="#2c3e50">
                      Monthly Summary
                    </Typography>
                  </Box>
                  
                  {summary ? (
                    <Grid container spacing={2}>
                      {[
                        { 
                          label: 'Total Days', 
                          value: summary.totalDays, 
                          color: '#714B67', 
                          icon: <CalendarToday />,
                          description: 'Working days in month'
                        },
                        { 
                          label: 'Present', 
                          value: summary.presentDays, 
                          color: '#4caf50', 
                          icon: <CheckCircle />,
                          description: 'Days attended'
                        },
                        { 
                          label: 'Absent', 
                          value: summary.absentDays, 
                          color: '#f44336', 
                          icon: <Cancel />,
                          description: 'Days absent'
                        },
                        { 
                          label: 'On Leave', 
                          value: summary.leaveDays, 
                          color: '#2196f3', 
                          icon: <FlightTakeoff />,
                          description: 'Leave days'
                        },
                        { 
                          label: 'Work Hours', 
                          value: summary.totalWorkHours?.toFixed(1), 
                          color: '#ff9800', 
                          icon: <AccessTime />,
                          description: 'Total hours worked'
                        },
                        { 
                          label: 'Extra Hours', 
                          value: summary.totalExtraHours?.toFixed(1), 
                          color: '#9c27b0', 
                          icon: <AccessTime />,
                          description: 'Overtime hours'
                        }
                      ].map((item, index) => (
                        <Grid item xs={6} sm={4} key={index}>
                          <Card 
                            sx={{ 
                              borderRadius: '8px',
                              backgroundColor: alpha(item.color, 0.05),
                              border: `1px solid ${alpha(item.color, 0.2)}`,
                              height: '100%'
                            }}
                          >
                            <CardContent sx={{ p: 2, textAlign: 'center' }}>
                              <Box sx={{ 
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 40,
                                height: 40,
                                backgroundColor: alpha(item.color, 0.1),
                                borderRadius: '8px',
                                mb: 1
                              }}>
                                {React.cloneElement(item.icon, { sx: { color: item.color, fontSize: 24 } })}
                              </Box>
                              <Typography variant="h4" fontWeight="700" color={item.color} gutterBottom>
                                {item.value}
                              </Typography>
                              <Typography variant="body2" color="#666666" fontWeight="500" sx={{ mb: 0.5 }}>
                                {item.label}
                              </Typography>
                              <Typography variant="caption" color="#999999">
                                {item.description}
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  ) : (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                      <CircularProgress size={40} sx={{ color: '#714B67' }} />
                    </Box>
                  )}
                </Paper>
              </Grid>

              {/* Filter Section */}
              <Grid item xs={12} md={4}>
                <Paper sx={{ 
                  p: 3, 
                  borderRadius: '12px',
                  border: '1px solid #e0e0e0',
                  height: '100%'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <FilterList sx={{ mr: 1.5, color: '#714B67' }} />
                    <Typography variant="h6" fontWeight="600" color="#2c3e50">
                      Filter Records
                    </Typography>
                  </Box>
                  
                  <FormControl fullWidth sx={{ mb: 3 }}>
                    <InputLabel>Month</InputLabel>
                    <Select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      label="Month"
                      sx={{
                        borderRadius: '8px',
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#714B67',
                          borderWidth: '2px'
                        }
                      }}
                    >
                      {[...Array(12)].map((_, i) => (
                        <MenuItem key={i} value={i + 1}>
                          {new Date(2000, i).toLocaleString('default', { month: 'long' })}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl fullWidth>
                    <InputLabel>Year</InputLabel>
                    <Select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(e.target.value)}
                      label="Year"
                      sx={{
                        borderRadius: '8px',
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#714B67',
                          borderWidth: '2px'
                        }
                      }}
                    >
                      {[2023, 2024, 2025, 2026].map((year) => (
                        <MenuItem key={year} value={year}>
                          {year}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Paper>
              </Grid>
            </Grid>

            {/* My Attendance Table */}
            <Paper sx={{ 
              p: 3, 
              borderRadius: '12px',
              border: '1px solid #e0e0e0'
            }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CalendarToday sx={{ mr: 1.5, color: '#714B67' }} />
                  <Box>
                    <Typography variant="h6" fontWeight="600" color="#2c3e50">
                      My Attendance Records
                    </Typography>
                    <Typography variant="body2" color="#666666">
                      {new Date(selectedYear, selectedMonth - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </Typography>
                  </Box>
                </Box>
                <Chip 
                  label={`${myAttendance.length} Records`}
                  sx={{ backgroundColor: alpha('#714B67', 0.1), color: '#714B67', fontWeight: 500 }}
                />
              </Box>
              
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
                  <CircularProgress size={50} sx={{ color: '#714B67' }} />
                </Box>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                        <TableCell sx={{ fontWeight: 600, color: '#2c3e50', py: 2 }}>Date</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#2c3e50', py: 2 }}>Day</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#2c3e50', py: 2 }}>Check-In</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#2c3e50', py: 2 }}>Check-Out</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#2c3e50', py: 2 }}>Work Hours</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#2c3e50', py: 2 }}>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {myAttendance.map((record) => {
                        const statusColor = getStatusColor(record.status);
                        const dayName = new Date(record.date).toLocaleDateString('en-US', { weekday: 'short' });
                        return (
                          <TableRow 
                            key={record._id} 
                            hover
                            sx={{ 
                              '&:hover': {
                                backgroundColor: alpha('#714B67', 0.02)
                              }
                            }}
                          >
                            <TableCell>
                              <Typography variant="body2" fontWeight="500" color="#2c3e50">
                                {formatDate(record.date)}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={dayName}
                                size="small"
                                sx={{
                                  backgroundColor: alpha('#666666', 0.1),
                                  color: '#666666',
                                  fontWeight: 500
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <AccessTime sx={{ fontSize: 16, color: '#666666', mr: 1 }} />
                                {formatTime(record.checkInTime)}
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <AccessTime sx={{ fontSize: 16, color: '#666666', mr: 1 }} />
                                {formatTime(record.checkOutTime)}
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" fontWeight="500" color="#2c3e50">
                                {record.workHours?.toFixed(2) || '0.00'} hrs
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Box
                                sx={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 0.75,
                                  backgroundColor: statusColor.bg,
                                  color: statusColor.color,
                                  fontWeight: 600,
                                  px: 2,
                                  py: 0.75,
                                  borderRadius: '6px',
                                  fontSize: '13px'
                                }}
                              >
                                {getStatusIcon(record.status)}
                                {record.status}
                              </Box>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              {!loading && myAttendance.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <CalendarToday sx={{ fontSize: 48, color: '#e0e0e0', mb: 2 }} />
                  <Typography variant="body1" color="#999999">
                    No attendance records found for this period
                  </Typography>
                  <Typography variant="body2" color="#999999" sx={{ mt: 1 }}>
                    Select a different month to view your attendance records
                  </Typography>
                </Box>
              )}
            </Paper>
          </>
        )}
      </Container>
    </Box>
  );
}

export default Attendance;
