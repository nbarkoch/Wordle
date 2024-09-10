import {useMemo} from 'react';
import wordList from '~/database/wordlist';

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

const useWordValidator = () => {
  const trie = useMemo(() => {
    const wordsTrie = new Trie();

    try {
      const words: string[] = wordList.split('\n');

      words.forEach(word => wordsTrie.insert(word.trim()));
    } catch (error) {
      console.error('Failed to load words:', error);
    }

    return wordsTrie;
  }, []);

  const isValidWord = (word: string): boolean => {
    return trie.search(word);
  };

  const isValidPrefix = (prefix: string): boolean => {
    return trie.startsWith(prefix);
  };

  return {isValidWord, isValidPrefix, isReady: true};
};

export default useWordValidator;
