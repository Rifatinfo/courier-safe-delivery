export const getTransactionId = () => {
  return "TXN_" + Date.now() + "_" + Math.floor(Math.random() * 9999);
};