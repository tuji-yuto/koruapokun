'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from "next/image";

export default function Home() {
  const router = useRouter();
  
  useEffect(() => {
    router.push('/register');
  }, [router]);
  
  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>リダイレクト中...</p>
    </div>
  );
}
