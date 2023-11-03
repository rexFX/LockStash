'use client';
import { SessionProvider } from 'next-auth/react';
import ReduxProvider from '../redux/provider';

const Index = ({ children }) => {
  return (
    <SessionProvider>
      <ReduxProvider>{children}</ReduxProvider>
    </SessionProvider>
  );
};

export default Index;
