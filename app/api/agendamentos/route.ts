import { NextRequest, NextResponse } from 'next/server';
import { AgendamentoService } from '@/lib/services/agendamentoService';

// GET /api/agendamentos - Listar todos os agendamentos ou filtrar por data, médico, paciente ou status
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const data = searchParams.get('data');
    const medicoId = searchParams.get('medicoId');
    const pacienteId = searchParams.get('pacienteId');
    const status = searchParams.get('status');
    
    // Se tiver parâmetros de busca, filtra os agendamentos
    if (data || medicoId || pacienteId || status) {
      const filtros: any = {};
      
      if (data) {
        filtros.data = new Date(data);
      }
      
      if (medicoId) {
        filtros.medicoId = medicoId;
      }
      
      if (pacienteId) {
        filtros.pacienteId = pacienteId;
      }
      
      if (status) {
        filtros.status = status;
      }
      
      const agendamentos = await AgendamentoService.findByFilters(filtros);
      return NextResponse.json(agendamentos);
    }
    
    // Caso contrário, retorna todos os agendamentos
    const agendamentos = await AgendamentoService.findAll();
    return NextResponse.json(agendamentos);
  } catch (error: any) {
    console.error('Erro ao buscar agendamentos:', error);
    return NextResponse.json({ error: 'Erro ao buscar agendamentos' }, { status: 500 });
  }
}

// POST /api/agendamentos - Criar um novo agendamento
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validar campos obrigatórios
    if (!body.data || !body.hora || !body.medicoId || !body.pacienteId) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: data, hora, medicoId, pacienteId' },
        { status: 400 }
      );
    }
    
    // Verificar disponibilidade do médico
    const disponivel = await AgendamentoService.verificarDisponibilidade(
      body.medicoId,
      new Date(body.data),
      body.hora
    );
    
    if (!disponivel) {
      return NextResponse.json(
        { error: 'Horário não disponível para este médico' },
        { status: 409 }
      );
    }
    
    // Criar o agendamento
    const novoAgendamento = await AgendamentoService.create({
      data: new Date(body.data),
      hora: body.hora,
      status: body.status || 'agendado',
      observacoes: body.observacoes,
      medicoId: body.medicoId,
      pacienteId: body.pacienteId
    });
    
    return NextResponse.json(novoAgendamento, { status: 201 });
  } catch (error: any) {
    console.error('Erro ao criar agendamento:', error);
    
    // Verificar erros específicos
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Já existe um agendamento para este horário' },
        { status: 409 }
      );
    }
    
    if (error.code === 'P2003') {
      return NextResponse.json(
        { error: 'Médico ou paciente não encontrado' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Erro ao criar agendamento' },
      { status: 500 }
    );
  }
}