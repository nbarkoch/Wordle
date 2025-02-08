import React, {StyleSheet, View} from 'react-native';
import KeyboardKey from './KeyboardKey';
import DeleteKeyIcon from '~/assets/icons/backspace-delete.svg';
import {Correctness, keyboardFormat} from '~/utils/words';

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
          {chunk.map(([key, correctness]) => (
            <KeyboardKey
              key={key}
              letter={key === 'DELETE' ? undefined : key}
              onPress={key === 'DELETE' ? handleDelete : handleKeyPress}
              disabled={disabled || (key === 'DELETE' && disableDelete)}
              correctness={correctness}
              style={key === 'DELETE' ? styles.wideKey : undefined}>
              {key === 'DELETE' ? (
                <DeleteKeyIcon width={30} height={50} />
              ) : null}
            </KeyboardKey>
          ))}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  keyboard: {
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    marginHorizontal: 5,
  },
  keyboardRow: {
    width: '100%',
    flexDirection: 'row',
  },
  wideKey: {
    width: 45,
  },
});

export default Keyboard;
