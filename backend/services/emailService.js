const { Resend } = require('resend');

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API);

// Email configuration
const FROM_EMAIL = 'HiFella Admin <hifella@thynk.my.id>';
const FRONTEND_URL = process.env.CLIENT_URL || 'https://hifella.thynk.my.id';

/**
 * Send welcome email after registration
 */
const sendRegistrationEmail = async (name, email) => {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Selamat Datang di HiFella! 🎉 - Akun Anda Sedang Diverifikasi',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              margin: 0;
              padding: 0;
              background-color: #f4f4f4;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .email-wrapper {
              background-color: #ffffff;
              border-radius: 8px;
              padding: 40px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .header h1 {
              color: #4F46E5;
              margin: 0;
              font-size: 28px;
            }
            .content {
              margin-bottom: 30px;
            }
            .content p {
              margin: 15px 0;
              font-size: 16px;
            }
            .highlight {
              background-color: #F3F4F6;
              border-left: 4px solid #4F46E5;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .info-box {
              background-color: #EEF2FF;
              border-left: 4px solid #818CF8;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .button {
              display: inline-block;
              padding: 12px 30px;
              background-color: #4F46E5;
              color: #ffffff;
              text-decoration: none;
              border-radius: 6px;
              font-weight: 600;
              margin: 20px 0;
            }
            .feature-list {
              margin: 15px 0;
            }
            .feature-list li {
              margin: 10px 0;
              padding-left: 5px;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #E5E7EB;
              color: #6B7280;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="email-wrapper">
              <div class="header">
                <h1>🎉 Selamat Datang di HiFella!</h1>
              </div>
              <div class="content">
                <p>Halo <strong>${name}</strong>,</p>
                <p>Terima kasih telah mendaftar di <strong>HiFella</strong> - Platform Diskusi Online untuk Pembelajaran Bahasa Inggris yang dirancang khusus untuk mahasiswa dan dosen!</p>
                
                <div class="highlight">
                  <p><strong>📋 Status Pendaftaran Anda</strong></p>
                  <p>✅ <strong>Akun berhasil dibuat!</strong></p>
                  <p>⏳ <strong>Status:</strong> Menunggu Persetujuan Admin</p>
                  <p style="margin-top: 10px; font-size: 14px;">Akun Anda sedang dalam proses verifikasi oleh admin. Anda akan menerima email notifikasi segera setelah akun Anda disetujui. Proses ini biasanya memakan waktu 1-2 hari kerja.</p>
                </div>

                <p><strong>📚 Tentang HiFella</strong></p>
                <p>HiFella adalah platform pembelajaran bahasa Inggris yang memfasilitasi diskusi interaktif antara dosen dan mahasiswa. Platform ini dirancang untuk meningkatkan kemampuan komunikasi bahasa Inggris melalui praktik langsung.</p>

                <p><strong>✨ Fitur-fitur yang Dapat Anda Nikmati:</strong></p>
                <ul class="feature-list">
                  <li><strong>💬 Diskusi Kelompok</strong> - Bergabung dalam ruang diskusi dengan topik bahasa Inggris yang beragam</li>
                  <li><strong>👥 Interaksi Real-time</strong> - Berkomunikasi langsung dengan dosen dan mahasiswa lain</li>
                  <li><strong>📝 Manajemen Profil</strong> - Kelola informasi akademik dan profil pribadi Anda</li>
                  <li><strong>🎯 Pembelajaran Terstruktur</strong> - Akses materi dan diskusi yang terorganisir berdasarkan kategori</li>
                  <li><strong>📊 Tracking Progress</strong> - Pantau perkembangan pembelajaran Anda</li>
                  <li><strong>🔔 Notifikasi Real-time</strong> - Dapatkan update terbaru tentang diskusi dan aktivitas</li>
                </ul>

                <div class="info-box">
                  <p><strong>📧 Informasi Akun Anda:</strong></p>
                  <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
                  <p style="margin: 5px 0;"><strong>Nama:</strong> ${name}</p>
                  <p style="margin-top: 10px; font-size: 14px;">Simpan email ini untuk referensi Anda.</p>
                </div>

                <p><strong>🔜 Langkah Selanjutnya:</strong></p>
                <ol>
                  <li>Tunggu email konfirmasi persetujuan akun dari admin</li>
                  <li>Setelah disetujui, login menggunakan email dan password yang Anda daftarkan</li>
                  <li>Lengkapi profil Anda untuk pengalaman yang lebih baik</li>
                  <li>Mulai bergabung dalam diskusi dan tingkatkan kemampuan bahasa Inggris Anda!</li>
                </ol>

                <p style="text-align: center;">
                  <a href="${FRONTEND_URL}" class="button">Kunjungi HiFella</a>
                </p>

                <p style="font-size: 14px; color: #6B7280; margin-top: 20px;">Jika Anda memiliki pertanyaan atau membutuhkan bantuan, jangan ragu untuk menghubungi admin platform kami.</p>
              </div>
              <div class="footer">
                <p>Email ini dikirim secara otomatis dari sistem HiFella.</p>
                <p>Mohon tidak membalas email ini.</p>
                <p>&copy; ${new Date().getFullYear()} HiFella - Interactive English Learning Platform. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('Error sending registration email:', error);
      throw error;
    }

    console.log('Registration email sent successfully:', data);
    return data;
  } catch (error) {
    console.error('Failed to send registration email:', error);
    throw error;
  }
};

