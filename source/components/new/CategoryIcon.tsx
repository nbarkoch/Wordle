import React from 'react';
import {GameCategory} from '~/utils/types';

interface CategoryIconProps {
  category: GameCategory;
  size?: number;
  color?: string;
}

import Football from '~/assets/icons/football.svg';
import Paw from '~/assets/icons/paw.svg';
import Geography from '~/assets/icons/geography.svg';
import Global from '~/assets/icons/global.svg';
import Science from '~/assets/icons/science.svg';

const CategoryIcon: React.FC<CategoryIconProps> = ({
  category,
  size = 30,
  color = 'white',
}) => {
  switch (category) {
    case 'ANIMALS':
      return <Paw width={size} height={size} color={color} />;
    case 'GEOGRAPHY':
      return <Geography width={size} height={size} color={color} />;
    case 'SPORT':
      return <Football width={size} height={size} color={color} />;
    case 'GENERAL':
      return <Global width={size} height={size} color={color} />;
    case 'SCIENCE':
      return <Science width={size} height={size} color={color} />;
  }
};

export default CategoryIcon;
