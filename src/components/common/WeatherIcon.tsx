import React from 'react';
import {
  Sun,
  CloudSun,
  Cloud,
  CloudRain,
  CloudLightning,
  CloudSnow,
  CloudFog,
  Wind,
  Moon,
  CloudMoon,
} from 'lucide-react';
import { WeatherIconType } from '../../types/weather';

interface WeatherIconProps {
  type: WeatherIconType;
  className?: string;
  size?: number;
  animate?: boolean;
}

export const WeatherIcon: React.FC<WeatherIconProps> = ({
  type,
  className = '',
  size = 28,
  animate = true,
}) => {
  const getIcon = () => {
    switch (type) {
      case 'sun':
        return (
          <Sun
            size={size}
            className={`text-amber-400 ${animate ? 'animate-spin-slow' : ''} ${className}`}
          />
        );
      case 'cloud-sun':
        return <CloudSun size={size} className={`text-amber-300 ${className}`} />;
      case 'cloud':
        return <Cloud size={size} className={`text-slate-300 dark:text-slate-300 ${className}`} />;
      case 'cloud-rain':
        return <CloudRain size={size} className={`text-cyan-400 ${className}`} />;
      case 'cloud-lightning':
        return <CloudLightning size={size} className={`text-yellow-400 ${className}`} />;
      case 'cloud-snow':
        return <CloudSnow size={size} className={`text-indigo-200 ${className}`} />;
      case 'cloud-fog':
        return <CloudFog size={size} className={`text-slate-400 ${className}`} />;
      case 'wind':
        return <Wind size={size} className={`text-teal-400 ${className}`} />;
      case 'moon':
        return <Moon size={size} className={`text-indigo-300 ${className}`} />;
      case 'cloud-moon':
        return <CloudMoon size={size} className={`text-indigo-300 ${className}`} />;
      default:
        return <Sun size={size} className={`text-amber-400 ${className}`} />;
    }
  };

  return <div className="inline-flex items-center justify-center">{getIcon()}</div>;
};
