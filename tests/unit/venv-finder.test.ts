import { describe, expect, it } from 'vitest';
import { findVenv } from '../../src/utils/venv-finder.js';

describe('venv-finder', () => {
    it('should return not found when no venv exists', () => {
        // Temporarily clear VIRTUAL_ENV to test the function without env vars
        const originalVenv = process.env['VIRTUAL_ENV'];
        delete process.env['VIRTUAL_ENV'];
        
        const result = findVenv('/tmp/nonexistent');
        expect(result.found).toBe(false);
        expect(result.path).toBe('');
        expect(result.type).toBe('');
        
        // Restore original VIRTUAL_ENV
        if (originalVenv) {
            process.env['VIRTUAL_ENV'] = originalVenv;
        }
    });

    it('should handle empty project path', () => {
        const result = findVenv();
        expect(result).toHaveProperty('found');
        expect(result).toHaveProperty('path');
        expect(result).toHaveProperty('type');
    });
});
