import { NextRequest, NextResponse } from 'next/server';
import { PacienteService } from '@/lib/services/pacienteService';

// GET /api/pacientes/[id] - Buscar paciente por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const paciente = await PacienteService.findById(params.id);
    
    if (!paciente) {
      return NextResponse.json(
        { error: 'Paciente não encontrado' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(paciente);
  } catch (error) {
    console.error('Erro ao buscar paciente:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar paciente' },
      { status: 500 }
    );
  }
}

// PUT /api/pacientes/[id] - Atualizar paciente
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const pacienteAtualizado = await PacienteService.update(params.id, body);
    
    return NextResponse.json(pacienteAtualizado);
  } catch (error: any) {
    console.error('Erro ao atualizar paciente:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Paciente não encontrado' },
        { status: 404 }
      );
    }
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: `Já existe um paciente com este ${error.meta?.target[0]}` },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Erro ao atualizar paciente' },
      { status: 500 }
    );
  }
}

// DELETE /api/pacientes/[id] - Excluir paciente
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await PacienteService.delete(params.id);
    
    return NextResponse.json(
      { message: 'Paciente excluído com sucesso' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Erro ao excluir paciente:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Paciente não encontrado' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Erro ao excluir paciente' },
      { status: 500 }
    );
  }
}