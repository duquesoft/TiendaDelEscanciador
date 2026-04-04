"use client";

import { useEffect } from "react";

const METAMASK_EXTENSION_ID = "nkbihfbeogaeaoehlefnkodbefgpgknn";

function isMetaMaskExtensionErrorMessage(message: unknown) {
  if (typeof message !== "string") return false;

  const normalizedMessage = message.toLowerCase();

  return (
    normalizedMessage.includes("failed to connect to metamask") ||
    normalizedMessage.includes("chrome-extension://" + METAMASK_EXTENSION_ID)
  );
}

function isMetaMaskExtensionStack(stack: unknown) {
  if (typeof stack !== "string") return false;

  return stack.includes(`chrome-extension://${METAMASK_EXTENSION_ID}`);
}

export default function IgnoreExtensionErrors() {
  useEffect(() => {
    const onError = (event: ErrorEvent) => {
      const extensionSource = typeof event.filename === "string" &&
        event.filename.includes(`chrome-extension://${METAMASK_EXTENSION_ID}`);

      if (
        extensionSource ||
        isMetaMaskExtensionErrorMessage(event.message) ||
        isMetaMaskExtensionStack(event.error?.stack)
      ) {
        event.preventDefault();
      }
    };

    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      const reasonMessage =
        typeof reason === "string"
          ? reason
          : typeof reason?.message === "string"
            ? reason.message
            : "";
      const reasonStack = typeof reason?.stack === "string" ? reason.stack : "";

      if (
        isMetaMaskExtensionErrorMessage(reasonMessage) ||
        isMetaMaskExtensionStack(reasonStack)
      ) {
        event.preventDefault();
      }
    };

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onUnhandledRejection);

    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onUnhandledRejection);
    };
  }, []);

  return null;
}