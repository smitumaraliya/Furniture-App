const jwt = require('jsonwebtoken');
const User = require('../model/user.model');

exports.verifyToken = async (req, res, next) => {
    try {
        let authorization = req.headers['authorization'];
        if (!authorization)
            return res.json({ message: 'Not authorization' });
        let token = authorization.split(" ")[1];
        // console.log(token);
        let { userId } = await jwt.verify(token, process.env.JWT_SECRET);
        let user = await User.findOne({ _id: userId, isDelete: false })
        if (!user)
            return res.json({ message: 'User Authorization Not Fonded' })
        req.user = user;
        next();
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}
