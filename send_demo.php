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

$demoName     = trim($data['demoName'] ?? '');
$demoEmail    = trim($data['demoEmail'] ?? '');
$demoCompany  = trim($data['demoCompany'] ?? '');
$demoPhone    = trim($data['demoPhone'] ?? '');
$demoProduct  = trim($data['demoProduct'] ?? '');
$demoDate     = trim($data['demoDate'] ?? '');
$demoTime     = trim($data['demoTime'] ?? '');
$demoTimezone = trim($data['demoTimezone'] ?? '');
$demoNotes    = trim($data['demoNotes'] ?? '');

if (!$demoName || !$demoEmail || !$demoCompany || !$demoPhone || !$demoProduct || !$demoDate || !$demoTime || !$demoTimezone) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields']);
    exit;
}

if (!filter_var($demoEmail, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid email address']);
    exit;
}

$gmailUser  = $_ENV['GMAIL_USER'];
$gmailPass  = $_ENV['GMAIL_PASS'];
$adminEmail = $_ENV['ADMIN_EMAIL'];

$timeLabels = [
    '9am'  => '9:00 AM',  '10am' => '10:00 AM',
    '11am' => '11:00 AM', '2pm'  => '2:00 PM',
    '3pm'  => '3:00 PM',  '4pm'  => '4:00 PM',
];
$timezoneLabels = [
    'sgt' => 'SGT (Singapore)', 'utc' => 'UTC',
    'est' => 'EST (New York)',  'gmt' => 'GMT (London)',
];
$productLabels = [
    'esg'   => 'ESG Platform',
    'drone' => 'AeroVisibility',
    'both'  => 'Both Products',
];

$formattedDate     = date('l, F j, Y', strtotime($demoDate));
$formattedTime     = $timeLabels[$demoTime] ?? $demoTime;
$formattedTimezone = $timezoneLabels[$demoTimezone] ?? $demoTimezone;
$formattedProduct  = $productLabels[$demoProduct] ?? $demoProduct;

$safeName     = htmlspecialchars($demoName);
$safeEmail    = htmlspecialchars($demoEmail);
$safeCompany  = htmlspecialchars($demoCompany);
$safePhone    = htmlspecialchars($demoPhone);
$safeNotes    = nl2br(htmlspecialchars($demoNotes ?: 'None'));
$firstName    = explode(' ', $demoName)[0];

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

// Admin notification email
$adminBody = "
<div style='font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f9f9f9;padding:30px;border-radius:8px;'>
  <div style='background:#0a1628;padding:20px;border-radius:6px 6px 0 0;text-align:center;'>
    <h1 style='color:#fff;margin:0;font-size:24px;'>BiziQ</h1>
    <p style='color:#7faaff;margin:5px 0 0;font-size:13px;'>New Demo Booking</p>
  </div>
  <div style='background:#fff;padding:30px;border-radius:0 0 6px 6px;'>
    <div style='background:#e8f0fe;border-radius:6px;padding:16px;margin-bottom:24px;text-align:center;'>
      <p style='margin:0;font-size:12px;color:#666;text-transform:uppercase;letter-spacing:1px;'>Scheduled For</p>
      <p style='margin:8px 0 4px;font-size:20px;font-weight:700;color:#0a1628;'>$formattedDate</p>
      <p style='margin:0;font-size:15px;color:#444;'>$formattedTime · $formattedTimezone</p>
    </div>
    <table style='width:100%;border-collapse:collapse;font-size:14px;'>
      <tr><td style='padding:10px 0;border-bottom:1px solid #eee;color:#666;width:130px;'>Name</td><td style='padding:10px 0;border-bottom:1px solid #eee;color:#222;font-weight:600;'>$safeName</td></tr>
      <tr><td style='padding:10px 0;border-bottom:1px solid #eee;color:#666;'>Email</td><td style='padding:10px 0;border-bottom:1px solid #eee;'><a href='mailto:$safeEmail' style='color:#1a73e8;'>$safeEmail</a></td></tr>
      <tr><td style='padding:10px 0;border-bottom:1px solid #eee;color:#666;'>Phone</td><td style='padding:10px 0;border-bottom:1px solid #eee;color:#222;'>$safePhone</td></tr>
      <tr><td style='padding:10px 0;border-bottom:1px solid #eee;color:#666;'>Company</td><td style='padding:10px 0;border-bottom:1px solid #eee;color:#222;'>$safeCompany</td></tr>
      <tr><td style='padding:10px 0;border-bottom:1px solid #eee;color:#666;'>Product</td><td style='padding:10px 0;border-bottom:1px solid #eee;color:#222;'>$formattedProduct</td></tr>
      <tr><td style='padding:10px 0;color:#666;vertical-align:top;'>Notes</td><td style='padding:10px 0;color:#222;line-height:1.6;'>$safeNotes</td></tr>
    </table>
  </div>
  <p style='color:#999;font-size:12px;text-align:center;margin-top:20px;'>Sent from the BiziQ demo booking form.</p>
</div>";

// User confirmation email
$userBody = "
<div style='font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f9f9f9;padding:30px;border-radius:8px;'>
  <div style='background:#0a1628;padding:20px;border-radius:6px 6px 0 0;text-align:center;'>
    <h1 style='color:#fff;margin:0;font-size:24px;'>BiziQ</h1>
    <p style='color:#7faaff;margin:5px 0 0;font-size:13px;'>Maritime ESG Platform</p>
  </div>
  <div style='background:#fff;padding:30px;border-radius:0 0 6px 6px;'>
    <h2 style='color:#0a1628;margin-top:0;'>Demo Scheduled, $firstName!</h2>
    <p style='color:#444;line-height:1.7;font-size:15px;'>Your personalized BiziQ demo has been successfully scheduled. Here are your booking details:</p>
    <div style='background:#e8f0fe;border-radius:8px;padding:20px;margin:20px 0;text-align:center;'>
      <p style='margin:0;font-size:12px;color:#666;text-transform:uppercase;letter-spacing:1px;'>Your Demo Appointment</p>
      <p style='margin:10px 0 4px;font-size:22px;font-weight:700;color:#0a1628;'>$formattedDate</p>
      <p style='margin:0;font-size:15px;color:#444;'>$formattedTime · $formattedTimezone</p>
      <p style='margin:10px 0 0;font-size:14px;color:#555;'>Product: <strong>$formattedProduct</strong></p>
    </div>
    <p style='color:#444;font-size:15px;line-height:1.7;'>Our team will reach out shortly with the meeting link and further details.</p>
    <p style='color:#444;font-size:15px;line-height:1.7;'>Need to reschedule? Contact us at <a href='mailto:ashutosh.gupta@thryvmax.com' style='color:#1a73e8;'>ashutosh.gupta@thryvmax.com</a>.</p>
    <div style='text-align:center;margin-top:30px;'>
      <a href='https://bizq.io' style='background:#0a1628;color:#fff;padding:12px 30px;border-radius:6px;text-decoration:none;font-size:14px;font-weight:600;'>Visit BiziQ</a>
    </div>
  </div>
  <p style='color:#999;font-size:12px;text-align:center;margin-top:20px;'>© 2025 BiziQ. All rights reserved.</p>
</div>";

try {
    $mail = createMailer($gmailUser, $gmailPass);
    $mail->setFrom($gmailUser, 'BiziQ Demo Booking');
    $mail->addAddress($adminEmail);
    $mail->Subject = "New Demo Request from $demoName – $formattedDate";
    $mail->Body    = $adminBody;
    $mail->send();

    $mail2 = createMailer($gmailUser, $gmailPass);
    $mail2->setFrom($gmailUser, 'BiziQ Team');
    $mail2->addAddress($demoEmail);
    $mail2->Subject = 'Your BiziQ Demo is Confirmed!';
    $mail2->Body    = $userBody;
    $mail2->send();

    echo json_encode(['success' => true]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to send email. Please try again.']);
}
