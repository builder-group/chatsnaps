import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import React from 'react';

import { parsePixelToTime } from './parse-pixel-to-time';
import { parseTimeToPixel } from './parse-time-to-pixel';

export const Cursor: React.FC<TCursorProps> = (props) => {
	const {
		disableDrag,
		cursorTime,
		setCursor,
		startLeft,
		timelineWidth,
		scaleWidth,
		scale,
		scrollLeft,
		areaRef,
		maxScaleCount,
		deltaScrollLeft,
		onCursorDragStart,
		onCursorDrag,
		onCursorDragEnd
	} = props;
	const cursorRef = React.useRef<HTMLDivElement>(null);
	const draggingLeft = React.useRef<number | undefined>(undefined);

	const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
		id: 'cursor',
		disabled: disableDrag
	});

	React.useEffect(() => {
		if (typeof draggingLeft.current === 'undefined' && cursorRef.current) {
			const left = parseTimeToPixel(cursorTime, { startLeft, scaleWidth, scale }) - scrollLeft;
			cursorRef.current.style.left = `${left.toString()}px`;
		}
	}, [cursorTime, startLeft, scaleWidth, scale, scrollLeft]);

	const handleDragStart = (): void => {
		onCursorDragStart?.(cursorTime);
		draggingLeft.current =
			parseTimeToPixel(cursorTime, { startLeft, scaleWidth, scale }) - scrollLeft;
	};

	const handleDragMove = (value: number): void => {
		// Constrain the cursor within bounds
		const left = Math.max(
			startLeft - scrollLeft,
			Math.min(value, Math.min(timelineWidth, maxScaleCount * scaleWidth + startLeft - scrollLeft))
		);

		draggingLeft.current = left;
		if (cursorRef.current) {
			cursorRef.current.style.left = `${left.toString()}px`;
		}

		const time = parsePixelToTime(left + scrollLeft, { startLeft, scale, scaleWidth });
		setCursor({ time });
		onCursorDrag?.(time);

		// Handle auto-scrolling
		if (left <= 0) {
			deltaScrollLeft(-10);
		} else if (left >= timelineWidth - 10) {
			deltaScrollLeft(10);
		}
	};

	const handleDragEnd = (): void => {
		if (draggingLeft.current !== undefined) {
			const time = parsePixelToTime(draggingLeft.current + scrollLeft, {
				startLeft,
				scale,
				scaleWidth
			});
			setCursor({ time });
			onCursorDragEnd?.(time);
		}
		draggingLeft.current = undefined;
	};

	return (
		<div
			ref={setNodeRef}
			{...attributes}
			{...listeners}
			className={`absolute top-8 h-[calc(100%-2rem)] w-0.5 -translate-x-1/4 scale-x-50 transform cursor-ew-resize bg-blue-500 ${isDragging ? 'opacity-50' : ''}`}
			style={{
				left: parseTimeToPixel(cursorTime, { startLeft, scaleWidth, scale }) - scrollLeft,
				transform: CSS.Translate.toString(transform)
			}}
			onDragStart={handleDragStart}
			onDrag={(e: React.DragEvent) => {
				if (!areaRef.current) return;
				const rect = areaRef.current.getBoundingClientRect();
				handleDragMove(e.clientX - rect.left);
			}}
			onDragEnd={handleDragEnd}
		>
			<svg
				className="scale-x-200 absolute left-1/2 top-0 -translate-x-1/2"
				width="8"
				height="12"
				viewBox="0 0 8 12"
				fill="none"
			>
				<path
					d="M0 1C0 0.447715 0.447715 0 1 0H7C7.55228 0 8 0.447715 8 1V9.38197C8 9.76074 7.786 10.107 7.44721 10.2764L4.44721 11.7764C4.16569 11.9172 3.83431 11.9172 3.55279 11.7764L0.552786 10.2764C0.214002 10.107 0 9.76074 0 9.38197V1Z"
					fill="#5297FF"
				/>
			</svg>
			<div className="absolute left-1/2 top-0 h-full w-4 -translate-x-1/2 cursor-ew-resize" />
		</div>
	);
};

interface TCursorProps {
	disableDrag: boolean;
	cursorTime: number;
	setCursor: (param: { left?: number; time?: number }) => boolean;
	startLeft: number;
	timelineWidth: number;
	scaleWidth: number;
	scale: number;
	scrollLeft: number;
	areaRef: React.RefObject<HTMLDivElement>;
	maxScaleCount: number;
	deltaScrollLeft: (delta: number) => void;
	onCursorDragStart?: (time: number) => void;
	onCursorDrag?: (time: number) => void;
	onCursorDragEnd?: (time: number) => void;
}
