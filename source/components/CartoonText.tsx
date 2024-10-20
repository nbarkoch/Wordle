import React from 'react';
import Svg, {Text} from 'react-native-svg';
import {colors} from '~/utils/colors';

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
  fillColor = colors.white,
  strokeColor = colors.blue,
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
        fontWeight="900"
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
        fontWeight="900"
        x={width / 2}
        y={height / 2}
        textAnchor="middle"
        alignmentBaseline="central">
        {text}
      </Text>
    </Svg>
  );
};
