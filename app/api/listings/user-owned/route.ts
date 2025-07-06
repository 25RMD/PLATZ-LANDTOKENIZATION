import * as collectionsRoute from "@/app/api/collections/user-owned/route";

// Re-export the GET handler so the new listings endpoint mirrors the legacy collections endpoint.
export const GET = collectionsRoute.GET;
