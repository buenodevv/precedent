import { NextRequest, NextResponse } from 'next/server';
import { AgendamentoService } from '@/lib/services/agendamentoService';

// GET /api/agendamentos/[id] - Obter um agendamento específico
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    const agendamento = await AgendamentoService.findById(id);
    
    if (!agendamento) {
      return NextResponse.json(
        { error: 'Agendamento não encontrado' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(agendamento);
  } catch (error: any) {
    console.error('Erro ao buscar agendamento:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar agendamento' },
      { status: 500 }
    );
  }
}

// PUT /api/agendamentos/[id] - Atualizar um agendamento
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    const body = await request.json();
    
    // Verificar se o agendamento existe
    const agendamentoExistente = await AgendamentoService.findById(id);
    if (!agendamentoExistente) {
      return NextResponse.json(
        { error: 'Agendamento não encontrado' },
        { status: 404 }
      );
    }
    
    // Se estiver alterando data ou hora, verificar disponibilidade
    if ((body.data && body.data !== agendamentoExistente.data.toISOString().split('T')[0]) || 
        (body.hora && body.hora !== agendamentoExistente.hora)) {
      
      const dataVerificar = body.data ? new Date(body.data) : agendamentoExistente.data;
      const horaVerificar = body.hora || agendamentoExistente.hora;
      const medicoId = body.medicoId || agendamentoExistente.medicoId;
      
      const disponivel = await AgendamentoService.verificarDisponibilidade(
        medicoId,
        dataVerificar,
        horaVerificar
      );
      
      if (!disponivel) {
        return NextResponse.json(
          { error: 'Horário não disponível para este médico' },
          { status: 409 }
        );
      }
    }
    
    // Preparar dados para atualização
    const dadosAtualizacao: any = {};
    
    if (body.data) {
      dadosAtualizacao.data = new Date(body.data);
    }
    
    if (body.hora) {
      dadosAtualizacao.hora = body.hora;
    }
    
    if (body.status) {
      dadosAtualizacao.status = body.status;
    }
    
    if (body.observacoes !== undefined) {
      dadosAtualizacao.observacoes = body.observacoes;
    }
    
    if (body.medicoId) {
      dadosAtualizacao.medicoId = body.medicoId;
    }
    
    if (body.pacienteId) {
      dadosAtualizacao.pacienteId = body.pacienteId;
    }
    
    // Atualizar o agendamento
    const agendamentoAtualizado = await AgendamentoService.update(id, dadosAtualizacao);
    
    return NextResponse.json(agendamentoAtualizado);
  } catch (error: any) {
    console.error('Erro ao atualizar agendamento:', error);
    
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
      { error: 'Erro ao atualizar agendamento' },
      { status: 500 }
    );
  }
}

// DELETE /api/agendamentos/[id] - Excluir um agendamento
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    
    // Verificar se o agendamento existe
    const agendamentoExistente = await AgendamentoService.findById(id);
    if (!agendamentoExistente) {
      return NextResponse.json(
        { error: 'Agendamento não encontrado' },
        { status: 404 }
      );
    }
    
    // Excluir o agendamento
    await AgendamentoService.delete(id);
    
    return NextResponse.json(
      { message: 'Agendamento excluído com sucesso' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Erro ao excluir agendamento:', error);
    return NextResponse.json(
      { error: 'Erro ao excluir agendamento' },
      { status: 500 }
    );
  }
}