import React from 'react';
import DashboardLayout from './DashboardLayout';
import AuthGuard from '@/components/AuthGuard';

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <DashboardLayout>
        {children}
      </DashboardLayout>
    </AuthGuard>
  );
}
