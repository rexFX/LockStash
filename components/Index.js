'use client';
import { SessionProvider } from 'next-auth/react';

const Index = ({ children }) => {
  return <SessionProvider>{children}</SessionProvider>;
};

export default Index;
