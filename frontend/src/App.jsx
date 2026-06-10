import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Calendar from './pages/Calendar';
import Templates from './pages/Templates';
import Watch from './pages/Watch';
import Settings from './pages/Settings';

function RequireAuth({ children }) {
  const token = localStorage.getItem('kk_token');
  return token ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/"
        element={
          <RequireAuth>
            <Layout />
          </RequireAuth>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="calendrier" element={<Calendar />} />
        <Route path="templates" element={<Templates />} />
        <Route path="veille" element={<Watch />} />
        <Route path="parametres" element={<Settings />} />
      </Route>
    </Routes>
  );
}
