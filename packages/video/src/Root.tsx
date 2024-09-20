import { Composition } from 'remotion';

import { ChatHistoryComp } from './compositions';

import './style.css';

export const Root: React.FC = () => {
	return (
		<>
			<Composition
				id={ChatHistoryComp.id}
				component={ChatHistoryComp}
				calculateMetadata={ChatHistoryComp.calculateMetadata}
				width={1080}
				height={1920}
				schema={ChatHistoryComp.schema}
				defaultProps={JSON.parse(`{
    "title": "When Your Roommate 'Borrows' Your Stuff...",
    "sequence": [
      {
        "type": "Audio",
        "src": "static/message.mp3",
        "startFrame": 0,
        "durationInFrames": 30
      },
      {
        "type": "Audio",
        "src": "http://localhost:4569/elevenlabs/8adf26d3bc9a29c44e0c9d6f8f4bb465e95976082524a205324375ccec7d18ed.mp3",
        "startFrame": 0,
        "durationInFrames": 90
      },
      {
        "type": "Message",
        "content": "Dude",
        "sender": "Alex",
        "messageType": "received",
        "startFrame": 0
      },
      {
        "type": "Audio",
        "src": "static/message.mp3",
        "startFrame": 24,
        "durationInFrames": 30
      },
      {
        "type": "Audio",
        "src": "http://localhost:4569/elevenlabs/a04c797c5dc96b092be72e257257037b90ed903fd048ed1828cf16e606224197.mp3",
        "startFrame": 24,
        "durationInFrames": 90
      },
      {
        "type": "Message",
        "content": "Where's my charger?",
        "sender": "Alex",
        "messageType": "received",
        "startFrame": 24
      },
      {
        "type": "Audio",
        "src": "static/send.mp3",
        "startFrame": 54,
        "durationInFrames": 30
      },
      {
        "type": "Audio",
        "src": "http://localhost:4569/elevenlabs/a981d9c45dde388369fa350f08f0df9be398491d6c4831f08fec5d0463b25dda.mp3",
        "startFrame": 54,
        "durationInFrames": 90
      },
      {
        "type": "Message",
        "content": "What charger?",
        "sender": "Sam",
        "messageType": "sent",
        "startFrame": 54
      },
      {
        "type": "Audio",
        "src": "static/message.mp3",
        "startFrame": 80,
        "durationInFrames": 30
      },
      {
        "type": "Audio",
        "src": "http://localhost:4569/elevenlabs/85b3c042f878601c5747a7b5a2286d58b300f25cd8802369d291807657e6f0a9.mp3",
        "startFrame": 80,
        "durationInFrames": 90
      },
      {
        "type": "Message",
        "content": "My phone charger",
        "sender": "Alex",
        "messageType": "received",
        "startFrame": 80
      },
      {
        "type": "Audio",
        "src": "static/message.mp3",
        "startFrame": 102,
        "durationInFrames": 30
      },
      {
        "type": "Audio",
        "src": "http://localhost:4569/elevenlabs/b0e6d0c9c6876e530d019f4f0932fceb8e048c2c6de1521e7712dae9fd07be68.mp3",
        "startFrame": 102,
        "durationInFrames": 90
      },
      {
        "type": "Message",
        "content": "It's gone",
        "sender": "Alex",
        "messageType": "received",
        "startFrame": 102
      },
      {
        "type": "Audio",
        "src": "static/send.mp3",
        "startFrame": 132,
        "durationInFrames": 30
      },
      {
        "type": "Audio",
        "src": "http://localhost:4569/elevenlabs/6811e2804af97877116abf079d5b77f3212a4863d80f3840b8de7bc91992e502.mp3",
        "startFrame": 132,
        "durationInFrames": 90
      },
      {
        "type": "Message",
        "content": "Oh",
        "sender": "Sam",
        "messageType": "sent",
        "startFrame": 132
      },
      {
        "type": "Audio",
        "src": "static/send.mp3",
        "startFrame": 156,
        "durationInFrames": 30
      },
      {
        "type": "Audio",
        "src": "http://localhost:4569/elevenlabs/e4ead32b849704a10c37a78f7fed55acd850c42ecf47c4739a48b7eb38a26923.mp3",
        "startFrame": 156,
        "durationInFrames": 90
      },
      {
        "type": "Message",
        "content": "That",
        "sender": "Sam",
        "messageType": "sent",
        "startFrame": 156
      },
      {
        "type": "Audio",
        "src": "static/message.mp3",
        "startFrame": 183,
        "durationInFrames": 30
      },
      {
        "type": "Audio",
        "src": "http://localhost:4569/elevenlabs/72317bf8d8ae5fd6d9cd248087fd5450e3ff5c5cb8c9a96a5369ef205461e0af.mp3",
        "startFrame": 183,
        "durationInFrames": 90
      },
      {
        "type": "Message",
        "content": "Did you take it?",
        "sender": "Alex",
        "messageType": "received",
        "startFrame": 183
      },
      {
        "type": "Audio",
        "src": "static/send.mp3",
        "startFrame": 216,
        "durationInFrames": 30
      },
      {
        "type": "Audio",
        "src": "http://localhost:4569/elevenlabs/5d937bf7b74506d639b2514b5a36d76e31c61c5e31a3f3d138fea57c1fe22b70.mp3",
        "startFrame": 216,
        "durationInFrames": 90
      },
      {
        "type": "Message",
        "content": "...maybe",
        "sender": "Sam",
        "messageType": "sent",
        "startFrame": 216
      },
      {
        "type": "Audio",
        "src": "static/message.mp3",
        "startFrame": 245,
        "durationInFrames": 30
      },
      {
        "type": "Audio",
        "src": "http://localhost:4569/elevenlabs/a2be3be282d5cfad85fffa1712abded48333b666709430e95859a007b38216de.mp3",
        "startFrame": 245,
        "durationInFrames": 90
      },
      {
        "type": "Message",
        "content": "Dude!",
        "sender": "Alex",
        "messageType": "received",
        "startFrame": 245
      },
      {
        "type": "Audio",
        "src": "static/message.mp3",
        "startFrame": 270,
        "durationInFrames": 30
      },
      {
        "type": "Audio",
        "src": "http://localhost:4569/elevenlabs/2e723edb33327d25eb99f2284f20f1dcbf8dd33b82646da7c4ca1adc05cabc16.mp3",
        "startFrame": 270,
        "durationInFrames": 90
      },
      {
        "type": "Message",
        "content": "Not cool",
        "sender": "Alex",
        "messageType": "received",
        "startFrame": 270
      },
      {
        "type": "Audio",
        "src": "static/send.mp3",
        "startFrame": 297,
        "durationInFrames": 30
      },
      {
        "type": "Audio",
        "src": "http://localhost:4569/elevenlabs/e08604bac529d6607af0c316405fb3c9651f58311b93260730b3e8a4e8746182.mp3",
        "startFrame": 297,
        "durationInFrames": 90
      },
      {
        "type": "Message",
        "content": "Sorry!",
        "sender": "Sam",
        "messageType": "sent",
        "startFrame": 297
      },
      {
        "type": "Audio",
        "src": "static/send.mp3",
        "startFrame": 318,
        "durationInFrames": 30
      },
      {
        "type": "Audio",
        "src": "http://localhost:4569/elevenlabs/511f262e9f9bcd3de05d4174f12e4f70cbd7d1ac77f4513f048c3dd899e6d703.mp3",
        "startFrame": 318,
        "durationInFrames": 90
      },
      {
        "type": "Message",
        "content": "Emergency",
        "sender": "Sam",
        "messageType": "sent",
        "startFrame": 318
      },
      {
        "type": "Audio",
        "src": "static/message.mp3",
        "startFrame": 348,
        "durationInFrames": 30
      },
      {
        "type": "Audio",
        "src": "http://localhost:4569/elevenlabs/096a747367d21a9d367d67f294b12c4b4af77d4754889ac7691a2412318184a5.mp3",
        "startFrame": 348,
        "durationInFrames": 90
      },
      {
        "type": "Message",
        "content": "What emergency?",
        "sender": "Alex",
        "messageType": "received",
        "startFrame": 348
      },
      {
        "type": "Audio",
        "src": "static/send.mp3",
        "startFrame": 381,
        "durationInFrames": 30
      },
      {
        "type": "Audio",
        "src": "http://localhost:4569/elevenlabs/47bffc2e13b2fa5b9bce53d6627b2eecd236dbae62fdc11eb02c367ed816c2e0.mp3",
        "startFrame": 381,
        "durationInFrames": 90
      },
      {
        "type": "Message",
        "content": "Tinder date",
        "sender": "Sam",
        "messageType": "sent",
        "startFrame": 381
      },
      {
        "type": "Audio",
        "src": "static/send.mp3",
        "startFrame": 405,
        "durationInFrames": 30
      },
      {
        "type": "Audio",
        "src": "http://localhost:4569/elevenlabs/c5b739ce355318d0287432e8a9fb4f0d6a499be14c0b823620c8961bed63e511.mp3",
        "startFrame": 405,
        "durationInFrames": 90
      },
      {
        "type": "Message",
        "content": "No battery",
        "sender": "Sam",
        "messageType": "sent",
        "startFrame": 405
      },
      {
        "type": "Audio",
        "src": "static/send.mp3",
        "startFrame": 426,
        "durationInFrames": 30
      },
      {
        "type": "Audio",
        "src": "http://localhost:4569/elevenlabs/bda06323e34a64bc29b9198039b998eb3acf0eb798cedcc18139dd7ee08378cd.mp3",
        "startFrame": 426,
        "durationInFrames": 90
      },
      {
        "type": "Message",
        "content": "Panic",
        "sender": "Sam",
        "messageType": "sent",
        "startFrame": 426
      },
      {
        "type": "Audio",
        "src": "static/message.mp3",
        "startFrame": 456,
        "durationInFrames": 30
      },
      {
        "type": "Audio",
        "src": "http://localhost:4569/elevenlabs/d3a306af73922a766e6085f495dc1489ce1e00bae1e696189ca0447bf453b0c2.mp3",
        "startFrame": 456,
        "durationInFrames": 90
      },
      {
        "type": "Message",
        "content": "...",
        "sender": "Alex",
        "messageType": "received",
        "startFrame": 456
      },
      {
        "type": "Audio",
        "src": "static/message.mp3",
        "startFrame": 482,
        "durationInFrames": 30
      },
      {
        "type": "Audio",
        "src": "http://localhost:4569/elevenlabs/aa7d06f2d2d022780c1bf8a4d3eb4c0320446788390709b7d2f409c23470429e.mp3",
        "startFrame": 482,
        "durationInFrames": 90
      },
      {
        "type": "Message",
        "content": "Where is it now?",
        "sender": "Alex",
        "messageType": "received",
        "startFrame": 482
      },
      {
        "type": "Audio",
        "src": "static/send.mp3",
        "startFrame": 516,
        "durationInFrames": 30
      },
      {
        "type": "Audio",
        "src": "http://localhost:4569/elevenlabs/d44bd5a7ef356c506c0be907e017804f13181229d3ced7c652576787a48351fa.mp3",
        "startFrame": 516,
        "durationInFrames": 90
      },
      {
        "type": "Message",
        "content": "Um",
        "sender": "Sam",
        "messageType": "sent",
        "startFrame": 516
      },
      {
        "type": "Audio",
        "src": "static/send.mp3",
        "startFrame": 540,
        "durationInFrames": 30
      },
      {
        "type": "Audio",
        "src": "http://localhost:4569/elevenlabs/50ddd5169fb9f862bc23c0975d7a1bb3167b8b0c9e50d7cdba8e0a8c893cd476.mp3",
        "startFrame": 540,
        "durationInFrames": 90
      },
      {
        "type": "Message",
        "content": "At Starbucks?",
        "sender": "Sam",
        "messageType": "sent",
        "startFrame": 540
      },
      {
        "type": "Audio",
        "src": "static/message.mp3",
        "startFrame": 570,
        "durationInFrames": 30
      },
      {
        "type": "Audio",
        "src": "http://localhost:4569/elevenlabs/8c86720412cb35874c63cde108823a7b0c6befa7201a2f894fa9fb8afce4df08.mp3",
        "startFrame": 570,
        "durationInFrames": 90
      },
      {
        "type": "Message",
        "content": "WHAT",
        "sender": "Alex",
        "messageType": "received",
        "startFrame": 570
      },
      {
        "type": "Audio",
        "src": "static/message.mp3",
        "startFrame": 594,
        "durationInFrames": 30
      },
      {
        "type": "Audio",
        "src": "http://localhost:4569/elevenlabs/8e3e4bf1aefadd4493f9d24eaf8640ab4aa47ed0ce2f5a1063503dbedaafd1a7.mp3",
        "startFrame": 594,
        "durationInFrames": 90
      },
      {
        "type": "Message",
        "content": "How???",
        "sender": "Alex",
        "messageType": "received",
        "startFrame": 594
      },
      {
        "type": "Audio",
        "src": "static/send.mp3",
        "startFrame": 627,
        "durationInFrames": 30
      },
      {
        "type": "Audio",
        "src": "http://localhost:4569/elevenlabs/c78ddf3131092cc04ffdfc99964c29d2f597639f92398b59fa914a1635fc0712.mp3",
        "startFrame": 627,
        "durationInFrames": 90
      },
      {
        "type": "Message",
        "content": "Forgot to unplug",
        "sender": "Sam",
        "messageType": "sent",
        "startFrame": 627
      },
      {
        "type": "Audio",
        "src": "static/send.mp3",
        "startFrame": 651,
        "durationInFrames": 30
      },
      {
        "type": "Audio",
        "src": "http://localhost:4569/elevenlabs/ef60b1c88e8406e07f523607ea46c616a6aeb9158fc59d34e5903f71169e4647.mp3",
        "startFrame": 651,
        "durationInFrames": 90
      },
      {
        "type": "Message",
        "content": "Date was hot",
        "sender": "Sam",
        "messageType": "sent",
        "startFrame": 651
      },
      {
        "type": "Audio",
        "src": "static/send.mp3",
        "startFrame": 672,
        "durationInFrames": 30
      },
      {
        "type": "Audio",
        "src": "http://localhost:4569/elevenlabs/4b9fabc62db26d08e87c84b514dfb80dedc7052ae8a5acb2db4094c156f865cd.mp3",
        "startFrame": 672,
        "durationInFrames": 90
      },
      {
        "type": "Message",
        "content": "Brain malfunction",
        "sender": "Sam",
        "messageType": "sent",
        "startFrame": 672
      },
      {
        "type": "Audio",
        "src": "static/message.mp3",
        "startFrame": 702,
        "durationInFrames": 30
      },
      {
        "type": "Audio",
        "src": "http://localhost:4569/elevenlabs/13e394c8aaedba1a5d018b733d15d9ec13996ab9732f4b814fee60d9683554fb.mp3",
        "startFrame": 702,
        "durationInFrames": 90
      },
      {
        "type": "Message",
        "content": "Bro",
        "sender": "Alex",
        "messageType": "received",
        "startFrame": 702
      },
      {
        "type": "Audio",
        "src": "static/message.mp3",
        "startFrame": 726,
        "durationInFrames": 30
      },
      {
        "type": "Audio",
        "src": "http://localhost:4569/elevenlabs/5d9c2700987cd692c3e51afe648af539df4331e76953a26cb396345c15427a16.mp3",
        "startFrame": 726,
        "durationInFrames": 90
      },
      {
        "type": "Message",
        "content": "I'm dead",
        "sender": "Alex",
        "messageType": "received",
        "startFrame": 726
      },
      {
        "type": "Audio",
        "src": "static/message.mp3",
        "startFrame": 747,
        "durationInFrames": 30
      },
      {
        "type": "Audio",
        "src": "http://localhost:4569/elevenlabs/73fc7aed7dcb9214a8be9824bde17ff25a82fb6a76d37a9546dc31b7a0c1ab69.mp3",
        "startFrame": 747,
        "durationInFrames": 90
      },
      {
        "type": "Message",
        "content": "1% left",
        "sender": "Alex",
        "messageType": "received",
        "startFrame": 747
      },
      {
        "type": "Audio",
        "src": "static/send.mp3",
        "startFrame": 777,
        "durationInFrames": 30
      },
      {
        "type": "Audio",
        "src": "http://localhost:4569/elevenlabs/54fce7ad72597b43fa949759e98200e3860ad6aff583dea2f75a2f33d6dde794.mp3",
        "startFrame": 777,
        "durationInFrames": 90
      },
      {
        "type": "Message",
        "content": "I got you",
        "sender": "Sam",
        "messageType": "sent",
        "startFrame": 777
      },
      {
        "type": "Audio",
        "src": "static/send.mp3",
        "startFrame": 801,
        "durationInFrames": 30
      },
      {
        "type": "Audio",
        "src": "http://localhost:4569/elevenlabs/9d577b8ff2e26055e9fd6475a6ea33445f06211420eb6c2a542e6f187c397335.mp3",
        "startFrame": 801,
        "durationInFrames": 90
      },
      {
        "type": "Message",
        "content": "Use mine",
        "sender": "Sam",
        "messageType": "sent",
        "startFrame": 801
      },
      {
        "type": "Audio",
        "src": "static/message.mp3",
        "startFrame": 834,
        "durationInFrames": 30
      },
      {
        "type": "Audio",
        "src": "http://localhost:4569/elevenlabs/d3a306af73922a766e6085f495dc1489ce1e00bae1e696189ca0447bf453b0c2.mp3",
        "startFrame": 834,
        "durationInFrames": 90
      },
      {
        "type": "Message",
        "content": "...",
        "sender": "Alex",
        "messageType": "received",
        "startFrame": 834
      },
      {
        "type": "Audio",
        "src": "static/message.mp3",
        "startFrame": 861,
        "durationInFrames": 30
      },
      {
        "type": "Audio",
        "src": "http://localhost:4569/elevenlabs/a34d126f8adfc58ae0a3575e9f6ff547d88f9938332234f009a55f2ce101b4f4.mp3",
        "startFrame": 861,
        "durationInFrames": 90
      },
      {
        "type": "Message",
        "content": "You have an iPhone",
        "sender": "Alex",
        "messageType": "received",
        "startFrame": 861
      },
      {
        "type": "Audio",
        "src": "static/send.mp3",
        "startFrame": 891,
        "durationInFrames": 30
      },
      {
        "type": "Audio",
        "src": "http://localhost:4569/elevenlabs/6811e2804af97877116abf079d5b77f3212a4863d80f3840b8de7bc91992e502.mp3",
        "startFrame": 891,
        "durationInFrames": 90
      },
      {
        "type": "Message",
        "content": "Oh",
        "sender": "Sam",
        "messageType": "sent",
        "startFrame": 891
      },
      {
        "type": "Audio",
        "src": "static/send.mp3",
        "startFrame": 915,
        "durationInFrames": 30
      },
      {
        "type": "Audio",
        "src": "http://localhost:4569/elevenlabs/38af40451aabd65e3b558b8b6e9c0e1282b8b0c801019cbfddf3371a82ab10c0.mp3",
        "startFrame": 915,
        "durationInFrames": 90
      },
      {
        "type": "Message",
        "content": "Right",
        "sender": "Sam",
        "messageType": "sent",
        "startFrame": 915
      },
      {
        "type": "Audio",
        "src": "static/send.mp3",
        "startFrame": 936,
        "durationInFrames": 30
      },
      {
        "type": "Audio",
        "src": "http://localhost:4569/elevenlabs/4e11660df45c54c3126e2d5a6b1039e035b8ad8fab9651cf676406dc2e5f4c08.mp3",
        "startFrame": 936,
        "durationInFrames": 90
      },
      {
        "type": "Message",
        "content": "Android probs",
        "sender": "Sam",
        "messageType": "sent",
        "startFrame": 936
      },
      {
        "type": "Audio",
        "src": "static/message.mp3",
        "startFrame": 966,
        "durationInFrames": 30
      },
      {
        "type": "Audio",
        "src": "http://localhost:4569/elevenlabs/65b41731b112a9e87a30b5b3681de88149810b66e538dee3d8b809113ea94b7c.mp3",
        "startFrame": 966,
        "durationInFrames": 90
      },
      {
        "type": "Message",
        "content": "I'm moving out",
        "sender": "Alex",
        "messageType": "received",
        "startFrame": 966
      },
      {
        "type": "Audio",
        "src": "static/send.mp3",
        "startFrame": 999,
        "durationInFrames": 30
      },
      {
        "type": "Audio",
        "src": "http://localhost:4569/elevenlabs/142726c7de480c89a7a0f5653a8645e04df620106ecb5915189ef8c9c6d2b625.mp3",
        "startFrame": 999,
        "durationInFrames": 90
      },
      {
        "type": "Message",
        "content": "Wait!",
        "sender": "Sam",
        "messageType": "sent",
        "startFrame": 999
      },
      {
        "type": "Audio",
        "src": "static/send.mp3",
        "startFrame": 1023,
        "durationInFrames": 30
      },
      {
        "type": "Audio",
        "src": "http://localhost:4569/elevenlabs/bad6c6f5ef8f8ef16de12dc03b749b9911ff897c6441ae2b9e7e10c4ac2c64a0.mp3",
        "startFrame": 1023,
        "durationInFrames": 90
      },
      {
        "type": "Message",
        "content": "I'll buy you dinner",
        "sender": "Sam",
        "messageType": "sent",
        "startFrame": 1023
      },
      {
        "type": "Audio",
        "src": "static/message.mp3",
        "startFrame": 1053,
        "durationInFrames": 30
      },
      {
        "type": "Audio",
        "src": "http://localhost:4569/elevenlabs/4d783eef84acf004c98076eb37092832a38d8a5b6cd3ae6c2f8d47fc1ef19b14.mp3",
        "startFrame": 1053,
        "durationInFrames": 90
      },
      {
        "type": "Message",
        "content": "And?",
        "sender": "Alex",
        "messageType": "received",
        "startFrame": 1053
      },
      {
        "type": "Audio",
        "src": "static/send.mp3",
        "startFrame": 1080,
        "durationInFrames": 30
      },
      {
        "type": "Audio",
        "src": "http://localhost:4569/elevenlabs/42d618b40b6e6aff8617d942acbe089f59ef1337268d295815d4d9e9f9d5b9a1.mp3",
        "startFrame": 1080,
        "durationInFrames": 90
      },
      {
        "type": "Message",
        "content": "New charger",
        "sender": "Sam",
        "messageType": "sent",
        "startFrame": 1080
      },
      {
        "type": "Audio",
        "src": "static/send.mp3",
        "startFrame": 1104,
        "durationInFrames": 30
      },
      {
        "type": "Audio",
        "src": "http://localhost:4569/elevenlabs/c41e213c40381deb3ea231d89db006a69edac400100c0690065579caa0939af5.mp3",
        "startFrame": 1104,
        "durationInFrames": 90
      },
      {
        "type": "Message",
        "content": "Apple one",
        "sender": "Sam",
        "messageType": "sent",
        "startFrame": 1104
      },
      {
        "type": "Audio",
        "src": "static/message.mp3",
        "startFrame": 1134,
        "durationInFrames": 30
      },
      {
        "type": "Audio",
        "src": "http://localhost:4569/elevenlabs/d3a306af73922a766e6085f495dc1489ce1e00bae1e696189ca0447bf453b0c2.mp3",
        "startFrame": 1134,
        "durationInFrames": 90
      },
      {
        "type": "Message",
        "content": "...",
        "sender": "Alex",
        "messageType": "received",
        "startFrame": 1134
      },
      {
        "type": "Audio",
        "src": "static/message.mp3",
        "startFrame": 1160,
        "durationInFrames": 30
      },
      {
        "type": "Audio",
        "src": "http://localhost:4569/elevenlabs/2fee47b7daa48aa54df43ca6f3e17b6fcec450854f58b242411cf04900ba42f3.mp3",
        "startFrame": 1160,
        "durationInFrames": 90
      },
      {
        "type": "Message",
        "content": "Deal",
        "sender": "Alex",
        "messageType": "received",
        "startFrame": 1160
      },
      {
        "type": "Audio",
        "src": "static/message.mp3",
        "startFrame": 1184,
        "durationInFrames": 30
      },
      {
        "type": "Audio",
        "src": "http://localhost:4569/elevenlabs/76ed3bc95af452f33618cef4d30c93ce114c0d5fca44577775f64964fdf4ba48.mp3",
        "startFrame": 1184,
        "durationInFrames": 90
      },
      {
        "type": "Message",
        "content": "But I'm keeping both",
        "sender": "Alex",
        "messageType": "received",
        "startFrame": 1184
      }
    ]
  }`)}
			/>
		</>
	);
};
