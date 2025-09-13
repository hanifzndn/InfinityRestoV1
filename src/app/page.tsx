'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CustomerInterface } from '../components/customer/CustomerInterface';
import { Welcome } from '../components/Welcome';

export default function HomePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const tableCode = searchParams.get('table');

  // If no table parameter, show welcome page
  if (!tableCode) {
    return <Welcome />;
  }

  // If table parameter exists, show customer ordering interface
  return <CustomerInterface tableCode={tableCode} />;
}