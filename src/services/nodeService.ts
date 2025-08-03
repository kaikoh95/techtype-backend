import { supabase } from '../config/database';
import { Database } from '../types.generated';

type Node = Database['techtype']['Tables']['nodes']['Row'];
type Property = Database['techtype']['Tables']['properties']['Row'];

interface CreateNodeRequest {
  name: string;
  parentId?: string;
}

interface CreatePropertyRequest {
  key: string;
  value: number;
}

interface NodeWithProperties extends Node {
  properties: Property[];
  children?: NodeWithProperties[];
}

export class NodeService {
  async createNode(request: CreateNodeRequest): Promise<Node> {
    // Create new node
    const { data: newNode, error: createError } = await supabase
      .from('nodes')
      .insert({
        name: request.name,
        parent_id: request.parentId || null,
      })
      .select()
      .single();

    if (createError || !newNode) {
      throw new Error(`Failed to create node: ${createError?.message}`);
    }

    return newNode;
  }

  async addProperty(nodeId: string, request: CreatePropertyRequest): Promise<Property> {
    // Upsert property (update if exists, insert if new)
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .upsert(
        {
          node_id: nodeId,
          key: request.key,
          value: request.value,
        },
        {
          onConflict: 'node_id,key',
        },
      )
      .select()
      .single();

    if (propertyError || !property) {
      throw new Error(`Failed to add property: ${propertyError?.message}`);
    }

    return property;
  }

  async getSubtree(nodeId: string): Promise<NodeWithProperties> {
    // Get the root node by ID
    const { data: rootNode, error: rootError } = await supabase
      .from('nodes')
      .select('*')
      .eq('id', nodeId)
      .single();

    if (rootError || !rootNode) {
      throw new Error(`Node not found: ${nodeId}`);
    }

    // Build the complete subtree
    const nodeWithProperties = await this.buildNodeTree(rootNode);
    return nodeWithProperties;
  }

  async getSubtreeByPath(pathQuery: string): Promise<NodeWithProperties | Property> {
    // Parse path and find node by traversing hierarchy
    const pathParts = pathQuery.split('/').filter((part) => part.length > 0);

    if (pathParts.length === 0) {
      throw new Error('Invalid path');
    }

    // Find root node by name
    const { data: rootNode, error: rootError } = await supabase
      .from('nodes')
      .select('*')
      .eq('name', pathParts[0])
      .is('parent_id', null)
      .single();

    if (rootError || !rootNode) {
      throw new Error(`Root node not found: ${pathParts[0]}`);
    }

    // Traverse path to find target node
    let currentNode = rootNode;
    for (let i = 1; i < pathParts.length; i++) {
      // Try to find a child node first
      const { data: childNode, error: childError } = await supabase
        .from('nodes')
        .select('*')
        .eq('name', pathParts[i])
        .eq('parent_id', currentNode.id)
        .single();

      if (childNode && !childError) {
        // Found a child node, continue traversal
        currentNode = childNode;
      } else {
        // No child node found, check if this is a property
        const { data: property, error: propError } = await supabase
          .from('properties')
          .select('*')
          .eq('node_id', currentNode.id)
          .eq('key', pathParts[i])
          .single();

        if (property && !propError) {
          // Found a property - check if there are more path parts
          if (i === pathParts.length - 1) {
            // This is the final path part, return the property
            return property;
          } else {
            // There are more path parts but properties can't have children
            throw new Error(
              `Property "${pathParts[i]}" cannot have child elements in path: ${pathParts.slice(0, i + 2).join('/')}`,
            );
          }
        } else {
          // Neither node nor property found
          throw new Error(
            `Node or property not found in path: ${pathParts.slice(0, i + 1).join('/')}`,
          );
        }
      }
    }

    // Build the complete subtree from target node
    return this.buildNodeTree(currentNode);
  }

  private async buildNodeTree(node: Node): Promise<NodeWithProperties> {
    // Get properties for this node
    const { data: properties, error: propError } = await supabase
      .from('properties')
      .select('*')
      .eq('node_id', node.id);

    if (propError) {
      throw new Error(`Failed to fetch properties: ${propError.message}`);
    }

    // Get children nodes
    const { data: children, error: childError } = await supabase
      .from('nodes')
      .select('*')
      .eq('parent_id', node.id)
      .order('name');

    if (childError) {
      throw new Error(`Failed to fetch children: ${childError.message}`);
    }

    // Recursively build children trees
    const childTrees = await Promise.all(
      (children || []).map((child) => this.buildNodeTree(child)),
    );

    return {
      ...node,
      properties: properties || [],
      children: childTrees.length > 0 ? childTrees : undefined,
    };
  }

  async validateNodeExists(nodeId: string): Promise<boolean> {
    const { data, error } = await supabase.from('nodes').select('id').eq('id', nodeId).single();

    return !error && !!data;
  }
}
