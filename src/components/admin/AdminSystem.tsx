'use client';

import React, { useState } from 'react';
import { AdminUser } from '../../types';
import { AdminLogin } from './AdminLogin';
import { AdminDashboard } from './AdminDashboard';

export const AdminSystem: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);

  const handleLogin = (user: AdminUser) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  if (!currentUser) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  return <AdminDashboard user={currentUser} onLogout={handleLogout} />;
};