import type { LicenseCheck, LicenseInfo } from '../types/index.js';
import { executePipCommand } from '../utils/pip-wrapper.js';
import { findVenv } from '../utils/venv-finder.js';

export function checkLicenses(): LicenseCheck {
    const venvInfo = findVenv();

    if (!venvInfo.found) {
        throw new Error('No virtual environment found');
    }

    try {
        const packages = getInstalledPackages(venvInfo);
        const licenseInfo = extractLicenseInfo(venvInfo, packages);
        const warnings = generateLicenseWarnings(licenseInfo);

        return {
            packages: licenseInfo,
            warnings
        };
    } catch (error) {
        throw new Error(`Failed to check licenses: ${error}`);
    }
}

function getInstalledPackages(venvInfo: any): Array<{ name: string; version: string }> {
    try {
        const output = executePipCommand(venvInfo, ['list', '--format=json']);
        return JSON.parse(output);
    } catch (error) {
        throw new Error(`Failed to get installed packages: ${error}`);
    }
}

function extractLicenseInfo(venvInfo: any, packages: Array<{ name: string; version: string }>): LicenseInfo[] {
    const licenseInfo: LicenseInfo[] = [];

    for (const pkg of packages) {
        try {
            const output = executePipCommand(venvInfo, ['show', pkg.name]);
            const license = extractLicenseFromShow(output);
            const category = categorizeLicense(license);

            licenseInfo.push({
                name: pkg.name,
                version: pkg.version,
                license,
                category
            });
        } catch (error) {
            console.warn(`Failed to get license info for ${pkg.name}:`, error);
            licenseInfo.push({
                name: pkg.name,
                version: pkg.version,
                license: 'Unknown',
                category: 'unknown'
            });
        }
    }

    return licenseInfo;
}

function extractLicenseFromShow(showOutput: string): string {
    const lines = showOutput.split('\n');

    for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('License:')) {
            return trimmed.substring(8).trim();
        }
    }

    return 'Unknown';
}

function categorizeLicense(license: string): string {
    const licenseLower = license.toLowerCase();

    if (licenseLower.includes('mit') || licenseLower.includes('bsd') || licenseLower.includes('apache')) {
        return 'permissive';
    }

    if (licenseLower.includes('gpl') || licenseLower.includes('copyleft') || licenseLower.includes('agpl')) {
        return 'copyleft';
    }

    if (licenseLower.includes('proprietary') || licenseLower.includes('commercial') || licenseLower.includes('private')) {
        return 'proprietary';
    }

    if (licenseLower.includes('public domain') || licenseLower.includes('unlicense')) {
        return 'public-domain';
    }

    return 'unknown';
}

function generateLicenseWarnings(licenseInfo: LicenseInfo[]): string[] {
    const warnings: string[] = [];

    const copyleftPackages = licenseInfo.filter(pkg => pkg.category === 'copyleft');
    if (copyleftPackages.length > 0) {
        warnings.push(`Found ${copyleftPackages.length} copyleft packages: ${copyleftPackages.map(p => p.name).join(', ')}`);
    }

    const proprietaryPackages = licenseInfo.filter(pkg => pkg.category === 'proprietary');
    if (proprietaryPackages.length > 0) {
        warnings.push(`Found ${proprietaryPackages.length} proprietary packages: ${proprietaryPackages.map(p => p.name).join(', ')}`);
    }

    const unknownLicenses = licenseInfo.filter(pkg => pkg.category === 'unknown');
    if (unknownLicenses.length > 0) {
        warnings.push(`Found ${unknownLicenses.length} packages with unknown licenses: ${unknownLicenses.map(p => p.name).join(', ')}`);
    }

    return warnings;
}
