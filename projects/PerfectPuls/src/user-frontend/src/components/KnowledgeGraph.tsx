"use client";

import { useState, useEffect, useRef } from "react";
import { UploadedFile } from "./DocumentsUpload";

interface Props {
  files: UploadedFile[];
}

export default function KnowledgeGraph({ files }: Props) {
  const [html, setHtml] = useState<string>("");
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    console.log('🔄 Fetching graph data...');
    fetch("/api/visualize")
      .then(res => {
        console.log('📊 API response status:', res.status);
        return res.text();
      })
      .then(htmlContent => {
        console.log("✅ Received HTML content:", htmlContent.length, "bytes");
        
        // Remove the problematic lib/bindings/utils.js reference
        const cleanHtml = htmlContent.replace(
          '<script src="lib/bindings/utils.js"></script>',
          ''
        );
        console.log("🧹 Cleaned HTML, updating iframe...");
        
        // Write to iframe
        if (iframeRef.current) {
          const iframe = iframeRef.current;
          const doc = iframe.contentDocument || iframe.contentWindow?.document;
          if (doc) {
            doc.open();
            doc.write(cleanHtml);
            doc.close();
            console.log("✅ HTML written to iframe");
          }
        }
      })
      .catch(error => {
        console.error("❌ Error fetching graph:", error);
      });
  }, [files]);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-800">Knowledge Graph</h2>
      <div className="w-full h-[600px] bg-white rounded-lg shadow border">
        <iframe
          ref={iframeRef}
          className="w-full h-full rounded-lg"
          title="Knowledge Graph Visualization"
          sandbox="allow-scripts allow-same-origin"
        />
      </div>
    </div>
  );
}