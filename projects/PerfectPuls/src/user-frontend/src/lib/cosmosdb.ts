import { CosmosClient, Container } from "@azure/cosmos";

// Support both connection string and separate endpoint/key env vars
const connectionString = process.env.COSMOS_DB_CONNECTION_STRING;
const databaseId = process.env.COSMOS_DB_DATABASE_NAME ?? "policydb";
const containerId = "documents"; // dedicated container for policy documents

let _container: Container | null = null;

function buildClient(): CosmosClient {
  if (connectionString) {
    return new CosmosClient(connectionString);
  }
  // Fallback to individual vars if present
  const endpoint = process.env.COSMOS_ENDPOINT!;
  const key = process.env.COSMOS_KEY!;
  return new CosmosClient({ endpoint, key });
}

async function getContainer(): Promise<Container> {
  if (_container) return _container;
  const client = buildClient();
  const { database } = await client.databases.createIfNotExists({ id: databaseId });
  const { container } = await database.containers.createIfNotExists({
    id: containerId,
    partitionKey: { paths: ["/id"] },
  });
  _container = container;
  return container;
}

export type PolicyDocument = {
  id: string;
  document_name: string;
  policy_id: string;
  status: string;
  upload_date: string;
  extraction_summary?: {
    pages_processed?: number;
    entities_extracted?: number;
    nodes_created?: number;
    relationships_created?: number;
    embeddings_generated?: number;
  };
  graph_preview?: {
    coverage_types?: string[];
    key_entities?: string[];
    provider_networks?: string[];
  };
  processing_time_ms?: number;
};

export async function saveDocument(doc: PolicyDocument): Promise<void> {
  const container = await getContainer();
  await container.items.upsert(doc);
}

export async function fetchDocuments(): Promise<PolicyDocument[]> {
  const container = await getContainer();
  const { resources } = await container.items
    .query<PolicyDocument>("SELECT * FROM c ORDER BY c._ts DESC")
    .fetchAll();
  return resources;
}

export async function deleteDocument(id: string): Promise<void> {
  const container = await getContainer();
  await container.item(id, id).delete();
}
