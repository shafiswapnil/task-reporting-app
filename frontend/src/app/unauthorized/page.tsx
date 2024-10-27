'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button'; // Assuming you have a UI component library

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">
          Access Denied
        </h1>
        
        <div className="mb-6 text-gray-600">
          <p className="mb-2">
            You do not have permission to access this page.
          </p>
          <p>
            Please contact your administrator if you believe this is an error.
          </p>
        </div>

        <div className="space-y-4">
          <Button
            onClick={() => router.push('/')}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white"
          >
            Return to Home
          </Button>
          
          <Button
            onClick={() => router.back()}
            variant="outline"
            className="w-full"
          >
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
}

