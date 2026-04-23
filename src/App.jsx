import { Toaster as SonnerToaster } from 'sonner';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import PageNotFound from './lib/PageNotFound';
import Menu from './pages/Menu';
import Panier from './pages/Panier';
import OrderTracking from './pages/OrderTracking';
import Admin from './pages/Admin';
import AdminProduits from './pages/AdminProduits';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Menu />} />
        <Route path="/panier" element={<Panier />} />
        <Route path="/commande/:id" element={<OrderTracking />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/produits" element={<AdminProduits />} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
      <SonnerToaster position="top-center" theme="dark" />
    </Router>
  );
}

export default App;
