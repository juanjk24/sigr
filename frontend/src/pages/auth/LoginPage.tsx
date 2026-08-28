import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';
import AuthLayout from '../../components/layout/AuthLayout';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const LoginPage: React.FC = () => {
  const { login } = useAuthContext();
  const navigate = useNavigate();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch {
      setError('Credenciales inválidas. Verifica tu email y contraseña.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout title="Iniciar sesión" subtitle="Accede a tu cuenta de SIGR">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@email.com"
          required
        />
        <Input
          label="Contraseña"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
        />
        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        )}
        <Button label={submitting ? 'Ingresando...' : 'Ingresar'} type="submit" disabled={submitting} />
      </form>
      <p className="mt-6 text-center text-sm text-gray-500">
        ¿No tienes una cuenta?{' '}
        <Link to="/register" className="font-medium" style={{ color: 'var(--color-primary)' }}>
          Regístrate
        </Link>
      </p>
    </AuthLayout>
  );
};

export default LoginPage;
