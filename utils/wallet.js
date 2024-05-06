const Wallet = require("../models/Wallet")
const WalletAudit = require("../models/WalletAudit");

exports.debitWallet = async (payload) => {
 try {
   const { userId, amount, source } = payload;
   if (!userId || !amount) {
     return {
       status: "failed",
       message: "UserId and amount are undefined",
     };
   }

   if (amount <= 0) {
     return {
       status: "failed",
       message: "Please enter a valid amount",
     };
   }

   //does wallet exist
   const walletExists = await Wallet.findOne({ user: userId });

   if (!walletExists) {
     return {
       status: "failed",
       message: "User wallet does not exist",
     };
   }

   //insufficient balance check
   if (Number(amount) > Number(walletExists.balance)) {
     return {
       status: "failed",
       message: "Insufficient balance",
     };
   }

   //debit wallet
   const prevBalance = Number(walletExists.balance);
   const currentBalance = Number(walletExists.balance) - Number(amount);

   await Wallet.updateOne(
     { user: walletExists.user },
     { balance: Number(currentBalance.toFixed(2)) }
   );
   //wallet audit
   const walletAudit = {
     user: userId,
     transactionType: "DEBIT",
     transactionAmount: Number(amount),
     source: source.toLowerCase(),
     prevBalance: Number(walletExists.balance),
     currentBalance: Number(currentBalance.toFixed(2)),
   };

   WalletAudit.create(walletAudit);
   return {
     status: "success",
     message: "Wallet debited successfully",
     data: {
       prevBalance,
       currentBalance: Number(currentBalance.toFixed(2)),
     },
   };
 } catch (error) {
   console.log(error);
   return {
     status: "failed",
     message: "An unexpected error occurred, try again later",
   };
 }
};

exports.creditWallet = async (payload) => {
 try {
   const { userId, amount, source } = payload;
   if (!userId || !amount) {
     return {
       status: "failed",
       message: "UserId and amount are undefined",
     };
   }

   if (amount < 0) {
     return {
       status: "failed",
       message: "Please enter a valid amount",
     };
   }

   //does wallet exist
   const walletExists = await Wallet.findOne({ user: userId });

   if (!walletExists) {
     return {
       status: "failed",
       message: "User wallet does not exist",
     };
   }

   const prevBalance = Number(walletExists.balance);
   const currentBalance = Number(walletExists.balance) + Number(amount);

   await Wallet.updateOne(
     { user: walletExists.user },
     { balance: Number(currentBalance.toFixed(2)) }
   );
   //wallet audit
   const walletAudit = {
     user: userId,
     transactionType: "CREDIT",
     transactionAmount: Number(amount),
     source: source.toLowerCase(),
     prevBalance,
     currentBalance: Number(currentBalance.toFixed(2)),
   };

   WalletAudit.create(walletAudit);

   return {
     status: "success",
     message: "Wallet credited successfully",
     data: {},
   };
 } catch (error) {
   console.log(error);
   return {
     status: "failed",
     message: "An unexpected error occurred, try again later",
   };
 }
};

exports.checkForSufficientWallet = async (payload) => {
  try {
    const { userId, amount } = payload;
    if (!userId || !amount) {
      return {
        status: "failed",
        message: "UserId and amount are undefined",
      };
    }
 
    if (amount <= 0) {
      return {
        status: "failed",
        message: "Please enter a valid amount",
      };
    }
 
    //does wallet exist
    const walletExists = await Wallet.findOne({ user: userId });
 
    if (!walletExists) {
      return {
        status: "failed",
        message: "User wallet does not exist",
      };
    }
 
    //insufficient balance check
    if (Number(amount) > Number(walletExists.balance)) {
      return {
        status: "failed",
        message: "Insufficient balance",
      };
    }

    return {
      status: "success",
      message: "Sufficient balance",
    };
  } catch (error) {
    console.log(error);
    return {
      status: "failed",
      message: "An unexpected error occurred, try again later",
    };
  }
 };