const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

/**
 * Normalizes a Bangladeshi phone number to the standard 11-digit local format: 01XXXXXXXXX
 */
const formatBangladeshNumber = (phoneNumber) => {
  if (!phoneNumber) return '';
  let cleaned = phoneNumber.toString().replace(/[^0-9]/g, '');

  if (cleaned.startsWith('880')) {
    cleaned = cleaned.substring(2);
  } else if (cleaned.startsWith('88') && cleaned.length === 13) {
    cleaned = cleaned.substring(2);
  }

  if (!cleaned.startsWith('0') && cleaned.length === 10) {
    cleaned = '0' + cleaned;
  }

  return cleaned;
};

/**
 * Sends a 6-digit OTP via BulkSMSDhaka Gateway
 * Requirement: Content strictly "Your {Brand/Company Name} OTP is XXXX" and < 70 chars.
 */
const sendPhoneOTP = async (phoneNumber, otp) => {
  const apiKey = process.env.BULK_SMS_API_KEY || '521d62e6434df73619b69ee50c8c3348cd5609d5';
  const callerId = process.env.BULK_SMS_CALLER_ID || '1234';
  const baseUrl = process.env.BULK_SMS_URL || 'https://bulksmsdhaka.net/api/otpsend';

  const formattedNumber = formatBangladeshNumber(phoneNumber);
  if (!formattedNumber || formattedNumber.length !== 11) {
    throw new Error('Invalid mobile number. Please enter an 11-digit Bangladeshi mobile number (01XXXXXXXXX).');
  }

  // Strictly follows BulkSMSDhaka format: "Your {Brand/Company Name} OTP is XXXX"
  const message = `Your Zenivio OTP is ${otp}`;

  const apiUrl = `${baseUrl}?apikey=${encodeURIComponent(apiKey)}&callerID=${encodeURIComponent(callerId)}&number=${encodeURIComponent(formattedNumber)}&message=${encodeURIComponent(message)}`;

  try {
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json, text/plain, */*'
      }
    });

    const rawText = await response.text();
    let data;
    try {
      data = JSON.parse(rawText);
    } catch {
      data = { raw: rawText };
    }

    console.log(`[BulkSMSDhaka] Sent OTP to ${formattedNumber}. Response:`, rawText);

    const isFailed = data.success === 'false' || data.success === false || data.status === 'error';
    const statusCode = String(data.status || '');

    if (isFailed || (statusCode && statusCode !== '100' && statusCode !== '1000')) {
      console.error('[BulkSMSDhaka] API Error:', data.message || data.status);
      
      if (statusCode === '2001' || (data.message && data.message.toLowerCase().includes('balance'))) {
        throw new Error('SMS Gateway Balance Insufficient. Please recharge BulkSMSDhaka account.');
      }
      if (statusCode === '1008' || (data.message && data.message.toLowerCase().includes('whitelisted'))) {
        throw new Error('IP_NOT_WHITELISTED');
      }
      throw new Error(data.message || 'Failed to send SMS OTP via gateway.');
    }

    return { success: true, data };
  } catch (error) {
    console.error('[BulkSMSDhaka] Exception:', error.message);
    throw error;
  }
};

/**
 * Checks remaining balance on BulkSMSDhaka account
 */
const checkSMSBalance = async () => {
  const apiKey = process.env.BULK_SMS_API_KEY || '521d62e6434df73619b69ee50c8c3348cd5609d5';
  const url = `https://bulksmsdhaka.net/api/getBalance?apikey=${encodeURIComponent(apiKey)}`;

  try {
    const response = await fetch(url);
    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch {
      return { raw: text };
    }
  } catch (err) {
    return { status: 'error', message: err.message };
  }
};

module.exports = {
  sendPhoneOTP,
  checkSMSBalance,
  formatBangladeshNumber,
};
