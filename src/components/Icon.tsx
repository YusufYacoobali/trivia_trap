import React from 'react';
import Svg, { Circle, Ellipse, Path, Rect } from 'react-native-svg';

export type IconName =
  | 'classic'
  | 'truthlie'
  | 'trap'
  | 'beatcrowd'
  | 'streak'
  | 'rush'
  | 'hard'
  | 'star'
  | 'history'
  | 'science'
  | 'football'
  | 'movies'
  | 'geography'
  | 'animals'
  | 'weird'
  | 'nav-home'
  | 'nav-daily'
  | 'nav-stats'
  | 'nav-settings';

interface IconProps {
  name: IconName;
  size?: number;
  color?: string; // used by nav icons
}

// SVG artwork ported 1:1 from the Trivia Trap mockup.
export default function Icon({ name, size = 28, color = '#c2bcd3' }: IconProps) {
  switch (name) {
    case 'classic':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx={12} cy={12} r={10} fill="#ff4d6d" />
          <Path d="M9.1 9.3a2.9 2.9 0 0 1 5.7 1c0 1.9-2.6 2-2.6 3.8" stroke="#fff" strokeWidth={2.1} strokeLinecap="round" />
          <Circle cx={12.1} cy={16.5} r={1.25} fill="#fff" />
        </Svg>
      );
    case 'truthlie':
      return (
        <Svg width={size * 1.55} height={size} viewBox="0 0 32 24" fill="none">
          <Circle cx={9} cy={12} r={8} fill="#19c37d" />
          <Path d="M5.6 12.3 8 14.7l4-4.7" stroke="#fff" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
          <Circle cx={23} cy={12} r={8} fill="#ff4d6d" />
          <Path d="M20.2 9.2 25.8 14.8M25.8 9.2 20.2 14.8" stroke="#fff" strokeWidth={2.2} strokeLinecap="round" />
        </Svg>
      );
    case 'trap':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M12 3.2 22 20.2H2L12 3.2Z" fill="#f59008" />
          <Path d="M12 9.6v4.3" stroke="#fff" strokeWidth={2.3} strokeLinecap="round" />
          <Circle cx={12} cy={16.8} r={1.25} fill="#fff" />
        </Svg>
      );
    case 'beatcrowd':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Rect x={3} y={13} width={4.6} height={8} rx={1.5} fill="#0fa066" />
          <Rect x={9.7} y={8} width={4.6} height={13} rx={1.5} fill="#19c37d" />
          <Rect x={16.4} y={4} width={4.6} height={17} rx={1.5} fill="#0fa066" />
        </Svg>
      );
    case 'streak':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M13.2 2.2s1.5 3.6-1 6.6c-2.8 3.3-3.8 4.3-3.8 7.2a6 6 0 0 0 12 .3c.2-3-1.6-4.8-2.3-6.3-.7 1-1.6 1.4-2.3 1.1 1.1-3.1.1-6.6-2.6-8.9Z" fill="#7b5cff" />
          <Path d="M13.4 12.8c1.4 1 2 2.1 1.9 3.3a2.35 2.35 0 0 1-4.7-.2c0-1 .5-1.7 1.2-2.5" fill="#ffb9cf" />
        </Svg>
      );
    case 'rush':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Rect x={9.5} y={2} width={5} height={2.6} rx={1.3} fill="#12b39a" />
          <Circle cx={12} cy={14} r={8} fill="#12b39a" />
          <Circle cx={12} cy={14} r={5.5} fill="#fff" />
          <Path d="M12 14V10.4" stroke="#12b39a" strokeWidth={2} strokeLinecap="round" />
        </Svg>
      );
    case 'hard':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M7 3.2h10l4 6-9 11.6L3 9.2l4-6Z" fill="#ffb703" />
          <Path d="M3 9.2h18M9 3.2 7.2 9.2l4.8 11.6M15 3.2l1.8 6-4.8 11.6" stroke="#15101f" strokeWidth={1.1} opacity={0.22} />
        </Svg>
      );
    case 'star':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M12 2.6l2.5 5.1 5.6.8-4 4 .9 5.6L12 21.5 7 19l.9-5.6-4-4 5.6-.8L12 2.6Z" fill="#7b5cff" />
        </Svg>
      );
    case 'history':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M4 8h16M3 20h18M6 8v10M10 8v10M14 8v10M18 8v10" stroke="#b9742a" strokeWidth={2} strokeLinecap="round" />
          <Path d="M12 2 4 8h16L12 2Z" fill="#b9742a" />
        </Svg>
      );
    case 'science':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M10 3h4M10.5 3v6L5.5 18a2 2 0 0 0 1.8 3h9.4a2 2 0 0 0 1.8-3l-5-9V3" stroke="#0fa066" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          <Path d="M8 14h8l2.5 4.5a1.5 1.5 0 0 1-1.3 2.5H6.8a1.5 1.5 0 0 1-1.3-2.5L8 14Z" fill="#0fa066" />
        </Svg>
      );
    case 'football':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx={12} cy={12} r={9.2} fill="#1ba0cf" />
          <Path d="M12 6.5l3.2 2.3-1.2 3.8h-4L8.8 8.8 12 6.5Z" fill="#fff" />
          <Path d="M12 6.5V3.2M15.2 8.8l3-1.4M13.9 12.6l2 2.6M10 12.6l-2 2.6M8.8 8.8l-3-1.4" stroke="#fff" strokeWidth={1.5} />
        </Svg>
      );
    case 'movies':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Rect x={3} y={9} width={18} height={11} rx={2} fill="#ff4d6d" />
          <Path d="M3.4 9 6 4.6l3.6 3.4M9.8 8 13 4 16.6 7.4M16.6 7.6 19.4 4l1.4 3.6" stroke="#ff4d6d" strokeWidth={2} strokeLinejoin="round" />
          <Circle cx={9} cy={14.5} r={1.6} fill="#fff" />
          <Circle cx={15} cy={14.5} r={1.6} fill="#fff" />
        </Svg>
      );
    case 'geography':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx={12} cy={12} r={9.2} fill="#5b6cf0" />
          <Path d="M3 12h18M12 2.8c2.6 2.4 2.6 16 0 18.4M12 2.8c-2.6 2.4-2.6 16 0 18.4" stroke="#fff" strokeWidth={1.5} />
        </Svg>
      );
    case 'animals':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Ellipse cx={12} cy={16} rx={4.4} ry={3.6} fill="#f59008" />
          <Circle cx={6.5} cy={11} r={2.1} fill="#f59008" />
          <Circle cx={17.5} cy={11} r={2.1} fill="#f59008" />
          <Circle cx={9.3} cy={7.3} r={2.1} fill="#f59008" />
          <Circle cx={14.7} cy={7.3} r={2.1} fill="#f59008" />
        </Svg>
      );
    case 'weird':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M13 2 4 13h6l-1 9 9-11h-6l1-9Z" fill="#d6336c" />
        </Svg>
      );
    case 'nav-home':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M3.5 11.5 12 4l8.5 7.5" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
          <Path d="M5.5 10v9.5h13V10" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      );
    case 'nav-daily':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Rect x={4} y={5} width={16} height={16} rx={4} stroke={color} strokeWidth={2.2} />
          <Path d="M4 9.5h16M8.5 3v4M15.5 3v4" stroke={color} strokeWidth={2.2} strokeLinecap="round" />
        </Svg>
      );
    case 'nav-stats':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Rect x={4} y={12} width={4} height={8} rx={1.5} fill={color} />
          <Rect x={10} y={7} width={4} height={13} rx={1.5} fill={color} />
          <Rect x={16} y={4} width={4} height={16} rx={1.5} fill={color} />
        </Svg>
      );
    case 'nav-settings':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M5 8h14M5 16h14" stroke={color} strokeWidth={2.2} strokeLinecap="round" />
          <Circle cx={9} cy={8} r={2.6} fill="#faf7ff" stroke={color} strokeWidth={2.2} />
          <Circle cx={15} cy={16} r={2.6} fill="#faf7ff" stroke={color} strokeWidth={2.2} />
        </Svg>
      );
    default:
      return null;
  }
}
