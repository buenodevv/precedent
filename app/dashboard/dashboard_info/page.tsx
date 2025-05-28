"use client";

import { CalendarCheck, CalendarX, UserX, Users } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

export default function DashboardInfo() {
    const { user, isLoaded } = useUser();
    if (isLoaded && !user) {
        redirect ("/");
      }
  return (
    <div className="z-0">
      {/* Cards informativos */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Card de Consultas Agendadas */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-bold">Consultas Agendadas</h3>
            <CalendarCheck className="h-8 w-8 text-green-600" />
          </div>
          <p className="mt-2 text-2xl font-bold">42</p>
          <p className="text-sm text-gray-500">Para hoje</p>
        </div>
        
        {/* Card de Médicos Cadastrados */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-bold">Médicos</h3>
            <UserX className="h-8 w-8 text-indigo-600" />
          </div>
          <p className="mt-2 text-2xl font-bold">24</p>
          <p className="text-sm text-gray-500">Cadastrados</p>
        </div>
        
        {/* Card de Pacientes Cadastrados */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-bold">Pacientes</h3>
            <Users className="h-8 w-8 text-indigo-600" />
          </div>
          <p className="mt-2 text-2xl font-bold">3.427</p>
          <p className="text-sm text-gray-500">Cadastrados</p>
        </div>
        
        {/* Card de Consultas Canceladas */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-bold">Consultas Canceladas</h3>
            <CalendarX className="h-8 w-8 text-red-600" />
          </div>
          <p className="mt-2 text-2xl font-bold">7</p>
          <p className="text-sm text-gray-500">Hoje</p>
        </div>
      </div>
      
      {/* Seção de Próximas Consultas */}
      <div className="mt-8">
        <h2 className="font-display text-2xl font-bold mb-4">Próximas Consultas</h2>
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paciente</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Médico</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Horário</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">RM</div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">Ricardo Mendes</div>
                      <div className="text-sm text-gray-500">ricardo@example.com</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">Dra. Ana Silva</div>
                  <div className="text-sm text-gray-500">Cardiologia</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">Hoje, 14:30</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Confirmado</span>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">MC</div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">Maria Costa</div>
                      <div className="text-sm text-gray-500">maria@example.com</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">Dr. Carlos Oliveira</div>
                  <div className="text-sm text-gray-500">Ortopedia</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">Hoje, 15:45</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Aguardando</span>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">JS</div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">João Santos</div>
                      <div className="text-sm text-gray-500">joao@example.com</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">Dra. Patrícia Lima</div>
                  <div className="text-sm text-gray-500">Dermatologia</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">Hoje, 16:30</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Confirmado</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex justify-end">
          <button className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
            Ver todos os agendamentos
          </button>
        </div>
      </div>
    </div>
  );
}