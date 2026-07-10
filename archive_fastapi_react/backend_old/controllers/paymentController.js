const processMockPayment = async (req, res) => {
    try {
        const { amount, method, paymentDetails } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ message: 'Số tiền thanh toán không hợp lệ' });
        }

        const selectedMethod = method === 'card' ? 'card' : 'COD';

        if (selectedMethod === 'card') {
            const { cardNumber, expiry, cvc } = paymentDetails || {};

            if (!cardNumber || !expiry || !cvc) {
                return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin thẻ' });
            }

            if (!/^\d{13,19}$/.test(cardNumber.replace(/\s+/g, '')) || !/^\d{3,4}$/.test(cvc)) {
                return res.status(400).json({ message: 'Thông tin thẻ không hợp lệ' });
            }
        }

        const transactionId = `TXN-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
        res.json({
            success: true,
            transactionId,
            status: selectedMethod === 'card' ? 'Paid' : 'Pending',
            paymentMethod: selectedMethod,
            message: 'Thanh toán thành công',
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    processMockPayment,
};
