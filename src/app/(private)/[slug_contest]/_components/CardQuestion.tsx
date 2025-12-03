import { Button } from '@/components/ui/button';
import { Question } from '../../../../../generated/prisma/client';
import Balloon from '@/components/Balloon';

export default function CardQuestion({
  question,
}: {
  question: Question
}) {
  return (
    <div className='border border-gray-300 px-8 py-4 rounded-3xl flex flex-col gap-9'>
      <div className='flex flex-col gap-1'>
        <h2 className='text-muted-foreground'>
           Questão {question.order}
        </h2>
        <h2 className='text-xl font-bold flex'>
          <Balloon color={question.balloonColor} /> {question.title}
        </h2>
      </div>

      <Button className='bg-purple-800 hover:bg-purple-900 cursor-pointer'>
        Terminei
      </Button>
    </div>
  );
}
