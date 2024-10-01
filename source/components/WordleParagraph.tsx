import React, {useMemo} from 'react';
import {
  useFonts,
  Skia,
  Canvas,
  TextAlign,
  Paragraph,
  TileMode,
} from '@shopify/react-native-skia';

interface WordleParagraphProps {
  width: number;
  height: number;
}

const WordleParagraph = ({width, height}: WordleParagraphProps) => {
  const customFontMgr = useFonts({
    Roboto: [require('~/assets/fonts/luckiestguy.ttf')],
  });

  const paragraph = useMemo(() => {
    if (!customFontMgr) {
      return null;
    }
    const foregroundPaint = Skia.Paint();
    foregroundPaint.setShader(
      Skia.Shader.MakeRadialGradient(
        {x: 0, y: 0},
        256,
        [
          Skia.Color('#75B8C2'),
          Skia.Color('#8997C8'),
          Skia.Color('#DD90BB'),
          Skia.Color('#6A60AB'),
        ],
        null,
        TileMode.Clamp,
      ),
    );
    const paragraphStyle = {
      textAlign: TextAlign.Center,
    };

    const para = Skia.ParagraphBuilder.Make(paragraphStyle, customFontMgr)
      .pushStyle(
        {
          fontFamilies: ['Roboto'],
          fontSize: 60,
          color: Skia.Color('black'),
        },
        foregroundPaint,
      )
      .addText('WORDLE')
      .pop()
      .build();
    return para;
  }, [customFontMgr]);

  return (
    <Canvas style={{width, height}}>
      <Paragraph paragraph={paragraph} x={0} y={0} width={300} />
    </Canvas>
  );
};

export default WordleParagraph;
