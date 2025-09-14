"use client";

import React from 'react';
import { Header, SpaceBetween, Button } from '@cloudscape-design/components';

type Action = { text: string; onClick: () => void; iconName?: string };

interface PageHeaderProps {
  title: string;
  description?: string;
  primaryAction?: Action;
  secondaryAction?: Action;
}

export function PageHeader({ title, description, primaryAction, secondaryAction }: PageHeaderProps) {
  return (
    <Header
      variant="h1"
      description={description}
      actions={
        (primaryAction || secondaryAction) ? (
          <SpaceBetween direction="horizontal" size="xs">
            {secondaryAction && (
              <Button variant="normal" iconName={secondaryAction.iconName} onClick={secondaryAction.onClick}>
                {secondaryAction.text}
              </Button>
            )}
            {primaryAction && (
              <Button variant="primary" iconName={primaryAction.iconName} onClick={primaryAction.onClick}>
                {primaryAction.text}
              </Button>
            )}
          </SpaceBetween>
        ) : undefined
      }
    >
      {title}
    </Header>
  );
}

export default PageHeader;

