import { findVenv } from '../utils/venv-finder.js';
import { executePipCommand } from '../utils/pip-wrapper.js';
import { findRequirementsFiles, parseRequirementsTxt, parsePyprojectToml, parsePipfile } from '../utils/file-parsers.js';
import type { RequirementsComparison } from '../types/index.js';

export function compareRequirements(file?: string): RequirementsComparison {
  const venvInfo = findVenv();
  
  if (!venvInfo.found) {
    throw new Error('No virtual environment found');
  }
  
  const requirementsFiles = file ? [file] : findRequirementsFiles();
  
  if (requirementsFiles.length === 0) {
    throw new Error('No requirements files found');
  }
  
  const requirements = parseAllRequirementsFiles(requirementsFiles);
  const installedPackages = getInstalledPackages(venvInfo);
  
  const missing: Array<{ name: string; required_version: string }> = [];
  const extra: Array<{ name: string; installed_version: string }> = [];
  const mismatched: Array<{ name: string; required: string; installed: string }> = [];
  
  for (const req of requirements) {
    const installed = installedPackages.find(pkg => pkg.name.toLowerCase() === req.name.toLowerCase());
    
    if (!installed) {
      missing.push({
        name: req.name,
        required_version: req.version || 'any'
      });
    } else if (req.version && !checkVersionMatch(installed.version, req.version)) {
      mismatched.push({
        name: req.name,
        required: req.version,
        installed: installed.version
      });
    }
  }
  
  for (const installed of installedPackages) {
    const required = requirements.find(req => req.name.toLowerCase() === installed.name.toLowerCase());
    if (!required) {
      extra.push({
        name: installed.name,
        installed_version: installed.version
      });
    }
  }
  
  const installCommand = generateInstallCommand(missing, mismatched);
  
  return {
    missing,
    extra,
    mismatched,
    install_command: installCommand
  };
}

function parseAllRequirementsFiles(files: string[]): Array<{ name: string; version?: string | undefined }> {
  const allRequirements: Array<{ name: string; version?: string | undefined }> = [];
  
  for (const file of files) {
    let requirements: Array<{ name: string; version?: string | undefined }> = [];
    
    if (file.endsWith('requirements.txt')) {
      requirements = parseRequirementsTxt(file);
    } else if (file.endsWith('pyproject.toml')) {
      requirements = parsePyprojectToml(file);
    } else if (file.endsWith('Pipfile')) {
      requirements = parsePipfile(file);
    }
    
    allRequirements.push(...requirements);
  }
  
  return allRequirements;
}

function getInstalledPackages(venvInfo: any): Array<{ name: string; version: string }> {
  try {
    const output = executePipCommand(venvInfo, ['list', '--format=json']);
    return JSON.parse(output);
  } catch (error) {
    throw new Error(`Failed to get installed packages: ${error}`);
  }
}

function checkVersionMatch(installedVersion: string, requiredVersion: string): boolean {
  if (requiredVersion.startsWith('==')) {
    return installedVersion === requiredVersion.substring(2);
  }
  
  if (requiredVersion.startsWith('>=')) {
    return compareVersions(installedVersion, requiredVersion.substring(2)) >= 0;
  }
  
  if (requiredVersion.startsWith('<=')) {
    return compareVersions(installedVersion, requiredVersion.substring(2)) <= 0;
  }
  
  if (requiredVersion.startsWith('>')) {
    return compareVersions(installedVersion, requiredVersion.substring(1)) > 0;
  }
  
  if (requiredVersion.startsWith('<')) {
    return compareVersions(installedVersion, requiredVersion.substring(1)) < 0;
  }
  
  if (requiredVersion.startsWith('~=')) {
    return checkCompatibleVersion(installedVersion, requiredVersion.substring(2));
  }
  
  return installedVersion === requiredVersion;
}

function compareVersions(version1: string, version2: string): number {
  const v1Parts = version1.split('.').map(Number);
  const v2Parts = version2.split('.').map(Number);
  
  const maxLength = Math.max(v1Parts.length, v2Parts.length);
  
  for (let i = 0; i < maxLength; i++) {
    const v1Part = v1Parts[i] || 0;
    const v2Part = v2Parts[i] || 0;
    
    if (v1Part > v2Part) return 1;
    if (v1Part < v2Part) return -1;
  }
  
  return 0;
}

function checkCompatibleVersion(installedVersion: string, requiredVersion: string): boolean {
  const installedParts = installedVersion.split('.').map(Number);
  const requiredParts = requiredVersion.split('.').map(Number);
  
  if (installedParts.length < 2 || requiredParts.length < 2) {
    return compareVersions(installedVersion, requiredVersion) >= 0;
  }
  
  if (installedParts[0] !== requiredParts[0]) {
    return false;
  }
  
  if ((installedParts[1] ?? 0) < (requiredParts[1] ?? 0)) {
    return false;
  }
  
  if ((installedParts[1] ?? 0) > (requiredParts[1] ?? 0)) {
    return true;
  }
  
  return compareVersions(installedVersion, requiredVersion) >= 0;
}

function generateInstallCommand(missing: Array<{ name: string; required_version: string }>, mismatched: Array<{ name: string; required: string; installed: string }>): string {
  const packages = [
    ...missing.map(pkg => {
      if (pkg.required_version && pkg.required_version !== 'any') {
        return `${pkg.name}${pkg.required_version}`;
      }
      return pkg.name;
    }),
    ...mismatched.map(pkg => {
      if (pkg.required && pkg.required !== 'any') {
        return `${pkg.name}${pkg.required}`;
      }
      return pkg.name;
    })
  ];
  
  if (packages.length === 0) {
    return 'All requirements satisfied';
  }
  
  return `pip install ${packages.join(' ')}`;
}
