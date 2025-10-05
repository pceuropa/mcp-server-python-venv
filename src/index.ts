#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { getCondaInfo } from './managers/conda.js';
import { getPipenvInfo } from './managers/pipenv.js';
import { getPoetryInfo } from './managers/poetry.js';
import { getDependencyTree } from './tools/dependency-tree.js';
import { exportEnvironment } from './tools/export.js';
import { checkLicenses } from './tools/licenses.js';
import { checkOutdated } from './tools/outdated.js';
import { checkPackage } from './tools/package-check.js';
import { listPackages } from './tools/package-list.js';
import { getPythonVersion } from './tools/python-version.js';
import { compareRequirements } from './tools/requirements.js';
import { searchPackage } from './tools/search.js';
import { checkSecurity } from './tools/security.js';
import { findVenvTool } from './tools/venv-info.js';
import { suggestVenvSetup } from './tools/venv-setup.js';
import { getVenvSummary } from './tools/venv-summary.js';
import { detectEnvironmentManager } from './utils/manager-detector.js';

const server = new Server(
  {
    name: 'mcp-server-python-venv',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'ping',
        description: 'Test server connectivity',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'find_venv',
        description: 'Find virtual environment in the current project',
        inputSchema: {
          type: 'object',
          properties: {
            projectPath: {
              type: 'string',
              description: 'Optional project path to search for virtual environment',
            },
          },
        },
      },
      {
        name: 'get_python_version',
        description: 'Get Python version from the virtual environment',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'list_packages',
        description: 'List all installed packages in the virtual environment',
        inputSchema: {
          type: 'object',
          properties: {
            sortBy: {
              type: 'string',
              enum: ['name', 'version'],
              description: 'Sort packages by name or version',
              default: 'name',
            },
          },
        },
      },
      {
        name: 'check_package',
        description: 'Check if a specific package is installed and matches version requirements',
        inputSchema: {
          type: 'object',
          properties: {
            packageName: {
              type: 'string',
              description: 'Name of the package to check',
            },
            version: {
              type: 'string',
              description: 'Optional version requirement (e.g., ">=1.0.0", "==2.1.0")',
            },
          },
          required: ['packageName'],
        },
      },
      {
        name: 'compare_requirements',
        description: 'Compare installed packages with requirements files',
        inputSchema: {
          type: 'object',
          properties: {
            file: {
              type: 'string',
              description: 'Optional specific requirements file to check',
            },
          },
        },
      },
      {
        name: 'check_outdated',
        description: 'Check for outdated packages in the virtual environment',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'suggest_venv_setup',
        description: 'Get suggestions for setting up a virtual environment',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'get_venv_summary',
        description: 'Get a comprehensive summary of the virtual environment',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'get_dependency_tree',
        description: 'Get dependency tree visualization for packages',
        inputSchema: {
          type: 'object',
          properties: {
            package: {
              type: 'string',
              description: 'Optional specific package to analyze (defaults to all packages)',
            },
            depth: {
              type: 'number',
              description: 'Maximum depth of dependency tree (default: 3)',
              default: 3,
            },
          },
        },
      },
      {
        name: 'detect_environment_manager',
        description: 'Detect which Python environment manager is being used',
        inputSchema: {
          type: 'object',
          properties: {
            projectPath: {
              type: 'string',
              description: 'Optional project path to analyze',
            },
          },
        },
      },
      {
        name: 'get_poetry_info',
        description: 'Get Poetry project information and dependencies',
        inputSchema: {
          type: 'object',
          properties: {
            projectPath: {
              type: 'string',
              description: 'Optional project path (defaults to current directory)',
            },
          },
        },
      },
      {
        name: 'get_pipenv_info',
        description: 'Get Pipenv project information and dependencies',
        inputSchema: {
          type: 'object',
          properties: {
            projectPath: {
              type: 'string',
              description: 'Optional project path (defaults to current directory)',
            },
          },
        },
      },
      {
        name: 'get_conda_info',
        description: 'Get Conda environment information and packages',
        inputSchema: {
          type: 'object',
          properties: {
            projectPath: {
              type: 'string',
              description: 'Optional project path (defaults to current directory)',
            },
          },
        },
      },
      {
        name: 'check_security',
        description: 'Check for security vulnerabilities in installed packages',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'check_licenses',
        description: 'Check licenses of installed packages and identify potential issues',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'search_package',
        description: 'Search for packages on PyPI',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Search query for package name or description',
            },
            limit: {
              type: 'number',
              description: 'Maximum number of results to return (default: 10)',
              default: 10,
            },
          },
          required: ['query'],
        },
      },
      {
        name: 'export_environment',
        description: 'Export current environment to various formats',
        inputSchema: {
          type: 'object',
          properties: {
            format: {
              type: 'string',
              enum: ['requirements', 'pyproject', 'conda'],
              description: 'Export format',
            },
          },
          required: ['format'],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'ping':
        return {
          content: [
            {
              type: 'text',
              text: 'pong',
            },
          ],
        };

      case 'find_venv':
        const venvResult = findVenvTool(args?.['projectPath'] as string);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(venvResult, null, 2),
            },
          ],
        };

      case 'get_python_version':
        const versionResult = getPythonVersion();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(versionResult, null, 2),
            },
          ],
        };

      case 'list_packages':
        const packagesResult = listPackages(args?.['sortBy'] as 'name' | 'version');
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(packagesResult, null, 2),
            },
          ],
        };

      case 'check_package':
        const checkResult = checkPackage(
          args?.['packageName'] as string,
          args?.['version'] as string
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(checkResult, null, 2),
            },
          ],
        };

      case 'compare_requirements':
        const requirementsResult = compareRequirements(args?.['file'] as string);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(requirementsResult, null, 2),
            },
          ],
        };

      case 'check_outdated':
        const outdatedResult = checkOutdated();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(outdatedResult, null, 2),
            },
          ],
        };

      case 'suggest_venv_setup':
        const setupResult = suggestVenvSetup();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(setupResult, null, 2),
            },
          ],
        };

      case 'get_venv_summary':
        const summaryResult = getVenvSummary();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(summaryResult, null, 2),
            },
          ],
        };

      case 'get_dependency_tree':
        const treeResult = getDependencyTree(
          args?.['package'] as string,
          args?.['depth'] as number
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(treeResult, null, 2),
            },
          ],
        };

      case 'detect_environment_manager':
        const managerResult = detectEnvironmentManager(args?.['projectPath'] as string);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(managerResult, null, 2),
            },
          ],
        };

      case 'get_poetry_info':
        const poetryResult = getPoetryInfo(args?.['projectPath'] as string);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(poetryResult, null, 2),
            },
          ],
        };

      case 'get_pipenv_info':
        const pipenvResult = getPipenvInfo(args?.['projectPath'] as string);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(pipenvResult, null, 2),
            },
          ],
        };

      case 'get_conda_info':
        const condaResult = getCondaInfo(args?.['projectPath'] as string);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(condaResult, null, 2),
            },
          ],
        };

      case 'check_security':
        const securityResult = checkSecurity();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(securityResult, null, 2),
            },
          ],
        };

      case 'check_licenses':
        const licensesResult = checkLicenses();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(licensesResult, null, 2),
            },
          ],
        };

      case 'search_package':
        const searchResult = await searchPackage(
          args?.['query'] as string,
          args?.['limit'] as number
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(searchResult, null, 2),
            },
          ],
        };

      case 'export_environment':
        const exportResult = exportEnvironment(args?.['format'] as 'requirements' | 'pyproject' | 'conda');
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(exportResult, null, 2),
            },
          ],
        };

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
});

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('MCP Python Venv Server running on stdio');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
