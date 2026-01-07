"use client";
import dynamic from 'next/dynamic';

const Simulador = dynamic(() => import('@/app/simulador'), { 
  ssr: false,
  loading: () => <div style={{ background: '#000', height: '100vh', color: '#fff', padding: '20px' }}>Carregand</div>
});

export default function Page() {
  return <Simulador />;
}