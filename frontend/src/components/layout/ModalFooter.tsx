import React from 'react';
import type { ReactNode } from 'react';

interface ModalFooterProps {
    children: ReactNode;
    variant?: 'default' | 'danger';
}

const ModalFooter: React.FC<ModalFooterProps> = ({
    children,
    variant = 'default'
}) => {
    return (
        <div className={`flex gap-3 ${variant === 'danger' ? 'justify-between' : ''}`}>
            {children}
        </div>
    );
};

export default ModalFooter;