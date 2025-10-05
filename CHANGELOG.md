# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.4] - 2025-01-05

### Added
- **UV_PATH Environment Variable** - Explicit uv usage control
- **Enhanced Package Manager Selection** - User can choose between pip and uv
- **Improved Documentation** - Clear configuration examples and limitations

### Changed
- **Environment Variable Priority** - UV_PATH takes precedence over PIP_PATH
- **Package Manager Detection** - Better handling of uv-managed environments
- **Configuration Examples** - Updated with UV_PATH and PIP_PATH options

### Fixed
- **UV Package Listing** - Fixed empty package lists in uv-managed environments
- **Environment Detection** - Improved venv detection with environment variables

### Documentation
- **Package Manager Support** - Clear list of supported and unsupported managers
- **Limitations Section** - Information about PDM and Poetry limitations
- **Troubleshooting Guide** - Solutions for common package manager issues

## [1.0.3] - 2025-01-05

### Added
- **UV Package Manager Support** - Full support for uv-managed environments
- **Automatic Manager Detection** - Detects uv vs pip environments

### Fixed
- **Empty Package Lists** - Fixed issue where uv environments showed no packages
- **Package Manager Commands** - Uses 'uv pip' for uv environments

## [1.0.2] - 2025-01-05

### Added
- **Environment Variable Support** - VIRTUAL_ENV, PYTHON_PATH, PIP_PATH
- **Cross-Directory Compatibility** - Works from any working directory

### Fixed
- **Virtual Environment Detection** - Fixed "No virtual environment found" errors
- **MCP Context Issues** - Resolved problems with Cursor IDE integration

## [1.0.0] - 2025-01-27

### Added
- **Complete MCP Python Venv Server** - Comprehensive Python virtual environment inspector for Cursor IDE
- **Multi-Environment Support** - Support for venv, virtualenv, poetry, pipenv, conda, and uv
- **Advanced Package Management** - Package checking, requirements comparison, outdated detection
- **Security & Quality Tools** - Security vulnerability scanning, license checking, package search
- **Performance Optimization** - Intelligent caching, lazy loading, parallel execution
- **Developer Experience** - Smart suggestions, dependency tree visualization, environment summaries

### Core Features
- `ping` - Test server connectivity
- `find_venv` - Find virtual environment in project
- `get_python_version` - Get Python version from venv
- `list_packages` - List installed packages with sorting
- `check_package` - Check package installation and version
- `compare_requirements` - Compare with requirements files

### Advanced Features
- `check_outdated` - Check for outdated packages with upgrade commands
- `suggest_venv_setup` - Get virtual environment setup suggestions
- `get_venv_summary` - Comprehensive environment summary
- `get_dependency_tree` - Dependency tree visualization with circular dependency detection
- `detect_environment_manager` - Auto-detect environment manager (poetry, pipenv, conda, uv)
- `get_poetry_info` - Poetry project information and dependencies
- `get_pipenv_info` - Pipenv project information and dependencies
- `get_conda_info` - Conda environment information and packages
- `check_security` - Security vulnerability scanning with safety/pip-audit
- `check_licenses` - License compliance checking with categorization
- `search_package` - PyPI package search with detailed information
- `export_environment` - Export to requirements.txt, pyproject.toml, or conda format

### Supported Formats
- **Requirements**: requirements.txt, requirements-dev.txt, requirements-test.txt
- **Poetry**: pyproject.toml, poetry.lock
- **Pipenv**: Pipfile, Pipfile.lock
- **Conda**: environment.yml
- **Setup**: setup.py (basic support)

### Version Specifiers
- Full support for Python version specifiers: ==, >=, <=, >, <, ~=, !=

### Technical Implementation
- **TypeScript 5.0+** with strict mode and comprehensive type safety
- **Node.js 18+** support with modern ES modules
- **Intelligent Caching** - 5-minute TTL for package lists, 10-minute for venv info
- **Error Handling** - Graceful degradation and user-friendly error messages
- **Performance** - Optimized for large virtual environments
- **Cross-Platform** - Linux, macOS, Windows support

### Documentation
- **Complete API Documentation** - All tools with examples and schemas
- **User Guide** - Installation, configuration, and common workflows
- **Troubleshooting Guide** - Common issues and solutions
- **Examples** - Basic and advanced Cursor configurations
- **CI/CD Integration** - GitHub Actions example

### Quality Assurance
- **Unit Tests** - Comprehensive test coverage with Vitest
- **TypeScript Strict Mode** - Full type safety and error prevention
- **ESLint & Prettier** - Code quality and formatting
- **MIT License** - Open source with permissive licensing

### Installation & Usage
```bash
npm install -g @pceuropa/mcp-server-python-venv
```

**Cursor Configuration**:
```json
{
  "mcp": {
    "servers": {
      "python-venv": {
        "command": "npx",
        "args": ["@pceuropa/mcp-server-python-venv"]
      }
    }
  }
}
```

