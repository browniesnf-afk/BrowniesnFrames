import { Link } from 'react-router-dom';

interface LogoProps {
  variant?: 'dark' | 'light' | 'wine';
  showSubtitle?: boolean;
  subtitleText?: string;
  size?: 'sm' | 'md' | 'lg';
  to?: string;
  className?: string;
}

export function Logo({ 
  variant = 'dark', 
  showSubtitle = false, 
  subtitleText = '',
  size = 'md',
  to = '/',
  className = ''
}: LogoProps) {
  const isLight = variant === 'light';
  const isWine = variant === 'wine';

  const textColor = isLight || isWine ? 'text-white' : 'text-[#2C1A14]';
  const accentColor = isLight || isWine ? 'text-[#F8D8CF]' : 'text-[#8C4A27]';

  const sizeClasses = {
    sm: 'text-lg sm:text-xl',
    md: 'text-xl sm:text-2xl md:text-3xl',
    lg: 'text-2xl sm:text-3xl md:text-4xl'
  };

  return (
    <Link to={to} className={`flex flex-col items-center text-center group cursor-pointer ${className}`}>
      <h1 className={`font-serif ${sizeClasses[size]} tracking-wide ${textColor} font-medium whitespace-nowrap leading-none`}>
        Brownies<span className={`italic font-serif font-normal ${accentColor} px-0.5`}>n</span>Frames
      </h1>
      {showSubtitle && subtitleText && (
        <div className="flex items-center gap-1 mt-1 opacity-90">
          <span className={`text-[7px] sm:text-[9px] tracking-[0.2em] font-medium uppercase ${isLight || isWine ? 'text-[#F8D8CF]' : 'text-[#8C4A27]'}`}>
            {subtitleText}
          </span>
        </div>
      )}
    </Link>
  );
}
