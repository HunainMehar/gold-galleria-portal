import { addToast } from "@heroui/react";

export const showSuccessToast = (message, description = "") => {
  addToast({
    title: message,
    description: description,
    color: "success",
    variant: "flat",
    radius: "md",
    icon: "success",
  });
};

export const showErrorToast = (message, description = "") => {
  addToast({
    title: message,
    description: description,
    color: "danger",
    variant: "flat",
    radius: "md",
    icon: "error",
  });
};

export const showWarningToast = (message, description = "") => {
  addToast({
    title: message,
    description: description,
    color: "warning",
    variant: "flat",
    radius: "md",
    icon: "warning",
  });
};

export const showInfoToast = (message, description = "") => {
  addToast({
    title: message,
    description: description,
    color: "primary",
    variant: "flat",
    radius: "md",
    icon: "info",
  });
};
