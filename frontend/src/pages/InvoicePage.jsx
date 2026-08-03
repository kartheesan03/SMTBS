import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/axios";
import { ArrowLeft, Printer, Download } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import "./InvoicePage.css";
import PageHeader from "../components/PageHeader";
const formatDateOnly = (dateValue) => {
  if (!dateValue) return "-";
  const date = new Date(dateValue);
  if (isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};
const InvoicePage = () => {
  const { invoiceId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    fetchInvoiceData();
  }, [invoiceId]);
  const fetchInvoiceData = async () => {
    try {
      setLoading(true);
      const { data } = await API.get("/orders");
      const foundOrder = data.find(
        (o) => o.id?.toString() === invoiceId || o._id?.toString() === invoiceId
      );
      if (foundOrder) {
        setOrder(foundOrder);
      } else {
        setError("Invoice/Order not found");
      }
    } catch (err) {
      console.error("Error fetching invoice:", err);
      setError("Failed to load invoice data.");
    } finally {
      setLoading(false);
    }
  };
  if (loading) {
    return (
      <div className="flex-center" style={{ height: "100vh" }}>
        <div className="loader"></div>
      </div>
    );
  }
  if (error || !order) {
    return (
      <div
        className="flex-center"
        style={{ height: "100vh", flexDirection: "column" }}
      >
        <div style={{ width: "100%", maxWidth: "600px", padding: "24px" }}>
          <PageHeader title={error || "Invoice not found"} showBack={true} />
        </div>
      </div>
    );
  }
  const customerName =
    order.customer?.company ||
    order.customer?.name ||
    order.vendor?.company ||
    order.vendor?.name ||
    "Valued Customer";
  const customerEmail =
    order.customer?.email || order.vendor?.email || "No email provided";
  const subtotal = order.totalAmount || order.grandTotal || 0;
  const tax = 0;
  const grandTotal = subtotal + tax;
  const handleDownloadPDF = async () => {
    const invoiceElement = document.querySelector(".invoice-paper");
    if (!invoiceElement) return;
    try {
      const canvas = await html2canvas(invoiceElement, {
        scale: 2,
        useCORS: true,
        logging: false,
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Invoice_${order.orderNumber || order.id || "Draft"}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };
  return (
    <div className="invoice-page-wrapper">
      {/* Top Action Bar - Hidden on print */}
      <div
        className="invoice-action-bar"
        style={{ display: "block", padding: "0 24px" }}
      >
        <PageHeader
          title="Invoice"
          showBack={true}
          actions={[
            {
              label: "Print Invoice",
              icon: Printer,
              onClick: () => window.print(),
            },
            {
              label: "Download PDF",
              icon: Download,
              onClick: handleDownloadPDF,
              primary: true,
            },
          ]}
        />
      </div>
      {/* A4 Paper Container */}
      <div className="invoice-paper">
        {/* Header */}
        <div className="invoice-header">
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: "42px",
                fontWeight: 800,
                letterSpacing: "-0.5px",
              }}
            >
              INVOICE
            </h1>
            <div
              style={{
                marginTop: "12px",
                display: "inline-block",
                background: "rgba(255,255,255,0.2)",
                padding: "6px 16px",
                borderRadius: "20px",
                fontSize: "14px",
                fontWeight: 600,
                letterSpacing: "0.5px",
              }}
            >
              ORDER #{order.orderNumber || order.id}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                gap: "12px",
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  background: "#fbbf24",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#1e1b4b",
                  fontWeight: 800,
                  fontSize: "22px",
                }}
              >
                S
              </div>
              <h3 style={{ margin: 0, fontSize: "26px", fontWeight: 700 }}>
                SMTBMS Inc.
              </h3>
            </div>
            <p
              style={{
                margin: "12px 0 0",
                fontSize: "15px",
                color: "#e0e7ff",
                lineHeight: "1.5",
              }}
            >
              123 ERP Street, Tech City
              <br />
              contact@smtbms.inc
              <br />
              +1 (555) 123-4567
            </p>
          </div>
        </div>
        {/* Body */}
        <div className="invoice-body">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "50px",
            }}
          >
            <div>
              <h4
                style={{
                  margin: "0 0 12px 0",
                  fontSize: "13px",
                  textTransform: "uppercase",
                  color: "#94a3b8",
                  letterSpacing: "1px",
                  fontWeight: 700,
                }}
              >
                Billed To
              </h4>
              <p
                style={{
                  margin: 0,
                  fontSize: "20px",
                  fontWeight: 700,
                  color: "#1e293b",
                }}
              >
                {customerName}
              </p>
              <p
                style={{
                  margin: "8px 0 0",
                  fontSize: "15px",
                  color: "#64748b",
                }}
              >
                {customerEmail}
              </p>
            </div>
            <div style={{ textAlign: "right" }}>
              <h4
                style={{
                  margin: "0 0 12px 0",
                  fontSize: "13px",
                  textTransform: "uppercase",
                  color: "#94a3b8",
                  letterSpacing: "1px",
                  fontWeight: 700,
                }}
              >
                Invoice Details
              </h4>
              <p
                style={{
                  margin: 0,
                  fontSize: "15px",
                  color: "#475569",
                  marginBottom: "6px",
                }}
              >
                <strong>Date:</strong> {formatDateOnly(new Date())}
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: "15px",
                  color: "#475569",
                  marginBottom: "6px",
                }}
              >
                <strong>Payment:</strong>{" "}
                {order.paymentMethod || "Bank Transfer"}
              </p>
              <p style={{ margin: 0, fontSize: "15px", color: "#475569" }}>
                <strong>Status:</strong>{" "}
                <span
                  style={{
                    color:
                      order.status === "Completed" ||
                      order.status === "Workflow Completed"
                        ? "#10b981"
                        : "#f59e0b",
                    fontWeight: 600,
                  }}
                >
                  {order.status === "Completed" ||
                  order.status === "Workflow Completed"
                    ? "Paid"
                    : "Pending"}
                </span>
              </p>
            </div>
          </div>
          {/* Table */}
          <table className="invoice-table">
            <thead>
              <tr>
                <th>Item Description</th>
                <th style={{ textAlign: "center" }}>Qty</th>
                <th style={{ textAlign: "right" }}>Price</th>
                <th style={{ textAlign: "right" }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {(order.items || []).map((item, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 600 }}>
                    {item.name || item.material?.name || "Unknown Item"}
                    <div
                      style={{
                        fontSize: "13px",
                        color: "#94a3b8",
                        marginTop: "6px",
                        fontWeight: 400,
                      }}
                    >
                      SKU: {item.sku || item.material?.sku || "N/A"}
                    </div>
                  </td>
                  <td style={{ textAlign: "center", color: "#64748b" }}>
                    {item.quantity}
                  </td>
                  <td style={{ textAlign: "right", color: "#64748b" }}>
                    ₹
                    {(item.price || 0).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                  <td style={{ textAlign: "right", fontWeight: 700 }}>
                    ₹
                    {((item.quantity || 0) * (item.price || 0)).toLocaleString(
                      undefined,
                      { minimumFractionDigits: 2 }
                    )}
                  </td>
                </tr>
              ))}
              {(!order.items || order.items.length === 0) && (
                <tr>
                  <td
                    colSpan="4"
                    style={{
                      textAlign: "center",
                      color: "#94a3b8",
                      fontStyle: "italic",
                      padding: "40px",
                    }}
                  >
                    No items found for this invoice.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {/* Totals */}
          <div className="invoice-totals">
            <div className="invoice-totals-box">
              <div className="invoice-totals-row">
                <span>Subtotal</span>
                <span>
                  ₹
                  {subtotal.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className="invoice-totals-row">
                <span>Discount</span>
                <span>₹0.00</span>
              </div>
              <div className="invoice-totals-row">
                <span>Tax (0%)</span>
                <span>
                  ₹{tax.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="invoice-grand-total">
                <span>Grand Total</span>
                <span>
                  ₹
                  {grandTotal.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>
          </div>
          {/* Authorized Signature */}
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <div className="auth-signature">Authorized Signature</div>
          </div>
        </div>
        {/* Footer */}
        <div className="invoice-footer">
          <div>
            <strong style={{ color: "#1e293b" }}>Terms & Conditions</strong>
            <br />
            <span style={{ display: "inline-block", marginTop: "6px" }}>
              Payment is due within 15 days. Please make checks payable to
              SMTBMS Inc.
            </span>
          </div>
          <div style={{ textAlign: "right" }}>
            <strong>Thank you for your business!</strong>
          </div>
        </div>
      </div>
    </div>
  );
};
export default InvoicePage;
