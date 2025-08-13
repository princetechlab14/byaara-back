const Joi = require("joi");
const { ProductModel, ContactUsModel, CustomerModel, OrderModel } = require("../models");
const { comparePassword, generateToken, hashPassword } = require('../services/passwordUtils');

const contactSchema = Joi.object({
    name: Joi.string().trim().max(255).allow('', null),
    email: Joi.string().trim().max(255).allow('', null),
    phone: Joi.string().trim().max(255).allow('', null),
    message: Joi.string().allow('', null),
});

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required()
});

const registerSchema = Joi.object({
    name: Joi.string().min(2).max(255).required(),
    mobile_no: Joi.string().max(255).allow('', null),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    confirmPassword: Joi.valid(Joi.ref('password')).required()
        .messages({ 'any.only': 'Passwords do not match' })
});

const Home = async (req, res) => {
    try {
        const products = await ProductModel.findAll({ where: { home_page: 1 } });
        res.render('frontend/index', { products })
    } catch (error) {
        console.error("Error Home Page:", error);
        res.status(500).send("Internal Server Error");
    }
};

const ProductsAll = async (req, res) => {
    try {
        const products = await ProductModel.findAll({ order: [['id', 'desc']] });
        res.render('frontend/products', { products })
    } catch (error) {
        console.error("Error Products All=>", err);
        res.status(500).send("Internal server error");
    }
}

const ContactPage = async (req, res) => {
    res.render('frontend/contacts')
}

const ContactStore = async (req, res) => {
    try {
        const { error, value } = contactSchema.validate(req.body);
        if (error) return res.status(400).json({ success: false, message: error.details[0].message });
        await ContactUsModel.create({ ...value });
        res.redirect("/");
    } catch (err) {
        console.error('Error saving contact:', err);
        res.status(500).send("Internal server error");
    }
}

const ProductDetail = async (req, res) => {
    try {
        const { slug } = req.params;
        const product = await ProductModel.findOne({ where: { sku: slug } });
        if (!product) return res.status(404).send("404 not found");
        res.render('frontend/product-detail', { product });
    } catch (error) {
        console.error("Error fetching product detail:", error);
        res.status(500).send("Internal Server Error");
    }
}

const CartPage = async (req, res) => {
    res.render('frontend/cart')
}

const LoginPage = async (req, res) => {
    res.render('frontend/login')
}

const Login = async (req, res) => {
    try {
        const { error, value } = loginSchema.validate(req.body);
        if (error) return res.status(400).render('frontend/login', { error: error.details[0].message });

        const { email, password } = value;
        const user = await CustomerModel.findOne({ where: { email } });
        if (!user) return res.status(400).render('frontend/login', { error: 'Invalid email or password' });

        const isMatch = await comparePassword(password, user.password);
        if (!isMatch) return res.status(400).render('frontend/login', { error: 'Invalid email or password' });

        const token = await generateToken(user);
        res.cookie('auth_token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 24 * 60 * 60 * 1000 });
        res.redirect('/');
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).render('frontend/login', { error: 'Internal server error' });
    }
}

const RegisterPage = async (req, res) => {
    res.render('frontend/register')
}

const Register = async (req, res) => {
    try {
        const { error, value } = registerSchema.validate(req.body);
        if (error) return res.status(400).render('frontend/register', { error: error.details[0].message });

        const { name, email, password, mobile_no } = value;
        const existing = await CustomerModel.findOne({ where: { email } });
        if (existing) return res.status(400).render('frontend/register', { error: 'Email already registered' });

        const hashedPassword = await hashPassword(password);
        const newUser = await CustomerModel.create({ name, email, mobile_no, password: hashedPassword });
        const token = await generateToken(newUser);
        res.cookie('auth_token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 24 * 60 * 60 * 1000 });
        res.redirect('/');
    } catch (error) {
        console.error('Registration error:', err);
        res.status(500).render('frontend/register', { error: 'Internal server error' });
    }
}

const PrivacyPolicy = async (req, res) => {
    res.render('frontend/privacy-policy')
}

const TermService = async (req, res) => {
    res.render('frontend/term-service')
}

const ShippingPolicy = async (req, res) => {
    res.render('frontend/shipping-policy')
}

const ContactInformation = async (req, res) => {
    res.render('frontend/contact-information')
}

const Logout = (req, res) => {
    res.clearCookie('auth_token');
    res.redirect('/login');
};

const ThankYouPage = async (req, res) => {
    try {
        res.render('frontend/thank-you')
    } catch (error) {
        console.error("Error fetching thankYouPage:", error);
        res.status(500).send("Internal Server Error");
    }
};

module.exports = { Home, ProductsAll, ContactPage, ContactStore, ProductDetail, CartPage, PrivacyPolicy, TermService, ShippingPolicy, ContactInformation, LoginPage, RegisterPage, Register, Login, Logout, ThankYouPage };