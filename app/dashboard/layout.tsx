"use client";

import { useUser } from "@clerk/nextjs";
import { redirect, usePathname } from "next/navigation";
import Image from "next/image";
import { useState } from "react";
import { Users, Calendar, BriefcaseIcon, Home, Menu, X, Settings, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoaded } = useUser();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();
  
  // Redirecionar para a página inicial se o usuário não estiver autenticado
  if (isLoaded && !user) {
    redirect("/");
  }

  const menuItems = [
    { name: "Dashboard", icon: <Home className="h-5 w-5" />, href: "/dashboard", active: pathname === "/dashboard" },
    { name: "Médicos", icon: <BriefcaseIcon className="h-5 w-5" />, href: "/dashboard/medicos", active: pathname === "/dashboard/medicos" },
    { name: "Agendamentos", icon: <Calendar className="h-5 w-5" />, href: "/dashboard/agendamentos", active: pathname === "/dashboard/agendamentos" },
    { name: "Pacientes", icon: <Users className="h-5 w-5" />, href: "/dashboard/pacientes", active: pathname === "/dashboard/pacientes" },
    { name: "Configurações", icon: <Settings className="h-5 w-5" />, href: "/dashboard/configuracoes", active: pathname === "/dashboard/configuracoes" },
  ];

  return (
    <div className="-mt-32 flex h-screen w-full max-w-screen-xl mx-auto">
      {/* Sidebar */}
      <div className={`fixed top-16 left-0 z-1 flex h-[calc(100vh-4rem)] w-64 flex-col border-r border-gray-200 bg-white transition-all duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0`}>
        <div className="flex items-center justify-between border-b border-gray-200 p-4">
          <div className="flex items-center space-x-2">
            {user?.imageUrl && (
              <Image 
                src={user.imageUrl} 
                alt={user.fullName || "User profile"} 
                width={40}
                height={40}
                className="rounded-full"
              />
            )}
            <div className="flex flex-col">
              <span className="font-medium">{user?.firstName || "Usuário"}</span>
              <span className="text-xs text-gray-500">Administrador</span>
            </div>
          </div>
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="rounded-md p-1 text-gray-500 hover:bg-gray-100 md:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center space-x-2 rounded-md px-3 py-2 text-sm font-medium ${item.active ? 'bg-indigo-50 text-indigo-600' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'}`}
            >
              {item.icon}
              <span>{item.name}</span>
              {item.active && <ChevronRight className="ml-auto h-4 w-4 text-indigo-600" />}
            </Link>
          ))}
        </nav>
        <div className="border-t border-gray-200 p-4">
          <div className="rounded-md bg-indigo-50 p-4">
            <h3 className="text-sm font-medium text-indigo-800">Precisa de ajuda?</h3>
            <p className="mt-1 text-xs text-indigo-700">Acesse nossa central de suporte para tirar suas dúvidas.</p>
            <button className="mt-2 w-full rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700">
              Central de Suporte
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu button */}
      <button
        onClick={() => setSidebarOpen(true)}
        className={`fixed bottom-4 right-4 z-20 rounded-full bg-indigo-600 p-3 text-white shadow-lg md:hidden ${sidebarOpen ? 'hidden' : 'flex'}`}
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Main content */}
      <div className={`z-0 w-full flex-2 overflow-y-hidden overflow-auto pt-16 px-2 pb-6 ${sidebarOpen ? 'md:ml-1' : ''}`}>
        {children}
      </div>
    </div>
  );
}