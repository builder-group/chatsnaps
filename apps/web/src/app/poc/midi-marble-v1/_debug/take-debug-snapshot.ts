export const DEBUG_SNAPSHOT_COLLECTION_MAP: Record<string, Record<string, number[]>> = {};

export function timeExecution<T>(label: string, fn: () => T, logTime = false): T {
	const start = performance.now();
	const result = fn();
	const end = performance.now();
	const time = end - start;

	if (logTime) {
		console.log(`[${label}] Execution time: ${time.toFixed(2)}ms`);
	}

	takeDebugSnapshot('timeExecution', label, time);

	return result;
}

export function takeDebugSnapshot(collection: string, label: string, value: number): void {
	if (DEBUG_SNAPSHOT_COLLECTION_MAP[collection] == null) {
		DEBUG_SNAPSHOT_COLLECTION_MAP[collection] = {};
	}
	if (!DEBUG_SNAPSHOT_COLLECTION_MAP[collection][label]) {
		DEBUG_SNAPSHOT_COLLECTION_MAP[collection][label] = [];
	}
	DEBUG_SNAPSHOT_COLLECTION_MAP[collection][label].push(value);
}
