const asyncHandler = require("../src/utils/asyncHandler");
const pool = require("../src/utils/db");
const AppError = require("../src/utils/AppError");  
const generateOTP = asyncHandler(async(productId) => {
     const result = await pool.query(
        'select * from products where id = $1', [productId]
    );
     const product = result.rows[0];
     if (!product) {
        throw new AppError("Product not found", 404);
    }
     if(product.status!=="out-of-delivery"){
        throw new AppError("Product is not available for delivery", 400);
    }
    const oldOTP = await pool.query(
        'delete from delivery_otps where product_id = $1', [productId]
    );
    const otp=Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 2 * 60 * 1000);
    await pool.query(
        'insert into delivery_otps (product_id, otp) values ($1, $2)', [productId, otp]
    );
    return otp;
});
module.exports = {
    generateOTP
}