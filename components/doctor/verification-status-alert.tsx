'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface VerificationStatusAlertProps {
  status?: 'pending' | 'submitted' | 'approved' | 'rejected';
  onDismiss?: () => void;
  showApprovalNotification?: boolean;
}

export function VerificationStatusAlert({ 
  status = 'pending', 
  onDismiss,
  showApprovalNotification = false 
}: VerificationStatusAlertProps) {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(true);
  const [showApprovalToast, setShowApprovalToast] = useState(showApprovalNotification);

  useEffect(() => {
    if (showApprovalToast && status === 'approved') {
      toast.success('Congratulations! Your verification has been approved. You now have full access to the portal.', {
        duration: 5000,
      });
      setShowApprovalToast(false);
    }
  }, [status, showApprovalToast]);

  if (!isVisible) return null;

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  if (status === 'pending') {
    return (
      <Alert variant="destructive" className="mb-6 border-red-200 bg-red-50 text-red-800">
        <AlertCircle className="h-5 w-5" />
        <AlertTitle className="font-semibold text-lg ml-2">Verification Required</AlertTitle>
        <AlertDescription className="mt-2 ml-2 flex items-center justify-between">
          <span>Please complete your verification to access full SWIFTCARE features. Your profile will not be visible to patients until approved.</span>
          <Button 
            onClick={() => router.push('/doctor/verification')} 
            size="sm" 
            variant="destructive"
          >
            Complete Verification
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (status === 'submitted') {
    return (
      <Alert className="mb-6 border-blue-200 bg-blue-50 text-blue-800">
        <Clock className="h-5 w-5 text-blue-600" />
        <AlertTitle className="font-semibold text-lg ml-2 text-blue-900">Verification Pending</AlertTitle>
        <AlertDescription className="mt-2 ml-2 text-blue-800">
          Your verification request has been submitted successfully. Our admin team will review your documents and get back to you within 1-2 business days.
        </AlertDescription>
      </Alert>
    );
  }

  if (status === 'rejected') {
    return (
      <Alert variant="destructive" className="mb-6 border-red-200 bg-red-50 text-red-800">
        <XCircle className="h-5 w-5" />
        <AlertTitle className="font-semibold text-lg ml-2">Verification Rejected</AlertTitle>
        <AlertDescription className="mt-2 ml-2 flex items-center justify-between">
          <span>Unfortunately, your verification was rejected. Please review your documents and try again.</span>
          <Button 
            onClick={() => router.push('/doctor/verification')} 
            size="sm" 
            variant="destructive"
          >
            Resubmit Verification
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (status === 'approved') {
    return (
      <Alert className="mb-6 border-green-200 bg-green-50 text-green-800">
        <CheckCircle className="h-5 w-5 text-green-600" />
        <AlertTitle className="font-semibold text-lg ml-2 text-green-900">Verification Approved</AlertTitle>
        <AlertDescription className="mt-2 ml-2 flex items-center justify-between">
          <span>🎉 Congratulations! Your verification has been approved. You now have full access to the SWIFTCARE portal and your profile is visible to patients.</span>
          <Button 
            onClick={handleDismiss}
            size="sm" 
            variant="outline"
            className="border-green-300 text-green-700 hover:bg-green-100"
          >
            Dismiss
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}
