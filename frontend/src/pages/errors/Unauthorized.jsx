/**
 * Page component: Unauthorized.
 * 
 * Defines a route/page-level React component.
 */

import React from 'react';
import { Link } from 'react-router-dom';

const Unauthorized = () => {
  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6 text-center">
          <div className="alert alert-danger">
            <h1 className="display-1">403</h1>
            <h2>Access Denied</h2>
            <p className="lead">You don't have permission to access this page.</p>
            <Link to="/login" className="btn btn-primary">
              Return to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;