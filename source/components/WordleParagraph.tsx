import React, {useMemo} from 'react';
import {
  useFonts,
  Skia,
  Canvas,
  TextAlign,
  Paragraph,
  TileMode,
} from '@shopify/react-native-skia';
import {colors} from '~/utils/colors';
import {StyleSheet} from 'react-native';

const WordleParagraph = () => {
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
          Skia.Color(colors.blue),
          Skia.Color(colors.lightBlue),
          Skia.Color(colors.green),
          Skia.Color(colors.lightYellow),
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
          fontSize: 50,
          fontStyle: {weight: 500},
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
    <Canvas style={styles.canvas}>
      <Paragraph paragraph={paragraph} x={0} y={0} width={300} />
    </Canvas>
  );
};

const styles = StyleSheet.create({
  canvas: {width: 300, height: 80},
});

export default WordleParagraph;
