import {useState, useRef, type DragEvent, type ChangeEvent} from 'react';
import './FileUploader.css';
import type {ParsedInvoice} from "../../types.ts";
import {uploadToApi} from "../../services/api.service.ts";

export default function FileUploader({onUpload}: { onUpload: (invoice: ParsedInvoice|null) => void }) {
    const [status, setStatus] = useState<'idle' | 'uploading' | 'done' | 'error'>('idle');
    const [error, setError] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const processFile = async (file: File) => {
        onUpload(null);
        if (file.type !== 'application/pdf') {
            setError('Please upload a valid PDF file.');
            setStatus('error');
            return;
        }
        if (file.size > 10 * 1024 * 1024) { // 10 MB limit
            setError('PDF must be 10 MB or smaller');
            setStatus('error');
            return;
        }

        setStatus('uploading');
        setError(null);

        try {
            const parsedInvoice = await uploadToApi<ParsedInvoice>('/invoice/parse', file)
            setStatus('done');
            onUpload(parsedInvoice);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Upload failed');
            setStatus('error');
        } finally {
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            await processFile(file);
        }
    };

    const handleDrop = async (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragging(false);
        if (status === 'uploading') return;

        const file = event.dataTransfer.files?.[0];
        if (file) {
            await processFile(file);
        }
    };

    const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        if (status !== 'uploading') {
            setIsDragging(true);
        }
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleClick = () => {
        if (status !== 'uploading') {
            fileInputRef.current?.click();
        }
    };

    return (
        <div className="file-uploader-container">
            <div className="uploader-header">
                <h1>Invoice Parser</h1>
                <p>
                    Drop a PDF to extract line
                    items and view prices in USD, EUR, and GBP.
                </p>
            </div>

            <div
                className={`dropzone ${isDragging ? 'dragging' : ''} ${status === 'uploading' ? 'uploading' : ''}`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={handleClick}
            >
                <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    disabled={status === 'uploading'}
                    ref={fileInputRef}
                    className="hidden-input"
                />

                {status === 'uploading' ? (
                    <div className="state-content">
                        <div className="spinner"></div>
                        <p className="loading-text">Parsing invoice with live exchange rates...</p>
                    </div>
                ) : (
                    <div className="state-content">
                        <p className="primary-text">Drop a PDF invoice here</p>
                        <p className="secondary-text">or click to browse (max 10 MB)</p>
                    </div>
                )}
            </div>

            {status === 'error' && (
                <div className="error-message">
                    {error}
                </div>
            )}
        </div>
    );
}