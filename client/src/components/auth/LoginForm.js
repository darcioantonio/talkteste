import React, { useState } from 'react';
import './LoginForm.css';

function LoginForm({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    try {
      await onLogin(email, password);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <div className="auth-form-group">
        <label htmlFor="email">E-MAIL</label>
        <input
          type="email"
          id="email"
          className="discord-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="seu@email.com"
          required
          autoComplete="email"
        />
      </div>

      <div className="auth-form-group">
        <label htmlFor="password">SENHA</label>
        <input
          type="password"
          id="password"
          className="discord-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          autoComplete="current-password"
        />
      </div>

      <button
        type="submit"
        className="discord-button discord-button-primary auth-submit-button"
        disabled={loading || !email || !password}
      >
        {loading ? 'Entrando...' : 'Entrar'}
      </button>
    </form>
  );
}

export default LoginForm;

