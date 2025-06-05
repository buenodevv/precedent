"use client";

import { useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { Users, Search, PlusCircle, X, Pencil, Trash2, Edit } from "lucide-react";
import { useState, useEffect } from "react";
import Modal from "@/components/shared/modal";
import { toast } from "react-hot-toast";

// Função para formatar a data no padrão dia/mês/ano
const formatarData = (dataString: string): string => {
  if (!dataString) return "";
  
  try {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch (error) {
    console.error('Erro ao formatar data:', error);
    return dataString; // Retorna a string original em caso de erro
  }
};

interface Paciente {
  id: string;
  nome: string;
  dataNascimento: string;
  cpf: string;
  email: string;
  telefone: string;
  endereco: string;
}

export default function Pacientes() {
  const { user, isLoaded } = useUser();
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [pacienteEmEdicao, setPacienteEmEdicao] = useState<string | null>(null);
  const [novoPaciente, setNovoPaciente] = useState({
    nome: "",
    dataNascimento: "",
    cpf: "",
    email: "",
    telefone: "",
    endereco: ""
  });
  
  // Redirecionar para a página inicial se o usuário não estiver autenticado
  if (isLoaded && !user) {
    redirect("/");
  }

  // Buscar pacientes do banco de dados
  useEffect(() => {
    const fetchPacientes = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/pacientes${searchTerm ? `?search=${searchTerm}` : ''}`);
        
        if (!response.ok) {
          throw new Error('Erro ao buscar pacientes');
        }
        
        const data = await response.json();
        setPacientes(data);
      } catch (error) {
        console.error('Erro ao buscar pacientes:', error);
        toast.error('Não foi possível carregar a lista de pacientes');
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce para a busca
    const timeoutId = setTimeout(() => {
      fetchPacientes();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Função para lidar com a mudança nos campos do formulário
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNovoPaciente(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Função para abrir o modal de edição
  const handleEditarPaciente = (paciente: Paciente) => {
    setModoEdicao(true);
    setPacienteEmEdicao(paciente.id);
    
    // Formatar a data para o formato YYYY-MM-DD para o input type="date"
    let dataFormatada = paciente.dataNascimento;
    try {
      // Se a data vier com timezone, precisamos extrair apenas a parte da data
      if (paciente.dataNascimento.includes('T')) {
        dataFormatada = paciente.dataNascimento.split('T')[0];
      }
    } catch (error) {
      console.error('Erro ao formatar data para edição:', error);
    }
    
    setNovoPaciente({
      nome: paciente.nome,
      dataNascimento: dataFormatada,
      cpf: paciente.cpf,
      email: paciente.email,
      telefone: paciente.telefone,
      endereco: paciente.endereco
    });
    setShowModal(true);
  };

  // Função para adicionar ou atualizar um paciente
  const handleSalvarPaciente = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Corrigir o problema de fuso horário na data de nascimento
    const dadosAjustados = { ...novoPaciente };
    if (dadosAjustados.dataNascimento) {
      // Adiciona a hora (12:00:00) para evitar problemas de fuso horário
      // e garantir que a data seja a mesma em qualquer fuso horário
      const [ano, mes, dia] = dadosAjustados.dataNascimento.split('-');
      if (ano && mes && dia) {
        const dataCorrigida = `${ano}-${mes}-${dia}T12:00:00.000Z`;
        dadosAjustados.dataNascimento = dataCorrigida;
      }
    }
    
    try {
      if (modoEdicao && pacienteEmEdicao) {
        // Atualizar paciente existente
        const response = await fetch(`/api/pacientes/${pacienteEmEdicao}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(dadosAjustados),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Erro ao atualizar paciente');
        }

        // Atualizar a lista de pacientes
        const pacienteAtualizado = await response.json();
        setPacientes(prev => prev.map(p => p.id === pacienteAtualizado.id ? pacienteAtualizado : p));
        toast.success('Paciente atualizado com sucesso!');
      } else {
        // Adicionar novo paciente
        const response = await fetch('/api/pacientes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(dadosAjustados),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Erro ao adicionar paciente');
        }

        // Atualizar a lista de pacientes
        const pacienteAdicionado = await response.json();
        setPacientes(prev => [...prev, pacienteAdicionado]);
        toast.success('Paciente adicionado com sucesso!');
      }
      
      // Fechar o modal e limpar o formulário
      setShowModal(false);
      setNovoPaciente({
        nome: "",
        dataNascimento: "",
        cpf: "",
        email: "",
        telefone: "",
        endereco: ""
      });
      setModoEdicao(false);
      setPacienteEmEdicao(null);
    } catch (error: any) {
      console.error('Erro ao salvar paciente:', error);
      toast.error(error.message || 'Erro ao salvar paciente');
    }
  };

  // Função para excluir um paciente
  const handleExcluirPaciente = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este paciente?')) return;
    
    try {
      const response = await fetch(`/api/pacientes/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao excluir paciente');
      }

      // Remover o paciente da lista
      setPacientes(prev => prev.filter(paciente => paciente.id !== id));
      toast.success('Paciente excluído com sucesso!');
    } catch (error: any) {
      console.error('Erro ao excluir paciente:', error);
      toast.error(error.message || 'Erro ao excluir paciente');
    }
  };

  // Função para abrir o modal de adicionar paciente
  const handleAbrirModalAdicionar = () => {
    setModoEdicao(false);
    setPacienteEmEdicao(null);
    setNovoPaciente({
      nome: "",
      dataNascimento: "",
      cpf: "",
      email: "",
      telefone: "",
      endereco: ""
    });
    setShowModal(true);
  };

  return (
    <div className="w-full">
      <h1 className="animate-fade-up bg-gradient-to-br from-black to-stone-500 bg-clip-text font-display text-3xl font-bold tracking-[-0.02em] text-transparent opacity-0 drop-shadow-sm [text-wrap:balance] md:text-4xl md:leading-[3.5rem]" style={{ animationDelay: "0.15s", animationFillMode: "forwards" }}>
        Pacientes
      </h1>
      
      <div className="mt-8 rounded-xl border border-gray-200 bg-white shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <h3 className="font-display text-xl font-bold">Lista de Pacientes</h3>
            <span className="ml-3 bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {pacientes.length} pacientes
            </span>
          </div>
          <Users className="h-6 w-6 text-indigo-600" />
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
              placeholder="Buscar por nome, CPF ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={handleAbrirModalAdicionar}
            className="z-0 flex items-center justify-center text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 font-medium rounded-lg text-sm px-5 py-2.5 focus:outline-none"
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            Adicionar Paciente
          </button>
        </div>

        {/* Tabela de pacientes */}
        <div className="relative overflow-x-hidden shadow-md sm:rounded-lg">
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
                  <th scope="col" className="px-6 py-3">Data de Nascimento</th>
                  <th scope="col" className="px-6 py-3">CPF</th>
                  <th scope="col" className="px-6 py-3">Email</th>
                  <th scope="col" className="px-6 py-3">Telefone</th>
                  <th scope="col" className="px-6 py-3">Ações</th>
                </tr>
              </thead>
              <tbody>
                {pacientes.length > 0 ? (
                  pacientes.map((paciente) => (
                    <tr key={paciente.id} className="bg-white border-b hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">{paciente.nome}</td>
                      <td className="px-6 py-4">{formatarData(paciente.dataNascimento)}</td>
                      <td className="px-6 py-4">{paciente.cpf}</td>
                      <td className="px-6 py-4">{paciente.email}</td>
                      <td className="px-6 py-4">{paciente.telefone}</td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <button 
                            className="flex items-center justify-center p-1.5 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 transition-colors duration-200"
                            title="Editar paciente"
                            onClick={() => handleEditarPaciente(paciente)}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            className="flex items-center justify-center p-1.5 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors duration-200"
                            title="Excluir paciente"
                            onClick={() => handleExcluirPaciente(paciente.id)}
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr className="bg-white border-b">
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                      {searchTerm ? 'Nenhum paciente encontrado com os critérios de busca.' : 'Nenhum paciente cadastrado.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal para adicionar/editar paciente */}
      <Modal showModal={showModal} setShowModal={setShowModal}>
        <div className="w-full overflow-hidden md:max-w-md md:rounded-2xl md:border md:border-gray-100 md:shadow-xl">
          <div className="flex flex-col space-y-4 bg-white px-4 py-6 pt-8 md:px-16">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-2xl font-bold">
                {modoEdicao ? 'Editar Paciente' : 'Adicionar Paciente'}
              </h3>
              <button 
                onClick={() => {
                  setShowModal(false);
                  setModoEdicao(false);
                  setPacienteEmEdicao(null);
                  setNovoPaciente({
                    nome: "",
                    dataNascimento: "",
                    cpf: "",
                    email: "",
                    telefone: "",
                    endereco: ""
                  });
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleSalvarPaciente} className="space-y-4">
              <div>
                <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                <input
                  type="text"
                  id="nome"
                  name="nome"
                  value={novoPaciente.nome}
                  onChange={handleInputChange}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
                  placeholder="Nome Completo"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="dataNascimento" className="block text-sm font-medium text-gray-700 mb-1">Data de Nascimento</label>
                <input
                  type="date"
                  id="dataNascimento"
                  name="dataNascimento"
                  value={novoPaciente.dataNascimento}
                  onChange={handleInputChange}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="cpf" className="block text-sm font-medium text-gray-700 mb-1">CPF</label>
                <input
                  type="text"
                  id="cpf"
                  name="cpf"
                  value={novoPaciente.cpf}
                  onChange={handleInputChange}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
                  placeholder="000.000.000-00"
                  required
                  readOnly={modoEdicao} // CPF não pode ser alterado na edição
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={novoPaciente.email}
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
                  value={novoPaciente.telefone}
                  onChange={handleInputChange}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
                  placeholder="(00) 00000-0000"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="endereco" className="block text-sm font-medium text-gray-700 mb-1">Endereço</label>
                <input
                  type="text"
                  id="endereco"
                  name="endereco"
                  value={novoPaciente.endereco}
                  onChange={handleInputChange}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
                  placeholder="Rua, número, bairro, cidade - UF"
                  required
                />
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setModoEdicao(false);
                    setPacienteEmEdicao(null);
                    setNovoPaciente({
                      nome: "",
                      dataNascimento: "",
                      cpf: "",
                      email: "",
                      telefone: "",
                      endereco: ""
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