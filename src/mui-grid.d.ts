import '@mui/material/Grid';

declare module '@mui/material/Grid' {
  interface GridProps {
    item?: boolean;
    xs?: number | boolean;
    sm?: number | boolean;
    md?: number | boolean;
    lg?: number | boolean;
    xl?: number | boolean;
  }
}
