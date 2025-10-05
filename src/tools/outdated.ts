import type { OutdatedCheck, OutdatedPackage } from '../types/index.js';
import { executePipCommand } from '../utils/pip-wrapper.js';
import { findVenv } from '../utils/venv-finder.js';

export function checkOutdated(): OutdatedCheck {
    const venvInfo = findVenv();

    if (!venvInfo.found) {
        throw new Error('No virtual environment found');
    }

    try {
        const output = executePipCommand(venvInfo, ['list', '--outdated', '--format=json']);
        const outdatedData = JSON.parse(output);

        const outdated: OutdatedPackage[] = outdatedData.map((pkg: any) => ({
            name: pkg.name,
            current_version: pkg.version,
            latest_version: pkg.latest_version,
            upgrade_type: determineUpgradeType(pkg.version, pkg.latest_version)
        }));

        const upgradeCommand = generateUpgradeCommand(outdated);

        return {
            outdated,
            upgrade_command: upgradeCommand
        };
    } catch (error) {
        throw new Error(`Failed to check outdated packages: ${error}`);
    }
}

function determineUpgradeType(currentVersion: string, latestVersion: string): 'major' | 'minor' | 'patch' {
    const currentParts = currentVersion.split('.').map(Number);
    const latestParts = latestVersion.split('.').map(Number);

    if (currentParts[0] !== latestParts[0]) {
        return 'major';
    }

    if (currentParts[1] !== latestParts[1]) {
        return 'minor';
    }

    return 'patch';
}

function generateUpgradeCommand(outdated: OutdatedPackage[]): string {
    if (outdated.length === 0) {
        return 'All packages are up to date';
    }

    const packageNames = outdated.map(pkg => pkg.name);
    return `pip install --upgrade ${packageNames.join(' ')}`;
}
