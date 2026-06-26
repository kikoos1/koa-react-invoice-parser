import { useState } from 'react';
import FileUploader from './components/FileUploader/FileUploader.tsx'
import InvoiceDetails from './components/InvoiceDetails/InvoiceDetails.tsx';
import type { ParsedInvoice } from './types.ts';

function App() {
  const [invoice, setInvoice] = useState<ParsedInvoice | null>(null);
  return (
    <>
      <FileUploader onUpload={setInvoice} />    
      {invoice && <InvoiceDetails invoice={invoice} />}
    </>
  )
}

export default App
