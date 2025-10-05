import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

export interface PoetryInfo {
    project_name: string;
    version: string;
    description: string;
    dependencies: Array<{ name: string; version: string }>;
    dev_dependencies: Array<{ name: string; version: string }>;
    python_version: string;
    virtual_env_path: string;
    lock_file_exists: boolean;
}

export function getPoetryInfo(projectPath?: string): PoetryInfo {
    const searchPath = projectPath || process.cwd();
    const pyprojectPath = join(searchPath, 'pyproject.toml');
    const lockPath = join(searchPath, 'poetry.lock');

    if (!existsSync(pyprojectPath)) {
        throw new Error('No pyproject.toml found - not a Poetry project');
    }

    try {
        const pyprojectContent = readFileSync(pyprojectPath, 'utf8');
        const projectInfo = parsePyprojectToml(pyprojectContent);

        let virtualEnvPath = '';
        let pythonVersion = '';
        let dependencies: Array<{ name: string; version: string }> = [];

        try {
            const poetryOutput = execSync('poetry env info --json', {
                cwd: searchPath,
                encoding: 'utf8',
                stdio: 'pipe'
            });
            const envInfo = JSON.parse(poetryOutput);
            virtualEnvPath = envInfo.path || '';
            pythonVersion = envInfo.version || '';
        } catch (error) {
            console.warn('Could not get Poetry environment info:', error);
        }

        try {
            const showOutput = execSync('poetry show --json', {
                cwd: searchPath,
                encoding: 'utf8',
                stdio: 'pipe'
            });
            const packages = JSON.parse(showOutput);
            dependencies = packages.map((pkg: any) => ({
                name: pkg.name,
                version: pkg.version
            }));
        } catch (error) {
            console.warn('Could not get Poetry packages:', error);
        }

        return {
            project_name: projectInfo.name || 'unknown',
            version: projectInfo.version || '0.0.0',
            description: projectInfo.description || '',
            dependencies,
            dev_dependencies: [],
            python_version: pythonVersion,
            virtual_env_path: virtualEnvPath,
            lock_file_exists: existsSync(lockPath)
        };
    } catch (error) {
        throw new Error(`Failed to get Poetry info: ${error}`);
    }
}

function parsePyprojectToml(content: string): { name?: string; version?: string; description?: string } {
    const lines = content.split('\n');
    const result: { name?: string; version?: string; description?: string } = {};
    let inToolPoetry = false;

    for (const line of lines) {
        const trimmed = line.trim();

        if (trimmed === '[tool.poetry]') {
            inToolPoetry = true;
            continue;
        }

        if (trimmed.startsWith('[') && trimmed !== '[tool.poetry]') {
            inToolPoetry = false;
            continue;
        }

        if (inToolPoetry && trimmed.includes('=')) {
            const [key, value] = trimmed.split('=').map(s => s.trim());
            if (value) {
                const cleanValue = value.replace(/^["']|["']$/g, '');

                if (key === 'name') {
                    result.name = cleanValue;
                } else if (key === 'version') {
                    result.version = cleanValue;
                } else if (key === 'description') {
                    result.description = cleanValue;
                }
            }
        }
    }

    return result;
}
