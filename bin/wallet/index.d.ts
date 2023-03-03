declare enum WalletCommands {
    Create = "create",
    List = "ls",
    Delete = "delete",
    Clean = "clean",
    Add = "add",
    Fund = "fund",
    Copy = "copy"
}
interface IWalletOptions {
    option: WalletCommands;
    args: string[];
}
export default function wallet({ option, args }: IWalletOptions): void;
export {};
