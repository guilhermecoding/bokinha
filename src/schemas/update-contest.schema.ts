import z from 'zod';

const updateContestSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  adminPassword: z.string().min(6, 'Senha de admin deve ter ao menos 6 caracteres'),
  startTime: z
    .string()
    .min(1, 'Data/hora de início é obrigatória')
    .refine((v) => !isNaN(Date.parse(v)), { message: 'Data de início inválida' }),
  endTime: z
    .string()
    .min(1, 'Data/hora de fim é obrigatória')
    .refine((v) => !isNaN(Date.parse(v)), { message: 'Data de fim inválida' }),
});

export default updateContestSchema;