import { existsSync } from 'fs';
import { join, resolve } from 'path';
import type { EnvironmentManager } from '../types/index.js';

export function detectEnvironmentManager(projectPath?: string): EnvironmentManager {
    const searchPath = projectPath ? resolve(projectPath) : process.cwd();

    const managers = [
        { name: 'uv' as const, files: ['uv.lock', 'pyproject.toml'], priority: 1 },
        { name: 'poetry' as const, files: ['poetry.lock', 'pyproject.toml'], priority: 2 },
        { name: 'pipenv' as const, files: ['Pipfile', 'Pipfile.lock'], priority: 3 },
        { name: 'conda' as const, files: ['environment.yml', 'conda-meta'], priority: 4 },
        { name: 'venv' as const, files: ['.venv', 'venv', '.virtualenv'], priority: 5 }
    ];

    const foundManagers = managers
        .map(manager => ({
            ...manager,
            configFiles: findConfigFiles(searchPath, manager.files),
            envPath: findEnvironmentPath(searchPath, manager.name)
        }))
        .filter(manager => manager.configFiles.length > 0 || manager.envPath)
        .sort((a, b) => a.priority - b.priority);

    if (foundManagers.length === 0) {
        return {
            manager: 'venv',
            config_files: [],
            env_path: ''
        };
    }

    const primaryManager = foundManagers[0];
    if (!primaryManager) {
        return {
            manager: 'venv',
            config_files: [],
            env_path: ''
        };
    }

    return {
        manager: primaryManager.name,
        config_files: primaryManager.configFiles,
        env_path: primaryManager.envPath
    };
}

function findConfigFiles(searchPath: string, files: string[]): string[] {
    const foundFiles: string[] = [];

    for (const file of files) {
        const filePath = join(searchPath, file);
        if (existsSync(filePath)) {
            foundFiles.push(filePath);
        }
    }

    return foundFiles;
}

function findEnvironmentPath(searchPath: string, _manager: string): string {
    const possiblePaths = [
        join(searchPath, '.venv'),
        join(searchPath, 'venv'),
        join(searchPath, '.virtualenv'),
        join(searchPath, 'env'),
        join(searchPath, '.conda'),
        join(searchPath, 'conda-env')
    ];

    for (const path of possiblePaths) {
        if (existsSync(path)) {
            return path;
        }
    }

    return '';
}
