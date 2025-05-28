"use client";

import { useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import dynamic from "next/dynamic";

// Importar o componente DashboardInfo de forma dinâmica
const DashboardInfo = dynamic(() => import("./dashboard_info/page"), {
  ssr: false,
  loading: () => <p>Carregando informações do dashboard...</p>
});

export default function Dashboard() {
  const { user, isLoaded } = useUser();
  
  // Redirecionar para a página inicial se o usuário não estiver autenticado
  if (isLoaded && !user) {
    redirect("/");
  }

  return (
    <>
      <h1 className="animate-fade-up bg-gradient-to-br from-black to-stone-500 bg-clip-text font-display text-3xl font-bold tracking-[-0.02em] text-transparent opacity-0 drop-shadow-sm [text-wrap:balance] md:text-4xl md:leading-[3.5rem]" style={{ animationDelay: "0.15s", animationFillMode: "forwards" }}>
        Dashboard
      </h1>
      
      {/* Renderizar o componente DashboardInfo */}
      <div className="mt-8 w-full relative z-10">
        <DashboardInfo />
      </div>
      
      {/* Informações da Conta */}
      <div className="mt-8 rounded-xl border border-gray-200 bg-white shadow-sm p-6">
        <h3 className="font-display text-xl font-bold mb-4">Informações da Conta</h3>
        <div className="space-y-2">
          <p><span className="font-semibold">Nome:</span> {user?.fullName}</p>
          <p><span className="font-semibold">Email:</span> {user?.primaryEmailAddress?.emailAddress}</p>
          <p><span className="font-semibold">ID:</span> {user?.id}</p>
        </div>
      </div>
    </>
  );
}