import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Download, ExternalLink, Check, Copy } from 'lucide-react';

interface ScannableQRCodeProps {
  value: string;
  size?: number;
  label?: string;
  showActions?: boolean;
  className?: string;
}

export const ScannableQRCode: React.FC<ScannableQRCodeProps> = ({
  value,
  size = 180,
  label,
  showActions = true,
  className = ''
}) => {
  const [dataUrl, setDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!value) return;

    QRCode.toDataURL(value, {
      width: size * 2, // High resolution for mobile scanning
      margin: 1.5,
      color: {
        dark: '#1F3864', // AICTE Navy
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'H'
    })
      .then(url => setDataUrl(url))
      .catch(err => console.error('QR code generation error:', err));
  }, [value, size]);

  const handleDownload = () => {
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `AICTE-Verification-QR-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex flex-col items-center gap-3 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm ${className}`}>
      {dataUrl ? (
        <div className="relative group p-2 bg-white rounded-xl border border-slate-200 shadow-xs">
          <img
            src={dataUrl}
            alt="AICTE Statutory Verification QR Code"
            style={{ width: size, height: size }}
            className="block rounded-lg"
          />
          <div className="absolute inset-0 bg-[#1F3864]/5 rounded-lg opacity-0 group-hover:opacity-100 transition pointer-events-none" />
        </div>
      ) : (
        <div
          style={{ width: size, height: size }}
          className="bg-slate-100 animate-pulse rounded-xl flex items-center justify-center text-xs text-slate-400 font-mono"
        >
          Generating QR...
        </div>
      )}

      {label && (
        <p className="text-[11px] font-semibold text-slate-600 text-center max-w-[220px]">
          {label}
        </p>
      )}

      {showActions && (
        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#1F3864] text-xs font-semibold border border-blue-200 transition shadow-xs"
            title="Download QR code PNG for printing"
          >
            <Download className="w-3.5 h-3.5 text-blue-600" />
            <span>Download QR</span>
          </button>

          <button
            type="button"
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200 transition"
            title="Copy verification link"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-semibold">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Copy Link</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
