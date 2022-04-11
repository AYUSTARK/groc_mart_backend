require('dotenv').config();
const admin = require('firebase-admin');
const serviceAccount = require("../nnfda-4be67-6e0a2bda13ec.json");
const crypto = require("crypto")
const {validateSchema} = require("../util/validateUser")
const razor = require("razorpay")
const Console = require("console");
const nodemailer = require("nodemailer")
const http = require('http');
const urlencode = require('urlencode');
const axios = require('axios');
const razorPay = new razor({
    key_id: process.env.keyId,
    key_secret: process.env.keySecret
})
// admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount)
// });
// const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//         user: process.env.email,
//         pass: process.env.pass
//     }
// });
// const db = admin.firestore();

exports.payment = async (req, res) => {
    const mobile = req.query.mobile
    const amount = req.query.amount
    const params = {
        "type": "link",
        "amount": amount * 100,
        "description": "Groceries",
        "customer": {
            "contact": mobile
        },
        "currency": "INR",
        "sms_notify": 1,
        "email_notify": 1,
        "callback_url": `http://192.168.0.119:3000/api/validate?user_mobile=${mobile}`,
        "callback_method": "get",
    }
    console.log(params)
    razorPay.invoices.create(params).then(response => {
        console.log(response)
        res.status(200).json({
            "status": 200,
            "response": response
        })
    }).catch(error => {
        console.log("RazorPay", error, error.message)
        res.status(400).json({
            "status": 400,
            "message": error.error.reason
        })
    })
}


exports.paymentValidation = async (req, res) => {
    console.log(req.query.user_mobile)
    const invoiceId = req.query.razorpay_invoice_id
    razorPay.invoices.fetch(invoiceId).then(result => {
        console.log(result)
        if (result != null) {
            const invoiceStatus = req.query.razorpay_invoice_status
            const userMobile = req.query.user_mobile
            console.log(result.customer_details.contact === userMobile, result.customer_details.contact, userMobile)
            if (result.status === 'paid' && result.customer_details.contact === userMobile) {
                const paymentId = result.payment_id
                const invoiceReceipt = req.query.razorpay_invoice_receipt
                if (paymentId === req.query.razorpay_payment_id) {
                    // const docRef = db.collection('users').doc(userEmail);
                    const razorpaySignature = req.query.razorpay_signature
                    const payload = invoiceId + "|" + invoiceReceipt + "|" + invoiceStatus + "|" + paymentId
                    const expectedSignature = crypto.createHmac("SHA256", process.env.keySecret).update(payload).digest("hex");
                    console.log("expected  ", expectedSignature === razorpaySignature, expectedSignature)
                    if (expectedSignature === razorpaySignature) {
                        res.render("paymentSuccess", {path: "/api/paySuccess"})
                        return
                        console.log("Firebase Auth validate", user)
                                if (user != null) {
                                    docRef.update({
                                        paid: true,
                                        paymentId: paymentId,
                                        invoiceId: invoiceId,
                                        invoiceReceipt: invoiceReceipt
                                    }).then(() => {
                                            const amtPaid = result.amount_paid
                                            let role = {paid: true}
                                            let roles = user.customClaims;
                                            console.log("ROLES", roles)
                                            if (amtPaid === basicPrice * 100) {
                                                role.paid = true
                                                role.basic = true
                                            } else if (amtPaid === advPrice * 100) {
                                                role.paid = true
                                                role.advanced = true
                                            } else if (amtPaid === stitchingPrice * 100 && result.description === "Stitching Specialization") {
                                                role.paid = true
                                                role.silayi = true
                                            } else if (amtPaid === embroideryPrice * 100 && result.description === "Embroidery Specialization") {
                                                role.paid = true
                                                role.kadhai = true
                                            } else if (amtPaid === crashPrice * 100) {
                                                role.paid = true
                                                role.crash = true
                                            } else if (amtPaid === jewelryPrice * 100) {
                                                role.paid = true
                                                role.jewelry = true
                                            }
                                            if (roles.paid === true) {
                                                role.paid = true
                                            }
                                            if (roles.basic === true) {
                                                role.basic = true
                                            }
                                            if (roles.advanced === true) {
                                                role.advanced = true
                                            }
                                            if (roles.silayi === true) {
                                                role.silayi = true
                                            }
                                            if (roles.kadhai === true) {
                                                role.kadhai = true
                                            }
                                            if (roles.crash === true) {
                                                role.crash = true
                                            }
                                            if (roles.jewelry === true) {
                                                role.jewelry = true
                                            }
                                            if (roles.claimedBasic === true) {
                                                role.claimedBasic = true
                                                role.linkBasic = roles.linkBasic
                                                role.codeBasic = roles.codeBasic
                                            }
                                            if (roles.claimedAdvanced === true) {
                                                role.claimedAdvanced = true
                                                role.linkAdvanced = roles.linkAdvanced
                                                role.codeAdvanced = roles.codeAdvanced
                                            }
                                            if (roles.claimedStitching === true) {
                                                role.claimedStitching = true
                                                role.linkStitching = roles.linkStitching
                                                role.codeStitching = roles.codeStitching
                                            }
                                            if (roles.claimedEmbroidery === true) {
                                                role.claimedEmbroidery = true
                                                role.linkEmbroidery = roles.linkEmbroidery
                                                role.codeEmbroidery = roles.codeEmbroidery
                                            }
                                            if (roles.claimedCrash === true) {
                                                role.claimedCrash = true
                                                role.linkCrash = roles.linkCrash
                                                role.codeCrash = roles.codeCrash
                                            }
                                            if (roles.claimedJewelry === true) {
                                                role.claimedJewelry = true
                                                role.linkJewelry = roles.linkJewelry
                                                role.codeJewelry = roles.codeJewelry
                                            }
                                            admin.auth().setCustomUserClaims(user.uid, role).then(resp => {
                                                    console.log("roles", resp)
                                                    res.render("paymentSuccess", {path: "/api/paySuccess"})
                                                }
                                            )
                                        }
                                    ).catch(err => {
                                        console.error("Firestore", err, err.message)
                                        res.render("databaseError", {path: "/api/error"})
                                    })
                                } else {
                                    res.render("userNotFound", {path: "/api/failed"})
                                }
                    } else {
                        res.render("signatureNotMatch", {path: "/api/failed"})
                    }
                } else {
                    res.render("verificationFailed", {path: "/api/failed"})
                }
            } else {
                res.render("paymentFailed", {path: "/api/failed"})
            }
        } else {
            res.render("notFoundInvoice", {path: "/api/failed"})
        }
    }).catch(error => {
        console.error("RazorValidate", error, error.message)
        res.render("razorError", {path: "/api/error", message: error.message, msg: error.message})
    })
}

