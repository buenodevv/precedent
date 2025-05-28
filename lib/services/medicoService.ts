import { Medico } from '@prisma/client';
import prisma from '../prisma';

export interface MedicoInput {
  nome: string;
  especialidade: string;
  crm: string;
  email: string;
  telefone: string;
}

export class MedicoService {
  // Buscar todos os médicos
  static async findAll(): Promise<Medico[]> {
    return prisma.medico.findMany({
      orderBy: { nome: 'asc' }
    });
  }

  // Buscar médico por ID
  static async findById(id: string): Promise<Medico | null> {
    return prisma.medico.findUnique({
      where: { id }
    });
  }

  // Criar um novo médico
  static async create(data: MedicoInput): Promise<Medico> {
    return prisma.medico.create({
      data
    });
  }

  // Atualizar um médico existente
  static async update(id: string, data: Partial<MedicoInput>): Promise<Medico> {
    return prisma.medico.update({
      where: { id },
      data
    });
  }

  // Excluir um médico
  static async delete(id: string): Promise<Medico> {
    return prisma.medico.delete({
      where: { id }
    });
  }

  // Buscar médicos por termo de busca
  static async search(searchTerm: string): Promise<Medico[]> {
    return prisma.medico.findMany({
      where: {
        OR: [
          { nome: { contains: searchTerm, mode: 'insensitive' } },
          { especialidade: { contains: searchTerm, mode: 'insensitive' } },
          { crm: { contains: searchTerm, mode: 'insensitive' } }
        ]
      },
      orderBy: { nome: 'asc' }
    });
  }
}