import qrcode

# Data to encode
data = "https://cafe-mine.vercel.app"

# Create QR code instance
qr = qrcode.QRCode(
    version=1,  # controls size (1 = 21x21)
    error_correction=qrcode.constants.ERROR_CORRECT_L,
    box_size=10,
    border=4,
)

# Add data and generate
qr.add_data(data)
qr.make(fit=True)

# Create an image from the QR Code instance
img = qr.make_image(fill_color="black", back_color="white")

# Save it
img.save("ravanik_qr.png")
print("✅ QR code saved as ravanik_qr.png")
