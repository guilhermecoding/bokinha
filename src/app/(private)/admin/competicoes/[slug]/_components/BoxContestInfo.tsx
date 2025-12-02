import BoxContainer from '@/components/BoxContainer';
import { IconBalloonFilled } from '@tabler/icons-react';

export default function BoxContestInfo() {
  return (
    <BoxContainer className='w-full'>
        {/* Cabeçalho */}
        <div className='w-full flex flex-row items-center gap-2'>
            <IconBalloonFilled className='w-5 h-5 sm:w-6 sm:h-6' />
            <h2 className="font-bold text-lg sm:text-2xl">Detalhes da Competição</h2>
        </div>
    </BoxContainer>
  );
}
