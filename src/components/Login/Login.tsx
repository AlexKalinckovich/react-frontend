import React from 'react';
import { useLogin } from '../../hooks/useLogin';
import { ErrorPopup } from "../../api/errorElements/ErrorElements";
import styles from './Login.module.css';
import error_styles from '../../api/errorElements/ErrorElement.module.css';

export default function Login(): React.JSX.Element {
    const {
        formData,
        error,
        loading,
        fieldErrors,
        setFormData,
        handleSubmit,
        clearFieldError,
        clearError
    } = useLogin();

    const handleInputChange = (field: keyof typeof formData) => (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        setFormData({ [field]: e.target.value });
        clearFieldError(field);
    };

    return (
        <div className={styles.wrapper}>
            <h2 className={styles.title}>Login</h2>
            <form className={styles.form} onSubmit={handleSubmit}>
                <label className={styles.label}>
                    Email
                    <input
                        className={`${styles.input} ${fieldErrors.email ? error_styles.errorInput : ''}`}
                        value={formData.email}
                        onChange={handleInputChange('email')}
                        required
                        name="email"
                        autoComplete="email"
                    />
                    {fieldErrors.email && <span className={error_styles.fieldError}>{fieldErrors.email}</span>}
                </label>

                <label className={styles.label}>
                    Password
                    <input
                        className={`${styles.input} ${fieldErrors.password ? error_styles.errorInput : ''}`}
                        type="password"
                        value={formData.password}
                        onChange={handleInputChange('password')}
                        required
                        name="password"
                        autoComplete="current-password"
                    />
                    {fieldErrors.password && <span className={error_styles.fieldError}>{fieldErrors.password}</span>}
                </label>

                <button className={styles.button} type="submit" disabled={loading}>
                    {loading ? 'Logging in...' : 'Login'}
                </button>
            </form>
            {error && <ErrorPopup message={error} onClose={clearError} />}
        </div>
    );
}