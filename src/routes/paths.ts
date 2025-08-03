import { Router } from 'express';
import { getSubtreeByPath } from '../controllers/nodeController';
import { validateNodePath } from '../middleware/validation';

const router = Router();

/**
 * @swagger
 * /api/v1/paths:
 *   get:
 *     summary: Get node subtree or property by hierarchical path
 *     description: Retrieves a node with all its children and properties, or a specific property value using a hierarchical path
 *     tags: [Paths]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Hierarchical path to the node or property (e.g., "AlphaPC", "AlphaPC/Height", "AlphaPC/Processing/CPU")
 *         examples:
 *           root:
 *             summary: Get root node with properties and children
 *             value: "AlphaPC"
 *           property:
 *             summary: Get specific property value
 *             value: "AlphaPC/Height"
 *           processing:
 *             summary: Get processing subtree
 *             value: "AlphaPC/Processing"
 *           cpu-property:
 *             summary: Get CPU cores property
 *             value: "AlphaPC/Processing/CPU/Cores"
 *           storage:
 *             summary: Get storage subtree
 *             value: "AlphaPC/Storage"
 *     responses:
 *       200:
 *         description: Node or property retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     type:
 *                       type: string
 *                       enum: [node, property]
 *                       description: Indicates whether the result is a node or property
 *                     data:
 *                       oneOf:
 *                         - $ref: '#/components/schemas/NodeWithProperties'
 *                         - $ref: '#/components/schemas/Property'
 *             examples:
 *               alphapc-node:
 *                 summary: AlphaPC node with properties and children
 *                 value:
 *                   success: true
 *                   type: "node"
 *                   data:
 *                     id: "123e4567-e89b-12d3-a456-426614174000"
 *                     name: "AlphaPC"
 *                     parent_id: null
 *                     created_at: "2024-01-01T00:00:00Z"
 *                     updated_at: "2024-01-01T00:00:00Z"
 *                     properties:
 *                       - key: "Height"
 *                         value: 450.00
 *                       - key: "Width"
 *                         value: 180.00
 *                     children:
 *                       - id: "123e4567-e89b-12d3-a456-426614174001"
 *                         name: "Processing"
 *                         parent_id: "123e4567-e89b-12d3-a456-426614174000"
 *                         properties:
 *                           - key: "RAM"
 *                             value: 32000.00
 *                         children: []
 *               height-property:
 *                 summary: Height property value
 *                 value:
 *                   success: true
 *                   type: "property"
 *                   data:
 *                     id: "prop-123"
 *                     node_id: "123e4567-e89b-12d3-a456-426614174000"
 *                     key: "Height"
 *                     value: 450.00
 *                     created_at: "2024-01-01T00:00:00Z"
 *                     updated_at: "2024-01-01T00:00:00Z"
 *               cpu-leaf:
 *                 summary: CPU leaf node
 *                 value:
 *                   success: true
 *                   type: "node"
 *                   data:
 *                     id: "123e4567-e89b-12d3-a456-426614174003"
 *                     name: "CPU"
 *                     parent_id: "123e4567-e89b-12d3-a456-426614174002"
 *                     created_at: "2024-01-01T00:00:00Z"
 *                     updated_at: "2024-01-01T00:00:00Z"
 *                     properties:
 *                       - key: "Cores"
 *                         value: 4
 *                       - key: "Power"
 *                         value: 2.41
 *                     children: []
 *       400:
 *         description: Invalid path format or missing query parameter
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Node or property not found at specified path
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', validateNodePath, getSubtreeByPath);

export default router;
