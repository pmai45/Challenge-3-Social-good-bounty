import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png'
import { login, logout } from '../utils'
import { useLocation } from 'react-router-dom';

function Navbar() {
    let location = useLocation();
    return (
        <div className='d-flex justify-content-between px-5 align-center mb-5 navbar'>
            <div className='logo-navbar'>
                <img src={logo} alt="" />
            </div>
            <div className='d-flex flex-column justify-content-center'>
                <div className='nav-items d-flex'>
                    <div className={`nav-item mx-4`}><Link to="/"><span className={`${location.pathname === "/" ? 'active': ''}`}>Home</span></Link></div>
                    <div className={`nav-item mx-4`}><Link to="/proposals"><span className={`${location.pathname === "/proposals" ? 'active': ''}`}>Proposals</span></Link></div>
                    <div className={`nav-item mx-4`}><Link to="/create"><span className={`${location.pathname === "/create" ? 'active': ''}`}>Create</span></Link></div>
                    <div className={`nav-item mx-4`}><Link to="/me"><span className={`${location.pathname === "/me" ? 'active': ''}`}>Me</span></Link></div>
                </div>
            </div>
            <div className='auth-action d-flex flex-column justify-content-center'>
                {window.walletConnection.isSignedIn() ?
                    <button className="auth-button" onClick={logout}>
                        Sign out
                    </button>
                    :
                    <button className="auth-button" onClick={login}>
                        Sign in
                    </button>
                }
            </div>
        </div>
    );
}

export default Navbar;