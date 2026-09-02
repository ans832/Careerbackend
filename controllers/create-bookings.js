import { Resend } from 'resend';
import Booking from '../model/Booking.js';

const resend = new Resend(process.env.RESEND_API_KEY);

const createBooking = async (req, res) => {
    try {
        const {
            fullName,
            email,
            phone,
            selectedPlan,
            paymentId,
            dates,
            guideEmail
        } = req.body;

        console.log('Booking Data:', req.body);

        // Validation
        if (
            !fullName ||
            !email ||
            !phone ||
            !selectedPlan ||
            !paymentId ||
            !dates?.firstDate ||
            !dates?.lastDate ||
            !guideEmail
        ) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields.'
            });
        }

        // Save booking
        const newBooking = new Booking({
            studentName: fullName,
            email,
            phone,
            selectedPlan,
            dates: {
                firstDate: new Date(dates.firstDate),
                lastDate: new Date(dates.lastDate),
            },
            paymentId,
            guideEmail,
            createdAt: new Date(),
        });

        await newBooking.save();

        // -----------------------------
        // EMAIL 1: GUIDE
        // -----------------------------

        const guideHTML = `
            <h2>-- New Session Booking --</h2>

            <p><b>Student Name:</b> ${fullName}</p>
            <p><b>Email:</b> ${email}</p>
            <p><b>Phone:</b> ${phone}</p>
            <p><b>Plan:</b> ${selectedPlan}</p>
            <p><b>Session Dates:</b> ${dates.firstDate} to ${dates.lastDate}</p>
            <p><b>Payment ID:</b> ${paymentId}</p>

            <p>
                PLEASE!!
                <b>Reply to ${email}</b>
                with the confirmation and meeting details.
            </p>

            <p>
                For any query contact our support team:
                gansh3764@gmail.com
            </p>

            <br>

            <p>
                AI-NAV
                (901/B Kannon Goyan, Sector 2, Bareilly)
            </p>
        `;

        // -----------------------------
        // EMAIL 2: ADMIN
        // -----------------------------

        const adminHTML = `
            <h2>New Session Booking</h2>

            <p><b>Student Name:</b> ${fullName}</p>
            <p><b>Email:</b> ${email}</p>
            <p><b>Phone:</b> ${phone}</p>
            <p><b>Plan:</b> ${selectedPlan}</p>
            <p><b>Session Dates:</b> ${dates.firstDate} to ${dates.lastDate}</p>
            <p><b>Payment ID:</b> ${paymentId}</p>
        `;

        // -----------------------------
        // EMAIL 3: STUDENT
        // -----------------------------

        const studentHTML = `
            <div style="
                font-family: Arial, sans-serif;
                color: #333;
                max-width: 600px;
                margin: auto;
                border: 1px solid #ddd;
                border-radius: 8px;
                padding: 20px;
            ">

                <h2 style="
                    color: #4A90E2;
                    text-align: center;
                    border-bottom: 1px solid #ddd;
                    padding-bottom: 10px;
                ">
                    📌 Session Booking Confirmation
                </h2>

                <p>Hello ${fullName},</p>

                <p>
                    We are pleased to inform you that a
                    <strong>${selectedPlan}</strong>
                    session has been successfully booked.
                </p>

                <table style="
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 15px;
                ">

                    <tr>
                        <td style="padding: 8px; border: 1px solid #eee;">
                            <strong>Guide Email:</strong>
                        </td>

                        <td style="padding: 8px; border: 1px solid #eee;">
                            ${guideEmail}
                        </td>
                    </tr>

                    <tr>
                        <td style="padding: 8px; border: 1px solid #eee;">
                            <strong>Session conduct between:</strong>
                        </td>

                        <td style="padding: 8px; border: 1px solid #eee;">
                            ${dates.firstDate} to ${dates.lastDate}
                        </td>
                    </tr>

                    <tr>
                        <td style="padding: 8px; border: 1px solid #eee;">
                            <strong>Payment ID:</strong>
                        </td>

                        <td style="padding: 8px; border: 1px solid #eee;">
                            ${paymentId}
                        </td>
                    </tr>

                </table>

                <p style="margin-top: 20px;">
                    If you have any questions or need assistance,
                    please contact our support team at:
                </p>

                <p>
                    <a href="mailto:gansh3764@gmail.com">
                        gansh3764@gmail.com
                    </a>
                </p>

                <p style="
                    margin-top: 30px;
                    font-size: 0.9rem;
                    color: #777;
                ">
                    Thank you for choosing
                    <strong>AI-NAV</strong>
                    for your career guidance needs.
                </p>

                <p style="
                    font-size: 0.9rem;
                    color: #777;
                ">
                    📍 901/B Kannon Goyan, Sector 2, Bareilly
                </p>

            </div>
        `;

        // -----------------------------
        // SEND GUIDE EMAIL
        // -----------------------------

        const guideResult = await resend.emails.send({
            from: 'AI Career Navigator <onboarding@resend.dev>',
            to: [guideEmail],
            subject: `New Booking Received: ${selectedPlan}`,
            html: guideHTML
        });

        if (guideResult.error) {
            console.error('❌ Guide email error:', guideResult.error);

            return res.status(500).json({
                success: false,
                message: 'Booking saved but guide email failed.'
            });
        }

        // -----------------------------
        // SEND ADMIN EMAIL
        // -----------------------------

        const adminResult = await resend.emails.send({
            from: 'AI Career Navigator <onboarding@resend.dev>',
            to: ['gansh3764@gmail.com'],
            subject: `New Booking for ${selectedPlan} - ${fullName}`,
            html: adminHTML
        });

        if (adminResult.error) {
            console.error('❌ Admin email error:', adminResult.error);

            return res.status(500).json({
                success: false,
                message: 'Booking saved but admin email failed.'
            });
        }

        // -----------------------------
        // SEND STUDENT EMAIL
        // -----------------------------

        const studentResult = await resend.emails.send({
            from: 'AI Career Navigator <onboarding@resend.dev>',
            to: [email],
            subject: `Booking Confirmation for ${selectedPlan}`,
            html: studentHTML
        });

        if (studentResult.error) {
            console.error('❌ Student email error:', studentResult.error);

            return res.status(500).json({
                success: false,
                message: 'Booking saved but student email failed.'
            });
        }

        console.log('✅ All booking emails sent successfully');

        return res.status(200).json({
            success: true,
            message: 'Booking saved and emails sent.'
        });

    } catch (error) {
        console.error('❌ Error creating booking:', error);

        return res.status(500).json({
            success: false,
            message: 'Error creating booking.'
        });
    }
};

export { createBooking };