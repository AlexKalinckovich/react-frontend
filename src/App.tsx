// @ts-ignore
import React from 'react';
import { Routes, Route, Link } from 'react-router-dom'
import Login from './pages/Login/Login'
import Register from './pages/Register/Register'
import { AuthProvider, useAuth } from './context/AuthContext'



function Home() {
    const { user, logout } = useAuth()
    return (
        <div style={{ padding: 20 }}>
            <h2>Home</h2>
            {user ? (
                <div>
                    <p>Welcome, {user.email}</p>
                    <button onClick={logout}>Logout</button>
                </div>
            ) : (
                <div>
                    <Link to="/login">Login</Link> | <Link to="/register">Register</Link>
                </div>
            )}
        </div>
    )
}

export default function App() {
    return (
        <AuthProvider>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
            </Routes>
        </AuthProvider>
    )
}