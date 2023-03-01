interface IDeleteWalletOption {
    publicKey?: string;
    address?: string;
    nickname?: string;
}
export default function deleteWallet({ publicKey, address, nickname }: IDeleteWalletOption): Promise<void>;
export {};
