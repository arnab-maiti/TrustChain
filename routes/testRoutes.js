const express = require('express');
const sendEmail = require( '../src/utils/sendEmail.js');
const router = express.Router();
router.get('/test-email', async(req,res)=>{
try{
    await sendEmail(
        "arnabmaiti228@gmail.com",
        "Test Email from TrustChain",
        "Your otp is 483921"
    );
    res.status(200).json({
        success:true,
        message: "Test email sent successfully"
    })
    }catch(error){
        console.log(error);
        res.status(500).json({
      success: false,
      message: "Failed to send email",
    });
    }
}
);
module.exports=router;