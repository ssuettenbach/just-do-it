interface IconProps {
  src: string;
  className?: string;
}

export function Icon({ src, className = 'size-5' }: IconProps) {
  const mask = `url(${JSON.stringify(src)}) center / contain no-repeat`;

  return (
    <span
      aria-hidden="true"
      className={`inline-block shrink-0 bg-current ${className}`}
      style={{ mask, WebkitMask: mask }}
    />
  );
}
