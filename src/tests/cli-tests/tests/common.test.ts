import {executeCommand} from "../src/helper";


//id1717
describe("Check version of package", () => {

    it('npx zksync-cli -V', () => {
        const command = 'npx zksync-cli -V';
        const result = executeCommand(command);
        expect(result.output).toMatch(/(^\d+\.\d+\.\d+$)/i);
        expect(result.exitCode).toBe(0);
    });

    it('npx zksync-cli --version', () => {
        const command = 'npx zksync-cli --version';
        const result = executeCommand(command);
        expect(result.output).toMatch(/(^\d+\.\d+\.\d+$)/i);
        expect(result.exitCode).toBe(0);
    });

    it('Negative: npx zksync-cli --wersion', () => {
        const command = 'npx zksync-cli --wersion';
        const result = executeCommand(command);
        expect(result.output).not.toMatch(/(^\d+\.\d+\.\d+$)/i);
        expect(result.exitCode).toBe(1);
    });

});

//id1734 id1715
describe("Check help for:", () => {

    it('npx zksync-cli help', () => {
        const command = 'npx zksync-cli help';
        const result = executeCommand(command);
        expect(result.output).toMatch(/(CLI tool that simplifies the process of developing applications and interacting)/i);
        expect(result.exitCode).toBe(0);
    });

    it('npx zksync-cli help dev', () => {
        const command = 'npx zksync-cli help dev';
        const result = executeCommand(command);
        expect(result.output).toMatch(/(Manage local zkSync development environment)/i);
        expect(result.exitCode).toBe(0);
    });

    it('Negative: npx zksync-cli helppp', () => {
        const command = 'npx zksync-cli helppp';
        const result = executeCommand(command);
        expect(result.output).toMatch(/(CLI tool that simplifies the process of developing applications and interacting)/i);
        expect(result.exitCode).toBe(1);
    });

    it('npx zksync-cli -h', () => {
        const command = 'npx zksync-cli -h';
        const result = executeCommand(command);
        expect(result.output).toMatch(/(Options:|Commands:)/i);
        expect(result.exitCode).toBe(0);
    });

    it('npx zksync-cli --help', () => {
        const command = 'npx zksync-cli --help';
        const result = executeCommand(command);
        expect(result.output).toMatch(/(Options:|Commands:)/i);
        expect(result.exitCode).toBe(0);
    });

});

//id1715
describe("Check help selection for:", () => {

    it('npx zksync-cli dev --help', () => {
        const command = 'npx zksync-cli dev --help';
        const result = executeCommand(command);
        expect(result.output).toMatch(/(Select modules to run in local development)/i);
        expect(result.output).toMatch(/(Start local zkSync environment and modules)/i);
        expect(result.output).toMatch(/(Stop local zkSync environment and modules)/i);
        expect(result.exitCode).toBe(0);
    });

    it('npx zksync-cli dev -h', () => {
        const command = 'npx zksync-cli dev -h';
        const result = executeCommand(command);
        expect(result.output).toMatch(/(Select modules to run in local development)/i);
        expect(result.output).toMatch(/(Start local zkSync environment and modules)/i);
        expect(result.output).toMatch(/(Stop local zkSync environment and modules)/i);
        expect(result.exitCode).toBe(0);
    });

    it('npx zksync-cli dev help start', () => {
        const command = 'npx zksync-cli dev help start';
        const result = executeCommand(command);
        expect(result.output).toMatch(/(Start local zkSync environment and modules)/i);
        expect(result.exitCode).toBe(0);
    });
});

//id1719
describe("User can check installed modules", () => {

    it('npx zksync-cli dev modules', () => {
        const command = 'npx zksync-cli dev modules';
        const result = executeCommand(command);
        expect(result.output).toMatch(/(In memory node)/i);
        expect(result.output).toMatch(/(Dockerized node)/i);
        expect(result.output).toMatch(/(Portal)/i);
        expect(result.exitCode).toBe(0);
    });
});



