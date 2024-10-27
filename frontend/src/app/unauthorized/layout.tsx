import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Unauthorized Access | Task Reporter',
  description: 'You do not have permission to access this page',
};

export default function UnauthorizedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

