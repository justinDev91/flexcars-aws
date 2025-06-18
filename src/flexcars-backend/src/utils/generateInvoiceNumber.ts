function generateInvoiceNumber(): string {
  const timestamp = Date.now().toString();
  const randomPart = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  return `INV-${timestamp}-${randomPart}`;
}
