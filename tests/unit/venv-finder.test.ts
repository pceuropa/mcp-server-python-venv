import { describe, expect, it } from 'vitest';
import { findVenv } from '../../src/utils/venv-finder.js';

describe('venv-finder', () => {
    it('should return not found when no venv exists', () => {
        const result = findVenv('/tmp/nonexistent');
        expect(result.found).toBe(false);
        expect(result.path).toBe('');
        expect(result.type).toBe('');
    });

    it('should handle empty project path', () => {
        const result = findVenv();
        expect(result).toHaveProperty('found');
        expect(result).toHaveProperty('path');
        expect(result).toHaveProperty('type');
    });
});
