import { describe, expect, it } from 'vitest';
import { parseRequirementLine } from '../../src/utils/file-parsers.js';

describe('file-parsers', () => {
    it('should parse simple package name', () => {
        const result = parseRequirementLine('requests');
        expect(result).toEqual({
            name: 'requests',
            version: undefined,
            editable: false
        });
    });

    it('should parse package with version', () => {
        const result = parseRequirementLine('requests==2.28.0');
        expect(result).toEqual({
            name: 'requests',
            version: '==2.28.0',
            editable: false
        });
    });

    it('should parse editable package', () => {
        const result = parseRequirementLine('-e ./local-package');
        expect(result).toEqual({
            name: './local-package',
            version: undefined,
            editable: true
        });
    });

    it('should handle empty line', () => {
        const result = parseRequirementLine('');
        expect(result).toBeNull();
    });

    it('should handle comment line', () => {
        const result = parseRequirementLine('# This is a comment');
        expect(result).toBeNull();
    });
});
