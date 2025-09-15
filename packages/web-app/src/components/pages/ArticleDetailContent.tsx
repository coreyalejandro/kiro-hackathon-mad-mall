'use client';

import { Container, Header, ContentLayout, Spinner } from '@cloudscape-design/components';
import AutoImageHero from '@/components/ui/AutoImageHero';
import { useArticle } from '@/lib/queries';

interface ArticleDetailContentProps {
  id: string;
}

export function ArticleDetailContent({ id }: ArticleDetailContentProps) {
  const { data, isLoading } = useArticle(id);
  const article = data?.data;

  if (isLoading) {
    return <Spinner />;
  }

  if (!article) {
    return <div>Article not found</div>;
  }

  return (
    <>
      <AutoImageHero
        section="resources"
        title={article.title}
        description={article.excerpt}
        eyebrow="Article"
      />
      <ContentLayout
      header={
        <Header variant="h1" description={article.excerpt}>
          {article.title}
        </Header>
      }
    >
      <Container>
        <div className="article-content">
          <p>{article.content}</p>
        </div>
      </Container>
    </ContentLayout>
    </>
  );
}
