interface IAddWalletOption {
    publicKey?: string;
    nickname?: string;
    privateKey?: string;
}
export default function addWallet({ nickname, privateKey }: IAddWalletOption): Promise<void>;
export {};
