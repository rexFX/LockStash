'use client';
import { SessionProvider } from 'next-auth/react';
import ReduxProvider from '../redux/provider';

const Index = ({ children }) => {
  return (
    <SessionProvider>
      <ReduxProvider>
        <div className="h-screen w-screen flex">{children}</div>
      </ReduxProvider>
    </SessionProvider>
  );
};

export default Index;
