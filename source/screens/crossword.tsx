import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {
  Canvas,
  Text as SkiaText,
  useFont,
  Path,
  Skia,
  SkPath,
} from '@shopify/react-native-skia';

type Direction =
  | 'left'
  | 'right'
  | 'up'
  | 'down'
  | 'right-down'
  | 'right-up'
  | 'left-down'
  | 'left-up'
  | 'down-right'
  | 'down-left'
  | 'up-right'
  | 'up-left';

type Cell = {
  value?: string;
  clue?: string;
  direction?: Direction;
};

type Grid = Cell[][];

const mockGrid: Grid = [
  [
    {value: 'ד'},
    {value: 'ג'},
    {clue: 'First letter', direction: 'down'},
    {value: 'א'},
  ],
  [{value: 'ח'}, {value: 'ז'}, {value: 'ו'}, {value: 'ה'}],
  [{value: 'ל'}, {value: 'כ'}, {value: 'י'}, {value: 'ט'}],
  [
    {value: 'ע'},
    {value: 'ס'},
    {clue: 'Sixth letter', direction: 'up-right'},
    {value: 'מ'},
  ],
];

const CELL_SIZE = 60;
const ARROW_SIZE = 20;
const ARROW_EDGE_SIZE = 10;

const CrosswordPuzzle: React.FC = () => {
  const font = useFont(require('./../fonts/GveretLevin-Regular.otf'), 30);

  const createLineArrowPath = (direction: Direction) => {
    const path = Skia.Path.Make();
    switch (direction) {
      case 'down-right':
        path.moveTo(1, 0);
        path.lineTo(1, ARROW_EDGE_SIZE / 2);
        path.lineTo(ARROW_EDGE_SIZE, ARROW_EDGE_SIZE / 2);
        break;
      case 'down-left':
        path.moveTo(ARROW_SIZE - 1, 0);
        path.lineTo(ARROW_SIZE - 1, ARROW_EDGE_SIZE / 2);
        path.lineTo(ARROW_EDGE_SIZE, ARROW_EDGE_SIZE / 2);
        break;
      case 'up-right':
        path.moveTo(1, ARROW_SIZE);
        path.lineTo(1, ARROW_SIZE / 2 + ARROW_EDGE_SIZE / 2);
        path.lineTo(ARROW_EDGE_SIZE, ARROW_SIZE / 2 + ARROW_EDGE_SIZE / 2);
        break;
      case 'up-left':
        path.moveTo(ARROW_SIZE - 1, ARROW_SIZE);
        path.lineTo(ARROW_SIZE - 1, ARROW_SIZE / 2 + ARROW_EDGE_SIZE / 2);
        path.lineTo(ARROW_EDGE_SIZE, ARROW_SIZE / 2 + ARROW_EDGE_SIZE / 2);
        break;
      case 'left-down':
        path.moveTo(ARROW_SIZE, 1);
        path.lineTo(ARROW_SIZE / 2 + ARROW_EDGE_SIZE / 2, 1);
        path.lineTo(ARROW_SIZE / 2 + ARROW_EDGE_SIZE / 2, ARROW_SIZE / 2);
        break;
      case 'left-up':
        path.moveTo(ARROW_SIZE, ARROW_SIZE - 1);
        path.lineTo(ARROW_SIZE / 2 + ARROW_EDGE_SIZE / 2, ARROW_SIZE - 1);
        path.lineTo(ARROW_SIZE / 2 + ARROW_EDGE_SIZE / 2, ARROW_SIZE / 2);
        break;
      case 'right-down':
        path.moveTo(0, 1);
        path.lineTo(ARROW_EDGE_SIZE / 2, 1);
        path.lineTo(ARROW_EDGE_SIZE / 2, ARROW_SIZE / 2);
        break;
      case 'right-up':
        path.moveTo(0, ARROW_SIZE - 1);
        path.lineTo(ARROW_EDGE_SIZE / 2, ARROW_SIZE - 1);
        path.lineTo(ARROW_EDGE_SIZE / 2, ARROW_SIZE / 2);
        break;
    }
    return path;
  };

  const createArrowPath = (direction: Direction): SkPath => {
    const path = Skia.Path.Make();
    switch (direction) {
      case 'down-right':
        path.moveTo(ARROW_EDGE_SIZE, 0);
        path.lineTo(ARROW_SIZE, ARROW_EDGE_SIZE * 0.5);
        path.lineTo(ARROW_EDGE_SIZE, ARROW_EDGE_SIZE);
        break;
      case 'up-right':
        path.moveTo(ARROW_EDGE_SIZE, ARROW_EDGE_SIZE);
        path.lineTo(ARROW_SIZE, ARROW_EDGE_SIZE * 1.5);
        path.lineTo(ARROW_EDGE_SIZE, ARROW_EDGE_SIZE * 2);
        break;
      case 'right':
        path.moveTo(0, ARROW_EDGE_SIZE * 0.5);
        path.lineTo(ARROW_EDGE_SIZE, ARROW_EDGE_SIZE);
        path.lineTo(0, ARROW_EDGE_SIZE * 1.5);
        break;
      case 'down-left':
        path.moveTo(ARROW_EDGE_SIZE, 0);
        path.lineTo(0, ARROW_EDGE_SIZE * 0.5);
        path.lineTo(ARROW_EDGE_SIZE, ARROW_EDGE_SIZE);
        break;
      case 'up-left':
        path.moveTo(ARROW_EDGE_SIZE, ARROW_EDGE_SIZE);
        path.lineTo(0, ARROW_EDGE_SIZE * 1.5);
        path.lineTo(ARROW_EDGE_SIZE, ARROW_EDGE_SIZE * 2);
        break;
      case 'left':
        path.moveTo(ARROW_SIZE, ARROW_EDGE_SIZE * 0.5);
        path.lineTo(ARROW_EDGE_SIZE, ARROW_EDGE_SIZE);
        path.lineTo(ARROW_SIZE, ARROW_EDGE_SIZE * 1.5);
        break;
      case 'down':
        path.moveTo(ARROW_EDGE_SIZE * 0.5, 0);
        path.lineTo(ARROW_EDGE_SIZE * 1.5, 0);
        path.lineTo(ARROW_EDGE_SIZE, ARROW_EDGE_SIZE);
        break;
      case 'up':
        path.moveTo(ARROW_EDGE_SIZE * 0.5, ARROW_SIZE);
        path.lineTo(ARROW_EDGE_SIZE * 1.5, ARROW_SIZE);
        path.lineTo(ARROW_EDGE_SIZE, ARROW_EDGE_SIZE);
        break;
      case 'left-down':
        path.moveTo(ARROW_EDGE_SIZE, ARROW_SIZE / 2);
        path.lineTo(ARROW_EDGE_SIZE * 2, ARROW_SIZE / 2);
        path.lineTo(ARROW_EDGE_SIZE * 1.5, ARROW_SIZE);
        break;
      case 'left-up':
        path.moveTo(ARROW_EDGE_SIZE * 2, ARROW_EDGE_SIZE);
        path.lineTo(ARROW_EDGE_SIZE, ARROW_EDGE_SIZE);
        path.lineTo(ARROW_EDGE_SIZE * 1.5, 0);
        break;
      case 'right-down':
        path.moveTo(0, ARROW_SIZE / 2);
        path.lineTo(ARROW_EDGE_SIZE, ARROW_SIZE / 2);
        path.lineTo(ARROW_EDGE_SIZE * 0.5, ARROW_SIZE);
        break;
      case 'right-up':
        path.moveTo(ARROW_EDGE_SIZE, ARROW_EDGE_SIZE);
        path.lineTo(0, ARROW_EDGE_SIZE);
        path.lineTo(ARROW_EDGE_SIZE * 0.5, 0);
        break;
    }
    path.close();
    return path;
  };

  const renderCell = (cell: Cell, rowIndex: number, colIndex: number) => (
    <View
      key={`${rowIndex}-${colIndex}`}
      style={[styles.cellContainer, cell.clue ? styles.clueCell : null]}>
      <View style={styles.cell}>
        <Canvas style={StyleSheet.absoluteFill}>
          {cell.value && font && (
            <SkiaText
              x={CELL_SIZE / 2.8}
              y={CELL_SIZE / 1.6}
              text={cell.value}
              font={font}
              style="fill"
            />
          )}
        </Canvas>
        {cell.clue && <Text style={styles.clue}>{cell.clue}</Text>}
      </View>
      {cell.direction && (
        <Canvas
          style={[
            styles.arrow,
            cell.direction === 'right' && styles.rightArrow,
            cell.direction === 'left' && styles.leftArrow,
            cell.direction === 'up' && styles.upArrow,
            cell.direction === 'down' && styles.downArrow,
            (cell.direction === 'down-right' ||
              cell.direction === 'down-left') &&
              styles.downArrowLong,
            (cell.direction === 'up-right' || cell.direction === 'up-left') &&
              styles.upArrowLong,
            (cell.direction === 'left-down' || cell.direction === 'left-up') &&
              styles.leftArrowLong,
            (cell.direction === 'right-down' ||
              cell.direction === 'right-up') &&
              styles.rightArrowLong,
          ]}>
          <Path
            path={createLineArrowPath(cell.direction)}
            style="stroke"
            color="black"
            strokeWidth={2}
          />
          <Path
            path={createArrowPath(cell.direction)}
            color="black"
            style="fill"
          />
        </Canvas>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {mockGrid.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((cell, colIndex) => renderCell(cell, rowIndex, colIndex))}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  row: {
    flexDirection: 'row',
  },
  cellContainer: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cell: {
    width: CELL_SIZE - 2,
    height: CELL_SIZE - 2,
    borderWidth: 1,
    borderColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  clueCell: {
    backgroundColor: '#f0f0f0',
  },
  clue: {
    position: 'absolute',
    top: 2,
    left: 2,
    fontSize: 10,
  },
  arrow: {
    position: 'absolute',
    width: ARROW_SIZE,
    height: ARROW_SIZE,
    justifyContent: 'center',
  },
  rightArrow: {
    left: -ARROW_SIZE,
    top: (CELL_SIZE - ARROW_SIZE) / 2,
  },
  leftArrow: {
    right: -ARROW_SIZE,
    top: (CELL_SIZE - ARROW_SIZE) / 2,
  },
  upArrow: {
    top: -ARROW_SIZE,
    left: (CELL_SIZE - ARROW_SIZE) / 2,
  },
  upArrowLong: {
    top: -ARROW_SIZE - 2,
    left: (CELL_SIZE - ARROW_SIZE) / 2,
  },
  downArrow: {
    bottom: -ARROW_SIZE,
    left: (CELL_SIZE - ARROW_SIZE) / 2,
  },
  downArrowLong: {
    bottom: -ARROW_SIZE - 2,
    left: (CELL_SIZE - ARROW_SIZE) / 2,
  },
  leftArrowLong: {
    right: -ARROW_SIZE - 2,
    top: (CELL_SIZE - ARROW_SIZE) / 2,
  },
  rightArrowLong: {
    left: -ARROW_SIZE - 2,
    top: (CELL_SIZE - ARROW_SIZE) / 2,
  },
});

export default CrosswordPuzzle;
