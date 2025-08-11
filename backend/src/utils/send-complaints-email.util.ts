import * as nodemailer from 'nodemailer';

export async function  sendComplaintEmail  (to : string, status : string , name : string )  {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: "Complaint Status Updated",
    html: `<p>Hello ${name},</p>
           <p>Your complaint has been <strong>${status}</strong>.</p>`,
  };

  await transporter.sendMail(mailOptions);
};