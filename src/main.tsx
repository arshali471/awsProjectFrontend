import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import "react-datepicker/dist/react-datepicker.css";

import 'react-date-picker/dist/DatePicker.css';
import 'react-calendar/dist/Calendar.css';
import "react-resizable/css/styles.css"; // Required for column resizing styles


import "react-resizable/css/styles.css"; 

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
