"use client";

import React, { useEffect, useState } from 'react';
import CloudscapeHero from '@/components/ui/CloudscapeHero';

type Action = { text: string; onClick: () => void; iconName?: string };

interface AutoImageHeroProps {
  section: string;
  title: string;
  description?: string;
  eyebrow?: string;
  primaryAction?: Action;
  secondaryAction?: Action;
  highlights?: Array<{ icon?: string; label: string; value?: string }>;
  chips?: Array<{ iconName?: string; text: string }>;
}

export default function AutoImageHero({
  section,
  title,
  description,
  eyebrow,
  primaryAction,
  secondaryAction,
  highlights = [],
  chips,
}: AutoImageHeroProps) {
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      try {
        const res = await fetch(`/api/images/generate-for-site?section=${encodeURIComponent(section)}`);
        const data = await res.json();
        const urls: string[] = Array.isArray(data?.images)
          ? data.images.map((i: any) => i?.url).filter(Boolean)
          : [];
        if (!cancelled) setImages(urls.slice(0, 3));
      } catch (e) {
        // Non-fatal: leave images empty; CloudscapeHero renders gradients
      }
    }
    run();
    return () => { cancelled = true; };
  }, [section]);

  return (
    <CloudscapeHero
      title={title}
      description={description}
      primaryAction={primaryAction}
      secondaryAction={secondaryAction}
      highlights={highlights}
      images={images}
      eyebrow={eyebrow}
      chips={chips}
    />
  );
}

