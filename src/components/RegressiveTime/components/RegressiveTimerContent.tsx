'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface ProgressBarTimerProps {
  max: number;
  value: number;
  min: number;
  gaugePrimaryColor: string;
  gaugeSecondaryColor: string;
  className?: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function ProgressBarTimer({
  max = 100,
  min = 0,
  value = 0,
  gaugePrimaryColor,
  gaugeSecondaryColor,
  className,
}: ProgressBarTimerProps) {
  const circumference = 2 * Math.PI * 45;
  const percentPx = circumference / 100;
  const currentPercent = Math.round(((value - min) / (max - min)) * 100);

  return (
    <div
      className={cn('relative size-40 text-2xl font-semibold', className)}
      style={
        {
          '--circle-size': '100px',
          '--circumference': circumference,
          '--percent-to-px': `${percentPx}px`,
          '--gap-percent': '5',
          '--offset-factor': '0',
          '--transition-length': '1s',
          '--transition-step': '200ms',
          '--delay': '0s',
          '--percent-to-deg': '3.6deg',
          transform: 'translateZ(0)',
        } as React.CSSProperties
      }
    >
      <svg
        fill="none"
        className="size-full"
        strokeWidth="2"
        viewBox="0 0 100 100"
      >
        {currentPercent <= 90 && currentPercent >= 0 && (
          <circle
            cx="50"
            cy="50"
            r="45"
            strokeWidth="10"
            strokeDashoffset="0"
            strokeLinecap="round"
            strokeLinejoin="round"
            className=" opacity-100"
            style={
              {
                stroke: gaugeSecondaryColor,
                '--stroke-percent': 90 - currentPercent,
                '--offset-factor-secondary': 'calc(1 - var(--offset-factor))',
                strokeDasharray:
                  'calc(var(--stroke-percent) * var(--percent-to-px)) var(--circumference)',
                transform:
                  'rotate(calc(1turn - 90deg - (var(--gap-percent) * var(--percent-to-deg) * var(--offset-factor-secondary)))) scaleY(-1)',
                transition: 'all var(--transition-length) ease var(--delay)',
                transformOrigin:
                  'calc(var(--circle-size) / 2) calc(var(--circle-size) / 2)',
              } as React.CSSProperties
            }
          />
        )}
        <circle
          cx="50"
          cy="50"
          r="45"
          strokeWidth="10"
          strokeDashoffset="0"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="opacity-100"
          style={
            {
              stroke: gaugePrimaryColor,
              '--stroke-percent': currentPercent,
              strokeDasharray:
                'calc(var(--stroke-percent) * var(--percent-to-px)) var(--circumference)',
              transition:
                'var(--transition-length) ease var(--delay),stroke var(--transition-length) ease var(--delay)',
              transitionProperty: 'stroke-dasharray,transform',
              transform:
                'rotate(calc(-90deg + var(--gap-percent) * var(--offset-factor) * var(--percent-to-deg)))',
              transformOrigin:
                'calc(var(--circle-size) / 2) calc(var(--circle-size) / 2)',
            } as React.CSSProperties
          }
        />
      </svg>
      <span
        data-current-value={currentPercent}
        className="duration-(--transition-length) delay-(--delay) absolute inset-0 m-auto size-fit ease-linear animate-in fade-in"
      >
        {value}
      </span>
    </div>
  );
}

export interface RegressiveTimerContentProps {
  startDate: Date; // Data de início da competição
  onTimeExpired: () => void;
}

const calculateTimeLeft = (targetDate: Date): TimeLeft | null => {
  const difference = targetDate.getTime() - new Date().getTime();
  let timeLeft: TimeLeft | null = null;

  if (difference > 0) {
    timeLeft = {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  }
  return timeLeft;
};

type Label = 'day' | 'hour' | 'minute' | 'second';

type LabelsType = {
    [k in Label]: {
        singular: string;
        plural: string;
        max: number;
    };
}

const labelsType: LabelsType = {
    'day': {
        singular: 'dia',
        plural: 'dias',
        max: 30 // Ajuste se necessário, ou torne dinâmico
    },
    'hour': {
        singular: 'hora',
        plural: 'horas',
        max: 24
    },
    'minute': {
        singular: 'minuto',
        plural: 'minutos',
        max: 60
    },
    'second': {
        singular: 'segundo',
        plural: 'segundos',
        max: 60
    }
};

function ElementTimer({
    value,
    label
}: { value: number; label: Label }) {
    // Para dias, se o valor for maior que 'max', a barra pode parecer sempre cheia.
    // Considere ajustar 'max' para dias ou a lógica da ProgressBarTimer.
    const displayMax = labelsType[label].max;

    return (
        <div className="flex flex-col items-center gap-1">
            <ProgressBarTimer
                max={displayMax}
                min={0}
                value={value > displayMax && label === 'day' ? displayMax : value} // Garante que o valor não exceda o max visualmente para a barra
                gaugePrimaryColor="rgb(255, 255, 255)"
                gaugeSecondaryColor="rgba(0, 0, 0, 0.1)"
                className="w-14 h-14 sm:w-24 sm:h-24 text-xl sm:text-3xl"
            />
            <span className='text-md sm:text-xl'>
                {value === 1 ? labelsType[label].singular : labelsType[label].plural}
            </span>
        </div>
    );
}

export default function RegressiveTimerContent({ startDate, onTimeExpired }: RegressiveTimerContentProps) {
  const [isHydrated] = useState(true);
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(() => calculateTimeLeft(startDate));

  useEffect(() => {
    const initialTime = calculateTimeLeft(startDate);
    if (!initialTime) {
      onTimeExpired();
    }
  }, [startDate, onTimeExpired]);

  useEffect(() => {
    if (!timeLeft || !isHydrated) {
      return;
    }

    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft(startDate);
      setTimeLeft(newTimeLeft);

      if (!newTimeLeft) {
        clearInterval(timer);
        onTimeExpired();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [startDate, timeLeft, onTimeExpired, isHydrated]);

  // Não renderiza enquanto não está hidratado
  if (!isHydrated) {
    return <span>Carregando...</span>;
  }

  if (timeLeft === null) {
    return <span>Só um instante...</span>;
  }

  if (!timeLeft) {
    return <span>Tempo esgotado!</span>;
  }

  return (
    <div className="flex flex-row gap-2">
      <ElementTimer value={timeLeft.days} label="day" />
      <span className="text-2xl sm:text-4xl font-bold mt-3 sm:mt-6">:</span>
      <ElementTimer value={timeLeft.hours} label="hour" />
      <span className="text-2xl sm:text-4xl font-bold mt-3 sm:mt-6">:</span>
      <ElementTimer value={timeLeft.minutes} label="minute" />
      <span className="text-2xl sm:text-4xl font-bold mt-3 sm:mt-6">:</span>
      <ElementTimer value={timeLeft.seconds} label="second" />
    </div>
  );
}