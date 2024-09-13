const User = require("../model/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const otpGenerator = require('otp-generator');
const { otpMailSender } = require('../helpers/otpMailSender');


exports.userSignUp = async (req, res) => {
    try {
        let user = await User.findOne({ email: req.body.email, isDelete: false });
        if (user) {
            return res.json({ message: 'User Already Existed....' });
        }
        let hashPassword = await bcrypt.hash(req.body.password, 10);
        user = await User.create({ ...req.body, password: hashPassword });
        res.status(201).json({ message: "SignUp SuccessFully Done.", user });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.userLogin = async (req, res) => {
    try {
        let user = await User.findOne({ email: req.body.email, isDelete: false });
        if (!user) {
            return res.json({ message: 'User Not Found....' });
        }
        let comparedPassword = await bcrypt.compare(req.body.password, user.password);
        if (!comparedPassword) {
            return res.json({ message: "Email or Password Does Not Matched." })
        }
        let token = await jwt.sign({ userId: user._id }, process.env.JWT_SECRET)
        res.status(200).json({ message: "Login SuccessFully Done.", token });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.getUserProfile = async (req, res) => {
    try {
        res.json(req.user);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.userProfileUpdate = async (req, res) => {
    try {
        let user = req.user;
        user = await User.findByIdAndUpdate(user._id, { $set: req.body }, { new: true });
        res.status(202).json({ message: "User Profile Updated", user });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.userDelete = async (req, res) => {
    try {
        let user = req.user;
        user = await User.findByIdAndUpdate(user._id, { isDelete: true }, { new: true });
        res.status(200).json({ message: "User Profile Deleted SuccessFully" });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

exports.userPasswordChange = async (req, res) => {
    try {
        let user = req.user;
        let comparedoldPassword = await bcrypt.compare(req.body.oldPassword, user.password);
        if (!comparedoldPassword) {
            return res.json({ message: "Password Does Not Matched." })
        }
        // let comparedNewPassword = await bcrypt.compare(req.body.newPassword, user.password);
        if (req.body.oldPassword === req.body.newPassword) {
            return res.json({ message: "Old-Password and New-Password Are Same, Try Different" })
        }
        let hashPassword = await bcrypt.hash(req.body.newPassword, 10);
        user = await User.findByIdAndUpdate(user._id, { password: hashPassword }, { new: true });
        res.status(200).json({ message: "Password Change SuccessFully Done." });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.userForgotPasword = async (req, res) => {
    try {
        let user = await User.findOne({ email: req.body.email, isDelete: false });
        if (!user) {
            return res.json({ message: 'User Not Found....' });
        }
        // console.log(user);
        
        let otp = otpGenerator.generate(4, { lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false });
        const mailOptions = {
            from: process.env.EMAIL_USER_NAME,
            to: user.email,
            subject: 'Forgot Password Email',
            text: `Your Forgot password otp is ${otp} valid only 5 minutes.`
        };
        await otpMailSender(mailOptions);
        res.send('Otp Send SuccessFully To Your Email.');
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}
