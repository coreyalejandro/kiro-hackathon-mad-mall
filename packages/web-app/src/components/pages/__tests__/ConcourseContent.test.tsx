import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConcourseContent } from '../ConcourseContent';
import { useRouter } from 'next/navigation';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

const renderWithClient = () => {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <ConcourseContent />
    </QueryClientProvider>
  );
};

test('navigates to section within 2s on card click', async () => {
  const push = jest.fn();
  (useRouter as jest.Mock).mockReturnValue({ push });
  renderWithClient();
  const card = await screen.findByTestId('mall-section-peer-circles');
  await userEvent.click(card);
  await waitFor(() => {
    expect(push).toHaveBeenCalledWith('/circles');
  }, { timeout: 2000 });
});

test('displays community activity', async () => {
  (useRouter as jest.Mock).mockReturnValue({ push: jest.fn() });
  renderWithClient();
  const items = await screen.findAllByRole('listitem');
  expect(items.length).toBeGreaterThan(0);
});

