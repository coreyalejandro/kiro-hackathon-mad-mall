import { Metadata } from 'next';
import { ArticleDetailContent } from '@/components/pages/ArticleDetailContent';

export const metadata: Metadata = {
  title: 'Article - MADMall Social Wellness Hub',
  description: 'Detailed wellness article',
};

interface ArticlePageProps {
  params: { id: string };
}

export default function ArticlePage({ params }: ArticlePageProps) {
  return <ArticleDetailContent id={params.id} />;
}

