"use client";

import type { InputHTMLAttributes } from "react";

/**
 * An input that submits its parent form when the user leaves the field or
 * presses Enter. A lightweight stand-in for the prototype's auto-save-
 * while-typing feel, without full debouncing.
 */
export function AutoSubmitField(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      onBlur={(e) => {
        props.onBlur?.(e);
        e.currentTarget.form?.requestSubmit();
      }}
      onKeyDown={(e) => {
        props.onKeyDown?.(e);
        if (e.key === "Enter") {
          e.preventDefault();
          e.currentTarget.form?.requestSubmit();
        }
      }}
    />
  );
}
