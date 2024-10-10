export function swapArrayElements<T>(arr: T[], index1: number, index2: number): void {
	[arr[index1], arr[index2]] = [arr[index2] as T, arr[index1] as T];
}
