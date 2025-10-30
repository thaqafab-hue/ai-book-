declare const html2pdf: any;
declare const htmlToDocx: any;

export const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text);
};

export const downloadPdf = (elementId: string, fileName: string) => {
  const element = document.getElementById(elementId);
  if (element) {
    const opt = {
      margin:       1,
      filename:     `${fileName}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, backgroundColor: '#0f172a' }, // slate-900
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    html2pdf().from(element).set(opt).save();
  }
};

export const downloadDocx = async (elementId: string, fileName: string) => {
  const element = document.getElementById(elementId);
  if (element) {
    const htmlString = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { direction: rtl; font-family: 'Arial', sans-serif; }
            h1, h2, h3 { color: #333; }
            p { color: #555; }
            b, strong { font-weight: bold; }
          </style>
        </head>
        <body>${element.innerHTML}</body>
      </html>
    `;
    const fileBuffer = await htmlToDocx(htmlString);
    const blob = new Blob([fileBuffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${fileName}.docx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
