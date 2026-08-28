import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { useAuthContext } from '../../context/AuthContext';
import AuthLayout from '../../components/layout/AuthLayout';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const RegisterPage: React.FC = () => {
  const { register } = useAuthContext();
  const navigate = useNavigate();
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirm, setConfirm] = React.useState('');
  const [error, setError] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    setSubmitting(true);
    try {
      await register(name, email, password);
      navigate('/dashboard');
    } catch (err) {
      let msg = 'No se pudo registrar el usuario.';
      if (isAxiosError<{ error?: string }>(err) && err.response?.data?.error) {
        msg = err.response.data.error;
      }
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout title="Crear cuenta" subtitle="Regístrate para comenzar">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Tu nombre"
          required
        />
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
          placeholder="Mínimo 6 caracteres"
          required
        />
        <Input
          label="Confirmar contraseña"
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="Repite tu contraseña"
          required
        />
        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        )}
        <Button label={submitting ? 'Creando cuenta...' : 'Registrarme'} type="submit" disabled={submitting} />
      </form>
      <p className="mt-6 text-center text-sm text-gray-500">
        ¿Ya tienes una cuenta?{' '}
        <Link to="/login" className="font-medium" style={{ color: 'var(--color-primary)' }}>
          Inicia sesión
        </Link>
      </p>
    </AuthLayout>
  );
};

export default RegisterPage;
