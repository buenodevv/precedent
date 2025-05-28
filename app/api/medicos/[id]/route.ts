import { NextRequest, NextResponse } from 'next/server';
import { MedicoService } from '@/lib/services/medicoService';

// GET /api/medicos/[id] - Buscar médico por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const medico = await MedicoService.findById(params.id);
    
    if (!medico) {
      return NextResponse.json(
        { error: 'Médico não encontrado' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(medico);
  } catch (error) {
    console.error('Erro ao buscar médico:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar médico' },
      { status: 500 }
    );
  }
}

// PUT /api/medicos/[id] - Atualizar médico
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const medicoAtualizado = await MedicoService.update(params.id, body);
    
    return NextResponse.json(medicoAtualizado);
  } catch (error: any) {
    console.error('Erro ao atualizar médico:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Médico não encontrado' },
        { status: 404 }
      );
    }
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: `Já existe um médico com este ${error.meta?.target[0]}` },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Erro ao atualizar médico' },
      { status: 500 }
    );
  }
}

// DELETE /api/medicos/[id] - Excluir médico
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await MedicoService.delete(params.id);
    
    return NextResponse.json(
      { message: 'Médico excluído com sucesso' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Erro ao excluir médico:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Médico não encontrado' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Erro ao excluir médico' },
      { status: 500 }
    );
  }
}