import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import '../auth/AuthPage.css';

function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const { login, register } = useAuth();
  const [error, setError] = useState('');

  const handleLogin = async (email, password) => {
    try {
      setError('');
      await login(email, password);
    } catch (err) {
      setError(err.message || 'Erro ao fazer login');
    }
  };

  const handleRegister = async (username, email, password) => {
    try {
      setError('');
      await register(username, email, password);
    } catch (err) {
      setError(err.message || 'Erro ao criar conta');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1 className="auth-logo">💬 TalkChat</h1>
          <p className="auth-subtitle">Bem-vindo de volta!</p>
        </div>

        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        {isLogin ? (
          <LoginForm onLogin={handleLogin} />
        ) : (
          <RegisterForm onRegister={handleRegister} />
        )}

        <div className="auth-switch">
          {isLogin ? (
            <>
              <span>Não tem uma conta?</span>
              <button
                className="auth-link-button"
                onClick={() => {
                  setIsLogin(false);
                  setError('');
                }}
              >
                Registre-se
              </button>
            </>
          ) : (
            <>
              <span>Já tem uma conta?</span>
              <button
                className="auth-link-button"
                onClick={() => {
                  setIsLogin(true);
                  setError('');
                }}
              >
                Entrar
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default AuthPage;

