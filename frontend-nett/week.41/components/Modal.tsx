"use client";

import { useEffect, useId, useRef } from "react";

type Props = {
    open: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
};

export default function Modal({ open, onClose, title, children }: Props) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const pressedOnBackdrop = useRef(false);
    const titleId = useId();

    // Synkroniser React-state (open) med nettleserens dialog
    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;

        if (open && !dialog.open) {
            dialog.showModal();
        }
        if (!open && dialog.open) {
            dialog.close();
        }
    }, [open]);

    function handleMouseDown(event: React.MouseEvent<HTMLDialogElement>) {
        pressedOnBackdrop.current = event.target === event.currentTarget;
    }

    function handleClick(event: React.MouseEvent<HTMLDialogElement>) {
        const clickedBackdrop = event.target === event.currentTarget;
        if (pressedOnBackdrop.current && clickedBackdrop) {
            onClose();
        }
    }

    return (
        <dialog
            ref={dialogRef}
            onClose={onClose}
            onMouseDown={handleMouseDown}
            onClick={handleClick}
            aria-labelledby={titleId}
            className="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border border-line bg-surface text-foreground shadow-2xl backdrop:bg-black/60"
        >
            <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                    <h2 id={titleId} className="text-xl font-semibold">
                        {title}
                    </h2>
                    <button
                        onClick={onClose}
                        aria-label="Lukk"
                        className="text-2xl leading-none text-muted hover:text-foreground"
                    >
                        ×
                    </button>
                </div>
                <div className="mt-4">{children}</div>
            </div>
        </dialog>
    );
}