/**
 * Send notification email after profile update
 */
const sendProfileUpdateEmail = async (name, email, changes) => {
  try {
    // Build changes list
    let changesList = '';
    if (changes.name) changesList += `<li><strong>Nama:</strong> ${changes.name}</li>`;
    if (changes.email) changesList += `<li><strong>Email:</strong> ${changes.email}</li>`;
    if (changes.nim) changesList += `<li><strong>NIM:</strong> ${changes.nim}</li>`;
    if (changes.nip) changesList += `<li><strong>NIP:</strong> ${changes.nip}</li>`;
    if (changes.university) changesList += `<li><strong>Universitas:</strong> Diperbarui</li>`;
    if (changes.faculty) changesList += `<li><strong>Fakultas:</strong> Diperbarui</li>`;
    if (changes.program) changesList += `<li><strong>Program Studi:</strong> Diperbarui</li>`;

    const currentDate = new Date().toLocaleString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Jakarta'
    });

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Notifikasi Perubahan Profil - HiFella',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              margin: 0;
              padding: 0;
              background-color: #f4f4f4;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .email-wrapper {
              background-color: #ffffff;
              border-radius: 8px;
              padding: 40px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .header h1 {
              color: #059669;
              margin: 0;
              font-size: 28px;
            }
            .content {
              margin-bottom: 30px;
            }
            .content p {
              margin: 15px 0;
              font-size: 16px;
            }
            .highlight {
              background-color: #F0FDF4;
              border-left: 4px solid #059669;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .highlight ul {
              margin: 10px 0;
              padding-left: 20px;
            }
            .highlight li {
              margin: 8px 0;
            }
            .info-box {
              background-color: #EEF2FF;
              border-left: 4px solid #818CF8;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .warning {
              background-color: #FEF3C7;
              border-left: 4px solid #F59E0B;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .security-tips {
              background-color: #FEF2F2;
              border-left: 4px solid #EF4444;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #E5E7EB;
              color: #6B7280;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="email-wrapper">
              <div class="header">
                <h1>✅ Profil Berhasil Diperbarui</h1>
              </div>
              <div class="content">
                <p>Halo <strong>${name}</strong>,</p>
                <p>Kami mengirimkan email ini untuk memberitahukan bahwa profil akun HiFella Anda telah berhasil diperbarui.</p>
                
                <div class="info-box">
                  <p><strong>🕐 Waktu Perubahan:</strong></p>
                  <p style="margin: 5px 0;">${currentDate} WIB</p>
                </div>

                <div class="highlight">
                  <p><strong>📝 Detail Perubahan yang Dilakukan:</strong></p>
                  <ul>
                    ${changesList}
                  </ul>
                  <p style="font-size: 14px; margin-top: 10px;">Perubahan ini telah tersimpan dan langsung berlaku pada akun Anda.</p>
                </div>

                <p><strong>✓ Apa yang Telah Berubah?</strong></p>
                <p>Informasi profil Anda yang diperbarui akan terlihat di:</p>
                <ul>
                  <li>Halaman profil pribadi Anda</li>
                  <li>Diskusi dan komentar yang Anda buat</li>
                  <li>Daftar anggota kelompok diskusi</li>
                  <li>Informasi yang terlihat oleh dosen dan mahasiswa lain</li>
                </ul>

                <div class="warning">
                  <p><strong>⚠️ Penting - Keamanan Akun:</strong></p>
                  <p><strong>Jika Anda tidak melakukan perubahan ini:</strong></p>
                  <ul style="margin: 10px 0; padding-left: 20px;">
                    <li>Segera ubah password akun Anda</li>
                    <li>Hubungi admin HiFella untuk melaporkan aktivitas mencurigakan</li>
                    <li>Periksa aktivitas login terakhir Anda</li>
                  </ul>
                  <p style="font-size: 14px; margin-top: 10px;">Keamanan akun Anda adalah prioritas kami.</p>
                </div>

                <div class="security-tips">
                  <p><strong>🔒 Tips Keamanan Akun:</strong></p>
                  <ul style="margin: 10px 0; padding-left: 20px; font-size: 14px;">
                    <li>Gunakan password yang kuat dan unik</li>
                    <li>Jangan bagikan password Anda kepada siapapun</li>
                    <li>Logout setelah menggunakan komputer umum/bersama</li>
                    <li>Periksa email notifikasi secara berkala</li>
                    <li>Laporkan aktivitas mencurigakan segera</li>
                  </ul>
                </div>

                <p style="font-size: 14px; color: #6B7280; margin-top: 20px;">Jika Anda memiliki pertanyaan tentang perubahan ini atau membutuhkan bantuan, silakan hubungi admin platform kami.</p>
              </div>
              <div class="footer">
                <p>Email ini dikirim secara otomatis dari sistem HiFella.</p>
                <p>Mohon tidak membalas email ini.</p>
                <p>&copy; ${new Date().getFullYear()} HiFella - Interactive English Learning Platform. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('Error sending profile update email:', error);
      throw error;
    }

    console.log('Profile update email sent successfully:', data);
    return data;
  } catch (error) {
    console.error('Failed to send profile update email:', error);
    throw error;
  }
};

