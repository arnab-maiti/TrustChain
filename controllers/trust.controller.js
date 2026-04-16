const {getTrustScore} = require("../services/trust.service");

const getTrustScoreController = async (req, res) => {
    const {id}=req.params;
    try {
        const score = await getTrustScore(id);
        res.json({ 
            success: true,
            trustScore: score
         });
    }catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message || "Failed to retrieve trust score" 
        });
    }   
};

module.exports = {
    getTrustScoreController,
};