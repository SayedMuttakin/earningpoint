const CartProduct = require('../models/CartProduct');

// ─── Get All Cart Products (Public) ───────────────────────────────────────────
exports.getCartProducts = async (req, res) => {
  try {
    const products = await CartProduct.find({ isActive: true }).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Admin: Get All Cart Products (including inactive) ────────────────────────
exports.getAllCartProductsAdmin = async (req, res) => {
  try {
    const products = await CartProduct.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Admin: Create Cart Product ────────────────────────────────────────────────
exports.createCartProduct = async (req, res) => {
  try {
    const { title, description, price, originalPrice, image, badge, inStock, isActive } = req.body;
    
    const product = new CartProduct({
      title,
      description,
      price,
      originalPrice,
      image,
      badge,
      inStock,
      isActive
    });

    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Admin: Update Cart Product ───────────────────────────────────────────────
exports.updateCartProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const product = await CartProduct.findByIdAndUpdate(
      id,
      { ...updates },
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Admin: Delete Cart Product ───────────────────────────────────────────────
exports.deleteCartProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await CartProduct.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
