<?php
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

require 'vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Load .env file
foreach (file(__DIR__ . '/.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
    if (str_starts_with(trim($line), '#') || !str_contains($line, '=')) continue;
    [$key, $val] = explode('=', $line, 2);
    $_ENV[trim($key)] = trim($val);
}

$data = json_decode(file_get_contents('php://input'), true);

$firstName = trim($data['firstName'] ?? '');
$lastName  = trim($data['lastName'] ?? '');
$email     = trim($data['email'] ?? '');
$phone     = trim($data['phone'] ?? '');
$company   = trim($data['company'] ?? '');
$role      = trim($data['role'] ?? '');
$interest  = trim($data['interest'] ?? '');
$message   = trim($data['message'] ?? '');
$newsletter = !empty($data['newsletter']) ? 'Yes' : 'No';

if (!$firstName || !$lastName || !$email || !$company || !$interest || !$message) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid email address']);
    exit;
}

$gmailUser  = $_ENV['GMAIL_USER'];
$gmailPass  = $_ENV['GMAIL_PASS'];
$adminEmail = $_ENV['ADMIN_EMAIL'];

function createMailer($gmailUser, $gmailPass) {
    $mail = new PHPMailer(true);
    $mail->isSMTP();
    $mail->Host       = 'smtp.gmail.com';
    $mail->SMTPAuth   = true;
    $mail->Username   = $gmailUser;
    $mail->Password   = $gmailPass;
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port       = 587;
    $mail->isHTML(true);
    return $mail;
}

$safeFirstName = htmlspecialchars($firstName);
$safeLastName  = htmlspecialchars($lastName);
$safeEmail     = htmlspecialchars($email);
$safePhone     = htmlspecialchars($phone ?: 'Not provided');
$safeCompany   = htmlspecialchars($company);
$safeRole      = htmlspecialchars($role ?: 'Not specified');
$safeInterest  = htmlspecialchars($interest);
$safeMessage   = nl2br(htmlspecialchars($message));

// Admin notification email
$adminBody = "
<div style='font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f9f9f9;padding:30px;border-radius:8px;'>
  <div style='background:#0a1628;padding:20px;border-radius:6px 6px 0 0;text-align:center;'>
    <h1 style='color:#fff;margin:0;font-size:24px;'>BiziQ</h1>
    <p style='color:#7faaff;margin:5px 0 0;font-size:13px;'>New Contact Inquiry</p>
  </div>
  <div style='background:#fff;padding:30px;border-radius:0 0 6px 6px;'>
    <table style='width:100%;border-collapse:collapse;font-size:14px;'>
      <tr><td style='padding:10px 0;border-bottom:1px solid #eee;color:#666;width:130px;'>Name</td><td style='padding:10px 0;border-bottom:1px solid #eee;color:#222;font-weight:600;'>$safeFirstName $safeLastName</td></tr>
      <tr><td style='padding:10px 0;border-bottom:1px solid #eee;color:#666;'>Email</td><td style='padding:10px 0;border-bottom:1px solid #eee;'><a href='mailto:$safeEmail' style='color:#1a73e8;'>$safeEmail</a></td></tr>
      <tr><td style='padding:10px 0;border-bottom:1px solid #eee;color:#666;'>Phone</td><td style='padding:10px 0;border-bottom:1px solid #eee;color:#222;'>$safePhone</td></tr>
      <tr><td style='padding:10px 0;border-bottom:1px solid #eee;color:#666;'>Company</td><td style='padding:10px 0;border-bottom:1px solid #eee;color:#222;'>$safeCompany</td></tr>
      <tr><td style='padding:10px 0;border-bottom:1px solid #eee;color:#666;'>Role</td><td style='padding:10px 0;border-bottom:1px solid #eee;color:#222;'>$safeRole</td></tr>
      <tr><td style='padding:10px 0;border-bottom:1px solid #eee;color:#666;'>Interested In</td><td style='padding:10px 0;border-bottom:1px solid #eee;color:#222;'>$safeInterest</td></tr>
      <tr><td style='padding:10px 0;border-bottom:1px solid #eee;color:#666;'>Newsletter</td><td style='padding:10px 0;border-bottom:1px solid #eee;color:#222;'>$newsletter</td></tr>
      <tr><td style='padding:10px 0;color:#666;vertical-align:top;'>Message</td><td style='padding:10px 0;color:#222;line-height:1.6;'>$safeMessage</td></tr>
    </table>
  </div>
  <p style='color:#999;font-size:12px;text-align:center;margin-top:20px;'>Sent from the BiziQ contact form.</p>
</div>";

// User confirmation email
$userBody = "
<div style='font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f9f9f9;padding:30px;border-radius:8px;'>
  <div style='background:#0a1628;padding:20px;border-radius:6px 6px 0 0;text-align:center;'>
    <h1 style='color:#fff;margin:0;font-size:24px;'>BiziQ</h1>
    <p style='color:#7faaff;margin:5px 0 0;font-size:13px;'>Maritime ESG Platform</p>
  </div>
  <div style='background:#fff;padding:30px;border-radius:0 0 6px 6px;'>
    <h2 style='color:#0a1628;margin-top:0;'>Thank you, $safeFirstName!</h2>
    <p style='color:#444;line-height:1.7;font-size:15px;'>We've received your inquiry and our team will get back to you within <strong>24 hours</strong>.</p>
    <p style='color:#444;line-height:1.7;font-size:15px;'>Here's a summary of your message:</p>
    <div style='background:#f4f7ff;border-left:4px solid #1a73e8;padding:16px;border-radius:4px;margin:20px 0;color:#333;font-size:14px;line-height:1.7;'>$safeMessage</div>
    <p style='color:#444;font-size:15px;line-height:1.7;'>In the meantime, feel free to reach out directly at <a href='mailto:ashutosh.gupta@thryvmax.com' style='color:#1a73e8;'>ashutosh.gupta@thryvmax.com</a>.</p>
    <div style='text-align:center;margin-top:30px;'>
      <a href='https://bizq.io' style='background:#0a1628;color:#fff;padding:12px 30px;border-radius:6px;text-decoration:none;font-size:14px;font-weight:600;'>Visit BiziQ</a>
    </div>
  </div>
  <p style='color:#999;font-size:12px;text-align:center;margin-top:20px;'>© 2025 BiziQ. All rights reserved.</p>
</div>";

try {
    $mail = createMailer($gmailUser, $gmailPass);
    $mail->setFrom($gmailUser, 'BiziQ Contact Form');
    $mail->addAddress($adminEmail);
    $mail->Subject = "New Contact Inquiry from $firstName $lastName";
    $mail->Body    = $adminBody;
    $mail->send();

    $mail2 = createMailer($gmailUser, $gmailPass);
    $mail2->setFrom($gmailUser, 'BiziQ Team');
    $mail2->addAddress($email);
    $mail2->Subject = 'We received your message!';
    $mail2->Body    = $userBody;
    $mail2->send();

    echo json_encode(['success' => true]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to send email. Please try again.']);
}
