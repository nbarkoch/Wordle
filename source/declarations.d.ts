declare module '*.svg' {
  import React from 'react';
  import {SvgProps} from 'react-native-svg';
  const content: React.FC<SvgProps>;
  export default content;
}

declare module '*.ttf' {
  import {FontSource} from '@shopify/react-native-skia';
  const content: FontSource;
  export default content;
}
