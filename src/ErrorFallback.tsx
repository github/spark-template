import { Button, Flash, Heading, Text } from "@/components/ui";
import { AlertIcon, SyncIcon } from "@primer/octicons-react";

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

export const ErrorFallback = ({ error, resetErrorBoundary }: ErrorFallbackProps) => {
  // When encountering an error in the development mode, rethrow it and don't display the boundary.
  // The parent UI will take care of showing a more helpful dialog.
  if (import.meta.env.DEV) throw error;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Flash variant="danger" className="mb-6">
          <AlertIcon size={16} />
          <Heading variant="small">This spark has encountered a runtime error</Heading>
          <Text>
            Something unexpected happened while running the application. The error details are shown below. Contact the spark author and let them know about this issue.
          </Text>
        </Flash>
        
        <div className="bg-card border rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-sm text-muted-foreground mb-2">Error Details:</h3>
          <pre className="text-xs text-destructive bg-muted/50 p-3 rounded border overflow-auto max-h-32">
            {error.message}
          </pre>
        </div>
        
        <Button 
          onClick={resetErrorBoundary} 
          className="w-full"
          variant="default"
          leadingVisual={SyncIcon}
        >
          Try Again
        </Button>
      </div>
    </div>
  );
}
