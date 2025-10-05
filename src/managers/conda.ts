import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

export interface CondaInfo {
    environment_name: string;
    python_version: string;
    conda_version: string;
    packages: Array<{ name: string; version: string; channel: string }>;
    environment_file_exists: boolean;
    environment_path: string;
}

export function getCondaInfo(projectPath?: string): CondaInfo {
    const searchPath = projectPath || process.cwd();
    const envFilePath = join(searchPath, 'environment.yml');

    let environmentName = 'base';
    let pythonVersion = '';
    let condaVersion = '';
    let packages: Array<{ name: string; version: string; channel: string }> = [];
    let environmentPath = '';

    try {
        const infoOutput = execSync('conda info --json', {
            encoding: 'utf8',
            stdio: 'pipe'
        });
        const condaInfo = JSON.parse(infoOutput);
        condaVersion = condaInfo.conda_version || '';
        environmentPath = condaInfo.active_prefix || '';
    } catch (error) {
        console.warn('Could not get Conda info:', error);
    }

    try {
        const envOutput = execSync('conda env list --json', {
            encoding: 'utf8',
            stdio: 'pipe'
        });
        const envs = JSON.parse(envOutput);
        const activeEnv = envs.envs.find((env: string) => env === environmentPath);
        if (activeEnv) {
            const envName = envs.envs.indexOf(activeEnv);
            environmentName = envs.envs[envName] || 'base';
        }
    } catch (error) {
        console.warn('Could not get Conda environments:', error);
    }

    try {
        const listOutput = execSync('conda list --json', {
            encoding: 'utf8',
            stdio: 'pipe'
        });
        const condaPackages = JSON.parse(listOutput);
        packages = condaPackages.map((pkg: any) => ({
            name: pkg.name,
            version: pkg.version,
            channel: pkg.channel || 'defaults'
        }));

        const pythonPkg = packages.find(pkg => pkg.name === 'python');
        if (pythonPkg) {
            pythonVersion = pythonPkg.version;
        }
    } catch (error) {
        console.warn('Could not get Conda packages:', error);
    }

    if (existsSync(envFilePath)) {
        try {
            const envContent = readFileSync(envFilePath, 'utf8');
            const envInfo = parseEnvironmentYaml(envContent);
            if (envInfo.name) {
                environmentName = envInfo.name;
            }
        } catch (error) {
            console.warn('Could not parse environment.yml:', error);
        }
    }

    return {
        environment_name: environmentName,
        python_version: pythonVersion,
        conda_version: condaVersion,
        packages,
        environment_file_exists: existsSync(envFilePath),
        environment_path: environmentPath
    };
}

function parseEnvironmentYaml(content: string): { name?: string } {
    const lines = content.split('\n');
    const result: { name?: string } = {};

    for (const line of lines) {
        const trimmed = line.trim();

        if (trimmed.startsWith('name:') && trimmed.includes(':')) {
            const [, value] = trimmed.split(':').map(s => s.trim());
            if (value) {
                result.name = value;
            }
            break;
        }
    }

    return result;
}
