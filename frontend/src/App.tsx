import React from 'react';
import AppStyled from './App.styled';
import { LiquidityManager } from './components/LiquidityManager/LiquidityManager';
import { Swapper } from './components/Swapper/Swapper';
import { TokensProvider } from './components/TokensProvider/TokensProvider';
import { WalletProvider } from './components/WalletProvider/WalletProvider';

function App() {
  return (
    <AppStyled>
      <WalletProvider>
        <TokensProvider>
          <Swapper />
          <LiquidityManager />
        </TokensProvider>
      </WalletProvider>
    </AppStyled>
  );
}

export default App;
