// signup , login ,  changePassword
const User = require('./../models/user');
const Profile = require('./../models/profile');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const cookie = require('cookie');
const mailSender = require('../utils/mailSender');
const { passwordUpdated } = require("../mail/templates/passwordUpdate");

// ================ SIGNUP ================
exports.signup = async (req, res) => {
    try {
        // extract data 
        const { firstName, lastName, email, password, confirmPassword,
            accountType, contactNumber } = req.body;

        // validation
        if (!firstName || !lastName || !email || !password || !confirmPassword || !accountType) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        // check both pass matches or not
        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Password & confirm password do not match, Please try again'
            });
        }

        // check user have registered already
        const checkUserAlreadyExits = await User.findOne({ email });

        // if yes ,then say to login
        if (checkUserAlreadyExits) {
            return res.status(400).json({
                success: false,
                message: 'User already registered, please login'
            });
        }

        // hash - secure password
        let hashedPassword = await bcrypt.hash(password, 10);

        // additionDetails
        const profileDetails = await Profile.create({
            gender: null, dateOfBirth: null, about: null, contactNumber: null
        });

        // Set approved status: Instructors need approval, Students are auto-approved
        const approved = accountType === "Instructor" ? false : true;

        console.log('Creating user with data:', {
            firstName,
            lastName,
            email,
            accountType,
            approved,
            hasProfile: !!profileDetails._id
        });

        // create entry in DB
        const userData = await User.create({
            firstName, 
            lastName, 
            email, 
            password: hashedPassword, 
            contactNumber,
            accountType: accountType, 
            additionalDetails: profileDetails._id,
            approved: approved,
            image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`
        });

        console.log('User created successfully:', userData._id);

        // return success message
        res.status(200).json({
            success: true,
            message: 'User Registered Successfully'
        });
    }

    catch (error) {
        console.log('Error while registering user (signup)');
        console.log('Error details:', error);
        console.log('Error message:', error.message);
        console.log('Error stack:', error.stack);
        
        // Handle specific MongoDB validation errors
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map(err => err.message).join(', ');
            return res.status(400).json({
                success: false,
                error: validationErrors,
                message: `Validation Error: ${validationErrors}`
            });
        }
        
        // Handle duplicate key errors (e.g., email already exists)
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                error: error.message,
                message: 'User with this email already exists'
            });
        }
        
        res.status(500).json({
            success: false,
            error: error.message,
            message: error.message || 'User cannot be registered, Please try again'
        })
    }
}


// ================ LOGIN ================
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        // check user is registered and saved data in DB
        let user = await User.findOne({ email }).populate('additionalDetails');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'You are not registered with us'
            });
        }


        // comapare given password and saved password from DB
        if (await bcrypt.compare(password, user.password)) {
            const payload = {
                email: user.email,
                id: user._id,
                accountType: user.accountType // This will help to check whether user have access to route, while authorzation
            };

            // Generate token 
            const token = jwt.sign(payload, process.env.JWT_SECRET, {
                expiresIn: "24h",
            });

            user = user.toObject();
            user.token = token;
            user.password = undefined; // we have remove password from object, not DB


            // cookie
            const cookieOptions = {
                expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
                httpOnly: true
            }

            res.cookie('token', token, cookieOptions).status(200).json({
                success: true,
                user,
                token,
                message: 'User logged in successfully'
            });
        }
        // password not match
        else {
            return res.status(401).json({
                success: false,
                message: 'Password not matched'
            });
        }
    }

    catch (error) {
        console.log('Error while Login user');
        console.log(error);
        res.status(500).json({
            success: false,
            error: error.message,
            messgae: 'Error while Login user'
        })
    }
}


// ================ CHANGE PASSWORD ================
exports.changePassword = async (req, res) => {
    try {
        // extract data
        const { oldPassword, newPassword, confirmNewPassword } = req.body;

        // validation
        if (!oldPassword || !newPassword || !confirmNewPassword) {
            return res.status(403).json({
                success: false,
                message: 'All fileds are required'
            });
        }

        // get user
        const userDetails = await User.findById(req.user.id);

        // validate old passowrd entered correct or not
        const isPasswordMatch = await bcrypt.compare(
            oldPassword,
            userDetails.password
        )

        // if old password not match 
        if (!isPasswordMatch) {
            return res.status(401).json({
                success: false, message: "Old password is Incorrect"
            });
        }

        // check both passwords are matched
        if (newPassword !== confirmNewPassword) {
            return res.status(403).json({
                success: false,
                message: 'The password and confirm password do not match'
            })
        }


        // hash password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // update in DB
        const updatedUserDetails = await User.findByIdAndUpdate(req.user.id,
            { password: hashedPassword },
            { new: true });


        // send email
        try {
            const emailResponse = await mailSender(
                updatedUserDetails.email,
                'Password for your account has been updated',
                passwordUpdated(
                    updatedUserDetails.email,
                    `Password updated successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`
                )
            );
            // console.log("Email sent successfully:", emailResponse);
        }
        catch (error) {
            console.error("Error occurred while sending email:", error);
            return res.status(500).json({
                success: false,
                message: "Error occurred while sending email",
                error: error.message,
            });
        }


        // return success response
        res.status(200).json({
            success: true,
            mesage: 'Password changed successfully'
        });
    }

    catch (error) {
        console.log('Error while changing passowrd');
        console.log(error)
        res.status(500).json({
            success: false,
            error: error.message,
            messgae: 'Error while changing passowrd'
        })
    }
}