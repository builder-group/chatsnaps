import { type TChatStoryPlugin, type TProjectCompProps } from '@repo/video';

export const project1: TProjectCompProps = {
	name: 'Project 1',
	width: 1080,
	height: 1920,
	fps: 30,
	timeline: {
		tracks: [
			{
				type: 'Track',
				id: 'background-track',
				actions: [
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
					}
				]
			},
			{
				type: 'Track',
				id: 'cta-track',
				actions: [
					{
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
					{
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
				]
			}
		]
	}
};

export const chatStoryProject: TProjectCompProps = {
	name: 'He Cheated... But I Have a WILD Secret 🤯💔',
	timeline: {
		tracks: [
			{
				type: 'Track',
				id: 'background-video-timeline',
				actions: [
					{
						type: 'Rectangle',
						width: 1080,
						height: 1920,
						startFrame: 0,
						durationInFrames: 2049,
						fill: {
							type: 'Video',
							width: 1080,
							height: 1920,
							objectFit: 'cover',
							src: 'static/video/.local/steep_2.mp4',
							startFrom: 344
						}
					}
				]
			},
			{
				type: 'Plugin',
				pluginId: 'chat-story',
				id: 'chat-story-timeline',
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
				actions: [
					{
						type: 'Message',
						content: {
							type: 'Text',
							text: "I'm pregnant"
						},
						participant: {
							displayName: 'Becca'
						},
						messageType: 'received',
						startFrame: 0,
						durationInFrames: 15
					},
					{
						type: 'Message',
						content: {
							type: 'Text',
							text: 'What?!'
						},
						participant: {
							displayName: 'Nick'
						},
						messageType: 'sent',
						startFrame: 29,
						durationInFrames: 15
					},
					{
						type: 'Message',
						content: {
							type: 'Text',
							text: "With your brother's baby"
						},
						participant: {
							displayName: 'Becca'
						},
						messageType: 'received',
						startFrame: 59,
						durationInFrames: 15
					},
					{
						type: 'Message',
						content: {
							type: 'Text',
							text: 'WHAT'
						},
						participant: {
							displayName: 'Nick'
						},
						messageType: 'sent',
						startFrame: 100,
						durationInFrames: 15
					},
					{
						type: 'Message',
						content: {
							type: 'Text',
							text: 'THE'
						},
						participant: {
							displayName: 'Nick'
						},
						messageType: 'sent',
						startFrame: 131,
						durationInFrames: 15
					},
					{
						type: 'Message',
						content: {
							type: 'Text',
							text: 'FRICK!'
						},
						participant: {
							displayName: 'Nick'
						},
						messageType: 'sent',
						startFrame: 151,
						durationInFrames: 15
					},
					{
						type: 'Message',
						content: {
							type: 'Text',
							text: 'Calm down'
						},
						participant: {
							displayName: 'Becca'
						},
						messageType: 'received',
						startFrame: 188,
						durationInFrames: 15
					},
					{
						type: 'Message',
						content: {
							type: 'Text',
							text: "It's a joke"
						},
						participant: {
							displayName: 'Becca'
						},
						messageType: 'received',
						startFrame: 214,
						durationInFrames: 15
					},
					{
						type: 'Message',
						content: {
							type: 'Text',
							text: 'Not funny'
						},
						participant: {
							displayName: 'Nick'
						},
						messageType: 'sent',
						startFrame: 242,
						durationInFrames: 15
					},
					{
						type: 'Message',
						content: {
							type: 'Text',
							text: "We're done"
						},
						participant: {
							displayName: 'Nick'
						},
						messageType: 'sent',
						startFrame: 271,
						durationInFrames: 15
					},
					{
						type: 'Message',
						content: {
							type: 'Text',
							text: 'Wait'
						},
						participant: {
							displayName: 'Becca'
						},
						messageType: 'received',
						startFrame: 304,
						durationInFrames: 15
					},
					{
						type: 'Message',
						content: {
							type: 'Text',
							text: "I'm serious now"
						},
						participant: {
							displayName: 'Becca'
						},
						messageType: 'received',
						startFrame: 322,
						durationInFrames: 15
					},
					{
						type: 'Message',
						content: {
							type: 'Text',
							text: "I've been cheating"
						},
						participant: {
							displayName: 'Becca'
						},
						messageType: 'received',
						startFrame: 356,
						durationInFrames: 15
					},
					{
						type: 'Message',
						content: {
							type: 'Text',
							text: 'Cool'
						},
						participant: {
							displayName: 'Nick'
						},
						messageType: 'sent',
						startFrame: 385,
						durationInFrames: 15
					},
					{
						type: 'Message',
						content: {
							type: 'Text',
							text: 'Cool?!'
						},
						participant: {
							displayName: 'Becca'
						},
						messageType: 'received',
						startFrame: 408,
						durationInFrames: 15
					},
					{
						type: 'Message',
						content: {
							type: 'Text',
							text: "That's it?"
						},
						participant: {
							displayName: 'Becca'
						},
						messageType: 'received',
						startFrame: 434,
						durationInFrames: 15
					},
					{
						type: 'Message',
						content: {
							type: 'Text',
							text: 'Yep'
						},
						participant: {
							displayName: 'Nick'
						},
						messageType: 'sent',
						startFrame: 462,
						durationInFrames: 15
					},
					{
						type: 'Message',
						content: {
							type: 'Text',
							text: 'With your brother'
						},
						participant: {
							displayName: 'Becca'
						},
						messageType: 'received',
						startFrame: 485,
						durationInFrames: 15
					},
					{
						type: 'Message',
						content: {
							type: 'Text',
							text: 'Whatever'
						},
						participant: {
							displayName: 'Nick'
						},
						messageType: 'sent',
						startFrame: 518,
						durationInFrames: 15
					},
					{
						type: 'Message',
						content: {
							type: 'Text',
							text: 'Are you serious?!'
						},
						participant: {
							displayName: 'Becca'
						},
						messageType: 'received',
						startFrame: 543,
						durationInFrames: 15
					},
					{
						type: 'Message',
						content: {
							type: 'Text',
							text: "You don't care?"
						},
						participant: {
							displayName: 'Becca'
						},
						messageType: 'received',
						startFrame: 581,
						durationInFrames: 15
					},
					{
						type: 'Message',
						content: {
							type: 'Text',
							text: 'Nope'
						},
						participant: {
							displayName: 'Nick'
						},
						messageType: 'sent',
						startFrame: 613,
						durationInFrames: 15
					},
					{
						type: 'Message',
						content: {
							type: 'Text',
							text: "What's wrong with you?"
						},
						participant: {
							displayName: 'Becca'
						},
						messageType: 'received',
						startFrame: 632,
						durationInFrames: 15
					},
					{
						type: 'Message',
						content: {
							type: 'Text',
							text: 'Ashwagandha, bro'
						},
						participant: {
							displayName: 'Nick'
						},
						messageType: 'sent',
						startFrame: 674,
						durationInFrames: 15
					},
					{
						type: 'Message',
						content: {
							type: 'Text',
							text: 'What?'
						},
						participant: {
							displayName: 'Becca'
						},
						messageType: 'received',
						startFrame: 712,
						durationInFrames: 15
					},
					{
						type: 'Message',
						content: {
							type: 'Text',
							text: "It's my secret weapon"
						},
						participant: {
							displayName: 'Nick'
						},
						messageType: 'sent',
						startFrame: 742,
						durationInFrames: 15
					},
					{
						type: 'Message',
						content: {
							type: 'Text',
							text: "You're insane"
						},
						participant: {
							displayName: 'Becca'
						},
						messageType: 'received',
						startFrame: 781,
						durationInFrames: 15
					},
					{
						type: 'Message',
						content: {
							type: 'Text',
							text: "I'm leaving you"
						},
						participant: {
							displayName: 'Becca'
						},
						messageType: 'received',
						startFrame: 817,
						durationInFrames: 15
					},
					{
						type: 'Message',
						content: {
							type: 'Text',
							text: 'For your brother'
						},
						participant: {
							displayName: 'Becca'
						},
						messageType: 'received',
						startFrame: 845,
						durationInFrames: 15
					},
					{
						type: 'Message',
						content: {
							type: 'Text',
							text: 'Cool beans'
						},
						participant: {
							displayName: 'Nick'
						},
						messageType: 'sent',
						startFrame: 874,
						durationInFrames: 15
					},
					{
						type: 'Message',
						content: {
							type: 'Text',
							text: 'STOP IT'
						},
						participant: {
							displayName: 'Becca'
						},
						messageType: 'received',
						startFrame: 908,
						durationInFrames: 15
					},
					{
						type: 'Message',
						content: {
							type: 'Text',
							text: 'React! Get mad!'
						},
						participant: {
							displayName: 'Becca'
						},
						messageType: 'received',
						startFrame: 936,
						durationInFrames: 15
					},
					{
						type: 'Message',
						content: {
							type: 'Text',
							text: 'Nah'
						},
						participant: {
							displayName: 'Nick'
						},
						messageType: 'sent',
						startFrame: 984,
						durationInFrames: 15
					},
					{
						type: 'Message',
						content: {
							type: 'Text',
							text: "I'm texting my sneaky link"
						},
						participant: {
							displayName: 'Nick'
						},
						messageType: 'sent',
						startFrame: 1003,
						durationInFrames: 15
					},
					{
						type: 'Message',
						content: {
							type: 'Text',
							text: 'Your WHAT?'
						},
						participant: {
							displayName: 'Becca'
						},
						messageType: 'received',
						startFrame: 1055,
						durationInFrames: 15
					},
					{
						type: 'Message',
						content: {
							type: 'Text',
							text: 'Girlfriend'
						},
						participant: {
							displayName: 'Nick'
						},
						messageType: 'sent',
						startFrame: 1085,
						durationInFrames: 15
					},
					{
						type: 'Message',
						content: {
							type: 'Text',
							text: "YOU'VE BEEN CHEATING TOO?!"
						},
						participant: {
							displayName: 'Becca'
						},
						messageType: 'received',
						startFrame: 1111,
						durationInFrames: 15
					},
					{
						type: 'Message',
						content: {
							type: 'Text',
							text: 'Define cheating'
						},
						participant: {
							displayName: 'Nick'
						},
						messageType: 'sent',
						startFrame: 1163,
						durationInFrames: 15
					},
					{
						type: 'Message',
						content: {
							type: 'Text',
							text: 'Sleeping with others!'
						},
						participant: {
							displayName: 'Becca'
						},
						messageType: 'received',
						startFrame: 1200,
						durationInFrames: 15
					},
					{
						type: 'Message',
						content: {
							type: 'Text',
							text: "We're not sleeping"
						},
						participant: {
							displayName: 'Nick'
						},
						messageType: 'sent',
						startFrame: 1255,
						durationInFrames: 15
					},
					{
						type: 'Message',
						content: {
							type: 'Text',
							text: "We're awake 😉"
						},
						participant: {
							displayName: 'Nick'
						},
						messageType: 'sent',
						startFrame: 1296,
						durationInFrames: 15
					},
					{
						type: 'Message',
						content: {
							type: 'Text',
							text: "I can't believe this"
						},
						participant: {
							displayName: 'Becca'
						},
						messageType: 'received',
						startFrame: 1327,
						durationInFrames: 15
					},
					{
						type: 'Message',
						content: {
							type: 'Text',
							text: "We're done"
						},
						participant: {
							displayName: 'Becca'
						},
						messageType: 'received',
						startFrame: 1363,
						durationInFrames: 15
					},
					{
						type: 'Message',
						content: {
							type: 'Text',
							text: 'Again?'
						},
						participant: {
							displayName: 'Nick'
						},
						messageType: 'sent',
						startFrame: 1390,
						durationInFrames: 15
					},
					{
						type: 'Message',
						content: {
							type: 'Text',
							text: 'Boring'
						},
						participant: {
							displayName: 'Nick'
						},
						messageType: 'sent',
						startFrame: 1416,
						durationInFrames: 15
					},
					{
						type: 'Message',
						content: {
							type: 'Text',
							text: 'You know what?'
						},
						participant: {
							displayName: 'Becca'
						},
						messageType: 'received',
						startFrame: 1441,
						durationInFrames: 15
					},
					{
						type: 'Message',
						content: {
							type: 'Text',
							text: 'I changed my mind'
						},
						participant: {
							displayName: 'Becca'
						},
						messageType: 'received',
						startFrame: 1472,
						durationInFrames: 15
					},
					{
						type: 'Message',
						content: {
							type: 'Text',
							text: "Let's stay together"
						},
						participant: {
							displayName: 'Becca'
						},
						messageType: 'received',
						startFrame: 1508,
						durationInFrames: 15
					},
					{
						type: 'Message',
						content: {
							type: 'Text',
							text: "I'll forgive you"
						},
						participant: {
							displayName: 'Becca'
						},
						messageType: 'received',
						startFrame: 1553,
						durationInFrames: 15
					},
					{
						type: 'Message',
						content: {
							type: 'Text',
							text: "I'll do anything"
						},
						participant: {
							displayName: 'Becca'
						},
						messageType: 'received',
						startFrame: 1583,
						durationInFrames: 15
					},
					{
						type: 'Message',
						content: {
							type: 'Text',
							text: 'Anything? 👀'
						},
						participant: {
							displayName: 'Nick'
						},
						messageType: 'sent',
						startFrame: 1620,
						durationInFrames: 15
					},
					{
						type: 'Message',
						content: {
							type: 'Text',
							text: 'Yes, anything!'
						},
						participant: {
							displayName: 'Becca'
						},
						messageType: 'received',
						startFrame: 1644,
						durationInFrames: 15
					},
					{
						type: 'Message',
						content: {
							type: 'Text',
							text: 'Cool'
						},
						participant: {
							displayName: 'Nick'
						},
						messageType: 'sent',
						startFrame: 1681,
						durationInFrames: 15
					},
					{
						type: 'Message',
						content: {
							type: 'Text',
							text: 'Then leave me alone'
						},
						participant: {
							displayName: 'Nick'
						},
						messageType: 'sent',
						startFrame: 1702,
						durationInFrames: 15
					},
					{
						type: 'Message',
						content: {
							type: 'Text',
							text: 'WHAT?!'
						},
						participant: {
							displayName: 'Becca'
						},
						messageType: 'received',
						startFrame: 1739,
						durationInFrames: 15
					},
					{
						type: 'Message',
						content: {
							type: 'Text',
							text: 'Toodles 👋'
						},
						participant: {
							displayName: 'Nick'
						},
						messageType: 'sent',
						startFrame: 1763,
						durationInFrames: 15
					},
					{
						type: 'Message',
						content: {
							type: 'Text',
							text: 'Wait!'
						},
						participant: {
							displayName: 'Becca'
						},
						messageType: 'received',
						startFrame: 1788,
						durationInFrames: 15
					},
					{
						type: 'Message',
						content: {
							type: 'Text',
							text: "I'm actually pregnant"
						},
						participant: {
							displayName: 'Becca'
						},
						messageType: 'received',
						startFrame: 1813,
						durationInFrames: 15
					},
					{
						type: 'Message',
						content: {
							type: 'Text',
							text: 'For real this time'
						},
						participant: {
							displayName: 'Becca'
						},
						messageType: 'received',
						startFrame: 1855,
						durationInFrames: 15
					},
					{
						type: 'Message',
						content: {
							type: 'Text',
							text: 'Cool'
						},
						participant: {
							displayName: 'Nick'
						},
						messageType: 'sent',
						startFrame: 1888,
						durationInFrames: 15
					},
					{
						type: 'Message',
						content: {
							type: 'Text',
							text: 'Name it Ashwagandha'
						},
						participant: {
							displayName: 'Nick'
						},
						messageType: 'sent',
						startFrame: 1909,
						durationInFrames: 15
					},
					{
						type: 'Message',
						content: {
							type: 'Text',
							text: 'BLOCKED'
						},
						participant: {
							displayName: 'Nick'
						},
						messageType: 'sent',
						startFrame: 1957,
						durationInFrames: 15
					},
					{
						type: 'Message',
						content: {
							type: 'Text',
							text: "Would you've blocked her?"
						},
						participant: {
							displayName: 'Nick'
						},
						messageType: 'sent',
						startFrame: 1980,
						durationInFrames: 15
					}
				]
			} as TChatStoryPlugin,
			{
				type: 'Track',
				id: 'voiceover-timeline',
				actions: [
					{
						type: 'Audio',
						src: 'http://localhost:4569/elevenlabs/670b236f8d69d745757a928b28a30c015f26caac1e30045fce1b9e04853c8a53.mp3',
						volume: 1,
						startFrame: 0,
						durationInFrames: 55
					},
					{
						type: 'Audio',
						src: 'http://localhost:4569/elevenlabs/58f8ebaa1718611efa054274045189ff7b76b02d927722b571280869d113d1da.mp3',
						volume: 1,
						startFrame: 29,
						durationInFrames: 57
					},
					{
						type: 'Audio',
						src: 'http://localhost:4569/elevenlabs/a2b65436cadcdeeef4787d6ef726f50228ce0d2a7f6feec054ca6084a806453c.mp3',
						volume: 1,
						startFrame: 59,
						durationInFrames: 66
					},
					{
						type: 'Audio',
						src: 'http://localhost:4569/elevenlabs/f588ab6657d5190ecdb2f31663b8f44df05cef87ea752595488548506f0bc9b2.mp3',
						volume: 1,
						startFrame: 100,
						durationInFrames: 60
					},
					{
						type: 'Audio',
						src: 'http://localhost:4569/elevenlabs/ac1c28cf5160d70b53722be2e7810a0f35ae93fe35720122388cde5408424a00.mp3',
						volume: 1,
						startFrame: 131,
						durationInFrames: 50
					},
					{
						type: 'Audio',
						src: 'http://localhost:4569/elevenlabs/2f1cb6007bc567cf2f91d09e67b90fc0473afe1f2c8a98dfe0a9c7ffb790639e.mp3',
						volume: 1,
						startFrame: 151,
						durationInFrames: 62
					},
					{
						type: 'Audio',
						src: 'http://localhost:4569/elevenlabs/61cf03491f158a8d0447494dd6f3aefd5b910b99c60e6e4ad5ab8f950eeb64ea.mp3',
						volume: 1,
						startFrame: 188,
						durationInFrames: 53
					},
					{
						type: 'Audio',
						src: 'http://localhost:4569/elevenlabs/bcfd66c4f6841518da62865487a38b440de6cb1a607815c8eaa30d84909283a8.mp3',
						volume: 1,
						startFrame: 214,
						durationInFrames: 53
					},
					{
						type: 'Audio',
						src: 'http://localhost:4569/elevenlabs/f378d9fdef074c5eeae1c6d63e2348f14961b2e0b628b16252a41142b4b08a4d.mp3',
						volume: 1,
						startFrame: 242,
						durationInFrames: 55
					},
					{
						type: 'Audio',
						src: 'http://localhost:4569/elevenlabs/dba3b7cedc8d9ed01f68146d68b0a3d3be88c2206d88cac3025803859327b3a6.mp3',
						volume: 1,
						startFrame: 271,
						durationInFrames: 58
					},
					{
						type: 'Audio',
						src: 'http://localhost:4569/elevenlabs/19936cce1c97a8c5904f43bb6d3c1dfa1ceb2e3fa1b3964a29fd846f96eeaad2.mp3',
						volume: 1,
						startFrame: 304,
						durationInFrames: 42
					},
					{
						type: 'Audio',
						src: 'http://localhost:4569/elevenlabs/76ad49416312cc78e776891b4597b00b950995f91a6f71e170bb0fee345a752f.mp3',
						volume: 1,
						startFrame: 322,
						durationInFrames: 58
					},
					{
						type: 'Audio',
						src: 'http://localhost:4569/elevenlabs/e4a01deec90cc7cdaa048b4ac376e3cd965df25af9a60e76f83353e61514e300.mp3',
						volume: 1,
						startFrame: 356,
						durationInFrames: 55
					},
					{
						type: 'Audio',
						src: 'http://localhost:4569/elevenlabs/473c05a7b067525caf18be19f95b044c633e8d34c03b200e9119d242d0d5a15e.mp3',
						volume: 1,
						startFrame: 385,
						durationInFrames: 48
					},
					{
						type: 'Audio',
						src: 'http://localhost:4569/elevenlabs/1432a43d77d72a46a01b783693f858272d486e38d677383494c34e4a39c37a10.mp3',
						volume: 1,
						startFrame: 408,
						durationInFrames: 53
					},
					{
						type: 'Audio',
						src: 'http://localhost:4569/elevenlabs/9a10034d8fb4651f19c5d22f078e85eee47f82eb1624b0e964ad5c05d1e60165.mp3',
						volume: 1,
						startFrame: 434,
						durationInFrames: 53
					},
					{
						type: 'Audio',
						src: 'http://localhost:4569/elevenlabs/6227de3aefd0395a18c6eef9e8179e8aa41c3bbf697ae7716699ad76e656f3ce.mp3',
						volume: 1,
						startFrame: 462,
						durationInFrames: 48
					},
					{
						type: 'Audio',
						src: 'http://localhost:4569/elevenlabs/043efaa34a1d385ecbf4607c2ec9da30681f800de719ef2fa266754bda912d9f.mp3',
						volume: 1,
						startFrame: 485,
						durationInFrames: 58
					},
					{
						type: 'Audio',
						src: 'http://localhost:4569/elevenlabs/de05dc35174e81e6816f0d2e65e66950dbd1a35b70c7d08654ea5af8dcdfd38e.mp3',
						volume: 1,
						startFrame: 518,
						durationInFrames: 50
					},
					{
						type: 'Audio',
						src: 'http://localhost:4569/elevenlabs/b13edda81484bafb5c950c7b43e0ec92e1cf013a17b74bb8218b0f2dd7a28a71.mp3',
						volume: 1,
						startFrame: 543,
						durationInFrames: 64
					},
					{
						type: 'Audio',
						src: 'http://localhost:4569/elevenlabs/167327ff4f0ca10104004448136bd0b47849acbf14820b049b651dc096259df9.mp3',
						volume: 1,
						startFrame: 581,
						durationInFrames: 57
					},
					{
						type: 'Audio',
						src: 'http://localhost:4569/elevenlabs/7f40c024143f3a7433be207fc93a22a0f64c3dcaf0886373d41dbd32ce1974ed.mp3',
						volume: 1,
						startFrame: 613,
						durationInFrames: 43
					},
					{
						type: 'Audio',
						src: 'http://localhost:4569/elevenlabs/19137d354bb7fa408997212ac0c5fa94c0553ce9066f9290a36364a019174edf.mp3',
						volume: 1,
						startFrame: 632,
						durationInFrames: 67
					},
					{
						type: 'Audio',
						src: 'http://localhost:4569/elevenlabs/cc3a8377c2cea7a80ad012746781574d532a9eefd48e60f1d46c0294da25e8a2.mp3',
						volume: 1,
						startFrame: 674,
						durationInFrames: 62
					},
					{
						type: 'Audio',
						src: 'http://localhost:4569/elevenlabs/aa6cad665f66fa181d826eed42592341fe4abedd1b9f983185897c088606f272.mp3',
						volume: 1,
						startFrame: 712,
						durationInFrames: 57
					},
					{
						type: 'Audio',
						src: 'http://localhost:4569/elevenlabs/1cfaa02a5cb48694d403a95eb8802380cc2f50d1699d349b5d7e9625f67f37b0.mp3',
						volume: 1,
						startFrame: 742,
						durationInFrames: 64
					},
					{
						type: 'Audio',
						src: 'http://localhost:4569/elevenlabs/e04b367e00df286a17303c316f641fe655f8d45aed4b71f9ee3140b793b12de1.mp3',
						volume: 1,
						startFrame: 781,
						durationInFrames: 62
					},
					{
						type: 'Audio',
						src: 'http://localhost:4569/elevenlabs/8f5267520ff58b1f1b912e114271fffc45166080e2baa3e501a26ad39af85b55.mp3',
						volume: 1,
						startFrame: 817,
						durationInFrames: 53
					},
					{
						type: 'Audio',
						src: 'http://localhost:4569/elevenlabs/d473f3bc67dcca4cde7811f222fd8b5eaa79e24f6776734460ed73ba001e853f.mp3',
						volume: 1,
						startFrame: 845,
						durationInFrames: 55
					},
					{
						type: 'Audio',
						src: 'http://localhost:4569/elevenlabs/270dff864ba1dfc271a1ca2203b407cebeed4468228a357e4305f319f142b685.mp3',
						volume: 1,
						startFrame: 874,
						durationInFrames: 58
					},
					{
						type: 'Audio',
						src: 'http://localhost:4569/elevenlabs/f1337ea1344cc57323e04694545d89a90d1b4a7b52c51c5680735aabe03fc0f0.mp3',
						volume: 1,
						startFrame: 908,
						durationInFrames: 55
					},
					{
						type: 'Audio',
						src: 'http://localhost:4569/elevenlabs/0a803516535e3f002c912cb62905cbc8bd37f3e6c913bec64acd214064f0f8ec.mp3',
						volume: 1,
						startFrame: 936,
						durationInFrames: 73
					},
					{
						type: 'Audio',
						src: 'http://localhost:4569/elevenlabs/08ba22a49b57a7df2684ac62a1059ec73f1ff5111ba2b488a0ef16fc76034658.mp3',
						volume: 1,
						startFrame: 984,
						durationInFrames: 40
					},
					{
						type: 'Audio',
						src: 'http://localhost:4569/elevenlabs/d492a250db4ca5289599a6644a84fc6ab07af3ab96495dd326ea9e483e38e8aa.mp3',
						volume: 1,
						startFrame: 1003,
						durationInFrames: 77
					},
					{
						type: 'Audio',
						src: 'http://localhost:4569/elevenlabs/67c83cd327b41a504b4678d94ba1438c7f355f29705683a80a36933f2d228811.mp3',
						volume: 1,
						startFrame: 1055,
						durationInFrames: 55
					},
					{
						type: 'Audio',
						src: 'http://localhost:4569/elevenlabs/b7649814ca38bb0166051836cb72f709498d59fa314b290d54765653a9053b8d.mp3',
						volume: 1,
						startFrame: 1085,
						durationInFrames: 51
					},
					{
						type: 'Audio',
						src: 'http://localhost:4569/elevenlabs/26704298687ff8afd9a5c796e1549e9ec15ef23f46d3855023cda20c14e66ad8.mp3',
						volume: 1,
						startFrame: 1111,
						durationInFrames: 77
					},
					{
						type: 'Audio',
						src: 'http://localhost:4569/elevenlabs/c85f064c94f4cecd2b48c369f6f53e24f116d22c6eec1b9caddd894f4ff18703.mp3',
						volume: 1,
						startFrame: 1163,
						durationInFrames: 62
					},
					{
						type: 'Audio',
						src: 'http://localhost:4569/elevenlabs/96cdbdfde0201b1e526658f497a69b75549148aa14fc230cdb45573eaeb7797c.mp3',
						volume: 1,
						startFrame: 1200,
						durationInFrames: 80
					},
					{
						type: 'Audio',
						src: 'http://localhost:4569/elevenlabs/25e16af8d011f319dbdabf4e6e6e137a5c8a6abbbfe8ec6adca9e4c69bdc6a82.mp3',
						volume: 1,
						startFrame: 1255,
						durationInFrames: 67
					},
					{
						type: 'Audio',
						src: 'http://localhost:4569/elevenlabs/f6f6ccf974206497b25a09ed974737b26b4a11d74dcd47241b197da424dfbadd.mp3',
						volume: 1,
						startFrame: 1296,
						durationInFrames: 57
					},
					{
						type: 'Audio',
						src: 'http://localhost:4569/elevenlabs/9bc86ff3759b49f45ef3306fc60c24271f3bd41fcd2944e15f91034c69884904.mp3',
						volume: 1,
						startFrame: 1327,
						durationInFrames: 62
					},
					{
						type: 'Audio',
						src: 'http://localhost:4569/elevenlabs/bec16cb13430a97691518ff8fdc7c310fe74506ef1767b4e03f4959363c222c8.mp3',
						volume: 1,
						startFrame: 1363,
						durationInFrames: 51
					},
					{
						type: 'Audio',
						src: 'http://localhost:4569/elevenlabs/f129fce02329770c4736d166081eafe71d5cb816f140a775f7c6ea40419611d8.mp3',
						volume: 1,
						startFrame: 1390,
						durationInFrames: 53
					},
					{
						type: 'Audio',
						src: 'http://localhost:4569/elevenlabs/b7c40a6b4879d0f37c19288ad5c16500e62b9c782274518942095f87ffe35e1d.mp3',
						volume: 1,
						startFrame: 1416,
						durationInFrames: 50
					},
					{
						type: 'Audio',
						src: 'http://localhost:4569/elevenlabs/3464ae808914f415380a928301f759179e72bb8b70a3e31a39b076f17f7dd496.mp3',
						volume: 1,
						startFrame: 1441,
						durationInFrames: 57
					},
					{
						type: 'Audio',
						src: 'http://localhost:4569/elevenlabs/f7f9896649486d7123674fbdb70fbbfecd9b7964938a1a40939c6ebae1059a4f.mp3',
						volume: 1,
						startFrame: 1472,
						durationInFrames: 62
					},
					{
						type: 'Audio',
						src: 'http://localhost:4569/elevenlabs/71127cc2eb74179201597434659f48723abba2a462e9d9533b8a95b2226be7d3.mp3',
						volume: 1,
						startFrame: 1508,
						durationInFrames: 69
					},
					{
						type: 'Audio',
						src: 'http://localhost:4569/elevenlabs/b70223b40eb760e04a577cc2753597e5602bd4099d7e06758f397d681e040d0c.mp3',
						volume: 1,
						startFrame: 1553,
						durationInFrames: 57
					},
					{
						type: 'Audio',
						src: 'http://localhost:4569/elevenlabs/7a59bc592bf3e525b8e28b23ee5d2593fbc16966bfbb89a8fa0666bc4e856781.mp3',
						volume: 1,
						startFrame: 1583,
						durationInFrames: 62
					},
					{
						type: 'Audio',
						src: 'http://localhost:4569/elevenlabs/5d2febd11e5627d86e55fa151b1ce98c0f10d6046cbb29a7da060802b3514093.mp3',
						volume: 1,
						startFrame: 1620,
						durationInFrames: 49
					},
					{
						type: 'Audio',
						src: 'http://localhost:4569/elevenlabs/e7a19d74f5966fdca80b01fa9a46bb335e4ba81a8a329a6168cb563a02e629eb.mp3',
						volume: 1,
						startFrame: 1644,
						durationInFrames: 62
					},
					{
						type: 'Audio',
						src: 'http://localhost:4569/elevenlabs/473c05a7b067525caf18be19f95b044c633e8d34c03b200e9119d242d0d5a15e.mp3',
						volume: 1,
						startFrame: 1681,
						durationInFrames: 48
					},
					{
						type: 'Audio',
						src: 'http://localhost:4569/elevenlabs/a96abb5681c4bf75f30ce40da345497edeb7c6dd37ef2c37abc1426a117e43be.mp3',
						volume: 1,
						startFrame: 1702,
						durationInFrames: 62
					},
					{
						type: 'Audio',
						src: 'http://localhost:4569/elevenlabs/6e8d2f057d2865af98744e573af9a368ff9584173d0cba1500d408c7a9e961b8.mp3',
						volume: 1,
						startFrame: 1739,
						durationInFrames: 49
					},
					{
						type: 'Audio',
						src: 'http://localhost:4569/elevenlabs/d6a01db163ff433db65c3b1d5bf17345deb588a45da665256e3f3822a0f62c40.mp3',
						volume: 1,
						startFrame: 1763,
						durationInFrames: 50
					},
					{
						type: 'Audio',
						src: 'http://localhost:4569/elevenlabs/bcc1f050533019bb74080971318bab419443e07138672c6a2f17a4096f1b90a6.mp3',
						volume: 1,
						startFrame: 1788,
						durationInFrames: 51
					},
					{
						type: 'Audio',
						src: 'http://localhost:4569/elevenlabs/a53f5b0333602eb6670ca7770438dc8a4cad372d20bb47d0baf478a1127eef08.mp3',
						volume: 1,
						startFrame: 1813,
						durationInFrames: 67
					},
					{
						type: 'Audio',
						src: 'http://localhost:4569/elevenlabs/b91a7e77f12b51f20b29c4dc4971a41137dcd8ffb8b4470e7d9aa08612867674.mp3',
						volume: 1,
						startFrame: 1855,
						durationInFrames: 58
					},
					{
						type: 'Audio',
						src: 'http://localhost:4569/elevenlabs/473c05a7b067525caf18be19f95b044c633e8d34c03b200e9119d242d0d5a15e.mp3',
						volume: 1,
						startFrame: 1888,
						durationInFrames: 48
					},
					{
						type: 'Audio',
						src: 'http://localhost:4569/elevenlabs/9345a9b38ee32a07111387b6d5e80dc05d0d8a34ea5f0b1a8c3efbac0a0c47da.mp3',
						volume: 1,
						startFrame: 1909,
						durationInFrames: 73
					},
					{
						type: 'Audio',
						src: 'http://localhost:4569/elevenlabs/ce817773686c98e0fe20b52cfc1f1addac43b0af3471af865149cb2e8426ee02.mp3',
						volume: 1,
						startFrame: 1957,
						durationInFrames: 53
					},
					{
						type: 'Audio',
						src: 'http://localhost:4569/elevenlabs/4302c115032f283fec97a59c3a0fdeaff4adabacab621206a3ef7d473eb88bdc.mp3',
						volume: 1,
						startFrame: 1980,
						durationInFrames: 69
					}
				]
			},
			{
				type: 'Track',
				id: 'notification-timeline',
				actions: [
					{
						type: 'Audio',
						src: 'static/audio/sound/ios_received.mp3',
						volume: 1,
						startFrame: 0,
						durationInFrames: 61
					},
					{
						type: 'Audio',
						src: 'static/audio/sound/ios_sent.mp3',
						volume: 1,
						startFrame: 29,
						durationInFrames: 15
					},
					{
						type: 'Audio',
						src: 'static/audio/sound/ios_received.mp3',
						volume: 1,
						startFrame: 59,
						durationInFrames: 61
					},
					{
						type: 'Audio',
						src: 'static/audio/sound/ios_sent.mp3',
						volume: 1,
						startFrame: 100,
						durationInFrames: 15
					},
					{
						type: 'Audio',
						src: 'static/audio/sound/ios_sent.mp3',
						volume: 1,
						startFrame: 131,
						durationInFrames: 15
					},
					{
						type: 'Audio',
						src: 'static/audio/sound/ios_sent.mp3',
						volume: 1,
						startFrame: 151,
						durationInFrames: 15
					},
					{
						type: 'Audio',
						src: 'static/audio/sound/ios_received.mp3',
						volume: 1,
						startFrame: 188,
						durationInFrames: 61
					},
					{
						type: 'Audio',
						src: 'static/audio/sound/ios_received.mp3',
						volume: 1,
						startFrame: 214,
						durationInFrames: 61
					},
					{
						type: 'Audio',
						src: 'static/audio/sound/ios_sent.mp3',
						volume: 1,
						startFrame: 242,
						durationInFrames: 15
					},
					{
						type: 'Audio',
						src: 'static/audio/sound/ios_sent.mp3',
						volume: 1,
						startFrame: 271,
						durationInFrames: 15
					},
					{
						type: 'Audio',
						src: 'static/audio/sound/ios_received.mp3',
						volume: 1,
						startFrame: 304,
						durationInFrames: 61
					},
					{
						type: 'Audio',
						src: 'static/audio/sound/ios_received.mp3',
						volume: 1,
						startFrame: 322,
						durationInFrames: 61
					},
					{
						type: 'Audio',
						src: 'static/audio/sound/ios_received.mp3',
						volume: 1,
						startFrame: 356,
						durationInFrames: 61
					},
					{
						type: 'Audio',
						src: 'static/audio/sound/ios_sent.mp3',
						volume: 1,
						startFrame: 385,
						durationInFrames: 15
					},
					{
						type: 'Audio',
						src: 'static/audio/sound/ios_received.mp3',
						volume: 1,
						startFrame: 408,
						durationInFrames: 61
					},
					{
						type: 'Audio',
						src: 'static/audio/sound/ios_received.mp3',
						volume: 1,
						startFrame: 434,
						durationInFrames: 61
					},
					{
						type: 'Audio',
						src: 'static/audio/sound/ios_sent.mp3',
						volume: 1,
						startFrame: 462,
						durationInFrames: 15
					},
					{
						type: 'Audio',
						src: 'static/audio/sound/ios_received.mp3',
						volume: 1,
						startFrame: 485,
						durationInFrames: 61
					},
					{
						type: 'Audio',
						src: 'static/audio/sound/ios_sent.mp3',
						volume: 1,
						startFrame: 518,
						durationInFrames: 15
					},
					{
						type: 'Audio',
						src: 'static/audio/sound/ios_received.mp3',
						volume: 1,
						startFrame: 543,
						durationInFrames: 61
					},
					{
						type: 'Audio',
						src: 'static/audio/sound/ios_received.mp3',
						volume: 1,
						startFrame: 581,
						durationInFrames: 61
					},
					{
						type: 'Audio',
						src: 'static/audio/sound/ios_sent.mp3',
						volume: 1,
						startFrame: 613,
						durationInFrames: 15
					},
					{
						type: 'Audio',
						src: 'static/audio/sound/ios_received.mp3',
						volume: 1,
						startFrame: 632,
						durationInFrames: 61
					},
					{
						type: 'Audio',
						src: 'static/audio/sound/ios_sent.mp3',
						volume: 1,
						startFrame: 674,
						durationInFrames: 15
					},
					{
						type: 'Audio',
						src: 'static/audio/sound/ios_received.mp3',
						volume: 1,
						startFrame: 712,
						durationInFrames: 61
					},
					{
						type: 'Audio',
						src: 'static/audio/sound/ios_sent.mp3',
						volume: 1,
						startFrame: 742,
						durationInFrames: 15
					},
					{
						type: 'Audio',
						src: 'static/audio/sound/ios_received.mp3',
						volume: 1,
						startFrame: 781,
						durationInFrames: 61
					},
					{
						type: 'Audio',
						src: 'static/audio/sound/ios_received.mp3',
						volume: 1,
						startFrame: 817,
						durationInFrames: 61
					},
					{
						type: 'Audio',
						src: 'static/audio/sound/ios_received.mp3',
						volume: 1,
						startFrame: 845,
						durationInFrames: 61
					},
					{
						type: 'Audio',
						src: 'static/audio/sound/ios_sent.mp3',
						volume: 1,
						startFrame: 874,
						durationInFrames: 15
					},
					{
						type: 'Audio',
						src: 'static/audio/sound/ios_received.mp3',
						volume: 1,
						startFrame: 908,
						durationInFrames: 61
					},
					{
						type: 'Audio',
						src: 'static/audio/sound/ios_received.mp3',
						volume: 1,
						startFrame: 936,
						durationInFrames: 61
					},
					{
						type: 'Audio',
						src: 'static/audio/sound/ios_sent.mp3',
						volume: 1,
						startFrame: 984,
						durationInFrames: 15
					},
					{
						type: 'Audio',
						src: 'static/audio/sound/ios_sent.mp3',
						volume: 1,
						startFrame: 1003,
						durationInFrames: 15
					},
					{
						type: 'Audio',
						src: 'static/audio/sound/ios_received.mp3',
						volume: 1,
						startFrame: 1055,
						durationInFrames: 61
					},
					{
						type: 'Audio',
						src: 'static/audio/sound/ios_sent.mp3',
						volume: 1,
						startFrame: 1085,
						durationInFrames: 15
					},
					{
						type: 'Audio',
						src: 'static/audio/sound/ios_received.mp3',
						volume: 1,
						startFrame: 1111,
						durationInFrames: 61
					},
					{
						type: 'Audio',
						src: 'static/audio/sound/ios_sent.mp3',
						volume: 1,
						startFrame: 1163,
						durationInFrames: 15
					},
					{
						type: 'Audio',
						src: 'static/audio/sound/ios_received.mp3',
						volume: 1,
						startFrame: 1200,
						durationInFrames: 61
					},
					{
						type: 'Audio',
						src: 'static/audio/sound/ios_sent.mp3',
						volume: 1,
						startFrame: 1255,
						durationInFrames: 15
					},
					{
						type: 'Audio',
						src: 'static/audio/sound/ios_sent.mp3',
						volume: 1,
						startFrame: 1296,
						durationInFrames: 15
					},
					{
						type: 'Audio',
						src: 'static/audio/sound/ios_received.mp3',
						volume: 1,
						startFrame: 1327,
						durationInFrames: 61
					},
					{
						type: 'Audio',
						src: 'static/audio/sound/ios_received.mp3',
						volume: 1,
						startFrame: 1363,
						durationInFrames: 61
					},
					{
						type: 'Audio',
						src: 'static/audio/sound/ios_sent.mp3',
						volume: 1,
						startFrame: 1390,
						durationInFrames: 15
					},
					{
						type: 'Audio',
						src: 'static/audio/sound/ios_sent.mp3',
						volume: 1,
						startFrame: 1416,
						durationInFrames: 15
					},
					{
						type: 'Audio',
						src: 'static/audio/sound/ios_received.mp3',
						volume: 1,
						startFrame: 1441,
						durationInFrames: 61
					},
					{
						type: 'Audio',
						src: 'static/audio/sound/ios_received.mp3',
						volume: 1,
						startFrame: 1472,
						durationInFrames: 61
					},
					{
						type: 'Audio',
						src: 'static/audio/sound/ios_received.mp3',
						volume: 1,
						startFrame: 1508,
						durationInFrames: 61
					},
					{
						type: 'Audio',
						src: 'static/audio/sound/ios_received.mp3',
						volume: 1,
						startFrame: 1553,
						durationInFrames: 61
					},
					{
						type: 'Audio',
						src: 'static/audio/sound/ios_received.mp3',
						volume: 1,
						startFrame: 1583,
						durationInFrames: 61
					},
					{
						type: 'Audio',
						src: 'static/audio/sound/ios_sent.mp3',
						volume: 1,
						startFrame: 1620,
						durationInFrames: 15
					},
					{
						type: 'Audio',
						src: 'static/audio/sound/ios_received.mp3',
						volume: 1,
						startFrame: 1644,
						durationInFrames: 61
					},
					{
						type: 'Audio',
						src: 'static/audio/sound/ios_sent.mp3',
						volume: 1,
						startFrame: 1681,
						durationInFrames: 15
					},
					{
						type: 'Audio',
						src: 'static/audio/sound/ios_sent.mp3',
						volume: 1,
						startFrame: 1702,
						durationInFrames: 15
					},
					{
						type: 'Audio',
						src: 'static/audio/sound/ios_received.mp3',
						volume: 1,
						startFrame: 1739,
						durationInFrames: 61
					},
					{
						type: 'Audio',
						src: 'static/audio/sound/ios_sent.mp3',
						volume: 1,
						startFrame: 1763,
						durationInFrames: 15
					},
					{
						type: 'Audio',
						src: 'static/audio/sound/ios_received.mp3',
						volume: 1,
						startFrame: 1788,
						durationInFrames: 61
					},
					{
						type: 'Audio',
						src: 'static/audio/sound/ios_received.mp3',
						volume: 1,
						startFrame: 1813,
						durationInFrames: 61
					},
					{
						type: 'Audio',
						src: 'static/audio/sound/ios_received.mp3',
						volume: 1,
						startFrame: 1855,
						durationInFrames: 61
					},
					{
						type: 'Audio',
						src: 'static/audio/sound/ios_sent.mp3',
						volume: 1,
						startFrame: 1888,
						durationInFrames: 15
					},
					{
						type: 'Audio',
						src: 'static/audio/sound/ios_sent.mp3',
						volume: 1,
						startFrame: 1909,
						durationInFrames: 15
					},
					{
						type: 'Audio',
						src: 'static/audio/sound/ios_sent.mp3',
						volume: 1,
						startFrame: 1957,
						durationInFrames: 15
					},
					{
						type: 'Audio',
						src: 'static/audio/sound/ios_sent.mp3',
						volume: 1,
						startFrame: 1980,
						durationInFrames: 15
					}
				]
			},
			{
				type: 'Track',
				id: 'cta-timeline',
				actions: [
					{
						type: 'Plugin',
						pluginId: 'tiktok-like',
						props: {
							text: 'Feeling it? 👍'
						},
						durationInFrames: 120,
						width: 1080,
						height: 500,
						x: 0,
						y: 1000,
						startFrame: 392
					},
					{
						type: 'Plugin',
						pluginId: 'tiktok-follow',
						props: {
							media: {
								type: 'Image',
								src: 'static/image/chatsnap.png'
							},
							text: 'Don’t miss out! 👀'
						},
						durationInFrames: 120,
						width: 1080,
						height: 500,
						x: 0,
						y: 1000,
						startFrame: 905
					},
					{
						type: 'Plugin',
						pluginId: 'tiktok-like',
						props: {
							text: 'Tap for feels! 😲'
						},
						durationInFrames: 120,
						width: 1080,
						height: 500,
						x: 0,
						y: 1000,
						startFrame: 1417
					},
					{
						type: 'Plugin',
						pluginId: 'tiktok-follow',
						props: {
							media: {
								type: 'Image',
								src: 'static/image/chatsnap.png'
							},
							text: 'More? Follow! 🎯'
						},
						durationInFrames: 120,
						width: 1080,
						height: 500,
						x: 0,
						y: 1000,
						startFrame: 1929
					}
				]
			}
		]
	},
	durationInFrames: 2049,
	fps: 30,
	width: 1080,
	height: 1920
};
