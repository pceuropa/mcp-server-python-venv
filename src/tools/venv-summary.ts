import { execSync } from 'child_process';
import type { VenvSummary } from '../types/index.js';
import { findVenv } from '../utils/venv-finder.js';
import { checkOutdated } from './outdated.js';
import { listPackages } from './package-list.js';
import { getPythonVersion } from './python-version.js';
import { compareRequirements } from './requirements.js';

export function getVenvSummary(): VenvSummary {
    const venvInfo = findVenv();

    if (!venvInfo.found) {
        throw new Error('No virtual environment found');
    }

    try {
        const pythonVersion = getPythonVersion();
        const packages = listPackages();
        const outdated = checkOutdated();
        const requirements = compareRequirements();

        const totalSize = calculateVenvSize(venvInfo.path);
        const requirementsStatus = getRequirementsStatus(requirements);

        return {
            python_version: pythonVersion.version,
            venv_path: venvInfo.path,
            venv_type: venvInfo.type,
            package_count: packages.packages.length,
            total_size: totalSize,
            requirements_status: requirementsStatus,
            outdated_count: outdated.outdated.length
        };
    } catch (error) {
        throw new Error(`Failed to get venv summary: ${error}`);
    }
}

function calculateVenvSize(venvPath: string): string {
    try {
        const output = execSync(`du -sh "${venvPath}"`, { encoding: 'utf8' });
        return output.split('\t')[0] || 'Unknown';
    } catch {
        try {
            const output = execSync(`powershell -Command "Get-ChildItem '${venvPath}' -Recurse | Measure-Object -Property Length -Sum"`, { encoding: 'utf8' });
            const match = output.match(/Sum\s*:\s*(\d+)/);
            if (match && match[1]) {
                const bytes = parseInt(match[1]);
                return formatBytes(bytes);
            }
        } catch {
            // Fallback
        }
        return 'Unknown';
    }
}

function formatBytes(bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
}

function getRequirementsStatus(requirements: any): string {
    const totalIssues = requirements.missing.length + requirements.extra.length + requirements.mismatched.length;

    if (totalIssues === 0) {
        return 'All requirements satisfied';
    }

    const issues = [];
    if (requirements.missing.length > 0) {
        issues.push(`${requirements.missing.length} missing`);
    }
    if (requirements.extra.length > 0) {
        issues.push(`${requirements.extra.length} extra`);
    }
    if (requirements.mismatched.length > 0) {
        issues.push(`${requirements.mismatched.length} mismatched`);
    }

    return `${totalIssues} issues: ${issues.join(', ')}`;
}
