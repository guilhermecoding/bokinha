import z from 'zod';

const studentSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter ao menos 6 caracteres'),
  schoolClass: z.string().optional(),
  age: z.number().int().positive().optional(),
  contestId: z.string().optional().nullable(),
});

export default studentSchema;