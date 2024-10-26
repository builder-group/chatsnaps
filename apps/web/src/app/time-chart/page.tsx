'use client';

import React from 'react';
import {
	CartesianGrid,
	Legend,
	Line,
	LineChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis
} from 'recharts';
import {
	Button,
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	Label,
	Slider,
	Switch
} from '@/components';

const Page: React.FC = () => {
	const [rawData, setRawData] = React.useState<Record<string, number[]>>({});
	const [filterOutliers, setFilterOutliers] = React.useState(false);
	const [outlierThreshold, setOutlierThreshold] = React.useState(2);
	const [seriesVisibility, setSeriesVisibility] = React.useState<TSeriesVisibility>({});
	const [seriesMetadata, setSeriesMetadata] = React.useState<Record<string, TSeriesMetadata>>({});

	const processClipboardData = React.useCallback((text: string) => {
		try {
			const data: Record<string, number[]> = JSON.parse(text);

			// Initialize series visibility and metadata
			const newSeriesVisibility: TSeriesVisibility = {};
			const newSeriesMetadata: Record<string, TSeriesMetadata> = {};
			const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088fe'];

			Object.entries(data).forEach(([key, values], index) => {
				newSeriesVisibility[key] = true;
				newSeriesMetadata[key] = {
					color: colors[index % colors.length] as unknown as string,
					length: values.length
				};
			});

			setSeriesVisibility(newSeriesVisibility);
			setSeriesMetadata(newSeriesMetadata);
			setRawData(data);
		} catch (err) {
			console.error(
				'Invalid clipboard data format. Please ensure it matches the expected structure.'
			);
		}
	}, []);

	const readClipboard = React.useCallback(async () => {
		try {
			const text = await navigator.clipboard.readText();
			processClipboardData(text);
		} catch (err) {
			console.error(
				'Failed to read clipboard. Please ensure you have granted clipboard permissions.'
			);
		}
	}, [processClipboardData]);

	const toggleSeriesVisibility = React.useCallback((key: string) => {
		setSeriesVisibility((prev) => ({
			...prev,
			[key]: !prev[key]
		}));
	}, []);

	// Calculate max length of currently visible series
	const maxVisibleLength = React.useMemo(() => {
		if (!Object.keys(rawData).length) return 0;

		return Math.max(
			...Object.entries(rawData)
				.filter(([key]) => seriesVisibility[key])
				.map(([_, values]) => values.length)
		);
	}, [rawData, seriesVisibility]);

	// Calculate chart data with optimized performance
	const chartData = React.useMemo(() => {
		if (!Object.keys(rawData).length) return [];

		const visibleSeries = Object.keys(rawData).filter((key) => seriesVisibility[key]);
		const transformedData: TTimeData[] = [];

		// Only process up to the longest visible series
		for (let i = 0; i < maxVisibleLength; i++) {
			const point: TTimeData = { index: i + 1 };

			for (const key of visibleSeries) {
				const value = rawData[key]?.[i];
				if (value == null) {
					continue;
				}

				if (!filterOutliers) {
					point[key] = value;
				} else {
					// Calculate stats only for this series if we haven't already
					const values = rawData[key];
					if (values == null) {
						continue;
					}
					const mean = values.reduce((a, b) => a + b, 0) / values.length;
					const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
					const std = Math.sqrt(variance);

					const zScore = Math.abs((value - mean) / std);
					if (zScore <= outlierThreshold) {
						point[key] = value;
					}
				}
			}

			transformedData.push(point);
		}

		return transformedData;
	}, [rawData, seriesVisibility, filterOutliers, outlierThreshold, maxVisibleLength]);

	const toggleAll = React.useCallback(
		(value: boolean) => {
			setSeriesVisibility((prev) => {
				const newVisibility = { ...prev };
				Object.keys(rawData).forEach((key) => {
					newVisibility[key] = value;
				});
				return newVisibility;
			});
		},
		[rawData]
	);

	return (
		<div className="mx-auto max-w-6xl p-6">
			<Card>
				<CardHeader>
					<CardTitle>Time Execution Chart</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="mb-4 space-y-4">
						<div className="flex items-center gap-4">
							<Button
								onClick={() => {
									readClipboard();
								}}
							>
								Read Clipboard Data
							</Button>
							<div className="flex items-center space-x-2">
								<Switch
									id="outlier-filter"
									checked={filterOutliers}
									onCheckedChange={setFilterOutliers}
								/>
								<Label htmlFor="outlier-filter">Filter Outliers</Label>
							</div>
						</div>

						{filterOutliers ? (
							<div className="space-y-2">
								<Label>Outlier Threshold (Standard Deviations)</Label>
								<Slider
									value={[outlierThreshold]}
									onValueChange={(value) => {
										setOutlierThreshold(value[0] as unknown as number);
									}}
									min={1}
									max={5}
									step={0.1}
									className="max-w-xs"
								/>
								<div className="text-sm text-gray-500">Current threshold: {outlierThreshold} σ</div>
							</div>
						) : null}

						{Object.keys(rawData).length > 0 && (
							<div className="space-y-2">
								<div className="flex gap-2">
									<Button
										variant="outline"
										size="sm"
										onClick={() => {
											toggleAll(true);
										}}
									>
										Show All
									</Button>
									<Button
										variant="outline"
										size="sm"
										onClick={() => {
											toggleAll(false);
										}}
									>
										Hide All
									</Button>
								</div>
								<div className="flex flex-wrap gap-2">
									{Object.keys(rawData).map((key) => (
										<div key={key} className="flex items-center">
											<Switch
												id={`series-${key}`}
												checked={seriesVisibility[key] ?? true}
												onCheckedChange={() => {
													toggleSeriesVisibility(key);
												}}
											/>
											<Label
												htmlFor={`series-${key}`}
												className="ml-2"
												style={{ color: seriesMetadata[key]?.color }}
											>
												{key} ({seriesMetadata[key]?.length})
											</Label>
										</div>
									))}
								</div>
							</div>
						)}
					</div>

					{chartData.length > 0 && (
						<div className="h-[600px] w-full">
							<ResponsiveContainer width="100%" height="100%">
								<LineChart data={chartData}>
									<CartesianGrid strokeDasharray="3 3" />
									<XAxis
										dataKey="index"
										label={{ value: 'Index', position: 'bottom' }}
										domain={[1, maxVisibleLength]}
									/>
									<YAxis
										label={{
											value: 'Time (ms)',
											angle: -90,
											position: 'insideLeft'
										}}
									/>
									<Tooltip />
									<Legend />
									{Object.keys(rawData)
										.filter((key) => seriesVisibility[key])
										.map((key) => (
											<Line
												key={key}
												type="monotone"
												dataKey={key}
												name={`${key} (${seriesMetadata[key]?.length.toString() ?? 'unknown'})`}
												stroke={seriesMetadata[key]?.color}
												dot={false}
											/>
										))}
								</LineChart>
							</ResponsiveContainer>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
};

export default Page;

interface TTimeData {
	index: number;
	[key: string]: number;
}

type TSeriesVisibility = Record<string, boolean>;

interface TSeriesMetadata {
	color: string;
	length: number;
}
