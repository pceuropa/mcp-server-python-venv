import type { EnvironmentExport } from '../types/index.js';
import { executePipCommand } from '../utils/pip-wrapper.js';
import { findVenv } from '../utils/venv-finder.js';

export function exportEnvironment(format: 'requirements' | 'pyproject' | 'conda'): EnvironmentExport {
    const venvInfo = findVenv();

    if (!venvInfo.found) {
        throw new Error('No virtual environment found');
    }

    try {
        const packages = getInstalledPackages(venvInfo);
        let content = '';

        switch (format) {
            case 'requirements':
                content = exportToRequirements(packages);
                break;
            case 'pyproject':
                content = exportToPyproject(packages);
                break;
            case 'conda':
                content = exportToConda(packages);
                break;
            default:
                throw new Error(`Unsupported export format: ${format}`);
        }

        return {
            format,
            content
        };
    } catch (error) {
        throw new Error(`Failed to export environment: ${error}`);
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

function exportToRequirements(packages: Array<{ name: string; version: string }>): string {
    const lines = packages
        .filter(pkg => !isStandardLibrary(pkg.name))
        .map(pkg => `${pkg.name}==${pkg.version}`)
        .sort();

    return lines.join('\n') + '\n';
}

function exportToPyproject(packages: Array<{ name: string; version: string }>): string {
    const dependencies = packages
        .filter(pkg => !isStandardLibrary(pkg.name))
        .map(pkg => `"${pkg.name}==${pkg.version}"`)
        .sort();

    return `[project]
name = "my-project"
version = "0.1.0"
description = "My project"
dependencies = [
${dependencies.map(dep => `    ${dep}`).join(',\n')}
]

[build-system]
requires = ["setuptools>=61.0", "wheel"]
build-backend = "setuptools.build_meta"
`;
}

function exportToConda(packages: Array<{ name: string; version: string }>): string {
    const dependencies = packages
        .filter(pkg => !isStandardLibrary(pkg.name))
        .map(pkg => `  - ${pkg.name}=${pkg.version}`)
        .sort();

    return `name: my-environment
channels:
  - defaults
  - conda-forge
dependencies:
${dependencies.join('\n')}
`;
}

function isStandardLibrary(packageName: string): boolean {
    const stdlibPackages = [
        'os', 'sys', 'json', 'datetime', 'collections', 'itertools',
        'functools', 'operator', 'math', 'random', 'string', 're',
        'urllib', 'http', 'email', 'html', 'xml', 'sqlite3', 'csv',
        'configparser', 'logging', 'unittest', 'doctest', 'pdb',
        'profile', 'timeit', 'trace', 'gc', 'inspect', 'ast',
        'dis', 'pickle', 'copy', 'pprint', 'reprlib', 'enum',
        'numbers', 'decimal', 'fractions', 'statistics', 'pathlib',
        'fileinput', 'tempfile', 'glob', 'fnmatch', 'linecache',
        'shutil', 'macpath', 'platform', 'errno', 'io', 'time',
        'argparse', 'getopt', 'logging', 'getpass', 'curses',
        'platform', 'ctypes', 'struct', 'codecs', 'unicodedata',
        'stringprep', 'readline', 'rlcompleter'
    ];

    return stdlibPackages.includes(packageName.toLowerCase());
}
