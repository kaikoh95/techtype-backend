import { Request, Response, NextFunction } from 'express';
import { NodeService } from '../services/nodeService';

interface CreateNodeRequest {
  name: string;
  parentId?: string;
}

interface CreatePropertyRequest {
  key: string;
  value: number;
}

const nodeService = new NodeService();

export async function createNode(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const createRequest: CreateNodeRequest = {
      name: req.body.name.trim(),
      parentId: req.body.parentId || null,
    };

    const node = await nodeService.createNode(createRequest);

    res.status(201).json({
      success: true,
      data: node,
    });
  } catch (error) {
    next(error);
  }
}

export async function addProperty(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const nodeId = req.params.nodeId;
    const createRequest: CreatePropertyRequest = {
      key: req.body.key.trim(),
      value: parseFloat(req.body.value),
    };

    // Validate that the node exists
    const nodeExists = await nodeService.validateNodeExists(nodeId);
    if (!nodeExists) {
      res.status(404).json({
        error: 'Node not found',
      });
      return;
    }

    const property = await nodeService.addProperty(nodeId, createRequest);

    res.status(201).json({
      success: true,
      data: property,
    });
  } catch (error) {
    next(error);
  }
}

export async function getSubtreeByPath(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const pathQuery = req.query.q as string;

    const result = await nodeService.getSubtreeByPath(pathQuery);

    // Determine if the result is a node or property and structure response accordingly
    const isProperty = 'key' in result && 'value' in result && 'node_id' in result;

    res.status(200).json({
      success: true,
      type: isProperty ? 'property' : 'node',
      data: result,
    });
  } catch (error) {
    next(error);
  }
}
