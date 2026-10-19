"use client";

import { FC, useState, useEffect, useRef, useMemo } from "react";
import {
  QrCode,
  Download,
  Printer,
  Copy,
  Check,
  ExternalLink,
  Users,
  Sparkles,
  Smartphone,
  Plus,
  Trash2,
  Utensils,
  Gift,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  QRCodeData,
  QRCodeType,
  fetchQRCodes,
  createQRCode,
  deleteQRCode,
} from "@/lib/firebase/qr-service";
import styles from "./qr-manager.module.scss";

export const QRManager: FC = () => {
  const [tables, setTables] = useState<QRCodeData[]>([]);
  const [selectedTableId, setSelectedTableId] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"ALL" | "TABLE" | "OFFER_SCRATCH">("ALL");
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Form State
  const [selectedType, setSelectedType] = useState<QRCodeType>("TABLE");
  const [newTableName, setNewTableName] = useState("");
  const [newTableNumber, setNewTableNumber] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newOfferCode, setNewOfferCode] = useState("DIRECT20");
  const [newDiscountReward, setNewDiscountReward] = useState("Flat 20% OFF Your Order");
  const [newDescription, setNewDescription] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const printRef = useRef<HTMLDivElement>(null);

  // Load from Firestore collection
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await fetchQRCodes();
        if (mounted && data) {
          setTables(data);
          if (data.length > 0) {
            setSelectedTableId(data[0].id);
          }
        }
      } catch (err) {
        console.warn("Failed to load QR codes from collection:", err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const filteredTables = useMemo(() => {
    if (activeTab === "ALL") return tables;
    return tables.filter(
      (t) => (t.type || (t.tableNumber ? "TABLE" : "OFFER_SCRATCH")) === activeTab
    );
  }, [tables, activeTab]);

  const currentTable = useMemo(() => {
    return tables.find((t) => t.id === selectedTableId) || filteredTables[0] || tables[0] || null;
  }, [tables, filteredTables, selectedTableId]);

  const isScratch = currentTable?.type === "OFFER_SCRATCH";

  // Compute destination URL for both types
  const targetUrl = useMemo(() => {
    if (!currentTable) return "";
    const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";

    if (currentTable.type === "OFFER_SCRATCH") {
      const code = encodeURIComponent(currentTable.offerCode || "DIRECT20");
      const reward = encodeURIComponent(currentTable.discountReward || "Flat 20% OFF Your Order");
      return `${origin}/?scratch=true&code=${code}&reward=${reward}&ref=${currentTable.id}`;
    }

    const tableParam = encodeURIComponent(currentTable.tableNumber || currentTable.id.toLowerCase());
    return `${origin}/?table=${tableParam}`;
  }, [currentTable]);

  // Generate crisp QR code on canvas
  useEffect(() => {
    if (!currentTable || !targetUrl) {
      setQrDataUrl("");
      return;
    }

    const size = 320;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");

    if (ctx) {
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

        // Distinct badge color for Table vs Scratch Card
        ctx.fillStyle = isScratch ? "#7c3aed" : "#ea580c";
        ctx.beginPath();
        ctx.arc(center, center, badgeSize / 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#ffffff";
        ctx.font = isScratch ? "bold 20px sans-serif" : "bold 17px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(isScratch ? "🎁" : "DD", center, center);

        setQrDataUrl(canvas.toDataURL("image/png"));
      };

      const encoded = encodeURIComponent(targetUrl);
      img.src = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encoded}&margin=2&color=0f172a`;
    }
  }, [targetUrl, currentTable, isScratch]);

  const handleCopyLink = async () => {
    if (!targetUrl) return;
    try {
      await navigator.clipboard.writeText(targetUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleDownload = () => {
    if (!qrDataUrl) return;
    const link = document.createElement("a");
    const nameSlug = (currentTable?.name || "code").toLowerCase().replace(/\s+/g, "-");
    link.download = `dinedirect-${currentTable?.type === "OFFER_SCRATCH" ? "scratch" : "table"}-${nameSlug}.png`;
    link.href = qrDataUrl;
    link.click();
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCreateQR = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTableName.trim()) {
      setFormError("Name / Title is required.");
      return;
    }

    if (selectedType === "TABLE" && !newTableNumber.trim()) {
      setFormError("Table number is required for Table QR.");
      return;
    }

    try {
      const created = await createQRCode({
        type: selectedType,
        name: newTableName,
        tableNumber: selectedType === "TABLE" ? newTableNumber : undefined,
        location: newLocation || (selectedType === "TABLE" ? "Main Dining" : "Packaging / Bill Folder"),
        offerCode: selectedType === "OFFER_SCRATCH" ? (newOfferCode || "DIRECT20") : undefined,
        discountReward: selectedType === "OFFER_SCRATCH" ? (newDiscountReward || "Flat 20% OFF") : undefined,
        description: newDescription || undefined,
      });

      setTables((prev) => [...prev, created]);
      setSelectedTableId(created.id);
      setIsAddModalOpen(false);

      // Reset form
      setNewTableName("");
      setNewTableNumber("");
      setNewLocation("");
      setNewOfferCode("DIRECT20");
      setNewDiscountReward("Flat 20% OFF Your Order");
      setNewDescription("");
      setFormError(null);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Failed to create QR code.");
    }
  };

  const handleDeleteTable = async (id: string) => {
    try {
      await deleteQRCode(id);
      setTables((prev) => {
        const remaining = prev.filter((t) => t.id !== id);
        if (selectedTableId === id) {
          setSelectedTableId(remaining[0]?.id || "");
        }
        return remaining;
      });
    } catch (err) {
      console.warn("Delete error:", err);
    }
  };

  // Analytics derived from collection
  const totalScans = useMemo(() => {
    return tables.reduce((sum, t) => sum + (t.scansToday || 0), 0);
  }, [tables]);

  const tableCount = useMemo(() => {
    return tables.filter((t) => (t.type || (t.tableNumber ? "TABLE" : "OFFER_SCRATCH")) === "TABLE").length;
  }, [tables]);

  const scratchCount = useMemo(() => {
    return tables.filter((t) => (t.type || (t.tableNumber ? "TABLE" : "OFFER_SCRATCH")) === "OFFER_SCRATCH").length;
  }, [tables]);

  const topTable = useMemo(() => {
    if (tables.length === 0) return { name: "No codes yet", scansToday: 0 };
    return tables.reduce((prev, curr) =>
      (curr.scansToday || 0) > (prev.scansToday || 0) ? curr : prev
    );
  }, [tables]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerInfo}>
          <div className={styles.badge}>
            <QrCode size={16} />
            <span>Live Firestore Collection: qr_codes</span>
          </div>
          <h2 className={styles.title}>QR Codes &amp; Scratch Deals Manager</h2>
          <p className={styles.subtitle}>
            Generate QR codes for both <strong>Dine-In Tables</strong> (scan from seats) and <strong>Menu &amp; Offers Scratch Cards</strong> (for delivery bags, bills &amp; flyers).
          </p>
        </div>

        <div className={styles.headerActions}>
          <Button variant="outline" size="sm" onClick={() => setIsAddModalOpen(true)}>
            <Plus size={15} />
            <span>Create New QR</span>
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload} disabled={!qrDataUrl}>
            <Download size={15} />
            <span>Download PNG</span>
          </Button>
          <Button variant="default" size="sm" onClick={handlePrint} disabled={!currentTable}>
            <Printer size={15} />
            <span>Print Standee / Card</span>
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
              <span className={styles.statTrend}>Live across all spots</span>
            </div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIconWrapper}>
            <Utensils size={20} />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statLabel}>Dine-In Tables</span>
            <div className={styles.statValueRow}>
              <span className={styles.statValue}>{tableCount} Spots</span>
              <span className={styles.statSub}>Contactless dining</span>
            </div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIconWrapper} style={{ color: "#8b5cf6" }}>
            <Gift size={20} />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statLabel}>Scratch Card Campaigns</span>
            <div className={styles.statValueRow}>
              <span className={styles.statValue}>{scratchCount} Offers</span>
              <span className={styles.statSub}>Flyers &amp; Delivery</span>
            </div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIconWrapper}>
            <Sparkles size={20} />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statLabel}>Top Performer</span>
            <div className={styles.statValueRow}>
              <span className={styles.statValue}>{topTable.name}</span>
              <span className={styles.statSub}>{topTable.scansToday || 0} scans</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Interactive Studio */}
      <div className={styles.studioLayout}>
        {/* Left: QR Picker & Type Filter */}
        <div className={styles.tableSelectorCard}>
          <div className={styles.tableSelectorHeader}>
            <div>
              <h3 className={styles.sectionHeading}>Select QR Code</h3>
              <p className={styles.sectionDesc}>
                Preview, download, or print standees and scratch flyers.
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setIsAddModalOpen(true)}>
              <Plus size={14} />
              <span>New QR</span>
            </Button>
          </div>

          {/* Filter Tabs */}
          <div className={styles.typeTabs}>
            <button
              type="button"
              className={`${styles.typeTab} ${activeTab === "ALL" ? styles.typeTabActive : ""}`}
              onClick={() => setActiveTab("ALL")}
            >
              All ({tables.length})
            </button>
            <button
              type="button"
              className={`${styles.typeTab} ${activeTab === "TABLE" ? styles.typeTabActive : ""}`}
              onClick={() => setActiveTab("TABLE")}
            >
              <Utensils size={13} />
              Tables ({tableCount})
            </button>
            <button
              type="button"
              className={`${styles.typeTab} ${activeTab === "OFFER_SCRATCH" ? styles.typeTabActive : ""}`}
              onClick={() => setActiveTab("OFFER_SCRATCH")}
            >
              <Gift size={13} />
              Scratch ({scratchCount})
            </button>
          </div>

          <div className={styles.tableList}>
            {isLoading ? (
              <div className={styles.loadingTables}>Loading QR collection...</div>
            ) : filteredTables.length === 0 ? (
              <div className={styles.emptyTables}>
                <QrCode size={36} />
                <p>No QR codes match this filter.</p>
                <Button variant="outline" size="sm" onClick={() => setIsAddModalOpen(true)}>
                  <Plus size={14} />
                  <span>Create First QR</span>
                </Button>
              </div>
            ) : (
              filteredTables.map((item) => {
                const isSelected = selectedTableId === item.id;
                const itemIsScratch = item.type === "OFFER_SCRATCH";

                return (
                  <div
                    key={item.id}
                    className={`${styles.tableItemWrapper} ${isSelected ? styles.tableItemActive : ""}`}
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedTableId(item.id)}
                      className={styles.tableItemButton}
                    >
                      <div className={styles.tableItemMain}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span className={styles.tableName}>{item.name}</span>
                          <span
                            className={`${styles.typeBadge} ${
                              itemIsScratch ? styles.typeBadgeScratch : styles.typeBadgeTable
                            }`}
                          >
                            {itemIsScratch ? "Scratch Deal" : "Table"}
                          </span>
                        </div>
                        <span className={styles.tableLocation}>
                          {itemIsScratch
                            ? `Code: ${item.offerCode || "DIRECT20"} • ${item.location}`
                            : item.location}
                        </span>
                      </div>
                      <div className={styles.tableItemStats}>
                        <span className={styles.tableScans}>{item.scansToday || 0} scans</span>
                        {isSelected && <span className={styles.activeDot} />}
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteTable(item.id)}
                      className={styles.deleteTableBtn}
                      title={`Delete ${item.name}`}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Printable Standee / Card Preview */}
        <div className={styles.standeePreviewCard} ref={printRef}>
          {currentTable ? (
            <>
              <div
                className={`${styles.standeeInner} ${
                  isScratch ? styles.scratchStandeeInner : ""
                }`}
              >
                <div className={styles.standeeHeader}>
                  <span
                    className={`${styles.brandTitle} ${
                      isScratch ? styles.scratchBrandTitle : ""
                    }`}
                  >
                    {isScratch ? "DineDirect Rewards" : "DineDirect"}
                  </span>
                  <span className={styles.brandTagline}>
                    {isScratch ? "Scan & Scratch To Win!" : "Contactless Table Ordering"}
                  </span>
                </div>

                <div className={styles.qrFrame}>
                  {qrDataUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={qrDataUrl}
                      alt={`QR for ${currentTable.name}`}
                      className={styles.qrImage}
                    />
                  ) : (
                    <div className={styles.qrSkeleton}>
                      <QrCode size={64} className={styles.pulse} />
                      <span>Generating Code...</span>
                    </div>
                  )}
                </div>

                <div className={styles.standeeFooter}>
                  {isScratch ? (
                    <div className={styles.scratchTableCallout}>
                      <div className={styles.scratchRewardBox}>
                        <span style={{ fontSize: "0.74rem", color: "#64748b", fontWeight: 700 }}>
                          EXCLUSIVE PATRON COUPON
                        </span>
                        <span className={styles.scratchRewardVal}>
                          ✨ {currentTable.discountReward || "Flat 20% OFF"}
                        </span>
                        <span className={styles.scratchPromoCode}>
                          CODE: {currentTable.offerCode || "DIRECT20"}
                        </span>
                      </div>
                      <span className={styles.scanInstruction}>
                        Scan with phone camera to reveal interactive scratch card!
                      </span>
                    </div>
                  ) : (
                    <div className={styles.tableCallout}>
                      <span className={styles.tableBadge}>
                        {currentTable.name} {currentTable.tableNumber ? `(#${currentTable.tableNumber})` : ""}
                      </span>
                      <span className={styles.scanInstruction}>
                        Scan with phone camera to order direct
                      </span>
                    </div>
                  )}

                  <div className={styles.quickFeatures}>
                    {isScratch ? (
                      <>
                        <span>🎁 Secret Scratch Card</span>
                        <span>•</span>
                        <span>🔥 Save on Direct Orders</span>
                      </>
                    ) : (
                      <>
                        <span>✨ Zero Wait Time</span>
                        <span>•</span>
                        <span>🔥 Fresh Kitchen Dispatch</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className={styles.actionToolbar}>
                <div className={styles.urlDisplay}>
                  <span className={styles.urlText}>{targetUrl}</span>
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
                  href={targetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.testLink}
                >
                  <span>{isScratch ? "Test Scratch Card Flow" : "Test Table Dine-In"}</span>
                  <ExternalLink size={14} />
                </a>
              </div>
            </>
          ) : (
            <div className={styles.noTableSelected}>
              <QrCode size={48} />
              <h4>No QR Selected</h4>
              <p>Add a table or promotional scratch card QR to generate customized, printable standees.</p>
              <Button size="sm" onClick={() => setIsAddModalOpen(true)}>
                <Plus size={14} />
                <span>Create QR Code</span>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Create QR Code (With Two Options) */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create QR Code</DialogTitle>
          </DialogHeader>

          {formError && <div className={styles.formError}>{formError}</div>}

          {/* Option Selector: Table vs Scratch Card */}
          <div className={styles.optionSelectorGrid}>
            <div
              className={`${styles.optionCard} ${
                selectedType === "TABLE" ? styles.optionCardActive : ""
              }`}
              onClick={() => setSelectedType("TABLE")}
              role="button"
              tabIndex={0}
            >
              <div className={styles.optionCardHeader}>
                <div className={styles.optionIconWrapper}>
                  <Utensils size={18} />
                </div>
                <span className={styles.optionTitle}>Table QR</span>
              </div>
              <p className={styles.optionDesc}>
                For dine-in tables, counters &amp; booths. Diners scan from their seats to view menu &amp; order.
              </p>
            </div>

            <div
              className={`${styles.optionCard} ${
                selectedType === "OFFER_SCRATCH" ? styles.optionCardActiveScratch : ""
              }`}
              onClick={() => setSelectedType("OFFER_SCRATCH")}
              role="button"
              tabIndex={0}
            >
              <div className={styles.optionCardHeader}>
                <div
                  className={`${styles.optionIconWrapper} ${styles.optionIconWrapperScratch}`}
                >
                  <Gift size={18} />
                </div>
                <span className={styles.optionTitle}>Scratch Card QR</span>
              </div>
              <p className={styles.optionDesc}>
                For delivery bags, bill folders &amp; social flyers. Diners scratch a card to unlock discounts.
              </p>
            </div>
          </div>

          <form onSubmit={handleCreateQR} className={styles.form}>
            {selectedType === "TABLE" ? (
              <>
                <div className={styles.formRow}>
                  <div className={styles.field}>
                    <label htmlFor="tab-name" className={styles.fieldLabel}>
                      Table Display Name *
                    </label>
                    <Input
                      id="tab-name"
                      placeholder="e.g. Table 6 or Patio Booth 2"
                      value={newTableName}
                      onChange={(e) => setNewTableName(e.target.value)}
                      required
                    />
                  </div>

                  <div className={styles.field}>
                    <label htmlFor="tab-num" className={styles.fieldLabel}>
                      Table / Spot Number *
                    </label>
                    <Input
                      id="tab-num"
                      placeholder="e.g. 6"
                      value={newTableNumber}
                      onChange={(e) => setNewTableNumber(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className={styles.field}>
                  <label htmlFor="tab-loc" className={styles.fieldLabel}>
                    Dining Section / Location
                  </label>
                  <Input
                    id="tab-loc"
                    placeholder="e.g. Terrace Garden, Poolside, VIP Lounge"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                  />
                </div>
              </>
            ) : (
              <>
                <div className={styles.field}>
                  <label htmlFor="scratch-name" className={styles.fieldLabel}>
                    Campaign / Flyer Title *
                  </label>
                  <Input
                    id="scratch-name"
                    placeholder="e.g. Delivery Box Scratch & Win or Weekend Flyer"
                    value={newTableName}
                    onChange={(e) => setNewTableName(e.target.value)}
                    required
                  />
                </div>

                <div className={styles.formRow}>
                  <div className={styles.field}>
                    <label htmlFor="scratch-code" className={styles.fieldLabel}>
                      Promo Coupon Code *
                    </label>
                    <Input
                      id="scratch-code"
                      placeholder="e.g. DIRECT20 or FESTIVE50"
                      value={newOfferCode}
                      onChange={(e) => setNewOfferCode(e.target.value.toUpperCase())}
                      required
                    />
                  </div>

                  <div className={styles.field}>
                    <label htmlFor="scratch-reward" className={styles.fieldLabel}>
                      Secret Reward Headline *
                    </label>
                    <Input
                      id="scratch-reward"
                      placeholder="e.g. Flat 20% OFF or Flat ₹50 OFF"
                      value={newDiscountReward}
                      onChange={(e) => setNewDiscountReward(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className={styles.field}>
                  <label htmlFor="scratch-loc" className={styles.fieldLabel}>
                    Flyer Placement / Purpose
                  </label>
                  <Input
                    id="scratch-loc"
                    placeholder="e.g. Delivery Box Insert, Billing Folder, Takeout Bags"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                  />
                </div>
              </>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="default">
                {selectedType === "TABLE" ? "Create Table QR" : "Create Scratch Card QR"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
