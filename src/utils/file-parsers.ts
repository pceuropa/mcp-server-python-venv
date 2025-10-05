import { existsSync, readFileSync } from 'fs';
import { join, resolve } from 'path';

export interface ParsedRequirement {
  name: string;
  version?: string | undefined;
  extras?: string[];
  url?: string;
  editable?: boolean;
}

export function parseRequirementsTxt(filePath: string): ParsedRequirement[] {
  if (!existsSync(filePath)) {
    return [];
  }

  const content = readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const requirements: ParsedRequirement[] = [];

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const requirement = parseRequirementLine(trimmed);
    if (requirement) {
      requirements.push(requirement);
    }
  }

  return requirements;
}

export function parsePyprojectToml(filePath: string): ParsedRequirement[] {
  if (!existsSync(filePath)) {
    return [];
  }

  try {
    const content = readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const requirements: ParsedRequirement[] = [];
    let inDependencies = false;
    let inProjectSection = false;

    for (const line of lines) {
      const trimmed = line.trim();

      if (trimmed === '[project]') {
        inProjectSection = true;
        inDependencies = false;
        continue;
      }

      if (trimmed === '[tool.poetry.dependencies]') {
        inProjectSection = false;
        inDependencies = true;
        continue;
      }

      if (trimmed.startsWith('[') && trimmed !== '[project]' && trimmed !== '[tool.poetry.dependencies]') {
        inDependencies = false;
        inProjectSection = false;
        continue;
      }

      if (inDependencies && trimmed.startsWith('python')) {
        continue;
      }

      if ((inDependencies || (inProjectSection && trimmed.startsWith('dependencies'))) && trimmed.includes('=')) {
        const requirement = parseRequirementLine(trimmed);
        if (requirement) {
          requirements.push(requirement);
        }
      }
    }

    return requirements;
  } catch (error) {
    console.warn(`Failed to parse pyproject.toml: ${error}`);
    return [];
  }
}

export function parsePipfile(filePath: string): ParsedRequirement[] {
  if (!existsSync(filePath)) {
    return [];
  }

  try {
    const content = readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const requirements: ParsedRequirement[] = [];
    let inPackages = false;

    for (const line of lines) {
      const trimmed = line.trim();

      if (trimmed === '[packages]') {
        inPackages = true;
        continue;
      }

      if (trimmed.startsWith('[') && trimmed !== '[packages]') {
        inPackages = false;
        continue;
      }

      if (inPackages && trimmed.includes('=')) {
        const requirement = parseRequirementLine(trimmed);
        if (requirement) {
          requirements.push(requirement);
        }
      }
    }

    return requirements;
  } catch (error) {
    console.warn(`Failed to parse Pipfile: ${error}`);
    return [];
  }
}

export function parseRequirementLine(line: string): ParsedRequirement | null {
  const cleanLine = line.replace(/^["']|["']$/g, '').trim();

  if (!cleanLine || cleanLine.startsWith('#')) {
    return null;
  }

  const editable = cleanLine.startsWith('-e ') || cleanLine.startsWith('--editable ');
  const cleanRequirement = editable ? cleanLine.substring(cleanLine.indexOf(' ') + 1) : cleanLine;

  if (cleanRequirement.startsWith('http://') || cleanRequirement.startsWith('https://') || cleanRequirement.startsWith('git+')) {
    return {
      name: extractNameFromUrl(cleanRequirement),
      url: cleanRequirement,
      editable
    };
  }

  const versionMatch = cleanRequirement.match(/^([^=<>!]+)(.*)$/);
  if (!versionMatch) {
    return null;
  }

  const name = versionMatch[1]?.trim();
  const versionSpec = versionMatch[2]?.trim();

  if (!name) {
    return null;
  }

  return {
    name,
    version: versionSpec || undefined,
    editable
  };
}

function extractNameFromUrl(url: string): string {
  const parts = url.split('/');
  const lastPart = parts[parts.length - 1];
  if (!lastPart) {
    return 'unknown';
  }
  const name = lastPart.replace(/\.git$/, '').replace(/\.tar\.gz$/, '').replace(/\.zip$/, '');
  return name.replace(/[^a-zA-Z0-9_-]/g, '');
}

export function findRequirementsFiles(projectPath?: string): string[] {
  const searchPath = projectPath ? resolve(projectPath) : process.cwd();
  const files: string[] = [];

  const possibleFiles = [
    'requirements.txt',
    'requirements-dev.txt',
    'requirements-test.txt',
    'pyproject.toml',
    'Pipfile',
    'setup.py'
  ];

  for (const file of possibleFiles) {
    const filePath = join(searchPath, file);
    if (existsSync(filePath)) {
      files.push(filePath);
    }
  }

  return files;
}
