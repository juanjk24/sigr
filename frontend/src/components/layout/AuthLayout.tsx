import React from 'react';

interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ title, subtitle, children }) => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold" style={{ color: 'var(--color-primary)' }}>
            SIGR
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Sistema Integral de Gestión de Restaurante
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
          <h2 className="mb-1 text-xl font-semibold text-gray-800">{title}</h2>
          {subtitle && <p className="mb-6 text-sm text-gray-500">{subtitle}</p>}
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
