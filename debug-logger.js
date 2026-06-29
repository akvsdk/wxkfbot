/**
 * Debug 日志记录器
 * 仅在开关打开时写入 KV，避免免费账户限额消耗
 */

const DEBUG_ENABLED_KEY = '__DEBUG_ENABLED__';
const DEBUG_LOGS_KEY = '__DEBUG_LOGS__';
const MAX_LOGS = 100;

export class DebugLogger {
    constructor(kv) {
        this.kv = kv;
        this._enabled = null;
    }

    async isEnabled() {
        if (this._enabled !== null) return this._enabled;
        const val = await this.kv.get(DEBUG_ENABLED_KEY);
        this._enabled = val === 'true';
        return this._enabled;
    }

    async log(level, source, message, detail = null) {
        if (!(await this.isEnabled())) return;

        const entry = {
            id: crypto.randomUUID(),
            time: Date.now(),
            level,
            source,
            message,
            detail,
        };

        try {
            const raw = await this.kv.get(DEBUG_LOGS_KEY);
            const logs = raw ? JSON.parse(raw) : [];
            logs.unshift(entry);
            const trimmed = logs.slice(0, MAX_LOGS);
            await this.kv.put(DEBUG_LOGS_KEY, JSON.stringify(trimmed));
        } catch (_) {}
    }

    async error(source, message, detail = null) {
        return this.log('error', source, message, detail);
    }

    async warn(source, message, detail = null) {
        return this.log('warn', source, message, detail);
    }

    async info(source, message, detail = null) {
        return this.log('info', source, message, detail);
    }
}

export async function getDebugEnabled(kv) {
    const val = await kv.get(DEBUG_ENABLED_KEY);
    return val === 'true';
}

export async function setDebugEnabled(kv, enabled) {
    await kv.put(DEBUG_ENABLED_KEY, enabled ? 'true' : 'false');
}

export async function getDebugLogs(kv) {
    const raw = await kv.get(DEBUG_LOGS_KEY);
    return raw ? JSON.parse(raw) : [];
}

export async function clearDebugLogs(kv) {
    await kv.delete(DEBUG_LOGS_KEY);
}
