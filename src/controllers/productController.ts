import { Request, Response } from 'express';
import * as ProductModel from '../models/productModel';
import { parseProductId, getProductValidationError } from '../utils/validation';

const INVALID_ID_MESSAGE = 'Invalid product ID. The ID must be a positive whole number.';

function notFoundMessage(productId: number): string {
  return `Product with ID ${productId} was not found.`;
}

export async function createProduct(req: Request, res: Response) {
  const validationError = getProductValidationError(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const { price, quantity } = req.body;
  const name: string = req.body.name.trim();

  try {
    const product = await ProductModel.createProduct(name, price, quantity);
    return res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    return res.status(500).json({ error: 'An unexpected error occurred while creating the product.' });
  }
}

export async function getAllProducts(_req: Request, res: Response) {
  try {
    const products = await ProductModel.findAllProducts();
    return res.status(200).json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return res.status(500).json({ error: 'An unexpected error occurred while fetching products.' });
  }
}

export async function getProductById(req: Request, res: Response) {
  const productId = parseProductId(req.params.id);
  if (productId === null) {
    return res.status(400).json({ error: INVALID_ID_MESSAGE });
  }

  try {
    const product = await ProductModel.findProductById(productId);
    if (!product) {
      return res.status(404).json({ error: notFoundMessage(productId) });
    }
    return res.status(200).json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    return res.status(500).json({ error: 'An unexpected error occurred while fetching the product.' });
  }
}

export async function updateProduct(req: Request, res: Response) {
  const productId = parseProductId(req.params.id);
  if (productId === null) {
    return res.status(400).json({ error: INVALID_ID_MESSAGE });
  }

  const validationError = getProductValidationError(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const { price, quantity } = req.body;
  const name: string = req.body.name.trim();

  try {
    const product = await ProductModel.updateProduct(productId, name, price, quantity);
    if (!product) {
      return res.status(404).json({ error: notFoundMessage(productId) });
    }
    return res.status(200).json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    return res.status(500).json({ error: 'An unexpected error occurred while updating the product.' });
  }
}

export async function deleteProduct(req: Request, res: Response) {
  const productId = parseProductId(req.params.id);
  if (productId === null) {
    return res.status(400).json({ error: INVALID_ID_MESSAGE });
  }

  try {
    const product = await ProductModel.deleteProduct(productId);
    if (!product) {
      return res.status(404).json({ error: notFoundMessage(productId) });
    }
    return res.status(200).json({
      message: `Product with ID ${productId} was deleted successfully.`,
      product,
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    return res.status(500).json({ error: 'An unexpected error occurred while deleting the product.' });
  }
}
