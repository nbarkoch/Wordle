import {useCallback, useMemo} from 'react';

import wordList3 from '~/database/wordle_3.json';
import wordList4 from '~/database/wordle_4.json';
import wordList5 from '~/database/wordle.json';

const wordLists: {[key: number]: string[]} = {
  3: wordList3,
  4: wordList4,
  5: wordList5,
};

class TrieNode {
  children: Map<string, TrieNode> = new Map();
  isEndOfWord: boolean = false;
}

class Trie {
  root: TrieNode = new TrieNode();

  insert(word: string): void {
    let node = this.root;
    for (const char of word) {
      if (!node.children.has(char)) {
        node.children.set(char, new TrieNode());
      }
      node = node.children.get(char)!;
    }
    node.isEndOfWord = true;
  }

  search(word: string): boolean {
    let node = this.root;
    for (const char of word) {
      if (!node.children.has(char)) {
        return false;
      }
      node = node.children.get(char)!;
    }
    return node.isEndOfWord;
  }

  startsWith(prefix: string): boolean {
    let node = this.root;
    for (const char of prefix) {
      if (!node.children.has(char)) {
        return false;
      }
      node = node.children.get(char)!;
    }
    return true;
  }
}

const useWordValidator = (wordLength: number) => {
  const trie = useMemo(() => {
    const wordsTrie = new Trie();

    try {
      const words = wordLists[wordLength];
      words.forEach(word => wordsTrie.insert(word.trim()));
    } catch (error) {
      console.error('Failed to load words:', error);
    }

    return wordsTrie;
  }, [wordLength]);

  const isValidWord = useCallback(
    (word: string): boolean => {
      return trie.search(word);
    },
    [trie],
  );

  const isValidPrefix = useCallback(
    (prefix: string): boolean => {
      return trie.startsWith(prefix);
    },
    [trie],
  );

  return {isValidWord, isValidPrefix, isReady: true};
};

export default useWordValidator;
