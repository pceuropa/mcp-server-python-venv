import type { SecurityCheck, SecurityVulnerability } from '../types/index.js';
import { executePipCommand } from '../utils/pip-wrapper.js';
import { findVenv } from '../utils/venv-finder.js';

export function checkSecurity(): SecurityCheck {
    const venvInfo = findVenv();

    if (!venvInfo.found) {
        throw new Error('No virtual environment found');
    }

    try {
        const vulnerabilities = checkWithSafety(venvInfo);

        return {
            vulnerabilities,
            scan_date: new Date().toISOString()
        };
    } catch (error) {
        throw new Error(`Failed to check security: ${error}`);
    }
}

function checkWithSafety(venvInfo: any): SecurityVulnerability[] {
    try {
        const output = executePipCommand(venvInfo, ['list', '--format=json']);
        const packages = JSON.parse(output);

        const vulnerabilities: SecurityVulnerability[] = [];

        for (const pkg of packages) {
            try {
                const safetyOutput = executePipCommand(venvInfo, ['safety', 'check', '--json', '--short-report']);
                const safetyData = JSON.parse(safetyOutput);

                for (const vuln of safetyData) {
                    vulnerabilities.push({
                        package: vuln.package_name || pkg.name,
                        version: vuln.analyzed_version || pkg.version,
                        vulnerability: vuln.vulnerability_id || 'Unknown',
                        severity: vuln.severity || 'Unknown',
                        fix: vuln.fixed_versions ? `Upgrade to ${vuln.fixed_versions.join(' or ')}` : 'No fix available'
                    });
                }
            } catch (safetyError) {
                console.warn(`Safety check failed for ${pkg.name}:`, safetyError);
            }
        }

        return vulnerabilities;
    } catch (error) {
        console.warn('Safety tool not available, falling back to basic check');
        return checkWithPipAudit(venvInfo);
    }
}

function checkWithPipAudit(venvInfo: any): SecurityVulnerability[] {
    try {
        const output = executePipCommand(venvInfo, ['audit', '--format=json']);
        const auditData = JSON.parse(output);

        return auditData.vulnerabilities?.map((vuln: any) => ({
            package: vuln.package,
            version: vuln.version,
            vulnerability: vuln.vulnerability_id,
            severity: vuln.severity,
            fix: vuln.fix_versions ? `Upgrade to ${vuln.fix_versions.join(' or ')}` : 'No fix available'
        })) || [];
    } catch (error) {
        console.warn('pip-audit not available, returning empty vulnerabilities list');
        return [];
    }
}
