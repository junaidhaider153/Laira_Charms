import { NotificationPayload, RenderedEmail } from './types';

function formatPaisa(amountInPaisa: number | undefined): string {
  if (typeof amountInPaisa !== 'number') return 'PKR 0';
  return `PKR ${(amountInPaisa / 100).toLocaleString('en-PK', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

export function renderEmail(payload: NotificationPayload): RenderedEmail {
  const { eventType, recipientName, data } = payload;
  const storeUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  switch (eventType) {
    case 'verify_email': {
      const verifyUrl = String(data.verifyUrl || `${storeUrl}/auth/verify`);
      return {
        subject: 'Verify your Laira Charms Account',
        textContent: `Hello ${recipientName},\n\nPlease verify your email address by opening the following link:\n${verifyUrl}\n\nWarm regards,\nLaira Charms Studio`,
        htmlContent: `<div style="font-family: sans-serif; color: #2D2A26; max-width: 600px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #6C5CE7;">Laira Charms Studio</h2>
          <p>Hello ${recipientName},</p>
          <p>Please verify your email address to access your order history and bespoke keepsakes:</p>
          <p style="margin: 24px 0;"><a href="${verifyUrl}" style="background-color: #6C5CE7; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Verify Email Address</a></p>
          <p style="color: #64748B; font-size: 14px;">If you did not request this, you can safely ignore this email.</p>
        </div>`,
      };
    }

    case 'password_reset': {
      const resetUrl = String(data.resetUrl || `${storeUrl}/auth/update-password`);
      return {
        subject: 'Reset your Laira Charms Password',
        textContent: `Hello ${recipientName},\n\nWe received a request to reset your password. Open the link below:\n${resetUrl}\n\nThis link will expire shortly. If you did not make this request, please ignore this email.`,
        htmlContent: `<div style="font-family: sans-serif; color: #2D2A26; max-width: 600px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #6C5CE7;">Laira Charms Studio</h2>
          <p>Hello ${recipientName},</p>
          <p>We received a request to reset your account password. Click below to choose a new password:</p>
          <p style="margin: 24px 0;"><a href="${resetUrl}" style="background-color: #6C5CE7; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Reset Password</a></p>
          <p style="color: #64748B; font-size: 14px;">If you did not request a password reset, no action is needed.</p>
        </div>`,
      };
    }

    case 'guest_access': {
      const accessUrl = String(data.accessUrl || `${storeUrl}/orders`);
      return {
        subject: 'Access your Laira Charms Order & Messages',
        textContent: `Hello ${recipientName},\n\nUse this secure link to view your order and artisan conversation thread:\n${accessUrl}\n\nWarm regards,\nLaira Charms Studio`,
        htmlContent: `<div style="font-family: sans-serif; color: #2D2A26; max-width: 600px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #6C5CE7;">Laira Charms Studio</h2>
          <p>Hello ${recipientName},</p>
          <p>Click below to securely access your artisanal keepsake order and conversation thread:</p>
          <p style="margin: 24px 0;"><a href="${accessUrl}" style="background-color: #6C5CE7; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">View Order & Messages</a></p>
        </div>`,
      };
    }

    case 'order_placed': {
      const orderRef = String(data.orderReference || 'N/A');
      const totalAmount = formatPaisa(Number(data.totalPaisa));
      const paymentUrl = `${storeUrl}/orders/${orderRef}/payment`;
      return {
        subject: `Order Confirmed (${orderRef}) — Manual Payment Instructions`,
        textContent: `Hello ${recipientName},\n\nThank you for ordering with Laira Charms! Your order reference is: ${orderRef}.\nTotal: ${totalAmount}\n\nPlease transfer your payment via Meezan Bank, JazzCash, or EasyPaisa within 48 hours and upload your transfer screenshot:\n${paymentUrl}\n\nWarm regards,\nLaira Charms Studio`,
        htmlContent: `<div style="font-family: sans-serif; color: #2D2A26; max-width: 600px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #6C5CE7;">Laira Charms Studio</h2>
          <p>Hello ${recipientName},</p>
          <p>Thank you for your order! Your unique reference is <strong>${orderRef}</strong>.</p>
          <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <p style="margin: 0; font-size: 16px;"><strong>Order Total:</strong> ${totalAmount}</p>
            <p style="margin: 8px 0 0 0; font-size: 14px; color: #64748B;">Meezan Bank, JazzCash & EasyPaisa accepted.</p>
          </div>
          <p>Please complete your payment within 48 hours and upload your transfer receipt to secure your crafting queue spot:</p>
          <p style="margin: 24px 0;"><a href="${paymentUrl}" style="background-color: #6C5CE7; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Upload Payment Proof</a></p>
        </div>`,
      };
    }

    case 'proof_received': {
      const orderRef = String(data.orderReference || 'N/A');
      return {
        subject: `Payment Proof Received — Order ${orderRef}`,
        textContent: `Hello ${recipientName},\n\nWe received your payment receipt for order ${orderRef}. Our studio team will review and verify your bank/wallet transfer within 2-4 business hours.\n\nWarm regards,\nLaira Charms Studio`,
        htmlContent: `<div style="font-family: sans-serif; color: #2D2A26; max-width: 600px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #6C5CE7;">Laira Charms Studio</h2>
          <p>Hello ${recipientName},</p>
          <p>We received your payment transfer receipt for order <strong>${orderRef}</strong>.</p>
          <p>Our studio team will manually verify the funds in our accounts within 2–4 business hours. You will receive an email confirmation once verified!</p>
        </div>`,
      };
    }

    case 'proof_rejected': {
      const orderRef = String(data.orderReference || 'N/A');
      const rejectionReason = String(data.reason || 'The transaction could not be reconciled.');
      const resubmitUrl = `${storeUrl}/orders/${orderRef}/payment`;
      return {
        subject: `Action Required: Payment Verification for Order ${orderRef}`,
        textContent: `Hello ${recipientName},\n\nYour payment screenshot for order ${orderRef} could not be verified.\nReason: ${rejectionReason}\n\nPlease resubmit your transfer receipt here:\n${resubmitUrl}\n\nWarm regards,\nLaira Charms Studio`,
        htmlContent: `<div style="font-family: sans-serif; color: #2D2A26; max-width: 600px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #E11D48;">Payment Verification Notice</h2>
          <p>Hello ${recipientName},</p>
          <p>Your payment receipt for order <strong>${orderRef}</strong> could not be verified.</p>
          <div style="background-color: #FFF1F2; border: 1px solid #FECDD3; padding: 16px; border-radius: 8px; margin: 16px 0; color: #9F1239;">
            <p style="margin: 0;"><strong>Artisan Note:</strong> ${rejectionReason}</p>
          </div>
          <p>Please check your transaction details and resubmit a clear screenshot:</p>
          <p style="margin: 24px 0;"><a href="${resubmitUrl}" style="background-color: #E11D48; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Resubmit Payment Receipt</a></p>
        </div>`,
      };
    }

    case 'payment_verified': {
      const orderRef = String(data.orderReference || 'N/A');
      const orderUrl = `${storeUrl}/orders/${orderRef}`;
      return {
        subject: `Payment Verified — Order ${orderRef} is in Production!`,
        textContent: `Hello ${recipientName},\n\nGreat news! Your payment for order ${orderRef} has been verified by the artisan studio.\nYour handmade keepsake is now queued for crafting.\n\nView order status:\n${orderUrl}\n\nWarm regards,\nLaira Charms Studio`,
        htmlContent: `<div style="font-family: sans-serif; color: #2D2A26; max-width: 600px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #10B981;">Payment Verified!</h2>
          <p>Hello ${recipientName},</p>
          <p>Your payment for order <strong>${orderRef}</strong> has been successfully verified by our studio artisan.</p>
          <p>Your handmade polymer clay/resin keepsakes are now officially scheduled for production!</p>
          <p style="margin: 24px 0;"><a href="${orderUrl}" style="background-color: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">View Order Status</a></p>
        </div>`,
      };
    }

    case 'order_in_production': {
      const orderRef = String(data.orderReference || 'N/A');
      return {
        subject: `Crafting in Progress: Order ${orderRef}`,
        textContent: `Hello ${recipientName},\n\nOur artisan has begun hand-sculpting, detailing, and baking your keepsakes for order ${orderRef}!\n\nWarm regards,\nLaira Charms Studio`,
        htmlContent: `<div style="font-family: sans-serif; color: #2D2A26; max-width: 600px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #6C5CE7;">Studio Crafting in Progress</h2>
          <p>Hello ${recipientName},</p>
          <p>We are excited to let you know that our artisan has begun handcrafting your keepsakes for order <strong>${orderRef}</strong>!</p>
          <p>Each piece is carefully sculpted, colored, and kiln-cured to perfection.</p>
        </div>`,
      };
    }

    case 'order_shipped': {
      const orderRef = String(data.orderReference || 'N/A');
      const courierName = String(data.courierName || 'Courier');
      const trackingNumber = String(data.trackingNumber || 'N/A');
      const trackingUrl = String(data.trackingUrl || '#');
      return {
        subject: `Your Laira Charms Order ${orderRef} has Shipped!`,
        textContent: `Hello ${recipientName},\n\nYour artisanal order ${orderRef} has been dispatched!\nCourier: ${courierName}\nTracking Number: ${trackingNumber}\nTrack Package: ${trackingUrl}\n\nWarm regards,\nLaira Charms Studio`,
        htmlContent: `<div style="font-family: sans-serif; color: #2D2A26; max-width: 600px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #6C5CE7;">Your Keepsakes are on the Way!</h2>
          <p>Hello ${recipientName},</p>
          <p>Your order <strong>${orderRef}</strong> has been hand-packaged and handed over to our delivery partner.</p>
          <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <p style="margin: 0;"><strong>Courier:</strong> ${courierName}</p>
            <p style="margin: 4px 0 0 0;"><strong>Tracking Number (CN):</strong> ${trackingNumber}</p>
          </div>
          <p style="margin: 24px 0;"><a href="${trackingUrl}" style="background-color: #6C5CE7; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Track Your Parcel</a></p>
        </div>`,
      };
    }

    case 'order_delivered': {
      const orderRef = String(data.orderReference || 'N/A');
      return {
        subject: `Delivered: Laira Charms Order ${orderRef}`,
        textContent: `Hello ${recipientName},\n\nYour order ${orderRef} has been delivered! We hope you love your handcrafted keepsake.\n\nWarm regards,\nLaira Charms Studio`,
        htmlContent: `<div style="font-family: sans-serif; color: #2D2A26; max-width: 600px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #10B981;">Delivered with Love!</h2>
          <p>Hello ${recipientName},</p>
          <p>Your handcrafted charms from order <strong>${orderRef}</strong> have been marked as delivered.</p>
          <p>We hope they bring a smile to your everyday carry! Remember to avoid extreme moisture or abrasive chemicals to keep your charms sparkling.</p>
        </div>`,
      };
    }

    case 'order_cancelled': {
      const orderRef = String(data.orderReference || 'N/A');
      const reason = String(data.reason || 'Order cancelled upon request.');
      return {
        subject: `Order Update: ${orderRef} Cancelled`,
        textContent: `Hello ${recipientName},\n\nYour order ${orderRef} has been cancelled.\nReason: ${reason}\n\nWarm regards,\nLaira Charms Studio`,
        htmlContent: `<div style="font-family: sans-serif; color: #2D2A26; max-width: 600px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #64748B;">Order Cancellation Notice</h2>
          <p>Hello ${recipientName},</p>
          <p>Your order <strong>${orderRef}</strong> has been cancelled.</p>
          <p><strong>Note:</strong> ${reason}</p>
        </div>`,
      };
    }

    case 'quotation_issued': {
      const requestRef = String(data.requestReference || 'N/A');
      const quotedAmount = formatPaisa(Number(data.quotedAmountPaisa));
      const validUntil = String(data.validUntil || 'Within 7 days');
      const quoteUrl = `${storeUrl}/custom-order/quotes/${requestRef}`;
      return {
        subject: `Quotation Ready for Custom Request ${requestRef}`,
        textContent: `Hello ${recipientName},\n\nOur artisan has reviewed your custom bespoke request and prepared a quote:\nAmount: ${quotedAmount}\nValid Until: ${validUntil}\n\nReview and accept your quote:\n${quoteUrl}\n\nWarm regards,\nLaira Charms Studio`,
        htmlContent: `<div style="font-family: sans-serif; color: #2D2A26; max-width: 600px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #6C5CE7;">Your Bespoke Quotation is Ready!</h2>
          <p>Hello ${recipientName},</p>
          <p>Our artisan has evaluated your bespoke inquiry <strong>${requestRef}</strong> and calculated crafting requirements:</p>
          <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <p style="margin: 0; font-size: 16px;"><strong>Quoted Total:</strong> ${quotedAmount}</p>
            <p style="margin: 4px 0 0 0; font-size: 14px; color: #64748B;">Valid until: ${validUntil}</p>
          </div>
          <p style="margin: 24px 0;"><a href="${quoteUrl}" style="background-color: #6C5CE7; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Review & Accept Quote</a></p>
        </div>`,
      };
    }

    case 'quotation_expiring': {
      const requestRef = String(data.requestReference || 'N/A');
      const quoteUrl = `${storeUrl}/custom-order/quotes/${requestRef}`;
      return {
        subject: `Reminder: Quotation for ${requestRef} Expires in 24 Hours`,
        textContent: `Hello ${recipientName},\n\nYour quotation for custom request ${requestRef} is set to expire in 24 hours. If you wish to proceed with hand-crafting, please review and accept before expiry:\n${quoteUrl}\n\nWarm regards,\nLaira Charms Studio`,
        htmlContent: `<div style="font-family: sans-serif; color: #2D2A26; max-width: 600px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #F59E0B;">Quotation Expiring Soon</h2>
          <p>Hello ${recipientName},</p>
          <p>This is a reminder that your custom keepsake quotation for <strong>${requestRef}</strong> will expire in 24 hours.</p>
          <p style="margin: 24px 0;"><a href="${quoteUrl}" style="background-color: #F59E0B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Review Quote Now</a></p>
        </div>`,
      };
    }

    case 'new_message': {
      const threadTitle = String(data.threadTitle || 'Conversation');
      const messageSnippet = String(data.messageSnippet || 'You have received a new message from the artisan studio.');
      const threadUrl = String(data.threadUrl || `${storeUrl}/conversations`);
      return {
        subject: `New Message: ${threadTitle}`,
        textContent: `Hello ${recipientName},\n\nYou have a new message regarding "${threadTitle}":\n"${messageSnippet}"\n\nReply directly on the website:\n${threadUrl}\n\nWarm regards,\nLaira Charms Studio`,
        htmlContent: `<div style="font-family: sans-serif; color: #2D2A26; max-width: 600px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #6C5CE7;">New Studio Message</h2>
          <p>Hello ${recipientName},</p>
          <p>You have a new message regarding <strong>${threadTitle}</strong>:</p>
          <blockquote style="border-left: 3px solid #6C5CE7; padding-left: 12px; margin: 16px 0; color: #4B5563; font-style: italic;">
            ${messageSnippet}
          </blockquote>
          <p style="margin: 24px 0;"><a href="${threadUrl}" style="background-color: #6C5CE7; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">View & Reply</a></p>
        </div>`,
      };
    }

    default:
      return {
        subject: 'Notification from Laira Charms Studio',
        textContent: `Hello ${recipientName},\n\nYou have an update from Laira Charms Studio.`,
        htmlContent: `<p>Hello ${recipientName}, you have an update from Laira Charms Studio.</p>`,
      };
  }
}
