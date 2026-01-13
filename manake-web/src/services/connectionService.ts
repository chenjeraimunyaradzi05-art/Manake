import api from "./api";

export interface ConnectionUser {
  _id: string;
  name: string;
  avatar?: string;
  profile?: {
    headline?: string;
    bio?: string;
  };
}

export interface Connection {
  _id: string;
  userId: string | ConnectionUser;
  connectedUserId: string | ConnectionUser;
  status: "pending" | "accepted" | "rejected";
  connectionType: "mentor" | "peer" | "professional";
  initiatedAt: string;
  acceptedAt?: string;
  strength: number;
}

export interface ConnectionRequest extends Connection {
  userId: ConnectionUser;
}

export const connectionService = {
  async getConnections(): Promise<Connection[]> {
    const response = await api.get("/connections");
    return response.data;
  },

  async getConnectionRequests(): Promise<ConnectionRequest[]> {
    const response = await api.get("/connections/requests");
    return response.data;
  },

  async sendConnectionRequest(
    targetUserId: string,
    connectionType?: "mentor" | "peer" | "professional"
  ): Promise<Connection> {
    const response = await api.post(`/connections/requests/${targetUserId}`, {
      connectionType,
    });
    return response.data;
  },

  async respondToRequest(
    requestId: string,
    action: "accept" | "reject"
  ): Promise<Connection> {
    const response = await api.patch(`/connections/requests/${requestId}`, {
      action,
    });
    return response.data;
  },

  async removeConnection(connectionId: string): Promise<void> {
    await api.delete(`/connections/${connectionId}`);
  },

  async getSuggestions(limit = 10): Promise<ConnectionUser[]> {
    const response = await api.get("/connections/suggestions", {
      params: { limit },
    });
    return response.data;
  },
};
