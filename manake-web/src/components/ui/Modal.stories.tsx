import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { Modal } from "./Modal";
import { Button } from "./Button";

const meta: Meta<typeof Modal> = {
  title: "UI/Modal",
  component: Modal,
};

export default meta;

type Story = StoryObj<typeof Modal>;

export const Default: Story = {
  render: () => {
    const [open, setOpen] = React.useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open</Button>
        <Modal isOpen={open} onClose={() => setOpen(false)} size="md" title="Modal">
          Hello
        </Modal>
      </>
    );
  },
};
