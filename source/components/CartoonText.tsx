import React from 'react';
import Svg, {Text} from 'react-native-svg';

interface OutlinedTextProps {
  text: string;
  fontSize: number;
  width: number;
  height: number;
  fillColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
}

export const OutlinedText: React.FC<OutlinedTextProps> = ({
  text,
  fontSize,
  width,
  height,
  fillColor = '#ffffff',
  strokeColor = '#4a90e2',
  strokeWidth = 8,
}) => {
  return (
    <Svg height={height} width={width}>
      {/* Stroke layer */}
      <Text
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        fontSize={fontSize}
        fontWeight="bold"
        x={width / 2}
        y={height / 2}
        textAnchor="middle"
        alignmentBaseline="central"
        strokeLinejoin="round"
        strokeLinecap="round">
        {text}
      </Text>

      {/* Fill layer */}
      <Text
        fill={fillColor}
        fontSize={fontSize}
        fontWeight="bold"
        x={width / 2}
        y={height / 2}
        textAnchor="middle"
        alignmentBaseline="central">
        {text}
      </Text>
    </Svg>
  );
};
