import z from 'zod';

const questionCreateSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  order: z.number().int().nonnegative().optional(),
  balloonColor: z.string().regex(/^#([0-9a-fA-F]{6})$/, 'Use hex (ex: #ff0000)').optional(),
  contestId: z.string().min(1, 'contestId é obrigatório').optional(),
});

export default questionCreateSchema;