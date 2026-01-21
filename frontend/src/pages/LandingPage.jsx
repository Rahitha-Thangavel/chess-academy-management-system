import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
    return (
        <div className="landing-page vh-100 d-flex flex-column">
            {/* Navigation Bar */}
            <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm">
                <div className="container">
                    <Link className="navbar-brand fw-bold text-primary" to="/">
                        AAA Grand Masters Chess Academy
                    </Link>
                    <div className="d-flex gap-2">
                        <Link to="/login" className="btn btn-outline-primary">
                            Sign In
                        </Link>
                        <Link to="/register" className="btn btn-primary">
                            Sign Up
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="container flex-grow-1 d-flex flex-column justify-content-center align-items-center text-center mt-5 mb-5">
                <h1 className="display-4 fw-bold text-primary mb-4">
                    Master the Game of Kings
                </h1>
                <p className="lead text-muted mb-5" style={{ maxWidth: '700px' }}>
                    Welcome to AAA Grand Masters Chess Academy. We nurture champions through strategic training,
                    interactive lessons, and a passion for excellence. Join our community of grandmasters-in-the-making.
                </p>
                <div className="d-flex gap-3">
                    <Link to="/register" className="btn btn-primary btn-lg px-5">
                        Get Started
                    </Link>
                    <a href="#about" className="btn btn-outline-primary btn-lg px-5">
                        About Us
                    </a>
                </div>
            </div>

            {/* About Us Section */}
            <div id="about" className="bg-white py-5">
                <div className="container">
                    <div className="row align-items-center">
                        <div className="col-md-6 mb-4 mb-md-0">
                            <h2 className="text-primary mb-3">About Us</h2>
                            <p className="text-secondary">
                                At AAA Grand Masters Chess Academy, we believe that chess is more than just a game—it's
                                a tool for cognitive development, strategic thinking, and character building.
                            </p>
                            <p className="text-secondary">
                                Founded by Grand Masters, our academy offers world-class coaching for students of all levels.
                                Whether you are a beginner looking to understand the basics or an advanced player aiming
                                for tournaments, our expert coaches are here to guide you every step of the way.
                            </p>
                            <ul className="list-unstyled mt-3">
                                <li className="mb-2">✓ Certified Grand Master Coaches</li>
                                <li className="mb-2">✓ Customized Training Programs</li>
                                <li className="mb-2">✓ Regular Tournaments & Assessment</li>
                            </ul>
                        </div>
                        <div className="col-md-6">
                            <div className="p-5 bg-light rounded-3 text-center border border-success border-opacity-25">
                                {/* Placeholder for an image or graphic */}
                                <div className="display-1 text-primary mb-3">♟️</div>
                                <h4 className="text-success">Strategy. Discipline. Excellence.</h4>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-primary text-white py-4 mt-auto">
                <div className="container text-center">
                    <p className="mb-0">© 2026 AAA Grand Masters Chess Academy. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
