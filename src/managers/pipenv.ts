import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

export interface PipenvInfo {
    project_name: string;
    python_version: string;
    virtual_env_path: string;
    dependencies: Array<{ name: string; version: string }>;
    dev_dependencies: Array<{ name: string; version: string }>;
    lock_file_exists: boolean;
}

export function getPipenvInfo(projectPath?: string): PipenvInfo {
    const searchPath = projectPath || process.cwd();
    const pipfilePath = join(searchPath, 'Pipfile');
    const lockPath = join(searchPath, 'Pipfile.lock');

    if (!existsSync(pipfilePath)) {
        throw new Error('No Pipfile found - not a Pipenv project');
    }

    try {
        const pipfileContent = readFileSync(pipfilePath, 'utf8');
        const projectInfo = parsePipfile(pipfileContent);

        let virtualEnvPath = '';
        let pythonVersion = '';
        let dependencies: Array<{ name: string; version: string }> = [];

        try {
            const envOutput = execSync('pipenv --venv', {
                cwd: searchPath,
                encoding: 'utf8',
                stdio: 'pipe'
            });
            virtualEnvPath = envOutput.trim();
        } catch (error) {
            console.warn('Could not get Pipenv virtual environment path:', error);
        }

        try {
            const pythonOutput = execSync('pipenv --python', {
                cwd: searchPath,
                encoding: 'utf8',
                stdio: 'pipe'
            });
            pythonVersion = pythonOutput.trim();
        } catch (error) {
            console.warn('Could not get Pipenv Python version:', error);
        }

        try {
            const graphOutput = execSync('pipenv graph --json', {
                cwd: searchPath,
                encoding: 'utf8',
                stdio: 'pipe'
            });
            const packages = JSON.parse(graphOutput);
            dependencies = packages.map((pkg: any) => ({
                name: pkg.package_name,
                version: pkg.installed_version
            }));
        } catch (error) {
            console.warn('Could not get Pipenv packages:', error);
        }

        return {
            project_name: projectInfo.name || 'unknown',
            python_version: pythonVersion,
            virtual_env_path: virtualEnvPath,
            dependencies,
            dev_dependencies: [],
            lock_file_exists: existsSync(lockPath)
        };
    } catch (error) {
        throw new Error(`Failed to get Pipenv info: ${error}`);
    }
}

function parsePipfile(content: string): { name?: string } {
    const lines = content.split('\n');
    const result: { name?: string } = {};

    for (const line of lines) {
        const trimmed = line.trim();

        if (trimmed.startsWith('name') && trimmed.includes('=')) {
            const [, value] = trimmed.split('=').map(s => s.trim());
            if (value) {
                const cleanValue = value.replace(/^["']|["']$/g, '');
                result.name = cleanValue;
                break;
            }
        }
    }

    return result;
}
