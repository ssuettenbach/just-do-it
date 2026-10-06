import { type AnchorHTMLAttributes } from 'react';
import { Link } from 'react-router-dom';
import type { PickCategory } from '../../domain/types';
import diceIcon from '../../images/dice.svg';
import flashIcon from '../../images/flash.svg';
import hourglassIcon from '../../images/hourglass.svg';

interface PickButtonProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  category: PickCategory;
  subtitle: string;
  candidateCount: number;
  disabledMessage?: string;
  disabled?: boolean;
}

const categoryIcons: Record<PickCategory, string> = {
  quick: flashIcon,
  any: diceIcon,
  big: hourglassIcon,
};

const categoryLabels: Record<PickCategory, string> = {
  quick: 'Schnell',
  any: 'Beliebig',
  big: 'Groß',
};

const baseClassName =
  'w-full block bg-black/5 dark:bg-white/10 p-6 rounded-xl text-left transition-colors border-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus disabled:opacity-60 disabled:cursor-not-allowed';

export const PickButton = (
  {category, subtitle, candidateCount, disabledMessage, disabled, className, ...props}: PickButtonProps
) => {
  const isDisabled = disabled || candidateCount === 0;

  if (isDisabled && disabledMessage) {
    return (
      <div className={"flex flex-col gap-2 opacity-50 " + baseClassName}>
        <div className="flex justify-between">
          <div className="">
            <h2 className="text-xl font-semibold text-fg">{categoryLabels[category]}</h2>
            <p className="text-fg-muted text-xs">{disabledMessage}</p>
          </div>
          <img src={categoryIcons[category]} alt={categoryLabels[category]} className="size-12"/>
        </div>
      </div>
    );
  }

  return (
    <Link
      to={`/pick/${category}`}
      {...props}
      className={`${baseClassName} hover:bg-surface ${className || ''}`}
    >
      <div className="flex justify-between">
        <div className="">
          <h2 className="text-xl font-semibold text-fg">{categoryLabels[category]}</h2>
          <p className="text-fg-muted">{subtitle}</p>
        </div>
        <img src={categoryIcons[category]} alt={categoryLabels[category]} className="size-12"/>
      </div>
    </Link>
  );
}

PickButton.displayName = 'PickButton';
