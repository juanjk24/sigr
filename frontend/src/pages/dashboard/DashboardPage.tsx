import React from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../../components/layout/AppLayout';
import Card from '../../components/ui/Card';
import { useAuthContext } from '../../context/AuthContext';

const modules = [
  { to: '/menu', title: 'Menú', desc: 'Gestiona los platos del restaurante' },
  { to: '/categories', title: 'Categorías', desc: 'Organiza el menú por categorías' },
  { to: '/profile', title: 'Mi Perfil', desc: 'Consulta tus datos de cuenta' },
];

const DashboardPage: React.FC = () => {
  const { user } = useAuthContext();
  return (
    <AppLayout>
      <h1 className="mb-1 text-2xl font-semibold text-gray-800">Dashboard</h1>
      <p className="mb-6 text-sm text-gray-500">
        Hola {user?.name}, bienvenido al panel de SIGR.
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {modules.map((m) => (
          <Link key={m.to} to={m.to}>
            <Card className="transition-shadow hover:shadow-md">
              <h3 className="mb-1 font-semibold" style={{ color: 'var(--color-primary)' }}>
                {m.title}
              </h3>
              <p className="text-sm text-gray-500">{m.desc}</p>
            </Card>
          </Link>
        ))}
      </div>
    </AppLayout>
  );
};

export default DashboardPage;
