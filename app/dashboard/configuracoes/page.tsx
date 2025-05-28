"use client";

import { useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { Settings } from "lucide-react";

export default function Configuracoes() {
  const { user, isLoaded } = useUser();
  
  // Redirecionar para a página inicial se o usuário não estiver autenticado
  if (isLoaded && !user) {
    redirect("/");
  }

  return (
    <div className="w-full">
      <h1 className="animate-fade-up bg-gradient-to-br from-black to-stone-500 bg-clip-text font-display text-3xl font-bold tracking-[-0.02em] text-transparent opacity-0 drop-shadow-sm [text-wrap:balance] md:text-4xl md:leading-[3.5rem]" style={{ animationDelay: "0.15s", animationFillMode: "forwards" }}>
        Configurações
      </h1>
      
      <div className="mt-8 rounded-xl border border-gray-200 bg-white shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-xl font-bold">Configurações do Sistema</h3>
          <Settings className="h-6 w-6 text-indigo-600" />
        </div>
        <p className="text-gray-500">Aqui você poderá ajustar as configurações do sistema.</p>
        
        {/* Conteúdo da página de configurações */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <p className="text-center text-gray-400">Conteúdo da página de configurações em desenvolvimento</p>
        </div>
      </div>
    </div>
  );
}