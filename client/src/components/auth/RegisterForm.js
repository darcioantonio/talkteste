import React, { useState } from 'react';
import './RegisterForm.css';

function RegisterForm({ onRegister }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !email || !password) return;
    if (password !== confirmPassword) {
      alert('As senhas não coincidem');
      return;
    }
    if (password.length < 6) {
      alert('A senha deve ter no mínimo 6 caracteres');
      return;
    }

    setLoading(true);
    try {
      await onRegister(username, email, password);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <div className="auth-form-group">
        <label htmlFor="username">NOME DE USUÁRIO</label>
        <input
          type="text"
          id="username"
          className="discord-input"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="SeuNome"
          required
          minLength={3}
          maxLength={20}
          autoComplete="username"
        />
      </div>

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
          minLength={6}
          autoComplete="new-password"
        />
      </div>

      <div className="auth-form-group">
        <label htmlFor="confirmPassword">CONFIRMAR SENHA</label>
        <input
          type="password"
          id="confirmPassword"
          className="discord-input"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="••••••••"
          required
          minLength={6}
          autoComplete="new-password"
        />
      </div>

      <button
        type="submit"
        className="discord-button discord-button-primary auth-submit-button"
        disabled={loading || !username || !email || !password || !confirmPassword}
      >
        {loading ? 'Criando conta...' : 'Criar Conta'}
      </button>
    </form>
  );
}

export default RegisterForm;

