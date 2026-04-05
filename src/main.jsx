import React from 'react';
import { createRoot, ReactDOM } from 'react-dom/client'; // Must have /client
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { BrowserRouter } from 'react-router-dom'

import App from './App';
import StudentDetail from './pages/StudentDetail';
import StudentsList from './pages/StudentsList';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
)

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/students" element={<StudentsList />} />
      <Route path="/student/:id" element={<StudentDetail />} />
    </Routes>
  </BrowserRouter>
);