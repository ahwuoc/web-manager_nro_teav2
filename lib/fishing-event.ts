export function requiredInt(value: unknown, label: string, min = 0): number {
    const parsed = typeof value === 'number' ? value : Number(value);
    if (!Number.isSafeInteger(parsed) || parsed < min) {
        throw new Error(`${label} phải là số nguyên từ ${min} trở lên`);
    }
    return parsed;
}

export function requiredBigInt(value: unknown, label: string): bigint {
    const text = String(value ?? '').trim();
    if (!/^\d+$/.test(text)) throw new Error(`${label} phải là số nguyên không âm`);
    return BigInt(text);
}

export function validateRewardItems(value: unknown): string {
    const parsed = typeof value === 'string' ? JSON.parse(value) : value;
    if (!Array.isArray(parsed)) throw new Error('Phần thưởng item phải là một JSON array');
    for (const [index, item] of parsed.entries()) {
        if (!item || typeof item !== 'object') throw new Error(`Item thưởng #${index + 1} không hợp lệ`);
        requiredInt((item as { temp_id?: unknown }).temp_id, `temp_id item #${index + 1}`, 1);
        requiredInt((item as { quantity?: unknown }).quantity, `quantity item #${index + 1}`, 1);
        const options = (item as { options?: unknown }).options ?? [];
        if (!Array.isArray(options)) throw new Error(`options item #${index + 1} phải là array`);
        for (const option of options) {
            if (!option || typeof option !== 'object') throw new Error(`Option item #${index + 1} không hợp lệ`);
            requiredInt((option as { id?: unknown }).id, 'ID option', 0);
            requiredInt((option as { param?: unknown }).param, 'Param option', 0);
        }
    }
    return JSON.stringify(parsed);
}

export function errorResponse(error: unknown, fallback: string): { error: string; status: number } {
    if (error instanceof SyntaxError) return { error: 'JSON phần thưởng không hợp lệ', status: 400 };
    if (error instanceof Error && /phải|không hợp lệ/.test(error.message)) {
        return { error: error.message, status: 400 };
    }
    return { error: fallback, status: 500 };
}
