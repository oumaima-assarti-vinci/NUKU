import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  try {
    const { name, email, comment } = await req.json()

    if (!name || !email || !comment) {
      return NextResponse.json({ error: 'Champs manquants.' }, { status: 400 })
    }

    const{data,error} = await resend.emails.send({
   from: 'NUKU Contact <contact@nuku.be>',
to: 'contact@nuku.be',
      // Reply-to = l'adresse du visiteur, pour répondre directement
      replyTo: email,
      subject: `Nouveau message de ${name}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #fff; border: 1px solid #e5e5e5; border-radius: 12px;">
          <img src="https://nuku.be/image/logo.png" alt="NUKU" style="height: 48px; margin-bottom: 24px;" />
          <h2 style="font-size: 20px; font-weight: 700; margin-bottom: 24px; color: #111;">
            Nouveau message via le formulaire de contact
          </h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; color: #666; width: 120px; font-size: 14px;">Nom</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; font-weight: 600; font-size: 14px; color: #111;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; color: #666; font-size: 14px;">Email</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; font-size: 14px;">
                <a href="mailto:${email}" style="color: #E8860A; text-decoration: none; font-weight: 600;">${email}</a>
              </td>
            </tr>
          </table>
          <div style="margin-top: 24px;">
            <p style="font-size: 14px; color: #666; margin-bottom: 8px;">Message :</p>
            <div style="background: #f9f9f9; border-radius: 8px; padding: 16px; font-size: 15px; color: #111; line-height: 1.6; white-space: pre-wrap;">${comment}</div>
          </div>
          <p style="margin-top: 32px; font-size: 12px; color: #aaa;">
            Ce message a été envoyé depuis le formulaire de contact de nuku.be
          </p>
        </div>
      `,
    })
    console.log('✅ data:', data)
console.log('❌ error:', error)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Resend error:', err)
    return NextResponse.json({ error: 'Erreur lors de l\'envoi.' }, { status: 500 })
  }
}