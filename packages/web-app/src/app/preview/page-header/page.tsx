import PageHeader from '@/components/ui/PageHeader';
import { ContentLayout, Container, SpaceBetween, Box } from '@cloudscape-design/components';

export default function PageHeaderPreview() {
  return (
    <ContentLayout
      header={
        <PageHeader
          title="PageHeader Preview"
          description="This route previews the shared Cloudscape page header with actions."
          primaryAction={{ text: 'Primary', onClick: () => {}, iconName: 'add-plus' }}
          secondaryAction={{ text: 'Secondary', onClick: () => {}, iconName: 'settings' }}
        />
      }
    >
      <Container>
        <SpaceBetween size="m">
          <Box>Use this preview to validate spacing, actions, and copy.</Box>
          <Box>Adjust props and verify visual consistency before rollout.</Box>
        </SpaceBetween>
      </Container>
    </ContentLayout>
  );
}

