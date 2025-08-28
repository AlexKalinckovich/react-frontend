import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import OrderList from '../OrderList/OrderList';
import styles from './UserProfile.module.css';

const UserProfile: React.FC = () => {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState<'profile' | 'orders'>('profile');

    if (!user) {
        return <div>Please log in to view your profile.</div>;
    }

    return (
        <div className={styles.profileContainer}>
            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${activeTab === 'profile' ? styles.active : ''}`}
                    onClick={() => setActiveTab('profile')}
                >
                    Profile
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'orders' ? styles.active : ''}`}
                    onClick={() => setActiveTab('orders')}
                >
                    Orders
                </button>
            </div>

            {activeTab === 'profile' && (
                <>
                    <h2>User Profile</h2>
                    <div className={styles.profileInfo}>
                        <div className={styles.infoItem}>
                            <label>Name:</label>
                            <span>{user.name}</span>
                        </div>
                        <div className={styles.infoItem}>
                            <label>Surname:</label>
                            <span>{user.surname}</span>
                        </div>
                        <div className={styles.infoItem}>
                            <label>Email:</label>
                            <span>{user.email}</span>
                        </div>
                        <div className={styles.infoItem}>
                            <label>Birth Date:</label>
                            <span>{user.birthDate}</span>
                        </div>
                        <div className={styles.infoItem}>
                            <label>User ID:</label>
                            <span>{user.id}</span>
                        </div>
                    </div>
                </>
            )}

            {activeTab === 'orders' && (
                <OrderList />
            )}

            <button onClick={logout} className={styles.logoutButton}>
                Logout
            </button>
        </div>
    );
};

export default UserProfile;