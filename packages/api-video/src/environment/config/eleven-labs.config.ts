import { assertValue } from '@blgc/utils';

export const elevenLabsConfig = {
	apiKey: assertValue(
		process.env.ELEVEN_LABS_API_KEY,
		'Environment variable "ELEVEN_LABS_API_KEY" not set!'
	),
	maxPreviousRequestIds: 3,
	// Cached models from https://api.elevenlabs.io/v1/models (only relevant properties)
	models: {
		eleven_multilingual_v2: {
			id: 'eleven_multilingual_v2',
			name: 'Eleven Multilingual v2'
		},
		eleven_turbo_v2_5: {
			id: 'eleven_turbo_v2_5',
			name: 'Eleven Turbo v2.5'
		},
		eleven_turbo_v2: {
			id: 'eleven_turbo_v2',
			name: 'Eleven Turbo v2'
		},
		eleven_multilingual_sts_v2: {
			id: 'eleven_multilingual_sts_v2',
			name: 'Eleven Multilingual v2'
		},
		eleven_english_sts_v2: {
			id: 'eleven_english_sts_v2',
			name: 'Eleven English v2'
		},
		eleven_multilingual_v1: {
			id: 'eleven_multilingual_v1',
			name: 'Eleven Multilingual v1'
		},
		eleven_monolingual_v1: {
			id: 'eleven_monolingual_v1',
			name: 'Eleven English v1'
		}
	},
	// Cached voices from https://api.elevenlabs.io/v1/voices (only relevant properties)
	voices: {
		Rachel: {
			voiceId: '21m00Tcm4TlvDq8ikWAM',
			labels: {
				accent: 'american',
				description: 'calm',
				age: 'young',
				gender: 'female',
				use_case: 'narration'
			},
			previewUrl:
				'https://storage.googleapis.com/eleven-public-prod/premade/voices/21m00Tcm4TlvDq8ikWAM/b4928a68-c03b-411f-8533-3d5c299fd451.mp3'
		},
		Drew: {
			voiceId: '29vD33N1CtxCmqQRPOHJ',
			labels: {
				accent: 'American',
				description: 'well-rounded',
				age: 'middle-aged',
				gender: 'male',
				use_case: 'news'
			},
			previewUrl:
				'https://storage.googleapis.com/eleven-public-prod/premade/voices/29vD33N1CtxCmqQRPOHJ/b99fc51d-12d3-4312-b480-a8a45a7d51ef.mp3'
		},
		Clyde: {
			voiceId: '2EiwWnXFnvU5JabPnv8n',
			labels: {
				accent: 'American',
				description: 'war veteran',
				age: 'middle-aged',
				gender: 'male',
				use_case: 'characters'
			},
			previewUrl:
				'https://storage.googleapis.com/eleven-public-prod/premade/voices/2EiwWnXFnvU5JabPnv8n/65d80f52-703f-4cae-a91d-75d4e200ed02.mp3'
		},
		Paul: {
			voiceId: '5Q0t7uMcjvnagumLfvZi',
			labels: {
				accent: 'American',
				description: 'authoritative',
				age: 'middle-aged',
				gender: 'male',
				use_case: 'news'
			},
			previewUrl:
				'https://storage.googleapis.com/eleven-public-prod/premade/voices/5Q0t7uMcjvnagumLfvZi/a4aaa30e-54c4-44a4-8e46-b9b00505d963.mp3'
		},
		Domi: {
			voiceId: 'AZnzlk1XvdvUeBnXmlld',
			labels: {
				accent: 'american',
				description: 'strong',
				age: 'young',
				gender: 'female',
				use_case: 'narration'
			},
			previewUrl:
				'https://storage.googleapis.com/eleven-public-prod/premade/voices/AZnzlk1XvdvUeBnXmlld/b3c36b01-f80d-4b16-a698-f83682dee84c.mp3'
		},
		Dave: {
			voiceId: 'CYw3kZ02Hs0563khs1Fj',
			labels: {
				accent: 'British',
				description: 'conversational',
				age: 'young',
				gender: 'male',
				use_case: 'characters'
			},
			previewUrl:
				'https://storage.googleapis.com/eleven-public-prod/premade/voices/CYw3kZ02Hs0563khs1Fj/872cb056-45d3-419e-b5c6-de2b387a93a0.mp3'
		},
		Fin: {
			voiceId: 'D38z5RcWu1voky8WS1ja',
			labels: {
				accent: 'Irish',
				description: 'sailor',
				age: 'old',
				gender: 'male',
				use_case: 'characters'
			},
			previewUrl:
				'https://storage.googleapis.com/eleven-public-prod/premade/voices/D38z5RcWu1voky8WS1ja/a470ba64-1e72-46d9-ba9d-030c4155e2d2.mp3'
		},
		Sarah: {
			voiceId: 'EXAVITQu4vr4xnSDxMaL',
			labels: {
				accent: 'american',
				description: 'soft',
				age: 'young',
				gender: 'female',
				use_case: 'news'
			},
			previewUrl:
				'https://storage.googleapis.com/eleven-public-prod/premade/voices/EXAVITQu4vr4xnSDxMaL/01a3e33c-6e99-4ee7-8543-ff2216a32186.mp3'
		},
		Antoni: {
			voiceId: 'ErXwobaYiN019PkySvjV',
			labels: {
				accent: 'american',
				description: 'well-rounded',
				age: 'young',
				gender: 'male',
				use_case: 'narration'
			},
			previewUrl:
				'https://storage.googleapis.com/eleven-public-prod/premade/voices/ErXwobaYiN019PkySvjV/2d5ab2a3-4578-470f-b797-6331e46a7d55.mp3'
		},
		Laura: {
			voiceId: 'FGY2WhTYpPnrIDTdsKH5',
			labels: {
				accent: 'American',
				description: 'upbeat',
				age: 'young',
				gender: 'female',
				use_case: 'social media'
			},
			previewUrl:
				'https://storage.googleapis.com/eleven-public-prod/premade/voices/FGY2WhTYpPnrIDTdsKH5/67341759-ad08-41a5-be6e-de12fe448618.mp3'
		},
		Thomas: {
			voiceId: 'GBv7mTt0atIp3Br8iCZE',
			labels: {
				accent: 'American',
				description: 'calm',
				age: 'young',
				gender: 'male',
				use_case: 'meditation'
			},
			previewUrl:
				'https://storage.googleapis.com/eleven-public-prod/premade/voices/GBv7mTt0atIp3Br8iCZE/98542988-5267-4148-9a9e-baa8c4f14644.mp3'
		},
		Charlie: {
			voiceId: 'IKne3meq5aSn9XLyUdCD',
			labels: {
				accent: 'Australian',
				description: 'natural',
				age: 'middle aged',
				gender: 'male',
				use_case: 'conversational'
			},
			previewUrl:
				'https://storage.googleapis.com/eleven-public-prod/premade/voices/IKne3meq5aSn9XLyUdCD/102de6f2-22ed-43e0-a1f1-111fa75c5481.mp3'
		},
		George: {
			voiceId: 'JBFqnCBsd6RMkjVDRZzb',
			labels: {
				accent: 'British',
				description: 'warm',
				age: 'middle aged',
				gender: 'male',
				use_case: 'narration'
			},
			previewUrl:
				'https://storage.googleapis.com/eleven-public-prod/premade/voices/JBFqnCBsd6RMkjVDRZzb/e6206d1a-0721-4787-aafb-06a6e705cac5.mp3'
		},
		Emily: {
			voiceId: 'LcfcDJNUP1GQjkzn1xUU',
			labels: {
				accent: 'American',
				description: 'calm',
				age: 'young',
				gender: 'female',
				use_case: 'meditation'
			},
			previewUrl:
				'https://storage.googleapis.com/eleven-public-prod/premade/voices/LcfcDJNUP1GQjkzn1xUU/e4b994b7-9713-4238-84f3-add8fccaaccd.mp3'
		},
		Elli: {
			voiceId: 'MF3mGyEYCl7XYWbV9V6O',
			labels: {
				accent: 'american',
				description: 'emotional',
				age: 'young',
				gender: 'female',
				use_case: 'narration'
			},
			previewUrl:
				'https://storage.googleapis.com/eleven-public-prod/premade/voices/MF3mGyEYCl7XYWbV9V6O/d8ecadea-9e48-4e5d-868a-2ec3d7397861.mp3'
		},
		Callum: {
			voiceId: 'N2lVS1w4EtoT3dr4eOWO',
			labels: {
				accent: 'Transatlantic',
				description: 'intense',
				age: 'middle-aged',
				gender: 'male',
				use_case: 'characters'
			},
			previewUrl:
				'https://storage.googleapis.com/eleven-public-prod/premade/voices/N2lVS1w4EtoT3dr4eOWO/ac833bd8-ffda-4938-9ebc-b0f99ca25481.mp3'
		},
		Patrick: {
			voiceId: 'ODq5zmih8GrVes37Dizd',
			labels: {
				accent: 'American',
				description: 'shouty',
				age: 'middle-aged',
				gender: 'male',
				use_case: 'characters'
			},
			previewUrl:
				'https://storage.googleapis.com/eleven-public-prod/premade/voices/ODq5zmih8GrVes37Dizd/0ebec87a-2569-4976-9ea5-0170854411a9.mp3'
		},
		Harry: {
			voiceId: 'SOYHLrjzK2X1ezoPC6cr',
			labels: {
				accent: 'American',
				description: 'anxious',
				age: 'young',
				gender: 'male',
				use_case: 'characters'
			},
			previewUrl:
				'https://storage.googleapis.com/eleven-public-prod/premade/voices/SOYHLrjzK2X1ezoPC6cr/86d178f6-f4b6-4e0e-85be-3de19f490794.mp3'
		},
		Liam: {
			voiceId: 'TX3LPaxmHKxFdv7VOQHJ',
			labels: {
				accent: 'American',
				description: 'articulate',
				age: 'young',
				gender: 'male',
				use_case: 'narration'
			},
			previewUrl:
				'https://storage.googleapis.com/eleven-public-prod/premade/voices/TX3LPaxmHKxFdv7VOQHJ/63148076-6363-42db-aea8-31424308b92c.mp3'
		},
		Dorothy: {
			voiceId: 'ThT5KcBeYPX3keUQqHPh',
			labels: {
				accent: 'British',
				description: 'pleasant',
				age: 'young',
				gender: 'female',
				use_case: 'narration'
			},
			previewUrl:
				'https://storage.googleapis.com/eleven-public-prod/premade/voices/ThT5KcBeYPX3keUQqHPh/981f0855-6598-48d2-9f8f-b6d92fbbe3fc.mp3'
		},
		Josh: {
			voiceId: 'TxGEqnHWrfWFTfGW9XjX',
			labels: {
				accent: 'american',
				description: 'deep',
				age: 'young',
				gender: 'male',
				use_case: 'narration'
			},
			previewUrl:
				'https://storage.googleapis.com/eleven-public-prod/premade/voices/TxGEqnHWrfWFTfGW9XjX/47de9a7e-773a-42a8-b410-4aa90c581216.mp3'
		},
		Arnold: {
			voiceId: 'VR6AewLTigWG4xSOukaG',
			labels: {
				accent: 'american',
				description: 'crisp',
				age: 'middle aged',
				gender: 'male',
				use_case: 'narration'
			},
			previewUrl:
				'https://storage.googleapis.com/eleven-public-prod/premade/voices/VR6AewLTigWG4xSOukaG/49a22885-80d5-48e8-87a3-076fc9193d9a.mp3'
		},
		Charlotte: {
			voiceId: 'XB0fDUnXU5powFXDhCwa',
			labels: {
				accent: 'Swedish',
				description: 'seductive',
				age: 'young',
				gender: 'female',
				use_case: 'characters'
			},
			previewUrl:
				'https://storage.googleapis.com/eleven-public-prod/premade/voices/XB0fDUnXU5powFXDhCwa/942356dc-f10d-4d89-bda5-4f8505ee038b.mp3'
		},
		Alice: {
			voiceId: 'Xb7hH8MSUJpSbSDYk0k2',
			labels: {
				accent: 'British',
				description: 'confident',
				age: 'middle-aged',
				gender: 'female',
				use_case: 'news'
			},
			previewUrl:
				'https://storage.googleapis.com/eleven-public-prod/premade/voices/Xb7hH8MSUJpSbSDYk0k2/d10f7534-11f6-41fe-a012-2de1e482d336.mp3'
		},
		Matilda: {
			voiceId: 'XrExE9yKIg1WjnnlVkGX',
			labels: {
				accent: 'American',
				description: 'friendly',
				age: 'middle-aged',
				gender: 'female',
				use_case: 'narration'
			},
			previewUrl:
				'https://storage.googleapis.com/eleven-public-prod/premade/voices/XrExE9yKIg1WjnnlVkGX/b930e18d-6b4d-466e-bab2-0ae97c6d8535.mp3'
		},
		James: {
			voiceId: 'ZQe5CZNOzWyzPSCn5a3c',
			labels: {
				accent: 'Australian',
				description: 'calm',
				age: 'old',
				gender: 'male',
				use_case: 'news'
			},
			previewUrl:
				'https://storage.googleapis.com/eleven-public-prod/premade/voices/ZQe5CZNOzWyzPSCn5a3c/35734112-7b72-48df-bc2f-64d5ab2f791b.mp3'
		},
		Joseph: {
			voiceId: 'Zlb1dXrM653N07WRdFW3',
			labels: {
				accent: 'British',
				description: 'articulate',
				age: 'middle-aged',
				gender: 'male',
				use_case: 'news'
			},
			previewUrl:
				'https://storage.googleapis.com/eleven-public-prod/premade/voices/Zlb1dXrM653N07WRdFW3/daa22039-8b09-4c65-b59f-c79c48646a72.mp3'
		},
		Will: {
			voiceId: 'bIHbv24MWmeRgasZH58o',
			labels: {
				accent: 'American',
				description: 'friendly',
				age: 'young',
				gender: 'male',
				use_case: 'social media'
			},
			previewUrl:
				'https://storage.googleapis.com/eleven-public-prod/premade/voices/bIHbv24MWmeRgasZH58o/8caf8f3d-ad29-4980-af41-53f20c72d7a4.mp3'
		},
		Jeremy: {
			voiceId: 'bVMeCyTHy58xNoL34h3p',
			labels: {
				accent: 'Irish',
				description: 'excited',
				age: 'young',
				gender: 'male',
				use_case: 'narration'
			},
			previewUrl:
				'https://storage.googleapis.com/eleven-public-prod/premade/voices/bVMeCyTHy58xNoL34h3p/66c47d58-26fd-4b30-8a06-07952116a72c.mp3'
		},
		Jessica: {
			voiceId: 'cgSgspJ2msm6clMCkdW9',
			labels: {
				accent: 'American',
				description: 'expressive',
				age: 'young',
				gender: 'female',
				use_case: 'conversational'
			},
			previewUrl:
				'https://storage.googleapis.com/eleven-public-prod/premade/voices/cgSgspJ2msm6clMCkdW9/56a97bf8-b69b-448f-846c-c3a11683d45a.mp3'
		},
		Eric: {
			voiceId: 'cjVigY5qzO86Huf0OWal',
			labels: {
				accent: 'American',
				description: 'friendly',
				age: 'middle-aged',
				gender: 'male',
				use_case: 'conversational'
			},
			previewUrl:
				'https://storage.googleapis.com/eleven-public-prod/premade/voices/cjVigY5qzO86Huf0OWal/d098fda0-6456-4030-b3d8-63aa048c9070.mp3'
		},
		Michael: {
			voiceId: 'flq6f7yk4E4fJM5XTYuZ',
			labels: {
				accent: 'American',
				description: 'calm',
				age: 'old',
				gender: 'male',
				use_case: 'narration'
			},
			previewUrl:
				'https://storage.googleapis.com/eleven-public-prod/premade/voices/flq6f7yk4E4fJM5XTYuZ/c6431a82-f7d2-4905-b8a4-a631960633d6.mp3'
		},
		Ethan: {
			voiceId: 'g5CIjZEefAph4nQFvHAz',
			labels: {
				accent: 'American',
				description: 'soft',
				age: 'young',
				gender: 'male',
				use_case: 'ASMR'
			},
			previewUrl:
				'https://storage.googleapis.com/eleven-public-prod/premade/voices/g5CIjZEefAph4nQFvHAz/26acfa99-fdec-43b8-b2ee-e49e75a3ac16.mp3'
		},
		Chris: {
			voiceId: 'iP95p4xoKVk53GoZ742B',
			labels: {
				accent: 'American',
				description: 'casual',
				age: 'middle-aged',
				gender: 'male',
				use_case: 'conversational'
			},
			previewUrl:
				'https://storage.googleapis.com/eleven-public-prod/premade/voices/iP95p4xoKVk53GoZ742B/3f4bde72-cc48-40dd-829f-57fbf906f4d7.mp3'
		},
		Gigi: {
			voiceId: 'jBpfuIE2acCO8z3wKNLl',
			labels: {
				accent: 'American',
				description: 'childlish',
				age: 'young',
				gender: 'female',
				use_case: 'animation'
			},
			previewUrl:
				'https://storage.googleapis.com/eleven-public-prod/premade/voices/jBpfuIE2acCO8z3wKNLl/3a7e4339-78fa-404e-8d10-c3ef5587935b.mp3'
		},
		Freya: {
			voiceId: 'jsCqWAovK2LkecY7zXl4',
			labels: {
				accent: 'American',
				description: 'expressive',
				age: 'young',
				gender: 'female',
				use_case: 'characters'
			},
			previewUrl:
				'https://storage.googleapis.com/eleven-public-prod/premade/voices/jsCqWAovK2LkecY7zXl4/8e1f5240-556e-4fd5-892c-25df9ea3b593.mp3'
		},
		Brian: {
			voiceId: 'nPczCjzI2devNBz1zQrb',
			labels: {
				accent: 'American',
				description: 'deep',
				age: 'middle-aged',
				gender: 'male',
				use_case: 'narration'
			},
			previewUrl:
				'https://storage.googleapis.com/eleven-public-prod/premade/voices/nPczCjzI2devNBz1zQrb/2dd3e72c-4fd3-42f1-93ea-abc5d4e5aa1d.mp3'
		},
		Grace: {
			voiceId: 'oWAxZDx7w5VEj9dCyTzz',
			labels: {
				accent: 'American (South)',
				description: 'pleasant',
				age: 'young',
				gender: 'female',
				use_case: 'narration'
			},
			previewUrl:
				'https://storage.googleapis.com/eleven-public-prod/premade/voices/oWAxZDx7w5VEj9dCyTzz/84a36d1c-e182-41a8-8c55-dbdd15cd6e72.mp3'
		},
		Daniel: {
			voiceId: 'onwK4e9ZLuTAKqWW03F9',
			labels: {
				accent: 'British',
				description: 'authoritative',
				age: 'middle-aged',
				gender: 'male',
				use_case: 'news'
			},
			previewUrl:
				'https://storage.googleapis.com/eleven-public-prod/premade/voices/onwK4e9ZLuTAKqWW03F9/7eee0236-1a72-4b86-b303-5dcadc007ba9.mp3'
		},
		Lily: {
			voiceId: 'pFZP5JQG7iQjIQuC4Bku',
			labels: {
				accent: 'British',
				description: 'warm',
				age: 'middle-aged',
				gender: 'female',
				use_case: 'narration'
			},
			previewUrl:
				'https://storage.googleapis.com/eleven-public-prod/premade/voices/pFZP5JQG7iQjIQuC4Bku/89b68b35-b3dd-4348-a84a-a3c13a3c2b30.mp3'
		},
		Serena: {
			voiceId: 'pMsXgVXv3BLzUgSXRplE',
			labels: {
				accent: 'American',
				description: 'pleasant',
				age: 'middle-aged',
				gender: 'female',
				use_case: 'narration'
			},
			previewUrl:
				'https://storage.googleapis.com/eleven-public-prod/premade/voices/pMsXgVXv3BLzUgSXRplE/d61f18ed-e5b0-4d0b-a33c-5c6e7e33b053.mp3'
		},
		Adam: {
			voiceId: 'pNInz6obpgDQGcFmaJgB',
			labels: {
				accent: 'american',
				description: 'deep',
				age: 'middle aged',
				gender: 'male',
				use_case: 'narration'
			},
			previewUrl:
				'https://storage.googleapis.com/eleven-public-prod/premade/voices/pNInz6obpgDQGcFmaJgB/d6905d7a-dd26-4187-bfff-1bd3a5ea7cac.mp3'
		},
		Nicole: {
			voiceId: 'piTKgcLEGmPE4e6mEKli',
			labels: {
				accent: 'American',
				description: 'soft',
				age: 'young',
				gender: 'female',
				use_case: 'ASMR'
			},
			previewUrl:
				'https://storage.googleapis.com/eleven-public-prod/premade/voices/piTKgcLEGmPE4e6mEKli/c269a54a-e2bc-44d0-bb46-4ed2666d6340.mp3'
		},
		Bill: {
			voiceId: 'pqHfZKP75CvOlQylNhV4',
			labels: {
				accent: 'American',
				description: 'trustworthy',
				age: 'old',
				gender: 'male',
				use_case: 'narration'
			},
			previewUrl:
				'https://storage.googleapis.com/eleven-public-prod/premade/voices/pqHfZKP75CvOlQylNhV4/d782b3ff-84ba-4029-848c-acf01285524d.mp3'
		},
		Jessie: {
			voiceId: 't0jbNlBVZ17f02VDIeMI',
			labels: {
				accent: 'American',
				description: 'raspy',
				age: 'old',
				gender: 'male',
				use_case: 'characters'
			},
			previewUrl:
				'https://storage.googleapis.com/eleven-public-prod/premade/voices/t0jbNlBVZ17f02VDIeMI/e26939e3-61a4-4872-a41d-33922cfbdcdc.mp3'
		},
		Sam: {
			voiceId: 'yoZ06aMxZJJ28mfd3POQ',
			labels: {
				accent: 'american',
				description: 'raspy',
				age: 'young',
				gender: 'male',
				use_case: 'narration'
			},
			previewUrl:
				'https://storage.googleapis.com/eleven-public-prod/premade/voices/yoZ06aMxZJJ28mfd3POQ/b017ad02-8d18-4456-ad92-55c85ecf6363.mp3'
		},
		Glinda: {
			voiceId: 'z9fAnlkpzviPz146aGWa',
			labels: {
				accent: 'American',
				description: 'witch',
				age: 'middle-aged',
				gender: 'female',
				use_case: 'characters'
			},
			previewUrl:
				'https://storage.googleapis.com/eleven-public-prod/premade/voices/z9fAnlkpzviPz146aGWa/cbc60443-7b61-4ebb-b8e1-5c03237ea01d.mp3'
		},
		Giovanni: {
			voiceId: 'zcAOhNBS3c14rBihAFp1',
			labels: {
				accent: 'Italian',
				description: 'foreigner',
				age: 'young',
				gender: 'male',
				use_case: 'narration'
			},
			previewUrl:
				'https://storage.googleapis.com/eleven-public-prod/premade/voices/zcAOhNBS3c14rBihAFp1/e7410f8f-4913-4cb8-8907-784abee5aff8.mp3'
		},
		Mimi: {
			voiceId: 'zrHiDhphv9ZnVXBqCLjz',
			labels: {
				accent: 'Swedish',
				description: 'childish',
				age: 'young',
				gender: 'female',
				use_case: 'animation'
			},
			previewUrl:
				'https://storage.googleapis.com/eleven-public-prod/premade/voices/zrHiDhphv9ZnVXBqCLjz/decbf20b-0f57-4fac-985b-a4f0290ebfc4.mp3'
		}
	}
};
