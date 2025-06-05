import { NextRequest, NextResponse } from 'next/server';
import { MedicoService, MedicoInput } from '@/lib/services/medicoService';

// GET /api/medicos - Listar todos os médicos
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search');

    let medicos;
    if (search) {
      medicos = await MedicoService.search(search);
    } else {
      medicos = await MedicoService.findAll();
    }

    return NextResponse.json(medicos);
  } catch (error) {
    console.error('Erro ao buscar médicos:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar médicos' },
      { status: 500 }
    );
  }
}

// POST /api/medicos - Criar um novo médico
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const medicoData: MedicoInput = {
      nome: body.nome,
      especialidade: body.especialidade,
      crm: body.crm,
      email: body.email,
      telefone: body.telefone,
      diasAtendimento: body.diasAtendimento || [],
      horarioInicio: body.horarioInicio || '',
      horarioFim: body.horarioFim || ''
    };

    const novoMedico = await MedicoService.create(medicoData);
    return NextResponse.json(novoMedico, { status: 201 });
  } catch (error: any) {
    console.error('Erro ao criar médico:', error);
    
    // Verificar se é um erro de validação do Prisma (campo único)
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: `Já existe um médico com este ${error.meta?.target[0]}` },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Erro ao criar médico' },
      { status: 500 }
    );
  }
}