/**
 * Send password reset email
 */
const sendPasswordResetEmail = async (name, email, resetToken) => {
  try {
    const resetUrl = `${FRONTEND_URL}/reset-password?token=${resetToken}`;
    const currentDate = new Date().toLocaleString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Jakarta'
    });

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: '🔐 Permintaan Reset Password - HiFella',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              margin: 0;
              padding: 0;
              background-color: #f4f4f4;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .email-wrapper {
              background-color: #ffffff;
              border-radius: 8px;
              padding: 40px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .header h1 {
              color: #DC2626;
              margin: 0;
              font-size: 28px;
            }
            .content {
              margin-bottom: 30px;
            }
            .content p {
              margin: 15px 0;
              font-size: 16px;
            }
            .highlight {
              background-color: #FEF2F2;
              border-left: 4px solid #DC2626;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .info-box {
              background-color: #EEF2FF;
              border-left: 4px solid #818CF8;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .warning {
              background-color: #FEF3C7;
              border-left: 4px solid #F59E0B;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .button {
              display: inline-block;
              padding: 12px 30px;
              background-color: #DC2626;
              color: #ffffff;
              text-decoration: none;
              border-radius: 6px;
              font-weight: 600;
              margin: 20px 0;
            }
            .link-box {
              background-color: #F9FAFB;
              border: 1px solid #E5E7EB;
              padding: 10px;
              border-radius: 4px;
              word-break: break-all;
              font-size: 12px;
              color: #6B7280;
              margin: 10px 0;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #E5E7EB;
              color: #6B7280;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="email-wrapper">
              <div class="header">
                <h1>🔐 Reset Password Akun Anda</h1>
              </div>
              <div class="content">
                <p>Halo <strong>${name}</strong>,</p>
                <p>Kami menerima permintaan untuk mereset password akun HiFella Anda. Jika Anda yang meminta reset password, silakan ikuti instruksi di bawah ini.</p>
                
                <div class="info-box">
                  <p><strong>📋 Detail Permintaan:</strong></p>
                  <p style="margin: 5px 0;"><strong>Email Akun:</strong> ${email}</p>
                  <p style="margin: 5px 0;"><strong>Waktu Permintaan:</strong> ${currentDate} WIB</p>
                </div>

                <div class="highlight">
                  <p><strong>⏰ PENTING - Link Kadaluarsa dalam 1 Jam</strong></p>
                  <p style="font-size: 14px; margin: 10px 0;">Link reset password ini hanya berlaku selama <strong>1 jam</strong> sejak email ini dikirim. Setelah waktu tersebut, Anda perlu meminta link reset password baru.</p>
                  <p style="font-size: 14px; margin: 10px 0;">Link ini hanya dapat digunakan <strong>satu kali</strong>. Setelah password berhasil direset, link ini tidak dapat digunakan lagi.</p>
                </div>

                <p><strong>📝 Cara Reset Password:</strong></p>
                <ol>
                  <li>Klik tombol "Reset Password" di bawah ini</li>
                  <li>Anda akan diarahkan ke halaman reset password</li>
                  <li>Masukkan password baru Anda (minimal 6 karakter)</li>
                  <li>Konfirmasi password baru Anda</li>
                  <li>Klik tombol "Reset Password" untuk menyimpan</li>
                  <li>Anda akan menerima email konfirmasi setelah berhasil</li>
                </ol>

                <p style="text-align: center;">
                  <a href="${resetUrl}" class="button">Reset Password Sekarang</a>
                </p>

                <p style="font-size: 14px; margin-top: 20px;"><strong>Link tidak berfungsi?</strong></p>
                <p style="font-size: 14px;">Jika tombol di atas tidak berfungsi, copy dan paste link berikut ke browser Anda:</p>
                <div class="link-box">${resetUrl}</div>

                <div class="warning">
                  <p><strong>⚠️ Tidak Meminta Reset Password?</strong></p>
                  <p style="font-size: 14px;">Jika Anda <strong>tidak meminta</strong> reset password, Anda dapat mengabaikan email ini dengan aman. Password akun Anda tidak akan berubah.</p>
                  <p style="font-size: 14px; margin-top: 10px;">Namun, jika Anda sering menerima email reset password yang tidak Anda minta, segera hubungi admin kami karena mungkin ada yang mencoba mengakses akun Anda.</p>
                </div>

                <p><strong>🔒 Tips Membuat Password yang Aman:</strong></p>
                <ul style="font-size: 14px;">
                  <li>Gunakan minimal 8-12 karakter</li>
                  <li>Kombinasikan huruf besar, huruf kecil, angka, dan simbol</li>
                  <li>Hindari menggunakan informasi pribadi (nama, tanggal lahir, dll)</li>
                  <li>Jangan gunakan password yang sama dengan akun lain</li>
                  <li>Gunakan password manager untuk menyimpan password dengan aman</li>
                </ul>

                <p style="font-size: 14px; color: #6B7280; margin-top: 20px;"><strong>Butuh Bantuan?</strong> Jika Anda mengalami kesulitan dalam mereset password, silakan hubungi admin platform kami.</p>
              </div>
              <div class="footer">
                <p>Email ini dikirim secara otomatis dari sistem HiFella.</p>
                <p>Mohon tidak membalas email ini.</p>
                <p>&copy; ${new Date().getFullYear()} HiFella - Interactive English Learning Platform. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('Error sending password reset email:', error);
      throw error;
    }

    console.log('Password reset email sent successfully:', data);
    return data;
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    throw error;
  }
};