exports.userSignUp = async (req, res) => {
    const email = req.query.email
    const mobile = "+91" + req.query.phone
    admin.auth().getUserByEmail(email).then(user => {
        console.log("Firebase Auth validate", user)
        if (user != null) {
            admin.auth().updateUser(user.uid, {phoneNumber: mobile}).then(() => {
                admin.auth().setCustomUserClaims(user.uid, {paid: false})
                    .then(resp => {
                            console.log("roles", resp)
                            res.status(200).json({
                                message: "Role Created Successfully"
                            })
                        }
                    ).catch(err => {
                    console.error("SignUp Claims", err, err.message)
                    res.status(400).json({
                        message: err.message,
                        error: err
                    })
                })
            }).catch(err => {
                console.error("SignUp Update", err, err.message)
                res.status(400).json({
                    message: err.message,
                    error: err
                })
            })
        } else {
            res.status(400).json({
                message: "User Not Found, Contact Support"
            })
        }
    }).catch(error => {
        console.error("Firebase Auth", error, error.message)
        res.status(400).json({
            message: "Authentication Failed, Contact Support",
            error: error.message
        })
    })
}

async function sendWhatsApp(number, message) {
    Console.log("WhatsApp Function Called")
    await axios.post(`http://15.206.92.22:5000/chat/sendmessage/${number}`, {
        "message": message
    }).then(response => {
        console.log("Whatsapp Success1")
        console.log("Whatsapp Success", response.status, response.data)
        /*res.status(200).json({
            "status" :response.status,
            "response": response.data
        })*/
    }).catch(error => {
        console.error("Whatsapp ERor", error)
        /*res.status(400).json({
            "error":error.message
        })*/
    })
}

