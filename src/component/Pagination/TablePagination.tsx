import { Box, Typography, MenuItem, Select as MuiSelect, Pagination as MuiPagination } from "@mui/material";

interface ITablePagination {
  total: number;
  currentPage: number;
  perPage: number;
  handlePageChange: any;
  setPerPage: any;
}

export default function TablePagination(props: ITablePagination) {
  const totalPages = Math.ceil(props.total / props.perPage);

  const handleChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    props.handlePageChange(value);
  };

  const startIndex = props.currentPage * props.perPage - props.perPage + 1;
  const endIndex = Math.min(props.currentPage * props.perPage, props.total);

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        p: 2,
        background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
        borderRadius: '12px',
        border: '1px solid rgba(0, 0, 0, 0.06)',
      }}
    >
      {/* Rows per page */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
          Rows per page:
        </Typography>
        <MuiSelect
          value={props.perPage}
          onChange={(e) => props.setPerPage(e.target.value)}
          size="small"
          sx={{
            borderRadius: '8px',
            minWidth: 80,
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: '#e0e0e0',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#0073bb',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#0073bb',
            }
          }}
        >
          <MenuItem value={10}>10</MenuItem>
          <MenuItem value={20}>20</MenuItem>
          <MenuItem value={40}>40</MenuItem>
          <MenuItem value={50}>50</MenuItem>
        </MuiSelect>
      </Box>

      {/* Showing text and pagination */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
          Showing {startIndex} - {endIndex} of {props.total} results
        </Typography>
        <MuiPagination
          count={totalPages}
          page={props.currentPage}
          onChange={handleChange}
          color="primary"
          shape="rounded"
          siblingCount={1}
          boundaryCount={1}
          sx={{
            '& .MuiPaginationItem-root': {
              borderRadius: '8px',
              fontWeight: 600,
              '&:hover': {
                background: 'rgba(0, 115, 187, 0.08)',
              }
            },
            '& .Mui-selected': {
              background: 'linear-gradient(135deg, #0073bb 0%, #1a8cd8 100%) !important',
              color: 'white',
              '&:hover': {
                background: 'linear-gradient(135deg, #005a9e 0%, #0073bb 100%) !important',
              }
            }
          }}
        />
      </Box>
    </Box>
  );
}
