import path from 'node:path';
import { renderMedia, selectComposition } from '@remotion/renderer';

import { s3Client } from '../../environment';
import { router } from '../router';

const compositionId = 'iMessage';
const inputProps = JSON.parse(`{
    "title": "The Great Toothbrush Fiasco",
    "script": [
        { "type": "Message", "speaker": "Zoe", "message": "Dude" },
        { "type": "Pause", "duration_ms": 300 },
        { "type": "Message", "speaker": "Zoe", "message": "We need to talk" },
        { "type": "Pause", "duration_ms": 400 },
        { "type": "Message", "speaker": "Jake", "message": "?" },
        { "type": "Pause", "duration_ms": 200 },
        { "type": "Message", "speaker": "Zoe", "message": "The bathroom" },
        { "type": "Pause", "duration_ms": 300 },
        { "type": "Message", "speaker": "Jake", "message": "What about it?" },
        { "type": "Pause", "duration_ms": 400 },
        { "type": "Message", "speaker": "Zoe", "message": "Your toothbrush" },
        { "type": "Pause", "duration_ms": 300 },
        { "type": "Message", "speaker": "Jake", "message": "Yeah?" },
        { "type": "Pause", "duration_ms": 250 },
        { "type": "Message", "speaker": "Zoe", "message": "It's... green" },
        { "type": "Pause", "duration_ms": 400 },
        { "type": "Message", "speaker": "Jake", "message": "And?" },
        { "type": "Pause", "duration_ms": 300 },
        { "type": "Message", "speaker": "Zoe", "message": "That's MY toothbrush" },
        { "type": "Pause", "duration_ms": 500 },
        { "type": "Message", "speaker": "Jake", "message": "No way" },
        { "type": "Pause", "duration_ms": 200 },
        { "type": "Message", "speaker": "Jake", "message": "Mine's green" },
        { "type": "Pause", "duration_ms": 400 },
        { "type": "Message", "speaker": "Zoe", "message": "..." },
        { "type": "Pause", "duration_ms": 300 },
        { "type": "Message", "speaker": "Zoe", "message": "Jake" },
        { "type": "Pause", "duration_ms": 200 },
        { "type": "Message", "speaker": "Zoe", "message": "We BOTH have green" },
        { "type": "Pause", "duration_ms": 500 },
        { "type": "Message", "speaker": "Jake", "message": "Oh" },
        { "type": "Pause", "duration_ms": 300 },
        { "type": "Message", "speaker": "Jake", "message": "OH NO" },
        { "type": "Pause", "duration_ms": 400 },
        { "type": "Message", "speaker": "Zoe", "message": "How long?" },
        { "type": "Pause", "duration_ms": 300 },
        { "type": "Message", "speaker": "Jake", "message": "..." },
        { "type": "Pause", "duration_ms": 200 },
        { "type": "Message", "speaker": "Jake", "message": "3 months?" },
        { "type": "Pause", "duration_ms": 500 },
        { "type": "Message", "speaker": "Zoe", "message": "WHAT" },
        { "type": "Pause", "duration_ms": 300 },
        { "type": "Message", "speaker": "Zoe", "message": "I'm gonna 🤮" },
        { "type": "Pause", "duration_ms": 400 },
        { "type": "Message", "speaker": "Jake", "message": "Same" },
        { "type": "Pause", "duration_ms": 300 },
        { "type": "Message", "speaker": "Jake", "message": "Wait" },
        { "type": "Pause", "duration_ms": 200 },
        { "type": "Message", "speaker": "Jake", "message": "Which one's mine?" },
        { "type": "Pause", "duration_ms": 400 },
        { "type": "Message", "speaker": "Zoe", "message": "..." },
        { "type": "Pause", "duration_ms": 300 },
        { "type": "Message", "speaker": "Zoe", "message": "Let's burn them" },
        { "type": "Pause", "duration_ms": 400 },
        { "type": "Message", "speaker": "Jake", "message": "And the bathroom?" },
        { "type": "Pause", "duration_ms": 300 },
        { "type": "Message", "speaker": "Zoe", "message": "Yep" },
        { "type": "Pause", "duration_ms": 200 },
        { "type": "Message", "speaker": "Zoe", "message": "The whole apartment" },
        { "type": "Pause", "duration_ms": 400 },
        { "type": "Message", "speaker": "Jake", "message": "Fair" },
        { "type": "Pause", "duration_ms": 300 },
        { "type": "Message", "speaker": "Jake", "message": "New life, who dis?" },
        { "type": "Pause", "duration_ms": 400 },
        { "type": "Message", "speaker": "Zoe", "message": "Exactly" },
        { "type": "Pause", "duration_ms": 300 },
        { "type": "Message", "speaker": "Zoe", "message": "Never speak of this" },
        { "type": "Pause", "duration_ms": 400 },
        { "type": "Message", "speaker": "Jake", "message": "Speak of what? 😇" }
    ]
}`);

router.get('/v1/video', async (c) => {
	const bundleLocation = path.resolve('./node_modules/@repo/video/dist/remotion');

	const composition = await selectComposition({
		serveUrl: bundleLocation,
		id: compositionId,
		inputProps
	});

	const result = await renderMedia({
		composition,
		serveUrl: bundleLocation,
		codec: 'h264',
		inputProps
	});

	if (result.buffer != null) {
		await s3Client.uploadObject('test.mp4', result.buffer, 'test-bucket');
	}

	// TODO

	return c.json({
		message: 'todo'
	});
});
