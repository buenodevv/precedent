"use client";

import { useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { Calendar, Plus, Search, Edit, Trash2, X, Check, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "react-hot-toast";

// Tipos
interface Medico {
  id: string;
  nome: string;
  especialidade: string;
  crm: string;
  email: string;
  telefone: string;
}

interface Paciente {
  id: string;
  nome: string;
  dataNascimento: string;
  cpf: string;
  email: string;
  telefone: string;
  endereco: string;
}

interface Agendamento {
  id: string;
  data: string;
  hora: string;
  status: string;
  observacoes?: string;
  medicoId: string;
  pacienteId: string;
  medico: Medico;
  paciente: Paciente;
  createdAt: string;
  updatedAt: string;
}

export default function Agendamentos() {
  const { user, isLoaded } = useUser();
  
  // Estados
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [medicos, setMedicos] = useState<Medico[]>([]);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dataFiltro, setDataFiltro] = useState("");
  const [medicoFiltro, setMedicoFiltro] = useState("");
  const [pacienteFiltro, setPacienteFiltro] = useState("");
  const [statusFiltro, setStatusFiltro] = useState("");
  
  // Modal
  const [modalAberto, setModalAberto] = useState(false);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [agendamentoAtual, setAgendamentoAtual] = useState<Partial<Agendamento>>({});
  
  // Formatação de data
  const formatarData = (dataString: string) => {
    try {
      const data = parseISO(dataString);
      return format(data, "dd/MM/yyyy", { locale: ptBR });
    } catch (error) {
      return dataString;
    }
  };

  // Buscar dados
  const buscarAgendamentos = async () => {
    setLoading(true);
    try {
      let url = "/api/agendamentos?";
      
      if (dataFiltro) url += `data=${dataFiltro}&`;
      if (medicoFiltro) url += `medicoId=${medicoFiltro}&`;
      if (pacienteFiltro) url += `pacienteId=${pacienteFiltro}&`;
      if (statusFiltro) url += `status=${statusFiltro}&`;
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setAgendamentos(data);
      } else {
        const erro = await response.json();
        toast.error(`Erro ao buscar agendamentos: ${erro.error || 'Erro desconhecido'}`);
      }
    } catch (error) {
      console.error("Erro ao buscar agendamentos:", error);
      toast.error("Erro ao buscar agendamentos");
    } finally {
      setLoading(false);
    }
  };

  const buscarMedicos = async () => {
    try {
      const response = await fetch("/api/medicos");
      if (response.ok) {
        const data = await response.json();
        setMedicos(data);
      } else {
        const erro = await response.json();
        toast.error(`Erro ao buscar médicos: ${erro.error || 'Erro desconhecido'}`);
      }
    } catch (error) {
      console.error("Erro ao buscar médicos:", error);
      toast.error("Erro ao buscar médicos");
    }
  };

  const buscarPacientes = async () => {
    try {
      const response = await fetch("/api/pacientes");
      if (response.ok) {
        const data = await response.json();
        setPacientes(data);
      } else {
        const erro = await response.json();
        toast.error(`Erro ao buscar pacientes: ${erro.error || 'Erro desconhecido'}`);
      }
    } catch (error) {
      console.error("Erro ao buscar pacientes:", error);
      toast.error("Erro ao buscar pacientes");
    }
  };

  // Efeito para carregar dados iniciais
  useEffect(() => {
    if (isLoaded && user) {
      buscarAgendamentos();
      buscarMedicos();
      buscarPacientes();
    }
  }, [isLoaded, user, dataFiltro, medicoFiltro, pacienteFiltro, statusFiltro]);

  // Funções para manipulação de agendamentos
  const handleSalvarAgendamento = async () => {
    try {
      if (!agendamentoAtual.data || !agendamentoAtual.hora || !agendamentoAtual.medicoId || !agendamentoAtual.pacienteId) {
        toast.error("Preencha todos os campos obrigatórios");
        return;
      }

      const method = modoEdicao ? "PUT" : "POST";
      const url = modoEdicao 
        ? `/api/agendamentos/${agendamentoAtual.id}` 
        : "/api/agendamentos";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(agendamentoAtual),
      });

      if (response.ok) {
        setModalAberto(false);
        setAgendamentoAtual({});
        buscarAgendamentos();
        toast.success(modoEdicao ? "Agendamento atualizado com sucesso!" : "Agendamento criado com sucesso!");
      } else {
        const erro = await response.json();
        toast.error(`Erro: ${erro.error || 'Erro desconhecido'}`);
      }
    } catch (error) {
      console.error("Erro ao salvar agendamento:", error);
      toast.error("Erro ao salvar agendamento");
    }
  };

  const handleExcluirAgendamento = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este agendamento?")) return;
    
    try {
      const response = await fetch(`/api/agendamentos/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        buscarAgendamentos();
        toast.success("Agendamento excluído com sucesso!");
      } else {
        const erro = await response.json();
        toast.error(`Erro: ${erro.error || 'Erro desconhecido'}`);
      }
    } catch (error) {
      console.error("Erro ao excluir agendamento:", error);
      toast.error("Erro ao excluir agendamento");
    }
  };

  const handleAbrirModalAdicionar = () => {
    setModoEdicao(false);
    setAgendamentoAtual({
      data: new Date().toISOString().split("T")[0],
      status: "agendado"
    });
    setModalAberto(true);
  };

  const handleAbrirModalEditar = (agendamento: Agendamento) => {
    setModoEdicao(true);
    // Formatar a data para o formato esperado pelo input date (YYYY-MM-DD)
    const dataFormatada = new Date(agendamento.data).toISOString().split("T")[0];
    
    setAgendamentoAtual({
      ...agendamento,
      data: dataFormatada
    });
    setModalAberto(true);
  };

  // Redirecionar para a página inicial se o usuário não estiver autenticado
  if (isLoaded && !user) {
    redirect("/");
  }

  // Função para obter a classe de cor com base no status
  const getStatusClass = (status: string) => {
    switch (status) {
      case "agendado":
        return "bg-blue-100 text-blue-800";
      case "confirmado":
        return "bg-green-100 text-green-800";
      case "cancelado":
        return "bg-red-100 text-red-800";
      case "realizado":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="w-full">
      <h1 className="animate-fade-up bg-gradient-to-br from-black to-stone-500 bg-clip-text font-display text-3xl font-bold tracking-[-0.02em] text-transparent opacity-0 drop-shadow-sm [text-wrap:balance] md:text-4xl md:leading-[3.5rem]" style={{ animationDelay: "0.15s", animationFillMode: "forwards" }}>
        Agendamentos
      </h1>
      
      <div className="mt-8 rounded-xl border border-gray-200 bg-white shadow-sm">
        {/* Filtros */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-end">
            <div className="w-full md:w-auto">
              <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
              <input
                type="date"
                value={dataFiltro}
                onChange={(e) => setDataFiltro(e.target.value)}
                className="w-full md:w-auto px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            <div className="w-full md:w-auto">
              <label className="block text-sm font-medium text-gray-700 mb-1">Médico</label>
              <select
                value={medicoFiltro}
                onChange={(e) => setMedicoFiltro(e.target.value)}
                className="w-full md:w-auto px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Todos</option>
                {medicos.map((medico) => (
                  <option key={medico.id} value={medico.id}>
                    {medico.nome}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="w-full md:w-auto">
              <label className="block text-sm font-medium text-gray-700 mb-1">Paciente</label>
              <select
                value={pacienteFiltro}
                onChange={(e) => setPacienteFiltro(e.target.value)}
                className="w-full md:w-auto px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Todos</option>
                {pacientes.map((paciente) => (
                  <option key={paciente.id} value={paciente.id}>
                    {paciente.nome}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="w-full md:w-auto">
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={statusFiltro}
                onChange={(e) => setStatusFiltro(e.target.value)}
                className="w-full md:w-auto px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Todos</option>
                <option value="agendado">Agendado</option>
                <option value="confirmado">Confirmado</option>
                <option value="cancelado">Cancelado</option>
                <option value="realizado">Realizado</option>
              </select>
            </div>
            
            <button
              onClick={() => {
                setDataFiltro("");
                setMedicoFiltro("");
                setPacienteFiltro("");
                setStatusFiltro("");
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Limpar Filtros
            </button>
          </div>
        </div>
        
        {/* Cabeçalho da lista */}
        <div className="px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <Calendar className="h-5 w-5 text-indigo-600 mr-2" />
            <h3 className="font-display text-lg font-bold">Lista de Agendamentos</h3>
          </div>
          
          <button
            onClick={handleAbrirModalAdicionar}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Plus className="-ml-1 mr-2 h-5 w-5" />
            Novo Agendamento
          </button>
        </div>
        
        {/* Tabela de agendamentos */}
        <div className="overflow-x-hidden">
          <style jsx>{`
            td {
              max-width: 150px;
              overflow-wrap: break-word;
              word-wrap: break-word;
            }
          `}</style>
          
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3">Data</th>
                <th scope="col" className="px-6 py-3">Hora</th>
                <th scope="col" className="px-6 py-3">Paciente</th>
                <th scope="col" className="px-6 py-3">Médico</th>
                <th scope="col" className="px-6 py-3">Especialidade</th>
                <th scope="col" className="px-6 py-3">Status</th>
                <th scope="col" className="px-6 py-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center">Carregando...</td>
                </tr>
              ) : agendamentos.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center">Nenhum agendamento encontrado</td>
                </tr>
              ) : (
                agendamentos.map((agendamento) => (
                  <tr key={agendamento.id} className="bg-white border-b hover:bg-gray-50">
                    <td className="px-6 py-4">{formatarData(agendamento.data)}</td>
                    <td className="px-6 py-4">{agendamento.hora}</td>
                    <td className="px-6 py-4">{agendamento.paciente.nome}</td>
                    <td className="px-6 py-4">{agendamento.medico.nome}</td>
                    <td className="px-6 py-4">{agendamento.medico.especialidade}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusClass(agendamento.status)}`}>
                        {agendamento.status.charAt(0).toUpperCase() + agendamento.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleAbrirModalEditar(agendamento)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleExcluirAgendamento(agendamento.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Modal de Agendamento */}
      {modalAberto && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 md:mx-auto">
            <div className="flex items-center justify-between p-4 border-b rounded-t">
              <h3 className="text-xl font-semibold text-gray-900">
                {modoEdicao ? "Editar Agendamento" : "Novo Agendamento"}
              </h3>
              <button
                onClick={() => setModalAberto(false)}
                className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data *</label>
                <input
                  type="date"
                  value={agendamentoAtual.data || ""}
                  onChange={(e) => setAgendamentoAtual({...agendamentoAtual, data: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hora *</label>
                <input
                  type="time"
                  value={agendamentoAtual.hora || ""}
                  onChange={(e) => setAgendamentoAtual({...agendamentoAtual, hora: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Médico *</label>
                <select
                  value={agendamentoAtual.medicoId || ""}
                  onChange={(e) => setAgendamentoAtual({...agendamentoAtual, medicoId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  required
                >
                  <option value="">Selecione um médico</option>
                  {medicos.map((medico) => (
                    <option key={medico.id} value={medico.id}>
                      {medico.nome} - {medico.especialidade}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Paciente *</label>
                <select
                  value={agendamentoAtual.pacienteId || ""}
                  onChange={(e) => setAgendamentoAtual({...agendamentoAtual, pacienteId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  required
                >
                  <option value="">Selecione um paciente</option>
                  {pacientes.map((paciente) => (
                    <option key={paciente.id} value={paciente.id}>
                      {paciente.nome} - {paciente.cpf}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={agendamentoAtual.status || "agendado"}
                  onChange={(e) => setAgendamentoAtual({...agendamentoAtual, status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="agendado">Agendado</option>
                  <option value="confirmado">Confirmado</option>
                  <option value="cancelado">Cancelado</option>
                  <option value="realizado">Realizado</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
                <textarea
                  value={agendamentoAtual.observacoes || ""}
                  onChange={(e) => setAgendamentoAtual({...agendamentoAtual, observacoes: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Observações sobre o agendamento"
                />
              </div>
            </div>
            
            <div className="flex items-center justify-end p-6 space-x-2 border-t border-gray-200 rounded-b">
              <button
                onClick={() => setModalAberto(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Cancelar
              </button>
              <button
                onClick={handleSalvarAgendamento}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Check className="-ml-1 mr-2 h-5 w-5" />
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}