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

export function basisPoints(value: unknown, label: string): number {
    const parsed = requiredInt(value, label, 0);
    if (parsed > 10_000) throw new Error(`${label} phải từ 0 đến 10000`);
    return parsed;
}

function booleanValue(value: unknown, fallback = true): boolean {
    return typeof value === 'boolean' ? value : fallback;
}

export function validateIngredients(value: unknown): string {
    const parsed = typeof value === 'string' ? JSON.parse(value) : value;
    if (!Array.isArray(parsed) || parsed.length === 0) throw new Error('Nguyên liệu phải là JSON array không rỗng');
    for (const [index, ingredient] of parsed.entries()) {
        if (!ingredient || typeof ingredient !== 'object') throw new Error(`Nguyên liệu #${index + 1} không hợp lệ`);
        requiredInt((ingredient as { item_id?: unknown }).item_id, `item_id nguyên liệu #${index + 1}`, 1);
        requiredInt((ingredient as { quantity?: unknown }).quantity, `số lượng nguyên liệu #${index + 1}`, 1);
    }
    return JSON.stringify(parsed);
}

export function fishingRodData(body: Record<string, unknown>) {
    const waitMin = requiredInt(body.wait_min_ms, 'Chờ tối thiểu', 1000);
    return {
        rod_item_id: requiredInt(body.rod_item_id, 'Item cần câu', 1),
        cast_time_ms: requiredInt(body.cast_time_ms, 'Thời gian thả cần', 200),
        wait_min_ms: waitMin,
        wait_max_ms: requiredInt(body.wait_max_ms, 'Chờ tối đa', waitMin),
        pull_time_ms: requiredInt(body.pull_time_ms, 'Thời gian kéo', 300),
        success_rate_bps: basisPoints(body.success_rate_bps, 'Tỷ lệ thành công'),
        durability_loss_success: requiredInt(body.durability_loss_success, 'Độ bền mất khi thành công', 1),
        durability_loss_fail: requiredInt(body.durability_loss_fail, 'Độ bền mất khi hụt', 1),
        enabled: booleanValue(body.enabled),
        sort_order: requiredInt(body.sort_order ?? 0, 'Thứ tự', 0),
    };
}

export function fishingBaitData(body: Record<string, unknown>) {
    return {
        bait_item_id: requiredInt(body.bait_item_id, 'Item mồi', 1),
        success_bonus_bps: basisPoints(body.success_bonus_bps, 'Tỷ lệ cộng thêm'),
        priority: requiredInt(body.priority ?? 0, 'Ưu tiên', 0), enabled: booleanValue(body.enabled),
    };
}

export function fishingRecipeData(body: Record<string, unknown>) {
    const name = String(body.name ?? '').trim();
    if (!name || name.length > 100) throw new Error('Tên công thức không hợp lệ');
    return {
        name, result_item_id: requiredInt(body.result_item_id, 'Item kết quả', 1),
        result_quantity: requiredInt(body.result_quantity, 'Số lượng kết quả', 1),
        ingredients: validateIngredients(body.ingredients), enabled: booleanValue(body.enabled),
        sort_order: requiredInt(body.sort_order ?? 0, 'Thứ tự', 0),
    };
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
