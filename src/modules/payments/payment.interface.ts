export interface ICreatePayment {
    rentalRequestId: string;
}

export interface IConfirmPayment {
    stripeSessionId?: string;
    stripePaymentId?: string;
}