import type { Meta, StoryObj } from "@storybook/react";
import { ToastProvider, useToast } from "../../context/ToastContext";
import { Button } from "./Button";
import { ToastViewport } from "./Toast";

function Demo() {
  const { showToast } = useToast();
  return (
    <div className="p-6">
      <Button
        onClick={() =>
          showToast({ type: "success", message: "Saved!", duration: 2000 })
        }
      >
        Trigger toast
      </Button>
      <ToastViewport />
    </div>
  );
}

const meta: Meta<typeof Demo> = {
  title: "UI/Toast",
  component: Demo,
  decorators: [
    (Story) => (
      <ToastProvider>
        <Story />
      </ToastProvider>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof Demo>;

export const Default: Story = {
  render: () => <Demo />,
};
