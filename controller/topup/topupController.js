const axios = require("axios");
const db = require("../../model");
const Topup = db.topUp;
const Wallet = db.wallet;

exports.intitializeKhaltiPayment = async (req, res, next) => {
  const khaltiPublicKey = process.env.KHALTI_PUBLIC_KEY;
  const khaltiSecretKey = process.env.KHALTI_SECRET_KEY;
  const khaltiMinAmount = process.env.KHALTI_MIN_AMOUNT;
  const khaltiMaxAmount = process.env.KHALTI_MAX_AMOUNT;
  const { amount } = req.body;
  const { walletId } = req.params;
  // const amount = 100;

  if (!amount) {
    return res.status(400).json({
      message: "You must insert the amount !",
    });
  }

  if (amount < khaltiMinAmount || amount > khaltiMaxAmount) {
    return res.status(400).json({
      message: `Amount should be between Rs.${khaltiMinAmount} and Rs.${khaltiMaxAmount}`,
    });
  }

  const khaltiFormData = {
    return_url: `http://localhost:5173/topup/check-payment`,
    website_url: "http://localhost:5173",
    amount: amount * 100,
    purchase_order_id: "test1",
    purchase_order_name: "test",
  };

  //Initialize the khalti epayment

  try {
    const response = await axios.post(
      "https://a.khalti.com/api/v2/epayment/initiate/",
      khaltiFormData,
      {
        headers: { Authorization: `Key ${khaltiSecretKey}` },
      }
    );
    console.log(response, "RESP");

    // Initialize the topup
    const topUp = await Topup.create({
      id: response.data.pidx,
      balance: amount,
      paymentMethod: "khalti",
      status: "Initiated",
      walletId: walletId,
    });

    return res.json({
      message: "Payment initiation successful.",
      data: response.data,
      topUp: topUp.balance,
    });
  } catch (error) {
    console.log(error);
  }
};

//Check if the khalti payment is successful or not
exports.checkKhaltiPayment = async (req, res, next) => {
  const {
    pidx,
    txnId,
    amount,
    mobile,
    purchase_order_id,
    purchase_order_name,
    transaction_id,
  } = req.query;

  if (
    !pidx ||
    !txnId ||
    !amount ||
    !mobile ||
    !purchase_order_id ||
    !purchase_order_name ||
    !transaction_id
  ) {
    res.status(400).json({
      message: "Payment failed.",
      redirectURL: "Enter redirect url here...",
    });
    return;
  }
  res.redirect(`verifyPayment/${pidx}`);
};

// Re-assure if the khalti payment is completed or not
exports.verifyKhaltiPayment = async (req, res, next) => {
  const { pidx } = req.params;

  try {
    const lookupRequest = {
      pidx: pidx,
    };
    const response = await axios.post(
      "https://a.khalti.com/api/v2/epayment/lookup/",
      lookupRequest,
      {
        headers: { Authorization: `Key ${process.env.KHALTI_SECRET_KEY}` },
      }
    );
    console.log(response);
    //If payment is successful, change the status of top up to "Completed"
    if (response.data.status === "Completed") {
      const updateStatus = await Topup.findOne({
        where: {
          id: response.data.pidx,
        },
      });

      if (updateStatus.transaction_id == response.data.transaction_id) {
        return res.status(400).json({ message: "Already topup" });
      }

      updateStatus.transaction_id = response.data.transaction_id;
      updateStatus.refunded = response.data.refunded;
      updateStatus.fee = response.data.fee;
      updateStatus.status = response.data.status;
      let newStatus = await updateStatus.save();
      console.log(newStatus, "new sta");
      //If the status is successful, update balance of user in the wallet
      if (newStatus.status === response.data.status) {
        const topUpWallet = await Wallet.findOne({
          where: {
            id: updateStatus.walletId,
          },
        });
        console.log(response.data.total_amount, "TOTAL AMOUNT");

        topUpWallet.balance += response.data.total_amount / 100;
        let newTopWallet = await topUpWallet.save();

        res.status(200).json({
          message: "Wallet top up successful",
          data: newTopWallet,
          res: response.data,
        });
      }
    } else {
      // If payment is not successful, send a JSON response with an error message
      res.status(400).json({
        message: "failed Payment!",
        res: response.data,
        status: response.data.status,
      });
    }
  } catch (error) {
    next(error);
  }
};

//view user topup
exports.displayTopUp = async (req, res, next) => {
  const walletId = req.walletId;
  if (!walletId) return next(customErrorHandler(400, "you don't have wallet"));

  try {
    const findTopUp = await Topup.findAll({
      where: { walletId },
      attributes: ["transaction_id", "balance", "status", "paymentMethod"],
      order: [["createdAt", "DESC"]],
    });
    res.status(200).json(findTopUp);
  } catch (err) {
    next(err);
  }
};

// display all user topup
exports.displayAllUserTopUp = async (req, res) => {
  const topUp = await Topup.findAll({
    attributes: ["transaction_id", "balance", "status", "paymentMethod"],
    order: [["createdAt", "DESC"]],
    include: [
      {
        model: db.wallet,
        attributes: ["balance"],
        include: [{ model: db.user, attributes: ["username"] }],
      },
    ],
  });

  return res.json(topUp);
};
