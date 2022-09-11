import { createContext } from 'react';
import { Token } from '../types/Token';

export const initialValue: Map<string, Token> = new Map();

const TokensContext = createContext(initialValue);
export default TokensContext;
