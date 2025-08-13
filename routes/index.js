const express = require('express');
const router = express.Router();
const homeController = require("../controller/homeController");

/* GET home page. */
router.get('/', homeController.Home);
router.get('/products', homeController.ProductsAll);
router.get('/product/:slug', homeController.ProductDetail);
router.get('/cart', homeController.CartPage);
router.get('/thank-you', homeController.ThankYouPage);
router.get('/contact', homeController.ContactPage);
router.post('/contact', homeController.ContactStore);

router.post('/login', homeController.Login);
router.post('/register', homeController.Register);
router.get('/login', homeController.LoginPage);
router.get('/register', homeController.RegisterPage);
router.get("/logout", homeController.Logout);

router.get('/privacy-policy', homeController.PrivacyPolicy);
router.get('/term-service', homeController.TermService);
router.get('/shipping-policy', homeController.ShippingPolicy);
router.get('/contact-information', homeController.ContactInformation);
module.exports = router;