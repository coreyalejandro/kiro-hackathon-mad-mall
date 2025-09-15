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
        // 1) Try approved images first
        const res = await fetch(`/api/images/generate-for-site?section=${encodeURIComponent(section)}`);
        const data = await res.json();
        let urls: string[] = Array.isArray(data?.images)
          ? data.images.map((i: any) => i?.url).filter(Boolean)
          : [];

        // 2) If none exist, generate and auto-approve, then fetch again
        if (urls.length === 0) {
          await fetch(`/api/images/generate-for-site`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ section, count: 3 })
          });
          const res2 = await fetch(`/api/images/generate-for-site?section=${encodeURIComponent(section)}`);
          const data2 = await res2.json();
          urls = Array.isArray(data2?.images)
            ? data2.images.map((i: any) => i?.url).filter(Boolean)
            : [];
        }

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
