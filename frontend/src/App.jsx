import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import EditNewsletter from './pages/EditNewsletter';
import CreateNewsletter from './pages/CreateNewsletter';
import PublicPreview from './pages/PublicPreview';
import Archive from './pages/Archive';
import { Toaster } from 'react-hot-toast';

function App() {
  const isAuthenticated = () => !!localStorage.getItem('token');

  return (
    <BrowserRouter>
      <Toaster position="top-center" />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={isAuthenticated() ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/edit/:id" element={isAuthenticated() ? <EditNewsletter /> : <Navigate to="/login" />} />
        <Route path="/create" element={isAuthenticated() ? <CreateNewsletter /> : <Navigate to="/login" />} />
        <Route path="/public-preview/:id" element={<PublicPreview />} />
        <Route path="/archive" element={<Archive />} />
        <Route path="/" element={<Navigate to={isAuthenticated() ? "/dashboard" : "/login"} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
