import Cart from "../models/cartModel.js";
import Product from "../models/productModel.js";

// ➕ Add to Cart
export const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user ? req.user._id : null;
    const guestId = req.headers['guest-id'];
    
    if (!userId && !guestId) return res.status(400).json({ message: "No user or guest ID provided" });

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Check if product is active
    if (product.active === false) {
      return res.status(400).json({ message: "Product is not available" });
    }

    // Check stock availability
    const availableQty = product.quantity || 0;
    let currentCartQty = 0;

    const query = userId ? { user: userId } : { guestId };
    let cart = await Cart.findOne(query);
    if (cart) {
      const existingItem = cart.products.find((p) => p.product.toString() === productId);
      if (existingItem) {
        currentCartQty = existingItem.quantity;
      }
    }

    const totalRequested = currentCartQty + quantity;
    if (availableQty < totalRequested) {
      return res.status(400).json({ 
        message: `Only ${availableQty} items available in stock. You already have ${currentCartQty} in your cart.` 
      });
    }

    if (!cart) {
      if (userId) {
        cart = await Cart.create({ user: userId, products: [{ product: productId, quantity }] });
      } else {
        cart = await Cart.create({ guestId, products: [{ product: productId, quantity }] });
      }
    } else {
      const itemIndex = cart.products.findIndex((p) => p.product.toString() === productId);
      if (itemIndex > -1) {
        // Update quantity
        cart.products[itemIndex].quantity += quantity;
      } else {
        cart.products.push({ product: productId, quantity });
      }
      await cart.save();
    }

    res.json({ message: "Product added to cart", cart });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🔄 Update Cart Item Quantity
export const updateCartItem = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user ? req.user._id : null;
    const guestId = req.headers['guest-id'];
    if (!userId && !guestId) return res.status(400).json({ message: "No user or guest ID provided" });

    const query = userId ? { user: userId } : { guestId };
    const cart = await Cart.findOne(query);
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const itemIndex = cart.products.findIndex((p) => p.product.toString() === productId);
    if (itemIndex === -1) return res.status(404).json({ message: "Product not in cart" });

    if (quantity <= 0) {
      cart.products.splice(itemIndex, 1); // remove item if quantity is 0
    } else {
      // Check stock availability
      const product = await Product.findById(productId);
      if (product) {
        const availableQty = product.quantity || 0;
        if (availableQty < quantity) {
          return res.status(400).json({ 
            message: `Only ${availableQty} items available in stock` 
          });
        }
      }
      cart.products[itemIndex].quantity = quantity;
    }

    await cart.save();
    res.json({ message: "Cart updated", cart });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🗑️ Remove Item
export const removeCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user ? req.user._id : null;
    const guestId = req.headers['guest-id'];
    if (!userId && !guestId) return res.status(400).json({ message: "No user or guest ID provided" });

    const query = userId ? { user: userId } : { guestId };
    const cart = await Cart.findOne(query);
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.products = cart.products.filter((p) => p.product.toString() !== productId);
    await cart.save();

    res.json({ message: "Item removed", cart });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 📥 Get User Cart
export const getUserCart = async (req, res) => {
  try {
    const userId = req.user ? req.user._id : null;
    const guestId = req.headers['guest-id'];
    if (!userId && !guestId) return res.json({ products: [] });

    // Handle cart transfer/merge if userId is present
    if (userId) {
      let userCart = await Cart.findOne({ user: userId });
      let guestCart = await Cart.findOne({ guestId });
      
      if (guestCart && guestCart.products.length > 0) {
        if (!userCart) {
          // Transfer guest cart to user
          guestCart.user = userId;
          guestCart.guestId = null;
          await guestCart.save();
          userCart = guestCart;
        } else {
          // Merge products
          for (let item of guestCart.products) {
            const existingItemIndex = userCart.products.findIndex(p => p.product.toString() === item.product.toString());
            if (existingItemIndex > -1) {
              userCart.products[existingItemIndex].quantity += item.quantity;
            } else {
              userCart.products.push({ product: item.product, quantity: item.quantity });
            }
          }
          await userCart.save();
          guestCart.products = [];
          await guestCart.save();
        }
      }
    }

    const query = userId ? { user: userId } : { guestId };
    const cart = await Cart.findOne(query).populate("products.product", "name price image");
    if (!cart) return res.json({ products: [] });

    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};