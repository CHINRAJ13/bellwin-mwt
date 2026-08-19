import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, role }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));

  if (!token || !user) {
    return <Navigate to="/admin/login" />;
  }

  if (role && user.role && user.role.toLowerCase() !== role.toLowerCase()) {
    return <Navigate to="/admin-dashboard" />;
  }

  return children;
};

export default ProtectedRoute;
