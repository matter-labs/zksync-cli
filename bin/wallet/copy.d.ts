interface ICopyWalletOption {
    publicKey?: string;
    address?: string;
    nickname?: string;
    pathTo?: string;
}
export default function copyWallet({ publicKey, address, nickname, pathTo }: ICopyWalletOption): Promise<void>;
export {};
