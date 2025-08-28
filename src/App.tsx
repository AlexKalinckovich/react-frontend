import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login/Login';
import Register from './components/Register/Register';
import UserProfile from './components/UserProfile/UserProfile';
import OrderList from './components/OrderList/OrderList';
import OrderForm from './components/OrderForm/OrderForm';
import './App.css';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    return user ? <>{children}</> : <Navigate to="/login" />;
};

const Navigation: React.FC = () => {
    const { user, logout } = useAuth();

    return (
        <nav className="nav">
            <div className="nav-brand">
                <Link to="/">MyApp</Link>
            </div>
            <div className="nav-links">
                {user ? (
                    <>
                        <Link to="/profile">Profile</Link>
                        <Link to="/orders">Orders</Link>
                        <Link to="/orders/new" className="nav-new-order">
                            New Order
                        </Link>
                        <button onClick={logout} className="nav-logout">
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login">Login</Link>
                        <Link to="/register">Register</Link>
                    </>
                )}
            </div>
        </nav>
    );
};

const Home: React.FC = () => {
    const { user } = useAuth();

    return (
        <div className="page-container">
            <h2>Home</h2>
            {user ? (
                <div>
                    <p>Welcome back, {user.email}!</p>
                    <div className="home-actions">
                        <Link to="/orders" className="button primary">
                            View Your Orders
                        </Link>
                        <Link to="/orders/new" className="button secondary">
                            Create New Order
                        </Link>
                        <Link to="/profile" className="button tertiary">
                            View Profile
                        </Link>
                    </div>
                </div>
            ) : (
                <div>
                    <p>Welcome to our application. Please log in or register to continue.</p>
                    <div className="home-actions">
                        <Link to="/login" className="button primary">
                            Login
                        </Link>
                        <Link to="/register" className="button secondary">
                            Register
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
};

export default function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="app">
                    <Navigation />
                    <main className="main-content">
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            <Route
                                path="/profile"
                                element={
                                    <ProtectedRoute>
                                        <UserProfile />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/orders"
                                element={
                                    <ProtectedRoute>
                                        <OrderList />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/orders/new"
                                element={
                                    <ProtectedRoute>
                                        <OrderForm />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/orders/edit/:id"
                                element={
                                    <ProtectedRoute>
                                        <OrderForm isEdit={true} />
                                    </ProtectedRoute>
                                }
                            />
                            <Route path="*" element={<Navigate to="/" />} />
                        </Routes>
                    </main>
                </div>
            </Router>
        </AuthProvider>
    );
}