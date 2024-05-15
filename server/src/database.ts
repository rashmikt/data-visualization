import neo4j from 'neo4j-driver';

// Neo4j connection details
const neo4jUri = process.env.NEO4J_URI!;
const neo4jUser = process.env.NEO4J_USER!;
const neo4jPassword = process.env.NEO4J_PASSWORD!;

// Create a Neo4j driver instance
const driver = neo4j.driver(neo4jUri, neo4j.auth.basic(neo4jUser, neo4jPassword));

// Function to fetch graph data from Neo4j
export async function fetchGraphData(): Promise<any[]> {
    const session = driver.session();
    try {
        const result = await session.run(
            'MATCH (n) RETURN n.name AS name, n.description AS description, n.parent AS parent'
        );

        return result.records.map(record => record.toObject());
    } finally {
        await session.close();
    }
}

// Function to select a node
export async function selectNode(nodeName: string): Promise<void> {
    const session = driver.session();
    try {
        const cypherQuery = `
            MATCH (n { name: $nodeName })
            SET n.selected = true
        `;
        await session.run(cypherQuery, { nodeName });
    } finally {
        await session.close();
    }
}

// Function to deselect a node
export async function deselectNode(nodeName: string): Promise<void> {
    const session = driver.session();

    try {
        const cypherQuery = `
            MATCH (n { name: $nodeName })
            SET n.selected = false
        `;
        await session.run(cypherQuery, { nodeName });
    } finally {
        await session.close();
    }
}
