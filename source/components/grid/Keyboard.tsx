import React, {Dimensions, StyleSheet, View} from 'react-native';

import {Correctness, keyboardFormat} from '~/utils/words';
import {withMeasure} from '../tutorial/withSpotlight';
import KeyboardKey, {KEY_VARIANTS} from './KeyboardKey';

const {width} = Dimensions.get('screen');

const getKeyVariant = (index: number, length: number) => {
  const isFull = length === 10; // max letters in a row

  if (index === 0 && !isFull) {
    return KEY_VARIANTS.START;
  }
  if (index === length - 1 && !isFull) {
    return KEY_VARIANTS.END;
  }
  return KEY_VARIANTS.NORMAL;
};

interface KeyboardProps {
  handleKeyPress: (key: string) => void;
  handleDelete: () => void;
  keyboardLetters: Record<string, Correctness>;
  disableDelete: boolean;
  disabled: boolean;
}

const Keyboard = ({
  handleKeyPress,
  keyboardLetters,
  disableDelete,
  handleDelete,
  disabled,
}: KeyboardProps) => {
  const keys = Object.entries(keyboardLetters);
  // Function to split the keys into the specified chunks
  const formatKeysInChunks = () => {
    const {chunks, deleteAtChunkIndex} = keyboardFormat;
    const formattedChunks: Array<[string, Correctness][]> = [];
    let start = 0;

    chunks.forEach((chunkSize, rowIndex) => {
      const chunk = keys.slice(start, start + chunkSize);
      formattedChunks.push(chunk);

      if (deleteAtChunkIndex === rowIndex) {
        formattedChunks[rowIndex].push(['DELETE', null]);
      }

      start += chunkSize;
    });

    return formattedChunks;
  };
  const formattedKeys = formatKeysInChunks();

  return (
    <View style={styles.keyboard}>
      {formattedKeys.map((chunk, rowIndex) => (
        <View key={`row-${rowIndex}`} style={styles.keyboardRow}>
          {chunk.map(([key, correctness], index) => (
            <KeyboardKey
              key={key}
              letter={key}
              variant={getKeyVariant(index, chunk.length)}
              onPress={() =>
                key === 'DELETE' ? handleDelete() : handleKeyPress(key)
              }
              disabled={disabled || (key === 'DELETE' && disableDelete)}
              correctness={correctness}
              spotlightId={`key-${key}`}
            />
          ))}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  keyboard: {
    flexWrap: 'wrap',
    marginBottom: 20,
    marginHorizontal: 5,
  },
  keyboardRow: {
    width,
    flexDirection: 'row',
    justifyContent: 'center',
  },
});

export default withMeasure(Keyboard);
