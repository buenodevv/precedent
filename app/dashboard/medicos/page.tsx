"use client";

import { useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { BriefcaseIcon, Search, PlusCircle, X, Pencil, Trash2, Edit } from "lucide-react";
import { useState, useEffect } from "react";
import Modal from "@/components/shared/modal";
import { toast } from "react-hot-toast";

interface Medico {
  id: string;
  nome: string;
  especialidade: string;
  crm: string;
  email: string;
  telefone: string;
  diasAtendimento?: string[];
  horarioInicio?: string;
  horarioFim?: string;
}

export default function Medicos() {
  const { user, isLoaded } = useUser();
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [medicos, setMedicos] = useState<Medico[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [medicoEmEdicao, setMedicoEmEdicao] = useState<string | null>(null);
  const [novoMedico, setNovoMedico] = useState({
    nome: "",
    especialidade: "",
    crm: "",
    email: "",
    telefone: "",
    diasAtendimento: [] as string[],
    horarioInicio: "",
    horarioFim: ""
  });
  
  // Redirecionar para a página inicial se o usuário não estiver autenticado
  if (isLoaded && !user) {
    redirect("/");
  }

  // Buscar médicos do banco de dados
  useEffect(() => {
    const fetchMedicos = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/medicos${searchTerm ? `?search=${searchTerm}` : ''}`);
        
        if (!response.ok) {
          throw new Error('Erro ao buscar médicos');
        }
        
        const data = await response.json();
        setMedicos(data);
      } catch (error) {
        console.error('Erro ao buscar médicos:', error);
        toast.error('Não foi possível carregar a lista de médicos');
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce para a busca
    const timeoutId = setTimeout(() => {
      fetchMedicos();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Função para lidar com a mudança nos campos do formulário
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNovoMedico(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Função para lidar com a mudança nos checkboxes de dias de atendimento
  const handleDiaAtendimentoChange = (dia: string) => {
    setNovoMedico(prev => {
      const diasAtuais = [...prev.diasAtendimento];
      if (diasAtuais.includes(dia)) {
        return {
          ...prev,
          diasAtendimento: diasAtuais.filter(d => d !== dia)
        };
      } else {
        return {
          ...prev,
          diasAtendimento: [...diasAtuais, dia]
        };
      }
    });
  };

  // Função para abrir o modal de edição
  const handleEditarMedico = (medico: Medico) => {
    setModoEdicao(true);
    setMedicoEmEdicao(medico.id);
    setNovoMedico({
      nome: medico.nome,
      especialidade: medico.especialidade,
      crm: medico.crm,
      email: medico.email,
      telefone: medico.telefone,
      diasAtendimento: medico.diasAtendimento || [],
      horarioInicio: medico.horarioInicio || '',
      horarioFim: medico.horarioFim || ''
    });
    setShowModal(true);
  };

  // Função para adicionar ou atualizar um médico
  const handleSalvarMedico = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (modoEdicao && medicoEmEdicao) {
        // Atualizar médico existente
        const response = await fetch(`/api/medicos/${medicoEmEdicao}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(novoMedico),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Erro ao atualizar médico');
        }

        // Atualizar a lista de médicos
        const medicoAtualizado = await response.json();
        setMedicos(prev => prev.map(m => m.id === medicoAtualizado.id ? medicoAtualizado : m));
        toast.success('Médico atualizado com sucesso!');
      } else {
        // Adicionar novo médico
        const response = await fetch('/api/medicos', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(novoMedico),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Erro ao adicionar médico');
        }

        // Atualizar a lista de médicos
        const medicoAdicionado = await response.json();
        setMedicos(prev => [...prev, medicoAdicionado]);
        toast.success('Médico adicionado com sucesso!');
      }
      
      // Fechar o modal e limpar o formulário
      setShowModal(false);
      setNovoMedico({
        nome: "",
        especialidade: "",
        crm: "",
        email: "",
        telefone: "",
        diasAtendimento: [],
        horarioInicio: "",
        horarioFim: ""
      });
      setModoEdicao(false);
      setMedicoEmEdicao(null);
    } catch (error: any) {
      console.error('Erro ao salvar médico:', error);
      toast.error(error.message || 'Erro ao salvar médico');
    }
  };

  // Função para excluir um médico
  const handleExcluirMedico = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este médico?')) return;
    
    try {
      const response = await fetch(`/api/medicos/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao excluir médico');
      }

      // Remover o médico da lista
      setMedicos(prev => prev.filter(medico => medico.id !== id));
      toast.success('Médico excluído com sucesso!');
    } catch (error: any) {
      console.error('Erro ao excluir médico:', error);
      toast.error(error.message || 'Erro ao excluir médico');
    }
  };

  // Função para abrir o modal de adicionar médico
  const handleAbrirModalAdicionar = () => {
    setModoEdicao(false);
    setMedicoEmEdicao(null);
    setNovoMedico({
      nome: "",
      especialidade: "",
      crm: "",
      email: "",
      telefone: "",
      diasAtendimento: [],
      horarioInicio: "",
      horarioFim: ""
    });
    setShowModal(true);
  };

  return (
    <div className="w-full">
      <h1 className="animate-fade-up bg-gradient-to-br from-black to-stone-500 bg-clip-text font-display text-3xl font-bold tracking-[-0.02em] text-transparent opacity-0 drop-shadow-sm [text-wrap:balance] md:text-4xl md:leading-[3.5rem]" style={{ animationDelay: "0.15s", animationFillMode: "forwards" }}>
        Médicos
      </h1>
      
      <div className="w-full mt-8 rounded-xl border border-gray-200 bg-white shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <h3 className="font-display text-xl font-bold">Lista de Médicos</h3>
            <span className="ml-3 bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {medicos.length} médicos
            </span>
          </div>
          <BriefcaseIcon className="h-6 w-6 text-indigo-600" />
        </div>

        {/* Barra de pesquisa e botão de adicionar */}
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-4 h-4 text-gray-500" />
            </div>
            <input
              type="text"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 p-2.5"
              placeholder="Buscar por nome, especialidade ou CRM..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={handleAbrirModalAdicionar}
            className="z-0 flex items-center justify-center text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 font-medium rounded-lg text-sm px-5 py-2.5 focus:outline-none"
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            Adicionar Médico
          </button>
        </div>

        {/* Tabela de médicos */}
        
        <div className="w-full overflow-x-hidden">
          {isLoading ? (
            <div className="flex justify-center items-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <table className="w-full text-sm text-left text-gray-500">
              <style jsx>{`
                td {
                  max-width: 150px;
                  overflow-wrap: break-word;
                  word-wrap: break-word;
                }
              `}</style>
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3">Nome</th>
                  <th scope="col" className="px-6 py-3">Especialidade</th>
                  <th scope="col" className="px-6 py-3">Email</th>
                  <th scope="col" className="px-6 py-3">Telefone</th>
                  <th scope="col" className="px-6 py-3">Dias de Atendimento</th>
                  <th scope="col" className="px-6 py-3">Horário</th>
                  <th scope="col" className="px-6 py-3">Ações</th>
                </tr>
              </thead>
              <tbody>
                {medicos.length > 0 ? (
                  medicos.map((medico) => (
                    <tr key={medico.id} className="bg-white border-b hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">{medico.nome}</td>
                      <td className="px-6 py-4">{medico.especialidade}</td>
                      <td className="px-6 py-4">{medico.email}</td>
                      <td className="px-6 py-4">{medico.telefone}</td>
                      <td className="px-6 py-4">{medico.diasAtendimento?.join(', ') || 'Não definido'}</td>
                      <td className="px-6 py-4">{medico.horarioInicio && medico.horarioFim ? `${medico.horarioInicio} - ${medico.horarioFim}` : 'Não definido'}</td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <button 
                            className="flex items-center justify-center p-1.5 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 transition-colors duration-200"
                            title="Editar médico"
                            onClick={() => handleEditarMedico(medico)}
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          <button 
                            className="flex items-center justify-center p-1.5 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors duration-200"
                            title="Excluir médico"
                            onClick={() => handleExcluirMedico(medico.id)}
                          >
                            <Trash2 className="w-5 h-5" />
                            
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr className="bg-white border-b">
                    <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                      {searchTerm ? 'Nenhum médico encontrado com os critérios de busca.' : 'Nenhum médico cadastrado.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal para adicionar/editar médico */}
      <Modal showModal={showModal} setShowModal={setShowModal}>
        <div className="w-full overflow-hidden md:max-w-md md:rounded-2xl md:border md:border-gray-100 md:shadow-xl">
          <div className="flex flex-col space-y-4 bg-white px-4 py-6 pt-8 md:px-16">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-2xl font-bold">
                {modoEdicao ? 'Editar Médico' : 'Adicionar Médico'}
              </h3>
              <button 
                onClick={() => {
                  setShowModal(false);
                  setModoEdicao(false);
                  setMedicoEmEdicao(null);
                  setNovoMedico({
                    nome: "",
                    especialidade: "",
                    crm: "",
                    email: "",
                    telefone: "",
                    diasAtendimento: [],
                    horarioInicio: "",
                    horarioFim: ""
                  });
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleSalvarMedico} className="space-y-4">
              <div>
                <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                <input
                  type="text"
                  id="nome"
                  name="nome"
                  value={novoMedico.nome}
                  onChange={handleInputChange}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
                  placeholder="Dr. Nome Completo"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="especialidade" className="block text-sm font-medium text-gray-700 mb-1">Especialidade</label>
                <input
                  type="text"
                  id="especialidade"
                  name="especialidade"
                  value={novoMedico.especialidade}
                  onChange={handleInputChange}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
                  placeholder="Cardiologia, Ortopedia, etc."
                  required
                />
              </div>
              
              <div>
                <label htmlFor="crm" className="block text-sm font-medium text-gray-700 mb-1">CRM</label>
                <input
                  type="text"
                  id="crm"
                  name="crm"
                  value={novoMedico.crm}
                  onChange={handleInputChange}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
                  placeholder="12345-UF"
                  required
                  readOnly={modoEdicao} // CRM não pode ser alterado na edição
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={novoMedico.email}
                  onChange={handleInputChange}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
                  placeholder="nome@exemplo.com"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="telefone" className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                <input
                  type="text"
                  id="telefone"
                  name="telefone"
                  value={novoMedico.telefone}
                  onChange={handleInputChange}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
                  placeholder="(00) 00000-0000"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dias de Atendimento</label>
                <div className="grid grid-cols-4 gap-2">
                  {['seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom'].map((dia) => (
                    <div key={dia} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`dia-${dia}`}
                        checked={novoMedico.diasAtendimento?.includes(dia) || false}
                        onChange={() => handleDiaAtendimentoChange(dia)}
                        className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500"
                      />
                      <label htmlFor={`dia-${dia}`} className="ml-2 text-sm font-medium text-gray-700 capitalize">
                        {dia}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="horarioInicio" className="block text-sm font-medium text-gray-700 mb-1">Horário Início</label>
                  <input
                    type="time"
                    id="horarioInicio"
                    name="horarioInicio"
                    value={novoMedico.horarioInicio}
                    onChange={handleInputChange}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
                  />
                </div>
                <div>
                  <label htmlFor="horarioFim" className="block text-sm font-medium text-gray-700 mb-1">Horário Fim</label>
                  <input
                    type="time"
                    id="horarioFim"
                    name="horarioFim"
                    value={novoMedico.horarioFim}
                    onChange={handleInputChange}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setModoEdicao(false);
                    setMedicoEmEdicao(null);
                    setNovoMedico({
                      nome: "",
                      especialidade: "",
                      crm: "",
                      email: "",
                      telefone: "",
                      diasAtendimento: [],
                      horarioInicio: "",
                      horarioFim: ""
                    });
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      </Modal>
    </div>
  );
}