exports.offerCode = async (req, res) => {
    const email = req.query.email
    const course = req.query.course
    admin.auth().getUserByEmail(email).then(user => {
            console.log("Firebase Auth validate", user)
            if (user != null) {
                const offerRef = admin.firestore().collection("OfferCode").doc(course + "ScratchCode")
                offerRef.get().then(data => {
                        if (data.exists) {
                            const link = data.data().link
                            const code = data.data().code
                            /*res.status(200).json({
                                status: 200,
                                link: data.data().link,
                                code: data.data().code,
                                link1: link,
                                code1: code
                            })*/
                            const role = {
                                paid: false
                            }
                            const roles = user.customClaims;
                            if (roles.paid === true) {
                                role.paid = true
                            }
                            if (roles.basic === true) {
                                role.basic = true
                            }
                            if (roles.advanced === true) {
                                role.advanced = true
                            }
                            if (roles.silayi === true) {
                                role.silayi = true
                            }
                            if (roles.kadhai === true) {
                                role.kadhai = true
                            }
                            if (roles.crash === true) {
                                role.crash = true
                            }
                            if (roles.jewelry === true) {
                                role.jewelry = true
                            }
                            if (roles.claimedBasic === true) {
                                role.claimedBasic = true
                                role.linkBasic = roles.linkBasic
                                role.codeBasic = roles.codeBasic
                            }
                            if (roles.claimedAdvanced === true) {
                                role.claimedAdvanced = true
                                role.linkAdvanced = roles.linkAdvanced
                                role.codeAdvanced = roles.codeAdvanced
                            }
                            if (roles.claimedStitching === true) {
                                role.claimedStitching = true
                                role.linkStitching = roles.linkStitching
                                role.codeStitching = roles.codeStitching
                            }
                            if (roles.claimedEmbroidery === true) {
                                role.claimedEmbroidery = true
                                role.linkEmbroidery = roles.linkEmbroidery
                                role.codeEmbroidery = roles.codeEmbroidery
                            }
                            if (roles.claimedCrash === true) {
                                role.claimedCrash = true
                                role.linkCrash = roles.linkCrash
                                role.codeCrash = roles.codeCrash
                            }
                            if (roles.claimedJewelry === true) {
                                role.claimedJewelry = true
                                role.linkJewelry = roles.linkJewelry
                                role.codeJewelry = roles.codeJewelry
                            }
                            if (course === "Basic") {
                                role.claimedBasic = true
                                role.linkBasic = link
                                role.codeBasic = code
                            } else if (course === "Advanced") {
                                role.claimedAdvanced = true
                                role.linkAdvanced = link
                                role.codeAdvanced = code
                            } else if (course === "Stitching") {
                                role.claimedStitching = true
                                role.linkStitching = link
                                role.codeStitching = code
                            } else if (course === "Embroidery") {
                                role.claimedEmbroidery = true
                                role.linkEmbroidery = link
                                role.codeEmbroidery = code
                            } else if (course === "Crash") {
                                role.claimedCrash = true
                                role.linkCrash = link
                                role.codeCrash = code
                            } else if (course === "Jewelry") {
                                role.claimedJewelry = true
                                role.linkJewelry = link
                                role.codeJewelry = code
                            } else {
                                Console.error("Claimed", course)
                            }
                            console.log("Roles", role)
                            const message = '🤩Woo Hoo..!! 🤩\n\n' +
                                'Congratulations 😊\n\n' +
                                `You just got a discount of 20% on the ${course} Fashion Designing Course. Here's your code:\n` +
                                `${code}\n\n` +
                                'Enroll Now...!!   😇\n\n' +
                                'We have sent you the discount code via E-Mail, WhatsApp & SMS on the details provided by you in our NNFDA App.\n\n' +
                                'Welcome to the NNFDA Family. 💐\n\n' +
                                'Regards,\n' +
                                'Team "NNFDA" (Nisha Natthani Fashion Designing Academy)👩‍🏫\n\n' +
                                'In Association with  "Nisha Natthani Boutique".👗\n'
                            const mailOptions = {
                                from: process.env.email,
                                to: email,
                                subject: `Offer Code for ${course} Course`,
                                text: message
                            };
                            const companyOptions = {
                                from: process.env.email,
                                to: "nnfd.academy@gmail.com",
                                subject: `Offer Enquiry from ${user.displayName}`,
                                text: `${user.displayName} has inquired for offer code of ${course} Course.\n` +
                                    `His details are:\n ${user.displayName}\n ${user.email}\n ${user.phoneNumber}`
                            };
                            transporter.sendMail(mailOptions, function (error, info) {
                                if (error) {
                                    console.log("User Mail Error", error);
                                    res.status(400).json({
                                        status: 400,
                                        error: error,
                                        message: error.message
                                    })
                                } else {
                                    console.log('User Email sent: ' + info);
                                    transporter.sendMail(companyOptions, async function (error, info) {
                                        if (error) {
                                            console.log("Company Mail Error", error);
                                            res.status(400).json({
                                                status: 400,
                                                error: error,
                                                message: error.message
                                            })
                                        } else {
                                            await sendWhatsApp(user.phoneNumber, message)
                                            console.log('Company Email sent: ' + info);
                                            admin.auth().setCustomUserClaims(user.uid, role)
                                                .then(() => {
                                                        res.status(200).json({
                                                            status: 200,
                                                            link: link,
                                                            code: code
                                                        })
                                                    }
                                                ).catch(err => {
                                                console.error("Offer Claims", err, err.message)
                                                res.status(410).json({
                                                    message: err.message,
                                                    error: err
                                                })
                                            })
                                        }
                                    });
                                }
                            });
                        } else {
                            Console.error("Code Document", " not exists")
                            res.status(409).json({
                                status: 409,
                                message: "Error: Code not found"
                            })
                        }
                    }
                ).catch(error => {
                    res.status(408).json({
                        status: 408,
                        message: "Error: " + error.message
                    })
                });
            } else {
                res.status(407).json({
                    status: 407,
                    message: "User not found"
                })
            }
        }
    ).catch(error => {
        console.error("Firebase Auth", error, error.message)
        res.status(406).json({
            status: 406,
            message: "Error: " + error.message
        })
    })
}

