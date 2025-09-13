'use client';

import { Container, Header, ContentLayout, Spinner } from '@cloudscape-design/components';
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
  );
}

