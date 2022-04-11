const express = require("express")
const router = express.Router()
const apiController = require("../controllers/apiController")

router.post('/pay', apiController.payment)

router.get("/validate", apiController.paymentValidation)

router.get("/signup", apiController.userSignUp)

router.get("/offercode", apiController.offerCode)

router.get("/sendmsg", apiController.sendMsg)

router.get("/sendsyllabus", apiController.syllabus)

/*/ api / payment / validate ?
    razorpay_payment_id = pay_HFl1wpc2AF5JtW &
    razorpay_invoice_id = inv_HFkz3n4smNIDUU &
    razorpay_invoice_status = paid &
    razorpay_invoice_receipt = &
razorpay_signature = e94bc049078ede044cad8aa25b9c2cdf56ab606b6e626b43042567d5a80f773a
& user_mobile = 9430170133*/

/*
* {
  id: 'inv_HFkz3n4smNIDUU',
  entity: 'invoice',
  receipt: null,
  invoice_number: null,
  customer_id: 'cust_HFkz3oxLjWWd9P',
  customer_details: {
    id: 'cust_HFkz3oxLjWWd9P',
    name: 'Ayush R',
    email: '1906019@kiit.ac.in',
    contact: '9430170133',
    gstin: null,
    billing_address: null,
    shipping_address: null,
    customer_name: 'Ayush R',
    customer_email: '1906019@kiit.ac.in',
    customer_contact: '9430170133'
  },
  order_id: 'order_HFkz3tMwuyxYRi',
  line_items: [],
  payment_id: 'pay_HFl1wpc2AF5JtW',
  status: 'paid',
  expire_by: null,
  issued_at: 1622105435,
  paid_at: 1622105600,
  cancelled_at: null,
  expired_at: null,
  sms_status: 'sent',
  email_status: null,
  date: 1622105435,
  terms: null,
  partial_payment: false,
  gross_amount: 4000000,
  tax_amount: 0,
  taxable_amount: 0,
  amount: 4000000,
  amount_paid: 4000000,
  amount_due: 0,
  currency: 'INR',
  currency_symbol: '₹',
  description: 'Advanced Training',
  notes: [],
  comment: null,
  short_url: 'https://rzp.io/i/FRZ8XyIeJ',
  view_less: true,
  billing_start: null,
  billing_end: null,
  type: 'link',
  group_taxes_discounts: false,
  created_at: 1622105435,
  idempotency_key: null
}
*/
module.exports = router