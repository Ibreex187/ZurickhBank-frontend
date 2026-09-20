import { Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useAuth } from '../context/AuthContext';
import LoadingWatch from './LoadingWatch';
import { ShieldExclamation } from 'react-bootstrap-icons';

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const isAdmin = user?.roles === 'admin' || user?.role === 'admin' || user?.isAdmin === true;

  if (loading) {
    return (
      <div className="admin-loading-container">
        <div className="text-center py-5">
          <LoadingWatch label="Checking admin access..." />
        </div>
      </div>
    );
  }

  // Check if user is logged in
  if (!user) {
    return <Navigate to="/login" />;
  }

  // Check if user has admin role
  if (!isAdmin) {
    return (
      <div className="unauthorized-container">
        <div className="container-fluid py-5">
          <div className="row justify-content-center">
            <div className="col-md-6 text-center">
              <div className="card border-danger">
                <div className="card-body py-5">
                  <ShieldExclamation size={64} className="text-danger mb-3" />
                  <h2 className="text-danger mb-3">Access Denied</h2>
                  <p className="text-muted mb-4">
                    You don&apos;t have permission to access the admin dashboard.
                  </p>
                  <div className="d-flex gap-3 justify-content-center">
                    <button 
                      className="btn btn-primary"
                      onClick={() => window.history.back()}
                    >
                      Go Back
                    </button>
                    <button 
                      className="btn btn-outline-primary"
                      onClick={() => window.location.href = '/dashboard'}
                    >
                      Go to Dashboard
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

AdminRoute.propTypes = {
  children: PropTypes.node,
};

export default AdminRoute;