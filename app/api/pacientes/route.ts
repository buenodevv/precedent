import { NextRequest, NextResponse } from 'next/server';
import { PacienteService, PacienteInput } from '@/lib/services/pacienteService';

// GET /api/pacientes - Listar todos os pacientes
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search');

    let pacientes;
    if (search) {
      pacientes = await PacienteService.search(search);
    } else {
      pacientes = await PacienteService.findAll();
    }

    return NextResponse.json(pacientes);
  } catch (error) {
    console.error('Erro ao buscar pacientes:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar pacientes' },
      { status: 500 }
    );
  }
}

// POST /api/pacientes - Criar um novo paciente
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const pacienteData: PacienteInput = {
      nome: body.nome,
      dataNascimento: body.dataNascimento,
      cpf: body.cpf,
      email: body.email,
      telefone: body.telefone,
      endereco: body.endereco
    };

    const novoPaciente = await PacienteService.create(pacienteData);
    return NextResponse.json(novoPaciente, { status: 201 });
  } catch (error: any) {
    console.error('Erro ao criar paciente:', error);
    
    // Verificar se é um erro de validação do Prisma (campo único)
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: `Já existe um paciente com este ${error.meta?.target[0]}` },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Erro ao criar paciente' },
      { status: 500 }
    );
  }
}