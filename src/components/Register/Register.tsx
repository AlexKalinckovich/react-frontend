import React from 'react';
import { useRegister } from '../../hooks/useRegister';
import { ErrorPopup } from "../../api/errorElements/ErrorElements";
import styles from './Register.module.css';
import error_styles from '../../api/errorElements/ErrorElement.module.css';

export default function Register(): React.JSX.Element {
    const {
        formData,
        error,
        loading,
        fieldErrors,
        setFormData,
        handleSubmit,
        clearFieldError,
        clearError
    } = useRegister();

    const handleInputChange = (field: keyof typeof formData) => (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        setFormData({ [field]: e.target.value });
        clearFieldError(field);
    };

    return (
        <div className={styles.wrapper}>
            <h2 className={styles.title}>Register</h2>
            <form className={styles.form} onSubmit={handleSubmit} noValidate>
                <label className={styles.label}>
                    Name
                    <input
                        className={`${styles.input} ${fieldErrors.name ? error_styles.errorInput : ''}`}
                        value={formData.name}
                        onChange={handleInputChange('name')}
                        required
                        name="name"
                        autoComplete="given-name"
                    />
                    {fieldErrors.name && <span className={error_styles.fieldError}>{fieldErrors.name}</span>}
                </label>

                <label className={styles.label}>
                    Surname
                    <input
                        className={`${styles.input} ${fieldErrors.surname ? error_styles.errorInput : ''}`}
                        value={formData.surname}
                        onChange={handleInputChange('surname')}
                        required
                        name="surname"
                        autoComplete="family-name"
                    />
                    {fieldErrors.surname && <span className={error_styles.fieldError}>{fieldErrors.surname}</span>}
                </label>

                <label className={styles.label}>
                    Email
                    <input
                        className={`${styles.input} ${fieldErrors.email ? error_styles.errorInput : ''}`}
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange('email')}
                        required
                        name="email"
                        autoComplete="email"
                    />
                    {fieldErrors.email && <span className={error_styles.fieldError}>{fieldErrors.email}</span>}
                </label>

                <label className={styles.label}>
                    Birth date
                    <input
                        className={`${styles.input} ${fieldErrors.birthdate ? error_styles.errorInput : ''}`}
                        type="date"
                        value={formData.birthDate}
                        onChange={handleInputChange('birthDate')}
                        required
                        name="birthDate"
                    />
                    {fieldErrors.birthdate && <span className={error_styles.fieldError}>{fieldErrors.birthdate}</span>}
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
                        autoComplete="new-password"
                    />
                    {fieldErrors.password && <span className={error_styles.fieldError}>{fieldErrors.password}</span>}
                </label>

                <button className={styles.button} type="submit" disabled={loading}>
                    {loading ? 'Registering…' : 'Register'}
                </button>
            </form>
            {error && <ErrorPopup message={error} onClose={clearError} />}
        </div>
    );
}