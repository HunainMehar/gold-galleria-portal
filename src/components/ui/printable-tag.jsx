// src/components/ui/printable-tag.jsx
"use client";

import React from "react";

export default function PrintableTag({ item }) {
  const formatWeight = (weight) => {
    return parseFloat(weight || 0).toFixed(3);
  };

  return (
    <div className="printable-tag-container">
      <style jsx global>{`
        @media print {
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            margin: 0;
            padding: 0;
          }

          body * {
            visibility: hidden;
          }

          .printable-tag-container,
          .printable-tag-container * {
            visibility: visible;
          }

          .printable-tag-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100vw;
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: white;
          }
        }

        .jewelry-tag {
          width: 25mm;
          height: 50mm;
          background: white;
          color: black;
          font-family: Arial, sans-serif;
          border: 1px solid #000;
          padding: 1mm;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          box-sizing: border-box;
        }

        .tag-line {
          font-size: 6px;
          line-height: 1.1;
          margin-bottom: 0.3mm;
          text-align: left;
          white-space: nowrap;
        }

        .tag-number {
          font-size: 7px;
          font-weight: bold;
          margin-bottom: 0.5mm;
          text-align: left;
        }

        .tag-detail {
          display: flex;
          justify-content: space-between;
          font-size: 6px;
          line-height: 1.1;
          margin-bottom: 0.2mm;
        }

        .tag-label {
          font-weight: normal;
        }

        .tag-value {
          font-weight: normal;
        }
      `}</style>

      <div className="jewelry-tag">
        <div className="tag-number">{item.tag_number}</div>

        <div className="tag-detail">
          <span className="tag-label">Nw</span>
          <span className="tag-value">{formatWeight(item.net_weight)}</span>
        </div>

        <div className="tag-detail">
          <span className="tag-label">Pw</span>
          <span className="tag-value">{formatWeight(item.polish_weight)}</span>
        </div>

        <div className="tag-detail">
          <span className="tag-label">Tw</span>
          <span className="tag-value">{formatWeight(item.total_weight)}</span>
        </div>

        <div className="tag-detail">
          <span className="tag-label">Sw</span>
          <span className="tag-value">{formatWeight(item.stone_weight)}</span>
        </div>

        <div className="tag-detail">
          <span className="tag-label">Qty</span>
          <span className="tag-value">
            {item.no_of_pieces || item.quantity || 1}
          </span>
        </div>

        <div className="tag-detail">
          <span className="tag-label">Kt</span>
          <span className="tag-value">{item.karat}</span>
        </div>
      </div>
    </div>
  );
}
