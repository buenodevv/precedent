import { Agendamento, Prisma } from '@prisma/client';
import prisma from '../prisma';

export interface AgendamentoInput {
  data: Date;
  hora: string;
  status?: string;
  observacoes?: string;
  medicoId: string;
  pacienteId: string;
}

export interface AgendamentoFiltro {
  data?: Date;
  medicoId?: string;
  pacienteId?: string;
  status?: string;
}

export class AgendamentoService {
  // Buscar todos os agendamentos
  static async findAll(): Promise<Agendamento[]> {
    return prisma.agendamento.findMany({
      include: {
        medico: true,
        paciente: true
      },
      orderBy: { data: 'asc' }
    });
  }

  // Buscar agendamento por ID
  static async findById(id: string): Promise<Agendamento | null> {
    return prisma.agendamento.findUnique({
      where: { id },
      include: {
        medico: true,
        paciente: true
      }
    });
  }

  // Criar um novo agendamento
  static async create(data: AgendamentoInput): Promise<Agendamento> {
    return prisma.agendamento.create({
      data,
      include: {
        medico: true,
        paciente: true
      }
    });
  }

  // Atualizar um agendamento existente
  static async update(id: string, data: Partial<AgendamentoInput>): Promise<Agendamento> {
    return prisma.agendamento.update({
      where: { id },
      data,
      include: {
        medico: true,
        paciente: true
      }
    });
  }

  // Excluir um agendamento
  static async delete(id: string): Promise<Agendamento> {
    return prisma.agendamento.delete({
      where: { id },
      include: {
        medico: true,
        paciente: true
      }
    });
  }

  // Buscar agendamentos por filtros
  static async findByFilters(filtros: AgendamentoFiltro): Promise<Agendamento[]> {
    const where: Prisma.AgendamentoWhereInput = {};
    
    if (filtros.data) {
      // Buscar agendamentos para a data específica
      const dataInicio = new Date(filtros.data);
      dataInicio.setHours(0, 0, 0, 0);
      
      const dataFim = new Date(filtros.data);
      dataFim.setHours(23, 59, 59, 999);
      
      where.data = {
        gte: dataInicio,
        lte: dataFim
      };
    }
    
    if (filtros.medicoId) {
      where.medicoId = filtros.medicoId;
    }
    
    if (filtros.pacienteId) {
      where.pacienteId = filtros.pacienteId;
    }
    
    if (filtros.status) {
      where.status = filtros.status;
    }
    
    return prisma.agendamento.findMany({
      where,
      include: {
        medico: true,
        paciente: true
      },
      orderBy: [
        { data: 'asc' },
        { hora: 'asc' }
      ]
    });
  }

  // Verificar disponibilidade do médico
  static async verificarDisponibilidade(medicoId: string, data: Date, hora: string): Promise<boolean> {
    const dataInicio = new Date(data);
    dataInicio.setHours(0, 0, 0, 0);
    
    const dataFim = new Date(data);
    dataFim.setHours(23, 59, 59, 999);
    
    const agendamentosExistentes = await prisma.agendamento.findMany({
      where: {
        medicoId,
        data: {
          gte: dataInicio,
          lte: dataFim
        },
        hora,
        status: {
          notIn: ['cancelado']
        }
      }
    });
    
    return agendamentosExistentes.length === 0;
  }
}