/**
 * Send password reset confirmation email
 */
const sendPasswordResetConfirmationEmail = async (name, email) => {
  try {
    const currentDate = new Date().toLocaleString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Jakarta'
    });

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: '✅ Password Berhasil Direset - HiFella',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              margin: 0;
              padding: 0;
              background-color: #f4f4f4;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .email-wrapper {
              background-color: #ffffff;
              border-radius: 8px;
              padding: 40px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .header h1 {
              color: #059669;
              margin: 0;
              font-size: 28px;
            }
            .content {
              margin-bottom: 30px;
            }
            .content p {
              margin: 15px 0;
              font-size: 16px;
            }
            .highlight {
              background-color: #F0FDF4;
              border-left: 4px solid #059669;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .info-box {
              background-color: #EEF2FF;
              border-left: 4px solid #818CF8;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .warning {
              background-color: #FEF3C7;
              border-left: 4px solid #F59E0B;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .security-box {
              background-color: #FEF2F2;
              border-left: 4px solid #EF4444;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .button {
              display: inline-block;
              padding: 12px 30px;
              background-color: #059669;
              color: #ffffff;
              text-decoration: none;
              border-radius: 6px;
              font-weight: 600;
              margin: 20px 0;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #E5E7EB;
              color: #6B7280;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="email-wrapper">
              <div class="header">
                <h1>✅ Password Berhasil Direset!</h1>
              </div>
              <div class="content">
                <p>Halo <strong>${name}</strong>,</p>
                <p>Kami mengirimkan email ini untuk mengkonfirmasi bahwa password akun HiFella Anda telah <strong>berhasil direset</strong>.</p>
                
                <div class="info-box">
                  <p><strong>📋 Detail Reset Password:</strong></p>
                  <p style="margin: 5px 0;"><strong>Email Akun:</strong> ${email}</p>
                  <p style="margin: 5px 0;"><strong>Waktu Reset:</strong> ${currentDate} WIB</p>
                </div>

                <div class="highlight">
                  <p><strong>✓ Password Telah Diperbarui</strong></p>
                  <p style="font-size: 14px; margin: 10px 0;">Password akun Anda telah berhasil diubah. Anda sekarang dapat login ke HiFella menggunakan password baru Anda.</p>
                  <p style="font-size: 14px; margin: 10px 0;">Link reset password yang sebelumnya dikirimkan sudah tidak dapat digunakan lagi untuk keamanan akun Anda.</p>
                </div>

                <p><strong>🔜 Langkah Selanjutnya:</strong></p>
                <ol>
                  <li>Login ke HiFella menggunakan email dan password baru Anda</li>
                  <li>Pastikan Anda dapat mengakses akun dengan normal</li>
                  <li>Simpan password baru Anda di tempat yang aman</li>
                  <li>Pertimbangkan untuk menggunakan password manager</li>
                </ol>

                <p style="text-align: center;">
                  <a href="${FRONTEND_URL}" class="button">Login ke HiFella</a>
                </p>

                <div class="warning">
                  <p><strong>⚠️ PENTING - Keamanan Akun</strong></p>
                  <p><strong>Jika Anda TIDAK melakukan reset password ini:</strong></p>
                  <ul style="margin: 10px 0; padding-left: 20px; font-size: 14px;">
                    <li><strong>Segera hubungi admin</strong> - Akun Anda mungkin telah diakses oleh orang lain</li>
                    <li><strong>Lakukan reset password lagi</strong> - Gunakan fitur lupa password untuk mengamankan akun</li>
                    <li><strong>Periksa aktivitas akun</strong> - Cek apakah ada perubahan yang tidak Anda lakukan</li>
                    <li><strong>Ubah password akun lain</strong> - Jika Anda menggunakan password yang sama di tempat lain</li>
                  </ul>
                  <p style="font-size: 14px; margin-top: 10px;">Keamanan akun Anda adalah prioritas utama kami.</p>
                </div>

                <div class="security-box">
                  <p><strong>🔒 Tips Menjaga Keamanan Akun:</strong></p>
                  <ul style="margin: 10px 0; padding-left: 20px; font-size: 14px;">
                    <li><strong>Jangan bagikan password</strong> - Admin tidak akan pernah meminta password Anda</li>
                    <li><strong>Gunakan password unik</strong> - Jangan gunakan password yang sama dengan akun lain</li>
                    <li><strong>Aktifkan autentikasi dua faktor</strong> - Jika tersedia di masa mendatang</li>
                    <li><strong>Logout dari perangkat publik</strong> - Selalu logout setelah menggunakan komputer bersama</li>
                    <li><strong>Perbarui password secara berkala</strong> - Ubah password setiap 3-6 bulan</li>
                    <li><strong>Waspadai phishing</strong> - Jangan klik link mencurigakan dari email tidak dikenal</li>
                  </ul>
                </div>

                <p><strong>📧 Email Notifikasi Keamanan</strong></p>
                <p style="font-size: 14px;">Anda akan menerima email notifikasi untuk setiap perubahan penting pada akun Anda, termasuk:</p>
                <ul style="font-size: 14px;">
                  <li>Perubahan password</li>
                  <li>Perubahan email</li>
                  <li>Perubahan informasi profil</li>
                </ul>
                <p style="font-size: 14px;">Pastikan untuk selalu memeriksa email notifikasi ini untuk memastikan semua aktivitas adalah yang Anda lakukan.</p>

                <p style="font-size: 14px; color: #6B7280; margin-top: 20px;"><strong>Butuh Bantuan?</strong> Jika Anda mengalami masalah dalam login atau memiliki pertanyaan tentang keamanan akun, silakan hubungi admin platform kami.</p>
              </div>
              <div class="footer">
                <p>Email ini dikirim secara otomatis dari sistem HiFella.</p>
                <p>Mohon tidak membalas email ini.</p>
                <p>&copy; ${new Date().getFullYear()} HiFella - Interactive English Learning Platform. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('Error sending password reset confirmation email:', error);
      throw error;
    }

    console.log('Password reset confirmation email sent successfully:', data);
    return data;
  } catch (error) {
    console.error('Failed to send password reset confirmation email:', error);
    throw error;
  }
};

module.exports = {
  sendRegistrationEmail,
  sendProfileUpdateEmail,
  sendPasswordResetEmail,
  sendPasswordResetConfirmationEmail,
};
