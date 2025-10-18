import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
import { createApiClient } from '@/lib/api-client';
import { RFPProject } from '@/types/models';

export function useRFPs() {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ['rfps'],
    queryFn: async () => {
      const apiClient = createApiClient(getToken);
      const { data } = await apiClient.get<RFPProject[]>('/api/rfps/');
      return data;
    },
  });
}

export function useRFP(rfpId: string | undefined) {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ['rfp', rfpId],
    queryFn: async () => {
      if (!rfpId) throw new Error('RFP ID required');
      const apiClient = createApiClient(getToken);
      const { data } = await apiClient.get<RFPProject>(`/api/rfps/${rfpId}`);
      return data;
    },
    enabled: !!rfpId,
  });
}

export function useUpdateAnswer() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      rfpId,
      questionId,
      answerText,
    }: {
      rfpId: string;
      questionId: string;
      answerText: string;
    }) => {
      const apiClient = createApiClient(getToken);
      const { data } = await apiClient.patch(
        `/api/rfps/${rfpId}/questions/${questionId}`,
        { answer_text: answerText }
      );
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['rfp', variables.rfpId] });
    },
  });
}

export function useRephraseAnswer() {
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async ({
      rfpId,
      questionId,
      instruction,
    }: {
      rfpId: string;
      questionId: string;
      instruction: string;
    }) => {
      const apiClient = createApiClient(getToken);
      const { data } = await apiClient.post(
        `/api/rfps/${rfpId}/questions/${questionId}/rephrase`,
        { instruction }
      );
      return data;
    },
  });
}

export function useUploadRFP() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ file, rfpName }: { file: File; rfpName: string }) => {
      const apiClient = createApiClient(getToken);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('rfp_name', rfpName);

      const { data } = await apiClient.post('/api/rfps/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rfps'] });
    },
  });
}

export function useDeleteRFP() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (rfpId: string) => {
      const apiClient = createApiClient(getToken);
      const { data } = await apiClient.delete(`/api/rfps/${rfpId}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rfps'] });
    },
  });
}