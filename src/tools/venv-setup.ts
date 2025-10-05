import { execSync } from 'child_process';
import type { VenvSetup } from '../types/index.js';
import { findVenv } from '../utils/venv-finder.js';

export function suggestVenvSetup(): VenvSetup {
    const venvInfo = findVenv();
    const pythonAvailable = checkPythonAvailable();

    const suggestedCommands: string[] = [];
    const toolRecommendations: Array<{ name: string; reason: string }> = [];

    if (!venvInfo.found && pythonAvailable) {
        suggestedCommands.push('python -m venv .venv');
        suggestedCommands.push('source .venv/bin/activate  # On Unix/macOS');
        suggestedCommands.push('.venv\\Scripts\\activate  # On Windows');
        suggestedCommands.push('pip install --upgrade pip');

        toolRecommendations.push({
            name: 'venv',
            reason: 'Built into Python 3.3+, simple and reliable'
        });

        if (checkToolAvailable('uv')) {
            suggestedCommands.push('uv venv');
            suggestedCommands.push('uv pip install --upgrade pip');
            toolRecommendations.push({
                name: 'uv',
                reason: 'Fast, modern Python package manager'
            });
        }

        if (checkToolAvailable('poetry')) {
            suggestedCommands.push('poetry init');
            suggestedCommands.push('poetry install');
            toolRecommendations.push({
                name: 'poetry',
                reason: 'Excellent dependency management and packaging'
            });
        }

        if (checkToolAvailable('pipenv')) {
            suggestedCommands.push('pipenv install');
            toolRecommendations.push({
                name: 'pipenv',
                reason: 'Combines pip and virtualenv with Pipfile'
            });
        }
    }

    return {
        has_venv: venvInfo.found,
        python_available: pythonAvailable,
        suggested_commands: suggestedCommands,
        tool_recommendations: toolRecommendations
    };
}

function checkPythonAvailable(): boolean {
    try {
        execSync('python --version', { stdio: 'pipe' });
        return true;
    } catch {
        try {
            execSync('python3 --version', { stdio: 'pipe' });
            return true;
        } catch {
            return false;
        }
    }
}

function checkToolAvailable(tool: string): boolean {
    try {
        execSync(`${tool} --version`, { stdio: 'pipe' });
        return true;
    } catch {
        return false;
    }
}
