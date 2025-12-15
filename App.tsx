import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Sales } from './pages/Sales';
import { Inventory } from './pages/Inventory';
import { Finance } from './pages/Finance';
import { Relationships } from './pages/Relationships';
import { Categories } from './pages/Categories';
import { Purchases } from './pages/Purchases';

const App: React.FC = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/sales" element={<Sales />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/purchases" element={<Purchases />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/finance" element={<Finance />} />
        <Route path="/relationships" element={<Relationships />} />
        <Route path="*" element={<Navigate to="/sales" replace />} />
      </Routes>
    </Layout>
  );
};

export default App;