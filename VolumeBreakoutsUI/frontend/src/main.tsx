import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import Home from './components/Home';
import Background from './components/Background';
import SetUp from './components/SetUp';
import Research from './components/Research';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<Home />} />
          <Route path="background" element={<Background />} />
          <Route path="setup" element={<SetUp />} />
          <Route path="research" element={<Research />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
);


