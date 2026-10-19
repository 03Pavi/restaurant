"use client";

import { FC, useState, useEffect, useRef } from "react";
import {
  QrCode,
  Download,
  Printer,
  Copy,
  Check,
  ExternalLink,
  Users,
  TrendingUp,
  Sparkles,
  Smartphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import styles from "./qr-manager.module.scss";

interface TableInfo {
  id: string;
  name: string;
  scansToday: number;
  location: string;
}

const TABLES: TableInfo[] = [
  { id: "T1", name: "Table 1", scansToday: 8, location: "Window Section" },
  { id: "T2", name: "Table 2", scansToday: 12, location: "Center Dining" },
  { id: "T3", name: "Table 3", scansToday: 19, location: "Family Booth" },
  { id: "T4", name: "Table 4", scansToday: 9, location: "Patio Garden" },
  { id: "T5", name: "Table 5", scansToday: 4, location: "VIP Lounge" },
  { id: "COUNTER", name: "Counter / Takeaway", scansToday: 16, location: "Main Counter" },
];

export const QRManager: FC = () => {
  const [selectedTable, setSelectedTable] = useState<string>("T1");
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const printRef = useRef<HTMLDivElement>(null);

  const currentTable = TABLES.find((t) => t.id === selectedTable) || TABLES[0];
  const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
  const dineInUrl = `${origin}/?table=${selectedTable.toLowerCase()}`;

  // Generate crisp QR code on canvas
  useEffect(() => {
    // Generate QR using canvas or QR server
    const size = 320;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");

    if (ctx) {
      // Create high-contrast fallback QR matrix or fetch standard QR code
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, size, size);
        ctx.drawImage(img, 10, 10, size - 20, size - 20);

        // Center badge
        const badgeSize = 56;
        const center = size / 2;
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(center, center, badgeSize / 2 + 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#ea580c"; // DineDirect brand orange
        ctx.beginPath();
        ctx.arc(center, center, badgeSize / 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 18px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("DD", center, center);

        setQrDataUrl(canvas.toDataURL("image/png"));
      };
      // Encode URL to QR Server API for fast high-res SVG/PNG
      const encoded = encodeURIComponent(dineInUrl);
      img.src = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encoded}&margin=2&color=0f172a`;
    }
  }, [dineInUrl, selectedTable]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(dineInUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleDownload = () => {
    if (!qrDataUrl) return;
    const link = document.createElement("a");
    link.download = `dinedirect-qr-${selectedTable.toLowerCase()}.png`;
    link.href = qrDataUrl;
    link.click();
  };

  const handlePrint = () => {
    window.print();
  };

  const totalScans = TABLES.reduce((sum, t) => sum + t.scansToday, 0);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerInfo}>
          <div className={styles.badge}>
            <QrCode size={16} />
            <span>Smart Dine-In QR System</span>
          </div>
          <h2 className={styles.title}>Dine-In QR Codes &amp; Table Scans</h2>
          <p className={styles.subtitle}>
            Empower guests to scan from their seats, explore your digital menu, and order instantly without waiting for waitstaff.
          </p>
        </div>

        <div className={styles.headerActions}>
          <Button variant="outline" size="sm" onClick={handleDownload} disabled={!qrDataUrl}>
            <Download size={15} />
            <span>Download PNG</span>
          </Button>
          <Button variant="default" size="sm" onClick={handlePrint}>
            <Printer size={15} />
            <span>Print Standee</span>
          </Button>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIconWrapper}>
            <Smartphone size={20} />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statLabel}>Today&apos;s Total Scans</span>
            <div className={styles.statValueRow}>
              <span className={styles.statValue}>{totalScans}</span>
              <span className={styles.statTrend}>+18% vs yesterday</span>
            </div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIconWrapper}>
            <Users size={20} />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statLabel}>Active Tables Seated</span>
            <div className={styles.statValueRow}>
              <span className={styles.statValue}>5 / 6</span>
              <span className={styles.statSub}>83% capacity</span>
            </div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIconWrapper}>
            <TrendingUp size={20} />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statLabel}>Most Active Table</span>
            <div className={styles.statValueRow}>
              <span className={styles.statValue}>Table 3</span>
              <span className={styles.statSub}>19 direct orders</span>
            </div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIconWrapper}>
            <Sparkles size={20} />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statLabel}>Direct Scan Conversion</span>
            <div className={styles.statValueRow}>
              <span className={styles.statValue}>92%</span>
              <span className={styles.statSub}>Order placed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Interactive Studio */}
      <div className={styles.studioLayout}>
        {/* Left: Table Picker */}
        <div className={styles.tableSelectorCard}>
          <h3 className={styles.sectionHeading}>Select Dine-In Spot</h3>
          <p className={styles.sectionDesc}>Choose a table or counter to preview and generate its custom standee QR.</p>

          <div className={styles.tableList}>
            {TABLES.map((table) => {
              const isSelected = selectedTable === table.id;
              return (
                <button
                  key={table.id}
                  type="button"
                  onClick={() => setSelectedTable(table.id)}
                  className={`${styles.tableItem} ${isSelected ? styles.tableItemActive : ""}`}
                >
                  <div className={styles.tableItemMain}>
                    <span className={styles.tableName}>{table.name}</span>
                    <span className={styles.tableLocation}>{table.location}</span>
                  </div>
                  <div className={styles.tableItemStats}>
                    <span className={styles.tableScans}>{table.scansToday} scans</span>
                    {isSelected && <span className={styles.activeDot} />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: QR Standee Card */}
        <div className={styles.standeePreviewCard} ref={printRef}>
          <div className={styles.standeeInner}>
            <div className={styles.standeeHeader}>
              <span className={styles.brandTitle}>DineDirect</span>
              <span className={styles.brandTagline}>Contactless Ordering</span>
            </div>

            <div className={styles.qrFrame}>
              {qrDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={qrDataUrl} alt={`QR for ${currentTable.name}`} className={styles.qrImage} />
              ) : (
                <div className={styles.qrSkeleton}>
                  <QrCode size={64} className={styles.pulse} />
                  <span>Generating Code...</span>
                </div>
              )}
            </div>

            <div className={styles.standeeFooter}>
              <div className={styles.tableCallout}>
                <span className={styles.tableBadge}>{currentTable.name}</span>
                <span className={styles.scanInstruction}>Scan with phone camera to order</span>
              </div>
              <div className={styles.quickFeatures}>
                <span>✨ Zero Wait Time</span>
                <span>•</span>
                <span>🔥 Fresh Kitchen Dispatch</span>
              </div>
            </div>
          </div>

          <div className={styles.actionToolbar}>
            <div className={styles.urlDisplay}>
              <span className={styles.urlText}>{dineInUrl}</span>
              <button
                type="button"
                className={styles.copyBtn}
                onClick={handleCopyLink}
                title="Copy Direct Link"
              >
                {copied ? <Check size={16} className={styles.checkIcon} /> : <Copy size={16} />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
            </div>

            <a
              href={dineInUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.testLink}
            >
              <span>Test Customer View</span>
              <ExternalLink size={14} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
