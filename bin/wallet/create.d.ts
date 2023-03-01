interface IWalletCreateResult {
    address: string;
    privateKey: string;
    publicKey: string;
    nickname: string;
}
interface IWalletCreateOption {
    count: number;
}
export default function ({ count }: IWalletCreateOption): Promise<IWalletCreateResult[]>;
export {};
