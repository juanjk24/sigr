import React from 'react';

interface FooterProps {
  text?: string;
}

const Footer: React.FC<FooterProps> = ({ text = '© 2026 All rights reserved' }) => {
  return <footer>{text}</footer>;
};

export default Footer;
