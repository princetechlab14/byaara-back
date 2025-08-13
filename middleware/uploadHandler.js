const multer = require("multer");

const handleMulterErrors = (uploadFn) => {
    return (req, res, next) => {
        uploadFn(req, res, (err) => {
            if (err instanceof multer.MulterError) {
                return res.status(400).json({ status: false, message: err.message });
            } else if (err) {
                return res.status(400).json({ status: false, message: err.message });
            }
            next();
        });
    };
};

module.exports = { handleMulterErrors };