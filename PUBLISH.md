# Publishing Guide

## Pre-publication Checklist

✅ **Package Configuration**
- [x] Updated `package.json` with proper metadata
- [x] Added `bin` field for CLI access
- [x] Added `files` field for npm package contents
- [x] Added `prepublishOnly` script for build validation
- [x] Added `publishConfig` for public access

✅ **Documentation**
- [x] Updated README.md with global usage instructions
- [x] Created example configurations for Cursor
- [x] Added testing instructions
- [x] Updated CHANGELOG.md

✅ **Code Quality**
- [x] All tests passing
- [x] TypeScript compilation successful
- [x] ESLint and Prettier configured
- [x] No linting errors

✅ **Examples**
- [x] Basic Cursor configuration
- [x] Advanced Cursor configuration
- [x] Multi-project configuration
- [x] CI/CD example

## Publishing Steps

### 1. Final Build and Test

```bash
# Clean build
npm run build

# Run all tests
npm test

# Check for linting issues
npm run lint
```

### 2. Version Management

```bash
# Check current version
npm version

# For patch release (bug fixes)
npm version patch

# For minor release (new features)
npm version minor

# For major release (breaking changes)
npm version major
```

### 3. Publish to npm

```bash
# Dry run to check what will be published
npm publish --dry-run

# Publish to npm
npm publish
```

### 4. Create GitHub Release

```bash
# Push tags to GitHub
git push origin main --tags

# Create release on GitHub with:
# - Tag: v1.0.0
# - Title: MCP Python Venv Server v1.0.0
# - Description: Copy from CHANGELOG.md
```

## Post-publication Testing

### Test Global Installation

```bash
# Test npx usage
npx @pceuropa/mcp-server-python-venv

# Test in a new directory
mkdir test-project
cd test-project
npx @pceuropa/mcp-server-python-venv
```

### Test Cursor Integration

1. Create a new Python project
2. Add the MCP configuration to `.cursor/settings.json`
3. Restart Cursor
4. Test the tools in the new project

## Community Guidelines

### Issue Templates

Create GitHub issue templates for:
- Bug reports
- Feature requests
- Documentation improvements

### Contributing Guidelines

- Fork the repository
- Create a feature branch
- Make changes with tests
- Submit a pull request

### Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn and grow

## Maintenance

### Regular Updates

- Monitor dependencies for security updates
- Update MCP SDK when new versions are released
- Keep documentation current
- Respond to community feedback

### Version Strategy

- **Patch (1.0.x)**: Bug fixes and minor improvements
- **Minor (1.x.0)**: New features and enhancements
- **Major (x.0.0)**: Breaking changes or major rewrites

## Support Channels

- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: General questions and community chat
- **Documentation**: Comprehensive guides and examples

---

**Ready for publication! 🚀**
