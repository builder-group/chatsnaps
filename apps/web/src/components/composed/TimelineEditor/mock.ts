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

export const chatstory: TProjectCompProps = {
	name: 'I MADE MY SON SWIM ACROSS THE OCEAN?! 😱🌊',
	timeline: {
		trackIds: [
			'track_MzY2NTA0ODk2ODA3OTI4MDQ2',
			'track_MzY2NTA0ODk2ODA3OTI4MDM3',
			'track_MzY2NTA0ODk2ODA3OTI4MDM4',
			'track_MzY2NTA0ODk2ODA3OTI4MDM5',
			'track_MzY2NTA0ODk2ODA3OTI4MDQ0'
		],
		actionMap: {
			action_MzY2NTA0ODk1NTAzNDk5MjY1: {
				type: 'Audio',
				src: 'static/audio/sound/ios_received.mp3',
				volume: 1,
				startFrame: 0,
				durationInFrames: 61
			},
			action_MzY2NTA0ODk1NjI5MzI4Mzg2: {
				type: 'Audio',
				src: 'http://localhost:4569/elevenlabs/1d571804416755a694234c686aaccc2c2a7578dc9501bb81104d02f6c923b8b7.mp3',
				volume: 1,
				startFrame: 0,
				durationInFrames: 55
			},
			action_MzY2NTA0ODk1NjI5MzI4Mzg3: {
				type: 'Plugin',
				pluginId: 'chat-story',
				props: {
					type: 'Message',
					content: {
						type: 'Text',
						text: 'SON'
					},
					participant: {
						displayName: 'Dad'
					},
					messageType: 'received'
				},
				startFrame: 0,
				durationInFrames: 15
			},
			action_MzY2NTA0ODk1NjI5MzI4Mzg4: {
				type: 'Audio',
				src: 'static/audio/sound/ios_received.mp3',
				volume: 1,
				startFrame: 29,
				durationInFrames: 61
			},
			action_MzY2NTA0ODk1NjYyODgyODIx: {
				type: 'Audio',
				src: 'http://localhost:4569/elevenlabs/401b9889076507365f25a6ed25d96fcd7ee559c55bdd3555933d423d2a307f61.mp3',
				volume: 1,
				startFrame: 29,
				durationInFrames: 113
			},
			action_MzY2NTA0ODk1NjYyODgyODIy: {
				type: 'Plugin',
				pluginId: 'chat-story',
				props: {
					type: 'Message',
					content: {
						type: 'Text',
						text: "I've signed you up for your first delivery job"
					},
					participant: {
						displayName: 'Dad'
					},
					messageType: 'received'
				},
				startFrame: 29,
				durationInFrames: 15
			},
			action_MzY2NTA0ODk1NjYyODgyODIz: {
				type: 'Audio',
				src: 'static/audio/sound/ios_sent.mp3',
				volume: 1,
				startFrame: 115,
				durationInFrames: 15
			},
			action_MzY2NTA0ODk1Njg4MDQ4NjQ4: {
				type: 'Audio',
				src: 'http://localhost:4569/elevenlabs/bf1852eafada97964d8931bd281e72514dbaab151200e79bc6e8d6a9787ba55d.mp3',
				volume: 1,
				startFrame: 115,
				durationInFrames: 73
			},
			action_MzY2NTA0ODk1Njg4MDQ4NjQ5: {
				type: 'Plugin',
				pluginId: 'chat-story',
				props: {
					type: 'Message',
					content: {
						type: 'Text',
						text: 'WHAT'
					},
					participant: {
						displayName: 'Son'
					},
					messageType: 'sent'
				},
				startFrame: 115,
				durationInFrames: 15
			},
			action_MzY2NTA0ODk1Njg4MDQ4NjUw: {
				type: 'Audio',
				src: 'static/audio/sound/ios_sent.mp3',
				volume: 1,
				startFrame: 161,
				durationInFrames: 15
			},
			action_MzY2NTA0ODk1NzE3NDA4Nzc5: {
				type: 'Audio',
				src: 'http://localhost:4569/elevenlabs/99b82cbcdebf17f025780fc03efcc07c40f7e0a54868b7e1f01d5c4035478a6a.mp3',
				volume: 1,
				startFrame: 161,
				durationInFrames: 80
			},
			action_MzY2NTA0ODk1NzE3NDA4Nzgw: {
				type: 'Plugin',
				pluginId: 'chat-story',
				props: {
					type: 'Message',
					content: {
						type: 'Text',
						text: "I'm 12???"
					},
					participant: {
						displayName: 'Son'
					},
					messageType: 'sent'
				},
				startFrame: 161,
				durationInFrames: 15
			},
			action_MzY2NTA0ODk1NzE3NDA4Nzgx: {
				type: 'Audio',
				src: 'static/audio/sound/ios_received.mp3',
				volume: 1,
				startFrame: 216,
				durationInFrames: 61
			},
			action_MzY2NTA0ODk1NzQyNTc0NjA2: {
				type: 'Audio',
				src: 'http://localhost:4569/elevenlabs/7b6ef06bbbc1bea965eb6127b63be370593028f73a55bfc7b3e24c48438bc984.mp3',
				volume: 1,
				startFrame: 216,
				durationInFrames: 92
			},
			action_MzY2NTA0ODk1NzQyNTc0NjA3: {
				type: 'Plugin',
				pluginId: 'chat-story',
				props: {
					type: 'Message',
					content: {
						type: 'Text',
						text: 'Perfect age to start'
					},
					participant: {
						displayName: 'Dad'
					},
					messageType: 'received'
				},
				startFrame: 216,
				durationInFrames: 15
			},
			action_MzY2NTA0ODk1NzQyNTc0NjA4: {
				type: 'Audio',
				src: 'static/audio/sound/ios_sent.mp3',
				volume: 1,
				startFrame: 281,
				durationInFrames: 15
			},
			action_MzY2NTA0ODk1NzYzNTQ2MTI5: {
				type: 'Audio',
				src: 'http://localhost:4569/elevenlabs/3c68c765e1292cf1b9fd31f3a99c69821fd5b33df75badd6047214dd1f38e886.mp3',
				volume: 1,
				startFrame: 281,
				durationInFrames: 78
			},
			action_MzY2NTA0ODk1NzYzNTQ2MTMw: {
				type: 'Plugin',
				pluginId: 'chat-story',
				props: {
					type: 'Message',
					content: {
						type: 'Text',
						text: 'Where am I delivering?'
					},
					participant: {
						displayName: 'Son'
					},
					messageType: 'sent'
				},
				startFrame: 281,
				durationInFrames: 15
			},
			action_MzY2NTA0ODk1NzYzNTQ2MTMx: {
				type: 'Audio',
				src: 'static/audio/sound/ios_received.mp3',
				volume: 1,
				startFrame: 335,
				durationInFrames: 61
			},
			action_MzY2NTA0ODk1Nzg0NTE3NjUy: {
				type: 'Audio',
				src: 'http://localhost:4569/elevenlabs/10d41a2688bbb0ce420e989a0405f36bf827758a4421c0fadddb62c718dade28.mp3',
				volume: 1,
				startFrame: 335,
				durationInFrames: 77
			},
			action_MzY2NTA0ODk1Nzg4NzExOTU3: {
				type: 'Plugin',
				pluginId: 'chat-story',
				props: {
					type: 'Message',
					content: {
						type: 'Text',
						text: 'Volcano Island'
					},
					participant: {
						displayName: 'Dad'
					},
					messageType: 'received'
				},
				startFrame: 335,
				durationInFrames: 15
			},
			action_MzY2NTA0ODk1Nzg4NzExOTU4: {
				type: 'Audio',
				src: 'static/audio/sound/ios_sent.mp3',
				volume: 1,
				startFrame: 385,
				durationInFrames: 15
			},
			action_MzY2NTA0ODk1ODA1NDg5MTc1: {
				type: 'Audio',
				src: 'http://localhost:4569/elevenlabs/fe9e5f598a9865c4604ee7e8c22fe58e8e7b207802cb21a6d943dc22ddaa95c0.mp3',
				volume: 1,
				startFrame: 385,
				durationInFrames: 93
			},
			action_MzY2NTA0ODk1ODA1NDg5MTc2: {
				type: 'Plugin',
				pluginId: 'chat-story',
				props: {
					type: 'Message',
					content: {
						type: 'Text',
						text: 'VOLCANO ISLAND???'
					},
					participant: {
						displayName: 'Son'
					},
					messageType: 'sent'
				},
				startFrame: 385,
				durationInFrames: 15
			},
			action_MzY2NTA0ODk1ODA1NDg5MTc3: {
				type: 'Audio',
				src: 'static/audio/sound/ios_sent.mp3',
				volume: 1,
				startFrame: 453,
				durationInFrames: 15
			},
			action_MzY2NTA0ODk1ODMwNjU1MDAy: {
				type: 'Audio',
				src: 'http://localhost:4569/elevenlabs/063524aa76ff1369248f45b6480fb382cce523454f33862389139db27b18887b.mp3',
				volume: 1,
				startFrame: 453,
				durationInFrames: 75
			},
			action_MzY2NTA0ODk1ODMwNjU1MDAz: {
				type: 'Plugin',
				pluginId: 'chat-story',
				props: {
					type: 'Message',
					content: {
						type: 'Text',
						text: 'How do I get there?'
					},
					participant: {
						displayName: 'Son'
					},
					messageType: 'sent'
				},
				startFrame: 453,
				durationInFrames: 15
			},
			action_MzY2NTA0ODk1ODMwNjU1MDA0: {
				type: 'Audio',
				src: 'static/audio/sound/ios_received.mp3',
				volume: 1,
				startFrame: 502,
				durationInFrames: 61
			},
			action_MzY2NTA0ODk1ODQ3NDMyMjIx: {
				type: 'Audio',
				src: 'http://localhost:4569/elevenlabs/952cba5418588ea254321affeabdd80772d4b110f21c3597329fb822d7073618.mp3',
				volume: 1,
				startFrame: 502,
				durationInFrames: 62
			},
			action_MzY2NTA0ODk1ODQ3NDMyMjIy: {
				type: 'Plugin',
				pluginId: 'chat-story',
				props: {
					type: 'Message',
					content: {
						type: 'Text',
						text: 'You swim'
					},
					participant: {
						displayName: 'Dad'
					},
					messageType: 'received'
				},
				startFrame: 502,
				durationInFrames: 15
			},
			action_MzY2NTA0ODk1ODQ3NDMyMjIz: {
				type: 'Audio',
				src: 'static/audio/sound/ios_sent.mp3',
				volume: 1,
				startFrame: 538,
				durationInFrames: 15
			},
			action_MzY2NTA0ODk1ODY4NDAzNzQ0: {
				type: 'Audio',
				src: 'http://localhost:4569/elevenlabs/cea692c5d31228168ccadf9b1d44c806b2203681a14cc6ef958cafedb7b16a8d.mp3',
				volume: 1,
				startFrame: 538,
				durationInFrames: 64
			},
			action_MzY2NTA0ODk1ODY4NDAzNzQ1: {
				type: 'Plugin',
				pluginId: 'chat-story',
				props: {
					type: 'Message',
					content: {
						type: 'Text',
						text: 'SWIM?!'
					},
					participant: {
						displayName: 'Son'
					},
					messageType: 'sent'
				},
				startFrame: 538,
				durationInFrames: 15
			},
			action_MzY2NTA0ODk1ODY4NDAzNzQ2: {
				type: 'Audio',
				src: 'static/audio/sound/ios_sent.mp3',
				volume: 1,
				startFrame: 576,
				durationInFrames: 15
			},
			action_MzY2NTA0ODk1ODg1MTgwOTYz: {
				type: 'Audio',
				src: 'http://localhost:4569/elevenlabs/b860ec86c501b09f1e3fd20f059fc00701309a88f87e966894b31eac68a6eae9.mp3',
				volume: 1,
				startFrame: 576,
				durationInFrames: 85
			},
			action_MzY2NTA0ODk1ODg1MTgwOTY0: {
				type: 'Plugin',
				pluginId: 'chat-story',
				props: {
					type: 'Message',
					content: {
						type: 'Text',
						text: "I can't swim!"
					},
					participant: {
						displayName: 'Son'
					},
					messageType: 'sent'
				},
				startFrame: 576,
				durationInFrames: 15
			},
			action_MzY2NTA0ODk1ODg1MTgwOTY1: {
				type: 'Audio',
				src: 'static/audio/sound/ios_received.mp3',
				volume: 1,
				startFrame: 636,
				durationInFrames: 61
			},
			action_MzY2NTA0ODk1ODk3NzYzODc4: {
				type: 'Audio',
				src: 'http://localhost:4569/elevenlabs/69a791d0c7c6f9c1c4db4290cb9e2a3e1f90b4ddb6599c6bcc16379588a7fe9a.mp3',
				volume: 1,
				startFrame: 636,
				durationInFrames: 62
			},
			action_MzY2NTA0ODk1ODk3NzYzODc5: {
				type: 'Plugin',
				pluginId: 'chat-story',
				props: {
					type: 'Message',
					content: {
						type: 'Text',
						text: 'Then learn'
					},
					participant: {
						displayName: 'Dad'
					},
					messageType: 'received'
				},
				startFrame: 636,
				durationInFrames: 15
			},
			action_MzY2NTA0ODk1ODk3NzYzODgw: {
				type: 'Audio',
				src: 'static/audio/sound/ios_sent.mp3',
				volume: 1,
				startFrame: 671,
				durationInFrames: 15
			},
			action_MzY2NTA0ODk1OTE0NTQxMDk3: {
				type: 'Audio',
				src: 'http://localhost:4569/elevenlabs/3350b58dacaf5d3aeed691ecc5b09eb0c99f9378f64568e1dda16eb6cdd139f9.mp3',
				volume: 1,
				startFrame: 671,
				durationInFrames: 67
			},
			action_MzY2NTA0ODk1OTE0NTQxMDk4: {
				type: 'Plugin',
				pluginId: 'chat-story',
				props: {
					type: 'Message',
					content: {
						type: 'Text',
						text: 'NOW?!'
					},
					participant: {
						displayName: 'Son'
					},
					messageType: 'sent'
				},
				startFrame: 671,
				durationInFrames: 15
			},
			action_MzY2NTA0ODk1OTE0NTQxMDk5: {
				type: 'Audio',
				src: 'static/audio/sound/ios_received.mp3',
				volume: 1,
				startFrame: 713,
				durationInFrames: 61
			},
			action_MzY2NTA0ODk1OTI3MTI0MDEy: {
				type: 'Audio',
				src: 'http://localhost:4569/elevenlabs/08a7239a219fdd7d7362cf8c6427f81a77e05e5e38d04e51fc5b4080c83ed623.mp3',
				volume: 1,
				startFrame: 713,
				durationInFrames: 49
			},
			action_MzY2NTA0ODk1OTI3MTI0MDEz: {
				type: 'Plugin',
				pluginId: 'chat-story',
				props: {
					type: 'Message',
					content: {
						type: 'Text',
						text: 'Yes'
					},
					participant: {
						displayName: 'Dad'
					},
					messageType: 'received'
				},
				startFrame: 713,
				durationInFrames: 15
			},
			action_MzY2NTA0ODk1OTMxMzE4MzE4: {
				type: 'Audio',
				src: 'static/audio/sound/ios_received.mp3',
				volume: 1,
				startFrame: 736,
				durationInFrames: 61
			},
			action_MzY2NTA0ODk1OTQzOTAxMjMx: {
				type: 'Audio',
				src: 'http://localhost:4569/elevenlabs/d4fdfbe91ddb74cb38ff2d342ddcc52dce889eeb0a02ea139c4ab66b5524f3eb.mp3',
				volume: 1,
				startFrame: 736,
				durationInFrames: 62
			},
			action_MzY2NTA0ODk1OTQzOTAxMjMy: {
				type: 'Plugin',
				pluginId: 'chat-story',
				props: {
					type: 'Message',
					content: {
						type: 'Text',
						text: "I'll meet you there"
					},
					participant: {
						displayName: 'Dad'
					},
					messageType: 'received'
				},
				startFrame: 736,
				durationInFrames: 15
			},
			action_MzY2NTA0ODk1OTQzOTAxMjMz: {
				type: 'Audio',
				src: 'static/audio/sound/ios_sent.mp3',
				volume: 1,
				startFrame: 773,
				durationInFrames: 15
			},
			action_MzY2NTA0ODk1OTYwNjc4NDUw: {
				type: 'Audio',
				src: 'http://localhost:4569/elevenlabs/fa12893893288fcb4f20f6065fe632a98020e02d4f56aee648006151c791112f.mp3',
				volume: 1,
				startFrame: 773,
				durationInFrames: 60
			},
			action_MzY2NTA0ODk1OTYwNjc4NDUx: {
				type: 'Plugin',
				pluginId: 'chat-story',
				props: {
					type: 'Message',
					content: {
						type: 'Text',
						text: 'WAIT'
					},
					participant: {
						displayName: 'Son'
					},
					messageType: 'sent'
				},
				startFrame: 773,
				durationInFrames: 15
			},
			action_MzY2NTA0ODk1OTYwNjc4NDUy: {
				type: 'Audio',
				src: 'static/audio/sound/ios_sent.mp3',
				volume: 1,
				startFrame: 807,
				durationInFrames: 15
			},
			action_MzY2NTA0ODk1OTczMjYxMzY1: {
				type: 'Audio',
				src: 'http://localhost:4569/elevenlabs/2546c7cb640c117745628d83b6875637232b3e08d6825efbcf5c4553af466b70.mp3',
				volume: 1,
				startFrame: 807,
				durationInFrames: 60
			},
			action_MzY2NTA0ODk1OTczMjYxMzY2: {
				type: 'Plugin',
				pluginId: 'chat-story',
				props: {
					type: 'Message',
					content: {
						type: 'Text',
						text: 'Dad?'
					},
					participant: {
						displayName: 'Son'
					},
					messageType: 'sent'
				},
				startFrame: 807,
				durationInFrames: 15
			},
			action_MzY2NTA0ODk1OTczMjYxMzY3: {
				type: 'Audio',
				src: 'static/audio/sound/ios_sent.mp3',
				volume: 1,
				startFrame: 842,
				durationInFrames: 15
			},
			action_MzY2NTA0ODk1OTg1ODQ0Mjgw: {
				type: 'Audio',
				src: 'http://localhost:4569/elevenlabs/44b466a828a8e5958b88ee938ffffdd05f26cac8cf4305cbcbcb2ed2c043d061.mp3',
				volume: 1,
				startFrame: 842,
				durationInFrames: 60
			},
			action_MzY2NTA0ODk1OTg1ODQ0Mjgx: {
				type: 'Plugin',
				pluginId: 'chat-story',
				props: {
					type: 'Message',
					content: {
						type: 'Text',
						text: 'DAD?!'
					},
					participant: {
						displayName: 'Son'
					},
					messageType: 'sent'
				},
				startFrame: 842,
				durationInFrames: 15
			},
			action_MzY2NTA0ODk1OTg1ODQ0Mjgy: {
				type: 'Audio',
				src: 'static/audio/sound/ios_sent.mp3',
				volume: 1,
				startFrame: 872,
				durationInFrames: 15
			},
			action_MzY2NTA0ODk2MDIzNTkzMDE5: {
				type: 'Audio',
				src: 'http://localhost:4569/elevenlabs/82b0e878ef15bf78e83004d541c6e4f99395d8d30f388ff2d11447f4c5b374c8.mp3',
				volume: 1,
				startFrame: 872,
				durationInFrames: 103
			},
			action_MzY2NTA0ODk2MDIzNTkzMDIw: {
				type: 'Plugin',
				pluginId: 'chat-story',
				props: {
					type: 'Message',
					content: {
						type: 'Text',
						text: "Dad I'm drowning"
					},
					participant: {
						displayName: 'Son'
					},
					messageType: 'sent'
				},
				startFrame: 872,
				durationInFrames: 15
			},
			action_MzY2NTA0ODk2MDIzNTkzMDIx: {
				type: 'Audio',
				src: 'static/audio/sound/ios_received.mp3',
				volume: 1,
				startFrame: 950,
				durationInFrames: 61
			},
			action_MzY2NTA0ODk2MDQ0NTY0NTQy: {
				type: 'Audio',
				src: 'http://localhost:4569/elevenlabs/2a4c76a32b11b98f1e606a829dbe69c60fc0d8f713d78a7d11b68b6996c5a6f4.mp3',
				volume: 1,
				startFrame: 950,
				durationInFrames: 64
			},
			action_MzY2NTA0ODk2MDQ0NTY0NTQz: {
				type: 'Plugin',
				pluginId: 'chat-story',
				props: {
					type: 'Message',
					content: {
						type: 'Text',
						text: 'Stop drowning'
					},
					participant: {
						displayName: 'Dad'
					},
					messageType: 'received'
				},
				startFrame: 950,
				durationInFrames: 15
			},
			action_MzY2NTA0ODk2MDQ0NTY0NTQ0: {
				type: 'Audio',
				src: 'static/audio/sound/ios_sent.mp3',
				volume: 1,
				startFrame: 988,
				durationInFrames: 15
			},
			action_MzY2NTA0ODk2MDU3MTQ3NDU3: {
				type: 'Audio',
				src: 'http://localhost:4569/elevenlabs/727addad5f91d5567a6481ebd29c2a995708656ffbf69287e6f088cbeed8212e.mp3',
				volume: 1,
				startFrame: 988,
				durationInFrames: 58
			},
			action_MzY2NTA0ODk2MDU3MTQ3NDU4: {
				type: 'Plugin',
				pluginId: 'chat-story',
				props: {
					type: 'Message',
					content: {
						type: 'Text',
						text: 'HOW'
					},
					participant: {
						displayName: 'Son'
					},
					messageType: 'sent'
				},
				startFrame: 988,
				durationInFrames: 15
			},
			action_MzY2NTA0ODk2MDU3MTQ3NDU5: {
				type: 'Audio',
				src: 'static/audio/sound/ios_received.mp3',
				volume: 1,
				startFrame: 1021,
				durationInFrames: 61
			},
			action_MzY2NTA0ODk2MDY5NzMwMzcy: {
				type: 'Audio',
				src: 'http://localhost:4569/elevenlabs/c9c0e8ce556df8f9ceb304a8f6881812de3eb5a76ee13bf81f31c8671f4e35f0.mp3',
				volume: 1,
				startFrame: 1021,
				durationInFrames: 58
			},
			action_MzY2NTA0ODk2MDY5NzMwMzcz: {
				type: 'Plugin',
				pluginId: 'chat-story',
				props: {
					type: 'Message',
					content: {
						type: 'Text',
						text: 'Just swim'
					},
					participant: {
						displayName: 'Dad'
					},
					messageType: 'received'
				},
				startFrame: 1021,
				durationInFrames: 15
			},
			action_MzY2NTA0ODk2MDY5NzMwMzc0: {
				type: 'Audio',
				src: 'static/audio/sound/ios_sent.mp3',
				volume: 1,
				startFrame: 1053,
				durationInFrames: 15
			},
			action_MzY2NTA0ODk2MDg2NTA3NTkx: {
				type: 'Audio',
				src: 'http://localhost:4569/elevenlabs/52bd88741f7762ecdbcd3a22bd0369df836ed1221bee2af4a254f5ca2255852f.mp3',
				volume: 1,
				startFrame: 1053,
				durationInFrames: 57
			},
			action_MzY2NTA0ODk2MDg2NTA3NTky: {
				type: 'Plugin',
				pluginId: 'chat-story',
				props: {
					type: 'Message',
					content: {
						type: 'Text',
						text: 'I'
					},
					participant: {
						displayName: 'Son'
					},
					messageType: 'sent'
				},
				startFrame: 1053,
				durationInFrames: 15
			},
			action_MzY2NTA0ODk2MDg2NTA3NTkz: {
				type: 'Audio',
				src: 'static/audio/sound/ios_sent.mp3',
				volume: 1,
				startFrame: 1082,
				durationInFrames: 15
			},
			action_MzY2NTA0ODk2MDk0ODk2MjAy: {
				type: 'Audio',
				src: 'http://localhost:4569/elevenlabs/f9ccaa54fccdb45c977a6f1422246c66ece65102eab7cbe05d24b8adf2675a7e.mp3',
				volume: 1,
				startFrame: 1082,
				durationInFrames: 67
			},
			action_MzY2NTA0ODk2MDk0ODk2MjAz: {
				type: 'Plugin',
				pluginId: 'chat-story',
				props: {
					type: 'Message',
					content: {
						type: 'Text',
						text: "CAN'T"
					},
					participant: {
						displayName: 'Son'
					},
					messageType: 'sent'
				},
				startFrame: 1082,
				durationInFrames: 15
			},
			action_MzY2NTA0ODk2MDk0ODk2MjA0: {
				type: 'Audio',
				src: 'static/audio/sound/ios_sent.mp3',
				volume: 1,
				startFrame: 1121,
				durationInFrames: 15
			},
			action_MzY2NTA0ODk2MTA3NDc5MTE3: {
				type: 'Audio',
				src: 'http://localhost:4569/elevenlabs/f02939db19be23c1b61f3b2f16ae8023ad671ca641112ef20edb7526d207c77e.mp3',
				volume: 1,
				startFrame: 1121,
				durationInFrames: 67
			},
			action_MzY2NTA0ODk2MTA3NDc5MTE4: {
				type: 'Plugin',
				pluginId: 'chat-story',
				props: {
					type: 'Message',
					content: {
						type: 'Text',
						text: 'SWIM'
					},
					participant: {
						displayName: 'Son'
					},
					messageType: 'sent'
				},
				startFrame: 1121,
				durationInFrames: 15
			},
			action_MzY2NTA0ODk2MTA3NDc5MTE5: {
				type: 'Audio',
				src: 'static/audio/sound/ios_received.mp3',
				volume: 1,
				startFrame: 1163,
				durationInFrames: 61
			},
			action_MzY2NTA0ODk2MTIwMDYyMDMy: {
				type: 'Audio',
				src: 'http://localhost:4569/elevenlabs/6cd4c5b92d8dc9eb787aa0ed702d4d93d159fd8decc9ff4b761545d318e405e9.mp3',
				volume: 1,
				startFrame: 1163,
				durationInFrames: 73
			},
			action_MzY2NTA0ODk2MTIwMDYyMDMz: {
				type: 'Plugin',
				pluginId: 'chat-story',
				props: {
					type: 'Message',
					content: {
						type: 'Text',
						text: 'Believe in yourself'
					},
					participant: {
						displayName: 'Dad'
					},
					messageType: 'received'
				},
				startFrame: 1163,
				durationInFrames: 15
			},
			action_MzY2NTA0ODk2MTIwMDYyMDM0: {
				type: 'Audio',
				src: 'static/audio/sound/ios_sent.mp3',
				volume: 1,
				startFrame: 1210,
				durationInFrames: 15
			},
			action_MzY2NTA0ODk2MTM2ODM5MjUx: {
				type: 'Audio',
				src: 'http://localhost:4569/elevenlabs/dbf54624fb551c570c864928e26c717f0c34caf99360855a8b3c236deff5dc1e.mp3',
				volume: 1,
				startFrame: 1210,
				durationInFrames: 80
			},
			action_MzY2NTA0ODk2MTM2ODM5MjUy: {
				type: 'Plugin',
				pluginId: 'chat-story',
				props: {
					type: 'Message',
					content: {
						type: 'Text',
						text: "THAT DOESN'T HELP"
					},
					participant: {
						displayName: 'Son'
					},
					messageType: 'sent'
				},
				startFrame: 1210,
				durationInFrames: 15
			},
			action_MzY2NTA0ODk2MTM2ODM5MjUz: {
				type: 'Audio',
				src: 'static/audio/sound/ios_sent.mp3',
				volume: 1,
				startFrame: 1260,
				durationInFrames: 15
			},
			action_MzY2NTA0ODk2MTQ5NDIyMTY2: {
				type: 'Audio',
				src: 'http://localhost:4569/elevenlabs/8d66d7b557c1799d2e8c65d55e06d83d6671f02a78a21d227f6150101188d86b.mp3',
				volume: 1,
				startFrame: 1260,
				durationInFrames: 55
			},
			action_MzY2NTA0ODk2MTQ5NDIyMTY3: {
				type: 'Plugin',
				pluginId: 'chat-story',
				props: {
					type: 'Message',
					content: {
						type: 'Text',
						text: 'Dad'
					},
					participant: {
						displayName: 'Son'
					},
					messageType: 'sent'
				},
				startFrame: 1260,
				durationInFrames: 15
			},
			action_MzY2NTA0ODk2MTQ5NDIyMTY4: {
				type: 'Audio',
				src: 'static/audio/sound/ios_sent.mp3',
				volume: 1,
				startFrame: 1289,
				durationInFrames: 15
			},
			action_MzY2NTA0ODk2MTYyMDA1MDgx: {
				type: 'Audio',
				src: 'http://localhost:4569/elevenlabs/8866b598de5f208a72c870fbcc306d4dfc30e16d9184794b020ffe3b160ad12d.mp3',
				volume: 1,
				startFrame: 1289,
				durationInFrames: 71
			},
			action_MzY2NTA0ODk2MTYyMDA1MDgy: {
				type: 'Plugin',
				pluginId: 'chat-story',
				props: {
					type: 'Message',
					content: {
						type: 'Text',
						text: "I think I'm swimming"
					},
					participant: {
						displayName: 'Son'
					},
					messageType: 'sent'
				},
				startFrame: 1289,
				durationInFrames: 15
			},
			action_MzY2NTA0ODk2MTYyMDA1MDgz: {
				type: 'Audio',
				src: 'static/audio/sound/ios_received.mp3',
				volume: 1,
				startFrame: 1335,
				durationInFrames: 61
			},
			action_MzY2NTA0ODk2MTc0NTg3OTk2: {
				type: 'Audio',
				src: 'http://localhost:4569/elevenlabs/f2a4e9e4029eb0100feb8715f2857a8819ccb3379ebb4a79aaae52d6e0771ce4.mp3',
				volume: 1,
				startFrame: 1335,
				durationInFrames: 82
			},
			action_MzY2NTA0ODk2MTc0NTg3OTk3: {
				type: 'Plugin',
				pluginId: 'chat-story',
				props: {
					type: 'Message',
					content: {
						type: 'Text',
						text: 'Good job son'
					},
					participant: {
						displayName: 'Dad'
					},
					messageType: 'received'
				},
				startFrame: 1335,
				durationInFrames: 15
			},
			action_MzY2NTA0ODk2MTc0NTg3OTk4: {
				type: 'Audio',
				src: 'static/audio/sound/ios_received.mp3',
				volume: 1,
				startFrame: 1391,
				durationInFrames: 61
			},
			action_MzY2NTA0ODk2MTg3MTcwOTEx: {
				type: 'Audio',
				src: 'http://localhost:4569/elevenlabs/bdbb3b92231d24eef058cdb30126421516aa42aa9a02446a333ea6ab621d8e86.mp3',
				volume: 1,
				startFrame: 1391,
				durationInFrames: 58
			},
			action_MzY2NTA0ODk2MTg3MTcwOTEy: {
				type: 'Plugin',
				pluginId: 'chat-story',
				props: {
					type: 'Message',
					content: {
						type: 'Text',
						text: "I'm so proud"
					},
					participant: {
						displayName: 'Dad'
					},
					messageType: 'received'
				},
				startFrame: 1391,
				durationInFrames: 15
			},
			action_MzY2NTA0ODk2MTg3MTcwOTEz: {
				type: 'Audio',
				src: 'static/audio/sound/ios_sent.mp3',
				volume: 1,
				startFrame: 1424,
				durationInFrames: 15
			},
			action_MzY2NTA0ODk2MTk1NTU5NTIy: {
				type: 'Audio',
				src: 'http://localhost:4569/elevenlabs/d8a67264019c39814a051ced4f6fbec85c4519eaa8b8ab0113a00a289988a300.mp3',
				volume: 1,
				startFrame: 1424,
				durationInFrames: 62
			},
			action_MzY2NTA0ODk2MTk1NTU5NTIz: {
				type: 'Plugin',
				pluginId: 'chat-story',
				props: {
					type: 'Message',
					content: {
						type: 'Text',
						text: 'Thanks dad'
					},
					participant: {
						displayName: 'Son'
					},
					messageType: 'sent'
				},
				startFrame: 1424,
				durationInFrames: 15
			},
			action_MzY2NTA0ODk2MTk1NTU5NTI0: {
				type: 'Audio',
				src: 'static/audio/sound/ios_sent.mp3',
				volume: 1,
				startFrame: 1460,
				durationInFrames: 15
			},
			action_MzY2NTA0ODk2MjEyMzM2NzQx: {
				type: 'Audio',
				src: 'http://localhost:4569/elevenlabs/d51ff4d15c7023465dae6546cd6d299063afd9fc2585a820522979b904a7e125.mp3',
				volume: 1,
				startFrame: 1460,
				durationInFrames: 71
			},
			action_MzY2NTA0ODk2MjEyMzM2NzQy: {
				type: 'Plugin',
				pluginId: 'chat-story',
				props: {
					type: 'Message',
					content: {
						type: 'Text',
						text: 'How much further?'
					},
					participant: {
						displayName: 'Son'
					},
					messageType: 'sent'
				},
				startFrame: 1460,
				durationInFrames: 15
			},
			action_MzY2NTA0ODk2MjEyMzM2NzQz: {
				type: 'Audio',
				src: 'static/audio/sound/ios_received.mp3',
				volume: 1,
				startFrame: 1506,
				durationInFrames: 61
			},
			action_MzY2NTA0ODk2MjI0OTE5NjU2: {
				type: 'Audio',
				src: 'http://localhost:4569/elevenlabs/055344517c4e76de5f63ba60626339f442f88631d511a897f49c53b09895a95a.mp3',
				volume: 1,
				startFrame: 1506,
				durationInFrames: 74
			},
			action_MzY2NTA0ODk2MjI0OTE5NjU3: {
				type: 'Plugin',
				pluginId: 'chat-story',
				props: {
					type: 'Message',
					content: {
						type: 'Text',
						text: "You're almost there"
					},
					participant: {
						displayName: 'Dad'
					},
					messageType: 'received'
				},
				startFrame: 1506,
				durationInFrames: 15
			},
			action_MzY2NTA0ODk2MjI0OTE5NjU4: {
				type: 'Audio',
				src: 'static/audio/sound/ios_sent.mp3',
				volume: 1,
				startFrame: 1551,
				durationInFrames: 15
			},
			action_MzY2NTA0ODk2MjM3NTAyNTcx: {
				type: 'Audio',
				src: 'http://localhost:4569/elevenlabs/a3b286fa0780d4fdcd3c22d88143e7edb72f6bffc989018337f387092aca4186.mp3',
				volume: 1,
				startFrame: 1551,
				durationInFrames: 75
			},
			action_MzY2NTA0ODk2MjM3NTAyNTcy: {
				type: 'Plugin',
				pluginId: 'chat-story',
				props: {
					type: 'Message',
					content: {
						type: 'Text',
						text: 'Dad I see land!'
					},
					participant: {
						displayName: 'Son'
					},
					messageType: 'sent'
				},
				startFrame: 1551,
				durationInFrames: 15
			},
			action_MzY2NTA0ODk2MjM3NTAyNTcz: {
				type: 'Audio',
				src: 'static/audio/sound/ios_received.mp3',
				volume: 1,
				startFrame: 1601,
				durationInFrames: 61
			},
			action_MzY2NTA0ODk2MjUwMDg1NDg2: {
				type: 'Audio',
				src: 'http://localhost:4569/elevenlabs/ba1d916ed3c4eff1361adf9594e9e15ef6fcb36e5bd5d12033c80f0095b40ad7.mp3',
				volume: 1,
				startFrame: 1601,
				durationInFrames: 71
			},
			action_MzY2NTA0ODk2MjUwMDg1NDg3: {
				type: 'Plugin',
				pluginId: 'chat-story',
				props: {
					type: 'Message',
					content: {
						type: 'Text',
						text: 'Great job son'
					},
					participant: {
						displayName: 'Dad'
					},
					messageType: 'received'
				},
				startFrame: 1601,
				durationInFrames: 15
			},
			action_MzY2NTA0ODk2MjUwMDg1NDg4: {
				type: 'Audio',
				src: 'static/audio/sound/ios_sent.mp3',
				volume: 1,
				startFrame: 1645,
				durationInFrames: 15
			},
			action_MzY2NTA0ODk2MjYyNjY4NDAx: {
				type: 'Audio',
				src: 'http://localhost:4569/elevenlabs/eb0cdc4046c8736368f133e7b0e762e4089a42d50e938d99f83c4d695f2c68e0.mp3',
				volume: 1,
				startFrame: 1645,
				durationInFrames: 62
			},
			action_MzY2NTA0ODk2MjYyNjY4NDAy: {
				type: 'Plugin',
				pluginId: 'chat-story',
				props: {
					type: 'Message',
					content: {
						type: 'Text',
						text: 'Wait'
					},
					participant: {
						displayName: 'Son'
					},
					messageType: 'sent'
				},
				startFrame: 1645,
				durationInFrames: 15
			},
			action_MzY2NTA0ODk2MjYyNjY4NDAz: {
				type: 'Audio',
				src: 'static/audio/sound/ios_sent.mp3',
				volume: 1,
				startFrame: 1680,
				durationInFrames: 15
			},
			action_MzY2NTA0ODk2MjcxMDU3MDEy: {
				type: 'Audio',
				src: 'http://localhost:4569/elevenlabs/373a13752e0e1614a6e809d1b1a79765a10cc79b5d0e1d1b29229daafa2629b6.mp3',
				volume: 1,
				startFrame: 1680,
				durationInFrames: 73
			},
			action_MzY2NTA0ODk2MjcxMDU3MDEz: {
				type: 'Plugin',
				pluginId: 'chat-story',
				props: {
					type: 'Message',
					content: {
						type: 'Text',
						text: "It's really cold here"
					},
					participant: {
						displayName: 'Son'
					},
					messageType: 'sent'
				},
				startFrame: 1680,
				durationInFrames: 15
			},
			action_MzY2NTA0ODk2MjcxMDU3MDE0: {
				type: 'Audio',
				src: 'static/audio/sound/ios_received.mp3',
				volume: 1,
				startFrame: 1728,
				durationInFrames: 61
			},
			action_MzY2NTA0ODk2Mjg3ODM0MjMx: {
				type: 'Audio',
				src: 'http://localhost:4569/elevenlabs/1f243a48db3a3117e7adb2fb6954dd65929f80a72b2dbea36c5d10dfc3eba1e6.mp3',
				volume: 1,
				startFrame: 1728,
				durationInFrames: 50
			},
			action_MzY2NTA0ODk2Mjg3ODM0MjMy: {
				type: 'Plugin',
				pluginId: 'chat-story',
				props: {
					type: 'Message',
					content: {
						type: 'Text',
						text: 'Cold?'
					},
					participant: {
						displayName: 'Dad'
					},
					messageType: 'received'
				},
				startFrame: 1728,
				durationInFrames: 15
			},
			action_MzY2NTA0ODk2Mjg3ODM0MjMz: {
				type: 'Audio',
				src: 'static/audio/sound/ios_received.mp3',
				volume: 1,
				startFrame: 1751,
				durationInFrames: 61
			},
			action_MzY2NTA0ODk2Mjk2MjIyODQy: {
				type: 'Audio',
				src: 'http://localhost:4569/elevenlabs/44f1c5fe76286b62ae71713b81482a56f205806755885f670d81ad8b07597588.mp3',
				volume: 1,
				startFrame: 1751,
				durationInFrames: 78
			},
			action_MzY2NTA0ODk2Mjk2MjIyODQz: {
				type: 'Plugin',
				pluginId: 'chat-story',
				props: {
					type: 'Message',
					content: {
						type: 'Text',
						text: 'On Volcano Island?'
					},
					participant: {
						displayName: 'Dad'
					},
					messageType: 'received'
				},
				startFrame: 1751,
				durationInFrames: 15
			},
			action_MzY2NTA0ODk2Mjk2MjIyODQ0: {
				type: 'Audio',
				src: 'static/audio/sound/ios_sent.mp3',
				volume: 1,
				startFrame: 1805,
				durationInFrames: 15
			},
			action_MzY2NTA0ODk2MzA4ODA1NzU3: {
				type: 'Audio',
				src: 'http://localhost:4569/elevenlabs/c950f746a8c0d687350ecacb984b5b173fa70adcd022ba7a92a0739a927d18ce.mp3',
				volume: 1,
				startFrame: 1805,
				durationInFrames: 77
			},
			action_MzY2NTA0ODk2MzA4ODA1NzU4: {
				type: 'Plugin',
				pluginId: 'chat-story',
				props: {
					type: 'Message',
					content: {
						type: 'Text',
						text: "There's ice everywhere"
					},
					participant: {
						displayName: 'Son'
					},
					messageType: 'sent'
				},
				startFrame: 1805,
				durationInFrames: 15
			},
			action_MzY2NTA0ODk2MzA4ODA1NzU5: {
				type: 'Audio',
				src: 'static/audio/sound/ios_sent.mp3',
				volume: 1,
				startFrame: 1855,
				durationInFrames: 15
			},
			action_MzY2NTA0ODk2MzIxMzg4Njcy: {
				type: 'Audio',
				src: 'http://localhost:4569/elevenlabs/fc4aed6ed594bf060e99411a3efaed51968be95e1383a3004d02bbbf1182033f.mp3',
				volume: 1,
				startFrame: 1855,
				durationInFrames: 69
			},
			action_MzY2NTA0ODk2MzIxMzg4Njcz: {
				type: 'Plugin',
				pluginId: 'chat-story',
				props: {
					type: 'Message',
					content: {
						type: 'Text',
						text: 'And penguins'
					},
					participant: {
						displayName: 'Son'
					},
					messageType: 'sent'
				},
				startFrame: 1855,
				durationInFrames: 15
			},
			action_MzY2NTA0ODk2MzIxMzg4Njc0: {
				type: 'Audio',
				src: 'static/audio/sound/ios_received.mp3',
				volume: 1,
				startFrame: 1899,
				durationInFrames: 61
			},
			action_MzY2NTA0ODk2MzMzOTcxNTg3: {
				type: 'Audio',
				src: 'http://localhost:4569/elevenlabs/1d571804416755a694234c686aaccc2c2a7578dc9501bb81104d02f6c923b8b7.mp3',
				volume: 1,
				startFrame: 1899,
				durationInFrames: 55
			},
			action_MzY2NTA0ODk2MzMzOTcxNTg4: {
				type: 'Plugin',
				pluginId: 'chat-story',
				props: {
					type: 'Message',
					content: {
						type: 'Text',
						text: 'SON'
					},
					participant: {
						displayName: 'Dad'
					},
					messageType: 'received'
				},
				startFrame: 1899,
				durationInFrames: 15
			},
			action_MzY2NTA0ODk2MzMzOTcxNTg5: {
				type: 'Audio',
				src: 'static/audio/sound/ios_received.mp3',
				volume: 1,
				startFrame: 1927,
				durationInFrames: 61
			},
			action_MzY2NTA0ODk2MzQ2NTU0NTAy: {
				type: 'Audio',
				src: 'http://localhost:4569/elevenlabs/57e55568f539ca820006396e3bc1500ea58c870450953780fcb263496426984c.mp3',
				volume: 1,
				startFrame: 1927,
				durationInFrames: 71
			},
			action_MzY2NTA0ODk2MzQ2NTU0NTAz: {
				type: 'Plugin',
				pluginId: 'chat-story',
				props: {
					type: 'Message',
					content: {
						type: 'Text',
						text: "THAT'S ANTARCTICA"
					},
					participant: {
						displayName: 'Dad'
					},
					messageType: 'received'
				},
				startFrame: 1927,
				durationInFrames: 15
			},
			action_MzY2NTA0ODk2MzQ2NTU0NTA0: {
				type: 'Audio',
				src: 'static/audio/sound/ios_sent.mp3',
				volume: 1,
				startFrame: 1973,
				durationInFrames: 15
			},
			action_MzY2NTA0ODk2MzU0OTQzMTEz: {
				type: 'Audio',
				src: 'http://localhost:4569/elevenlabs/bf1852eafada97964d8931bd281e72514dbaab151200e79bc6e8d6a9787ba55d.mp3',
				volume: 1,
				startFrame: 1973,
				durationInFrames: 73
			},
			action_MzY2NTA0ODk2MzU0OTQzMTE0: {
				type: 'Plugin',
				pluginId: 'chat-story',
				props: {
					type: 'Message',
					content: {
						type: 'Text',
						text: 'WHAT'
					},
					participant: {
						displayName: 'Son'
					},
					messageType: 'sent'
				},
				startFrame: 1973,
				durationInFrames: 15
			},
			action_MzY2NTA0ODk2MzU0OTQzMTE1: {
				type: 'Audio',
				src: 'static/audio/sound/ios_sent.mp3',
				volume: 1,
				startFrame: 2019,
				durationInFrames: 15
			},
			action_MzY2NTA0ODk2MzcxNzIwMzMy: {
				type: 'Audio',
				src: 'http://localhost:4569/elevenlabs/727addad5f91d5567a6481ebd29c2a995708656ffbf69287e6f088cbeed8212e.mp3',
				volume: 1,
				startFrame: 2019,
				durationInFrames: 58
			},
			action_MzY2NTA0ODk2MzcxNzIwMzMz: {
				type: 'Plugin',
				pluginId: 'chat-story',
				props: {
					type: 'Message',
					content: {
						type: 'Text',
						text: 'HOW'
					},
					participant: {
						displayName: 'Son'
					},
					messageType: 'sent'
				},
				startFrame: 2019,
				durationInFrames: 15
			},
			action_MzY2NTA0ODk2MzcxNzIwMzM0: {
				type: 'Audio',
				src: 'static/audio/sound/ios_received.mp3',
				volume: 1,
				startFrame: 2053,
				durationInFrames: 61
			},
			action_MzY2NTA0ODk2MzgwMTA4OTQz: {
				type: 'Audio',
				src: 'http://localhost:4569/elevenlabs/f0235a8e7a97ca350a85c6432ad491c761c7f1b37782c3f387dc29752af5265e.mp3',
				volume: 1,
				startFrame: 2053,
				durationInFrames: 74
			},
			action_MzY2NTA0ODk2MzgwMTA4OTQ0: {
				type: 'Plugin',
				pluginId: 'chat-story',
				props: {
					type: 'Message',
					content: {
						type: 'Text',
						text: 'Did you swim south?'
					},
					participant: {
						displayName: 'Dad'
					},
					messageType: 'received'
				},
				startFrame: 2053,
				durationInFrames: 15
			},
			action_MzY2NTA0ODk2Mzg0MzAzMjQ5: {
				type: 'Audio',
				src: 'static/audio/sound/ios_sent.mp3',
				volume: 1,
				startFrame: 2100,
				durationInFrames: 15
			},
			action_MzY2NTA0ODk2MzkyNjkxODU4: {
				type: 'Audio',
				src: 'http://localhost:4569/elevenlabs/1a768c9674e4f6a866feef04ac75d8e099c675805dd1f0a2db950b196893a289.mp3',
				volume: 1,
				startFrame: 2100,
				durationInFrames: 62
			},
			action_MzY2NTA0ODk2MzkyNjkxODU5: {
				type: 'Plugin',
				pluginId: 'chat-story',
				props: {
					type: 'Message',
					content: {
						type: 'Text',
						text: 'I guess?'
					},
					participant: {
						displayName: 'Son'
					},
					messageType: 'sent'
				},
				startFrame: 2100,
				durationInFrames: 15
			},
			action_MzY2NTA0ODk2MzkyNjkxODYw: {
				type: 'Audio',
				src: 'static/audio/sound/ios_received.mp3',
				volume: 1,
				startFrame: 2137,
				durationInFrames: 61
			},
			action_MzY2NTA0ODk2NDAxMDgwNDY5: {
				type: 'Audio',
				src: 'http://localhost:4569/elevenlabs/455b1f253a6fd335304984061ef10fb0ce8f3fd8af89f24c85e139ac8d608cf0.mp3',
				volume: 1,
				startFrame: 2137,
				durationInFrames: 87
			},
			action_MzY2NTA0ODk2NDAxMDgwNDcw: {
				type: 'Plugin',
				pluginId: 'chat-story',
				props: {
					type: 'Message',
					content: {
						type: 'Text',
						text: 'Volcano Island is NORTH'
					},
					participant: {
						displayName: 'Dad'
					},
					messageType: 'received'
				},
				startFrame: 2137,
				durationInFrames: 15
			},
			action_MzY2NTA0ODk2NDAxMDgwNDcx: {
				type: 'Audio',
				src: 'static/audio/sound/ios_sent.mp3',
				volume: 1,
				startFrame: 2197,
				durationInFrames: 15
			},
			action_MzY2NTA0ODk2NDEzNjYzMzg0: {
				type: 'Audio',
				src: 'http://localhost:4569/elevenlabs/c4305042cfe8a94447ea968e3141ef7b39f8390422366c9c3d61b5788d28666e.mp3',
				volume: 1,
				startFrame: 2197,
				durationInFrames: 75
			},
			action_MzY2NTA0ODk2NDEzNjYzMzg1: {
				type: 'Plugin',
				pluginId: 'chat-story',
				props: {
					type: 'Message',
					content: {
						type: 'Text',
						text: "I'M SORRY"
					},
					participant: {
						displayName: 'Son'
					},
					messageType: 'sent'
				},
				startFrame: 2197,
				durationInFrames: 15
			},
			action_MzY2NTA0ODk2NDEzNjYzMzg2: {
				type: 'Audio',
				src: 'static/audio/sound/ios_sent.mp3',
				volume: 1,
				startFrame: 2246,
				durationInFrames: 15
			},
			action_MzY2NTA0ODk2NDI2MjQ2Mjk5: {
				type: 'Audio',
				src: 'http://localhost:4569/elevenlabs/491ede2678d791fce0530e27999e3fd35f15bf3afd55011c26e6a542dd7030fe.mp3',
				volume: 1,
				startFrame: 2246,
				durationInFrames: 82
			},
			action_MzY2NTA0ODk2NDI2MjQ2MzAw: {
				type: 'Plugin',
				pluginId: 'chat-story',
				props: {
					type: 'Message',
					content: {
						type: 'Text',
						text: "I DON'T HAVE A COMPASS"
					},
					participant: {
						displayName: 'Son'
					},
					messageType: 'sent'
				},
				startFrame: 2246,
				durationInFrames: 15
			},
			action_MzY2NTA0ODk2NDI2MjQ2MzAx: {
				type: 'Audio',
				src: 'static/audio/sound/ios_received.mp3',
				volume: 1,
				startFrame: 2303,
				durationInFrames: 61
			},
			action_MzY2NTA0ODk2NDM4ODI5MjE0: {
				type: 'Audio',
				src: 'http://localhost:4569/elevenlabs/08cdf691314c4c7780ec406be017edc2a05e981212640231ab6f4b08f39b9330.mp3',
				volume: 1,
				startFrame: 2303,
				durationInFrames: 60
			},
			action_MzY2NTA0ODk2NDM4ODI5MjE1: {
				type: 'Plugin',
				pluginId: 'chat-story',
				props: {
					type: 'Message',
					content: {
						type: 'Text',
						text: 'Swim back'
					},
					participant: {
						displayName: 'Dad'
					},
					messageType: 'received'
				},
				startFrame: 2303,
				durationInFrames: 15
			},
			action_MzY2NTA0ODk2NDM4ODI5MjE2: {
				type: 'Audio',
				src: 'static/audio/sound/ios_sent.mp3',
				volume: 1,
				startFrame: 2338,
				durationInFrames: 15
			},
			action_MzY2NTA0ODk2NDQ3MjE3ODI1: {
				type: 'Audio',
				src: 'http://localhost:4569/elevenlabs/d1661e4bbcaa794807561710dd0fa13e825e89af6bae9dd0e3eec73c2532211b.mp3',
				volume: 1,
				startFrame: 2338,
				durationInFrames: 53
			},
			action_MzY2NTA0ODk2NDQ3MjE3ODI2: {
				type: 'Plugin',
				pluginId: 'chat-story',
				props: {
					type: 'Message',
					content: {
						type: 'Text',
						text: 'BACK?!'
					},
					participant: {
						displayName: 'Son'
					},
					messageType: 'sent'
				},
				startFrame: 2338,
				durationInFrames: 15
			},
			action_MzY2NTA0ODk2NDQ3MjE3ODI3: {
				type: 'Audio',
				src: 'static/audio/sound/ios_sent.mp3',
				volume: 1,
				startFrame: 2364,
				durationInFrames: 15
			},
			action_MzY2NTA0ODk2NDU5ODAwNzQw: {
				type: 'Audio',
				src: 'http://localhost:4569/elevenlabs/7d38a6a141388ef69c0ae79eaae01e725ff210c9e56d7d0166db8712ea5e7b8e.mp3',
				volume: 1,
				startFrame: 2364,
				durationInFrames: 74
			},
			action_MzY2NTA0ODk2NDU5ODAwNzQx: {
				type: 'Plugin',
				pluginId: 'chat-story',
				props: {
					type: 'Message',
					content: {
						type: 'Text',
						text: 'I JUST SWAM HERE'
					},
					participant: {
						displayName: 'Son'
					},
					messageType: 'sent'
				},
				startFrame: 2364,
				durationInFrames: 15
			},
			action_MzY2NTA0ODk2NDU5ODAwNzQy: {
				type: 'Audio',
				src: 'static/audio/sound/ios_received.mp3',
				volume: 1,
				startFrame: 2413,
				durationInFrames: 61
			},
			action_MzY2NTA0ODk2NDcyMzgzNjU1: {
				type: 'Audio',
				src: 'http://localhost:4569/elevenlabs/9bcf41b1f88ded5e9f5438c13bb9e91fbc2fa6f9251104e4e399b7c3a3576098.mp3',
				volume: 1,
				startFrame: 2413,
				durationInFrames: 77
			},
			action_MzY2NTA0ODk2NDcyMzgzNjU2: {
				type: 'Plugin',
				pluginId: 'chat-story',
				props: {
					type: 'Message',
					content: {
						type: 'Text',
						text: 'You have a delivery'
					},
					participant: {
						displayName: 'Dad'
					},
					messageType: 'received'
				},
				startFrame: 2413,
				durationInFrames: 15
			},
			action_MzY2NTA0ODk2NDcyMzgzNjU3: {
				type: 'Audio',
				src: 'static/audio/sound/ios_received.mp3',
				volume: 1,
				startFrame: 2463,
				durationInFrames: 61
			},
			action_MzY2NTA0ODk2NDg0OTY2NTcw: {
				type: 'Audio',
				src: 'http://localhost:4569/elevenlabs/ebf03b15dcae37fe67b079522484f00d6e465eae877c6fe525874002ea00e8ef.mp3',
				volume: 1,
				startFrame: 2463,
				durationInFrames: 57
			},
			action_MzY2NTA0ODk2NDg0OTY2NTcx: {
				type: 'Plugin',
				pluginId: 'chat-story',
				props: {
					type: 'Message',
					content: {
						type: 'Text',
						text: 'Remember?'
					},
					participant: {
						displayName: 'Dad'
					},
					messageType: 'received'
				},
				startFrame: 2463,
				durationInFrames: 15
			},
			action_MzY2NTA0ODk2NDg0OTY2NTcy: {
				type: 'Audio',
				src: 'static/audio/sound/ios_sent.mp3',
				volume: 1,
				startFrame: 2491,
				durationInFrames: 15
			},
			action_MzY2NTA0ODk2NDkzMzU1MTgx: {
				type: 'Audio',
				src: 'http://localhost:4569/elevenlabs/8d66d7b557c1799d2e8c65d55e06d83d6671f02a78a21d227f6150101188d86b.mp3',
				volume: 1,
				startFrame: 2491,
				durationInFrames: 55
			},
			action_MzY2NTA0ODk2NDk3NTQ5NDg2: {
				type: 'Plugin',
				pluginId: 'chat-story',
				props: {
					type: 'Message',
					content: {
						type: 'Text',
						text: 'Dad'
					},
					participant: {
						displayName: 'Son'
					},
					messageType: 'sent'
				},
				startFrame: 2491,
				durationInFrames: 15
			},
			action_MzY2NTA0ODk2NDk3NTQ5NDg3: {
				type: 'Audio',
				src: 'static/audio/sound/ios_sent.mp3',
				volume: 1,
				startFrame: 2519,
				durationInFrames: 15
			},
			action_MzY2NTA0ODk2NTA1OTM4MDk2: {
				type: 'Audio',
				src: 'http://localhost:4569/elevenlabs/4bee268c9c904f2c3e8b45cef562e173a32d52efdc1a4e268df8b970447b8ffa.mp3',
				volume: 1,
				startFrame: 2519,
				durationInFrames: 66
			},
			action_MzY2NTA0ODk2NTA1OTM4MDk3: {
				type: 'Plugin',
				pluginId: 'chat-story',
				props: {
					type: 'Message',
					content: {
						type: 'Text',
						text: 'I made it'
					},
					participant: {
						displayName: 'Son'
					},
					messageType: 'sent'
				},
				startFrame: 2519,
				durationInFrames: 15
			},
			action_MzY2NTA0ODk2NTA1OTM4MDk4: {
				type: 'Audio',
				src: 'static/audio/sound/ios_received.mp3',
				volume: 1,
				startFrame: 2560,
				durationInFrames: 61
			},
			action_MzY2NTA0ODk2NTE0MzI2NzA3: {
				type: 'Audio',
				src: 'http://localhost:4569/elevenlabs/25d02bd7a8ecdb3e8a077812812a84901470783fe1d2ca5c1a79874e11c24a2c.mp3',
				volume: 1,
				startFrame: 2560,
				durationInFrames: 87
			},
			action_MzY2NTA0ODk2NTE0MzI2NzA4: {
				type: 'Plugin',
				pluginId: 'chat-story',
				props: {
					type: 'Message',
					content: {
						type: 'Text',
						text: 'To Volcano Island?'
					},
					participant: {
						displayName: 'Dad'
					},
					messageType: 'received'
				},
				startFrame: 2560,
				durationInFrames: 15
			},
			action_MzY2NTA0ODk2NTE0MzI2NzA5: {
				type: 'Audio',
				src: 'static/audio/sound/ios_sent.mp3',
				volume: 1,
				startFrame: 2620,
				durationInFrames: 15
			},
			action_MzY2NTA0ODk2NTI2OTA5NjIy: {
				type: 'Audio',
				src: 'http://localhost:4569/elevenlabs/9456f047b36819e1f38cdc9767e622a2369865c6cb8a11e7321a416618c8a86d.mp3',
				volume: 1,
				startFrame: 2620,
				durationInFrames: 53
			},
			action_MzY2NTA0ODk2NTI2OTA5NjIz: {
				type: 'Plugin',
				pluginId: 'chat-story',
				props: {
					type: 'Message',
					content: {
						type: 'Text',
						text: 'Yes'
					},
					participant: {
						displayName: 'Son'
					},
					messageType: 'sent'
				},
				startFrame: 2620,
				durationInFrames: 15
			},
			action_MzY2NTA0ODk2NTI2OTA5NjI0: {
				type: 'Audio',
				src: 'static/audio/sound/ios_received.mp3',
				volume: 1,
				startFrame: 2648,
				durationInFrames: 61
			},
			action_MzY2NTA0ODk2NTM1Mjk4MjMz: {
				type: 'Audio',
				src: 'http://localhost:4569/elevenlabs/4e883daec505ea5cb2d58b216347308014f3c088c94f53ba05cca75a48a47240.mp3',
				volume: 1,
				startFrame: 2648,
				durationInFrames: 71
			},
			action_MzY2NTA0ODk2NTM1Mjk4MjM0: {
				type: 'Plugin',
				pluginId: 'chat-story',
				props: {
					type: 'Message',
					content: {
						type: 'Text',
						text: "I'm so proud son"
					},
					participant: {
						displayName: 'Dad'
					},
					messageType: 'received'
				},
				startFrame: 2648,
				durationInFrames: 15
			},
			action_MzY2NTA0ODk2NTM5NDkyNTM5: {
				type: 'Audio',
				src: 'static/audio/sound/ios_sent.mp3',
				volume: 1,
				startFrame: 2693,
				durationInFrames: 15
			},
			action_MzY2NTA0ODk2NTQ3ODgxMTQ4: {
				type: 'Audio',
				src: 'http://localhost:4569/elevenlabs/43d429a8358a2387fb2ed60881c7baf01653b49cbfbdfd70a78555bd629c44c2.mp3',
				volume: 1,
				startFrame: 2693,
				durationInFrames: 66
			},
			action_MzY2NTA0ODk2NTQ3ODgxMTQ5: {
				type: 'Plugin',
				pluginId: 'chat-story',
				props: {
					type: 'Message',
					content: {
						type: 'Text',
						text: 'Where are you?'
					},
					participant: {
						displayName: 'Son'
					},
					messageType: 'sent'
				},
				startFrame: 2693,
				durationInFrames: 15
			},
			action_MzY2NTA0ODk2NTQ3ODgxMTUw: {
				type: 'Audio',
				src: 'static/audio/sound/ios_received.mp3',
				volume: 1,
				startFrame: 2733,
				durationInFrames: 61
			},
			action_MzY2NTA0ODk2NjIzMzc4NjIz: {
				type: 'Audio',
				src: 'http://localhost:4569/elevenlabs/450420fb1f5bff9581ee15c8cde25242f9e8ac20e7b9c84a818b050fd21c09fc.mp3',
				volume: 1,
				startFrame: 2733,
				durationInFrames: 43
			},
			action_MzY2NTA0ODk2NjIzMzc4NjI0: {
				type: 'Plugin',
				pluginId: 'chat-story',
				props: {
					type: 'Message',
					content: {
						type: 'Text',
						text: 'Oh'
					},
					participant: {
						displayName: 'Dad'
					},
					messageType: 'received'
				},
				startFrame: 2733,
				durationInFrames: 15
			},
			action_MzY2NTA0ODk2NjIzMzc4NjI1: {
				type: 'Audio',
				src: 'static/audio/sound/ios_received.mp3',
				volume: 1,
				startFrame: 2751,
				durationInFrames: 61
			},
			action_MzY2NTA0ODk2NjUyNzM4NzU0: {
				type: 'Audio',
				src: 'http://localhost:4569/elevenlabs/b01a94b6257a792bce5316e6c983102721bb35678d39f68d07d936e17ece6ee6.mp3',
				volume: 1,
				startFrame: 2751,
				durationInFrames: 62
			},
			action_MzY2NTA0ODk2NjUyNzM4NzU1: {
				type: 'Plugin',
				pluginId: 'chat-story',
				props: {
					type: 'Message',
					content: {
						type: 'Text',
						text: 'Something came up'
					},
					participant: {
						displayName: 'Dad'
					},
					messageType: 'received'
				},
				startFrame: 2751,
				durationInFrames: 15
			},
			action_MzY2NTA0ODk2NjUyNzM4NzU2: {
				type: 'Audio',
				src: 'static/audio/sound/ios_sent.mp3',
				volume: 1,
				startFrame: 2789,
				durationInFrames: 15
			},
			action_MzY2NTA0ODk2Njg2MjkzMTg5: {
				type: 'Audio',
				src: 'http://localhost:4569/elevenlabs/bf1852eafada97964d8931bd281e72514dbaab151200e79bc6e8d6a9787ba55d.mp3',
				volume: 1,
				startFrame: 2789,
				durationInFrames: 73
			},
			action_MzY2NTA0ODk2Njg2MjkzMTkw: {
				type: 'Plugin',
				pluginId: 'chat-story',
				props: {
					type: 'Message',
					content: {
						type: 'Text',
						text: 'WHAT'
					},
					participant: {
						displayName: 'Son'
					},
					messageType: 'sent'
				},
				startFrame: 2789,
				durationInFrames: 15
			},
			action_MzY2NTA0ODk2Njg2MjkzMTkx: {
				type: 'Audio',
				src: 'static/audio/sound/ios_received.mp3',
				volume: 1,
				startFrame: 2835,
				durationInFrames: 61
			},
			action_MzY2NTA0ODk2Njk4ODc2MTA0: {
				type: 'Audio',
				src: 'http://localhost:4569/elevenlabs/2091856b5ff5f00d46ded5410acabfcff474a3adfeb8254f2290e783afb10f55.mp3',
				volume: 1,
				startFrame: 2835,
				durationInFrames: 64
			},
			action_MzY2NTA0ODk2Njk4ODc2MTA1: {
				type: 'Plugin',
				pluginId: 'chat-story',
				props: {
					type: 'Message',
					content: {
						type: 'Text',
						text: "You're on your own"
					},
					participant: {
						displayName: 'Dad'
					},
					messageType: 'received'
				},
				startFrame: 2835,
				durationInFrames: 15
			},
			action_MzY2NTA0ODk2Njk4ODc2MTA2: {
				type: 'Audio',
				src: 'static/audio/sound/ios_sent.mp3',
				volume: 1,
				startFrame: 2874,
				durationInFrames: 15
			},
			action_MzY2NTA0ODk2NzE1NjUzMzIz: {
				type: 'Audio',
				src: 'http://localhost:4569/elevenlabs/6c419bbe157c4f349562e8f7c44150c0e8a6340898617b794b5e06bc5b034fae.mp3',
				volume: 1,
				startFrame: 2874,
				durationInFrames: 67
			},
			action_MzY2NTA0ODk2NzE1NjUzMzI0: {
				type: 'Plugin',
				pluginId: 'chat-story',
				props: {
					type: 'Message',
					content: {
						type: 'Text',
						text: 'DAD NO'
					},
					participant: {
						displayName: 'Son'
					},
					messageType: 'sent'
				},
				startFrame: 2874,
				durationInFrames: 15
			},
			action_MzY2NTA0ODk2NzE1NjUzMzI1: {
				type: 'Audio',
				src: 'static/audio/sound/ios_received.mp3',
				volume: 1,
				startFrame: 2914,
				durationInFrames: 61
			},
			action_MzY2NTA0ODk2NzI0MDQxOTM0: {
				type: 'Audio',
				src: 'http://localhost:4569/elevenlabs/15124de388d376946fcd7e348cf72a95604fd6b1d36d59cb4c8e4dfde2f9c599.mp3',
				volume: 1,
				startFrame: 2914,
				durationInFrames: 62
			},
			action_MzY2NTA0ODk2NzI0MDQxOTM1: {
				type: 'Plugin',
				pluginId: 'chat-story',
				props: {
					type: 'Message',
					content: {
						type: 'Text',
						text: 'I believe in you'
					},
					participant: {
						displayName: 'Dad'
					},
					messageType: 'received'
				},
				startFrame: 2914,
				durationInFrames: 15
			},
			action_MzY2NTA0ODk2NzI0MDQxOTM2: {
				type: 'Audio',
				src: 'static/audio/sound/ios_sent.mp3',
				volume: 1,
				startFrame: 2952,
				durationInFrames: 15
			},
			action_MzY2NTA0ODk2NzM2NjI0ODQ5: {
				type: 'Audio',
				src: 'http://localhost:4569/elevenlabs/0bf3e3e5a9ea0b619bcefb07a4ec397a6c7cd9ed1e43b9975b3e356fb8046b6a.mp3',
				volume: 1,
				startFrame: 2952,
				durationInFrames: 58
			},
			action_MzY2NTA0ODk2NzM2NjI0ODUw: {
				type: 'Plugin',
				pluginId: 'chat-story',
				props: {
					type: 'Message',
					content: {
						type: 'Text',
						text: 'BUT'
					},
					participant: {
						displayName: 'Son'
					},
					messageType: 'sent'
				},
				startFrame: 2952,
				durationInFrames: 15
			},
			action_MzY2NTA0ODk2NzM2NjI0ODUx: {
				type: 'Audio',
				src: 'static/audio/sound/ios_sent.mp3',
				volume: 1,
				startFrame: 2984,
				durationInFrames: 15
			},
			action_MzY2NTA0ODk2NzQ5MjA3NzY0: {
				type: 'Audio',
				src: 'http://localhost:4569/elevenlabs/2b33c5ff8bc02edff67f8cc51a417f389a738454aaddf3ad45ad09792f0c34e0.mp3',
				volume: 1,
				startFrame: 2984,
				durationInFrames: 102
			},
			action_MzY2NTA0ODk2NzQ5MjA3NzY1: {
				type: 'Plugin',
				pluginId: 'chat-story',
				props: {
					type: 'Message',
					content: {
						type: 'Text',
						text: 'THE VOLCANO IS ERUPTING'
					},
					participant: {
						displayName: 'Son'
					},
					messageType: 'sent'
				},
				startFrame: 2984,
				durationInFrames: 15
			},
			action_MzY2NTA0ODk2NzQ5MjA3NzY2: {
				type: 'Audio',
				src: 'static/audio/sound/ios_received.mp3',
				volume: 1,
				startFrame: 3060,
				durationInFrames: 61
			},
			action_MzY2NTA0ODk2NzYxNzkwNjc5: {
				type: 'Audio',
				src: 'http://localhost:4569/elevenlabs/fe546f4e46568d2fba6179cd650e5af49505df26813a3c235bdb96348fc888b9.mp3',
				volume: 1,
				startFrame: 3060,
				durationInFrames: 68
			},
			action_MzY2NTA0ODk2NzYxNzkwNjgw: {
				type: 'Plugin',
				pluginId: 'chat-story',
				props: {
					type: 'Message',
					content: {
						type: 'Text',
						text: 'Perfect timing'
					},
					participant: {
						displayName: 'Dad'
					},
					messageType: 'received'
				},
				startFrame: 3060,
				durationInFrames: 15
			},
			action_MzY2NTA0ODk2NzYxNzkwNjgx: {
				type: 'Audio',
				src: 'static/audio/sound/ios_received.mp3',
				volume: 1,
				startFrame: 3102,
				durationInFrames: 61
			},
			action_MzY2NTA0ODk2NzcwMTc5Mjkw: {
				type: 'Audio',
				src: 'http://localhost:4569/elevenlabs/f3a81b962e148895a41573471dc15fae2cfa244f0161d7758aa5edefe82a44ec.mp3',
				volume: 1,
				startFrame: 3102,
				durationInFrames: 96
			},
			action_MzY2NTA0ODk2NzcwMTc5Mjkx: {
				type: 'Plugin',
				pluginId: 'chat-story',
				props: {
					type: 'Message',
					content: {
						type: 'Text',
						text: 'The client ordered hot food'
					},
					participant: {
						displayName: 'Dad'
					},
					messageType: 'received'
				},
				startFrame: 3102,
				durationInFrames: 15
			},
			action_MzY2NTA0ODk2NzcwMTc5Mjky: {
				type: 'Audio',
				src: 'static/audio/sound/ios_sent.mp3',
				volume: 1,
				startFrame: 3173,
				durationInFrames: 15
			},
			action_MzY2NTA0ODk2Nzg2OTU2NTA5: {
				type: 'Audio',
				src: 'http://localhost:4569/elevenlabs/0cb7689abd24cac1a175318a6b5e8fe76f75487fc8bc68847e1908a88ad001fa.mp3',
				volume: 1,
				startFrame: 3173,
				durationInFrames: 71
			},
			action_MzY2NTA0ODk2Nzg2OTU2NTEw: {
				type: 'Plugin',
				pluginId: 'chat-story',
				props: {
					type: 'Message',
					content: {
						type: 'Text',
						text: 'DAD!!!'
					},
					participant: {
						displayName: 'Son'
					},
					messageType: 'sent'
				},
				startFrame: 3173,
				durationInFrames: 15
			},
			action_MzY2NTA0ODk2Nzg2OTU2NTEx: {
				type: 'Audio',
				src: 'static/audio/sound/ios_received.mp3',
				volume: 1,
				startFrame: 3217,
				durationInFrames: 61
			},
			action_MzY2NTA0ODk2Nzk1MzQ1MTIw: {
				type: 'Audio',
				src: 'http://localhost:4569/elevenlabs/b4dd3a984cced80854b1a61ed89024433e419f8c9dbc3d8c97fca94230ef7920.mp3',
				volume: 1,
				startFrame: 3217,
				durationInFrames: 62
			},
			action_MzY2NTA0ODk2Nzk1MzQ1MTIx: {
				type: 'Plugin',
				pluginId: 'chat-story',
				props: {
					type: 'Message',
					content: {
						type: 'Text',
						text: 'Good luck son'
					},
					participant: {
						displayName: 'Dad'
					},
					messageType: 'received'
				},
				startFrame: 3217,
				durationInFrames: 15
			},
			action_MzY2NTA0ODk2Nzk1MzQ1MTIy: {
				type: 'Audio',
				src: 'static/audio/sound/ios_received.mp3',
				volume: 1,
				startFrame: 3254,
				durationInFrames: 61
			},
			action_MzY2NTA0ODk2ODA3OTI4MDM1: {
				type: 'Audio',
				src: 'http://localhost:4569/elevenlabs/04041f24bd08bf992564499f3e71377d9c0d5ad03a13195bc5e51420b4d4be8f.mp3',
				volume: 1,
				startFrame: 3254,
				durationInFrames: 78
			},
			action_MzY2NTA0ODk2ODA3OTI4MDM2: {
				type: 'Plugin',
				pluginId: 'chat-story',
				props: {
					type: 'Message',
					content: {
						type: 'Text',
						text: "You're a delivery man now"
					},
					participant: {
						displayName: 'Dad'
					},
					messageType: 'received'
				},
				startFrame: 3254,
				durationInFrames: 15
			},
			action_MzY2NTA0ODk2ODA3OTI4MDQw: {
				type: 'Plugin',
				pluginId: 'tiktok-like',
				props: {
					text: 'Show love! 💬'
				},
				durationInFrames: 120,
				width: 1080,
				height: 500,
				x: 0,
				y: 1000,
				startFrame: 713
			},
			action_MzY2NTA0ODk2ODA3OTI4MDQx: {
				type: 'Plugin',
				pluginId: 'tiktok-follow',
				props: {
					media: {
						type: 'Image',
						src: 'static/image/chatsnap.png'
					},
					text: 'Hit follow! 💬'
				},
				durationInFrames: 120,
				width: 1080,
				height: 500,
				x: 0,
				y: 1000,
				startFrame: 1546
			},
			action_MzY2NTA0ODk2ODA3OTI4MDQy: {
				type: 'Plugin',
				pluginId: 'tiktok-like',
				props: {
					text: 'Like if you agree! 😉'
				},
				durationInFrames: 120,
				width: 1080,
				height: 500,
				x: 0,
				y: 1000,
				startFrame: 2379
			},
			action_MzY2NTA0ODk2ODA3OTI4MDQz: {
				type: 'Plugin',
				pluginId: 'tiktok-follow',
				props: {
					media: {
						type: 'Image',
						src: 'static/image/chatsnap.png'
					},
					text: 'Follow now! 🚀'
				},
				durationInFrames: 120,
				width: 1080,
				height: 500,
				x: 0,
				y: 1000,
				startFrame: 3212
			},
			action_MzY2NTA0ODk2ODA3OTI4MDQ1: {
				type: 'Rectangle',
				width: 1080,
				height: 1920,
				startFrame: 0,
				durationInFrames: 3332,
				fill: {
					type: 'Video',
					width: 1080,
					height: 1920,
					objectFit: 'cover',
					src: 'static/video/.local/steep_1.mp4',
					startFrom: 1315
				}
			}
		},
		trackMap: {
			track_MzY2NTA0ODk2ODA3OTI4MDM3: {
				type: 'Plugin',
				pluginId: 'chat-story',
				props: {
					messenger: {
						type: 'IMessage',
						contact: {
							profilePicture: {
								type: 'Image',
								src: 'static/image/memoji/1.png'
							},
							name: 'Mom'
						}
					}
				},
				width: 1080,
				height: 800,
				x: 0,
				y: 256,
				actionIds: [
					'action_MzY2NTA0ODk1NjI5MzI4Mzg3',
					'action_MzY2NTA0ODk1NjYyODgyODIy',
					'action_MzY2NTA0ODk1Njg4MDQ4NjQ5',
					'action_MzY2NTA0ODk1NzE3NDA4Nzgw',
					'action_MzY2NTA0ODk1NzQyNTc0NjA3',
					'action_MzY2NTA0ODk1NzYzNTQ2MTMw',
					'action_MzY2NTA0ODk1Nzg4NzExOTU3',
					'action_MzY2NTA0ODk1ODA1NDg5MTc2',
					'action_MzY2NTA0ODk1ODMwNjU1MDAz',
					'action_MzY2NTA0ODk1ODQ3NDMyMjIy',
					'action_MzY2NTA0ODk1ODY4NDAzNzQ1',
					'action_MzY2NTA0ODk1ODg1MTgwOTY0',
					'action_MzY2NTA0ODk1ODk3NzYzODc5',
					'action_MzY2NTA0ODk1OTE0NTQxMDk4',
					'action_MzY2NTA0ODk1OTI3MTI0MDEz',
					'action_MzY2NTA0ODk1OTQzOTAxMjMy',
					'action_MzY2NTA0ODk1OTYwNjc4NDUx',
					'action_MzY2NTA0ODk1OTczMjYxMzY2',
					'action_MzY2NTA0ODk1OTg1ODQ0Mjgx',
					'action_MzY2NTA0ODk2MDIzNTkzMDIw',
					'action_MzY2NTA0ODk2MDQ0NTY0NTQz',
					'action_MzY2NTA0ODk2MDU3MTQ3NDU4',
					'action_MzY2NTA0ODk2MDY5NzMwMzcz',
					'action_MzY2NTA0ODk2MDg2NTA3NTky',
					'action_MzY2NTA0ODk2MDk0ODk2MjAz',
					'action_MzY2NTA0ODk2MTA3NDc5MTE4',
					'action_MzY2NTA0ODk2MTIwMDYyMDMz',
					'action_MzY2NTA0ODk2MTM2ODM5MjUy',
					'action_MzY2NTA0ODk2MTQ5NDIyMTY3',
					'action_MzY2NTA0ODk2MTYyMDA1MDgy',
					'action_MzY2NTA0ODk2MTc0NTg3OTk3',
					'action_MzY2NTA0ODk2MTg3MTcwOTEy',
					'action_MzY2NTA0ODk2MTk1NTU5NTIz',
					'action_MzY2NTA0ODk2MjEyMzM2NzQy',
					'action_MzY2NTA0ODk2MjI0OTE5NjU3',
					'action_MzY2NTA0ODk2MjM3NTAyNTcy',
					'action_MzY2NTA0ODk2MjUwMDg1NDg3',
					'action_MzY2NTA0ODk2MjYyNjY4NDAy',
					'action_MzY2NTA0ODk2MjcxMDU3MDEz',
					'action_MzY2NTA0ODk2Mjg3ODM0MjMy',
					'action_MzY2NTA0ODk2Mjk2MjIyODQz',
					'action_MzY2NTA0ODk2MzA4ODA1NzU4',
					'action_MzY2NTA0ODk2MzIxMzg4Njcz',
					'action_MzY2NTA0ODk2MzMzOTcxNTg4',
					'action_MzY2NTA0ODk2MzQ2NTU0NTAz',
					'action_MzY2NTA0ODk2MzU0OTQzMTE0',
					'action_MzY2NTA0ODk2MzcxNzIwMzMz',
					'action_MzY2NTA0ODk2MzgwMTA4OTQ0',
					'action_MzY2NTA0ODk2MzkyNjkxODU5',
					'action_MzY2NTA0ODk2NDAxMDgwNDcw',
					'action_MzY2NTA0ODk2NDEzNjYzMzg1',
					'action_MzY2NTA0ODk2NDI2MjQ2MzAw',
					'action_MzY2NTA0ODk2NDM4ODI5MjE1',
					'action_MzY2NTA0ODk2NDQ3MjE3ODI2',
					'action_MzY2NTA0ODk2NDU5ODAwNzQx',
					'action_MzY2NTA0ODk2NDcyMzgzNjU2',
					'action_MzY2NTA0ODk2NDg0OTY2NTcx',
					'action_MzY2NTA0ODk2NDk3NTQ5NDg2',
					'action_MzY2NTA0ODk2NTA1OTM4MDk3',
					'action_MzY2NTA0ODk2NTE0MzI2NzA4',
					'action_MzY2NTA0ODk2NTI2OTA5NjIz',
					'action_MzY2NTA0ODk2NTM1Mjk4MjM0',
					'action_MzY2NTA0ODk2NTQ3ODgxMTQ5',
					'action_MzY2NTA0ODk2NjIzMzc4NjI0',
					'action_MzY2NTA0ODk2NjUyNzM4NzU1',
					'action_MzY2NTA0ODk2Njg2MjkzMTkw',
					'action_MzY2NTA0ODk2Njk4ODc2MTA1',
					'action_MzY2NTA0ODk2NzE1NjUzMzI0',
					'action_MzY2NTA0ODk2NzI0MDQxOTM1',
					'action_MzY2NTA0ODk2NzM2NjI0ODUw',
					'action_MzY2NTA0ODk2NzQ5MjA3NzY1',
					'action_MzY2NTA0ODk2NzYxNzkwNjgw',
					'action_MzY2NTA0ODk2NzcwMTc5Mjkx',
					'action_MzY2NTA0ODk2Nzg2OTU2NTEw',
					'action_MzY2NTA0ODk2Nzk1MzQ1MTIx',
					'action_MzY2NTA0ODk2ODA3OTI4MDM2'
				]
			},
			track_MzY2NTA0ODk2ODA3OTI4MDM4: {
				type: 'Track',
				actionIds: [
					'action_MzY2NTA0ODk1NjI5MzI4Mzg2',
					'action_MzY2NTA0ODk1NjYyODgyODIx',
					'action_MzY2NTA0ODk1Njg4MDQ4NjQ4',
					'action_MzY2NTA0ODk1NzE3NDA4Nzc5',
					'action_MzY2NTA0ODk1NzQyNTc0NjA2',
					'action_MzY2NTA0ODk1NzYzNTQ2MTI5',
					'action_MzY2NTA0ODk1Nzg0NTE3NjUy',
					'action_MzY2NTA0ODk1ODA1NDg5MTc1',
					'action_MzY2NTA0ODk1ODMwNjU1MDAy',
					'action_MzY2NTA0ODk1ODQ3NDMyMjIx',
					'action_MzY2NTA0ODk1ODY4NDAzNzQ0',
					'action_MzY2NTA0ODk1ODg1MTgwOTYz',
					'action_MzY2NTA0ODk1ODk3NzYzODc4',
					'action_MzY2NTA0ODk1OTE0NTQxMDk3',
					'action_MzY2NTA0ODk1OTI3MTI0MDEy',
					'action_MzY2NTA0ODk1OTQzOTAxMjMx',
					'action_MzY2NTA0ODk1OTYwNjc4NDUw',
					'action_MzY2NTA0ODk1OTczMjYxMzY1',
					'action_MzY2NTA0ODk1OTg1ODQ0Mjgw',
					'action_MzY2NTA0ODk2MDIzNTkzMDE5',
					'action_MzY2NTA0ODk2MDQ0NTY0NTQy',
					'action_MzY2NTA0ODk2MDU3MTQ3NDU3',
					'action_MzY2NTA0ODk2MDY5NzMwMzcy',
					'action_MzY2NTA0ODk2MDg2NTA3NTkx',
					'action_MzY2NTA0ODk2MDk0ODk2MjAy',
					'action_MzY2NTA0ODk2MTA3NDc5MTE3',
					'action_MzY2NTA0ODk2MTIwMDYyMDMy',
					'action_MzY2NTA0ODk2MTM2ODM5MjUx',
					'action_MzY2NTA0ODk2MTQ5NDIyMTY2',
					'action_MzY2NTA0ODk2MTYyMDA1MDgx',
					'action_MzY2NTA0ODk2MTc0NTg3OTk2',
					'action_MzY2NTA0ODk2MTg3MTcwOTEx',
					'action_MzY2NTA0ODk2MTk1NTU5NTIy',
					'action_MzY2NTA0ODk2MjEyMzM2NzQx',
					'action_MzY2NTA0ODk2MjI0OTE5NjU2',
					'action_MzY2NTA0ODk2MjM3NTAyNTcx',
					'action_MzY2NTA0ODk2MjUwMDg1NDg2',
					'action_MzY2NTA0ODk2MjYyNjY4NDAx',
					'action_MzY2NTA0ODk2MjcxMDU3MDEy',
					'action_MzY2NTA0ODk2Mjg3ODM0MjMx',
					'action_MzY2NTA0ODk2Mjk2MjIyODQy',
					'action_MzY2NTA0ODk2MzA4ODA1NzU3',
					'action_MzY2NTA0ODk2MzIxMzg4Njcy',
					'action_MzY2NTA0ODk2MzMzOTcxNTg3',
					'action_MzY2NTA0ODk2MzQ2NTU0NTAy',
					'action_MzY2NTA0ODk2MzU0OTQzMTEz',
					'action_MzY2NTA0ODk2MzcxNzIwMzMy',
					'action_MzY2NTA0ODk2MzgwMTA4OTQz',
					'action_MzY2NTA0ODk2MzkyNjkxODU4',
					'action_MzY2NTA0ODk2NDAxMDgwNDY5',
					'action_MzY2NTA0ODk2NDEzNjYzMzg0',
					'action_MzY2NTA0ODk2NDI2MjQ2Mjk5',
					'action_MzY2NTA0ODk2NDM4ODI5MjE0',
					'action_MzY2NTA0ODk2NDQ3MjE3ODI1',
					'action_MzY2NTA0ODk2NDU5ODAwNzQw',
					'action_MzY2NTA0ODk2NDcyMzgzNjU1',
					'action_MzY2NTA0ODk2NDg0OTY2NTcw',
					'action_MzY2NTA0ODk2NDkzMzU1MTgx',
					'action_MzY2NTA0ODk2NTA1OTM4MDk2',
					'action_MzY2NTA0ODk2NTE0MzI2NzA3',
					'action_MzY2NTA0ODk2NTI2OTA5NjIy',
					'action_MzY2NTA0ODk2NTM1Mjk4MjMz',
					'action_MzY2NTA0ODk2NTQ3ODgxMTQ4',
					'action_MzY2NTA0ODk2NjIzMzc4NjIz',
					'action_MzY2NTA0ODk2NjUyNzM4NzU0',
					'action_MzY2NTA0ODk2Njg2MjkzMTg5',
					'action_MzY2NTA0ODk2Njk4ODc2MTA0',
					'action_MzY2NTA0ODk2NzE1NjUzMzIz',
					'action_MzY2NTA0ODk2NzI0MDQxOTM0',
					'action_MzY2NTA0ODk2NzM2NjI0ODQ5',
					'action_MzY2NTA0ODk2NzQ5MjA3NzY0',
					'action_MzY2NTA0ODk2NzYxNzkwNjc5',
					'action_MzY2NTA0ODk2NzcwMTc5Mjkw',
					'action_MzY2NTA0ODk2Nzg2OTU2NTA5',
					'action_MzY2NTA0ODk2Nzk1MzQ1MTIw',
					'action_MzY2NTA0ODk2ODA3OTI4MDM1'
				]
			},
			track_MzY2NTA0ODk2ODA3OTI4MDM5: {
				type: 'Track',
				actionIds: [
					'action_MzY2NTA0ODk1NTAzNDk5MjY1',
					'action_MzY2NTA0ODk1NjI5MzI4Mzg4',
					'action_MzY2NTA0ODk1NjYyODgyODIz',
					'action_MzY2NTA0ODk1Njg4MDQ4NjUw',
					'action_MzY2NTA0ODk1NzE3NDA4Nzgx',
					'action_MzY2NTA0ODk1NzQyNTc0NjA4',
					'action_MzY2NTA0ODk1NzYzNTQ2MTMx',
					'action_MzY2NTA0ODk1Nzg4NzExOTU4',
					'action_MzY2NTA0ODk1ODA1NDg5MTc3',
					'action_MzY2NTA0ODk1ODMwNjU1MDA0',
					'action_MzY2NTA0ODk1ODQ3NDMyMjIz',
					'action_MzY2NTA0ODk1ODY4NDAzNzQ2',
					'action_MzY2NTA0ODk1ODg1MTgwOTY1',
					'action_MzY2NTA0ODk1ODk3NzYzODgw',
					'action_MzY2NTA0ODk1OTE0NTQxMDk5',
					'action_MzY2NTA0ODk1OTMxMzE4MzE4',
					'action_MzY2NTA0ODk1OTQzOTAxMjMz',
					'action_MzY2NTA0ODk1OTYwNjc4NDUy',
					'action_MzY2NTA0ODk1OTczMjYxMzY3',
					'action_MzY2NTA0ODk1OTg1ODQ0Mjgy',
					'action_MzY2NTA0ODk2MDIzNTkzMDIx',
					'action_MzY2NTA0ODk2MDQ0NTY0NTQ0',
					'action_MzY2NTA0ODk2MDU3MTQ3NDU5',
					'action_MzY2NTA0ODk2MDY5NzMwMzc0',
					'action_MzY2NTA0ODk2MDg2NTA3NTkz',
					'action_MzY2NTA0ODk2MDk0ODk2MjA0',
					'action_MzY2NTA0ODk2MTA3NDc5MTE5',
					'action_MzY2NTA0ODk2MTIwMDYyMDM0',
					'action_MzY2NTA0ODk2MTM2ODM5MjUz',
					'action_MzY2NTA0ODk2MTQ5NDIyMTY4',
					'action_MzY2NTA0ODk2MTYyMDA1MDgz',
					'action_MzY2NTA0ODk2MTc0NTg3OTk4',
					'action_MzY2NTA0ODk2MTg3MTcwOTEz',
					'action_MzY2NTA0ODk2MTk1NTU5NTI0',
					'action_MzY2NTA0ODk2MjEyMzM2NzQz',
					'action_MzY2NTA0ODk2MjI0OTE5NjU4',
					'action_MzY2NTA0ODk2MjM3NTAyNTcz',
					'action_MzY2NTA0ODk2MjUwMDg1NDg4',
					'action_MzY2NTA0ODk2MjYyNjY4NDAz',
					'action_MzY2NTA0ODk2MjcxMDU3MDE0',
					'action_MzY2NTA0ODk2Mjg3ODM0MjMz',
					'action_MzY2NTA0ODk2Mjk2MjIyODQ0',
					'action_MzY2NTA0ODk2MzA4ODA1NzU5',
					'action_MzY2NTA0ODk2MzIxMzg4Njc0',
					'action_MzY2NTA0ODk2MzMzOTcxNTg5',
					'action_MzY2NTA0ODk2MzQ2NTU0NTA0',
					'action_MzY2NTA0ODk2MzU0OTQzMTE1',
					'action_MzY2NTA0ODk2MzcxNzIwMzM0',
					'action_MzY2NTA0ODk2Mzg0MzAzMjQ5',
					'action_MzY2NTA0ODk2MzkyNjkxODYw',
					'action_MzY2NTA0ODk2NDAxMDgwNDcx',
					'action_MzY2NTA0ODk2NDEzNjYzMzg2',
					'action_MzY2NTA0ODk2NDI2MjQ2MzAx',
					'action_MzY2NTA0ODk2NDM4ODI5MjE2',
					'action_MzY2NTA0ODk2NDQ3MjE3ODI3',
					'action_MzY2NTA0ODk2NDU5ODAwNzQy',
					'action_MzY2NTA0ODk2NDcyMzgzNjU3',
					'action_MzY2NTA0ODk2NDg0OTY2NTcy',
					'action_MzY2NTA0ODk2NDk3NTQ5NDg3',
					'action_MzY2NTA0ODk2NTA1OTM4MDk4',
					'action_MzY2NTA0ODk2NTE0MzI2NzA5',
					'action_MzY2NTA0ODk2NTI2OTA5NjI0',
					'action_MzY2NTA0ODk2NTM5NDkyNTM5',
					'action_MzY2NTA0ODk2NTQ3ODgxMTUw',
					'action_MzY2NTA0ODk2NjIzMzc4NjI1',
					'action_MzY2NTA0ODk2NjUyNzM4NzU2',
					'action_MzY2NTA0ODk2Njg2MjkzMTkx',
					'action_MzY2NTA0ODk2Njk4ODc2MTA2',
					'action_MzY2NTA0ODk2NzE1NjUzMzI1',
					'action_MzY2NTA0ODk2NzI0MDQxOTM2',
					'action_MzY2NTA0ODk2NzM2NjI0ODUx',
					'action_MzY2NTA0ODk2NzQ5MjA3NzY2',
					'action_MzY2NTA0ODk2NzYxNzkwNjgx',
					'action_MzY2NTA0ODk2NzcwMTc5Mjky',
					'action_MzY2NTA0ODk2Nzg2OTU2NTEx',
					'action_MzY2NTA0ODk2Nzk1MzQ1MTIy'
				]
			},
			track_MzY2NTA0ODk2ODA3OTI4MDQ0: {
				type: 'Track',
				actionIds: [
					'action_MzY2NTA0ODk2ODA3OTI4MDQw',
					'action_MzY2NTA0ODk2ODA3OTI4MDQx',
					'action_MzY2NTA0ODk2ODA3OTI4MDQy',
					'action_MzY2NTA0ODk2ODA3OTI4MDQz'
				]
			},
			track_MzY2NTA0ODk2ODA3OTI4MDQ2: {
				type: 'Track',
				actionIds: ['action_MzY2NTA0ODk2ODA3OTI4MDQ1']
			}
		}
	},
	durationInFrames: 3332,
	fps: 30,
	width: 1080,
	height: 1920
};
