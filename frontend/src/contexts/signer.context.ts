import { ethers } from 'ethers';
import { createContext } from 'react';

export interface ISignerContextValue {
  signer: ethers.providers.JsonRpcSigner | null;
  setSigner: React.Dispatch<
    React.SetStateAction<ethers.providers.JsonRpcSigner | undefined>
  >;
  ethBalance: string | null;
}

export const initialValue: ISignerContextValue = {
  signer: null,
  setSigner: () => {
    return;
  },
  ethBalance: null,
};

const SignerContext = createContext(initialValue);
export default SignerContext;
