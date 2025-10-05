import { useMutation, useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { harassmentAPI } from '@/services/harassment-api';
import { queryKeys, queryUtils } from '@/contexts/QueryProvider';
import { useToast } from '@/hooks/use-toast';
import type {
  AnalyzeTextRequest,
  AnalyzeTextResponse,
  FileUploadResponse,
  AnalysisHistoryResponse,
} from '@/types/api';

// Analysis hooks
export function useAnalyzeText() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: (request: AnalyzeTextRequest) => harassmentAPI.analyzeText(request),
    onSuccess: (data: AnalyzeTextResponse) => {
      // Cache the result for future use
      queryUtils.setOptimisticAnalysis(data.result.text, data);
      
      // Show success notification for high-risk content
      if (data.result.riskLevel === 'high' || data.result.riskLevel === 'critical') {
        toast({
          title: 'High Risk Content Detected',
          description: `Risk level: ${data.result.riskLevel.toUpperCase()}`,
          variant: 'destructive',
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: 'Analysis Failed',
        description: error.message || 'Failed to analyze text. Please try again.',
        variant: 'destructive',
      });
    },
  });
}

export function useAnalyzeBatch() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: (texts: string[]) => harassmentAPI.analyzeBatch(texts),
    onSuccess: (data: AnalyzeTextResponse[]) => {
      const toxicCount = data.filter(result => 
        result.result.riskLevel === 'high' || result.result.riskLevel === 'critical'
      ).length;
      
      toast({
        title: 'Batch Analysis Complete',
        description: `Analyzed ${data.length} texts. ${toxicCount} high-risk items found.`,
      });
      
      queryUtils.invalidateHistory();
    },
    onError: (error: any) => {
      toast({
        title: 'Batch Analysis Failed',
        description: error.message || 'Failed to analyze texts. Please try again.',
        variant: 'destructive',
      });
    },
  });
}

export function useFilterToxicComments() {
  return useMutation({
    mutationFn: ({
      texts,
      threshold = 0.5,
      filterType = 'all' as 'all' | 'harassment' | 'misogyny'
    }: {
      texts: string[];
      threshold?: number;
      filterType?: 'all' | 'harassment' | 'misogyny';
    }) => harassmentAPI.filterToxicComments(texts, threshold, filterType),
  });
}

// File upload hooks
export function useFileUpload() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      file,
      onProgress
    }: {
      file: File;
      onProgress?: (progress: number) => void;
    }) => harassmentAPI.uploadFile(file, onProgress),
    onSuccess: (data: FileUploadResponse) => {
      toast({
        title: 'File Uploaded',
        description: `Processing ${data.fileName}... Job ID: ${data.jobId}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Upload Failed',
        description: error.message || 'Failed to upload file. Please try again.',
        variant: 'destructive',
      });
    },
  });
}

export function useJobStatus(jobId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.jobStatus(jobId),
    queryFn: () => harassmentAPI.getJobStatus(jobId),
    enabled: enabled && !!jobId,
    refetchInterval: (data: any) => {
      // Auto-refetch if job is still running
      if (data?.job?.status === 'running' || data?.job?.status === 'queued') {
        return 2000; // 2 seconds
      }
      return false;
    },
  });
}

export function useDownloadResults() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: (jobId: string) => harassmentAPI.downloadResults(jobId),
    onSuccess: (blob: Blob, jobId: string) => {
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `analysis_results_${jobId}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: 'Download Started',
        description: 'Analysis results are being downloaded.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Download Failed',
        description: error.message || 'Failed to download results.',
        variant: 'destructive',
      });
    },
  });
}

// History hooks
export function useAnalysisHistory(cursor?: string) {
  return useInfiniteQuery({
    queryKey: queryKeys.historyList(cursor),
    queryFn: ({ pageParam = undefined }) => 
      harassmentAPI.getAnalysisHistory(pageParam, 20),
    getNextPageParam: (lastPage: AnalysisHistoryResponse) => 
      lastPage.hasMore ? lastPage.cursor : undefined,
    initialPageParam: undefined,
  });
}

export function useAnalysisById(id: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.analysisById(id),
    queryFn: () => harassmentAPI.getAnalysisById(id),
    enabled: enabled && !!id,
  });
}

export function useDeleteAnalysis() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => harassmentAPI.deleteAnalysis(id),
    onSuccess: () => {
      queryUtils.invalidateHistory();
      toast({
        title: 'Analysis Deleted',
        description: 'The analysis has been removed from your history.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Delete Failed',
        description: error.message || 'Failed to delete analysis.',
        variant: 'destructive',
      });
    },
  });
}

// System hooks
export function useSystemHealth() {
  return useQuery({
    queryKey: queryKeys.health(),
    queryFn: () => harassmentAPI.getSystemHealth(),
    staleTime: 30 * 1000, // 30 seconds
    retry: 3,
  });
}

export function useModelsInfo() {
  return useQuery({
    queryKey: queryKeys.modelsInfo(),
    queryFn: () => harassmentAPI.getModelsInfo(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useTestConnection() {
  return useMutation({
    mutationFn: () => harassmentAPI.testConnection(),
  });
}

// Utility hooks
export function useCancelRequests() {
  return () => {
    harassmentAPI.cancelRequests();
    queryUtils.cancelQueries();
  };
}

export function useClearCache() {
  const { toast } = useToast();

  return () => {
    queryUtils.clearCache();
    toast({
      title: 'Cache Cleared',
      description: 'All cached data has been removed.',
    });
  };
}
