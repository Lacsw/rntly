import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './sidebar';
import { Loading } from '@/shared/components';
import { Toaster } from '@/shared/toast';

const MainLayout = () => {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 bg-stone-50">
        <Suspense fallback={<Loading />}>
          <Outlet />
        </Suspense>
      </main>
      <Toaster />
    </div>
  );
};

export default MainLayout;
