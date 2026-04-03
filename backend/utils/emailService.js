import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export const sendLoginEmail = async (email, name) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "New Login Detected - Raksha App",
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 10px; overflow: hidden;">
          <div style="background-color: #9333ea; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Raksha Alerts</h1>
          </div>
          <div style="padding: 30px; background-color: #ffffff;">
            <h2 style="color: #333333; margin-top: 0;">Hello ${name},</h2>
            <p style="color: #555555; line-height: 1.6;">
              We detected a new login to your Raksha account on <strong>${new Date().toLocaleString()}</strong>.
            </p>
            <p style="color: #555555; line-height: 1.6;">
              If this was you, no further action is required. If you did not authorize this login, please contact support immediately or change your password.
            </p>
            <div style="margin-top: 30px; padding: 15px; background-color: #fca5a5; border-radius: 8px; text-align: center;">
              <p style="margin: 0; color: #991b1b; font-weight: bold;">
                For emergencies, use the Raksha SOS feature.
              </p>
            </div>
          </div>
          <div style="background-color: #f9fafb; padding: 15px; text-align: center; border-top: 1px solid #e0e0e0;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
              &copy; ${new Date().getFullYear()} Raksha App. All rights reserved.
            </p>
          </div>
        </div>
      `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent: " + info.response);
    } catch (error) {
        console.error("Error sending email:", error);
    }
};

export const sendSOSEmail = async (contacts, userName, locationUrl) => {
    try {
        const emails = contacts.map(c => c.email).filter(Boolean);
        if (emails.length === 0) return;

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: emails.join(","),
            subject: `🚨 EMERGENCY SOS from ${userName} 🚨`,
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 2px solid #ef4444; border-radius: 10px; overflow: hidden;">
          <div style="background-color: #ef4444; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🚨 SOS ALERT 🚨</h1>
          </div>
          <div style="padding: 30px; background-color: #ffffff;">
            <h2 style="color: #333333; margin-top: 0;">Emergency from ${userName}</h2>
            <p style="color: #555555; line-height: 1.6; font-size: 16px;">
              <strong>${userName}</strong> has triggered an SOS alert from the Raksha application. They may be in danger and need immediate assistance.
            </p>
            <div style="margin-top: 25px; padding: 15px; background-color: #fef2f2; border: 1px solid #fca5a5; border-radius: 8px; text-align: center;">
              <p style="margin: 0; color: #991b1b; font-weight: bold; font-size: 18px;">
                View Last Known Map Location:
              </p>
              <a href="${locationUrl}" style="display: inline-block; margin-top: 15px; padding: 12px 25px; background-color: #ef4444; color: white; text-decoration: none; font-weight: bold; border-radius: 5px;">
                Open Coordinates
              </a>
            </div>
          </div>
          <div style="background-color: #111827; padding: 15px; text-align: center;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
              This is an automated emergency dispatch from the Raksha App.
            </p>
          </div>
        </div>
      `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("SOS Email sent: " + info.response);
    } catch (error) {
        console.error("Error sending SOS email:", error);
    }
};
