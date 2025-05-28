import { Paciente } from '@prisma/client';
import prisma from '../prisma';

export interface PacienteInput {
  nome: string;
  dataNascimento: string;
  cpf: string;
  email: string;
  telefone: string;
  endereco: string;
}

export class PacienteService {
  // Buscar todos os pacientes
  static async findAll(): Promise<Paciente[]> {
    return prisma.paciente.findMany({
      orderBy: { nome: 'asc' }
    });
  }

  // Buscar paciente por ID
  static async findById(id: string): Promise<Paciente | null> {
    return prisma.paciente.findUnique({
      where: { id }
    });
  }

  // Criar um novo paciente
  static async create(data: PacienteInput): Promise<Paciente> {
    return prisma.paciente.create({
      data
    });
  }

  // Atualizar um paciente existente
  static async update(id: string, data: Partial<PacienteInput>): Promise<Paciente> {
    return prisma.paciente.update({
      where: { id },
      data
    });
  }

  // Excluir um paciente
  static async delete(id: string): Promise<Paciente> {
    return prisma.paciente.delete({
      where: { id }
    });
  }

  // Buscar pacientes por termo de busca
  static async search(searchTerm: string): Promise<Paciente[]> {
    return prisma.paciente.findMany({
      where: {
        OR: [
          { nome: { contains: searchTerm, mode: 'insensitive' } },
          { cpf: { contains: searchTerm, mode: 'insensitive' } },
          { email: { contains: searchTerm, mode: 'insensitive' } }
        ]
      },
      orderBy: { nome: 'asc' }
    });
  }
}