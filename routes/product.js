const express = require("express");
const router = express.Router();

const {
  getProducts,
  getAdminProducts,
  newProduct,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  createProductReviews,
  getProductReviews,
  deleteReview

} = require("../controllers/productController");

const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth')

router.route("/products").get( isAuthenticatedUser,   getProducts);
router.route("/admin/products").get( isAuthenticatedUser,   getAdminProducts);
router.route("/product/:id").get(getSingleProduct);

router.route("/admin/product/new").post(isAuthenticatedUser, authorizeRoles('admin'),  newProduct);

router.route("/admin/product/:id").put(isAuthenticatedUser, authorizeRoles('admin'),  updateProduct).delete( isAuthenticatedUser, authorizeRoles('admin'),  deleteProduct);


router.route('/review').put(isAuthenticatedUser, createProductReviews)
router.route('/reviews').get(isAuthenticatedUser, getProductReviews)
router.route('/reviews').delete(isAuthenticatedUser, deleteReview)

module.exports = router;