exports.syllabus = async (req, res) => {
    const email = req.query.email
    const course = req.query.course
    console.log("Syllabus: " + email)
    let syllabus
    let path
    switch (course) {
        case "1": {
            syllabus = "Basic Training Course.pdf"
            path = __dirname + '../pdfs/Basic Training Course.pdf'
            break;
        }
        case "2": {
            syllabus = "Advanced Training Course.pdf"
            path = __dirname + '../pdfs/Advanced Training Course.pdf'
            break;
        }
        case "3": {
            syllabus = "Embroidery Training Course.pdf"
            path = __dirname + '../pdfs/Embroidery Training Course.pdf'
            break;
        }
        case "4": {
            syllabus = "Stitching Training Course.pdf"
            path = __dirname + '../pdfs/Stitching Training Course.pdf'
            break;
        }
        case "5": {
            syllabus = "Crash Course.pdf"
            path = __dirname + '../pdfs/Crash Course.pdf'
            break;
        }
        case "6": {
            syllabus = "Jewelry Design Course.pdf"
            path = __dirname + '../pdfs/Jewelry Design Course.pdf'
            break;
        }
    }
    const customerSyllabus = {
        from: process.env.email,
        to: email,
        subject: `NNFDA "Your NNFDA ${syllabus} syllabus is here"`,
        text: "Dear student,\n" +
            "Please find the advanced syllabus attached in the following mail. Contact Us for further enquiry.\n\n" +
            "Thanks,\n" +
            "Kind Regards,\n" +
            "NNFDA\n\n" +
            "Mob. 7648013202, 8085959503\n" +
            "Website : https://nnfd.academy\n" +
            "Address : 1st Floor, H.N.3252, W-49, Street-4, Ravigram, Telibandha, Raipur, Chhattisgarh. 492006",
        attachment: {
            filename: {syllabus},
            path: {path},
            contentType: 'application/pdf'
        }
    };
    transporter.sendMail(customerSyllabus, async function (error, info) {
        if (error) {
            console.log("User syllabus Mail Error", error);
            res.status(400).json({
                message: error.message
            })
        } else {
            console.log("User syllabus Mail Sent");
            res.status(200).json({
                message: "Mail sent successfully on registered E-Mail"
            })
        }
    })
}

exports.sendMsg = async (req, res) => {

    const msg = urlencode('Hi there, thank you for sending your first test message from Text local. See how you can send effective SMS campaigns here: https://tx.gl/r/2nGVj/');

    const number = '917485861228';

    const username = 'nnfd.academy@gmail.com';

    const hash = '19ffba294b95848b79be0be423c31a1abe782ef2790b3ac47edf7b65cb516eba'

    const sender = urlencode('600010');

    const data = 'username=' + username + '&hash=' + hash + '&sender=' + sender + '&numbers=' + number + '&message=' + msg;

    const optionsMessage = {
        host: 'api.textlocal.in',
        path: '/send?' + data
    };

    const callback = function (response) {
        let str = '';
        //another chunk of data has been recieved, so append it to `str`

        response.on('data', function (chunk) {

            str += chunk;

        });

        //the whole response has been recieved, so we just print it out here
        response.on('end', function () {

            console.log(str);

        });

    }
//console.log('hello js'))
    http.request(optionsMessage, callback).end();
}