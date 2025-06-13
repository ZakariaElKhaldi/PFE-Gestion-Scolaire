import PDFDocument from 'pdfkit';
import { Invoice } from '../models/payment.model';
import { format } from 'date-fns';

/**
 * Generate a PDF invoice
 * @param invoice Invoice data
 * @returns Buffer containing the PDF data
 */
export async function generateInvoicePDF(invoice: Invoice): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      // Create a PDF document
      const doc = new PDFDocument({ margin: 50 });
      
      // Collect the PDF data in a buffer
      const buffers: Buffer[] = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });
      
      // Add the header
      doc
        .fontSize(20)
        .text('INVOICE', { align: 'center' })
        .moveDown();
      
      // Add invoice details
      doc
        .fontSize(16)
        .text(`Invoice #: ${invoice.invoiceNumber}`)
        .fontSize(10)
        .text(`Issue Date: ${format(new Date(invoice.issueDate), 'MMM d, yyyy')}`)
        .text(`Due Date: ${format(new Date(invoice.dueDate), 'MMM d, yyyy')}`)
        .moveDown()
        .text(`Status: ${invoice.status.toUpperCase()}`)
        .moveDown(2);
      
      // Add student information
      doc
        .fontSize(14)
        .text('Student Information')
        .fontSize(10)
        .text(`Student ID: ${invoice.studentId}`)
        .moveDown(2);
      
      // Add payment details
      doc
        .fontSize(14)
        .text('Payment Details')
        .fontSize(10)
        .text(`Description: ${invoice.description}`)
        .text(`Amount: $${parseFloat(String(invoice.amount)).toFixed(2)}`)
        .moveDown();
      
      if (invoice.paidDate) {
        doc.text(`Paid on: ${format(new Date(invoice.paidDate), 'MMM d, yyyy')}`);
      }
      
      // Add a line
      doc
        .moveDown(2)
        .lineCap('butt')
        .moveTo(50, doc.y)
        .lineTo(550, doc.y)
        .stroke()
        .moveDown();
      
      // Add footer
      doc
        .fontSize(10)
        .text('Thank you for your business!', { align: 'center' })
        .moveDown()
        .text(`Generated on ${format(new Date(), 'MMM d, yyyy')}`, { align: 'center' });
      
      // Finalize the PDF
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
} 