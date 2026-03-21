import React from 'react';
import { motion } from 'motion/react';

interface AuthCardProps {
  layoutId: string;
  children: React.ReactNode;
  className?: string;
}

export const AuthCard: React.FC<AuthCardProps> = ({ layoutId, children, className = '' }) => {
  return (
    <motion.div
      layoutId={layoutId}
      className={`w-full max-w-[480px] bg-surface-container-lowest rounded-xl shadow-[0px_12px_32px_rgba(26,28,28,0.06)] overflow-hidden ${className}`}
    >
      {children}
    </motion.div>
  );
};
