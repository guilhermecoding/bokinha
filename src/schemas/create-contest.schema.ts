import z from 'zod';

const createContestSchema = z
  .object({
    name: z.string().min(1, 'Nome é obrigatório'),
    adminPassword: z.string().min(6, 'Senha de admin deve ter ao menos 6 caracteres'),
    startTime: z
      .string()
      .min(1, 'Data/hora de início é obrigatória')
      .refine((val) => !isNaN(Date.parse(val)), { message: 'Data de início inválida' }),
    endTime: z
      .string()
      .min(1, 'Data/hora de fim é obrigatória')
      .refine((val) => !isNaN(Date.parse(val)), { message: 'Data de fim inválida' }),
  })
  .superRefine((data, ctx) => {
    const start = Date.parse(data.startTime);
    const end = Date.parse(data.endTime);
    if (!isNaN(start) && !isNaN(end) && end <= start) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Data de fim deve ser depois da data de início',
        path: ['endTime'],
      });
    }
  });

export default createContestSchema;