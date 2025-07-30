import React from 'react';
import { 
  Target, 
  Clock, 
  Zap, 
  MapPin, 
  Volume2, 
  Volume1, 
  VolumeX,
  Trophy,
  Share2,
  Play,
  Pause,
  RotateCcw,
  ArrowRight,
  Home,
  Settings,
  Star,
  Award,
  Flag,
  Navigation,
  Compass,
  Map,
  Landmark
} from 'lucide-react';

interface GameIconProps {
  name: string;
  size?: number;
  color?: string;
  className?: string;
}

export const GameIcon: React.FC<GameIconProps> = ({ 
  name, 
  size = 24, 
  color = "var(--text-primary)",
  className = ""
}) => {
  const iconProps = {
    size,
    color,
    className: `game-icon ${className}`,
    style: {}
  };

  switch (name.toLowerCase()) {
    case 'target':
      return <Target {...iconProps} />;
    case 'clock':
    case 'time':
      return <Clock {...iconProps} />;
    case 'zap':
    case 'lightning':
    case 'bonus':
      return <Zap {...iconProps} />;
    case 'mappin':
    case 'location':
    case 'distance':
      return <MapPin {...iconProps} />;
    case 'volume2':
    case 'volume-high':
      return <Volume2 {...iconProps} />;
    case 'volume1':
    case 'volume-medium':
      return <Volume1 {...iconProps} />;
    case 'volumex':
    case 'volume-mute':
      return <VolumeX {...iconProps} />;
    case 'trophy':
    case 'winner':
      return <Trophy {...iconProps} />;
    case 'share2':
    case 'share':
      return <Share2 {...iconProps} />;
    case 'play':
    case 'start':
      return <Play {...iconProps} />;
    case 'pause':
      return <Pause {...iconProps} />;
    case 'rotateccw':
    case 'retry':
    case 'restart':
      return <RotateCcw {...iconProps} />;
    case 'arrowright':
    case 'next':
      return <ArrowRight {...iconProps} />;
    case 'home':
      return <Home {...iconProps} />;
    case 'settings':
      return <Settings {...iconProps} />;
    case 'star':
      return <Star {...iconProps} />;
    case 'award':
      return <Award {...iconProps} />;
    case 'flag':
      return <Flag {...iconProps} />;
    case 'navigation':
      return <Navigation {...iconProps} />;
    case 'compass':
      return <Compass {...iconProps} />;
    case 'map':
      return <Map {...iconProps} />;
    case 'landmark':
      return <Landmark {...iconProps} />;
    default:
      return <Target {...iconProps} />;
  }
};

// Componentes específicos para facilitar o uso
export const TargetIcon: React.FC<{ size?: number; color?: string }> = ({ size, color }) => (
  <GameIcon name="target" size={size} color={color} />
);

export const ClockIcon: React.FC<{ size?: number; color?: string }> = ({ size, color }) => (
  <GameIcon name="clock" size={size} color={color} />
);

export const ZapIcon: React.FC<{ size?: number; color?: string }> = ({ size, color }) => (
  <GameIcon name="zap" size={size} color={color} />
);

export const MapPinIcon: React.FC<{ size?: number; color?: string }> = ({ size, color }) => (
  <GameIcon name="mappin" size={size} color={color} />
);

export const TrophyIcon: React.FC<{ size?: number; color?: string }> = ({ size, color }) => (
  <GameIcon name="trophy" size={size} color={color} />
);

export const ShareIcon: React.FC<{ size?: number; color?: string }> = ({ size, color }) => (
  <GameIcon name="share" size={size} color={color} />
);

export const PlayIcon: React.FC<{ size?: number; color?: string }> = ({ size, color }) => (
  <GameIcon name="play" size={size} color={color} />
);

export const PauseIcon: React.FC<{ size?: number; color?: string }> = ({ size, color }) => (
  <GameIcon name="pause" size={size} color={color} />
);

export const RetryIcon: React.FC<{ size?: number; color?: string }> = ({ size, color }) => (
  <GameIcon name="retry" size={size} color={color} />
);

export const NextIcon: React.FC<{ size?: number; color?: string }> = ({ size, color }) => (
  <GameIcon name="next" size={size} color={color} />
);

export const Volume2Icon: React.FC<{ size?: number; color?: string }> = ({ size, color }) => (
  <GameIcon name="volume2" size={size} color={color} />
);

export const Volume1Icon: React.FC<{ size?: number; color?: string }> = ({ size, color }) => (
  <GameIcon name="volume1" size={size} color={color} />
);

export const VolumeXIcon: React.FC<{ size?: number; color?: string }> = ({ size, color }) => (
  <GameIcon name="volumex" size={size} color={color} />
);

export const SettingsIcon: React.FC<{ size?: number; color?: string }> = ({ size, color }) => (
  <GameIcon name="settings" size={size} color={color} />
);

export const StarIcon: React.FC<{ size?: number; color?: string }> = ({ size, color }) => (
  <GameIcon name="star" size={size} color={color} />
);

export const AwardIcon: React.FC<{ size?: number; color?: string }> = ({ size, color }) => (
  <GameIcon name="award" size={size} color={color} />
);

export const FlagIcon: React.FC<{ size?: number; color?: string }> = ({ size, color }) => (
  <GameIcon name="flag" size={size} color={color} />
);

export const RotateCcwIcon: React.FC<{ size?: number; color?: string }> = ({ size, color }) => (
  <GameIcon name="rotate-ccw" size={size} color={color} />
);

export const XIcon: React.FC<{ size?: number; color?: string }> = ({ size, color }) => (
  <GameIcon name="x" size={size} color={color} />
);

export const CheckIcon: React.FC<{ size?: number; color?: string }> = ({ size, color }) => (
  <GameIcon name="check" size={size} color={color} />
);

export const RefreshCwIcon: React.FC<{ size?: number; color?: string }> = ({ size, color }) => (
  <GameIcon name="refresh-cw" size={size} color={color} />
);

export const MedalIcon: React.FC<{ size?: number; color?: string }> = ({ size, color }) => (
  <GameIcon name="medal" size={size} color={color} />
);

export const UserIcon: React.FC<{ size?: number; color?: string }> = ({ size, color }) => (
  <GameIcon name="user" size={size} color={color} />
);

export const MapIcon: React.FC<{ size?: number; color?: string }> = ({ size, color }) => (
  <GameIcon name="map" size={size} color={color} />
);

export const LandmarkIcon: React.FC<{ size?: number; color?: string }> = ({ size, color }) => (
  <GameIcon name="landmark" size={size} color={color} />
); 

export const SkullIcon = ({ size = 40, color = 'var(--accent-red)' }: { size?: number; color?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ display: 'inline-block', verticalAlign: 'middle' }}
  >
    <rect x="4" y="8" width="32" height="24" rx="14" fill={color} stroke="#000" strokeWidth="2" />
    <ellipse cx="14" cy="20" rx="3" ry="4" fill="#000" />
    <ellipse cx="26" cy="20" rx="3" ry="4" fill="#000" />
    <rect x="17" y="27" width="6" height="3" rx="1.5" fill="#fff" stroke="#000" strokeWidth="1" />
    <rect x="12" y="32" width="3" height="4" rx="1.5" fill={color} stroke="#000" strokeWidth="1" />
    <rect x="25" y="32" width="3" height="4" rx="1.5" fill={color} stroke="#000" strokeWidth="1" />
  </svg>
); 