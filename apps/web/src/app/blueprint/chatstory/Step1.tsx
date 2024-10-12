'use client';

import { createForm } from 'feature-form';
import { useForm } from 'feature-react/form';
import React from 'react';
import * as v from 'valibot';
import { vValidator } from 'validation-adapters/valibot';
import {
	BlockMessage,
	Button,
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
	Input,
	Textarea,
	type TBlockMessage
} from '@/components';

import { type TChatStoryBlueprintStep1 } from './schema';

const $form = createForm<Omit<TChatStoryBlueprintStep1, 'type'>>({
	fields: {
		originalStory: {
			validator: vValidator(v.pipe(v.string(), v.minLength(1), v.maxLength(2000))),
			defaultValue: ''
		},
		targetAudience: {
			validator: vValidator(v.optional(v.pipe(v.string(), v.minLength(1), v.maxLength(2000)))),
			defaultValue: ''
		}
	},
	onValidSubmit: (data) => {
		console.log('ValidSubmit', data);
	},
	onInvalidSubmit: (errors) => {
		console.log('InvalidSubmit', errors);
	}
});

export const Step1: React.FC<TProps> = (props) => {
	const { step, blockMessage } = props;
	const { handleSubmit, field } = useForm($form);

	React.useEffect(() => {
		$form.fields.originalStory.set(step.originalStory);
		$form.fields.targetAudience?.set(step.targetAudience);
	}, [step]);

	const onSubmit = handleSubmit({
		onInvalidSubmit: (errors) => {
			console.log({ errors });
		},
		onValidSubmit: (data) => {
			console.log({ data });
		},
		preventDefault: true
	});

	return (
		<div className="flex h-screen w-full items-center justify-center">
			<Card className="w-full max-w-3xl">
				<CardHeader>
					<CardTitle>Step 1</CardTitle>
					<CardDescription>Enter your original story and target audience</CardDescription>
				</CardHeader>
				<form
					// eslint-disable-next-line @typescript-eslint/no-misused-promises -- ok
					onSubmit={onSubmit}
					className="space-y-6"
				>
					<CardContent className="space-y-4">
						<div className="space-y-4">
							<FormField formField={field('targetAudience')}>
								{(fieldData) => (
									<FormItem>
										<FormLabel>Target Audience</FormLabel>
										<FormControl>
											{(status) => (
												<Input
													{...fieldData}
													placeholder="Target Audience"
													type="text"
													variant={status.type === 'INVALID' ? 'destructive' : 'default'}
												/>
											)}
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							</FormField>
							<FormField formField={field('originalStory')}>
								{(fieldData) => (
									<FormItem>
										<FormLabel>Orginal Story</FormLabel>
										<FormControl>
											{(status) => (
												<Textarea
													{...fieldData}
													className="max-h-48"
													placeholder="Orginal Story"
													variant={status.type === 'INVALID' ? 'destructive' : 'default'}
												/>
											)}
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							</FormField>
						</div>
						{blockMessage != null && (
							<BlockMessage variant={blockMessage.variant}>{blockMessage.message}</BlockMessage>
						)}
					</CardContent>
					<CardFooter>
						<Button type="submit">Next</Button>
					</CardFooter>
				</form>
			</Card>
		</div>
	);
};

interface TProps {
	step: TChatStoryBlueprintStep1;
	// onChange: (step: TChatStoryBlueprintStep1) => void;
	// onNext: (step: TChatStoryBlueprintStep1) => void;
	blockMessage?: TBlockMessage;
}
