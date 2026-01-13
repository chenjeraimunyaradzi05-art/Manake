import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { connectionService } from "../services/connectionService";

export const useConnections = () => {
  return useQuery({
    queryKey: ["connections"],
    queryFn: () => connectionService.getConnections(),
  });
};

export const useConnectionRequests = () => {
  return useQuery({
    queryKey: ["connectionRequests"],
    queryFn: () => connectionService.getConnectionRequests(),
  });
};

export const useSuggestions = (limit = 10) => {
  return useQuery({
    queryKey: ["suggestions", limit],
    queryFn: () => connectionService.getSuggestions(limit),
  });
};

export const useSendConnectionRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      targetUserId,
      connectionType,
    }: {
      targetUserId: string;
      connectionType?: "mentor" | "peer" | "professional";
    }) => connectionService.sendConnectionRequest(targetUserId, connectionType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suggestions"] });
      queryClient.invalidateQueries({ queryKey: ["connections"] });
    },
  });
};

export const useRespondToRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      requestId,
      action,
    }: {
      requestId: string;
      action: "accept" | "reject";
    }) => connectionService.respondToRequest(requestId, action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["connectionRequests"] });
      queryClient.invalidateQueries({ queryKey: ["connections"] });
    },
  });
};

export const useRemoveConnection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (connectionId: string) =>
      connectionService.removeConnection(connectionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["connections"] });
    },
  });
};
