import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6 text-center">
          <div className="alert alert-warning">
            <h1 className="display-1">404</h1>
            <h2>Page Not Found</h2>
            <p className="lead">The page you are looking for doesn't exist.</p>
            <Link to="/login" className="btn btn-primary">
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;