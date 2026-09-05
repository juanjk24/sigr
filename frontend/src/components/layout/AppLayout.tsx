import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';

interface AppLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/profile', label: 'Mi Perfil' },
  { to: '/menu', label: 'Menú' },
  { to: '/categories', label: 'Categorías' },
  { to: '/orders', label: 'Pedidos' },
  { to: '/billing', label: 'Facturación' },
];

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { user, logout } = useAuthContext();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-60 flex-col border-r border-gray-200 bg-white">
        <div className="flex h-16 items-center px-5">
          <span className="text-xl font-bold" style={{ color: 'var(--color-primary)' }}>
            SIGR
          </span>
        </div>
        <nav className="flex flex-col gap-1 px-3 py-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-light text-primary'
                    : 'text-gray-600 hover:bg-gray-50'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
          <span className="text-sm text-gray-500">Bienvenido</span>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700">{user?.name}</span>
            <button
              onClick={handleLogout}
              className="btn btn-secondary"
              style={{ height: 34, padding: '0 12px' }}
            >
              Cerrar sesión
            </button>
          </div>
        </header>
        <main className="flex-1 bg-background p-6">{children}</main>
      </div>
    </div>
  );
};

export default AppLayout;
