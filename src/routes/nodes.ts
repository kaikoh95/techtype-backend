import { Router } from 'express';
import { createNode, addProperty } from '../controllers/nodeController';
import { validateCreateNode, validateCreateProperty } from '../middleware/validation';

const router = Router();

/**
 * @swagger
 * /api/v1/nodes:
 *   post:
 *     summary: Create a new node
 *     description: Creates a new node in the hierarchy with an optional parent
 *     tags: [Nodes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateNodeRequest'
 *           examples:
 *             root-node:
 *               summary: Create a root node
 *               value:
 *                 name: "TestPC"
 *             child-node:
 *               summary: Create a child node
 *               value:
 *                 name: "Processing"
 *                 parentId: "00000000-0000-0000-0000-000000000005"
 *     responses:
 *       201:
 *         description: Node created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Node'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Parent node not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Duplicate node name under same parent
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/', validateCreateNode, createNode);

/**
 * @swagger
 * /api/v1/nodes/{nodeId}/properties:
 *   post:
 *     summary: Upsert a property on a node
 *     description: Upserts a new property to an existing node or updates an existing property
 *     tags: [Properties]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: nodeId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID of the node to add the property to
 *         example: "00000000-0000-0000-0000-000000000005"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePropertyRequest'
 *           examples:
 *             height-property:
 *               summary: Add a height property
 *               value:
 *                 key: "Height"
 *                 value: 450.00
 *             cores-property:
 *               summary: Add a cores property
 *               value:
 *                 key: "Cores"
 *                 value: 8
 *     responses:
 *       201:
 *         description: Property added successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Property'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Node not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/:nodeId/properties', validateCreateProperty, addProperty);

export default router;
