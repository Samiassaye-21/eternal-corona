import React, { useState } from 'react';

export default function Auth({ onLogin }) {
    const [name, setName] = useState('');
    const [role, setRole] = useState('Owner');

    const handleSubmit = (e) => {
        e.preventDefault();
        const trimmed = name.trim();
        if (!trimmed) return;
        onLogin({
            name: trimmed,
            role,
        });
    };

    return (
        <div className="flex items-center justify-center" style={{ minHeight: '100vh' }}>
            <div className="glass-panel" style={{ padding: '2rem', maxWidth: '420px', width: '100%' }}>
                <h1 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>Maraki Juice</h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                    Choose your name to start using the shop dashboard. You and your sister can each log in with your own name.
                </p>

                <form onSubmit={handleSubmit} className="flex-col gap-4">
                    <div className="input-group">
                        <label className="input-label">Your Name</label>
                        <input
                            className="input-field"
                            placeholder="e.g., Sami, Sister"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label">Role (optional)</label>
                        <select
                            className="input-field"
                            value={role}
                            onChange={e => setRole(e.target.value)}
                        >
                            <option value="Owner">Owner</option>
                            <option value="Staff">Staff</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        style={{
                            marginTop: '1rem',
                            width: '100%',
                            background: 'var(--accent-orange)',
                            color: 'white',
                            padding: '0.8rem',
                            borderRadius: '10px',
                            fontWeight: 'bold',
                        }}
                    >
                        Continue to Dashboard
                    </button>
                </form>
            </div>
        </div>
    );
}

