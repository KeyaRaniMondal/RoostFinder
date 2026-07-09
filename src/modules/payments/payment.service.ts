import { prisma } from "../../lib/prisma";
import { stripe } from "../../lib/stripe";
import { ICreatePayment } from "./payment.interface";

const createPaymentSession = async (tenantId: string, payload: ICreatePayment) => {
    const { rentalRequestId } = payload;

    const rentalRequest = await prisma.rentalRequest.findUnique({
        where: { id: rentalRequestId },
        include: { property: true },
    });

    if (!rentalRequest) {
        throw new Error("Rental request not found");
    }

    if (rentalRequest.tenantId !== tenantId) {
        throw new Error("You are not authorized to pay for this rental request");
    }

    if (rentalRequest.status !== "APPROVED") {
        throw new Error("Payment can only be made after the rental request is approved");
    }

    // Prevent duplicate payments for the same request
    const existingPayment = await prisma.payment.findUnique({
        where: { rentalRequestId },
    });

    if (existingPayment && existingPayment.status === "SUCCEEDED") {
        throw new Error("This rental request has already been paid for");
    }

    const amount = rentalRequest.property.price;

    // Create or reuse a pending Payment
    const paymentRecord = existingPayment
        ? existingPayment
        : await prisma.payment.create({
            data: {
                amount,
                currency: "usd",
                status: "PENDING",
                tenantId,
                propertyId: rentalRequest.propertyId,
                rentalRequestId,
            },
        });

    const session = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        line_items: [
            {
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: rentalRequest.property.title,
                    },
                    unit_amount: Math.round(amount * 100),
                },
                quantity: 1,
            },
        ],
        success_url: `${process.env.CLIENT_URL}/payments/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.CLIENT_URL}/payments/cancel`,
        metadata: {
            paymentId: paymentRecord.id,
            rentalRequestId,
            tenantId,
        },
    });

    const updatedPayment = await prisma.payment.update({
        where: { id: paymentRecord.id },
        data: {
            stripeSessionId: session.id,
            stripePaymentIntentId: session.payment_intent as string | undefined,
        },
    });

    return {
        payment: updatedPayment,
        checkoutUrl: session.url,
    };
};

const confirmPayment = async (stripeSessionId: string) => {
    const session = await stripe.checkout.sessions.retrieve(stripeSessionId);

    const payment = await prisma.payment.findUnique({
        where: { stripeSessionId },
    });

    if (!payment) {
        throw new Error("Payment record not found for this session");
    }

    if (session.payment_status === "paid") {
        const updated = await prisma.payment.update({
            where: { id: payment.id },
            data: {
                status: "SUCCEEDED",
                stripePaymentIntentId: session.payment_intent as string,
            },
        });
        return updated;
    }

    const updated = await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "FAILED" },
    });

    return updated;
};

// Used by the Stripe webhook, not the confirm endpoint directly
const handleWebhookEvent = async (event: any) => {
    if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        await confirmPayment(session.id);
    }

    if (event.type === "checkout.session.expired") {
        const session = event.data.object;
        const payment = await prisma.payment.findUnique({
            where: { stripeSessionId: session.id },
        });
        if (payment) {
            await prisma.payment.update({
                where: { id: payment.id },
                data: { status: "FAILED" },
            });
        }
    }
};

const getMyPayments = async (tenantId: string) => {
    const payments = await prisma.payment.findMany({
        where: { tenantId },
        include: {
            property: true,
            rentalRequest: true,
        },
        orderBy: { createdAt: "desc" },
    });

    return payments;
};

const getSinglePayment = async (tenantId: string, id: string) => {
    const payment = await prisma.payment.findUnique({
        where: { id },
        include: {
            property: true,
            rentalRequest: true,
        },
    });

    if (!payment) {
        throw new Error("Payment not found");
    }

    if (payment.tenantId !== tenantId) {
        throw new Error("You are not authorized to view this payment");
    }

    return payment;
};

export const paymentService = {
    createPaymentSession,
    confirmPayment,
    handleWebhookEvent,
    getMyPayments,
    getSinglePayment,
};