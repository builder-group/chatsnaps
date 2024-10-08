import { type TProjectCompProps } from '@repo/video';

export const project1: TProjectCompProps = {
	name: 'Project 1',
	width: 1080,
	height: 1920,
	fps: 30,
	timeline: {
		trackIds: ['t1', 't2'],
		actionMap: {
			a1: {
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
			a2: {
				type: 'Plugin',
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
				y: 1000
			},
			a3: {
				type: 'Plugin',
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
				y: 1000
			}
		},
		trackMap: {
			t1: {
				type: 'Track',
				actionIds: ['a1']
			},
			t2: {
				type: 'Track',
				actionIds: ['a2', 'a3']
			}
		}
	}
};
