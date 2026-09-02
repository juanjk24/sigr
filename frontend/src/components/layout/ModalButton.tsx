import React from 'react';

interface ModalButtonProps {
    onClick?: () => void;
    type?: 'button' | 'submit';
    variant?: 'primary' | 'secondary' | 'danger';
    disabled?: boolean;
    loading?: boolean;
    children: React.ReactNode;
    className?: string;
}

const ModalButton: React.FC<ModalButtonProps> = ({
    onClick,
    type = 'button',
    variant = 'secondary',
    disabled = false,
    loading = false,
    children,
    className = '',
}) => {
    const baseClasses = 'flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';

    const variantClasses = {
        primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 disabled:bg-blue-400',
        secondary: 'border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-blue-500 disabled:bg-gray-100',
        danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 disabled:bg-red-400',
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || loading}
            className={`${baseClasses} ${variantClasses[variant]} ${className}`}
        >
            {loading ? (
                <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Cargando...
                </span>
            ) : children}
        </button>
    );
};

export default ModalButton;