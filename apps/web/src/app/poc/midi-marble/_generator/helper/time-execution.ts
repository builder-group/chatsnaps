export const TIME_EXECUTION_MAP: Record<string, number[]> = {};

export function timeExecution<T>(label: string, fn: () => T, logTime = false): T {
	const start = performance.now();
	const result = fn();
	const end = performance.now();
	const timeTaken = end - start;

	if (logTime) {
		console.log(`[${label}] Execution time: ${timeTaken.toFixed(2)}ms`);
	}

	if (!TIME_EXECUTION_MAP[label]) {
		TIME_EXECUTION_MAP[label] = [];
	}
	TIME_EXECUTION_MAP[label].push(timeTaken);

	return result;
}
