import React, {StyleSheet, View} from 'react-native';
import {Correctness} from '~/screens/WordleGame';
import KeyboardKey from './KeyboardKey';
import DeleteKeyIcon from '~/assets/icons/backspace-delete.svg';

const WORD_LENGTH = 5;

interface KeyboardProps {
  handleKeyPress: (key: string) => void;
  handleDelete: () => void;
  keyboardLetters: Record<string, Correctness>;
  currentGuessLength: number;
}

const Keyboard = ({
  handleKeyPress,
  keyboardLetters,
  currentGuessLength,
  handleDelete,
}: KeyboardProps) => {
  return (
    <View style={[styles.keyboard]}>
      {Object.entries(keyboardLetters).map(([key, correctness]) => (
        <KeyboardKey
          disabled={currentGuessLength >= WORD_LENGTH}
          key={key}
          letter={key}
          onPress={handleKeyPress}
          correctness={correctness}
        />
      ))}
      <KeyboardKey
        disabled={currentGuessLength === 0}
        onPress={handleDelete}
        style={styles.wideKey}>
        <DeleteKeyIcon width={40} height={50} />
      </KeyboardKey>
    </View>
  );
};

const styles = StyleSheet.create({
  keyboard: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20,
    marginHorizontal: 5,
  },
  wideKey: {
    width: 65,
  },
});

export default Keyboard;
