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
				fps={30} // Set by calculateMetadata
				durationInFrames={0} // Set by calculateMetadata
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
      "messageType": "received",
      "participant": {
        "displayName": "Alex"
      },
      "content": {
        "type": "Text",
        "text": "Dude"
      },
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
      "messageType": "received",
      "participant": {
        "displayName": "Alex"
      },
      "content": {
        "type": "Text",
        "text": "Where's my charger?"
      },
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
      "messageType": "sent",
      "participant": {
        "displayName": "Sam"
      },
      "content": {
        "type": "Text",
        "text": "What charger?"
      },
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
      "messageType": "received",
      "participant": {
        "displayName": "Alex"
      },
      "content": {
        "type": "Text",
        "text": "My phone charger"
      },
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
      "messageType": "received",
      "participant": {
        "displayName": "Alex"
      },
      "content": {
        "type": "Text",
        "text": "It's gone"
      },
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
      "messageType": "sent",
      "participant": {
        "displayName": "Sam"
      },
      "content": {
        "type": "Text",
        "text": "Oh"
      },
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
      "messageType": "sent",
      "participant": {
        "displayName": "Sam"
      },
      "content": {
        "type": "Text",
        "text": "That"
      },
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
      "messageType": "received",
      "participant": {
        "displayName": "Alex"
      },
      "content": {
        "type": "Text",
        "text": "Did you take it?"
      },
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
      "messageType": "sent",
      "participant": {
        "displayName": "Sam"
      },
      "content": {
        "type": "Text",
        "text": "...maybe"
      },
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
      "messageType": "received",
      "participant": {
        "displayName": "Alex"
      },
      "content": {
        "type": "Text",
        "text": "Dude!"
      },
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
      "messageType": "received",
      "participant": {
        "displayName": "Alex"
      },
      "content": {
        "type": "Text",
        "text": "Not cool"
      },
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
      "messageType": "sent",
      "participant": {
        "displayName": "Sam"
      },
      "content": {
        "type": "Text",
        "text": "Sorry!"
      },
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
      "messageType": "sent",
      "participant": {
        "displayName": "Sam"
      },
      "content": {
        "type": "Text",
        "text": "Emergency"
      },
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
      "messageType": "received",
      "participant": {
        "displayName": "Alex"
      },
      "content": {
        "type": "Text",
        "text": "What emergency?"
      },
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
      "messageType": "sent",
      "participant": {
        "displayName": "Sam"
      },
      "content": {
        "type": "Text",
        "text": "Tinder date"
      },
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
      "messageType": "sent",
      "participant": {
        "displayName": "Sam"
      },
      "content": {
        "type": "Text",
        "text": "No battery"
      },
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
      "messageType": "sent",
      "participant": {
        "displayName": "Sam"
      },
      "content": {
        "type": "Text",
        "text": "Panic"
      },
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
      "messageType": "received",
      "participant": {
        "displayName": "Alex"
      },
      "content": {
        "type": "Text",
        "text": "..."
      },
      "startFrame": 456
    }
  ]
        }`)}
			/>
		</>
	);
};
