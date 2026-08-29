import { queryOptions } from "@tanstack/react-query";
import { getAdminAgent, listAdminAgents, listMembers, listTemplates } from "./admin-api";

export const adminAgentsQuery = queryOptions({
  queryKey: ["admin", "agents"],
  queryFn: listAdminAgents,
});

export const adminAgentQuery = (handle: string) =>
  queryOptions({
    queryKey: ["admin", "agent", handle],
    queryFn: () => getAdminAgent(handle),
  });

export const adminTemplatesQuery = queryOptions({
  queryKey: ["admin", "templates"],
  queryFn: listTemplates,
});

export const adminMembersQuery = queryOptions({
  queryKey: ["admin", "members"],
  queryFn: listMembers,
});
