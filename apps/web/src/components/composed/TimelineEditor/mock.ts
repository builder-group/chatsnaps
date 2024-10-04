import { type TProjectCompProps } from '@repo/video';
import { type TimelineEffect, type TimelineRow } from '@xzdarcy/react-timeline-editor';

export const project1: TProjectCompProps = {
	name: 'Project 1',
	width: 1080,
	height: 1920,
	fps: 30,
	timelines: [
		{
			type: 'Timeline',
			id: 'TestTimeline',
			items: [
				{
					type: 'Rectangle',
					startFrame: 0,
					durationInFrames: 300,
					width: 100,
					height: 100,
					x: [
						{ frame: 0, value: -200 },
						{ frame: 300, value: 1080 }
					],
					y: 490,
					opacity: [
						{ frame: 0, value: 0 },
						{ frame: 30, value: 1 },
						{ frame: 270, value: 1 },
						{ frame: 300, value: 0 }
					],
					fill: { type: 'Solid', color: '#ff0000' }
				},
				{
					type: 'TimelineItemPlugin',
					pluginId: 'tiktok-follow',
					props: {
						media: {
							type: 'Image',
							src: 'static/image/chatsnap.png'
						},
						text: 'Tap follow! 📲',
						debug: true
					},
					startFrame: 0,
					durationInFrames: 120,
					width: 1080,
					height: 500,
					x: 0,
					y: 1000,
					opacity: 1
				},
				{
					type: 'TimelineItemPlugin',
					pluginId: 'tiktok-like',
					props: {
						text: 'Like now!',
						debug: true
					},
					startFrame: 120,
					durationInFrames: 120,
					width: 1080,
					height: 500,
					x: 0,
					y: 1000,
					opacity: 1
				}
			]
		}
	]
};

export const mockEffect: Record<string, TimelineEffect> = {
	effect0: {
		id: 'effect0',
		name: '效果0'
	},
	effect1: {
		id: 'effect1',
		name: '效果1'
	}
};

export const mockData: TimelineRow[] = [
	{
		id: '0',
		actions: [
			{
				id: 'action00',
				start: 0,
				end: 2,
				effectId: 'effect0'
			}
		]
	},
	{
		id: '1',
		actions: [
			{
				id: 'action10',
				start: 1.5,
				end: 5,
				effectId: 'effect1'
			}
		]
	},
	{
		id: '2',
		actions: [
			{
				id: 'action20',

				start: 3,
				end: 4,
				effectId: 'effect0'
			}
		]
	},
	{
		id: '3',
		actions: [
			{
				id: 'action30',
				start: 4,
				end: 7,
				effectId: 'effect1'
			},
			{
				id: 'action31',
				start: 10,
				end: 12,
				effectId: 'effect1'
			}
		]
	}
];
