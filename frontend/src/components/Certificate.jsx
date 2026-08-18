import React, { useRef } from 'react';
import { Award, Printer, Share2, Download } from 'lucide-react';

export default function Certificate({ userName, courseName, certificateId, completionDate }) {
  const certRef = useRef();

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = completionDate 
    ? new Date(completionDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="certificate-modal-wrapper">
      <div className="certificate-actions no-print">
        <button className="btn btn-secondary" onClick={handlePrint}>
          <Printer size={16} />
          <span>Print / Save PDF</span>
        </button>
      </div>

      <div className="certificate-container" ref={certRef}>
        {/* Certificate Frame Border */}
        <div className="cert-border-outer">
          <div className="cert-border-inner">
            
            {/* Corner Decorative Ornaments */}
            <div className="ornament top-left"></div>
            <div className="ornament top-right"></div>
            <div className="ornament bottom-left"></div>
            <div className="ornament bottom-right"></div>

            {/* Certificate Contents */}
            <div className="cert-content">
              <div className="cert-header">
                <div className="cert-badge-logo">🏆</div>
                <h1 className="cert-main-title">CodeVerse</h1>
                <p className="cert-subtitle">Academy of Digital Literacy</p>
              </div>

              <div className="cert-body">
                <p className="cert-award-text">Certificate of Course Completion</p>
                <div className="cert-divider"></div>
                <p className="presented-to">This is proudly presented to</p>
                
                <h2 className="recipient-name">{userName}</h2>
                
                <p className="achievement-text">
                  for successfully mastering the concepts, debugging challenges, quizzes, and mini projects in
                </p>
                
                <h3 className="course-title">{courseName}</h3>
                
                <p className="completion-date">Completed on {formattedDate}</p>
              </div>

              <div className="cert-footer">
                <div className="cert-sig-block">
                  <div className="sig-line">Antigravity AI</div>
                  <span className="sig-title">CodeVerse Lead Instructor</span>
                </div>

                {/* Cyber Golden Seal */}
                <div className="cert-seal">
                  <div className="seal-outer">
                    <Award size={48} className="gold-icon" />
                  </div>
                  <div className="seal-text">VERIFIED GRADUATE</div>
                </div>

                <div className="cert-sig-block">
                  <div className="sig-line verification-code">{certificateId || 'CERT-XXXXXXXX-XXXX'}</div>
                  <span className="sig-title">Verification ID</span>
                </div>
              </div>

            </div>

          </div>
        </div>
      </div>

      <style>{`
        .certificate-modal-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
          padding: 1rem;
          width: 100%;
          max-width: 900px;
          margin: 0 auto;
        }

        .certificate-actions {
          display: flex;
          gap: 1rem;
        }

        /* Certificate Styles */
        .certificate-container {
          background: #ffffff;
          color: #1e293b;
          width: 100%;
          aspect-ratio: 1.414 / 1; /* A4 Landscape proportions */
          padding: 24px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
          border-radius: 4px;
          position: relative;
          box-sizing: border-box;
        }

        .cert-border-outer {
          border: 4px double #d97706; /* Amber border representing gold */
          height: 100%;
          padding: 8px;
          box-sizing: border-box;
        }

        .cert-border-inner {
          border: 1px solid rgba(217, 119, 6, 0.4);
          height: 100%;
          padding: 2rem;
          position: relative;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        /* Decorative Ornaments */
        .ornament {
          position: absolute;
          width: 24px;
          height: 24px;
          border: 2px solid #d97706;
        }
        .top-left { top: 12px; left: 12px; border-right: none; border-bottom: none; }
        .top-right { top: 12px; right: 12px; border-left: none; border-bottom: none; }
        .bottom-left { bottom: 12px; left: 12px; border-right: none; border-top: none; }
        .bottom-right { bottom: 12px; right: 12px; border-left: none; border-top: none; }

        .cert-content {
          text-align: center;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .cert-header {
          margin-bottom: 1rem;
        }

        .cert-badge-logo {
          font-size: 2.25rem;
          line-height: 1;
          margin-bottom: 0.25rem;
        }

        .cert-main-title {
          font-family: 'Space Grotesk', Georgia, serif;
          font-size: 2.25rem;
          font-weight: 800;
          color: #1e1b4b; /* Indigo */
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .cert-subtitle {
          font-size: 0.8rem;
          color: #d97706;
          font-weight: 700;
          letter-spacing: 0.15em;
          text-transform: uppercase;
        }

        .cert-body {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 0.5rem;
        }

        .cert-award-text {
          font-size: 1.1rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: #312e81;
        }

        .cert-divider {
          width: 80px;
          height: 2px;
          background: #d97706;
          margin: 0.25rem 0;
        }

        .presented-to {
          font-size: 0.85rem;
          font-style: italic;
          color: #64748b;
        }

        .recipient-name {
          font-family: Georgia, serif;
          font-size: 2rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0.25rem 0;
          border-bottom: 1px solid rgba(0,0,0,0.1);
          padding-bottom: 0.25rem;
          min-width: 250px;
        }

        .achievement-text {
          font-size: 0.8rem;
          color: #475569;
          max-width: 500px;
          line-height: 1.4;
        }

        .course-title {
          font-family: 'Space Grotesk', Georgia, serif;
          font-size: 1.4rem;
          font-weight: 700;
          color: #1e1b4b;
          margin: 0.25rem 0;
        }

        .completion-date {
          font-size: 0.75rem;
          color: #64748b;
          margin-top: 0.25rem;
        }

        .cert-footer {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-top: 1rem;
        }

        .cert-sig-block {
          width: 150px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .sig-line {
          border-bottom: 1.5px solid #64748b;
          width: 100%;
          padding-bottom: 0.25rem;
          font-family: Georgia, cursive, serif;
          font-size: 0.95rem;
          font-style: italic;
          color: #1e293b;
        }

        .verification-code {
          font-family: 'Fira Code', monospace;
          font-size: 0.65rem;
          font-style: normal;
          color: #475569;
          text-align: center;
          border-bottom: 1.5px dashed #64748b;
        }

        .sig-title {
          font-size: 0.65rem;
          color: #64748b;
          margin-top: 0.25rem;
          text-transform: uppercase;
        }

        .cert-seal {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
        }

        .seal-outer {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          border: 2.5px dotted #d97706;
          background: #fef3c7;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 10px rgba(217, 119, 6, 0.2);
        }

        .gold-icon {
          color: #d97706;
        }

        .seal-text {
          font-size: 0.55rem;
          font-weight: 800;
          color: #d97706;
          letter-spacing: 0.05em;
        }

        /* PRINT MEDIA STYLES */
        @media print {
          body * {
            visibility: hidden;
          }
          .certificate-container, .certificate-container * {
            visibility: visible;
          }
          .certificate-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100vw;
            height: 100vh;
            max-width: none;
            box-shadow: none;
            border-radius: 0;
            margin: 0;
            padding: 20px;
            page-break-inside: avoid;
          }
          .no-print {
            display: none !important;
          }
          @page {
            size: landscape;
            margin: 0;
          }
        }
      `}</style>
    </div>
  );
}
